import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { BrowserBlock } from "@/components/ui/BrowserBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function RestDesign() {
  return (
    <PageContainer
      title="Design de API REST"
      subtitle="Recursos no plural, verbos HTTP corretos, status codes que fazem sentido, paginação que escala e versionamento sem dor — o checklist completo para você não se arrepender em 6 meses."
      difficulty="intermediario"
      timeToRead="14 min"
      category="APIs REST"
    >
      <AlertBox type="info" title="Pré-requisitos">
          <p>Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP.</p>
        </AlertBox>
        <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"REST"}</strong> {' — '} {"Representational State Transfer — recursos via HTTP."}
          </li>
        <li>
            <strong>{"Verbos"}</strong> {' — '} {"GET ler, POST criar, PUT/PATCH atualizar, DELETE remover."}
          </li>
        <li>
            <strong>{"Status codes"}</strong> {' — '} {"2xx ok, 4xx culpa do client, 5xx culpa do servidor."}
          </li>
        <li>
            <strong>{"HATEOAS"}</strong> {' — '} {"respostas trazem links de próximas ações."}
          </li>
        <li>
            <strong>{"Versionamento"}</strong> {' — '} {"/v1/, header Accept ou subdomínio."}
          </li>
        </ul>
          <h2>O problema: APIs que parecem RPC disfarçado</h2>
      <p>
        Quase toda API ruim que você já viu segue o mesmo anti-padrão:
        rotas como <code>/getUser?id=42</code>, <code>/createOrder</code>, <code>/deleteAllSessions</code>,
        sempre retornando <code>200 OK</code> com <code>{`{ "error": "..." }`}</code> dentro.
        Isso é RPC mal feito, não REST. O custo aparece quando o frontend precisa
        cachear, quando um proxy precisa decidir o que repetir, ou quando você precisa
        explicar a API para alguém que nunca a viu.
      </p>

      <p>
        REST é uma convenção: <strong>recursos</strong> (substantivos no plural),
        <strong> verbos HTTP</strong> com semântica fixa e <strong>status codes</strong>{" "}
        que o navegador, o curl e o CDN já entendem. Se você seguir as regras, sua API
        fica autodocumentada.
      </p>

      <h2>Recursos no plural, sempre</h2>
      <p>
        A regra de ouro: a URL identifica um <strong>recurso</strong>, não uma ação.
        O verbo é o método HTTP. Use <em>plural</em> mesmo quando for um único item —
        consistência vale mais que beleza.
      </p>

      <CodeBlock
        language="bash"
        code={`# RUIM (parece RPC)
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
POST   /users/42/orders`}
      />

      <AlertBox type="warning" title="Não aninhe além de 1 nível">
        URLs como <code>/users/42/orders/7/items/3/reviews</code> são frágeis. A partir do segundo
        nível, prefira recursos top-level: <code>/items/3</code> e <code>/reviews?item_id=3</code>.
      </AlertBox>

      <h2>Um controller REST de verdade</h2>
      <p>
        Vamos implementar <code>/users</code> com PHP puro, sem framework, para você ver
        o esqueleto. Em produção use Slim, Laravel ou Symfony — a lógica é a mesma.
      </p>

      <PhpBlock
        filename="public/index.php"
        code={`<?php
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
}`}
      />

      <p>
        Note três coisas: o <code>match (true)</code> casa método + rota numa tabela única,
        o prefixo <code>/v1</code> aparece desde a primeira linha, e o <code>respond()</code>{" "}
        sempre devolve JSON com o status correto. Agora os handlers:
      </p>

      <PhpBlock
        filename="public/index.php (handlers)"
        code={`<?php
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
}`}
      />

      <h2>Status codes que importam</h2>
      <p>
        Cada código tem um significado claro. Decorar não é difícil porque cada faixa
        tem uma intenção:
      </p>

      <ul>
        <li><strong>200 OK</strong> — sucesso com corpo (GET, PATCH, PUT).</li>
        <li><strong>201 Created</strong> — recurso criado (POST). Sempre devolva o header <code>Location:</code>.</li>
        <li><strong>204 No Content</strong> — sucesso sem corpo (DELETE, PUT idempotente).</li>
        <li><strong>400 Bad Request</strong> — JSON malformado, parâmetros faltando.</li>
        <li><strong>401 Unauthorized</strong> — não autenticado (sem token, token expirado).</li>
        <li><strong>403 Forbidden</strong> — autenticado, mas sem permissão.</li>
        <li><strong>404 Not Found</strong> — recurso inexistente.</li>
        <li><strong>422 Unprocessable Entity</strong> — JSON válido, mas validação de negócio falhou.</li>
        <li><strong>500 Internal Server Error</strong> — bug do servidor (você cometeu).</li>
      </ul>

      <AlertBox type="danger" title="401 vs 403">
        <strong>401</strong> = "quem é você?" (faltam credenciais).{" "}
        <strong>403</strong> = "eu sei quem você é, mas não pode". Trocar os dois confunde
        o frontend, que precisa decidir entre redirecionar para login ou mostrar "acesso negado".
      </AlertBox>

      <h2>Vendo a API responder</h2>

      <TerminalBlock
        user="dev"
        host="api"
        cwd="~/projeto"
        command="curl -i -X POST http://localhost:8000/v1/users -H 'Content-Type: application/json' -d '{}'"
        output={`HTTP/1.1 422 Unprocessable Entity
Content-Type: application/json; charset=utf-8

{
    "error": "validation_failed",
    "fields": {
        "email": "email inválido",
        "name": "mínimo 2 caracteres"
    }
}`}
      />

      <TerminalBlock
        user="dev"
        host="api"
        cwd="~/projeto"
        command={`curl -i -X POST http://localhost:8000/v1/users -H 'Content-Type: application/json' -d '{"name":"Ada","email":"ada@example.com"}'`}
        output={`HTTP/1.1 201 Created
Location: /v1/users/42
Content-Type: application/json; charset=utf-8

{
    "id": 42,
    "name": "Ada",
    "email": "ada@example.com"
}`}
      />

      <TerminalBlock
        user="dev"
        host="api"
        cwd="~/projeto"
        command="curl -i -X DELETE http://localhost:8000/v1/users/42"
        output={`HTTP/1.1 204 No Content`}
      />

      <h2>Paginação: cursor &gt; offset</h2>
      <p>
        Existem duas escolas. <code>?page=3&amp;per_page=20</code> (offset) é simples,
        mas quebra quando alguém insere ou deleta entre uma página e outra: o item 21
        vira 20, você pula registros. <code>?cursor=eyJpZCI6MTIzfQ&amp;limit=20</code>{" "}
        (cursor) é estável: o servidor te dá um ponteiro opaco baseado no último ID/timestamp
        retornado.
      </p>

      <PhpBlock
        filename="src/UserRepository.php"
        code={`<?php
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
}`}
      />

      <AlertBox type="info" title="Cursor opaco é proposital">
        O cliente nunca deve <em>parsear</em> o cursor — apenas devolvê-lo. Assim você pode
        mudar a estratégia (de ID para timestamp+ID composto, por exemplo) sem quebrar contratos.
      </AlertBox>

      <h2>Filtros, ordenação e busca</h2>
      <p>
        Use query string, não rotas novas. <code>/v1/users?role=admin&amp;sort=-created_at&amp;q=ada</code>{" "}
        é a convenção. Prefixo <code>-</code> indica ordem decrescente (vem do JSON:API).
      </p>

      <CodeBlock
        language="bash"
        code={`# Filtro simples
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
GET /v1/users?fields=id,email`}
      />

      <h2>Versionamento: /v1 no path, sem desculpas</h2>
      <p>
        Existem três escolas: <code>/v1/users</code> (path), <code>users.v1.example.com</code>{" "}
        (subdomínio) e <code>Accept: application/vnd.empresa.v1+json</code> (header).
        A primeira ganha sempre porque é trivial de testar com curl, fácil de cachear,
        visível no log do nginx e os clientes mobile entendem sem mágica.
      </p>

      <AlertBox type="success" title="Estratégia de evolução">
        <ol className="list-decimal ml-5 mt-1 space-y-1">
          <li>Mudanças aditivas (novo campo opcional, novo endpoint) ficam em <code>/v1</code>.</li>
          <li>Mudanças que quebram contrato (remover campo, mudar tipo) abrem <code>/v2</code>.</li>
          <li>Mantenha <code>/v1</code> rodando por pelo menos 6 meses depois de lançar <code>/v2</code>.</li>
          <li>Marque endpoints obsoletos com header <code>Deprecation: true</code> e <code>Sunset: &lt;data&gt;</code>.</li>
        </ol>
      </AlertBox>

      <h2>HATEOAS: opcional, mas elegante</h2>
      <p>
        HATEOAS (<em>Hypermedia as the Engine of Application State</em>) é a ideia de que
        a resposta inclui links para o que o cliente pode fazer a seguir. Não é obrigatório —
        a maioria das APIs públicas (Stripe, GitHub) só implementa parcialmente — mas para
        APIs internas com clientes burros, ajuda.
      </p>

      <PhpBlock
        filename="resposta-com-links.php"
        code={`<?php
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
echo json_encode($response, JSON_PRETTY_PRINT);`}
        output={`{
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
}`}
      />

      <BrowserBlock url="http://localhost:8000/v1/users/42">
        <pre style={{ margin: 0, fontFamily: "monospace", fontSize: 12 }}>{`{
  "id": 42,
  "name": "Ada Lovelace",
  "email": "ada@example.com",
  "_links": {
    "self":   { "href": "/v1/users/42" },
    "orders": { "href": "/v1/users/42/orders" }
  }
}`}</pre>
      </BrowserBlock>

      <h2>Subindo o servidor para testar</h2>
      <TerminalBlock
        user="dev"
        host="api"
        cwd="~/projeto"
        command="php -S 0.0.0.0:8000 -t public"
        output={`PHP 8.4.0 Development Server (http://0.0.0.0:8000) started`}
      />

      <p>
        Você agora tem um esqueleto REST honesto: recursos plurais, verbos certos,
        status semânticos, paginação por cursor, versionamento no path e validação que
        devolve 422 com erros por campo. No próximo capítulo, a gente formaliza esse
        contrato com <strong>OpenAPI</strong>, que gera docs e SDKs automaticamente.
      </p>
    </PageContainer>
  );
}
