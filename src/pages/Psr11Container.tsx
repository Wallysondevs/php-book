import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Psr11Container() {
  return (
    <PageContainer
      title="PSR-11 Container (DI)"
      subtitle="O contrato universal para containers de injeção de dependências em PHP. Aprenda get/has, autowiring por reflection, services compartilhados vs factories e por que service locator é um anti-pattern."
      difficulty="avancado"
      timeToRead="13 min"
      category="PSR Standards"
    >
      <AlertBox type="info" title="Pré-requisitos">
          <p>Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP.</p>
        </AlertBox>
        <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"ContainerInterface"}</strong> {' — '} {"PSR-11 — get/has para localizar serviços."}
          </li>
        <li>
            <strong>{"DI"}</strong> {' — '} {"Dependency Injection — recebe deps no construtor."}
          </li>
        <li>
            <strong>{"Autowiring"}</strong> {' — '} {"container resolve deps olhando type hints."}
          </li>
        <li>
            <strong>{"Implementations"}</strong> {' — '} {"PHP-DI, Symfony Container, Laravel Container, league/container."}
          </li>
        <li>
            <strong>{"Service vs factory"}</strong> {' — '} {"service = mesma instância; factory = nova a cada get."}
          </li>
        </ul>
          <h2>O problema: instanciar coisas que dependem de coisas</h2>
      <p>
        Imagine um <code>UserController</code> que precisa de um <code>UserRepository</code>,
        que precisa de um <code>PDO</code>, que precisa de uma string de conexão. Se você
        instanciar tudo na mão em cada lugar, vai duplicar setup, esquecer de fechar conexões
        e travar a testabilidade. O <strong>container de DI</strong> resolve isso: você descreve
        como construir as coisas <em>uma vez</em> e pede pronto quando precisar.
      </p>

      <PhpBlock
        filename="sem-container.php"
        code={`<?php
declare(strict_types=1);

// Cada handler tem que montar o grafo de dependências na unha.
$pdo = new PDO('pgsql:host=db;dbname=app', 'app', 'secret');
$logger = new \\Monolog\\Logger('app');
$repo = new UserRepository($pdo, $logger);
$controller = new UserController($repo, $logger);

echo $controller->show(42);`}
        output={`{"id":42,"name":"Ada"}`}
      />

      <p>
        Funciona — mas multiplique por 50 controllers e você tem uma bagunça. O PSR-11 padroniza
        a interface de qualquer container PHP para que frameworks (Slim, Mezzio, Laminas) e libs
        (php-di, league/container, Symfony DI) falem a mesma língua.
      </p>

      <h2>A interface PSR-11: dois métodos, só isso</h2>
      <PhpBlock
        filename="vendor/psr/container/ContainerInterface.php"
        code={`<?php
namespace Psr\\Container;

interface ContainerInterface
{
    /**
     * @throws NotFoundExceptionInterface  se o id não existe
     * @throws ContainerExceptionInterface se houver erro na construção
     */
    public function get(string $id): mixed;

    public function has(string $id): bool;
}`}
      />

      <AlertBox type="info" title="Só consumo, não configuração">
        O PSR-11 padroniza apenas <strong>como ler</strong> do container. Cada implementação
        define seu próprio jeito de <em>registrar</em> bindings (DSL, arrays, attributes). Isso
        é proposital: a especificação garante que código de biblioteca consiga puxar serviços
        de qualquer container sem acoplar.
      </AlertBox>

      <h2>Instalando php-di — o container mais usado</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/app"
        command="composer require php-di/php-di"
        output={`Using version ^7.0 for php-di/php-di
./composer.json has been updated
Running composer update php-di/php-di
Lock file operations: 3 installs, 0 updates, 0 removals
  - Locking psr/container (2.0.2)
  - Locking laravel/serializable-closure (1.3.7)
  - Locking php-di/php-di (7.0.7)
Generating autoload files`}
      />

      <PhpBlock
        filename="bootstrap.php"
        code={`<?php
declare(strict_types=1);
require __DIR__ . '/vendor/autoload.php';

use DI\\ContainerBuilder;
use Psr\\Log\\LoggerInterface;
use Monolog\\Logger;
use Monolog\\Handler\\StreamHandler;

$builder = new ContainerBuilder();
$builder->addDefinitions([
    PDO::class => fn() => new PDO(
        'pgsql:host=db;dbname=app', 'app', 'secret',
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION],
    ),
    LoggerInterface::class => function () {
        $log = new Logger('app');
        $log->pushHandler(new StreamHandler('php://stdout'));
        return $log;
    },
]);

$container = $builder->build();

$controller = $container->get(UserController::class);
echo $controller->show(42);`}
        output={`[2025-01-12T10:32:11+00:00] app.INFO: GET user 42
{"id":42,"name":"Ada"}`}
      />

      <h2>Autowiring: o container monta o grafo por você</h2>
      <p>
        Repare que <code>UserController</code> e <code>UserRepository</code> nunca foram registrados.
        O php-di lê os <strong>type hints do construtor via reflection</strong> e resolve
        recursivamente. É o mesmo mecanismo do Symfony e do Laravel.
      </p>

      <PhpBlock
        filename="src/UserController.php"
        code={`<?php
declare(strict_types=1);

final class UserController
{
    public function __construct(
        private readonly UserRepository $repo,
        private readonly \\Psr\\Log\\LoggerInterface $logger,
    ) {}

    public function show(int $id): string
    {
        $this->logger->info("GET user {$id}");
        return json_encode($this->repo->find($id), JSON_THROW_ON_ERROR);
    }
}

final class UserRepository
{
    public function __construct(private readonly \\PDO $pdo) {}

    public function find(int $id): array
    {
        $st = $this->pdo->prepare('SELECT id, name FROM users WHERE id = :id');
        $st->execute(['id' => $id]);
        return $st->fetch(\\PDO::FETCH_ASSOC) ?: [];
    }
}`}
      />

      <AlertBox type="warning" title="Autowiring tem limite">
        Autowiring funciona quando o tipo é uma <strong>classe concreta</strong> ou uma
        <strong> interface com binding explícito</strong>. Para tipos escalares (<code>string $dsn</code>,
        <code>int $timeout</code>) você precisa registrar manualmente — senão o container não tem
        como adivinhar valores.
      </AlertBox>

      <h2>Bindings de interface → implementação</h2>
      <PhpBlock
        filename="bindings.php"
        code={`<?php
use DI\\ContainerBuilder;
use function DI\\autowire;
use function DI\\get;

$builder = new ContainerBuilder();
$builder->addDefinitions([
    // interface -> implementação concreta (autowire respeita o construtor)
    PaymentGatewayInterface::class => autowire(StripeGateway::class),

    // alias de id
    'cache' => get(\\Redis::class),

    // valor escalar via env
    'stripe.key' => fn() => getenv('STRIPE_KEY') ?: throw new RuntimeException('STRIPE_KEY ausente'),

    StripeGateway::class => autowire()
        ->constructorParameter('apiKey', get('stripe.key'))
        ->constructorParameter('timeout', 5),
]);

$container = $builder->build();
$gateway = $container->get(PaymentGatewayInterface::class);
var_dump($gateway::class);`}
        output={`string(13) "StripeGateway"`}
      />

      <h2>Compartilhado (singleton) vs factory</h2>
      <p>
        Por padrão, o php-di compartilha a instância: a primeira chamada constrói, as próximas
        recebem a mesma. Para forçar uma instância nova a cada <code>get()</code>, marque como
        factory.
      </p>

      <PhpBlock
        filename="shared-vs-factory.php"
        code={`<?php
use DI\\ContainerBuilder;
use function DI\\autowire;
use function DI\\factory;

$builder = new ContainerBuilder();
$builder->addDefinitions([
    // shared (default): mesmo objeto sempre
    \\Redis::class => function () {
        $r = new \\Redis();
        $r->connect('redis', 6379);
        return $r;
    },

    // factory: cria nova instância a cada get()
    RequestId::class => factory(fn() => new RequestId(bin2hex(random_bytes(8)))),
]);

$c = $builder->build();

var_dump($c->get(\\Redis::class) === $c->get(\\Redis::class));     // true (shared)
var_dump($c->get(RequestId::class) === $c->get(RequestId::class)); // false (factory)`}
        output={`bool(true)
bool(false)`}
      />

      <h2>league/container — o concorrente direto</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/app"
        command="composer require league/container"
        output={`Using version ^4.2 for league/container
./composer.json has been updated
Running composer update league/container`}
      />

      <PhpBlock
        filename="league.php"
        code={`<?php
declare(strict_types=1);
require __DIR__ . '/vendor/autoload.php';

use League\\Container\\Container;
use League\\Container\\ReflectionContainer;

$c = new Container();

// delega o autowiring ao ReflectionContainer (precisa habilitar)
$c->delegate(new ReflectionContainer(cacheResolutions: true));

$c->add(PaymentGatewayInterface::class, StripeGateway::class)
  ->addArgument('stripe.key');

$c->add('stripe.key', fn() => getenv('STRIPE_KEY'));

// shared() para singleton
$c->addShared(\\Redis::class, function () {
    $r = new \\Redis();
    $r->connect('redis', 6379);
    return $r;
});

$gateway = $c->get(PaymentGatewayInterface::class);
echo $gateway->charge(1000);`}
        output={`ch_3OqL2k...`}
      />

      <h2>Anti-pattern: Service Locator</h2>
      <p>
        Passar o container <em>inteiro</em> para dentro das suas classes parece prático, mas
        esconde dependências e quebra a testabilidade. Você passa a depender de <strong>tudo
        e de nada</strong> ao mesmo tempo.
      </p>

      <PhpBlock
        filename="errado.php"
        code={`<?php
// ❌ ANTI-PATTERN: service locator
final class CheckoutService
{
    public function __construct(private readonly \\Psr\\Container\\ContainerInterface $c) {}

    public function pay(int $orderId): void
    {
        $gateway = $this->c->get(PaymentGatewayInterface::class); // dependência escondida!
        $logger  = $this->c->get(\\Psr\\Log\\LoggerInterface::class);
        // ...
    }
}`}
      />

      <PhpBlock
        filename="certo.php"
        code={`<?php
// ✅ INJEÇÃO EXPLÍCITA: dependências aparecem no construtor
final class CheckoutService
{
    public function __construct(
        private readonly PaymentGatewayInterface $gateway,
        private readonly \\Psr\\Log\\LoggerInterface $logger,
    ) {}

    public function pay(int $orderId): void
    {
        $this->logger->info("pagando pedido {$orderId}");
        $this->gateway->charge($orderId);
    }
}`}
      />

      <AlertBox type="danger" title="Quando o container PODE aparecer">
        Apenas no <strong>composition root</strong> (bootstrap, factory de controllers, kernel
        do framework). Dentro da regra de negócio, nunca. Se o seu serviço importa
        <code> ContainerInterface</code>, é cheiro forte de design ruim.
      </AlertBox>

      <h2>Cache de definições em produção</h2>
      <p>
        Reflection é cara. Em produção, ative o compilador do php-di: ele gera uma classe
        PHP estática com todas as resoluções pré-computadas, eliminando reflection no hot path.
      </p>

      <PhpBlock
        filename="bootstrap-prod.php"
        code={`<?php
$builder = new \\DI\\ContainerBuilder();
$builder->addDefinitions(__DIR__ . '/config/services.php');

if (getenv('APP_ENV') === 'production') {
    $builder->enableCompilation(__DIR__ . '/var/cache');
    $builder->writeProxiesToFile(true, __DIR__ . '/var/cache/proxies');
}

return $builder->build();`}
      />

      <CodeBlock
        language="json"
        title="composer.json"
        code={`{
  "require": {
    "php": "^8.4",
    "psr/container": "^2.0",
    "php-di/php-di": "^7.0",
    "monolog/monolog": "^3.7"
  }
}`}
      />

      <p>
        Container resolvido, dependências limpas. No próximo capítulo a gente conecta esse
        container com o <strong>PSR-15 Middleware</strong> para montar uma mini app HTTP do
        zero.
      </p>
    </PageContainer>
  );
}
