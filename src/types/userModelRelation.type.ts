import { Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type createUserModelRelation = Prisma.Args<
  typeof prisma.user_model_relation,
  "create"
>["data"];
export type updateUserModelRelation = Prisma.Args<
  typeof prisma.user_model_relation,
  "update"
>["data"];
