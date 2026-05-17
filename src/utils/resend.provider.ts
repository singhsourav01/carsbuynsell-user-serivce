import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";
import { Resend } from "resend";

const resend = new Resend(
  process.env.RESEND_API_KEY!
);

export const sendEmail = async (
  to: string,
  subject: string,
  html: string
) => {

  try {

    const response =
      await resend.emails.send({

        from:
          "Car Buy N Sell <noreply@carsbuynsell.com>",

        to,

        subject,

        html,
      });

    return response;

  } catch (error: any) {

    console.error(
      "Resend Email Error:",
      error
    );

    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      "Failed to send email"
    );
  }
};