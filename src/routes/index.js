// routes/index.js

import express from "express";
import moviesRoutes from "./movies.js";
import swagger from './swagger.js'

const routes = express.Router();

/**
 * @description Middleware para definir as rotas principais da aplicação.
 */
routes.use(moviesRoutes);
routes.use(swagger);

export default routes;
