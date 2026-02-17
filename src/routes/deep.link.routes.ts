import express from "express";
import { DeepLinkController } from "../controllers/deepkLink.controller";
import { API_ENDPOINTS } from "../constants/app.constant";

const DeepLinkRoutes = express.Router();
const deepLinkController = new DeepLinkController();

DeepLinkRoutes.get(
  API_ENDPOINTS.APPLE_APP_ASSOCIATION,
  deepLinkController.appleAppAssociation
);

DeepLinkRoutes.get(API_ENDPOINTS.ASSET_LINK, deepLinkController.assetLink);

DeepLinkRoutes.get(API_ENDPOINTS.REDIRECT_DEEPLINK, deepLinkController.Link);

export default DeepLinkRoutes;
