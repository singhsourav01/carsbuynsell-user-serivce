import UserBrandMeasurementRepository from "../repositories/userBrandMeasurement";
import { createUserBrandMeasurement } from "../types/userBrandMeasurement";

class UserBrandMeasurementService {
  userBrandMeasuremantRepository: UserBrandMeasurementRepository;

  constructor() {
    this.userBrandMeasuremantRepository = new UserBrandMeasurementRepository();
  }

  createMeasurement = async (
    user_id: string,
    data: createUserBrandMeasurement
  ) => {
    if (!data) return null;

    data.ubm_user_id = user_id;

    const existing = await this.userBrandMeasuremantRepository.get(user_id);

    if (existing) {
      await this.userBrandMeasuremantRepository.remove(user_id);
    }

    return await this.userBrandMeasuremantRepository.create(data);
  };
}

export default UserBrandMeasurementService;
