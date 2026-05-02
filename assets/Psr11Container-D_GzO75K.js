import{j as e}from"./index-Bb4MiiJL.js";import{P as n,a as r,A as o}from"./AlertBox-BpD-xIsb.js";import{T as a}from"./TerminalBlock-DGurMC1r.js";import{C as i}from"./CodeBlock-C3V-qEkN.js";function p(){return e.jsxs(n,{title:"PSR-11 Container (DI)",subtitle:"O contrato universal para containers de injeção de dependências em PHP. Aprenda get/has, autowiring por reflection, services compartilhados vs factories e por que service locator é um anti-pattern.",difficulty:"avancado",timeToRead:"13 min",category:"PSR Standards",children:[e.jsx("h2",{children:"O problema: instanciar coisas que dependem de coisas"}),e.jsxs("p",{children:["Imagine um ",e.jsx("code",{children:"UserController"})," que precisa de um ",e.jsx("code",{children:"UserRepository"}),", que precisa de um ",e.jsx("code",{children:"PDO"}),", que precisa de uma string de conexão. Se você instanciar tudo na mão em cada lugar, vai duplicar setup, esquecer de fechar conexões e travar a testabilidade. O ",e.jsx("strong",{children:"container de DI"})," resolve isso: você descreve como construir as coisas ",e.jsx("em",{children:"uma vez"})," e pede pronto quando precisar."]}),e.jsx(r,{filename:"sem-container.php",code:`<?php
declare(strict_types=1);

// Cada handler tem que montar o grafo de dependências na unha.
$pdo = new PDO('pgsql:host=db;dbname=app', 'app', 'secret');
$logger = new \\Monolog\\Logger('app');
$repo = new UserRepository($pdo, $logger);
$controller = new UserController($repo, $logger);

echo $controller->show(42);`,output:'{"id":42,"name":"Ada"}'}),e.jsx("p",{children:"Funciona — mas multiplique por 50 controllers e você tem uma bagunça. O PSR-11 padroniza a interface de qualquer container PHP para que frameworks (Slim, Mezzio, Laminas) e libs (php-di, league/container, Symfony DI) falem a mesma língua."}),e.jsx("h2",{children:"A interface PSR-11: dois métodos, só isso"}),e.jsx(r,{filename:"vendor/psr/container/ContainerInterface.php",code:`<?php
namespace Psr\\Container;

interface ContainerInterface
{
    /**
     * @throws NotFoundExceptionInterface  se o id não existe
     * @throws ContainerExceptionInterface se houver erro na construção
     */
    public function get(string $id): mixed;

    public function has(string $id): bool;
}`}),e.jsxs(o,{type:"info",title:"Só consumo, não configuração",children:["O PSR-11 padroniza apenas ",e.jsx("strong",{children:"como ler"})," do container. Cada implementação define seu próprio jeito de ",e.jsx("em",{children:"registrar"})," bindings (DSL, arrays, attributes). Isso é proposital: a especificação garante que código de biblioteca consiga puxar serviços de qualquer container sem acoplar."]}),e.jsx("h2",{children:"Instalando php-di — o container mais usado"}),e.jsx(a,{user:"dev",host:"php",cwd:"~/app",command:"composer require php-di/php-di",output:`Using version ^7.0 for php-di/php-di
./composer.json has been updated
Running composer update php-di/php-di
Lock file operations: 3 installs, 0 updates, 0 removals
  - Locking psr/container (2.0.2)
  - Locking laravel/serializable-closure (1.3.7)
  - Locking php-di/php-di (7.0.7)
Generating autoload files`}),e.jsx(r,{filename:"bootstrap.php",code:`<?php
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
echo $controller->show(42);`,output:`[2025-01-12T10:32:11+00:00] app.INFO: GET user 42
{"id":42,"name":"Ada"}`}),e.jsx("h2",{children:"Autowiring: o container monta o grafo por você"}),e.jsxs("p",{children:["Repare que ",e.jsx("code",{children:"UserController"})," e ",e.jsx("code",{children:"UserRepository"})," nunca foram registrados. O php-di lê os ",e.jsx("strong",{children:"type hints do construtor via reflection"})," e resolve recursivamente. É o mesmo mecanismo do Symfony e do Laravel."]}),e.jsx(r,{filename:"src/UserController.php",code:`<?php
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
}`}),e.jsxs(o,{type:"warning",title:"Autowiring tem limite",children:["Autowiring funciona quando o tipo é uma ",e.jsx("strong",{children:"classe concreta"})," ou uma",e.jsx("strong",{children:" interface com binding explícito"}),". Para tipos escalares (",e.jsx("code",{children:"string $dsn"}),",",e.jsx("code",{children:"int $timeout"}),") você precisa registrar manualmente — senão o container não tem como adivinhar valores."]}),e.jsx("h2",{children:"Bindings de interface → implementação"}),e.jsx(r,{filename:"bindings.php",code:`<?php
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
var_dump($gateway::class);`,output:'string(13) "StripeGateway"'}),e.jsx("h2",{children:"Compartilhado (singleton) vs factory"}),e.jsxs("p",{children:["Por padrão, o php-di compartilha a instância: a primeira chamada constrói, as próximas recebem a mesma. Para forçar uma instância nova a cada ",e.jsx("code",{children:"get()"}),", marque como factory."]}),e.jsx(r,{filename:"shared-vs-factory.php",code:`<?php
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
var_dump($c->get(RequestId::class) === $c->get(RequestId::class)); // false (factory)`,output:`bool(true)
bool(false)`}),e.jsx("h2",{children:"league/container — o concorrente direto"}),e.jsx(a,{user:"dev",host:"php",cwd:"~/app",command:"composer require league/container",output:`Using version ^4.2 for league/container
./composer.json has been updated
Running composer update league/container`}),e.jsx(r,{filename:"league.php",code:`<?php
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
echo $gateway->charge(1000);`,output:"ch_3OqL2k..."}),e.jsx("h2",{children:"Anti-pattern: Service Locator"}),e.jsxs("p",{children:["Passar o container ",e.jsx("em",{children:"inteiro"})," para dentro das suas classes parece prático, mas esconde dependências e quebra a testabilidade. Você passa a depender de ",e.jsx("strong",{children:"tudo e de nada"})," ao mesmo tempo."]}),e.jsx(r,{filename:"errado.php",code:`<?php
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
}`}),e.jsx(r,{filename:"certo.php",code:`<?php
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
}`}),e.jsxs(o,{type:"danger",title:"Quando o container PODE aparecer",children:["Apenas no ",e.jsx("strong",{children:"composition root"})," (bootstrap, factory de controllers, kernel do framework). Dentro da regra de negócio, nunca. Se o seu serviço importa",e.jsx("code",{children:" ContainerInterface"}),", é cheiro forte de design ruim."]}),e.jsx("h2",{children:"Cache de definições em produção"}),e.jsx("p",{children:"Reflection é cara. Em produção, ative o compilador do php-di: ele gera uma classe PHP estática com todas as resoluções pré-computadas, eliminando reflection no hot path."}),e.jsx(r,{filename:"bootstrap-prod.php",code:`<?php
$builder = new \\DI\\ContainerBuilder();
$builder->addDefinitions(__DIR__ . '/config/services.php');

if (getenv('APP_ENV') === 'production') {
    $builder->enableCompilation(__DIR__ . '/var/cache');
    $builder->writeProxiesToFile(true, __DIR__ . '/var/cache/proxies');
}

return $builder->build();`}),e.jsx(i,{language:"json",title:"composer.json",code:`{
  "require": {
    "php": "^8.4",
    "psr/container": "^2.0",
    "php-di/php-di": "^7.0",
    "monolog/monolog": "^3.7"
  }
}`}),e.jsxs("p",{children:["Container resolvido, dependências limpas. No próximo capítulo a gente conecta esse container com o ",e.jsx("strong",{children:"PSR-15 Middleware"})," para montar uma mini app HTTP do zero."]})]})}export{p as default};
