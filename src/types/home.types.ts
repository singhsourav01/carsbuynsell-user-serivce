// ─── Home / Listings Query ────────────────────────────────────────────────────

export type HomeQueryDTO = {
    category?: string; // category slug or cat_id
    type?: string;     // ListingType: AUCTION | BUY_NOW
};

// ─── Listings (with pagination) ───────────────────────────────────────────────

export type ListingsQueryDTO = {
    category?: string; // filter by category slug OR cat_id (optional — omit for "All")
    type?: string;     // filter by ListingType (optional)
    page?: string;     // page number (default: 1)
    limit?: string;    // items per page (default: 12)
};

// ─── Category ─────────────────────────────────────────────────────────────────

export type CreateCategoryDTO = {
    cat_name: string;
    cat_slug: string;
    cat_description?: string;
    cat_is_active?: boolean;
};
