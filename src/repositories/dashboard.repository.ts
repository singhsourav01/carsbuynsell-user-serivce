import { ListingStatus, ListingType, OrderStatus, Role, ApprovalStatus } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { queryHandler } from "../utils/helper";

class DashboardRepository {
    /**
     * Returns all six stat counts in parallel for maximum performance.
     */
    getStats = async () => {
        const now = new Date();

        // Start of current month (UTC)
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

        // Start of current week (Monday)
        const dayOfWeek = now.getDay(); // 0=Sun, 1=Mon, ...
        const diffToMonday = dayOfWeek === 0 ? 6 : dayOfWeek - 1;
        const startOfWeek = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diffToMonday);

        const completedStatuses: OrderStatus[] = [OrderStatus.CONFIRMED, OrderStatus.DELIVERED];

        const [
            totalUsers,
            activeListings,
            liveAuctions,
            monthlyRevenueAgg,
            pendingApprovals,
            dealsThisWeek,
        ] = await queryHandler(() =>
            Promise.all([
                // 1. Total users (non-deleted, role USER)
                prisma.users.count({
                    where: {
                        user_role: Role.USER,
                        user_is_deleted: false,
                    },
                }),

                // 2. Active listings
                prisma.listings.count({
                    where: { lst_status: ListingStatus.ACTIVE },
                }),

                // 3. Live auctions (active + auction type + end date in future)
                prisma.listings.count({
                    where: {
                        lst_type: ListingType.AUCTION,
                        lst_status: ListingStatus.ACTIVE,
                        lst_auction_end: { gt: now },
                    },
                }),

                // 4. Monthly revenue (sum of confirmed/delivered orders this month)
                prisma.orders.aggregate({
                    _sum: { ord_amount: true },
                    where: {
                        ord_status: { in: completedStatuses },
                        ord_created_at: { gte: startOfMonth },
                    },
                }),

                // 5. Pending user approvals
                prisma.users.count({
                    where: { user_admin_status: ApprovalStatus.PENDING },
                }),

                // 6. Deals closed this week
                prisma.orders.count({
                    where: {
                        ord_status: { in: completedStatuses },
                        ord_created_at: { gte: startOfWeek },
                    },
                }),
            ])
        );

        return {
            totalUsers,
            activeListings,
            liveAuctions,
            monthlyRevenue: Number(monthlyRevenueAgg._sum.ord_amount ?? 0),
            pendingApprovals,
            dealsThisWeek,
        };
    };

    /**
     * Returns the most recent 10 completed/delivered orders
     * with buyer, listing (+ category), and seller details.
     */
    getRecentSells = async () => {
        return queryHandler(() =>
            prisma.orders.findMany({
                where: {
                    ord_status: {
                        in: [OrderStatus.CONFIRMED, OrderStatus.DELIVERED],
                    },
                },
                orderBy: { ord_created_at: "desc" },
                take: 10,
                select: {
                    ord_id: true,
                    ord_amount: true,
                    ord_status: true,
                    ord_created_at: true,
                    buyer: {
                        select: {
                            user_id: true,
                            user_full_name: true,
                            user_email: true,
                        },
                    },
                    listing: {
                        select: {
                            lst_id: true,
                            lst_title: true,
                            lst_price: true,
                            lst_type: true,
                            category: {
                                select: { cat_name: true },
                            },
                            seller: {
                                select: {
                                    user_id: true,
                                    user_full_name: true,
                                },
                            },
                        },
                    },
                },
            })
        );
    };
}

export default DashboardRepository;
