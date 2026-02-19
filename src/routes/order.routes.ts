import express from "express";
import { authUser } from "../middlewares/auth.middleware";
import OrderController from "../controllers/order.controller";

const OrderRoutes = express.Router();
const orderController = new OrderController();

// GET /orders/me    - Get my orders (auth required)
// GET /orders/:id   - Get order by ID (auth required)
OrderRoutes.get("/orders/me", authUser(), orderController.getMyOrders);
OrderRoutes.get("/orders/:id", authUser(), orderController.getOrderById);

export default OrderRoutes;
