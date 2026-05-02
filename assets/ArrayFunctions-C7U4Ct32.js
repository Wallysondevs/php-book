import{j as e}from"./index-Bb4MiiJL.js";import{P as o,A as r,a}from"./AlertBox-BpD-xIsb.js";function c(){return e.jsxs(o,{title:"Funções de array",subtitle:"map, filter, reduce, keys, values, search, ordenação, merge vs união, array_column e array_combine — o arsenal que transforma loops em uma linha.",difficulty:"intermediario",timeToRead:"14 min",category:"Strings & Arrays",children:[e.jsx(r,{type:"info",title:"Pré-requisitos",children:e.jsxs("p",{children:["Antes deste capítulo, é bom já ter visto: ",e.jsx("a",{href:"#/variaveis",className:"text-[#8993BE] underline",children:"Variáveis"}),", ",e.jsx("a",{href:"#/tipos",className:"text-[#8993BE] underline",children:"Tipos"}),", ",e.jsx("a",{href:"#/arrays",className:"text-[#8993BE] underline",children:"Arrays"}),"."]})}),e.jsx("h2",{children:"O básico antes do avançado"}),e.jsxs("p",{children:["Você já sabe iterar com ",e.jsx("code",{children:"foreach"}),". Tudo que vamos ver aqui pode ser feito com loop manual — a graça é deixar a ",e.jsx("strong",{children:"intenção"})," explícita. Quando você lê ",e.jsx("code",{children:"array_filter($users, fn($u) => $u->ativo)"})," ","sabe imediatamente o que está acontecendo. Com ",e.jsx("code",{children:"foreach"})," precisa ler o corpo todo."]}),e.jsx("h2",{children:"array_map: transformar cada elemento"}),e.jsx("p",{children:"Recebe um callback e um (ou mais) arrays. Aplica o callback em cada elemento e retorna um novo array. Não modifica o original."}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"array_map"})," — aplica um callback em cada elemento e devolve um novo array (não modifica o original). Existe pra transformar listas sem escrever ",e.jsx("code",{children:"foreach"}),". Sintaxe: ",e.jsx("code",{children:"array_map($cb, $arr)"}),". Aceita múltiplos arrays — ",e.jsx("code",{children:"array_map($cb, $a, $b)"})," chama ",e.jsx("code",{children:"$cb($a[i], $b[i])"}),". Preserva chaves do primeiro array."]}),e.jsx(a,{filename:"map.php",code:`<?php
declare(strict_types=1);

$precos = [10.0, 25.5, 99.9, 7.0];

$comImposto = array_map(fn(float $p): float => $p * 1.1, $precos);
print_r($comImposto);

$nomes = ["ada", "linus", "grace"];
$capitalizados = array_map("ucfirst", $nomes);
print_r($capitalizados);

$a = [1, 2, 3];
$b = [10, 20, 30];
$soma = array_map(fn(int $x, int $y): int => $x + $y, $a, $b);
print_r($soma);`,output:`Array
(
    [0] => 11
    [1] => 28.05
    [2] => 109.89
    [3] => 7.7
)
Array
(
    [0] => Ada
    [1] => Linus
    [2] => Grace
)
Array
(
    [0] => 11
    [1] => 22
    [2] => 33
)`}),e.jsxs(r,{type:"info",title:"array_map preserva chaves",children:["Diferente de ",e.jsx("code",{children:"array_filter"}),", ",e.jsx("code",{children:"array_map"})," mantém as chaves originais do primeiro array. Se você passa múltiplos arrays, ele reseta para chaves numéricas."]}),e.jsx("h2",{children:"array_filter: manter o que passa no teste"}),e.jsxs("p",{children:["Recebe um array e um callback que retorna ",e.jsx("code",{children:"bool"}),". Mantém só os elementos onde o callback é",e.jsx("em",{children:" truthy"}),". Sem callback, remove qualquer valor falsy (",e.jsx("code",{children:"0"}),", ",e.jsx("code",{children:'""'}),", ",e.jsx("code",{children:"null"}),", etc.)."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"array_filter"})," — mantém só os elementos onde o callback retorna ",e.jsx("em",{children:"truthy"}),". Existe pra extrair subconjuntos sem ",e.jsx("code",{children:"foreach"})," com ",e.jsx("code",{children:"if"})," dentro. Sintaxe: ",e.jsx("code",{children:"array_filter($arr, $cb)"}),". Sem callback, remove valores falsy (",e.jsx("code",{children:"0"}),", ",e.jsx("code",{children:'""'}),", ",e.jsx("code",{children:"null"}),"). Preserva chaves originais — combine com ",e.jsx("code",{children:"array_values()"})," pra reindexar."]}),e.jsx(a,{filename:"filter.php",code:`<?php
declare(strict_types=1);

$numeros = [1, 2, 3, 4, 5, 6, 7, 8];
$pares = array_filter($numeros, fn(int $n): bool => $n % 2 === 0);
print_r($pares);

$bagunca = ["ada", "", null, "linus", 0, "grace"];
$validos = array_filter($bagunca);
print_r($validos);

$users = [
    ["nome" => "Ada", "ativo" => true],
    ["nome" => "Linus", "ativo" => false],
    ["nome" => "Grace", "ativo" => true],
];
$ativos = array_filter($users, fn(array $u): bool => $u["ativo"]);
print_r($ativos);`,output:`Array
(
    [1] => 2
    [3] => 4
    [5] => 6
    [7] => 8
)
Array
(
    [0] => ada
    [3] => linus
    [5] => grace
)
Array
(
    [0] => Array
        (
            [nome] => Ada
            [ativo] => 1
        )

    [2] => Array
        (
            [nome] => Grace
            [ativo] => 1
        )

)`}),e.jsxs(r,{type:"warning",title:"As chaves continuam furadas",children:["Note que ",e.jsx("code",{children:"array_filter"})," preserva as chaves originais — você fica com índices ",e.jsx("code",{children:"0, 2, 4..."}),". Se precisa de uma lista limpa indexada, encadeie com ",e.jsx("code",{children:"array_values()"}),"."]}),e.jsx("h2",{children:"array_reduce: condensar em um único valor"}),e.jsxs("p",{children:["Pega o array inteiro e reduz a um valor (uma soma, uma string, um objeto). É o canivete suíço quando nem ",e.jsx("code",{children:"map"})," nem ",e.jsx("code",{children:"filter"})," bastam."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"array_reduce"})," — percorre o array acumulando num único valor (soma, string, objeto). Existe pra quando ",e.jsx("code",{children:"map"})," e ",e.jsx("code",{children:"filter"}),' não bastam — você precisa "dobrar" a coleção. Sintaxe: ',e.jsx("code",{children:"array_reduce($arr, fn($acc, $item) => ..., $inicial)"}),". O terceiro parâmetro é o valor inicial do acumulador."]}),e.jsx(a,{filename:"reduce.php",code:`<?php
declare(strict_types=1);

$pedidos = [
    ["item" => "café", "valor" => 8.0],
    ["item" => "pão", "valor" => 3.5],
    ["item" => "queijo", "valor" => 22.0],
];

$total = array_reduce(
    $pedidos,
    fn(float $acc, array $p): float => $acc + $p["valor"],
    0.0
);
echo "Total: R$ " . number_format($total, 2, ",", ".") . PHP_EOL;

$nomes = ["ada", "linus", "grace"];
$lista = array_reduce(
    $nomes,
    fn(string $acc, string $n): string => $acc === "" ? $n : "{$acc}, {$n}",
    ""
);
echo $lista . PHP_EOL;`,output:`Total: R$ 33,50
ada, linus, grace`}),e.jsx("h2",{children:"array_keys, array_values e array_column"}),e.jsx("p",{children:'Quando você precisa só das chaves, só dos valores ou de uma "coluna" específica de um array de arrays:'}),e.jsx(a,{filename:"keys-values-column.php",code:`<?php
declare(strict_types=1);

$config = ["host" => "localhost", "port" => 5432, "user" => "admin"];
print_r(array_keys($config));
print_r(array_values($config));

$users = [
    ["id" => 1, "nome" => "Ada", "email" => "ada@x.com"],
    ["id" => 2, "nome" => "Linus", "email" => "linus@x.com"],
    ["id" => 3, "nome" => "Grace", "email" => "grace@x.com"],
];

print_r(array_column($users, "nome"));
print_r(array_column($users, "email", "id"));`,output:`Array
(
    [0] => host
    [1] => port
    [2] => user
)
Array
(
    [0] => localhost
    [1] => 5432
    [2] => admin
)
Array
(
    [0] => Ada
    [1] => Linus
    [2] => Grace
)
Array
(
    [1] => ada@x.com
    [2] => linus@x.com
    [3] => grace@x.com
)`}),e.jsxs("p",{children:[e.jsx("code",{children:"array_column"})," com o terceiro argumento monta um ",e.jsx("em",{children:"lookup"}),' instantâneo. É o atalho para "preciso achar o email pelo ID rapidinho".']}),e.jsx("h2",{children:"in_array e array_search: existe? onde está?"}),e.jsxs("p",{children:[e.jsx("code",{children:"in_array"})," retorna ",e.jsx("code",{children:"bool"}),". ",e.jsx("code",{children:"array_search"})," retorna a chave do elemento ou",e.jsx("code",{children:" false"}),". ",e.jsx("strong",{children:"Sempre"})," use o terceiro parâmetro como ",e.jsx("code",{children:"true"})," (comparação estrita) para evitar surpresas com ",e.jsx("code",{children:'"0" == false'}),"."]}),e.jsx(a,{filename:"search.php",code:`<?php
declare(strict_types=1);

$linguagens = ["PHP", "Python", "Go", "Rust"];

var_dump(in_array("Go", $linguagens, true));
var_dump(in_array("go", $linguagens, true));
var_dump(array_search("Rust", $linguagens, true));

$idades = ["ada" => 36, "linus" => 30, "grace" => 85];
$chave = array_search(85, $idades, true);
echo "Quem tem 85? {$chave}" . PHP_EOL;`,output:`bool(true)
bool(false)
int(3)
Quem tem 85? grace`}),e.jsx("h2",{children:"Ordenação: sort, usort e amigos"}),e.jsxs("p",{children:["PHP tem uma família grande de funções de ordenação. Quase todas ",e.jsx("strong",{children:"modificam o array no lugar"})," ","(in-place) e retornam ",e.jsx("code",{children:"bool"}),". Resumo:"]}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"sort / rsort"}),": ordena por valor, descarta as chaves."]}),e.jsxs("li",{children:[e.jsx("code",{children:"asort / arsort"}),": ordena por valor, mantém as chaves."]}),e.jsxs("li",{children:[e.jsx("code",{children:"ksort / krsort"}),": ordena por chave."]}),e.jsxs("li",{children:[e.jsx("code",{children:"usort / uasort / uksort"}),": ordenação customizada via callback."]})]}),e.jsx(a,{filename:"ordenacao.php",code:`<?php
declare(strict_types=1);

$nums = [3, 1, 4, 1, 5, 9, 2, 6];
sort($nums);
print_r($nums);

$idades = ["ada" => 36, "linus" => 30, "grace" => 85];
asort($idades);
print_r($idades);

$users = [
    ["nome" => "Linus", "idade" => 30],
    ["nome" => "Ada", "idade" => 36],
    ["nome" => "Grace", "idade" => 85],
];
usort($users, fn(array $a, array $b): int => $a["idade"] <=> $b["idade"]);
print_r($users);`,output:`Array
(
    [0] => 1
    [1] => 1
    [2] => 2
    [3] => 3
    [4] => 4
    [5] => 5
    [6] => 6
    [7] => 9
)
Array
(
    [linus] => 30
    [ada] => 36
    [grace] => 85
)
Array
(
    [0] => Array
        (
            [nome] => Linus
            [idade] => 30
        )

    [1] => Array
        (
            [nome] => Ada
            [idade] => 36
        )

    [2] => Array
        (
            [nome] => Grace
            [idade] => 85
        )

)`}),e.jsxs(r,{type:"success",title:"O operador spaceship (<=>)",children:["O ",e.jsx("code",{children:"<=>"})," retorna ",e.jsx("code",{children:"-1"}),", ",e.jsx("code",{children:"0"})," ou ",e.jsx("code",{children:"1"})," conforme o primeiro operando seja menor, igual ou maior. É exatamente o que ",e.jsx("code",{children:"usort"})," espera. Para inverter, troque os operandos: ",e.jsx("code",{children:"$b - $a"})," ou ",e.jsx("code",{children:"$b <=> $a"}),"."]}),e.jsx("h2",{children:"array_merge vs operador +"}),e.jsxs("p",{children:["Os dois juntam arrays, mas se comportam de formas ",e.jsx("strong",{children:"diferentes"})," e isso confunde muita gente. A regra é:"]}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"array_merge"}),": chaves numéricas são ",e.jsx("em",{children:"renumeradas"}),"; chaves string são ",e.jsx("em",{children:"sobrescritas"})," pela direita."]}),e.jsxs("li",{children:[e.jsx("code",{children:"+"})," (união): chaves numéricas e string são ",e.jsx("em",{children:"preservadas"}),"; o lado esquerdo ganha em conflito."]})]}),e.jsx(a,{filename:"merge-vs-uniao.php",code:`<?php
declare(strict_types=1);

$a = [1 => "um", 2 => "dois"];
$b = [1 => "ONE", 3 => "tres"];

print_r(array_merge($a, $b));
print_r($a + $b);

$config = ["host" => "localhost", "port" => 5432];
$override = ["port" => 5433, "user" => "admin"];

print_r(array_merge($config, $override));
print_r($config + $override);`,output:`Array
(
    [0] => um
    [1] => dois
    [2] => ONE
    [3] => tres
)
Array
(
    [1] => um
    [2] => dois
    [3] => tres
)
Array
(
    [host] => localhost
    [port] => 5433
    [user] => admin
)
Array
(
    [host] => localhost
    [port] => 5432
    [user] => admin
)`}),e.jsxs(r,{type:"warning",title:"Qual usar?",children:["Para ",e.jsx("strong",{children:"configurações com defaults"})," (overrides vencem) use ",e.jsx("code",{children:"array_merge"}),". Para ",e.jsx("strong",{children:"defaults que não sobrescrevem o que o usuário definiu"})," use ",e.jsx("code",{children:"$user + $defaults"}),". Pense em ",e.jsx("code",{children:"+"}),' como "preencher buracos".']}),e.jsx("h2",{children:"array_combine: zipar duas listas"}),e.jsx("p",{children:"Pega um array de chaves e um array de valores, do mesmo tamanho, e devolve um associativo. Útil quando você lê CSV e quer transformar a primeira linha em chave dos registros."}),e.jsx(a,{filename:"combine.php",code:`<?php
declare(strict_types=1);

$colunas = ["id", "nome", "email"];
$linha = [42, "Ada", "ada@example.com"];

$registro = array_combine($colunas, $linha);
print_r($registro);

$csv = [
    [1, "Ada", "ada@example.com"],
    [2, "Linus", "linus@example.com"],
    [3, "Grace", "grace@example.com"],
];

$registros = array_map(
    fn(array $linha): array => array_combine($colunas, $linha),
    $csv
);
print_r($registros);`,output:`Array
(
    [id] => 42
    [nome] => Ada
    [email] => ada@example.com
)
Array
(
    [0] => Array
        (
            [id] => 1
            [nome] => Ada
            [email] => ada@example.com
        )

    [1] => Array
        (
            [id] => 2
            [nome] => Linus
            [email] => linus@example.com
        )

    [2] => Array
        (
            [id] => 3
            [nome] => Grace
            [email] => grace@example.com
        )

)`}),e.jsx("h2",{children:"Combinando tudo: um pipeline real"}),e.jsx("p",{children:"A força dessas funções aparece quando você as encadeia. Veja um exemplo realista — calcular o ticket médio dos pedidos pagos do mês:"}),e.jsx(a,{filename:"pipeline.php",code:`<?php
declare(strict_types=1);

$pedidos = [
    ["id" => 1, "status" => "pago",     "total" => 120.0],
    ["id" => 2, "status" => "pendente", "total" => 80.0],
    ["id" => 3, "status" => "pago",     "total" => 250.0],
    ["id" => 4, "status" => "cancelado","total" => 99.0],
    ["id" => 5, "status" => "pago",     "total" => 50.0],
];

$pagos = array_filter($pedidos, fn(array $p): bool => $p["status"] === "pago");
$totais = array_column($pagos, "total");
$ticketMedio = array_sum($totais) / count($totais);

echo "Pagos: " . count($pagos) . PHP_EOL;
echo "Soma: R$ " . array_sum($totais) . PHP_EOL;
echo "Ticket médio: R$ " . number_format($ticketMedio, 2, ",", ".") . PHP_EOL;`,output:`Pagos: 3
Soma: R$ 420
Ticket médio: R$ 140,00`}),e.jsxs("p",{children:["Esse mesmo cálculo escrito com ",e.jsx("code",{children:"foreach"})," teria 15 linhas e várias variáveis temporárias. Aqui cabe em três expressões legíveis. Esse é o ganho real das funções de array — código que diz",e.jsx("strong",{children:" o que"})," faz, não ",e.jsx("em",{children:"como"}),"."]})]})}export{c as default};
