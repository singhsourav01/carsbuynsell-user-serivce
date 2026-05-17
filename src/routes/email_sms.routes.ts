import express from "express";
import { API_ENDPOINTS } from "../constants/app.constant";
import EmailSmsController from "../controllers/email_sms.controller";

const emailSmsController = new EmailSmsController();
const EmailSmsRoutes = express.Router();

EmailSmsRoutes.post(API_ENDPOINTS.SEND_EMAIL, emailSmsController.sendEmail);
EmailSmsRoutes.post(API_ENDPOINTS.VERFIY_EMAIL, emailSmsController.verifyEmail);

EmailSmsRoutes.post(API_ENDPOINTS.SEND_SMS, emailSmsController.sendSms);
EmailSmsRoutes.post(API_ENDPOINTS.VERFIY_SMS, emailSmsController.verifySms);

export default EmailSmsRoutes;