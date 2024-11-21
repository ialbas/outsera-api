// config/database.js

import { Sequelize } from "sequelize";
import logger from "../helpers/logger.js";


// Configuração do Sequelize para usar SQLite em memória
const sequelize = new Sequelize({
  dialect: "sqlite",
  storage: ":memory:",
  logging: false,
});

/**
 * @description Inicializa a conexão com o banco de dados e executa tarefas de pré-carregamento.
 */
export const initializeDatabase = async () => {
  try {
    await sequelize.sync();
    logger.info("Banco de dados sincronizado com sucesso.");
    
  } catch (error) {
    logger.error("Erro ao sincronizar o banco de dados:", error);
    process.exit(1); // Encerra o processo em caso de falha crítica
  }
};


export default sequelize;
