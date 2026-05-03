import{j as e}from"./index-B5-q-eol.js";import{P as o,A as a,a as r}from"./AlertBox-CVbFLZEd.js";import{T as i}from"./TerminalBlock-6fqVIX2R.js";function c(){return e.jsxs(o,{title:"Generators (yield)",subtitle:"A forma mais elegante de iterar sem alocar memória: funções que pausam no yield, devolvem um valor por vez e retomam de onde pararam.",difficulty:"avancado",timeToRead:"13 min",category:"SPL & Iteradores",children:[e.jsx(a,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"yield"})," "," — "," ","pausa a função e devolve valor; retoma na próxima iteração."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Lazy"})," "," — "," ","gera valores sob demanda — economia de memória em datasets enormes."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"yield from"})," "," — "," ","delega a outro generator/iterable."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Generator::send()"})," "," — "," ","envia valor de volta para dentro do yield."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"vs array"})," "," — "," ","generator não materializa tudo; só funciona para iteração unidirecional."]})]}),e.jsx("h2",{children:"O problema: array gigante = RAM gigante"}),e.jsxs("p",{children:["Suponha que você precisa processar um log de 5 GB. A abordagem ingênua —"," ",e.jsx("code",{children:"file($caminho)"})," — carrega tudo na memória e mata o processo com"," ",e.jsx("em",{children:"“Allowed memory size exhausted”"}),". ",e.jsx("strong",{children:"Generators"})," resolvem isso entregando uma linha por vez, sem nunca segurar todas ao mesmo tempo."]}),e.jsx(r,{filename:"ingenuo.php",code:`<?php
declare(strict_types=1);

ini_set('memory_limit', '32M');

$linhas = file('/var/log/acesso.log'); // carrega 5 GB de uma vez
foreach ($linhas as $l) {
    // processar...
}`,output:`PHP Fatal error: Allowed memory size of 33554432 bytes exhausted
(tried to allocate 5368709120 bytes)`}),e.jsx("h2",{children:"A solução: yield linha-a-linha"}),e.jsxs("p",{children:["Toda função que contém a palavra-chave ",e.jsx("code",{children:"yield"})," deixa de “rodar até o fim” e vira um ",e.jsx("strong",{children:"Generator"}),". Cada ",e.jsx("code",{children:"yield"})," entrega um valor e ",e.jsx("em",{children:"congela"})," o estado da função; na próxima iteração, ela retoma exatamente de onde parou."]}),e.jsx(r,{filename:"ler_arquivo.php",code:`<?php
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
echo "Pico de memória: " . round(memory_get_peak_usage(true) / 1024 / 1024, 2) . " MB" . PHP_EOL;`,output:`Erros 500: 412
Pico de memória: 2.00 MB`}),e.jsxs(a,{type:"success",title:"Por que isso é mágico",children:["Mesmo lendo um arquivo de gigabytes, o pico de memória fica praticamente constante. O generator só guarda ",e.jsx("em",{children:"uma linha"})," por vez, não a coleção inteira."]}),e.jsx("h2",{children:"Sintaxe básica: yield $valor e yield $chave => $valor"}),e.jsxs("p",{children:[e.jsx("code",{children:"yield"})," sozinho gera valores com chaves automáticas (0, 1, 2…). Use"," ",e.jsx("code",{children:"yield $chave => $valor"})," para personalizar a chave, igual a um array associativo:"]}),e.jsx(r,{filename:"basico.php",code:`<?php
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
}`,output:`[0] 1
[1] 2
[2] 3
php = Hypertext Preprocessor
http = HyperText Transfer Protocol
json = JavaScript Object Notation`}),e.jsx("h2",{children:"Generators infinitos"}),e.jsxs("p",{children:["Como o generator só produz sob demanda, você pode criar sequências ",e.jsx("em",{children:"infinitas"})," sem explodir nada. Quem decide quando parar é quem consome (com ",e.jsx("code",{children:"break"})," ou"," ",e.jsx("code",{children:"LimitIterator"}),"):"]}),e.jsx(r,{filename:"fibonacci.php",code:`<?php
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

echo implode(', ', $primeiros10) . PHP_EOL;`,output:"0, 1, 1, 2, 3, 5, 8, 13, 21, 34"}),e.jsx("h2",{children:"yield from: delegando para outro generator"}),e.jsxs("p",{children:[e.jsx("code",{children:"yield from"})," repassa todos os valores de outro iterável (array, generator, Traversable). É essencial para compor pipelines e achatar estruturas:"]}),e.jsx(r,{filename:"yield_from.php",code:`<?php
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
echo PHP_EOL;`,output:"2 4 6 1 3 5 fim "}),e.jsxs(a,{type:"warning",title:"Pegadinha das chaves",children:["Quando você usa ",e.jsx("code",{children:"yield from"})," com chaves repetidas (vindas de dois generators diferentes), as chaves ",e.jsx("strong",{children:"se sobrescrevem"})," se você jogar tudo em um array com"," ",e.jsx("code",{children:"iterator_to_array()"}),". Use ",e.jsx("code",{children:"iterator_to_array($g, preserve_keys: false)"})," ","para reindexar."]}),e.jsx("h2",{children:"Comunicação bidirecional com send()"}),e.jsxs("p",{children:["Generators não são uma rua de mão única — você pode ",e.jsx("strong",{children:"injetar"})," valores de volta com ",e.jsx("code",{children:"$gen->send($valor)"}),". O valor enviado vira o resultado da expressão"," ",e.jsx("code",{children:"yield"})," dentro da função:"]}),e.jsx(r,{filename:"send.php",code:`<?php
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
$g->send('fim');`,output:`>> olá
>> mundo
>> fim`}),e.jsx("h2",{children:"Comparativo: array vs generator com 1 milhão de itens"}),e.jsx("p",{children:"Um teste rápido mostra a diferença concreta de memória entre criar um array gigante e um generator equivalente:"}),e.jsx(r,{filename:"bench.php",code:`<?php
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
echo "Gen   : " . round((memory_get_peak_usage(true) - $antes) / 1024 / 1024, 2) . " MB pico" . PHP_EOL;`,output:`Array : 32.00 MB
Gen   : 0.00 MB pico`}),e.jsxs(a,{type:"info",title:"Quando NÃO usar generator",children:["Se você precisa percorrer a coleção ",e.jsx("strong",{children:"várias vezes"}),", ordenar, contar com"," ",e.jsx("code",{children:"count()"}),", ou acessar por índice, um array é melhor — generators consomem-se UMA vez. Para uso único e streaming, generators ganham fácil."]}),e.jsx("h2",{children:"Rodando os exemplos"}),e.jsx(i,{user:"dev",host:"php",cwd:"~/generators",command:"php ler_arquivo.php",output:`Erros 500: 412
Pico de memória: 2.00 MB`}),e.jsxs("p",{children:["No próximo capítulo a gente sobe outro degrau: ",e.jsx("strong",{children:"Reflection API"})," — o jeito do PHP olhar para si mesmo em runtime e a base de quase todo container de DI moderno."]})]})}export{c as default};
