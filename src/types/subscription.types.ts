import { Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type PurchaseSubscriptionDTO = {
    plan_id: string;
};

export type createSubscriptionType = Prisma.Args<
    typeof prisma.subscriptions,
    "create"
>["data"];

export type updateSubscriptionType = Prisma.Args<
    typeof prisma.subscriptions,
    "update"
>["data"];
