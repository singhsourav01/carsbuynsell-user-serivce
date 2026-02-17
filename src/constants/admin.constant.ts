export const adminGetAllUserPick = [
  "user_id",
  "user_email",
  "user_primary_phone",
  "user_admin_status",
  "user_full_name",
];

export const userPortfolioPick = ["up_user_id", "up_file_id"];
export const userLocationsPick = [
  "ul_user_id",
  "ul_country_id",
  "ul_state_id",
  "ul_city_id",
  "ul_lat",
  "ul_long",
  "ul_address",
  "ul_location_type",
];
export const userTalentsPick = [
  "ut_user_id",
  "ut_talent_id",
  "talent_category",
];
export const userVideoLinksPick = ["uvl_user_id", "uvl_url"];
export const userSocialLinksPick = ["usl_user_id", "usl_url", "usl_type_id"];
