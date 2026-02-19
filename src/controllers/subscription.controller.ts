import { ApiResponse, asyncHandler } from "common-microservices-utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { SUBSCRIPTION_RESPONSES } from "../constants/subscription.constant";
import SubscriptionService from "../services/subscription.service";

interface AuthRequest extends Request {
    user?: any;
}

class SubscriptionController {
    private subscriptionService: SubscriptionService;

    constructor() {
        this.subscriptionService = new SubscriptionService();
    }

    getPlans = asyncHandler(async (_req: Request, res: Response) => {
        const plans = await this.subscriptionService.getPlans();
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, plans, SUBSCRIPTION_RESPONSES.PLANS_FETCHED));
    });

    purchase = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { user_id } = req.user;
        const { plan_id } = req.body;

        const subscription = await this.subscriptionService.purchase(user_id, plan_id);
        return res
            .status(StatusCodes.CREATED)
            .json(new ApiResponse(StatusCodes.CREATED, subscription, SUBSCRIPTION_RESPONSES.SUBSCRIPTION_PURCHASED));
    });

    getMySubscription = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { user_id } = req.user;
        const subscription = await this.subscriptionService.getMySubscription(user_id);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, subscription, SUBSCRIPTION_RESPONSES.SUBSCRIPTION_FETCHED));
    });
}

export default SubscriptionController;
