import { Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type createManyLocations = Prisma.Args<
  typeof prisma.user_locations,
  "createMany"
>["data"];
