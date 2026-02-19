import { ApiResponse, asyncHandler } from "common-microservices-utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { ORDER_RESPONSES } from "../constants/order.constant";
import OrderService from "../services/order.service";
import { OrderQueryDTO } from "../types/order.types";

interface AuthRequest extends Request {
    user?: any;
}

class OrderController {
    private orderService: OrderService;

    constructor() {
        this.orderService = new OrderService();
    }

    buyNow = asyncHandler(async (req: AuthRequest, res: Response) => {
        const listing_id = String(req.params.id);
        const { user_id } = req.user;

        const order = await this.orderService.buyNow(listing_id, user_id);
        return res
            .status(StatusCodes.CREATED)
            .json(new ApiResponse(StatusCodes.CREATED, order, ORDER_RESPONSES.ORDER_CREATED));
    });

    getMyOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { user_id } = req.user;
        const query = req.query as OrderQueryDTO;

        const result = await this.orderService.getMyOrders(user_id, query);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, result, ORDER_RESPONSES.ORDERS_FETCHED));
    });

    getOrderById = asyncHandler(async (req: AuthRequest, res: Response) => {
        const ord_id = String(req.params.id);
        const { user_id } = req.user;

        const order = await this.orderService.getOrderById(ord_id, user_id);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, order, ORDER_RESPONSES.ORDER_FETCHED));
    });
}

export default OrderController;
