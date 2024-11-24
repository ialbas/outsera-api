import fs from "fs";
import csv from "csv-parser";
import logger from "./logger.js";
import { sanitizeInput, cleanupFile } from "./utils.js";
import Movie from "../models/movie.js";

// Definindo as colunas esperadas do CSV
const expectedColumns = ["year", "title", "studios", "producers", "winner"];

/**
 * Valida o cabeçalho do CSV.
 * @param {Array} headers - Cabeçalhos do arquivo CSV.
 * @returns {Boolean} Retorna verdadeiro se os cabeçalhos forem válidos.
 */
const validateHeaders = (headers) => {
  const isValid = expectedColumns.every((col) => headers.includes(col));
  if (!isValid) {
    logger.error(
      "Os nomes das colunas no arquivo CSV estão incorretos ou incompletos."
    );
  }
  return isValid;
};

/**
 * Valida uma linha de dados do CSV.
 * @param {Object} row - Linha de dados do CSV.
 * @param {Number} currentYear - Ano atual para validação.
 * @returns {Boolean} Retorna verdadeiro se a linha for válida.
 */
const validateRow = (row, currentYear) => {
  const year = parseInt(row.year, 10);
  return (
    year >= 1900 &&
    year <= 2100 &&
    sanitizeInput(row.title) &&
    sanitizeInput(row.studios) &&
    sanitizeInput(row.producers)
  );
};

/**
 * Insere dados em massa no banco de dados.
 * @param {Array} rows - Linhas de dados a serem inseridas.
 * @param {Object} transaction - Transação do Sequelize.
 * @returns {Promise} Retorna uma promessa que resolve após a inserção.
 */
const insertBulkData = async (rows, transaction) => {
  try {
    await Movie.bulkCreate(rows, { transaction });
    return rows.length;
  } catch (err) {
    logger.error(`Erro ao inserir dados: ${err.message}`);
    return 0;
  }
};

/**
 * Processa e carrega o arquivo CSV.
 * @param {String} filePath - Caminho do arquivo CSV.
 * @param {Function} onComplete - Função de callback executada ao finalizar o carregamento.
 */
const execLoadCsvData = async (filePath, onComplete) => {
  const result = {
    total_linas_csv: 0,
    total_linhas_inseridas: 0,
    total_linhas_rejeitadas: 0,
  };

  if (!fs.existsSync(filePath)) {
    logger.error(
      `Erro: O arquivo CSV não foi encontrado no destino especificado: ${filePath}`
    );
    cleanupFile(filePath);
    return;
  }

  const currentYear = new Date().getFullYear();
  let totalLines = 0;
  let insertedLines = 0;
  let rejectedLines = 0;
  const rowsToInsert = [];

  try {
    const transaction = await Movie.sequelize.transaction();

    const stream = fs
      .createReadStream(filePath)
      .pipe(csv({ separator: ";" }))
      .on("headers", (headers) => {
        if (!validateHeaders(headers)) {
          stream.destroy();
          onComplete(false);
        } else {
          logger.info("Validação das colunas do CSV concluída com sucesso.");
        }
      })
      .on("data", (row) => {
        totalLines++;
        if (validateRow(row, currentYear)) {
          rowsToInsert.push({
            year: parseInt(row.year, 10),
            title: sanitizeInput(row.title),
            studios: sanitizeInput(row.studios),
            producers: sanitizeInput(row.producers),
            winner: sanitizeInput(row.winner),
          });

          if (rowsToInsert.length >= 1000) {
            insertBulkData(rowsToInsert, transaction).then((count) => {
              insertedLines += count;
              rowsToInsert.length = 0;
            });
          }
        } else {
          logger.warn(
            `Dados inválidos ou ano fora do intervalo permitido: ${JSON.stringify(
              row
            )}`
          );
          rejectedLines++;
        }
      })
      .on("end", async () => {
        try {
          if (rowsToInsert.length > 0) {
            insertedLines += await insertBulkData(rowsToInsert, transaction);
          }
          await transaction.commit();
          logger.info("Transação finalizada com sucesso.");
        } catch (err) {
          await transaction.rollback();
          logger.error(`Erro ao finalizar a transação: ${err.message}`);
          cleanupFile(filePath);
        }

        logger.info(`Total de linhas no CSV: ${totalLines}`);
        logger.info(`Linhas inseridas no banco: ${insertedLines}`);
        logger.warn(`Linhas rejeitadas: ${rejectedLines}`);

        result.total_linas_csv = totalLines;
        result.total_linhas_inseridas = insertedLines;
        result.total_linhas_rejeitadas = rejectedLines;

        onComplete(result);
      })
      .on("error", (err) => {
        logger.error(`Erro ao processar o arquivo CSV: ${err.message}`);
        stream.destroy();
        cleanupFile(filePath);
        onComplete(false);
      });
  } catch (err) {
    logger.error(`Erro ao iniciar a transação: ${err.message}`);
    cleanupFile(filePath);
    onComplete(false);
  }
};

/**
 * Carrega os dados de um arquivo CSV no banco de dados.
 * @param {String} filePath - Caminho do arquivo CSV.
 * @param {Boolean} maintain - Opão para manter o remover o arquivo apos o processamento.
 * @returns {Promise<Object>} Retorna uma promessa que resolve com o resultado da operação.
 */
async function loadCsvData(filePath, maintain) {
  return new Promise((resolve, reject) => {
    // Função callback que é chamada quando o carregamento é concluído
    const handleCompletion = (result) => {
      if (result.error) {
        logger.error(`Erro ao carregar o CSV no banco de dados: ${result.error}`);
        if (!maintain) {
          cleanupFile(filePath);
        }
        reject(result.error);
      } else {
        logger.info("Dados carregados com sucesso no banco de dados.");
        if (!maintain) {
          cleanupFile(filePath);
        }
        resolve(result);
      }
    };

    // Executa o carregamento dos dados CSV
    execLoadCsvData(filePath, handleCompletion);
  });
}

export { loadCsvData };
