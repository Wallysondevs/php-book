import{j as e}from"./index-Bb4MiiJL.js";import{P as a,a as s,A as o}from"./AlertBox-BpD-xIsb.js";import{T as i}from"./TerminalBlock-DGurMC1r.js";import{C as r}from"./CodeBlock-C3V-qEkN.js";function p(){return e.jsxs(a,{title:"Redis (Predis)",subtitle:"Estruturas de dados em memória, sub-milissegundo de latência: cache, contadores, filas, sets e pub/sub. Tudo via Predis, o cliente Redis em PHP puro mais usado.",difficulty:"intermediario",timeToRead:"13 min",category:"Cache & Filas",children:[e.jsx("h2",{children:"O problema: o banco está suando para responder coisas óbvias"}),e.jsxs("p",{children:["Sua API recebe 5.000 req/min para buscar a lista de categorias. As categorias mudam uma vez por dia. Mesmo assim, todo request faz ",e.jsx("code",{children:"SELECT * FROM categorias"})," — e o banco vira gargalo. ",e.jsx("strong",{children:"Redis"})," resolve isso: você guarda a resposta em memória RAM por 1 minuto e o banco descansa. Mas Redis é muito mais que cache — é um servidor de",e.jsx("em",{children:"estruturas de dados"}),": strings, listas, sets, hashes, ordered sets, streams, pub/sub."]}),e.jsx("h2",{children:"Instalação: Predis (cliente em PHP puro)"}),e.jsxs("p",{children:["Você tem duas opções: a ",e.jsx("strong",{children:"extensão phpredis"})," (compilada em C, mais rápida, exige",e.jsx("code",{children:"pecl install"}),") ou o ",e.jsx("strong",{children:"Predis"})," (biblioteca Composer, em PHP puro, mesma API, zero dependência de extensão). Para começar e para a maioria dos casos, Predis é o caminho mais simples:"]}),e.jsx(i,{user:"dev",host:"php",cwd:"~/projetos/api",command:"composer require predis/predis",output:`Using version ^2.3 for predis/predis
./composer.json has been updated
Running composer update predis/predis
Lock file operations: 1 install, 0 updates, 0 removals
  - Locking predis/predis (v2.3.0)
Writing lock file
Installing dependencies from lock file (including require-dev)
Package operations: 1 install, 0 updates, 0 removals
  - Installing predis/predis (v2.3.0)
Generating optimized autoload files`}),e.jsx("h2",{children:"Conectando e o trio sagrado: SET / GET / DEL"}),e.jsx(s,{filename:"bin/cache.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Predis\\Client;

$redis = new Client([
    'scheme' => 'tcp',
    'host'   => '127.0.0.1',
    'port'   => 6379,
]);

$redis->set('app:nome', 'Loja do Café');
echo $redis->get('app:nome') . PHP_EOL;

$redis->set('user:42:nome', 'Ada');
$redis->set('user:42:email', 'ada@example.com');

echo "Existe user:42:nome? " . ($redis->exists('user:42:nome') ? 'sim' : 'não') . PHP_EOL;

$redis->del('user:42:email');

echo "Após del, existe email? " . ($redis->exists('user:42:email') ? 'sim' : 'não') . PHP_EOL;`,output:`Loja do Café
Existe user:42:nome? sim
Após del, existe email? não`}),e.jsxs(o,{type:"info",title:"Convenção de nomes de chave",children:["Use ",e.jsx("code",{children:":"})," como separador hierárquico: ",e.jsx("code",{children:"user:42:perfil"}),", ",e.jsx("code",{children:"cache:produtos:lista"}),","," ",e.jsxs("code",{children:["session:","{token}"]}),". É só convenção, mas todo mundo usa — e ferramentas como RedisInsight agrupam visualmente por isso."]}),e.jsx("h2",{children:"TTL: quando a chave expira sozinha"}),e.jsxs("p",{children:["O grande superpoder de Redis para cache é ",e.jsx("strong",{children:"expiração automática"}),". Você define um TTL (time-to-live) em segundos e a chave some. Tem duas formas:"]}),e.jsx(s,{filename:"bin/ttl.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Predis\\Client;

$redis = new Client();

// Forma 1: setex — set + ttl em uma chamada (recomendada)
$redis->setex('cache:home', 60, json_encode(['banner' => 'Black Friday']));

// Forma 2: set + expire (duas chamadas, mas funciona)
$redis->set('cache:rodape', 'Sobre nós | Contato');
$redis->expire('cache:rodape', 30);

echo 'TTL home:   ' . $redis->ttl('cache:home') . " seg" . PHP_EOL;
echo 'TTL rodapé: ' . $redis->ttl('cache:rodape') . " seg" . PHP_EOL;
echo 'TTL nome:   ' . $redis->ttl('app:nome') . " seg (-1 = sem TTL)" . PHP_EOL;
echo 'TTL fake:   ' . $redis->ttl('nao-existe') . " seg (-2 = não existe)" . PHP_EOL;

// Padrão "cache aside"
function pegarCategorias(Client $redis): array
{
    $cache = $redis->get('cache:categorias');
    if ($cache !== null) {
        echo "(hit do cache)" . PHP_EOL;
        return json_decode($cache, true);
    }

    echo "(miss — buscando do banco)" . PHP_EOL;
    $dados = ['Café', 'Pão', 'Doces']; // viria do PDO
    $redis->setex('cache:categorias', 300, json_encode($dados));
    return $dados;
}

print_r(pegarCategorias($redis));
print_r(pegarCategorias($redis));`,output:`TTL home:   60 seg
TTL rodapé: 30 seg
TTL nome:   -1 seg (-1 = sem TTL)
TTL fake:   -2 seg (-2 = não existe)
(miss — buscando do banco)
Array ( [0] => Café [1] => Pão [2] => Doces )
(hit do cache)
Array ( [0] => Café [1] => Pão [2] => Doces )`}),e.jsx("h2",{children:"Contadores: INCR e DECR atômicos"}),e.jsxs("p",{children:["Contar visualizações de uma página, requests por usuário (rate limit), itens em estoque — tudo isso precisa de ",e.jsx("em",{children:"atomicidade"}),". Se duas requisições incrementarem ao mesmo tempo, você não pode perder uma. ",e.jsx("code",{children:"INCR"})," resolve isso: ele é atômico no servidor, sem race condition."]}),e.jsx(s,{filename:"bin/contadores.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Predis\\Client;

$redis = new Client();
$redis->del('views:home', 'estoque:produto:7', 'rate:user:42');

echo $redis->incr('views:home') . PHP_EOL; // 1
echo $redis->incr('views:home') . PHP_EOL; // 2
echo $redis->incrby('views:home', 10) . PHP_EOL; // 12

// Estoque: decremento atômico — não pode vender produto inexistente
$redis->set('estoque:produto:7', 3);
echo "Estoque inicial: " . $redis->get('estoque:produto:7') . PHP_EOL;

for ($i = 0; $i < 5; $i++) {
    $sobra = $redis->decr('estoque:produto:7');
    if ($sobra < 0) {
        $redis->incr('estoque:produto:7'); // devolve
        echo "Tentativa {$i}: sem estoque" . PHP_EOL;
        continue;
    }
    echo "Tentativa {$i}: vendido (resta {$sobra})" . PHP_EOL;
}

// Rate limit simples: 5 reqs por minuto por usuário
function permitido(Client $r, string $userId, int $max = 5): bool
{
    $chave = "rate:user:{$userId}";
    $count = $r->incr($chave);
    if ($count === 1) {
        $r->expire($chave, 60); // primeira request inicia a janela
    }
    return $count <= $max;
}

for ($i = 1; $i <= 7; $i++) {
    echo "Req {$i}: " . (permitido($redis, '42') ? 'OK' : 'BLOQUEADO') . PHP_EOL;
}`,output:`1
2
12
Estoque inicial: 3
Tentativa 0: vendido (resta 2)
Tentativa 1: vendido (resta 1)
Tentativa 2: vendido (resta 0)
Tentativa 3: sem estoque
Tentativa 4: sem estoque
Req 1: OK
Req 2: OK
Req 3: OK
Req 4: OK
Req 5: OK
Req 6: BLOQUEADO
Req 7: BLOQUEADO`}),e.jsx("h2",{children:"Listas: filas e pilhas com LPUSH / RPOP"}),e.jsxs("p",{children:["Listas Redis são ",e.jsx("em",{children:"linked lists"})," bidirecionais. ",e.jsx("code",{children:"LPUSH"})," empurra na esquerda,",e.jsx("code",{children:"RPOP"})," tira da direita — a combinação clássica forma uma ",e.jsx("strong",{children:"fila FIFO"})," ","para jobs em background, sem precisar de RabbitMQ."]}),e.jsx(s,{filename:"bin/fila-produtor.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Predis\\Client;

$redis = new Client();

$jobs = [
    ['tipo' => 'email', 'para' => 'ada@example.com'],
    ['tipo' => 'email', 'para' => 'linus@example.com'],
    ['tipo' => 'pdf',   'pedido' => 1023],
];

foreach ($jobs as $job) {
    $redis->lpush('fila:jobs', json_encode($job));
    echo "enfileirado: " . json_encode($job) . PHP_EOL;
}

echo "Tamanho da fila: " . $redis->llen('fila:jobs') . PHP_EOL;`,output:`enfileirado: {"tipo":"email","para":"ada@example.com"}
enfileirado: {"tipo":"email","para":"linus@example.com"}
enfileirado: {"tipo":"pdf","pedido":1023}
Tamanho da fila: 3`}),e.jsx(s,{filename:"bin/fila-worker.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Predis\\Client;

$redis = new Client();

echo "Worker iniciado. Aguardando jobs..." . PHP_EOL;

while (true) {
    // brpop: bloqueia até chegar item (ou timeout em segundos).
    $item = $redis->brpop(['fila:jobs'], 5);

    if ($item === null) {
        echo "(timeout, sem jobs)" . PHP_EOL;
        continue;
    }

    [$nomeFila, $payload] = $item;
    $job = json_decode($payload, true);
    echo "processando [{$job['tipo']}]: {$payload}" . PHP_EOL;

    // ... processar de verdade ...
    usleep(200_000);
}`,output:`Worker iniciado. Aguardando jobs...
processando [email]: {"tipo":"email","para":"ada@example.com"}
processando [email]: {"tipo":"email","para":"linus@example.com"}
processando [pdf]: {"tipo":"pdf","pedido":1023}
(timeout, sem jobs)`}),e.jsxs(o,{type:"success",title:"Por que BRPOP e não RPOP em loop?",children:[e.jsx("code",{children:"BRPOP"})," ",e.jsx("em",{children:"bloqueia"})," a conexão até chegar um item — você não fica martelando o Redis com polling de 100ms. Para uma fila séria com retries e dead-letter, considere"," ",e.jsx("em",{children:"laravel/horizon"}),", ",e.jsx("em",{children:"symfony/messenger"})," ou Redis Streams (",e.jsx("code",{children:"XADD/XREADGROUP"}),")."]}),e.jsx("h2",{children:"Sets: pertence ou não pertence?"}),e.jsx(s,{filename:"bin/sets.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Predis\\Client;

$redis = new Client();
$redis->del('tags:post:1', 'tags:post:2');

$redis->sadd('tags:post:1', 'php', 'redis', 'cache');
$redis->sadd('tags:post:2', 'php', 'docker', 'devops');

echo "Tem 'php'?     " . ($redis->sismember('tags:post:1', 'php')   ? 'sim' : 'não') . PHP_EOL;
echo "Tem 'python'?  " . ($redis->sismember('tags:post:1', 'python')? 'sim' : 'não') . PHP_EOL;

print_r($redis->smembers('tags:post:1'));

// Operações de conjunto: tags em comum entre dois posts
print_r($redis->sinter('tags:post:1', 'tags:post:2'));

// União: todas as tags únicas dos dois posts
print_r($redis->sunion('tags:post:1', 'tags:post:2'));`,output:`Tem 'php'?     sim
Tem 'python'?  não
Array ( [0] => php [1] => redis [2] => cache )
Array ( [0] => php )
Array ( [0] => php [1] => redis [2] => cache [3] => docker [4] => devops )`}),e.jsx("h2",{children:"Hashes: objetos por chave"}),e.jsxs("p",{children:["Quando você quer guardar um ",e.jsx("em",{children:"objeto inteiro"})," sob uma chave (perfil de usuário, item de carrinho), hashes são mais eficientes que serializar JSON: você lê e atualiza campos individuais sem desserializar tudo."]}),e.jsx(s,{filename:"bin/hashes.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Predis\\Client;

$redis = new Client();

$redis->hmset('user:42', [
    'nome'    => 'Ada Lovelace',
    'email'   => 'ada@example.com',
    'pontos'  => 0,
    'cidade'  => 'Londres',
]);

// Lê um campo só
echo "Nome: "  . $redis->hget('user:42', 'nome')  . PHP_EOL;

// Lê tudo
print_r($redis->hgetall('user:42'));

// Incremento atômico em um campo numérico
$redis->hincrby('user:42', 'pontos', 50);
$redis->hincrby('user:42', 'pontos', 25);

echo "Pontos depois de +50 +25: " . $redis->hget('user:42', 'pontos') . PHP_EOL;

// Removendo um campo específico
$redis->hdel('user:42', 'cidade');
echo "Existe cidade ainda? " . ($redis->hexists('user:42', 'cidade') ? 'sim' : 'não') . PHP_EOL;`,output:`Nome: Ada Lovelace
Array
(
    [nome] => Ada Lovelace
    [email] => ada@example.com
    [pontos] => 0
    [cidade] => Londres
)
Pontos depois de +50 +25: 75
Existe cidade ainda? não`}),e.jsx("h2",{children:"Pub/Sub: mensagens em tempo real"}),e.jsxs("p",{children:["Outro processo precisa saber quando um pedido é criado, sem você consultar o banco em loop? Pub/sub do Redis. Um lado ",e.jsx("code",{children:"PUBLISH"})," em um canal; outro lado ",e.jsx("code",{children:"SUBSCRIBE"})," ","e recebe."]}),e.jsx(s,{filename:"bin/publisher.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Predis\\Client;

$redis = new Client();

$evento = json_encode([
    'tipo'      => 'pedido.criado',
    'pedido_id' => 1023,
    'total'     => 89.90,
]);

$ouvintes = $redis->publish('pedidos', $evento);
echo "Publicado para {$ouvintes} ouvintes." . PHP_EOL;`,output:"Publicado para 2 ouvintes."}),e.jsx(s,{filename:"bin/subscriber.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Predis\\Client;

$redis = new Client();

$pubsub = $redis->pubSubLoop();
$pubsub->subscribe('pedidos');

echo "Inscrito em 'pedidos'. Aguardando..." . PHP_EOL;

foreach ($pubsub as $msg) {
    if ($msg->kind !== 'message') {
        continue;
    }
    echo "[{$msg->channel}] {$msg->payload}" . PHP_EOL;
}`,output:`Inscrito em 'pedidos'. Aguardando...
[pedidos] {"tipo":"pedido.criado","pedido_id":1023,"total":89.9}`}),e.jsxs(o,{type:"warning",title:"Pub/sub não persiste",children:["Quem não estava inscrito quando a mensagem foi publicada ",e.jsx("strong",{children:"perde a mensagem"}),". Para garantir entrega + replay + grupos de consumidores, use ",e.jsx("strong",{children:"Redis Streams"})," ","(",e.jsx("code",{children:"XADD"})," / ",e.jsx("code",{children:"XREADGROUP"}),") — desenhado exatamente para esse caso."]}),e.jsx("h2",{children:"Subindo um Redis local rápido"}),e.jsx(r,{title:"docker-compose.yml",language:"yaml",code:`services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes

volumes:
  redis-data:`}),e.jsx(i,{user:"dev",host:"php",cwd:"~/projetos/api",command:"docker compose up -d redis && docker compose exec redis redis-cli ping",output:`[+] Running 2/2
 ✔ Network api_default  Created
 ✔ Container api-redis-1  Started
PONG`}),e.jsxs("p",{children:["Você já cobre 90% do que se faz com Redis em produção. No próximo capítulo a gente compara com a alternativa mais antiga e enxuta: ",e.jsx("strong",{children:"Memcached"}),"."]})]})}export{p as default};
