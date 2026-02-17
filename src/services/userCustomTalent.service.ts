import { INTEGERS } from "../constants/app.constant";
import UserCustomTalentsRepository from "../repositories/userCustomTalent.repository";

class UserCustomTalentService {
  userCustomTalentsRepository: UserCustomTalentsRepository;

  constructor() {
    this.userCustomTalentsRepository = new UserCustomTalentsRepository();
  }

  createTalents = async (user_id: string, talent_ids: any) => {
    if (!talent_ids) {
      return [];
    }
    if (talent_ids?.length === INTEGERS.ZERO) {
      return [];
    }

    return await this.userCustomTalentsRepository.createMany(talent_ids);
  };

  deleteTalents = async (user_id: string) => {
    return await this.userCustomTalentsRepository.deleteMany(user_id);
  };
}

export default UserCustomTalentService;
