import logger from "../helpers/logger.js";
import fs, { truncate } from "fs";
import csv from "csv-parser";

/**
 * @description Sanitiza a saída removendo caracteres especiais indesejados.
 * @param {string} output - Texto a ser sanitizado.
 * @returns {string} Texto sanitizado, ou uma string vazia se o input não for válido.
 */
export const sanitizeOutput = (output) => {
  if (typeof output !== "string") return "";
  return output.replace(/[^\w\s.,'-]/gi, ""); // Mantém apenas caracteres seguros
};

/**
 * @description Sanitiza a entrada removendo caracteres especiais indesejados.
 * @param {string} input - Texto a ser sanitizado.
 * @returns {string} Texto sanitizado, ou uma string vazia se o input não for válido.
 */
export const sanitizeInput = (input) => {
  if (typeof input !== "string") return "";
  return input.replace(/[^\w\s.,'-]/gi, ""); // Remove caracteres especiais
};

/**
 * @description Remove um arquivo de forma assíncrona e registra o resultado.
 * @param {string} path - Caminho do arquivo a ser removido.
 * @returns {Promise<void>} Uma promessa que resolve após a remoção ou registra um erro.
 */
export const removeFile = async (path) => {
  try {
    await new Promise((resolve, reject) => {
      fs.unlink(path, (err) => {
        if (err) {
          reject(err); // Lança o erro se a remoção falhar
        } else {
          resolve(); // Resolve se a remoção for bem-sucedida
        }
      });
    });

    logger.info(`Arquivo CSV ${path} removido da pasta com sucesso.`);
  } catch (error) {
    logger.error(`Erro ao remover o arquivo: ${error.message}`);
  }
};

/**
 * @description Limpa o arquivo temporário após o processamento.
 * @param {string} filePath - Caminho do arquivo a ser removido.
 */
export const cleanupFile = (filePath) => {
  if (fs.existsSync(filePath)) {
    fs.unlink(filePath, (err) => {
      if (err) {
        logger.error(`Erro ao remover o arquivo CSV: ${err.message}`);
      } else {
        logger.info(`Arquivo CSV ${filePath} removido com sucesso.`);
      }
    });
  } else {
    logger.warn(`Arquivo não encontrado: ${filePath}`);
  }
};

// Colunas esperadas no cabeçalho do arquivo CSV
const expectedColumns = ["year", "title", "studios", "producers", "winner"];

/**
 * @description Verifica se um arquivo CSV transmitido como stream contém as colunas esperadas.
 * @param {object} file - Objeto de arquivo fornecido pelo cliente (stream CSV).
 * @returns {Promise<boolean>} Retorna uma Promise que resolve para true se as colunas forem válidas, false caso contrário.
 */
const hasExpectedColumns = (file) => {
  return new Promise((resolve) => {
    const stream = fs
      .createReadStream(file.path)
      .pipe(csv({ separator: "," }))
      .on("headers", (headers) => {
        // Verifica se todas as colunas esperadas estão presentes no cabeçalho
        const hasAllColumns = expectedColumns.every(
          (col) => headers.includes(col)
        );

        if (!hasAllColumns) {
          logger.warn("O arquivo CSV não contém todas as colunas esperadas.");
          stream.destroy(); // Para a leitura da stream

          return resolve(false);
        }

        resolve(true); // Cabeçalho válido
      })
      .on("error", (error) => {
        logger.error(`Erro ao analisar o arquivo CSV: ${error.message}`);
        resolve(false);
      });
  });
};

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
    year <= currentYear &&
    sanitizeInput(row.title) &&
    sanitizeInput(row.studios) &&
    sanitizeInput(row.producers)
  );
};

/**
 * Valida o conteúdo de um arquivo CSV.
 * @param {String} filePath - Caminho do arquivo CSV.
 * @returns {Promise<Boolean>} Retorna uma promessa que resolve para true se o CSV for válido, false caso contrário.
 */
const validateCsvFile = (filePath) => {
  return new Promise((resolve) => {
    let headersValidated = false;

    const currentYear = new Date().getFullYear();

    const stream = fs
      .createReadStream(filePath)
      .pipe(csv({ separator: ";" }))
      .on("headers", (headers) => {
        headersValidated = validateHeaders(headers);
        if (!headersValidated) {
          stream.destroy();
          return resolve(false);
        }
        logger.info("Validação das colunas do CSV concluída com sucesso.");
      })
      .on("data", (row) => {
        if (headersValidated) {
          const rowIsValid = validateRow(row, currentYear);
          if (!rowIsValid) {
            logger.warn(`Linha de dados inválida: ${JSON.stringify(row)}`);
            stream.destroy();
            return resolve(false);
          }
        }
      })
      .on("end", () => {
        resolve(true); // CSV é considerado válido se todas as verificações passarem
      })
      .on("error", (error) => {
        logger.error(`Erro ao analisar o arquivo CSV: ${error.message}`);
        resolve(false);
      });
  });
};

/**
 * @description Verifica se o arquivo fornecido é um CSV válido.
 * @param {object} file - Objeto de arquivo fornecido pelo cliente.
 * @returns {Promise<boolean>} Retorna uma Promise que resolve para true se o arquivo for um CSV válido.
 */
export const isValidCsvFile = async (file) => {
  const validMimeType = "text/csv";

  // Verificar o mimetype do arquivo
  if (file.mimetype !== validMimeType) {
    logger.warn(
      `Tipo de arquivo inválido: ${file}. Esperado: ${validMimeType}`
    );
    return false;
  }

  const contentCSV = await validateCsvFile(file);

  return true;
};

/**
 * @description Apaga todos os arquivos de uma pasta específica.
 * @param {string} folderPath - Caminho da pasta a ser limpa.
 */
export const cleanupFolderUploads = () => {

  const folderPath = '/uploads'
  try {
    // Verifica se o diretório existe
    if (!fs.existsSync(folderPath)) {
      return;
    }

    // Lê o conteúdo da pasta
    const files = fs.readdirSync(folderPath);

    // Apaga cada arquivo na pasta
    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      try {
        fs.unlinkSync(filePath); // Remove o arquivo de forma síncrona
        logger.info(`Arquivo ${filePath} removido com sucesso.`);
      } catch (error) {
        logger.error(`Erro ao remover o arquivo ${filePath}: ${error.message}`);
      }
    });

  } catch (error) {
    logger.error(`Erro ao limpar a pasta ${folderPath}: ${error.message}`);
  }
};

/**
 * @description Verifica se o resultado da consulta está vazio.
 * @param {object} result - Objeto de resultado contendo listas de produtores.
 * @returns {boolean} Retorna true se ambos os arrays 'min' e 'max' estiverem vazios.
 */
export const isEmptyResult = (result) => {
  const isMinEmpty = Array.isArray(result.min) && result.min.length === 0;
  const isMaxEmpty = Array.isArray(result.max) && result.max.length === 0;
  return isMinEmpty && isMaxEmpty;
};

/**
 * @description Mapeia produtores para os anos em que venceram prêmios.
 * @param {Array} movies - Lista de filmes vencedores.
 * @returns {Object} Mapeamento de produtores para anos.
 */
export const mapProducersToYears = (movies) => {
  const producerYears = {};
  movies.forEach(({ producers, year }) => {
    producers
      .replace(/\s+and\s+/g, ",")
      .split(",")
      .map((producer) => sanitizeOutput(producer.trim()))
      .forEach((producer) => {
        if (!producerYears[producer]) {
          producerYears[producer] = [];
        }
        producerYears[producer].push(year);
      });
  });
  return producerYears;
};

/**
 * @description Cria um objeto de intervalo de prêmio.
 * @param {string} producer - Nome do produtor.
 * @param {number} interval - Intervalo de anos entre prêmios.
 * @param {number} previousWin - Ano da vitória anterior.
 * @param {number} followingWin - Ano da vitória seguinte.
 * @returns {Object} Objeto de intervalo de prêmio.
 */
export const createIntervalObject = (
  producer,
  interval,
  previousWin,
  followingWin
) => {
  return {
    producer: sanitizeOutput(producer),
    interval,
    previousWin,
    followingWin,
  };
};
