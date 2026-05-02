import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Autoload() {
  return (
    <PageContainer
      title="Autoload PSR-4"
      subtitle="Como o Composer transforma uma simples chamada new App\Models\User em mágica: ele lê o composer.json, mapeia namespaces para pastas e carrega arquivos sob demanda."
      difficulty="avancado"
      timeToRead="11 min"
      category="Namespaces & Composer"
    >
      <AlertBox type="info" title="Pré-requisitos">
        <p>Antes deste capítulo, é bom já ter visto: <a href="#/namespaces" className="text-[#8993BE] underline">Namespaces</a> e <a href="#/composer" className="text-[#8993BE] underline">Composer</a>.</p>
      </AlertBox>

      <p><strong className="text-[#8993BE] font-mono">autoload PSR-4</strong> — padrão da comunidade que mapeia <em>prefixo de namespace</em> para <em>pasta no disco</em>. Existe pra você nunca mais escrever <code>require</code> manual: <code>App\Models\User</code> vira <code>src/Models/User.php</code> automaticamente. Configurado na chave <code>autoload.psr-4</code> do <code>composer.json</code>.</p>

      <h2>O mundo sem autoload (e por que ele dói)</h2>
      <p>
        Antes do PSR-4, qualquer arquivo PHP precisava listar manualmente todas as classes
        que usava. Imagine 200 classes em 30 arquivos:
      </p>

      <PhpBlock
        filename="velho-mundo.php"
        code={`<?php
require_once __DIR__ . '/src/Models/User.php';
require_once __DIR__ . '/src/Models/Product.php';
require_once __DIR__ . '/src/Models/Invoice.php';
require_once __DIR__ . '/src/Services/Mailer.php';
require_once __DIR__ . '/src/Services/Payment/StripeGateway.php';
require_once __DIR__ . '/src/Http/Controllers/HomeController.php';
// ... mais 194 linhas de require_once

$user = new User('Ada');
echo $user->nome;`}
        output={`Ada`}
      />

      <p>
        Mover um arquivo? Renomear uma classe? Esqueceu um <code>require</code>?{" "}
        <em>Fatal error.</em> O autoload resolve isso registrando uma função que o PHP chama{" "}
        <strong>automaticamente</strong> sempre que encontra uma classe ainda não carregada.
      </p>

      <h2>O autoload que vem na caixa: <code>spl_autoload_register</code></h2>
      <p>
        PHP nativamente oferece <code>spl_autoload_register</code> para você plugar
        sua própria função carregadora:
      </p>

      <PhpBlock
        filename="autoload-na-mao.php"
        code={`<?php
declare(strict_types=1);

spl_autoload_register(function (string $classe): void {
    // App\\Models\\User  ->  src/Models/User.php
    $caminho = __DIR__ . '/src/' . str_replace(['App\\\\', '\\\\'], ['', '/'], $classe) . '.php';
    if (is_file($caminho)) {
        require $caminho;
    }
});

$u = new App\\Models\\User('Ada', 'ada@math.org');
echo $u->nome . PHP_EOL;`}
        output={`Ada`}
      />

      <p>
        Funciona — mas você está reinventando a roda toda vez. O Composer faz isso por você
        seguindo um padrão da comunidade chamado <strong>PSR-4</strong>.
      </p>

      <h2>O contrato PSR-4 em uma frase</h2>
      <p>
        <em>"Para cada prefixo de namespace, exista uma pasta base. Substitua o prefixo
        pela pasta, troque <code>\</code> por <code>/</code> e adicione <code>.php</code>."</em>
      </p>

      <CodeBlock
        title="Mapeamento mental"
        language="bash"
        code={`Namespace prefix  ->  Pasta base
App\\               ->  src/

App\\Models\\User    ->  src/Models/User.php
App\\Http\\Kernel    ->  src/Http/Kernel.php
App\\Auth\\JWT       ->  src/Auth/JWT.php`}
      />

      <h2>Configurando PSR-4 no <code>composer.json</code></h2>

      <CodeBlock
        title="composer.json"
        language="json"
        code={`{
    "name": "wallyson/loja",
    "type": "project",
    "require": {
        "php": "^8.4"
    },
    "autoload": {
        "psr-4": {
            "App\\\\": "src/",
            "Loja\\\\": "modulos/loja/src/"
        }
    },
    "autoload-dev": {
        "psr-4": {
            "Tests\\\\": "tests/"
        }
    }
}`}
      />

      <p>
        Repare em três detalhes:
      </p>
      <ul>
        <li>O prefixo termina em <code>\\</code> no JSON (que é apenas <code>\</code> escapado).</li>
        <li>A pasta termina em <code>/</code> — é convenção e ajuda a leitura.</li>
        <li><code>autoload-dev</code> só carrega no ambiente de desenvolvimento (excluído com{" "}
          <code>composer install --no-dev</code>).</li>
      </ul>

      <h2>Vamos construir um package mínimo do zero</h2>
      <p>
        Para entender o autoload na prática, vamos criar uma micro-biblioteca chamada{" "}
        <code>wallyson/saudacao</code> que exporta uma classe <code>Saudador</code>.
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/packages"
        command="mkdir saudacao && cd saudacao && mkdir src"
      />

      <CodeBlock
        title="composer.json"
        language="json"
        code={`{
    "name": "wallyson/saudacao",
    "description": "Pacote de saudação para o php-book",
    "type": "library",
    "license": "MIT",
    "require": {
        "php": "^8.4"
    },
    "autoload": {
        "psr-4": {
            "Wallyson\\\\Saudacao\\\\": "src/"
        },
        "files": [
            "src/helpers.php"
        ]
    }
}`}
      />

      <PhpBlock
        filename="src/Saudador.php"
        code={`<?php
declare(strict_types=1);

namespace Wallyson\\Saudacao;

final class Saudador {
    public function __construct(
        public readonly string $idioma = 'pt',
    ) {}

    public function saudar(string $nome): string {
        return match ($this->idioma) {
            'pt' => "Olá, {$nome}!",
            'en' => "Hello, {$nome}!",
            'es' => "¡Hola, {$nome}!",
            default => "Hi, {$nome}!",
        };
    }
}`}
      />

      <PhpBlock
        filename="src/helpers.php"
        code={`<?php
declare(strict_types=1);

use Wallyson\\Saudacao\\Saudador;

if (!function_exists('saudar')) {
    function saudar(string $nome, string $idioma = 'pt'): string {
        return (new Saudador($idioma))->saudar($nome);
    }
}`}
      />

      <p>
        Repare que o <code>helpers.php</code> não declara classe — só uma função global.
        Por isso ele entra no autoload pela chave <code>files</code>: ele é incluído de
        cara, sem precisar de "alguma classe" para acionar o autoload.
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/packages/saudacao"
        command="composer dump-autoload"
        output={`Generating autoload files
Generated autoload files`}
      />

      <h2>Usando o package localmente</h2>
      <p>
        Em outro projeto, declare o package como repositório do tipo <code>path</code>:
      </p>

      <CodeBlock
        title="meu-app/composer.json"
        language="json"
        code={`{
    "name": "wallyson/app",
    "require": {
        "wallyson/saudacao": "@dev"
    },
    "repositories": [
        { "type": "path", "url": "../saudacao" }
    ],
    "autoload": {
        "psr-4": { "App\\\\": "src/" }
    }
}`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/packages/meu-app"
        command="composer install"
        output={`Installing dependencies (including require-dev)
  - Installing wallyson/saudacao (dev-main): Symlinked from ../saudacao
Generating autoload files`}
      />

      <PhpBlock
        filename="public/index.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Wallyson\\Saudacao\\Saudador;

// Via classe (autoload PSR-4)
$s = new Saudador('en');
echo $s->saudar('Linus') . PHP_EOL;

// Via função global (autoload de files)
echo saudar('Wallyson') . PHP_EOL;
echo saudar('Carmen', 'es') . PHP_EOL;`}
        output={`Hello, Linus!
Olá, Wallyson!
¡Hola, Carmen!`}
      />

      <h2>classmap: o tira-teima</h2>
      <p>
        Às vezes você precisa carregar código <em>legado</em> que não segue PSR-4 —
        várias classes em um arquivo só, namespaces inconsistentes, pastas malucas.
        Para isso existe <code>classmap</code>:
      </p>

      <CodeBlock
        title="composer.json"
        language="json"
        code={`{
    "autoload": {
        "psr-4": { "App\\\\": "src/" },
        "classmap": [
            "legado/"
        ]
    }
}`}
      />

      <p>
        Quando você roda <code>composer dump-autoload</code>, ele varre a pasta{" "}
        <code>legado/</code>, encontra todas as <code>class</code>, <code>interface</code>,{" "}
        <code>trait</code> e <code>enum</code>, e gera um array com{" "}
        <em>"NomeDaClasse → caminho do arquivo"</em>. É a alternativa mais lenta de gerar
        mas a mais rápida em runtime.
      </p>

      <h2>Otimização para produção</h2>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="/var/www/app"
        command="composer dump-autoload --optimize --classmap-authoritative"
        output={`Generating optimized autoload files
Generated optimized autoload files containing 421 classes`}
      />

      <ul>
        <li><code>--optimize</code> (<code>-o</code>): converte PSR-4 num classmap pré-resolvido.</li>
        <li><code>--classmap-authoritative</code>: <strong>nunca</strong> consulta o disco em runtime.
          Se a classe não estiver no classmap, a chamada falha imediato. Mais rápido, exige rebuild a cada deploy.</li>
        <li><code>--apcu</code>: usa a extensão APCu para cachear o lookup em memória entre requests.</li>
      </ul>

      <AlertBox type="warning" title="Esqueceu de regenerar?">
        Em dev, criou um arquivo novo e bate <em>"Class not found"</em>?{" "}
        <code>composer dump-autoload</code>. Se você usa <code>-o --classmap-authoritative</code>{" "}
        em prod, <strong>todo deploy</strong> precisa rodar esse comando.
      </AlertBox>

      <h2>Espiando como funciona por dentro</h2>
      <p>
        O <code>vendor/autoload.php</code> apenas inclui <code>vendor/composer/autoload_real.php</code>,
        que registra um closure no SPL apontando para os mapas gerados em{" "}
        <code>autoload_psr4.php</code>, <code>autoload_classmap.php</code> e <code>autoload_files.php</code>.
        Você pode até inspecionar:
      </p>

      <PhpBlock
        filename="diag.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

foreach (spl_autoload_functions() as $i => $fn) {
    if (is_array($fn)) {
        $fn = get_class($fn[0]) . '::' . $fn[1];
    }
    echo "[$i] $fn" . PHP_EOL;
}`}
        output={`[0] Composer\\Autoload\\ClassLoader::loadClass`}
      />

      <AlertBox type="success" title="Resumo de bolso">
        <ol className="list-decimal ml-5 mt-1 space-y-1">
          <li>Use <strong>PSR-4</strong> para 99% das classes do seu projeto.</li>
          <li>Use <strong>files</strong> para helpers globais (poucos!).</li>
          <li>Use <strong>classmap</strong> para código legado.</li>
          <li>Sempre <code>composer dump-autoload -o</code> em produção.</li>
          <li>Quanto mais previsível seu mapeamento, mais rápido o autoload.</li>
        </ol>
      </AlertBox>

      <p>
        Pronto: você entende todo o caminho desde <code>new App\Models\User</code> até o
        arquivo no disco. Próximo capítulo entra no mundo web — formulários e dados de usuário.
      </p>
    </PageContainer>
  );
}
