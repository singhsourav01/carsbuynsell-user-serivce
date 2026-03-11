export const SUBSCRIPTION_PRICE = 10000; // Fixed price in INR (rupees)
export const SUBSCRIPTION_LIMIT = 3;      // Max bid/buy actions per subscription

export const SUBSCRIPTION_ERRORS = {
    PLAN_NOT_FOUND: "Subscription plan not found",
    SUBSCRIPTION_NOT_FOUND: "No active subscription found",
    ALREADY_SUBSCRIBED: "You already have an active subscription",
    PAYMENT_FAILED: "Payment verification failed",
    INVALID_SIGNATURE: "Invalid payment signature",
    USES_EXHAUSTED: "Your subscription has no remaining uses",
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

