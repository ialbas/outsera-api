import express from "express";
import swaggerUi from "swagger-ui-express";
import { swaggerConfig } from "../config/swagger.js";

const router = express.Router();

/**
 * @description Rota para a interface Swagger.
 * @route GET /api-docs
 * @returns {HTML} Interface interativa da documentação Swagger.
 */
router.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerConfig, {
  explorer: true, // Adiciona o recurso de explorar esquemas no Swagger
}));

export default router;
