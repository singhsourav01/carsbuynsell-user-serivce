import axios from "axios";
import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";

class MessageCentralProvider {
  private BASE_URL = process.env.MESSAGE_CENTRAL_BASE_URL!;
  private AUTH_TOKEN = process.env.MESSAGE_CENTRAL_AUTH_TOKEN!;
  private CUSTOMER_ID = process.env.MESSAGE_CENTRAL_CUSTOMER_ID!;

  async sendOTP(mobileNumber: string) {
    console.log(this.BASE_URL, this.AUTH_TOKEN, this.CUSTOMER_ID);
    try {
      const response = await axios.post(
        `${this.BASE_URL}/verification/v3/send`,
        {},
        {
          headers: {
            authToken: this.AUTH_TOKEN,
          },

          params: {
            countryCode: "91",
            flowType: "SMS",
            mobileNumber,
            customerId: this.CUSTOMER_ID,
          },
        }
      );

      console.log(response, "check respose")
      return response.data;
    } catch (error: any) {
      console.error(
        "MessageCentral Send OTP Error:",
        error.response?.data || error.message
      );

      throw new ApiError(
        StatusCodes.INTERNAL_SERVER_ERROR,
        "Failed to send OTP"
      );
    }
  }

  async verifyOTP(
    mobileNumber: string,
    verificationId: string,
    code: string
  ) {
    try {
      const response = await axios.get(
        `${this.BASE_URL}/verification/v3/validateOtp`,
        {
          headers: {
            authToken: this.AUTH_TOKEN,
          },

          params: {
            mobileNumber,
            verificationId,
            code,
          },
        }
      );

      return response.data;
    } catch (error: any) {
      console.error(
        "MessageCentral Verify OTP Error:",
        error.response?.data || error.message
      );

      throw error;
    }
  }
}

export default MessageCentralProvider;