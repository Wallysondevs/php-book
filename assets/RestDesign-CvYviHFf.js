import{j as e}from"./index-B5-q-eol.js";import{P as i,A as r,a as s}from"./AlertBox-CVbFLZEd.js";import{T as o}from"./TerminalBlock-6fqVIX2R.js";import{B as t}from"./BrowserBlock-pEcgE37D.js";import{C as a}from"./CodeBlock-B36pQ_ak.js";function u(){return e.jsxs(i,{title:"Design de API REST",subtitle:"Recursos no plural, verbos HTTP corretos, status codes que fazem sentido, paginação que escala e versionamento sem dor — o checklist completo para você não se arrepender em 6 meses.",difficulty:"intermediario",timeToRead:"14 min",category:"APIs REST",children:[e.jsx(r,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"REST"})," "," — "," ","Representational State Transfer — recursos via HTTP."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Verbos"})," "," — "," ","GET ler, POST criar, PUT/PATCH atualizar, DELETE remover."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Status codes"})," "," — "," ","2xx ok, 4xx culpa do client, 5xx culpa do servidor."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"HATEOAS"})," "," — "," ","respostas trazem links de próximas ações."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Versionamento"})," "," — "," ","/v1/, header Accept ou subdomínio."]})]}),e.jsx("h2",{children:"O problema: APIs que parecem RPC disfarçado"}),e.jsxs("p",{children:["Quase toda API ruim que você já viu segue o mesmo anti-padrão: rotas como ",e.jsx("code",{children:"/getUser?id=42"}),", ",e.jsx("code",{children:"/createOrder"}),", ",e.jsx("code",{children:"/deleteAllSessions"}),", sempre retornando ",e.jsx("code",{children:"200 OK"})," com ",e.jsx("code",{children:'{ "error": "..." }'})," dentro. Isso é RPC mal feito, não REST. O custo aparece quando o frontend precisa cachear, quando um proxy precisa decidir o que repetir, ou quando você precisa explicar a API para alguém que nunca a viu."]}),e.jsxs("p",{children:["REST é uma convenção: ",e.jsx("strong",{children:"recursos"})," (substantivos no plural),",e.jsx("strong",{children:" verbos HTTP"})," com semântica fixa e ",e.jsx("strong",{children:"status codes"})," ","que o navegador, o curl e o CDN já entendem. Se você seguir as regras, sua API fica autodocumentada."]}),e.jsx("h2",{children:"Recursos no plural, sempre"}),e.jsxs("p",{children:["A regra de ouro: a URL identifica um ",e.jsx("strong",{children:"recurso"}),", não uma ação. O verbo é o método HTTP. Use ",e.jsx("em",{children:"plural"})," mesmo quando for um único item — consistência vale mais que beleza."]}),e.jsx(a,{language:"bash",code:`# RUIM (parece RPC)
GET  /getUser?id=42
POST /createUser
POST /user/42/delete

# BOM (REST)
GET    /users          # lista
POST   /users          # cria
GET    /users/42       # mostra
PATCH  /users/42       # atualiza parcial
PUT    /users/42       # substitui (idempotente)
DELETE /users/42       # remove

# Subrecursos aninhados (no máximo 1 nível)
GET    /users/42/orders
POST   /users/42/orders`}),e.jsxs(r,{type:"warning",title:"Não aninhe além de 1 nível",children:["URLs como ",e.jsx("code",{children:"/users/42/orders/7/items/3/reviews"})," são frágeis. A partir do segundo nível, prefira recursos top-level: ",e.jsx("code",{children:"/items/3"})," e ",e.jsx("code",{children:"/reviews?item_id=3"}),"."]}),e.jsx("h2",{children:"Um controller REST de verdade"}),e.jsxs("p",{children:["Vamos implementar ",e.jsx("code",{children:"/users"})," com PHP puro, sem framework, para você ver o esqueleto. Em produção use Slim, Laravel ou Symfony — a lógica é a mesma."]}),e.jsx(s,{filename:"public/index.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use App\\UserRepository;

header('Content-Type: application/json; charset=utf-8');

$method = $_SERVER['REQUEST_METHOD'];
$path   = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH) ?? '/';
$repo   = new UserRepository();

// match por método+rota — bem mais legível que switch
$action = match (true) {
    $method === 'GET'    && $path === '/v1/users'                 => fn() => listUsers($repo),
    $method === 'POST'   && $path === '/v1/users'                 => fn() => createUser($repo),
    $method === 'GET'    && preg_match('#^/v1/users/(\\d+)$#', $path, $m) => fn() => showUser($repo, (int)$m[1]),
    $method === 'PATCH'  && preg_match('#^/v1/users/(\\d+)$#', $path, $m) => fn() => patchUser($repo, (int)$m[1]),
    $method === 'DELETE' && preg_match('#^/v1/users/(\\d+)$#', $path, $m) => fn() => deleteUser($repo, (int)$m[1]),
    default => fn() => respond(404, ['error' => 'route_not_found']),
};

$action();

function respond(int $status, array $body): void {
    http_response_code($status);
    echo json_encode($body, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
}`}),e.jsxs("p",{children:["Note três coisas: o ",e.jsx("code",{children:"match (true)"})," casa método + rota numa tabela única, o prefixo ",e.jsx("code",{children:"/v1"})," aparece desde a primeira linha, e o ",e.jsx("code",{children:"respond()"})," ","sempre devolve JSON com o status correto. Agora os handlers:"]}),e.jsx(s,{filename:"public/index.php (handlers)",code:`<?php
function listUsers(UserRepository $repo): void {
    $cursor = $_GET['cursor'] ?? null;
    $limit  = min((int)($_GET['limit'] ?? 20), 100);
    $role   = $_GET['role'] ?? null;

    $page = $repo->page(cursor: $cursor, limit: $limit, role: $role);

    respond(200, [
        'data' => $page->items,
        'next_cursor' => $page->nextCursor,
        '_links' => [
            'self' => "/v1/users?limit={$limit}",
            'next' => $page->nextCursor ? "/v1/users?cursor={$page->nextCursor}&limit={$limit}" : null,
        ],
    ]);
}

function createUser(UserRepository $repo): void {
    $input = json_decode(file_get_contents('php://input') ?: '{}', true);
    $errors = validate($input);
    if ($errors) {
        respond(422, ['error' => 'validation_failed', 'fields' => $errors]);
        return;
    }
    $user = $repo->create($input);
    header("Location: /v1/users/{$user['id']}");
    respond(201, $user);
}

function showUser(UserRepository $repo, int $id): void {
    $user = $repo->find($id);
    if (!$user) { respond(404, ['error' => 'user_not_found']); return; }
    respond(200, $user);
}

function patchUser(UserRepository $repo, int $id): void {
    if (!$repo->find($id)) { respond(404, ['error' => 'user_not_found']); return; }
    $patch = json_decode(file_get_contents('php://input') ?: '{}', true);
    respond(200, $repo->update($id, $patch));
}

function deleteUser(UserRepository $repo, int $id): void {
    if (!$repo->find($id)) { respond(404, ['error' => 'user_not_found']); return; }
    $repo->delete($id);
    http_response_code(204); // sem corpo
}

function validate(array $input): array {
    $errors = [];
    if (empty($input['email']) || !filter_var($input['email'], FILTER_VALIDATE_EMAIL)) {
        $errors['email'] = 'email inválido';
    }
    if (empty($input['name']) || strlen($input['name']) < 2) {
        $errors['name'] = 'mínimo 2 caracteres';
    }
    return $errors;
}`}),e.jsx("h2",{children:"Status codes que importam"}),e.jsx("p",{children:"Cada código tem um significado claro. Decorar não é difícil porque cada faixa tem uma intenção:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"200 OK"})," — sucesso com corpo (GET, PATCH, PUT)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"201 Created"})," — recurso criado (POST). Sempre devolva o header ",e.jsx("code",{children:"Location:"}),"."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"204 No Content"})," — sucesso sem corpo (DELETE, PUT idempotente)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"400 Bad Request"})," — JSON malformado, parâmetros faltando."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"401 Unauthorized"})," — não autenticado (sem token, token expirado)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"403 Forbidden"})," — autenticado, mas sem permissão."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"404 Not Found"})," — recurso inexistente."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"422 Unprocessable Entity"})," — JSON válido, mas validação de negócio falhou."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"500 Internal Server Error"})," — bug do servidor (você cometeu)."]})]}),e.jsxs(r,{type:"danger",title:"401 vs 403",children:[e.jsx("strong",{children:"401"}),' = "quem é você?" (faltam credenciais).'," ",e.jsx("strong",{children:"403"}),' = "eu sei quem você é, mas não pode". Trocar os dois confunde o frontend, que precisa decidir entre redirecionar para login ou mostrar "acesso negado".']}),e.jsx("h2",{children:"Vendo a API responder"}),e.jsx(o,{user:"dev",host:"api",cwd:"~/projeto",command:"curl -i -X POST http://localhost:8000/v1/users -H 'Content-Type: application/json' -d '{}'",output:`HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json; charset=utf-8

{
    "error": "validation_failed",
    "fields": {
        "email": "email inválido",
        "name": "mínimo 2 caracteres"
    }
}`}),e.jsx(o,{user:"dev",host:"api",cwd:"~/projeto",command:`curl -i -X POST http://localhost:8000/v1/users -H 'Content-Type: application/json' -d '{"name":"Ada","email":"ada@example.com"}'`,output:`HTTP/1.1 201 Created
Location: /v1/users/42
Content-Type: application/json; charset=utf-8

{
    "id": 42,
    "name": "Ada",
    "email": "ada@example.com"
}`}),e.jsx(o,{user:"dev",host:"api",cwd:"~/projeto",command:"curl -i -X DELETE http://localhost:8000/v1/users/42",output:"HTTP/1.1 204 No Content"}),e.jsx("h2",{children:"Paginação: cursor > offset"}),e.jsxs("p",{children:["Existem duas escolas. ",e.jsx("code",{children:"?page=3&per_page=20"})," (offset) é simples, mas quebra quando alguém insere ou deleta entre uma página e outra: o item 21 vira 20, você pula registros. ",e.jsx("code",{children:"?cursor=eyJpZCI6MTIzfQ&limit=20"})," ","(cursor) é estável: o servidor te dá um ponteiro opaco baseado no último ID/timestamp retornado."]}),e.jsx(s,{filename:"src/UserRepository.php",code:`<?php
declare(strict_types=1);

namespace App;

use PDO;

final readonly class Page {
    public function __construct(
        public array $items,
        public ?string $nextCursor,
    ) {}
}

final class UserRepository {
    public function __construct(private PDO $pdo = new PDO('sqlite::memory:')) {}

    public function page(?string $cursor, int $limit, ?string $role): Page {
        $afterId = $cursor ? (int) base64_decode($cursor) : 0;
        $sql = 'SELECT * FROM users WHERE id > :after';
        if ($role) { $sql .= ' AND role = :role'; }
        $sql .= ' ORDER BY id ASC LIMIT :lim';

        $stmt = $this->pdo->prepare($sql);
        $stmt->bindValue(':after', $afterId, PDO::PARAM_INT);
        $stmt->bindValue(':lim', $limit + 1, PDO::PARAM_INT);
        if ($role) { $stmt->bindValue(':role', $role); }
        $stmt->execute();

        $rows = $stmt->fetchAll(PDO::FETCH_ASSOC);
        $hasMore = count($rows) > $limit;
        if ($hasMore) { array_pop($rows); }

        $next = $hasMore ? base64_encode((string) end($rows)['id']) : null;
        return new Page($rows, $next);
    }
}`}),e.jsxs(r,{type:"info",title:"Cursor opaco é proposital",children:["O cliente nunca deve ",e.jsx("em",{children:"parsear"})," o cursor — apenas devolvê-lo. Assim você pode mudar a estratégia (de ID para timestamp+ID composto, por exemplo) sem quebrar contratos."]}),e.jsx("h2",{children:"Filtros, ordenação e busca"}),e.jsxs("p",{children:["Use query string, não rotas novas. ",e.jsx("code",{children:"/v1/users?role=admin&sort=-created_at&q=ada"})," ","é a convenção. Prefixo ",e.jsx("code",{children:"-"})," indica ordem decrescente (vem do JSON:API)."]}),e.jsx(a,{language:"bash",code:`# Filtro simples
GET /v1/users?role=admin

# Múltiplos valores
GET /v1/users?role=admin,manager

# Range
GET /v1/orders?created_at[gte]=2025-01-01&created_at[lt]=2025-02-01

# Ordenação
GET /v1/users?sort=-created_at,name

# Busca textual
GET /v1/users?q=ada+lovelace

# Sparse fields (devolver só algumas colunas)
GET /v1/users?fields=id,email`}),e.jsx("h2",{children:"Versionamento: /v1 no path, sem desculpas"}),e.jsxs("p",{children:["Existem três escolas: ",e.jsx("code",{children:"/v1/users"})," (path), ",e.jsx("code",{children:"users.v1.example.com"})," ","(subdomínio) e ",e.jsx("code",{children:"Accept: application/vnd.empresa.v1+json"})," (header). A primeira ganha sempre porque é trivial de testar com curl, fácil de cachear, visível no log do nginx e os clientes mobile entendem sem mágica."]}),e.jsx(r,{type:"success",title:"Estratégia de evolução",children:e.jsxs("ol",{className:"list-decimal ml-5 mt-1 space-y-1",children:[e.jsxs("li",{children:["Mudanças aditivas (novo campo opcional, novo endpoint) ficam em ",e.jsx("code",{children:"/v1"}),"."]}),e.jsxs("li",{children:["Mudanças que quebram contrato (remover campo, mudar tipo) abrem ",e.jsx("code",{children:"/v2"}),"."]}),e.jsxs("li",{children:["Mantenha ",e.jsx("code",{children:"/v1"})," rodando por pelo menos 6 meses depois de lançar ",e.jsx("code",{children:"/v2"}),"."]}),e.jsxs("li",{children:["Marque endpoints obsoletos com header ",e.jsx("code",{children:"Deprecation: true"})," e ",e.jsx("code",{children:"Sunset: <data>"}),"."]})]})}),e.jsx("h2",{children:"HATEOAS: opcional, mas elegante"}),e.jsxs("p",{children:["HATEOAS (",e.jsx("em",{children:"Hypermedia as the Engine of Application State"}),") é a ideia de que a resposta inclui links para o que o cliente pode fazer a seguir. Não é obrigatório — a maioria das APIs públicas (Stripe, GitHub) só implementa parcialmente — mas para APIs internas com clientes burros, ajuda."]}),e.jsx(s,{filename:"resposta-com-links.php",code:`<?php
// GET /v1/users/42
$response = [
    'id' => 42,
    'name' => 'Ada Lovelace',
    'email' => 'ada@example.com',
    'status' => 'active',
    '_links' => [
        'self'    => ['href' => '/v1/users/42'],
        'orders'  => ['href' => '/v1/users/42/orders'],
        'suspend' => ['href' => '/v1/users/42/suspend', 'method' => 'POST'],
        'delete'  => ['href' => '/v1/users/42', 'method' => 'DELETE'],
    ],
];
echo json_encode($response, JSON_PRETTY_PRINT);`,output:`{
    "id": 42,
    "name": "Ada Lovelace",
    "email": "ada@example.com",
    "status": "active",
    "_links": {
        "self":    { "href": "/v1/users/42" },
        "orders":  { "href": "/v1/users/42/orders" },
        "suspend": { "href": "/v1/users/42/suspend", "method": "POST" },
        "delete":  { "href": "/v1/users/42", "method": "DELETE" }
    }
}`}),e.jsx(t,{url:"http://localhost:8000/v1/users/42",children:e.jsx("pre",{style:{margin:0,fontFamily:"monospace",fontSize:12},children:`{
  "id": 42,
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "_links": {
    "self":   { "href": "/v1/users/42" },
    "orders": { "href": "/v1/users/42/orders" }
  }
}`})}),e.jsx("h2",{children:"Subindo o servidor para testar"}),e.jsx(o,{user:"dev",host:"api",cwd:"~/projeto",command:"php -S 0.0.0.0:8000 -t public",output:"PHP 8.4.0 Development Server (http://0.0.0.0:8000) started"}),e.jsxs("p",{children:["Você agora tem um esqueleto REST honesto: recursos plurais, verbos certos, status semânticos, paginação por cursor, versionamento no path e validação que devolve 422 com erros por campo. No próximo capítulo, a gente formaliza esse contrato com ",e.jsx("strong",{children:"OpenAPI"}),", que gera docs e SDKs automaticamente."]})]})}export{u as default};
