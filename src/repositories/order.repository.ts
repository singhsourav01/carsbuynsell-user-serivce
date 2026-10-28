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
     * Records a Buy Now request. Many users can request the same listing;
     * each user can request a given listing only once. The listing stays
     * ACTIVE and no engagement slot is used.
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

                // Check this user hasn't already requested this listing
                const existingOrder = await tx.orders.findFirst({
                    where: {
                        ord_listing_id: listing_id,
                        ord_buyer_id: buyer_id,
                        ord_status: { not: OrderStatus.CANCELLED },
                    },
                });
                if (existingOrder) throw new ApiError(StatusCodes.BAD_REQUEST, "ALREADY_PURCHASED");

                // Create order record (vehicle is not locked to a single user;
                // the listing stays visible to all other users)
                const order = await tx.orders.create({
                    data: {
                        ord_buyer_id: buyer_id,
                        ord_listing_id: listing_id,
                        ord_amount: listing.lst_price,
                        ord_status: OrderStatus.CONFIRMED,
                    },
                    select: orderSelect,
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
