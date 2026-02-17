import prisma from "../configs/prisma.config";
import { queryHandler } from "../utils/helper";
import {
  createUserMaleMeasurement,
  updateUserMaleMeasurement,
} from "../types/userMaleMeasurement.types";

class UserMaleMeasurementRepository {
  create = async (data: createUserMaleMeasurement) => {
    return queryHandler(
      async () => await prisma.user_male_measurements.create({ data })
    );
  };

  update = async (data: updateUserMaleMeasurement, user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_male_measurements.update({
          where: {
            umm_user_id: user_id,
          },
          data,
        })
    );
  };

  remove = (user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_male_measurements.delete({
          where: {
            umm_user_id: user_id,
          },
        })
    );
  };

  get = (user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_male_measurements.findUnique({
          where: {
            umm_user_id: user_id,
          },
        })
    );
  };
}

export default UserMaleMeasurementRepository;
