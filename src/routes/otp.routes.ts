import { authUser } from "./../middlewares/auth.middleware";
import express from "express";
import { API_ENDPOINTS } from "../constants/app.constant";
import OtpController from "../controllers/otp.controller";

const OtpRoutes = express.Router();
const otpController = new OtpController();

OtpRoutes.route(API_ENDPOINTS.SEND_PHONE_OTP).post(
  authUser(),
  otpController.sendPhoneOtp
);
OtpRoutes.route(API_ENDPOINTS.SEND_EMAIL_OTP).post(
  authUser(),
  otpController.sendEmailOtp
);

export default OtpRoutes;
