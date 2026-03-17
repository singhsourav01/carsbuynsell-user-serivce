import ProfileRepository from "../repositories/profile.repository";

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
            },
        }));

        // Combine and sort by date (newest first)
        const combined = [...bidItems, ...orderItems].sort(
            (a, b) => b.created_at.getTime() - a.created_at.getTime()
        );

        // Apply pagination
        const paginated = combined.slice(skip, skip + take);
        const totalCount = bidCount + orderCount;

        return {
            history: paginated,
            count: totalCount,
            page,
            take,
        };
    };
}

export default ProfileService;
