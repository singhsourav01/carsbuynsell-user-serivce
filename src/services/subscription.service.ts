import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";
import { addDays } from "date-fns";
import { SUBSCRIPTION_ERRORS } from "../constants/subscription.constant";
import SubscriptionRepository from "../repositories/subscription.repository";

class SubscriptionService {
    private subscriptionRepository: SubscriptionRepository;

    constructor() {
        this.subscriptionRepository = new SubscriptionRepository();
    }

    getPlans = async () => {
        return this.subscriptionRepository.findPlans();
    };

    purchase = async (user_id: string, plan_id: string) => {
        // Check for existing active subscription
        const existing = await this.subscriptionRepository.findActiveByUserId(user_id);
        if (existing)
            throw new ApiError(StatusCodes.CONFLICT, SUBSCRIPTION_ERRORS.ALREADY_SUBSCRIBED);

        // Validate plan exists
        const plan = await this.subscriptionRepository.findPlanById(plan_id);
        if (!plan)
            throw new ApiError(StatusCodes.NOT_FOUND, SUBSCRIPTION_ERRORS.PLAN_NOT_FOUND);

        const expires_at = addDays(new Date(), plan.sp_duration);
        return this.subscriptionRepository.create(user_id, plan_id, expires_at);
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
