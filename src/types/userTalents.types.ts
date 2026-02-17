import { Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type createManyTalents = Prisma.Args<
  typeof prisma.user_talents,
  "createMany"
>["data"];
