import { z } from "zod";

export const RegisterFormSchema = z
  .object({
    userName: z
      .string()
      .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
      .max(30, "El nombre de usuario debe tener como máximo 30 caracteres")
      .regex(/^[a-zA-Z0-9_]+$/,"El nombre de usuario sólo puede contener letras, números y guiones bajos"),
    userPassword: z
      .string()
      .min(8, "La constraseña debe tener al menos 8 caracteres")
      .regex(/[A-Z]/, {
        message: "La contraseña debe tener al menos una mayúscula",
      })
      .regex(/[0-9]/, {
        message: "La contraseña debe tener al menos un número",
      })
      .regex(/[\W_]/, {
        message: "La contraseña debe tener al menos un carácter especial",
      }),
    confirmPassword: z
      .string()
      .min(8, "La contraseña debe tener al menos 8 caracteres"),
    userEmail: z.email("Dirección de correo inválida"),
    userAddress: z
      .string()
      .min(3, "Longitud de al menos 3 caracteres")
      .max(50, "La dirección es demasiado larga")
      .optional(),
  })
  .refine((data) => data.userPassword === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"]
  })

export type RegisterForm = z.infer<typeof RegisterFormSchema>;
