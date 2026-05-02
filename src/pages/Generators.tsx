import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Generators() {
  return (
    <PageContainer
      title="Generators (yield)"
      subtitle="A forma mais elegante de iterar sem alocar memória: funções que pausam no yield, devolvem um valor por vez e retomam de onde pararam."
      difficulty="avancado"
      timeToRead="13 min"
      category="SPL & Iteradores"
    >
      <h2>O problema: array gigante = RAM gigante</h2>
      <p>
        Suponha que você precisa processar um log de 5 GB. A abordagem ingênua —{" "}
        <code>file($caminho)</code> — carrega tudo na memória e mata o processo com{" "}
        <em>“Allowed memory size exhausted”</em>. <strong>Generators</strong> resolvem isso
        entregando uma linha por vez, sem nunca segurar todas ao mesmo tempo.
      </p>

      <PhpBlock
        filename="ingenuo.php"
        code={`<?php
declare(strict_types=1);

ini_set('memory_limit', '32M');

$linhas = file('/var/log/acesso.log'); // carrega 5 GB de uma vez
foreach ($linhas as $l) {
    // processar...
}`}
        output={`PHP Fatal error: Allowed memory size of 33554432 bytes exhausted
(tried to allocate 5368709120 bytes)`}
      />

      <h2>A solução: yield linha-a-linha</h2>
      <p>
        Toda função que contém a palavra-chave <code>yield</code> deixa de “rodar até o fim” e vira
        um <strong>Generator</strong>. Cada <code>yield</code> entrega um valor e <em>congela</em> o
        estado da função; na próxima iteração, ela retoma exatamente de onde parou.
      </p>

      <PhpBlock
        filename="ler_arquivo.php"
        code={`<?php
declare(strict_types=1);

ini_set('memory_limit', '32M');

function lerLinhas(string $caminho): Generator
{
    $f = fopen($caminho, 'rb');
    try {
        while (($linha = fgets($f)) !== false) {
            yield rtrim($linha);
        }
    } finally {
        fclose($f);
    }
}

$total = 0;
foreach (lerLinhas('/var/log/acesso.log') as $linha) {
    if (str_contains($linha, ' 500 ')) {
        $total++;
    }
}

echo "Erros 500: $total" . PHP_EOL;
echo "Pico de memória: " . round(memory_get_peak_usage(true) / 1024 / 1024, 2) . " MB" . PHP_EOL;`}
        output={`Erros 500: 412
Pico de memória: 2.00 MB`}
      />

      <AlertBox type="success" title="Por que isso é mágico">
        Mesmo lendo um arquivo de gigabytes, o pico de memória fica praticamente constante. O
        generator só guarda <em>uma linha</em> por vez, não a coleção inteira.
      </AlertBox>

      <h2>Sintaxe básica: yield $valor e yield $chave =&gt; $valor</h2>
      <p>
        <code>yield</code> sozinho gera valores com chaves automáticas (0, 1, 2…). Use{" "}
        <code>yield $chave =&gt; $valor</code> para personalizar a chave, igual a um array
        associativo:
      </p>

      <PhpBlock
        filename="basico.php"
        code={`<?php
declare(strict_types=1);

function intervalo(int $de, int $ate): Generator
{
    for ($i = $de; $i <= $ate; $i++) {
        yield $i;
    }
}

function dicionario(): Generator
{
    yield 'php'  => 'Hypertext Preprocessor';
    yield 'http' => 'HyperText Transfer Protocol';
    yield 'json' => 'JavaScript Object Notation';
}

foreach (intervalo(1, 3) as $k => $v) {
    echo "[$k] $v" . PHP_EOL;
}

foreach (dicionario() as $sigla => $significado) {
    echo "$sigla = $significado" . PHP_EOL;
}`}
        output={`[0] 1
[1] 2
[2] 3
php = Hypertext Preprocessor
http = HyperText Transfer Protocol
json = JavaScript Object Notation`}
      />

      <h2>Generators infinitos</h2>
      <p>
        Como o generator só produz sob demanda, você pode criar sequências <em>infinitas</em> sem
        explodir nada. Quem decide quando parar é quem consome (com <code>break</code> ou{" "}
        <code>LimitIterator</code>):
      </p>

      <PhpBlock
        filename="fibonacci.php"
        code={`<?php
declare(strict_types=1);

function fibonacci(): Generator
{
    [$a, $b] = [0, 1];
    while (true) {
        yield $a;
        [$a, $b] = [$b, $a + $b];
    }
}

$primeiros10 = [];
foreach (fibonacci() as $i => $n) {
    if ($i === 10) break;
    $primeiros10[] = $n;
}

echo implode(', ', $primeiros10) . PHP_EOL;`}
        output={`0, 1, 1, 2, 3, 5, 8, 13, 21, 34`}
      />

      <h2>yield from: delegando para outro generator</h2>
      <p>
        <code>yield from</code> repassa todos os valores de outro iterável (array, generator,
        Traversable). É essencial para compor pipelines e achatar estruturas:
      </p>

      <PhpBlock
        filename="yield_from.php"
        code={`<?php
declare(strict_types=1);

function pares(int $max): Generator
{
    for ($i = 2; $i <= $max; $i += 2) {
        yield $i;
    }
}

function impares(int $max): Generator
{
    for ($i = 1; $i <= $max; $i += 2) {
        yield $i;
    }
}

function todos(int $max): Generator
{
    yield from pares($max);
    yield from impares($max);
    yield 'fim';
}

foreach (todos(6) as $v) {
    echo $v . ' ';
}
echo PHP_EOL;`}
        output={`2 4 6 1 3 5 fim `}
      />

      <AlertBox type="warning" title="Pegadinha das chaves">
        Quando você usa <code>yield from</code> com chaves repetidas (vindas de dois generators
        diferentes), as chaves <strong>se sobrescrevem</strong> se você jogar tudo em um array com{" "}
        <code>iterator_to_array()</code>. Use <code>iterator_to_array($g, preserve_keys: false)</code>{" "}
        para reindexar.
      </AlertBox>

      <h2>Comunicação bidirecional com send()</h2>
      <p>
        Generators não são uma rua de mão única — você pode <strong>injetar</strong> valores de volta
        com <code>$gen-&gt;send($valor)</code>. O valor enviado vira o resultado da expressão{" "}
        <code>yield</code> dentro da função:
      </p>

      <PhpBlock
        filename="send.php"
        code={`<?php
declare(strict_types=1);

function eco(): Generator
{
    while (true) {
        $msg = yield;
        if ($msg === null) return;
        echo ">> $msg" . PHP_EOL;
    }
}

$g = eco();
$g->current();        // inicia o generator (chega no 1º yield)
$g->send('olá');
$g->send('mundo');
$g->send('fim');`}
        output={`>> olá
>> mundo
>> fim`}
      />

      <h2>Comparativo: array vs generator com 1 milhão de itens</h2>
      <p>
        Um teste rápido mostra a diferença concreta de memória entre criar um array gigante e um
        generator equivalente:
      </p>

      <PhpBlock
        filename="bench.php"
        code={`<?php
declare(strict_types=1);

function arrayDe1M(): array
{
    $a = [];
    for ($i = 0; $i < 1_000_000; $i++) $a[] = $i;
    return $a;
}

function genDe1M(): Generator
{
    for ($i = 0; $i < 1_000_000; $i++) yield $i;
}

$antes = memory_get_usage(true);
$arr = arrayDe1M();
echo "Array : " . round((memory_get_usage(true) - $antes) / 1024 / 1024, 2) . " MB" . PHP_EOL;

$antes = memory_get_usage(true);
$gen = genDe1M();
foreach ($gen as $v) { /* consome */ }
echo "Gen   : " . round((memory_get_peak_usage(true) - $antes) / 1024 / 1024, 2) . " MB pico" . PHP_EOL;`}
        output={`Array : 32.00 MB
Gen   : 0.00 MB pico`}
      />

      <AlertBox type="info" title="Quando NÃO usar generator">
        Se você precisa percorrer a coleção <strong>várias vezes</strong>, ordenar, contar com{" "}
        <code>count()</code>, ou acessar por índice, um array é melhor — generators consomem-se UMA
        vez. Para uso único e streaming, generators ganham fácil.
      </AlertBox>

      <h2>Rodando os exemplos</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/generators"
        command="php ler_arquivo.php"
        output={`Erros 500: 412
Pico de memória: 2.00 MB`}
      />

      <p>
        No próximo capítulo a gente sobe outro degrau: <strong>Reflection API</strong> — o jeito do
        PHP olhar para si mesmo em runtime e a base de quase todo container de DI moderno.
      </p>
    </PageContainer>
  );
}
