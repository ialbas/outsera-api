import HttpResponse from "../helpers/http/http-response.js";
import moviesService from "../services/moviesService.js";
import {
  cleanupFile,
  isValidCsvFile,
  isEmptyResult,
} from "../helpers/utils.js";

const moviesController = {
  /**
   * @swagger
   * /api/upload:
   *   post:
   *     summary: Processa o upload de um arquivo CSV
   *     tags: [Upload]
   *     requestBody:
   *       required: true
   *       content:
   *         multipart/form-data:
   *           schema:
   *             type: object
   *             properties:
   *               file:
   *                 type: string
   *                 format: binary
   *     responses:
   *       200:
   *         description: Upload e processamento bem-sucedidos.
   *         content:
   *           application/json:
   *             schema:
   *               type: object
   *               properties:
   *                 total_linas_csv:
   *                   type: integer
   *                 total_linhas_inseridas:
   *                   type: integer
   *                 total_linhas_rejeitadas:
   *                   type: integer
   *       400:
   *         description: Arquivo não fornecido ou dados inválidos.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   *       500:
   *         description: Erro no servidor ao processar o arquivo.
   *         content:
   *           application/json:
   *             schema:
   *               $ref: '#/components/schemas/Error'
   */
  sendFileCSV: async (req, res) => {
    const file = req.file;

    if (!file) {
      const response = HttpResponse.badRequest("Arquivo não fornecido");
      return res.status(response.statusCode).json(response);
    }

    const filePath = file.path;

    try {
      const charge = await moviesService.uploadCSV(filePath);

      if (charge) {
        const response = HttpResponse.ok(charge);
        return res.status(response.statusCode).json(response);
      }

      cleanupFile(filePath);
      const response = HttpResponse.badRequest(
        "Não foi possível carregar o CSV"
      );
      return res.status(response.statusCode).json(response);
    } catch (error) {
      cleanupFile(filePath);
      const response = HttpResponse.serverError(
        "Erro ao carregar o arquivo CSV"
      );
      return res.status(response.statusCode).json(response);
    }
  },
  /**
 * @swagger
 * /api/producers/intervals:
 *   get:
 *     summary: Retorna os produtores com maiores e menores intervalos entre vitórias consecutivas.
 *     tags: [Intervalos]
 *     responses:
 *       200:
 *         description: Retorna os intervalos de produtores.
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 min:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       producer:
 *                         type: string
 *                       interval:
 *                         type: integer
 *                       previousWin:
 *                         type: integer
 *                       followingWin:
 *                         type: integer
 *                 max:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       producer:
 *                         type: string
 *                       interval:
 *                         type: integer
 *                       previousWin:
 *                         type: integer
 *                       followingWin:
 *                         type: integer
 */
  getProducerIntervals: async (req, res) => {
    try {
      const result = await fetchAwardIntervals();

      if (isEmptyResult(result)) {
        const response = HttpResponse.notFound("Dados não encontrados.");
        return res.status(response.statusCode).json(response);
      }

      const response = HttpResponse.ok(result);
      return res.status(response.statusCode).json(response);
    } catch (error) {
      const response = HttpResponse.serverError(
        "Erro ao obter os intervalos de prêmios"
      );
      return res.status(response.statusCode).json(response);
    }
  },
};

/**
 * @description Obtém os intervalos de prêmios.
 * @returns {Promise<object>} Promessa que resolve com os intervalos de prêmios.
 */
const fetchAwardIntervals = () => {
  return new Promise((resolve, reject) => {
    moviesService.getAwardIntervals((err, intervals) => {
      if (err) {
        return reject(err);
      }
      resolve(intervals);
    });
  });
};

export default moviesController;
