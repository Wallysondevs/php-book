import{j as e}from"./index-B5-q-eol.js";import{P as t,A as s,a as r}from"./AlertBox-CVbFLZEd.js";import{T as o}from"./TerminalBlock-6fqVIX2R.js";import{B as a}from"./BrowserBlock-pEcgE37D.js";function l(){return e.jsxs(t,{title:"PSR-7 HTTP Messages",subtitle:"A interface universal para requests e responses HTTP em PHP. Bibliotecas que falam PSR-7 se encaixam como peças de Lego — middlewares, clientes, servidores, frameworks: tudo conversa.",difficulty:"avancado",timeToRead:"14 min",category:"PSR Standards",children:[e.jsx(s,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"ServerRequestInterface"})," "," — "," ","representa request HTTP imutável."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"ResponseInterface"})," "," — "," ","response também imutável; with* devolve nova."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"StreamInterface"})," "," — "," ","body como stream — lazy e eficiente."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"UriInterface"})," "," — "," ","parse e manipulação de URL."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Implementations"})," "," — "," ","Nyholm, Guzzle PSR-7, Slim PSR-7."]})]}),e.jsx("h2",{children:"O problema: cada framework tem seu próprio Request"}),e.jsxs("p",{children:["Antes da PSR-7, o ",e.jsx("code",{children:"Request"})," do Symfony não conversava com o do Laravel, que não conversava com o da SDK da AWS. Trocar de stack era reescrever toda a camada HTTP. A"," ",e.jsx("strong",{children:"PSR-7"})," uniu o ecossistema: definiu interfaces neutras pra mensagens HTTP, e hoje praticamente toda lib séria as implementa."]}),e.jsx("p",{children:"São quatro interfaces principais (mais duas auxiliares):"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"MessageInterface"})," — base com headers, body e versão HTTP."]}),e.jsxs("li",{children:[e.jsx("code",{children:"RequestInterface"})," e ",e.jsx("code",{children:"ServerRequestInterface"})," — request do cliente / do servidor."]}),e.jsxs("li",{children:[e.jsx("code",{children:"ResponseInterface"})," — resposta com status code."]}),e.jsxs("li",{children:[e.jsx("code",{children:"StreamInterface"})," — body como stream (não como string!)."]}),e.jsxs("li",{children:[e.jsx("code",{children:"UriInterface"})," — URL parseada (scheme, host, path, query)."]}),e.jsxs("li",{children:[e.jsx("code",{children:"UploadedFileInterface"})," — arquivo enviado via multipart."]})]}),e.jsx("h2",{children:"A regra de ouro: imutabilidade"}),e.jsxs("p",{children:["A PSR-7 fez uma escolha controversa e brilhante: ",e.jsx("strong",{children:"todo objeto é imutável"}),". Você nunca chama ",e.jsx("code",{children:"$req->setHeader(...)"}),". Você chama ",e.jsx("code",{children:"$req->withHeader(...)"})," ","e recebe ",e.jsx("em",{children:"uma nova instância"}),". A original não muda."]}),e.jsx(r,{filename:"src/imutabilidade.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Nyholm\\Psr7\\Request;

$original = new Request('GET', 'https://api.exemplo.com/users');

$comAuth = $original
    ->withHeader('Authorization', 'Bearer abc123')
    ->withHeader('Accept', 'application/json');

echo 'Original: ' . ($original->hasHeader('Authorization') ? 'sim' : 'não') . PHP_EOL;
echo 'Nova:     ' . ($comAuth->hasHeader('Authorization') ? 'sim' : 'não') . PHP_EOL;
echo 'Mesma instância? ' . ($original === $comAuth ? 'sim' : 'não') . PHP_EOL;`,output:`Original: não
Nova:     sim
Mesma instância? não`}),e.jsxs(s,{type:"warning",title:"Pegadinha clássica",children:["Esquecer de capturar o retorno: ",e.jsx("code",{children:"$req->withHeader('X', 'y');"})," sozinho não faz nada — a nova instância é descartada. Sempre ",e.jsx("code",{children:"$req = $req->withHeader(...)"}),"."]}),e.jsx("h2",{children:"Instalação: nyholm/psr7 (a implementação rápida)"}),e.jsxs("p",{children:["A PSR-7 só define interfaces. Você precisa de uma ",e.jsx("em",{children:"implementação"}),". As duas mais usadas são:"]}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"nyholm/psr7"})," — minúscula, ultra rápida, recomendada por padrão."]}),e.jsxs("li",{children:[e.jsx("code",{children:"guzzlehttp/psr7"})," — vem junto com o cliente Guzzle, mais features."]})]}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos/api",command:"composer require nyholm/psr7 nyholm/psr7-server",output:`Using version ^1.8 for nyholm/psr7
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
Generating autoload files`}),e.jsx("h2",{children:"Construindo um Request (cliente)"}),e.jsx(r,{filename:"src/criar_request.php",code:`<?php
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
echo 'Body: ' . $request->getBody() . PHP_EOL;`,output:`POST https://api.exemplo.com/pedidos
Authorization: Bearer xyz
Body: {"cliente_id":42,"itens":[{"sku":"CAFE-500G","qtd":2}]}`}),e.jsxs("p",{children:["Note ",e.jsx("code",{children:"getHeaderLine()"})," — retorna a string já concatenada (vírgulas entre valores múltiplos). Existe também ",e.jsx("code",{children:"getHeader()"})," que devolve ",e.jsx("code",{children:"array"})," (porque HTTP permite o mesmo header mais de uma vez)."]}),e.jsx("h2",{children:"UriInterface — a URL parseada como objeto"}),e.jsx(r,{filename:"src/uri.php",code:`<?php
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
echo (string) $novo . PHP_EOL;`,output:`https
ada:lovelace
api.exemplo.com
8443
/v1/users
role=admin&page=2
perfil
https://ada:lovelace@api.exemplo.com:8443/v2/usuarios?role=admin&page=2`}),e.jsx("h2",{children:"StreamInterface — body como stream"}),e.jsxs("p",{children:["O body de mensagens PSR-7 nunca é uma string. É um ",e.jsx("code",{children:"StreamInterface"}),", com"," ",e.jsx("code",{children:"read"}),", ",e.jsx("code",{children:"write"}),", ",e.jsx("code",{children:"seek"}),", ",e.jsx("code",{children:"tell"}),". Isso te permite tratar arquivos de 50GB sem carregar tudo na RAM:"]}),e.jsx(r,{filename:"src/streams.php",code:`<?php
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
$s2->close();`,output:`9
olá mundo
tamanho: 1048576`}),e.jsx("h2",{children:"Recebendo um ServerRequest (servidor)"}),e.jsxs("p",{children:["Em código de servidor (sua aplicação respondendo HTTP), você precisa de um"," ",e.jsx("code",{children:"ServerRequestInterface"})," — uma extensão da request com dados do PHP global (",e.jsx("code",{children:"$_GET"}),", ",e.jsx("code",{children:"$_POST"}),", ",e.jsx("code",{children:"$_FILES"}),", ",e.jsx("code",{children:"$_COOKIE"}),",",e.jsx("code",{children:"$_SERVER"}),"). O ",e.jsx("code",{children:"nyholm/psr7-server"})," faz isso para você:"]}),e.jsx(r,{filename:"public/index.php",code:`<?php
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
}`}),e.jsx("p",{children:"Subindo com o servidor embutido pra ver o resultado:"}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos/api",command:"php -S localhost:8000 -t public",output:"[Fri Feb 14 11:23:01 2025] PHP 8.4.0 Development Server (http://localhost:8000) started"}),e.jsx(a,{url:"http://localhost:8000/saudacao?nome=Ada",children:e.jsx("pre",{className:"text-xs",children:`{
  "mensagem": "Olá, Ada!",
  "method": "GET",
  "ip": "127.0.0.1"
}`})}),e.jsx("h2",{children:"Métodos do ServerRequestInterface"}),e.jsx("p",{children:"Os mais usados no dia a dia, com os equivalentes de superglobais:"}),e.jsx(r,{filename:"src/server_request_api.php",code:`<?php
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
}`}),e.jsxs(s,{type:"info",title:"Atributos: o canal entre middlewares",children:[e.jsx("code",{children:"withAttribute('user', $u)"})," deixa um middleware injetar o usuário autenticado no request, e o controller seguinte lê com ",e.jsx("code",{children:"$req->getAttribute('user')"}),". É o ponto de extensão genérico da PSR-7 (e a base da PSR-15)."]}),e.jsx("h2",{children:"Construindo Responses idiomáticas"}),e.jsx(r,{filename:"src/responses.php",code:`<?php
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
echo (string) $r->getBody() . PHP_EOL;`,output:`201 Created
application/json; charset=utf-8
{"ok":true,"pedido_id":1042}`}),e.jsx("h2",{children:"guzzlehttp/psr7 — alternativa popular"}),e.jsxs("p",{children:["Se já estiver usando o Guzzle como cliente HTTP, a implementação ",e.jsx("code",{children:"guzzlehttp/psr7"})," ","já vem junto. A API é idêntica:"]}),e.jsx(r,{filename:"src/guzzle_psr7.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use GuzzleHttp\\Psr7\\Request;
use GuzzleHttp\\Psr7\\Utils;

$req = (new Request('PUT', 'https://api.exemplo.com/users/42'))
    ->withHeader('Content-Type', 'application/json')
    ->withBody(Utils::streamFor(json_encode(['nome' => 'Ada'])));

echo $req->getMethod() . ' ' . $req->getUri()->getPath() . PHP_EOL;
echo $req->getBody() . PHP_EOL;`,output:`PUT /users/42
{"nome":"Ada"}`}),e.jsxs("p",{children:["Como ambos implementam ",e.jsx("code",{children:"Psr\\Http\\Message\\RequestInterface"}),", qualquer função que receba a interface aceita os dois — exatamente o ponto da PSR."]}),e.jsx("h2",{children:"Por que isso muda tudo"}),e.jsx("p",{children:"Com PSR-7 no centro, surgiram outros padrões que se encaixam:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"PSR-15"})," — middlewares que recebem ",e.jsx("code",{children:"ServerRequestInterface"})," e devolvem ",e.jsx("code",{children:"ResponseInterface"}),"."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"PSR-17"})," — factories pra criar requests/responses/streams (interfaces, sem implementação)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"PSR-18"})," — cliente HTTP simples baseado em PSR-7. Você pode trocar Guzzle por Symfony HttpClient sem mexer no código de domínio."]})]}),e.jsxs(s,{type:"success",title:"Resumo prático",children:["Quando você ler “suporta PSR-7” na descrição de uma lib, leia: ",e.jsx("em",{children:"“encaixa no seu ecossistema sem adapter, sem ginástica, sem refactor”"}),". É o tipo de padrão que escolhe ser invisível pra ser onipresente."]}),e.jsxs("p",{children:["No próximo capítulo, a gente sobe um nível e implementa ",e.jsx("strong",{children:"middlewares PSR-15"}),"de verdade — autenticação, CORS, rate limit — todos consumindo o que você acabou de aprender aqui."]})]})}export{l as default};
