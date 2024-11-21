import { ServerError, ResourceNotFound, ParamError } from "./errors.js";

/**
 * @description Classe utilitária para criar respostas HTTP padronizadas.
 */
export default class HttpResponse {
  /**
   * @description Retorna uma resposta para erro interno do servidor.
   * @param {string} [message="Internal server error"] - Mensagem detalhada do erro.
   * @returns {Object} Objeto de resposta HTTP.
   */
  static serverError(message = "Internal server error") {
    return {
      statusCode: 500,
      description: "Internal Server Error",
      error: new ServerError(message),
    };
  }

  /**
   * @description Retorna uma resposta para recurso não encontrado.
   * @param {string} resourceName - Nome ou descrição do recurso não encontrado.
   * @returns {Object} Objeto de resposta HTTP.
   */
  static notFound(resourceName) {
    return {
      statusCode: 404,
      description: "Not Found",
      error: new ResourceNotFound(resourceName),
    };
  }

  /**
   * @description Retorna uma resposta para requisição inválida devido a parâmetros incorretos.
   * @param {string} paramName - Nome do parâmetro que causou o erro.
   * @returns {Object} Objeto de resposta HTTP.
   */
  static badRequest(paramName) {
    return {
      statusCode: 400,
      description: "Bad Request",
      error: new ParamError(paramName),
    };
  }

  /**
   * @description Retorna uma resposta de sucesso com dados fornecidos.
   * @param {any} data - Dados a serem retornados na resposta.
   * @returns {Object} Objeto de resposta HTTP.
   */
  static ok(data) {
    return {
      statusCode: 200,
      description: "OK",
      data,
    };
  }

  /**
   * @description Retorna uma resposta de criação bem-sucedida.
   * @param {any} data - Dados a serem retornados na resposta.
   * @returns {Object} Objeto de resposta HTTP.
   */
  static created(data) {
    return {
      statusCode: 201,
      description: "Created",
      data,
    };
  }

  /**
   * @description Retorna uma resposta para requisição sem conteúdo.
   * @returns {Object} Objeto de resposta HTTP.
   */
  static noContent() {
    return {
      statusCode: 204,
      description: "No Content",
    };
  }
}
