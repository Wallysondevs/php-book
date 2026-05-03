import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Tipos() {
  return (
    <PageContainer
      title="Tipos primitivos"
      subtitle="A zoologia completa dos tipos do PHP — escalares, compostos e especiais — mais as ferramentas para inspecionar, converter e domar o famoso type juggling."
      difficulty="iniciante"
      timeToRead="12 min"
      category="Sintaxe Básica"
    >
      <AlertBox type="info" title="Pré-requisitos">
        <p>Antes deste capítulo, é bom já ter visto: <a href="#/sintaxe" className="text-[#8993BE] underline">Sintaxe básica</a>, <a href="#/variaveis" className="text-[#8993BE] underline">Variáveis</a>.</p>
      </AlertBox>
      <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"Escalares"}</strong> {' — '} {"int, float, string, bool — guardam um único valor."}
          </li>
        <li>
            <strong>{"Compostos"}</strong> {' — '} {"array e object — guardam coleções/estruturas."}
          </li>
        <li>
            <strong>{"Especiais"}</strong> {' — '} {"null e resource — ausência de valor / handle externo."}
          </li>
        <li>
            <strong>{"gettype() / var_dump()"}</strong> {' — '} {"descobrem o tipo em runtime; var_dump mostra tipo + valor."}
          </li>
        <li>
            <strong>{"Type juggling"}</strong> {' — '} {"conversão automática de tipos em comparações soltas (==)."}
          </li>
        </ul>
    
      <h2>Os dez tipos que você precisa conhecer</h2>
      <p>
        PHP tem um conjunto pequeno e bem definido de tipos. Vamos começar criando um exemplo
        de cada e usando <code>gettype()</code> para confirmar quem é quem:
      </p>

      <p><strong className="text-[#8993BE] font-mono">gettype</strong> — devolve o nome do tipo de uma variável como string. Tem nomes históricos (<code>"integer"</code>, <code>"double"</code>) — para código novo prefira <code>get_debug_type()</code>, mais consistente.</p>
      <p><strong className="text-[#8993BE] font-mono">get_debug_type</strong> — versão moderna (PHP 8+) que devolve nomes curtos: <code>int</code>, <code>float</code>, <code>string</code>, <code>bool</code>, <code>null</code>, <code>array</code>, ou o FQCN da classe para objetos. Use sempre que possível.</p>

      <PhpBlock
        filename="tipos.php"
        code={`<?php
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
}`}
        output={`integer
double
string
boolean
NULL
array
object
object
object`}
      />

      <AlertBox type="info" title="Por que 'double' e 'integer'?">
        <code>gettype()</code> tem nomes históricos: devolve <code>"integer"</code> para int e
        <code> "double"</code> para float. Para checagem moderna, prefira{" "}
        <code>get_debug_type($v)</code> (PHP 8+), que devolve <code>int</code>, <code>float</code>,
        <code> string</code>, <code>bool</code>, <code>null</code>, <code>array</code> e o nome da
        classe para objetos.
      </AlertBox>

      <h2>Escalares: int, float, string, bool</h2>
      <p>
        Os quatro tipos escalares carregam um único valor. <code>int</code> tem o tamanho da
        plataforma (em geral 64 bits); <code>float</code> segue IEEE 754 de precisão dupla;{" "}
        <code>string</code> é uma sequência de bytes (não chars Unicode!); <code>bool</code> só
        existe como <code>true</code> ou <code>false</code>.
      </p>

      <p><strong className="text-[#8993BE] font-mono">heredoc</strong> e <strong className="text-[#8993BE] font-mono">nowdoc</strong> — sintaxes para strings multi-linha. <code>&lt;&lt;&lt;TXT … TXT;</code> (heredoc) interpola variáveis como aspas duplas; <code>&lt;&lt;&lt;'TXT' … TXT;</code> (nowdoc, com aspas simples no rótulo) é literal como aspas simples.</p>

      <PhpBlock
        filename="escalares.php"
        code={`<?php
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
echo $literal . PHP_EOL;`}
        output={`42 42 42 42 1000000
2.2204460492503E-16
Olá, mundo!
Heredoc interpola variáveis.
Nada interpola: $nome continua literal.`}
      />

      <h2>null: o "ainda não tenho valor"</h2>
      <p>
        <code>null</code> é o tipo que tem um único valor possível (também chamado <code>null</code>).
        Representa "ausência de valor" — diferente de <code>0</code>, <code>""</code> ou{" "}
        <code>false</code>. Funções que não dão <code>return</code> explícito retornam{" "}
        <code>null</code> implicitamente.
      </p>

      <PhpBlock
        filename="null.php"
        code={`<?php
declare(strict_types=1);

function buscarUsuario(int $id): ?string {
    $banco = [1 => "Ada", 2 => "Linus"];
    return $banco[$id] ?? null;
}

$nome = buscarUsuario(99);
var_dump($nome);
var_dump($nome === null);
var_dump(is_null($nome));`}
        output={`NULL
bool(true)
bool(true)`}
      />

      <h2>Compostos: array, object, callable, iterable</h2>
      <p>
        Tipos compostos guardam estruturas. <code>array</code> é o canivete suíço do PHP — funciona
        como lista, mapa ou ambos ao mesmo tempo. <code>object</code> é uma instância de uma classe.
        <code> callable</code> e <code>iterable</code> são <em>pseudo-tipos</em> usados em type
        hints, descrevendo "qualquer coisa chamável" e "qualquer coisa iterável".
      </p>

      <PhpBlock
        filename="compostos.php"
        code={`<?php
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
print_r($u);`}
        output={`OLÁ
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
)`}
      />

      <h2>mixed: o "qualquer tipo" explícito</h2>
      <p>
        <code>mixed</code> (PHP 8+) é o type hint que diz "esta variável pode ser literalmente
        qualquer coisa". Use quando você <strong>realmente</strong> precisa aceitar tudo (raro).
        Na maioria dos casos, prefira uma união específica como <code>int|string</code>.
      </p>

      <PhpBlock
        filename="mixed.php"
        code={`<?php
declare(strict_types=1);

function descrever(mixed $valor): string {
    return get_debug_type($valor) . " => " . var_export($valor, true);
}

echo descrever(42) . PHP_EOL;
echo descrever("texto") . PHP_EOL;
echo descrever([1, 2]) . PHP_EOL;
echo descrever(null) . PHP_EOL;
echo descrever(new stdClass()) . PHP_EOL;`}
        output={`int => 42
string => 'texto'
array => array (
  0 => 1,
  1 => 2,
)
null => NULL
stdClass => (object) array(
)`}
      />

      <h2>Inspecionando: var_dump, print_r, var_export</h2>
      <p>
        Três funções, três usos. Memorize a diferença — você vai usar todo dia ao debugar:
      </p>
      <ul>
        <li><code>var_dump($x)</code> — mostra tipo e valor. Ideal para debug.</li>
        <li><code>print_r($x)</code> — formato amigável para arrays e objetos. Sem tipos.</li>
        <li><code>var_export($x)</code> — devolve uma representação <em>válida em PHP</em> (você poderia colar de volta em um <code>.php</code>).</li>
      </ul>

      <PhpBlock
        filename="inspecao.php"
        code={`<?php
declare(strict_types=1);

$dados = ["id" => 1, "ativo" => true, "tags" => ["a", "b"]];

echo "--- var_dump ---" . PHP_EOL;
var_dump($dados);

echo "--- print_r ---" . PHP_EOL;
print_r($dados);

echo "--- var_export ---" . PHP_EOL;
var_export($dados);
echo PHP_EOL;`}
        output={`--- var_dump ---
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
)`}
      />

      <h2>Type juggling: a magia traiçoeira</h2>
      <p>
        Sem <code>strict_types</code>, o PHP <strong>converte tipos automaticamente</strong> em
        comparações, operações e parâmetros de função. Isso se chama <em>type juggling</em> e é a
        causa de bugs sutis. Veja:
      </p>

      <PhpBlock
        filename="juggling.php"
        code={`<?php
// Note: SEM declare(strict_types=1) propositalmente

var_dump("10" + 5);       // int(15) — string vira int
var_dump("10abc" + 5);    // int(15) — em PHP 8 gera Warning
var_dump("abc" + 5);      // int(5)  — em PHP 8 gera TypeError em contexto numérico

var_dump("0" == false);   // true
var_dump(null == 0);      // true
var_dump("php" == 0);     // false (em PHP 8; era true em PHP 7!)

var_dump(0 == "0");       // true
var_dump(1 == "1abc");    // false em PHP 8 (era true em PHP 7)`}
        output={`int(15)
PHP Warning:  A non-numeric value encountered
int(15)
PHP Warning:  A non-numeric value encountered
int(5)
bool(true)
bool(true)
bool(false)
bool(true)
bool(false)`}
      />

      <AlertBox type="danger" title="A regra que te salva">
        <strong>Sempre</strong> use <code>declare(strict_types=1);</code> no topo dos seus arquivos
        e <strong>sempre</strong> compare com <code>===</code> (estrito) em vez de <code>==</code>.
        Isso elimina 90% das pegadinhas de tipo do PHP.
      </AlertBox>

      <h2>Casting explícito: (int), (string), intval e amigos</h2>
      <p>
        Quando você precisa converter de propósito, o PHP oferece duas formas: <em>cast</em> com
        parênteses e funções dedicadas. Use a forma que melhor expressa a intenção e que aceita os
        casos extremos que você precisa.
      </p>

      <p><strong className="text-[#8993BE] font-mono">(int) (string) (bool) (array) (object)</strong> — casts explícitos com parênteses na frente do valor. Convertem do jeito do PHP: <code>(int) "30 anos"</code> dá <code>30</code>; <code>(bool) "0"</code> dá <code>false</code> (caso especial!). Curtos e idiomáticos.</p>
      <p><strong className="text-[#8993BE] font-mono">intval / floatval / strval</strong> — funções equivalentes aos casts, com mais opções: <code>intval("ff", 16)</code> aceita base, <code>intval($x, 0)</code> autodetecta. Use quando precisar de bases ou quiser passar como callable.</p>

      <PhpBlock
        filename="casting.php"
        code={`<?php
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
echo $obj->nome . PHP_EOL;`}
        output={`int(30)
float(19)
float(19.9)
string(2) "42"
bool(false)
bool(true)
Ada`}
      />

      <h2>Checando tipos: is_* e instanceof</h2>
      <p><strong className="text-[#8993BE] font-mono">is_int / is_float / is_string / is_bool / is_null / is_array / is_object</strong> — família de funções booleanas: cada uma testa se a variável é daquele tipo. Mais legível que comparar com <code>gettype()</code>.</p>
      <p><strong className="text-[#8993BE] font-mono">match</strong> — expressão de PHP 8 parecida com <code>switch</code>, mas que <em>retorna valor</em>, usa comparação estrita (<code>===</code>) e não precisa de <code>break</code>. Detalhada no capítulo de Switch/Match.</p>
      <p><strong className="text-[#8993BE] font-mono">::class</strong> — devolve o nome totalmente qualificado da classe como string em tempo de compilação. <code>$v::class</code> (PHP 8+) é equivalente a <code>get_class($v)</code>.</p>

      <PhpBlock
        filename="checagem.php"
        code={`<?php
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
}`}
        output={`int
float
string
bool
null
array
object: stdClass`}
      />

      <h2>Rodando os exemplos</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/php-book"
        command="php tipos.php"
        output={`integer
double
string
boolean
NULL
array
object
object
object`}
      />

      <p>
        Agora que você reconhece todo bicho do zoológico de tipos, o próximo passo é dominar os{" "}
        <strong>operadores</strong> — onde os tipos se encontram e onde mora o famoso{" "}
        <code>==</code> vs <code>===</code> que separa juniores de pleitos.
      </p>
    </PageContainer>
  );
}
