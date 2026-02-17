import prisma from "../configs/prisma.config";
import { createManyVideoLinksType } from "../types/userVideoLinks.types";
import { queryHandler } from "../utils/helper";

class UserVideoLinksRepository {
  createMany = async (data: createManyVideoLinksType) => {
    return queryHandler(
      async () => await prisma.user_video_links.createMany({ data })
    );
  };

  deleteMany = async (uvl_user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_video_links.deleteMany({
          where: { uvl_user_id },
        })
    );
  };
}

export default UserVideoLinksRepository;
