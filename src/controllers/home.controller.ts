import { ApiResponse, asyncHandler } from "common-microservices-utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import HomeService from "../services/home.service";
import { HomeQueryDTO } from "../types/home.types";

class HomeController {
    private homeService: HomeService;

    constructor() {
        this.homeService = new HomeService();
    }

    getHome = asyncHandler(async (req: Request, res: Response) => {
        const query = req.query as HomeQueryDTO;
        const data = await this.homeService.getHomePage(query);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, data, "Home page data fetched successfully"));
    });

    getCategories = asyncHandler(async (_req: Request, res: Response) => {
        const categories = await this.homeService.getCategories();
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, categories, "Categories fetched successfully"));
    });
}

export default HomeController;
