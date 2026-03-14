import { saveUserBookType } from "./userBooks.schema";

export type CreateUserBookInput = saveUserBookType & {
  userId: number;
};

