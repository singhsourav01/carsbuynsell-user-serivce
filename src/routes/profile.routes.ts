import express from "express";
import { authUser } from "../middlewares/auth.middleware";
import ProfileController from "../controllers/profile.controller";

const ProfileRoutes = express.Router();
const profileController = new ProfileController();

// GET /users/me/listings      - Get my listings (auth required)
// GET /users/me/bids          - Get my bids (auth required)
// GET /users/me/orders        - Get my orders (auth required)
// GET /users/me/order-history - Get combined order history (bids + orders)
ProfileRoutes.get("/users/me/listings", authUser(), profileController.getMyListings);
ProfileRoutes.get("/users/me/bids", authUser(), profileController.getMyBids);
ProfileRoutes.get("/users/me/orders", authUser(), profileController.getMyOrders);
ProfileRoutes.get("/users/me/order-history", authUser(), profileController.getOrderHistory);

export default ProfileRoutes;
