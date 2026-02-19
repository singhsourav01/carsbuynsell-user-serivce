export const BID_ERRORS = {
    BID_TOO_LOW: "Bid amount must be higher than the current bid plus minimum increment",
    SUBSCRIPTION_REQUIRED: "An active subscription is required to place a bid",
    CANNOT_BID_OWN_LISTING: "You cannot bid on your own listing",
    BIDS_NOT_FOUND: "No bids found for this listing",
};

export const BID_RESPONSES = {
    BID_PLACED: "Bid placed successfully",
    BIDS_FETCHED: "Bids fetched successfully",
};

export const bidSelect = {
    bid_id: true,
    bid_listing_id: true,
    bid_amount: true,
    bid_created_at: true,
    bidder: {
        select: {
            user_id: true,
            user_full_name: true,
            user_profile_image_file_id: true,
        },
    },
};
