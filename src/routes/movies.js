// routes/movies.js

import express from "express";
import multer from "multer";
import moviesController from "../controllers/moviesController.js";

const router = express.Router();

/**
 * @description Configuração do multer para gerenciar uploads de arquivos, com destino na pasta 'uploads'.
 */
const upload = multer({ dest: "uploads/" });

/**
 * @route GET /producers/intervals
 * @description Retorna os intervalos de prêmios dos produtores.
 */
router.get("/producers/intervals", moviesController.getProducerIntervals);

/**
 * @route POST /upload
 * @description Rota para fazer upload de um arquivo CSV. O arquivo é salvo temporariamente na pasta 'uploads'.
 * @middleware upload.single("file") - Middleware para gerenciar o upload de um único arquivo.
 */
router.post("/upload", upload.single("file"), moviesController.sendFileCSV);

export default router;
