import{j as e}from"./index-Bb4MiiJL.js";import{P as a,a as r,A as t}from"./AlertBox-BpD-xIsb.js";import{T as s}from"./TerminalBlock-DGurMC1r.js";import{B as n}from"./BrowserBlock-C5ENTT0j.js";import{C as o}from"./CodeBlock-C3V-qEkN.js";function u(){return e.jsxs(a,{title:"PSR-15 Middleware",subtitle:"O modelo onion para HTTP em PHP: cada middleware envolve o próximo, decide se passa adiante ou curto-circuita. Vamos montar uma mini app com Slim PSR-7 + PSR-15 do zero.",difficulty:"avancado",timeToRead:"14 min",category:"PSR Standards",children:[e.jsx("h2",{children:"O problema: cross-cutting concerns sem virar bagunça"}),e.jsxs("p",{children:["Toda app HTTP precisa logar requisições, validar autenticação, configurar CORS, tratar erros, comprimir respostas. Se você espalhar isso pelos controllers, vira ",e.jsx("em",{children:"copy-paste"})," ",'no melhor estilo "PHP de 2008". O PSR-15 resolve com uma metáfora simples: ',e.jsx("strong",{children:"middlewares em camadas de cebola"}),". A request entra por fora, passa por cada camada, chega no handler final, e a response volta atravessando as mesmas camadas em ordem inversa."]}),e.jsx("h2",{children:"Os dois contratos do PSR-15"}),e.jsx(r,{filename:"vendor/psr/http-server-middleware/MiddlewareInterface.php",code:`<?php
namespace Psr\\Http\\Server;

use Psr\\Http\\Message\\ResponseInterface;
use Psr\\Http\\Message\\ServerRequestInterface;

interface MiddlewareInterface
{
    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler,
    ): ResponseInterface;
}

interface RequestHandlerInterface
{
    public function handle(ServerRequestInterface $request): ResponseInterface;
}`}),e.jsxs(t,{type:"info",title:"A regra do jogo",children:["Dentro de ",e.jsx("code",{children:"process()"})," você pode: (a) ",e.jsx("strong",{children:"chamar "}),e.jsx("code",{children:"$handler->handle($request)"})," para passar adiante, (b) modificar a request antes, (c) modificar a response depois, ou (d) ",e.jsx("strong",{children:"curto-circuitar"})," ","retornando uma response sem chamar o handler (útil para auth/cache)."]}),e.jsx("h2",{children:"Instalando as peças"}),e.jsx(s,{user:"dev",host:"php",cwd:"~/api",command:"composer require slim/psr7 nyholm/psr7-server psr/http-server-middleware",output:`Using version ^1.7 for slim/psr7
Using version ^1.1 for nyholm/psr7-server
Using version ^1.0 for psr/http-server-middleware
Lock file operations: 6 installs
  - Locking psr/http-message (2.0)
  - Locking psr/http-factory (1.1.0)
  - Locking psr/http-server-handler (1.0.2)
  - Locking psr/http-server-middleware (1.0.2)
  - Locking slim/psr7 (1.7)
  - Locking nyholm/psr7-server (1.1.0)
Generating autoload files`}),e.jsx("h2",{children:'Um middleware de log: o "Hello, World" do PSR-15'}),e.jsx(r,{filename:"src/Middleware/LogMiddleware.php",code:`<?php
declare(strict_types=1);

namespace App\\Middleware;

use Psr\\Http\\Message\\ResponseInterface;
use Psr\\Http\\Message\\ServerRequestInterface;
use Psr\\Http\\Server\\MiddlewareInterface;
use Psr\\Http\\Server\\RequestHandlerInterface;
use Psr\\Log\\LoggerInterface;

final class LogMiddleware implements MiddlewareInterface
{
    public function __construct(private readonly LoggerInterface $logger) {}

    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler,
    ): ResponseInterface {
        $start = microtime(true);
        $response = $handler->handle($request); // passa adiante
        $ms = (int) ((microtime(true) - $start) * 1000);

        $this->logger->info(sprintf(
            '%s %s -> %d (%dms)',
            $request->getMethod(),
            (string) $request->getUri()->getPath(),
            $response->getStatusCode(),
            $ms,
        ));

        return $response;
    }
}`}),e.jsx("h2",{children:"Auth: um middleware que pode curto-circuitar"}),e.jsx(r,{filename:"src/Middleware/AuthMiddleware.php",code:`<?php
declare(strict_types=1);

namespace App\\Middleware;

use Nyholm\\Psr7\\Response;
use Psr\\Http\\Message\\ResponseInterface;
use Psr\\Http\\Message\\ServerRequestInterface;
use Psr\\Http\\Server\\MiddlewareInterface;
use Psr\\Http\\Server\\RequestHandlerInterface;

final class AuthMiddleware implements MiddlewareInterface
{
    public function __construct(private readonly string $expectedToken) {}

    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler,
    ): ResponseInterface {
        $auth = $request->getHeaderLine('Authorization');

        if (!str_starts_with($auth, 'Bearer ') || substr($auth, 7) !== $this->expectedToken) {
            $r = new Response(401, ['Content-Type' => 'application/json']);
            $r->getBody()->write(json_encode(['error' => 'unauthorized']));
            return $r; // curto-circuita: handler nunca é chamado
        }

        // anexa identidade decodificada na request, dispo para o handler
        return $handler->handle($request->withAttribute('user_id', 42));
    }
}`}),e.jsx("h2",{children:"CORS: middleware que age na response"}),e.jsx(r,{filename:"src/Middleware/CorsMiddleware.php",code:`<?php
declare(strict_types=1);

namespace App\\Middleware;

use Nyholm\\Psr7\\Response;
use Psr\\Http\\Message\\ResponseInterface;
use Psr\\Http\\Message\\ServerRequestInterface;
use Psr\\Http\\Server\\MiddlewareInterface;
use Psr\\Http\\Server\\RequestHandlerInterface;

final class CorsMiddleware implements MiddlewareInterface
{
    public function __construct(private readonly string $allowOrigin = '*') {}

    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler,
    ): ResponseInterface {
        if ($request->getMethod() === 'OPTIONS') {
            return $this->withHeaders(new Response(204));
        }

        return $this->withHeaders($handler->handle($request));
    }

    private function withHeaders(ResponseInterface $r): ResponseInterface
    {
        return $r
            ->withHeader('Access-Control-Allow-Origin', $this->allowOrigin)
            ->withHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS')
            ->withHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');
    }
}`}),e.jsx("h2",{children:"Cache: response curto-circuitada quando há hit"}),e.jsx(r,{filename:"src/Middleware/CacheMiddleware.php",code:`<?php
declare(strict_types=1);

namespace App\\Middleware;

use Nyholm\\Psr7\\Response;
use Psr\\Http\\Message\\ResponseInterface;
use Psr\\Http\\Message\\ServerRequestInterface;
use Psr\\Http\\Server\\MiddlewareInterface;
use Psr\\Http\\Server\\RequestHandlerInterface;

final class CacheMiddleware implements MiddlewareInterface
{
    public function __construct(private readonly \\Redis $redis, private readonly int $ttl = 60) {}

    public function process(
        ServerRequestInterface $request,
        RequestHandlerInterface $handler,
    ): ResponseInterface {
        if ($request->getMethod() !== 'GET') {
            return $handler->handle($request);
        }

        $key = 'http:' . sha1((string) $request->getUri());
        if ($cached = $this->redis->get($key)) {
            $r = new Response(200, ['Content-Type' => 'application/json', 'X-Cache' => 'HIT']);
            $r->getBody()->write($cached);
            return $r;
        }

        $response = $handler->handle($request);
        $body = (string) $response->getBody();
        $this->redis->setex($key, $this->ttl, $body);
        $response->getBody()->rewind();
        return $response->withHeader('X-Cache', 'MISS');
    }
}`}),e.jsx("h2",{children:'A pipeline: a "cebola" que orquestra tudo'}),e.jsxs("p",{children:["O pipeline implementa ",e.jsx("code",{children:"RequestHandlerInterface"})," e mantém uma fila de middlewares. Cada chamada a ",e.jsx("code",{children:"handle()"})," consome o próximo da fila — quando acaba, despacha para o handler final."]}),e.jsx(r,{filename:"src/Pipeline.php",code:`<?php
declare(strict_types=1);

namespace App;

use Psr\\Http\\Message\\ResponseInterface;
use Psr\\Http\\Message\\ServerRequestInterface;
use Psr\\Http\\Server\\MiddlewareInterface;
use Psr\\Http\\Server\\RequestHandlerInterface;

final class Pipeline implements RequestHandlerInterface
{
    /** @var list<MiddlewareInterface> */
    private array $queue = [];

    public function __construct(private readonly RequestHandlerInterface $finalHandler) {}

    public function pipe(MiddlewareInterface $mw): self
    {
        $this->queue[] = $mw;
        return $this;
    }

    public function handle(ServerRequestInterface $request): ResponseInterface
    {
        if ($this->queue === []) {
            return $this->finalHandler->handle($request);
        }
        $mw = array_shift($this->queue);
        return $mw->process($request, $this);
    }
}`}),e.jsx("h2",{children:"Handler final + bootstrap da app"}),e.jsx(r,{filename:"public/index.php",code:`<?php
declare(strict_types=1);
require __DIR__ . '/../vendor/autoload.php';

use App\\Middleware\\{LogMiddleware, AuthMiddleware, CorsMiddleware};
use App\\Pipeline;
use Monolog\\Logger;
use Monolog\\Handler\\StreamHandler;
use Nyholm\\Psr7\\Factory\\Psr17Factory;
use Nyholm\\Psr7\\Response;
use Nyholm\\Psr7Server\\ServerRequestCreator;
use Psr\\Http\\Message\\ResponseInterface;
use Psr\\Http\\Message\\ServerRequestInterface;
use Psr\\Http\\Server\\RequestHandlerInterface;

$psr17 = new Psr17Factory();
$creator = new ServerRequestCreator($psr17, $psr17, $psr17, $psr17);
$request = $creator->fromGlobals();

$logger = new Logger('http');
$logger->pushHandler(new StreamHandler('php://stdout'));

// Handler final: a "ação" no fim da cebola
$final = new class implements RequestHandlerInterface {
    public function handle(ServerRequestInterface $request): ResponseInterface {
        $userId = $request->getAttribute('user_id');
        $body = json_encode(['ok' => true, 'user_id' => $userId, 'path' => $request->getUri()->getPath()]);
        $r = new Response(200, ['Content-Type' => 'application/json']);
        $r->getBody()->write($body);
        return $r;
    }
};

$pipeline = (new Pipeline($final))
    ->pipe(new CorsMiddleware('*'))
    ->pipe(new LogMiddleware($logger))
    ->pipe(new AuthMiddleware('s3cr3t'));

$response = $pipeline->handle($request);

http_response_code($response->getStatusCode());
foreach ($response->getHeaders() as $name => $values) {
    foreach ($values as $v) header("{$name}: {$v}", false);
}
echo $response->getBody();`}),e.jsx(s,{user:"dev",host:"php",cwd:"~/api",command:"php -S 0.0.0.0:8000 -t public",output:"[Tue Jan 12 10:00:01 2025] PHP 8.4.1 Development Server (http://0.0.0.0:8000) started"}),e.jsx(s,{user:"dev",host:"php",cwd:"~",command:'curl -i -H "Authorization: Bearer s3cr3t" http://localhost:8000/me',output:`HTTP/1.1 200 OK
Content-Type: application/json
Access-Control-Allow-Origin: *

{"ok":true,"user_id":42,"path":"/me"}`}),e.jsx(n,{url:"http://localhost:8000/me",children:e.jsx("pre",{style:{margin:0},children:'{"ok":true,"user_id":42,"path":"/me"}'})}),e.jsxs("p",{children:["Sem token, o ",e.jsx("code",{children:"AuthMiddleware"})," curto-circuita antes de chegar no handler:"]}),e.jsx(s,{user:"dev",host:"php",cwd:"~",command:"curl -i http://localhost:8000/me",output:`HTTP/1.1 401 Unauthorized
Content-Type: application/json
Access-Control-Allow-Origin: *

{"error":"unauthorized"}`}),e.jsxs(t,{type:"warning",title:"A ordem importa MUITO",children:["CORS antes do auth (para que ",e.jsx("code",{children:"OPTIONS"})," preflight nunca veja 401). Log envolvendo tudo (para ver o status real da response). Cache depois do auth (para não servir conteúdo privado para qualquer um)."]}),e.jsx("h2",{children:"Por que isso é tão poderoso?"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Composição"}),": cada middleware tem uma responsabilidade única e testável isoladamente."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Interoperabilidade"}),": middlewares PSR-15 funcionam em Slim, Mezzio, Laminas e qualquer pipeline custom."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Curto-circuito grátis"}),": auth, cache, rate-limit retornam sem invocar o handler."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Pós-processamento"}),": você modifica a response no caminho de volta sem tocar no handler."]})]}),e.jsx(o,{language:"json",title:"composer.json",code:`{
  "require": {
    "php": "^8.4",
    "psr/http-server-middleware": "^1.0",
    "slim/psr7": "^1.7",
    "nyholm/psr7": "^1.8",
    "nyholm/psr7-server": "^1.1",
    "monolog/monolog": "^3.7"
  }
}`}),e.jsxs("p",{children:["Pipeline montada e rodando. No próximo capítulo a gente sai do servidor e vai para o outro lado: ",e.jsx("strong",{children:"fazer requisições HTTP"})," com cURL nativo e Guzzle."]})]})}export{u as default};
