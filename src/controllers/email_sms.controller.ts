import { ApiError, ApiResponse, asyncHandler } from "common-microservices-utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { API_RESPONSES } from "../constants/app.constant";
import EmailSmsService from "../services/email_sms.service";
import MessageCentralProvider from "../utils/messageCentral.provider"

class EmailSmsController {
    private emailSmsService: EmailSmsService;
    private messageCentralProvider: MessageCentralProvider;

    constructor() {
        this.emailSmsService     = new EmailSmsService();
        this.messageCentralProvider = new MessageCentralProvider();
    }

       sendEmail = asyncHandler(async (req: Request, res: Response) => {
            
            const email = await this.emailSmsService.sendEmail(req.body.email);
            return res
                .status(StatusCodes.CREATED)
                .json(new ApiResponse(StatusCodes.CREATED, email, ));
        });

       sendSms = asyncHandler(async (req: Request, res: Response) => {

  const { phoneNumber } = req.body;

  const response =
    await this.emailSmsService.sendSms(phoneNumber);

  return res
    .status(StatusCodes.CREATED)
    .json(
      new ApiResponse(
        StatusCodes.CREATED,
        response,
        "OTP sent successfully"
      )
    );
});

        

       verifyEmail = asyncHandler(async (req: Request, res: Response) => {
            
    
            const verifyEmail = await this.emailSmsService.verifyEmail(req.body);
            return res
                .status(StatusCodes.CREATED)
                .json(new ApiResponse(StatusCodes.CREATED, verifyEmail, ""));
        });

        

       verifySms = asyncHandler(async (req: Request, res: Response) => {

  const response =
    await this.emailSmsService.verifySms(req.body);

  return res
    .status(StatusCodes.OK)
    .json(
      new ApiResponse(
        StatusCodes.OK,
        response,
        "OTP verified successfully"
      )
    );
});
}

export default EmailSmsController;
