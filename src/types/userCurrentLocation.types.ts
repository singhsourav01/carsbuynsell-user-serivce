import { Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type creatCurrentLocation = Prisma.Args<
  typeof prisma.user_current_locations,
  "create"
>["data"];

export type updateCurrentLocation = Prisma.Args<
  typeof prisma.user_current_locations,
  "update"
>["data"];
