import { SubscriptionStatus } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { subscriptionSelect, SUBSCRIPTION_LIMIT } from "../constants/subscription.constant";
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

    findActiveByUserId = async (user_id: string) => {
        return queryHandler(() =>
            prisma.subscriptions.findFirst({
                where: {
                    sub_user_id: user_id,
                    sub_status: SubscriptionStatus.ACTIVE,
                    sub_expires_at: { gt: new Date() },
                    sub_remaining_uses: { gt: 0 },
                },
                select: subscriptionSelect,
            })
        );
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
