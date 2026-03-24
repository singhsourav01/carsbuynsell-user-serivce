export const USER_VEHICLE_RECORD_ERRORS = {
    RECORD_NOT_FOUND: "Vehicle record not found",
    NOT_OWNER: "You are not the owner of this vehicle record",
    TITLE_REQUIRED: "Vehicle title is required",
    CATEGORY_REQUIRED: "Vehicle category is required",
    BASE_PRICE_REQUIRED: "Base price is required",
};

export const USER_VEHICLE_RECORD_RESPONSES = {
    RECORD_CREATED: "Vehicle record created successfully",
    RECORD_FETCHED: "Vehicle record fetched successfully",
    RECORDS_FETCHED: "Vehicle records fetched successfully",
    RECORD_UPDATED: "Vehicle record updated successfully",
    RECORD_DELETED: "Vehicle record deleted successfully",
};

export const userVehicleRecordSelect = {
    uvr_id: true,
    uvr_user_id: true,
    uvr_title: true,
    uvr_description: true,
    uvr_category: true,
    uvr_base_price: true,
    uvr_created_at: true,
    uvr_updated_at: true,
    user: {
        select: {
            user_id: true,
            user_full_name: true,
            user_profile_image_file_id: true,
        },
    },
};
