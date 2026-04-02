import express from "express";
import UserVehicleRecordController from "../controllers/userVehicleRecord.controller";
import { authUser } from "../middlewares/auth.middleware";

const UserVehicleRecordRoutes = express.Router();
const vehicleRecordController = new UserVehicleRecordController();

// ─── User Vehicle Records ─────────────────────────────────────────────────────
// GET  /vehicle-records        - Get all vehicle records (public, with filters)
// POST /vehicle-records        - Create a vehicle record (auth required)
UserVehicleRecordRoutes.route("/vehicle-records")
    .get(vehicleRecordController.getAll)
    .post(authUser(), vehicleRecordController.create);

// GET /vehicle-records/my      - Get current user's vehicle records (auth required)
UserVehicleRecordRoutes.get("/vehicle-records/my", authUser(), vehicleRecordController.getMyVehicleRecords);

// GET    /vehicle-records/:id  - Get vehicle record by ID (public)
// PATCH  /vehicle-records/:id  - Update vehicle record (auth, owner only)
// DELETE /vehicle-records/:id  - Delete vehicle record (auth, owner only)
UserVehicleRecordRoutes.route("/vehicle-records/:id")
    .get(vehicleRecordController.getById)
    .patch(authUser(), vehicleRecordController.update)
    .delete(authUser(), vehicleRecordController.delete);

export default UserVehicleRecordRoutes;
