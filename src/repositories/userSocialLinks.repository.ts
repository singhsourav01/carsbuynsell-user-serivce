import prisma from "../configs/prisma.config";
import { createManySocialLinks } from "../types/userSocialLinks.types";
import { queryHandler } from "../utils/helper";

class UserSocialLinksRepository {
  createMany = async (data: createManySocialLinks) => {
    return queryHandler(
      async () => await prisma.user_social_links.createMany({ data })
    );
  };

  deleteMany = async (usl_user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_social_links.deleteMany({
          where: { usl_user_id },
        })
    );
  };
}

export default UserSocialLinksRepository;
