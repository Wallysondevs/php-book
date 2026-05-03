import{j as e}from"./index-B5-q-eol.js";import{P as s,A as o,a as r}from"./AlertBox-CVbFLZEd.js";import{T as a}from"./TerminalBlock-6fqVIX2R.js";import{C as i}from"./CodeBlock-B36pQ_ak.js";function l(){return e.jsxs(s,{title:"Fibers (PHP 8.1)",subtitle:"Concorrência cooperativa em PHP puro: pause e retome execuções no meio do código sem threads, sem callbacks aninhados — a base sobre a qual amphp/amp e revolt/event-loop foram reescritos.",difficulty:"avancado",timeToRead:"13 min",category:"Async & Fibers",children:[e.jsx(o,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Fiber (8.1)"})," "," — "," ","co-rotina: bloco que pode pausar/retomar manualmente."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"suspend()"})," "," — "," ","devolve controle para quem iniciou; retorna na próxima resume."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"vs Generator"})," "," — "," ","fiber pode pausar de qualquer profundidade da call stack."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Uso"})," "," — "," ","base de loops async (ReactPHP, Amp, Revolt)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"start/resume/getReturn"})," "," — "," ","API para controlar a fibra do lado de fora."]})]}),e.jsx("h2",{children:"O problema: 4 chamadas HTTP que somam 4 segundos"}),e.jsxs("p",{children:["Você precisa buscar dados de quatro APIs. Cada chamada leva 1 segundo. Em código síncrono, o total é ",e.jsx("strong",{children:"4 segundos"})," — uma após a outra. Em qualquer linguagem moderna você consegue rodar as quatro em paralelo (concorrência) e terminar em ~1 segundo. PHP, até a versão 8.0, exigia callbacks aninhados de bibliotecas como ReactPHP. O ",e.jsx("strong",{children:"Fiber"})," (PHP 8.1) deu ao PHP a primitiva nativa para isso."]}),e.jsx(r,{filename:"sequencial.php",code:`<?php
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
print_r($resultados);`,output:`Tempo: 4.01 s
Array
(
    [0] => ok: /api/a
    [1] => ok: /api/b
    [2] => ok: /api/c
    [3] => ok: /api/d
)`}),e.jsx("h2",{children:"O que é uma Fiber, em uma frase"}),e.jsxs("p",{children:["Uma ",e.jsx("strong",{children:"Fiber"})," é uma “função pausável” — ela roda até bater num"," ",e.jsx("code",{children:"Fiber::suspend()"}),", devolve o controle pra quem chamou, e pode ser retomada depois com ",e.jsx("code",{children:"$fiber->resume()"}),". Não é thread, não é processo: é"," ",e.jsx("strong",{children:"cooperação"}),". Quem decide quando trocar de tarefa é o seu código."]}),e.jsxs(o,{type:"info",title:"Fiber NÃO é thread",children:["Fibers rodam ",e.jsx("strong",{children:"no mesmo processo, no mesmo núcleo, em uma única thread"}),". O ganho não vem de paralelismo de CPU — vem de aproveitar o tempo de espera de I/O (banco, rede, disco) para fazer outra coisa."]}),e.jsx("h2",{children:"Hello, Fiber: start, suspend, resume"}),e.jsxs("p",{children:["A API tem três métodos centrais. ",e.jsx("code",{children:"start()"})," roda a fiber até o primeiro"," ",e.jsx("code",{children:"suspend()"}),", devolvendo o que ela passou pra suspender. ",e.jsx("code",{children:"resume()"})," ","retoma a fiber e pode injetar um valor que aparece como retorno do ",e.jsx("code",{children:"suspend()"}),"anterior."]}),e.jsx(r,{filename:"hello.php",code:`<?php
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

$f->resume();`,output:`[fiber] iniciei
[main]  fiber pediu: preciso de algo
[fiber] retomei com: ok!
[main]  fiber pediu: quase lá
[fiber] terminei`}),e.jsx("h2",{children:"Fiber x Generator: qual a diferença?"}),e.jsxs("p",{children:["Generators (",e.jsx("code",{children:"yield"}),") também pausam e retomam. A diferença crítica é"," ",e.jsx("strong",{children:"de onde"})," você pode pausar. ",e.jsx("code",{children:"yield"})," só funciona dentro da própria função geradora — você não consegue pausar do fundo de uma função chamada por ela."," ",e.jsx("code",{children:"Fiber::suspend()"})," pode ser chamado de ",e.jsx("strong",{children:"qualquer profundidade"})," da pilha de chamadas dentro da fiber. Isso é o que torna possível um cliente HTTP assíncrono usado de forma totalmente síncrona."]}),e.jsx(r,{filename:"profundidade.php",code:`<?php
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
$f->resume();`,output:`[main] recebeu: do fundo da pilha
[fiber] nivelB voltou`}),e.jsx("h2",{children:"Scheduler simples: rodando 4 tarefas “em paralelo”"}),e.jsx("p",{children:"Com Fibers + um laço que reveza quem está pronto, dá pra construir um mini-scheduler cooperativo. A versão abaixo simula 4 buscas que levavam 4s na sequência e termina em ~1s — porque enquanto uma “espera”, as outras avançam."}),e.jsx(r,{filename:"scheduler.php",code:`<?php
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

printf("Tempo: %.2f s\\n", (hrtime(true) - $inicio) / 1e9);`,output:`ok: /api/a
ok: /api/b
ok: /api/c
ok: /api/d
Tempo: 1.00 s`}),e.jsxs(o,{type:"warning",title:"Por que isso parece milagre?",children:["Não é. O ganho real depende de ",e.jsx("em",{children:"I/O não bloqueante"})," (streams em modo"," ",e.jsx("code",{children:"stream_set_blocking(false)"}),", sockets assíncronos). Aqui simulamos com"," ",e.jsx("code",{children:"usleep"})," só pra ilustrar o ",e.jsx("em",{children:"shape"})," do código. Em produção, use"," ",e.jsx("code",{children:"revolt/event-loop"})," ou ",e.jsx("code",{children:"amphp/amp"}),"."]}),e.jsx("h2",{children:"O ciclo completo: getReturn(), isSuspended(), isTerminated()"}),e.jsxs("p",{children:["A fiber tem um conjunto de métodos para inspecionar e coletar o resultado final, devolvido com ",e.jsx("code",{children:"return"})," normal:"]}),e.jsx(r,{filename:"ciclo.php",code:`<?php
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
echo "retorno:    " . $f->getReturn() . PHP_EOL;`,output:`iniciada?   false
suspensa?   true
terminou?   true
retorno:    42`}),e.jsx("h2",{children:"O ecossistema real: Revolt e Amp"}),e.jsxs("p",{children:["Você raramente vai escrever um scheduler na unha. As bibliotecas"," ",e.jsx("code",{children:"revolt/event-loop"})," (event-loop padrão) e ",e.jsx("code",{children:"amphp/amp"})," (toolkit completo: HTTP client, MySQL, Redis, processos) fazem isso por você."]}),e.jsx(a,{user:"dev",host:"php",cwd:"~/async",command:"composer require amphp/http-client revolt/event-loop",output:`Using version ^5.0 for amphp/http-client
Using version ^1.0 for revolt/event-loop
Generating autoload files`}),e.jsx(r,{filename:"amphp_http.php",code:`<?php
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
print_r($status);`,output:`Tempo: 1.18 s
Array
(
    [0] => 200
    [1] => 200
    [2] => 200
    [3] => 200
)`}),e.jsxs("p",{children:["O ",e.jsx("code",{children:"async()"})," empacota cada operação em uma fiber gerenciada pelo event-loop do Revolt. ",e.jsx("code",{children:"await()"})," espera todas terminarem. Por baixo dos panos é exatamente Fiber + ",e.jsx("code",{children:"stream_select"})," não bloqueante."]}),e.jsx("h2",{children:"Quando usar Fibers (e quando NÃO usar)"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Use"})," quando o gargalo é I/O: várias chamadas HTTP, várias queries em bancos diferentes, leitura de múltiplos arquivos remotos, workers que escutam filas."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Use"})," quando precisar de servidores de longa duração (Roadrunner, Swoole, AMPHP HTTP Server) onde uma request espera I/O e outra pode avançar."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Não use"})," para acelerar cálculo puro (CPU bound). Para isso o caminho são processos via ",e.jsx("code",{children:"pcntl_fork"})," ou extensões como ",e.jsx("code",{children:"parallel"}),"."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Não use"})," em request comum atrás do PHP-FPM se você não tem rotas com múltiplas chamadas de I/O — overhead não compensa."]})]}),e.jsx("h2",{children:"Estrutura de um composer.json para o exemplo"}),e.jsx(i,{language:"json",title:"composer.json",code:`{
  "require": {
    "php": "^8.4",
    "amphp/http-client": "^5.0",
    "revolt/event-loop": "^1.0"
  }
}`}),e.jsxs(o,{type:"danger",title:"Cuidado com código bloqueante dentro de fiber",children:["Se você chamar ",e.jsx("code",{children:"file_get_contents()"}),", ",e.jsx("code",{children:"PDO"})," síncrono ou"," ",e.jsx("code",{children:"sleep()"})," dentro de uma fiber, ela ",e.jsx("strong",{children:"congela todas as outras"}),". O ecossistema async oferece equivalentes não-bloqueantes (",e.jsx("code",{children:"amphp/file"}),","," ",e.jsx("code",{children:"amphp/mysql"}),", ",e.jsx("code",{children:"amphp/redis"}),") — use-os."]}),e.jsx("h2",{children:"Rodando o scheduler"}),e.jsx(a,{user:"dev",host:"php",cwd:"~/fibers",command:"php scheduler.php",output:`ok: /api/a
ok: /api/b
ok: /api/c
ok: /api/d
Tempo: 1.00 s`}),e.jsx("p",{children:"Pronto: você agora entende a primitiva que reorganizou todo o ecossistema async do PHP. A partir do 8.1, escrever código concorrente não exige mais aninhar callbacks — basta suspender e retomar."})]})}export{l as default};
