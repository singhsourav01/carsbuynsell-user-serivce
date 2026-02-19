export const userSelect = {
  user_id: true,
  user_full_name: true,
  user_email: true,
  user_bio: true,
  user_role: true,
  user_primary_country_id: true,
  user_primary_phone: true,
  user_admin_status: true,
  user_phone_verified: true,
  user_email_verified: true,
  user_profile_image_file_id: true,
  is_private_user: true,
};

export const userDeepSelect = {
  user_id: true,
  user_full_name: true,
  user_email: true,
  user_gender: true,
  user_dob: true,
  user_height: true,
  user_bio: true,
  user_role: true,
  user_primary_country_id: true,
  user_primary_phone: true,
  user_admin_status: true,
  user_profile_image_file_id: true,
  user_selfie_file_id: true,
  is_private_user: true,
  user_portfolio: {
    select: {
      up_id: true,
      up_file_id: true,
    },
  },
};
