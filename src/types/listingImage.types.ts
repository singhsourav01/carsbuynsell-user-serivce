import { Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type AddListingImageDTO = {
    image_urls: string[];
};

export type ReorderImageDTO = {
    order: number;
};

export type createListingImageType = Prisma.Args<
    typeof prisma.listing_images,
    "create"
>["data"];
