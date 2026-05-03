import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function ArrayFunctions() {
  return (
    <PageContainer
      title="Funções de array"
      subtitle="map, filter, reduce, keys, values, search, ordenação, merge vs união, array_column e array_combine — o arsenal que transforma loops em uma linha."
      difficulty="intermediario"
      timeToRead="14 min"
      category="Strings & Arrays"
    >
      <AlertBox type="info" title="Pré-requisitos">
        <p>Antes deste capítulo, é bom já ter visto: <a href="#/variaveis" className="text-[#8993BE] underline">Variáveis</a>, <a href="#/tipos" className="text-[#8993BE] underline">Tipos</a>, <a href="#/arrays" className="text-[#8993BE] underline">Arrays</a>.</p>
      </AlertBox>
      <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"array_map"}</strong> {' — '} {"aplica callback em cada elemento."}
          </li>
        <li>
            <strong>{"array_filter"}</strong> {' — '} {"mantém elementos que passam no teste."}
          </li>
        <li>
            <strong>{"array_reduce"}</strong> {' — '} {"reduz array a um único valor."}
          </li>
        <li>
            <strong>{"array_merge vs +"}</strong> {' — '} {"merge concatena/sobrescreve por chave; + une preservando primeiras chaves."}
          </li>
        <li>
            <strong>{"in_array / array_search"}</strong> {' — '} {"verifica/encontra valor; use === como 3º arg."}
          </li>
        </ul>
    
      <h2>O básico antes do avançado</h2>
      <p>
        Você já sabe iterar com <code>foreach</code>. Tudo que vamos ver aqui pode ser feito com loop manual —
        a graça é deixar a <strong>intenção</strong> explícita. Quando você lê <code>array_filter($users, fn($u) =&gt; $u-&gt;ativo)</code>{" "}
        sabe imediatamente o que está acontecendo. Com <code>foreach</code> precisa ler o corpo todo.
      </p>

      <h2>array_map: transformar cada elemento</h2>
      <p>
        Recebe um callback e um (ou mais) arrays. Aplica o callback em cada elemento e retorna um novo array.
        Não modifica o original.
      </p>

      <p><strong className="text-[#8993BE] font-mono">array_map</strong> — aplica um callback em cada elemento e devolve um novo array (não modifica o original). Existe pra transformar listas sem escrever <code>foreach</code>. Sintaxe: <code>array_map($cb, $arr)</code>. Aceita múltiplos arrays — <code>array_map($cb, $a, $b)</code> chama <code>$cb($a[i], $b[i])</code>. Preserva chaves do primeiro array.</p>

      <PhpBlock
        filename="map.php"
        code={`<?php
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
print_r($soma);`}
        output={`Array
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
)`}
      />

      <AlertBox type="info" title="array_map preserva chaves">
        Diferente de <code>array_filter</code>, <code>array_map</code> mantém as chaves originais
        do primeiro array. Se você passa múltiplos arrays, ele reseta para chaves numéricas.
      </AlertBox>

      <h2>array_filter: manter o que passa no teste</h2>
      <p>
        Recebe um array e um callback que retorna <code>bool</code>. Mantém só os elementos onde o callback é
        <em> truthy</em>. Sem callback, remove qualquer valor falsy (<code>0</code>, <code>""</code>, <code>null</code>, etc.).
      </p>

      <p><strong className="text-[#8993BE] font-mono">array_filter</strong> — mantém só os elementos onde o callback retorna <em>truthy</em>. Existe pra extrair subconjuntos sem <code>foreach</code> com <code>if</code> dentro. Sintaxe: <code>array_filter($arr, $cb)</code>. Sem callback, remove valores falsy (<code>0</code>, <code>""</code>, <code>null</code>). Preserva chaves originais — combine com <code>array_values()</code> pra reindexar.</p>

      <PhpBlock
        filename="filter.php"
        code={`<?php
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
print_r($ativos);`}
        output={`Array
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

)`}
      />

      <AlertBox type="warning" title="As chaves continuam furadas">
        Note que <code>array_filter</code> preserva as chaves originais — você fica com índices <code>0, 2, 4...</code>.
        Se precisa de uma lista limpa indexada, encadeie com <code>array_values()</code>.
      </AlertBox>

      <h2>array_reduce: condensar em um único valor</h2>
      <p>
        Pega o array inteiro e reduz a um valor (uma soma, uma string, um objeto). É o canivete suíço quando
        nem <code>map</code> nem <code>filter</code> bastam.
      </p>

      <p><strong className="text-[#8993BE] font-mono">array_reduce</strong> — percorre o array acumulando num único valor (soma, string, objeto). Existe pra quando <code>map</code> e <code>filter</code> não bastam — você precisa "dobrar" a coleção. Sintaxe: <code>array_reduce($arr, fn($acc, $item) =&gt; ..., $inicial)</code>. O terceiro parâmetro é o valor inicial do acumulador.</p>

      <PhpBlock
        filename="reduce.php"
        code={`<?php
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
echo $lista . PHP_EOL;`}
        output={`Total: R$ 33,50
ada, linus, grace`}
      />

      <h2>array_keys, array_values e array_column</h2>
      <p>
        Quando você precisa só das chaves, só dos valores ou de uma "coluna" específica de um array de arrays:
      </p>

      <PhpBlock
        filename="keys-values-column.php"
        code={`<?php
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
print_r(array_column($users, "email", "id"));`}
        output={`Array
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
)`}
      />

      <p>
        <code>array_column</code> com o terceiro argumento monta um <em>lookup</em> instantâneo. É o atalho
        para "preciso achar o email pelo ID rapidinho".
      </p>

      <h2>in_array e array_search: existe? onde está?</h2>
      <p>
        <code>in_array</code> retorna <code>bool</code>. <code>array_search</code> retorna a chave do elemento ou
        <code> false</code>. <strong>Sempre</strong> use o terceiro parâmetro como <code>true</code> (comparação estrita)
        para evitar surpresas com <code>"0" == false</code>.
      </p>

      <PhpBlock
        filename="search.php"
        code={`<?php
declare(strict_types=1);

$linguagens = ["PHP", "Python", "Go", "Rust"];

var_dump(in_array("Go", $linguagens, true));
var_dump(in_array("go", $linguagens, true));
var_dump(array_search("Rust", $linguagens, true));

$idades = ["ada" => 36, "linus" => 30, "grace" => 85];
$chave = array_search(85, $idades, true);
echo "Quem tem 85? {$chave}" . PHP_EOL;`}
        output={`bool(true)
bool(false)
int(3)
Quem tem 85? grace`}
      />

      <h2>Ordenação: sort, usort e amigos</h2>
      <p>
        PHP tem uma família grande de funções de ordenação. Quase todas <strong>modificam o array no lugar</strong>{" "}
        (in-place) e retornam <code>bool</code>. Resumo:
      </p>
      <ul>
        <li><code>sort / rsort</code>: ordena por valor, descarta as chaves.</li>
        <li><code>asort / arsort</code>: ordena por valor, mantém as chaves.</li>
        <li><code>ksort / krsort</code>: ordena por chave.</li>
        <li><code>usort / uasort / uksort</code>: ordenação customizada via callback.</li>
      </ul>

      <PhpBlock
        filename="ordenacao.php"
        code={`<?php
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
print_r($users);`}
        output={`Array
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

)`}
      />

      <AlertBox type="success" title="O operador spaceship (<=>)">
        O <code>&lt;=&gt;</code> retorna <code>-1</code>, <code>0</code> ou <code>1</code> conforme o
        primeiro operando seja menor, igual ou maior. É exatamente o que <code>usort</code> espera.
        Para inverter, troque os operandos: <code>$b - $a</code> ou <code>$b &lt;=&gt; $a</code>.
      </AlertBox>

      <h2>array_merge vs operador +</h2>
      <p>
        Os dois juntam arrays, mas se comportam de formas <strong>diferentes</strong> e isso confunde
        muita gente. A regra é:
      </p>
      <ul>
        <li><code>array_merge</code>: chaves numéricas são <em>renumeradas</em>; chaves string são <em>sobrescritas</em> pela direita.</li>
        <li><code>+</code> (união): chaves numéricas e string são <em>preservadas</em>; o lado esquerdo ganha em conflito.</li>
      </ul>

      <PhpBlock
        filename="merge-vs-uniao.php"
        code={`<?php
declare(strict_types=1);

$a = [1 => "um", 2 => "dois"];
$b = [1 => "ONE", 3 => "tres"];

print_r(array_merge($a, $b));
print_r($a + $b);

$config = ["host" => "localhost", "port" => 5432];
$override = ["port" => 5433, "user" => "admin"];

print_r(array_merge($config, $override));
print_r($config + $override);`}
        output={`Array
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
)`}
      />

      <AlertBox type="warning" title="Qual usar?">
        Para <strong>configurações com defaults</strong> (overrides vencem) use <code>array_merge</code>.
        Para <strong>defaults que não sobrescrevem o que o usuário definiu</strong> use <code>$user + $defaults</code>.
        Pense em <code>+</code> como "preencher buracos".
      </AlertBox>

      <h2>array_combine: zipar duas listas</h2>
      <p>
        Pega um array de chaves e um array de valores, do mesmo tamanho, e devolve um associativo.
        Útil quando você lê CSV e quer transformar a primeira linha em chave dos registros.
      </p>

      <PhpBlock
        filename="combine.php"
        code={`<?php
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
print_r($registros);`}
        output={`Array
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

)`}
      />

      <h2>Combinando tudo: um pipeline real</h2>
      <p>
        A força dessas funções aparece quando você as encadeia. Veja um exemplo realista — calcular o ticket
        médio dos pedidos pagos do mês:
      </p>

      <PhpBlock
        filename="pipeline.php"
        code={`<?php
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
echo "Ticket médio: R$ " . number_format($ticketMedio, 2, ",", ".") . PHP_EOL;`}
        output={`Pagos: 3
Soma: R$ 420
Ticket médio: R$ 140,00`}
      />

      <p>
        Esse mesmo cálculo escrito com <code>foreach</code> teria 15 linhas e várias variáveis temporárias.
        Aqui cabe em três expressões legíveis. Esse é o ganho real das funções de array — código que diz
        <strong> o que</strong> faz, não <em>como</em>.
      </p>
    </PageContainer>
  );
}
