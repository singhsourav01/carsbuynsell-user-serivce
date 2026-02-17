import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";
import _ from "lodash";
import { adminGetAllUserPick } from "../constants/admin.constant";
import { API_ERRORS, INTEGERS } from "../constants/app.constant";
import UserRepository from "../repositories/user.repository";
import { getLinkData } from "../utils/helper";

class AdminService {
  userRepository: UserRepository;
  constructor() {
    this.userRepository = new UserRepository();
  }

  getAll = async (
    page?: string,
    page_size?: string,
    search?: string,
    status?: string,
    apiUrl?: string,
    user_id?: string
  ) => {
    const pageNumber = Number(page || "1");
    const take = Number(page_size || "10");
    const skip = (pageNumber - INTEGERS.ONE) * take;
    const users = await this.userRepository.getAll(
      take,
      skip,
      search,
      status,
      user_id
    );
    if (users.length === INTEGERS.ZERO)
      throw new ApiError(StatusCodes.NOT_FOUND, API_ERRORS.USERS_NOT_FOUND);

    const userData = await Promise.all(
      users.map(async (item: any) => {
        const user = _.pick(item, adminGetAllUserPick);
        return {
          ...user,
        };
      })
    );

    const count = await this.userRepository.count(search, status, user_id);
    const link = getLinkData(pageNumber, take, count, apiUrl);
    return { data: userData, count, link };
  };
}

export default AdminService;
