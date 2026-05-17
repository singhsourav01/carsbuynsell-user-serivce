import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";
import EmailSmsRepository from "../repositories/email_sms.repository";
import MessageCentralProvider from "../utils/messageCentral.provider";
import { sendEmail } from "../utils/resend.provider";

class EmailSmsService {

  private emailSmsRepository: EmailSmsRepository;
  private messageCentralProvider: MessageCentralProvider;

  constructor() {
    this.emailSmsRepository = new EmailSmsRepository();
    this.messageCentralProvider = new MessageCentralProvider();
  }

  // ================= SEND SMS =================

sendSms = async (phoneNumber: string) => {
  const existingOtp =
    await this.emailSmsRepository
      .findActiveSmsOtp(phoneNumber);

  if (existingOtp) {

    const now = Date.now();

    const createdAt =
      new Date(existingOtp.so_created_at)
        .getTime();

    const diff =
      (now - createdAt) / 1000;

    // BLOCK WITHIN 60 SECONDS

    if (diff < 60) {

      throw new ApiError(
        StatusCodes.TOO_MANY_REQUESTS,
        `Please wait ${Math.ceil(60 - diff)} seconds before requesting another OTP`
      );
    }

    // EXPIRE OLD OTP

    await this.emailSmsRepository
      .expireSmsOtp(existingOtp.so_id);
  }

  // SEND NEW OTP

  const response =
    await this.messageCentralProvider
      .sendOTP(phoneNumber);

  console.log(
    "MessageCentral Send OTP Response:",
    response
  );
console.log(response, "check respose")
  if (response.message !== "SUCCESS") {

    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to send OTP"
    );
  }

  // STORE NEW OTP SESSION

  await this.emailSmsRepository.createSmsOtp(
    phoneNumber,
    response.data.verificationId
  );

  return response;
};
  // ================= VERIFY SMS =================

verifySms = async (data: any) => {

  const {
    phoneNumber,
    verificationId,
    code,
  } = data;

  const smsOtp =
    await this.emailSmsRepository.findLatestActiveSmsOtp(phoneNumber);

  if (!smsOtp) {

    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      "OTP session not found"
    );
  }

  const response =
    await this.messageCentralProvider.verifyOTP(
      phoneNumber,
      smsOtp.so_verfication_id,
      code
    );

  console.log(response, "verify otp response");

  if (
    !response.data ||
    response.data.verificationStatus !==
      "VERIFICATION_COMPLETED"
  ) {

    throw new ApiError(
      StatusCodes.BAD_REQUEST,
      response.message === "WRONG_OTP_PROVIDED"? "Wrong OTP provided": "Invalid OTP"
    );
  }

  await this.emailSmsRepository.expireSmsOtp(
    smsOtp.so_id
  );

  return response.data;
};

  sendEmail = async (email: string) => {

    const otp =
      Math.floor(1000 + Math.random() * 9000)
        .toString();

    // SEND EMAIL USING RESEND HERE

     const html = `
    <div style="font-family: Arial, sans-serif;">

      <h2>Email Verification</h2>

      <p>
        Your OTP code is:
      </p>

      <h1
        style="
          letter-spacing: 5px;
          font-size: 32px;
        "
      >
        ${otp}
      </h1>

      <p>
        This OTP will expire in 1 minute.
      </p>

      <p>
        If you did not request this,
        please ignore this email.
      </p>

    </div>
  `;
   const response =
    await sendEmail(
      email,
      "Your OTP Code",
      html
    );
    console.log(response, "resend response")

      if (!response?.data?.id) {

    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to send OTP email"
    );
  }
    await this.emailSmsRepository.createEmailOtp(
      email,
      otp
    );

    return {
      success: true,
      message: "OTP sent successfully",
    };
  };


  verifyEmail = async (data: any) => {

    const {
      email,
      code,
    } = data;

    const emailOtp =
      await this.emailSmsRepository.findEmailOtp(
        email,
        code
      );

    if (!emailOtp) {

      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "Invalid OTP"
      );
    }

    // CHECK 1 MIN EXPIRY

    const now = new Date().getTime();

    const createdAt =
      new Date(emailOtp.eo_created_at).getTime();

    const diff =
      (now - createdAt) / 1000;

    if (diff > 60) {

      await this.emailSmsRepository.expireEmailOtp(
        emailOtp.eo_id
      );

      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        "OTP expired"
      );
    }

    await this.emailSmsRepository.expireEmailOtp(
      emailOtp.eo_id
    );

    return {
      success: true,
      message: "OTP verified successfully",
    };
  };
}

export default EmailSmsService;