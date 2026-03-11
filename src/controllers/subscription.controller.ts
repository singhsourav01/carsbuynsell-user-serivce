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
        console.log("inside plangs");
        const plans = await this.subscriptionService.getPlans();
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, plans, SUBSCRIPTION_RESPONSES.PLANS_FETCHED));
    });

    /**
     * POST /subscriptions/create-order
     * Body: { plan_id }
     * Returns Razorpay order details to trigger checkout on the frontend.
     */
    createOrder = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { user_id } = req.user;
        const { plan_id } = req.body;

        const order = await this.subscriptionService.createPaymentOrder(user_id, plan_id);
        return res
            .status(StatusCodes.CREATED)
            .json(new ApiResponse(StatusCodes.CREATED, order, SUBSCRIPTION_RESPONSES.ORDER_CREATED));
    });

    /**
     * POST /subscriptions/verify-payment
     * Body: { razorpay_order_id, razorpay_payment_id, razorpay_signature }
     * Verifies Razorpay signature and activates subscription.
     */
    verifyPayment = asyncHandler(async (req: AuthRequest, res: Response) => {
        const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;

        const subscription = await this.subscriptionService.verifyPayment(
            razorpay_order_id,
            razorpay_payment_id,
            razorpay_signature
        );
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, subscription, SUBSCRIPTION_RESPONSES.PAYMENT_VERIFIED));
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
