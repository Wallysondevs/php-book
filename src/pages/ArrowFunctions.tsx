import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function ArrowFunctions() {
  return (
    <PageContainer
      title="Arrow functions e Closures"
      subtitle="Funções anônimas em PHP: a sintaxe curta fn() => para uma linha, closures clássicas com use(), referências mutáveis e o truque do bindTo."
      difficulty="intermediario"
      timeToRead="11 min"
      category="Funções"
    >
      <AlertBox type="info" title="Pré-requisitos">
        <p>Antes deste capítulo, é bom já ter visto: <a href="#/funcoes" className="text-[#8993BE] underline">Funções básicas</a>, <a href="#/type-hints" className="text-[#8993BE] underline">Type hints</a>, <a href="#/array-functions" className="text-[#8993BE] underline">Array functions</a>.</p>
      </AlertBox>

      <h2>O problema: passar comportamento como argumento</h2>
      <p>
        Funções como <code>array_map</code>, <code>array_filter</code> e <code>usort</code> esperam
        que você diga <em>como</em> transformar/filtrar/comparar os elementos. Declarar uma função
        nomeada só para usar uma vez é desperdício de neurônio. Para isso existem as{" "}
        <strong>funções anônimas</strong> — closures e arrow functions.
      </p>

      <PhpBlock
        filename="map-clas.php"
        code={`<?php
declare(strict_types=1);

$precos = [10.0, 25.5, 49.9, 100.0];

// Versão verbosa: closure clássica
$comImposto = array_map(function (float $p): float {
    return $p * 1.1;
}, $precos);

print_r($comImposto);`}
        output={`Array
(
    [0] => 11
    [1] => 28.05
    [2] => 54.89
    [3] => 110
)`}
      />

      <h2>Arrow functions (PHP 7.4+): a forma curta</h2>

      <p><strong className="text-[#8993BE] font-mono">fn() =&gt;</strong> — sintaxe curta para função anônima de <strong>uma única expressão</strong> (PHP 7.4+). Existe para callbacks rápidos em <code>array_map</code>, <code>array_filter</code>, etc. Sintaxe: <code>{`fn(int $n) => $n * 2`}</code>. Captura variáveis externas <em>automaticamente por valor</em> — sem precisar de <code>use()</code>.</p>

      <p>
        Quando a função tem <strong>uma única expressão</strong>, use a sintaxe{" "}
        <code>fn(args) =&gt; expressao</code>. Sem chaves, sem <code>return</code>, sem{" "}
        <code>use()</code> — variáveis do escopo externo são capturadas <strong>automaticamente
        por valor</strong>.
      </p>

      <PhpBlock
        filename="arrow.php"
        code={`<?php
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
print_r($paresDobrados);`}
        output={`Array
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
)`}
      />

      <AlertBox type="info" title="Quando NÃO usar arrow function">
        Arrow functions são limitadas a <strong>uma única expressão</strong>. Se precisa de
        <code>if</code>, várias linhas ou um log no meio, volte para a closure clássica com{" "}
        <code>function() { '{...}' }</code>.
      </AlertBox>

      <h2>Closure clássica e a palavra-chave use</h2>
      <p>
        A closure tradicional (<code>function () { '{...}' }</code>) <strong>não captura
        automaticamente</strong> variáveis do escopo externo. Você precisa listá-las explicitamente
        com <code>use ($var)</code>. Por padrão a captura é <em>por valor</em> — uma cópia no
        momento em que a closure é criada.
      </p>

      <PhpBlock
        filename="closure-use.php"
        code={`<?php
declare(strict_types=1);

$prefixo = "INFO: ";

// captura por valor — fotografa $prefixo agora
$logger = function (string $msg) use ($prefixo): void {
    echo $prefixo . $msg . PHP_EOL;
};

$logger("aplicação iniciada");

$prefixo = "DEBUG: "; // mudou aqui fora
$logger("usuário logado"); // mas a closure ainda usa a cópia antiga`}
        output={`INFO: aplicação iniciada
INFO: usuário logado`}
      />

      <h2>use por referência: &amp;$var</h2>
      <p>
        Para a closure compartilhar a mesma variável (e ver alterações de fora, ou alterar de
        dentro), use o <code>&amp;</code>. É o padrão para construir contadores e acumuladores.
      </p>

      <PhpBlock
        filename="closure-ref.php"
        code={`<?php
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
echo "soma = {$total}";`}
        output={`chamou 3 vezes
soma = 100`}
      />

      <AlertBox type="warning" title="Arrow function não tem use">
        Lembre-se: <code>fn()</code> captura tudo automaticamente, mas <strong>sempre por valor</strong>.
        Se você precisa modificar uma variável externa, use closure clássica com{" "}
        <code>use (&amp;$var)</code>.
      </AlertBox>

      <h2>bindTo: closures que viram métodos de objeto</h2>
      <p>
        Toda closure em PHP é um objeto da classe <code>Closure</code>. O método{" "}
        <code>bindTo($obj, $escopo)</code> devolve uma nova closure que enxerga{" "}
        <code>$this</code> como se fosse um método do objeto passado. Útil para estender objetos
        sem subclassificar, ou para hooks dinâmicos.
      </p>

      <PhpBlock
        filename="bindto.php"
        code={`<?php
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

echo "saldo final: " . $conta->saldo();`}
        output={`saldo final: 75.5`}
      />

      <AlertBox type="info" title="bindTo vs Closure::bind">
        <code>$closure-&gt;bindTo($obj, $escopo)</code> é o método de instância;{" "}
        <code>Closure::bind($closure, $obj, $escopo)</code> é o estático equivalente. O segundo
        parâmetro é a classe cujo escopo (privado/protegido) a closure terá acesso.
      </AlertBox>

      <h2>Caso real: pipeline de transformações</h2>
      <p>
        Combine arrow functions com <code>array_map</code>, <code>array_filter</code> e{" "}
        <code>array_reduce</code> para escrever pipelines declarativos — o jeito moderno de tratar
        listas em PHP.
      </p>

      <PhpBlock
        filename="pipeline.php"
        code={`<?php
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

echo "total dos itens >= R$ 10,00: R$ " . number_format($totalAcima10, 2, ",", ".");`}
        output={`total dos itens >= R$ 10,00: R$ 71,00`}
      />

      <h2>Closure como first-class citizen</h2>
      <p>
        Closures podem ser armazenadas em variáveis, propriedades, arrays — passadas para qualquer
        lugar. PHP 8.1 adicionou a sintaxe <code>nome(...)</code> para transformar uma função
        nomeada (ou método) em closure de primeira classe. É o jeito moderno e seguro.
      </p>

      <PhpBlock
        filename="first-class.php"
        code={`<?php
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
print_r(array_map($absoluto, [-3, -1, 0, 5]));`}
        output={`Array
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
)`}
      />

      <h2>Resumo prático</h2>
      <ul>
        <li>Uma expressão? Use <code>fn() =&gt; ...</code>. Captura é automática por valor.</li>
        <li>Mais de uma linha? <code>function () use ($x) { '{...}' }</code>.</li>
        <li>Para mutar variáveis externas: <code>use (&amp;$x)</code>.</li>
        <li><code>bindTo</code> permite acessar <code>$this</code> e escopo privado de qualquer classe.</li>
        <li>Para passar funções/métodos adiante: <code>nome(...)</code> ou <code>$obj-&gt;metodo(...)</code>.</li>
      </ul>

      <p>
        No próximo capítulo a gente termina a trilha de funções com <strong>argumentos</strong>:
        defaults, nomeados, variadic e o operador splat. É o que falta para você dominar a
        assinatura de qualquer função PHP moderna.
      </p>
    </PageContainer>
  );
}
