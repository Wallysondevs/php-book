import{j as e}from"./index-Bb4MiiJL.js";import{P as s,A as o,a}from"./AlertBox-BpD-xIsb.js";import{T as c}from"./TerminalBlock-DGurMC1r.js";import{C as r}from"./CodeBlock-C3V-qEkN.js";function m(){return e.jsxs(s,{title:"Memcached",subtitle:"Cache em memória puro, sem firulas: chave → valor com TTL. Quando você quer o mais simples, mais rápido e mais previsível possível.",difficulty:"intermediario",timeToRead:"11 min",category:"Cache & Filas",children:[e.jsx("h2",{children:"O problema: o Redis é demais para o que você precisa"}),e.jsxs("p",{children:["Você quer só guardar respostas de API por 60 segundos. Não precisa de listas, sets, hashes, pub/sub, persistência em disco, replicação. Só ",e.jsx("strong",{children:"chave → valor → TTL"}),". Para isso o",e.jsx("strong",{children:"Memcached"})," é praticamente imbatível: é um daemon minúsculo, multi-thread, com uma API de uma página, e que escala horizontalmente de forma trivial via ",e.jsx("em",{children:"consistent hashing"})," ","no cliente."]}),e.jsxs(o,{type:"warning",title:"Atenção: existem DUAS extensões diferentes",children:[e.jsxs("ul",{className:"list-disc ml-5 mt-1 space-y-1",children:[e.jsxs("li",{children:[e.jsx("code",{children:"memcache"}),' (antiga, sem "d") — ',e.jsx("strong",{children:"abandonada"}),", não funciona em PHP 8."]}),e.jsxs("li",{children:[e.jsx("code",{children:"memcached"}),' (com "d", baseada em libmemcached) — é a que você quer. Suporta CAS, multi-get, binário.']})]}),"Tudo neste capítulo usa a extensão ",e.jsx("code",{children:"php-memcached"}),"."]}),e.jsx("h2",{children:"Instalação da extensão"}),e.jsx(c,{user:"dev",host:"php",cwd:"~",command:"sudo apt install -y memcached php-memcached && php -m | grep memcached",output:`Reading package lists... Done
Building dependency tree... Done
The following NEW packages will be installed:
  libmemcached11 memcached php-memcached
Setting up memcached (1.6.24-1) ...
Setting up php-memcached (3.3.0+1) ...
memcached`}),e.jsx("h2",{children:"Conectando: addServer"}),e.jsxs("p",{children:["Diferente de Redis (uma conexão TCP normal), o cliente Memcached recebe uma ",e.jsx("strong",{children:"lista de servidores"})," e distribui as chaves entre eles via hash consistente. Para um único nó, você ainda assim chama ",e.jsx("code",{children:"addServer"}),":"]}),e.jsx(a,{filename:"bin/conectar.php",code:`<?php
declare(strict_types=1);

$mc = new Memcached();
$mc->addServer('127.0.0.1', 11211);

// Para cluster, basta listar todos:
// $mc->addServers([
//     ['cache1.local', 11211],
//     ['cache2.local', 11211],
//     ['cache3.local', 11211],
// ]);

if (!$mc->set('saudacao', 'olá, mundo')) {
    fwrite(STDERR, "Falha: " . $mc->getResultMessage() . PHP_EOL);
    exit(1);
}

echo $mc->get('saudacao') . PHP_EOL;
echo "código: " . $mc->getResultCode() . " (0 = SUCCESS)" . PHP_EOL;`,output:`olá, mundo
código: 0 (0 = SUCCESS)`}),e.jsx("h2",{children:"set / get com TTL"}),e.jsxs("p",{children:["O TTL vai como ",e.jsx("strong",{children:"terceiro parâmetro"})," de ",e.jsx("code",{children:"set()"}),". Em segundos, ou"," ",e.jsx("em",{children:"timestamp Unix"})," se for maior que 30 dias (esquisitice histórica do protocolo)."]}),e.jsx(a,{filename:"bin/cache-aside.php",code:`<?php
declare(strict_types=1);

$mc = new Memcached();
$mc->addServer('127.0.0.1', 11211);
// Use sempre serializer JSON ou igbinary se vai ler em outras linguagens
$mc->setOption(Memcached::OPT_SERIALIZER, Memcached::SERIALIZER_JSON);

function pegarPerfil(Memcached $mc, int $userId): array
{
    $chave = "perfil:{$userId}";
    $cache = $mc->get($chave);

    if ($mc->getResultCode() === Memcached::RES_SUCCESS) {
        echo "(hit)" . PHP_EOL;
        return $cache;
    }

    echo "(miss — buscando do banco)" . PHP_EOL;
    $perfil = ['id' => $userId, 'nome' => 'Ada', 'pontos' => 1024];

    $mc->set($chave, $perfil, 300); // 5 minutos
    return $perfil;
}

print_r(pegarPerfil($mc, 42));
print_r(pegarPerfil($mc, 42));
print_r(pegarPerfil($mc, 99));`,output:`(miss — buscando do banco)
Array ( [id] => 42 [nome] => Ada [pontos] => 1024 )
(hit)
Array ( [id] => 42 [nome] => Ada [pontos] => 1024 )
(miss — buscando do banco)
Array ( [id] => 99 [nome] => Ada [pontos] => 1024 )`}),e.jsxs(o,{type:"info",title:"Por que checar getResultCode()?",children:[e.jsx("code",{children:"get()"})," retorna ",e.jsx("code",{children:"false"})," tanto quando a chave não existe quanto quando o valor armazenado é literalmente ",e.jsx("code",{children:"false"}),". ",e.jsx("code",{children:"getResultCode()"})," distingue",e.jsx("code",{children:"RES_SUCCESS"})," de ",e.jsx("code",{children:"RES_NOTFOUND"})," sem ambiguidade."]}),e.jsx("h2",{children:"setMulti / getMulti: a virada de jogo de performance"}),e.jsxs("p",{children:["Cada round-trip pela rede custa caro. Em vez de fazer 50 ",e.jsx("code",{children:"get()"})," seguidos, faça"," ",e.jsx("code",{children:"getMulti(['a', 'b', 'c', ...])"})," — uma viagem só, latência reduzida em 50x."]}),e.jsx(a,{filename:"bin/multi.php",code:`<?php
declare(strict_types=1);

$mc = new Memcached();
$mc->addServer('127.0.0.1', 11211);

// setMulti: grava 4 chaves em uma chamada
$mc->setMulti([
    'produto:1' => ['nome' => 'Café',   'preco' => 29.90],
    'produto:2' => ['nome' => 'Pão',    'preco' =>  8.50],
    'produto:3' => ['nome' => 'Leite',  'preco' =>  6.20],
    'produto:4' => ['nome' => 'Açúcar', 'preco' =>  4.10],
], 600);

// getMulti: pega todas em uma só viagem
$resultado = $mc->getMulti(['produto:1', 'produto:2', 'produto:3', 'produto:99']);

foreach ($resultado as $chave => $valor) {
    printf("%-12s -> %s (R$ %.2f)%s",
        $chave, $valor['nome'], $valor['preco'], PHP_EOL);
}

echo "produto:99 estava no resultado? " .
     (isset($resultado['produto:99']) ? 'sim' : 'não — não existia') . PHP_EOL;`,output:`produto:1    -> Café (R$ 29.90)
produto:2    -> Pão (R$ 8.50)
produto:3    -> Leite (R$ 6.20)
produto:99 estava no resultado? não — não existia`}),e.jsx("h2",{children:"Counters atômicos: increment / decrement"}),e.jsx(a,{filename:"bin/contador.php",code:`<?php
declare(strict_types=1);

$mc = new Memcached();
$mc->addServer('127.0.0.1', 11211);

// Importante: increment exige que a chave já exista com valor numérico.
$mc->set('views:home', 0, 0);

echo $mc->increment('views:home') . PHP_EOL;       // 1
echo $mc->increment('views:home', 5) . PHP_EOL;    // 6
echo $mc->decrement('views:home', 2) . PHP_EOL;    // 4

// Atalho seguro: cria com valor inicial se não existir
$mc->increment('rate:user:42', 1, 1, 60);
$mc->increment('rate:user:42', 1, 1, 60);
$mc->increment('rate:user:42', 1, 1, 60);

echo "rate user 42: " . $mc->get('rate:user:42') . " (TTL 60s)" . PHP_EOL;`,output:`1
6
4
rate user 42: 3 (TTL 60s)`}),e.jsx("h2",{children:"CAS: compare-and-swap (atualização sem race condition)"}),e.jsxs("p",{children:["Imagine dois workers tentando atualizar o mesmo carrinho. Worker A lê, calcula novo total, escreve. Entre o ler e o escrever, Worker B fez o mesmo — e a alteração de A sobrescreve a de B. ",e.jsx("strong",{children:"CAS"})," resolve: você lê com um ",e.jsx("em",{children:"token de versão"})," e só escreve se o token ainda for o atual."]}),e.jsx(a,{filename:"bin/cas.php",code:`<?php
declare(strict_types=1);

$mc = new Memcached();
$mc->addServer('127.0.0.1', 11211);

$mc->set('carrinho:42', ['itens' => 0, 'total' => 0.0], 600);

function adicionarItem(Memcached $mc, float $preco): void
{
    $tentativa = 0;
    while ($tentativa++ < 5) {
        $valor = $mc->get('carrinho:42', null, $cas);
        if ($mc->getResultCode() !== Memcached::RES_SUCCESS) {
            throw new RuntimeException('Carrinho sumiu.');
        }

        $valor['itens']++;
        $valor['total'] += $preco;

        $ok = $mc->cas($cas, 'carrinho:42', $valor, 600);
        if ($ok) {
            echo "OK (tent {$tentativa}): itens={$valor['itens']} total=" . $valor['total'] . PHP_EOL;
            return;
        }
        echo "(conflito CAS, tentando de novo)" . PHP_EOL;
    }
    throw new RuntimeException('Não consegui atualizar carrinho após 5 tentativas.');
}

adicionarItem($mc, 29.90);
adicionarItem($mc, 8.50);
adicionarItem($mc, 6.20);

print_r($mc->get('carrinho:42'));`,output:`OK (tent 1): itens=1 total=29.9
OK (tent 1): itens=2 total=38.4
OK (tent 1): itens=3 total=44.6
Array
(
    [itens] => 3
    [total] => 44.6
)`}),e.jsx(o,{type:"success",title:"CAS é o jeito certo de fazer read-modify-write",children:"Sem CAS, você precisaria de lock externo (Redis, banco) para evitar lost updates. Com CAS, o próprio Memcached vira árbitro — e o pior caso é só você ter que tentar de novo."}),e.jsx("h2",{children:"Memcached vs Redis: quando escolher cada um"}),e.jsx("p",{children:"Os dois servem para cache, ambos rodam em RAM, ambos são rápidos. Mas o caso de uso decide:"}),e.jsx(r,{title:"comparação rápida",language:"bash",code:`MEMCACHED                              REDIS
-------------------------------------- --------------------------------------
Chave -> valor (string ou serializado) Strings, listas, sets, hashes,
                                       sorted sets, streams, geo, hyperloglog
TTL                                    TTL + persistência opcional (RDB/AOF)
Multi-thread                           Single-thread (mas com I/O multiplexado)
Sem persistência (cache puro)          Pode ser BD primário se preciso
Sem replicação nativa                  Replicação master-replica + Sentinel/Cluster
Sem pub/sub, sem fila, sem scripts     Pub/sub, streams, Lua scripts, transações
~256 KB por valor (default)            512 MB por valor
Cluster via consistent hashing client  Cluster oficial com sharding e failover

ESCOLHA MEMCACHED quando:               ESCOLHA REDIS quando:
- Cache puro de página/fragmento        - Precisa de filas, contadores complexos,
- Você quer o mais simples possível       leaderboards, pub/sub
- Multi-thread em CPUs grandes          - Quer persistência ou réplica
                                        - Quer rate limiting com janela deslizante
                                        - Quer locks distribuídos (Redlock)`}),e.jsxs(o,{type:"info",title:"Resposta curta",children:["Em projeto novo, comece com ",e.jsx("strong",{children:"Redis"})," — ele faz tudo que Memcached faz e muito mais, com pouca diferença de performance. Vá para Memcached só se você tem um caso específico de cache massivo de página, com chaves enormes e CPUs de 32+ cores onde o multi-threading compensa."]}),e.jsx("h2",{children:"Subindo Memcached local"}),e.jsx(r,{title:"docker-compose.yml",language:"yaml",code:`services:
  memcached:
    image: memcached:1.6-alpine
    ports:
      - "11211:11211"
    command: ["memcached", "-m", "256", "-v"]`}),e.jsx(c,{user:"dev",host:"php",cwd:"~/projetos/api",command:"docker compose up -d memcached && echo stats | nc -q 1 localhost 11211 | head -8",output:`[+] Running 2/2
 ✔ Network api_default       Created
 ✔ Container api-memcached-1 Started
STAT pid 1
STAT uptime 2
STAT time 1736950128
STAT version 1.6.24
STAT pointer_size 64
STAT curr_connections 1
STAT total_connections 2
STAT bytes_read 6`}),e.jsxs("p",{children:["Memcached é uma ferramenta afiada para um problema só — e por isso brilha. No próximo capítulo, a gente entra em ",e.jsx("strong",{children:"filas e workers em background"}),", onde o cache vira só uma peça de uma arquitetura maior."]})]})}export{m as default};
