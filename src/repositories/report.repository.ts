import prisma from "../configs/prisma.config";
import { queryHandler } from "../utils/helper";
import { API_ENDPOINTS, INTEGERS } from "../constants/app.constant";
import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";

class ReportRepository {
  getReportTypes = async () => {
    return queryHandler(
      async () =>
        await prisma.user_report_type.findMany({
          orderBy: {
            created_at: "desc",
          },
          where: {
            is_deleted: false,
          },
        })
    );
  };

  reportAccountByUser = async (
    userId: string,
    reportUserId: string,
    reportType: string,
    reportDescription?: string
  ) => {
    return queryHandler(async () => {
      const existing = await prisma.reported_account.findFirst({
        where: {
          user_id: userId,
          reported_user_id: reportUserId,
        },
      });
      if (existing) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          "You already reported this user."
        );
      }

      // Check if reportType exists in user_report_type
      // Check if reportType exists in user_report_type based on srt_name
      const reportTypeExists = await prisma.user_report_type.findFirst({
        where: {
          srt_name: reportType, // Using srt_name instead of srt_id
        },
      });

      if (!reportTypeExists) {
        throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid report type.");
      }
      return await prisma.reported_account.create({
        data: {
          user_id: userId,
          reported_user_id: reportUserId,
          // report_type:reportType,
          report_type: reportTypeExists.srt_id, // Correctly use the srt_id here
          report_description: reportDescription || null, // Set description to null if not provided
        },
        include: {
          issue: {
            select: {
              srt_name: true,
            },
          },
        },
      });
    });
  };
  createReportIssueTypeRepository = async (srt_name: string) => {
    return queryHandler(
      async () =>
        await prisma.user_report_type.create({
          data: {
            srt_name,
          },
        })
    );
  };

  updateReportIssueTypeRepository = async (
    srt_id: string,
    srt_name: string
  ) => {
    return queryHandler(
      async () =>
        await prisma.user_report_type.update({
          where: {
            srt_id: srt_id, // Specify the condition for which record to update
          },
          data: {
            srt_name: srt_name, // Set the new srt_name value
          },
        })
    );
  };

  deleteReportIssueTypeRepository = async (srt_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_report_type.update({
          where: { srt_id },
          data: {
            is_deleted: true,
          },
        })
    );
  };
  checkIsReported = async (user_id: string, reported_user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.reported_account.findFirst({
          where: {
            user_id,
            reported_user_id,
          },
        })
    );
  };

  getAllReportedRepository = async (currentPage: number, pageSize: number) => {
    const response = await prisma.reported_account.groupBy({
      by: ["reported_user_id"],
      _count: true,
      orderBy: {
        _count: {
          reported_user_id: "desc",
        },
      },
      take: pageSize,
      skip: (currentPage - 1) * pageSize,
    });
    const totalCount = await prisma.reported_account.findMany({
      distinct: "reported_user_id",
    });

    return { response, totalCount: totalCount.length };
  };

  getUserWhoHasReportedRepository = async (
    currentPage: number,
    pageSize: number,
    reported_id: string
  ) => {
    const response = await prisma.reported_account.findMany({
      where: {
        reported_user_id: reported_id,
      },
      include: {
        issue: true,
      },
      take: pageSize,
      skip: (currentPage - 1) * pageSize,
    });
    const totalCount = await prisma.reported_account.findMany({
      where: {
        reported_user_id: reported_id,
      },
    });

    return { response, totalCount: totalCount.length };
  };
}

export default ReportRepository;
