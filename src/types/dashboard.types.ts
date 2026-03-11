export interface DashboardStats {
    totalUsers: number;
    activeListings: number;
    liveAuctions: number;
    monthlyRevenue: number;
    pendingApprovals: number;
    dealsThisWeek: number;
}

export interface RecentSell {
    ord_id: string;
    ord_amount: any;
    ord_status: string;
    ord_created_at: Date;
    listing: {
        lst_id: string;
        lst_title: string;
        lst_price: any;
        lst_type: string;
        category: {
            cat_name: string;
        } | null;
    };
    buyer: {
        user_id: string;
        user_full_name: string | null;
        user_email: string | null;
    };
}

export interface DashboardResponse {
    stats: DashboardStats;
    recentSells: RecentSell[];
}
