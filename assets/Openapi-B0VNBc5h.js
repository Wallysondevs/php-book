import{j as e}from"./index-B5-q-eol.js";import{P as t,A as o,a as r}from"./AlertBox-CVbFLZEd.js";import{T as s}from"./TerminalBlock-6fqVIX2R.js";import{B as i}from"./BrowserBlock-pEcgE37D.js";import{C as a}from"./CodeBlock-B36pQ_ak.js";function m(){return e.jsxs(t,{title:"OpenAPI/Swagger",subtitle:"Documente sua API uma vez em YAML e ganhe docs interativos, SDK cliente em qualquer linguagem e validação automática de request/response. O contrato vira a fonte da verdade.",difficulty:"avancado",timeToRead:"13 min",category:"APIs REST",children:[e.jsx(o,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"OpenAPI"})," "," — "," ","spec (ex-Swagger) que descreve API em YAML/JSON."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Schema"})," "," — "," ","descreve forma das requisições e respostas."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Geração"})," "," — "," ","codegen produz client/server stubs."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Swagger UI"})," "," — "," ","interface para explorar/testar a API."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Validação"})," "," — "," ","middleware checa request/response contra spec."]})]}),e.jsx("h2",{children:"O problema: a documentação que mente"}),e.jsxs("p",{children:["Toda API tem um README. E todo README está desatualizado. O endpoint mudou, o campo virou opcional, o status passou de 200 para 204 — e o frontend descobre em produção. ",e.jsx("strong",{children:"OpenAPI"})," (antigo Swagger) resolve isso transformando o contrato num arquivo executável: o mesmo ",e.jsx("code",{children:"openapi.yaml"})," gera docs, SDK e middleware de validação."]}),e.jsxs("p",{children:["A versão atual é a ",e.jsx("strong",{children:"3.1"})," (lançada em 2021), totalmente compatível com JSON Schema 2020-12. É o que você deve usar em projetos novos."]}),e.jsx("h2",{children:"A estrutura mínima de um openapi.yaml"}),e.jsxs("p",{children:["Três blocos importam: ",e.jsx("code",{children:"info"})," (metadados), ",e.jsx("code",{children:"paths"})," (endpoints) e ",e.jsx("code",{children:"components"})," (schemas reutilizáveis). Tudo o resto é opcional."]}),e.jsx(a,{language:"yaml",code:`openapi: 3.1.0
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
  - bearerAuth: []`}),e.jsxs(o,{type:"info",title:"Refs evitam repetição",children:["Sempre que um schema aparece em mais de um lugar, mova para ",e.jsx("code",{children:"components/schemas"})," ","e use ",e.jsx("code",{children:"$ref"}),". Mesma coisa para respostas comuns (",e.jsx("code",{children:"NotFound"}),","," ",e.jsx("code",{children:"ValidationError"}),")."]}),e.jsx("h2",{children:"Servindo Swagger UI: docs interativos em 30 segundos"}),e.jsxs("p",{children:["Você não precisa instalar nada — Swagger UI roda direto via CDN num HTML estático que aponta pro seu YAML. Coloque o arquivo ",e.jsx("code",{children:"openapi.yaml"})," em"," ",e.jsx("code",{children:"public/"})," e crie:"]}),e.jsx(a,{language:"bash",code:`<!DOCTYPE html>
<html>
<head>
  <title>Users API — docs</title>
  <link rel="stylesheet" href="https://unpkg.com/swagger-ui-dist@5/swagger-ui.css" />
</head>
<body>
  <div id="swagger"></div>
  <script src="https://unpkg.com/swagger-ui-dist@5/swagger-ui-bundle.js"><\/script>
  <script>
    SwaggerUIBundle({
      url: '/openapi.yaml',
      dom_id: '#swagger',
      deepLinking: true,
      tryItOutEnabled: true,
    });
  <\/script>
</body>
</html>`}),e.jsx(s,{user:"dev",host:"api",cwd:"~/projeto",command:"php -S 0.0.0.0:8000 -t public",output:`PHP 8.4.0 Development Server (http://0.0.0.0:8000) started
Listening on http://0.0.0.0:8000
Document root is /home/dev/projeto/public`}),e.jsx(i,{url:"http://localhost:8000/docs.html",children:e.jsxs("div",{style:{fontFamily:"sans-serif"},children:[e.jsxs("h2",{style:{margin:0,fontSize:22},children:["Users API ",e.jsx("span",{style:{color:"#888",fontSize:14},children:"1.0.0 OAS 3.1"})]}),e.jsx("p",{style:{color:"#555",margin:"4px 0 16px"},children:"API de gerenciamento de usuários"}),e.jsxs("div",{style:{border:"1px solid #49cc90",borderRadius:4,padding:8,marginBottom:8,background:"#e8f6f0"},children:[e.jsx("strong",{style:{color:"#49cc90"},children:"GET"}),"   /users   ",e.jsx("span",{style:{color:"#666"},children:"Lista usuários paginados"})]}),e.jsxs("div",{style:{border:"1px solid #49cc90",borderRadius:4,padding:8,marginBottom:8,background:"#e8f6f0"},children:[e.jsx("strong",{style:{color:"#49cc90"},children:"GET"}),"   /users/","{id}","   ",e.jsx("span",{style:{color:"#666"},children:"Mostra um usuário"})]}),e.jsxs("div",{style:{border:"1px solid #61affe",borderRadius:4,padding:8,background:"#e8f0f9"},children:[e.jsx("strong",{style:{color:"#61affe"},children:"POST"}),"   /users   ",e.jsx("span",{style:{color:"#666"},children:"Cria um usuário"})]})]})}),e.jsxs("p",{children:[e.jsx("strong",{children:"Stoplight Elements"})," é uma alternativa mais bonita e leve, mantida pela mesma comunidade. Troque o script por ",e.jsx("code",{children:"@stoplight/elements"})," e o elemento por ",e.jsx("code",{children:'<elements-api apiDescriptionUrl="/openapi.yaml" />'})," ","que funciona igual."]}),e.jsx("h2",{children:"Validando request e response em runtime"}),e.jsxs("p",{children:["O melhor uso do OpenAPI é ",e.jsx("strong",{children:"validar o tráfego real"})," contra o spec. Em PHP isso é feito com ",e.jsx("code",{children:"cebe/php-openapi-validator"}),":"]}),e.jsx(s,{user:"dev",host:"api",cwd:"~/projeto",command:"composer require league/openapi-psr7-validator",output:`Using version ^0.22 for league/openapi-psr7-validator
./composer.json has been updated
Running composer update league/openapi-psr7-validator
Generating autoload files`}),e.jsx(r,{filename:"src/Middleware/OpenApiValidator.php",code:`<?php
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
}`}),e.jsx(o,{type:"warning",title:"Custo em produção",children:"Validação em todo request adiciona ~2-5ms por chamada. Em alta carga, valide só requests (entrada do usuário) e deixe a validação de response apenas em CI ou staging."}),e.jsx("h2",{children:"Gerando SDK cliente automaticamente"}),e.jsxs("p",{children:["Esse é o ganho real: você escreve o YAML uma vez e gera SDKs para TypeScript, Python, Go, Java, Kotlin, C#... O ",e.jsx("code",{children:"openapi-generator"})," tem 50+ targets. Use Docker para não poluir sua máquina:"]}),e.jsx(s,{user:"dev",host:"api",cwd:"~/projeto",command:'docker run --rm -v "$PWD:/local" openapitools/openapi-generator-cli generate -i /local/public/openapi.yaml -g typescript-fetch -o /local/sdk/ts',output:`[main] INFO  o.o.codegen.DefaultGenerator - Generating with dryRun=false
[main] INFO  o.o.codegen.TemplateManager - writing file /local/sdk/ts/apis/UsersApi.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /local/sdk/ts/models/User.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /local/sdk/ts/models/UserCreate.ts
[main] INFO  o.o.codegen.TemplateManager - writing file /local/sdk/ts/runtime.ts
################################################################################
# Thanks for using OpenAPI Generator.                                          #
################################################################################`}),e.jsxs("p",{children:["Pronto: o frontend faz ",e.jsxs("code",{children:["import ","{ UsersApi }"," from './sdk/ts'"]})," e chama ",e.jsxs("code",{children:["api.listUsers(","{ limit: 20 }",")"]})," com tipos TypeScript completos. Quando você muda o YAML, regera e o TS quebra a build se algo virou breaking change."]}),e.jsx("h2",{children:"Lint e CI: openapi-cli"}),e.jsxs("p",{children:["O ",e.jsx("code",{children:"@redocly/cli"})," valida estrutura, detecta erros comuns (path duplicado, ref quebrada, schema sem exemplo) e gera docs estáticas. Coloque no CI:"]}),e.jsx(s,{user:"dev",host:"api",cwd:"~/projeto",command:"npx @redocly/cli lint public/openapi.yaml",output:`validating public/openapi.yaml...
public/openapi.yaml: validated in 142ms

Woohoo! Your API description is valid. 🎉`}),e.jsx(s,{user:"dev",host:"api",cwd:"~/projeto",command:"npx @redocly/cli build-docs public/openapi.yaml -o public/docs.html",output:`Prerendering docs
🎉 bundled successfully in: public/docs.html (412 KiB) [⏱ 312ms].`}),e.jsx("h2",{children:"Workflow recomendado"}),e.jsx(r,{filename:".github/workflows/api.yml",language:"yaml",code:`name: API contract
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
          cd sdk/ts && npm install && npx tsc --noEmit`}),e.jsxs(o,{type:"success",title:"Spec-first vs code-first",children:["Você pode ",e.jsx("strong",{children:"escrever o YAML primeiro"})," (spec-first) ou"," ",e.jsx("strong",{children:"gerar a partir de annotations PHP"})," (code-first, com"," ",e.jsx("code",{children:"zircote/swagger-php"}),"). Spec-first ganha em projetos com vários times consumindo a API. Code-first é confortável quando a equipe é pequena e a API muda rápido junto com o backend."]}),e.jsxs("p",{children:["Com OpenAPI, sua API ganha contrato versionado, docs sempre atualizadas, SDK gerado e validação em runtime. No próximo capítulo a gente resolve o último obstáculo entre frontend e backend: ",e.jsx("strong",{children:"CORS"}),"."]})]})}export{m as default};
