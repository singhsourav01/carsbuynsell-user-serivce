import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";
import { USER_VEHICLE_RECORD_ERRORS } from "../constants/userVehicleRecord.constant";
import UserVehicleRecordRepository from "../repositories/userVehicleRecord.repository";
import {
    CreateUserVehicleRecordDTO,
    UpdateUserVehicleRecordDTO,
    UserVehicleRecordQueryDTO,
} from "../types/userVehicleRecord.types";
import { notifyVehicleSubmitted } from "../api/notification.api";

class UserVehicleRecordService {
    private vehicleRecordRepository: UserVehicleRecordRepository;

    constructor() {
        this.vehicleRecordRepository = new UserVehicleRecordRepository();
    }

    getAll = async (query: UserVehicleRecordQueryDTO) => {
        return this.vehicleRecordRepository.findAll(query);
    };

    getById = async (uvr_id: string) => {
        const record = await this.vehicleRecordRepository.findById(uvr_id);
        if (!record)
            throw new ApiError(StatusCodes.NOT_FOUND, USER_VEHICLE_RECORD_ERRORS.RECORD_NOT_FOUND);
        return record;
    };

    create = async (user_id: string, dto: CreateUserVehicleRecordDTO) => {
        const data: any = {
            uvr_user_id: user_id,
            uvr_title: dto.uvr_title,
            uvr_description: dto.uvr_description,
            uvr_category: dto.uvr_category,
            uvr_base_price: dto.uvr_base_price,
        };

        const record = await this.vehicleRecordRepository.create(data);

        // Fire-and-forget: Notify user about vehicle submission
        notifyVehicleSubmitted(user_id, dto.uvr_title).catch(() => {});

        return record;
    };

    update = async (uvr_id: string, user_id: string, dto: UpdateUserVehicleRecordDTO) => {
        const record = await this.vehicleRecordRepository.findByIdRaw(uvr_id);
        if (!record)
            throw new ApiError(StatusCodes.NOT_FOUND, USER_VEHICLE_RECORD_ERRORS.RECORD_NOT_FOUND);
        if (record.uvr_user_id !== user_id)
            throw new ApiError(StatusCodes.FORBIDDEN, USER_VEHICLE_RECORD_ERRORS.NOT_OWNER);

        const data: any = {};
        if (dto.uvr_title !== undefined) data.uvr_title = dto.uvr_title;
        if (dto.uvr_description !== undefined) data.uvr_description = dto.uvr_description;
        if (dto.uvr_category !== undefined) data.uvr_category = dto.uvr_category;
        if (dto.uvr_base_price !== undefined) data.uvr_base_price = dto.uvr_base_price;

        return this.vehicleRecordRepository.update(uvr_id, data);
    };

    delete = async (uvr_id: string, user_id: string) => {
        const record = await this.vehicleRecordRepository.findByIdRaw(uvr_id);
        if (!record)
            throw new ApiError(StatusCodes.NOT_FOUND, USER_VEHICLE_RECORD_ERRORS.RECORD_NOT_FOUND);
        if (record.uvr_user_id !== user_id)
            throw new ApiError(StatusCodes.FORBIDDEN, USER_VEHICLE_RECORD_ERRORS.NOT_OWNER);

        return this.vehicleRecordRepository.delete(uvr_id);
    };

    getMyVehicleRecords = async (user_id: string, page: number, take: number) => {
        return this.vehicleRecordRepository.findByUserId(user_id, page, take);
    };
}

export default UserVehicleRecordService;