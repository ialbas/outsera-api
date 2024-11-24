import express from "express";
import cors from "cors";

import { initializeDatabase } from "./config/database.js";
import logger from "./helpers/logger.js";
import routes from "./routes/index.js";

import loadFileData from "./config/loadFileData.js"

const app = express();

// Configuração do CORS
const corsOptions = {
  origin: "*",
  methods: ["GET", "POST"],
  allowedHeaders: ["Content-Type", "Authorization"], 
};

app.use(cors(corsOptions));

// Middleware para rotas
app.use("/api", routes);


// Configurações de porta
const PORT = process.env.PORT || 3000;
const PORT_TEST = process.env.PORT_TEST || 3002;

const startServer = () => {
  if (process.env.NODE_ENV !== "test") {
    app.listen(PORT, () => {
      logger.info(`Servidor rodando em http://localhost:${PORT}/`);
      logger.info(`Documentação disponível em http://localhost:${PORT}/api-docs`);
    });
  } else {
    app.listen(PORT_TEST, () => {
      logger.info(`Servidor de teste rodando na porta ${PORT_TEST}`);
    });
  }
};

// Inicialização da aplicação
initializeDatabase();

// Carrega os dados do arquivo movielist
(async () => {
  await loadFileData();
})();

startServer();

export default app; // Exporta o app para uso em testes (ex: Supertest)
