import UserCurrentLocationsRepository from "../repositories/userCurrentLocation";

class UserCurrentLocationsService {
  userLocationsRepository: UserCurrentLocationsRepository;

  constructor() {
    this.userLocationsRepository = new UserCurrentLocationsRepository();
  }

  createLocations = async (
    user_id: string,
    locations: {
      country_id?: string;
      state_id?: string;
      city_id?: string;
      address: string;
      lat: number;
      long: number;
    }
  ) => {
    const exist = await this.userLocationsRepository.get(user_id);

    if (!exist) {
      return this.userLocationsRepository.create({
        ucl_user_id: user_id,
        ucl_address: locations.address,
        ucl_lat: locations.lat,
        ucl_long: locations.long,
      });
    }

    return this.userLocationsRepository.update(exist?.ucl_id, {
      ucl_address: locations.address,
      ucl_lat: locations.lat,
      ucl_long: locations.long,
    });
  };
}

export default UserCurrentLocationsService;
