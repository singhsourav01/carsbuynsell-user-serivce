import { INTEGERS } from "../constants/app.constant";
import UserTalentsRepository from "../repositories/userTalents.repository";

class UserTalentService {
  userTalentsRepository: UserTalentsRepository;

  constructor() {
    this.userTalentsRepository = new UserTalentsRepository();
  }

  createTalents = async (user_id: string, talent_ids: any) => {
    if (!talent_ids) {
      return [];
    }

    await this.userTalentsRepository.deleteMany(user_id);

    if (talent_ids?.length === INTEGERS.ZERO) {
      return [];
    }

    return await this.userTalentsRepository.createMany(talent_ids);
  };

  createCustomTalents = async (user_id: string, talent_ids: any) => {
    if (!talent_ids) {
      return [];
    }

    if (talent_ids?.length === INTEGERS.ZERO) {
      return [];
    }

    return await this.userTalentsRepository.createMany(talent_ids);
  };

  deleteTalents = async (ut_user_id: string, talent_ids: any) => {
    if (!talent_ids) {
      return [];
    }
    if (talent_ids?.length === INTEGERS.ZERO) {
      return [];
    }

    return await this.userTalentsRepository.deleteMany(ut_user_id);
  };
}

export default UserTalentService;
