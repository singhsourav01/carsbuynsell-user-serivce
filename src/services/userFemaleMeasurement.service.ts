import UserFemaleMeasurementRepository from "../repositories/userFemaleMeasurement.repository";
import { createUserFemaleMeasurement } from "../types/userFemaleMeasurement.types";

class UserFemaleMeasurementService {
  userFemaleMeasuremantRepository: UserFemaleMeasurementRepository;

  constructor() {
    this.userFemaleMeasuremantRepository =
      new UserFemaleMeasurementRepository();
  }

  createMeasurement = async (
    user_id: string,
    data: createUserFemaleMeasurement
  ) => {
    if (!data) return null;

    data.ufm_user_id = user_id;

    const existing = await this.userFemaleMeasuremantRepository.get(user_id);

    if (existing) {
      await this.userFemaleMeasuremantRepository.remove(user_id);
    }

    return await this.userFemaleMeasuremantRepository.create(data);
  };
}

export default UserFemaleMeasurementService;
