import { SubscriptionStatus } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { subscriptionSelect } from "../constants/subscription.constant";
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
                },
                select: subscriptionSelect,
            })
        );
    };

    create = async (
        user_id: string,
        plan_id: string,
        expires_at: Date
    ) => {
        return queryHandler(() =>
            prisma.subscriptions.create({
                data: {
                    sub_user_id: user_id,
                    sub_plan_id: plan_id,
                    sub_status: SubscriptionStatus.ACTIVE,
                    sub_expires_at: expires_at,
                },
                select: subscriptionSelect,
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
