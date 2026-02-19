import { ListingStatus, ListingType, Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type CreateListingDTO = {
  lst_category_id: string;
  lst_title: string;
  lst_description?: string;
  lst_type: ListingType;
  lst_price: number;
  lst_min_increment?: number;
  lst_auction_end?: string; // ISO date string
};

export type UpdateListingDTO = Partial<CreateListingDTO> & {
  lst_status?: ListingStatus;
};

export type ListingQueryDTO = {
  page?: string;
  page_size?: string;
  search?: string;
  category?: string;
  type?: ListingType;
  status?: ListingStatus;
  min_price?: string;
  max_price?: string;
  is_featured?: string;
};

export type updateListingType = Prisma.Args<
  typeof prisma.listings,
  "update"
>["data"];

export type createListingType = Prisma.Args<
  typeof prisma.listings,
  "create"
>["data"];
