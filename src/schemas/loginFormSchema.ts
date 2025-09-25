import z from "zod";

export const LoginFormSchema = z
  .object({
    userName: z.string("Nombre de usuario incorrecto").optional(),
    userEmail: z.email("Formato de correo inválido").optional(),
    userPassword: z.string(),
  })
  .refine((data) => data.userName || data.userEmail, {
    error: "Debes proporcionar un nombre de usuario o correo electrónico",
    path: ["userName"],
  });

export type LoginForm = z.infer<typeof LoginFormSchema>;
