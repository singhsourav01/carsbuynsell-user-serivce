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

const OTP_EXPIRY_MINUTES = 10;
const RESET_TOKEN_EXPIRY_MINUTES = 15;

class PasswordResetService {
  private passwordResetRepository: PasswordResetRepository;
  private userRepository: UserRepository;

  constructor() {
    this.passwordResetRepository = new PasswordResetRepository();
    this.userRepository = new UserRepository();
  }

  /**
   * Step 1: Request password reset - sends OTP to both email AND phone
   */
  forgotPassword = async (data: ForgotPasswordRequestType) => {
    const { email, phone } = data;

    if (!email || !phone) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Both email and phone number are required"
      );
    }

    // Verify user exists with both email and phone
    const userByEmail = await this.userRepository.getUserByEmail(email);
    if (!userByEmail) {
      throw new ApiError(StatusCodes.NOT_FOUND, API_ERRORS.NO_ACCOUNT_FOUND);
    }

    const userByPhone = await this.userRepository.getUserByPhone(phone);
    if (!userByPhone) {
      throw new ApiError(
        StatusCodes.NOT_FOUND,
        API_ERRORS.PHONE_NUMBER_DOSE_NOT_EXISTS
      );
    }

    // Verify both belong to the same user
    if (userByEmail.user_id !== userByPhone.user_id) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Email and phone do not belong to the same account"
      );
    }

    const userId = userByEmail.user_id;

    // Delete any existing OTPs for this user
    await this.passwordResetRepository.deleteByUserIdAndType(userId, "email");
    await this.passwordResetRepository.deleteByUserIdAndType(userId, "phone");

    // Generate OTPs for both email and phone
    const emailOtp = generateOtp();
    const phoneOtp = generateOtp();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Store both OTPs
    await Promise.all([
      this.passwordResetRepository.create({
        pro_user_id: userId,
        pro_otp: emailOtp,
        pro_identifier: email,
        pro_type: "email",
        pro_expires_at: expiresAt,
      }),
      this.passwordResetRepository.create({
        pro_user_id: userId,
        pro_otp: phoneOtp,
        pro_identifier: phone,
        pro_type: "phone",
        pro_expires_at: expiresAt,
      }),
    ]);

    // TODO: Implement actual SMS/Email sending
    // In production, send OTPs via SMS and Email services
    console.log(`[DEV] Password reset EMAIL OTP for ${email}: ${emailOtp}`);
    console.log(`[DEV] Password reset PHONE OTP for ${phone}: ${phoneOtp}`);

    return {
      message: `OTPs sent to your email and phone. Valid for ${OTP_EXPIRY_MINUTES} minutes.`,
      // Remove these in production - only for testing
      ...(process.env.NODE_ENV === "development" && {
        email_otp: emailOtp,
        phone_otp: phoneOtp,
      }),
    };
  };

  /**
   * Step 2: Verify both OTPs - returns a reset token if both are valid
   */
  verifyOtps = async (data: VerifyOtpRequestType) => {
    const { email, phone, email_otp, phone_otp } = data;

    if (!email || !phone || !email_otp || !phone_otp) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Email, phone, email_otp, and phone_otp are all required"
      );
    }

    // Verify email OTP
    const emailOtpRecord = await this.passwordResetRepository.findValidOtp(
      email,
      email_otp,
      "email"
    );

    if (!emailOtpRecord) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid or expired email OTP");
    }

    // Verify phone OTP
    const phoneOtpRecord = await this.passwordResetRepository.findValidOtp(
      phone,
      phone_otp,
      "phone"
    );

    if (!phoneOtpRecord) {
      throw new ApiError(StatusCodes.BAD_REQUEST, "Invalid or expired phone OTP");
    }

    // Verify both OTPs belong to the same user
    if (emailOtpRecord.pro_user_id !== phoneOtpRecord.pro_user_id) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "OTPs do not belong to the same account"
      );
    }

    const userId = emailOtpRecord.pro_user_id;

    // Mark both OTPs as used
    await Promise.all([
      this.passwordResetRepository.markAsUsed(emailOtpRecord.pro_id),
      this.passwordResetRepository.markAsUsed(phoneOtpRecord.pro_id),
    ]);

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
      message: `Both OTPs verified successfully. Use the reset token to set your new password. Token valid for ${RESET_TOKEN_EXPIRY_MINUTES} minutes.`,
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
