import{j as e}from"./index-B5-q-eol.js";import{P as a,A as s,a as o}from"./AlertBox-CVbFLZEd.js";import{T as r}from"./TerminalBlock-6fqVIX2R.js";import{B as t}from"./BrowserBlock-pEcgE37D.js";import{C as n}from"./CodeBlock-B36pQ_ak.js";function m(){return e.jsxs(a,{title:"ReactPHP — event loop",subtitle:"PHP assíncrono de verdade: um event loop em cima de stream_select, promises e I/O não-bloqueante. O mesmo modelo que faz o Node.js voar, agora dentro do seu PHP 8.4.",difficulty:"avancado",timeToRead:"13 min",category:"Async & Fibers",children:[e.jsx(s,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Event loop"})," "," — "," ","núcleo single-thread que despacha I/O sem bloquear."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Promise"})," "," — "," ","representa valor futuro; .then encadeia."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Streams"})," "," — "," ","leitura/escrita não-bloqueante."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"vs PHP-FPM"})," "," — "," ","long-running em vez de spawn-die por request."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Casos de uso"})," "," — "," ","WebSockets, microservices push, jobs em background."]})]}),e.jsx("h2",{children:"O problema: 10 chamadas HTTP que demoram uma eternidade"}),e.jsx("p",{children:"Imagine que você precisa consultar 10 APIs externas e juntar os resultados. Em PHP síncrono clássico, cada chamada bloqueia a próxima. Se cada uma leva 1 segundo, você espera 10 segundos em série. Não tem CPU envolvida — é tudo I/O, esperando o socket responder."}),e.jsx(o,{filename:"sincrono.php",code:`<?php
declare(strict_types=1);

$inicio = microtime(true);
$resultados = [];

for ($i = 1; $i <= 10; $i++) {
    $resultados[] = file_get_contents("https://httpbin.org/delay/1");
}

printf("Total: %.2fs%s", microtime(true) - $inicio, PHP_EOL);
printf("Recebidos: %d respostas%s", count($resultados), PHP_EOL);`,output:`Total: 10.41s
Recebidos: 10 respostas`}),e.jsxs("p",{children:["Agora a versão com ",e.jsx("strong",{children:"ReactPHP"}),": as 10 chamadas saem ao mesmo tempo, o event loop cuida de quem responder primeiro, e o tempo total cai para o tempo da chamada mais lenta."]}),e.jsx("h2",{children:"Instalando o ReactPHP"}),e.jsx(r,{user:"dev",host:"php",cwd:"~/projetos/async",command:"composer require react/event-loop react/http react/promise",output:`Using version ^1.5 for react/event-loop
Using version ^1.10 for react/http
Using version ^3.2 for react/promise
./composer.json has been updated
Running composer update react/event-loop react/http react/promise
Lock file operations: 7 installs, 0 updates, 0 removals
Writing lock file
Installing dependencies from lock file
Package operations: 7 installs, 0 updates, 0 removals`}),e.jsx(o,{filename:"paralelo.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use React\\Http\\Browser;
use function React\\Promise\\all;

$inicio  = microtime(true);
$browser = new Browser();

$promises = [];
for ($i = 1; $i <= 10; $i++) {
    $promises[] = $browser->get('https://httpbin.org/delay/1');
}

all($promises)->then(function (array $respostas) use ($inicio): void {
    printf("Total: %.2fs%s", microtime(true) - $inicio, PHP_EOL);
    printf("Recebidos: %d respostas%s", count($respostas), PHP_EOL);
});`,output:`Total: 1.18s
Recebidos: 10 respostas`}),e.jsxs(s,{type:"success",title:"10x mais rápido sem mexer em nada",children:["Mesma máquina, mesma rede, mesma API. A diferença é que o ReactPHP usa ",e.jsx("code",{children:"stream_select()"}),"para acompanhar dezenas de sockets simultaneamente em uma única thread."]}),e.jsx("h2",{children:"O coração: Loop e Promises"}),e.jsxs("p",{children:["Todo programa ReactPHP gira em torno de um ",e.jsx("strong",{children:"event loop"})," (a partir da versão 1.2, global e implícito). Você agenda trabalho — timers, leituras, promises — e o loop dispara callbacks quando cada coisa fica pronta."]}),e.jsx(o,{filename:"loop.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use React\\EventLoop\\Loop;

echo "antes do loop\\n";

Loop::addTimer(2.0, function (): void {
    echo "depois de 2s\\n";
});

Loop::addPeriodicTimer(0.5, function (): void {
    echo "tick\\n";
});

Loop::addTimer(2.5, function (): void {
    echo "fim\\n";
    Loop::stop();
});

echo "loop iniciando...\\n";`,output:`antes do loop
loop iniciando...
tick
tick
tick
depois de 2s
tick
fim`}),e.jsxs("p",{children:["Note: o loop começa ",e.jsx("em",{children:"automaticamente"})," ao final do script (desde 2021). Você nunca chama",e.jsx("code",{children:"Loop::run()"})," manualmente — só registra trabalho e o runtime cuida do resto."]}),e.jsx("h2",{children:"Promises: encadeando trabalho assíncrono"}),e.jsxs("p",{children:["Uma ",e.jsx("code",{children:"Promise"})," representa um valor que ainda não chegou. Você reage com"," ",e.jsx("code",{children:"->then($onSucesso, $onErro)"}),". É exatamente o mesmo modelo do JavaScript pré-async/await."]}),e.jsx(o,{filename:"promises.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use React\\Http\\Browser;

$browser = new Browser();

$browser->get('https://api.github.com/repos/reactphp/http')
    ->then(
        function (Psr\\Http\\Message\\ResponseInterface $resposta): void {
            $dados = json_decode((string) $resposta->getBody(), true);
            printf("repo: %s%s", $dados['full_name'], PHP_EOL);
            printf("estrelas: %d%s", $dados['stargazers_count'], PHP_EOL);
        },
        function (Throwable $erro): void {
            fwrite(STDERR, "falha: {$erro->getMessage()}\\n");
        },
    );`,output:`repo: reactphp/http
estrelas: 717`}),e.jsx("h2",{children:"Mini servidor HTTP em 12 linhas"}),e.jsxs("p",{children:["Com o pacote ",e.jsx("code",{children:"react/http"})," você sobe um servidor HTTP ",e.jsx("strong",{children:"sem nginx, sem PHP-FPM, sem Apache"}),". Ele atende milhares de conexões em uma única thread, igual Node."]}),e.jsx(o,{filename:"servidor.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use Psr\\Http\\Message\\ServerRequestInterface;
use React\\Http\\HttpServer;
use React\\Http\\Message\\Response;
use React\\Socket\\SocketServer;

$server = new HttpServer(function (ServerRequestInterface $req): Response {
    $nome = $req->getQueryParams()['nome'] ?? 'mundo';
    return Response::json(['ola' => $nome, 'pid' => getmypid()]);
});

$socket = new SocketServer('0.0.0.0:8080');
$server->listen($socket);

echo "servindo em http://0.0.0.0:8080\\n";`,output:"servindo em http://0.0.0.0:8080"}),e.jsx(r,{user:"dev",host:"php",cwd:"~/projetos/async",command:"php servidor.php",output:"servindo em http://0.0.0.0:8080"}),e.jsx(t,{url:"http://localhost:8080/?nome=Wallyson",children:e.jsx("pre",{style:{margin:0,fontFamily:"monospace"},children:`{
  "ola": "Wallyson",
  "pid": 41827
}`})}),e.jsxs(s,{type:"info",title:"O processo não morre entre requests",children:["Diferente do PHP tradicional (que cria um novo processo a cada hit), aqui o mesmo processo PHP atende centenas de requisições. O bootstrap caro (autoload, container, conexões) acontece ",e.jsx("em",{children:"uma vez só"}),". Por isso aplicações ReactPHP costumam ser 10–50× mais rápidas que FPM em throughput."]}),e.jsx("h2",{children:"Cuidado: nada pode bloquear"}),e.jsxs("p",{children:["A maior pegadinha do modelo de event loop é simples: ",e.jsx("strong",{children:"uma única função síncrona bloqueia tudo"}),". Se dentro de um handler você chamar ",e.jsx("code",{children:"sleep(2)"}),","," ",e.jsx("code",{children:"file_get_contents()"}),", ",e.jsx("code",{children:"PDO::query()"})," ou qualquer coisa nativa que espere I/O, o loop inteiro congela e nenhum outro request é atendido."]}),e.jsx(o,{filename:"bloqueio.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use Psr\\Http\\Message\\ServerRequestInterface;
use React\\Http\\HttpServer;
use React\\Http\\Message\\Response;
use React\\Socket\\SocketServer;

$server = new HttpServer(function (ServerRequestInterface $req): Response {
    sleep(3);
    return new Response(200, [], "ok\\n");
});

(new HttpServer(...))->listen(new SocketServer('0.0.0.0:8080'));`}),e.jsxs(s,{type:"danger",title:"Use sempre as alternativas async",children:["No lugar de ",e.jsx("code",{children:"sleep"})," use ",e.jsx("code",{children:"React\\\\Promise\\\\Timer\\\\sleep"}),". No lugar de PDO síncrono use ",e.jsx("code",{children:"react/mysql"})," ou ",e.jsx("code",{children:"clue/reactphp-pq"}),". No lugar de"," ",e.jsx("code",{children:"file_get_contents"})," use ",e.jsx("code",{children:"react/http"})," com ",e.jsx("code",{children:"Browser"}),"."]}),e.jsx("h2",{children:"Comparando com o Node.js"}),e.jsx("p",{children:"Conceitualmente, ReactPHP e Node.js são primos:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:["Mesma ideia de ",e.jsx("strong",{children:"event loop single-threaded"}),"."]}),e.jsxs("li",{children:["Mesmo modelo de ",e.jsx("strong",{children:"callbacks → promises → async/await"}),"."]}),e.jsxs("li",{children:[e.jsx("code",{children:"react/http"})," ↔ ",e.jsx("code",{children:"http"})," nativo do Node."]}),e.jsxs("li",{children:[e.jsx("code",{children:"react/socket"})," ↔ ",e.jsx("code",{children:"net"})," do Node."]}),e.jsxs("li",{children:[e.jsx("code",{children:"react/dns"})," ↔ ",e.jsx("code",{children:"dns"})," do Node."]}),e.jsx("li",{children:"Promises do React seguem A+, igual JS."})]}),e.jsxs("p",{children:["A grande diferença histórica era o ",e.jsx("code",{children:"async/await"}),". Com ",e.jsx("strong",{children:"PHP 8.1+ e Fibers"}),", bibliotecas como ",e.jsx("code",{children:"amphp/amp v3"})," e ",e.jsx("code",{children:"react/async"})," finalmente trouxeram sintaxe quase idêntica:"]}),e.jsx(o,{filename:"async-await.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use React\\Http\\Browser;
use function React\\Async\\async;
use function React\\Async\\await;

$browser = new Browser();

async(function () use ($browser): void {
    $a = await($browser->get('https://httpbin.org/uuid'));
    $b = await($browser->get('https://httpbin.org/uuid'));

    echo (string) $a->getBody();
    echo (string) $b->getBody();
})();`,output:`{"uuid":"3b6c1ad2-7cf5-4b3f-b2b4-1ad3e98f1234"}
{"uuid":"a91e7f42-22b3-4d5a-bb20-7ce38b1f2c11"}`}),e.jsxs("p",{children:["Por baixo, o ",e.jsx("code",{children:"await()"})," usa ",e.jsx("strong",{children:"Fibers"})," para pausar o callback sem bloquear o loop — sintaxe linear, comportamento assíncrono, zero retorno-de-callback-aninhado."]}),e.jsx("h2",{children:"composer.json mínimo de um projeto async"}),e.jsx(n,{language:"json",code:`{
  "require": {
    "php": "^8.2",
    "react/event-loop": "^1.5",
    "react/http": "^1.10",
    "react/promise": "^3.2",
    "react/async": "^4.3"
  },
  "autoload": {
    "psr-4": { "App\\\\": "src/" }
  }
}`}),e.jsxs(s,{type:"warning",title:"Quando NÃO usar ReactPHP",children:["Se sua aplicação é uma típica web app CRUD com PHP-FPM e nginx, o ganho é zero — o gargalo não é o bootstrap. ReactPHP brilha em: ",e.jsx("strong",{children:"microsserviços com muitas chamadas externas, gateways, scrapers paralelos, workers de fila persistentes, WebSocket servers"}),"."]}),e.jsxs("p",{children:["No próximo capítulo a gente sai do mundo async e cai em ",e.jsx("strong",{children:"testes automatizados com PHPUnit"})," — porque código assíncrono ",e.jsx("em",{children:"sem teste"})," é uma das maiores fontes de race conditions no ecossistema PHP."]})]})}export{m as default};
