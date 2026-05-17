import { ApiResponse, asyncHandler } from "common-microservices-utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import PasswordResetService from "../services/passwordReset.service";

class PasswordResetController {
  private passwordResetService: PasswordResetService;

  constructor() {
    this.passwordResetService = new PasswordResetService();
  }

  /**
   * POST /forgot-password
   * Request body: { email?: string, phone?: string }
   * Sends OTP to either email OR phone
   */
  forgotPassword = asyncHandler(async (req: Request, res: Response) => {
    const { email, phone } = req.body;

    const result = await this.passwordResetService.forgotPassword({
      email,
      phone,
    });

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, result, result.message));
  });

  /**
   * POST /verify-reset-otp
   * Request body: { email?: string, phone?: string, otp: string }
   * Verifies OTP and returns a reset token
   */
  verifyResetOtps = asyncHandler(async (req: Request, res: Response) => {
    const { email, phone, otp } = req.body;

    const result = await this.passwordResetService.verifyOtps({
      email,
      phone,
      otp,
    });

    return res
      .status(StatusCodes.OK)
      .json(new ApiResponse(StatusCodes.OK, result, result.message));
  });

  /**
   * POST /reset-password
   * Request body: { reset_token: string, new_password: string }
   * Resets password using the token obtained after OTP verification
   */
resetPassword = asyncHandler(async (req: Request, res: Response) => {
  const { email, phone, new_password } = req.body;

  const result = await this.passwordResetService.resetPassword({
    email,
    phone,
    new_password,
  });

  return res
    .status(StatusCodes.OK)
    .json(new ApiResponse(StatusCodes.OK, result, result.message));
});
}

export default PasswordResetController;
