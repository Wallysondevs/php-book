import{j as e}from"./index-B5-q-eol.js";import{P as r,A as a,a as o}from"./AlertBox-CVbFLZEd.js";function n(){return e.jsxs(r,{title:"Loops",subtitle:"for, while, do-while e foreach (com chave, valor e por referência), os comandos break N e continue N, e por que foreach resolve quase todos os seus problemas.",difficulty:"iniciante",timeToRead:"11 min",category:"Controle de Fluxo",children:[e.jsx(a,{type:"info",title:"Pré-requisitos",children:e.jsxs("p",{children:["Antes deste capítulo, é bom já ter visto: ",e.jsx("a",{href:"#/operadores",className:"text-[#8993BE] underline",children:"Operadores"}),", ",e.jsx("a",{href:"#/arrays",className:"text-[#8993BE] underline",children:"Arrays"}),", ",e.jsx("a",{href:"#/if-else",className:"text-[#8993BE] underline",children:"if / elseif / else"}),"."]})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"for"})," "," — "," ","controle clássico com inicialização, condição e incremento."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"while / do-while"})," "," — "," ","while testa antes; do-while garante 1 execução."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"foreach"})," "," — "," ","itera arrays e objetos iteráveis; pode pegar chave => valor."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"break N / continue N"})," "," — "," ","sai de N níveis aninhados ou pula para próxima iteração."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Por referência"})," "," — "," ","foreach ($a as &$v) — alterações em $v afetam o array."]})]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"foreach"})," — itera sobre arrays e qualquer coisa ",e.jsx("code",{children:"iterable"}),". Existe porque iterar com índice à mão é chato e propenso a erro. Sintaxe: ",e.jsx("code",{children:"foreach ($arr as $valor) { ... }"})," ou ",e.jsx("code",{children:"foreach ($arr as $chave => $valor) { ... }"})," quando você precisa também da chave."]}),e.jsx("h2",{children:"foreach: o loop que você usa 95% das vezes"}),e.jsxs("p",{children:["Em PHP moderno, se você está escrevendo ",e.jsx("code",{children:"for"})," com índice numérico para iterar um array, provavelmente está fazendo errado. O ",e.jsx("code",{children:"foreach"})," existe exatamente para isso, é mais legível, funciona com índices numéricos, associativos, objetos iteráveis e geradores."]}),e.jsx(o,{filename:"foreach-basico.php",code:`<?php
declare(strict_types=1);

$linguagens = ["PHP", "Python", "Go"];

foreach ($linguagens as $lang) {
    echo "- {$lang}" . PHP_EOL;
}`,output:`- PHP
- Python
- Go`}),e.jsx("h2",{children:"foreach com chave e valor"}),e.jsxs("p",{children:["Quando o array é associativo (ou você precisa do índice), use a forma ",e.jsx("code",{children:"$chave => $valor"}),". Funciona em qualquer array, indexado ou não."]}),e.jsx(o,{filename:"foreach-kv.php",code:`<?php
declare(strict_types=1);

$config = [
    "host" => "localhost",
    "port" => 5432,
    "user" => "admin",
];

foreach ($config as $chave => $valor) {
    echo str_pad($chave, 6) . " = {$valor}" . PHP_EOL;
}

$frutas = ["maçã", "banana", "pera"];
foreach ($frutas as $i => $f) {
    echo "{$i}: {$f}" . PHP_EOL;
}`,output:`host   = localhost
port   = 5432
user   = admin
0: maçã
1: banana
2: pera`}),e.jsx("h2",{children:"foreach por referência: editando in-place"}),e.jsxs("p",{children:["Por padrão, ",e.jsx("code",{children:"$valor"})," dentro do ",e.jsx("code",{children:"foreach"})," é uma ",e.jsx("strong",{children:"cópia"})," — modificar ele não muda o array. Se você quer alterar os elementos no lugar, use ",e.jsx("code",{children:"&$valor"}),". E aí vem a pegadinha mais famosa do PHP: ",e.jsx("strong",{children:"sempre dê unset na variável depois do foreach por referência"}),"."]}),e.jsx(o,{filename:"foreach-ref.php",code:`<?php
declare(strict_types=1);

$precos = [10.0, 20.0, 30.0];

foreach ($precos as &$p) {
    $p = $p * 1.1;
}
unset($p);

print_r($precos);`,output:`Array
(
    [0] => 11
    [1] => 22
    [2] => 33
)`}),e.jsxs(a,{type:"danger",title:"A pegadinha do referência sem unset",children:["Se você não fizer ",e.jsx("code",{children:"unset($p)"})," após o foreach por referência, a variável ",e.jsx("code",{children:"$p"}),"continua apontando para o último elemento do array. Qualquer atribuição posterior a ",e.jsx("code",{children:"$p"})," vai"," ",e.jsx("strong",{children:"silenciosamente alterar o último item do array"}),". Já causou bug em projeto sério — sempre dê ",e.jsx("code",{children:"unset"}),"."]}),e.jsxs("p",{children:["Se preferir evitar referências (recomendável), reescreva com ",e.jsx("code",{children:"array_map"})," ou reatribuindo via chave:"]}),e.jsx(o,{filename:"foreach-sem-ref.php",code:`<?php
declare(strict_types=1);

$precos = [10.0, 20.0, 30.0];

foreach ($precos as $i => $p) {
    $precos[$i] = $p * 1.1;
}

print_r($precos);

$alternativa = array_map(fn(float $p): float => $p * 1.1, [10.0, 20.0, 30.0]);
print_r($alternativa);`,output:`Array
(
    [0] => 11
    [1] => 22
    [2] => 33
)
Array
(
    [0] => 11
    [1] => 22
    [2] => 33
)`}),e.jsx("h2",{children:"for: o clássico com contador"}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"for"})," — loop com contador explícito. Existe quando você precisa controlar o índice manualmente (pular de N em N, contar pra trás). Sintaxe: ",e.jsx("code",{children:"for (init; cond; passo) { ... }"}),". As três partes são separadas por ",e.jsx("code",{children:";"})," e qualquer uma pode ficar vazia."]}),e.jsxs("p",{children:["O ",e.jsx("code",{children:"for"})," tem três partes separadas por ",e.jsx("code",{children:";"}),": inicialização, condição e incremento. Use quando o loop é ",e.jsx("strong",{children:"baseado em um número"}),", não em uma coleção."]}),e.jsx(o,{filename:"for.php",code:`<?php
declare(strict_types=1);

for ($i = 1; $i <= 5; $i++) {
    echo "Iteração {$i}" . PHP_EOL;
}

for ($i = 10; $i >= 0; $i -= 2) {
    echo $i . " ";
}
echo PHP_EOL;`,output:`Iteração 1
Iteração 2
Iteração 3
Iteração 4
Iteração 5
10 8 6 4 2 0 `}),e.jsxs(a,{type:"info",title:"Quando usar for em vez de foreach",children:["Use ",e.jsx("code",{children:"for"})," quando você está ",e.jsx("strong",{children:"gerando"}),' uma sequência (ex.: imprimir o cabeçalho de uma tabela com 10 colunas), quando precisa pular de N em N, ou quando o índice tem significado próprio (não é só "posição no array").']}),e.jsx("h2",{children:"while e do-while"}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"while"})," — repete enquanto a condição for verdadeira, testando ",e.jsx("em",{children:"antes"})," de cada iteração. Existe quando você não sabe quantas voltas vai dar (consumir fila, ler stream). Sintaxe: ",e.jsx("code",{children:"while (cond) { ... }"}),". Pode rodar zero vezes se a condição já começar falsa."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"do-while"})," — irmão do ",e.jsx("code",{children:"while"}),", mas testa ",e.jsx("em",{children:"depois"})," de executar. Garante pelo menos uma execução. Sintaxe: ",e.jsx("code",{children:"do { ... } while (cond);"}),". Note o ",e.jsx("code",{children:";"})," no final — é exigido."]}),e.jsxs("p",{children:[e.jsx("code",{children:"while"})," testa a condição ",e.jsx("strong",{children:"antes"})," de executar. ",e.jsx("code",{children:"do-while"})," executa pelo menos uma vez e testa ",e.jsx("strong",{children:"depois"}),". Na prática, ",e.jsx("code",{children:"while"})," aparece quando você consome de uma fila ou stream sem saber quantos itens virão."]}),e.jsx(o,{filename:"while.php",code:`<?php
declare(strict_types=1);

$fila = ["job-1", "job-2", "job-3"];

while ($fila !== []) {
    $job = array_shift($fila);
    echo "Processando: {$job}" . PHP_EOL;
}
echo "Fila vazia." . PHP_EOL;

$tentativa = 0;
do {
    $tentativa++;
    echo "Tentativa #{$tentativa}" . PHP_EOL;
} while ($tentativa < 3);`,output:`Processando: job-1
Processando: job-2
Processando: job-3
Fila vazia.
Tentativa #1
Tentativa #2
Tentativa #3`}),e.jsxs(a,{type:"warning",title:"while infinito",children:["Esquecer de modificar a condição dentro do ",e.jsx("code",{children:"while"})," trava o script. Em CLI o PHP eventualmente atinge o ",e.jsx("code",{children:"memory_limit"})," ou ",e.jsx("code",{children:"max_execution_time"})," — em produção isso vira indisponibilidade. Sempre que for incerto, coloque uma trava de segurança: ",e.jsx("code",{children:"if (++$i > 1000) break;"}),"."]}),e.jsx("h2",{children:"break e continue"}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"break"})," — interrompe o loop imediatamente, pulando para o código depois dele. Aceita um número (",e.jsx("code",{children:"break 2"}),") para sair de N níveis aninhados de uma vez."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"continue"})," — pula direto para a próxima iteração do loop atual, ignorando o resto do bloco. Também aceita número (",e.jsx("code",{children:"continue 2"}),") para pular iterações de loops mais externos."]}),e.jsxs("p",{children:[e.jsx("code",{children:"break"})," sai do loop. ",e.jsx("code",{children:"continue"})," pula para a próxima iteração. Já vimos eles em switch — em loops o uso é o mesmo."]}),e.jsx(o,{filename:"break-continue.php",code:`<?php
declare(strict_types=1);

foreach (range(1, 10) as $n) {
    if ($n % 2 === 0) {
        continue;
    }
    if ($n > 7) {
        break;
    }
    echo $n . " ";
}
echo PHP_EOL;`,output:"1 3 5 7 "}),e.jsx("h2",{children:"break N e continue N: saindo de loops aninhados"}),e.jsxs("p",{children:["Diferente da maioria das linguagens, o PHP aceita um ",e.jsx("strong",{children:"número"})," após ",e.jsx("code",{children:"break"})," ou",e.jsx("code",{children:" continue"}),". Esse número diz quantos níveis pular. ",e.jsx("code",{children:"break 2"})," sai do loop atual",e.jsx("em",{children:" e"})," do loop externo."]}),e.jsx(o,{filename:"break-n.php",code:`<?php
declare(strict_types=1);

$matriz = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
];

$alvo = 5;
foreach ($matriz as $i => $linha) {
    foreach ($linha as $j => $valor) {
        if ($valor === $alvo) {
            echo "Encontrado em [{$i}][{$j}]" . PHP_EOL;
            break 2;
        }
    }
}

foreach (range(1, 3) as $linha) {
    foreach (range(1, 3) as $col) {
        if ($col === 2) {
            continue 2;
        }
        echo "L{$linha}C{$col} ";
    }
}
echo PHP_EOL;`,output:`Encontrado em [1][1]
L1C1 L2C1 L3C1 `}),e.jsxs(a,{type:"success",title:"Por que isso é útil",children:["A alternativa sem ",e.jsx("code",{children:"break N"})," é criar uma flag booleana e checar em cada nível — código verboso e fácil de errar. ",e.jsx("code",{children:"break 2"})," resolve em uma palavra. Use com moderação: loops com mais de dois níveis aninhados geralmente pedem refatoração para uma função separada."]}),e.jsx("h2",{children:"foreach com generators: lazy iteration"}),e.jsxs("p",{children:["Um ",e.jsx("code",{children:"foreach"})," não precisa receber array — ele aceita qualquer ",e.jsx("code",{children:"iterable"}),". Uma função com ",e.jsx("code",{children:"yield"})," vira um generator: produz valores sob demanda, sem alocar tudo na memória de uma vez. Ótimo para processar arquivos grandes ou streams."]}),e.jsx(o,{filename:"generator.php",code:`<?php
declare(strict_types=1);

function ler(string $arquivo): iterable {
    $h = fopen($arquivo, "r");
    while (($linha = fgets($h)) !== false) {
        yield trim($linha);
    }
    fclose($h);
}

file_put_contents("/tmp/lista.txt", "ada\\nlinus\\ngrace\\n");

foreach (ler("/tmp/lista.txt") as $nome) {
    echo "- {$nome}" . PHP_EOL;
}`,output:`- ada
- linus
- grace`}),e.jsx("h2",{children:"Resumo: qual loop usar?"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"foreach"})," — iterar arrays, objetos iteráveis e generators. Padrão."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"for"})," — gerar sequências, pular de N em N, índice tem significado próprio."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"while"})," — consumir filas/streams enquanto condição valer."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"do-while"})," — quando precisa rodar pelo menos uma vez (raro, mas existe)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"array_map / array_filter"})," — quando você quer transformar/filtrar e o foco é o resultado, não o efeito colateral."]})]}),e.jsxs("p",{children:["Pronto para o próximo nível: vamos sair do controle de fluxo e mergulhar em ",e.jsx("strong",{children:"funções"}),", que é onde o código deixa de ser script e vira programa de verdade."]})]})}export{n as default};
