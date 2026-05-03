import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { BrowserBlock } from "@/components/ui/BrowserBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Reactphp() {
  return (
    <PageContainer
      title="ReactPHP — event loop"
      subtitle="PHP assíncrono de verdade: um event loop em cima de stream_select, promises e I/O não-bloqueante. O mesmo modelo que faz o Node.js voar, agora dentro do seu PHP 8.4."
      difficulty="avancado"
      timeToRead="13 min"
      category="Async & Fibers"
    >
      <AlertBox type="info" title="Pré-requisitos">
          <p>Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP.</p>
        </AlertBox>
        <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"Event loop"}</strong> {' — '} {"núcleo single-thread que despacha I/O sem bloquear."}
          </li>
        <li>
            <strong>{"Promise"}</strong> {' — '} {"representa valor futuro; .then encadeia."}
          </li>
        <li>
            <strong>{"Streams"}</strong> {' — '} {"leitura/escrita não-bloqueante."}
          </li>
        <li>
            <strong>{"vs PHP-FPM"}</strong> {' — '} {"long-running em vez de spawn-die por request."}
          </li>
        <li>
            <strong>{"Casos de uso"}</strong> {' — '} {"WebSockets, microservices push, jobs em background."}
          </li>
        </ul>
          <h2>O problema: 10 chamadas HTTP que demoram uma eternidade</h2>
      <p>
        Imagine que você precisa consultar 10 APIs externas e juntar os resultados. Em PHP síncrono
        clássico, cada chamada bloqueia a próxima. Se cada uma leva 1 segundo, você espera 10 segundos
        em série. Não tem CPU envolvida — é tudo I/O, esperando o socket responder.
      </p>

      <PhpBlock
        filename="sincrono.php"
        code={`<?php
declare(strict_types=1);

$inicio = microtime(true);
$resultados = [];

for ($i = 1; $i <= 10; $i++) {
    $resultados[] = file_get_contents("https://httpbin.org/delay/1");
}

printf("Total: %.2fs%s", microtime(true) - $inicio, PHP_EOL);
printf("Recebidos: %d respostas%s", count($resultados), PHP_EOL);`}
        output={`Total: 10.41s
Recebidos: 10 respostas`}
      />

      <p>
        Agora a versão com <strong>ReactPHP</strong>: as 10 chamadas saem ao mesmo tempo, o event loop
        cuida de quem responder primeiro, e o tempo total cai para o tempo da chamada mais lenta.
      </p>

      <h2>Instalando o ReactPHP</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/async"
        command="composer require react/event-loop react/http react/promise"
        output={`Using version ^1.5 for react/event-loop
Using version ^1.10 for react/http
Using version ^3.2 for react/promise
./composer.json has been updated
Running composer update react/event-loop react/http react/promise
Lock file operations: 7 installs, 0 updates, 0 removals
Writing lock file
Installing dependencies from lock file
Package operations: 7 installs, 0 updates, 0 removals`}
      />

      <PhpBlock
        filename="paralelo.php"
        code={`<?php
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
});`}
        output={`Total: 1.18s
Recebidos: 10 respostas`}
      />

      <AlertBox type="success" title="10x mais rápido sem mexer em nada">
        Mesma máquina, mesma rede, mesma API. A diferença é que o ReactPHP usa <code>stream_select()</code>
        para acompanhar dezenas de sockets simultaneamente em uma única thread.
      </AlertBox>

      <h2>O coração: Loop e Promises</h2>
      <p>
        Todo programa ReactPHP gira em torno de um <strong>event loop</strong> (a partir da versão 1.2,
        global e implícito). Você agenda trabalho — timers, leituras, promises — e o loop dispara
        callbacks quando cada coisa fica pronta.
      </p>

      <PhpBlock
        filename="loop.php"
        code={`<?php
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

echo "loop iniciando...\\n";`}
        output={`antes do loop
loop iniciando...
tick
tick
tick
depois de 2s
tick
fim`}
      />

      <p>
        Note: o loop começa <em>automaticamente</em> ao final do script (desde 2021). Você nunca chama
        <code>Loop::run()</code> manualmente — só registra trabalho e o runtime cuida do resto.
      </p>

      <h2>Promises: encadeando trabalho assíncrono</h2>
      <p>
        Uma <code>Promise</code> representa um valor que ainda não chegou. Você reage com{" "}
        <code>{`->then($onSucesso, $onErro)`}</code>. É exatamente o mesmo modelo do JavaScript pré-async/await.
      </p>

      <PhpBlock
        filename="promises.php"
        code={`<?php
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
    );`}
        output={`repo: reactphp/http
estrelas: 717`}
      />

      <h2>Mini servidor HTTP em 12 linhas</h2>
      <p>
        Com o pacote <code>react/http</code> você sobe um servidor HTTP <strong>sem nginx, sem PHP-FPM,
        sem Apache</strong>. Ele atende milhares de conexões em uma única thread, igual Node.
      </p>

      <PhpBlock
        filename="servidor.php"
        code={`<?php
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

echo "servindo em http://0.0.0.0:8080\\n";`}
        output={`servindo em http://0.0.0.0:8080`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/async"
        command="php servidor.php"
        output={`servindo em http://0.0.0.0:8080`}
      />

      <BrowserBlock url="http://localhost:8080/?nome=Wallyson">
        <pre style={{ margin: 0, fontFamily: "monospace" }}>{`{
  "ola": "Wallyson",
  "pid": 41827
}`}</pre>
      </BrowserBlock>

      <AlertBox type="info" title="O processo não morre entre requests">
        Diferente do PHP tradicional (que cria um novo processo a cada hit), aqui o mesmo processo PHP
        atende centenas de requisições. O bootstrap caro (autoload, container, conexões) acontece <em>uma vez só</em>.
        Por isso aplicações ReactPHP costumam ser 10–50× mais rápidas que FPM em throughput.
      </AlertBox>

      <h2>Cuidado: nada pode bloquear</h2>
      <p>
        A maior pegadinha do modelo de event loop é simples: <strong>uma única função síncrona
        bloqueia tudo</strong>. Se dentro de um handler você chamar <code>sleep(2)</code>,{" "}
        <code>file_get_contents()</code>, <code>PDO::query()</code> ou qualquer coisa nativa que espere I/O,
        o loop inteiro congela e nenhum outro request é atendido.
      </p>

      <PhpBlock
        filename="bloqueio.php"
        code={`<?php
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

(new HttpServer(...))->listen(new SocketServer('0.0.0.0:8080'));`}
      />

      <AlertBox type="danger" title="Use sempre as alternativas async">
        No lugar de <code>sleep</code> use <code>React\\Promise\\Timer\\sleep</code>. No lugar de PDO
        síncrono use <code>react/mysql</code> ou <code>clue/reactphp-pq</code>. No lugar de{" "}
        <code>file_get_contents</code> use <code>react/http</code> com <code>Browser</code>.
      </AlertBox>

      <h2>Comparando com o Node.js</h2>
      <p>
        Conceitualmente, ReactPHP e Node.js são primos:
      </p>
      <ul>
        <li>Mesma ideia de <strong>event loop single-threaded</strong>.</li>
        <li>Mesmo modelo de <strong>callbacks → promises → async/await</strong>.</li>
        <li><code>react/http</code> ↔ <code>http</code> nativo do Node.</li>
        <li><code>react/socket</code> ↔ <code>net</code> do Node.</li>
        <li><code>react/dns</code> ↔ <code>dns</code> do Node.</li>
        <li>Promises do React seguem A+, igual JS.</li>
      </ul>

      <p>
        A grande diferença histórica era o <code>async/await</code>. Com <strong>PHP 8.1+ e Fibers</strong>,
        bibliotecas como <code>amphp/amp v3</code> e <code>react/async</code> finalmente trouxeram
        sintaxe quase idêntica:
      </p>

      <PhpBlock
        filename="async-await.php"
        code={`<?php
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
})();`}
        output={`{"uuid":"3b6c1ad2-7cf5-4b3f-b2b4-1ad3e98f1234"}
{"uuid":"a91e7f42-22b3-4d5a-bb20-7ce38b1f2c11"}`}
      />

      <p>
        Por baixo, o <code>await()</code> usa <strong>Fibers</strong> para pausar o callback sem bloquear o
        loop — sintaxe linear, comportamento assíncrono, zero retorno-de-callback-aninhado.
      </p>

      <h2>composer.json mínimo de um projeto async</h2>
      <CodeBlock
        language="json"
        code={`{
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
}`}
      />

      <AlertBox type="warning" title="Quando NÃO usar ReactPHP">
        Se sua aplicação é uma típica web app CRUD com PHP-FPM e nginx, o ganho é zero — o gargalo
        não é o bootstrap. ReactPHP brilha em: <strong>microsserviços com muitas chamadas externas,
        gateways, scrapers paralelos, workers de fila persistentes, WebSocket servers</strong>.
      </AlertBox>

      <p>
        No próximo capítulo a gente sai do mundo async e cai em <strong>testes automatizados com PHPUnit</strong> —
        porque código assíncrono <em>sem teste</em> é uma das maiores fontes de race conditions no
        ecossistema PHP.
      </p>
    </PageContainer>
  );
}
