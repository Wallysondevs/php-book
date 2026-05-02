import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Fibers() {
  return (
    <PageContainer
      title="Fibers (PHP 8.1)"
      subtitle="Concorrência cooperativa em PHP puro: pause e retome execuções no meio do código sem threads, sem callbacks aninhados — a base sobre a qual amphp/amp e revolt/event-loop foram reescritos."
      difficulty="avancado"
      timeToRead="13 min"
      category="Async & Fibers"
    >
      <h2>O problema: 4 chamadas HTTP que somam 4 segundos</h2>
      <p>
        Você precisa buscar dados de quatro APIs. Cada chamada leva 1 segundo. Em código
        síncrono, o total é <strong>4 segundos</strong> — uma após a outra. Em qualquer
        linguagem moderna você consegue rodar as quatro em paralelo (concorrência) e terminar em
        ~1 segundo. PHP, até a versão 8.0, exigia callbacks aninhados de bibliotecas como ReactPHP.
        O <strong>Fiber</strong> (PHP 8.1) deu ao PHP a primitiva nativa para isso.
      </p>

      <PhpBlock
        filename="sequencial.php"
        code={`<?php
declare(strict_types=1);

function buscar(string $url): string
{
    sleep(1); // simula I/O
    return "ok: $url";
}

$ini = hrtime(true);
$resultados = [
    buscar('/api/a'),
    buscar('/api/b'),
    buscar('/api/c'),
    buscar('/api/d'),
];
printf("Tempo: %.2f s\\n", (hrtime(true) - $ini) / 1e9);
print_r($resultados);`}
        output={`Tempo: 4.01 s
Array
(
    [0] => ok: /api/a
    [1] => ok: /api/b
    [2] => ok: /api/c
    [3] => ok: /api/d
)`}
      />

      <h2>O que é uma Fiber, em uma frase</h2>
      <p>
        Uma <strong>Fiber</strong> é uma “função pausável” — ela roda até bater num{" "}
        <code>Fiber::suspend()</code>, devolve o controle pra quem chamou, e pode ser retomada
        depois com <code>$fiber-&gt;resume()</code>. Não é thread, não é processo: é{" "}
        <strong>cooperação</strong>. Quem decide quando trocar de tarefa é o seu código.
      </p>

      <AlertBox type="info" title="Fiber NÃO é thread">
        Fibers rodam <strong>no mesmo processo, no mesmo núcleo, em uma única thread</strong>. O
        ganho não vem de paralelismo de CPU — vem de aproveitar o tempo de espera de I/O (banco,
        rede, disco) para fazer outra coisa.
      </AlertBox>

      <h2>Hello, Fiber: start, suspend, resume</h2>
      <p>
        A API tem três métodos centrais. <code>start()</code> roda a fiber até o primeiro{" "}
        <code>suspend()</code>, devolvendo o que ela passou pra suspender. <code>resume()</code>{" "}
        retoma a fiber e pode injetar um valor que aparece como retorno do <code>suspend()</code>
        anterior.
      </p>

      <PhpBlock
        filename="hello.php"
        code={`<?php
declare(strict_types=1);

$f = new Fiber(function (): void {
    echo "[fiber] iniciei" . PHP_EOL;
    $extra = Fiber::suspend('preciso de algo');
    echo "[fiber] retomei com: $extra" . PHP_EOL;
    Fiber::suspend('quase lá');
    echo "[fiber] terminei" . PHP_EOL;
});

$pediu = $f->start();
echo "[main]  fiber pediu: $pediu" . PHP_EOL;

$pediu = $f->resume('ok!');
echo "[main]  fiber pediu: $pediu" . PHP_EOL;

$f->resume();`}
        output={`[fiber] iniciei
[main]  fiber pediu: preciso de algo
[fiber] retomei com: ok!
[main]  fiber pediu: quase lá
[fiber] terminei`}
      />

      <h2>Fiber x Generator: qual a diferença?</h2>
      <p>
        Generators (<code>yield</code>) também pausam e retomam. A diferença crítica é{" "}
        <strong>de onde</strong> você pode pausar. <code>yield</code> só funciona dentro da própria
        função geradora — você não consegue pausar do fundo de uma função chamada por ela.{" "}
        <code>Fiber::suspend()</code> pode ser chamado de <strong>qualquer profundidade</strong> da
        pilha de chamadas dentro da fiber. Isso é o que torna possível um cliente HTTP assíncrono
        usado de forma totalmente síncrona.
      </p>

      <PhpBlock
        filename="profundidade.php"
        code={`<?php
declare(strict_types=1);

function nivelB(): void
{
    Fiber::suspend('do fundo da pilha');
    echo "[fiber] nivelB voltou" . PHP_EOL;
}

function nivelA(): void
{
    nivelB();
}

$f = new Fiber('nivelA');
$enviado = $f->start();
echo "[main] recebeu: $enviado" . PHP_EOL;
$f->resume();`}
        output={`[main] recebeu: do fundo da pilha
[fiber] nivelB voltou`}
      />

      <h2>Scheduler simples: rodando 4 tarefas “em paralelo”</h2>
      <p>
        Com Fibers + um laço que reveza quem está pronto, dá pra construir um mini-scheduler
        cooperativo. A versão abaixo simula 4 buscas que levavam 4s na sequência e termina em
        ~1s — porque enquanto uma “espera”, as outras avançam.
      </p>

      <PhpBlock
        filename="scheduler.php"
        code={`<?php
declare(strict_types=1);

/**
 * Simula uma chamada de I/O. No mundo real, este 'usleep' seria
 * substituído por leitura non-blocking de um socket via stream_select().
 */
function buscarAsync(string $url): string
{
    Fiber::suspend(); // devolve controle ao scheduler
    return "ok: $url";
}

$inicio = hrtime(true);

$tarefas = [];
foreach (['/api/a', '/api/b', '/api/c', '/api/d'] as $url) {
    $tarefas[] = new Fiber(fn () => print(buscarAsync($url) . PHP_EOL));
}

// Inicia todas até o primeiro suspend.
foreach ($tarefas as $t) $t->start();

// "Espera" de 1 segundo aconteceria aqui no event-loop real.
usleep(1_000_000);

// Retoma todas para finalizarem.
foreach ($tarefas as $t) {
    if (!$t->isTerminated()) $t->resume();
}

printf("Tempo: %.2f s\\n", (hrtime(true) - $inicio) / 1e9);`}
        output={`ok: /api/a
ok: /api/b
ok: /api/c
ok: /api/d
Tempo: 1.00 s`}
      />

      <AlertBox type="warning" title="Por que isso parece milagre?">
        Não é. O ganho real depende de <em>I/O não bloqueante</em> (streams em modo{" "}
        <code>stream_set_blocking(false)</code>, sockets assíncronos). Aqui simulamos com{" "}
        <code>usleep</code> só pra ilustrar o <em>shape</em> do código. Em produção, use{" "}
        <code>revolt/event-loop</code> ou <code>amphp/amp</code>.
      </AlertBox>

      <h2>O ciclo completo: getReturn(), isSuspended(), isTerminated()</h2>
      <p>
        A fiber tem um conjunto de métodos para inspecionar e coletar o resultado final, devolvido
        com <code>return</code> normal:
      </p>

      <PhpBlock
        filename="ciclo.php"
        code={`<?php
declare(strict_types=1);

$f = new Fiber(function (): int {
    Fiber::suspend();
    Fiber::suspend();
    return 42;
});

echo "iniciada?   " . var_export($f->isStarted(), true) . PHP_EOL;
$f->start();
echo "suspensa?   " . var_export($f->isSuspended(), true) . PHP_EOL;
$f->resume();
$f->resume();
echo "terminou?   " . var_export($f->isTerminated(), true) . PHP_EOL;
echo "retorno:    " . $f->getReturn() . PHP_EOL;`}
        output={`iniciada?   false
suspensa?   true
terminou?   true
retorno:    42`}
      />

      <h2>O ecossistema real: Revolt e Amp</h2>
      <p>
        Você raramente vai escrever um scheduler na unha. As bibliotecas{" "}
        <code>revolt/event-loop</code> (event-loop padrão) e <code>amphp/amp</code> (toolkit
        completo: HTTP client, MySQL, Redis, processos) fazem isso por você.
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/async"
        command="composer require amphp/http-client revolt/event-loop"
        output={`Using version ^5.0 for amphp/http-client
Using version ^1.0 for revolt/event-loop
Generating autoload files`}
      />

      <PhpBlock
        filename="amphp_http.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use Amp\\Http\\Client\\HttpClientBuilder;
use Amp\\Http\\Client\\Request;
use function Amp\\async;
use function Amp\\Future\\await;

$cliente = HttpClientBuilder::buildDefault();

$urls = [
    'https://httpbin.org/delay/1',
    'https://httpbin.org/delay/1',
    'https://httpbin.org/delay/1',
    'https://httpbin.org/delay/1',
];

$ini = hrtime(true);

$futuros = array_map(
    fn (string $url) => async(fn () => $cliente->request(new Request($url))->getStatus()),
    $urls,
);

$status = await($futuros);

printf("Tempo: %.2f s\\n", (hrtime(true) - $ini) / 1e9);
print_r($status);`}
        output={`Tempo: 1.18 s
Array
(
    [0] => 200
    [1] => 200
    [2] => 200
    [3] => 200
)`}
      />

      <p>
        O <code>async()</code> empacota cada operação em uma fiber gerenciada pelo event-loop do
        Revolt. <code>await()</code> espera todas terminarem. Por baixo dos panos é exatamente
        Fiber + <code>stream_select</code> não bloqueante.
      </p>

      <h2>Quando usar Fibers (e quando NÃO usar)</h2>
      <ul>
        <li>
          <strong>Use</strong> quando o gargalo é I/O: várias chamadas HTTP, várias queries em
          bancos diferentes, leitura de múltiplos arquivos remotos, workers que escutam filas.
        </li>
        <li>
          <strong>Use</strong> quando precisar de servidores de longa duração (Roadrunner, Swoole,
          AMPHP HTTP Server) onde uma request espera I/O e outra pode avançar.
        </li>
        <li>
          <strong>Não use</strong> para acelerar cálculo puro (CPU bound). Para isso o caminho são
          processos via <code>pcntl_fork</code> ou extensões como <code>parallel</code>.
        </li>
        <li>
          <strong>Não use</strong> em request comum atrás do PHP-FPM se você não tem rotas com
          múltiplas chamadas de I/O — overhead não compensa.
        </li>
      </ul>

      <h2>Estrutura de um composer.json para o exemplo</h2>
      <CodeBlock
        language="json"
        title="composer.json"
        code={`{
  "require": {
    "php": "^8.4",
    "amphp/http-client": "^5.0",
    "revolt/event-loop": "^1.0"
  }
}`}
      />

      <AlertBox type="danger" title="Cuidado com código bloqueante dentro de fiber">
        Se você chamar <code>file_get_contents()</code>, <code>PDO</code> síncrono ou{" "}
        <code>sleep()</code> dentro de uma fiber, ela <strong>congela todas as outras</strong>. O
        ecossistema async oferece equivalentes não-bloqueantes (<code>amphp/file</code>,{" "}
        <code>amphp/mysql</code>, <code>amphp/redis</code>) — use-os.
      </AlertBox>

      <h2>Rodando o scheduler</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/fibers"
        command="php scheduler.php"
        output={`ok: /api/a
ok: /api/b
ok: /api/c
ok: /api/d
Tempo: 1.00 s`}
      />

      <p>
        Pronto: você agora entende a primitiva que reorganizou todo o ecossistema async do PHP.
        A partir do 8.1, escrever código concorrente não exige mais aninhar callbacks — basta
        suspender e retomar.
      </p>
    </PageContainer>
  );
}
