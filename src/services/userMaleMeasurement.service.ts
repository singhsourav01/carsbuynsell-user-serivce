import UserMaleMeasurementRepository from "../repositories/userMaleMeasurement.repository";
import { createUserMaleMeasurement } from "../types/userMaleMeasurement.types";

class UserMaleMeasurementService {
  userMaleMeasuremantRepository: UserMaleMeasurementRepository;

  constructor() {
    this.userMaleMeasuremantRepository = new UserMaleMeasurementRepository();
  }

  createMeasurement = async (
    user_id: string,
    data: createUserMaleMeasurement
  ) => {
    if (!data) return null;

    data.umm_user_id = user_id;

    const existing = await this.userMaleMeasuremantRepository.get(user_id);

    if (existing) {
      await this.userMaleMeasuremantRepository.remove(user_id);
    }

    return await this.userMaleMeasuremantRepository.create(data);
  };
}

export default UserMaleMeasurementService;
