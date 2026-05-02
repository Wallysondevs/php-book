import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Namespaces() {
  return (
    <PageContainer
      title="Namespaces"
      subtitle="Como evitar a salada de nomes em projetos grandes: namespaces organizam classes, funções e constantes em pastas lógicas — e são a base do autoload PSR-4."
      difficulty="intermediario"
      timeToRead="11 min"
      category="Namespaces & Composer"
    >
      <AlertBox type="info" title="Pré-requisitos">
        <p>Antes deste capítulo, é bom já ter visto: <a href="#/classes" className="text-[#8993BE] underline">Classes e Objetos</a>, <a href="#/funcoes" className="text-[#8993BE] underline">Funções</a> e <a href="#/interfaces" className="text-[#8993BE] underline">Interfaces</a>.</p>
      </AlertBox>

      <p><strong className="text-[#8993BE] font-mono">namespace</strong> — declara um prefixo lógico que agrupa classes, funções e constantes do arquivo. Existe pra evitar colisão de nomes em projetos grandes e em pacotes de terceiros. Sintaxe (primeira instrução do arquivo): <code>namespace App\Models;</code>. Aceita sub-níveis separados por <code>\</code>.</p>

      <p><strong className="text-[#8993BE] font-mono">use</strong> — importa um símbolo (classe, função, constante) de outro namespace para o escopo do arquivo, evitando escrever o FQN completo. Sintaxe: <code>use App\Models\User;</code>. Pode importar em grupo: <code>use App\Models\{`{User, Product}`};</code>.</p>

      <p><strong className="text-[#8993BE] font-mono">as</strong> — cria um alias (apelido) para um <code>use</code>, útil quando dois imports têm o mesmo nome curto. Sintaxe: <code>use App\Models\User as LocalUser;</code>. Também serve em <code>use Trait {`{ metodo as outroNome; }`}</code>.</p>

      <h2>O problema: dois <code>User</code> no mesmo projeto</h2>
      <p>
        Imagine que você tem uma classe <code>User</code> que representa um usuário do sistema e
        outra <code>User</code> vinda de um pacote de terceiros que representa um usuário do GitHub.
        Sem namespaces, PHP não tem como diferenciar — é erro fatal de redeclaração.
      </p>

      <PhpBlock
        filename="conflito.php"
        code={`<?php
class User { public string $nome = "interno"; }
class User { public string $login = "wallyson"; } // boom

new User();`}
        output={`PHP Fatal error: Cannot declare class User, because the name is already in use`}
      />

      <p>
        A solução é <strong>namespace</strong>: um prefixo lógico que mora no topo do arquivo e
        coloca tudo que vem depois dentro daquela "pasta virtual".
      </p>

      <h2>Declarando um namespace</h2>
      <p>
        A primeira instrução do arquivo (depois do <code>declare</code>, se houver) é a declaração{" "}
        <code>namespace</code>. Por convenção PSR-4, ele espelha a estrutura de pastas a partir
        de <code>src/</code>.
      </p>

      <PhpBlock
        filename="src/Models/User.php"
        code={`<?php
declare(strict_types=1);

namespace App\\Models;

class User {
    public function __construct(
        public readonly string $nome,
        public readonly string $email,
    ) {}
}`}
      />

      <PhpBlock
        filename="src/Github/User.php"
        code={`<?php
declare(strict_types=1);

namespace App\\Github;

class User {
    public function __construct(
        public readonly string $login,
        public readonly int $id,
    ) {}
}`}
      />

      <p>
        Agora as duas classes coexistem sem brigar: o nome completo (FQN — <em>Fully Qualified Name</em>)
        de cada uma é <code>App\Models\User</code> e <code>App\Github\User</code>. Diferentes.
      </p>

      <h2>Importando com <code>use</code></h2>
      <p>
        Escrever o FQN inteiro toda hora é cansativo. A palavra-chave <code>use</code>{" "}
        importa um nome para o escopo do arquivo:
      </p>

      <PhpBlock
        filename="public/index.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use App\\Models\\User;

$ada = new User(nome: "Ada Lovelace", email: "ada@math.org");
echo $ada->nome . PHP_EOL;
echo $ada->email . PHP_EOL;`}
        output={`Ada Lovelace
ada@math.org`}
      />

      <h2>Conflito? Use <code>as</code> para apelidar</h2>
      <p>
        Quando dois <code>use</code> trazem nomes iguais, criamos um alias. Olha como
        ficamos com os dois <code>User</code> no mesmo arquivo:
      </p>

      <PhpBlock
        filename="public/sync.php"
        code={`<?php
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
);`}
        output={`local: Wallyson | github: wallysondevs (#4242)`}
      />

      <AlertBox type="info" title="Importando vários de uma vez">
        Você pode agrupar imports do mesmo namespace base com a sintaxe de chaves:
        <br />
        <code>use App\Models\{`{User, Product, Invoice}`};</code>
      </AlertBox>

      <h2>Sub-namespaces: pastas dentro de pastas</h2>
      <p>
        Namespaces aceitam quantos níveis você quiser. Cada nível corresponde a uma pasta
        no disco. Se o seu <code>composer.json</code> mapeia <code>App\</code> para{" "}
        <code>src/</code>, então:
      </p>

      <ul>
        <li><code>App\Models\User</code> mora em <code>src/Models/User.php</code></li>
        <li><code>App\Http\Controllers\HomeController</code> mora em <code>src/Http/Controllers/HomeController.php</code></li>
        <li><code>App\Services\Payment\StripeGateway</code> mora em <code>src/Services/Payment/StripeGateway.php</code></li>
      </ul>

      <PhpBlock
        filename="src/Services/Payment/StripeGateway.php"
        code={`<?php
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
}`}
      />

      <PhpBlock
        filename="public/cobrar.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use App\\Models\\User;
use App\\Services\\Payment\\StripeGateway;

$cliente  = new User(nome: "Linus", email: "linus@kernel.org");
$gateway  = new StripeGateway();

echo $gateway->cobrar($cliente, 19900) . PHP_EOL;`}
        output={`cobrando R$ 199,00 de Linus`}
      />

      <h2>Namespace global e a barra inicial</h2>
      <p>
        Tudo que <strong>não</strong> tem namespace mora no <em>namespace global</em> — incluindo
        funções nativas como <code>strlen</code>, <code>count</code>, <code>printf</code> e classes
        como <code>DateTime</code>, <code>PDO</code>, <code>Exception</code>.
      </p>
      <p>
        Quando você está dentro de um namespace, PHP procura nomes <strong>primeiro no namespace atual</strong>.
        Para forçar o acesso global, prefixe com <code>\</code>:
      </p>

      <PhpBlock
        filename="src/Utils/Clock.php"
        code={`<?php
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
}`}
      />

      <PhpBlock
        filename="public/clock.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use App\\Utils\\Clock;

$c = new Clock();
echo $c->agora() . PHP_EOL;
echo $c->tamanho("php é demais") . PHP_EOL;`}
        output={`27/03/2025 14:22
12`}
      />

      <AlertBox type="warning" title="Pegadinha clássica">
        Dentro de um namespace, <code>new Exception()</code> tenta achar{" "}
        <code>App\Seu\Namespace\Exception</code> primeiro. Para usar a nativa,{" "}
        <strong>importe</strong> com <code>use Exception;</code> ou prefixe com{" "}
        <code>\Exception</code>.
      </AlertBox>

      <h2>FQN com vendor: <code>\Vendor\Class</code></h2>
      <p>
        Quando você instala um pacote do Composer, ele vem com seu próprio namespace raiz —
        normalmente <code>Vendor\Pacote</code>. Por exemplo, o Monolog mora em <code>Monolog\</code>:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/app"
        command="composer require monolog/monolog"
        output={`Using version ^3.7 for monolog/monolog
./composer.json has been updated
Installing dependencies (including require-dev) from lock file
Package operations: 3 installs, 0 updates, 0 removals
Generating optimized autoload files`}
      />

      <PhpBlock
        filename="public/log.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Monolog\\Logger;
use Monolog\\Handler\\StreamHandler;
use Monolog\\Level;

$log = new Logger('app');
$log->pushHandler(new StreamHandler('php://stdout', Level::Debug));

$log->info('Servidor iniciado', ['porta' => 8000]);
$log->warning('Usuário tentou logar 3x', ['ip' => '10.0.0.1']);`}
        output={`[2025-03-27T14:30:01-03:00] app.INFO: Servidor iniciado {"porta":8000} []
[2025-03-27T14:30:01-03:00] app.WARNING: Usuário tentou logar 3x {"ip":"10.0.0.1"} []`}
      />

      <h2>Mapeamento PSR-4: como o autoload sabe onde achar</h2>
      <p>
        Tudo isso só funciona porque o <code>composer.json</code> declara um mapeamento
        entre <em>prefixo de namespace</em> e <em>pasta no disco</em>. Esse padrão é o{" "}
        <strong>PSR-4</strong>:
      </p>

      <CodeBlock
        title="composer.json"
        language="json"
        code={`{
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
}`}
      />

      <p>
        Com essa configuração, sempre que você usa <code>App\Models\User</code>, o Composer
        carrega <code>src/Models/User.php</code> automaticamente. <strong>Zero <code>require</code> manual.</strong>
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/app"
        command="tree src"
        output={`src
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
    └── Clock.php`}
      />

      <AlertBox type="success" title="Regras de ouro do namespace">
        <ol className="list-decimal ml-5 mt-1 space-y-1">
          <li>Um arquivo = uma classe pública = um namespace.</li>
          <li>O namespace espelha a pasta. Disciplina total: pasta <code>Http/Controllers</code> = namespace <code>App\Http\Controllers</code>.</li>
          <li>Use <code>PascalCase</code> nos segmentos: <code>App\Models</code>, nunca <code>App\models</code>.</li>
          <li>Após mudar pastas/namespaces, rode <code>composer dump-autoload</code>.</li>
        </ol>
      </AlertBox>

      <p>
        No próximo capítulo a gente instala o Composer e cria um <code>composer.json</code>{" "}
        do zero. Depois disso, autoload e packages reais ficam triviais.
      </p>
    </PageContainer>
  );
}
