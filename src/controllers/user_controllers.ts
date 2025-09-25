import { checkIfUserExists } from "@/repositories/users_repo";
import { createUserInDB } from "@/repositories/users_repo";
import { RegisterForm } from "@/schemas/registerFormSchema";
import { AppError } from "@/utils/http/errorResponses";

export const createUser = async (userData: RegisterForm) => {
  const { userExists, emailExists } = await checkIfUserExists(userData);

  if (userExists) {
    console.log("**username exists**")
    throw new AppError("USERNAME_ALREADY_EXISTS");
  }

  if (emailExists) {
    console.log("**email exists**")

    throw new AppError("EMAIL_ALREADY_EXISTS");
  }
  console.log("**todo bien")

  await createUserInDB(userData);
};
