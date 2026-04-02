import { OrderStatus } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { orderSelect } from "../constants/order.constant";
import { SUBSCRIPTION_ERRORS } from "../constants/subscription.constant";
import { queryHandler } from "../utils/helper";
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
     * Buy Now immediately closes the engagement since the listing is sold.
     * Vote is NOT restored for Buy Now (item is purchased, engagement complete).
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

                // Check subscription has available engagement slots
                const subscription = await tx.subscriptions.findFirst({
                    where: {
                        sub_user_id: buyer_id,
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

                // Create engagement record (immediately closed for Buy Now)
                await tx.engagements.create({
                    data: {
                        eng_user_id: buyer_id,
                        eng_subscription_id: subscription.sub_id,
                        eng_listing_id: listing_id,
                        eng_type: "BUY_NOW",
                        eng_status: "CLOSED",
                        eng_closed_at: new Date(),
                    },
                });

                // Decrement subscription uses (this vote is permanently consumed for Buy Now)
                await tx.subscriptions.update({
                    where: { sub_id: subscription.sub_id },
                    data: {
                        sub_remaining_uses: { decrement: 1 },
                    },
                });

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
