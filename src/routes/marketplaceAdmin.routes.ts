import express from "express";
import { authAdmin } from "../middlewares/auth.middleware";
import MarketplaceAdminController from "../controllers/marketplaceAdmin.controller";
import DashboardController from "../controllers/dashboard.controller";
import { API_ENDPOINTS } from "../constants/app.constant";

const MarketplaceAdminRoutes = express.Router();
const adminController = new MarketplaceAdminController();
const dashboardController = new DashboardController();

// ─── Dashboard ────────────────────────────────────────────────────────────────
// GET /admin/dashboard - Aggregated stats + recent sells
MarketplaceAdminRoutes.get(API_ENDPOINTS.DASHBOARD, dashboardController.getDashboard);

// ─── User Management ──────────────────────────────────────────────────────────
// GET   /admin/users          - Get all users
// PATCH /admin/users/:id/approve - Approve user
// PATCH /admin/users/:id/reject  - Reject user
MarketplaceAdminRoutes.get("/admin/users", authAdmin(), adminController.getAllUsers);
MarketplaceAdminRoutes.patch("/admin/users/:id/approve", authAdmin(), adminController.approveUser);
MarketplaceAdminRoutes.patch("/admin/users/:id/reject", authAdmin(), adminController.rejectUser);

// ─── Listing Management ───────────────────────────────────────────────────────
// GET   /admin/listings              - Get all listings
// PATCH /admin/listings/:id/feature  - Feature/unfeature a listing
// PATCH /admin/listings/:id/status   - Update listing status
MarketplaceAdminRoutes.get("/admin/listings", authAdmin(), adminController.getAllListings);
MarketplaceAdminRoutes.patch("/admin/listings/:id/feature", authAdmin(), adminController.featureListing);
MarketplaceAdminRoutes.patch("/admin/listings/:id/status", authAdmin(), adminController.updateListingStatus);

// ─── Order Management ─────────────────────────────────────────────────────────
// GET /admin/orders - Get all orders
MarketplaceAdminRoutes.get("/admin/orders", authAdmin(), adminController.getAllOrders);

// ─── Subscription Management ──────────────────────────────────────────────────
// GET /admin/subscriptions - Get all subscriptions
MarketplaceAdminRoutes.get("/admin/subscriptions", authAdmin(), adminController.getAllSubscriptions);

export default MarketplaceAdminRoutes;
