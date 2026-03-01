import { ApprovalStatus } from "@prisma/client";
import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";
import _ from "lodash";
import { API_ENDPOINTS, API_ERRORS, INTEGERS } from "../constants/app.constant";
import {
  getUserByPhonePick,
  talentDirectoryPick,
} from "../constants/user.constant";

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
import {
  getEmailBodyForChangingUserStatus,
  getLinkData,
} from "../utils/helper";
import SmsOtpRepository from "../repositories/smsOtp.repository";
import UserRepository from "../repositories/user.repository";
import UserPortfolioRepository from "../repositories/userPortfolio.repository";

class UserService {
  userRepository: UserRepository;
  userPortfolioRepository: UserPortfolioRepository;

  smsOtpRepository: SmsOtpRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.userPortfolioRepository = new UserPortfolioRepository();
    this.smsOtpRepository = new SmsOtpRepository();
  }
  create = async (data: createUserType) => {
    const user = await this.userRepository.create(data);
    return user;
  }
  createUser = async (data: createUserType) => {
    const user = await this.userRepository.getByEmailOrPhone(
      data.user_primary_phone,
      data.user_email || ""
    );
    if (user) {
      if (
        user.user_email === data.user_email &&
        user.user_primary_phone === data.user_primary_phone
      )
        throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.USER_EXIST);
      if (user.user_email === data.user_email)
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          API_ERRORS.USER_EXIST_WITH_EMAIL
        );
      else
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          API_ERRORS.USER_EXIST_WITH_PHONE
        );
    }
    const { ...rest } = data;
    return await this.userRepository.create(rest);
  };

  getAll = async (
    page?: string,
    page_size?: string,
    search?: string,
    status?: string,
    apiUrl?: string,
    user_id?: string,
    blocked?: Array<string>,
    query?: any
  ) => {
    const pageNumber = Number(page || "1");
    const take = Number(page_size || "10");
    const skip = (pageNumber - INTEGERS.ONE) * take;
    const users = await this.userRepository.getAll(
      take,
      skip,
      search,
      status,
      user_id,
      blocked,
      query
    );
    if (users.length === INTEGERS.ZERO)
      throw new ApiError(StatusCodes.NOT_FOUND, API_ERRORS.USERS_NOT_FOUND);

    const userData = await Promise.all(
      users.map(async (item: any) => {
        return {
          user_id: item.user_id,
          // user_profile_image:
          //   item.user_profile_image_file_id &&
          //   (await getFileById(item.user_profile_image_file_id))?.file_url,
        };
      })
    );

    const count = await this.userRepository.count(
      search,
      status,
      user_id,
      query
    );
    const link = getLinkData(pageNumber, take, count, apiUrl);
    return { data: userData, count, link };
  };

  updateUser1 = async (user_id: string) => {
    const data = {
      user_managed_by: null,
    };
    const user = await this.userRepository.update(user_id, data);
    return user;
  };
  
  updateUser = async (user_id: any, data: updateUserType) => {
    const user = await this.userRepository.getById(user_id);
    const phoneExists = data?.user_primary_phone
      ? await this.userRepository.getByPhone(data.user_primary_phone)
      : false;

    const emailExists = data?.user_email
      ? await this.userRepository.getByEmail(data.user_email)
      : false;

    if (!user)
      throw new ApiError(StatusCodes.NOT_FOUND, API_ERRORS.USER_NOT_FOUND);
    if (phoneExists && emailExists)
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        API_ERRORS.USER_EXISTS_WITH_PHONE_EMAIL
      );

    if (phoneExists)
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        API_ERRORS.USER_EXIST_WITH_PHONE
      );

    if (emailExists)
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        API_ERRORS.USER_EXIST_WITH_EMAIL
      );

    return await this.userRepository.update(user_id, data);
  };

  getUserDetailsByEmailOrPhone = async (user_details: any) => {
    const user = await this.userRepository.getByEmailOrPhone(
      user_details,
      user_details
    );

    if (!user)
      throw new ApiError(StatusCodes.NOT_FOUND, API_ERRORS.USER_NOT_FOUND);

    await this.userRepository.update(user.user_id, { is_first_login: false });

    return user;
  };
  getByPhone = async (user_phone: any) => {
    const user = await this.userRepository.getByPhone(user_phone);

    if (!user)
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        API_ERRORS.PHONE_NUMBER_DOSE_NOT_EXISTS
      );

    return user;
  };
  getByEmail = async (user_email: any) => {
    const user = await this.userRepository.getByEmail(user_email);

    if (!user)
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        API_ERRORS.EMAIL_DOSE_NOT_EXISTS
      );

    return user;
  };

  getUserByEmailOrPhone = async (user_details: string) => {
    const user = await this.userRepository.getByEmailOrPhone(
      user_details,
      user_details
    );
    return user;
  };

  createAuthUser = async (
    data: createUserType,
    user_portfolio: any,
  ) => {
    const user = await this.userRepository.create(data);
    if (user_portfolio?.length > INTEGERS.ZERO)
      this.userPortfolioRepository.deleteMany(user?.user_id);
    user_portfolio &&
      user_portfolio.length > INTEGERS.ZERO &&
      (await this.userPortfolioRepository.createMany(user_portfolio));

    return await this.userRepository.getById(user.user_id);
  };

  changeUserStatus = async (
    user_id: any,
    status: ApprovalStatus,
    reason: string
  ) => {
    const userExist = await this.userRepository.getById(user_id);
    if (!userExist)
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.USER_NOT_FOUND);

    if (userExist.user_admin_status === status)
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        API_ERRORS.USER_ALREADY +
        " " +
        userExist.user_admin_status.toLowerCase()
      );

    if (status === "APPROVED") {
      console.log("If Approve", status, userExist);
      await this.userRepository.undoDeleteById(user_id);
    } else if (status === "REJECTED") {
      // await this.userRepository.undoDeleteById(user_id);
      console.log("Reject by admin");

      // await sendSms({
      //   mobile_number: userExist.user_primary_phone,
      //   country_code: "+91",
      //   text: `Dear user your account is rejected by the admin.\nDue to "${reason}"\nPlease log in with your credentials, make the necessary changes, and resend the account for approval.`,
      // });
    }

    const user = await this.userRepository.changeUserStatus(user_id, {
      user_admin_status: status,
    });

    // await sendMail({
    //   subject: "Profile verification status",
    //   email: user.user_email || "",
    //   // body: getEmailBodyForChangingUserStatus(reason)[status],
    //   type: "general",
    // });
    return user;
  };

  deleteById = async (user_id: any) => {
    const userExist = await this.userRepository.getById(user_id);
    if (!userExist)
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.USER_NOT_FOUND);
    await this.userRepository.deleteUserDevices(user_id);
    return await this.userRepository.deleteById(user_id);
  };

  getShortUserById = async (user_id: string) => {
    const user = await this.userRepository.getShortById(user_id);
    if (!user)
      throw new ApiError(StatusCodes.NOT_FOUND, API_ERRORS.USER_NOT_FOUND);
  };

  createUserDevice = async (data: createUserDeviceType) => {
    return await this.userRepository.createUserDevice(data);
  };

  searchUser = async (search: string) => {
    return await this.userRepository.searchUser(search);
  };

  filterUser = async (
    male_requirement: male_requirement,
    female_requirement: female_requirement,
    other_requirement: other_requirement,
    location_requirement: location_requirement,
    is_nearby_locations: boolean,
    user_id: string,
    requirement_talent_id: string,
    // blocked: Array<string>
  ) => {
    return await this.userRepository.filterUser(
      male_requirement,
      female_requirement,
      other_requirement,
      location_requirement,
      is_nearby_locations,
      user_id,
      requirement_talent_id,
      // blocked
    );
  };

  logout = async (uld_id: any) => {
    return await this.userRepository.deleteUserDevice(uld_id);
  };

  getUserDevice = async (uld_id: any, user_id: any) => {
    return await this.userRepository.getUserDevice(uld_id, user_id);
  };

  updateUserDevice = async (uld_id: any, data: updateUserDeviceType) => {
    return await this.userRepository.updateUserDevice(uld_id, data);
  };

  getVerifyUser = async (user_id: any) => {
    return await this.userRepository.getById(user_id);
  };

  // talentDirectory = async (filters: talentFilterTypes) => {
  //   const { talents, count, link } = await this.userRepository.talentDirectory(
  //     filters
  //   );
  //   if (!talents)
  //     throw new ApiError(StatusCodes.BAD_GATEWAY, API_ERRORS.TALENTS_NOT_FOUND);

  //   const data = await Promise.all(
  //     talents.map(async (item: any) => {
  //       const data: any = _.pick(item, talentDirectoryPick);
  //       // data.user_profile_image =
  //       //   item.user_profile_image_file_id &&
  //       //   (await getFileById(item.user_profile_image_file_id))?.file_url;
  //       return data;
  //     })
  //   );
  //   return { data, count, link };
  // };

  getUserByPhone = async (phone: string) => {
    const user = await this.userRepository.getUserByPhone(phone);
    return user;
  };
  getUserByEmail = async (email: string) => {
    const user = await this.userRepository.getUserByEmail(email);
    return user;
  };

  getUserFcmTokens = async (user_id: any) => {
    const userDevices: any = await this.userRepository.getUserDevicesByUserId(
      user_id
    );

    return userDevices.map((item: any) => {
      return item.uld_fcm_token;
    });
  };

  getUserById = async (user_id: any) => {
    const user = await this.userRepository.getById(user_id);  
    if (!user)     throw new ApiError(StatusCodes.NOT_FOUND, API_ERRORS.USER_NOT_FOUND);
    return user;
  }

getUsersByIds = async (
  user_ids: string[],
  page: number,
  limit: number
) => {
  if (!user_ids?.length) {
    return {
      users: [],
      pagination: {
        total: 0,
        page,
        limit,
        totalPages: 0,
      },
    };
  }

  return this.userRepository.getUsersByIds(user_ids, page, limit);
};

  getManageUserByListing = async (user_id: string) => {
    const user = await this.userRepository.getUserByPhone(user_id);
    if (!user)
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.USER_NOT_FOUND);
    const userData: any = _.pick(user, getUserByPhonePick);
    // userData.user_profile_image =
    //   user.user_profile_image_file_id &&
    //   (await getFileById(user.user_profile_image_file_id))?.file_url;
    return userData;
  };
}

export default UserService;
