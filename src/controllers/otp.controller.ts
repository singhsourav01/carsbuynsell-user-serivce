import { ApiResponse, asyncHandler } from "common-microservices-utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import OtpService from "../services/otp.service";
import { API_RESPONSES } from "../constants/app.constant";
interface AuthenticatedRequest extends Request {
  user?: any;
}
class OtpController {
  otpService: OtpService;
  constructor() {
    this.otpService = new OtpService();
  }

  sendPhoneOtp = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { user_id } = req.user;
      const { country_code, phone } = req.body;

      const otp = await this.otpService.sendPhoneOtp(
        user_id,
        phone,
        country_code
      );

      return res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, otp, API_RESPONSES.OTP_SEND));
    }
  );

  sendEmailOtp = asyncHandler(
    async (req: AuthenticatedRequest, res: Response) => {
      const { user_id } = req.user;
      const { email } = req.body;

      const otp = await this.otpService.sendEmailOtp(user_id, email);

      return res
        .status(StatusCodes.OK)
        .json(new ApiResponse(StatusCodes.OK, otp, API_RESPONSES.OTP_SEND));
    }
  );
}

export default OtpController;
