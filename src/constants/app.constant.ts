export const PORT = 8001;

export const API_URL = `${process.env.API_URL}/user`;

export const ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
};

export const ADMIN_STATUS = {
  NONE: "NONE",
  PENDING: "PENDING",
  APPROVED: "APPROVED",
  REJECTED: "REJECTED",
};

export const USER_ROLES = {
  ADMIN: "ADMIN",
  USER: "USER",
};

export const GENDERS = {
  MALE: "MALE",
  FEMALE: "FEMALE",
  OTHER: "OTHER",
};

export const API_ENDPOINTS = {
  // ADMIN ENDPOINTS
  ADMIN: "/admin",
  ADMIN_USERS: "/admin/users",
  ADMIN_USERS_BY_ID: "/admin/users/:user_id",
  ADMIN_USERS_STATUS: "/admin/users/status/:user_id",
  ADMIN_CREATE_AUTH_USER: "/admin/create-auth-user",
  REPORTED_ACCOUNT: "/reported-account",
  REPORTED_ACCOUNT_BY_ID: "/reported-account/:user_id",
  REPORT_TYPE: "/report-type",
  REPORT_TYPE_BY_ID: "/report-type/:srt_id",
  USER_APPROVAL_STATUS: "/user-approval/:id",

  // USER & PROFILE ENDPOINTS
  BASE: "/user",
  USERS: "/users",
  USERS_BY_ID: "/users/:user_id",
  USERS_PROFILE: "/users-profile",
  USER_DETAILS: "/users/details/:user_details",
  SEARCH_USER: "/search-user",
  FILTER_USER: "/filter-user",
  TALENT_DIRECTORY: "/talent-directory",
  USER_CURRENT_LOCATION: "/user-location",
  PHONE_USER: "/phone-users",
  
  // Update/Get sensitive info
  UPDATE_PHONE: "/users/phone",
  UPDATE_EMAIL: "/users/email",
  GET_PHONE: "/users/phone/:user_id",
  GET_EMAIL: "/users/email/:user_id",

  // Blocking logic
  BLOCK_PROFILE: "/block-profile",
  UNBLOCK_PROFILE: "/unblock-profile",
  GET_ALL_BLOCKED_BY_ID: "/blocked/all/:id",

  // AUTH, SECURITY & DEVICE ENDPOINTS
  VERIFY_USER: "/users/verify/:user_id",
  VERIFY_USER_GET: "/verify-user",
  SEND_PHONE_OTP: "/send-phone-otp",
  SEND_EMAIL_OTP: "/send-email-otp",
  RESET_PASSWORD: "/reset-password/:user_id",
  LOGOUT: "/logout/:uld_id",
  
  // Devices & Notifications
  USER_DEVICE: "/user-device",
  USER_DEVICE_BY_ID: "/user-device/:uld_id",
  USER_DEVICE_BY_USER_ID: "/user-device/:user_id",
  FCM_TOKENS: "/fcm-tokens/:id",

  // SYSTEM & UTILITY ENDPOINTS
  INTERNAL: "/internal",
  INTERNAL_USER_BY_ID: "/internal-user/:user_id",
  GENERATE_DEEPLINK: "/generate-deep-link",
  REDIRECT_DEEPLINK: "/link/*",
  APPLE_APP_ASSOCIATION: "/.well-known/apple-app-site-association",
  ASSET_LINK: "/.well-known/assetlinks.json",
};

export const API_RESPONSES = {
  USER_CREATED: "User created successfully",
  USERS_FETCHED: "Users data fetched successfully",
  USER_DATA_FETCHED: "User data fetched successfully",
  USER_UPDATED_SUCCESSFULLY: "User data updated successfully",
  USER_STATUS_UPDATED: "User status updated successfully",
  USER_FETCHED: "User data fetched successfully.",
  USER_DELETED: "User deleted successfully",
  USER_VERIFICATION_REQUESTED:
    "Your profile verification request has been sent, please wait for admin action",
  OTP_SEND: "Otp sent successfully",
  PHONE_UPDATED: "Phone updated successfully",
  EMAIL_UPDATED: "Email updated successfully",
  USER_DEVICE_CREATED: "User login device created successfully",
  LOGOUT: "Log out successfully",
  USER_DEVICE_FETCHED: "User device fetched successfully",
  USER_DEVICE_UPDATED: "User device updated successfully",
  TOKENS_FETCHED_SUCCESSFULLY: "Tokens fetched successfully",
  USER_DEVICE_DELETED: "User device deleted successfully",
  USER_CURRENT_LOCATION: "User Location added.",
  NO_BLOCKED_ACCOUNT_FOUND: "No blocked accounts found",
  NO_REPORTED_ACCOUNT_FOUND: "No reported accounts found",
  REMOVED_FROM_BLOCKED: "Removed from Blocked",
  BLOCKED: "Blocked",
  REPORTED: "You reported this user.",
  ALREADY_BLOCKED: "Already Blocked",
  ALREADY_REPORTED: "Already Reported",
  ISSUE_TYPES_FETCHED: "Issue types fetched",
  SUBMITTED_SUCCESSFULLY: "Submitted Successfully",
};

export const API_ERRORS = {
  DATABASE_ERROR: "Database error!",
  YOU_DO_NOT_HAVE_PERMISSION: "You don't have permissions for this action",
  USERS_NOT_FOUND: "Users not found",
  USER_NOT_FOUND: "User not found",
  PLEASE_PROVIDE_MIN_ONE_FIELD: "Please provide minimum one field to update",
  SEND_PROPER_JSON: "Please send proper json data",
  INVALID_OTP: "Invalid OTP",
  OTP_EXPIRED: "OTP expired",
  USER_EXIST_WITH_EMAIL: "User already exist with same email",
  USER_EXIST_WITH_PHONE: "User already exist with same phone",
  USER_EXIST: "User already exist",
  SEARCH_IS_REQUIRED: "Search is required",
  TALENT_FETCHED: "Talents fetched successfully",
  TALENTS_NOT_FOUND: "Talents not found",
  USER_DEVICE_NOT_FOUND: "User device not found",
  USER_ALREADY: "User is already",
  PHONE_NUMBER_DOSE_NOT_EXISTS: "Phone number does not exists",
  EMAIL_DOSE_NOT_EXISTS: "Email does not exists",
  NO_ACCOUNT_FOUND:
    "No account found with this email address. / This email isn’t registered yet",
  USER_ALREADY_INVITED: "The user has already been invited",
  USER_EXISTS_WITH_PHONE_EMAIL: "User already exist with same phone & email",
  NO_RECORDS_FOUND: "Unable to find record",
};

export const INTEGERS = {
  ZERO: 0,
  ONE: 1,
  TEN: 10,
};

export const STRINGS = {
  SERVER_LISTENING_ON_PORT: "Server is listening on port",
  USER: "user",
  EXIT: "exit",
  SIGINT: "SIGINT",
  SIGUSR1: "SIGUSR1",
  SIGUSR2: "SIGUSR2",
  SIGTERM: "SIGTERM",
  UNCAUGHT_EXCEPTION: "uncaughtException",
  ONE_TIME_PASSWORD: "One time password",
  DOES_NOT_EXIST: "Does not exist",
};

export const EUREKA = {
  ID: "user-service",
  CORE_SERVICE_REGISTERED: "User service registered",
  EUREKA_HOST: "eureka host ",
  STARTED: "started",
  DEBUG: "debug",
  SERVICE_PATH: "/eureka/apps/",
  DATA_CENTER_CLASS: "com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo",
  DATA_CENTER_NAME: "MyOwn",
};

export const AUTH_SERVICE =
  "http://ec2-3-6-195-112.ap-south-1.compute.amazonaws.com:8080/auth";

export const JWKS_FOLDER = "/.well-known/jwks.json";

export const OTP_DIGITS = 6;

export const OTP_EXPIRY = 5 * 60 * 1000;
