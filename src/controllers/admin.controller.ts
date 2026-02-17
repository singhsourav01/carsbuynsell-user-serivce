import { ApprovalStatus } from "@prisma/client";
import { ApiResponse, asyncHandler } from "common-microservices-utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { API_ENDPOINTS, API_RESPONSES } from "../constants/app.constant";
import UserService from "../services/user.service";
import UserLocationsService from "../services/userLocations.service";
import UserPortfolioService from "../services/userPortfolio.service";
import UserSocialLinksService from "../services/userSocialLinks.service";
import UserTalentService from "../services/userTalents.service";
import UserVideoLinksService from "../services/userVideoLinks.service";
import {
  getAllUserByAdminQueryType,
  getAllUserQueryType,
} from "../types/user.types";
import AdminService from "../services/admin.service";
import BlockAndReportService from "../services/block.service";

import _ from "lodash";

interface AuthenticatedRequest extends Request {
  user?: any;
}

class AdminController {
  userService: UserService;
  adminService: AdminService;
  userTalentService: UserTalentService;
  userPortfolioService: UserPortfolioService;
  userSocialLinksService: UserSocialLinksService;
  userVideoLinksService: UserVideoLinksService;
  userLocationsService: UserLocationsService;
  blockAndReportService: BlockAndReportService;

  constructor() {
    this.userService = new UserService();
    this.userTalentService = new UserTalentService();
    this.userPortfolioService = new UserPortfolioService();
    this.userSocialLinksService = new UserSocialLinksService();
    this.userVideoLinksService = new UserVideoLinksService();
    this.userLocationsService = new UserLocationsService();
    this.adminService = new AdminService();
    this.blockAndReportService = new BlockAndReportService();
  }

  createUser = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const user = req.body;
      const user_id = req.user.user_id;
      console.log(user);

      const data = {
        user_full_name: user?.full_name,
        user_email: user?.email,
        user_gender: user?.gender,
        user_bio: user?.bio,
        user_dob: user?.dob,
        user_profile_image_file_id: user?.profile_image_file_id,
        user_selfie_file_id: user?.selfie_file_id,
        user_primary_country_id: user?.phone_country_id,
        user_primary_phone: user?.phone,
        user_referred_by: user_id,
        user_talents: user?.talent_ids,
      };

      const createdUser = await this.userService.createUser(data);
      await this.userTalentService.createTalents(
        createdUser.user_id,
        user.talent_ids
      );
      await this.userPortfolioService.createPortfolio(
        createdUser.user_id,
        user.portfolio_ids
      );


      return res
        .status(StatusCodes.CREATED)
        .json(
          new ApiResponse(
            StatusCodes.CREATED,
            createdUser,
            API_RESPONSES.USER_CREATED
          )
        );
    }
  );

  createReportType = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { srt_name } = req.body;

      const issue = await this.blockAndReportService.createReportTypeService(
        srt_name
      );
      res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(
            StatusCodes.OK,
            issue,
            API_RESPONSES.SUBMITTED_SUCCESSFULLY
          )
        );
    }
  );

  deleteReportType = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { srt_id } = req.params;

      const issue = await this.blockAndReportService.deleteReportTypeService(
        srt_id
      );
      res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(
            StatusCodes.OK,
            issue,
            API_RESPONSES.SUBMITTED_SUCCESSFULLY
          )
        );
    }
  );

  updateReportType = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { srt_name } = req.body;
      const { srt_id } = req.params;
      const issue = await this.blockAndReportService.updateReportTypeService(
        srt_id,
        srt_name
      );
      res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(
            StatusCodes.OK,
            issue,
            API_RESPONSES.SUBMITTED_SUCCESSFULLY
          )
        );
    }
  );

  getAllReportedUserController = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { search, page, page_size }: getAllUserQueryType = req.query;
      const { data, link, totalCount } =
        await this.blockAndReportService.getAllReportedAccountService(
          page ?? "",
          page_size ?? ""
        );

      res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(
            StatusCodes.OK,
            { data, link, totalCount },
            API_RESPONSES.USER_DATA_FETCHED
          )
        );
    }
  );

  getReportedByUsersController = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { user_id } = req.params;
      const { page, page_size }: getAllUserQueryType = req.query;
      const { data, link, totalCount } =
        await this.blockAndReportService.getReportedAccountByUserService(
          page ?? "",
          page_size ?? "",
          user_id
        );

      res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(
            StatusCodes.OK,
            { data, link, totalCount },
            API_RESPONSES.USER_DATA_FETCHED
          )
        );
    }
  );

  getAllUsers = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { search, page, page_size, status }: getAllUserByAdminQueryType =
        req.query;
      const data = await this.adminService.getAll(
        page,
        page_size,
        search,
        status,
        API_ENDPOINTS.ADMIN_USERS
      );

      return res
        .status(StatusCodes.OK)
        .json(
          new ApiResponse(StatusCodes.OK, data, API_RESPONSES.USERS_FETCHED)
        );
    }
  );

  getUserById = asyncHandler(async (req: Request, res: Response) => {
    const { user_id } = req.params;
    const user = await this.userService.getById(user_id);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, user, API_RESPONSES.USER_DATA_FETCHED)
      );
  });

  changesUserStatus = asyncHandler(async (req: Request, res: Response) => {
    const { status, reason } = req.body;
    const { user_id } = req.params;
    const user = await this.userService.changeUserStatus(
      user_id,
      status,
      reason
    );
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, user, API_RESPONSES.USER_STATUS_UPDATED)
      );
  });

  deleteById = asyncHandler(async (req: Request, res: Response) => {
    const { user_id } = req.params;
    await this.userService.deleteById(user_id);
    await this.userService.changeUserStatus(
      user_id,
      ApprovalStatus.DELETED,
      "delete"
    );
    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, {}, API_RESPONSES.USER_DELETED));
  });

  createAuthUser = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const user = req.body;
      const data = {
        user_id: user.user_id,
        user_full_name: user.user_full_name,
        user_password: user.user_password,
        user_email: user.user_email,
        user_gender: user.user_gender,
        user_bio: user.user_bio,
        user_dob: user.user_dob,
        user_profile_image_file_id: user.user_profile_image_file_id,
        user_primary_country_id: user.user_primary_country_id,
        user_primary_phone: user.user_primary_phone,
        user_admin_status: ApprovalStatus.APPROVED,
        user_referred_by: user.user_referred_by,
        user_email_verified: true,
        user_phone_verified: true,
        user_created_by_admin: false,
      };
      const createdUser = await this.userService.createAuthUser(
        data,
        user.user_portfolio,

      );
      return res
        .status(StatusCodes.CREATED)
        .json(
          new ApiResponse(
            StatusCodes.CREATED,
            createdUser,
            API_RESPONSES.USER_CREATED
          )
        );
    }
  );
}

export default AdminController;
