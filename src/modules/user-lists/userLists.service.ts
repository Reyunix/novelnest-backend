import { AppError } from "@/utils/http/errorResponses";
import { UserListParamsSchema } from "./userLists.schemas";

export const validateUserListParams = (rawData: unknown) => {
  const parsed = UserListParamsSchema.safeParse(rawData);
  if (!parsed.success) throw new AppError("INVALID_USERLIST_PARAMS");
  return parsed.data;
};
