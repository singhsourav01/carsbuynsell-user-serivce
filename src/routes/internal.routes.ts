import express from "express";
import { API_ENDPOINTS } from "../constants/app.constant";
import InternalController from "../controllers/internal.controller";
import prisma from "../configs/prisma.config";

const InternalRoutes = express.Router();
const internalController = new InternalController();

InternalRoutes.route(API_ENDPOINTS.USER_DEVICE_BY_USER_ID).delete(
  internalController.deleteAllUserDevice
);

// ─── FCM Token Endpoints (for notification-service) ───────────────────────────

// GET /user/internal/user/:user_id/fcm-tokens
InternalRoutes.get("/user/:user_id/fcm-tokens", async (req, res) => {
  try {
    const tokens = await prisma.user_login_devices.findMany({
      where: { uld_user_id: req.params.user_id },
      select: { uld_fcm_token: true },
    });
    res.json({ data: tokens.map((t) => t.uld_fcm_token).filter(Boolean) });
  } catch (error) {
    console.error("Error fetching FCM tokens:", error);
    res.status(500).json({ data: [] });
  }
});

// GET /user/internal/users/fcm-tokens  (ALL users for broadcast)
InternalRoutes.get("/users/fcm-tokens", async (req, res) => {
  try {
    const devices = await prisma.user_login_devices.findMany({
      select: { uld_user_id: true, uld_fcm_token: true },
    });

    // Group by user
    const grouped = devices.reduce((acc, d) => {
      if (!d.uld_fcm_token) return acc;
      if (!acc[d.uld_user_id]) acc[d.uld_user_id] = [];
      acc[d.uld_user_id].push(d.uld_fcm_token);
      return acc;
    }, {} as Record<string, string[]>);

    res.json({
      data: Object.entries(grouped).map(([user_id, tokens]) => ({
        user_id,
        tokens,
      })),
    });
  } catch (error) {
    console.error("Error fetching all FCM tokens:", error);
    res.status(500).json({ data: [] });
  }
});

// GET /user/internal/listing/:listing_id/engaged-users
InternalRoutes.get("/listing/:listing_id/engaged-users", async (req, res) => {
  try {
    const exclude = req.query.exclude as string | undefined;

    const engagements = await prisma.engagements.findMany({
      where: {
        eng_listing_id: req.params.listing_id,
        eng_status: "ACTIVE",
        ...(exclude ? { eng_user_id: { not: exclude } } : {}),
      },
      select: { eng_user_id: true },
    });

    const userIds = [...new Set(engagements.map((e) => e.eng_user_id))];

    if (userIds.length === 0) {
      return res.json({ data: [] });
    }

    const devices = await prisma.user_login_devices.findMany({
      where: { uld_user_id: { in: userIds } },
      select: { uld_user_id: true, uld_fcm_token: true },
    });

    const grouped = devices.reduce((acc, d) => {
      if (!d.uld_fcm_token) return acc;
      if (!acc[d.uld_user_id]) acc[d.uld_user_id] = [];
      acc[d.uld_user_id].push(d.uld_fcm_token);
      return acc;
    }, {} as Record<string, string[]>);

    res.json({
      data: Object.entries(grouped).map(([user_id, tokens]) => ({
        user_id,
        tokens,
      })),
    });
  } catch (error) {
    console.error("Error fetching engaged user FCM tokens:", error);
    res.status(500).json({ data: [] });
  }
});

export default InternalRoutes;
