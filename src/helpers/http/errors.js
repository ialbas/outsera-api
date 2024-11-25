/**
 * @description Classe de erro para representar erros internos do servidor.
 */
export class ServerError extends Error {
  /**
   * @param {string} [message="Internal error"] - Mensagem descritiva do erro.
   */
  constructor(message = "Internal error") {
    super(message);
    this.name = "ServerError";
    this.statusCode = 500; // Código de status HTTP para erros internos
  }
}

/**
 * @description Classe de erro para representar recursos não encontrados.
 */
export class ResourceNotFound extends Error {
  /**
   * @param {string} resourceName - Nome ou descrição do recurso não encontrado.
   */
  constructor(resourceName) {
    super(`Resource not found: ${resourceName}`);
    this.name = "ResourceNotFound";
    this.statusCode = 404; // Código de status HTTP para "Not Found"
    this.resourceName = resourceName;
  }
}

/**
 * @description Classe de erro para representar parâmetros ausentes.
 */
export class MissingParamError extends Error {
  /**
   * @param {string} paramName - Nome do parâmetro ausente.
   */
  constructor(paramName) {
    super(`Missing parameter: ${paramName}`);
    this.name = "MissingParamError";
    this.statusCode = 400; // Código de status HTTP para "Bad Request"
    this.paramName = paramName;
  }
}

/**
 * @description Classe de erro para representar erros de parâmetros inválidos.
 */
export class ParamError extends Error {
  /**
   * @param {string} paramName - Nome do parâmetro inválido.
   */
  constructor(paramName) {
    super(`Invalid parameter: ${paramName}`);
    this.name = "ParamError";
    this.statusCode = 400;
    this.paramName = paramName;
  }
}
