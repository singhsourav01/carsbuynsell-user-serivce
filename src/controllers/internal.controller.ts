import { ApiResponse, asyncHandler } from "common-microservices-utils";
import InternalService from "../services/internal.service";
import { Request, Response } from "express";
import { StatusCodes } from "http-status-codes";
import { API_RESPONSES } from "../constants/app.constant";

class InternalController {
  internalService: InternalService;
  constructor() {
    this.internalService = new InternalService();
  }

  deleteAllUserDevice = asyncHandler(async (req: Request, res: Response) => {
    const { user_id } = req.params;
    await this.internalService.deleteAllUserDevice(user_id);
    return res
      .status(StatusCodes.OK)
      .json(
        new ApiResponse(StatusCodes.OK, {}, API_RESPONSES.USER_DEVICE_DELETED)
      );
  });
}

export default InternalController;
