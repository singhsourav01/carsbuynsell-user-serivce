import express from "express";
import HomeController from "../controllers/home.controller";
import { authUser } from "../middlewares/auth.middleware";
import { API_ENDPOINTS } from "../constants/app.constant";

const HomeRoutes = express.Router();
const homeController = new HomeController();

// ─── Public Routes ────────────────────────────────────────────────────────────

// GET /home        — Home page widget (featured + first-page listings + categories)
HomeRoutes.get(API_ENDPOINTS.HOME, homeController.getHome);

// GET /listings    — Paginated listing feed
//   Query params:
//     category  = slug ("used-cars") or UUID  — omit for ALL vehicles
//     type      = AUCTION | BUY_NOW           — optional
//     page      = 1 (default)
//     limit     = 12 (default, max 50)
HomeRoutes.get(API_ENDPOINTS.LISTINGS, homeController.getListings);

// GET /categories  — All active categories (for tab/dropdown)
HomeRoutes.get(API_ENDPOINTS.CATEGORIES, homeController.getCategories);

// GET /category/:cat_id — Single category by id
HomeRoutes.get(API_ENDPOINTS.CATEGORY_BY_ID, homeController.getCategoryById);

// ─── Admin / Protected Routes ─────────────────────────────────────────────────

// POST   /category             — Create a new category (admin only)
// PUT    /category/:cat_id     — Update a category   (admin only)
// PATCH  /category/:cat_id/toggle — Toggle active status (admin only)
HomeRoutes.post(API_ENDPOINTS.CATEGORY, homeController.createCategory);
HomeRoutes.put(API_ENDPOINTS.CATEGORY_BY_ID, homeController.updateCategory);
HomeRoutes.patch(API_ENDPOINTS.CATEGORY_TOGGLE, homeController.toggleCategoryStatus);

export default HomeRoutes;
