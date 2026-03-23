import ProfileRepository from "../repositories/profile.repository";
import { getFilesByIds } from "../api/user.api";

export interface ListingImage {
    limg_id: string;
    limg_url: string;
    limg_order: number;
}

export interface OrderHistoryItem {
    id: string;
    type: "BID" | "ORDER";
    amount: number;
    status: string;
    created_at: Date;
    listing: {
        lst_id: string;
        lst_title: string;
        lst_price: number;
        lst_type: string;
        lst_status: string;
        images: ListingImage[];
    };
}

export interface OrderHistoryResponse {
    history: OrderHistoryItem[];
    count: number;
    page: number;
    take: number;
}

class ProfileService {
    private profileRepository: ProfileRepository;

    constructor() {
        this.profileRepository = new ProfileRepository();
    }

    getOrderHistory = async (
        user_id: string,
        page: number,
        take: number
    ): Promise<OrderHistoryResponse> => {
        const skip = (page - 1) * take;

        // Fetch bids, orders, and counts in parallel
        const [bids, orders, bidCount, orderCount] = await Promise.all([
            this.profileRepository.findBidsByUserId(user_id),
            this.profileRepository.findOrdersByUserId(user_id),
            this.profileRepository.countBidsByUserId(user_id),
            this.profileRepository.countOrdersByUserId(user_id),
        ]);

        // Transform bids to common format
        const bidItems: OrderHistoryItem[] = bids.map((bid: any) => ({
            id: bid.bid_id,
            type: "BID" as const,
            amount: Number(bid.bid_amount),
            status: "PLACED",
            created_at: bid.bid_created_at,
            listing: {
                lst_id: bid.listing.lst_id,
                lst_title: bid.listing.lst_title,
                lst_price: Number(bid.listing.lst_price),
                lst_type: bid.listing.lst_type,
                lst_status: bid.listing.lst_status,
                images: bid.listing.images || [],
            },
        }));

        // Transform orders to common format
        const orderItems: OrderHistoryItem[] = orders.map((order: any) => ({
            id: order.ord_id,
            type: "ORDER" as const,
            amount: Number(order.ord_amount),
            status: order.ord_status,
            created_at: order.ord_created_at,
            listing: {
                lst_id: order.listing.lst_id,
                lst_title: order.listing.lst_title,
                lst_price: Number(order.listing.lst_price),
                lst_type: order.listing.lst_type,
                lst_status: order.listing.lst_status,
                images: order.listing.images || [],
            },
        }));

        // Combine and sort by date (newest first)
        const combined = [...bidItems, ...orderItems].sort(
            (a, b) => b.created_at.getTime() - a.created_at.getTime()
        );

        // Apply pagination
        const paginated = combined.slice(skip, skip + take);

        // Populate signed URLs for images
        await this.populateSignedUrls(paginated);

        const totalCount = bidCount + orderCount;

        return {
            history: paginated,
            count: totalCount,
            page,
            take,
        };
    };

    /**
     * Helper to fetch signed URLs for listing images
     */
    private populateSignedUrls = async (historyItems: OrderHistoryItem[]) => {
        const fileIds: string[] = [];

        // Collect all file IDs from images
        for (const item of historyItems) {
            if (item.listing.images) {
                for (const img of item.listing.images) {
                    if (img.limg_url) {
                        fileIds.push(img.limg_url);
                    }
                }
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
            for (const item of historyItems) {
                if (item.listing.images) {
                    for (const img of item.listing.images as any[]) {
                        if (img.limg_url && fileMap.has(img.limg_url)) {
                            img.limg_url = fileMap.get(img.limg_url);
                        }
                    }
                }
            }
        } catch (error) {
            console.error("Failed to fetch signed URLs:", error);
        }
    };
}

export default ProfileService;
