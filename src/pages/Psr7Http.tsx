import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { BrowserBlock } from "@/components/ui/BrowserBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Psr7Http() {
  return (
    <PageContainer
      title="PSR-7 HTTP Messages"
      subtitle="A interface universal para requests e responses HTTP em PHP. Bibliotecas que falam PSR-7 se encaixam como peças de Lego — middlewares, clientes, servidores, frameworks: tudo conversa."
      difficulty="avancado"
      timeToRead="14 min"
      category="PSR Standards"
    >
      <h2>O problema: cada framework tem seu próprio Request</h2>
      <p>
        Antes da PSR-7, o <code>Request</code> do Symfony não conversava com o do Laravel, que não
        conversava com o da SDK da AWS. Trocar de stack era reescrever toda a camada HTTP. A{" "}
        <strong>PSR-7</strong> uniu o ecossistema: definiu interfaces neutras pra mensagens HTTP, e
        hoje praticamente toda lib séria as implementa.
      </p>

      <p>São quatro interfaces principais (mais duas auxiliares):</p>
      <ul>
        <li><code>MessageInterface</code> — base com headers, body e versão HTTP.</li>
        <li><code>RequestInterface</code> e <code>ServerRequestInterface</code> — request do cliente / do servidor.</li>
        <li><code>ResponseInterface</code> — resposta com status code.</li>
        <li><code>StreamInterface</code> — body como stream (não como string!).</li>
        <li><code>UriInterface</code> — URL parseada (scheme, host, path, query).</li>
        <li><code>UploadedFileInterface</code> — arquivo enviado via multipart.</li>
      </ul>

      <h2>A regra de ouro: imutabilidade</h2>
      <p>
        A PSR-7 fez uma escolha controversa e brilhante: <strong>todo objeto é imutável</strong>.
        Você nunca chama <code>$req-&gt;setHeader(...)</code>. Você chama <code>$req-&gt;withHeader(...)</code>{" "}
        e recebe <em>uma nova instância</em>. A original não muda.
      </p>

      <PhpBlock
        filename="src/imutabilidade.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Nyholm\\Psr7\\Request;

$original = new Request('GET', 'https://api.exemplo.com/users');

$comAuth = $original
    ->withHeader('Authorization', 'Bearer abc123')
    ->withHeader('Accept', 'application/json');

echo 'Original: ' . ($original->hasHeader('Authorization') ? 'sim' : 'não') . PHP_EOL;
echo 'Nova:     ' . ($comAuth->hasHeader('Authorization') ? 'sim' : 'não') . PHP_EOL;
echo 'Mesma instância? ' . ($original === $comAuth ? 'sim' : 'não') . PHP_EOL;`}
        output={`Original: não
Nova:     sim
Mesma instância? não`}
      />

      <AlertBox type="warning" title="Pegadinha clássica">
        Esquecer de capturar o retorno: <code>$req-&gt;withHeader('X', 'y');</code> sozinho não faz
        nada — a nova instância é descartada. Sempre <code>$req = $req-&gt;withHeader(...)</code>.
      </AlertBox>

      <h2>Instalação: nyholm/psr7 (a implementação rápida)</h2>
      <p>
        A PSR-7 só define interfaces. Você precisa de uma <em>implementação</em>. As duas mais
        usadas são:
      </p>
      <ul>
        <li><code>nyholm/psr7</code> — minúscula, ultra rápida, recomendada por padrão.</li>
        <li><code>guzzlehttp/psr7</code> — vem junto com o cliente Guzzle, mais features.</li>
      </ul>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/api"
        command="composer require nyholm/psr7 nyholm/psr7-server"
        output={`Using version ^1.8 for nyholm/psr7
Using version ^1.1 for nyholm/psr7-server
./composer.json has been updated
Running composer update nyholm/psr7 nyholm/psr7-server
Lock file operations: 4 installs, 0 updates, 0 removals
  - Locking psr/http-message (2.0)
  - Locking psr/http-factory (1.1.0)
  - Locking nyholm/psr7 (1.8.2)
  - Locking nyholm/psr7-server (1.1.0)
Writing lock file
Installing dependencies from lock file (including require-dev)
Generating autoload files`}
      />

      <h2>Construindo um Request (cliente)</h2>

      <PhpBlock
        filename="src/criar_request.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Nyholm\\Psr7\\Request;
use Nyholm\\Psr7\\Stream;

$request = (new Request('POST', 'https://api.exemplo.com/pedidos'))
    ->withHeader('Content-Type', 'application/json')
    ->withHeader('Authorization', 'Bearer xyz')
    ->withBody(Stream::create(json_encode([
        'cliente_id' => 42,
        'itens'      => [['sku' => 'CAFE-500G', 'qtd' => 2]],
    ], JSON_THROW_ON_ERROR)));

echo $request->getMethod() . ' ' . $request->getUri() . PHP_EOL;
echo 'Authorization: ' . $request->getHeaderLine('Authorization') . PHP_EOL;
echo 'Body: ' . $request->getBody() . PHP_EOL;`}
        output={`POST https://api.exemplo.com/pedidos
Authorization: Bearer xyz
Body: {"cliente_id":42,"itens":[{"sku":"CAFE-500G","qtd":2}]}`}
      />

      <p>
        Note <code>getHeaderLine()</code> — retorna a string já concatenada (vírgulas entre valores
        múltiplos). Existe também <code>getHeader()</code> que devolve <code>array</code> (porque
        HTTP permite o mesmo header mais de uma vez).
      </p>

      <h2>UriInterface — a URL parseada como objeto</h2>

      <PhpBlock
        filename="src/uri.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Nyholm\\Psr7\\Uri;

$uri = new Uri('https://ada:lovelace@api.exemplo.com:8443/v1/users?role=admin&page=2#perfil');

echo $uri->getScheme()   . PHP_EOL; // https
echo $uri->getUserInfo() . PHP_EOL; // ada:lovelace
echo $uri->getHost()     . PHP_EOL; // api.exemplo.com
echo $uri->getPort()     . PHP_EOL; // 8443
echo $uri->getPath()     . PHP_EOL; // /v1/users
echo $uri->getQuery()    . PHP_EOL; // role=admin&page=2
echo $uri->getFragment() . PHP_EOL; // perfil

// imutável: gera uma nova URI sem fragment, com path novo
$novo = $uri->withPath('/v2/usuarios')->withFragment('');
echo (string) $novo . PHP_EOL;`}
        output={`https
ada:lovelace
api.exemplo.com
8443
/v1/users
role=admin&page=2
perfil
https://ada:lovelace@api.exemplo.com:8443/v2/usuarios?role=admin&page=2`}
      />

      <h2>StreamInterface — body como stream</h2>
      <p>
        O body de mensagens PSR-7 nunca é uma string. É um <code>StreamInterface</code>, com{" "}
        <code>read</code>, <code>write</code>, <code>seek</code>, <code>tell</code>. Isso te
        permite tratar arquivos de 50GB sem carregar tudo na RAM:
      </p>

      <PhpBlock
        filename="src/streams.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Nyholm\\Psr7\\Stream;

// Stream a partir de string:
$s1 = Stream::create('olá mundo');
echo $s1->getSize() . PHP_EOL; // 9
echo (string) $s1 . PHP_EOL;   // olá mundo (cast aciona getContents)

// Stream a partir de arquivo:
$s2 = Stream::create(fopen(__DIR__ . '/relatorio.csv', 'rb'));
echo 'tamanho: ' . $s2->getSize() . PHP_EOL;

// Lendo em pedaços (sem comer RAM):
$s2->rewind();
while (!$s2->eof()) {
    $bloco = $s2->read(4096);
    // processa $bloco...
}
$s2->close();`}
        output={`9
olá mundo
tamanho: 1048576`}
      />

      <h2>Recebendo um ServerRequest (servidor)</h2>
      <p>
        Em código de servidor (sua aplicação respondendo HTTP), você precisa de um{" "}
        <code>ServerRequestInterface</code> — uma extensão da request com dados do PHP global
        (<code>$_GET</code>, <code>$_POST</code>, <code>$_FILES</code>, <code>$_COOKIE</code>,
        <code>$_SERVER</code>). O <code>nyholm/psr7-server</code> faz isso para você:
      </p>

      <PhpBlock
        filename="public/index.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Nyholm\\Psr7\\Factory\\Psr17Factory;
use Nyholm\\Psr7Server\\ServerRequestCreator;
use Nyholm\\Psr7\\Response;

// 1. Constrói o ServerRequest a partir das superglobais:
$psr17 = new Psr17Factory();
$creator = new ServerRequestCreator($psr17, $psr17, $psr17, $psr17);
$request = $creator->fromGlobals();

// 2. Sua lógica de aplicação — recebe request, devolve response:
$response = handle($request, $psr17);

// 3. Emite a response (status, headers, body) para a saída do PHP:
http_response_code($response->getStatusCode());
foreach ($response->getHeaders() as $name => $values) {
    foreach ($values as $value) {
        header(sprintf('%s: %s', $name, $value), false);
    }
}
echo $response->getBody();

function handle(
    \\Psr\\Http\\Message\\ServerRequestInterface $req,
    Psr17Factory $f,
): \\Psr\\Http\\Message\\ResponseInterface {
    if ($req->getMethod() !== 'GET' || $req->getUri()->getPath() !== '/saudacao') {
        return $f->createResponse(404)
            ->withHeader('Content-Type', 'application/json')
            ->withBody($f->createStream(json_encode(['erro' => 'rota desconhecida'])));
    }

    $nome = $req->getQueryParams()['nome'] ?? 'visitante';
    $payload = json_encode([
        'mensagem' => "Olá, {$nome}!",
        'method'   => $req->getMethod(),
        'ip'       => $req->getServerParams()['REMOTE_ADDR'] ?? null,
    ], JSON_UNESCAPED_UNICODE);

    return $f->createResponse(200)
        ->withHeader('Content-Type', 'application/json; charset=utf-8')
        ->withHeader('X-Powered-By', 'php-book')
        ->withBody($f->createStream($payload));
}`}
      />

      <p>Subindo com o servidor embutido pra ver o resultado:</p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/api"
        command="php -S localhost:8000 -t public"
        output={`[Fri Feb 14 11:23:01 2025] PHP 8.4.0 Development Server (http://localhost:8000) started`}
      />

      <BrowserBlock url="http://localhost:8000/saudacao?nome=Ada">
        <pre className="text-xs">{`{
  "mensagem": "Olá, Ada!",
  "method": "GET",
  "ip": "127.0.0.1"
}`}</pre>
      </BrowserBlock>

      <h2>Métodos do ServerRequestInterface</h2>
      <p>
        Os mais usados no dia a dia, com os equivalentes de superglobais:
      </p>

      <PhpBlock
        filename="src/server_request_api.php"
        code={`<?php
declare(strict_types=1);

use Psr\\Http\\Message\\ServerRequestInterface;

function inspecionar(ServerRequestInterface $req): array
{
    return [
        'metodo'     => $req->getMethod(),               // GET, POST...
        'uri'        => (string) $req->getUri(),         // /users?page=2
        'path'       => $req->getUri()->getPath(),       // /users
        'query'      => $req->getQueryParams(),          // $_GET parseado
        'parsed'     => $req->getParsedBody(),           // $_POST ou body parseado
        'headers'    => $req->getHeaders(),              // todos
        'cookies'    => $req->getCookieParams(),         // $_COOKIE
        'arquivos'   => $req->getUploadedFiles(),        // UploadedFileInterface[]
        'server'     => $req->getServerParams(),         // $_SERVER
        'attributes' => $req->getAttributes(),           // injetados por middleware
    ];
}`}
      />

      <AlertBox type="info" title="Atributos: o canal entre middlewares">
        <code>withAttribute('user', $u)</code> deixa um middleware injetar o usuário autenticado
        no request, e o controller seguinte lê com <code>$req-&gt;getAttribute('user')</code>.
        É o ponto de extensão genérico da PSR-7 (e a base da PSR-15).
      </AlertBox>

      <h2>Construindo Responses idiomáticas</h2>

      <PhpBlock
        filename="src/responses.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Nyholm\\Psr7\\Response;
use Nyholm\\Psr7\\Stream;

function json(mixed $dados, int $status = 200): \\Psr\\Http\\Message\\ResponseInterface
{
    return (new Response($status))
        ->withHeader('Content-Type', 'application/json; charset=utf-8')
        ->withBody(Stream::create(json_encode($dados, JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE)));
}

function redirect(string $url, int $status = 302): \\Psr\\Http\\Message\\ResponseInterface
{
    return (new Response($status))->withHeader('Location', $url);
}

function notFound(string $msg = 'recurso não encontrado'): \\Psr\\Http\\Message\\ResponseInterface
{
    return json(['erro' => $msg], 404);
}

$r = json(['ok' => true, 'pedido_id' => 1042], 201);
echo $r->getStatusCode() . ' ' . $r->getReasonPhrase() . PHP_EOL;
echo $r->getHeaderLine('Content-Type') . PHP_EOL;
echo (string) $r->getBody() . PHP_EOL;`}
        output={`201 Created
application/json; charset=utf-8
{"ok":true,"pedido_id":1042}`}
      />

      <h2>guzzlehttp/psr7 — alternativa popular</h2>
      <p>
        Se já estiver usando o Guzzle como cliente HTTP, a implementação <code>guzzlehttp/psr7</code>{" "}
        já vem junto. A API é idêntica:
      </p>

      <PhpBlock
        filename="src/guzzle_psr7.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use GuzzleHttp\\Psr7\\Request;
use GuzzleHttp\\Psr7\\Utils;

$req = (new Request('PUT', 'https://api.exemplo.com/users/42'))
    ->withHeader('Content-Type', 'application/json')
    ->withBody(Utils::streamFor(json_encode(['nome' => 'Ada'])));

echo $req->getMethod() . ' ' . $req->getUri()->getPath() . PHP_EOL;
echo $req->getBody() . PHP_EOL;`}
        output={`PUT /users/42
{"nome":"Ada"}`}
      />

      <p>
        Como ambos implementam <code>Psr\Http\Message\RequestInterface</code>, qualquer função que
        receba a interface aceita os dois — exatamente o ponto da PSR.
      </p>

      <h2>Por que isso muda tudo</h2>
      <p>
        Com PSR-7 no centro, surgiram outros padrões que se encaixam:
      </p>
      <ul>
        <li><strong>PSR-15</strong> — middlewares que recebem <code>ServerRequestInterface</code> e devolvem <code>ResponseInterface</code>.</li>
        <li><strong>PSR-17</strong> — factories pra criar requests/responses/streams (interfaces, sem implementação).</li>
        <li><strong>PSR-18</strong> — cliente HTTP simples baseado em PSR-7. Você pode trocar Guzzle por Symfony HttpClient sem mexer no código de domínio.</li>
      </ul>

      <AlertBox type="success" title="Resumo prático">
        Quando você ler “suporta PSR-7” na descrição de uma lib, leia: <em>“encaixa no seu
        ecossistema sem adapter, sem ginástica, sem refactor”</em>. É o tipo de padrão que
        escolhe ser invisível pra ser onipresente.
      </AlertBox>

      <p>
        No próximo capítulo, a gente sobe um nível e implementa <strong>middlewares PSR-15</strong>
        de verdade — autenticação, CORS, rate limit — todos consumindo o que você acabou de aprender
        aqui.
      </p>
    </PageContainer>
  );
}
