import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "@/database/db";
import {
  getUserDefaultLists,
  getUserListById,
  getUserLists,
} from "./userLists.repo";
import { validateUserListParams } from "./userLists.service";
import { sendSuccess } from "@/utils/http/successResponses";
import { AppError } from "@/utils/http/errorResponses";

export const getUserListsController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const userId = request.user.userId;
  const userLists = await getUserLists(userId);

  return sendSuccess(reply, "USERLISTS_FOUND", userLists);
};

export const getDefaultUserListsController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const userId = request.user.userId;
  const defaultLists = await getUserDefaultLists(db, userId);

  return sendSuccess(reply, "USERLISTS_FOUND", defaultLists);
};

export const getUserListByIdController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const userListParams = validateUserListParams(request.params);
  const userId = request.user.userId;
  const userList = await getUserListById(userListParams.listId, userId);
  if (!userList) throw new AppError("USERLIST_NOT_FOUND");

  return sendSuccess(reply, "USERLISTS_FOUND", userList);
};
