import { ApprovalStatus, Prisma } from "@prisma/client";
import prisma from "../configs/prisma.config";

export type getAllUserQueryType = {
  search?: string;
  page?: string;
  page_size?: string;
  status?: ApprovalStatus;
};
export type getAllUserByAdminQueryType = {
  search?: string;
  page?: string;
  page_size?: string;
  status?: string;
};

export type updateUserType = Prisma.Args<typeof prisma.users, "update">["data"];
export type createUserType = Prisma.Args<typeof prisma.users, "create">["data"];
export interface talentFilterTypes {
  talent_id?: string;
  cities?: string[];
  min_age?: string;
  max_age?: string;
  min_height?: string;
  max_height?: string;
  page?: string;
  page_size?: string;
  search?: string;
}
