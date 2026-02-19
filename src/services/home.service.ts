import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";
import { API_ERRORS } from "../constants/app.constant";
import HomeRepository from "../repositories/home.repository";
import { CreateCategoryDTO, HomeQueryDTO, ListingsQueryDTO } from "../types/home.types";

class HomeService {
    private homeRepository: HomeRepository;

    constructor() {
        this.homeRepository = new HomeRepository();
    }

    // ─── Home Page ───────────────────────────────────────────────────────────────

    /**
     * Returns featured listings + first-page active listings + active categories
     * for the home/landing page widget.
     */
    getHomePage = async (query: HomeQueryDTO) => {
        const [featured, recent, categories] = await Promise.all([
            this.homeRepository.getFeaturedListings(),
            this.homeRepository.getActiveListings({ category: query.category, type: query.type }),
            this.homeRepository.getCategories(),
        ]);

        return { featured, recent, categories };
    };

    // ─── Listings (paginated) ─────────────────────────────────────────────────────

    /**
     * Paginated listing feed.
     * • category is OPTIONAL — omit to get all listings ("All" tab).
     * • category can be a slug (e.g. "used-cars") or a UUID.
     */
    getListings = async (query: ListingsQueryDTO) => {
        return this.homeRepository.getActiveListings(query);
    };

    // ─── Categories ──────────────────────────────────────────────────────────────

    getCategories = async () => {
        return this.homeRepository.getCategories();
    };

    getCategoryById = async (cat_id: any) => {
        const category = await this.homeRepository.getCategoryById(cat_id);
        if (!category) {
            throw new ApiError(StatusCodes.NOT_FOUND, API_ERRORS.CATEGORY_NOT_FOUND);
        }
        return category;
    };

    createCategory = async (data: CreateCategoryDTO) => {
        return this.homeRepository.createCategory(data);
    };

    updateCategory = async (cat_id: any, data: Partial<CreateCategoryDTO>) => {
        await this.getCategoryById(cat_id); // throws 404 if not found
        return this.homeRepository.updateCategory(cat_id, data);
    };

    toggleCategoryStatus = async (cat_id: any) => {
        const category = await this.getCategoryById(cat_id);
        return this.homeRepository.toggleCategoryStatus(cat_id, (category as any).cat_is_active);
    };
}

export default HomeService;
