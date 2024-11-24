import logger from "../helpers/logger.js";
import { loadCsvData } from "../helpers/csvLoader.js";

const csvFilePath = "./data/movielist.csv"; // Caminho do arquivo CSV

// Carregar o CSV ao iniciar o sistema
const loadFileData = async () => {
  
  const result = await loadCsvData(csvFilePath, true);
  if (result) {
    logger.info(`Dados do arquivo ${csvFilePath} CSV carregados com sucesso!`);
  } else {
    logger.error("Falha ao carregar os dados do CSV.");
  }
};

export default loadFileData;
