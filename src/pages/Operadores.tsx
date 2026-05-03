import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Operadores() {
  return (
    <PageContainer
      title="Operadores"
      subtitle="O guia completo dos símbolos do PHP — aritméticos, de atribuição, comparação, lógicos, de string, ternário, null coalescing e o mítico spaceship — com a diferença que separa juniores de seniores: == vs ===."
      difficulty="iniciante"
      timeToRead="11 min"
      category="Sintaxe Básica"
    >
      <AlertBox type="info" title="Pré-requisitos">
        <p>Antes deste capítulo, é bom já ter visto: <a href="#/sintaxe" className="text-[#8993BE] underline">Sintaxe básica</a>, <a href="#/variaveis" className="text-[#8993BE] underline">Variáveis</a>, <a href="#/tipos" className="text-[#8993BE] underline">Tipos primitivos</a>.</p>
      </AlertBox>
      <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"== vs ==="}</strong> {' — '} {"igualdade frouxa (faz coerção) vs idêntica (mesmo tipo + valor)."}
          </li>
        <li>
            <strong>{"<=> spaceship"}</strong> {' — '} {"retorna -1, 0 ou 1 — perfeito para usort."}
          </li>
        <li>
            <strong>{"?? null coalescing"}</strong> {' — '} {"$a ?? $b devolve $b se $a for null ou indefinido."}
          </li>
        <li>
            <strong>{"?: ternário curto"}</strong> {' — '} {"$a ?: $b devolve $b se $a for falsy."}
          </li>
        <li>
            <strong>{". concat"}</strong> {' — '} {"em PHP a concatenação é com ponto, não com +."}
          </li>
        </ul>
    
      <h2>Aritméticos: o feijão com arroz</h2>
      <p>
        Os operadores matemáticos são quase iguais aos de qualquer linguagem. Vale destacar três
        coisas: <code>**</code> (potência), <code>%</code> (módulo, sempre inteiro) e a divisão
        que sempre devolve <code>float</code> a menos que você use <code>intdiv()</code>.
      </p>

      <PhpBlock
        filename="aritmeticos.php"
        code={`<?php
declare(strict_types=1);

echo 7 + 3 . PHP_EOL;     // 10
echo 7 - 3 . PHP_EOL;     // 4
echo 7 * 3 . PHP_EOL;     // 21
echo 7 / 3 . PHP_EOL;     // 2.3333333333333 (float!)
echo intdiv(7, 3) . PHP_EOL; // 2 (divisão inteira)
echo 7 % 3 . PHP_EOL;     // 1
echo 2 ** 10 . PHP_EOL;   // 1024
echo -7 . PHP_EOL;        // -7 (unário)

// Incremento e decremento
$n = 5;
echo $n++ . PHP_EOL;      // 5 (pós: usa, depois soma)
echo ++$n . PHP_EOL;      // 7 (pré: soma, depois usa)
echo $n . PHP_EOL;        // 7`}
        output={`10
4
21
2.3333333333333
2
1
1024
-7
5
7
7`}
      />

      <h2>Atribuição combinada: =, +=, .=, ??=</h2>
      <p>
        A atribuição básica é <code>=</code>. PHP herda do C as formas combinadas (<code>+=</code>,
        <code> -=</code>, <code>*=</code>, <code>/=</code>, <code>%=</code>, <code>**=</code>) e tem
        as suas próprias: <code>.=</code> para concatenar strings e <code>??=</code> para "atribui
        só se for null".
      </p>

      <PhpBlock
        filename="atribuicao.php"
        code={`<?php
declare(strict_types=1);

$total = 100;
$total += 25;     // 125
$total -= 10;     // 115
$total *= 2;      // 230
$total /= 4;      // 57.5

$msg = "Olá";
$msg .= ", Wallyson!";   // "Olá, Wallyson!"

$config = ["host" => "localhost"];
$config["host"]    ??= "127.0.0.1"; // não muda (existe)
$config["port"]    ??= 8080;        // atribui (não existia)
$config["timeout"] ??= 30;

echo $total . PHP_EOL;
echo $msg . PHP_EOL;
print_r($config);`}
        output={`57.5
Olá, Wallyson!
Array
(
    [host] => localhost
    [port] => 8080
    [timeout] => 30
)`}
      />

      <h2>Comparação: == vs === (a aula mais importante do PHP)</h2>
      <p>
        Aqui está a diferença que define se o seu código vai ter bugs misteriosos ou não. O PHP
        oferece duas famílias de operadores de igualdade:
      </p>
      <ul>
        <li><code>==</code> e <code>!=</code> — <strong>frouxos</strong>: convertem tipos antes de comparar.</li>
        <li><code>===</code> e <code>!==</code> — <strong>estritos</strong>: comparam tipo E valor.</li>
      </ul>

      <PhpBlock
        filename="comparacao.php"
        code={`<?php
declare(strict_types=1);

// Frouxos (perigosos)
var_dump(0 == "0");        // true
var_dump(0 == false);      // true
var_dump(null == false);   // true
var_dump("1" == "01");     // true (ambos viram int 1)
var_dump("10" == "1e1");   // true (notação científica)

// Estritos (corretos)
var_dump(0 === "0");       // false
var_dump(0 === false);     // false
var_dump(null === false);  // false
var_dump("1" === "01");    // false
var_dump(1 === 1);         // true`}
        output={`bool(true)
bool(true)
bool(true)
bool(true)
bool(true)
bool(false)
bool(false)
bool(false)
bool(false)
bool(true)`}
      />

      <AlertBox type="danger" title="Regra de ouro">
        <strong>Use sempre <code>===</code> e <code>!==</code></strong>. O <code>==</code> deveria
        ter sido removido da linguagem. A única exceção razoável é quando você <em>precisa</em>
        comparar valores vindos de input (sempre string) com inteiros — e mesmo aí, prefira
        converter explicitamente antes de comparar.
      </AlertBox>

      <p>
        Os ordenadores (<code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>,{" "}
        <code>&gt;=</code>) não têm versão estrita — comparam normalmente. E PHP 7+ trouxe o{" "}
        operador <em>spaceship</em> <code>&lt;=&gt;</code>, que devolve <code>-1</code>,{" "}
        <code>0</code> ou <code>1</code>:
      </p>

      <p><strong className="text-[#8993BE] font-mono">fn() =&gt;</strong> — arrow function (PHP 7.4+): forma curta de função anônima de uma expressão só. <code>fn($a, $b) =&gt; $a + $b</code> equivale a uma <code>function</code> com <code>return</code>. Captura variáveis do escopo automaticamente. Detalhada no capítulo de Funções.</p>

      <PhpBlock
        filename="spaceship.php"
        code={`<?php
declare(strict_types=1);

echo (1 <=> 2) . PHP_EOL;    // -1
echo (2 <=> 2) . PHP_EOL;    //  0
echo (3 <=> 2) . PHP_EOL;    //  1
echo ("ada" <=> "linus") . PHP_EOL; // -1 (alfabética)

// Uso clássico: ordenar arrays
$pessoas = [
    ["nome" => "Linus", "idade" => 54],
    ["nome" => "Ada",   "idade" => 36],
    ["nome" => "Grace", "idade" => 85],
];

usort($pessoas, fn($a, $b) => $a["idade"] <=> $b["idade"]);

foreach ($pessoas as $p) {
    echo "{$p['nome']}: {$p['idade']}" . PHP_EOL;
}`}
        output={`-1
0
1
-1
Ada: 36
Linus: 54
Grace: 85`}
      />

      <h2>Lógicos: &amp;&amp;, ||, ! (e a armadilha do and/or)</h2>
      <p>
        PHP tem duas formas para os operadores lógicos: <code>&amp;&amp;</code>/<code>||</code> e{" "}
        <code>and</code>/<code>or</code>. Eles parecem iguais, <strong>mas não são</strong>. A
        diferença está na <em>precedência</em>:
      </p>

      <PhpBlock
        filename="logicos.php"
        code={`<?php
declare(strict_types=1);

// && tem precedência ALTA (mais alta que =)
$a = true && false;
var_dump($a); // false (correto: $a = (true && false))

// 'and' tem precedência BAIXA (mais baixa que =)
$b = true and false;
var_dump($b); // true (!) o = aconteceu antes do 'and'
              // equivale a: ($b = true) and false

// Negação
var_dump(!true);  // false
var_dump(!false); // true

// Curto-circuito: || e && param de avaliar quando já sabem o resultado
$x = null;
$nome = $x ?? "padrão";   // mais limpo: usa null coalescing
$nome2 = $x ?: "padrão";  // ternário curto: usa "vazio" (perigoso para 0/"")
echo "$nome / $nome2" . PHP_EOL;`}
        output={`bool(false)
bool(true)
bool(false)
bool(true)
padrão / padrão`}
      />

      <AlertBox type="warning" title="Esqueça o and/or">
        Use <strong>sempre</strong> <code>&amp;&amp;</code> e <code>||</code>. As versões em
        palavras existem por compatibilidade histórica e causam bugs sutis exatamente como o
        exemplo acima. Não há benefício em usá-las.
      </AlertBox>

      <h2>Concatenação de string: o ponto solitário</h2>
      <p>
        Diferente de quase todas as linguagens modernas, PHP usa <code>.</code> (ponto) para
        concatenar strings. Para somar com atribuição combinada, use <code>.=</code>. Em strings com
        aspas duplas, prefira interpolação direta.
      </p>

      <PhpBlock
        filename="strings.php"
        code={`<?php
declare(strict_types=1);

$nome = "Ada";
$idade = 36;

// Concatenação clássica
echo "Olá, " . $nome . "! Você tem " . $idade . " anos." . PHP_EOL;

// Interpolação (mais limpo)
echo "Olá, $nome! Você tem $idade anos." . PHP_EOL;

// Interpolação com chaves para expressões/propriedades
$user = (object) ["nome" => "Linus", "idade" => 54];
echo "{$user->nome} tem {$user->idade} anos." . PHP_EOL;

// .= para construir incrementalmente
$saida = "";
foreach (["a", "b", "c"] as $letra) {
    $saida .= "[$letra]";
}
echo $saida . PHP_EOL;`}
        output={`Olá, Ada! Você tem 36 anos.
Olá, Ada! Você tem 36 anos.
Linus tem 54 anos.
[a][b][c]`}
      />

      <h2>Ternário e null coalescing: dois irmãos diferentes</h2>
      <p>
        O ternário clássico <code>cond ? a : b</code> existe há séculos. PHP adicionou a versão
        curta <code>a ?: b</code> ("Elvis") e, em PHP 7, o irmão moderno <code>a ?? b</code> (null
        coalescing). Eles parecem iguais, <strong>mas tratam <code>0</code> e <code>""</code>{" "}
        de jeitos diferentes</strong>:
      </p>

      <PhpBlock
        filename="ternario.php"
        code={`<?php
declare(strict_types=1);

$entrada = ["nome" => "", "idade" => 0, "ativo" => null];

// Ternário curto ?:  → cai no padrão se for "vazio" (0, "", null, false, [])
echo ($entrada["nome"]   ?: "sem nome") . PHP_EOL;   // "sem nome"
echo ($entrada["idade"]  ?: "sem idade") . PHP_EOL;  // "sem idade" (!)
echo ($entrada["ativo"]  ?: "inativo") . PHP_EOL;    // "inativo"

echo "----" . PHP_EOL;

// Null coalescing ??  → cai no padrão SÓ se for null ou inexistente
echo ($entrada["nome"]   ?? "sem nome") . PHP_EOL;   // "" (existe e não é null)
echo ($entrada["idade"]  ?? "sem idade") . PHP_EOL;  // 0
echo ($entrada["ativo"]  ?? "inativo") . PHP_EOL;    // "inativo" (era null)
echo ($entrada["telefone"] ?? "sem telefone") . PHP_EOL; // "sem telefone"

echo "----" . PHP_EOL;

// Encadeando ?? para fallback em cadeia
$config = [];
$timeout = $config["timeout"] ?? getenv("TIMEOUT") ?: 30;
echo "timeout: $timeout" . PHP_EOL;

// Ternário aninhado (legível com parênteses)
$status = 200;
$cor = ($status < 300)
    ? "verde"
    : (($status < 400) ? "amarelo" : "vermelho");
echo "status $status -> $cor" . PHP_EOL;`}
        output={`sem nome
sem idade
inativo
----

0
inativo
sem telefone
----
timeout: 30
status 200 -> verde`}
      />

      <AlertBox type="info" title="Quando usar cada um">
        Use <code>??</code> quando "ausência" significa literalmente <code>null</code> ou chave
        inexistente (a maioria dos casos). Use <code>?:</code> quando "vazio" inclui{" "}
        <code>0</code> e <code>""</code> de propósito. Use o ternário completo quando a condição
        é uma expressão real (não só uma checagem de existência).
      </AlertBox>

      <h2>Precedência: a tabela mental que te salva</h2>
      <p>
        Você não precisa decorar todas as 70+ linhas da tabela oficial — só lembre da hierarquia
        prática, do mais "forte" para o mais "fraco":
      </p>
      <ol>
        <li><code>**</code> (potência)</li>
        <li><code>* / %</code></li>
        <li><code>+ - .</code></li>
        <li><code>&lt; &lt;= &gt; &gt;= &lt;=&gt;</code></li>
        <li><code>== === != !==</code></li>
        <li><code>&amp;&amp;</code></li>
        <li><code>||</code></li>
        <li><code>?? ?:</code> e <code>? :</code> (ternário)</li>
        <li><code>= += .= ??=</code></li>
        <li><code>and</code>, depois <code>or</code> (precedência baixíssima — evite)</li>
      </ol>

      <PhpBlock
        filename="precedencia.php"
        code={`<?php
declare(strict_types=1);

// Sem parênteses, fica ambíguo:
$x = 1 + 2 * 3;          // 7 (não 9)
$y = 10 - 4 - 2;         // 4 (associatividade à esquerda)
$z = 2 ** 3 ** 2;        // 512 (** associa à DIREITA: 2 ** 9)

echo "$x $y $z" . PHP_EOL;

// Quando dúvida, parênteses. Sempre.
$ok = ($x > 0) && ($y > 0);
var_dump($ok);`}
        output={`7 4 512
bool(true)`}
      />

      <h2>Rodando os exemplos</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/php-book"
        command="php comparacao.php"
        output={`bool(true)
bool(true)
bool(true)
bool(true)
bool(true)
bool(false)
bool(false)
bool(false)
bool(false)
bool(true)`}
      />

      <p>
        Com operadores dominados, você já consegue construir expressões e tomar decisões. No
        próximo capítulo entramos em <strong>controle de fluxo</strong>: <code>if/else</code>,{" "}
        <code>match</code> (o substituto moderno do <code>switch</code>) e como escrever
        condicionais que se leem como prosa.
      </p>
    </PageContainer>
  );
}
