import prisma from "../configs/prisma.config";
import { queryHandler } from "../utils/helper";

class ListingImageRepository {
    addImages = async (listing_id: string, image_urls: string[]) => {
        // Get current max order
        const maxOrderResult = await queryHandler(() =>
            prisma.listing_images.aggregate({
                where: { limg_listing_id: listing_id },
                _max: { limg_order: true },
            })
        );
        const startOrder = (maxOrderResult._max.limg_order ?? -1) + 1;

        const data = image_urls.map((url, idx) => ({
            limg_listing_id: listing_id,
            limg_url: url,
            limg_order: startOrder + idx,
        }));

        return queryHandler(() =>
            prisma.listing_images.createMany({ data })
        );
    };

    findById = async (limg_id: string) => {
        return queryHandler(() =>
            prisma.listing_images.findUnique({ where: { limg_id } })
        );
    };

    delete = async (limg_id: string) => {
        return queryHandler(() =>
            prisma.listing_images.delete({ where: { limg_id } })
        );
    };

    reorder = async (limg_id: string, order: number) => {
        return queryHandler(() =>
            prisma.listing_images.update({
                where: { limg_id },
                data: { limg_order: order },
            })
        );
    };
}

export default ListingImageRepository;
