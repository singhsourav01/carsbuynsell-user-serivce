import prisma from "../configs/prisma.config";
import { queryHandler } from "../utils/helper";

class ProfileRepository {
    /**
     * Fetch all bids for a user (for order history)
     */
    findBidsByUserId = async (user_id: string) => {
        return queryHandler(() =>
            prisma.bids.findMany({
                where: { bid_bidder_id: user_id },
                select: {
                    bid_id: true,
                    bid_amount: true,
                    bid_created_at: true,
                    listing: {
                        select: {
                            lst_id: true,
                            lst_title: true,
                            lst_price: true,
                            lst_type: true,
                            lst_status: true,
                        },
                    },
                },
                orderBy: { bid_created_at: "desc" },
            })
        );
    };

    /**
     * Fetch all orders for a user (for order history)
     */
    findOrdersByUserId = async (user_id: string) => {
        return queryHandler(() =>
            prisma.orders.findMany({
                where: { ord_buyer_id: user_id },
                select: {
                    ord_id: true,
                    ord_amount: true,
                    ord_status: true,
                    ord_created_at: true,
                    listing: {
                        select: {
                            lst_id: true,
                            lst_title: true,
                            lst_price: true,
                            lst_type: true,
                            lst_status: true,
                        },
                    },
                },
                orderBy: { ord_created_at: "desc" },
            })
        );
    };

    /**
     * Count bids for a user
     */
    countBidsByUserId = async (user_id: string) => {
        return queryHandler(() =>
            prisma.bids.count({ where: { bid_bidder_id: user_id } })
        );
    };

    /**
     * Count orders for a user
     */
    countOrdersByUserId = async (user_id: string) => {
        return queryHandler(() =>
            prisma.orders.count({ where: { ord_buyer_id: user_id } })
        );
    };
}

export default ProfileRepository;
