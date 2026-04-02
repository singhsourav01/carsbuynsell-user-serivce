import { ApiResponse, asyncHandler } from "common-microservices-utils";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { USER_VEHICLE_RECORD_RESPONSES } from "../constants/userVehicleRecord.constant";
import UserVehicleRecordService from "../services/userVehicleRecord.service";
import {
    CreateUserVehicleRecordDTO,
    UpdateUserVehicleRecordDTO,
    UserVehicleRecordQueryDTO,
} from "../types/userVehicleRecord.types";

interface AuthRequest extends Request {
    user?: any;
}

class UserVehicleRecordController {
    private vehicleRecordService: UserVehicleRecordService;

    constructor() {
        this.vehicleRecordService = new UserVehicleRecordService();
    }

    getAll = asyncHandler(async (req: Request, res: Response) => {
        const query = req.query as UserVehicleRecordQueryDTO;
        const result = await this.vehicleRecordService.getAll(query);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, result, USER_VEHICLE_RECORD_RESPONSES.RECORDS_FETCHED));
    });

    getById = asyncHandler(async (req: Request, res: Response) => {
        const uvr_id = String(req.params.id);
        const record = await this.vehicleRecordService.getById(uvr_id);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, record, USER_VEHICLE_RECORD_RESPONSES.RECORD_FETCHED));
    });

    create = asyncHandler(async (req: AuthRequest, res: Response) => {
        const user_id = req.user?.user_id;
        const dto: CreateUserVehicleRecordDTO = req.body;
        const record = await this.vehicleRecordService.create(user_id, dto);
        return res
            .status(StatusCodes.CREATED)
            .json(new ApiResponse(StatusCodes.CREATED, record, USER_VEHICLE_RECORD_RESPONSES.RECORD_CREATED));
    });

    update = asyncHandler(async (req: AuthRequest, res: Response) => {
        const uvr_id = String(req.params.id);
        const user_id = req.user?.user_id;
        const dto: UpdateUserVehicleRecordDTO = req.body;
        const record = await this.vehicleRecordService.update(uvr_id, user_id, dto);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, record, USER_VEHICLE_RECORD_RESPONSES.RECORD_UPDATED));
    });

    delete = asyncHandler(async (req: AuthRequest, res: Response) => {
        const uvr_id = String(req.params.id);
        const user_id = req.user?.user_id;
        await this.vehicleRecordService.delete(uvr_id, user_id);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, null, USER_VEHICLE_RECORD_RESPONSES.RECORD_DELETED));
    });

    getMyVehicleRecords = asyncHandler(async (req: AuthRequest, res: Response) => {
        const user_id = req.user?.user_id;
        const page = parseInt(req.query.page as string) || 1;
        const take = parseInt(req.query.take as string) || 10;
        const result = await this.vehicleRecordService.getMyVehicleRecords(user_id, page, take);
        return res
            .status(StatusCodes.OK)
            .json(new ApiResponse(StatusCodes.OK, result, USER_VEHICLE_RECORD_RESPONSES.RECORDS_FETCHED));
    });
}

export default UserVehicleRecordController;
