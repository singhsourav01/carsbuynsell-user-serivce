import prisma from "../configs/prisma.config";
import {
  creatCurrentLocation,
  updateCurrentLocation,
} from "../types/userCurrentLocation.types";
import { queryHandler } from "../utils/helper";

class UserCurrentLocationsRepository {
  create = async (data: creatCurrentLocation) => {
    return queryHandler(
      async () => await prisma.user_current_locations.create({ data })
    );
  };

  update = async (location_id: string, data: updateCurrentLocation) => {
    return queryHandler(
      async () =>
        await prisma.user_current_locations.update({
          where: { ucl_id: location_id },
          data,
        })
    );
  };
  get = async (user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_current_locations.findUnique({
          where: { ucl_user_id: user_id },
        })
    );
  };
}

export default UserCurrentLocationsRepository;
