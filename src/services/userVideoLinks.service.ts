import { INTEGERS } from "../constants/app.constant";
import UserVideoLinksRepository from "../repositories/userVideoLinks.repository";

class UserVideoLinksService {
  userVideoLinksRepository: UserVideoLinksRepository;

  constructor() {
    this.userVideoLinksRepository = new UserVideoLinksRepository();
  }

  createVideoLinks = async (user_id: string, video_links: string[]) => {
    if (!video_links) return [];

    await this.userVideoLinksRepository.deleteMany(user_id);

    if (video_links?.length === INTEGERS.ZERO) return [];

    const socialLinks = video_links.map((item) => {
      return {
        uvl_user_id: user_id,
        uvl_url: item,
      };
    });

    return await this.userVideoLinksRepository.createMany(socialLinks);
  };
}

export default UserVideoLinksService;
