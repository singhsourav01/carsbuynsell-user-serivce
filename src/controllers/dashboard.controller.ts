import { ApiResponse, asyncHandler } from "common-microservices-utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { API_RESPONSES } from "../constants/app.constant";
import DashboardService from "../services/dashboard.service";

class DashboardController {
    private dashboardService: DashboardService;

    constructor() {
        this.dashboardService = new DashboardService();
    }

    /**
     * GET /admin/dashboard
     * Returns aggregated stats (total users, active listings, live auctions,
     * monthly revenue, pending approvals, deals this week) + recent sells.
     */
    getDashboard = asyncHandler(async (_req: Request, res: Response) => {
        const data = await this.dashboardService.getDashboard();
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, data, API_RESPONSES.DASHBOARD_FETCHED));
    });
}

export default DashboardController;
