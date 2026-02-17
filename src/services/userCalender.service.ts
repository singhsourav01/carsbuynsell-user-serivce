import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";
import _ from "lodash";
import { API_ERRORS } from "../constants/app.constant";

import UserCalenderRepository from "../repositories/userCalender.repository";
import {
  createUserCalendar,
  updateUserCalendar,
} from "../types/userCalendar.types";
import { getCityById, getCityByName } from "../api/core.api";

class UserCalendarService {
  userCalenderRepository: UserCalenderRepository;

  constructor() {
    this.userCalenderRepository = new UserCalenderRepository();
  }

  // getUserCalendarByMonthAndYear = async (
  //   user_id: string,
  //   year: number,
  //   month: number
  // ) => {
  //   const calendarData =
  //     await this.userCalenderRepository.getUserCalendarByMonthAndYear(
  //       user_id,
  //       year,
  //       month
  //     );
  //   const updatedData = await Promise.all(
  //     calendarData?.map(async (item) => {
  //       const cityData = await getCityById(item?.uc_city_id);
  //       return {
  //         ...item,
  //         uc_city_name: cityData?.city_name,
  //       };
  //     })
  //   );

  //   console.log(updatedData, " here is calendar data");
  //   if (calendarData?.length < 1) {
  //     throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.NO_RECORDS_FOUND);
  //   }
  //   return updatedData;
  // };

  getUserCalendarByMonthAndYear = async (
    user_id: string,
    year: number,
    month: number
  ) => {
    const calendarData =
      await this.userCalenderRepository.getUserCalendarByMonthAndYear(
        user_id,
        year,
        month
      );

    if (calendarData?.length < 1) {
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.NO_RECORDS_FOUND);
    }

    const updatedData = await Promise.all(
      calendarData.map(async (item) => {
        if (!item?.uc_city_id) return { ...item, uc_city_name: "" };

        const cityData = await getCityById(item.uc_city_id);
        let uc_city_name = cityData?.city_name || "";

        if (cityData?.city_name) {
          const cityList = await getCityByName(cityData.city_name);

          const matchedCity = cityList?.find(
            (city: any) => city.city_id === item.uc_city_id
          );

          if (matchedCity) {
            uc_city_name = `${matchedCity.city_name}, ${matchedCity.city_state?.state_name}, ${matchedCity.city_state?.state_country?.country_name}`;
          }
        }

        return {
          ...item,
          uc_city_name,
        };
      })
    );

    console.log(updatedData, "here is calendar data");

    return updatedData;
  };

  updateCalender = async (uc_id: string, data: updateUserCalendar) => {
    console.log(data, " here is update data");
    return await this.userCalenderRepository.update(uc_id, data);
  };
  createCalendar = async (data: createUserCalendar) => {
    const data1 = await this.userCalenderRepository.createMany(data);
    return data1;
  };

  deleteCalenders = async (uc_user_id: string) => {
    const data = await this.userCalenderRepository.deleteMany(uc_user_id);
    if (!data) {
      throw new ApiError(
        StatusCodes.BAD_GATEWAY,
        API_ERRORS.CALENDAR_NOT_FOUND
      );
    }
    return;
  };
  getCalenderById = async (uc_id: string) => {
    const data = await this.userCalenderRepository.getById(uc_id);

    if (!data?.uc_city_id) return data;

    const cityData = await getCityById(data.uc_city_id);

    let uc_city_name = cityData?.city_name || "";

    if (cityData?.city_name) {
      const cityList = await getCityByName(cityData.city_name);

      const matchedCity = cityList?.find(
        (item: any) => item.city_id === data.uc_city_id
      );

      if (matchedCity) {
        uc_city_name = `${matchedCity.city_name}, ${matchedCity.city_state?.state_name}, ${matchedCity.city_state?.state_country?.country_name}`;
      }
    }

    return {
      ...data,
      uc_city_name,
    };
  };

  deleteCalender = async (uc_id: string) => {
    return await this.userCalenderRepository.delete(uc_id);
  };
}

export default UserCalendarService;
