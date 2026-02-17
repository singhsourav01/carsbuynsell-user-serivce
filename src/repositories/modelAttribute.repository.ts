import prisma from "../configs/prisma.config";
import { createManyModelAttributeType } from "../types/modelAttribute.type";
import { queryHandler } from "../utils/helper";

class ModelAttributeRepository {
  createMany = async (data: createManyModelAttributeType) => {
    return queryHandler(
      async () => await prisma.user_model_attribute.createMany({ data })
    );
  };
  deleteMany = async (uma_user_id: string) => {
    return queryHandler(
      async () =>
        await prisma.user_model_attribute.deleteMany({ where: { uma_user_id } })
    );
  };
}

export default ModelAttributeRepository;
