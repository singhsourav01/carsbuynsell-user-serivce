import { ApiResponse, asyncHandler } from "common-microservices-utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { LISTING_RESPONSES } from "../constants/listing.constant";
import ListingImageService from "../services/listingImage.service";

interface AuthRequest extends Request {
    user?: any;
}

class ListingImageController {
    private listingImageService: ListingImageService;

    constructor() {
        this.listingImageService = new ListingImageService();
    }

    addImages = asyncHandler(async (req: AuthRequest, res: Response) => {
        const lst_id = String(req.params.id);
        const { user_id } = req.user;
        const { image_urls } = req.body;

        const result = await this.listingImageService.addImages(lst_id, user_id, image_urls);
        return res
            .status(StatusCodes.CREATED)
            .json(new ApiResponse(StatusCodes.CREATED, result, LISTING_RESPONSES.IMAGE_ADDED));
    });

    deleteImage = asyncHandler(async (req: AuthRequest, res: Response) => {
        const lst_id = String(req.params.id);
        const limg_id = String(req.params.imageId);
        const { user_id } = req.user;

        await this.listingImageService.deleteImage(lst_id, limg_id, user_id);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, null, LISTING_RESPONSES.IMAGE_DELETED));
    });

    reorderImage = asyncHandler(async (req: AuthRequest, res: Response) => {
        const lst_id = String(req.params.id);
        const limg_id = String(req.params.imageId);
        const { user_id } = req.user;
        const { order } = req.body;

        const result = await this.listingImageService.reorderImage(lst_id, limg_id, user_id, Number(order));
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, result, LISTING_RESPONSES.IMAGE_REORDERED));
    });
}

export default ListingImageController;
