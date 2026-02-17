import { Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type createUserBrandMeasurement = Prisma.Args<
  typeof prisma.user_brand_measurements,
  "create"
>["data"];
export type updateUserBrandMeasurement = Prisma.Args<
  typeof prisma.user_brand_measurements,
  "update"
>["data"];
