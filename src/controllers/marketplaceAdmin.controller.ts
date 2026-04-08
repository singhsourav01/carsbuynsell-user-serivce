import { ApiResponse, asyncHandler } from "common-microservices-utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { API_RESPONSES } from "../constants/app.constant";
import { ORDER_RESPONSES } from "../constants/order.constant";
import { SUBSCRIPTION_RESPONSES } from "../constants/subscription.constant";
import ListingService from "../services/listing.service";
import OrderService from "../services/order.service";
import SubscriptionService from "../services/subscription.service";
import UserService from "../services/user.service";
import { API_ENDPOINTS } from "../constants/app.constant";
import AdminService from "../services/admin.service";

interface AuthRequest extends Request {
    user?: any;
}

class MarketplaceAdminController {
    private userService: UserService;
    private adminService: AdminService;
    private listingService: ListingService;
    private orderService: OrderService;
    private subscriptionService: SubscriptionService;

    constructor() {
        this.userService = new UserService();
        this.adminService = new AdminService();
        this.listingService = new ListingService();
        this.orderService = new OrderService();
        this.subscriptionService = new SubscriptionService();
    }

    // ─── User Management ──────────────────────────────────────────────────────

    getAllUsers = asyncHandler(async (req: Request, res: Response) => {
        const { search, page, page_size, status } = req.query as any;
        const data = await this.adminService.getAll(
            page,
            page_size,
            search,
            status,
            API_ENDPOINTS.ADMIN_USERS
        );
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, data, API_RESPONSES.USERS_FETCHED));
    });

    approveUser = asyncHandler(async (req: Request, res: Response) => {
        const user_id = String(req.params.id);
        const user = await this.userService.changeUserStatus(user_id, "APPROVED" as any, "");
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, user, "User approved successfully"));
    });

    rejectUser = asyncHandler(async (req: Request, res: Response) => {
        const user_id = String(req.params.id);
        const { reason } = req.body;
        const user = await this.userService.changeUserStatus(user_id, "REJECTED" as any, reason || "");
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, user, "User rejected successfully"));
    });

    // ─── Listing Management ───────────────────────────────────────────────────

    getAllListings = asyncHandler(async (req: Request, res: Response) => {
        const query: any = req.query;
        const result = await this.listingService.getAll(query);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, result, "Listings fetched successfully"));
    });

    featureListing = asyncHandler(async (req: Request, res: Response) => {
        const lst_id = String(req.params.id);
        const { is_featured } = req.body;
        // Admin can feature any listing — bypass seller check by using a special admin update
        const listing = await this.listingService.adminUpdateListing(lst_id, { lst_is_featured: is_featured });
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, listing, "Listing featured status updated"));
    });

    updateListingStatus = asyncHandler(async (req: Request, res: Response) => {
        const lst_id = String(req.params.id);
        const { status } = req.body;
        const listing = await this.listingService.adminUpdateListing(lst_id, { lst_status: status });
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, listing, "Listing status updated"));
    });

    /**
     * Closes an auction and restores votes to all bidders.
     * POST /admin/listings/:id/close-auction
     * Body: { status: "SOLD" | "EXPIRED" }
     */
    closeAuction = asyncHandler(async (req: Request, res: Response) => {
        const lst_id = String(req.params.id);
        const { status } = req.body;
        
        if (status !== "SOLD" && status !== "EXPIRED") {
            return res
                .status(StatusCodes.BAD_REQUEST)
                .json(new ApiResponse(StatusCodes.BAD_REQUEST, null, "Status must be SOLD or EXPIRED"));
        }
        
        const result = await this.listingService.closeAuction(lst_id, status);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, result, `Auction closed. ${result.engagements_closed} vote(s) restored to bidders.`));
    });

    // ─── Auction Management ───────────────────────────────────────────────────

    /**
     * Get all auctions with pagination and filters
     * GET /admin/auctions?page=1&page_size=10&status=ACTIVE&search=&category=
     */
    getAllAuctions = asyncHandler(async (req: Request, res: Response) => {
        const query = req.query as any;
        const result = await this.listingService.getAllAuctions(query);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, result, "Auctions fetched successfully"));
    });

    /**
     * Get auction details with all participants/bidders
     * GET /admin/auctions/:id
     */
    getAuctionDetails = asyncHandler(async (req: Request, res: Response) => {
        const lst_id = String(req.params.id);
        const result = await this.listingService.getAuctionWithParticipants(lst_id);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, result, "Auction details fetched successfully"));
    });

    /**
     * Get all buy now listings with pagination and filters
     * GET /admin/buy-now?page=1&page_size=10&status=ACTIVE&search=&category=
     */
    getAllBuyNow = asyncHandler(async (req: Request, res: Response) => {
        const query = req.query as any;
        const result = await this.listingService.getAllBuyNow(query);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, result, "Buy now listings fetched successfully"));
    });

    /**
     * Get buy now listing details
     * GET /admin/buy-now/:id
     */
    getBuyNowDetails = asyncHandler(async (req: Request, res: Response) => {
        const lst_id = String(req.params.id);
        const result = await this.listingService.getBuyNowById(lst_id);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, result, "Buy now listing details fetched successfully"));
    });

    /**
     * Update auction details (admin can modify any field)
     * PATCH /admin/auctions/:id
     */
    updateAuction = asyncHandler(async (req: Request, res: Response) => {
        const lst_id = String(req.params.id);
        const updateData: any = {};
        
        // Allow updating specific auction fields
        if (req.body.lst_title !== undefined) updateData.lst_title = req.body.lst_title;
        if (req.body.lst_description !== undefined) updateData.lst_description = req.body.lst_description;
        if (req.body.lst_price !== undefined) updateData.lst_price = req.body.lst_price;
        if (req.body.lst_min_increment !== undefined) updateData.lst_min_increment = req.body.lst_min_increment;
        if (req.body.lst_auction_end !== undefined) updateData.lst_auction_end = new Date(req.body.lst_auction_end);
        if (req.body.lst_status !== undefined) updateData.lst_status = req.body.lst_status;
        if (req.body.lst_is_featured !== undefined) updateData.lst_is_featured = req.body.lst_is_featured;

        const result = await this.listingService.adminUpdateListing(lst_id, updateData);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, result, "Auction updated successfully"));
    });

    // ─── Order Management ─────────────────────────────────────────────────────

    getAllOrders = asyncHandler(async (req: Request, res: Response) => {
        const page = Number(req.query.page || "1");
        const take = Number(req.query.page_size || "10");
        const result = await this.orderService.getAllOrders(page, take, req.query as any);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, result, ORDER_RESPONSES.ORDERS_FETCHED));
    });

    // ─── Subscription Management ──────────────────────────────────────────────

    getAllSubscriptions = asyncHandler(async (req: Request, res: Response) => {
        const page = Number(req.query.page || "1");
        const take = Number(req.query.page_size || "10");
        const result = await this.subscriptionService.getAllForAdmin(page, take);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, result, SUBSCRIPTION_RESPONSES.SUBSCRIPTION_FETCHED));
    });
}

export default MarketplaceAdminController;
