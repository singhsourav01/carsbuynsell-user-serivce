import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";
import { LISTING_ERRORS } from "../constants/listing.constant";
import ListingImageRepository from "../repositories/listingImage.repository";
import ListingRepository from "../repositories/listing.repository";

class ListingImageService {
    private listingImageRepository: ListingImageRepository;
    private listingRepository: ListingRepository;

    constructor() {
        this.listingImageRepository = new ListingImageRepository();
        this.listingRepository = new ListingRepository();
    }

    addImages = async (lst_id: string, seller_id: string, image_urls: string[]) => {
        const listing = await this.listingRepository.findByIdRaw(lst_id);
        if (!listing)
            throw new ApiError(StatusCodes.NOT_FOUND, LISTING_ERRORS.LISTING_NOT_FOUND);
        if (listing.lst_seller_id !== seller_id)
            throw new ApiError(StatusCodes.FORBIDDEN, "You are not the owner of this listing");
        if (!image_urls || image_urls.length === 0)
            throw new ApiError(StatusCodes.BAD_REQUEST, LISTING_ERRORS.PROVIDE_AT_LEAST_ONE_IMAGE);

        return this.listingImageRepository.addImages(lst_id, image_urls);
    };

    deleteImage = async (lst_id: string, limg_id: string, seller_id: string) => {
        const listing = await this.listingRepository.findByIdRaw(lst_id);
        if (!listing)
            throw new ApiError(StatusCodes.NOT_FOUND, LISTING_ERRORS.LISTING_NOT_FOUND);
        if (listing.lst_seller_id !== seller_id)
            throw new ApiError(StatusCodes.FORBIDDEN, "You are not the owner of this listing");

        const image = await this.listingImageRepository.findById(limg_id);
        if (!image || image.limg_listing_id !== lst_id)
            throw new ApiError(StatusCodes.NOT_FOUND, LISTING_ERRORS.IMAGE_NOT_FOUND);

        return this.listingImageRepository.delete(limg_id);
    };

    reorderImage = async (lst_id: string, limg_id: string, seller_id: string, order: number) => {
        const listing = await this.listingRepository.findByIdRaw(lst_id);
        if (!listing)
            throw new ApiError(StatusCodes.NOT_FOUND, LISTING_ERRORS.LISTING_NOT_FOUND);
        if (listing.lst_seller_id !== seller_id)
            throw new ApiError(StatusCodes.FORBIDDEN, "You are not the owner of this listing");

        const image = await this.listingImageRepository.findById(limg_id);
        if (!image || image.limg_listing_id !== lst_id)
            throw new ApiError(StatusCodes.NOT_FOUND, LISTING_ERRORS.IMAGE_NOT_FOUND);

        return this.listingImageRepository.reorder(limg_id, order);
    };
}

export default ListingImageService;
