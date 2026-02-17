import prisma from "../configs/prisma.config";
import { createManyLanguagesType } from "../types/userLanguages.types";
import { queryHandler } from "../utils/helper";

class UserLanguagesRepository {
  createMany = async (data: createManyLanguagesType) => {
    return queryHandler(
      async () => await prisma.user_languages.createMany({ data })
    );
  };

  deleteMany = async (user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_languages.deleteMany({
          where: { ul_user_id: user_id },
        })
    );
  };
}

export default UserLanguagesRepository;
