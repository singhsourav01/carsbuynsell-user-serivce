import prisma from "../configs/prisma.config";
import { bidSelect } from "../constants/bid.constant";
import { queryHandler } from "../utils/helper";

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
     * Locks the listing row, validates bid amount, creates bid, and updates listing.
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

                if (!listing) throw new Error("LISTING_NOT_FOUND");
                if (listing.lst_status !== "ACTIVE") throw new Error("LISTING_NOT_ACTIVE");
                if (listing.lst_type !== "AUCTION") throw new Error("LISTING_NOT_AUCTION");
                if (listing.lst_auction_end && listing.lst_auction_end < new Date()) {
                    throw new Error("AUCTION_ENDED");
                }
                if (listing.lst_seller_id === bidder_id) {
                    throw new Error("CANNOT_BID_OWN_LISTING");
                }

                const currentBid = Number(listing.lst_current_bid ?? listing.lst_price);
                const minIncrement = Number(listing.lst_min_increment ?? 0);
                const minimumBid = currentBid + minIncrement;

                if (bid_amount <= currentBid || bid_amount < minimumBid) {
                    throw new Error("BID_TOO_LOW");
                }

                // Check subscription uses (within the same transaction)
                const subscription = await tx.subscriptions.findFirst({
                    where: {
                        sub_user_id: bidder_id,
                        sub_status: "ACTIVE",
                        sub_expires_at: { gt: new Date() },
                        sub_remaining_uses: { gt: 0 },
                    },
                });
                if (!subscription) throw new Error("USES_EXHAUSTED");

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

                // Decrement subscription uses; expire if reaches 0
                const newUses = subscription.sub_remaining_uses - 1;
                await tx.subscriptions.update({
                    where: { sub_id: subscription.sub_id },
                    data: {
                        sub_remaining_uses: newUses,
                        ...(newUses === 0 && { sub_status: "EXPIRED" }),
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
