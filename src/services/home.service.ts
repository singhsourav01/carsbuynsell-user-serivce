import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";
import { API_ERRORS } from "../constants/app.constant";
import HomeRepository from "../repositories/home.repository";
import { CreateCategoryDTO, HomeQueryDTO, ListingsQueryDTO } from "../types/home.types";
import { getUserById, getFilesByIds } from "../api/user.api";

class HomeService {
    private homeRepository: HomeRepository;

    constructor() {
        this.homeRepository = new HomeRepository();
    }

        private populateSignedUrls = async (listings: any[]) => {
            const fileIds: string[] = [];
    
            // Collect all file IDs
            for (const listing of listings) {
                if (listing.images) {
                    for (const img of listing.images) {
                        if (img.limg_url) {
                            fileIds.push(img.limg_url);
                        }
                    }
                }
                if (listing.seller?.user_profile_image_file_id) {
                    fileIds.push(listing.seller.user_profile_image_file_id);
                }
            }
    
            if (fileIds.length === 0) return;
    
            try {
                const files = await getFilesByIds(fileIds);
                const fileMap = new Map<string, string>();
    
                if (files && Array.isArray(files)) {
                    for (const file of files) {
                        if (file.file_id && file.file_signed_url) {
                            fileMap.set(file.file_id, file.file_signed_url);
                        }
                    }
                }
    
                // Replace file IDs with signed URLs
                for (const listing of listings) {
                    if (listing.images) {
                        for (const img of listing.images) {
                            if (img.limg_url && fileMap.has(img.limg_url)) {
                                img.limg_url = fileMap.get(img.limg_url);
                            }
                        }
                    }
                    if (listing.seller?.user_profile_image_file_id) {
                        const signedUrl = fileMap.get(listing.seller.user_profile_image_file_id);
                        listing.seller.user_profile_image_file_id = signedUrl ?? null;
                    }
                }
            } catch (error) {
                console.error("Failed to fetch signed URLs:", error);
            }
        };

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
        const result = await this.homeRepository.getActiveListings(query);
        const listings = result.data || [];

        if (!Array.isArray(listings) || listings.length === 0) {
            return result;
        }

        // Populate signed URLs for listing images and seller profile
        await this.populateSignedUrls(listings);

        // Enrich listings with user portfolio images
        const enrichedListings = await Promise.all(
            listings.map(async (listing: any) => {
                try {
                    const portfolioFiles = await getUserById(listing.lst_seller_id);

                    const userPortfolio = Array.isArray(portfolioFiles)
                        ? portfolioFiles.map((file: any) => ({
                            file_id: file.file_id,
                            file_signed_url: file.file_signed_url
                        }))
                        : [];

                    return {
                        ...listing,
                        user_portfolio: userPortfolio
                    };
                } catch (error) {
                    console.error("Portfolio fetch failed for seller:", listing.lst_seller_id);
                    return {
                        ...listing,
                        user_portfolio: []
                    };
                }
            })
        );

        return {
            ...result,
            data: enrichedListings
        };
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
