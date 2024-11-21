import NodeCache from "node-cache";
import logger from "../helpers/logger.js";
import {
  mapProducersToYears,
  createIntervalObject,
  removeFile,
} from "../helpers/utils.js";
import Movie from "../models/movie.js";
import { loadCsvData } from "../helpers/csvLoader.js";
import sequelize from "../config/database.js";

// Configuração do cache com tempo de expiração de 10 minutos (600 segundos)
const cache = new NodeCache({ stdTTL: 600, checkperiod: 620 });

// Verifica se a aplicação está em modo de teste
const isTestEnvironment = process.env.NODE_ENV === "test";

const moviesService = {
  /**
   * @description Obtém os intervalos de prêmios de produtores, utilizando cache se disponível.
   * @param {Function} callback - Função de callback que recebe erro e resultado.
   */
  getAwardIntervals: async (callback) => {
    try {
      const result = await fetchAwardIntervalsFromCacheOrDB();
      callback(null, result);
    } catch (error) {
      logger.error(`Erro ao consultar o banco de dados: ${error.message}`);
      callback(error, null);
    }
  },

  /**
   * @description Sincroniza o banco de dados e carrega os dados do arquivo CSV.
   * @param {string} filePath - Caminho do arquivo CSV.
   * @returns {Promise<boolean>} Retorna true se o carregamento for bem-sucedido, false caso contrário.
   */
  uploadCSV: async (filePath) => {
    try {
      cache.flushAll();
      logger.info("Dados do cache removidos.");
      await clearMovieTable();

      return await syncDatabaseAndLoadData(filePath);
    } catch (error) {
      await removeFile(filePath);
     // logger.error(`Erro ao processar o arquivo CSV: ${error.message}`);
      return false;
    }
  },
};

/**
 * @description Consulta os intervalos de prêmios do cache ou do banco de dados.
 * @returns {Object} Intervalos de prêmios calculados.
 */
const fetchAwardIntervalsFromCacheOrDB = async () => {
  if (!isTestEnvironment) {
    const cachedIntervals = cache.get("awardIntervals");
    if (cachedIntervals) {
      logger.info("Dados de intervalos de prêmios retornados do cache.");
      return cachedIntervals;
    }
  }

  const movies = await Movie.findAll({
    where: { winner: "yes" },
    order: [["producers", "ASC"], ["year", "ASC"]],
    attributes: ["producers", "year"],
  });
  logger.info("Consulta ao banco de dados concluída com sucesso.");

  const producerYears = mapProducersToYears(movies);
  const { minResults, maxResults } = calculateAwardIntervals(producerYears);

  const result = { min: minResults, max: maxResults };

  if (!isTestEnvironment) {
    cache.set("awardIntervals", result);
  }

  return result;
};

/**
 * @description Limpa a tabela de filmes no banco de dados.
 */
const clearMovieTable = async () => {
  await Movie.destroy({ truncate: true });
  logger.info("Dados da tabela movie removidos.");
};

/**
 * @description Sincroniza o banco de dados e carrega os dados do CSV.
 * @param {string} filePath - Caminho do arquivo CSV.
 * @returns {Promise<boolean>} Retorna true se o carregamento for bem-sucedido.
 */
const syncDatabaseAndLoadData = async (filePath) => {
  try {
    await sequelize.sync();
    logger.info("Banco de dados SQLite em memória sincronizado com a tabela movies.");
    const result = await loadCsvData(filePath);

    return result;
  } catch (error) {
    logger.error("Erro ao sincronizar o banco de dados:", error);
    return false;
  }
};
/**
 * @description Calcula os intervalos de prêmios entre anos para cada produtor.
 * @param {Object} producerYears - Mapeamento de produtores para anos.
 * @returns {Object} Resultados com intervalos mínimos e máximos.
 */
const calculateAwardIntervals = (producerYears) => {
  let minInterval = Infinity;
  let maxInterval = -Infinity;
  const minResults = [];
  const maxResults = [];

  // Itera sobre cada produtor e seus anos de vitória
  Object.entries(producerYears).forEach(([producer, years]) => {
    // Ordena os anos de forma crescente
    years.sort((a, b) => a - b);

    // Calcula intervalos apenas se houver mais de uma vitória
    for (let i = 1; i < years.length; i++) {
      const interval = years[i] - years[i - 1];

      if (interval < minInterval) {
        minInterval = interval;
        minResults.length = 0; // Reseta os resultados mínimos
      }
      if (interval === minInterval) {
        minResults.push(createIntervalObject(producer, interval, years[i - 1], years[i]));
      }

      if (interval > maxInterval) {
        maxInterval = interval;
        maxResults.length = 0; // Reseta os resultados máximos
      }
      if (interval === maxInterval) {
        maxResults.push(createIntervalObject(producer, interval, years[i - 1], years[i]));
      }
    }
  });

  logger.info("Intervalos de prêmios calculados com sucesso.");
  return { minResults, maxResults };
};

export default moviesService;
