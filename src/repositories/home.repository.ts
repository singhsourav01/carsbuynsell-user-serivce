import { ListingStatus } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { listingSelect } from "../constants/listing.constant";
import { queryHandler } from "../utils/helper";
import { CreateCategoryDTO, ListingsQueryDTO } from "../types/home.types";

class HomeRepository {
    // ─── Listings ────────────────────────────────────────────────────────────────

    getFeaturedListings = async () => {
        return queryHandler(() =>
            prisma.listings.findMany({
                where: { lst_is_featured: true, lst_status: ListingStatus.ACTIVE },
                select: listingSelect,
                take: 10,
                orderBy: { lst_updated_at: "desc" },
            })
        );
    };

    /**
     * Paginated listings with optional category (slug OR id) and type filters.
     * Passing no `category` returns ALL active listings (the "All" tab).
     */
    getActiveListings = async (query: ListingsQueryDTO) => {
        const page = Math.max(1, parseInt(query.page ?? "1", 10));
        const limit = Math.min(50, Math.max(1, parseInt(query.limit ?? "12", 10)));
        const skip = (page - 1) * limit;

        // Build dynamic where clause
        const where: any = { lst_status: ListingStatus.ACTIVE };

        if (query.category) {
            // Support lookup by slug (string) OR by UUID (id)
            const isUUID = /^[0-9a-f-]{36}$/i.test(query.category);
            if (isUUID) {
                where.lst_category_id = query.category;
            } else {
                // Filter via relation: listings where category.cat_name = value
                where.category = { cat_name: query.category };
            }
        }

        if (query.type) where.lst_type = query.type;

        const [data, total] = await Promise.all([
            queryHandler(() =>
                prisma.listings.findMany({
                    where,
                    select: listingSelect,
                    skip,
                    take: limit,
                    orderBy: { lst_created_at: "desc" },
                })
            ),
            queryHandler(() => prisma.listings.count({ where })),
        ]);

        return {
            data,
            pagination: {
                total,
                page,
                limit,
                totalPages: Math.ceil((total as number) / limit),
                hasNextPage: page < Math.ceil((total as number) / limit),
                hasPrevPage: page > 1,
            },
        };
    };

    // ─── Categories ──────────────────────────────────────────────────────────────

    /** Returns all ACTIVE categories (used for tabs / dropdowns). */
    getCategories = async () => {
        return queryHandler(() =>
            prisma.categories.findMany({
                where: { cat_is_active: true },
                orderBy: { cat_name: "asc" },
                select: {
                    cat_id: true,
                    cat_name: true,
                    cat_slug: true,
                    cat_description: true,
                    cat_is_active: true,
                },
            })
        );
    };

    /** Returns a single category by its UUID. */
    getCategoryById = async (cat_id: string) => {
        return queryHandler(() =>
            prisma.categories.findUnique({
                where: { cat_id },
            })
        );
    };

    /** Creates a new category. */
    createCategory = async (data: CreateCategoryDTO) => {
        return queryHandler(() =>
            prisma.categories.create({
                data: {
                    cat_name: data.cat_name,
                    cat_slug: data.cat_slug.toLowerCase().replace(/\s+/g, "-"),
                    cat_description: data.cat_description,
                    cat_is_active: data.cat_is_active ?? true,
                },
            })
        );
    };

    /** Updates a category by id. */
    updateCategory = async (cat_id: string, data: Partial<CreateCategoryDTO>) => {
        return queryHandler(() =>
            prisma.categories.update({
                where: { cat_id },
                data: {
                    ...(data.cat_name && { cat_name: data.cat_name }),
                    ...(data.cat_slug && { cat_slug: data.cat_slug.toLowerCase().replace(/\s+/g, "-") }),
                    ...(data.cat_description !== undefined && { cat_description: data.cat_description }),
                    ...(data.cat_is_active !== undefined && { cat_is_active: data.cat_is_active }),
                },
            })
        );
    };

    /** Toggles the cat_is_active flag. */
    toggleCategoryStatus = async (cat_id: string, current: boolean) => {
        return queryHandler(() =>
            prisma.categories.update({
                where: { cat_id },
                data: { cat_is_active: !current },
            })
        );
    };
}

export default HomeRepository;
