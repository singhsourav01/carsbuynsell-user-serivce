import prisma from "../configs/prisma.config";
import { createManyTalents } from "../types/userTalents.types";
import { queryHandler } from "../utils/helper";

class UserTalentsRepository {
  createMany = async (data: createManyTalents) => {
    return queryHandler(
      async () => await prisma.user_talents.createMany({ data })
    );
  };

  deleteMany = async (ut_user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_talents.deleteMany({
          where: { ut_user_id },
        })
    );
  };
}

export default UserTalentsRepository;
