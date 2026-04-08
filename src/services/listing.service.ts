import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";
import { LISTING_ERRORS } from "../constants/listing.constant";
import ListingRepository from "../repositories/listing.repository";
import { CreateListingDTO, ListingQueryDTO, UpdateListingDTO, VehicleDetailsDTO } from "../types/listing.types";
import { INTEGERS } from "../constants/app.constant";
import userPortfolioService from "../repositories/userPortfolio.repository";
import UserPortfolioService from "./userPortfolio.service";
import { getFilesByIds, getFilesByListingId } from "../api/user.api";

class ListingService {
    private listingRepository: ListingRepository;
    private userPortfolioService: UserPortfolioService;

    constructor() {
        this.listingRepository = new ListingRepository();
        this.userPortfolioService = new UserPortfolioService();
    }

    /**
     * Helper to fetch signed URLs and replace file IDs in listings
     */
    private populateSignedUrls = async (listings: any[]) => {
        const fileIds: string[] = [];

        // Collect all file IDs
        for (const listing of listings) {
            if (listing.images) {
                for (const img of listing.images) {
                    if (img.limg_url) {
                        fileIds.push(img.limg_url);
                    }
                }
            }
            if (listing.seller?.user_profile_image_file_id) {
                fileIds.push(listing.seller.user_profile_image_file_id);
            }
        }

        if (fileIds.length === 0) return;

        try {
            const files = await getFilesByIds(fileIds);
            const fileMap = new Map<string, string>();

            if (files && Array.isArray(files)) {
                for (const file of files) {
                    if (file.file_id && file.file_signed_url) {
                        fileMap.set(file.file_id, file.file_signed_url);
                    }
                }
            }

            // Replace file IDs with signed URLs
            for (const listing of listings) {
                if (listing.images) {
                    for (const img of listing.images) {
                        if (img.limg_url && fileMap.has(img.limg_url)) {
                            img.limg_url = fileMap.get(img.limg_url);
                        }
                    }
                }
                if (listing.seller?.user_profile_image_file_id) {
                    const signedUrl = fileMap.get(listing.seller.user_profile_image_file_id);
                    if (signedUrl) {
                        listing.seller.user_profile_image_file_id = signedUrl;
                    }
                }
            }
        } catch {
            // Silently fail - images are non-critical
        }
    };

    /**
     * Helper to fetch listing images by listing_id from file-service
     */
    private populateListingImages = async (listings: any[]) => {
        if (!listings || listings.length === 0) return;
        
        await Promise.all(
            listings.map(async (listing: any) => {
                try {
                    const listingId = listing.lst_id;
                    if (!listingId) {
                        listing.user_portfolio = [];
                        return;
                    }
                    
                    const files = await getFilesByListingId(listingId);
                    
                    listing.user_portfolio = Array.isArray(files)
                        ? files.map((file: any) => ({
                            file_id: file.file_id,
                            file_signed_url: file.file_signed_url
                        }))
                        : [];
                } catch {
                    listing.user_portfolio = [];
                }
            })
        );
    };

    getAll = async (query: ListingQueryDTO) => {
        const result: any = await this.listingRepository.findAll(query);

        // Handle both response structures: { data: [...] } or { listings: [...] }
        const listings = result.data || result.listings || [];

        if (!Array.isArray(listings) || listings.length === 0) {
            return result;
        }

        // Populate signed URLs for listing images (from listing_images table) and seller profile
        await this.populateSignedUrls(listings);

        // Fetch listing images from file-service using listing_id
        await this.populateListingImages(listings);

        // Return with the correct property name
        if (result.data) {
            return {
                ...result,
                data: listings
            };
        }
        return {
            ...result,
            listings
        };
    };

    getById = async (lst_id: string) => {
        const listing = await this.listingRepository.findById(lst_id);
        if (!listing)
            throw new ApiError(StatusCodes.NOT_FOUND, LISTING_ERRORS.LISTING_NOT_FOUND);

        await this.populateSignedUrls([listing]);

        // Fetch listing images from file-service using listing_id
        let userPortfolio: any[] = [];
        try {
            const files = await getFilesByListingId(lst_id);
            if (Array.isArray(files)) {
                userPortfolio = files.map((file: any) => ({
                    file_id: file.file_id,
                    file_signed_url: file.file_signed_url
                }));
            }
        } catch {
            // No listing images found - this is expected for new listings
        }

        // Increment view count (fire-and-forget)
        this.listingRepository.incrementViewCount(lst_id).catch(() => { });

        return {
            ...listing,
            user_portfolio: userPortfolio
        };
    };

    create = async (seller_id: string, dto: CreateListingDTO) => {
        const data: any = {
            lst_seller_id: seller_id,
            lst_category_id: dto.lst_category_id,
            lst_title: dto.lst_title,
            lst_description: dto.lst_description,
            lst_type: dto.lst_type,
            lst_price: dto.lst_price,
            lst_status: "ACTIVE",
        };
        
        await this.userPortfolioService.createPortfolio(seller_id, dto.user_portfolio);
  
        if (dto.lst_type === "AUCTION") {
            if (!dto.lst_auction_end)
                throw new ApiError(StatusCodes.BAD_REQUEST, "Auction end date is required for auction listings");
            data.lst_auction_end = new Date(dto.lst_auction_end);
            data.lst_min_increment = dto.lst_min_increment ?? 1;
            data.lst_current_bid = dto.lst_price;
        }

        const listing = await this.listingRepository.create(data);

        // Create vehicle details if provided
        if (dto.vehicle_details) {
            await this.listingRepository.createVehicleDetails(listing.lst_id, {
                fuel_type: dto.vehicle_details.fuel_type,
                transmission: dto.vehicle_details.transmission,
                body_type: dto.vehicle_details.body_type,
                ownership: dto.vehicle_details.ownership,
                year: dto.vehicle_details.year,
                kilometers: dto.vehicle_details.kilometers,
            });
        }

        return listing;
    };

    update = async (lst_id: string, seller_id: string, dto: UpdateListingDTO) => {
        const listing = await this.listingRepository.findByIdRaw(lst_id);
        if (!listing)
            throw new ApiError(StatusCodes.NOT_FOUND, LISTING_ERRORS.LISTING_NOT_FOUND);
        if (listing.lst_seller_id !== seller_id)
            throw new ApiError(StatusCodes.FORBIDDEN, "You are not the owner of this listing");

        const data: any = {};
        if (dto.lst_title !== undefined) data.lst_title = dto.lst_title;
        if (dto.lst_description !== undefined) data.lst_description = dto.lst_description;
        if (dto.lst_price !== undefined) data.lst_price = dto.lst_price;
        if (dto.lst_status !== undefined) data.lst_status = dto.lst_status;
        if (dto.lst_category_id !== undefined) data.lst_category_id = dto.lst_category_id;
        if (dto.lst_type !== undefined) data.lst_type = dto.lst_type;
        if (dto.lst_auction_end !== undefined) data.lst_auction_end = new Date(dto.lst_auction_end);
        if (dto.lst_min_increment !== undefined) data.lst_min_increment = dto.lst_min_increment;
        
        // Clear auction fields when switching to BUY_NOW
        if (dto.lst_type === "BUY_NOW") {
            data.lst_auction_end = null;
            data.lst_current_bid = null;
        }
        
        // Set auction fields when switching to AUCTION
        if (dto.lst_type === "AUCTION") {
            if (!dto.lst_auction_end)
                throw new ApiError(StatusCodes.BAD_REQUEST, "Auction end date is required for auction listings");
            data.lst_current_bid = listing.lst_price;
            data.lst_min_increment = dto.lst_min_increment ?? listing.lst_min_increment ?? 1;
        }

        const updatedListing = await this.listingRepository.update(lst_id, data);

        // Update vehicle details if provided
        if (dto.vehicle_details) {
            await this.listingRepository.updateVehicleDetails(lst_id, {
                fuel_type: dto.vehicle_details.fuel_type,
                transmission: dto.vehicle_details.transmission,
                body_type: dto.vehicle_details.body_type,
                ownership: dto.vehicle_details.ownership,
                year: dto.vehicle_details.year,
                kilometers: dto.vehicle_details.kilometers,
            });
        }

        return updatedListing;
    };

    delete = async (lst_id: string, seller_id: string) => {
        const listing = await this.listingRepository.findByIdRaw(lst_id);
        if (!listing)
            throw new ApiError(StatusCodes.NOT_FOUND, LISTING_ERRORS.LISTING_NOT_FOUND);
        if (listing.lst_seller_id !== seller_id)
            throw new ApiError(StatusCodes.FORBIDDEN, "You are not the owner of this listing");

        return this.listingRepository.delete(lst_id);
    };

    getMyListings = async (seller_id: string, page: number, take: number) => {
        const result = await this.listingRepository.findBySellerId(seller_id, page, take);
        await this.populateSignedUrls(result.listings as any[]);
        return result;
    };

    adminUpdateListing = async (lst_id: string, data: any) => {
        const listing = await this.listingRepository.findByIdRaw(lst_id);
        if (!listing)
            throw new ApiError(StatusCodes.NOT_FOUND, LISTING_ERRORS.LISTING_NOT_FOUND);
        return this.listingRepository.update(lst_id, data);
    };
    getListingByCategoryId = async (cat_id: string, page: number, take: number) => {
        const result = await this.listingRepository.getListingByCategoryId(cat_id, page, take);
        await this.populateSignedUrls(result.listings as any[]);
        return result;
    };

    /**
     * Closes an auction (admin only).
     * Restores votes to all bidders who had active engagements on this listing.
     */
    closeAuction = async (lst_id: string, new_status: "SOLD" | "EXPIRED") => {
        return this.listingRepository.closeAuction(lst_id, new_status);
    };

    /**
     * Get all auctions with pagination (Admin)
     */
    getAllAuctions = async (query: {
        page?: string;
        page_size?: string;
        search?: string;
        status?: string;
        category?: string;
    }) => {
        const result = await this.listingRepository.findAllAuctions(query);
        
        // Ensure auctions array exists
        const auctions = result.auctions || [];
        
        if (auctions.length > 0) {
            await this.populateSignedUrls(auctions as any[]);
            await this.populateListingImages(auctions as any[]);
        }
        
        return result;
    };

    /**
     * Get auction details with all participants/bidders (Admin)
     */
    getAuctionWithParticipants = async (lst_id: string) => {
        const auction = await this.listingRepository.findAuctionWithParticipants(lst_id);
        if (!auction)
            throw new ApiError(StatusCodes.NOT_FOUND, LISTING_ERRORS.LISTING_NOT_FOUND);
        if (auction.lst_type !== "AUCTION")
            throw new ApiError(StatusCodes.BAD_REQUEST, LISTING_ERRORS.LISTING_NOT_AUCTION);

        await this.populateSignedUrls([auction as any]);

        // Fetch listing images from file-service
        let userPortfolio: any[] = [];
        try {
            const files = await getFilesByListingId(lst_id);
            if (Array.isArray(files)) {
                userPortfolio = files.map((file: any) => ({
                    file_id: file.file_id,
                    file_signed_url: file.file_signed_url
                }));
            }
        } catch {
            // No listing images found
        }

        // Get unique participants from engagements with their highest bid
        const participants = auction.engagements.map((eng: any) => {
            const userBids = auction.bids.filter((b: any) => b.bidder.user_id === eng.user.user_id);
            const highestBid = userBids.length > 0 ? Math.max(...userBids.map((b: any) => Number(b.bid_amount))) : 0;
            const bidCount = userBids.length;

            return {
                user: eng.user,
                engagement_status: eng.eng_status,
                joined_at: eng.eng_created_at,
                highest_bid: highestBid,
                total_bids: bidCount,
            };
        });

        // Sort participants by highest bid (descending)
        participants.sort((a: any, b: any) => b.highest_bid - a.highest_bid);

        return {
            ...auction,
            user_portfolio: userPortfolio,
            participants,
            total_participants: auction.engagements.length,
            total_bids: auction.bids.length,
        };
    };

    /**
     * Get all BUY_NOW listings with pagination (Admin)
     */
    getAllBuyNow = async (query: {
        page?: string;
        page_size?: string;
        search?: string;
        status?: string;
        category?: string;
    }) => {
        const result = await this.listingRepository.findAllBuyNow(query);
        const listings = result.buy_now_listings || [];

        if (listings.length > 0) {
            await this.populateSignedUrls(listings as any[]);
            await this.populateListingImages(listings as any[]);
        }

        return result;
    };

    /**
     * Get BUY_NOW listing details by ID (Admin)
     */
    getBuyNowById = async (lst_id: string) => {
        const listing = await this.listingRepository.findBuyNowById(lst_id);
        if (!listing)
            throw new ApiError(StatusCodes.NOT_FOUND, LISTING_ERRORS.LISTING_NOT_FOUND);
        if (listing.lst_type !== "BUY_NOW")
            throw new ApiError(StatusCodes.BAD_REQUEST, LISTING_ERRORS.LISTING_NOT_BUY_NOW);

        await this.populateSignedUrls([listing as any]);

        let userPortfolio: any[] = [];
        try {
            const files = await getFilesByListingId(lst_id);
            if (Array.isArray(files)) {
                userPortfolio = files.map((file: any) => ({
                    file_id: file.file_id,
                    file_signed_url: file.file_signed_url
                }));
            }
        } catch {
            // No listing images found
        }

        return {
            ...listing,
            user_portfolio: userPortfolio,
        };
    };
}

export default ListingService;
