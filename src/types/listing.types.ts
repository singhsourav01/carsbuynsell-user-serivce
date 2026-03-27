import { ListingStatus, ListingType, FuelType, TransmissionType, BodyType, OwnershipType, Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type VehicleDetailsDTO = {
  fuel_type?: FuelType;
  transmission?: TransmissionType;
  body_type?: BodyType;
  ownership?: OwnershipType;
  year?: number;
  kilometers?: number;
};

export type CreateListingDTO = {
  lst_category_id: string;
  lst_title: string;
  lst_description?: string;
  lst_type: ListingType;
  lst_price: number;
  lst_min_increment?: number;
  lst_auction_end?: string; // ISO date string
  user_portfolio?: any[];
  vehicle_details?: VehicleDetailsDTO;
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
  // Vehicle filter parameters
  fuel_type?: string;      // Comma-separated: "PETROL,DIESEL"
  transmission?: string;   // Comma-separated: "MANUAL,AUTOMATIC"
  body_type?: string;      // Comma-separated: "SEDAN,SUV,HATCHBACK"
  ownership?: string;      // Comma-separated: "FIRST_OWNER,SECOND_OWNER"
  min_year?: string;
  max_year?: string;
  min_km?: string;
  max_km?: string;
};

export type updateListingType = Prisma.Args<
  typeof prisma.listings,
  "update"
>["data"];

export type createListingType = Prisma.Args<
  typeof prisma.listings,
  "create"
>["data"];
