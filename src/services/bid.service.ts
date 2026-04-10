import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";
import { BID_ERRORS } from "../constants/bid.constant";
import { LISTING_ERRORS } from "../constants/listing.constant";
import BidRepository from "../repositories/bid.repository";
import ListingRepository from "../repositories/listing.repository";
import prisma from "../configs/prisma.config";
import { notifyBidOutbid } from "../api/notification.api";

class BidService {
    private bidRepository: BidRepository;
    private listingRepository: ListingRepository;

    constructor() {
        this.bidRepository = new BidRepository();
        this.listingRepository = new ListingRepository();
    }

    placeBid = async (listing_id: string, bidder_id: string, bid_amount: number) => {
        // Note: Subscription validation moved inside repository transaction
        // This allows users with existing engagements to bid even if votes are exhausted
        try {
            // Find the previous highest bidder before placing the new bid
            const previousHighestBid = await prisma.bids.findFirst({
                where: { bid_listing_id: listing_id },
                orderBy: { bid_amount: "desc" },
                select: { bid_bidder_id: true, bidder: { select: { user_full_name: true } } },
            });

            const bid = await this.bidRepository.placeBid(listing_id, bidder_id, bid_amount);

            // Fire-and-forget: Notify the previous highest bidder they've been outbid
            if (previousHighestBid && previousHighestBid.bid_bidder_id !== bidder_id) {
                const listing = await prisma.listings.findUnique({
                    where: { lst_id: listing_id },
                    select: { lst_title: true },
                });
                const bidderInfo = await prisma.users.findUnique({
                    where: { user_id: bidder_id },
                    select: { user_full_name: true },
                });
                notifyBidOutbid(
                    listing_id,
                    listing?.lst_title || "Unknown Listing",
                    previousHighestBid.bid_bidder_id,
                    bid_amount,
                    bidderInfo?.user_full_name || "Someone"
                ).catch(() => {});
            }

            return bid;
        } catch (err: any) {
            const msg = err?.message || "";
            if (msg === "LISTING_NOT_FOUND")
                throw new ApiError(StatusCodes.NOT_FOUND, LISTING_ERRORS.LISTING_NOT_FOUND);
            if (msg === "LISTING_NOT_ACTIVE")
                throw new ApiError(StatusCodes.BAD_REQUEST, LISTING_ERRORS.LISTING_NOT_ACTIVE);
            if (msg === "LISTING_NOT_AUCTION")
                throw new ApiError(StatusCodes.BAD_REQUEST, LISTING_ERRORS.LISTING_NOT_AUCTION);
            if (msg === "AUCTION_ENDED")
                throw new ApiError(StatusCodes.BAD_REQUEST, LISTING_ERRORS.AUCTION_ENDED);
            if (msg === "CANNOT_BID_OWN_LISTING")
                throw new ApiError(StatusCodes.BAD_REQUEST, BID_ERRORS.CANNOT_BID_OWN_LISTING);
            if (msg === "BID_TOO_LOW")
                throw new ApiError(StatusCodes.BAD_REQUEST, BID_ERRORS.BID_TOO_LOW);
            throw err;
        }
    };

    getBidsByListing = async (listing_id: string, page: number, take: number) => {
        const listing = await this.listingRepository.findByIdRaw(listing_id);
        if (!listing)
            throw new ApiError(StatusCodes.NOT_FOUND, LISTING_ERRORS.LISTING_NOT_FOUND);

        return this.bidRepository.findByListingId(listing_id, page, take);
    };

    getMyBids = async (user_id: string, page: number, take: number) => {
        return this.bidRepository.findByUserId(user_id, page, take);
    };
    getAllLiveBids = async (page: number, take: number) => {
        return this.bidRepository.getAllLiveBids(page, take);
    };
}

export default BidService;
