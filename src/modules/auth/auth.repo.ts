import { db } from "@/database/db";
import type { RegisterForm } from "./auth.schema";
import { hashPassword } from "@/utils/hash";

export const checkIfUserExists = async ({
  userEmail,
  userName,
}: RegisterForm) => {
  const user = await db.user.findFirst({
    where: {
      OR: [{ name: userName }, { email: userEmail }],
    },
  });

  const userAlreadyExists = user?.name === userName;
  const emailAlreadyExists = user?.email === userEmail;

  return { userAlreadyExists, emailAlreadyExists };
};

export const checkIfLoginUserExists = async (identifier: string) => {
  const user = await db.user.findFirst({
    where: {
      OR: [{ name: identifier }, { email: identifier }],
    },
  });
  return user;
};

export const createUserInDB = async (userData: RegisterForm) => {
  const hashedPassword = await hashPassword(userData.userPassword);
  const newUser = await db.user.create({
    data: {
      name: userData.userName,
      email: userData.userEmail,
      password: hashedPassword,
      address: userData.userAddress || null,
    },
  });
  return newUser;
};
