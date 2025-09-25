import bcrypt from "bcryptjs";

const SALT_ROUNDS = 10;

export const hashPassword = async (passwoord: string) => {
  return await bcrypt.hash(passwoord, SALT_ROUNDS);
};

export const comparePasswords = async (plain: string, hashed: string) => {
  return await bcrypt.compare(plain, hashed);
};
