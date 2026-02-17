import express from "express";
import { API_ENDPOINTS } from "../constants/app.constant";
import InternalController from "../controllers/internal.controller";

const InternalRoutes = express.Router();
const internalController = new InternalController();

InternalRoutes.route(API_ENDPOINTS.USER_DEVICE_BY_USER_ID).delete(
  internalController.deleteAllUserDevice
);

export default InternalRoutes;
