import z from "zod";

export const ContactFormSchema = z.object({
  contactName: z
    .string()
    .trim()
    .min(3, "Longitud mínima de 3 caracteres")
    .max(30, "Longitud máxima de 30 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/, "Caracteres inválidos"),
  contactEmail: z.email("Formato de correo inválido"),
  contactSubject: z
    .string()
    .trim()
    .max(30, "Longitud máxima de 30 caracteres")
    .default("Sin Asunto"),
  sendCopy: z.boolean().default(false),
  contactCompany: z
    .string()
    .trim()
    .max(30, "Longitud máxima de 30 caracteres")
    .regex(/^[a-zA-ZáéíóúÁÉÍÓÚñÑ\s'-]+$/, "Caracteres inválidos")
    .optional(),
  contactMessage: z
    .string()
    .trim()
    .min(1, "Debes escribir un mensaje")
    .max(140, "Longitud máxima de 140 caracteres"),
});