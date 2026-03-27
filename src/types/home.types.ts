import { FuelType, TransmissionType, BodyType, OwnershipType } from "@prisma/client";

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
    search?: string;   // search by title/description
    min_price?: string;
    max_price?: string;
    // Vehicle filter parameters
    fuel_type?: string;      // Comma-separated: "PETROL,DIESEL"
    transmission?: string;   // Comma-separated: "MANUAL,AUTOMATIC"
    body_type?: string;      // Comma-separated: "SEDAN,SUV,HATCHBACK"
    ownership?: string;      // Comma-separated: "FIRST_OWNER,SECOND_OWNER"
    min_year?: string;
    max_year?: string;
    min_km?: string;
    max_km?: string;
};

// ─── Category ─────────────────────────────────────────────────────────────────

export type CreateCategoryDTO = {
    cat_name: string;
    cat_slug: string;
    cat_description?: string;
    cat_is_active?: boolean;
};
