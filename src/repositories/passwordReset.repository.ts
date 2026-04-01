import prisma from "../configs/prisma.config";
import {
  CreatePasswordResetOtpType,
  CreateResetTokenType,
} from "../types/passwordReset.types";
import { queryHandler } from "../utils/helper";
import crypto from "crypto";

class PasswordResetRepository {
  create = async (data: CreatePasswordResetOtpType) => {
    return queryHandler(
      async () =>
        await prisma.password_reset_otp.create({
          data,
        })
    );
  };

  findValidOtp = async (identifier: string, otp: string, type: string) => {
    return queryHandler(
      async () =>
        await prisma.password_reset_otp.findFirst({
          where: {
            pro_identifier: identifier,
            pro_otp: otp,
            pro_type: type,
            pro_is_used: false,
            pro_expires_at: {
              gt: new Date(),
            },
          },
        })
    );
  };

  markAsUsed = async (pro_id: string) => {
    return queryHandler(
      async () =>
        await prisma.password_reset_otp.update({
          where: { pro_id },
          data: { pro_is_used: true },
        })
    );
  };

  deleteExpiredOtps = async () => {
    return queryHandler(
      async () =>
        await prisma.password_reset_otp.deleteMany({
          where: {
            OR: [
              { pro_is_used: true },
              { pro_expires_at: { lt: new Date() } },
            ],
          },
        })
    );
  };

  deleteByUserIdAndType = async (userId: string, type: string) => {
    return queryHandler(
      async () =>
        await prisma.password_reset_otp.deleteMany({
          where: {
            pro_user_id: userId,
            pro_type: type,
          },
        })
    );
  };

  // Reset token methods (for after OTP verification)
  createResetToken = async (data: CreateResetTokenType) => {
    return queryHandler(
      async () =>
        await prisma.password_reset_token.create({
          data,
        })
    );
  };

  findValidResetToken = async (token: string) => {
    return queryHandler(
      async () =>
        await prisma.password_reset_token.findFirst({
          where: {
            prt_token: token,
            prt_is_used: false,
            prt_expires_at: {
              gt: new Date(),
            },
          },
        })
    );
  };

  markResetTokenAsUsed = async (prt_id: string) => {
    return queryHandler(
      async () =>
        await prisma.password_reset_token.update({
          where: { prt_id },
          data: { prt_is_used: true },
        })
    );
  };

  deleteResetTokensByUserId = async (userId: string) => {
    return queryHandler(
      async () =>
        await prisma.password_reset_token.deleteMany({
          where: { prt_user_id: userId },
        })
    );
  };

  generateSecureToken = (): string => {
    return crypto.randomBytes(32).toString("hex");
  };
}

export default PasswordResetRepository;
