import prisma from "../configs/prisma.config";
import { createUserShopAddressesType } from "../types/userAddress.types";
import { queryHandler } from "../utils/helper";

class UserShopAddressesRepository {
  createMany = async (data: createUserShopAddressesType) => {
    return queryHandler(
      async () => await prisma.shop_address.createMany({ data })
    );
  };

  deleteMany = async (sa_user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.shop_address.deleteMany({
          where: { sa_user_id },
        })
    );
  };
}

export default UserShopAddressesRepository;
