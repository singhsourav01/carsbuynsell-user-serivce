import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";
import { LISTING_ERRORS } from "../constants/listing.constant";
import { ORDER_ERRORS } from "../constants/order.constant";
import { SUBSCRIPTION_ERRORS } from "../constants/subscription.constant";
import OrderRepository from "../repositories/order.repository";
import SubscriptionRepository from "../repositories/subscription.repository";
import { OrderQueryDTO } from "../types/order.types";

class OrderService {
    private orderRepository: OrderRepository;
    private subscriptionRepository: SubscriptionRepository;

    constructor() {
        this.orderRepository = new OrderRepository();
        this.subscriptionRepository = new SubscriptionRepository();
    }

    buyNow = async (listing_id: string, buyer_id: string) => {
        // 1. Validate active subscription
        const subscription = await this.subscriptionRepository.findActiveByUserId(buyer_id);
        if (!subscription)
            throw new ApiError(StatusCodes.FORBIDDEN, SUBSCRIPTION_ERRORS.SUBSCRIPTION_NOT_FOUND);

        // 2. Delegate to repository transaction
        try {
            return await this.orderRepository.buyNow(listing_id, buyer_id);
        } catch (err: any) {
            const msg = err?.message || "";
            if (msg === "LISTING_NOT_FOUND")
                throw new ApiError(StatusCodes.NOT_FOUND, LISTING_ERRORS.LISTING_NOT_FOUND);
            if (msg === "LISTING_NOT_ACTIVE")
                throw new ApiError(StatusCodes.BAD_REQUEST, LISTING_ERRORS.LISTING_NOT_ACTIVE);
            if (msg === "LISTING_NOT_BUY_NOW")
                throw new ApiError(StatusCodes.BAD_REQUEST, LISTING_ERRORS.LISTING_NOT_BUY_NOW);
            if (msg === "CANNOT_BUY_OWN_LISTING")
                throw new ApiError(StatusCodes.BAD_REQUEST, LISTING_ERRORS.CANNOT_BUY_OWN_LISTING);
            if (msg === "ALREADY_PURCHASED")
                throw new ApiError(StatusCodes.CONFLICT, ORDER_ERRORS.ALREADY_PURCHASED);
            throw err;
        }
    };

    getMyOrders = async (buyer_id: string, query: OrderQueryDTO) => {
        const page = Number(query.page || "1");
        const take = Number(query.page_size || "10");
        return this.orderRepository.findByBuyerId(buyer_id, page, take);
    };

    getOrderById = async (ord_id: string, user_id: string, isAdmin = false) => {
        const order = await this.orderRepository.findById(ord_id);
        if (!order)
            throw new ApiError(StatusCodes.NOT_FOUND, ORDER_ERRORS.ORDER_NOT_FOUND);
        if (!isAdmin && (order as any).ord_buyer_id !== user_id)
            throw new ApiError(StatusCodes.FORBIDDEN, "You do not have access to this order");
        return order;
    };

    getAllOrders = async (page: number, take: number, query: OrderQueryDTO) => {
        return this.orderRepository.findAll(page, take, query.status);
    };
}

export default OrderService;
