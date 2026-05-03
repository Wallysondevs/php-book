import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { BrowserBlock } from "@/components/ui/BrowserBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Openapi() {
  return (
    <PageContainer
      title="OpenAPI/Swagger"
      subtitle="Documente sua API uma vez em YAML e ganhe docs interativos, SDK cliente em qualquer linguagem e validação automática de request/response. O contrato vira a fonte da verdade."
      difficulty="avancado"
      timeToRead="13 min"
      category="APIs REST"
    >
      <AlertBox type="info" title="Pré-requisitos">
          <p>Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP.</p>
        </AlertBox>
        <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"OpenAPI"}</strong> {' — '} {"spec (ex-Swagger) que descreve API em YAML/JSON."}
          </li>
        <li>
            <strong>{"Schema"}</strong> {' — '} {"descreve forma das requisições e respostas."}
          </li>
        <li>
            <strong>{"Geração"}</strong> {' — '} {"codegen produz client/server stubs."}
          </li>
        <li>
            <strong>{"Swagger UI"}</strong> {' — '} {"interface para explorar/testar a API."}
          </li>
        <li>
            <strong>{"Validação"}</strong> {' — '} {"middleware checa request/response contra spec."}
          </li>
        </ul>
          <h2>O problema: a documentação que mente</h2>
      <p>
        Toda API tem um README. E todo README está desatualizado. O endpoint mudou,
        o campo virou opcional, o status passou de 200 para 204 — e o frontend descobre
        em produção. <strong>OpenAPI</strong> (antigo Swagger) resolve isso transformando
        o contrato num arquivo executável: o mesmo <code>openapi.yaml</code> gera docs,
        SDK e middleware de validação.
      </p>

      <p>
        A versão atual é a <strong>3.1</strong> (lançada em 2021), totalmente compatível
        com JSON Schema 2020-12. É o que você deve usar em projetos novos.
      </p>

      <h2>A estrutura mínima de um openapi.yaml</h2>
      <p>
        Três blocos importam: <code>info</code> (metadados), <code>paths</code> (endpoints)
        e <code>components</code> (schemas reutilizáveis). Tudo o resto é opcional.
      </p>

      <CodeBlock
        language="yaml"
        code={`openapi: 3.1.0
info:
  title: Users API
  version: 1.0.0
  description: API de gerenciamento de usuários
servers:
  - url: https://api.example.com/v1
    description: produção
  - url: http://localhost:8000/v1
    description: dev local

paths:
  /users:
    get:
      summary: Lista usuários paginados
      operationId: listUsers
      parameters:
        - name: cursor
          in: query
          schema: { type: string }
        - name: limit
          in: query
          schema: { type: integer, minimum: 1, maximum: 100, default: 20 }
      responses:
        '200':
          description: lista paginada
          content:
            application/json:
              schema: { $ref: '#/components/schemas/UserPage' }
    post:
      summary: Cria um usuário
      operationId: createUser
      requestBody:
        required: true
        content:
          application/json:
            schema: { $ref: '#/components/schemas/UserCreate' }
      responses:
        '201':
          description: criado
          content:
            application/json:
              schema: { $ref: '#/components/schemas/User' }
        '422':
          $ref: '#/components/responses/ValidationError'

  /users/{id}:
    parameters:
      - name: id
        in: path
        required: true
        schema: { type: integer, minimum: 1 }
    get:
      summary: Mostra um usuário
      operationId: showUser
      responses:
        '200':
          description: ok
          content:
            application/json:
              schema: { $ref: '#/components/schemas/User' }
        '404':
          $ref: '#/components/responses/NotFound'

components:
  schemas:
    User:
      type: object
      required: [id, name, email]
      properties:
        id:    { type: integer, example: 42 }
        name:  { type: string, minLength: 2, example: "Ada Lovelace" }
        email: { type: string, format: email }
        createdAt: { type: string, format: date-time }
    UserCreate:
      type: object
      required: [name, email]
      properties:
        name:  { type: string, minLength: 2 }
        email: { type: string, format: email }
    UserPage:
      type: object
      required: [data]
      properties:
        data:
          type: array
          items: { $ref: '#/components/schemas/User' }
        nextCursor: { type: string, nullable: true }

  responses:
    NotFound:
      description: recurso não encontrado
      content:
        application/json:
          schema:
            type: object
            properties:
              error: { type: string, example: "user_not_found" }
    ValidationError:
      description: corpo inválido
      content:
        application/json:
          schema:
            type: object
            properties:
              error:  { type: string, example: "validation_failed" }
              fields:
                type: object
                additionalProperties: { type: string }

  securitySchemes:
    bearerAuth:
      type: http
      scheme: bearer
      bearerFormat: JWT

security:
  - bearerAuth: []`}
      />

      <AlertBox type="info" title="Refs evitam repetição">
        Sempre que um schema aparece em mais de um lugar, mova para <code>components/schemas</code>{" "}
        e use <code>$ref</code>. Mesma coisa para respostas comuns (<code>NotFound</code>,{" "}
        <code>ValidationError</code>).
      </AlertBox>

      <h2>Servindo Swagger UI: docs interativos em 30 segundos</h2>
      <p>
        Você não precisa instalar nada — Swagger UI roda direto via CDN num HTML estático
        que aponta pro seu YAML. Coloque o arquivo <code>openapi.yaml</code> em{" "}
        <code>public/</code> e crie:
      </p>

      <CodeBlock
        language="bash"
        code={`<!DOCTYPE html>
<html>
<head>
  <title>Users API — docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"></script>
  <script>
    SwaggerUIBundle({
      url: '/openapi.yaml',
      dom_id: '#swagger',
      deepLinking: true,
      tryItOutEnabled: true,
    });
  </script>
</body>
</html>`}
      />

      <TerminalBlock
        user="dev"
        host="api"
        cwd="~/projeto"
        command="php -S 0.0.0.0:8000 -t public"
        output={`PHP 8.4.0 Development Server (http://0.0.0.0:8000) started
Listening on http://0.0.0.0:8000
Document root is /home/dev/projeto/public`}
      />

      <BrowserBlock url="http://localhost:8000/docs.html">
        <div style={{ fontFamily: "sans-serif" }}>
          <h2 style={{ margin: 0, fontSize: 22 }}>Users API <span style={{ color: "#888", fontSize: 14 }}>1.0.0 OAS 3.1</span></h2>
          <p style={{ color: "#555", margin: "4px 0 16px" }}>API de gerenciamento de usuários</p>
          <div style={{ border: "1px solid #49cc90", borderRadius: 4, padding: 8, marginBottom: 8, background: "#e8f6f0" }}>
            <strong style={{ color: "#49cc90" }}>GET</strong> &nbsp; /users &nbsp; <span style={{ color: "#666" }}>Lista usuários paginados</span>
          </div>
          <div style={{ border: "1px solid #49cc90", borderRadius: 4, padding: 8, marginBottom: 8, background: "#e8f6f0" }}>
            <strong style={{ color: "#49cc90" }}>GET</strong> &nbsp; /users/{`{id}`} &nbsp; <span style={{ color: "#666" }}>Mostra um usuário</span>
          </div>
          <div style={{ border: "1px solid #61affe", borderRadius: 4, padding: 8, background: "#e8f0f9" }}>
            <strong style={{ color: "#61affe" }}>POST</strong> &nbsp; /users &nbsp; <span style={{ color: "#666" }}>Cria um usuário</span>
          </div>
        </div>
      </BrowserBlock>

      <p>
        <strong>Stoplight Elements</strong> é uma alternativa mais bonita e leve, mantida
        pela mesma comunidade. Troque o script por <code>@stoplight/elements</code> e o
        elemento por <code>&lt;elements-api apiDescriptionUrl="/openapi.yaml" /&gt;</code>{" "}
        que funciona igual.
      </p>

      <h2>Validando request e response em runtime</h2>
      <p>
        O melhor uso do OpenAPI é <strong>validar o tráfego real</strong> contra o spec.
        Em PHP isso é feito com <code>cebe/php-openapi-validator</code>:
      </p>

      <TerminalBlock
        user="dev"
        host="api"
        cwd="~/projeto"
        command="composer require league/openapi-psr7-validator"
        output={`Using version ^0.22 for league/openapi-psr7-validator
./composer.json has been updated
Running composer update league/openapi-psr7-validator
Generating autoload files`}
      />

      <PhpBlock
        filename="src/Middleware/OpenApiValidator.php"
        code={`<?php
declare(strict_types=1);

namespace App\\Middleware;

use League\\OpenAPIValidation\\PSR7\\ValidatorBuilder;
use League\\OpenAPIValidation\\PSR7\\Exception\\ValidationFailed;
use Psr\\Http\\Message\\ResponseInterface;
use Psr\\Http\\Message\\ServerRequestInterface;
use Psr\\Http\\Server\\MiddlewareInterface;
use Psr\\Http\\Server\\RequestHandlerInterface;

final readonly class OpenApiValidator implements MiddlewareInterface
{
    public function __construct(private string $specPath) {}

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $builder = (new ValidatorBuilder())->fromYamlFile($this->specPath);

        try {
            $matched = $builder->getServerRequestValidator()->validate($request);
        } catch (ValidationFailed $e) {
            return jsonResponse(400, [
                'error'   => 'request_does_not_match_spec',
                'details' => $e->getMessage(),
            ]);
        }

        $response = $handler->handle($request);

        try {
            $builder->getResponseValidator()->validate($matched, $response);
        } catch (ValidationFailed $e) {
            // Em DEV: explode. Em PROD: log silencioso.
            error_log('[OpenAPI] response viola spec: ' . $e->getMessage());
        }

        return $response;
    }
}`}
      />

      <AlertBox type="warning" title="Custo em produção">
        Validação em todo request adiciona ~2-5ms por chamada. Em alta carga, valide só requests
        (entrada do usuário) e deixe a validação de response apenas em CI ou staging.
      </AlertBox>

      <h2>Gerando SDK cliente automaticamente</h2>
      <p>
        Esse é o ganho real: você escreve o YAML uma vez e gera SDKs para TypeScript,
        Python, Go, Java, Kotlin, C#... O <code>openapi-generator</code> tem 50+ targets.
        Use Docker para não poluir sua máquina:
      </p>

      <TerminalBlock
        user="dev"
        host="api"
        cwd="~/projeto"
        command={`docker run --rm -v "$PWD:/local" openapitools/openapi-generator-cli generate -i /local/public/openapi.yaml -g typescript-fetch -o /local/sdk/ts`}
        output={`[main] INFO  o.o.codegen.DefaultGenerator - Generating with dryRun=false
[main] INFO  o.o.codegen.TemplateManager - writing file /local/sdk/ts/apis/UsersApi.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /local/sdk/ts/models/User.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /local/sdk/ts/models/UserCreate.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /local/sdk/ts/runtime.ts
################################################################################
# Thanks for using OpenAPI Generator.                                          #
################################################################################`}
      />

      <p>
        Pronto: o frontend faz <code>import {`{ UsersApi }`} from './sdk/ts'</code> e
        chama <code>api.listUsers({`{ limit: 20 }`})</code> com tipos TypeScript completos.
        Quando você muda o YAML, regera e o TS quebra a build se algo virou breaking change.
      </p>

      <h2>Lint e CI: openapi-cli</h2>
      <p>
        O <code>@redocly/cli</code> valida estrutura, detecta erros comuns (path duplicado,
        ref quebrada, schema sem exemplo) e gera docs estáticas. Coloque no CI:
      </p>

      <TerminalBlock
        user="dev"
        host="api"
        cwd="~/projeto"
        command="npx @redocly/cli lint public/openapi.yaml"
        output={`validating public/openapi.yaml...
public/openapi.yaml: validated in 142ms

Woohoo! Your API description is valid. 🎉`}
      />

      <TerminalBlock
        user="dev"
        host="api"
        cwd="~/projeto"
        command="npx @redocly/cli build-docs public/openapi.yaml -o public/docs.html"
        output={`Prerendering docs
🎉 bundled successfully in: public/docs.html (412 KiB) [⏱ 312ms].`}
      />

      <h2>Workflow recomendado</h2>
      <PhpBlock
        filename=".github/workflows/api.yml"
        language="yaml"
        code={`name: API contract
on: [push, pull_request]

jobs:
  contract:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - name: lint OpenAPI
        run: npx @redocly/cli lint public/openapi.yaml
      - name: validar exemplos contra schema
        run: npx @redocly/cli stats public/openapi.yaml
      - name: gerar SDK TS e testar build
        run: |
          docker run --rm -v "$PWD:/local" openapitools/openapi-generator-cli \\
            generate -i /local/public/openapi.yaml -g typescript-fetch -o /local/sdk/ts
          cd sdk/ts && npm install && npx tsc --noEmit`}
      />

      <AlertBox type="success" title="Spec-first vs code-first">
        Você pode <strong>escrever o YAML primeiro</strong> (spec-first) ou{" "}
        <strong>gerar a partir de annotations PHP</strong> (code-first, com{" "}
        <code>zircote/swagger-php</code>). Spec-first ganha em projetos com vários times
        consumindo a API. Code-first é confortável quando a equipe é pequena e a API muda
        rápido junto com o backend.
      </AlertBox>

      <p>
        Com OpenAPI, sua API ganha contrato versionado, docs sempre atualizadas, SDK
        gerado e validação em runtime. No próximo capítulo a gente resolve o último
        obstáculo entre frontend e backend: <strong>CORS</strong>.
      </p>
    </PageContainer>
  );
}
