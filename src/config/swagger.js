import swaggerJsDoc from "swagger-jsdoc";

const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Golden Raspberry API - API Documentation",
      version: "1.0.0",
      description:
        "Esta API é utilizada para processar e expor dados sobre vencedores do prêmio 'Golden Raspberry', conhecido por premiar os piores filmes de cada ano. O objetivo principal é fornecer informações sobre os produtores que têm os menores e maiores intervalos entre vitórias consecutivas. <br><br><b>IMPORTANTE:</b> Não é necessário fazer o <b>Upload</b> antes de buscar os <b>Intervalos</b> dos prêmios, pois os dados são são carregados autimaticamente.",
      contact: {
        name: "Repositório do GitHub",
        url: "https://github.com/ialbas/outsera-api",
      },
      website: {
        name: "MIT",
        url: "https://opensource.org/licenses/MIT",
      },
    },
    servers: [
      {
        url: "http://localhost:3000", // URL base da API
        description: "Web server",
      },
    ],
    externalDocs: {
      description: "Informações e requisitos",
      url: "https://github.com/ialbas/outsera-api",
    },
    components: {
      schemas: {
        Error: {
          type: "object",
          properties: {
            statusCode: {
              type: "integer",
              description: "Código de status HTTP",
              example: 400,
            },
            description: {
              type: "string",
              description: "Descrição do erro",
              example: "Bad Request",
            },
            error: {
              type: "string",
              description: "Mensagem detalhada do erro",
              example: "Invalid parameter: file",
            },
          },
        },
        ServerError: {
          type: "object",
          properties: {
            statusCode: {
              type: "integer",
              description: "Código de status HTTP",
              example: 500,
            },
            description: {
              type: "string",
              description: "Descrição do erro",
              example: "Internal Server Error",
            },
            error: {
              type: "string",
              description: "Mensagem detalhada do erro",
              example: "An unexpected error occurred.",
            },
          },
        },
        NotFoundError: {
          type: "object",
          properties: {
            statusCode: {
              type: "integer",
              description: "Código de status HTTP",
              example: 404,
            },
            description: {
              type: "string",
              description: "Descrição do erro",
              example: "Not Found",
            },
            error: {
              type: "string",
              description: "Recurso que não foi encontrado",
              example: "Resource not found: /api/producers/intervals",
            },
          },
        },
        ValidationError: {
          type: "object",
          properties: {
            statusCode: {
              type: "integer",
              description: "Código de status HTTP",
              example: 400,
            },
            description: {
              type: "string",
              description: "Descrição do erro",
              example: "Validation Error",
            },
            error: {
              type: "string",
              description: "Mensagem detalhada do erro de validação",
              example: "Invalid parameter: year must be between 1900 and 2100.",
            },
          },
        },
      },
    },
  },
  apis: ["./src/routes/movies.js", "./src/controllers/moviesController.js"], // Inclui rotas e controladores para documentação
};

const swaggerConfig = swaggerJsDoc(swaggerOptions);

export { swaggerConfig };
