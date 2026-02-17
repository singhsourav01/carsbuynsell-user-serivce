import { Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type createUserShopAddressesType = Prisma.Args<
  typeof prisma.shop_address,
  "createMany"
>["data"];

export type updateUserShopAddressesType = Prisma.Args<
  typeof prisma.shop_address,
  "updateMany"
>["data"];
