import prisma from "../configs/prisma.config";
import { queryHandler } from "../utils/helper";

class UserDeviceRepository {
  deleteAllByUserId = async (user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_login_devices.deleteMany({
          where: { uld_user_id: user_id },
        })
    );
  };
}

export default UserDeviceRepository;
