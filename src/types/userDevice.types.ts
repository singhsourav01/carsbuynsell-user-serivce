import { Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type createUserDeviceType = Prisma.Args<
  typeof prisma.user_login_devices,
  "create"
>["data"];
export type updateUserDeviceType = Prisma.Args<
  typeof prisma.user_login_devices,
  "update"
>["data"];
