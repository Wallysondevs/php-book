import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Redis() {
  return (
    <PageContainer
      title="Redis (Predis)"
      subtitle="Estruturas de dados em memória, sub-milissegundo de latência: cache, contadores, filas, sets e pub/sub. Tudo via Predis, o cliente Redis em PHP puro mais usado."
      difficulty="intermediario"
      timeToRead="13 min"
      category="Cache & Filas"
    >
      <AlertBox type="info" title="Pré-requisitos">
          <p>Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP.</p>
        </AlertBox>
        <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"Redis"}</strong> {' — '} {"key-value in-memory — cache, fila, pub/sub."}
          </li>
        <li>
            <strong>{"ext-redis vs predis"}</strong> {' — '} {"extensão C (rápida) vs cliente puro PHP."}
          </li>
        <li>
            <strong>{"TTL"}</strong> {' — '} {"EXPIRE/PEXPIRE define vida em s/ms."}
          </li>
        <li>
            <strong>{"Estruturas"}</strong> {' — '} {"string, hash, list, set, sorted set, stream."}
          </li>
        <li>
            <strong>{"Persistência"}</strong> {' — '} {"RDB snapshot + AOF append-only log."}
          </li>
        </ul>
          <h2>O problema: o banco está suando para responder coisas óbvias</h2>
      <p>
        Sua API recebe 5.000 req/min para buscar a lista de categorias. As categorias mudam uma vez por
        dia. Mesmo assim, todo request faz <code>SELECT * FROM categorias</code> — e o banco vira
        gargalo. <strong>Redis</strong> resolve isso: você guarda a resposta em memória RAM por 1
        minuto e o banco descansa. Mas Redis é muito mais que cache — é um servidor de
        <em>estruturas de dados</em>: strings, listas, sets, hashes, ordered sets, streams, pub/sub.
      </p>

      <h2>Instalação: Predis (cliente em PHP puro)</h2>
      <p>
        Você tem duas opções: a <strong>extensão phpredis</strong> (compilada em C, mais rápida, exige
        <code>pecl install</code>) ou o <strong>Predis</strong> (biblioteca Composer, em PHP puro, mesma
        API, zero dependência de extensão). Para começar e para a maioria dos casos, Predis é o
        caminho mais simples:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/api"
        command="composer require predis/predis"
        output={`Using version ^2.3 for predis/predis
./composer.json has been updated
Running composer update predis/predis
Lock file operations: 1 install, 0 updates, 0 removals
  - Locking predis/predis (v2.3.0)
Writing lock file
Installing dependencies from lock file (including require-dev)
Package operations: 1 install, 0 updates, 0 removals
  - Installing predis/predis (v2.3.0)
Generating optimized autoload files`}
      />

      <h2>Conectando e o trio sagrado: SET / GET / DEL</h2>
      <PhpBlock
        filename="bin/cache.php"
        code={`<?php
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

echo "Após del, existe email? " . ($redis->exists('user:42:email') ? 'sim' : 'não') . PHP_EOL;`}
        output={`Loja do Café
Existe user:42:nome? sim
Após del, existe email? não`}
      />

      <AlertBox type="info" title="Convenção de nomes de chave">
        Use <code>:</code> como separador hierárquico: <code>user:42:perfil</code>, <code>cache:produtos:lista</code>,{" "}
        <code>session:{`{token}`}</code>. É só convenção, mas todo mundo usa — e ferramentas como
        RedisInsight agrupam visualmente por isso.
      </AlertBox>

      <h2>TTL: quando a chave expira sozinha</h2>
      <p>
        O grande superpoder de Redis para cache é <strong>expiração automática</strong>. Você define um
        TTL (time-to-live) em segundos e a chave some. Tem duas formas:
      </p>

      <PhpBlock
        filename="bin/ttl.php"
        code={`<?php
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
print_r(pegarCategorias($redis));`}
        output={`TTL home:   60 seg
TTL rodapé: 30 seg
TTL nome:   -1 seg (-1 = sem TTL)
TTL fake:   -2 seg (-2 = não existe)
(miss — buscando do banco)
Array ( [0] => Café [1] => Pão [2] => Doces )
(hit do cache)
Array ( [0] => Café [1] => Pão [2] => Doces )`}
      />

      <h2>Contadores: INCR e DECR atômicos</h2>
      <p>
        Contar visualizações de uma página, requests por usuário (rate limit), itens em estoque — tudo
        isso precisa de <em>atomicidade</em>. Se duas requisições incrementarem ao mesmo tempo, você não
        pode perder uma. <code>INCR</code> resolve isso: ele é atômico no servidor, sem race condition.
      </p>

      <PhpBlock
        filename="bin/contadores.php"
        code={`<?php
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
}`}
        output={`1
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
Req 7: BLOQUEADO`}
      />

      <h2>Listas: filas e pilhas com LPUSH / RPOP</h2>
      <p>
        Listas Redis são <em>linked lists</em> bidirecionais. <code>LPUSH</code> empurra na esquerda,
        <code>RPOP</code> tira da direita — a combinação clássica forma uma <strong>fila FIFO</strong>{" "}
        para jobs em background, sem precisar de RabbitMQ.
      </p>

      <PhpBlock
        filename="bin/fila-produtor.php"
        code={`<?php
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

echo "Tamanho da fila: " . $redis->llen('fila:jobs') . PHP_EOL;`}
        output={`enfileirado: {"tipo":"email","para":"ada@example.com"}
enfileirado: {"tipo":"email","para":"linus@example.com"}
enfileirado: {"tipo":"pdf","pedido":1023}
Tamanho da fila: 3`}
      />

      <PhpBlock
        filename="bin/fila-worker.php"
        code={`<?php
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
}`}
        output={`Worker iniciado. Aguardando jobs...
processando [email]: {"tipo":"email","para":"ada@example.com"}
processando [email]: {"tipo":"email","para":"linus@example.com"}
processando [pdf]: {"tipo":"pdf","pedido":1023}
(timeout, sem jobs)`}
      />

      <AlertBox type="success" title="Por que BRPOP e não RPOP em loop?">
        <code>BRPOP</code> <em>bloqueia</em> a conexão até chegar um item — você não fica martelando o
        Redis com polling de 100ms. Para uma fila séria com retries e dead-letter, considere{" "}
        <em>laravel/horizon</em>, <em>symfony/messenger</em> ou Redis Streams (<code>XADD/XREADGROUP</code>).
      </AlertBox>

      <h2>Sets: pertence ou não pertence?</h2>
      <PhpBlock
        filename="bin/sets.php"
        code={`<?php
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
print_r($redis->sunion('tags:post:1', 'tags:post:2'));`}
        output={`Tem 'php'?     sim
Tem 'python'?  não
Array ( [0] => php [1] => redis [2] => cache )
Array ( [0] => php )
Array ( [0] => php [1] => redis [2] => cache [3] => docker [4] => devops )`}
      />

      <h2>Hashes: objetos por chave</h2>
      <p>
        Quando você quer guardar um <em>objeto inteiro</em> sob uma chave (perfil de usuário, item de
        carrinho), hashes são mais eficientes que serializar JSON: você lê e atualiza campos
        individuais sem desserializar tudo.
      </p>

      <PhpBlock
        filename="bin/hashes.php"
        code={`<?php
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
echo "Existe cidade ainda? " . ($redis->hexists('user:42', 'cidade') ? 'sim' : 'não') . PHP_EOL;`}
        output={`Nome: Ada Lovelace
Array
(
    [nome] => Ada Lovelace
    [email] => ada@example.com
    [pontos] => 0
    [cidade] => Londres
)
Pontos depois de +50 +25: 75
Existe cidade ainda? não`}
      />

      <h2>Pub/Sub: mensagens em tempo real</h2>
      <p>
        Outro processo precisa saber quando um pedido é criado, sem você consultar o banco em loop?
        Pub/sub do Redis. Um lado <code>PUBLISH</code> em um canal; outro lado <code>SUBSCRIBE</code>{" "}
        e recebe.
      </p>

      <PhpBlock
        filename="bin/publisher.php"
        code={`<?php
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
echo "Publicado para {$ouvintes} ouvintes." . PHP_EOL;`}
        output={`Publicado para 2 ouvintes.`}
      />

      <PhpBlock
        filename="bin/subscriber.php"
        code={`<?php
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
}`}
        output={`Inscrito em 'pedidos'. Aguardando...
[pedidos] {"tipo":"pedido.criado","pedido_id":1023,"total":89.9}`}
      />

      <AlertBox type="warning" title="Pub/sub não persiste">
        Quem não estava inscrito quando a mensagem foi publicada <strong>perde a mensagem</strong>. Para
        garantir entrega + replay + grupos de consumidores, use <strong>Redis Streams</strong>{" "}
        (<code>XADD</code> / <code>XREADGROUP</code>) — desenhado exatamente para esse caso.
      </AlertBox>

      <h2>Subindo um Redis local rápido</h2>
      <CodeBlock
        title="docker-compose.yml"
        language="yaml"
        code={`services:
  redis:
    image: redis:7-alpine
    ports:
      - "6379:6379"
    volumes:
      - redis-data:/data
    command: redis-server --appendonly yes

volumes:
  redis-data:`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/api"
        command="docker compose up -d redis && docker compose exec redis redis-cli ping"
        output={`[+] Running 2/2
 ✔ Network api_default  Created
 ✔ Container api-redis-1  Started
PONG`}
      />

      <p>
        Você já cobre 90% do que se faz com Redis em produção. No próximo capítulo a gente compara com
        a alternativa mais antiga e enxuta: <strong>Memcached</strong>.
      </p>
    </PageContainer>
  );
}
