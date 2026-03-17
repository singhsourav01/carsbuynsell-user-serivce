import { OrderStatus } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { orderSelect } from "../constants/order.constant";
import { SUBSCRIPTION_LIMIT } from "../constants/subscription.constant";
import { queryHandler } from "../utils/helper";
import { startOfDay } from "date-fns";
import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";

class OrderRepository {
    findByBuyerId = async (buyer_id: string, page: number, take: number) => {
        const skip = (page - 1) * take;
        const [orders, count] = await queryHandler(() =>
            prisma.$transaction([
                prisma.orders.findMany({
                    where: { ord_buyer_id: buyer_id },
                    select: orderSelect,
                    take,
                    skip,
                    orderBy: { ord_created_at: "desc" },
                }),
                prisma.orders.count({ where: { ord_buyer_id: buyer_id } }),
            ])
        );
        return { orders, count, page, take };
    };

    findById = async (ord_id: string) => {
        return queryHandler(() =>
            prisma.orders.findUnique({
                where: { ord_id },
                select: orderSelect,
            })
        );
    };

    findAll = async (page: number, take: number, status?: OrderStatus) => {
        const skip = (page - 1) * take;
        const where: any = {};
        if (status) where.ord_status = status;

        const [orders, count] = await queryHandler(() =>
            prisma.$transaction([
                prisma.orders.findMany({
                    where,
                    select: orderSelect,
                    take,
                    skip,
                    orderBy: { ord_created_at: "desc" },
                }),
                prisma.orders.count({ where }),
            ])
        );
        return { orders, count, page, take };
    };

    /**
     * Creates an order using a transaction to prevent double-purchase.
     * Checks listing is still ACTIVE, creates order, and marks listing as SOLD atomically.
     */
    buyNow = async (listing_id: string, buyer_id: string) => {
        return queryHandler(async () => {
            return await prisma.$transaction(async (tx) => {
                const listing = await tx.listings.findUnique({
                    where: { lst_id: listing_id },
                });

                if (!listing) throw new ApiError(StatusCodes.BAD_REQUEST, "LISTING_NOT_FOUND");
                if (listing.lst_status !== "ACTIVE") throw new ApiError(StatusCodes.BAD_REQUEST, "LISTING_NOT_ACTIVE");
                if (listing.lst_type !== "BUY_NOW") throw new ApiError(StatusCodes.BAD_REQUEST, "LISTING_NOT_BUY_NOW");
                if (listing.lst_seller_id === buyer_id) throw new ApiError(StatusCodes.BAD_REQUEST, "CANNOT_BUY_OWN_LISTING");

                // Check no existing confirmed order
                const existingOrder = await tx.orders.findFirst({
                    where: {
                        ord_listing_id: listing_id,
                        ord_status: { not: OrderStatus.CANCELLED },
                    },
                });
                if (existingOrder) throw new ApiError(StatusCodes.BAD_REQUEST, "ALREADY_PURCHASED");

                // Check subscription uses (within the same transaction)
                const subscription = await tx.subscriptions.findFirst({
                    where: {
                        sub_user_id: buyer_id,
                        sub_status: "ACTIVE",
                        sub_expires_at: { gt: new Date() },
                    },
                });
                if (!subscription) throw new ApiError(StatusCodes.BAD_REQUEST, "USES_EXHAUSTED");

                const today = startOfDay(new Date());
                const resetDate = startOfDay(new Date(subscription.sub_daily_uses_reset_date));
                let remainingUses = subscription.sub_remaining_uses;

                // If reset date is before today, reset daily uses
                if (resetDate < today) {
                    await tx.subscriptions.update({
                        where: { sub_id: subscription.sub_id },
                        data: {
                            sub_remaining_uses: SUBSCRIPTION_LIMIT,
                            sub_daily_uses_reset_date: new Date(),
                        },
                    });
                    remainingUses = SUBSCRIPTION_LIMIT;
                }

                // Check if daily uses are exhausted
                if (remainingUses <= 0) {
                    throw new ApiError(StatusCodes.BAD_REQUEST, "DAILY_USES_EXHAUSTED");
                }

                // Create order
                const order = await tx.orders.create({
                    data: {
                        ord_buyer_id: buyer_id,
                        ord_listing_id: listing_id,
                        ord_amount: listing.lst_price,
                        ord_status: OrderStatus.CONFIRMED,
                    },
                    select: orderSelect,
                });

                // Mark listing as SOLD
                await tx.listings.update({
                    where: { lst_id: listing_id },
                    data: { lst_status: "SOLD" },
                });

                // Decrement subscription daily uses (no expiration on daily reset system)
                const newUses = remainingUses - 1;
                await tx.subscriptions.update({
                    where: { sub_id: subscription.sub_id },
                    data: {
                        sub_remaining_uses: newUses,
                    },
                });

                return order;
            });
        });
    };

    updateStatus = async (ord_id: string, ord_status: OrderStatus) => {
        return queryHandler(() =>
            prisma.orders.update({
                where: { ord_id },
                data: { ord_status },
                select: orderSelect,
            })
        );
    };
}

export default OrderRepository;
