import UserDeviceRepository from "../repositories/userDevices.repository";

class InternalService {
  userDeviceRepository: UserDeviceRepository;
  constructor() {
    this.userDeviceRepository = new UserDeviceRepository();
  }

  deleteAllUserDevice = async (user_id: string) => {
    return await this.userDeviceRepository.deleteAllByUserId(user_id);
  };
}

export default InternalService;
