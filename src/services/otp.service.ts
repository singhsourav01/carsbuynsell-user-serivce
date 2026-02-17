import { StatusCodes } from "http-status-codes";
import { ApiError } from "common-microservices-utils";
// import { sendMail, sendSms } from "../api/otp.api";
import { API_ERRORS, OTP_EXPIRY, STRINGS } from "../constants/app.constant";
import EmailOtpRepository from "../repositories/emailOtp.repository";
import SmsOtpRepository from "../repositories/smsOtp.repository";
import { generateOtp } from "../utils/helper";
import { updateEmailType } from "../types/emailOtp.types";
import { updateSmsType } from "../types/smsOtp.types";

class OtpService {
  smsOtpRepository: SmsOtpRepository;
  emailOtpRepository: EmailOtpRepository;
  constructor() {
    this.emailOtpRepository = new EmailOtpRepository();
    this.smsOtpRepository = new SmsOtpRepository();
  }

  sendPhoneOtp = async (
    user_id: string,
    phone: string,
    country_code: string
  ) => {
    const otp = generateOtp();
    // await sendSms({
    //   mobile_number: phone,
    //   country_code: country_code,
    //   text: otp,
    // });

    return await this.smsOtpRepository.create({
      so_country_code: country_code,
      so_user_id: user_id,
      so_token: otp,
      so_receiver: phone,
    });
  };

  sendEmailOtp = async (user_id: string, email: string) => {
    const otp = generateOtp();
    // const mail = await sendMail({
    //   body: otp,
    //   subject: STRINGS.ONE_TIME_PASSWORD,
    //   type: "otp",
    //   email: email,
    // });

    // return await this.emailOtpRepository.create({
    //   eo_user_id: user_id,
    //   eo_token: otp,
    //   eo_receiver: email,
    //   // eo_sender: mail?.data?.data?.mail_sender || "",
    // });
    return null;
  };

  getPhoneOtp = async (phone: string, otp: string) => {
    const phoneOtp = await this.smsOtpRepository.getByPhone(phone);
    if (!phoneOtp || otp !== phoneOtp?.so_token || phoneOtp?.so_is_expired) {
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.INVALID_OTP);
    }
    if (
      phoneOtp?.so_created_at &&
      Date.now() - phoneOtp?.so_created_at.getTime() > OTP_EXPIRY
    )
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.OTP_EXPIRED);
    return phoneOtp;
  };

  getEmailOtp = async (email: string, otp: string) => {
    const emailOtp = await this.emailOtpRepository.getByEmail(email);
    if (!emailOtp || otp !== emailOtp?.eo_token || emailOtp?.eo_is_expired) {
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.INVALID_OTP);
    }
    if (
      emailOtp?.eo_created_at &&
      Date.now() - emailOtp?.eo_created_at.getTime() > OTP_EXPIRY
    )
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.OTP_EXPIRED);
    return emailOtp;
  };

  updateEmail = async (eo_id: string, data: updateEmailType) => {
    return await this.emailOtpRepository.update(eo_id, data);
  };

  updateSms = async (so_id: string, data: updateSmsType) => {
    return await this.smsOtpRepository.update(so_id, data);
  };
}

export default OtpService;
