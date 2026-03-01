import { z } from "zod";
import { AppError } from "@/utils/http/errorResponses";

export const RegisterFormSchema = z
  .object({
    userName: z
      .string()
      .trim()
      .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
      .max(30, "El nombre de usuario debe tener como maximo 30 caracteres")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "El nombre de usuario solo puede contener letras, numeros y guiones bajos"
      ),
    userPassword: z
      .string()
      .min(8, "La constrasena debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, {
        message: "La contrasena debe tener al menos una mayuscula",
      })
      .regex(/[0-9]/, {
        message: "La contrasena debe tener al menos un numero",
      })
      .regex(/[\W_]/, {
        message: "La contrasena debe tener al menos un caracter especial",
      }),
    confirmPassword: z
      .string()
      .min(8, "La contrasena debe tener al menos 8 caracteres"),
    userEmail: z.email("Direccion de correo invalida"),
    userAddress: z
      .string()
      .trim()
      .max(50, "La direccion es demasiado larga")
      .optional(),
  })
  .refine((data) => data.userPassword === data.confirmPassword, {
    message: "Las contrasenas no coinciden",
    path: ["confirmPassword"],
  });

export type RegisterForm = z.infer<typeof RegisterFormSchema>;

export const parseRegisterForm = (data: unknown): RegisterForm => {
  const result = RegisterFormSchema.safeParse(data);

  if (!result.success) {
    const formatted = z.treeifyError(result.error);
    const firstMessage =
      formatted.properties?.userName?.errors[0] ||
      formatted.properties?.userEmail?.errors[0] ||
      formatted.properties?.userPassword?.errors[0] ||
      formatted.properties?.confirmPassword?.errors[0] ||
      formatted.errors?.[0];

    throw new AppError("INVALID_REGISTER_DATA", firstMessage);
  }

  return result.data;
};

export const LoginFormSchema = z
  .object({
    userName: z
      .string()
      .trim()
      .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
      .max(30, "El nombre de usuario debe tener como maximo 30 caracteres")
      .regex(
        /^[a-zA-Z0-9_]+$/,
        "El nombre de usuario solo puede contener letras, numeros y guiones bajos"
      )
      .optional(),
    userEmail: z.email("Formato de correo invalido").optional(),
    userPassword: z.string(),
  })
  .refine((data) => data.userName || data.userEmail, {
    message: "Debes proporcionar un nombre de usuario o correo electronico",
    path: ["userName"],
  });

export type LoginForm = z.infer<typeof LoginFormSchema>;

export const parseLoginForm = (data: unknown): LoginForm => {
  const result = LoginFormSchema.safeParse(data);

  if (!result.success) {
    const formatted = z.treeifyError(result.error);
    const firstMessage =
      formatted.properties?.userName?.errors[0] ||
      formatted.properties?.userEmail?.errors[0] ||
      formatted.properties?.userPassword?.errors[0] ||
      formatted.errors?.[0];

    throw new AppError("INVALID_LOGIN_DATA", firstMessage);
  }

  return result.data;
};
