import { ApiResponse, asyncHandler } from "common-microservices-utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { API_RESPONSES } from "../constants/app.constant";
import HomeService from "../services/home.service";
import { HomeQueryDTO, ListingsQueryDTO } from "../types/home.types";

class HomeController {
    private homeService: HomeService;

    constructor() {
        this.homeService = new HomeService();
    }

    // ─── Home ─────────────────────────────────────────────────────────────────────

    /**
     * GET /home
     * Returns featured listings, first-page listings, and active categories
     * for the landing page widget.
     */
    getHome = asyncHandler(async (req: Request, res: Response) => {
        const query = req.query as HomeQueryDTO;
        const data = await this.homeService.getHomePage(query);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, data, "Home page data fetched successfully"));
    });

    // ─── Paginated Listing Feed ───────────────────────────────────────────────────

    /**
     * GET /listings?category=used-cars&type=BUY_NOW&page=1&limit=12
     * • category is OPTIONAL — omit for "All" vehicles.
     * • Supports slug ("used-cars") or UUID for category.
     */
    getListings = asyncHandler(async (req: Request, res: Response) => {
        const query = req.query as ListingsQueryDTO;
        const data = await this.homeService.getListings(query);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, data, API_RESPONSES.LISTINGS_FETCHED ?? "Listings fetched successfully"));
    });

    // ─── Categories ───────────────────────────────────────────────────────────────

    /**
     * GET /categories
     * Returns all active categories (for tab/dropdown rendering).
     */
    getCategories = asyncHandler(async (_req: Request, res: Response) => {
        const categories = await this.homeService.getCategories();
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, categories, API_RESPONSES.CATEGORIES_FETCHED));
    });

    /**
     * GET /category/:cat_id
     */
    getCategoryById = asyncHandler(async (req: Request, res: Response) => {
        const cat_id = req.params.cat_id as string;
        const category = await this.homeService.getCategoryById(cat_id);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, category, API_RESPONSES.CATEGORY_FETCHED));
    });

    /**
     * POST /category
     * Body: { cat_name, cat_slug, cat_description?, cat_is_active? }
     */
    createCategory = asyncHandler(async (req: Request, res: Response) => {
        const category = await this.homeService.createCategory(req.body);
        return res
            .status(StatusCodes.CREATED)
            .json(new ApiResponse(StatusCodes.CREATED, category, API_RESPONSES.CATEGORY_CREATED));
    });

    /**
     * PUT /category/:cat_id
     * Body: partial { cat_name?, cat_slug?, cat_description?, cat_is_active? }
     */
    updateCategory = asyncHandler(async (req: Request, res: Response) => {
        const cat_id = req.params.cat_id as string;
        const category = await this.homeService.updateCategory(cat_id, req.body);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, category, API_RESPONSES.CATEGORY_UPDATED));
    });

    /**
     * PATCH /category/:cat_id/toggle
     * Activates or deactivates a category.
     */
    toggleCategoryStatus = asyncHandler(async (req: Request, res: Response) => {
        const cat_id = req.params.cat_id as string;
        const category = await this.homeService.toggleCategoryStatus(cat_id);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, category, API_RESPONSES.CATEGORY_TOGGLED));
    });
}

export default HomeController;
