// import { ApiError } from "common-microservices-utils";
// import { StatusCodes } from "http-status-codes";

// import {
//   API_ENDPOINTS,
//   API_ERRORS,
//   API_RESPONSES,
//   INTEGERS,
//   STRINGS,
// } from "../constants/app.constant";
// import ReportRepository from "../repositories/report.repository";
// import UserRepository from "../repositories/user.repository";
// import { getLinkData } from "../utils/helper";

// class BlockAndReportService {
//   reportRepository: ReportRepository;
//   userRepository: UserRepository;

//   constructor() {
//     this.reportRepository = new ReportRepository();
//     this.userRepository = new UserRepository();
//   }

//   blockAccountService = async (user_id: string, block_user_id: string) => {
//     const existingBlockedAccount =
//       await this.blockRepository.findExistingBlockedUser(
//         user_id,
//         block_user_id
//       );

//     console.log(existingBlockedAccount);
//     if (existingBlockedAccount) {
//       // The action is the same, return an error
//       throw new ApiError(
//         StatusCodes.BAD_REQUEST,
//         "You already blocked this user."
//       );
//     } else {
//       let isBlock = await this.blockRepository.addToBlock(
//         user_id,
//         block_user_id
//       );
//       return { isBlock, message: API_RESPONSES.BLOCKED };
//     }
//   };

//   getBlockedAccountServices = async (
//     user_id: string,
//     page: string,
//     page_size: string
//   ) => {
//     const currentPage = parseInt(page) || INTEGERS.ONE;
//     const pageSize = parseInt(page_size) || INTEGERS.TEN;

//     const deletedUsers = (await this.userRepository.getAllDeletedUsers()).map(
//       (item) => item.user_id
//     );
//     const removeIds = [...new Set([...deletedUsers])];

//     const existingBlockedAccount =
//       await this.blockRepository.getBlockedAccounts(
//         user_id,
//         currentPage,
//         pageSize,
//         removeIds
//       );

//     const response = existingBlockedAccount.response;

//     if (response.length == INTEGERS.ZERO) {
//       throw new ApiError(
//         StatusCodes.NOT_FOUND,
//         API_RESPONSES.NO_BLOCKED_ACCOUNT_FOUND
//       );
//     }

//     const user = await new UserRepository().getByIds(
//       response.map((i) => i.blocked_user_id)
//     );
//     const totalCount = existingBlockedAccount.totalCount;

//     const link = getLinkData(
//       currentPage,
//       pageSize,
//       totalCount,
//       API_ENDPOINTS.BLOCK_PROFILE
//     );

//     return { users: user, link, totalCount };
//   };

//   unblockedAccountService = async (user_id: string, block_user_id: string) => {
//     const existingBlockedAccount =
//       await this.blockRepository.findExistingBlockedUser(
//         user_id,
//         block_user_id
//       );
//     if (!existingBlockedAccount) {
//       // The action is the same, return an error
//       throw new ApiError(StatusCodes.NOT_FOUND, STRINGS.DOES_NOT_EXIST);
//     } else {
//       try {
//         const acc = await this.blockRepository.unBlock(user_id, block_user_id);
//         return { message: API_RESPONSES.REMOVED_FROM_BLOCKED };
//       } catch (error) {
//         throw new ApiError(StatusCodes.NOT_FOUND, STRINGS.DOES_NOT_EXIST);
//       }
//     }
//   };

//   fetchReportTypesService = async () => {
//     return await this.reportRepository.getReportTypes();
//   };

//   getAllBlockedAccounts = async (user_id: string) => {
//     const { blocked, blocked_by } =
//       await this.blockRepository.getAllBlockedAccounts(user_id);

//     const blocked_ids = blocked?.map((b) => b.blocked_user_id);
//     const blocked_by_ids = blocked_by?.map((b) => b.user_id);
//     return { blocked_ids, blocked_by_ids };
//   };

//   reportAccountByUser = async (
//     user_id: string,
//     reported_user_id: string,
//     report_type: string,
//     report_description?: string
//   ) => {
//     return await this.reportRepository.reportAccountByUser(
//       user_id,
//       reported_user_id,
//       report_type,
//       report_description
//     );
//   };

//   //Admin Creating the report type

//   createReportTypeService = async (srt_name: string) => {
//     return await this.reportRepository.createReportIssueTypeRepository(
//       srt_name
//     );
//   };

//   updateReportTypeService = async (srt_id: string, srt_name: string) => {
//     return await this.reportRepository.updateReportIssueTypeRepository(
//       srt_id,
//       srt_name
//     );
//   };

//   deleteReportTypeService = async (srt_id: any) => {
//     return await this.reportRepository.deleteReportIssueTypeRepository(srt_id);
//   };
//   getReportTypeService = async () => {
//     return await this.reportRepository.getReportTypes();
//   };
//   getAllReportedAccountService = async (page: string, page_size: string) => {
//     const currentPage = parseInt(page) || INTEGERS.ONE;
//     const pageSize = parseInt(page_size) || INTEGERS.TEN;

//     const data = await this.reportRepository.getAllReportedRepository(
//       currentPage,
//       pageSize
//     );
//     const userIds = data?.response?.map((item) => item.reported_user_id);
//     if (userIds.length == INTEGERS.ZERO) {
//       throw new ApiError(
//         StatusCodes.NOT_FOUND,
//         API_RESPONSES.NO_REPORTED_ACCOUNT_FOUND
//       );
//     }
//     const res = await this.userRepository.getByIds(userIds);

//     const totalCount = data.totalCount;

//     const link = getLinkData(
//       currentPage,
//       pageSize,
//       totalCount,
//       API_ENDPOINTS.REPORTED_ACCOUNT
//     );

//     return { data: res, link, totalCount };
//   };

//   getReportedAccountByUserService = async (
//     page: string,
//     page_size: string,
//     reported_id: string
//   ) => {
//     const currentPage = parseInt(page) || INTEGERS.ONE;
//     const pageSize = parseInt(page_size) || INTEGERS.TEN;

//     const data = await this.reportRepository.getUserWhoHasReportedRepository(
//       currentPage,
//       pageSize,
//       reported_id
//     );
//     const userIds = data?.response?.map((item: any) => item.user_id);
//     if (userIds.length == INTEGERS.ZERO) {
//       throw new ApiError(
//         StatusCodes.NOT_FOUND,
//         API_RESPONSES.NO_REPORTED_ACCOUNT_FOUND
//       );
//     }
//     const res = await this.userRepository.getByIds(userIds);

//     const totalCount = data.totalCount;

//     const link = getLinkData(
//       currentPage,
//       pageSize,
//       totalCount,
//       API_ENDPOINTS.REPORTED_ACCOUNT + `/${reported_id}`
//     );

//     return { data: res, link, totalCount };
//   };
// }

// export default BlockAndReportService;
