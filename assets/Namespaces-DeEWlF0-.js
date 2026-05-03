import{j as e}from"./index-B5-q-eol.js";import{P as r,A as o,a as s}from"./AlertBox-CVbFLZEd.js";import{T as a}from"./TerminalBlock-6fqVIX2R.js";import{C as c}from"./CodeBlock-B36pQ_ak.js";function d(){return e.jsxs(r,{title:"Namespaces",subtitle:"Como evitar a salada de nomes em projetos grandes: namespaces organizam classes, funções e constantes em pastas lógicas — e são a base do autoload PSR-4.",difficulty:"intermediario",timeToRead:"11 min",category:"Namespaces & Composer",children:[e.jsx(o,{type:"info",title:"Pré-requisitos",children:e.jsxs("p",{children:["Antes deste capítulo, é bom já ter visto: ",e.jsx("a",{href:"#/classes",className:"text-[#8993BE] underline",children:"Classes e Objetos"}),", ",e.jsx("a",{href:"#/funcoes",className:"text-[#8993BE] underline",children:"Funções"})," e ",e.jsx("a",{href:"#/interfaces",className:"text-[#8993BE] underline",children:"Interfaces"}),"."]})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"namespace App\\\\Module;"})," "," — "," ","agrupa classes em pacotes lógicos para evitar colisão."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"use"})," "," — "," ","use App\\\\Foo; — importa nome para o escopo do arquivo."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"as"})," "," — "," ","use Foo as Bar; — apelida."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Fully qualified"})," "," — "," ","\\\\Acme\\\\Foo — caminho absoluto, ignora aliases."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"PSR-4"})," "," — "," ","mapeia namespace → diretório no Composer."]})]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"namespace"})," — declara um prefixo lógico que agrupa classes, funções e constantes do arquivo. Existe pra evitar colisão de nomes em projetos grandes e em pacotes de terceiros. Sintaxe (primeira instrução do arquivo): ",e.jsx("code",{children:"namespace App\\Models;"}),". Aceita sub-níveis separados por ",e.jsx("code",{children:"\\"}),"."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"use"})," — importa um símbolo (classe, função, constante) de outro namespace para o escopo do arquivo, evitando escrever o FQN completo. Sintaxe: ",e.jsx("code",{children:"use App\\Models\\User;"}),". Pode importar em grupo: ",e.jsxs("code",{children:["use App\\Models\\","{User, Product}",";"]}),"."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"as"})," — cria um alias (apelido) para um ",e.jsx("code",{children:"use"}),", útil quando dois imports têm o mesmo nome curto. Sintaxe: ",e.jsx("code",{children:"use App\\Models\\User as LocalUser;"}),". Também serve em ",e.jsxs("code",{children:["use Trait ","{ metodo as outroNome; }"]}),"."]}),e.jsxs("h2",{children:["O problema: dois ",e.jsx("code",{children:"User"})," no mesmo projeto"]}),e.jsxs("p",{children:["Imagine que você tem uma classe ",e.jsx("code",{children:"User"})," que representa um usuário do sistema e outra ",e.jsx("code",{children:"User"})," vinda de um pacote de terceiros que representa um usuário do GitHub. Sem namespaces, PHP não tem como diferenciar — é erro fatal de redeclaração."]}),e.jsx(s,{filename:"conflito.php",code:`<?php
class User { public string $nome = "interno"; }
class User { public string $login = "wallyson"; } // boom

new User();`,output:"PHP Fatal error: Cannot declare class User, because the name is already in use"}),e.jsxs("p",{children:["A solução é ",e.jsx("strong",{children:"namespace"}),': um prefixo lógico que mora no topo do arquivo e coloca tudo que vem depois dentro daquela "pasta virtual".']}),e.jsx("h2",{children:"Declarando um namespace"}),e.jsxs("p",{children:["A primeira instrução do arquivo (depois do ",e.jsx("code",{children:"declare"}),", se houver) é a declaração"," ",e.jsx("code",{children:"namespace"}),". Por convenção PSR-4, ele espelha a estrutura de pastas a partir de ",e.jsx("code",{children:"src/"}),"."]}),e.jsx(s,{filename:"src/Models/User.php",code:`<?php
declare(strict_types=1);

namespace App\\Models;

class User {
    public function __construct(
        public readonly string $nome,
        public readonly string $email,
    ) {}
}`}),e.jsx(s,{filename:"src/Github/User.php",code:`<?php
declare(strict_types=1);

namespace App\\Github;

class User {
    public function __construct(
        public readonly string $login,
        public readonly int $id,
    ) {}
}`}),e.jsxs("p",{children:["Agora as duas classes coexistem sem brigar: o nome completo (FQN — ",e.jsx("em",{children:"Fully Qualified Name"}),") de cada uma é ",e.jsx("code",{children:"App\\Models\\User"})," e ",e.jsx("code",{children:"App\\Github\\User"}),". Diferentes."]}),e.jsxs("h2",{children:["Importando com ",e.jsx("code",{children:"use"})]}),e.jsxs("p",{children:["Escrever o FQN inteiro toda hora é cansativo. A palavra-chave ",e.jsx("code",{children:"use"})," ","importa um nome para o escopo do arquivo:"]}),e.jsx(s,{filename:"public/index.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use App\\Models\\User;

$ada = new User(nome: "Ada Lovelace", email: "ada@math.org");
echo $ada->nome . PHP_EOL;
echo $ada->email . PHP_EOL;`,output:`Ada Lovelace
ada@math.org`}),e.jsxs("h2",{children:["Conflito? Use ",e.jsx("code",{children:"as"})," para apelidar"]}),e.jsxs("p",{children:["Quando dois ",e.jsx("code",{children:"use"})," trazem nomes iguais, criamos um alias. Olha como ficamos com os dois ",e.jsx("code",{children:"User"})," no mesmo arquivo:"]}),e.jsx(s,{filename:"public/sync.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use App\\Models\\User as LocalUser;
use App\\Github\\User as GithubUser;

$local  = new LocalUser(nome: "Wallyson", email: "w@dev.io");
$remote = new GithubUser(login: "wallysondevs", id: 4242);

printf("local: %s | github: %s (#%d)%s",
    $local->nome,
    $remote->login,
    $remote->id,
    PHP_EOL,
);`,output:"local: Wallyson | github: wallysondevs (#4242)"}),e.jsxs(o,{type:"info",title:"Importando vários de uma vez",children:["Você pode agrupar imports do mesmo namespace base com a sintaxe de chaves:",e.jsx("br",{}),e.jsxs("code",{children:["use App\\Models\\","{User, Product, Invoice}",";"]})]}),e.jsx("h2",{children:"Sub-namespaces: pastas dentro de pastas"}),e.jsxs("p",{children:["Namespaces aceitam quantos níveis você quiser. Cada nível corresponde a uma pasta no disco. Se o seu ",e.jsx("code",{children:"composer.json"})," mapeia ",e.jsx("code",{children:"App\\"})," para"," ",e.jsx("code",{children:"src/"}),", então:"]}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"App\\Models\\User"})," mora em ",e.jsx("code",{children:"src/Models/User.php"})]}),e.jsxs("li",{children:[e.jsx("code",{children:"App\\Http\\Controllers\\HomeController"})," mora em ",e.jsx("code",{children:"src/Http/Controllers/HomeController.php"})]}),e.jsxs("li",{children:[e.jsx("code",{children:"App\\Services\\Payment\\StripeGateway"})," mora em ",e.jsx("code",{children:"src/Services/Payment/StripeGateway.php"})]})]}),e.jsx(s,{filename:"src/Services/Payment/StripeGateway.php",code:`<?php
declare(strict_types=1);

namespace App\\Services\\Payment;

use App\\Models\\User;

final class StripeGateway {
    public function cobrar(User $cliente, int $centavos): string {
        return sprintf("cobrando %s de %s", $this->formato($centavos), $cliente->nome);
    }

    private function formato(int $centavos): string {
        return 'R$ ' . number_format($centavos / 100, 2, ',', '.');
    }
}`}),e.jsx(s,{filename:"public/cobrar.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use App\\Models\\User;
use App\\Services\\Payment\\StripeGateway;

$cliente  = new User(nome: "Linus", email: "linus@kernel.org");
$gateway  = new StripeGateway();

echo $gateway->cobrar($cliente, 19900) . PHP_EOL;`,output:"cobrando R$ 199,00 de Linus"}),e.jsx("h2",{children:"Namespace global e a barra inicial"}),e.jsxs("p",{children:["Tudo que ",e.jsx("strong",{children:"não"})," tem namespace mora no ",e.jsx("em",{children:"namespace global"})," — incluindo funções nativas como ",e.jsx("code",{children:"strlen"}),", ",e.jsx("code",{children:"count"}),", ",e.jsx("code",{children:"printf"})," e classes como ",e.jsx("code",{children:"DateTime"}),", ",e.jsx("code",{children:"PDO"}),", ",e.jsx("code",{children:"Exception"}),"."]}),e.jsxs("p",{children:["Quando você está dentro de um namespace, PHP procura nomes ",e.jsx("strong",{children:"primeiro no namespace atual"}),". Para forçar o acesso global, prefixe com ",e.jsx("code",{children:"\\"}),":"]}),e.jsx(s,{filename:"src/Utils/Clock.php",code:`<?php
declare(strict_types=1);

namespace App\\Utils;

final class Clock {
    public function agora(): string {
        // Sem a barra, PHP procuraria App\\Utils\\DateTimeImmutable.
        $dt = new \\DateTimeImmutable('now', new \\DateTimeZone('America/Sao_Paulo'));
        return $dt->format('d/m/Y H:i');
    }

    public function tamanho(string $s): int {
        // O \\ na frente de strlen deixa explícito que é a função nativa.
        return \\strlen($s);
    }
}`}),e.jsx(s,{filename:"public/clock.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use App\\Utils\\Clock;

$c = new Clock();
echo $c->agora() . PHP_EOL;
echo $c->tamanho("php é demais") . PHP_EOL;`,output:`27/03/2025 14:22
12`}),e.jsxs(o,{type:"warning",title:"Pegadinha clássica",children:["Dentro de um namespace, ",e.jsx("code",{children:"new Exception()"})," tenta achar"," ",e.jsx("code",{children:"App\\Seu\\Namespace\\Exception"})," primeiro. Para usar a nativa,"," ",e.jsx("strong",{children:"importe"})," com ",e.jsx("code",{children:"use Exception;"})," ou prefixe com"," ",e.jsx("code",{children:"\\Exception"}),"."]}),e.jsxs("h2",{children:["FQN com vendor: ",e.jsx("code",{children:"\\Vendor\\Class"})]}),e.jsxs("p",{children:["Quando você instala um pacote do Composer, ele vem com seu próprio namespace raiz — normalmente ",e.jsx("code",{children:"Vendor\\Pacote"}),". Por exemplo, o Monolog mora em ",e.jsx("code",{children:"Monolog\\"}),":"]}),e.jsx(a,{user:"dev",host:"php",cwd:"~/projetos/app",command:"composer require monolog/monolog",output:`Using version ^3.7 for monolog/monolog
./composer.json has been updated
Installing dependencies (including require-dev) from lock file
Package operations: 3 installs, 0 updates, 0 removals
Generating optimized autoload files`}),e.jsx(s,{filename:"public/log.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Monolog\\Logger;
use Monolog\\Handler\\StreamHandler;
use Monolog\\Level;

$log = new Logger('app');
$log->pushHandler(new StreamHandler('php://stdout', Level::Debug));

$log->info('Servidor iniciado', ['porta' => 8000]);
$log->warning('Usuário tentou logar 3x', ['ip' => '10.0.0.1']);`,output:`[2025-03-27T14:30:01-03:00] app.INFO: Servidor iniciado {"porta":8000} []
[2025-03-27T14:30:01-03:00] app.WARNING: Usuário tentou logar 3x {"ip":"10.0.0.1"} []`}),e.jsx("h2",{children:"Mapeamento PSR-4: como o autoload sabe onde achar"}),e.jsxs("p",{children:["Tudo isso só funciona porque o ",e.jsx("code",{children:"composer.json"})," declara um mapeamento entre ",e.jsx("em",{children:"prefixo de namespace"})," e ",e.jsx("em",{children:"pasta no disco"}),". Esse padrão é o"," ",e.jsx("strong",{children:"PSR-4"}),":"]}),e.jsx(c,{title:"composer.json",language:"json",code:`{
  "name": "wallyson/app",
  "type": "project",
  "require": {
    "php": "^8.4",
    "monolog/monolog": "^3.7"
  },
  "autoload": {
    "psr-4": {
      "App\\\\": "src/"
    }
  }
}`}),e.jsxs("p",{children:["Com essa configuração, sempre que você usa ",e.jsx("code",{children:"App\\Models\\User"}),", o Composer carrega ",e.jsx("code",{children:"src/Models/User.php"})," automaticamente. ",e.jsxs("strong",{children:["Zero ",e.jsx("code",{children:"require"})," manual."]})]}),e.jsx(a,{user:"dev",host:"php",cwd:"~/projetos/app",command:"tree src",output:`src
├── Github
│   └── User.php
├── Http
│   └── Controllers
│       └── HomeController.php
├── Models
│   └── User.php
├── Services
│   └── Payment
│       └── StripeGateway.php
└── Utils
    └── Clock.php`}),e.jsx(o,{type:"success",title:"Regras de ouro do namespace",children:e.jsxs("ol",{className:"list-decimal ml-5 mt-1 space-y-1",children:[e.jsx("li",{children:"Um arquivo = uma classe pública = um namespace."}),e.jsxs("li",{children:["O namespace espelha a pasta. Disciplina total: pasta ",e.jsx("code",{children:"Http/Controllers"})," = namespace ",e.jsx("code",{children:"App\\Http\\Controllers"}),"."]}),e.jsxs("li",{children:["Use ",e.jsx("code",{children:"PascalCase"})," nos segmentos: ",e.jsx("code",{children:"App\\Models"}),", nunca ",e.jsx("code",{children:"App\\models"}),"."]}),e.jsxs("li",{children:["Após mudar pastas/namespaces, rode ",e.jsx("code",{children:"composer dump-autoload"}),"."]})]})}),e.jsxs("p",{children:["No próximo capítulo a gente instala o Composer e cria um ",e.jsx("code",{children:"composer.json"})," ","do zero. Depois disso, autoload e packages reais ficam triviais."]})]})}export{d as default};
