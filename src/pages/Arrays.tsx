import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Arrays() {
  return (
    <PageContainer
      title="Arrays"
      subtitle="Indexados e associativos, sintaxe curta com colchetes, desestruturação, spread, multi-dimensionais e o jeito certo de contar e iterar."
      difficulty="iniciante"
      timeToRead="12 min"
      category="Strings & Arrays"
    >
      <AlertBox type="info" title="Pré-requisitos">
        <p>Antes deste capítulo, é bom já ter visto: <a href="#/variaveis" className="text-[#8993BE] underline">Variáveis</a>, <a href="#/tipos" className="text-[#8993BE] underline">Tipos</a>.</p>
      </AlertBox>

      <h2>Um array que é tudo ao mesmo tempo</h2>
      <p>
        Em PHP <strong>não existe</strong> distinção entre lista, dicionário e tupla. O array do PHP é uma
        estrutura híbrida: um <em>ordered map</em>. Ele guarda chaves (inteiras ou string) com valores, e mantém
        a ordem de inserção. É a estrutura mais usada da linguagem — entender ela é entender PHP.
      </p>

      <p><strong className="text-[#8993BE] font-mono">[] / array()</strong> — sintaxe pra criar arrays. <code>[1, 2, 3]</code> é a forma moderna (PHP 5.4+); <code>array(1, 2, 3)</code> é a antiga (ainda funciona). Use sempre os colchetes — é menor, mais legível e padrão da comunidade. Funciona pra indexados <code>[1, 2]</code> e associativos <code>["k" =&gt; "v"]</code>.</p>

      <p><strong className="text-[#8993BE] font-mono">=&gt;</strong> — operador "fat arrow" que associa uma chave a um valor dentro de array literal. Existe porque o array do PHP é um <em>ordered map</em> (chave → valor). Sintaxe: <code>["nome" =&gt; "Ada", "idade" =&gt; 36]</code>. Também aparece em <code>foreach ($arr as $k =&gt; $v)</code>.</p>

      <PhpBlock
        filename="primeiro-array.php"
        code={`<?php
declare(strict_types=1);

$linguagens = ["PHP", "Python", "Ruby", "Go"];
$user = ["nome" => "Ada", "email" => "ada@example.com", "ativo" => true];

echo $linguagens[0] . PHP_EOL;
echo $user["email"] . PHP_EOL;

print_r($linguagens);
print_r($user);`}
        output={`PHP
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
)`}
      />

      <h2>Indexados vs associativos</h2>
      <p>
        <strong>Indexado</strong> é quando você deixa o PHP atribuir as chaves automaticamente: <code>0, 1, 2, ...</code>.{" "}
        <strong>Associativo</strong> é quando você define chaves string. Por baixo dos panos é o mesmo tipo, e você
        pode misturar:
      </p>

      <PhpBlock
        filename="misto.php"
        code={`<?php
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
}`}
        output={`id => 1042
cliente => Ada
100 => primeiro item
101 => segundo item
total => 250`}
      />

      <AlertBox type="info" title="array() vs []">
        Você ainda vê <code>array(1, 2, 3)</code> em código antigo. Desde o PHP 5.4 a sintaxe oficial é
        <code> [1, 2, 3]</code>. Use sempre os colchetes — é menor, mais legível e padrão da comunidade.
      </AlertBox>

      <h2>Adicionando, removendo e sobrescrevendo</h2>
      <p>
        Você não precisa declarar tamanho. Você simplesmente atribui ou usa <code>[]</code> sem chave para
        empilhar no fim:
      </p>

      <PhpBlock
        filename="manipulando.php"
        code={`<?php
declare(strict_types=1);

$tarefas = [];
$tarefas[] = "estudar PHP";
$tarefas[] = "praticar arrays";
$tarefas[] = "ler PSR-12";

echo count($tarefas) . " tarefas" . PHP_EOL;

$tarefas[1] = "praticar arrays a fundo";
unset($tarefas[0]);

print_r($tarefas);`}
        output={`3 tarefas
Array
(
    [1] => praticar arrays a fundo
    [2] => ler PSR-12
)`}
      />

      <AlertBox type="warning" title="unset deixa buracos nas chaves">
        Removendo <code>$tarefas[0]</code> as chaves <code>1</code> e <code>2</code> permanecem.
        Se quiser reindexar do zero, use <code>array_values($tarefas)</code>.
      </AlertBox>

      <h2>Desestruturação: extraindo valores em uma linha</h2>
      <p>
        Em vez de <code>$nome = $user["nome"]; $email = $user["email"];</code> você pode desestruturar.
        Funciona com índices numéricos e com chaves nomeadas (PHP 7.1+).
      </p>

      <p><strong className="text-[#8993BE] font-mono">list()</strong> — sintaxe antiga de desestruturação: <code>list($a, $b) = [1, 2]</code>. Existe há mais tempo, mas hoje a forma com colchetes <code>[$a, $b] = [1, 2]</code> é a recomendada (PHP 7.1+) e funciona inclusive com chaves nomeadas. Use <code>list()</code> só pra compatibilidade com código muito antigo.</p>

      <PhpBlock
        filename="desestruturacao.php"
        code={`<?php
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
}`}
        output={`x=10 y=20 z=30
Linus <linus@kernel.org>
#1: novo
#2: ativo`}
      />

      <p>
        A forma antiga era <code>list($a, $b) = $arr</code>. Ela ainda funciona, mas a versão com colchetes
        <code> [$a, $b] = $arr</code> é a recomendada hoje. Use <code>list()</code> apenas se for manter
        compatibilidade com código muito antigo.
      </p>

      <h2>Spread (...): expandindo arrays</h2>
      <p>
        O operador <code>...</code> espalha um array dentro de outro. Útil para juntar listas, encaminhar
        argumentos para funções e clonar com pequenas alterações. A partir do PHP 8.1, funciona também com
        chaves string.
      </p>

      <p><strong className="text-[#8993BE] font-mono">[...$a] (spread)</strong> — operador que espalha os elementos de um array dentro de outro array ou de uma chamada de função. Existe pra juntar listas, encaminhar argumentos e clonar com pequenas mudanças sem precisar de <code>array_merge</code>. Sintaxe: <code>[...$a, ...$b, 7]</code> ou <code>somar(...$valores)</code>. Suporta chaves string desde PHP 8.1.</p>

      <PhpBlock
        filename="spread.php"
        code={`<?php
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
echo somar(...$valores) . PHP_EOL;`}
        output={`Array
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
60`}
      />

      <h2>Arrays multi-dimensionais</h2>
      <p>
        Não existe array 2D especial em PHP — você apenas guarda arrays dentro de arrays. É como uma planilha,
        ou uma resposta JSON aninhada. A sintaxe de acesso encadeia colchetes: <code>$matriz[1][2]</code>.
      </p>

      <PhpBlock
        filename="multi.php"
        code={`<?php
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
}`}
        output={`Linus
kernel
Ada (#1): math, logic
Linus (#2): c, git, kernel
Grace (#3): cobol, compilers`}
      />

      <h2>count: contando o que importa</h2>
      <p>
        <code>count</code> retorna a quantidade de elementos no array. Cuidado: <code>count</code> em
        <code> null</code> dispara <em>TypeError</em> no PHP 8 (no PHP 7 era warning). Sempre garanta que está
        passando array, ou use <code>count($arr ?? [])</code>.
      </p>

      <PhpBlock
        filename="count.php"
        code={`<?php
declare(strict_types=1);

$itens = ["a", "b", "c", "d"];
echo count($itens) . PHP_EOL;

$matriz = [[1, 2, 3], [4, 5], [6]];
echo count($matriz) . PHP_EOL;
echo count($matriz, COUNT_RECURSIVE) . PHP_EOL;

$opcional = null;
echo count($opcional ?? []) . PHP_EOL;`}
        output={`4
3
9
0`}
      />

      <AlertBox type="success" title="Quando o array está vazio?">
        <code>empty($arr)</code> retorna <code>true</code> para array vazio. Mas a forma mais explícita é
        <code> count($arr) === 0</code>. Em condicionais, lembre que <code>[]</code> é falsy:
        <code> if (!$arr) {`{ ... }`}</code> também funciona.
      </AlertBox>

      <h2>Array nas funções: passa por valor</h2>
      <p>
        Ao contrário de objetos, arrays em PHP são passados <strong>por valor</strong>. Se você quiser modificar
        o array original dentro de uma função, use <code>&amp;</code> (referência) explicitamente — ou, melhor,
        retorne uma nova versão.
      </p>

      <PhpBlock
        filename="por-valor.php"
        code={`<?php
declare(strict_types=1);

function adicionarItem(array $lista, string $item): array {
    $lista[] = $item;
    return $lista;
}

$base = ["a", "b"];
$nova = adicionarItem($base, "c");

print_r($base);
print_r($nova);`}
        output={`Array
(
    [0] => a
    [1] => b
)
Array
(
    [0] => a
    [1] => b
    [2] => c
)`}
      />

      <p>
        Você acabou de ver os fundamentos. No próximo capítulo a gente sobe a régua e olha as <strong>funções
        de array</strong> — <code>array_map</code>, <code>array_filter</code>, <code>array_reduce</code> e amigos.
        É lá que o código vira elegante.
      </p>
    </PageContainer>
  );
}
