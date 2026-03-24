import { VehicleCategory } from "@prisma/client";
import prisma from "../configs/prisma.config";
import { userVehicleRecordSelect } from "../constants/userVehicleRecord.constant";
import { queryHandler } from "../utils/helper";
import {
    createUserVehicleRecordType,
    updateUserVehicleRecordType,
    UserVehicleRecordQueryDTO,
} from "../types/userVehicleRecord.types";

class UserVehicleRecordRepository {
    findAll = async (query: UserVehicleRecordQueryDTO) => {
        const page = Number(query.page || "1");
        const take = Number(query.page_size || "10");
        const skip = (page - 1) * take;

        const where: any = {};

        if (query.search) {
            where.OR = [
                { uvr_title: { contains: query.search } },
                { uvr_description: { contains: query.search } },
            ];
        }
        if (query.category) where.uvr_category = query.category as VehicleCategory;

        const [records, count] = await queryHandler(() =>
            prisma.$transaction([
                prisma.user_vehicle_record.findMany({
                    where,
                    select: userVehicleRecordSelect,
                    take,
                    skip,
                    orderBy: { uvr_created_at: "desc" },
                }),
                prisma.user_vehicle_record.count({ where }),
            ])
        );

        return { records, count, page, take };
    };

    findById = async (uvr_id: string) => {
        return queryHandler(() =>
            prisma.user_vehicle_record.findUnique({
                where: { uvr_id },
                select: userVehicleRecordSelect,
            })
        );
    };

    findByIdRaw = async (uvr_id: string) => {
        return queryHandler(() =>
            prisma.user_vehicle_record.findUnique({ where: { uvr_id } })
        );
    };

    create = async (data: createUserVehicleRecordType) => {
        return queryHandler(() =>
            prisma.user_vehicle_record.create({
                data: data as any,
                select: userVehicleRecordSelect,
            })
        );
    };

    update = async (uvr_id: string, data: updateUserVehicleRecordType) => {
        return queryHandler(() =>
            prisma.user_vehicle_record.update({
                where: { uvr_id },
                data: data as any,
                select: userVehicleRecordSelect,
            })
        );
    };

    delete = async (uvr_id: string) => {
        return queryHandler(() =>
            prisma.user_vehicle_record.delete({ where: { uvr_id } })
        );
    };

    findByUserId = async (user_id: string, page: number, take: number) => {
        const skip = (page - 1) * take;
        const [records, count] = await queryHandler(() =>
            prisma.$transaction([
                prisma.user_vehicle_record.findMany({
                    where: { uvr_user_id: user_id },
                    select: userVehicleRecordSelect,
                    take,
                    skip,
                    orderBy: { uvr_created_at: "desc" },
                }),
                prisma.user_vehicle_record.count({ where: { uvr_user_id: user_id } }),
            ])
        );
        return { records, count, page, take };
    };
}

export default UserVehicleRecordRepository;
