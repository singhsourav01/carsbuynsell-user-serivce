import { ListingStatus } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { listingSelect } from "../constants/listing.constant";
import { queryHandler } from "../utils/helper";

class HomeRepository {
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

    getActiveListings = async (category?: string, type?: string) => {
        const where: any = { lst_status: ListingStatus.ACTIVE };
        if (category) where.lst_category_id = category;
        if (type) where.lst_type = type;

        return queryHandler(() =>
            prisma.listings.findMany({
                where,
                select: listingSelect,
                take: 20,
                orderBy: { lst_created_at: "desc" },
            })
        );
    };

    getCategories = async () => {
        return queryHandler(() =>
            prisma.categories.findMany({
                where: { cat_is_active: true },
                orderBy: { cat_name: "asc" },
            })
        );
    };
}

export default HomeRepository;
