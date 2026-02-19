import HomeRepository from "../repositories/home.repository";
import { HomeQueryDTO } from "../types/home.types";

class HomeService {
    private homeRepository: HomeRepository;

    constructor() {
        this.homeRepository = new HomeRepository();
    }

    getHomePage = async (query: HomeQueryDTO) => {
        const [featured, recent, categories] = await Promise.all([
            this.homeRepository.getFeaturedListings(),
            this.homeRepository.getActiveListings(query.category, query.type),
            this.homeRepository.getCategories(),
        ]);

        return { featured, recent, categories };
    };

    getCategories = async () => {
        return this.homeRepository.getCategories();
    };
}

export default HomeService;
