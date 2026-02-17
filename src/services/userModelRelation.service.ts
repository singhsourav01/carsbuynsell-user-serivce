import { ApiError } from "common-microservices-utils";
import { StatusCodes } from "http-status-codes";
import _ from "lodash";
import { getFileById } from "../api/file.api";
import { adminGetAllUserPick } from "../constants/admin.constant";
import { API_ERRORS, INTEGERS } from "../constants/app.constant";

import UserModelRepository from "../repositories/userModelRelation.repository";
import { createUserModelRelation } from "../types/userModelRelation.type";
import { ApprovalStatus } from "@prisma/client";
import UserService from "./user.service";
import { sendNotification } from "../api/notification.api";
import UserRepository from "../repositories/user.repository";
import { getUserManagedBy } from "../api/auth.api";
import { getTalentById } from "../api/core.api";

class UserModelRelation {
  userModelRepository: UserModelRepository;
  userService: UserService;
  userRepository: UserRepository;

  constructor() {
    this.userModelRepository = new UserModelRepository();
    this.userService = new UserService();
    this.userRepository = new UserRepository();
  }
  create = async (data: any) => {
    const getByEmail = await this.userService.getByEmail(data.urm_user_email);
    const checkInvite = await this.userModelRepository.getByEmail(
      data.urm_user_email,
      data.urm_model_agency_id
    );
    console.log(checkInvite, " here is checkInvite");
    const checkTalents = await this.userRepository.doesTalentExist(
      getByEmail.user_id || ""
    );
    console.log(
      checkInvite,
      checkInvite[0]?.urm_model_agency_id,
      data?.urm_model_agency_id
    );
    if (
      checkInvite &&
      checkInvite[0]?.urm_model_agency_id == data?.urm_model_agency_id
    )
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        API_ERRORS.USER_ALREADY_INVITED
      );
    if (!getByEmail)
      throw new ApiError(StatusCodes.BAD_REQUEST, API_ERRORS.NO_ACCOUNT_FOUND);

    if (checkTalents?.length < 1)
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        API_ERRORS.TALENT_MUST_ACTOR_MODEL
      );
    data.urm_user_id = getByEmail.user_id;

    const createUserModel = await this.userModelRepository.create(data);

    const fcmTokens = await this.userService.getUserFcmTokens(
      getByEmail?.user_id
    );
    const notification = await sendNotification({
      notification_user_id: data.urm_model_agency_id,
      notification_type_id: "86a265b1-1db0-4305-8251-5066490f3c35",
      notification_title: "Model Agency Request",
      notification_data: {
        urm_id: createUserModel.urm_id,
        urm_user_email: createUserModel.urm_user_email,
        urm_model_agency_id: createUserModel.urm_model_agency_id,
        user_id: getByEmail?.user_id,
      },
      notification_recipients: [{ nr_user_id: getByEmail?.user_id }],
      notification_tokens: fcmTokens,
    });
    return createUserModel;
  };
  update = async (urm_id: string, data: any) => {
    const getData = await this.userModelRepository.get(urm_id);
    const getByEmail = await this.userService.getByEmail(
      getData?.urm_user_email || ""
    );
    if (!getByEmail) {
      throw new ApiError(
        StatusCodes.BAD_REQUEST,
        API_ERRORS.EMAIL_DOSE_NOT_EXISTS
      );
    }
    const updateUserModel = await this.userModelRepository.update(urm_id, data);
    if (data?.is_urm_accepted === ApprovalStatus.APPROVED) {
      await this.userService.updateUser(getByEmail?.user_id || "", {
        user_managed_by: getData?.urm_model_agency_id,
      });
    }
    if (data?.is_urm_accepted === ApprovalStatus.REJECTED) {
      const user = await this.userModelRepository.update(urm_id, data);
      const fcmTokens = await this.userService.getUserFcmTokens(
        getData?.urm_model_agency_id || ""
      );
      const notification = await sendNotification({
        notification_user_id: getData?.urm_user_email,
        notification_type_id: "86a265b1-1db0-4305-8251-5066490f3c35",
        notification_title: "Request rejected by user.",
        notification_data: {
          urm_id: getData?.urm_id,
          urm_user_email: getData?.urm_user_email,
          urm_model_agency_id: getData?.urm_model_agency_id,
          user_id: getByEmail?.user_id,
        },
        notification_recipients: [{ nr_user_id: getData?.urm_model_agency_id }],
        notification_tokens: fcmTokens,
      });
      return user;
    }
    return updateUserModel;
  };
  get = async (urm_id: string) => {
    const data = await this.userModelRepository.get(urm_id);
    if (!data) {
      throw new ApiError(
        StatusCodes.BAD_GATEWAY,
        API_ERRORS.USER_MODEL_NOT_FOUND
      );
    }
    return data;
  };
  getAll = async () => {
    const data = await this.userModelRepository.getAll();
    if (data.length < 1) {
      throw new ApiError(
        StatusCodes.BAD_GATEWAY,
        API_ERRORS.USER_MODEL_NOT_FOUND
      );
    }
    return data;
  };
  delete = async (urm_id: string) => {
    const data = await this.userModelRepository.delete(urm_id);
    return data;
  };

  getModelRelations = async (urm_model_agency_id: string) => {
    const listOfInvitedUser = await this.userModelRepository.getListOfModel(
      urm_model_agency_id
    );
    console.log(listOfInvitedUser[0].user, " here is listOfInvitedUser");
    const getUserManagedByUser = await this.userRepository.getUserManagedBy(
      urm_model_agency_id
    ); // User service
    console.log(
      getUserManagedByUser,
      listOfInvitedUser,
      " here we need to hek"
    );
    const getUserManagedByAuth = await getUserManagedBy(urm_model_agency_id); // Auth service
    const getUserManageByUserAndAuth = [
      getUserManagedByAuth,
      getUserManagedByUser,
    ];
    const userData = await Promise.all(
      getUserManageByUserAndAuth[0].map(async (item: any) => {
        return {
          user_id: item.user_id,
          user_profile_image:
            item.user_profile_image_file_id &&
            (await getFileById(item.user_profile_image_file_id))?.file_url,
          user_talents: await Promise.all(
            item.user_talents.map(async (item: any) => {
              return (
                item.ut_talent_id &&
                (await getTalentById(item.ut_talent_id))?.talent_name
              );
            })
          ),
          is_user_invite: false,
        };
      })
    );

    const userData1 = await Promise.all(
      listOfInvitedUser.map(async (model) => {
        const user = model.user;

        return {
          user_id: user?.user_id,
          user_profile_image:
            user?.user_profile_image_file_id &&
            (await getFileById(user.user_profile_image_file_id))?.file_url,
          user_talents: await Promise.all(
            (user?.user_talents || []).map(async (talent: any) => {
              return (
                talent.ut_talent_id &&
                (await getTalentById(talent.ut_talent_id))?.talent_name
              );
            })
          ),
          is_user_invite: true,
        };
      })
    );

    if (!listOfInvitedUser) {
      throw new ApiError(
        StatusCodes.BAD_GATEWAY,
        API_ERRORS.USER_MODEL_NOT_FOUND
      );
    }
    return [...userData, ...userData1];
    // return {
    //   invited_user: listOfInvitedUser,
    //   user_status: [...getUserManagedByUser, ...getUserManagedByAuth],
    // };
  };
}

export default UserModelRelation;
