import { Gender, Role } from "@prisma/client";
import bcrypt from "bcrypt";
import { ApiError } from "common-microservices-utils";
import { subYears } from "date-fns";
import { StatusCodes } from "http-status-codes";
import otpGenerator from "otp-generator";
import {
  API_ERRORS,
  API_URL,
  INTEGERS,
  OTP_DIGITS,
} from "../constants/app.constant";
import {
  female_requirement,
  male_requirement,
  other_requirement,
} from "../types/common.types";
import { location_requirement } from "./../types/common.types";

export const queryHandler = async <T>(
  queryPromise: () => Promise<T>
): Promise<T> => {
  try {
    return await queryPromise();
  } catch (error) {
    console.log(error);
    // Check if the error is an instance of ApiError
    if (error instanceof ApiError) {
      throw error; // Rethrow the same ApiError
    }

    throw new ApiError(
      StatusCodes.INTERNAL_SERVER_ERROR,
      API_ERRORS.DATABASE_ERROR
    );
  }
};

export const getLinkData = (
  currentPage: number,
  pageSize: number,
  count: number,
  apiLink?: string,
  query: { [key: string]: [value: string] } = {}
) => {
  const totalPages = Math.ceil(count / pageSize);
  let params = "";
  Object.keys(query)?.map((key) => {
    if (query[key]) params += `&${key}=${query[key]}`;
  });

  const next =
    currentPage < totalPages
      ? `${API_URL}${apiLink}?page=${currentPage + 1
      }&page_size=${pageSize}${params}`
      : null;
  const prev =
    currentPage > 1 && currentPage - 1 < totalPages
      ? `${API_URL}${apiLink}?page=${currentPage - 1
      }&page_size=${pageSize}${params}`
      : null;

  return {
    totalPages: totalPages,
    currentPage: currentPage,
    pageSize: pageSize,
    next: next,
    prev: prev,
  };
};

export const hashPassword = async (password: string) => {
  return await bcrypt.hash(password, 10);
};

export const getEmailBodyForChangingUserStatus = (reason: string) => {
  return {
    PENDING:
      "Your account verification is pending by the admin side. please wait for the approval",
    APPROVED:
      "Congratulations your account is verified by the admin. You can login now",
    REJECTED: `Dear user you account is rejected by the admin.
    <br/>
    <br/>
     ${reason ? "Reason : " + reason : ""}`,
    BLOCKED: "Your account is blocked by the admin",
    NONE: "",
    DELETED: "",
  };
};

export const generateOtp = () => {
  return otpGenerator.generate(OTP_DIGITS, {
    upperCaseAlphabets: false,
    specialChars: false,
    lowerCaseAlphabets: false,
  });
};

export const getFilterUserQuery = (
  male_requirement: male_requirement,
  female_requirement: female_requirement,
  other_requirement: other_requirement,
  location_requirement: location_requirement,
  is_nearby_locations: boolean,
  user_id: string
) => {
  let where: any = {
    user_is_deleted: false,
    AND: [{ OR: [] }],
    NOT: { user_id: user_id, user_role: Role.ADMIN },
  };
  if (male_requirement) {
    where.AND[INTEGERS.ZERO].OR.push({
      user_gender: Gender.MALE,
      user_height: {
        gte: male_requirement.mr_min_height
          ? String(male_requirement.mr_min_height)
          : undefined,
        lte: male_requirement.mr_max_height
          ? String(male_requirement.mr_max_height)
          : undefined,
      },
      user_dob: {
        gte: male_requirement.mr_max_age
          ? subYears(new Date(), Number(male_requirement.mr_max_age))
          : undefined,
        lte: male_requirement.mr_min_age
          ? subYears(new Date(), Number(male_requirement.mr_min_age))
          : undefined,
      },
    });
  }
  if (female_requirement) {
    where.AND[INTEGERS.ZERO].OR.push({
      user_gender: Gender.FEMALE,
      user_height: {
        gte: female_requirement.fr_min_height
          ? String(female_requirement.fr_min_height)
          : undefined,
        lte: female_requirement.fr_max_height
          ? String(female_requirement.fr_max_height)
          : undefined,
      },
      user_dob: {
        gte: female_requirement.fr_max_age
          ? subYears(new Date(), Number(female_requirement.fr_max_age))
          : undefined,
        lte: female_requirement.fr_min_age
          ? subYears(new Date(), Number(female_requirement.fr_min_age))
          : undefined,
      },
    });
  }

  if (other_requirement) {
    where.AND[INTEGERS.ZERO].OR.push({
      user_gender: Gender.OTHER,
      user_height: {
        gte: other_requirement.or_min_height
          ? String(other_requirement.or_min_height)
          : undefined,
        lte: other_requirement.or_max_height
          ? String(other_requirement.or_max_height)
          : undefined,
      },
      user_dob: {
        gte: other_requirement.or_max_age
          ? subYears(new Date(), Number(other_requirement.or_max_age))
          : undefined,
        lte: other_requirement.or_min_age
          ? subYears(new Date(), Number(other_requirement.or_min_age))
          : undefined,
      },
    });
  }

  if (location_requirement && location_requirement.length > INTEGERS.ZERO) {
    const locationConditions = [];
    if (is_nearby_locations) {
      locationConditions.push({
        OR: location_requirement.map((item) => ({
          user_locations: {
            some: {
              ul_lat: {
                gte: item.lr_min_latitude,
                lte: item.lr_max_latitude,
              },
              ul_long: {
                gte: item.lr_min_longitude,
                lte: item.lr_max_longitude,
              },
            },
          },
        })),
      });
    } else {
      locationConditions.push({
        user_locations: {
          some: {
            ul_city_id: {
              in: location_requirement.map((item) => item.lr_city_id),
            },
          },
        },
      });
    }

    locationConditions.push({
      user_calendar: {
        some: {
          uc_city_id: {
            in: location_requirement.map((item) => item.lr_city_id),
          },
        },
      },
    });

    locationConditions.push({
      OR: location_requirement.map((item) => ({
        user_current_locations: {
          ucl_lat: {
            gte: item.lr_min_latitude,
            lte: item.lr_max_latitude,
          },
          ucl_long: {
            gte: item.lr_min_longitude,
            lte: item.lr_max_longitude,
          },
        },
      })),
    });

    where.AND.push({
      OR: locationConditions,
    });
  }

  if (where.AND.length > INTEGERS.ZERO) return where;
  return { NOT: { user_id: user_id } };
};
