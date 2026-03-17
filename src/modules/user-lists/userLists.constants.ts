export const DEFAULT_USER_LISTS = [
  {
    name: "want_to_read",
    description: "Libros pendientes de lectura",
    isDefault: true,
    isPrivate: true,
  },
  {
    name: "reading",
    description: "Libros que estoy leyendo actualmente",
    isDefault: true,
    isPrivate: true,
  },
  {
    name: "completed",
    description: "Libros leídos",
    isDefault: true,
    isPrivate: true,
  },
  {
    name: "abandoned",
    description: "Libros abandonados",
    isDefault: true,
    isPrivate: true,
  },
] as const;