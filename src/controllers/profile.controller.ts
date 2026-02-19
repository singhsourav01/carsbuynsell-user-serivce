import { ApiResponse, asyncHandler } from "common-microservices-utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import BidService from "../services/bid.service";
import ListingService from "../services/listing.service";
import OrderService from "../services/order.service";

interface AuthRequest extends Request {
    user?: any;
}

class ProfileController {
    private listingService: ListingService;
    private bidService: BidService;
    private orderService: OrderService;

    constructor() {
        this.listingService = new ListingService();
        this.bidService = new BidService();
        this.orderService = new OrderService();
    }

    getMyListings = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { user_id } = req.user;
        const page = Number(req.query.page || "1");
        const take = Number(req.query.page_size || "10");

        const result = await this.listingService.getMyListings(user_id, page, take);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, result, "My listings fetched successfully"));
    });

    getMyBids = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { user_id } = req.user;
        const page = Number(req.query.page || "1");
        const take = Number(req.query.page_size || "10");

        const result = await this.bidService.getMyBids(user_id, page, take);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, result, "My bids fetched successfully"));
    });

    getMyOrders = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { user_id } = req.user;
        const query: any = req.query;

        const result = await this.orderService.getMyOrders(user_id, query);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, result, "My orders fetched successfully"));
    });
}

export default ProfileController;
