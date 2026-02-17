import { Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type createManyVideoLinksType = Prisma.Args<
  typeof prisma.user_video_links,
  "createMany"
>["data"];
