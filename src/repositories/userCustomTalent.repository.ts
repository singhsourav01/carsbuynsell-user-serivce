import prisma from "../configs/prisma.config";
import { createManyTalents } from "../types/userCustomTalents.type";
import { queryHandler } from "../utils/helper";

class UserCustomTalentsRepository {
  createMany = async (data: createManyTalents) => {
    return queryHandler(
      async () => await prisma.custom_talents.createMany({ data })
    );
  };

  deleteMany = async (uct_user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.custom_talents.deleteMany({
          where: { uct_user_id },
        })
    );
  };
}

export default UserCustomTalentsRepository;
