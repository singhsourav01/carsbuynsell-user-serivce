export const SUBSCRIPTION_PRICE = 10000; // Fixed price in INR (rupees)
export const SUBSCRIPTION_LIMIT = 3;      // Max active vehicle engagements at a time

export const SUBSCRIPTION_ERRORS = {
    PLAN_NOT_FOUND: "Subscription plan not found",
    SUBSCRIPTION_NOT_FOUND: "No active subscription found",
    ALREADY_SUBSCRIBED: "You already have an active subscription with available engagement slots",
    PAYMENT_FAILED: "Payment verification failed",
    INVALID_SIGNATURE: "Invalid payment signature",
    USES_EXHAUSTED: "All 3 engagement slots are in use. Wait for an auction to close or purchase a new subscription",
    ENGAGEMENT_LIMIT_REACHED: "You have reached the maximum of 3 active engagements. Wait for an auction to close or purchase a new subscription",
    PENDING_SUB_NOT_FOUND: "No pending subscription found for this order",
};

export const SUBSCRIPTION_RESPONSES = {
    PLANS_FETCHED: "Subscription plans fetched successfully",
    SUBSCRIPTION_PURCHASED: "Subscription purchased successfully",
    SUBSCRIPTION_FETCHED: "Subscription fetched successfully",
    ORDER_CREATED: "Razorpay order created successfully",
    PAYMENT_VERIFIED: "Payment verified and subscription activated",
};

export const subscriptionSelect = {
    sub_id: true,
    sub_user_id: true,
    sub_status: true,
    sub_starts_at: true,
    sub_expires_at: true,
    sub_remaining_uses: true,
    sub_razorpay_order_id: true,
    sub_razorpay_payment_id: true,
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

export const engagementSelect = {
    eng_id: true,
    eng_user_id: true,
    eng_subscription_id: true,
    eng_listing_id: true,
    eng_type: true,
    eng_status: true,
    eng_created_at: true,
    eng_closed_at: true,
};

