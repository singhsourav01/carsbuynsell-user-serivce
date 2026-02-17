import { Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type createUserMaleMeasurement = Prisma.Args<
  typeof prisma.user_male_measurements,
  "create"
>["data"];
export type updateUserMaleMeasurement = Prisma.Args<
  typeof prisma.user_male_measurements,
  "update"
>["data"];
