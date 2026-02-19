import express from "express";
import { authUser } from "../middlewares/auth.middleware";
import SubscriptionController from "../controllers/subscription.controller";

const SubscriptionRoutes = express.Router();
const subscriptionController = new SubscriptionController();

// GET  /subscriptions/plans    - Get all subscription plans (public)
// POST /subscriptions/purchase - Purchase a subscription (auth required)
// GET  /subscriptions/me       - Get my active subscription (auth required)
SubscriptionRoutes.get("/subscriptions/plans", subscriptionController.getPlans);
SubscriptionRoutes.post("/subscriptions/purchase", authUser(), subscriptionController.purchase);
SubscriptionRoutes.get("/subscriptions/me", authUser(), subscriptionController.getMySubscription);

export default SubscriptionRoutes;
