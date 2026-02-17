import { Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type createManyTalents = Prisma.Args<
  typeof prisma.custom_talents,
  "createMany"
>["data"];
