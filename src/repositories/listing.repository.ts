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

        const where: any = {};

        if (query.search) {
            where.OR = [
                { lst_title: { contains: query.search } },
                { lst_description: { contains: query.search } },
            ];
        }
        if (query.category) where.lst_category_id = query.category;
        if (query.type) where.lst_type = query.type as ListingType;
        if (query.status) where.lst_status = query.status as ListingStatus;
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
        const [listings, count] = await queryHandler(() =>
            prisma.$transaction([
                prisma.listings.findMany({
                    where: { lst_category_id: cat_id },
                    select: listingSelect,
                    take,
                    skip,
                    orderBy: { lst_created_at: "desc" },
                }),
                prisma.listings.count({ where: { lst_category_id: cat_id } }),
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
}

export default ListingRepository;
