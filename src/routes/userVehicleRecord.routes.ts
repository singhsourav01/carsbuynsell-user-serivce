import express from "express";
import UserVehicleRecordController from "../controllers/userVehicleRecord.controller";

const UserVehicleRecordRoutes = express.Router();
const vehicleRecordController = new UserVehicleRecordController();

// ─── User Vehicle Records ─────────────────────────────────────────────────────
// GET  /vehicle-records        - Get all vehicle records (with filters)
// POST /vehicle-records        - Create a vehicle record
UserVehicleRecordRoutes.route("/vehicle-records")
    .get(vehicleRecordController.getAll)
    .post(vehicleRecordController.create);

// GET /vehicle-records/my      - Get current user's vehicle records
UserVehicleRecordRoutes.get("/vehicle-records/my", vehicleRecordController.getMyVehicleRecords);

// GET    /vehicle-records/:id  - Get vehicle record by ID
// PATCH  /vehicle-records/:id  - Update vehicle record (owner only)
// DELETE /vehicle-records/:id  - Delete vehicle record (owner only)
UserVehicleRecordRoutes.route("/vehicle-records/:id")
    .get(vehicleRecordController.getById)
    .patch(vehicleRecordController.update)
    .delete(vehicleRecordController.delete);

export default UserVehicleRecordRoutes;
