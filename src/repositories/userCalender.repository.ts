import prisma from "../configs/prisma.config";
import {
  createUserCalendar,
  updateUserCalendar,
} from "../types/userCalendar.types";
import { queryHandler } from "../utils/helper";

class UserCalenderRepository {
  createMany = async (data: createUserCalendar) => {
    return queryHandler(
      async () => await prisma.user_calendar.createMany({ data })
    );
  };
  deleteMany = async (uc_user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_calendar.deleteMany({
          where: { uc_user_id },
        })
    );
  };
  getUserCalendarByMonthAndYear = async (
    user_id: string,
    year: number,
    month: number
  ) => {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 0, 23, 59, 59, 999);
    return await prisma.user_calendar.findMany({
      where: {
        uc_user_id: user_id,
        OR: [
          {
            uc_start_date: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            uc_end_date: {
              gte: startDate,
              lte: endDate,
            },
          },
          {
            AND: [
              { uc_start_date: { lte: startDate } },
              { uc_end_date: { gte: endDate } },
            ],
          },
        ],
      },
      orderBy: {
        uc_start_date: "asc",
      },
    });
  };
  getById = async (uc_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_calendar.findUnique({
          where: { uc_id },
        })
    );
  };
  delete = async (uc_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_calendar.delete({
          where: { uc_id },
        })
    );
  };

  update = async (uc_id: string, data: updateUserCalendar) => {
    return queryHandler(
      async () =>
        await prisma.user_calendar.update({
          where: { uc_id },
          data,
        })
    );
  };
}

export default UserCalenderRepository;
