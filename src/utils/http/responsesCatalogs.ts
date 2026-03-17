export const ErrorsCatalog = {
  USER_NOT_FOUND: {
    statusCode: 404,
    errorCode: "USER_NOT_FOUND",
    message: "Usuario no encontrado",
  },
  USERNAME_ALREADY_EXISTS: {
    statusCode: 409,
    errorCode: "USERNAME_ALREADY_EXISTS",
    message: "Nombre de usuario ya registrado",
  },
  EMAIL_ALREADY_EXISTS: {
    statusCode: 409,
    errorCode: "EMAIL_ALREADY_EXISTS",
    message: "Correo ya registrado",
  },
  INVALID_CREDENTIALS: {
    statusCode: 401,
    errorCode: "INVALID_CREDENTIALS",
    message: "El inicio de sesión o la contraseña son inválidos",
  },
  INVALID_LOGIN_DATA: {
    statusCode: 400,
    errorCode: "INVALID_LOGIN_DATA",
    message: "Campos de inicio de sesión incorrectos",
  },
  INVALID_REGISTER_DATA: {
    statusCode: 400,
    errorCode: "INVALID_REGISTER_DATA",
    message: "Campos de registro incorrectos",
  },
  INVALID_TOKEN:{
    statusCode: 401,
    errorCode: "INVALID_TOKEN",
    message: "Token inválido o expirado. Inicia sesión nuevamente"
  },
  UNAUTHORIZED: {
  statusCode: 401,
  errorCode: "UNAUTHORIZED",
  message: "Acceso no autorizado. Es necesario iniciar sesión"
},
  INTERNAL_SERVER_ERROR: {
    statusCode: 500,
    errorCode: "INTERNAL_SERVER_ERROR",
    message: "Error interno del servidor"
  },
  EXTERNAL_API_ERROR: {
    statusCode: 502,
    errorCode: "EXTERNAL_API_ERROR",
    message: "Error al comunicarse con el servicio externo"
  },
  INVALID_QUERY_PARAMETER: {
    statusCode: 400,
    errorCode: "INVALID_QUERY_PARAMETER",
    message: "Parámetro de consulta 'all' es requerido y no puede estar vacío"
  },
  INVALID_BOOKS_PROVIDER: {
    statusCode: 503,
    errorCode: "INVALID_BOOKS_PROVIDER",
    message: "Proveedor de libros no soportado o mal configurado"
  },
  INVALID_SAVE_USERBOOK_DATA:{
    statusCode: 400,
    errorCode: "INVALID_SAVE_USERBOOK_DATA",
    message: "Error al guardar el libro. Datos inválidos."
  },
  USERBOOK_ALREADY_IN_LIST:{
    statusCode: 409,
    errorCode: "USERBOOK_ALREADY_IN_LIST",
    message: "Este libro ya está en la lista"
  },

  DEFAULT_STATUS_LIST_NOT_FOUND:{
    statusCode: 500,
    errorCode: "DEFAULT_STATUS_LIST_NOT_FOUND",
    message: "No se ha encontrado la lista por defecto correspondiente al estado del libro"
  }
} as const;


export const SuccessCatalog = {
  USER_CREATED: {
    statusCode: 201,
    message: "Usuario creado correctamente",
    code: "USER_CREATED",
  },
  USER_DELETED: {
    statusCode: 200,
    message: "Usuario eliminado correctamente",
    code: "USER_DELETED",
  },
  PASSWORD_UPDATED: {
    statusCode: 200,
    message: "Contraseña actualizada correctamente",
    code: "PASSWORD_UPDATED",
  },
  USERNAME_UPDATED: {
    statusCode: 200,
    message: "Nombre de usuario actualizado correctamente",
    code: "USERNAME_UPDATED",
  },
  EMAIL_UPDATED: {
    statusCode: 200,
    message: "Correo actualizado correctamente",
    code: "EMAIL_UPDATED",
  },
  LOGIN_SUCCESS: {
    statusCode: 200,
    message: "Inicio de sesión exitoso",
    code: "LOGIN_SUCCESS",
  },
  VALID_TOKEN:{
    statusCode:200,
    message: "Acceso autorizado, token válido.",
    code: "VALID_TOKEN"
  },
    LOGOUT_SUCCESS: {
    statusCode: 200,
    message: "Sesión cerrada con éxito",
    code: "LOGOUT_SUCCESS",
  },
  TOKEN_REFRESHED: {
    statusCode: 200,
    message: "Token actualizado correctamente.",
    code: "TOKEN_REFRESHED"
  },
  BOOKS_SEARCH_SUCCESS: {
    statusCode: 200,
    message: "Libros encontrados correctamente",
    code: "BOOKS_SEARCH_SUCCESS"
  },
  BOOK_SAVED:{
    statusCode: 201,
    message:"Libro guardado correctamente",
    code:"BOOK_SAVED"
  }
} as const;