import{j as e}from"./index-Bb4MiiJL.js";import{P as r,a as o,A as a}from"./AlertBox-BpD-xIsb.js";import{T as s}from"./TerminalBlock-DGurMC1r.js";import{C as t}from"./CodeBlock-C3V-qEkN.js";function c(){return e.jsxs(r,{title:"Webhooks (recebendo)",subtitle:"Receber webhooks parece simples — é um POST. Mas validar HMAC com timing-safe compare, garantir idempotência, processar de forma assíncrona e tratar retries é o que separa um endpoint amador de um endpoint que aguenta produção.",difficulty:"avancado",timeToRead:"13 min",category:"HTTP Cliente",children:[e.jsx("h2",{children:"O problema: você é o servidor agora"}),e.jsxs("p",{children:["Stripe acabou de cobrar um cartão. GitHub acabou de receber um push. Mailgun não conseguiu entregar um email. Todos esses sistemas precisam ",e.jsx("strong",{children:"te avisar"})," ","— e fazem isso com um ",e.jsx("code",{children:"POST"}),' no seu endpoint público. O webhook é o "callback HTTP" do mundo real. Os desafios não são receber o POST, mas:']}),e.jsxs("ul",{children:[e.jsx("li",{children:"Provar que veio mesmo de quem diz ter vindo (assinatura HMAC)."}),e.jsx("li",{children:"Não processar duas vezes quando o remetente reenvia (idempotência)."}),e.jsx("li",{children:"Responder rápido (< 1s) — o trabalho pesado vai para uma fila."}),e.jsx("li",{children:"Retornar status correto para que o remetente reenvie (ou não)."})]}),e.jsx("h2",{children:"Endpoint mínimo: lendo o body cru"}),e.jsx(o,{filename:"public/webhook.php",code:`<?php
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
echo json_encode(['received' => true]);`}),e.jsxs(a,{type:"warning",title:"Por que php://input e não $_POST?",children:[e.jsx("code",{children:"$_POST"})," só é populado quando o ",e.jsx("code",{children:"Content-Type"})," é"," ",e.jsx("code",{children:"application/x-www-form-urlencoded"})," ou ",e.jsx("code",{children:"multipart/form-data"}),". Webhooks mandam ",e.jsx("code",{children:"application/json"}),' — para o PHP, isso é "corpo cru" e precisa ser lido via ',e.jsx("code",{children:"php://input"}),". Além disso, você precisa do payload intacto, byte-a-byte, para validar a assinatura HMAC."]}),e.jsx("h2",{children:"Validando assinatura HMAC SHA-256"}),e.jsx("p",{children:"O serviço gera uma assinatura do payload usando uma chave secreta compartilhada (HMAC-SHA256) e envia no header. Você recalcula com a mesma chave e compara. Se baterem, é autêntico. Se não, é fraude — descarte com 401."}),e.jsx(o,{filename:"public/webhook.php",code:`<?php
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

echo "assinatura OK\\n";`,output:"assinatura OK"}),e.jsxs(a,{type:"danger",title:"NUNCA use === para comparar assinaturas",children:["O operador ",e.jsx("code",{children:"==="})," faz short-circuit no primeiro byte diferente. Um atacante pode medir o tempo de resposta e reconstruir a assinatura byte a byte. Sempre use"," ",e.jsx("code",{children:"hash_equals()"}),", que tem tempo constante independente do conteúdo."]}),e.jsx("h2",{children:"Idempotência: o mesmo evento não pode rodar duas vezes"}),e.jsxs("p",{children:["Webhooks ",e.jsx("strong",{children:"vão"})," chegar duplicados. A maioria dos provedores faz retry automático em caso de timeout, falha de rede, ou status diferente de 2xx. Você precisa garantir que processar o mesmo ",e.jsx("code",{children:"event.id"})," duas vezes não cobre o cliente duas vezes."]}),e.jsx(o,{filename:"public/webhook.php",code:`<?php
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
echo json_encode(['status' => 'queued', 'id' => $eventId]);`,output:'{"status":"queued","id":"evt_3OqL2k4eZvKYlo2C1abc"}'}),e.jsx("h2",{children:"Enfileirando para processamento async"}),e.jsxs("p",{children:["O endpoint precisa responder em menos de 1s — ou o provedor vai estourar timeout e reenviar. Toda lógica de negócio (atualizar pedido, enviar email, recalcular saldo) vai para uma fila. Aqui usamos Redis com ",e.jsx("code",{children:"predis/predis"}),"."]}),e.jsx(s,{user:"dev",host:"php",cwd:"~/app",command:"composer require predis/predis",output:`Using version ^2.3 for predis/predis
./composer.json has been updated
Lock file operations: 1 install
  - Locking predis/predis (v2.3.0)`}),e.jsx(o,{filename:"public/webhook.php",code:`<?php
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
echo json_encode(['status' => 'queued']);`,output:'{"status":"queued"}'}),e.jsx("h2",{children:"O worker: consome a fila com retry e backoff"}),e.jsx(o,{filename:"bin/worker.php",code:`<?php
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
function estornarPedido(string $orderId): void  { /* ... */ }`,output:`worker iniciado, aguardando jobs...
OK evt_3OqL2k4eZvKYlo2C1abc (payment_intent.succeeded)
OK evt_3OqL2k4eZvKYlo2C1xyz (charge.refunded)
RETRY evt_3OqL2k4eZvKYlo2C1err (#1, +1s)
OK evt_3OqL2k4eZvKYlo2C1err (charge.refunded)`}),e.jsx("h2",{children:"Exemplo completo: validando webhook do Stripe"}),e.jsxs("p",{children:["O Stripe usa um esquema próprio de assinatura — o header ",e.jsx("code",{children:"Stripe-Signature"})," ","traz timestamp + HMAC. A SDK oficial faz isso por você, mas vamos fazer na unha para entender o que acontece."]}),e.jsx(o,{filename:"public/stripe-webhook.php",code:`<?php
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
http_response_code(200);`,output:"evento Stripe válido: payment_intent.succeeded (evt_3OqL2k4eZvKYlo2C1abc)"}),e.jsx("h2",{children:"Configurando o Nginx para o endpoint"}),e.jsx(t,{language:"nginx",title:"/etc/nginx/sites-available/app.conf",code:`server {
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
}`}),e.jsx(a,{type:"info",title:"Códigos de status que importam",children:e.jsxs("ul",{className:"list-disc ml-5 mt-1 space-y-1",children:[e.jsxs("li",{children:[e.jsx("code",{children:"200/202"}),": recebi e estou tratando — não reenvie."]}),e.jsxs("li",{children:[e.jsx("code",{children:"400"}),": payload inválido — não adianta reenviar igual."]}),e.jsxs("li",{children:[e.jsx("code",{children:"401"}),": assinatura inválida — provedor pode alertar."]}),e.jsxs("li",{children:[e.jsx("code",{children:"5xx"}),": minha culpa, ",e.jsx("strong",{children:"por favor reenvie"}),"."]})]})}),e.jsx("h2",{children:"Testando localmente com a CLI do Stripe"}),e.jsx(s,{user:"dev",host:"php",cwd:"~/app",command:"stripe listen --forward-to localhost:8000/stripe-webhook.php",output:`> Ready! You are using Stripe API Version [2024-11-20]. Your webhook signing secret is whsec_test_abc123...
2025-01-12 10:32:11 --> payment_intent.succeeded [evt_3OqL2k]
2025-01-12 10:32:11 <-- [200] POST http://localhost:8000/stripe-webhook.php`}),e.jsx(t,{language:"json",title:"composer.json",code:`{
  "require": {
    "php": "^8.4",
    "ext-pdo": "*",
    "ext-pdo_pgsql": "*",
    "predis/predis": "^2.3"
  }
}`}),e.jsx("p",{children:"Endpoint blindado: assinatura validada com timing-safe compare, idempotência por chave única no banco, ACK rápido com processamento async via fila Redis e retry com backoff exponencial. É essa a base de qualquer integração de webhook em produção."})]})}export{c as default};
