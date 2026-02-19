export const SUBSCRIPTION_ERRORS = {
    PLAN_NOT_FOUND: "Subscription plan not found",
    SUBSCRIPTION_NOT_FOUND: "No active subscription found",
    ALREADY_SUBSCRIBED: "You already have an active subscription",
};

export const SUBSCRIPTION_RESPONSES = {
    PLANS_FETCHED: "Subscription plans fetched successfully",
    SUBSCRIPTION_PURCHASED: "Subscription purchased successfully",
    SUBSCRIPTION_FETCHED: "Subscription fetched successfully",
};

export const subscriptionSelect = {
    sub_id: true,
    sub_user_id: true,
    sub_status: true,
    sub_starts_at: true,
    sub_expires_at: true,
    sub_created_at: true,
    plan: {
        select: {
            sp_id: true,
            sp_name: true,
            sp_price: true,
            sp_duration: true,
            sp_description: true,
        },
    },
};
