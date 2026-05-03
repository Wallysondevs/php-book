import{j as e}from"./index-B5-q-eol.js";import{P as r,A as o,a as s}from"./AlertBox-CVbFLZEd.js";import{T as a}from"./TerminalBlock-6fqVIX2R.js";import{C as n}from"./CodeBlock-B36pQ_ak.js";function c(){return e.jsxs(r,{title:"Filas de processamento",subtitle:"Como tirar tarefas lentas (e-mail, PDF, webhook) do request HTTP e devolvê-las a um worker em background — Redis, Beanstalkd, RabbitMQ e Symfony Messenger.",difficulty:"avancado",timeToRead:"13 min",category:"Cache & Filas",children:[e.jsx(o,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Queue"})," "," — "," ","mensagens persistidas para processamento assíncrono."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Producer/Consumer"})," "," — "," ","um lado publica, outro lê e processa."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Backends"})," "," — "," ","Redis, RabbitMQ, SQS, Beanstalkd, banco."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Retry/DLQ"})," "," — "," ","tentativas + Dead Letter Queue para mensagens insanáveis."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Workers"})," "," — "," ","processos PHP rodando em loop; supervisor para reiniciar."]})]}),e.jsx("h2",{children:"O problema: o usuário está esperando"}),e.jsxs("p",{children:["Imagine que o cadastro do seu site dispara um e-mail de boas-vindas via SMTP. Cada conexão SMTP demora 800ms a 2s. Multiplique por mais um webhook, geração de PDF e upload para o S3 — e o seu ",e.jsx("code",{children:"POST /signup"})," passou de 200ms para 4 segundos. O navegador fica girando, o usuário desiste, e o seu PHP-FPM segura o worker ocupado."]}),e.jsxs("p",{children:["A solução não é otimizar o SMTP — é ",e.jsx("strong",{children:"não esperar por ele"}),". Você empurra a tarefa para uma ",e.jsx("em",{children:"fila"})," e responde HTTP 200 imediatamente. Um processo separado (o ",e.jsx("em",{children:"worker"}),") consome a fila no seu próprio ritmo."]}),e.jsx(s,{filename:"signup-sincrono.php",code:`<?php
declare(strict_types=1);

// ❌ Tudo dentro do request HTTP — usuário espera 4s
function signup(string $email, string $senha): void {
    $userId = criarUsuario($email, $senha);          // 50ms
    enviarEmailBoasVindas($email);                    // 1800ms (SMTP)
    gerarPdfContrato($userId);                        // 1200ms
    notificarWebhookCRM($userId);                     // 900ms
    enviarSlackParaTime("Novo signup: $email");       // 400ms
    // total: ~4350ms até responder HTTP 200
}`}),e.jsxs("p",{children:["Reescrevendo com fila: o controller só publica ",e.jsx("em",{children:"jobs"})," e responde. O worker que roda em segundo plano executa cada job quando puder."]}),e.jsx(s,{filename:"signup-async.php",code:`<?php
declare(strict_types=1);

function signup(string $email, string $senha, Fila $fila): void {
    $userId = criarUsuario($email, $senha);           // 50ms
    $fila->publicar('emails', ['tipo' => 'boas-vindas', 'user_id' => $userId]);
    $fila->publicar('pdf',    ['user_id' => $userId]);
    $fila->publicar('crm',    ['user_id' => $userId]);
    $fila->publicar('slack',  ['user_id' => $userId]);
    // total: ~80ms — responde imediato
}`}),e.jsxs(o,{type:"info",title:"Quando vale a pena",children:["Sempre que a tarefa é ",e.jsx("strong",{children:"lenta"}),", ",e.jsx("strong",{children:"pode falhar e ser retentada"})," ","ou ",e.jsx("strong",{children:"não precisa do resultado imediato"}),": e-mails, push notifications, thumbnails, ETL, webhooks de saída, importação de planilhas. Se for crítico para a resposta (cobrança no checkout, validação de cupom), ",e.jsx("strong",{children:"não use fila"}),"."]}),e.jsx("h2",{children:"Opção 1: Redis lists — simples e rápido"}),e.jsxs("p",{children:["Redis tem uma estrutura nativa de fila: a ",e.jsx("em",{children:"list"}),". Você usa ",e.jsx("code",{children:"RPUSH"})," para empurrar e ",e.jsx("code",{children:"BLPOP"})," (bloqueante) para consumir. Com a extensão ",e.jsx("code",{children:"predis/predis"})," ","você fica em PHP puro, sem extensão nativa."]}),e.jsx(a,{user:"dev",host:"php",cwd:"~/projetos/app",command:"composer require predis/predis",output:`Using version ^2.2 for predis/predis
./composer.json has been updated
Running composer update predis/predis
Lock file operations: 1 install, 0 updates, 0 removals
  - Locking predis/predis (v2.2.2)
Writing lock file
Installing dependencies from lock file (including require-dev)
Package operations: 1 install, 0 updates, 0 removals
  - Installing predis/predis (v2.2.2): Extracting archive`}),e.jsx(s,{filename:"producer.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use Predis\\Client;

$redis = new Client(['host' => '127.0.0.1', 'port' => 6379]);

$job = json_encode([
    'tipo'    => 'boas-vindas',
    'user_id' => 42,
    'email'   => 'ada@example.com',
    'tentado' => 0,
], JSON_THROW_ON_ERROR);

$tamanho = $redis->rpush('fila:emails', [$job]);

echo "Job enfileirado. Tamanho atual da fila: $tamanho" . PHP_EOL;`,output:"Job enfileirado. Tamanho atual da fila: 1"}),e.jsx(s,{filename:"worker.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use Predis\\Client;

$redis = new Client(['host' => '127.0.0.1', 'port' => 6379]);

echo "[worker] aguardando jobs em fila:emails..." . PHP_EOL;

while (true) {
    // BLPOP bloqueia até 30s esperando algo entrar na lista
    $resultado = $redis->blpop(['fila:emails'], 30);
    if ($resultado === null) {
        continue; // timeout, volta a esperar
    }

    [$_, $payload] = $resultado;
    $job = json_decode($payload, true, flags: JSON_THROW_ON_ERROR);

    try {
        echo "[worker] processando user_id={$job['user_id']}" . PHP_EOL;
        enviarEmail($job['email'], 'Bem-vindo(a)!');
        echo "[worker] ok" . PHP_EOL;
    } catch (\\Throwable $e) {
        // re-enfileira até 3 tentativas
        $job['tentado']++;
        if ($job['tentado'] < 3) {
            $redis->rpush('fila:emails', [json_encode($job)]);
        } else {
            $redis->rpush('fila:emails:dead', [json_encode($job)]);
        }
    }
}

function enviarEmail(string $para, string $assunto): void {
    // SMTP real aqui (Symfony Mailer, PHPMailer, etc.)
    usleep(500_000);
}`}),e.jsx(a,{user:"dev",host:"php",cwd:"~/projetos/app",command:"php worker.php",output:`[worker] aguardando jobs em fila:emails...
[worker] processando user_id=42
[worker] ok`}),e.jsxs(o,{type:"warning",title:"Cuidado com o BLPOP em loop infinito",children:["Workers PHP vazam memória com o tempo (objetos longos, conexões abertas). Sempre rode com um ",e.jsx("strong",{children:"supervisor"})," (systemd, supervisord) que reinicia o processo a cada N jobs ou X minutos. Veja o capítulo de produção."]}),e.jsx("h2",{children:"Opção 2: Beanstalkd — fila dedicada com prioridades"}),e.jsxs("p",{children:["Beanstalkd é um servidor de filas minimalista, pensado para isso e só isso. Tem prioridades, atraso (",e.jsx("em",{children:"delay"}),"), TTL e ",e.jsx("em",{children:"burying"})," de jobs com falha. Em PHP a biblioteca clássica é ",e.jsx("code",{children:"pda/pheanstalk"}),"."]}),e.jsx(a,{user:"dev",host:"php",cwd:"~/projetos/app",command:"composer require pda/pheanstalk",output:`Using version ^5.0 for pda/pheanstalk
./composer.json has been updated
Installing dependencies (including require-dev) from lock file
  - Installing pda/pheanstalk (v5.0.6): Extracting archive`}),e.jsx(s,{filename:"beanstalk-producer.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use Pheanstalk\\Pheanstalk;
use Pheanstalk\\Values\\Timeout;
use Pheanstalk\\Values\\TubeName;

$cliente = Pheanstalk::create('127.0.0.1');
$tube = new TubeName('emails');

$id = $cliente->useTube($tube)->put(
    data:     json_encode(['user_id' => 42, 'email' => 'ada@example.com']),
    priority: 1024,                  // menor = mais prioritário
    delay:    0,                     // segundos até ficar disponível
    timeToRelease: 120,              // se worker travar, libera após 2 min
);

echo "Job #{$id->getId()} publicado." . PHP_EOL;`,output:"Job #17 publicado."}),e.jsx(s,{filename:"beanstalk-worker.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use Pheanstalk\\Pheanstalk;
use Pheanstalk\\Values\\TubeName;

$cliente = Pheanstalk::create('127.0.0.1');
$cliente->watch(new TubeName('emails'));

while ($job = $cliente->reserve()) {
    $payload = json_decode($job->getData(), true);
    try {
        enviarEmail($payload['email']);
        $cliente->delete($job);                      // sucesso → remove
    } catch (\\Throwable $e) {
        $cliente->release($job, priority: 2048, delay: 30);  // tenta de novo em 30s
    }
}

function enviarEmail(string $para): void { usleep(300_000); }`}),e.jsx("h2",{children:"Opção 3: RabbitMQ — quando você precisa de roteamento"}),e.jsxs("p",{children:["RabbitMQ é o padrão da indústria para mensageria com ",e.jsx("em",{children:"exchanges"}),",",e.jsx("em",{children:" bindings"}),", fanout, topics e dead-letter queues. Em PHP você usa"," ",e.jsx("code",{children:"php-amqplib/php-amqplib"}),"."]}),e.jsx(a,{user:"dev",host:"php",cwd:"~/projetos/app",command:"composer require php-amqplib/php-amqplib",output:`Using version ^3.7 for php-amqplib/php-amqplib
./composer.json has been updated
  - Installing php-amqplib/php-amqplib (v3.7.0): Extracting archive`}),e.jsx(s,{filename:"rabbit-producer.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use PhpAmqpLib\\Connection\\AMQPStreamConnection;
use PhpAmqpLib\\Message\\AMQPMessage;

$conn = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
$canal = $conn->channel();

$canal->queue_declare('emails', durable: true, auto_delete: false);

$msg = new AMQPMessage(
    json_encode(['user_id' => 42, 'email' => 'ada@example.com']),
    ['delivery_mode' => AMQPMessage::DELIVERY_MODE_PERSISTENT],
);

$canal->basic_publish($msg, exchange: '', routing_key: 'emails');

echo "Mensagem publicada em emails." . PHP_EOL;
$canal->close();
$conn->close();`,output:"Mensagem publicada em emails."}),e.jsx(s,{filename:"rabbit-consumer.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use PhpAmqpLib\\Connection\\AMQPStreamConnection;
use PhpAmqpLib\\Message\\AMQPMessage;

$conn  = new AMQPStreamConnection('localhost', 5672, 'guest', 'guest');
$canal = $conn->channel();

$canal->queue_declare('emails', durable: true);
$canal->basic_qos(null, 1, null);  // 1 mensagem por vez por consumer

$callback = function (AMQPMessage $msg): void {
    $payload = json_decode($msg->getBody(), true);
    echo "[x] processando {$payload['email']}" . PHP_EOL;

    // sua lógica aqui
    usleep(500_000);

    $msg->ack();    // confirma processamento
};

$canal->basic_consume('emails', '', false, false, false, false, $callback);

while ($canal->is_consuming()) {
    $canal->wait();
}`}),e.jsxs(o,{type:"info",title:"Por que ack manual?",children:["Se você não der ",e.jsx("code",{children:"ack()"}),", o RabbitMQ devolve a mensagem para outro consumer assim que sua conexão cair. Isso garante ",e.jsx("strong",{children:"at-least-once delivery"})," — nada se perde mesmo com worker matado no meio."]}),e.jsx("h2",{children:"Opção 4: Symfony Messenger — abstração sobre todos eles"}),e.jsxs("p",{children:["Symfony Messenger é o componente ",e.jsx("em",{children:"messenger"})," que dá uma API uniforme em cima de Redis, AMQP, Doctrine (banco), Amazon SQS, etc. Você define um ",e.jsx("em",{children:"message"})," ","(DTO), um ",e.jsx("em",{children:"handler"}),", e troca o transport via configuração."]}),e.jsx(a,{user:"dev",host:"php",cwd:"~/projetos/app",command:"composer require symfony/messenger symfony/amqp-messenger",output:`Using version ^7.1 for symfony/messenger
./composer.json has been updated
  - Installing symfony/messenger (v7.1.6): Extracting archive
  - Installing symfony/amqp-messenger (v7.1.6): Extracting archive`}),e.jsx(s,{filename:"src/Message/EnviarBoasVindas.php",code:`<?php
declare(strict_types=1);

namespace App\\Message;

final readonly class EnviarBoasVindas
{
    public function __construct(
        public int    $userId,
        public string $email,
    ) {}
}`}),e.jsx(s,{filename:"src/MessageHandler/EnviarBoasVindasHandler.php",code:`<?php
declare(strict_types=1);

namespace App\\MessageHandler;

use App\\Message\\EnviarBoasVindas;
use Symfony\\Component\\Messenger\\Attribute\\AsMessageHandler;
use Symfony\\Component\\Mailer\\MailerInterface;
use Symfony\\Component\\Mime\\Email;

#[AsMessageHandler]
final readonly class EnviarBoasVindasHandler
{
    public function __construct(private MailerInterface $mailer) {}

    public function __invoke(EnviarBoasVindas $msg): void
    {
        $email = (new Email())
            ->to($msg->email)
            ->subject('Bem-vindo(a)!')
            ->text("Olá! Sua conta {$msg->userId} foi criada.");

        $this->mailer->send($email);
    }
}`}),e.jsx(n,{language:"yaml",title:"config/packages/messenger.yaml",code:`framework:
    messenger:
        transports:
            async: '%env(MESSENGER_TRANSPORT_DSN)%'
        routing:
            'App\\Message\\EnviarBoasVindas': async`}),e.jsx(s,{filename:"src/Controller/SignupController.php",code:`<?php
declare(strict_types=1);

namespace App\\Controller;

use App\\Message\\EnviarBoasVindas;
use Symfony\\Bundle\\FrameworkBundle\\Controller\\AbstractController;
use Symfony\\Component\\HttpFoundation\\JsonResponse;
use Symfony\\Component\\Messenger\\MessageBusInterface;
use Symfony\\Component\\Routing\\Attribute\\Route;

final class SignupController extends AbstractController
{
    #[Route('/signup', methods: ['POST'])]
    public function __invoke(MessageBusInterface $bus): JsonResponse
    {
        $userId = 42; // criado no banco
        $bus->dispatch(new EnviarBoasVindas($userId, 'ada@example.com'));

        return new JsonResponse(['ok' => true, 'user_id' => $userId], 201);
    }
}`}),e.jsx(a,{user:"dev",host:"php",cwd:"~/projetos/app",command:"php bin/console messenger:consume async -vv",output:`[OK] Consuming messages from transports "async".

 // The worker will automatically exit once it has received a stop signal via the messenger:stop-workers command.

INFO  [messenger] Received message App\\Message\\EnviarBoasVindas
INFO  [messenger] Message App\\Message\\EnviarBoasVindas handled by App\\MessageHandler\\EnviarBoasVindasHandler
INFO  [messenger] App\\Message\\EnviarBoasVindas was handled successfully (acknowledging to transport).`}),e.jsx("h2",{children:"Comparando as opções"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Redis lists"}),": simples, rápido, ótimo se você já tem Redis. Sem retry nativo, sem prioridades."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Beanstalkd"}),": leve, prioridades e delays nativos, mas comunidade pequena."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"RabbitMQ"}),": industrial, roteamento avançado, dead-letter, métricas. Requer mais ops."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Symfony Messenger"}),": API uniforme com retries, middleware e routing — recomendado para apps Symfony e Laravel-like (use o Laravel Queue se for Laravel)."]})]}),e.jsxs(o,{type:"success",title:"Receita em produção",children:["Workers rodam em ",e.jsx("code",{children:"systemd"})," com ",e.jsx("code",{children:"Restart=always"})," e",e.jsx("code",{children:"RestartSec=5"}),". Limite de jobs por processo (",e.jsx("code",{children:"--limit=100"})," ","no Messenger) para reciclar memória. Métricas (tamanho da fila, lag) no Prometheus ou Datadog. Dead-letter queue para inspecionar falhas crônicas."]}),e.jsxs("p",{children:["No próximo capítulo a gente entra em ",e.jsx("strong",{children:"segurança de senhas"})," com"," ",e.jsx("code",{children:"password_hash()"})," — o jeito certo (e o errado) de guardar credenciais."]})]})}export{c as default};
