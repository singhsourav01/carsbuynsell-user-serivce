export const ORDER_ERRORS = {
    ORDER_NOT_FOUND: "Order not found",
    ALREADY_PURCHASED: "This listing has already been purchased",
    SUBSCRIPTION_REQUIRED: "An active subscription is required to purchase",
};

export const ORDER_RESPONSES = {
    ORDER_CREATED: "Order created successfully",
    ORDERS_FETCHED: "Orders fetched successfully",
    ORDER_FETCHED: "Order fetched successfully",
};

export const orderSelect = {
    ord_id: true,
    ord_buyer_id: true,
    ord_listing_id: true,
    ord_amount: true,
    ord_status: true,
    ord_created_at: true,
    ord_updated_at: true,
    buyer: {
        select: {
            user_id: true,
            user_full_name: true,
            user_email: true,
        },
    },
    listing: {
        select: {
            lst_id: true,
            lst_title: true,
            lst_price: true,
            lst_type: true,
            lst_status: true,
        },
    },
};
