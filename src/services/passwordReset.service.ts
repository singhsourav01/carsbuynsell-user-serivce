import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";
import { API_ERRORS } from "../constants/app.constant";
import PasswordResetRepository from "../repositories/passwordReset.repository";
import UserRepository from "../repositories/user.repository";
import {
  ForgotPasswordRequestType,
  VerifyOtpRequestType,
  ResetPasswordRequestType,
} from "../types/passwordReset.types";
import { generateOtp, hashPassword } from "../utils/helper";
import MessageCentralProvider from "../utils/messageCentral.provider";

const OTP_EXPIRY_MINUTES = 10;
const RESET_TOKEN_EXPIRY_MINUTES = 15;

class PasswordResetService {
  private passwordResetRepository: PasswordResetRepository;
  private userRepository: UserRepository;
  private messageCentralProvider: MessageCentralProvider;

  constructor() {
    this.passwordResetRepository = new PasswordResetRepository();
    this.userRepository = new UserRepository();
        this.messageCentralProvider = new MessageCentralProvider();

  }

  /**
   * Step 1: Request password reset - sends OTP to either email OR phone
   */
forgotPassword = async (data: ForgotPasswordRequestType) => {
  const { email, phone } = data;

  if (!email && !phone) {
    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "Either email or phone number is required"
    );
  }

  let user;
  let identifier: string;
  let otpType: "email" | "phone";

  if (email) {
    user = await this.userRepository.getUserByEmail(email);

    if (!user) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        API_ERRORS.NO_ACCOUNT_FOUND
      );
    }

    identifier = email;
    otpType = "email";
  } else {
    user = await this.userRepository.getUserByPhone(phone!);

    if (!user) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        API_ERRORS.PHONE_NUMBER_DOSE_NOT_EXISTS
      );
    }

    identifier = phone!;
    otpType = "phone";
  }

  const userId = user.user_id;

  await this.passwordResetRepository.deleteByUserIdAndType(
    userId,
    otpType
  );

  const expiresAt = new Date(
    Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000
  );

  if (otpType === "email") {
    const otp = generateOtp();

    await this.passwordResetRepository.create({
      pro_user_id: userId,
      pro_otp: otp,
      pro_identifier: identifier,
      pro_type: "email",
      pro_verification_id: null,
      pro_expires_at: expiresAt,
    });

    console.log(`[DEV] Password reset OTP for ${identifier}: ${otp}`);

    return {
      message: `OTP sent to your email. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
      ...(process.env.NODE_ENV === "development" && { otp }),
    };
  }

  const smsResponse =
    await this.messageCentralProvider.sendOTP(identifier);

  const verificationId =
    smsResponse?.data?.verificationId;

  if (!verificationId) {
    throw new ApiError(
      StatusCodes.BAD_GATEWAY,
      "Failed to send OTP. Verification ID missing"
    );
  }

  await this.passwordResetRepository.create({
    pro_user_id: userId,
    pro_otp: null,
    pro_identifier: identifier,
    pro_type: "phone",
    pro_verification_id: verificationId,
    pro_expires_at: expiresAt,
  });

  return {
    message: `OTP sent to your phone. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
  };
};

  /**
   * Step 2: Verify OTP - returns a reset token if valid
   */
  verifyOtps = async (data: VerifyOtpRequestType) => {
    const { email, phone, otp } = data;

    if ((!email && !phone) || !otp) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Either email or phone, along with OTP, is required"
      );
    }

    const identifier = email || phone!;
    const otpType: "email" | "phone" = email ? "email" : "phone";

    // Verify OTP
    const otpRecord = await this.passwordResetRepository.findValidOtp(
      identifier,
      otp,
      otpType
    );

    if (!otpRecord) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid or expired OTP");
    }

    const userId = otpRecord.pro_user_id;

    // Mark OTP as used
    await this.passwordResetRepository.markAsUsed(otpRecord.pro_id);

    // Delete any existing reset tokens for this user
    await this.passwordResetRepository.deleteResetTokensByUserId(userId);

    // Generate a secure reset token
    const resetToken = this.passwordResetRepository.generateSecureToken();
    const tokenExpiresAt = new Date(
      Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000
    );

    // Store the reset token
    await this.passwordResetRepository.createResetToken({
      prt_user_id: userId,
      prt_token: resetToken,
      prt_expires_at: tokenExpiresAt,
    });

    // Clean up expired OTPs
    this.passwordResetRepository.deleteExpiredOtps().catch(console.error);

    return {
      message: `OTP verified successfully. Use the reset token to set your new password. Token valid for ${RESET_TOKEN_EXPIRY_MINUTES} minutes.`,
      reset_token: resetToken,
    };
  };

  /**
   * Step 3: Reset password using the reset token
   */
  resetPassword = async (data: ResetPasswordRequestType) => {
    const { reset_token, new_password } = data;

    if (!reset_token || !new_password) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Reset token and new password are required"
      );
    }

    if (new_password.length < 6) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Password must be at least 6 characters long"
      );
    }

    // Find valid reset token
    const tokenRecord =
      await this.passwordResetRepository.findValidResetToken(reset_token);

    if (!tokenRecord) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Invalid or expired reset token. Please request a new password reset."
      );
    }

    // Hash the new password
    const hashedPassword = await hashPassword(new_password);

    // Update user password
    const user = await this.userRepository.update(tokenRecord.prt_user_id, {
      user_password: hashedPassword,
    });

    // Mark token as used
    await this.passwordResetRepository.markResetTokenAsUsed(tokenRecord.prt_id);

    return {
      message:
        "Password reset successful. You can now login with your new password.",
      user_id: user.user_id,
    };
  };
}

export default PasswordResetService;
