import { describe, it, before, after } from "mocha";
import supertest from "supertest";
import assert from "assert";
import path from "path";
import { fileURLToPath } from "url";
import { dirname } from "path";

import app from "../src/app.js";
import sequelize from "../src/config/database.js";
import Movie from "../src/models/movie.js";
import logger from "../src/helpers/logger.js";
import HttpResponse from "../src/helpers/http/http-response.js";
import { cleanupFolderUploads } from "../src/helpers/utils.js";

// Definindo __dirname para módulos ES6
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

before(() => {
  logger.transports.forEach((transport) => {
    transport.silent = true;
  });
});

describe("Testes de Integração - Inicialização de Arquivo CSV", () => {
  it("deve apresentar dois resultados min com intervalo igual a 1", async () => {
    const response = await supertest(app)
      .get("/api/producers/intervals")
      .expect(200);

    assert.equal(response.body.data.min[0].interval, 1);
    assert.equal(response.body.data.min[1].interval, 1);
  });
  it("deve apresentar dois resultados max com intervalo igual a 22", async () => {
    const response = await supertest(app)
      .get("/api/producers/intervals")
      .expect(200);

    assert.equal(response.body.data.max[0].interval, 22);
    assert.equal(response.body.data.max[1].interval, 22);
  });
});

describe("Testes de Integração - Upload de Arquivo", () => {
  it("deve fazer o upload de um arquivo CSV com sucesso", async () => {
    const filePath = path.resolve(
      __dirname,
      "test-files",
      "valid-movielist.csv"
    );

    const response = await supertest(app)
      .post("/api/upload")
      .attach("file", filePath)
      .expect(200);

    assert.strictEqual(response.body.statusCode, 200);
  });

  it("deve retornar produtor(es) que tiveram o menor intervalo de tempo (em anos) entre suas vitórias consecutivas - min", async () => {
    const response = await supertest(app)
      .get("/api/producers/intervals")
      .expect(200);

    assert.deepStrictEqual(response.body.data.min, [
      {
        followingWin: 1991,
        interval: 2,
        previousWin: 1989,
        producer: "Joel Silver",
      },
      {
        followingWin: 1990,
        interval: 2,
        previousWin: 1988,
        producer: "Peter Guber",
      },
    ]);
  });

  it("deve retornar produtor(es) com o maior intervalo de tempo (em anos) entre suas vitórias - max", async () => {
    const response = await supertest(app)
      .get("/api/producers/intervals")
      .expect(200);

    assert.deepStrictEqual(response.body.data.max, [
      {
        followingWin: 2016,
        interval: 13,
        previousWin: 2003,
        producer: "Casey Silver",
      },
      {
        followingWin: 2015,
        interval: 13,
        previousWin: 2002,
        producer: "Matthew Vaughn",
      },
    ]);
  });

  it("deve retornar 404 quando não há dados", async () => {
    await Movie.destroy({ where: {}, truncate: true });

    const httpResponse = HttpResponse.notFound("Dados não encontrados.");

    const response = await supertest(app)
      .get("/api/producers/intervals")
      .expect(httpResponse.statusCode);

    assert.strictEqual(response.statusCode, httpResponse.statusCode);
  });

  it("deve retornar 200 e lidar com casos em que apenas um produtor tem múltiplas vitórias", async () => {
    await Movie.destroy({ where: {}, truncate: true });
    await Movie.bulkCreate(
      [
        {
          year: 1980,
          title: "First Win",
          studios: "Studio E",
          producers: "Producer X",
          winner: "yes",
        },
        {
          year: 1985,
          title: "Second Win",
          studios: "Studio F",
          producers: "Producer X",
          winner: "yes",
        },
      ],
      { validate: true }
    );

    const response = await supertest(app)
      .get("/api/producers/intervals")
      .expect(200);

    assert.deepStrictEqual(response.body.data.min, [
      {
        producer: "Producer X",
        interval: 5,
        previousWin: 1980,
        followingWin: 1985,
      },
    ]);
    assert.deepStrictEqual(response.body.data.max, [
      {
        producer: "Producer X",
        interval: 5,
        previousWin: 1980,
        followingWin: 1985,
      },
    ]);
  });

  it("deve retornar uma lista vazia para 'min' e 'max' se não houver produtores com múltiplas vitórias", async () => {
    await Movie.destroy({ where: {}, truncate: true });
    await Movie.create({
      year: 1995,
      title: "Single Winner Movie",
      studios: "Studio Single",
      producers: "Single Producer",
      winner: "yes",
    });

    const httpResponse = HttpResponse.notFound("Dados não encontrados.");

    const response = await supertest(app)
      .get("/api/producers/intervals")
      .expect(httpResponse.statusCode);

    assert.strictEqual(response.statusCode, httpResponse.statusCode);
  });

  it("deve retornar 400 quando nenhum arquivo for fornecido", async () => {
    const response = await supertest(app).post("/api/upload").expect(400);

    assert.strictEqual(response.body.statusCode, 400);
  });

  it("deve retornar 400 para tipos de arquivos diferentes de CSV", async () => {
    const filePath = path.resolve(__dirname, "test-files", "invalid-file.txt");

    const response = await supertest(app)
      .post("/api/upload")
      .attach("file", filePath)
      .expect(400);

    assert.strictEqual(
      response.body.error.paramName,
      "Não foi possível carregar o CSV"
    );
  });

  it("deve retornar 400 se não houver todas as colunas esperadas", async () => {
    // Simula um erro ao processar o arquivo CSV, por exemplo, removendo permissões de leitura
    const filePath = path.resolve(
      __dirname,
      "test-files",
      "_corrompid-file.csv"
    );

    const response = await supertest(app)
      .post("/api/upload")
      .attach("file", filePath)
      .expect(400);

    assert.strictEqual(
      response.body.error.paramName,
      "Não foi possível carregar o CSV"
    );
  });
});

after(() => {
  logger.transports.forEach((transport) => {
    transport.silent = false;
  });
});

after(async () => {
  await sequelize.drop();
  cleanupFolderUploads();
});
