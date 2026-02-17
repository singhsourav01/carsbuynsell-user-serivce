import { Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type createManySocialLinks = Prisma.Args<
  typeof prisma.user_social_links,
  "createMany"
>["data"];
