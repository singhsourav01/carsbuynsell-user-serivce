import {  Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type CreateUserVehicleRecordDTO = {
  uvr_title: string;
  uvr_description?: string;
  uvr_category: string;
  uvr_base_price: number;
};

export type UpdateUserVehicleRecordDTO = Partial<CreateUserVehicleRecordDTO>;

export type UserVehicleRecordQueryDTO = {
  page?: string;
  page_size?: string;
  search?: string;
  category?: string;
};

export type createUserVehicleRecordType = Prisma.Args<
  typeof prisma.user_vehicle_record,
  "create"
>["data"];

export type updateUserVehicleRecordType = Prisma.Args<
  typeof prisma.user_vehicle_record,
  "update"
>["data"];
