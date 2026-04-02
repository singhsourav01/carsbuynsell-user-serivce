import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";
import { BID_ERRORS } from "../constants/bid.constant";
import { LISTING_ERRORS } from "../constants/listing.constant";
import BidRepository from "../repositories/bid.repository";
import ListingRepository from "../repositories/listing.repository";

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
            return await this.bidRepository.placeBid(listing_id, bidder_id, bid_amount);
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
