import z from "zod";

export const LoginFormSchema = z
  .object({
    userName: z
      .string()
      .min(3, "El nombre de usuario debe tener al menos 3 caracteres")
      .max(30, "El nombre de usuario debe tener como máximo 30 caracteres")
      .regex(/^[a-zA-Z0-9_]+$/,"El nombre de usuario sólo puede contener letras, números y guiones bajos")
      .optional(),
    userEmail: z.email("Formato de correo inválido").optional(),
    userPassword: z.string(),
  })
  .refine((data) => data.userName || data.userEmail, {
    error: "Debes proporcionar un nombre de usuario o correo electrónico",
    path: ["userName"],
  });

export type LoginForm = z.infer<typeof LoginFormSchema>;
