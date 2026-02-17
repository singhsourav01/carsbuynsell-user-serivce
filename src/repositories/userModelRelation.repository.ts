import prisma from "../configs/prisma.config";
import {
  createUserModelRelation,
  updateUserModelRelation,
} from "../types/userModelRelation.type";
import { queryHandler } from "../utils/helper";

class UserModelRepository {
  create = async (data: createUserModelRelation) => {
    return queryHandler(
      async () => await prisma.user_model_relation.create({ data })
    );
  };

  deleteMany = async (urm_user_email: string) => {
    return queryHandler(
      async () =>
        await prisma.user_model_relation.deleteMany({
          where: { urm_user_email },
        })
    );
  };

  getByEmail = async (urm_user_email: string, urm_model_agency_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_model_relation.findMany({
          where: { urm_user_email, urm_model_agency_id },
        })
    );
  };
  get = async (urm_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_model_relation.findUnique({
          where: { urm_id },
        })
    );
  };
  getListOfModel = async (urm_model_agency_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_model_relation.findMany({
          where: { urm_model_agency_id },
          select: {
            user: {
              select: {
                user_id: true,
                user_profile_image_file_id: true,
                user_talents: {
                  select: {
                    ut_talent_id: true,
                    talent_category: true,
                  },
                },
              },
            },
          },
        })
    );
  };

  getAll = async () => {
    return queryHandler(
      async () => await prisma.user_model_relation.findMany()
    );
  };

  delete = async (urm_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_model_relation.delete({
          where: { urm_id },
        })
    );
  };

  update = async (urm_id: string, data: updateUserModelRelation) => {
    return queryHandler(
      async () =>
        await prisma.user_model_relation.update({ where: { urm_id }, data })
    );
  };
}

export default UserModelRepository;
