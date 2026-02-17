import { INTEGERS } from "../constants/app.constant";
import UserLanguagesRepository from "../repositories/userLanguages.repository";

class UserLanguagesService {
  userLanguagesRepository: UserLanguagesRepository;
  constructor() {
    this.userLanguagesRepository = new UserLanguagesRepository();
  }

  createLanguages = async (user_id: string, data: string[]) => {
    if (!data) return [];

    await this.userLanguagesRepository.deleteMany(user_id);

    if (data?.length === INTEGERS.ZERO) return [];

    const languages = data?.map((item) => {
      return {
        ul_language_id: item,
        ul_user_id: user_id,
      };
    });

    return await this.userLanguagesRepository.createMany(languages);
  };
}

export default UserLanguagesService;
