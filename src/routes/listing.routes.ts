import express from "express";
import { authUser } from "../middlewares/auth.middleware";
import ListingController from "../controllers/listing.controller";
import ListingImageController from "../controllers/listingImage.controller";
import BidController from "../controllers/bid.controller";
import OrderController from "../controllers/order.controller";

const ListingRoutes = express.Router();
const listingController = new ListingController();
const listingImageController = new ListingImageController();
const bidController = new BidController();
const orderController = new OrderController();

// ─── Listings ─────────────────────────────────────────────────────────────────
// GET  /listings        - Get all listings (public, with filters)
// POST /listings        - Create a listing (auth required)
ListingRoutes.route("/listings")
    .get(listingController.getAll)
    .post(authUser(), listingController.create);

// GET    /listings/:id  - Get listing by ID (public)
// PATCH  /listings/:id  - Update listing (auth, seller only)
// DELETE /listings/:id  - Delete listing (auth, seller only)
ListingRoutes.route("/listings/:id")
    .get(listingController.getById)
    .patch(authUser(), listingController.update)
    .delete(authUser(), listingController.delete);

// ─── Listing Images ───────────────────────────────────────────────────────────
// POST   /listings/:id/images                       - Add images
// DELETE /listings/:id/images/:imageId              - Delete image
// PATCH  /listings/:id/images/:imageId/reorder      - Reorder image
ListingRoutes.post("/listings/:id/images", authUser(), listingImageController.addImages);
ListingRoutes.delete("/listings/:id/images/:imageId", authUser(), listingImageController.deleteImage);
ListingRoutes.patch("/listings/:id/images/:imageId/reorder", authUser(), listingImageController.reorderImage);

// ─── Bidding ──────────────────────────────────────────────────────────────────
// POST /listings/:id/bid   - Place a bid (auth + subscription required)
// GET  /listings/:id/bids  - Get bids for a listing (public)
ListingRoutes.post("/listings/:id/bid", authUser(), bidController.placeBid);
ListingRoutes.get("/listings/:id/bids", bidController.getBidsByListing);

// ─── Buy Now ──────────────────────────────────────────────────────────────────
// POST /listings/:id/buy - Buy Now (auth + subscription required)
ListingRoutes.post("/listings/:id/buy", authUser(), orderController.buyNow);

export default ListingRoutes;
