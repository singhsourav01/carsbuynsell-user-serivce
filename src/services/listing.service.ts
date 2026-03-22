import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";
import { LISTING_ERRORS } from "../constants/listing.constant";
import ListingRepository from "../repositories/listing.repository";
import { CreateListingDTO, ListingQueryDTO, UpdateListingDTO } from "../types/listing.types";
import { INTEGERS } from "../constants/app.constant";
import userPortfolioService from "../repositories/userPortfolio.repository";
import UserPortfolioService from "./userPortfolio.service";
import { getFilesByIds } from "../api/user.api";

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
                    listing.seller.user_profile_image_file_id = signedUrl ?? null;
                }
            }
        } catch (error) {
            console.error("Failed to fetch signed URLs:", error);
        }
    };

    getAll = async (query: ListingQueryDTO) => {
        const result = await this.listingRepository.findAll(query);
        await this.populateSignedUrls(result.listings as any[]);
        return result;
    };

    getById = async (lst_id: string) => {
        const listing = await this.listingRepository.findById(lst_id);
        if (!listing)
            throw new ApiError(StatusCodes.NOT_FOUND, LISTING_ERRORS.LISTING_NOT_FOUND);

        await this.populateSignedUrls([listing]);

        // Increment view count (fire-and-forget)
        this.listingRepository.incrementViewCount(lst_id).catch(() => { });

        return listing;
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

        return this.listingRepository.create(data);
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
        if (dto.lst_auction_end !== undefined) data.lst_auction_end = new Date(dto.lst_auction_end);
        if (dto.lst_min_increment !== undefined) data.lst_min_increment = dto.lst_min_increment;

        return this.listingRepository.update(lst_id, data);
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
}

export default ListingService;
