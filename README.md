# Golden Raspberry API

## Descrição

Esta API é utilizada para processar e expor dados sobre vencedores do prêmio "Golden Raspberry", conhecido por premiar os piores filmes de cada ano. O objetivo principal é fornecer informações sobre os produtores que têm os menores e maiores intervalos entre vitórias consecutivas.

## Funcionalidades

- **Carregamento de Arquivo CSV**: Processa e valida dados de um arquivo CSV, inserindo os dados no banco de dados.
- **API RESTful**: Endpoints para consultar intervalos de prêmios de produtores.
- **Validação de Dados**: Confirma a formatação correta do CSV e a presença das colunas esperadas.
- **Logs e Limpeza Automática**: Sistema de logging e exclusão de arquivos temporários após o processamento.

## Tecnologias Utilizadas

- **Node.js** e **Express.js**: Usados para criar a API RESTful, fornecendo um servidor leve e robusto para comunicação HTTP.
- **Sequelize**: ORM (Object Relational Mapper) que simplifica a interação com o banco de dados SQLite.
- **SQLite**: Banco de dados relacional leve para armazenamento dos dados processados.
- **csv-parser**: Biblioteca para leitura e processamento eficiente de arquivos CSV.
- **Multer**: Middleware para gerenciamento de uploads de arquivos, permitindo o envio de arquivos CSV para a API.
- **Mocha e Supertest**: Frameworks de testes para realizar testes unitários e de integração.

### Outras Tecnologias

- **swagger-jsdoc**: Gera a documentação da API automaticamente a partir de comentários JSDoc no código. É essencial para manter a documentação atualizada sem esforço manual.
- **swagger-ui-express**: Serve uma interface gráfica para interagir com a API documentada, facilitando o consumo e teste de endpoints.
- **winston**: Ferramenta para geração de logs centralizados, com suporte a múltiplos formatos (console e arquivos).
- **cross-env**: Permite definir variáveis de ambiente de forma consistente, garantindo compatibilidade entre sistemas Windows, Linux e macOS.
- **nodemon**: Automatiza o reinício do servidor sempre que alterações são feitas no código durante o desenvolvimento.
- **chai**: Biblioteca de asserção que complementa o Mocha, oferecendo uma sintaxe expressiva para escrever testes.
- **node-cache**: Utilizada para armazenar em memória dados que são frequentemente acessados, reduzindo consultas ao banco de dados e melhorando o desempenho.

## Como Executar

1. **Clone o repositório**:

O repositório pode ser encontrado em: https://github.com/ialbas/outsera-api

```bash
   git clone https://github.com/ialbas/outsera-api
```

2. **Instale as dependências:**:

```bash
  npm install
```

3. **Configure o ambiente:**:

- Verifique sua versão do NodeJS, este projeto foi desenvolvido na versão 20.0.0

### Comandos Disponíveis

- **Iniciar o servidor**:

  ```bash
    npm start
  ```

  O servidor será iniciado na porta 3000 ou na porta especificada em `PORT` no ambiente.

- **Modo de desenvolvimento** (com hot-reloading usando `nodemon`):

  ```bash
    npm run dev
  ```

- **Executar os testes de integração**:

  ```bash
    npm test
  ```

  O servidor será iniciado na porta 3001 ou na porta especificada em `PORT_TEST` no ambiente.

## Utilização da API

Para a utilização da API, primeiramente é necessario enviar o arquivo CSV, conforme a especificação.

### Endpoints

#### POST /api/uploads

- **Descrição**: Realiza o carregamento do arquivo CSV estritamente conforme os requisitos técnicos.
- **Exemplo de Arquivo**:

```csv

year;title;studios;producers;winner
1981;Raiders of the Lost Ark;Lucasfilm;George Lucas;yes
1984;Ghostbusters;Columbia Pictures;Ivan Reitman;no
1994;Forrest Gump;Paramount Pictures;Wendy Finerman;yes

```

- **Exemplo de Resposta**:

  ```json
  {
    "statusCode": 200,
    "description": "OK",
    "data": {
      "total_linas_csv": 206,
      "total_linhas_inseridas": 206,
      "total_linhas_rejeitadas": 0
    }
  }
  ```

#### GET /api/producers/intervals

- **Descrição**: Retorna os produtores com os menores e maiores intervalos entre vitórias consecutivas.
- **Exemplo de Resposta**:

  ```json
  {
    "min": [
      {
        "producer": "Bo Derek",
        "interval": 1,
        "previousWin": 1989,
        "followingWin": 1990
      }
    ],
    "max": [
      {
        "producer": "Matthew Vaughn",
        "interval": 13,
        "previousWin": 2002,
        "followingWin": 2015
      }
    ]
  }
  ```

## Collection para Postman

Para facilitar o teste dos endpoints da API, você pode importar a collection do Postman fornecida no projeto.

1. **Importe a Collection**:

   - O arquivo da collection está localizado em: [`test_api_outsera_postman_collection.json`](./outsera-test.postman_collection.json).
   - Importe o arquivo no Postman para acessar rapidamente as rotas e parâmetros da API.

2. **Testando os Endpoints**:
   - Certifique-se de que a aplicação está em execução antes de enviar as requisições.
   - Use as requisições pré-configuradas na collection para carregar o arquivo CSV e consultar os dados.

_Observação_: Verifique se o ambiente no Postman está configurado corretamente com a URL base da API (`http://localhost:3000/api`).

## Documentação Swagger

A API possui uma documentação detalhada usando Swagger, facilitando a visualização dos endpoints e a interação com eles.

- **URL da Documentação Swagger - Local**: [http://localhost:3000/api/docs/](http://localhost:3000/api/docs/)

### Como Usar

1. Na raiz do projeto, inicialize o sistema.

```bash
   npm start
```

2. Acesse o link acima para abrir a interface Swagger.
3. f
4. Explore os endpoints disponíveis, veja exemplos de requisições e execute-as diretamente na interface.

_Observação_: Certifique-se de que a API está ativa para testar os endpoints diretamente pelo Swagger.

## Versão Online

Se preferir, você pode testar a API diretamente na versão online do projeto, sem precisar configurar nada localmente.

- **URL da API Online**: [http://outsera.ialbasjunior.com.br/api/docs/](http://outsera.ialbasjunior.com.br/api/docs/)

### Observações

- Certifique-se de usar os endpoints corretos conforme descrito na documentação.
- O ambiente online pode ter limites de uso ou restrições de acordo com as configurações do servidor.

_Nota_: Caso a URL fornecida não esteja ativa, verifique com o mantenedor do projeto ou configure a aplicação localmente.
