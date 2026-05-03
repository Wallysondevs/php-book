import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Composer() {
  return (
    <PageContainer
      title="Composer"
      subtitle="O gerenciador de dependências do PHP. É ele quem instala packages, gera o autoload e organiza o ciclo de vida do seu projeto — sem ele, PHP moderno não existe."
      difficulty="intermediario"
      timeToRead="13 min"
      category="Namespaces & Composer"
    >
      <AlertBox type="info" title="Pré-requisitos">
        <p>Antes deste capítulo, é bom já ter visto: <a href="#/instalacao" className="text-[#8993BE] underline">Instalação do PHP</a>, <a href="#/php-cli" className="text-[#8993BE] underline">PHP CLI</a> e <a href="#/namespaces" className="text-[#8993BE] underline">Namespaces</a>.</p>
      </AlertBox>
      <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"composer.json"}</strong> {' — '} {"manifesto: dependências, autoload, scripts."}
          </li>
        <li>
            <strong>{"composer.lock"}</strong> {' — '} {"congela versões exatas para reproduzibilidade."}
          </li>
        <li>
            <strong>{"require / require-dev"}</strong> {' — '} {"produção / só desenvolvimento."}
          </li>
        <li>
            <strong>{"vendor/"}</strong> {' — '} {"pasta gerada com bibliotecas baixadas."}
          </li>
        <li>
            <strong>{"Versões semver"}</strong> {' — '} {"^1.2 = >=1.2 <2.0; ~1.2 = >=1.2 <1.3."}
          </li>
        </ul>
    
      <p><strong className="text-[#8993BE] font-mono">require</strong> (no <code>composer.json</code>) — seção que lista pacotes necessários para sua aplicação rodar em produção. Existe pra separar dependências de runtime das de desenvolvimento. Sintaxe (CLI): <code>composer require vendor/pacote</code>; grava no <code>composer.json</code> e instala em <code>vendor/</code>.</p>

      <p><strong className="text-[#8993BE] font-mono">require-dev</strong> — seção (e flag <code>--dev</code>) para pacotes usados só em dev: PHPUnit, PHPStan, Rector. Existe pra não inflar o deploy. Sintaxe: <code>composer require --dev phpunit/phpunit</code>. Em produção, instale com <code>composer install --no-dev</code>.</p>

      <p><strong className="text-[#8993BE] font-mono">vendor/</strong> — pasta onde o Composer extrai todos os pacotes baixados, mais o <code>autoload.php</code>. Existe como árvore reproduzível a partir do <code>composer.lock</code>. Nunca vai pro git: adicione no <code>.gitignore</code>.</p>

      <p><strong className="text-[#8993BE] font-mono">composer.lock</strong> — arquivo que congela as versões exatas instaladas (ex.: <code>3.7.2</code>) com hash de cada pacote. Existe pra garantir que dev, CI e produção tenham as mesmas dependências. <strong>Comite</strong> esse arquivo em apps; não comite em libraries.</p>

      <h2>Por que Composer existe</h2>
      <p>
        Antes de 2012, instalar uma biblioteca PHP era baixar um <code>.zip</code>,
        extrair em algum lugar e fazer <code>require_once</code> de tudo na unha. Atualizar?
        Repetir. Versão? Boa sorte. O Composer matou esse pesadelo: ele lê um arquivo{" "}
        <code>composer.json</code>, baixa as libs do{" "}
        <a href="https://packagist.org" className="text-[#9CA4C9] underline">Packagist</a>{" "}
        e gera um autoloader que carrega tudo sozinho.
      </p>

      <h2>Instalando o Composer</h2>
      <p>
        Em distros Linux (Arch, Ubuntu) o jeito mais rápido é o gerenciador do sistema.
        Em qualquer outro lugar, o instalador oficial em PHP funciona:
      </p>

      <TerminalBlock
        user="dev"
        host="arch"
        cwd="~"
        command="sudo pacman -S composer"
        output={`resolving dependencies...
:: composer-2.7.7-1  installed`}
      />

      <TerminalBlock
        user="dev"
        host="ubuntu"
        cwd="~"
        command="sudo apt install composer"
        output={`The following NEW packages will be installed:
  composer
0 upgraded, 1 newly installed, 0 to remove`}
      />

      <p>
        Conferindo a instalação:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command="composer --version"
        output={`Composer version 2.7.7 2024-06-10 22:11:12`}
      />

      <AlertBox type="info" title="Atualização do próprio Composer">
        Para atualizar a ferramenta para a última versão estável:{" "}
        <code>composer self-update</code>. Para voltar a uma versão anterior:{" "}
        <code>composer self-update --rollback</code>.
      </AlertBox>

      <h2>Iniciando um projeto: <code>composer init</code></h2>
      <p>
        Em vez de criar o <code>composer.json</code> à mão, deixe o assistente perguntar
        as informações básicas:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/blog"
        command="composer init"
        output={`Welcome to the Composer config generator
Package name (vendor/name): wallyson/blog
Description: Meu blog em PHP
Author: Wallyson Dev <w@dev.io>
Minimum Stability: stable
Package Type: project
License: MIT
Define your dependencies. Search for a package: n
Define your dev dependencies. Search for a package: n
Add PSR-4 autoload mapping? Maps namespace "Wallyson\\Blog" to "src/" (yes)`}
      />

      <p>
        O resultado é um <code>composer.json</code> mínimo:
      </p>

      <CodeBlock
        title="composer.json"
        language="json"
        code={`{
    "name": "wallyson/blog",
    "description": "Meu blog em PHP",
    "type": "project",
    "license": "MIT",
    "require": {
        "php": "^8.4"
    },
    "autoload": {
        "psr-4": {
            "Wallyson\\\\Blog\\\\": "src/"
        }
    }
}`}
      />

      <h2>Adicionando packages: <code>require</code> e <code>remove</code></h2>
      <p>
        Para instalar uma dependência de produção, use <code>composer require</code>{" "}
        com o nome do pacote no Packagist. Vamos adicionar o Monolog (logging) e o
        ramsey/uuid (UUIDs):
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/blog"
        command="composer require monolog/monolog ramsey/uuid"
        output={`Using version ^3.7 for monolog/monolog
Using version ^4.7 for ramsey/uuid
./composer.json has been updated
Loading composer repositories with package information
Updating dependencies
Package operations: 9 installs, 0 updates, 0 removals
  - Installing psr/log (3.0.0)
  - Installing monolog/monolog (3.7.0)
  - Installing ramsey/collection (2.0.0)
  - Installing ramsey/uuid (4.7.6)
Generating autoload files
8 packages you are using are looking for funding.`}
      />

      <p>
        Para dependências usadas só em desenvolvimento (testes, linters, geradores), use{" "}
        <code>--dev</code>:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/blog"
        command="composer require --dev phpunit/phpunit"
        output={`Using version ^11.5 for phpunit/phpunit
./composer.json has been updated
Package operations: 22 installs, 0 updates, 0 removals
Generating autoload files`}
      />

      <p>
        Removendo um pacote é o caminho inverso:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/blog"
        command="composer remove ramsey/uuid"
        output={`./composer.json has been updated
Package operations: 0 installs, 0 updates, 2 removals
  - Removing ramsey/uuid (4.7.6)
  - Removing ramsey/collection (2.0.0)
Generating autoload files`}
      />

      <h2>composer.json vs composer.lock</h2>
      <p>
        São dois arquivos com papéis bem distintos — confundir os dois é um clássico:
      </p>
      <ul>
        <li>
          <strong><code>composer.json</code></strong> declara as <em>regras</em>: quais pacotes você quer
          e em quais faixas de versão (<code>^3.7</code>, <code>~1.2.0</code>, <code>&gt;=2.0</code>).
        </li>
        <li>
          <strong><code>composer.lock</code></strong> congela as <em>versões exatas</em> que foram
          instaladas naquele momento (ex.: <code>3.7.2</code>). É essa versão que será instalada
          em outras máquinas e em produção.
        </li>
      </ul>

      <CodeBlock
        title="composer.json — declara faixas"
        language="json"
        code={`{
    "require": {
        "php": "^8.4",
        "monolog/monolog": "^3.7"
    },
    "require-dev": {
        "phpunit/phpunit": "^11.5"
    }
}`}
      />

      <CodeBlock
        title="composer.lock — congela versões"
        language="json"
        code={`{
    "packages": [
        {
            "name": "monolog/monolog",
            "version": "3.7.0",
            "source": { "url": "https://github.com/Seldaek/monolog.git" }
        }
    ]
}`}
      />

      <AlertBox type="warning" title="Comite o composer.lock">
        Sempre versione o <code>composer.lock</code> em projetos (apps). Em bibliotecas,
        a recomendação oficial é <strong>não</strong> versionar. O <code>vendor/</code>{" "}
        nunca vai pro git — ele é gerado a partir do lock.
      </AlertBox>

      <h2>install vs update — a diferença que pega gente</h2>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/blog"
        command="composer install"
        output={`Installing dependencies from lock file (including require-dev)
Verifying lock file contents can be installed on current platform
Nothing to install, update or remove
Generating autoload files`}
      />

      <p>
        <code>install</code> lê o <code>composer.lock</code> e instala exatamente o que está lá.
        É o que CI/CD e produção devem usar.
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/blog"
        command="composer update monolog/monolog"
        output={`Loading composer repositories with package information
Updating dependencies
Package operations: 0 installs, 1 update, 0 removals
  - Upgrading monolog/monolog (3.7.0 => 3.8.1)
Writing lock file
Generating autoload files`}
      />

      <p>
        <code>update</code> ignora o lock para os pacotes pedidos, busca a versão mais nova
        que satisfaz o <code>composer.json</code> e regrava o lock. Use só em desenvolvimento.
      </p>

      <h2>Dev vs Prod</h2>
      <p>
        Em produção, você não quer o PHPUnit ou ferramentas de debug pesando no servidor.
        A flag <code>--no-dev</code> resolve:
      </p>

      <TerminalBlock
        user="dev"
        host="server"
        cwd="/var/www/blog"
        command="composer install --no-dev --optimize-autoloader --no-interaction"
        output={`Installing dependencies from lock file
Package operations: 9 installs, 0 updates, 0 removals
Generating optimized autoload files (authoritative)`}
      />

      <AlertBox type="success" title="Receita de produção">
        <code>--no-dev</code> exclui <code>require-dev</code>.{" "}
        <code>--optimize-autoloader</code> (ou <code>-o</code>) gera um classmap otimizado.{" "}
        <code>--no-interaction</code> evita travar pedindo input.
      </AlertBox>

      <h2>Scripts: comandos personalizados do projeto</h2>
      <p>
        A seção <code>scripts</code> do <code>composer.json</code> deixa você definir
        atalhos. Vira o "npm scripts" do PHP:
      </p>

      <CodeBlock
        title="composer.json (parcial)"
        language="json"
        code={`{
    "scripts": {
        "test": "phpunit --colors=always",
        "serve": "php -S localhost:8000 -t public",
        "lint": "phpstan analyse src --level=8",
        "post-install-cmd": [
            "@php -r \\"file_exists('.env') || copy('.env.example', '.env');\\""
        ]
    }
}`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/blog"
        command="composer test"
        output={`> phpunit --colors=always
PHPUnit 11.5.0
..........                                                  10 / 10 (100%)
Time: 00:00.123, Memory: 8.00 MB
OK (10 tests, 24 assertions)`}
      />

      <h2>Regenerando o autoload: <code>dump-autoload</code></h2>
      <p>
        Adicionou uma classe nova mas o PHP grita <em>"class not found"</em>? Provavelmente
        você esqueceu de regenerar o autoload. O comando:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/blog"
        command="composer dump-autoload -o"
        output={`Generating optimized autoload files
Generated optimized autoload files containing 142 classes`}
      />

      <p>
        A flag <code>-o</code> (<code>--optimize</code>) faz um classmap completo no momento
        do dump. Isso deixa a resolução de classes mais rápida em produção.
      </p>

      <h2>Packagist: a app store do PHP</h2>
      <p>
        Todo nome de pacote (<code>vendor/nome</code>) que você passa para o{" "}
        <code>composer require</code> é resolvido contra{" "}
        <a href="https://packagist.org" className="text-[#9CA4C9] underline">packagist.org</a>.
        Buscar pelo terminal também funciona:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command="composer search guzzle"
        output={`guzzlehttp/guzzle Guzzle is a PHP HTTP client library
guzzlehttp/psr7 PSR-7 message implementation
guzzlehttp/promises Guzzle promises library`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command="composer show monolog/monolog"
        output={`name     : monolog/monolog
descrip. : Sends your logs to files, sockets, inboxes, databases and various web services
keywords : log, logging, psr-3
versions : * 3.8.1
type     : library
license  : MIT License (MIT)`}
      />

      <h2>Usando o que você instalou</h2>
      <p>
        Basta um <code>require</code> do autoload no ponto de entrada e suas{" "}
        <code>use</code> funcionam:
      </p>

      <PhpBlock
        filename="public/index.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Monolog\\Logger;
use Monolog\\Handler\\StreamHandler;
use Monolog\\Level;

$log = new Logger('blog');
$log->pushHandler(new StreamHandler('php://stdout', Level::Info));

$log->info('Aplicação iniciou', ['php' => PHP_VERSION]);`}
        output={`[2025-03-27T15:00:00-03:00] blog.INFO: Aplicação iniciou {"php":"8.4.2"} []`}
      />

      <AlertBox type="info" title="Próximo capítulo">
        Composer instala packages — mas a mágica do <code>require autoload.php</code> e
        do mapeamento PSR-4 merece um capítulo só dela. Bora pro <strong>Autoload PSR-4</strong>.
      </AlertBox>
    </PageContainer>
  );
}
