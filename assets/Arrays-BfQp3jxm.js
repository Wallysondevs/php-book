import{j as e}from"./index-B5-q-eol.js";import{P as s,A as r,a}from"./AlertBox-CVbFLZEd.js";function n(){return e.jsxs(s,{title:"Arrays",subtitle:"Indexados e associativos, sintaxe curta com colchetes, desestruturação, spread, multi-dimensionais e o jeito certo de contar e iterar.",difficulty:"iniciante",timeToRead:"12 min",category:"Strings & Arrays",children:[e.jsx(r,{type:"info",title:"Pré-requisitos",children:e.jsxs("p",{children:["Antes deste capítulo, é bom já ter visto: ",e.jsx("a",{href:"#/variaveis",className:"text-[#8993BE] underline",children:"Variáveis"}),", ",e.jsx("a",{href:"#/tipos",className:"text-[#8993BE] underline",children:"Tipos"}),"."]})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Array indexado"})," "," — "," ","[1,2,3] — chaves numéricas automáticas."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Associativo"})," "," — "," ",'["nome" => "Ana"] — chaves string.']}),e.jsxs("li",{children:[e.jsx("strong",{children:"Multidimensional"})," "," — "," ","arrays dentro de arrays."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"count()"})," "," — "," ","tamanho do array; recursive como segundo arg."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Spread (...)"})," "," — "," ","$novo = [...$a, ...$b] — junta arrays preservando associativos."]})]}),e.jsx("h2",{children:"Um array que é tudo ao mesmo tempo"}),e.jsxs("p",{children:["Em PHP ",e.jsx("strong",{children:"não existe"})," distinção entre lista, dicionário e tupla. O array do PHP é uma estrutura híbrida: um ",e.jsx("em",{children:"ordered map"}),". Ele guarda chaves (inteiras ou string) com valores, e mantém a ordem de inserção. É a estrutura mais usada da linguagem — entender ela é entender PHP."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"[] / array()"})," — sintaxe pra criar arrays. ",e.jsx("code",{children:"[1, 2, 3]"})," é a forma moderna (PHP 5.4+); ",e.jsx("code",{children:"array(1, 2, 3)"})," é a antiga (ainda funciona). Use sempre os colchetes — é menor, mais legível e padrão da comunidade. Funciona pra indexados ",e.jsx("code",{children:"[1, 2]"})," e associativos ",e.jsx("code",{children:'["k" => "v"]'}),"."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"=>"}),' — operador "fat arrow" que associa uma chave a um valor dentro de array literal. Existe porque o array do PHP é um ',e.jsx("em",{children:"ordered map"})," (chave → valor). Sintaxe: ",e.jsx("code",{children:'["nome" => "Ada", "idade" => 36]'}),". Também aparece em ",e.jsx("code",{children:"foreach ($arr as $k => $v)"}),"."]}),e.jsx(a,{filename:"primeiro-array.php",code:`<?php
declare(strict_types=1);

$linguagens = ["PHP", "Python", "Ruby", "Go"];
$user = ["nome" => "Ada", "email" => "ada@example.com", "ativo" => true];

echo $linguagens[0] . PHP_EOL;
echo $user["email"] . PHP_EOL;

print_r($linguagens);
print_r($user);`,output:`PHP
ada@example.com
Array
(
    [0] => PHP
    [1] => Python
    [2] => Ruby
    [3] => Go
)
Array
(
    [nome] => Ada
    [email] => ada@example.com
    [ativo] => 1
)`}),e.jsx("h2",{children:"Indexados vs associativos"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Indexado"})," é quando você deixa o PHP atribuir as chaves automaticamente: ",e.jsx("code",{children:"0, 1, 2, ..."}),"."," ",e.jsx("strong",{children:"Associativo"})," é quando você define chaves string. Por baixo dos panos é o mesmo tipo, e você pode misturar:"]}),e.jsx(a,{filename:"misto.php",code:`<?php
declare(strict_types=1);

$pedido = [
    "id" => 1042,
    "cliente" => "Ada",
    100 => "primeiro item",
    101 => "segundo item",
    "total" => 250.0,
];

foreach ($pedido as $chave => $valor) {
    echo "{$chave} => {$valor}" . PHP_EOL;
}`,output:`id => 1042
cliente => Ada
100 => primeiro item
101 => segundo item
total => 250`}),e.jsxs(r,{type:"info",title:"array() vs []",children:["Você ainda vê ",e.jsx("code",{children:"array(1, 2, 3)"})," em código antigo. Desde o PHP 5.4 a sintaxe oficial é",e.jsx("code",{children:" [1, 2, 3]"}),". Use sempre os colchetes — é menor, mais legível e padrão da comunidade."]}),e.jsx("h2",{children:"Adicionando, removendo e sobrescrevendo"}),e.jsxs("p",{children:["Você não precisa declarar tamanho. Você simplesmente atribui ou usa ",e.jsx("code",{children:"[]"})," sem chave para empilhar no fim:"]}),e.jsx(a,{filename:"manipulando.php",code:`<?php
declare(strict_types=1);

$tarefas = [];
$tarefas[] = "estudar PHP";
$tarefas[] = "praticar arrays";
$tarefas[] = "ler PSR-12";

echo count($tarefas) . " tarefas" . PHP_EOL;

$tarefas[1] = "praticar arrays a fundo";
unset($tarefas[0]);

print_r($tarefas);`,output:`3 tarefas
Array
(
    [1] => praticar arrays a fundo
    [2] => ler PSR-12
)`}),e.jsxs(r,{type:"warning",title:"unset deixa buracos nas chaves",children:["Removendo ",e.jsx("code",{children:"$tarefas[0]"})," as chaves ",e.jsx("code",{children:"1"})," e ",e.jsx("code",{children:"2"})," permanecem. Se quiser reindexar do zero, use ",e.jsx("code",{children:"array_values($tarefas)"}),"."]}),e.jsx("h2",{children:"Desestruturação: extraindo valores em uma linha"}),e.jsxs("p",{children:["Em vez de ",e.jsx("code",{children:'$nome = $user["nome"]; $email = $user["email"];'})," você pode desestruturar. Funciona com índices numéricos e com chaves nomeadas (PHP 7.1+)."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"list()"})," — sintaxe antiga de desestruturação: ",e.jsx("code",{children:"list($a, $b) = [1, 2]"}),". Existe há mais tempo, mas hoje a forma com colchetes ",e.jsx("code",{children:"[$a, $b] = [1, 2]"})," é a recomendada (PHP 7.1+) e funciona inclusive com chaves nomeadas. Use ",e.jsx("code",{children:"list()"})," só pra compatibilidade com código muito antigo."]}),e.jsx(a,{filename:"desestruturacao.php",code:`<?php
declare(strict_types=1);

$coords = [10, 20, 30];
[$x, $y, $z] = $coords;
echo "x={$x} y={$y} z={$z}" . PHP_EOL;

$user = ["nome" => "Linus", "email" => "linus@kernel.org", "role" => "admin"];
["nome" => $nome, "email" => $email] = $user;
echo "{$nome} <{$email}>" . PHP_EOL;

$pares = [["id" => 1, "label" => "novo"], ["id" => 2, "label" => "ativo"]];
foreach ($pares as ["id" => $id, "label" => $label]) {
    echo "#{$id}: {$label}" . PHP_EOL;
}`,output:`x=10 y=20 z=30
Linus <linus@kernel.org>
#1: novo
#2: ativo`}),e.jsxs("p",{children:["A forma antiga era ",e.jsx("code",{children:"list($a, $b) = $arr"}),". Ela ainda funciona, mas a versão com colchetes",e.jsx("code",{children:" [$a, $b] = $arr"})," é a recomendada hoje. Use ",e.jsx("code",{children:"list()"})," apenas se for manter compatibilidade com código muito antigo."]}),e.jsx("h2",{children:"Spread (...): expandindo arrays"}),e.jsxs("p",{children:["O operador ",e.jsx("code",{children:"..."})," espalha um array dentro de outro. Útil para juntar listas, encaminhar argumentos para funções e clonar com pequenas alterações. A partir do PHP 8.1, funciona também com chaves string."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"[...$a] (spread)"})," — operador que espalha os elementos de um array dentro de outro array ou de uma chamada de função. Existe pra juntar listas, encaminhar argumentos e clonar com pequenas mudanças sem precisar de ",e.jsx("code",{children:"array_merge"}),". Sintaxe: ",e.jsx("code",{children:"[...$a, ...$b, 7]"})," ou ",e.jsx("code",{children:"somar(...$valores)"}),". Suporta chaves string desde PHP 8.1."]}),e.jsx(a,{filename:"spread.php",code:`<?php
declare(strict_types=1);

$a = [1, 2, 3];
$b = [4, 5, 6];
$todos = [...$a, ...$b, 7];
print_r($todos);

$base = ["host" => "localhost", "port" => 5432];
$config = [...$base, "port" => 5433, "user" => "admin"];
print_r($config);

function somar(int ...$nums): int {
    return array_sum($nums);
}

$valores = [10, 20, 30];
echo somar(...$valores) . PHP_EOL;`,output:`Array
(
    [0] => 1
    [1] => 2
    [2] => 3
    [3] => 4
    [4] => 5
    [5] => 6
    [6] => 7
)
Array
(
    [host] => localhost
    [port] => 5433
    [user] => admin
)
60`}),e.jsx("h2",{children:"Arrays multi-dimensionais"}),e.jsxs("p",{children:["Não existe array 2D especial em PHP — você apenas guarda arrays dentro de arrays. É como uma planilha, ou uma resposta JSON aninhada. A sintaxe de acesso encadeia colchetes: ",e.jsx("code",{children:"$matriz[1][2]"}),"."]}),e.jsx(a,{filename:"multi.php",code:`<?php
declare(strict_types=1);

$usuarios = [
    ["id" => 1, "nome" => "Ada", "skills" => ["math", "logic"]],
    ["id" => 2, "nome" => "Linus", "skills" => ["c", "git", "kernel"]],
    ["id" => 3, "nome" => "Grace", "skills" => ["cobol", "compilers"]],
];

echo $usuarios[1]["nome"] . PHP_EOL;
echo $usuarios[1]["skills"][2] . PHP_EOL;

foreach ($usuarios as $u) {
    $skills = implode(", ", $u["skills"]);
    echo "{$u['nome']} (#{$u['id']}): {$skills}" . PHP_EOL;
}`,output:`Linus
kernel
Ada (#1): math, logic
Linus (#2): c, git, kernel
Grace (#3): cobol, compilers`}),e.jsx("h2",{children:"count: contando o que importa"}),e.jsxs("p",{children:[e.jsx("code",{children:"count"})," retorna a quantidade de elementos no array. Cuidado: ",e.jsx("code",{children:"count"})," em",e.jsx("code",{children:" null"})," dispara ",e.jsx("em",{children:"TypeError"})," no PHP 8 (no PHP 7 era warning). Sempre garanta que está passando array, ou use ",e.jsx("code",{children:"count($arr ?? [])"}),"."]}),e.jsx(a,{filename:"count.php",code:`<?php
declare(strict_types=1);

$itens = ["a", "b", "c", "d"];
echo count($itens) . PHP_EOL;

$matriz = [[1, 2, 3], [4, 5], [6]];
echo count($matriz) . PHP_EOL;
echo count($matriz, COUNT_RECURSIVE) . PHP_EOL;

$opcional = null;
echo count($opcional ?? []) . PHP_EOL;`,output:`4
3
9
0`}),e.jsxs(r,{type:"success",title:"Quando o array está vazio?",children:[e.jsx("code",{children:"empty($arr)"})," retorna ",e.jsx("code",{children:"true"})," para array vazio. Mas a forma mais explícita é",e.jsx("code",{children:" count($arr) === 0"}),". Em condicionais, lembre que ",e.jsx("code",{children:"[]"})," é falsy:",e.jsxs("code",{children:[" if (!$arr) ","{ ... }"]})," também funciona."]}),e.jsx("h2",{children:"Array nas funções: passa por valor"}),e.jsxs("p",{children:["Ao contrário de objetos, arrays em PHP são passados ",e.jsx("strong",{children:"por valor"}),". Se você quiser modificar o array original dentro de uma função, use ",e.jsx("code",{children:"&"})," (referência) explicitamente — ou, melhor, retorne uma nova versão."]}),e.jsx(a,{filename:"por-valor.php",code:`<?php
declare(strict_types=1);

function adicionarItem(array $lista, string $item): array {
    $lista[] = $item;
    return $lista;
}

$base = ["a", "b"];
$nova = adicionarItem($base, "c");

print_r($base);
print_r($nova);`,output:`Array
(
    [0] => a
    [1] => b
)
Array
(
    [0] => a
    [1] => b
    [2] => c
)`}),e.jsxs("p",{children:["Você acabou de ver os fundamentos. No próximo capítulo a gente sobe a régua e olha as ",e.jsx("strong",{children:"funções de array"})," — ",e.jsx("code",{children:"array_map"}),", ",e.jsx("code",{children:"array_filter"}),", ",e.jsx("code",{children:"array_reduce"})," e amigos. É lá que o código vira elegante."]})]})}export{n as default};
