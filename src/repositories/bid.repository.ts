import { ApiError } from "common-microservices-utils";
import prisma from "../configs/prisma.config";
import { bidSelect } from "../constants/bid.constant";
import { SUBSCRIPTION_ERRORS } from "../constants/subscription.constant";
import { queryHandler } from "../utils/helper";
import { StatusCodes } from "http-status-codes";

class BidRepository {
    findByListingId = async (listing_id: string, page: number, take: number) => {
        const skip = (page - 1) * take;
        const [bids, count] = await queryHandler(() =>
            prisma.$transaction([
                prisma.bids.findMany({
                    where: { bid_listing_id: listing_id },
                    select: bidSelect,
                    take,
                    skip,
                    orderBy: { bid_amount: "desc" },
                }),
                prisma.bids.count({ where: { bid_listing_id: listing_id } }),
            ])
        );
        return { bids, count, page, take };
    };

    findByUserId = async (user_id: string, page: number, take: number) => {
        const skip = (page - 1) * take;
        const [bids, count] = await queryHandler(() =>
            prisma.$transaction([
                prisma.bids.findMany({
                    where: { bid_bidder_id: user_id },
                    select: bidSelect,
                    take,
                    skip,
                    orderBy: { bid_created_at: "desc" },
                }),
                prisma.bids.count({ where: { bid_bidder_id: user_id } }),
            ])
        );
        return { bids, count, page, take };
    };

    /**
     * Places a bid using a Prisma transaction to prevent race conditions.
     * Creates an engagement if this is the user's first bid on this listing.
     * Multiple bids on the same listing don't consume additional votes.
     */
    placeBid = async (
        listing_id: string,
        bidder_id: string,
        bid_amount: number
    ) => {
        return queryHandler(async () => {
            return await prisma.$transaction(async (tx) => {
                // Lock listing row for update
                const listing = await tx.listings.findUnique({
                    where: { lst_id: listing_id },
                });

                if (!listing) throw new ApiError(StatusCodes.NOT_FOUND, "LISTING NOT FOUND");
                if (listing.lst_status !== "ACTIVE") throw new ApiError(StatusCodes.BAD_REQUEST, "LISTING NOT ACTIVE");
                if (listing.lst_type !== "AUCTION") throw new ApiError(StatusCodes.BAD_REQUEST, "LISTING NOT AUCTION");
                if (listing.lst_auction_end && listing.lst_auction_end < new Date()) {
                    throw new ApiError(StatusCodes.BAD_REQUEST, "AUCTION ENDED");
                }
                if (listing.lst_seller_id === bidder_id) {
                    throw new ApiError(StatusCodes.BAD_REQUEST, "CANNOT BID OWN LISTING");
                }

                const currentBid = Number(listing.lst_current_bid ?? listing.lst_price);
                const minIncrement = Number(listing.lst_min_increment ?? 0);
                const minimumBid = currentBid + minIncrement;

                if (bid_amount <= currentBid || bid_amount < minimumBid) {
                    throw new ApiError(StatusCodes.BAD_REQUEST, "BID TOO LOW");
                }

                // Check if user already has an engagement for this listing
                const existingEngagement = await tx.engagements.findUnique({
                    where: {
                        eng_user_id_eng_listing_id: {
                            eng_user_id: bidder_id,
                            eng_listing_id: listing_id,
                        },
                    },
                });

                // If no existing engagement, we need to create one (uses a vote)
                if (!existingEngagement) {
                    // Check subscription has available engagement slots
                    const subscription = await tx.subscriptions.findFirst({
                        where: {
                            sub_user_id: bidder_id,
                            sub_status: "ACTIVE",
                            sub_expires_at: { gt: new Date() },
                        },
                    });

                    if (!subscription) {
                        throw new ApiError(StatusCodes.BAD_REQUEST, SUBSCRIPTION_ERRORS.SUBSCRIPTION_NOT_FOUND);
                    }

                    if (subscription.sub_remaining_uses <= 0) {
                        throw new ApiError(StatusCodes.BAD_REQUEST, SUBSCRIPTION_ERRORS.ENGAGEMENT_LIMIT_REACHED);
                    }

                    // Create engagement record
                    await tx.engagements.create({
                        data: {
                            eng_user_id: bidder_id,
                            eng_subscription_id: subscription.sub_id,
                            eng_listing_id: listing_id,
                            eng_type: "AUCTION",
                            eng_status: "ACTIVE",
                        },
                    });

                    // Decrement subscription uses (lock a vote)
                    await tx.subscriptions.update({
                        where: { sub_id: subscription.sub_id },
                        data: {
                            sub_remaining_uses: { decrement: 1 },
                        },
                    });
                }

                // Create bid record
                const bid = await tx.bids.create({
                    data: {
                        bid_listing_id: listing_id,
                        bid_bidder_id: bidder_id,
                        bid_amount,
                    },
                    select: {
                        bid_id: true,
                        bid_listing_id: true,
                        bid_amount: true,
                        bid_created_at: true,
                    },
                });

                // Update listing current bid and bid count
                await tx.listings.update({
                    where: { lst_id: listing_id },
                    data: {
                        lst_current_bid: bid_amount,
                        lst_bid_count: { increment: 1 },
                    },
                });

                return bid;
            });
        });
    };

    getAllLiveBids = async (page: number, take: number) => {
        const skip = (page - 1) * take;
        const [bids, count] = await queryHandler(() =>
            prisma.$transaction([
                prisma.bids.findMany({
                    where: {
                        listing: {
                            lst_type: "AUCTION",
                            lst_status: "ACTIVE"
                        }
                    },
                    select: bidSelect,
                    take,
                    skip,
                    orderBy: {
                        bid_amount: "desc"
                    }
                }),

                prisma.bids.count({
                    where: {
                        listing: {
                            lst_type: "AUCTION",
                            lst_status: "ACTIVE"
                        }
                    }
                })
            ])
        );

        return { bids, count, page, take };
    };

}

export default BidRepository;
