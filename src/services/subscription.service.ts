import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";
import { addDays } from "date-fns";
import crypto from "crypto";
import {
    SUBSCRIPTION_ERRORS,
    SUBSCRIPTION_PRICE,
} from "../constants/subscription.constant";
import SubscriptionRepository from "../repositories/subscription.repository";

// eslint-disable-next-line @typescript-eslint/no-require-imports
const Razorpay = require("razorpay");

const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID!,
    key_secret: process.env.RAZORPAY_KEY_SECRET!,
});

class SubscriptionService {
    private subscriptionRepository: SubscriptionRepository;

    constructor() {
        this.subscriptionRepository = new SubscriptionRepository();
    }

    getPlans = async () => {
        return this.subscriptionRepository.findPlans();
    };

    /**
     * Step 1: Create a Razorpay order and a PENDING subscription record.
     * Returns order info for the frontend to trigger Razorpay checkout.
     */
    createPaymentOrder = async (user_id: string, plan_id: string) => {
        // Block if already has an active subscription
        const existing = await this.subscriptionRepository.findActiveByUserId(user_id);
        if (existing)
            throw new ApiError(StatusCodes.CONFLICT, SUBSCRIPTION_ERRORS.ALREADY_SUBSCRIBED);

        // Validate plan
        const plan = await this.subscriptionRepository.findPlanById(plan_id);
        if (!plan)
            throw new ApiError(StatusCodes.NOT_FOUND, SUBSCRIPTION_ERRORS.PLAN_NOT_FOUND);

        // Enforce fixed price
        const amountInPaise = SUBSCRIPTION_PRICE * 100; // Razorpay uses paise

        // Create Razorpay order
        const razorpayOrder = await razorpay.orders.create({
            amount: amountInPaise,
            currency: "INR",
            notes: { user_id, plan_id },
        });
        console.log(razorpayOrder, " here is entire details of razorpayOrder");
        // Store pending subscription in DB
        const expires_at = addDays(new Date(), plan.sp_duration);
        await this.subscriptionRepository.createPendingSubscription(
            user_id,
            plan_id,
            razorpayOrder.id,
            expires_at
        );

        return {
            razorpay_order_id: razorpayOrder.id,
            amount: amountInPaise,
            currency: "INR",
            key_id: process.env.RAZORPAY_KEY_ID,
        };
    };

    /**
     * Step 2: Verify Razorpay signature and activate the subscription.
     */
    verifyPayment = async (
        razorpay_order_id: string,
        razorpay_payment_id: string,
        razorpay_signature: string
    ) => {
        // Verify HMAC-SHA256 signature
        const body = razorpay_order_id + "|" + razorpay_payment_id;
        const expectedSignature = crypto
            .createHmac("sha256", process.env.RAZORPAY_KEY_SECRET!)
            .update(body)
            .digest("hex");

        if (expectedSignature !== razorpay_signature)
            throw new ApiError(StatusCodes.BAD_REQUEST, SUBSCRIPTION_ERRORS.INVALID_SIGNATURE);

        // Look up pending subscription
        const pending = await this.subscriptionRepository.findByRazorpayOrderId(razorpay_order_id);
        if (!pending)
            throw new ApiError(StatusCodes.NOT_FOUND, SUBSCRIPTION_ERRORS.PENDING_SUB_NOT_FOUND);

        // Activate subscription
        return this.subscriptionRepository.activateSubscription(
            razorpay_order_id,
            razorpay_payment_id
        );
    };

    getMySubscription = async (user_id: string) => {
        const subscription = await this.subscriptionRepository.findActiveByUserId(user_id);
        if (!subscription)
            throw new ApiError(StatusCodes.NOT_FOUND, SUBSCRIPTION_ERRORS.SUBSCRIPTION_NOT_FOUND);
        return subscription;
    };

    getAllForAdmin = async (page: number, take: number) => {
        return this.subscriptionRepository.findAllForAdmin(page, take);
    };
}

export default SubscriptionService;
