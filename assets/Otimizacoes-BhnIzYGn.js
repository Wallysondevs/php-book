import{j as e}from"./index-Bb4MiiJL.js";import{P as s,a,A as o}from"./AlertBox-BpD-xIsb.js";import{T as r}from"./TerminalBlock-DGurMC1r.js";function t(){return e.jsxs(s,{title:"Otimizações práticas",subtitle:"Os ganhos reais não vêm de truques exóticos: vêm de matar N+1, escolher a estrutura certa, otimizar o autoloader e medir antes de chutar.",difficulty:"avancado",timeToRead:"13 min",category:"Performance",children:[e.jsx("h2",{children:"O inimigo número 1: o problema N+1"}),e.jsxs("p",{children:["Você lista 100 pedidos e, para cada um, busca o cliente em uma query separada. Resultado:",e.jsx("strong",{children:" 1 query da listagem + 100 queries dos clientes = 101 round-trips no banco"}),". Em um endpoint quente, isso destrói o tempo de resposta antes mesmo do PHP entrar em cena."]}),e.jsx(a,{filename:"n_mais_um_ruim.php",code:`<?php
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
}`,output:`Pedido #1 — Ana — R$ 120.00
Pedido #2 — Bruno — R$ 89.50
... (e mais 98 queries no banco)`}),e.jsxs("p",{children:["A solução clássica é ",e.jsx("strong",{children:"eager loading"}),": pegue todos os IDs envolvidos numa primeira passada e faça uma ",e.jsx("em",{children:"única"})," query ",e.jsx("code",{children:"WHERE id IN (...)"}),"."]}),e.jsx(a,{filename:"eager_loading.php",code:`<?php
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
}`,output:`Pedido #1 — Ana — R$ 120.00
Pedido #2 — Bruno — R$ 89.50
... (apenas 2 queries no total)`}),e.jsxs(o,{type:"success",title:"De 101 para 2 queries",children:["Esse é o tipo de mudança que tira ",e.jsx("strong",{children:"800ms"})," de um endpoint sem você precisar comprar máquina maior. ORMs como ",e.jsx("code",{children:"doctrine/orm"})," e Eloquent têm",e.jsx("code",{children:" with()"})," / ",e.jsx("code",{children:"fetchEager()"})," exatamente para isso."]}),e.jsx("h2",{children:"array_map vs foreach — quando faz diferença?"}),e.jsxs("p",{children:["Em PHP 8.4, ",e.jsx("code",{children:"foreach"})," é geralmente igual ou ligeiramente mais rápido que",e.jsx("code",{children:" array_map"}),", principalmente por evitar a chamada de função por elemento. Mas ",e.jsx("code",{children:"array_map"})," ganha em ",e.jsx("em",{children:"legibilidade"})," e ",e.jsx("em",{children:"imutabilidade"}),": ele sempre retorna um array novo, sem mutar o original."]}),e.jsx(a,{filename:"map_vs_foreach.php",code:`<?php
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

print_r($upper3);`,output:`Array
(
    [0] => ADA!
    [1] => LINUS!
    [2] => GRACE!
    [3] => DENNIS!
)`}),e.jsxs(o,{type:"info",title:"Regra prática",children:["Use ",e.jsx("code",{children:"foreach"})," em hot paths com 100k+ iterações; use ",e.jsx("code",{children:"array_map"})," /",e.jsx("code",{children:" array_filter"})," / ",e.jsx("code",{children:"array_reduce"})," em código de domínio onde clareza importa mais que microssegundos."]}),e.jsx("h2",{children:"isset vs array_key_exists vs ?? — qual usar?"}),e.jsx("p",{children:"Muita gente confunde, e a diferença importa para performance e correção:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"isset($a['k'])"}),": rápido, mas devolve ",e.jsx("code",{children:"false"})," se o valor for ",e.jsx("code",{children:"null"}),"."]}),e.jsxs("li",{children:[e.jsx("code",{children:"array_key_exists('k', $a)"}),": detecta chave mesmo com valor ",e.jsx("code",{children:"null"}),", porém é uma chamada de função (mais lento)."]}),e.jsxs("li",{children:[e.jsx("code",{children:"$a['k'] ?? 'padrão'"}),": açúcar para ",e.jsx("code",{children:"isset"})," + ternário; é o jeito moderno."]})]}),e.jsx(a,{filename:"isset_vs.php",code:`<?php
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
echo "Porta: $porta" . PHP_EOL;`,output:`bool(false)
bool(true)
string(9) "desligado"
Porta: 8080`}),e.jsx("h2",{children:"Autoloader otimizado em produção"}),e.jsxs("p",{children:["Em dev, o Composer faz lookup dinâmico das classes — útil para hot reload. Em produção, isso é desperdício: cada ",e.jsx("code",{children:"new App\\Foo"})," consulta o filesystem. Gere um classmap autoritativo para que o autoloader vire um simples ",e.jsx("code",{children:"require"})," de array indexado."]}),e.jsx(r,{user:"dev",host:"php",cwd:"~/app",command:"composer dump-autoload --optimize --classmap-authoritative --no-dev",output:`Generating optimized autoload files (authoritative)
Generated optimized autoload files containing 4128 classes`}),e.jsxs(o,{type:"warning",title:"Pegadinha de deploy",children:["Com ",e.jsx("code",{children:"--classmap-authoritative"}),", classes ",e.jsx("em",{children:"fora"})," do classmap não são encontradas, mesmo que existam no disco. Rode esse comando ",e.jsx("strong",{children:"depois"})," do",e.jsx("code",{children:" composer install --no-dev"}),", no servidor (ou no build da imagem Docker)."]}),e.jsx("h2",{children:"Nunca chame require dentro de loop"}),e.jsxs("p",{children:["Cada ",e.jsx("code",{children:"require"})," abre o arquivo, lê e compila. Em loop com 1000 iterações você paga isso 1000 vezes. Mova o require para fora ou — melhor — use o autoloader do Composer."]}),e.jsx(a,{filename:"require_loop.php",code:`<?php
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
// e o opcache mantém tudo em memória.`}),e.jsx("h2",{children:"Generators para datasets enormes"}),e.jsxs("p",{children:["Carregar 1 milhão de linhas em um array consome RAM proporcional. Um generator (",e.jsx("code",{children:"yield"}),") entrega item por item, mantendo a memória constante. Casa perfeito para CSV gigante, export, ETL."]}),e.jsx(a,{filename:"generator_csv.php",code:`<?php
declare(strict_types=1);

function lerCsv(string $arquivo): Generator {
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
echo "Memória de pico: " . round(memory_get_peak_usage(true) / 1024 / 1024, 2) . " MB" . PHP_EOL;`,output:`Total processado: R$ 1.284.991,73
Memória de pico: 2.00 MB`}),e.jsxs(o,{type:"success",title:"Memória constante, mesmo com 10M de linhas",children:["Sem o generator, o mesmo script consumiria centenas de MB e provavelmente bateria no",e.jsx("code",{children:" memory_limit"}),". Com ",e.jsx("code",{children:"yield"}),", fica em ~2MB independente do tamanho."]}),e.jsx("h2",{children:"Microbenchmarks: meça antes de chutar"}),e.jsxs("p",{children:["Não otimize por intuição. Use ",e.jsx("code",{children:"hyperfine"})," para comparar scripts inteiros do lado de fora, e ",e.jsx("code",{children:"phpbench/phpbench"})," para benchmarks granulares dentro do PHP."]}),e.jsx(r,{user:"dev",host:"php",cwd:"~/app",command:"hyperfine --warmup 3 'php n_mais_um_ruim.php' 'php eager_loading.php'",output:`Benchmark 1: php n_mais_um_ruim.php
  Time (mean ± σ):      842.3 ms ±  18.4 ms

Benchmark 2: php eager_loading.php
  Time (mean ± σ):       42.1 ms ±   1.9 ms

Summary
  'php eager_loading.php' ran 20.01 ± 1.05 times faster than 'php n_mais_um_ruim.php'`}),e.jsx(r,{user:"dev",host:"php",cwd:"~/app",command:"composer require --dev phpbench/phpbench",output:`Using version ^1.3 for phpbench/phpbench
./composer.json has been updated`}),e.jsx(a,{filename:"benchmarks/MapBench.php",code:`<?php
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
}`}),e.jsx(r,{user:"dev",host:"php",cwd:"~/app",command:"vendor/bin/phpbench run benchmarks/ --report=default",output:`+-----------+---------------+-----+--------+----------+
| benchmark | subject       | revs| its    | mean     |
+-----------+---------------+-----+--------+----------+
| MapBench  | benchForeach  | 1000| 5      | 312.4μs  |
| MapBench  | benchArrayMap | 1000| 5      | 401.7μs  |
+-----------+---------------+-----+--------+----------+`}),e.jsxs(o,{type:"info",title:"Lei de Knuth, atualizada",children:["“Otimização prematura é a raiz de todo mal” — mas ",e.jsx("em",{children:"não medir"})," é a raiz de regressões silenciosas em produção. Crie uma suíte mínima de benchmarks para os 3-4 hot paths do seu app e rode no CI."]}),e.jsxs("p",{children:["No próximo capítulo entramos em ",e.jsx("strong",{children:"Nginx + PHP-FPM"}),": como o servidor web conversa com o PHP, e como tunar o pool de workers para o seu padrão de carga real."]})]})}export{t as default};
