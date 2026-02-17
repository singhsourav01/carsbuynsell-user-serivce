import prisma from "../configs/prisma.config";
import { queryHandler } from "../utils/helper";
import {
  createUserFemaleMeasurement,
  updateUserFemaleMeasurement,
} from "../types/userFemaleMeasurement.types";

class UserFemaleMeasurementRepository {
  create = async (data: createUserFemaleMeasurement) => {
    return queryHandler(
      async () => await prisma.user_female_measurements.create({ data })
    );
  };

  update = async (data: updateUserFemaleMeasurement, user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_female_measurements.update({
          where: {
            ufm_user_id: user_id,
          },
          data,
        })
    );
  };

  remove = (user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_female_measurements.delete({
          where: {
            ufm_user_id: user_id,
          },
        })
    );
  };

  get = (user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_female_measurements.findUnique({
          where: {
            ufm_user_id: user_id,
          },
        })
    );
  };
}

export default UserFemaleMeasurementRepository;
