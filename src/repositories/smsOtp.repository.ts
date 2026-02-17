import prisma from "../configs/prisma.config";
import { INTEGERS } from "../constants/app.constant";
import { createSmsOtp, updateSmsType } from "../types/smsOtp.types";
import { queryHandler } from "../utils/helper";

class SmsOtpRepository {
  create = async (data: createSmsOtp) => {
    return queryHandler(
      async () =>
        await prisma.sms_otp.create({
          data,
        })
    );
  };

  update = async (so_id: string, data: updateSmsType) => {
    return queryHandler(
      async () => await prisma.sms_otp.update({ where: { so_id }, data })
    );
  };

  getByPhone = async (phone: string) => {
    return queryHandler(
      async () =>
        await prisma.sms_otp.findFirst({
          where: {
            so_receiver: phone,
          },
          orderBy: {
            so_created_at: "desc",
          },
          take: INTEGERS.ONE,
        })
    );
  };
}

export default SmsOtpRepository;
