import { SubscriptionStatus } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { subscriptionSelect, SUBSCRIPTION_LIMIT } from "../constants/subscription.constant";
import { queryHandler } from "../utils/helper";
import { startOfDay } from "date-fns";

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
     * Finds an active subscription for a user and resets daily uses if needed.
     * Returns null if no valid subscription exists or daily limit is exhausted.
     */
    findActiveByUserId = async (user_id: string) => {
        return queryHandler(async () => {
            const subscription = await prisma.subscriptions.findFirst({
                where: {
                    sub_user_id: user_id,
                    sub_status: SubscriptionStatus.ACTIVE,
                    sub_expires_at: { gt: new Date() },
                },
                select: {
                    ...subscriptionSelect,
                    sub_daily_uses_reset_date: true,
                },
            });

            if (!subscription) return null;

            const today = startOfDay(new Date());
            const resetDate = startOfDay(new Date(subscription.sub_daily_uses_reset_date));

            // If the reset date is before today, reset daily uses
            if (resetDate < today) {
                const updated = await prisma.subscriptions.update({
                    where: { sub_id: subscription.sub_id },
                    data: {
                        sub_remaining_uses: SUBSCRIPTION_LIMIT,
                        sub_daily_uses_reset_date: new Date(),
                    },
                    select: subscriptionSelect,
                });
                return updated;
            }

            // If daily uses are exhausted for today
            if (subscription.sub_remaining_uses <= 0) {
                return null;
            }

            return subscription;
        });
    };

    /**
     * Checks if a user can purchase a new subscription.
     * Returns true if user has no active subscription OR if daily limit is exhausted.
     */
    canPurchaseSubscription = async (user_id: string) => {
        return queryHandler(async () => {
            const subscription = await prisma.subscriptions.findFirst({
                where: {
                    sub_user_id: user_id,
                    sub_status: SubscriptionStatus.ACTIVE,
                    sub_expires_at: { gt: new Date() },
                },
                select: {
                    sub_id: true,
                    sub_remaining_uses: true,
                    sub_daily_uses_reset_date: true,
                },
            });

            // No active subscription - can purchase
            if (!subscription) return true;

            const today = startOfDay(new Date());
            const resetDate = startOfDay(new Date(subscription.sub_daily_uses_reset_date));

            // If reset date is today and uses are exhausted - can purchase new subscription
            if (resetDate >= today && subscription.sub_remaining_uses <= 0) {
                return true;
            }

            // User has active subscription with uses remaining - cannot purchase
            return false;
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

    /** Decrements remaining uses; expires subscription if uses reach 0. */
    decrementUses = async (sub_id: string, current_uses: number) => {
        const new_uses = current_uses - 1;
        return queryHandler(() =>
            prisma.subscriptions.update({
                where: { sub_id },
                data: {
                    sub_remaining_uses: new_uses,
                    ...(new_uses === 0 && { sub_status: SubscriptionStatus.EXPIRED }),
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
