import { Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type PlaceBidDTO = {
    bid_amount: number;
};

export type BidQueryDTO = {
    page?: string;
    page_size?: string;
};

export type createBidType = Prisma.Args<
    typeof prisma.bids,
    "create"
>["data"];
