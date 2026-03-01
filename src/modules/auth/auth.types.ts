import type { Role } from "@prisma/client";

export type AuthSafeUser = {
  id: number;
  name: string;
  email: string;
  role: Role;
};

export type JwtUserPayload = {
  userId: number;
  userName: string;
  userEmail: string;
  role: Role;
};

export type AuthTokens = {
  accessToken: string;
  refreshToken: string;
};
