import{j as e}from"./index-B5-q-eol.js";import{P as s,A as a,a as o}from"./AlertBox-CVbFLZEd.js";import{T as r}from"./TerminalBlock-6fqVIX2R.js";function n(){return e.jsxs(s,{title:"Tipos primitivos",subtitle:"A zoologia completa dos tipos do PHP — escalares, compostos e especiais — mais as ferramentas para inspecionar, converter e domar o famoso type juggling.",difficulty:"iniciante",timeToRead:"12 min",category:"Sintaxe Básica",children:[e.jsx(a,{type:"info",title:"Pré-requisitos",children:e.jsxs("p",{children:["Antes deste capítulo, é bom já ter visto: ",e.jsx("a",{href:"#/sintaxe",className:"text-[#8993BE] underline",children:"Sintaxe básica"}),", ",e.jsx("a",{href:"#/variaveis",className:"text-[#8993BE] underline",children:"Variáveis"}),"."]})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Escalares"})," "," — "," ","int, float, string, bool — guardam um único valor."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Compostos"})," "," — "," ","array e object — guardam coleções/estruturas."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Especiais"})," "," — "," ","null e resource — ausência de valor / handle externo."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"gettype() / var_dump()"})," "," — "," ","descobrem o tipo em runtime; var_dump mostra tipo + valor."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Type juggling"})," "," — "," ","conversão automática de tipos em comparações soltas (==)."]})]}),e.jsx("h2",{children:"Os dez tipos que você precisa conhecer"}),e.jsxs("p",{children:["PHP tem um conjunto pequeno e bem definido de tipos. Vamos começar criando um exemplo de cada e usando ",e.jsx("code",{children:"gettype()"})," para confirmar quem é quem:"]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"gettype"})," — devolve o nome do tipo de uma variável como string. Tem nomes históricos (",e.jsx("code",{children:'"integer"'}),", ",e.jsx("code",{children:'"double"'}),") — para código novo prefira ",e.jsx("code",{children:"get_debug_type()"}),", mais consistente."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"get_debug_type"})," — versão moderna (PHP 8+) que devolve nomes curtos: ",e.jsx("code",{children:"int"}),", ",e.jsx("code",{children:"float"}),", ",e.jsx("code",{children:"string"}),", ",e.jsx("code",{children:"bool"}),", ",e.jsx("code",{children:"null"}),", ",e.jsx("code",{children:"array"}),", ou o FQCN da classe para objetos. Use sempre que possível."]}),e.jsx(o,{filename:"tipos.php",code:`<?php
declare(strict_types=1);

$idade        = 30;                       // int
$preco        = 19.90;                    // float
$nome         = "Ada";                    // string
$ativo        = true;                     // bool
$nada         = null;                     // null
$cores        = ["vermelho", "azul"];     // array
$obj          = new stdClass();           // object
$callback     = strtoupper(...);          // callable (first-class callable, PHP 8.1+)
$gerador      = (function () { yield 1; })(); // iterable

foreach ([$idade, $preco, $nome, $ativo, $nada, $cores, $obj, $callback, $gerador] as $v) {
    echo gettype($v) . PHP_EOL;
}`,output:`integer
double
string
boolean
NULL
array
object
object
object`}),e.jsxs(a,{type:"info",title:"Por que 'double' e 'integer'?",children:[e.jsx("code",{children:"gettype()"})," tem nomes históricos: devolve ",e.jsx("code",{children:'"integer"'})," para int e",e.jsx("code",{children:' "double"'})," para float. Para checagem moderna, prefira"," ",e.jsx("code",{children:"get_debug_type($v)"})," (PHP 8+), que devolve ",e.jsx("code",{children:"int"}),", ",e.jsx("code",{children:"float"}),",",e.jsx("code",{children:" string"}),", ",e.jsx("code",{children:"bool"}),", ",e.jsx("code",{children:"null"}),", ",e.jsx("code",{children:"array"})," e o nome da classe para objetos."]}),e.jsx("h2",{children:"Escalares: int, float, string, bool"}),e.jsxs("p",{children:["Os quatro tipos escalares carregam um único valor. ",e.jsx("code",{children:"int"})," tem o tamanho da plataforma (em geral 64 bits); ",e.jsx("code",{children:"float"})," segue IEEE 754 de precisão dupla;"," ",e.jsx("code",{children:"string"})," é uma sequência de bytes (não chars Unicode!); ",e.jsx("code",{children:"bool"})," só existe como ",e.jsx("code",{children:"true"})," ou ",e.jsx("code",{children:"false"}),"."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"heredoc"})," e ",e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"nowdoc"})," — sintaxes para strings multi-linha. ",e.jsx("code",{children:"<<<TXT … TXT;"})," (heredoc) interpola variáveis como aspas duplas; ",e.jsx("code",{children:"<<<'TXT' … TXT;"})," (nowdoc, com aspas simples no rótulo) é literal como aspas simples."]}),e.jsx(o,{filename:"escalares.php",code:`<?php
declare(strict_types=1);

// int aceita decimal, hexa, octal, binário
$dec = 42;
$hex = 0x2A;     // 42
$oct = 0o52;     // 42 (PHP 8.1+)
$bin = 0b101010; // 42
$big = 1_000_000; // separador de milhares

echo "$dec $hex $oct $bin $big" . PHP_EOL;

// float
$pi = 3.14;
$cientifico = 1.5e3;  // 1500
echo PHP_FLOAT_EPSILON . PHP_EOL;

// string com heredoc e nowdoc
$nome = "mundo";
$saudacao = {"<<<"}TXT
Olá, $nome!
Heredoc interpola variáveis.
TXT;

$literal = {"<<<"}'TXT'
Nada interpola: $nome continua literal.
TXT;

echo $saudacao . PHP_EOL;
echo $literal . PHP_EOL;`,output:`42 42 42 42 1000000
2.2204460492503E-16
Olá, mundo!
Heredoc interpola variáveis.
Nada interpola: $nome continua literal.`}),e.jsx("h2",{children:'null: o "ainda não tenho valor"'}),e.jsxs("p",{children:[e.jsx("code",{children:"null"})," é o tipo que tem um único valor possível (também chamado ",e.jsx("code",{children:"null"}),'). Representa "ausência de valor" — diferente de ',e.jsx("code",{children:"0"}),", ",e.jsx("code",{children:'""'})," ou"," ",e.jsx("code",{children:"false"}),". Funções que não dão ",e.jsx("code",{children:"return"})," explícito retornam"," ",e.jsx("code",{children:"null"})," implicitamente."]}),e.jsx(o,{filename:"null.php",code:`<?php
declare(strict_types=1);

function buscarUsuario(int $id): ?string {
    $banco = [1 => "Ada", 2 => "Linus"];
    return $banco[$id] ?? null;
}

$nome = buscarUsuario(99);
var_dump($nome);
var_dump($nome === null);
var_dump(is_null($nome));`,output:`NULL
bool(true)
bool(true)`}),e.jsx("h2",{children:"Compostos: array, object, callable, iterable"}),e.jsxs("p",{children:["Tipos compostos guardam estruturas. ",e.jsx("code",{children:"array"})," é o canivete suíço do PHP — funciona como lista, mapa ou ambos ao mesmo tempo. ",e.jsx("code",{children:"object"})," é uma instância de uma classe.",e.jsx("code",{children:" callable"})," e ",e.jsx("code",{children:"iterable"})," são ",e.jsx("em",{children:"pseudo-tipos"}),' usados em type hints, descrevendo "qualquer coisa chamável" e "qualquer coisa iterável".']}),e.jsx(o,{filename:"compostos.php",code:`<?php
declare(strict_types=1);

// array misto: indexado + associativo
$produto = [
    "nome" => "Café",
    "preco" => 24.90,
    "tags" => ["bebida", "manhã"],
];

// object via classe com constructor promotion
class Usuario {
    public function __construct(
        public readonly string $nome,
        public readonly int $idade,
    ) {}
}
$u = new Usuario("Ada", 36);

// callable em type hint
function aplicar(callable $fn, mixed $valor): mixed {
    return $fn($valor);
}
echo aplicar(strtoupper(...), "olá") . PHP_EOL;

// iterable aceita array OU Generator/Traversable
function somar(iterable $itens): int {
    $total = 0;
    foreach ($itens as $i) $total += $i;
    return $total;
}
echo somar([1, 2, 3]) . PHP_EOL;
echo somar((function () { yield 10; yield 20; })()) . PHP_EOL;

print_r($produto);
print_r($u);`,output:`OLÁ
6
30
Array
(
    [nome] => Café
    [preco] => 24.9
    [tags] => Array
        (
            [0] => bebida
            [1] => manhã
        )
)
Usuario Object
(
    [nome] => Ada
    [idade] => 36
)`}),e.jsx("h2",{children:'mixed: o "qualquer tipo" explícito'}),e.jsxs("p",{children:[e.jsx("code",{children:"mixed"}),' (PHP 8+) é o type hint que diz "esta variável pode ser literalmente qualquer coisa". Use quando você ',e.jsx("strong",{children:"realmente"})," precisa aceitar tudo (raro). Na maioria dos casos, prefira uma união específica como ",e.jsx("code",{children:"int|string"}),"."]}),e.jsx(o,{filename:"mixed.php",code:`<?php
declare(strict_types=1);

function descrever(mixed $valor): string {
    return get_debug_type($valor) . " => " . var_export($valor, true);
}

echo descrever(42) . PHP_EOL;
echo descrever("texto") . PHP_EOL;
echo descrever([1, 2]) . PHP_EOL;
echo descrever(null) . PHP_EOL;
echo descrever(new stdClass()) . PHP_EOL;`,output:`int => 42
string => 'texto'
array => array (
  0 => 1,
  1 => 2,
)
null => NULL
stdClass => (object) array(
)`}),e.jsx("h2",{children:"Inspecionando: var_dump, print_r, var_export"}),e.jsx("p",{children:"Três funções, três usos. Memorize a diferença — você vai usar todo dia ao debugar:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"var_dump($x)"})," — mostra tipo e valor. Ideal para debug."]}),e.jsxs("li",{children:[e.jsx("code",{children:"print_r($x)"})," — formato amigável para arrays e objetos. Sem tipos."]}),e.jsxs("li",{children:[e.jsx("code",{children:"var_export($x)"})," — devolve uma representação ",e.jsx("em",{children:"válida em PHP"})," (você poderia colar de volta em um ",e.jsx("code",{children:".php"}),")."]})]}),e.jsx(o,{filename:"inspecao.php",code:`<?php
declare(strict_types=1);

$dados = ["id" => 1, "ativo" => true, "tags" => ["a", "b"]];

echo "--- var_dump ---" . PHP_EOL;
var_dump($dados);

echo "--- print_r ---" . PHP_EOL;
print_r($dados);

echo "--- var_export ---" . PHP_EOL;
var_export($dados);
echo PHP_EOL;`,output:`--- var_dump ---
array(3) {
  ["id"]=>
  int(1)
  ["ativo"]=>
  bool(true)
  ["tags"]=>
  array(2) {
    [0]=>
    string(1) "a"
    [1]=>
    string(1) "b"
  }
}
--- print_r ---
Array
(
    [id] => 1
    [ativo] => 1
    [tags] => Array
        (
            [0] => a
            [1] => b
        )
)
--- var_export ---
array (
  'id' => 1,
  'ativo' => true,
  'tags' =>
  array (
    0 => 'a',
    1 => 'b',
  ),
)`}),e.jsx("h2",{children:"Type juggling: a magia traiçoeira"}),e.jsxs("p",{children:["Sem ",e.jsx("code",{children:"strict_types"}),", o PHP ",e.jsx("strong",{children:"converte tipos automaticamente"})," em comparações, operações e parâmetros de função. Isso se chama ",e.jsx("em",{children:"type juggling"})," e é a causa de bugs sutis. Veja:"]}),e.jsx(o,{filename:"juggling.php",code:`<?php
// Note: SEM declare(strict_types=1) propositalmente

var_dump("10" + 5);       // int(15) — string vira int
var_dump("10abc" + 5);    // int(15) — em PHP 8 gera Warning
var_dump("abc" + 5);      // int(5)  — em PHP 8 gera TypeError em contexto numérico

var_dump("0" == false);   // true
var_dump(null == 0);      // true
var_dump("php" == 0);     // false (em PHP 8; era true em PHP 7!)

var_dump(0 == "0");       // true
var_dump(1 == "1abc");    // false em PHP 8 (era true em PHP 7)`,output:`int(15)
PHP Warning:  A non-numeric value encountered
int(15)
PHP Warning:  A non-numeric value encountered
int(5)
bool(true)
bool(true)
bool(false)
bool(true)
bool(false)`}),e.jsxs(a,{type:"danger",title:"A regra que te salva",children:[e.jsx("strong",{children:"Sempre"})," use ",e.jsx("code",{children:"declare(strict_types=1);"})," no topo dos seus arquivos e ",e.jsx("strong",{children:"sempre"})," compare com ",e.jsx("code",{children:"==="})," (estrito) em vez de ",e.jsx("code",{children:"=="}),". Isso elimina 90% das pegadinhas de tipo do PHP."]}),e.jsx("h2",{children:"Casting explícito: (int), (string), intval e amigos"}),e.jsxs("p",{children:["Quando você precisa converter de propósito, o PHP oferece duas formas: ",e.jsx("em",{children:"cast"})," com parênteses e funções dedicadas. Use a forma que melhor expressa a intenção e que aceita os casos extremos que você precisa."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"(int) (string) (bool) (array) (object)"})," — casts explícitos com parênteses na frente do valor. Convertem do jeito do PHP: ",e.jsx("code",{children:'(int) "30 anos"'})," dá ",e.jsx("code",{children:"30"}),"; ",e.jsx("code",{children:'(bool) "0"'})," dá ",e.jsx("code",{children:"false"})," (caso especial!). Curtos e idiomáticos."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"intval / floatval / strval"})," — funções equivalentes aos casts, com mais opções: ",e.jsx("code",{children:'intval("ff", 16)'})," aceita base, ",e.jsx("code",{children:"intval($x, 0)"})," autodetecta. Use quando precisar de bases ou quiser passar como callable."]}),e.jsx(o,{filename:"casting.php",code:`<?php
declare(strict_types=1);

// Cast com parênteses
$idade = (int) "30 anos";       // 30 (para de ler no primeiro não-dígito)
$preco = (float) "19,90";       // 19.0 (vírgula não é separador decimal!)
$preco_ok = (float) "19.90";    // 19.9
$texto = (string) 42;            // "42"
$flag  = (bool) "0";             // false (caso especial)
$flag2 = (bool) "false";         // true (string não vazia!)

var_dump($idade, $preco, $preco_ok, $texto, $flag, $flag2);

// Funções: mais opções e mais segurança
$bin  = intval("0b101010", 0);  // 42 — base autodetectada
$hex  = intval("ff", 16);       // 255
$num  = floatval("19,90");       // 19.0 (idem)

// Casts especiais para arrays e objetos
$arr  = (array) "olá";          // ["olá"]
$obj  = (object) ["nome" => "Ada"]; // stdClass com ->nome
echo $obj->nome . PHP_EOL;`,output:`int(30)
float(19)
float(19.9)
string(2) "42"
bool(false)
bool(true)
Ada`}),e.jsx("h2",{children:"Checando tipos: is_* e instanceof"}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"is_int / is_float / is_string / is_bool / is_null / is_array / is_object"})," — família de funções booleanas: cada uma testa se a variável é daquele tipo. Mais legível que comparar com ",e.jsx("code",{children:"gettype()"}),"."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"match"})," — expressão de PHP 8 parecida com ",e.jsx("code",{children:"switch"}),", mas que ",e.jsx("em",{children:"retorna valor"}),", usa comparação estrita (",e.jsx("code",{children:"==="}),") e não precisa de ",e.jsx("code",{children:"break"}),". Detalhada no capítulo de Switch/Match."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"::class"})," — devolve o nome totalmente qualificado da classe como string em tempo de compilação. ",e.jsx("code",{children:"$v::class"})," (PHP 8+) é equivalente a ",e.jsx("code",{children:"get_class($v)"}),"."]}),e.jsx(o,{filename:"checagem.php",code:`<?php
declare(strict_types=1);

$valores = [1, 1.5, "ok", true, null, [1,2], new stdClass()];

foreach ($valores as $v) {
    echo match (true) {
        is_int($v)    => "int",
        is_float($v)  => "float",
        is_string($v) => "string",
        is_bool($v)   => "bool",
        is_null($v)   => "null",
        is_array($v)  => "array",
        is_object($v) => "object: " . $v::class,
        default       => "desconhecido",
    } . PHP_EOL;
}`,output:`int
float
string
bool
null
array
object: stdClass`}),e.jsx("h2",{children:"Rodando os exemplos"}),e.jsx(r,{user:"dev",host:"php",cwd:"~/projetos/php-book",command:"php tipos.php",output:`integer
double
string
boolean
NULL
array
object
object
object`}),e.jsxs("p",{children:["Agora que você reconhece todo bicho do zoológico de tipos, o próximo passo é dominar os"," ",e.jsx("strong",{children:"operadores"})," — onde os tipos se encontram e onde mora o famoso"," ",e.jsx("code",{children:"=="})," vs ",e.jsx("code",{children:"==="})," que separa juniores de pleitos."]})]})}export{n as default};
