import { Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type createManyLanguagesType = Prisma.Args<
  typeof prisma.user_languages,
  "createMany"
>["data"];
