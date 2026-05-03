import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function ClosuresAvancadas() {
  return (
    <PageContainer
      title="Closures avançadas"
      subtitle="Vai além do básico: bind/bindTo para trocar o $this, first-class callable syntax, currying e memoização — as ferramentas funcionais que faltavam no seu cinto."
      difficulty="avancado"
      timeToRead="12 min"
      category="Reflection & Meta"
    >
      <AlertBox type="info" title="Pré-requisitos">
          <p>Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP.</p>
        </AlertBox>
        <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"use() lexical"}</strong> {' — '} {"lista variáveis do escopo pai a importar; por valor por padrão."}
          </li>
        <li>
            <strong>{"$this em closure"}</strong> {' — '} {"closures dentro de classes ligam $this automaticamente."}
          </li>
        <li>
            <strong>{"Closure::bind()"}</strong> {' — '} {"religa $this/escopo de uma closure a outro objeto."}
          </li>
        <li>
            <strong>{"Closure::fromCallable()"}</strong> {' — '} {"transforma callable (string ou array) em objeto Closure."}
          </li>
        <li>
            <strong>{"First-class callable (8.1)"}</strong> {' — '} {"strlen(...) cria uma Closure a partir de qualquer função."}
          </li>
        </ul>
          <h2>Recapitulando: o que é uma Closure?</h2>
      <p>
        Toda função anônima em PHP é, na prática, uma instância da classe nativa{" "}
        <code>Closure</code>. Isso significa que ela é um objeto, pode ser passada como argumento,
        retornada de funções, armazenada em propriedades — e, o mais interessante,{" "}
        <strong>tem um <code>$this</code> próprio</strong> que você pode reescrever em runtime.
      </p>

      <PhpBlock
        filename="closure_objeto.php"
        code={`<?php
declare(strict_types=1);

$dobrar = fn (int $n): int => $n * 2;

var_dump($dobrar instanceof Closure);
echo $dobrar(21) . PHP_EOL;`}
        output={`bool(true)
42`}
      />

      <h2>Closure::fromCallable: padronizando qualquer callable</h2>
      <p>
        Funções nomeadas, métodos estáticos, métodos de instância, arrays callables — em
        PHP existem várias formas de “alguma coisa chamável”. <code>Closure::fromCallable()</code>
        normaliza tudo em um <code>Closure</code> verdadeiro, eliminando o callable em formato de
        string ou array (que é fonte de bugs e quebra autocomplete).
      </p>

      <PhpBlock
        filename="from_callable.php"
        code={`<?php
declare(strict_types=1);

final class Texto
{
    public function gritar(string $s): string { return strtoupper($s) . '!'; }
}

$obj = new Texto();

$f1 = Closure::fromCallable('strtoupper');           // função nativa
$f2 = Closure::fromCallable([$obj, 'gritar']);       // método de instância
$f3 = Closure::fromCallable([Texto::class, 'gritar']); // estático? não — vira "first-class" do método

echo $f1('ola') . PHP_EOL;
echo $f2('ola') . PHP_EOL;`}
        output={`OLA
OLA!`}
      />

      <h2>First-class callable syntax (PHP 8.1): func(...)</h2>
      <p>
        O PHP 8.1 introduziu uma sintaxe muito mais limpa que o velho <code>fromCallable</code>:
        basta escrever o nome do que você quer transformar em closure e adicionar{" "}
        <code>(...)</code>. Funciona com funções, métodos de instância, métodos estáticos e até
        construtores.
      </p>

      <PhpBlock
        filename="first_class.php"
        code={`<?php
declare(strict_types=1);

final class Carrinho
{
    public function preco(int $qtd): float { return $qtd * 9.90; }
}

$c = new Carrinho();

// Equivalente a Closure::fromCallable(...) — porém legal de ler:
$fnUpper  = strtoupper(...);
$fnPreco  = $c->preco(...);
$fnCount  = count(...);
$fnTrim   = trim(...);

echo $fnUpper('hello') . PHP_EOL;
echo $fnPreco(3) . PHP_EOL;
echo $fnCount([1, 2, 3, 4]) . PHP_EOL;

// Compõe num pipeline:
$nomes = array_map($fnTrim, [' ada ', ' linus ', ' grace ']);
print_r(array_map($fnUpper, $nomes));`}
        output={`HELLO
29.7
4
Array
(
    [0] => ADA
    [1] => LINUS
    [2] => GRACE
)`}
      />

      <AlertBox type="success" title="Por que é melhor que strings">
        Passar <code>'strtoupper'</code> como callable é frágil: o IDE não navega, o PHPStan não
        valida, e refatorar quebra silenciosamente. Já <code>strtoupper(...)</code> é checado em
        tempo de compilação e segue refatorações automáticas.
      </AlertBox>

      <h2>Closure como callback: array_map vs arrow fn</h2>
      <p>
        Arrow functions (<code>fn() =&gt; ...</code>) são closures com captura automática de
        variáveis e corpo de uma única expressão. Para callbacks curtos elas são imbatíveis;
        para lógica maior, prefira a closure tradicional com <code>use ()</code>.
      </p>

      <PhpBlock
        filename="callbacks.php"
        code={`<?php
declare(strict_types=1);

$precos = [10, 20, 30, 40];
$desconto = 0.15;

// Arrow fn: captura $desconto sozinho, código compacto.
$comDesconto = array_map(fn (int $p): float => $p * (1 - $desconto), $precos);
print_r($comDesconto);

// Closure tradicional: precisa do "use" e tem corpo de várias linhas.
$rotulado = array_map(function (int $p) use ($desconto): string {
    $final = $p * (1 - $desconto);
    return "R$ " . number_format($final, 2, ',', '.');
}, $precos);
print_r($rotulado);`}
        output={`Array
(
    [0] => 8.5
    [1] => 17
    [2] => 25.5
    [3] => 34
)
Array
(
    [0] => R$ 8,50
    [1] => R$ 17,00
    [2] => R$ 25,50
    [3] => R$ 34,00
)`}
      />

      <h2>Closure::bind e bindTo: trocando o $this</h2>
      <p>
        Esta é a parte “mágica negra” das closures. <code>bindTo()</code> devolve uma{" "}
        <em>cópia</em> da closure ligada a outro objeto e, opcionalmente, a outro escopo de classe.
        Com isso você consegue acessar membros privados de uma instância como se fosse parte dela —
        técnica usada por bibliotecas de teste e de dump (<code>symfony/var-dumper</code>).
      </p>

      <PhpBlock
        filename="bindto.php"
        code={`<?php
declare(strict_types=1);

final class Conta
{
    private float $saldo = 50.0;
}

$espiar = function (): float {
    return $this->saldo;
};

$c1 = new Conta();
$c2 = new Conta();

// Liga ao objeto $c1, com escopo da classe Conta (pra enxergar private).
$espiarC1 = $espiar->bindTo($c1, Conta::class);
$espiarC2 = $espiar->bindTo($c2, Conta::class);

echo "C1: " . $espiarC1() . PHP_EOL;
echo "C2: " . $espiarC2() . PHP_EOL;`}
        output={`C1: 50
C2: 50`}
      />

      <AlertBox type="warning" title="bind() vs bindTo()">
        <code>Closure::bind($closure, $obj, $scope)</code> é a versão estática que <em>cria</em>
        {" "}uma nova closure. <code>$closure-&gt;bindTo($obj, $scope)</code> é o método de
        instância, equivalente. Ambos NÃO modificam a closure original — eles devolvem uma nova.
      </AlertBox>

      <h2>Currying: transformando uma função em uma cadeia de closures</h2>
      <p>
        Currying significa pegar uma função de N argumentos e transformá-la em N funções
        encadeadas de 1 argumento. PHP não tem currying nativo, mas closures resolvem em poucas
        linhas:
      </p>

      <PhpBlock
        filename="curry.php"
        code={`<?php
declare(strict_types=1);

function curry3(Closure $fn): Closure
{
    return fn ($a) => fn ($b) => fn ($c) => $fn($a, $b, $c);
}

$soma = curry3(fn (int $a, int $b, int $c): int => $a + $b + $c);

$somar10 = $soma(10);
$somar10e20 = $somar10(20);
echo $somar10e20(5) . PHP_EOL;     // 35

// Tudo de uma vez:
echo $soma(1)(2)(3) . PHP_EOL;     // 6`}
        output={`35
6`}
      />

      <h2>Memoização: cache transparente para funções puras</h2>
      <p>
        Memoização é guardar o resultado de uma função pura em cache para evitar recálculos. Você
        pode escrever um <code>memoize()</code> genérico em ~10 linhas usando closure + array por
        referência:
      </p>

      <PhpBlock
        filename="memoize.php"
        code={`<?php
declare(strict_types=1);

function memoize(Closure $fn): Closure
{
    $cache = [];
    return function (...$args) use ($fn, &$cache) {
        $chave = serialize($args);
        return $cache[$chave] ??= $fn(...$args);
    };
}

function fibLento(int $n): int
{
    return $n < 2 ? $n : fibLento($n - 1) + fibLento($n - 2);
}

$fibRapido = memoize(function (int $n) use (&$fibRapido): int {
    return $n < 2 ? $n : $fibRapido($n - 1) + $fibRapido($n - 2);
});

$ini = hrtime(true);
echo "fibLento(30)  = " . fibLento(30) . PHP_EOL;
printf("Tempo: %.2f ms\\n", (hrtime(true) - $ini) / 1e6);

$ini = hrtime(true);
echo "fibRapido(30) = " . $fibRapido(30) . PHP_EOL;
printf("Tempo: %.2f ms\\n", (hrtime(true) - $ini) / 1e6);`}
        output={`fibLento(30)  = 832040
Tempo: 65.42 ms
fibRapido(30) = 832040
Tempo: 0.18 ms`}
      />

      <AlertBox type="info" title="Cuidado com argumentos não serializáveis">
        O truque do <code>serialize($args)</code> falha com closures, recursos (file handles) e
        instâncias com <code>__serialize</code> proibido. Para esses casos use{" "}
        <code>spl_object_hash()</code> ou um esquema de hash próprio.
      </AlertBox>

      <h2>Rodando os exemplos</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/closures"
        command="php memoize.php"
        output={`fibLento(30)  = 832040
Tempo: 65.42 ms
fibRapido(30) = 832040
Tempo: 0.18 ms`}
      />

      <p>
        No próximo capítulo a gente entra no mundo da concorrência cooperativa do PHP com{" "}
        <strong>Fibers</strong>: a base de bibliotecas async como <code>amphp/amp</code> e{" "}
        <code>revolt/event-loop</code>.
      </p>
    </PageContainer>
  );
}
