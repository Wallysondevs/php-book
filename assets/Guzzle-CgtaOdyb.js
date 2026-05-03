import{j as e}from"./index-B5-q-eol.js";import{P as o,A as s,a as t}from"./AlertBox-CVbFLZEd.js";import{T as r}from"./TerminalBlock-6fqVIX2R.js";import{C as a}from"./CodeBlock-B36pQ_ak.js";function c(){return e.jsxs(o,{title:"Guzzle HTTP Client",subtitle:"A biblioteca HTTP de fato do PHP. PSR-7 e PSR-18 nativos, promises para concorrência, middleware stack para retry/log/auth, e Mock handler para testes determinísticos.",difficulty:"intermediario",timeToRead:"14 min",category:"HTTP Cliente",children:[e.jsx(s,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Guzzle"})," "," — "," ","cliente HTTP popular; abstração sobre cURL."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Promise/Async"})," "," — "," ","requisições paralelas com $client->getAsync."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Middleware"})," "," — "," ","handlers para retry, log, auth."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"PSR-7"})," "," — "," ","requests/responses seguem o padrão."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"MockHandler"})," "," — "," ","simula respostas em testes."]})]}),e.jsx("h2",{children:"O problema: cURL nativo é poderoso, mas cansativo"}),e.jsxs("p",{children:["No capítulo anterior você viu que cada ",e.jsx("code",{children:"GET"})," com timeout, header e tratamento de erro vira 10 linhas de ",e.jsx("code",{children:"curl_setopt"}),". Multiplique por 50 endpoints e a sua camada HTTP fica impossível de ler. O ",e.jsx("strong",{children:"Guzzle"})," é a abstração que praticamente toda app PHP moderna usa — incluindo Symfony HttpClient como fallback, AWS SDK, Stripe SDK, Mailchimp, etc."]}),e.jsx("h2",{children:"Instalando"}),e.jsx(r,{user:"dev",host:"php",cwd:"~/app",command:"composer require guzzlehttp/guzzle",output:`Using version ^7.9 for guzzlehttp/guzzle
./composer.json has been updated
Lock file operations: 5 installs
  - Locking guzzlehttp/guzzle (7.9.2)
  - Locking guzzlehttp/promises (2.0.3)
  - Locking guzzlehttp/psr7 (2.7.0)
  - Locking psr/http-client (1.0.3)
  - Locking psr/http-message (2.0)
Generating autoload files`}),e.jsx("h2",{children:"Primeira requisição: GET → JSON"}),e.jsx(t,{filename:"primeira.php",code:`<?php
declare(strict_types=1);
require __DIR__ . '/vendor/autoload.php';

use GuzzleHttp\\Client;

$client = new Client([
    'base_uri'    => 'https://api.github.com/',
    'timeout'     => 5.0,
    'headers'     => [
        'Accept'     => 'application/vnd.github+json',
        'User-Agent' => 'php-book/1.0',
    ],
]);

$response = $client->get('repos/php/php-src');

echo "status: " . $response->getStatusCode() . "\\n";
$repo = json_decode((string) $response->getBody(), true, 512, JSON_THROW_ON_ERROR);
echo "{$repo['full_name']} • {$repo['stargazers_count']} ⭐\\n";`,output:`status: 200
php/php-src • 38120 ⭐`}),e.jsxs("p",{children:["Repare: ",e.jsx("code",{children:"base_uri"}),", headers padrão e timeout viraram configuração do client. Cada chamada herda automaticamente. A ",e.jsx("code",{children:"$response"})," é um objeto PSR-7 (",e.jsx("code",{children:"ResponseInterface"}),"), então você pode passar para qualquer biblioteca que respeite o padrão."]}),e.jsx("h2",{children:"POST com JSON, headers e auth"}),e.jsx(t,{filename:"post.php",code:`<?php
declare(strict_types=1);
require __DIR__ . '/vendor/autoload.php';

use GuzzleHttp\\Client;
use GuzzleHttp\\RequestOptions;

$client = new Client(['base_uri' => 'https://api.exemplo.com/']);

$response = $client->post('orders', [
    RequestOptions::JSON    => [
        'product_id' => 42,
        'quantity'   => 2,
    ],
    RequestOptions::HEADERS => [
        'X-Idempotency-Key' => bin2hex(random_bytes(16)),
    ],
    RequestOptions::AUTH    => ['api_user', getenv('API_PASS')],   // basic
    // alternativa Bearer: RequestOptions::HEADERS => ['Authorization' => 'Bearer ' . $token]
    RequestOptions::TIMEOUT => 10.0,
]);

$order = json_decode((string) $response->getBody(), true, 512, JSON_THROW_ON_ERROR);
echo "pedido criado: #{$order['id']}\\n";`,output:"pedido criado: #1024"}),e.jsxs(s,{type:"info",title:"RequestOptions::JSON faz três coisas",children:["Codifica o array para JSON, define ",e.jsx("code",{children:"Content-Type: application/json"})," e",e.jsx("code",{children:" Accept: application/json"}),". Para ",e.jsx("code",{children:"multipart/form-data"})," use",e.jsx("code",{children:" RequestOptions::MULTIPART"}),"; para ",e.jsx("code",{children:"application/x-www-form-urlencoded"})," ","use ",e.jsx("code",{children:"RequestOptions::FORM_PARAMS"}),"."]}),e.jsx("h2",{children:"Tratamento de erros HTTP"}),e.jsx(t,{filename:"erros.php",code:`<?php
declare(strict_types=1);
require __DIR__ . '/vendor/autoload.php';

use GuzzleHttp\\Client;
use GuzzleHttp\\Exception\\ClientException;       // 4xx
use GuzzleHttp\\Exception\\ServerException;       // 5xx
use GuzzleHttp\\Exception\\ConnectException;      // DNS/TCP/timeout

$client = new Client(['base_uri' => 'https://api.exemplo.com/', 'timeout' => 3]);

try {
    $r = $client->get('users/9999');
    var_dump(json_decode((string) $r->getBody(), true));
} catch (ClientException $e) {
    // 4xx — a response veio, mas com status de erro
    $body = (string) $e->getResponse()->getBody();
    echo "cliente errou ({$e->getResponse()->getStatusCode()}): {$body}\\n";
} catch (ServerException $e) {
    echo "servidor caiu: {$e->getMessage()}\\n";
} catch (ConnectException $e) {
    echo "rede ruim: {$e->getMessage()}\\n";
}`,output:'cliente errou (404): {"error":"user_not_found"}'}),e.jsx("h2",{children:"Concorrência com Pool de promises"}),e.jsxs("p",{children:["Guzzle traz promises (próprias, não as PSR-21 — vieram antes). O ",e.jsx("code",{children:"Pool"})," ","executa N requisições em paralelo controlando a concorrência máxima — o equivalente idiomático ao ",e.jsx("code",{children:"curl_multi"}),"."]}),e.jsx(t,{filename:"pool.php",code:`<?php
declare(strict_types=1);
require __DIR__ . '/vendor/autoload.php';

use GuzzleHttp\\Client;
use GuzzleHttp\\Pool;
use GuzzleHttp\\Psr7\\Request;
use Psr\\Http\\Message\\ResponseInterface;

$client = new Client(['headers' => ['User-Agent' => 'php-book/1.0']]);

$repos = ['php/php-src', 'symfony/symfony', 'laravel/laravel', 'composer/composer'];

$requests = function () use ($repos) {
    foreach ($repos as $r) {
        yield new Request('GET', "https://api.github.com/repos/{$r}");
    }
};

$resultados = [];
$pool = new Pool($client, $requests(), [
    'concurrency' => 4,
    'fulfilled'   => function (ResponseInterface $resp, int $i) use (&$resultados, $repos) {
        $data = json_decode((string) $resp->getBody(), true);
        $resultados[$repos[$i]] = $data['stargazers_count'];
    },
    'rejected'    => function (\\Throwable $e, int $i) use ($repos) {
        echo "FALHA em {$repos[$i]}: {$e->getMessage()}\\n";
    },
]);

$pool->promise()->wait();

ksort($resultados);
foreach ($resultados as $repo => $stars) {
    echo str_pad($repo, 22) . " {$stars} ⭐\\n";
}`,output:`composer/composer      28910 ⭐
laravel/laravel        78104 ⭐
php/php-src            38120 ⭐
symfony/symfony        29810 ⭐`}),e.jsx("h2",{children:"Middleware Stack: retry, log, auth no caminho da request"}),e.jsxs("p",{children:["Cada client tem um ",e.jsx("code",{children:"HandlerStack"}),'. Você empilha middlewares que vão envolver toda requisição que passar pelo client. É o mesmo padrão "cebola" do PSR-15, adaptado para o lado cliente.']}),e.jsx(t,{filename:"middleware.php",code:`<?php
declare(strict_types=1);
require __DIR__ . '/vendor/autoload.php';

use GuzzleHttp\\Client;
use GuzzleHttp\\HandlerStack;
use GuzzleHttp\\Middleware;
use GuzzleHttp\\MessageFormatter;
use Monolog\\Logger;
use Monolog\\Handler\\StreamHandler;
use Psr\\Http\\Message\\RequestInterface;
use Psr\\Http\\Message\\ResponseInterface;

$logger = new Logger('http');
$logger->pushHandler(new StreamHandler('php://stdout'));

$stack = HandlerStack::create();

// 1) Retry: 3 tentativas para 5xx ou erro de rede, com backoff exponencial
$stack->push(Middleware::retry(
    function (int $retries, RequestInterface $req, ?ResponseInterface $resp = null, ?\\Throwable $e = null) {
        if ($retries >= 3) return false;
        if ($e !== null) return true;                          // erro de rede
        return $resp && $resp->getStatusCode() >= 500;          // erro de servidor
    },
    fn(int $retries) => 200 * (2 ** $retries),                  // 200ms, 400ms, 800ms
));

// 2) Log de cada request/response
$stack->push(Middleware::log($logger, new MessageFormatter('{method} {uri} -> {code} ({res_header_Content-Length}b)')));

// 3) Middleware customizado: injeta header X-Request-Id
$stack->push(Middleware::mapRequest(
    fn(RequestInterface $r) => $r->withHeader('X-Request-Id', bin2hex(random_bytes(8))),
));

$client = new Client(['handler' => $stack, 'base_uri' => 'https://httpbin.org/']);
$client->get('uuid');`,output:"[2025-01-12T10:32:11+00:00] http.INFO: GET https://httpbin.org/uuid -> 200 (53b)"}),e.jsx("h2",{children:"Mock Handler: testes determinísticos sem rede"}),e.jsxs("p",{children:["Para testar código que depende de HTTP, você não chama o serviço real — substitui o handler do Guzzle por um ",e.jsx("code",{children:"MockHandler"})," que devolve respostas pré-programadas. Suas suites ficam rápidas e determinísticas."]}),e.jsx(t,{filename:"tests/GitHubClientTest.php",code:`<?php
declare(strict_types=1);

use GuzzleHttp\\Client;
use GuzzleHttp\\Handler\\MockHandler;
use GuzzleHttp\\HandlerStack;
use GuzzleHttp\\Psr7\\Response;
use GuzzleHttp\\Middleware;
use PHPUnit\\Framework\\TestCase;

final class GitHubClientTest extends TestCase
{
    public function testRetornaContagemDeStars(): void
    {
        $mock = new MockHandler([
            new Response(200, [], json_encode(['full_name' => 'php/php-src', 'stargazers_count' => 12345])),
        ]);

        $history = [];
        $stack = HandlerStack::create($mock);
        $stack->push(Middleware::history($history));

        $github = new GitHubClient(new Client(['handler' => $stack]));
        $stars  = $github->stars('php/php-src');

        self::assertSame(12345, $stars);
        self::assertCount(1, $history);
        self::assertSame('GET', $history[0]['request']->getMethod());
        self::assertStringContainsString('repos/php/php-src', (string) $history[0]['request']->getUri());
    }
}`}),e.jsx(r,{user:"dev",host:"php",cwd:"~/app",command:"vendor/bin/phpunit tests/GitHubClientTest.php",output:`PHPUnit 11.5.0 by Sebastian Bergmann.

.                                                                   1 / 1 (100%)

Time: 00:00.014, Memory: 6.00 MB

OK (1 test, 3 assertions)`}),e.jsxs(s,{type:"success",title:"MockHandler em fila",children:["Você pode passar várias respostas para o ",e.jsx("code",{children:"MockHandler"})," — ele consome em ordem a cada chamada. Útil para testar fluxos com várias requisições, ou simular um 503 seguido de 200 para validar seu retry."]}),e.jsx("h2",{children:"Streaming de respostas grandes"}),e.jsx(t,{filename:"streaming.php",code:`<?php
declare(strict_types=1);
require __DIR__ . '/vendor/autoload.php';

use GuzzleHttp\\Client;
use GuzzleHttp\\RequestOptions;

$client = new Client();

// stream=true: o body chega em chunks, sem carregar tudo na RAM
$response = $client->get('https://example.com/arquivo-de-2gb.zip', [
    RequestOptions::STREAM  => true,
    RequestOptions::TIMEOUT => 0,    // sem limite total
]);

$out = fopen('/tmp/arquivo.zip', 'wb');
$body = $response->getBody();
$bytes = 0;
while (!$body->eof()) {
    $chunk = $body->read(64 * 1024);   // 64KB por leitura
    fwrite($out, $chunk);
    $bytes += strlen($chunk);
}
fclose($out);

echo "baixei " . number_format($bytes / 1024 / 1024, 2) . " MB\\n";`,output:"baixei 2048.00 MB"}),e.jsx("h2",{children:"Por que adotar Guzzle"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"PSR-7/PSR-18"}),": interopera com qualquer middleware/biblioteca do ecossistema."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Promises e Pool"}),": paralelização decente sem ler manual de cURL multi."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Stack de middleware"}),": retry, log, cache, auth viram plug-and-play."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Mock + History"}),": seus testes não dependem da internet."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Streaming"}),": download/upload de gigabytes sem estourar a memória."]})]}),e.jsx(a,{language:"json",title:"composer.json",code:`{
  "require": {
    "php": "^8.4",
    "guzzlehttp/guzzle": "^7.9",
    "monolog/monolog": "^3.7"
  },
  "require-dev": {
    "phpunit/phpunit": "^11.5"
  }
}`}),e.jsxs("p",{children:["Cliente HTTP resolvido. No próximo capítulo a gente inverte o fluxo: você passa a"," ",e.jsx("strong",{children:"receber"})," requisições (webhooks) e precisa validar assinatura HMAC, tratar idempotência e enfileirar processamento."]})]})}export{c as default};
