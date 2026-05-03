import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Webhooks() {
  return (
    <PageContainer
      title="Webhooks (recebendo)"
      subtitle="Receber webhooks parece simples — é um POST. Mas validar HMAC com timing-safe compare, garantir idempotência, processar de forma assíncrona e tratar retries é o que separa um endpoint amador de um endpoint que aguenta produção."
      difficulty="avancado"
      timeToRead="13 min"
      category="HTTP Cliente"
    >
      <AlertBox type="info" title="Pré-requisitos">
          <p>Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP.</p>
        </AlertBox>
        <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"Webhook"}</strong> {' — '} {"callback HTTP que provedor faz para sua URL ao acontecer evento."}
          </li>
        <li>
            <strong>{"Assinatura"}</strong> {' — '} {"HMAC no header — verifique para autenticidade."}
          </li>
        <li>
            <strong>{"Idempotência"}</strong> {' — '} {"mesmo evento pode chegar 2x — use id único."}
          </li>
        <li>
            <strong>{"Retry"}</strong> {' — '} {"provedor reenvia em caso de 5xx; responda 2xx rápido."}
          </li>
        <li>
            <strong>{"Replay"}</strong> {' — '} {"logs em fila evitam perder evento durante deploy."}
          </li>
        </ul>
          <h2>O problema: você é o servidor agora</h2>
      <p>
        Stripe acabou de cobrar um cartão. GitHub acabou de receber um push. Mailgun não
        conseguiu entregar um email. Todos esses sistemas precisam <strong>te avisar</strong>{" "}
        — e fazem isso com um <code>POST</code> no seu endpoint público. O webhook é o "callback
        HTTP" do mundo real. Os desafios não são receber o POST, mas:
      </p>
      <ul>
        <li>Provar que veio mesmo de quem diz ter vindo (assinatura HMAC).</li>
        <li>Não processar duas vezes quando o remetente reenvia (idempotência).</li>
        <li>Responder rápido (&lt; 1s) — o trabalho pesado vai para uma fila.</li>
        <li>Retornar status correto para que o remetente reenvie (ou não).</li>
      </ul>

      <h2>Endpoint mínimo: lendo o body cru</h2>
      <PhpBlock
        filename="public/webhook.php"
        code={`<?php
declare(strict_types=1);

// 1) Lê o body BRUTO. NUNCA use $_POST aqui — webhooks vêm como JSON, não form.
$payload = file_get_contents('php://input');
if ($payload === false || $payload === '') {
    http_response_code(400);
    echo json_encode(['error' => 'empty_body']);
    exit;
}

// 2) Decodifica
try {
    $event = json_decode($payload, true, 512, JSON_THROW_ON_ERROR);
} catch (\\JsonException $e) {
    http_response_code(400);
    echo json_encode(['error' => 'invalid_json']);
    exit;
}

error_log('webhook recebido: ' . ($event['type'] ?? 'sem-tipo'));

// 3) ACK rápido — o trabalho real vai para a fila depois
http_response_code(200);
echo json_encode(['received' => true]);`}
      />

      <AlertBox type="warning" title="Por que php://input e não $_POST?">
        <code>$_POST</code> só é populado quando o <code>Content-Type</code> é{" "}
        <code>application/x-www-form-urlencoded</code> ou <code>multipart/form-data</code>.
        Webhooks mandam <code>application/json</code> — para o PHP, isso é "corpo cru" e
        precisa ser lido via <code>php://input</code>. Além disso, você precisa do payload
        intacto, byte-a-byte, para validar a assinatura HMAC.
      </AlertBox>

      <h2>Validando assinatura HMAC SHA-256</h2>
      <p>
        O serviço gera uma assinatura do payload usando uma chave secreta compartilhada
        (HMAC-SHA256) e envia no header. Você recalcula com a mesma chave e compara. Se baterem,
        é autêntico. Se não, é fraude — descarte com 401.
      </p>

      <PhpBlock
        filename="public/webhook.php"
        code={`<?php
declare(strict_types=1);

$secret = getenv('WEBHOOK_SECRET') ?: throw new RuntimeException('WEBHOOK_SECRET ausente');

$payload  = file_get_contents('php://input');
$received = $_SERVER['HTTP_X_SIGNATURE'] ?? '';     // ex.: "sha256=abc123..."

if (!str_starts_with($received, 'sha256=')) {
    http_response_code(401);
    exit('missing or malformed signature');
}

$receivedHash = substr($received, 7);
$expectedHash = hash_hmac('sha256', $payload, $secret);

// hash_equals = comparação em tempo constante (resistente a timing attacks)
if (!hash_equals($expectedHash, $receivedHash)) {
    http_response_code(401);
    exit('invalid signature');
}

echo "assinatura OK\\n";`}
        output={`assinatura OK`}
      />

      <AlertBox type="danger" title="NUNCA use === para comparar assinaturas">
        O operador <code>===</code> faz short-circuit no primeiro byte diferente. Um atacante
        pode medir o tempo de resposta e reconstruir a assinatura byte a byte. Sempre use{" "}
        <code>hash_equals()</code>, que tem tempo constante independente do conteúdo.
      </AlertBox>

      <h2>Idempotência: o mesmo evento não pode rodar duas vezes</h2>
      <p>
        Webhooks <strong>vão</strong> chegar duplicados. A maioria dos provedores faz retry
        automático em caso de timeout, falha de rede, ou status diferente de 2xx. Você precisa
        garantir que processar o mesmo <code>event.id</code> duas vezes não cobre o cliente
        duas vezes.
      </p>

      <PhpBlock
        filename="public/webhook.php"
        code={`<?php
declare(strict_types=1);
require __DIR__ . '/../vendor/autoload.php';

$pdo = new PDO('pgsql:host=db;dbname=app', 'app', 'secret', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
]);

$payload = file_get_contents('php://input');
$event   = json_decode($payload, true, 512, JSON_THROW_ON_ERROR);
$eventId = $event['id'] ?? null;

if (!is_string($eventId)) {
    http_response_code(400);
    exit(json_encode(['error' => 'missing_event_id']));
}

// Tabela: webhook_events(id PRIMARY KEY, type TEXT, payload JSONB, received_at TIMESTAMPTZ DEFAULT now())
try {
    $st = $pdo->prepare(
        'INSERT INTO webhook_events (id, type, payload) VALUES (:id, :type, :payload::jsonb)'
    );
    $st->execute([
        'id'      => $eventId,
        'type'    => $event['type'] ?? 'unknown',
        'payload' => $payload,
    ]);
} catch (\\PDOException $e) {
    // 23505 = unique violation no Postgres -> já processei esse evento
    if ($e->getCode() === '23505') {
        http_response_code(200);                  // 200 mesmo: não queremos retry
        exit(json_encode(['status' => 'duplicate', 'id' => $eventId]));
    }
    throw $e;
}

http_response_code(202);                          // Accepted: vou processar async
echo json_encode(['status' => 'queued', 'id' => $eventId]);`}
        output={`{"status":"queued","id":"evt_3OqL2k4eZvKYlo2C1abc"}`}
      />

      <h2>Enfileirando para processamento async</h2>
      <p>
        O endpoint precisa responder em menos de 1s — ou o provedor vai estourar timeout e
        reenviar. Toda lógica de negócio (atualizar pedido, enviar email, recalcular saldo)
        vai para uma fila. Aqui usamos Redis com <code>predis/predis</code>.
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/app"
        command="composer require predis/predis"
        output={`Using version ^2.3 for predis/predis
./composer.json has been updated
Lock file operations: 1 install
  - Locking predis/predis (v2.3.0)`}
      />

      <PhpBlock
        filename="public/webhook.php"
        code={`<?php
declare(strict_types=1);
require __DIR__ . '/../vendor/autoload.php';

use Predis\\Client as Redis;

$redis = new Redis(['scheme' => 'tcp', 'host' => 'redis', 'port' => 6379]);

// (assinatura + idempotência já validados aqui em cima)
$payload = file_get_contents('php://input');
$event   = json_decode($payload, true, 512, JSON_THROW_ON_ERROR);

$job = json_encode([
    'event_id'  => $event['id'],
    'type'      => $event['type'],
    'payload'   => $event,
    'attempts'  => 0,
    'enqueued_at' => time(),
], JSON_THROW_ON_ERROR);

$redis->rpush('queue:webhooks', $job);

http_response_code(202);
echo json_encode(['status' => 'queued']);`}
        output={`{"status":"queued"}`}
      />

      <h2>O worker: consome a fila com retry e backoff</h2>
      <PhpBlock
        filename="bin/worker.php"
        code={`<?php
declare(strict_types=1);
require __DIR__ . '/../vendor/autoload.php';

use Predis\\Client as Redis;

$redis = new Redis(['host' => 'redis', 'port' => 6379]);

echo "worker iniciado, aguardando jobs...\\n";

while (true) {
    // BLPOP bloqueia até ter algo (5s timeout)
    $popped = $redis->blpop(['queue:webhooks'], 5);
    if ($popped === null) continue;

    [, $raw] = $popped;
    $job = json_decode($raw, true);

    try {
        processarEvento($job['type'], $job['payload']);
        echo "OK {$job['event_id']} ({$job['type']})\\n";
    } catch (\\Throwable $e) {
        $job['attempts']++;
        if ($job['attempts'] >= 5) {
            $redis->rpush('queue:webhooks:dead', json_encode($job));
            echo "DEAD {$job['event_id']}: {$e->getMessage()}\\n";
            continue;
        }
        // backoff exponencial: 1s, 2s, 4s, 8s, 16s
        $delay = 2 ** ($job['attempts'] - 1);
        sleep($delay);
        $redis->rpush('queue:webhooks', json_encode($job));
        echo "RETRY {$job['event_id']} (#{$job['attempts']}, +{$delay}s)\\n";
    }
}

function processarEvento(string $type, array $payload): void {
    match ($type) {
        'payment_intent.succeeded' => marcarPedidoPago($payload['data']['object']['metadata']['order_id']),
        'charge.refunded'          => estornarPedido($payload['data']['object']['metadata']['order_id']),
        default                    => error_log("evento ignorado: {$type}"),
    };
}

function marcarPedidoPago(string $orderId): void { /* ... */ }
function estornarPedido(string $orderId): void  { /* ... */ }`}
        output={`worker iniciado, aguardando jobs...
OK evt_3OqL2k4eZvKYlo2C1abc (payment_intent.succeeded)
OK evt_3OqL2k4eZvKYlo2C1xyz (charge.refunded)
RETRY evt_3OqL2k4eZvKYlo2C1err (#1, +1s)
OK evt_3OqL2k4eZvKYlo2C1err (charge.refunded)`}
      />

      <h2>Exemplo completo: validando webhook do Stripe</h2>
      <p>
        O Stripe usa um esquema próprio de assinatura — o header <code>Stripe-Signature</code>{" "}
        traz timestamp + HMAC. A SDK oficial faz isso por você, mas vamos fazer na unha para
        entender o que acontece.
      </p>

      <PhpBlock
        filename="public/stripe-webhook.php"
        code={`<?php
declare(strict_types=1);

$secret  = getenv('STRIPE_WEBHOOK_SECRET');         // whsec_...
$payload = file_get_contents('php://input');
$header  = $_SERVER['HTTP_STRIPE_SIGNATURE'] ?? '';

// Header: "t=1700000000,v1=abc123...,v0=..."
$parts = [];
foreach (explode(',', $header) as $kv) {
    [$k, $v] = explode('=', $kv, 2) + [null, null];
    $parts[$k][] = $v;
}

$timestamp = (int) ($parts['t'][0] ?? 0);
$signatures = $parts['v1'] ?? [];

// Anti-replay: rejeita se for muito antigo (5 min)
if (abs(time() - $timestamp) > 300) {
    http_response_code(401);
    exit('timestamp out of tolerance');
}

$signedPayload = $timestamp . '.' . $payload;
$expected = hash_hmac('sha256', $signedPayload, $secret);

$valid = false;
foreach ($signatures as $sig) {
    if (hash_equals($expected, $sig)) {
        $valid = true;
        break;
    }
}

if (!$valid) {
    http_response_code(401);
    exit('invalid signature');
}

$event = json_decode($payload, true, 512, JSON_THROW_ON_ERROR);
echo "evento Stripe válido: {$event['type']} ({$event['id']})\\n";
http_response_code(200);`}
        output={`evento Stripe válido: payment_intent.succeeded (evt_3OqL2k4eZvKYlo2C1abc)`}
      />

      <h2>Configurando o Nginx para o endpoint</h2>
      <CodeBlock
        language="nginx"
        title="/etc/nginx/sites-available/app.conf"
        code={`server {
    listen 443 ssl http2;
    server_name webhook.exemplo.com;

    ssl_certificate     /etc/letsencrypt/live/webhook.exemplo.com/fullchain.pem;
    ssl_certificate_key /etc/letsencrypt/live/webhook.exemplo.com/privkey.pem;

    # Webhooks normalmente cabem em alguns KB; limite generoso mas não infinito
    client_max_body_size 1m;

    location = /webhook {
        try_files $uri /webhook.php;
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root/webhook.php;
    }
}`}
      />

      <AlertBox type="info" title="Códigos de status que importam">
        <ul className="list-disc ml-5 mt-1 space-y-1">
          <li><code>200/202</code>: recebi e estou tratando — não reenvie.</li>
          <li><code>400</code>: payload inválido — não adianta reenviar igual.</li>
          <li><code>401</code>: assinatura inválida — provedor pode alertar.</li>
          <li><code>5xx</code>: minha culpa, <strong>por favor reenvie</strong>.</li>
        </ul>
      </AlertBox>

      <h2>Testando localmente com a CLI do Stripe</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/app"
        command="stripe listen --forward-to localhost:8000/stripe-webhook.php"
        output={`> Ready! You are using Stripe API Version [2024-11-20]. Your webhook signing secret is whsec_test_abc123...
2025-01-12 10:32:11 --> payment_intent.succeeded [evt_3OqL2k]
2025-01-12 10:32:11 <-- [200] POST http://localhost:8000/stripe-webhook.php`}
      />

      <CodeBlock
        language="json"
        title="composer.json"
        code={`{
  "require": {
    "php": "^8.4",
    "ext-pdo": "*",
    "ext-pdo_pgsql": "*",
    "predis/predis": "^2.3"
  }
}`}
      />

      <p>
        Endpoint blindado: assinatura validada com timing-safe compare, idempotência por chave
        única no banco, ACK rápido com processamento async via fila Redis e retry com backoff
        exponencial. É essa a base de qualquer integração de webhook em produção.
      </p>
    </PageContainer>
  );
}
