import { SubscriptionStatus } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { engagementSelect, subscriptionSelect, SELL_PLAN_ID, SUBSCRIPTION_LIMIT } from "../constants/subscription.constant";
import { queryHandler } from "../utils/helper";

class SubscriptionRepository {
    findPlans = async () => {
        return queryHandler(() =>
            prisma.subscription_plans.findMany({
                where: { sp_is_active: true },
                orderBy: { sp_price: "asc" },
            })
        );
    };

    findPlanById = async (sp_id: string) => {
        return queryHandler(() =>
            prisma.subscription_plans.findUnique({ where: { sp_id } })
        );
    };

    /**
     * Finds an active subscription for a user with available engagement slots.
     * Prioritizes subscriptions with remaining uses, ordered by newest first.
     */
    findActiveByUserId = async (user_id: string) => {
        return queryHandler(async () => {
            // Find subscription with available slots (sub_remaining_uses > 0)
            // Order by created_at DESC to get the newest subscription first
            const subscription = await prisma.subscriptions.findFirst({
                where: {
                    sub_user_id: user_id,
                    sub_status: SubscriptionStatus.ACTIVE,
                    sub_expires_at: { gt: new Date() },
                    sub_remaining_uses: { gt: 0 }, // Only subscriptions with available slots
                    sub_plan_id: { not: SELL_PLAN_ID },
                },
                select: subscriptionSelect,
                orderBy: { sub_created_at: "desc" }, // Newest first
            });

            return subscription;
        });
    };

    /**
     * Finds active subscription regardless of remaining uses.
     * Used for checking if user has any active subscription (e.g. Buy Now).
     * Prefers the subscription with the most free slots.
     */
    findActiveSubscriptionAny = async (user_id: string) => {
        return queryHandler(() =>
            prisma.subscriptions.findFirst({
                where: {
                    sub_user_id: user_id,
                    sub_status: SubscriptionStatus.ACTIVE,
                    sub_expires_at: { gt: new Date() },
                    sub_plan_id: { not: SELL_PLAN_ID },
                },
                select: subscriptionSelect,
                orderBy: [{ sub_remaining_uses: "desc" }, { sub_created_at: "desc" }],
            })
        );
    };

    /** Active auction engagements (occupied slots) for a user. */
    findActiveEngagements = async (user_id: string) => {
        return queryHandler(() =>
            prisma.engagements.findMany({
                where: { eng_user_id: user_id, eng_status: "ACTIVE" },
                select: engagementSelect,
                orderBy: { eng_created_at: "desc" },
            })
        );
    };

    /**
     * Checks if a user can purchase a new subscription.
     * Returns true only if user has no active subscription. When all slots are
     * in use the user must wait for an auction to end instead of buying again.
     */
    canPurchaseSubscription = async (user_id: string) => {
        return queryHandler(async () => {
            const subscription = await prisma.subscriptions.findFirst({
                where: {
                    sub_user_id: user_id,
                    sub_status: SubscriptionStatus.ACTIVE,
                    sub_expires_at: { gt: new Date() },
                    sub_plan_id: { not: SELL_PLAN_ID },
                },
                select: { sub_id: true },
            });

            return !subscription;
        });
    };

    findByRazorpayOrderId = async (razorpay_order_id: string) => {
        return queryHandler(() =>
            prisma.subscriptions.findUnique({
                where: { sub_razorpay_order_id: razorpay_order_id },
                include: { plan: true },
            })
        );
    };

    /** Creates a PENDING subscription when Razorpay order is first created. */
    createPendingSubscription = async (
        user_id: string,
        plan_id: string,
        razorpay_order_id: string,
        expires_at: Date
    ) => {
        return queryHandler(() =>
            prisma.subscriptions.create({
                data: {
                    sub_user_id: user_id,
                    sub_plan_id: plan_id,
                    sub_status: SubscriptionStatus.CANCELLED, // Not active until payment verified
                    sub_expires_at: expires_at,
                    sub_remaining_uses: SUBSCRIPTION_LIMIT,
                    sub_razorpay_order_id: razorpay_order_id,
                },
                select: subscriptionSelect,
            })
        );
    };

    /** Activates a subscription after Razorpay payment is verified. */
    activateSubscription = async (
        razorpay_order_id: string,
        razorpay_payment_id: string
    ) => {
        return queryHandler(() =>
            prisma.subscriptions.update({
                where: { sub_razorpay_order_id: razorpay_order_id },
                data: {
                    sub_status: SubscriptionStatus.ACTIVE,
                    sub_razorpay_payment_id: razorpay_payment_id,
                    sub_starts_at: new Date(),
                },
                select: subscriptionSelect,
            })
        );
    };

    /** Decrements remaining uses when a new engagement is created. */
    decrementUses = async (sub_id: string, current_uses: number) => {
        const new_uses = current_uses - 1;
        return queryHandler(() =>
            prisma.subscriptions.update({
                where: { sub_id },
                data: {
                    sub_remaining_uses: new_uses,
                },
            })
        );
    };

    /** Restores a use when an engagement is closed (auction ends). */
    incrementUses = async (sub_id: string) => {
        return queryHandler(() =>
            prisma.subscriptions.update({
                where: { sub_id },
                data: {
                    sub_remaining_uses: { increment: 1 },
                },
            })
        );
    };

    findAllForAdmin = async (page: number, take: number) => {
        const skip = (page - 1) * take;
        const [subscriptions, count] = await queryHandler(() =>
            prisma.$transaction([
                prisma.subscriptions.findMany({
                    select: subscriptionSelect,
                    take,
                    skip,
                    orderBy: { sub_created_at: "desc" },
                }),
                prisma.subscriptions.count(),
            ])
        );
        return { subscriptions, count, page, take };
    };
}

export default SubscriptionRepository;
