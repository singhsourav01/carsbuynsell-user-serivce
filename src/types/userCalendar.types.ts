import { Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type createUserCalendar = Prisma.Args<
  typeof prisma.user_calendar,
  "createMany"
>["data"];

export type updateUserCalendar = Prisma.Args<
  typeof prisma.user_calendar,
  "update"
>["data"];
