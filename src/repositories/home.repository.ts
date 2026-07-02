import { ListingStatus, FuelType, TransmissionType, BodyType, OwnershipType, ListingType } from "@prisma/client";
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
     * Now supports vehicle detail filters: fuel_type, transmission, body_type, ownership, year, km
     */
    getActiveListings = async (query: ListingsQueryDTO) => {
        const page = Math.max(1, parseInt(query.page ?? "1", 10));
        const limit = Math.min(50, Math.max(1, parseInt(query.limit ?? "12", 10)));
        const skip = (page - 1) * limit;

        // Build dynamic where clause
    const where: any = {
  lst_status: ListingStatus.ACTIVE,
  OR: [
    {
      lst_type: ListingType.BUY_NOW,
    },
    {
      lst_type: ListingType.AUCTION,
      lst_auction_end: {
        gt: new Date(),
      },
    },
  ],
};

   

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

        // Search filter
        if (query.search) {
            where.OR = [
                { lst_title: { contains: query.search } },
                { lst_description: { contains: query.search } },
            ];
        }

        // Price range filter
        if (query.min_price || query.max_price) {
            where.lst_price = {};
            if (query.min_price) where.lst_price.gte = Number(query.min_price);
            if (query.max_price) where.lst_price.lte = Number(query.max_price);
        }

        // Vehicle details filters
        const vehicleFilters: any = {};
        
        if (query.fuel_type) {
            const fuelTypes = query.fuel_type.split(',').map(f => f.trim().toUpperCase()) as FuelType[];
            vehicleFilters.lvd_fuel_type = { in: fuelTypes };
        }
        
        if (query.transmission) {
            const transmissions = query.transmission.split(',').map(t => t.trim().toUpperCase()) as TransmissionType[];
            vehicleFilters.lvd_transmission = { in: transmissions };
        }
        
        if (query.body_type) {
            const bodyTypes = query.body_type.split(',').map(b => b.trim().toUpperCase()) as BodyType[];
            vehicleFilters.lvd_body_type = { in: bodyTypes };
        }
        
        if (query.ownership) {
            const ownerships = query.ownership.split(',').map(o => o.trim().toUpperCase()) as OwnershipType[];
            vehicleFilters.lvd_ownership = { in: ownerships };
        }
        
        if (query.min_year || query.max_year) {
            vehicleFilters.lvd_year = {};
            if (query.min_year) vehicleFilters.lvd_year.gte = Number(query.min_year);
            if (query.max_year) vehicleFilters.lvd_year.lte = Number(query.max_year);
        }
        
        if (query.min_km || query.max_km) {
            vehicleFilters.lvd_kilometers = {};
            if (query.min_km) vehicleFilters.lvd_kilometers.gte = Number(query.min_km);
            if (query.max_km) vehicleFilters.lvd_kilometers.lte = Number(query.max_km);
        }

        // Apply vehicle filters if any exist
        if (Object.keys(vehicleFilters).length > 0) {
            where.vehicle_details = vehicleFilters;
        }

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
