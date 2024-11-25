import { DataTypes } from "sequelize";
import sequelize  from "../config/database.js";

/**
 * @description Define o modelo Movie com atributos e validações.
 */
const Movie = sequelize.define(
  "Movie",
  {
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      autoIncrement: true,
    },
    year: {
      type: DataTypes.INTEGER,
      allowNull: false,
      validate: {
        min: 1900, // Ano mínimo permitido
        max: 2100, // Ano máximo permitido
      },
      comment: "Ano de lançamento do filme. Deve estar entre 1900 e 2100.",
    },
    title: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Título do filme. Este campo é obrigatório.",
    },
    studios: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment:
        "Estúdio(s) que produziu(ram) o filme. Este campo é obrigatório.",
    },
    producers: {
      type: DataTypes.TEXT,
      allowNull: false,
      comment: "Produtor(es) do filme. Este campo é obrigatório.",
    },
    winner: {
      type: DataTypes.TEXT,
      allowNull: true,
      comment: "Indica se o filme é um vencedor. Pode ser 'yes' ou null.",
    },
  },
  {
    timestamps: true,
    tableName: "movies",
    comment:
      "Tabela que armazena informações sobre filmes, incluindo título, estúdios, produtores e status de vencedor.",
  }
);

export default Movie;
