import express from "express";
// import { authUser } from "../middlewares/auth.middleware";
import SubscriptionController from "../controllers/subscription.controller";
import { authUser } from "../middlewares/auth.middleware";

const SubscriptionRoutes = express.Router();
const subscriptionController = new SubscriptionController();

// GET  /subscriptions/plans           - Get all active subscription plans (public)
// GET  /subscriptions/me              - Get my active subscription (auth required)
// POST /subscriptions/create-order    - Step 1: Create Razorpay order (auth required)
// POST /subscriptions/verify-payment  - Step 2: Verify payment & activate sub (auth required)

SubscriptionRoutes.get("/subscriptions/plans", subscriptionController.getPlans);
SubscriptionRoutes.get("/subscriptions/me", subscriptionController.getMySubscription);
SubscriptionRoutes.post("/subscriptions/create-order", authUser, subscriptionController.createOrder);
SubscriptionRoutes.post("/subscriptions/verify-payment", authUser, subscriptionController.verifyPayment);

export default SubscriptionRoutes;
