import { Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type createManyModelAttributeType = Prisma.Args<
  typeof prisma.user_model_attribute,
  "createMany"
>["data"];
