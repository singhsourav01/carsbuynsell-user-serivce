export const LISTING_ERRORS = {
    LISTING_NOT_FOUND: "Listing not found",
    LISTING_NOT_ACTIVE: "Listing is not active",
    LISTING_ALREADY_SOLD: "Listing has already been sold",
    LISTING_NOT_AUCTION: "Listing is not an auction",
    LISTING_NOT_BUY_NOW: "Listing does not support Buy Now",
    CANNOT_BID_OWN_LISTING: "You cannot bid on your own listing",
    CANNOT_BUY_OWN_LISTING: "You cannot buy your own listing",
    AUCTION_ENDED: "Auction has ended",
    AUCTION_NOT_ENDED: "Auction has not ended yet",
    IMAGE_NOT_FOUND: "Listing image not found",
    PROVIDE_AT_LEAST_ONE_IMAGE: "Please provide at least one image URL",
};

export const LISTING_RESPONSES = {
    LISTING_CREATED: "Listing created successfully",
    LISTING_FETCHED: "Listing fetched successfully",
    LISTINGS_FETCHED: "Listings fetched successfully",
    LISTING_UPDATED: "Listing updated successfully",
    LISTING_DELETED: "Listing deleted successfully",
    IMAGE_ADDED: "Image(s) added successfully",
    IMAGE_DELETED: "Image deleted successfully",
    IMAGE_REORDERED: "Image reordered successfully",
};

export const listingSelect = {
    lst_id: true,
    lst_seller_id: true,
    lst_category_id: true,
    lst_title: true,
    lst_description: true,
    lst_type: true,
    lst_status: true,
    lst_price: true,
    lst_current_bid: true,
    lst_min_increment: true,
    lst_auction_end: true,
    lst_is_featured: true,
    lst_bid_count: true,
    lst_view_count: true,
    lst_created_at: true,
    lst_updated_at: true,
    seller: {
        select: {
            user_id: true,
            user_full_name: true,
            user_profile_image_file_id: true,
        },
    },
    category: {
        select: {
            cat_id: true,
            cat_name: true,
            cat_slug: true,
        },
    },
    images: {
        select: {
            limg_id: true,
            limg_url: true,
            limg_order: true,
        },
        orderBy: { limg_order: "asc" as const },
    },
};
