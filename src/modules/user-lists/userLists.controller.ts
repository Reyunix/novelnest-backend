import { FastifyReply, FastifyRequest } from "fastify";
import { db } from "@/database/db";
import { getUserDefaultLists, getUserListById } from "./userLists.repo";
import { validateUserListParams } from "./userLists.service";
import { sendSuccess } from "@/utils/http/successResponses";
import { getUserLists } from "./userLists.repo";

export const getDefaultUserListsController = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user.userId;
  const defaultLists = await getUserDefaultLists(db, userId);
  return sendSuccess(reply, "USERLISTS_FOUND", defaultLists)
};

export const getUserListsController = async (request: FastifyRequest, reply: FastifyReply) => {
  const userId = request.user.userId;
  const defaultLists = await getUserLists(userId);
  return sendSuccess(reply, "USERLISTS_FOUND", defaultLists)
};

export const getUserListByIdController = async (
  request: FastifyRequest,
  reply: FastifyReply,
) => {
  const userListParams = validateUserListParams(request.params);
  const userId = request.user.userId;
  const userLists = await getUserListById(userListParams.listId, userId);
  return sendSuccess(reply, "USERLISTS_FOUND", userLists);
};
