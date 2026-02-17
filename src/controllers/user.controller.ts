import { getUserManagedBy } from "./../api/auth.api";
import { ApprovalStatus, Gender, LocationType } from "@prisma/client";
import {
  ApiError,
  ApiResponse,
  asyncHandler,
} from "common-microservices-utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  API_ENDPOINTS,
  API_ERRORS,
  INTEGERS,
  STRINGS,
} from "../constants/app.constant";
import OtpService from "../services/otp.service";
import UserService from "../services/user.service";
import UserLocationsService from "../services/userLocations.service";
import UserPortfolioService from "../services/userPortfolio.service";
import UserSocialLinksService from "../services/userSocialLinks.service";
import UserTalentService from "../services/userTalents.service";
import UserVideoLinksService from "../services/userVideoLinks.service";
import { getAllUserQueryType, talentFilterTypes } from "../types/user.types";
import { API_RESPONSES } from "./../constants/app.constant";
import UserLanguagesService from "../services/userLanguages.service";
import UserBrandMeasurementService from "../services/userBrandMesurement";
import UserCurrentLocationsService from "../services/userCurrentLocation.service";
import UserMaleMeasurementService from "../services/userMaleMeasurement.service";
import UserFemaleMeasurementService from "../services/userFemaleMeasurement.service";
import BlockAndReportService from "../services/block.service";
import UserTalentsRepository from "../repositories/userTalents.repository";
import UserCustomTalentService from "../services/userCustomTalent.service";
import StoreAddressRepository from "../repositories/storeAddress.repository";
import ModelAttributeRepository from "../repositories/modelAttribute.repository";
import UserCalendarService from "../services/userCalender.service";
import UserModelRelation from "../services/userModelRelation.service";
import { createUserByAgency } from "../api/auth.api";
import UserLocationsRepository from "../repositories/userLocations.repository";

interface AuthenticatedRequest extends Request {
  user?: any;
}

class UserController {
  userService: UserService;
  userTalentService: UserTalentService;
  userPortfolioService: UserPortfolioService;
  userSocialLinksService: UserSocialLinksService;
  userVideoLinksService: UserVideoLinksService;
  userLocationsService: UserLocationsService;
  userLanguageService: UserLanguagesService;
  otpService: OtpService;
  userMaleMeasurementService: UserMaleMeasurementService;
  userFemaleMeasurementService: UserFemaleMeasurementService;
  userBrandMeasurementService: UserBrandMeasurementService;
  userCurrentLocationService: UserCurrentLocationsService;
  blockAndReportService: BlockAndReportService;
  userTalentsRepository: UserTalentsRepository;
  userCustomTalentService: UserCustomTalentService;
  storeAddressRepository: StoreAddressRepository;
  modelAttributeRepository: ModelAttributeRepository;
  userCalendarService: UserCalendarService;
  userModelRelation: UserModelRelation;
  userLocationsRepository: UserLocationsRepository;

  constructor() {
    this.userService = new UserService();
    this.userTalentService = new UserTalentService();
    this.userPortfolioService = new UserPortfolioService();
    this.userSocialLinksService = new UserSocialLinksService();
    this.userVideoLinksService = new UserVideoLinksService();
    this.userLocationsService = new UserLocationsService();
    this.userLanguageService = new UserLanguagesService();
    this.otpService = new OtpService();
    this.userBrandMeasurementService = new UserBrandMeasurementService();
    this.userCurrentLocationService = new UserCurrentLocationsService();
    this.userMaleMeasurementService = new UserMaleMeasurementService();
    this.userFemaleMeasurementService = new UserFemaleMeasurementService();
    this.blockAndReportService = new BlockAndReportService();
    this.userTalentsRepository = new UserTalentsRepository();
    this.userCustomTalentService = new UserCustomTalentService();
    this.storeAddressRepository = new StoreAddressRepository();
    this.modelAttributeRepository = new ModelAttributeRepository();
    this.userCalendarService = new UserCalendarService();
    this.userModelRelation = new UserModelRelation();
    this.userLocationsRepository = new UserLocationsRepository();
  }

  create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {});

  blockUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { blocked_user_id } = req.body;

    const { user_id } = req.user;

    const response = await this.blockAndReportService.blockAccountService(
      user_id,
      blocked_user_id
    );
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, response.isBlock, response.message)
      );
  });

  unBlockUser = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { blocked_user_id } = req.body;
      const { user_id } = req.user;
      const response = await this.blockAndReportService.unblockedAccountService(
        user_id,
        blocked_user_id
      );
      return res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, null, response.message));
    }
  );

  getBlockedAccount = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { user_id } = req.user;

      // Parse and set defaults for page and page_size
      const page =
        typeof req.query.page === "string" ? parseInt(req.query.page, 10) : 1;
      const page_size =
        typeof req.query.page_size === "string"
          ? parseInt(req.query.page_size, 10)
          : 10;

      const responseData =
        await this.blockAndReportService.getBlockedAccountServices(
          user_id,
          page?.toString(),
          page_size?.toString()
        );

      res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(
            StatusCodes.OK,
            responseData.users,
            API_RESPONSES.USER_DATA_FETCHED,
            undefined,
            responseData.totalCount
          )
        );
    }
  );

  reportUserController = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { user_id } = req.user;
      const { reported_user_id, report_type, report_description } = req.body;
      const createReport = await this.blockAndReportService.reportAccountByUser(
        user_id,
        reported_user_id.toString(),
        report_type.toString(),
        report_description || null
      );
      res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(StatusCodes.OK, createReport, API_RESPONSES.REPORTED)
        );
    }
  );

  //get stylist report types
  getReportTypesController = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const allIssues = await this.blockAndReportService.getReportTypeService();

      // Respond to the client with a JSON containing the fetched report issue types and success message
      res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(
            StatusCodes.OK,
            allIssues,
            API_RESPONSES.ISSUE_TYPES_FETCHED
          )
        );
    }
  );

  getAllUsers = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { search, page, page_size }: any = req.query;
      const { user_id } = req.user;
      const { blocked_by_ids, blocked_ids } =
        await this.blockAndReportService.getAllBlockedAccounts(user_id);
      const data = await this.userService.getAll(
        page,
        page_size,
        search,
        ApprovalStatus.APPROVED,
        API_ENDPOINTS.USERS,
        user_id,
        [...blocked_by_ids, ...blocked_ids],
        req.query
      );

      return res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(StatusCodes.OK, data, API_RESPONSES.USERS_FETCHED)
        );
    }
  );

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { self_id }: { self_id?: string } = req.query;
    const { user_id } = req.params;

    const user = await this.userService.getById(user_id, self_id);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, user, API_RESPONSES.USER_DATA_FETCHED)
      );
  });

  getUserProfile = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { user_id } = req.user;
      const user = await this.userService.getById(user_id);
      return res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(StatusCodes.OK, user, API_RESPONSES.USER_DATA_FETCHED)
        );
    }
  );

  updateUser = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const user = req.body;
      console.log(req.body, "here is req body when updated");
      if (
        !user ||
        Object.values(user).filter((item) => item !== undefined).length ===
          INTEGERS.ZERO
      ) {
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          API_ERRORS.PLEASE_PROVIDE_MIN_ONE_FIELD
        );
      }
      const { user_id } = req.user;

      const seen = new Set();
      console.log(user?.user_model_attribute, " check here sourav singh");
      const modelAttribute = user?.user_model_attribute
        ?.filter((item: any) => {
          if (seen.has(item.uma_model_attribute_id)) return false;
          seen.add(item.uma_model_attribute_id);
          return true;
        })
        .map((item: any) => ({
          uma_user_id: user_id,
          uma_model_attribute_id: item.uma_model_attribute_id,
          uma_type: item.uma_type,
        }));

      const designerTalents = user?.designer_talents?.map((item: any) => {
        return {
          uct_user_id: user_id,
          uct_talent_id: item.talent_id,
          talent_category: "DESIGNER",
        };
      });
      const photographerTalents = user?.photographer_talents?.map(
        (item: any) => {
          return {
            uct_user_id: user_id,
            uct_talent_id: item.talent_id,
            talent_category: "PHOTOGRAPHER",
          };
        }
      );
      const storeAddress = user?.store_address?.map((item: any) => {
        return {
          sa_user_id: user_id,
          sa_address: item?.sa_address,
          sa_type: item?.store_type || "DESIGNER",
        };
      });
      const studioAddress = user?.studio_address?.map((item: any) => {
        return {
          sa_user_id: user_id,
          sa_address: item?.sa_address,
          sa_type: item?.store_type || "PHOTOGRAPHER",
        };
      });
      const studioAddress1 = user?.studio_address1?.map((item: any) => {
        return {
          sa_user_id: user_id,
          sa_address: item?.sa_address,
          sa_type: item?.store_type || "STUDIO",
        };
      });
      const customTalents = user?.talent_ids?.map((item: any) => {
        return {
          ut_user_id: user_id,
          ut_talent_id: item.talent_id,
          talent_category: item.custom_talents,
        };
      });

      const agencyAddress = user?.agency_address?.map((item: any) => {
        return {
          sa_user_id: user_id,
          sa_address: item?.sa_address,
          sa_type: item?.store_type || "AGENCY",
        };
      });
      if (modelAttribute) {
        await this.modelAttributeRepository.deleteMany(user_id);
      }
      if (storeAddress || studioAddress || studioAddress1 || agencyAddress) {
        await this.storeAddressRepository.deleteMany(user_id);
      }
      if (photographerTalents || designerTalents) {
        await this.userCustomTalentService.deleteTalents(user_id);
      }
      if (user?.designer_talents?.length > 0) {
        await this.userCustomTalentService.createTalents(
          user_id,
          designerTalents
        );
      }
      if (user?.photographer_talents?.length > 0) {
        await this.userCustomTalentService.createTalents(
          user_id,
          photographerTalents
        );
      }
      if (modelAttribute?.length > 0) {
        await this.modelAttributeRepository.createMany(modelAttribute);
      }
      if (storeAddress?.length > 0 && user?.has_store) {
        await this.storeAddressRepository.createMany(storeAddress);
      }
      if (agencyAddress?.length > 0 && user?.has_agency) {
        await this.storeAddressRepository.createMany(agencyAddress);
      }
      if (studioAddress?.length > 0 && user?.has_studio) {
        await this.storeAddressRepository.createMany(studioAddress);
      }
      if (studioAddress1?.length > 0 && user?.has_studio1) {
        await this.storeAddressRepository.createMany(studioAddress1);
      }
      await this.userTalentService.createTalents(user_id, customTalents);
      await this.userPortfolioService.createPortfolio(
        user_id,
        user?.portfolio_ids
      );
      await this.userSocialLinksService.createSocialLinks(
        user_id,
        user?.social_links
      );
      await this.userVideoLinksService.createVideoLinks(
        user_id,
        user?.video_links
      );
      await this.userLocationsService.createLocations(user_id, user?.locations);

      await this.userLanguageService.createLanguages(user_id, user?.languages);

      if (
        user.talent_ids?.includes("09333f81-b41a-4ff1-b490-19c570105eba") ||
        user?.talent_ids?.includes("2689b9d9-1c87-4f7f-b001-38d914a09a0a") ||
        user?.talent_ids?.includes("3ca74d38-dc78-43e7-9f3a-9c8342698f8d")
      ) {
        if (user.gender === Gender.MALE) {
          await this.userMaleMeasurementService.createMeasurement(
            user_id,
            user.measurement
          );
        } else {
          await this.userFemaleMeasurementService.createMeasurement(
            user_id,
            user.measurement
          );
        }
        await this.userBrandMeasurementService.createMeasurement(
          user_id,
          user.brand_measurement
        );
      }

      const updatedUser = await this.userService.updateUser(user_id, {
        user_full_name: user?.full_name,
        user_primary_phone: user.phone,
        user_email: user.email,
        user_gender: user?.gender,
        user_bio: user?.bio,
        user_dob: user?.dob,
        user_profile_image_file_id: user?.profile_image_file_id,
        user_selfie_file_id: user?.selfie_file_id,
        user_admin_status:
          user?.is_private_user != null
            ? ApprovalStatus.APPROVED
            : ApprovalStatus.PENDING,
        user_height: user?.height,
        user_male_garments: user?.user_male_garments,
        is_private_user: user?.is_private_user,
        has_store: user?.has_store,
        has_studio: user?.has_studio,
        has_studio1: user?.has_studio1,
        has_agency: user.has_agency,
        user_female_garments: user?.user_female_garments,
        user_managed_by: user?.user_managed_by,
        agency_name: user?.agency_name,
      });

      return res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(
            StatusCodes.OK,
            updatedUser,
            API_RESPONSES.USER_DATA_FETCHED
          )
        );
    }
  );

  getUserDetailsByEmailOrPhone = asyncHandler(
    async (req: Request, res: Response) => {
      const { user_details } = req.params;
      const user = await this.userService.getUserDetailsByEmailOrPhone(
        user_details
      );
      return res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(StatusCodes.OK, user, API_RESPONSES.USER_DATA_FETCHED)
        );
    }
  );

  getByPhone = asyncHandler(async (req: Request, res: Response) => {
    const { user_id } = req.params;
    const user = await this.userService.getByPhone(user_id);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          { ...user },
          API_RESPONSES.USER_DATA_FETCHED
        )
      );
  });

  getByEmail = asyncHandler(async (req: Request, res: Response) => {
    const { user_id } = req.params;
    const user = await this.userService.getByEmail(user_id);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          { ...user },
          API_RESPONSES.USER_DATA_FETCHED
        )
      );
  });

  verifyUser = asyncHandler(async (req: Request, res: Response) => {
    const user = req.body;
    console.log(user, " verifyUser data");
    const { user_id } = req.params;
    const userData = {
      user_selfie_file_id: user?.selfie_id,
      agency_name: user?.agency_name,
      user_profile_image_file_id: user?.profile_image_id,
      user_bio: user?.bio,
      user_admin_status: ApprovalStatus.PENDING,
      user_dob: user?.dob,
      user_gender: user?.gender,
      user_height: user?.height,
      user_created_by_admin: user?.created_by_admin,
      has_store: user.has_store,
      has_studio: user.has_studio,
      has_agency: user.has_agency,
      has_studio1: user.has_studio1,
      is_private_user: user?.is_private_user,
      user_male_garments: user?.male_garments,
      user_female_garments: user?.female_garments,
      user_managed_by: user.user_managed_by,
    };
    const locationData = user.address?.map((address: any) => ({
      ul_user_id: user_id,
      ul_country_id: address.country_id,
      ul_state_id: address.state_id,
      ul_city_id: address.city_id,
      ul_lat: address.lat,
      ul_long: address.long,
      ul_address: address.address,
      ul_location_type: address.type,
    }));
    const agencyAddress = user?.agency_address?.map((item: any) => {
      return {
        sa_user_id: user_id,
        sa_address: item?.sa_address,
        sa_type: item?.store_type || "AGENCY",
      };
    });
    const modelAttribute = user?.user_model_attribute?.map((item: any) => {
      return {
        uma_user_id: user_id,
        uma_model_attribute_id: item.uma_model_attribute_id,
        uma_type: item.uma_type,
      };
    });

    const storeAddress = user?.store_address?.map((item: any) => {
      return {
        sa_user_id: user_id,
        sa_address: item?.sa_address,
        sa_type: "DESIGNER",
      };
    });

    const studioAddress = user?.studio_address?.map((item: any) => {
      return {
        sa_user_id: user_id,
        sa_address: item?.sa_address,
        sa_type: "PHOTOGRAPHER",
      };
    });
    const studioAddress1 = user?.studio_address1?.map((item: any) => {
      return {
        sa_user_id: user_id,
        sa_address: item?.sa_address,
        sa_type: "STUDIO",
      };
    });
    const designerTalents = user?.designer_talents?.map((item: any) => {
      return {
        uct_user_id: user_id,
        uct_talent_id: item.talent_id,
        talent_category: "DESIGNER",
      };
    });
    const photographerTalents = user?.photographer_talents?.map((item: any) => {
      return {
        uct_user_id: user_id,
        uct_talent_id: item.talent_id,
        talent_category: "PHOTOGRAPHER",
      };
    });

    await this.modelAttributeRepository.deleteMany(user_id);
    await this.userCustomTalentService.deleteTalents(user_id);
    await this.userTalentsRepository.deleteMany(user_id);
    if (locationData) await this.userLocationsRepository.deleteMany(user_id);

    if (storeAddress || studioAddress || studioAddress1 || agencyAddress)
      await this.storeAddressRepository.deleteMany(user_id);

    if (agencyAddress?.length > 0 && user?.has_agency) {
      await this.storeAddressRepository.createMany(agencyAddress);
    }
    if (storeAddress?.length > 0 && user?.has_store) {
      await this.storeAddressRepository.createMany(storeAddress);
    }
    if (studioAddress?.length > 0 && user?.has_studio) {
      await this.storeAddressRepository.createMany(studioAddress);
    }
    if (studioAddress1?.length > 0 && user?.has_studio1) {
      await this.storeAddressRepository.createMany(studioAddress1);
    }
    if (modelAttribute?.length > 0) {
      await this.modelAttributeRepository.createMany(modelAttribute);
    }
    const userTalent = user?.user_talent?.map((item: any) => {
      return {
        ut_user_id: user_id,
        ut_talent_id: item,
      };
    });
    if (locationData?.length > 0)
      await this.userLocationsRepository.createMany(locationData);

    if (userTalent?.length > 0) {
      await this.userTalentsRepository.createMany(userTalent);
    }
    if (user?.designer_talents?.length > 0) {
      await this.userCustomTalentService.createTalents(
        user_id,
        designerTalents
      );
    }
    if (user?.photographer_talents?.length > 0) {
      await this.userCustomTalentService.createTalents(
        user_id,
        photographerTalents
      );
    }
    await this.userPortfolioService.createPortfolio(
      user_id,
      user?.portfolio_ids
    );
    await this.userSocialLinksService.createSocialLinks(
      user_id,
      user?.social_links
    );
    await this.userVideoLinksService.createVideoLinks(
      user_id,
      user?.video_links
    );
    await this.userLocationsService.createLocations(user_id, user.locations);
    const userVerification = await this.userService.updateUser(
      user_id,
      userData
    );

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          userVerification,
          API_RESPONSES.USER_VERIFICATION_REQUESTED
        )
      );
  });

  updatePhone = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { phone, otp } = req.body;
      const { user_id } = req.user;
      const userExist = await this.userService.getUserByEmailOrPhone(phone);
      if (userExist)
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          API_ERRORS.USER_EXIST_WITH_PHONE
        );
      await this.userService.getShortUserById(user_id);
      const smsOtp = await this.otpService.getPhoneOtp(phone, otp);
      const user = await this.userService.updateUser(user_id, {
        user_primary_phone: phone,
      });
      await this.otpService.updateSms(smsOtp.so_id, { so_is_expired: true });
      return res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(StatusCodes.OK, user, API_RESPONSES.PHONE_UPDATED)
        );
    }
  );

  updateEmail = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { email, otp } = req.body;
      const { user_id } = req.user;
      const userExist = await this.userService.getUserByEmailOrPhone(email);
      if (userExist)
        throw new ApiError(
          StatusCodes.BAD_REQUEST,
          API_ERRORS.USER_EXIST_WITH_EMAIL
        );
      await this.userService.getShortUserById(user_id);
      const emailOtp = await this.otpService.getEmailOtp(email, otp);
      const user = await this.userService.updateUser(user_id, {
        user_email: email,
      });
      await this.otpService.updateEmail(emailOtp.eo_id, {
        eo_is_expired: true,
      });
      return res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(StatusCodes.OK, user, API_RESPONSES.EMAIL_UPDATED)
        );
    }
  );

  createUserDevice = asyncHandler(async (req: Request, res: Response) => {
    const device = await this.userService.createUserDevice(req.body);
    return res
      .status(StatusCodes.CREATED)
      .json(
        new ApiResponse(
          StatusCodes.CREATED,
          device,
          API_RESPONSES.USER_DEVICE_CREATED
        )
      );
  });

  searchUser = asyncHandler(async (req: Request, res: Response) => {
    const { search } = req.query;
    if (!search) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        API_ERRORS.SEARCH_IS_REQUIRED
      );
    }
    const users = await this.userService.searchUser(String(search));
    if (users?.length === INTEGERS.ZERO)
      throw new ApiError(StatusCodes.NOT_FOUND, API_ERRORS.USERS_NOT_FOUND);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, users, API_RESPONSES.USERS_FETCHED)
      );
  });

  filterUser = asyncHandler(async (req: Request, res: Response) => {
    const {
      male_requirement,
      female_requirement,
      other_requirement,
      location_requirement,
      is_nearby_locations,
      user_id,
      requirement_talent_id,
    } = req.body;
    const { blocked_by_ids, blocked_ids } =
      await this.blockAndReportService.getAllBlockedAccounts(user_id);
    const users = await this.userService.filterUser(
      male_requirement,
      female_requirement,
      other_requirement,
      location_requirement,
      is_nearby_locations,
      user_id,
      requirement_talent_id,
      [...blocked_ids, ...blocked_by_ids]
    );

    if (users.length === INTEGERS.ZERO)
      throw new ApiError(StatusCodes.NOT_FOUND, API_ERRORS.USERS_NOT_FOUND);

    const user_ids = users.map((item) => {
      return {
        nr_user_id: item.user_id,
      };
    });

    const tokens = users.reduce((result: string[], item) => {
      if (item.user_id !== user_id) {
        const fcm = item.user_login_devices.map(
          (element) => element.uld_fcm_token
        );
        return [...result, ...fcm];
      }
      return result;
    }, []);

    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          { user_ids, tokens },
          API_RESPONSES.USERS_FETCHED
        )
      );
  });

  resetPassword = asyncHandler(async (req, res) => {
    const { user_id } = req.params;
    const { password } = req.body;
    const user = await this.userService.updateUser(user_id, {
      user_password: password,
    });
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          user,
          API_RESPONSES.USER_UPDATED_SUCCESSFULLY
        )
      );
  });

  logout = asyncHandler(async (req: Request, res: Response) => {
    const { uld_id } = req.params;
    await this.userService.logout(uld_id);
    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, {}, API_RESPONSES.LOGOUT));
  });

  getUserDevice = asyncHandler(async (req: Request, res: Response) => {
    const { uld_id } = req.params;
    const { user_id } = req.query;
    const userDevice = await this.userService.getUserDevice(
      uld_id,
      String(user_id)
    );
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          userDevice,
          API_RESPONSES.USER_DEVICE_FETCHED
        )
      );
  });

  updateUserDevice = asyncHandler(async (req: Request, res: Response) => {
    const { access_token, refresh_token } = req.body;
    const { uld_id } = req.params;
    const userDevice = await this.userService.updateUserDevice(uld_id, {
      uld_access_token: access_token,
      uld_refresh_token: refresh_token,
    });
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          userDevice,
          API_RESPONSES.USER_DEVICE_UPDATED
        )
      );
  });

  getVerifyUser = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { user_id } = req.user;
      const user = await this.userService.getVerifyUser(user_id);
      return res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(StatusCodes.OK, user, API_RESPONSES.USERS_FETCHED)
        );
    }
  );

  talentDirectory = asyncHandler(async (req: Request, res: Response) => {
    const {
      talent_id,
      cities,
      min_height,
      max_height,
      min_age,
      max_age,
      page,
      page_size,
      search,
    }: talentFilterTypes = req.query;
    const talents = await this.userService.talentDirectory({
      talent_id: talent_id,
      cities: cities,
      min_height: min_height,
      max_height: max_height,
      min_age: min_age,
      max_age: max_age,
      page: page,
      page_size: page_size,
      search,
    });
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, talents, API_ERRORS.TALENT_FETCHED)
      );
  });

  getUserByPhone = asyncHandler(async (req: Request, res: Response) => {
    const { phone } = req.query;
    const user = await this.userService.getUserByPhone(String(phone));
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, user, API_RESPONSES.USER_DATA_FETCHED)
      );
  });

  getUserFcmTokens = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const tokens = await this.userService.getUserFcmTokens(id);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          tokens,
          API_RESPONSES.TOKENS_FETCHED_SUCCESSFULLY
        )
      );
  });

  addUserCurrentLocation = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { user_id } = req.user;
      const tokens = await this.userCurrentLocationService.createLocations(
        user_id,
        {
          address: req.body.address,
          lat: req.body.lat,
          long: req.body.long,
        }
      );
      return res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(
            StatusCodes.OK,
            tokens,
            API_RESPONSES.USER_CURRENT_LOCATION
          )
        );
    }
  );

  getAllBlockedAccounts = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      const tokens = await this.blockAndReportService.getAllBlockedAccounts(id);
      return res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(
            StatusCodes.OK,
            tokens,
            API_RESPONSES.USER_CURRENT_LOCATION
          )
        );
    }
  );
  generateDeepLink = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const user = await this.userService.getById(req.user.user_id);
      const deepLink = `myapp://search-option-view?phone=${user.user_primary_phone}`;

      res.json({ deepLink });
    }
  );
  redirectDeepLink = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const user = await this.userService.getById(req.user.user_id);

      const universalLink = `https://backend.dreamcatcherstalents.com/user/search-option-view?phone=${user.user_primary_phone}`;

      res.redirect(universalLink);
    }
  );

  getUserCalendarByMonthAndYear = asyncHandler(
    async (req: Request, res: Response) => {
      const { month, year } = req.query;
      const { user_id } = req.params;
      const user = await this.userCalendarService.getUserCalendarByMonthAndYear(
        user_id,
        Number(year),
        Number(month)
      );
      return res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(
            StatusCodes.OK,
            user,
            API_RESPONSES.USER_UPDATED_SUCCESSFULLY
          )
        );
    }
  );
  createCalendar = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const id = req.user.user_id;
      const data = req.body;
      console.log(data, id, " here is data, id");
      const user = data?.map((item: any) => ({
        uc_user_id: id,
        uc_start_date: item.uc_start_date,
        uc_end_date: item.uc_end_date,
        uc_city_id: item.uc_city_id,
        uc_description: item.uc_description,
      }));
      const d = await this.userCalendarService.createCalendar(user);
      console.log(d);
      return res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(StatusCodes.OK, data, API_RESPONSES.CALENDER_CRATED)
        );
    }
  );
  updateCalender = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { uc_id } = req.params;
      const { uc_start_date, uc_end_date, uc_city_id, uc_description } =
        req.body;

      const data = {
        uc_start_date: uc_start_date,
        uc_end_date: uc_end_date,
        uc_city_id: uc_city_id,
        uc_description: uc_description,
      };
      console.log(req.body, data, uc_id, " here is req.body");
      const user = await this.userCalendarService.updateCalender(uc_id, data);
      return res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(
            StatusCodes.OK,
            user,
            API_RESPONSES.USER_UPDATED_SUCCESSFULLY
          )
        );
    }
  );
  deleteCalenders = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { user_id } = req.params;
      const user = await this.userCalendarService.deleteCalenders(user_id);
      return res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(StatusCodes.OK, user, API_RESPONSES.CALENDER_DELETED)
        );
    }
  );
  getCalenderById = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { uc_id } = req.params;
      const user = await this.userCalendarService.getCalenderById(uc_id);
      return res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(StatusCodes.OK, user, API_RESPONSES.GET_CALENDER)
        );
    }
  );
  deleteCalender = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { uc_id } = req.params;
      const user = await this.userCalendarService.deleteCalender(uc_id);
      return res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(StatusCodes.OK, user, API_RESPONSES.CALENDER_DELETED)
        );
    }
  );

  getAllUsersOfAgency = asyncHandler(async (req: Request, res: Response) => {
    const { status, search, page, page_size }: getAllUserQueryType = req.query;

    const { users, count, link } = await this.userService.getAllUsersOfAgency(
      page,
      page_size,
      status,
      search
    );

    if (users.length === INTEGERS.ZERO)
      throw new ApiError(StatusCodes.NOT_FOUND, API_ERRORS.USERS_NOT_FOUND);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          { data: users, link, count },
          API_RESPONSES.USER_FETCHED
        )
      );
  });

  getAllAgencies = asyncHandler(async (req: Request, res: Response) => {
    const agencies = await this.userService.getAllAgencies();
    if (agencies.length === INTEGERS.ZERO)
      throw new ApiError(StatusCodes.NOT_FOUND, API_ERRORS.AGENCIES_NOT_FOUND);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          agencies,
          API_RESPONSES.AGENCIES_DATA_FETCHED
        )
      );
  });

  getAllAgenciesList = asyncHandler(async (req: Request, res: Response) => {
    const agencies = await this.userService.getAllAgenciesList();
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(
          StatusCodes.OK,
          agencies,
          API_RESPONSES.AGENCIES_DATA_FETCHED
        )
      );
  });

  createUserModel = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { urm_user_email, urm_model_agency_id, is_urm_accepted } = req.body;
      const data = {
        urm_user_email: urm_user_email,
        urm_model_agency_id: urm_model_agency_id,
        is_urm_accepted: is_urm_accepted,
      };
      const result = await this.userModelRelation.create(data);
      return res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(
            StatusCodes.OK,
            result,
            API_RESPONSES.USER_MODEL_CRATED
          )
        );
    }
  );
  updateUserModel = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { urm_user_email, urm_model_agency_id, is_urm_accepted } = req.body;
      const { id } = req.params;
      const data = {
        urm_user_email: urm_user_email,
        urm_model_agency_id: urm_model_agency_id,
        is_urm_accepted: is_urm_accepted,
      };

      const user = await this.userModelRelation.update(id, data);
      return res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(
            StatusCodes.OK,
            user,
            API_RESPONSES.USER_MODEL_UPDATED
          )
        );
    }
  );
  deleteUserModel = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      const user = await this.userModelRelation.delete(id);
      return res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(
            StatusCodes.OK,
            user,
            API_RESPONSES.USER_MODEL_DELETED
          )
        );
    }
  );
  getUserModelById = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      const user = await this.userModelRelation.get(id);
      return res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(StatusCodes.OK, user, API_RESPONSES.GET_USER_MODEL)
        );
    }
  );
  getAllUserModel = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const user = await this.userModelRelation.getAll();
      return res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(StatusCodes.OK, user, API_RESPONSES.GET_USER_MODEL)
        );
    }
  );
  createUserByAgency = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      console.log(req.body, " here is data");
      const user = await this.userService.createUserByAgency(req.body);
      return res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(
            StatusCodes.OK,
            user,
            API_RESPONSES.AGENCY_USER_CREATED
          )
        );
    }
  );
  inviteUserEmail = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const user = await this.userService.inviteUserEmail(req.body);
      return res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(
            StatusCodes.OK,
            user,
            API_RESPONSES.AGENCY_USER_CREATED
          )
        );
    }
  );

  removeUserAgency = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      const user = await this.userService.updateUser1(id);
      return res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(
            StatusCodes.OK,
            user,
            API_RESPONSES.AGENCY_REMOVE_USER
          )
        );
    }
  );

  getUserByIds = asyncHandler(async (req: Request, res: Response) => {
    const { user_ids } = req.body;

    const user = await this.userService.getUsersByIds(user_ids);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, user, API_RESPONSES.USER_DATA_FETCHED)
      );
  });

  getUserManagedBy = asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;

    const user = await this.userModelRelation.getModelRelations(id);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, user, API_RESPONSES.USER_DATA_FETCHED)
      );
  });
}

export default UserController;
