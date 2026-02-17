import prisma from "../configs/prisma.config";
import { createManyLocations } from "../types/userLocations.types";
import { queryHandler } from "../utils/helper";

class UserLocationsRepository {
  createMany = async (data: createManyLocations) => {
    console.log(data, " here is my data");
    return queryHandler(
      async () => await prisma.user_locations.createMany({ data })
    );
  };

  deleteMany = async (ul_user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_locations.deleteMany({
          where: { ul_user_id },
        })
    );
  };
}

export default UserLocationsRepository;
