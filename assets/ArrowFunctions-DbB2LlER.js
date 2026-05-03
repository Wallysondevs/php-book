import{j as e}from"./index-B5-q-eol.js";import{P as o,A as r,a}from"./AlertBox-CVbFLZEd.js";function n(){return e.jsxs(o,{title:"Arrow functions e Closures",subtitle:"Funções anônimas em PHP: a sintaxe curta fn() => para uma linha, closures clássicas com use(), referências mutáveis e o truque do bindTo.",difficulty:"intermediario",timeToRead:"11 min",category:"Funções",children:[e.jsx(r,{type:"info",title:"Pré-requisitos",children:e.jsxs("p",{children:["Antes deste capítulo, é bom já ter visto: ",e.jsx("a",{href:"#/funcoes",className:"text-[#8993BE] underline",children:"Funções básicas"}),", ",e.jsx("a",{href:"#/type-hints",className:"text-[#8993BE] underline",children:"Type hints"}),", ",e.jsx("a",{href:"#/array-functions",className:"text-[#8993BE] underline",children:"Array functions"}),"."]})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"fn() => expr"})," "," — "," ","sintaxe curta de closure (PHP 7.4+); só uma expressão."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Captura automática"})," "," — "," ","arrow functions enxergam variáveis do escopo pai sem use()."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"vs closure"})," "," — "," ","closure aceita múltiplas linhas e use() explícito."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Imutabilidade"})," "," — "," ","sempre por valor — não há captura por referência."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Uso típico"})," "," — "," ","callbacks de array_map, array_filter, usort."]})]}),e.jsx("h2",{children:"O problema: passar comportamento como argumento"}),e.jsxs("p",{children:["Funções como ",e.jsx("code",{children:"array_map"}),", ",e.jsx("code",{children:"array_filter"})," e ",e.jsx("code",{children:"usort"})," esperam que você diga ",e.jsx("em",{children:"como"})," transformar/filtrar/comparar os elementos. Declarar uma função nomeada só para usar uma vez é desperdício de neurônio. Para isso existem as"," ",e.jsx("strong",{children:"funções anônimas"})," — closures e arrow functions."]}),e.jsx(a,{filename:"map-clas.php",code:`<?php
declare(strict_types=1);

$precos = [10.0, 25.5, 49.9, 100.0];

// Versão verbosa: closure clássica
$comImposto = array_map(function (float $p): float {
    return $p * 1.1;
}, $precos);

print_r($comImposto);`,output:`Array
(
    [0] => 11
    [1] => 28.05
    [2] => 54.89
    [3] => 110
)`}),e.jsx("h2",{children:"Arrow functions (PHP 7.4+): a forma curta"}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"fn() =>"})," — sintaxe curta para função anônima de ",e.jsx("strong",{children:"uma única expressão"})," (PHP 7.4+). Existe para callbacks rápidos em ",e.jsx("code",{children:"array_map"}),", ",e.jsx("code",{children:"array_filter"}),", etc. Sintaxe: ",e.jsx("code",{children:"fn(int $n) => $n * 2"}),". Captura variáveis externas ",e.jsx("em",{children:"automaticamente por valor"})," — sem precisar de ",e.jsx("code",{children:"use()"}),"."]}),e.jsxs("p",{children:["Quando a função tem ",e.jsx("strong",{children:"uma única expressão"}),", use a sintaxe"," ",e.jsx("code",{children:"fn(args) => expressao"}),". Sem chaves, sem ",e.jsx("code",{children:"return"}),", sem"," ",e.jsx("code",{children:"use()"})," — variáveis do escopo externo são capturadas ",e.jsx("strong",{children:"automaticamente por valor"}),"."]}),e.jsx(a,{filename:"arrow.php",code:`<?php
declare(strict_types=1);

$precos = [10.0, 25.5, 49.9, 100.0];
$taxa = 1.10;

$comImposto = array_map(fn(float $p): float => $p * $taxa, $precos);
print_r($comImposto);

// Filtrando: só os caros
$caros = array_filter($precos, fn(float $p) => $p > 30);
print_r($caros);

// Combinando: dobrar todos os pares
$numeros = [1, 2, 3, 4, 5, 6];
$paresDobrados = array_map(
    fn(int $n) => $n * 2,
    array_filter($numeros, fn(int $n) => $n % 2 === 0)
);
print_r($paresDobrados);`,output:`Array
(
    [0] => 11
    [1] => 28.05
    [2] => 54.89
    [3] => 110
)
Array
(
    [2] => 49.9
    [3] => 100
)
Array
(
    [1] => 4
    [3] => 8
    [5] => 12
)`}),e.jsxs(r,{type:"info",title:"Quando NÃO usar arrow function",children:["Arrow functions são limitadas a ",e.jsx("strong",{children:"uma única expressão"}),". Se precisa de",e.jsx("code",{children:"if"}),", várias linhas ou um log no meio, volte para a closure clássica com"," ",e.jsxs("code",{children:["function() ","{...}"]}),"."]}),e.jsx("h2",{children:"Closure clássica e a palavra-chave use"}),e.jsxs("p",{children:["A closure tradicional (",e.jsxs("code",{children:["function () ","{...}"]}),") ",e.jsx("strong",{children:"não captura automaticamente"})," variáveis do escopo externo. Você precisa listá-las explicitamente com ",e.jsx("code",{children:"use ($var)"}),". Por padrão a captura é ",e.jsx("em",{children:"por valor"})," — uma cópia no momento em que a closure é criada."]}),e.jsx(a,{filename:"closure-use.php",code:`<?php
declare(strict_types=1);

$prefixo = "INFO: ";

// captura por valor — fotografa $prefixo agora
$logger = function (string $msg) use ($prefixo): void {
    echo $prefixo . $msg . PHP_EOL;
};

$logger("aplicação iniciada");

$prefixo = "DEBUG: "; // mudou aqui fora
$logger("usuário logado"); // mas a closure ainda usa a cópia antiga`,output:`INFO: aplicação iniciada
INFO: usuário logado`}),e.jsx("h2",{children:"use por referência: &$var"}),e.jsxs("p",{children:["Para a closure compartilhar a mesma variável (e ver alterações de fora, ou alterar de dentro), use o ",e.jsx("code",{children:"&"}),". É o padrão para construir contadores e acumuladores."]}),e.jsx(a,{filename:"closure-ref.php",code:`<?php
declare(strict_types=1);

$contador = 0;

$incrementar = function () use (&$contador): void {
    $contador++;
};

$incrementar();
$incrementar();
$incrementar();

echo "chamou {$contador} vezes" . PHP_EOL;

// acumulador funcional
$total = 0;
array_walk([10, 20, 30, 40], function (int $v) use (&$total) {
    $total += $v;
});
echo "soma = {$total}";`,output:`chamou 3 vezes
soma = 100`}),e.jsxs(r,{type:"warning",title:"Arrow function não tem use",children:["Lembre-se: ",e.jsx("code",{children:"fn()"})," captura tudo automaticamente, mas ",e.jsx("strong",{children:"sempre por valor"}),". Se você precisa modificar uma variável externa, use closure clássica com"," ",e.jsx("code",{children:"use (&$var)"}),"."]}),e.jsx("h2",{children:"bindTo: closures que viram métodos de objeto"}),e.jsxs("p",{children:["Toda closure em PHP é um objeto da classe ",e.jsx("code",{children:"Closure"}),". O método"," ",e.jsx("code",{children:"bindTo($obj, $escopo)"})," devolve uma nova closure que enxerga"," ",e.jsx("code",{children:"$this"})," como se fosse um método do objeto passado. Útil para estender objetos sem subclassificar, ou para hooks dinâmicos."]}),e.jsx(a,{filename:"bindto.php",code:`<?php
declare(strict_types=1);

class Conta {
    private float $saldo = 0.0;

    public function saldo(): float {
        return $this->saldo;
    }
}

$injetarBonus = function (float $valor): void {
    $this->saldo += $valor; // só funciona se $this for definido
};

$conta = new Conta();

// liga a closure ao objeto $conta no escopo da classe Conta
$bonificar = Closure::bind($injetarBonus, $conta, Conta::class);
$bonificar(50.0);
$bonificar(25.5);

echo "saldo final: " . $conta->saldo();`,output:"saldo final: 75.5"}),e.jsxs(r,{type:"info",title:"bindTo vs Closure::bind",children:[e.jsx("code",{children:"$closure->bindTo($obj, $escopo)"})," é o método de instância;"," ",e.jsx("code",{children:"Closure::bind($closure, $obj, $escopo)"})," é o estático equivalente. O segundo parâmetro é a classe cujo escopo (privado/protegido) a closure terá acesso."]}),e.jsx("h2",{children:"Caso real: pipeline de transformações"}),e.jsxs("p",{children:["Combine arrow functions com ",e.jsx("code",{children:"array_map"}),", ",e.jsx("code",{children:"array_filter"})," e"," ",e.jsx("code",{children:"array_reduce"})," para escrever pipelines declarativos — o jeito moderno de tratar listas em PHP."]}),e.jsx(a,{filename:"pipeline.php",code:`<?php
declare(strict_types=1);

$pedidos = [
    ["produto" => "café",     "qtd" => 2, "preco" => 15.0],
    ["produto" => "pão",      "qtd" => 6, "preco" => 1.5],
    ["produto" => "manteiga", "qtd" => 1, "preco" => 22.0],
    ["produto" => "geleia",   "qtd" => 1, "preco" => 18.5],
];

$totalAcima10 = array_reduce(
    array_filter(
        array_map(
            fn(array $p) => ["nome" => $p["produto"], "total" => $p["qtd"] * $p["preco"]],
            $pedidos
        ),
        fn(array $p) => $p["total"] >= 10
    ),
    fn(float $acc, array $p) => $acc + $p["total"],
    0.0
);

echo "total dos itens >= R$ 10,00: R$ " . number_format($totalAcima10, 2, ",", ".");`,output:"total dos itens >= R$ 10,00: R$ 71,00"}),e.jsx("h2",{children:"Closure como first-class citizen"}),e.jsxs("p",{children:["Closures podem ser armazenadas em variáveis, propriedades, arrays — passadas para qualquer lugar. PHP 8.1 adicionou a sintaxe ",e.jsx("code",{children:"nome(...)"})," para transformar uma função nomeada (ou método) em closure de primeira classe. É o jeito moderno e seguro."]}),e.jsx(a,{filename:"first-class.php",code:`<?php
declare(strict_types=1);

class Calculadora {
    public function dobrar(int $n): int {
        return $n * 2;
    }
}

$calc = new Calculadora();

// método de instância como closure
$dobrar = $calc->dobrar(...);
print_r(array_map($dobrar, [1, 2, 3]));

// função nativa também vira closure
$absoluto = abs(...);
print_r(array_map($absoluto, [-3, -1, 0, 5]));`,output:`Array
(
    [0] => 2
    [1] => 4
    [2] => 6
)
Array
(
    [0] => 3
    [1] => 1
    [2] => 0
    [3] => 5
)`}),e.jsx("h2",{children:"Resumo prático"}),e.jsxs("ul",{children:[e.jsxs("li",{children:["Uma expressão? Use ",e.jsx("code",{children:"fn() => ..."}),". Captura é automática por valor."]}),e.jsxs("li",{children:["Mais de uma linha? ",e.jsxs("code",{children:["function () use ($x) ","{...}"]}),"."]}),e.jsxs("li",{children:["Para mutar variáveis externas: ",e.jsx("code",{children:"use (&$x)"}),"."]}),e.jsxs("li",{children:[e.jsx("code",{children:"bindTo"})," permite acessar ",e.jsx("code",{children:"$this"})," e escopo privado de qualquer classe."]}),e.jsxs("li",{children:["Para passar funções/métodos adiante: ",e.jsx("code",{children:"nome(...)"})," ou ",e.jsx("code",{children:"$obj->metodo(...)"}),"."]})]}),e.jsxs("p",{children:["No próximo capítulo a gente termina a trilha de funções com ",e.jsx("strong",{children:"argumentos"}),": defaults, nomeados, variadic e o operador splat. É o que falta para você dominar a assinatura de qualquer função PHP moderna."]})]})}export{n as default};
