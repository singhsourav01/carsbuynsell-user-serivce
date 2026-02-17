import { ApprovalStatus, Gender, } from "@prisma/client";
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
import { API_RESPONSES } from "./../constants/app.constant";
import UserPortfolioService from "../services/userPortfolio.service";

interface AuthenticatedRequest extends Request {
  user?: any;
}

class UserController {
  userService: UserService;
  userPortfolioService: UserPortfolioService;
  otpService: OtpService;

  constructor() {
    this.userService = new UserService();
    this.userPortfolioService = new UserPortfolioService();
    this.otpService = new OtpService();
  }

  create = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {});

  blockUser = asyncHandler(async (req: AuthenticatedRequest, res: Response) => {
    const { blocked_user_id } = req.body;

    const { user_id } = req.user;

    // const response = await this.blockAndReportService.blockAccountService(
    //   user_id,
    //   blocked_user_id
    // );
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, null, API_RESPONSES.ALREADY_BLOCKED)
      );
  });

  unBlockUser = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { blocked_user_id } = req.body;
      const { user_id } = req.user;
      // const response = await this.blockAndReportService.unblockedAccountService(
      //   user_id,
      //   blocked_user_id
      // );
      return res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, null, "User unbloacked successfully"));
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

      // const responseData =
      //   await this.blockAndReportService.getBlockedAccountServices(
      //     user_id,
      //     page?.toString(),
      //     page_size?.toString()
      //   );

      res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(
            StatusCodes.OK,
            null,
            API_RESPONSES.USER_DATA_FETCHED,
            undefined,
            0
          )
        );
    }
  );

  reportUserController = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { user_id } = req.user;
      const { reported_user_id, report_type, report_description } = req.body;
      // const createReport = await this.blockAndReportService.reportAccountByUser(
      //   user_id,
      //   reported_user_id.toString(),
      //   report_type.toString(),
      //   report_description || null
      // );
      res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(StatusCodes.OK, null, API_RESPONSES.REPORTED)
        );
    }
  );

  //get stylist report types
  getReportTypesController = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      // const allIssues = await this.blockAndReportService.getReportTypeService();

      // Respond to the client with a JSON containing the fetched report issue types and success message
      res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(
            StatusCodes.OK,
            null,
            API_RESPONSES.ISSUE_TYPES_FETCHED
          )
        );
    }
  );

  getAllUsers = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      // const { search, page, page_size }: any = req.query;
      // const { user_id } = req.user;
      // const { blocked_by_ids, blocked_ids } =
      //   await this.blockAndReportService.getAllBlockedAccounts(user_id);
      // const data = await this.userService.getAll(
      //   page,
      //   page_size,
      //   search,
      //   ApprovalStatus.APPROVED,
      //   API_ENDPOINTS.USERS,
      //   user_id,
      //   [...blocked_by_ids, ...blocked_ids],
      //   req.query
      // );

      // return res
      //   .status(StatusCodes.OK)
      //   .json(
      //     new ApiResponse(StatusCodes.OK, data, API_RESPONSES.USERS_FETCHED)
      //   );
      return null
    }
  );

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { self_id }: { self_id?: string } = req.query;
    const { user_id } = req.params;

    // const user = await this.userService.getById(user_id, self_id);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, "null", API_RESPONSES.USER_DATA_FETCHED)
      );
  });

  getUserProfile = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { user_id } = req.user;
      // const user = await this.userService.getById(user_id);
      return res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(StatusCodes.OK, null, API_RESPONSES.USER_DATA_FETCHED)
        );
    }
  );

  updateUser = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const user = req.body;
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

      const updatedUser = await this.userService.updateUser(user_id, {
        user_full_name: user?.full_name,
        user_primary_phone: user.phone,
        user_email: user.email,
        user_gender: user?.gender,
        user_bio: user?.bio,
        user_dob: user?.dob,
        user_profile_image_file_id: user?.profile_image_file_id,
        user_admin_status:
          user?.is_private_user != null
            ? ApprovalStatus.APPROVED
            : ApprovalStatus.PENDING,
        user_height: user?.height,
        is_private_user: user?.is_private_user,
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
    const { user_id } = req.params;
    const userData = {
      user_selfie_file_id: user?.selfie_id,
      user_profile_image_file_id: user?.profile_image_id,
      user_bio: user?.bio,
      user_admin_status: ApprovalStatus.PENDING,
      user_dob: user?.dob,
      user_gender: user?.gender,
      user_height: user?.height,
      user_created_by_admin: user?.created_by_admin,
      is_private_user: user?.is_private_user,
    };

    await this.userPortfolioService.createPortfolio(
      user_id,
      user?.portfolio_ids
    );

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
    // const { blocked_by_ids, blocked_ids } =
    //   await this.blockAndReportService.getAllBlockedAccounts(user_id);
    const users = await this.userService.filterUser(
      male_requirement,
      female_requirement,
      other_requirement,
      location_requirement,
      is_nearby_locations,
      user_id,
      requirement_talent_id,
      // [...blocked_ids, ...blocked_by_ids]
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



  getAllBlockedAccounts = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { id } = req.params;
      // const tokens = await this.blockAndReportService.getAllBlockedAccounts(id);
      return res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(
            StatusCodes.OK,
            "tokens",
            API_RESPONSES.USER_CURRENT_LOCATION
          )
        );
    }
  );
   // inviteUserEmail = asyncHandler(
  //   async (req: AuthenticatedRequest, res: Response) => {
  //     const user = await this.userService.inviteUserEmail(req.body);
  //     return res
  //       .status(StatusCodes.OK)
  //       .json(
  //         new ApiResponse(
  //           StatusCodes.OK,
  //           user,
  //           API_RESPONSES.AGENCY_USER_CREATED
  //         )
  //       );
  //   }
  // );



  getUserByIds = asyncHandler(async (req: Request, res: Response) => {
    const { user_ids } = req.body;

    // const user = await this.userService.getUsersByIds(user_ids);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, "user", API_RESPONSES.USER_DATA_FETCHED)
      );
  });


}

export default UserController;
