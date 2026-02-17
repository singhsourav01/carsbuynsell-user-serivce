import { Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type createManyStoreAddressType = Prisma.Args<
  typeof prisma.shop_address,
  "createMany"
>["data"];
