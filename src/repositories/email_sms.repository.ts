import prisma from "../configs/prisma.config";

class EmailSmsRepository {

  createSmsOtp = async (
    phoneNumber: string,
    verificationId: string
  ) => {

    return prisma.sms_otp.create({
      data: {
        so_phone: phoneNumber,
        so_verfication_id: verificationId,
      },
    });
  };

  findActiveSmsOtp = async (
  phoneNumber: string
) => {

  return prisma.sms_otp.findFirst({
    where: {
      so_phone: phoneNumber,
      so_is_expired: false,
    },

    orderBy: {
      so_created_at: "desc",
    },
  });
};

  findSmsOtp = async (
    phoneNumber: string,
    verificationId: string
  ) => {

    return prisma.sms_otp.findFirst({
      where: {
        so_phone: phoneNumber,
        so_verfication_id: verificationId,
        so_is_expired: false,
      },
    });
  };

  expireSmsOtp = async (so_id: string) => {

    return prisma.sms_otp.update({
      where: {
        so_id,
      },
      data: {
        so_is_expired: true,
      },
    });
  };

  createEmailOtp = async (
    email: string,
    code: string
  ) => {

    return prisma.email_otp.create({
      data: {
        eo_email: email,
        eo_code: code,
      },
    });
  };

  findEmailOtp = async (
    email: string,
    code: string
  ) => {

    return prisma.email_otp.findFirst({
      where: {
        eo_email: email,
        eo_code: code,
        eo_is_expired: false,
      },
    });
  };

  expireEmailOtp = async (eo_id: string) => {

    return prisma.email_otp.update({
      where: {
        eo_id,
      },
      data: {
        eo_is_expired: true,
      },
    });
  };
}

export default EmailSmsRepository;