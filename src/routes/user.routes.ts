import express from "express";
import { auth, authUser } from "./../middlewares/auth.middleware";
import UserController from "../controllers/user.controller";
import { API_ENDPOINTS } from "../constants/app.constant";

const UserRoutes = express.Router();
const userController = new UserController();

UserRoutes.route(API_ENDPOINTS.USERS)
  .get(authUser(), userController.getAllUsers)
  .post(authUser(), userController.getUserByIds);

UserRoutes.route(API_ENDPOINTS.USERS_BY_ID).get(userController.getUserById);

UserRoutes.route(API_ENDPOINTS.USERS_PROFILE)
  .put(authUser(), userController.updateUser)
  .get(authUser(), userController.getUserProfile);

UserRoutes.route(API_ENDPOINTS.USER_DETAILS).get(
  userController.getUserDetailsByEmailOrPhone
);

UserRoutes.route(API_ENDPOINTS.VERIFY_USER).post(userController.verifyUser);

UserRoutes.route(API_ENDPOINTS.UPDATE_PHONE).put(
  authUser(),
  userController.updatePhone
);
UserRoutes.route(API_ENDPOINTS.UPDATE_EMAIL).put(
  authUser(),
  userController.updateEmail
);

UserRoutes.route(API_ENDPOINTS.GET_PHONE).get(
  // authUser(),
  userController.getByPhone
);
UserRoutes.route(API_ENDPOINTS.GET_EMAIL).get(
  // authUser(),
  userController.getByEmail
);
UserRoutes.route(API_ENDPOINTS.SEARCH_USER).get(userController.searchUser);

UserRoutes.route(API_ENDPOINTS.FILTER_USER).post(userController.filterUser);

UserRoutes.route(API_ENDPOINTS.USER_DEVICE).post(
  userController.createUserDevice
);

UserRoutes.route(API_ENDPOINTS.RESET_PASSWORD).put(
  userController.resetPassword
);

UserRoutes.route(API_ENDPOINTS.LOGOUT).delete(userController.logout);

UserRoutes.route(API_ENDPOINTS.USER_DEVICE_BY_ID).get(
  userController.getUserDevice
);

UserRoutes.route(API_ENDPOINTS.USER_DEVICE_BY_ID).put(
  userController.updateUserDevice
);
//get verify user
UserRoutes.route(API_ENDPOINTS.VERIFY_USER_GET).get(
  auth(),
  userController.getVerifyUser
);

UserRoutes.route(API_ENDPOINTS.BLOCK_PROFILE).post(
  authUser(),
  userController.blockUser
);

UserRoutes.route(API_ENDPOINTS.UNBLOCK_PROFILE).post(
  authUser(),
  userController.unBlockUser
);

UserRoutes.route(API_ENDPOINTS.BLOCK_PROFILE).get(
  authUser(),
  userController.getBlockedAccount
);

UserRoutes.route(API_ENDPOINTS.REPORTED_ACCOUNT).post(
  authUser(),
  userController.reportUserController
);

UserRoutes.route(API_ENDPOINTS.REPORT_TYPE).get(
  userController.getReportTypesController
);

UserRoutes.route(API_ENDPOINTS.PHONE_USER).get(userController.getUserByPhone);

UserRoutes.route(API_ENDPOINTS.FCM_TOKENS).get(userController.getUserFcmTokens);

UserRoutes.route(API_ENDPOINTS.INTERNAL_USER_BY_ID).get(
  userController.getUserById
);


UserRoutes.route(API_ENDPOINTS.GET_ALL_BLOCKED_BY_ID).get(
  authUser(),
  userController.getAllBlockedAccounts
);
export default UserRoutes;
