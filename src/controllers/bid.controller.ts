import { ApiResponse, asyncHandler } from "common-microservices-utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { BID_RESPONSES } from "../constants/bid.constant";
import BidService from "../services/bid.service";

interface AuthRequest extends Request {
    user?: any;
}

class BidController {
    private bidService: BidService;

    constructor() {
        this.bidService = new BidService();
    }

    placeBid = asyncHandler(async (req: AuthRequest, res: Response) => {
        const listing_id = String(req.params.id);
        const { user_id } = req.user;
        const { bid_amount } = req.body;

        const bid = await this.bidService.placeBid(listing_id, user_id, Number(bid_amount));
        return res
            .status(StatusCodes.CREATED)
            .json(new ApiResponse(StatusCodes.CREATED, bid, BID_RESPONSES.BID_PLACED));
    });

    getBidsByListing = asyncHandler(async (req: Request, res: Response) => {
        const listing_id = String(req.params.id);
        const page = Number(req.query.page || "1");
        const take = Number(req.query.page_size || "10");

        const result = await this.bidService.getBidsByListing(listing_id, page, take);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, result, BID_RESPONSES.BIDS_FETCHED));
    });
}

export default BidController;
