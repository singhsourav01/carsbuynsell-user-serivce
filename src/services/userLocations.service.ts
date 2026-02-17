import { LocationType } from "@prisma/client";
import { INTEGERS } from "../constants/app.constant";
import UserLocationsRepository from "../repositories/userLocations.repository";

class UserLocationsService {
  userLocationsRepository: UserLocationsRepository;

  constructor() {
    this.userLocationsRepository = new UserLocationsRepository();
  }

  createLocations = async (
    user_id: string,
    locations: any
    // locations: {
    //   country_id: string;
    //   state_id: string;
    //   city_id: string;
    //   address: string;
    //   address1: string;
    //   lat: number;
    //   long: number;
    //   type: LocationType;
    // }[]
  ) => {
    if (!locations) return [];

    await this.userLocationsRepository.deleteMany(user_id);

    if (locations.length === INTEGERS.ZERO) return [];

    const locationData = locations?.map((item: any) => {
      return {
        ul_user_id: user_id,
        ul_country_id: item.country_id,
        ul_city_id: item.city_id,
        ul_state_id: item.state_id,
        ul_lat: item.lat,
        ul_long: item.long,
        ul_address: item.address,
        ul_location_type: item.type,
      };
    });
    console.log(
      locationData,
      " getting data from userLocaton from user-service"
    );
    return await this.userLocationsRepository.createMany(locationData);
  };
}

export default UserLocationsService;
