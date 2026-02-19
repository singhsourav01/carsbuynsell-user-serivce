import { ListingStatus, ListingType } from "@prisma/client";
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
}

export default ListingRepository;
