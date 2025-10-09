import {
  checkIfLoginUserExists,
  checkIfUserExists,
} from "@/repositories/users_repo";
import { createUserInDB } from "@/repositories/users_repo";
import { LoginForm } from "@/schemas/loginFormSchema";
import { RegisterForm } from "@/schemas/registerFormSchema";
import { comparePasswords } from "@/utils/hash";
import { AppError } from "@/utils/http/errorResponses";


export const createUser = async (userData: RegisterForm) => {
  const { userExists, emailExists } = await checkIfUserExists(userData);

  if (userExists) {
    console.log("**username exists**");
    throw new AppError("USERNAME_ALREADY_EXISTS");
  }

  if (emailExists) {
    console.log("**email exists**");

    throw new AppError("EMAIL_ALREADY_EXISTS");
  }
  console.log("**todo bien");

  await createUserInDB(userData);
};

export const validateLoginCredentials = async (userData: LoginForm) => {
  const { userPassword, userEmail, userName } = userData;

  const identifier = userEmail || userName;

  if (!identifier) {

    throw new AppError("INVALID_LOGIN_DATA", "Usuario o Correo obligatorios");
  }

  const user = await checkIfLoginUserExists(identifier);
  if (!user) {
    throw new AppError("INVALID_CREDENTIALS");
  }

  const passwordIsValid = await comparePasswords(userPassword, user.password)
  if (!passwordIsValid){
    throw new AppError("INVALID_CREDENTIALS")
  }

  const {password: _, ...safeUser} = user
  return safeUser;
};
