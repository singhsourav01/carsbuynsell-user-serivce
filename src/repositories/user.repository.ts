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
    // blocked_ids: Array<string>
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
          user_id: {
            // notIn: blocked_ids,
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
    // return queryHandler(
    //   async () =>
    //     await prisma.user_login_devices.aggregateRaw({
    //       pipeline: [
    //         { $match: { uld_user_id: user_id } },
    //         {
    //           $sort: {
    //             uld_device_name: 1,
    //             uld_device_type: 1,
    //             uld_created_at: -1,
    //           },
    //         },
    //         {
    //           $group: {
    //             _id: {
    //               deviceName: "$uld_device_name",
    //               deviceType: "$uld_device_type",
    //             },
    //             document: { $first: "$$ROOT" },
    //           },
    //         },
    //         { $replaceRoot: { newRoot: "$document" } },
    //       ],
    //     })
    // );
    return null;
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

  getUserByPhone = async (phone: string) => {
    return queryHandler(
      async () =>
        await prisma.users.findFirst({
          where: {
            OR: [
              { user_primary_phone: phone },
            ],
          },
        })
    );
  };

  
  getUserByEmail = async (email: string) => {
    return queryHandler(
      async () =>
        await prisma.users.findFirst({
          where: {
            OR: [
              { user_email: email },
            ],
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
            user_bio: true,
            user_email: true,
            user_full_name: true,
            user_profile_image_file_id: true,
            user_id: true,
          }, // Select specific fields as per the 'userDeepSelect' object
        })
    );
  };

}

export default UserRepository;
