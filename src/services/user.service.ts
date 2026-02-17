import { ApprovalStatus } from "@prisma/client";
import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";
import _ from "lodash";
import {
  getAttributeById,
  getCityById,
  getCityByName,
  getCountryById,
  getLanguageById,
  getSocialAccountById,
  getStateById,
  getTalentById,
} from "../api/core.api";
import { getFileById, getFileByIds } from "../api/file.api";
import { sendMail, sendSms } from "../api/otp.api";
import { API_ENDPOINTS, API_ERRORS, INTEGERS } from "../constants/app.constant";
import {
  getUserByPhonePick,
  talentDirectoryPick,
} from "../constants/user.constant";
import SmsOtpRepository from "../repositories/smsOtp.repository";
import UserRepository from "../repositories/user.repository";
import UserLocationsRepository from "../repositories/userLocations.repository";
import UserPortfolioRepository from "../repositories/userPortfolio.repository";
import UserSocialLinksRepository from "../repositories/userSocialLinks.repository";
import UserTalentsRepository from "../repositories/userTalents.repository";
import UserVideoLinksRepository from "../repositories/userVideoLinks.repository";
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
import BlockRepository from "../repositories/block.repository";
import ReportRepository from "../repositories/report.repository";
import UserShopAddressesRepository from "../repositories/userShopAddress.repository";
import UserCalenderRepository from "../repositories/userCalender.repository";
import { sendNotification } from "../api/notification.api";
import { createUserByAgency } from "../api/auth.api";

class UserService {
  userRepository: UserRepository;
  userPortfolioRepository: UserPortfolioRepository;
  userSocialLinksRepository: UserSocialLinksRepository;
  userVideoLinksRepository: UserVideoLinksRepository;
  userTalentsRepository: UserTalentsRepository;
  userLocationRepository: UserLocationsRepository;
  smsOtpRepository: SmsOtpRepository;
  userBlockRepository: BlockRepository;
  reportRepository: ReportRepository;
  userShopAddressesRepository: UserShopAddressesRepository;
  userCalenderRepository: UserCalenderRepository;

  constructor() {
    this.userRepository = new UserRepository();
    this.userPortfolioRepository = new UserPortfolioRepository();
    this.userSocialLinksRepository = new UserSocialLinksRepository();
    this.userVideoLinksRepository = new UserVideoLinksRepository();
    this.userTalentsRepository = new UserTalentsRepository();
    this.userLocationRepository = new UserLocationsRepository();
    this.smsOtpRepository = new SmsOtpRepository();
    this.userBlockRepository = new BlockRepository();
    this.reportRepository = new ReportRepository();
    this.userShopAddressesRepository = new UserShopAddressesRepository();
    this.userCalenderRepository = new UserCalenderRepository();
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
    const { user_talents, ...rest } = data;
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
          user_profile_image:
            item.user_profile_image_file_id &&
            (await getFileById(item.user_profile_image_file_id))?.file_url,
          user_talents: await Promise.all(
            item.user_talents.map(async (item: any) => {
              return (
                item.ut_talent_id &&
                (await getTalentById(item.ut_talent_id))?.talent_name
              );
            })
          ),
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

  getById = async (user_id: string, self?: string) => {
    const block = await this.userBlockRepository.findExistingBlockedUser(
      self || "",
      user_id
    );

    const report = await this.reportRepository.checkIsReported(
      self || "",
      user_id
    );

    const user = await this.userRepository.getById(user_id);

    if (!user)
      throw new ApiError(StatusCodes.NOT_FOUND, API_ERRORS.USER_NOT_FOUND);
    const socialLinks = user?.user_social_links.map(async (item: any) => {
      return {
        ...item,
        uvl_social_account_data:
          item.usl_type_id && (await getSocialAccountById(item.usl_type_id)),
      };
    });
    const talents = user?.user_talents.map(async (item: any) => {
      return {
        ...item,
        uot_talent_data:
          item.ut_talent_id && (await getTalentById(item.ut_talent_id)),
      };
    });
    const customTalents = user?.custom_talents.map(async (item: any) => {
      return {
        ...item,
        uoc_talent_data:
          item.uct_talent_id && (await getTalentById(item.uct_talent_id)),
      };
    });
    const attributes = user?.user_model_attribute.map(async (item: any) => {
      return {
        ...item,
        uom_attribute_data:
          item.uma_model_attribute_id &&
          (await getAttributeById(item.uma_model_attribute_id)),
      };
    });
    console.log(attributes, " attributes");
    const data = user?.agency_users;
    const agencyUsers = await Promise.all(
      data?.map(async (item: any) => {
        return {
          user_id: item.user_id,
          user_profile_image:
            item.user_profile_image_file_id &&
            (await getFileById(item.user_profile_image_file_id))?.file_url,
          user_talents: await Promise.all(
            item.user_talents.map(async (item: any) => {
              return (
                item.ut_talent_id &&
                (await getTalentById(item.ut_talent_id))?.talent_name
              );
            })
          ),
        };
      })
    );
    const portfolio = user?.user_portfolio.map(async (item: any) => {
      return {
        ...item,
        uop_file: await getFileById(item.up_file_id),
      };
    });

    const userCalendar = await Promise.all(
      user?.user_calendar?.map(async (item) => {
        if (!item?.uc_city_id) return { ...item, uc_city_name: "" };

        const cityData = await getCityById(item.uc_city_id);
        let uc_city_name = cityData?.city_name || "";

        if (cityData?.city_name) {
          const cityList = await getCityByName(cityData.city_name);

          const matchedCity = cityList?.find(
            (city: any) => city.city_id === item.uc_city_id
          );

          if (matchedCity) {
            uc_city_name = `${matchedCity.city_name}, ${matchedCity.city_state?.state_name}, ${matchedCity.city_state?.state_country?.country_name}`;
          }
        }

        return {
          ...item,
          uc_city_name,
        };
      })
    );

    const languages = user?.user_languages?.map(async (item: any) => {
      return {
        ...item,
        ul_language_data:
          item.ul_language_id && (await getLanguageById(item.ul_language_id)),
      };
    });
    const userVideoLinks =
      user?.user_video_links?.map((item: any) => item.uvl_url) || [];

    const {
      user_profile_image_file_id,
      user_selfie_file_id,
      user_locations,
      ...userData
    } = user;
    const {
      custom_talents,
      user_calendar,
      user_video_links,
      agency_users,
      user_model_attribute,
      ...rest
    } = userData;
    console.log(
      "Just checking the awaited value",
      await Promise.all(attributes)
    );
    return {
      ...rest,
      is_blocked: !!block,
      is_reported: !!report,
      user_profile_image:
        user_profile_image_file_id &&
        (await getFileById(user_profile_image_file_id))?.file_url,
      user_selfie_image:
        user_selfie_file_id &&
        (await getFileById(user_selfie_file_id))?.file_url,
      user_social_links: await Promise.all(socialLinks),
      user_video_links: userVideoLinks,
      user_talents: await Promise.all(talents),
      custom_talents: await Promise.all(customTalents),
      user_calendar: await Promise.all(userCalendar),
      user_model_attribute: await Promise.all(attributes),
      user_portfolio: await Promise.all(portfolio),
      user_languages: await Promise.all(languages),
      agency_users: await Promise.all(agencyUsers),
      user_locations: await Promise.all(
        user_locations.map(async (location) => {
          return {
            ...location,
            ul_city_data: location.ul_city_id
              ? await getCityById(location.ul_city_id)
              : null,
            ul_state_data: location.ul_state_id
              ? await getStateById(location.ul_state_id)
              : null,
            ul_country_data: location.ul_country_id
              ? await getCountryById(location.ul_country_id)
              : null,
          };
        })
      ),
    };
  };
  updateUser1 = async (user_id: string) => {
    const data = {
      user_managed_by: null,
    };
    const user = await this.userRepository.update(user_id, data);
    return user;
  };
  updateUser = async (user_id: string, data: updateUserType) => {
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

  getUserDetailsByEmailOrPhone = async (user_details: string) => {
    const user = await this.userRepository.getByEmailOrPhone(
      user_details,
      user_details
    );

    if (!user)
      throw new ApiError(StatusCodes.NOT_FOUND, API_ERRORS.USER_NOT_FOUND);

    await this.userRepository.update(user.user_id, { is_first_login: false });

    return user;
  };
  getByPhone = async (user_primary_phone: string) => {
    const user = await this.userRepository.getByPhone(user_primary_phone);

    if (!user)
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        API_ERRORS.PHONE_NUMBER_DOSE_NOT_EXISTS
      );

    return user;
  };
  getByEmail = async (user_email: string) => {
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
    user_locations: any,
    user_talents: any,
    user_social_links: any,
    user_video_links: any,
    shop_address: any
  ) => {
    const user = await this.userRepository.create(data);

    if (shop_address?.length > INTEGERS.ZERO)
      this.userShopAddressesRepository.deleteMany(user?.user_id);
    if (user_portfolio?.length > INTEGERS.ZERO)
      this.userPortfolioRepository.deleteMany(user?.user_id);
    if (user_social_links?.length > INTEGERS.ZERO)
      this.userSocialLinksRepository.deleteMany(user?.user_id);
    if (user_video_links?.length > INTEGERS.ZERO)
      this.userVideoLinksRepository.deleteMany(user?.user_id);
    if (user_talents?.length > INTEGERS.ZERO)
      this.userTalentsRepository.deleteMany(user?.user_id);
    if (user_locations?.length > INTEGERS.ZERO)
      this.userLocationRepository.deleteMany(user?.user_id);

    shop_address &&
      shop_address.length > INTEGERS.ZERO &&
      (await this.userShopAddressesRepository.createMany(shop_address));
    user_portfolio &&
      user_portfolio.length > INTEGERS.ZERO &&
      (await this.userPortfolioRepository.createMany(user_portfolio));
    user_social_links &&
      user_social_links.length > INTEGERS.ZERO &&
      (await this.userSocialLinksRepository.createMany(user_social_links));
    user_video_links &&
      user_video_links.length > INTEGERS.ZERO &&
      (await this.userVideoLinksRepository.createMany(user_video_links));
    user_talents &&
      user_talents.length > INTEGERS.ZERO &&
      (await this.userTalentsRepository.createMany(user_talents));
    user_locations &&
      user_locations.length > INTEGERS.ZERO &&
      (await this.userLocationRepository.createMany(user_locations));

    return await this.userRepository.getById(user.user_id);
  };

  changeUserStatus = async (
    user_id: string,
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
      const country = await getCountryById(
        userExist.user_primary_country_id || ""
      );
      await sendSms({
        mobile_number: userExist.user_primary_phone,
        country_code: country?.country_phone_code,
        text: `Dear user your account is rejected by the admin.\nDue to "${reason}"\nPlease log in with your credentials, make the necessary changes, and resend the account for approval.`,
      });
    }

    const user = await this.userRepository.changeUserStatus(user_id, {
      user_admin_status: status,
    });

    await sendMail({
      subject: "Profile verification status",
      email: user.user_email || "",
      body: getEmailBodyForChangingUserStatus(reason)[status],
      type: "general",
    });
    return user;
  };

  deleteById = async (user_id: string) => {
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
    blocked: Array<string>
  ) => {
    return await this.userRepository.filterUser(
      male_requirement,
      female_requirement,
      other_requirement,
      location_requirement,
      is_nearby_locations,
      user_id,
      requirement_talent_id,
      blocked
    );
  };

  logout = async (uld_id: string) => {
    return await this.userRepository.deleteUserDevice(uld_id);
  };

  getUserDevice = async (uld_id: string, user_id: string) => {
    return await this.userRepository.getUserDevice(uld_id, user_id);
  };

  updateUserDevice = async (uld_id: string, data: updateUserDeviceType) => {
    return await this.userRepository.updateUserDevice(uld_id, data);
  };

  getVerifyUser = async (user_id: string) => {
    return await this.userRepository.getById(user_id);
  };

  talentDirectory = async (filters: talentFilterTypes) => {
    const { talents, count, link } = await this.userRepository.talentDirectory(
      filters
    );
    if (!talents)
      throw new ApiError(StatusCodes.BAD_GATEWAY, API_ERRORS.TALENTS_NOT_FOUND);

    const data = await Promise.all(
      talents.map(async (item) => {
        const data: any = _.pick(item, talentDirectoryPick);
        data.user_profile_image =
          item.user_profile_image_file_id &&
          (await getFileById(item.user_profile_image_file_id))?.file_url;
        return data;
      })
    );
    return { data, count, link };
  };

  getUserByPhone = async (phone: string) => {
    const user = await this.userRepository.getUserByPhone(phone);
    if (!user)
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.USER_NOT_FOUND);
    const userData: any = _.pick(user, getUserByPhonePick);
    userData.user_profile_image =
      user.user_profile_image_file_id &&
      (await getFileById(user.user_profile_image_file_id))?.file_url;
    return userData;
  };

  getUserFcmTokens = async (user_id: string) => {
    const userDevices: any = await this.userRepository.getUserDevicesByUserId(
      user_id
    );

    return userDevices.map((item: any) => {
      return item.uld_fcm_token;
    });
  };

  getAllUsersOfAgency = async (
    page?: string,
    page_size?: string,
    status?: ApprovalStatus,
    search?: string
  ) => {
    const pageNumber = Number(page || "1");
    const take = Number(page_size || "10");
    const skip = (pageNumber - INTEGERS.ONE) * take;

    const userData = await this.userRepository.getAllUsersOfAgency(
      take,
      skip,
      status,
      search
    );

    const promises = userData.map(async (item: any) => {
      const { user_profile_image_file_id, user_selfie_file_id, ...userData } =
        item;
      return {
        ...userData,
        user_profile_image:
          item.user_profile_image_file_id &&
          (await getFileById(item.user_profile_image_file_id))?.file_url,
        user_selfie_image:
          item.user_selfie_file_id &&
          (await getFileById(item.user_selfie_file_id))?.file_url,
      };
    });

    const users = await Promise.all(promises);
    const count = await this.userRepository.countUser(status, search);
    const link = getLinkData(pageNumber, take, count, API_ENDPOINTS.USERS);

    return { users, count, link };
  };

  getAllAgencies = async () => {
    const agencies = await this.userRepository.getAllAgencies();
    return agencies;
  };

  getAllAgenciesList = async () => {
    const agencies = await this.userRepository.getAllAgencies();

    const agencyList = agencies.map((agency) => ({
      user_id: agency.user_id,
      agency_name: agency.agency_name,
    }));

    return agencyList;
  };

  inviteUserEmail = async (data: any) => {
    const { model_id, user_email } = data;

    const getByEmail = await this.getByEmail(user_email);
    if (!getByEmail) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        API_ERRORS.EMAIL_DOSE_NOT_EXISTS
      );
    }
    const fcmTokens = await this.getUserFcmTokens(getByEmail?.user_id);
    const notification = await sendNotification({
      notification_user_id: model_id,
      notification_type_id: "86a265b1-1db0-4305-8251-5066490f3c35",
      notification_title: "Would you like to join our agency.",
      notification_data: {
        urm_user_email: user_email,
        urm_model_agency_id: model_id,
      },
      notification_recipients: [{ nr_user_id: getByEmail?.user_id }],
      notification_tokens: fcmTokens,
    });
    return data;
  };
  createUserByAgency = async (data: any) => {
    try {
      const user = await createUserByAgency(data);
      return user;
    } catch (error: any) {
      console.log(error?.response?.data?.message);

      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        error?.response?.data?.message
      );
    }
  };

  getUsersByIds = async (user_ids: string[]) => {
    const users = await this.userRepository.getUsersByIds(user_ids);

    if (!users?.length) return [];

    const fileIds = users
      .map((u: any) => u.user_profile_image_file_id)
      .filter(Boolean);

    const files = await getFileByIds(fileIds);

    const enrichedUsers = users.map((u: any) => {
      const file = files.find(
        (f: any) => f.file_id === u.user_profile_image_file_id
      );

      return {
        ...u,
        user_profile_image: file?.file_url || null,
      };
    });

    return enrichedUsers;
  };

  getManageUserByListing = async (user_id: string) => {
    const user = await this.userRepository.getUserByPhone(user_id);
    if (!user)
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.USER_NOT_FOUND);
    const userData: any = _.pick(user, getUserByPhonePick);
    userData.user_profile_image =
      user.user_profile_image_file_id &&
      (await getFileById(user.user_profile_image_file_id))?.file_url;
    return userData;
  };
}

export default UserService;
