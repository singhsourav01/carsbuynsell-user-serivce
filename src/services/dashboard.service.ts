import DashboardRepository from "../repositories/dashboard.repository";
import { DashboardResponse } from "../types/dashboard.types";

class DashboardService {
    private dashboardRepository: DashboardRepository;

    constructor() {
        this.dashboardRepository = new DashboardRepository();
    }

    /**
     * Fetches stats + recent sells in parallel and assembles the dashboard response.
     */
    getDashboard = async (): Promise<DashboardResponse> => {
        const [stats, recentSells] = await Promise.all([
            this.dashboardRepository.getStats(),
            this.dashboardRepository.getRecentSells(),
        ]);

        return { stats, recentSells };
    };
}

export default DashboardService;
