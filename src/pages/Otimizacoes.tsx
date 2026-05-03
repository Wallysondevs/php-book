import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Otimizacoes() {
  return (
    <PageContainer
      title="Otimizações práticas"
      subtitle="Os ganhos reais não vêm de truques exóticos: vêm de matar N+1, escolher a estrutura certa, otimizar o autoloader e medir antes de chutar."
      difficulty="avancado"
      timeToRead="13 min"
      category="Performance"
    >
      <AlertBox type="info" title="Pré-requisitos">
          <p>Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP.</p>
        </AlertBox>
        <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"Mensure first"}</strong> {' — '} {"profile antes de otimizar; chute = bug."}
          </li>
        <li>
            <strong>{"OPcache + JIT"}</strong> {' — '} {"ganho global gratuito."}
          </li>
        <li>
            <strong>{"Cache de resultados"}</strong> {' — '} {"memoize chamadas caras (Redis, APCu)."}
          </li>
        <li>
            <strong>{"Lazy loading"}</strong> {' — '} {"evite carregar dados desnecessários."}
          </li>
        <li>
            <strong>{"Algoritmo > micro-opt"}</strong> {' — '} {"O(n) → O(log n) ganha mais que truques."}
          </li>
        </ul>
          <h2>O inimigo número 1: o problema N+1</h2>
      <p>
        Você lista 100 pedidos e, para cada um, busca o cliente em uma query separada. Resultado:
        <strong> 1 query da listagem + 100 queries dos clientes = 101 round-trips no banco</strong>.
        Em um endpoint quente, isso destrói o tempo de resposta antes mesmo do PHP entrar em cena.
      </p>

      <PhpBlock
        filename="n_mais_um_ruim.php"
        code={`<?php
declare(strict_types=1);

$pdo = new PDO('mysql:host=localhost;dbname=loja', 'app', 'secret', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
]);

$pedidos = $pdo->query('SELECT id, cliente_id, total FROM pedidos LIMIT 100')
               ->fetchAll(PDO::FETCH_ASSOC);

foreach ($pedidos as $p) {
    $stmt = $pdo->prepare('SELECT nome FROM clientes WHERE id = :id');
    $stmt->execute([':id' => $p['cliente_id']]);
    $cliente = $stmt->fetch(PDO::FETCH_ASSOC);

    echo "Pedido #{$p['id']} — {$cliente['nome']} — R$ {$p['total']}" . PHP_EOL;
}`}
        output={`Pedido #1 — Ana — R$ 120.00
Pedido #2 — Bruno — R$ 89.50
... (e mais 98 queries no banco)`}
      />

      <p>
        A solução clássica é <strong>eager loading</strong>: pegue todos os IDs envolvidos numa
        primeira passada e faça uma <em>única</em> query <code>WHERE id IN (...)</code>.
      </p>

      <PhpBlock
        filename="eager_loading.php"
        code={`<?php
declare(strict_types=1);

$pdo = new PDO('mysql:host=localhost;dbname=loja', 'app', 'secret', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
]);

$pedidos = $pdo->query('SELECT id, cliente_id, total FROM pedidos LIMIT 100')
               ->fetchAll(PDO::FETCH_ASSOC);

$ids = array_unique(array_column($pedidos, 'cliente_id'));
$placeholders = implode(',', array_fill(0, count($ids), '?'));

$stmt = $pdo->prepare("SELECT id, nome FROM clientes WHERE id IN ($placeholders)");
$stmt->execute(array_values($ids));
$clientes = array_column($stmt->fetchAll(PDO::FETCH_ASSOC), 'nome', 'id');

foreach ($pedidos as $p) {
    echo "Pedido #{$p['id']} — {$clientes[$p['cliente_id']]} — R$ {$p['total']}" . PHP_EOL;
}`}
        output={`Pedido #1 — Ana — R$ 120.00
Pedido #2 — Bruno — R$ 89.50
... (apenas 2 queries no total)`}
      />

      <AlertBox type="success" title="De 101 para 2 queries">
        Esse é o tipo de mudança que tira <strong>800ms</strong> de um endpoint sem você precisar
        comprar máquina maior. ORMs como <code>doctrine/orm</code> e Eloquent têm
        <code> with()</code> / <code>fetchEager()</code> exatamente para isso.
      </AlertBox>

      <h2>array_map vs foreach — quando faz diferença?</h2>
      <p>
        Em PHP 8.4, <code>foreach</code> é geralmente igual ou ligeiramente mais rápido que
        <code> array_map</code>, principalmente por evitar a chamada de função por elemento.
        Mas <code>array_map</code> ganha em <em>legibilidade</em> e <em>imutabilidade</em>: ele
        sempre retorna um array novo, sem mutar o original.
      </p>

      <PhpBlock
        filename="map_vs_foreach.php"
        code={`<?php
declare(strict_types=1);

$nomes = ['Ada', 'Linus', 'Grace', 'Dennis'];

// foreach — mais rápido em loops grandes
$upper1 = [];
foreach ($nomes as $n) {
    $upper1[] = strtoupper($n);
}

// array_map — mais declarativo
$upper2 = array_map(strtoupper(...), $nomes);

// arrow fn quando precisa de mais lógica
$upper3 = array_map(fn(string $n) => strtoupper($n) . '!', $nomes);

print_r($upper3);`}
        output={`Array
(
    [0] => ADA!
    [1] => LINUS!
    [2] => GRACE!
    [3] => DENNIS!
)`}
      />

      <AlertBox type="info" title="Regra prática">
        Use <code>foreach</code> em hot paths com 100k+ iterações; use <code>array_map</code> /
        <code> array_filter</code> / <code>array_reduce</code> em código de domínio onde clareza
        importa mais que microssegundos.
      </AlertBox>

      <h2>isset vs array_key_exists vs ?? — qual usar?</h2>
      <p>
        Muita gente confunde, e a diferença importa para performance e correção:
      </p>
      <ul>
        <li><code>isset($a['k'])</code>: rápido, mas devolve <code>false</code> se o valor for <code>null</code>.</li>
        <li><code>array_key_exists('k', $a)</code>: detecta chave mesmo com valor <code>null</code>, porém é uma chamada de função (mais lento).</li>
        <li><code>$a['k'] ?? 'padrão'</code>: açúcar para <code>isset</code> + ternário; é o jeito moderno.</li>
      </ul>

      <PhpBlock
        filename="isset_vs.php"
        code={`<?php
declare(strict_types=1);

$config = [
    'timeout' => 30,
    'debug'   => null,
];

var_dump(isset($config['debug']));              // false (valor é null!)
var_dump(array_key_exists('debug', $config));   // true
var_dump($config['debug'] ?? 'desligado');      // string "desligado"

// Encadeado — null-coalescing brilha aqui
$porta = $config['servidor']['porta'] ?? 8080;
echo "Porta: $porta" . PHP_EOL;`}
        output={`bool(false)
bool(true)
string(9) "desligado"
Porta: 8080`}
      />

      <h2>Autoloader otimizado em produção</h2>
      <p>
        Em dev, o Composer faz lookup dinâmico das classes — útil para hot reload. Em produção,
        isso é desperdício: cada <code>new App\Foo</code> consulta o filesystem. Gere um classmap
        autoritativo para que o autoloader vire um simples <code>require</code> de array indexado.
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/app"
        command="composer dump-autoload --optimize --classmap-authoritative --no-dev"
        output={`Generating optimized autoload files (authoritative)
Generated optimized autoload files containing 4128 classes`}
      />

      <AlertBox type="warning" title="Pegadinha de deploy">
        Com <code>--classmap-authoritative</code>, classes <em>fora</em> do classmap não são
        encontradas, mesmo que existam no disco. Rode esse comando <strong>depois</strong> do
        <code> composer install --no-dev</code>, no servidor (ou no build da imagem Docker).
      </AlertBox>

      <h2>Nunca chame require dentro de loop</h2>
      <p>
        Cada <code>require</code> abre o arquivo, lê e compila. Em loop com 1000 iterações você
        paga isso 1000 vezes. Mova o require para fora ou — melhor — use o autoloader do Composer.
      </p>

      <PhpBlock
        filename="require_loop.php"
        code={`<?php
declare(strict_types=1);

// RUIM — re-inclui a cada iteração (require_once cacheia, mas ainda assim faz stat)
foreach ($itens as $i) {
    require_once __DIR__ . '/lib/Formatador.php';
    echo Formatador::format($i) . PHP_EOL;
}

// BOM — uma vez, fora do loop
require_once __DIR__ . '/lib/Formatador.php';
foreach ($itens as $i) {
    echo Formatador::format($i) . PHP_EOL;
}

// MELHOR — autoloader do Composer (PSR-4) faz isso por você sob demanda
// e o opcache mantém tudo em memória.`}
      />

      <h2>Generators para datasets enormes</h2>
      <p>
        Carregar 1 milhão de linhas em um array consome RAM proporcional. Um generator
        (<code>yield</code>) entrega item por item, mantendo a memória constante. Casa perfeito
        para CSV gigante, export, ETL.
      </p>

      <PhpBlock
        filename="generator_csv.php"
        code={`<?php
declare(strict_types=1);

function lerCsv(string $arquivo): \Generator {
    $fp = fopen($arquivo, 'rb');
    if ($fp === false) {
        throw new RuntimeException("Não consegui abrir $arquivo");
    }
    $cabecalho = fgetcsv($fp);
    while (($linha = fgetcsv($fp)) !== false) {
        yield array_combine($cabecalho, $linha);
    }
    fclose($fp);
}

$total = 0;
foreach (lerCsv('vendas.csv') as $venda) {
    $total += (float) $venda['valor'];
}
echo "Total processado: R$ " . number_format($total, 2, ',', '.') . PHP_EOL;
echo "Memória de pico: " . round(memory_get_peak_usage(true) / 1024 / 1024, 2) . " MB" . PHP_EOL;`}
        output={`Total processado: R$ 1.284.991,73
Memória de pico: 2.00 MB`}
      />

      <AlertBox type="success" title="Memória constante, mesmo com 10M de linhas">
        Sem o generator, o mesmo script consumiria centenas de MB e provavelmente bateria no
        <code> memory_limit</code>. Com <code>yield</code>, fica em ~2MB independente do tamanho.
      </AlertBox>

      <h2>Microbenchmarks: meça antes de chutar</h2>
      <p>
        Não otimize por intuição. Use <code>hyperfine</code> para comparar scripts inteiros do
        lado de fora, e <code>phpbench/phpbench</code> para benchmarks granulares dentro do PHP.
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/app"
        command="hyperfine --warmup 3 'php n_mais_um_ruim.php' 'php eager_loading.php'"
        output={`Benchmark 1: php n_mais_um_ruim.php
  Time (mean ± σ):      842.3 ms ±  18.4 ms

Benchmark 2: php eager_loading.php
  Time (mean ± σ):       42.1 ms ±   1.9 ms

Summary
  'php eager_loading.php' ran 20.01 ± 1.05 times faster than 'php n_mais_um_ruim.php'`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/app"
        command="composer require --dev phpbench/phpbench"
        output={`Using version ^1.3 for phpbench/phpbench
./composer.json has been updated`}
      />

      <PhpBlock
        filename="benchmarks/MapBench.php"
        code={`<?php
declare(strict_types=1);

namespace App\\Benchmarks;

use PhpBench\\Attributes as Bench;

final class MapBench
{
    private array $dados;

    public function setUp(): void
    {
        $this->dados = range(1, 10_000);
    }

    #[Bench\\Revs(1000)]
    #[Bench\\Iterations(5)]
    public function benchForeach(): void
    {
        $r = [];
        foreach ($this->dados as $n) {
            $r[] = $n * 2;
        }
    }

    #[Bench\\Revs(1000)]
    #[Bench\\Iterations(5)]
    public function benchArrayMap(): void
    {
        array_map(fn(int $n) => $n * 2, $this->dados);
    }
}`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/app"
        command="vendor/bin/phpbench run benchmarks/ --report=default"
        output={`+-----------+---------------+-----+--------+----------+
| benchmark | subject       | revs| its    | mean     |
+-----------+---------------+-----+--------+----------+
| MapBench  | benchForeach  | 1000| 5      | 312.4μs  |
| MapBench  | benchArrayMap | 1000| 5      | 401.7μs  |
+-----------+---------------+-----+--------+----------+`}
      />

      <AlertBox type="info" title="Lei de Knuth, atualizada">
        “Otimização prematura é a raiz de todo mal” — mas <em>não medir</em> é a raiz de
        regressões silenciosas em produção. Crie uma suíte mínima de benchmarks para os 3-4 hot
        paths do seu app e rode no CI.
      </AlertBox>

      <p>
        No próximo capítulo entramos em <strong>Nginx + PHP-FPM</strong>: como o servidor web
        conversa com o PHP, e como tunar o pool de workers para o seu padrão de carga real.
      </p>
    </PageContainer>
  );
}
