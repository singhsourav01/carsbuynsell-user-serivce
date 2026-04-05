import express from "express";
import ListingController from "../controllers/listing.controller";
import ListingImageController from "../controllers/listingImage.controller";
import BidController from "../controllers/bid.controller";
import OrderController from "../controllers/order.controller";
import { auth } from "../middlewares/auth.middleware";

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
    .post(listingController.create);

// GET  /listings/category/:id - Get listings by category (public)
ListingRoutes.route("/listings/category/:id")
    .get(listingController.getListingByCategoryId)


// ─── Listing Images ───────────────────────────────────────────────────────────
// POST   /listings/:id/images                       - Add images
// DELETE /listings/:id/images/:imageId              - Delete image
// PATCH  /listings/:id/images/:imageId/reorder      - Reorder image
ListingRoutes.post("/listings/:id/images", auth(), listingImageController.addImages);
ListingRoutes.delete("/listings/:id/images/:imageId", auth(), listingImageController.deleteImage);
ListingRoutes.patch("/listings/:id/images/:imageId/reorder", auth(), listingImageController.reorderImage);

// ─── Bidding ──────────────────────────────────────────────────────────────────
// POST /listings/:id/bid   - Place a bid (auth + subscription required)
// GET  /listings/:id/bids  - Get bids for a listing (public)
ListingRoutes.post("/listings/:id/bid", auth(), bidController.placeBid);
ListingRoutes.get("/listings/:id/bids", auth(),  bidController.getBidsByListing);
ListingRoutes.get("/listings/live-bids",auth(),  bidController.getAllLiveBids);

// ─── Buy Now ──────────────────────────────────────────────────────────────────
// POST /listings/:id/buy - Buy Now (auth + subscription required)
ListingRoutes.post("/listings/:id/buy", auth(), orderController.buyNow);

// GET    /listings/:id  - Get listing by ID (public)
// PATCH  /listings/:id  - Update listing (auth, seller only)
// DELETE /listings/:id  - Delete listing (auth, seller only)
ListingRoutes.get("/listings/:id", listingController.getById);
ListingRoutes.patch("/listings/:id", auth(), listingController.update);
ListingRoutes.delete("/listings/:id", auth(), listingController.delete);

export default ListingRoutes;

