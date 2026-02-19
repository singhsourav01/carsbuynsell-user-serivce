import { OrderStatus, Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type OrderQueryDTO = {
    page?: string;
    page_size?: string;
    status?: OrderStatus;
};

export type UpdateOrderDTO = {
    ord_status: OrderStatus;
};

export type createOrderType = Prisma.Args<
    typeof prisma.orders,
    "create"
>["data"];

export type updateOrderType = Prisma.Args<
    typeof prisma.orders,
    "update"
>["data"];
