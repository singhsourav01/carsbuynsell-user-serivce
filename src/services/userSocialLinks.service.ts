import { INTEGERS } from "../constants/app.constant";
import UserSocialLinksRepository from "../repositories/userSocialLinks.repository";

class UserSocialLinksService {
  userSocialLinksRepository: UserSocialLinksRepository;

  constructor() {
    this.userSocialLinksRepository = new UserSocialLinksRepository();
  }

  createSocialLinks = async (
    user_id: string,
    social_links: { link: string; type_id: string }[]
  ) => {
    if (!social_links) return [];
    await this.userSocialLinksRepository.deleteMany(user_id);
    if (social_links?.length === INTEGERS.ZERO) return;

    const socialLinks = social_links.map((item) => {
      return {
        usl_user_id: user_id,
        usl_url: item.link,
        usl_type_id: item.type_id,
      };
    });

    return await this.userSocialLinksRepository.createMany(socialLinks);
  };
}

export default UserSocialLinksService;
