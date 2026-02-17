import { Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type createUserFemaleMeasurement = Prisma.Args<
  typeof prisma.user_female_measurements,
  "create"
>["data"];
export type updateUserFemaleMeasurement = Prisma.Args<
  typeof prisma.user_female_measurements,
  "update"
>["data"];
