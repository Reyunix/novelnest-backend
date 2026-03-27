import { saveUserBookType, UserBookStatus } from "./userBooks.schema";

export type CreateUserBookInput = saveUserBookType & {
  userId: number;
};

export type userBookStatusData = {
  id: number;
  userId: number;
  status: UserBookStatus;
};