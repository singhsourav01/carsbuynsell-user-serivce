import prisma from "../configs/prisma.config";
import { createManyStoreAddressType } from "../types/storeAddress.types";
import { queryHandler } from "../utils/helper";

class StoreAddressRepository {
  createMany = async (data: createManyStoreAddressType) => {
    return queryHandler(
      async () => await prisma.shop_address.createMany({ data })
    );
  };
  deleteMany = async (sa_user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.shop_address.deleteMany({ where: { sa_user_id } })
    );
  };
}

export default StoreAddressRepository;
