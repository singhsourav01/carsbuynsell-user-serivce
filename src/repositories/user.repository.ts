import { ApprovalStatus, Gender, Role } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { userDeepSelect, userSelect } from "../constants/prisma.constant";
import {
  female_requirement,
  location_requirement,
  male_requirement,
  other_requirement,
} from "../types/common.types";
import {
  createUserType,
  talentFilterTypes,
  updateUserType,
} from "../types/user.types";
import {
  createUserDeviceType,
  updateUserDeviceType,
} from "../types/userDevice.types";
import { getFilterUserQuery, getLinkData, queryHandler } from "../utils/helper";
import { subYears } from "date-fns";
import { API_ENDPOINTS, INTEGERS } from "../constants/app.constant";

class UserRepository {
  create = async (data: createUserType) => {
    return queryHandler(
      async () =>
        await prisma.users.create({
          data: {
            ...data,
            user_gender: data.user_gender ? data.user_gender : Gender.OTHER,
          },
          select: userSelect,
        })
    );
  };

  getAll = async (
    take: number,
    skip: number,
    search?: string,
    status?: string,
    user_id?: string,
    blocked_ids?: Array<string>,
    query?: any
  ) => {
    const { gender, location, talent } = query;
    const where: any = {
      user_role: Role.USER,
      user_id: {
        notIn: blocked_ids,
      },
    };
    if (user_id) {
      where.NOT = {
        user_id,
      };
    }
    if (search) {
      where.OR = [
        {
          user_full_name: { contains: search },
        },
        {
          user_email: { contains: search },
        },
        {
          user_primary_phone: { contains: search },
        },
      ];
    }
    if (gender) {
      where.user_gender = gender;
    }
    if (location) {
      where.user_locations = {
        some: {
          ul_city_id: location,
        },
      };
    }

    if (talent) {
      where.user_talents = {
        some: {
          ut_talent_id: talent,
        },
      };
    }

    if (status) where.user_admin_status = status;
    return queryHandler(
      async () =>
        await prisma.users.findMany({
          where,
          select: userSelect,
          take,
          skip,
          orderBy: {
            user_updated_at: "desc",
          },
        })
    );
  };
  getAllUsersOfAgency = async (
    take: number,
    skip: number,
    status?: ApprovalStatus,
    search?: string
  ) => {
    const where: any = {
      NOT: [
        {
          user_admin_status: ApprovalStatus.NONE,
        },
        {
          user_role: Role.ADMIN,
        },
      ],
      user_managed_by: {
        not: null,
      },
    };
    if (search) {
      where.OR = [
        {
          agency_name: { contains: search },
        },
        {
          user_email: { contains: search },
        },
      ];
    }
    if (status) where.user_admin_status = status;

    return queryHandler(
      async () =>
        await prisma.users.findMany({
          where,
          select: userSelect,
          take,
          skip,
        })
    );
  };

  countUser = async (status?: ApprovalStatus, search?: string) => {
    const where: any = {
      NOT: [
        {
          user_admin_status: ApprovalStatus.NONE,
        },
        {
          user_role: Role.ADMIN,
        },
      ],
      user_managed_by: {
        not: null,
      },
    };
    if (search) {
      where.OR = [
        {
          user_full_name: { contains: search },
        },
        {
          user_email: { contains: search },
        },
      ];
    }

    if (status) where.user_admin_status = status;
    return queryHandler(
      async () =>
        await prisma.users.count({
          where,
        })
    );
  };
  count = async (
    search?: string,
    status?: string,
    user_id?: string,
    query?: any
  ) => {
    const { gender, location, talent } = query;
    const where: any = {
      user_role: Role.USER,
    };

    if (user_id) {
      where.NOT = {
        user_id,
      };
    }

    if (search) {
      where.OR = [
        {
          user_full_name: { contains: search },
        },
        {
          user_email: { contains: search },
        },
      ];
    }

    if (gender) {
      where.user_gender = gender;
    }
    if (location) {
      where.user_locations = {
        some: {
          ul_city_id: location,
        },
      };
    }

    if (talent) {
      where.user_talents = {
        some: {
          ut_talent_id: talent,
        },
      };
    }
    if (status) where.user_admin_status = status;
    return queryHandler(
      async () =>
        await prisma.users.count({
          where,
        })
    );
  };
  getAllAgencies = async () => {
    return queryHandler(
      async () =>
        await prisma.users.findMany({
          where: {
            AND: [
              {
                agency_name: {
                  not: null,
                },
              },
              {
                agency_name: {
                  not: "",
                },
              },
            ],
          },
        })
    );
  };

  getById = async (id: string) => {
    return queryHandler(
      async () =>
        await prisma.users.findUnique({
          where: {
            user_id: id,
          },
          select: userDeepSelect,
        })
    );
  };

  getByIds = async (ids: string[]) => {
    return queryHandler(
      async () =>
        await prisma.users.findMany({
          where: {
            user_id: {
              in: ids, // Use the 'in' operator to filter by the list of user IDs
            },
          },
          select: userDeepSelect, // Select specific fields as per the 'userDeepSelect' object
        })
    );
  };

  update = async (user_id: string, data: updateUserType) => {
    console.log(data, " here is data");
    return queryHandler(
      async () =>
        await prisma.users.update({
          where: { user_id },
          data,
          select: userDeepSelect,
        })
    );
  };

  changeUserStatus = async (user_id: string, data: updateUserType) => {
    return queryHandler(
      async () =>
        await prisma.users.update({
          where: { user_id },
          data,
          select: userDeepSelect,
        })
    );
  };

  getByEmailOrPhone = async (
    user_primary_phone: string,
    user_email: string
  ) => {
    return queryHandler(
      async () =>
        await prisma.users.findFirst({
          where: { OR: [{ user_primary_phone }, { user_email }] },
          include: {
            user_talents: true,
          },
        })
    );
  };
  getByPhone = async (user_primary_phone: any) => {
    const user = await queryHandler(
      async () =>
        await prisma.users.findFirst({
          where: { user_primary_phone },
          select: {
            user_primary_phone: true,
          },
        })
    );
    return user ? user : false;
  };

  getByEmail = async (user_email: any) => {
    const user = await queryHandler(
      async () =>
        await prisma.users.findFirst({
          where: { user_email },
          select: {
            user_email: true,
            user_id: true,
          },
        })
    );
    return user ? user : false;
  };

  doesTalentExist = async (user_id: string) => {
    const checkTalentIds = new Set([
      "2689b9d9-1c87-4f7f-b001-38d914a09a0a",
      "465c143a-5952-450b-b832-2bbaeabc2535",
    ]);

    const userTalents = await prisma.user_talents.findMany({
      where: { ut_user_id: user_id },
      select: { ut_talent_id: true },
    });

    const matchingTalentIds = userTalents
      .map(({ ut_talent_id }) => ut_talent_id)
      .filter((id) => checkTalentIds.has(id));

    return matchingTalentIds;
  };

  deleteById = async (user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.users.update({
          where: { user_id },
          data: { user_is_deleted: true },
        })
    );
  };

  undoDeleteById = async (user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.users.update({
          where: { user_id },
          data: { user_is_deleted: false },
        })
    );
  };

  getShortById = async (user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.users.findUnique({
          where: { user_id },
        })
    );
  };

  createUserDevice = async (data: createUserDeviceType) => {
    return queryHandler(
      async () => await prisma.user_login_devices.create({ data })
    );
  };

  searchUser = async (search: string) => {
    return queryHandler(
      async () =>
        await prisma.users.findMany({
          where: {
            OR: [
              { user_full_name: { contains: search } },
              { user_email: { contains: search } },
            ],
          },
        })
    );
  };

  filterUser = async (
    male_requirement: male_requirement,
    female_requirement: female_requirement,
    other_requirement: other_requirement,
    location_requirement: location_requirement,
    is_nearby_locations: boolean,
    user_id: string,
    requirement_talent_id: string,
    blocked_ids: Array<string>
  ) => {
    const where = getFilterUserQuery(
      male_requirement,
      female_requirement,
      other_requirement,
      location_requirement,
      is_nearby_locations,
      user_id
    );

    const users = await queryHandler(async () =>
      prisma.users.findMany({
        where: {
          user_talents: {
            some: {
              ut_talent_id: {
                in: [
                  requirement_talent_id,
                  "4c2fb373-ff9d-4f4b-a2d0-4119261cb231",
                ],
              },
            },
          },
          user_id: {
            notIn: blocked_ids,
          },
        },
        include: {
          user_login_devices: {
            where: {
              uld_user_id: {
                not: user_id,
              },
            },
            orderBy: [
              { uld_device_name: "asc" },
              { uld_device_type: "asc" },
              { uld_created_at: "desc" },
            ],
          },
        },
      })
    );

    const processedUsers = users.map((user) => {
      const deviceMap = new Map();

      user.user_login_devices.forEach((device) => {
        const key = `${device.uld_device_name}-${device.uld_device_type}`;
        if (
          !deviceMap.has(key) ||
          device.uld_created_at > deviceMap.get(key).uld_created_at
        ) {
          deviceMap.set(key, device);
        }
      });

      return {
        ...user,
        user_login_devices: Array.from(deviceMap.values()),
      };
    });

    return processedUsers;
  };

  deleteUserDevice = async (uld_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_login_devices.delete({
          where: { uld_id },
        })
    );
  };

  deleteUserDevices = async (user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_login_devices.deleteMany({
          where: { uld_user_id: user_id },
        })
    );
  };

  getUserDevice = async (uld_id: string, user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_login_devices.findFirst({
          where: { uld_id, uld_user_id: user_id },
        })
    );
  };

  getUserDevicesByUserId = async (user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_login_devices.aggregateRaw({
          pipeline: [
            { $match: { uld_user_id: user_id } },
            {
              $sort: {
                uld_device_name: 1,
                uld_device_type: 1,
                uld_created_at: -1,
              },
            },
            {
              $group: {
                _id: {
                  deviceName: "$uld_device_name",
                  deviceType: "$uld_device_type",
                },
                document: { $first: "$$ROOT" },
              },
            },
            { $replaceRoot: { newRoot: "$document" } },
          ],
        })
    );
  };

  updateUserDevice = async (uld_id: string, data: updateUserDeviceType) => {
    return queryHandler(
      async () =>
        await prisma.user_login_devices.update({
          where: { uld_id },
          data,
        })
    );
  };

  talentDirectory = async (filters: talentFilterTypes) => {
    const pageNumber = Number(filters.page) || 1;
    const take = Number(filters.page_size) || 10;
    const skip = (pageNumber - INTEGERS.ONE) * take;

    const where: any = {
      NOT: {
        user_role: {
          in: [Role.ADMIN, Role.SUPER_ADMIN],
        },
      },
      user_full_name: {
        contains: filters.search,
        mode: "insensitive",
      },
      user_locations: filters?.cities
        ? {
            some: {
              ul_city_id: {
                in: filters?.cities,
              },
            },
          }
        : undefined,
      user_talents: filters.talent_id
        ? {
            some: {
              ut_talent_id: filters.talent_id,
            },
          }
        : undefined,
      ...(filters.min_age !== undefined &&
        filters.max_age !== undefined && {
          user_dob: {
            gte: new Date(
              new Date().setFullYear(
                new Date().getFullYear() - Number(filters.max_age)
              )
            ),
            lte: new Date(
              new Date().setFullYear(
                new Date().getFullYear() - Number(filters.min_age)
              )
            ),
          },
        }),
    };

    const allMatchingTalents = await queryHandler(
      async () =>
        await prisma.users.findMany({
          where,
        })
    );

    const heightFilteredTalents = allMatchingTalents.filter((talent) => {
      const userHeight = parseFloat(talent.user_height || ""); // Convert height to number
      return (
        (!filters.min_height || userHeight >= parseFloat(filters.min_height)) &&
        (!filters.max_height || userHeight <= parseFloat(filters.max_height))
      );
    });

    const paginatedTalents = heightFilteredTalents.slice(skip, skip + take);

    const count = heightFilteredTalents.length;

    const link = getLinkData(
      pageNumber,
      take,
      count,
      API_ENDPOINTS.TALENT_DIRECTORY
    );

    return { talents: paginatedTalents, count, link };
  };

  getUserByPhone = async (phone: string) => {
    return queryHandler(
      async () =>
        await prisma.users.findFirst({
          where: {
            OR: [
              { user_primary_phone: phone },
              { user_secondary_phone: phone },
            ],
            NOT: { user_role: Role.ADMIN },
          },
        })
    );
  };

  getAllDeletedUsers = async () => {
    return queryHandler(
      async () =>
        await prisma.users.findMany({
          where: {
            user_is_deleted: true,
            NOT: { user_role: Role.ADMIN },
          },
        })
    );
  };

  getUsersByIds = async (ids: string[]) => {
    return queryHandler(
      async () =>
        await prisma.users.findMany({
          where: {
            user_id: {
              in: ids, // Use the 'in' operator to filter by the list of user IDs
            },
          },
          select: {
            agency_name: true,
            user_bio: true,
            user_email: true,
            user_full_name: true,
            user_profile_image_file_id: true,
            user_id: true,
          }, // Select specific fields as per the 'userDeepSelect' object
        })
    );
  };

  getUserManagedBy = async (user_managed_by: string) => {
    return queryHandler(
      async () =>
        await prisma.users.findMany({
          where: {
            user_managed_by: user_managed_by,
          },
          select: {
            user_id: true,
            user_profile_image_file_id: true,
            user_talents: {
              select: {
                ut_talent_id: true,
                talent_category: true,
              },
            },
          },
        })
    );
  };
}

export default UserRepository;
