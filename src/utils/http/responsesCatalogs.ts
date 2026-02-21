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
  }
} as const;