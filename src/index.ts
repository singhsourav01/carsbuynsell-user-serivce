import { ApiError, errorHandler } from "common-microservices-utils";
import cors from "cors";
import { config } from "dotenv";
import express, { NextFunction, Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import {
  API_ENDPOINTS,
  API_ERRORS,
  EUREKA,
  PORT,
  STRINGS,
} from "./constants/app.constant";

// Existing routes
import AdminRoutes from "./routes/admin.routes";
import OtpRoutes from "./routes/otp.routes";
import UserRoutes from "./routes/user.routes";
import InternalRoutes from "./routes/internal.routes";

// Marketplace routes
import HomeRoutes from "./routes/home.routes";
import ListingRoutes from "./routes/listing.routes";
import OrderRoutes from "./routes/order.routes";
import SubscriptionRoutes from "./routes/subscription.routes";
import ProfileRoutes from "./routes/profile.routes";
import MarketplaceAdminRoutes from "./routes/marketplaceAdmin.routes";

import { registerWithEureka } from "./utils/eureka.helper";

config();

const app = express();
const port = parseInt(process.env.PORT || "") || PORT;
export let headerToken: string | undefined;

app.use(
  express.json(),
  (err: Error, req: Request, res: Response, next: NextFunction) => {
    if (err) {
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.SEND_PROPER_JSON);
    }
    return next();
  }
);

app.use((req: any, res: any, next: any) => {
  headerToken = req.header("authorization");
  next();
});
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(API_ENDPOINTS.BASE, express.static("public"));

// ─── Existing Routes ──────────────────────────────────────────────────────────
app.use(API_ENDPOINTS.BASE, UserRoutes);
app.use(API_ENDPOINTS.BASE, AdminRoutes);
app.use(API_ENDPOINTS.BASE, OtpRoutes);
app.use(API_ENDPOINTS.BASE + API_ENDPOINTS.INTERNAL, InternalRoutes);

// ─── Marketplace Routes ───────────────────────────────────────────────────────
app.use(API_ENDPOINTS.BASE, HomeRoutes);
app.use(API_ENDPOINTS.BASE, ListingRoutes);
app.use(API_ENDPOINTS.BASE, OrderRoutes);
app.use(API_ENDPOINTS.BASE, SubscriptionRoutes);
app.use(API_ENDPOINTS.BASE, ProfileRoutes);
app.use(API_ENDPOINTS.BASE, MarketplaceAdminRoutes);

// ─── Global Error Handler ─────────────────────────────────────────────────────
app.use((err: ApiError, req: Request, res: Response, next: NextFunction) => {
  console.log(err);
  return errorHandler(err, req, res, next);
});

app.listen(port, () => {
  console.log(`Server is listening on port ${port}`);
});
