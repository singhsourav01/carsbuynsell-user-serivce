import prisma from "../configs/prisma.config";
import { queryHandler } from "../utils/helper";
import { API_ENDPOINTS, INTEGERS } from "../constants/app.constant";

class BlockRepository {
  addToBlock = async (userId: string, blockUserId: string) => {
    return queryHandler(
      async () =>
        await prisma.blocked_accounts.create({
          data: {
            user_id: userId,
            blocked_user_id: blockUserId,
          },
        })
    );
  };

  unBlock = async (userId: string, blockUserId: string) => {
    return queryHandler(
      async () =>
        await prisma.blocked_accounts.delete({
          where: {
            user_id_blocked_user_id: {
              user_id: userId,
              blocked_user_id: blockUserId,
            },
          },
        })
    );
  };

  findExistingBlockedUser = async (userId: string, blockUserId: string) => {
    return queryHandler(
      async () =>
        await prisma.blocked_accounts.findFirst({
          where: {
            user_id: userId,
            blocked_user_id: blockUserId,
          },
        })
    );
  };

  getBlockedAccounts = async (
    userId: string,
    currentPage: number,
    pageSize: number,
    deletedUsers: string[] // List of strings representing deleted users
  ) => {
    return queryHandler(async () => {
      // Run both the findMany and count queries simultaneously
      const [response, totalCount] = await Promise.all([
        prisma.blocked_accounts.findMany({
          where: {
            user_id: userId,
            blocked_user_id: {
              notIn: deletedUsers, // Exclude blocked users who are in the deletedUsers list
            },
          },
          orderBy: {
            ri_created_at: "desc",
          },
          skip: (currentPage - INTEGERS.ONE) * pageSize,
          take: pageSize,
          select: {
            blocked_user_id: true,
          },
        }),
        prisma.blocked_accounts.count({
          where: {
            user_id: userId,
            blocked_user_id: {
              notIn: deletedUsers, // Exclude blocked users who are in the deletedUsers list
            },
          },
        }),
      ]);

      return { response, totalCount };
    });
  };

  getAllBlockedAccounts = async (userId: string) => {
    return queryHandler(async () => {
      // Run both the findMany and count queries simultaneously
      const [blocked, blocked_by] = await Promise.all([
        prisma.blocked_accounts.findMany({
          where: {
            user_id: userId,
          },
        }),
        prisma.blocked_accounts.findMany({
          where: {
            blocked_user_id: userId,
          },
        }),
      ]);

      return { blocked, blocked_by };
    });
  };
}

export default BlockRepository;
