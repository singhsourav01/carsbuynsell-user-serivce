import { ListingStatus, ListingType, FuelType, TransmissionType, BodyType, OwnershipType } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { listingSelect } from "../constants/listing.constant";
import { queryHandler } from "../utils/helper";
import { createListingType, ListingQueryDTO, updateListingType } from "../types/listing.types";

class ListingRepository {
    findAll = async (query: ListingQueryDTO) => {
        const page = Number(query.page || "1");
        const take = Number(query.page_size || "10");
        const skip = (page - 1) * take;

        // Default to ACTIVE status unless explicitly specified (admin may want to see all)
        const where: any = {
            lst_status: query.status ? query.status as ListingStatus : ListingStatus.ACTIVE
        };

        if (query.search) {
            where.OR = [
                { lst_title: { contains: query.search } },
                { lst_description: { contains: query.search } },
            ];
        }
        if (query.category) where.lst_category_id = query.category;
        if (query.type) where.lst_type = query.type as ListingType;
        if (query.is_featured === "true") where.lst_is_featured = true;
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

        const [listings, count] = await queryHandler(() =>
            prisma.$transaction([
                prisma.listings.findMany({
                    where,
                    select: listingSelect,
                    take,
                    skip,
                    orderBy: { lst_created_at: "desc" },
                }),
                prisma.listings.count({ where }),
            ])
        );

        return { listings, count, page, take };
    };

    findById = async (lst_id: string) => {
        return queryHandler(() =>
            prisma.listings.findUnique({
                where: { lst_id },
                select: listingSelect,
            })
        );
    };

    findByIdRaw = async (lst_id: string) => {
        return queryHandler(() =>
            prisma.listings.findUnique({ where: { lst_id } })
        );
    };

    create = async (data: createListingType) => {
        return queryHandler(() =>
            prisma.listings.create({
                data: data as any,
                select: listingSelect,
            })
        );
    };

    update = async (lst_id: string, data: updateListingType) => {
        return queryHandler(() =>
            prisma.listings.update({
                where: { lst_id },
                data: data as any,
                select: listingSelect,
            })
        );
    };

    delete = async (lst_id: string) => {
        return queryHandler(() =>
            prisma.listings.delete({ where: { lst_id } })
        );
    };

    findBySellerId = async (seller_id: string, page: number, take: number) => {
        const skip = (page - 1) * take;
        const [listings, count] = await queryHandler(() =>
            prisma.$transaction([
                prisma.listings.findMany({
                    where: { lst_seller_id: seller_id },
                    select: listingSelect,
                    take,
                    skip,
                    orderBy: { lst_created_at: "desc" },
                }),
                prisma.listings.count({ where: { lst_seller_id: seller_id } }),
            ])
        );
        return { listings, count, page, take };
    };

    getListingByCategoryId = async (cat_id: string, page: number, take: number) => {
        const skip = (page - 1) * take;
        const where = { lst_category_id: cat_id, lst_status: ListingStatus.ACTIVE };
        const [listings, count] = await queryHandler(() =>
            prisma.$transaction([
                prisma.listings.findMany({
                    where,
                    select: listingSelect,
                    take,
                    skip,
                    orderBy: { lst_created_at: "desc" },
                }),
                prisma.listings.count({ where }),
            ])
        );
        return { listings, count, page, take };
    };

    findFeatured = async () => {
        return queryHandler(() =>
            prisma.listings.findMany({
                where: { lst_is_featured: true, lst_status: ListingStatus.ACTIVE },
                select: listingSelect,
                take: 10,
                orderBy: { lst_updated_at: "desc" },
            })
        );
    };

    incrementViewCount = async (lst_id: string) => {
        return queryHandler(() =>
            prisma.listings.update({
                where: { lst_id },
                data: { lst_view_count: { increment: 1 } },
            })
        );
    };

    // Vehicle details methods
    createVehicleDetails = async (listing_id: string, data: {
        fuel_type?: FuelType;
        transmission?: TransmissionType;
        body_type?: BodyType;
        ownership?: OwnershipType;
        year?: number;
        kilometers?: number;
    }) => {
        return queryHandler(() =>
            prisma.listing_vehicle_details.create({
                data: {
                    lvd_listing_id: listing_id,
                    lvd_fuel_type: data.fuel_type,
                    lvd_transmission: data.transmission,
                    lvd_body_type: data.body_type,
                    lvd_ownership: data.ownership,
                    lvd_year: data.year,
                    lvd_kilometers: data.kilometers,
                },
            })
        );
    };

    updateVehicleDetails = async (listing_id: string, data: {
        fuel_type?: FuelType;
        transmission?: TransmissionType;
        body_type?: BodyType;
        ownership?: OwnershipType;
        year?: number;
        kilometers?: number;
    }) => {
        return queryHandler(() =>
            prisma.listing_vehicle_details.upsert({
                where: { lvd_listing_id: listing_id },
                create: {
                    lvd_listing_id: listing_id,
                    lvd_fuel_type: data.fuel_type,
                    lvd_transmission: data.transmission,
                    lvd_body_type: data.body_type,
                    lvd_ownership: data.ownership,
                    lvd_year: data.year,
                    lvd_kilometers: data.kilometers,
                },
                update: {
                    lvd_fuel_type: data.fuel_type,
                    lvd_transmission: data.transmission,
                    lvd_body_type: data.body_type,
                    lvd_ownership: data.ownership,
                    lvd_year: data.year,
                    lvd_kilometers: data.kilometers,
                },
            })
        );
    };

    /**
     * Closes an auction and restores votes to all participating bidders.
     * Sets listing status to SOLD or EXPIRED, closes all active engagements,
     * and increments sub_remaining_uses for each affected subscription.
     */
    closeAuction = async (listing_id: string, new_status: "SOLD" | "EXPIRED") => {
        return queryHandler(async () => {
            return await prisma.$transaction(async (tx) => {
                // Get the listing
                const listing = await tx.listings.findUnique({
                    where: { lst_id: listing_id },
                });

                if (!listing) throw new Error("LISTING_NOT_FOUND");
                if (listing.lst_type !== "AUCTION") throw new Error("LISTING_NOT_AUCTION");
                if (listing.lst_status !== "ACTIVE") throw new Error("LISTING_NOT_ACTIVE");

                // Find all active engagements for this listing
                const activeEngagements = await tx.engagements.findMany({
                    where: {
                        eng_listing_id: listing_id,
                        eng_status: "ACTIVE",
                    },
                });

                // Close all active engagements and restore votes
                for (const engagement of activeEngagements) {
                    // Mark engagement as closed
                    await tx.engagements.update({
                        where: { eng_id: engagement.eng_id },
                        data: {
                            eng_status: "CLOSED",
                            eng_closed_at: new Date(),
                        },
                    });

                    // Restore vote to the subscription (increment remaining uses)
                    await tx.subscriptions.update({
                        where: { sub_id: engagement.eng_subscription_id },
                        data: {
                            sub_remaining_uses: { increment: 1 },
                        },
                    });
                }

                // Update listing status
                const updatedListing = await tx.listings.update({
                    where: { lst_id: listing_id },
                    data: { lst_status: new_status },
                    select: listingSelect,
                });

                return {
                    listing: updatedListing,
                    engagements_closed: activeEngagements.length,
                };
            });
        });
    };

    /**
     * Find all auctions with pagination and filters (Admin)
     */
    findAllAuctions = async (query: {
        page?: string;
        page_size?: string;
        search?: string;
        status?: string;
        category?: string;
    }) => {
        const page = Number(query.page || "1");
        const take = Number(query.page_size || "10");
        const skip = (page - 1) * take;

        const where: any = {
            lst_type: ListingType.AUCTION,
        };

        // Status filter (admin can see all statuses)
        if (query.status) {
            where.lst_status = query.status as ListingStatus;
        }

        if (query.search) {
            where.OR = [
                { lst_title: { contains: query.search } },
                { lst_description: { contains: query.search } },
            ];
        }

        if (query.category) {
            where.lst_category_id = query.category;
        }

        const [auctions, count] = await queryHandler(() =>
            prisma.$transaction([
                prisma.listings.findMany({
                    where,
                    select: {
                        ...listingSelect,
                        _count: {
                            select: {
                                bids: true,
                                engagements: true,
                            },
                        },
                    },
                    take,
                    skip,
                    orderBy: { lst_updated_at: "desc" },
                }),
                prisma.listings.count({ where }),
            ])
        );

        return { auctions, count, page, take };
    };

    /**
     * Get auction details with all participants/bidders (Admin)
     */
    findAuctionWithParticipants = async (lst_id: string) => {
        return queryHandler(async () => {
            const auction = await prisma.listings.findUnique({
                where: { lst_id },
                select: {
                    ...listingSelect,
                    bids: {
                        select: {
                            bid_id: true,
                            bid_amount: true,
                            bid_created_at: true,
                            bidder: {
                                select: {
                                    user_id: true,
                                    user_full_name: true,
                                    user_email: true,
                                    user_primary_phone: true,
                                    user_profile_image_file_id: true,
                                },
                            },
                        },
                        orderBy: { bid_amount: "desc" },
                    },
                    engagements: {
                        select: {
                            eng_id: true,
                            eng_status: true,
                            eng_created_at: true,
                            eng_closed_at: true,
                            user: {
                                select: {
                                    user_id: true,
                                    user_full_name: true,
                                    user_email: true,
                                    user_primary_phone: true,
                                    user_profile_image_file_id: true,
                                },
                            },
                        },
                        orderBy: { eng_created_at: "desc" },
                    },
                },
            });

            return auction;
        });
    };

    /**
     * Find all BUY_NOW listings with pagination and filters (Admin)
     */
    findAllBuyNow = async (query: {
        page?: string;
        page_size?: string;
        search?: string;
        status?: string;
        category?: string;
    }) => {
        const page = Number(query.page || "1");
        const take = Number(query.page_size || "10");
        const skip = (page - 1) * take;

        const where: any = {
            lst_type: ListingType.BUY_NOW,
        };

        if (query.status) {
            where.lst_status = query.status as ListingStatus;
        }

        if (query.search) {
            where.OR = [
                { lst_title: { contains: query.search } },
                { lst_description: { contains: query.search } },
            ];
        }

        if (query.category) {
            where.lst_category_id = query.category;
        }

        const [buy_now_listings, count] = await queryHandler(() =>
            prisma.$transaction([
                prisma.listings.findMany({
                    where,
                    select: listingSelect,
                    take,
                    skip,
                    orderBy: { lst_created_at: "desc" },
                }),
                prisma.listings.count({ where }),
            ])
        );

        return { buy_now_listings, count, page, take };
    };

    /**
     * Get BUY_NOW listing details by ID (Admin)
     */
    findBuyNowById = async (lst_id: string) => {
        return queryHandler(async () => {
            const listing = await prisma.listings.findUnique({
                where: { lst_id },
                select: listingSelect,
            });
            return listing;
        });
    };
}

export default ListingRepository;
