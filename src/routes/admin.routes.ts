import express from "express";
import { API_ENDPOINTS } from "../constants/app.constant";
import AdminController from "../controllers/admin.controller";
import UserController from "../controllers/user.controller";
import { authAdmin } from "./../middlewares/auth.middleware";

const AdminRoutes = express.Router();
const adminController = new AdminController();
const userController = new UserController();

AdminRoutes.route(API_ENDPOINTS.ADMIN_USERS)
  .post(authAdmin(), adminController.createUser)
  .get(authAdmin(), adminController.getAllUsers);

AdminRoutes.route(API_ENDPOINTS.ADMIN_USERS_BY_ID)
  // .get(authAdmin(), adminController.getUserById)
  .delete(authAdmin(), adminController.deleteById);

AdminRoutes.route(API_ENDPOINTS.ADMIN_USERS_STATUS).put(
  authAdmin(),
  adminController.changesUserStatus
);

AdminRoutes.route(API_ENDPOINTS.ADMIN_CREATE_AUTH_USER).post(
  authAdmin(),
  adminController.createAuthUser
);
AdminRoutes.route(API_ENDPOINTS.ADMIN + API_ENDPOINTS.REPORT_TYPE).get(
  userController.getReportTypesController
);
// AdminRoutes.route(API_ENDPOINTS.ADMIN + API_ENDPOINTS.REPORT_TYPE).post(
//   adminController.createReportType
// );
// AdminRoutes.route(API_ENDPOINTS.ADMIN + API_ENDPOINTS.REPORTED_ACCOUNT).get(
//   adminController.getAllReportedUserController
// );
// AdminRoutes.route(
//   API_ENDPOINTS.ADMIN + API_ENDPOINTS.REPORTED_ACCOUNT_BY_ID
// ).get(adminController.getReportedByUsersController);
// // Route for updating a report type
// AdminRoutes.route(API_ENDPOINTS.ADMIN + API_ENDPOINTS.REPORT_TYPE_BY_ID).put(
//   adminController.updateReportType
// );

// Route for deleting a report type
// AdminRoutes.route(API_ENDPOINTS.ADMIN + API_ENDPOINTS.REPORT_TYPE_BY_ID).delete(
//   adminController.deleteReportType
// );

export default AdminRoutes;
