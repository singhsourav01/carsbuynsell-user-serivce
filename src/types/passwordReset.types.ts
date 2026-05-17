export type ForgotPasswordRequestType = {
  email?: string;
  phone?: string;
};

export type VerifyOtpRequestType = {
  email?: string;
  phone?: string;
  otp: string;
};

export type ResetPasswordRequestType = {
  reset_token: string;
  new_password: string;
};

export type CreatePasswordResetOtpType = {
  pro_user_id: string;
  pro_otp?: string | null;
  pro_identifier: string;
  pro_type: "email" | "phone";
  pro_expires_at: Date;
  pro_verification_id: string | null;
};

export type CreateResetTokenType = {
  prt_user_id: string;
  prt_token: string;
  prt_expires_at: Date;
};
