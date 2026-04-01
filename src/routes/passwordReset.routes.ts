import { Router } from "express";
import PasswordResetController from "../controllers/passwordReset.controller";

const PasswordResetRoutes = Router();
const passwordResetController = new PasswordResetController();

// Step 1: POST /user/forgot-password - Request OTPs (sent to both email AND phone)
PasswordResetRoutes.route("/forgot-password").post(
  passwordResetController.forgotPassword
);

// Step 2: POST /user/verify-reset-otp - Verify both OTPs and get reset token
PasswordResetRoutes.route("/verify-reset-otp").post(
  passwordResetController.verifyResetOtps
);

// Step 3: POST /user/reset-password - Reset password using token
PasswordResetRoutes.route("/reset-password").post(
  passwordResetController.resetPassword
);

export default PasswordResetRoutes;
