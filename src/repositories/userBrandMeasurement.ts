import prisma from "../configs/prisma.config";
import { queryHandler } from "../utils/helper";
import {
  createUserBrandMeasurement,
  updateUserBrandMeasurement,
} from "../types/userBrandMeasurement";

class UserBrandMeasurementRepository {
  create = async (data: createUserBrandMeasurement) => {
    return queryHandler(
      async () => await prisma.user_brand_measurements.create({ data })
    );
  };

  update = async (data: updateUserBrandMeasurement, user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_brand_measurements.update({
          where: {
            ubm_user_id: user_id,
          },
          data,
        })
    );
  };

  remove = (user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_brand_measurements.delete({
          where: {
            ubm_user_id: user_id,
          },
        })
    );
  };

  get = (user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_brand_measurements.findUnique({
          where: {
            ubm_user_id: user_id,
          },
        })
    );
  };
}

export default UserBrandMeasurementRepository;
