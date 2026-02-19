import { ApiResponse, asyncHandler } from "common-microservices-utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { LISTING_RESPONSES } from "../constants/listing.constant";
import ListingService from "../services/listing.service";
import { CreateListingDTO, ListingQueryDTO, UpdateListingDTO } from "../types/listing.types";

interface AuthRequest extends Request {
    user?: any;
}

class ListingController {
    private listingService: ListingService;

    constructor() {
        this.listingService = new ListingService();
    }

    getAll = asyncHandler(async (req: Request, res: Response) => {
        const query = req.query as ListingQueryDTO;
        const result = await this.listingService.getAll(query);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, result, LISTING_RESPONSES.LISTINGS_FETCHED));
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const lst_id = String(req.params.id);
        const listing = await this.listingService.getById(lst_id);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, listing, LISTING_RESPONSES.LISTING_FETCHED));
    });

    create = asyncHandler(async (req: AuthRequest, res: Response) => {
        // const { user_id } = req.user;
        const dto: CreateListingDTO = req.body;
        const listing = await this.listingService.create("7cc7535e-a808-4c17-b1b7-d07621c430a7", dto);
        return res
            .status(StatusCodes.CREATED)
            .json(new ApiResponse(StatusCodes.CREATED, listing, LISTING_RESPONSES.LISTING_CREATED));
    });

    update = asyncHandler(async (req: AuthRequest, res: Response) => {
        const lst_id = String(req.params.id);
        const { user_id } = req.user;
        const dto: UpdateListingDTO = req.body;
        const listing = await this.listingService.update(lst_id, user_id, dto);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, listing, LISTING_RESPONSES.LISTING_UPDATED));
    });

    delete = asyncHandler(async (req: AuthRequest, res: Response) => {
        const lst_id = String(req.params.id);
        const { user_id } = req.user;
        await this.listingService.delete(lst_id, user_id);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, null, LISTING_RESPONSES.LISTING_DELETED));
    });
    getListingByCategoryId = asyncHandler(async (req: Request, res: Response) => {
        const cat_id = String(req.params.id);
        const page = parseInt(req.query.page as string) || 1;
        const take = parseInt(req.query.take as string) || 10;
        const result = await this.listingService.getListingByCategoryId(cat_id, page, take);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, result, LISTING_RESPONSES.LISTINGS_FETCHED));
    });
}

export default ListingController;
