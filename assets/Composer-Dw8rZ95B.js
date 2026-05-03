import{j as e}from"./index-B5-q-eol.js";import{P as r,A as s,a as n}from"./AlertBox-CVbFLZEd.js";import{T as o}from"./TerminalBlock-6fqVIX2R.js";import{C as a}from"./CodeBlock-B36pQ_ak.js";function t(){return e.jsxs(r,{title:"Composer",subtitle:"O gerenciador de dependências do PHP. É ele quem instala packages, gera o autoload e organiza o ciclo de vida do seu projeto — sem ele, PHP moderno não existe.",difficulty:"intermediario",timeToRead:"13 min",category:"Namespaces & Composer",children:[e.jsx(s,{type:"info",title:"Pré-requisitos",children:e.jsxs("p",{children:["Antes deste capítulo, é bom já ter visto: ",e.jsx("a",{href:"#/instalacao",className:"text-[#8993BE] underline",children:"Instalação do PHP"}),", ",e.jsx("a",{href:"#/php-cli",className:"text-[#8993BE] underline",children:"PHP CLI"})," e ",e.jsx("a",{href:"#/namespaces",className:"text-[#8993BE] underline",children:"Namespaces"}),"."]})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"composer.json"})," "," — "," ","manifesto: dependências, autoload, scripts."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"composer.lock"})," "," — "," ","congela versões exatas para reproduzibilidade."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"require / require-dev"})," "," — "," ","produção / só desenvolvimento."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"vendor/"})," "," — "," ","pasta gerada com bibliotecas baixadas."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Versões semver"})," "," — "," ","^1.2 = >=1.2 <2.0; ~1.2 = >=1.2 <1.3."]})]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"require"})," (no ",e.jsx("code",{children:"composer.json"}),") — seção que lista pacotes necessários para sua aplicação rodar em produção. Existe pra separar dependências de runtime das de desenvolvimento. Sintaxe (CLI): ",e.jsx("code",{children:"composer require vendor/pacote"}),"; grava no ",e.jsx("code",{children:"composer.json"})," e instala em ",e.jsx("code",{children:"vendor/"}),"."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"require-dev"})," — seção (e flag ",e.jsx("code",{children:"--dev"}),") para pacotes usados só em dev: PHPUnit, PHPStan, Rector. Existe pra não inflar o deploy. Sintaxe: ",e.jsx("code",{children:"composer require --dev phpunit/phpunit"}),". Em produção, instale com ",e.jsx("code",{children:"composer install --no-dev"}),"."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"vendor/"})," — pasta onde o Composer extrai todos os pacotes baixados, mais o ",e.jsx("code",{children:"autoload.php"}),". Existe como árvore reproduzível a partir do ",e.jsx("code",{children:"composer.lock"}),". Nunca vai pro git: adicione no ",e.jsx("code",{children:".gitignore"}),"."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"composer.lock"})," — arquivo que congela as versões exatas instaladas (ex.: ",e.jsx("code",{children:"3.7.2"}),") com hash de cada pacote. Existe pra garantir que dev, CI e produção tenham as mesmas dependências. ",e.jsx("strong",{children:"Comite"})," esse arquivo em apps; não comite em libraries."]}),e.jsx("h2",{children:"Por que Composer existe"}),e.jsxs("p",{children:["Antes de 2012, instalar uma biblioteca PHP era baixar um ",e.jsx("code",{children:".zip"}),", extrair em algum lugar e fazer ",e.jsx("code",{children:"require_once"})," de tudo na unha. Atualizar? Repetir. Versão? Boa sorte. O Composer matou esse pesadelo: ele lê um arquivo"," ",e.jsx("code",{children:"composer.json"}),", baixa as libs do"," ",e.jsx("a",{href:"https://packagist.org",className:"text-[#9CA4C9] underline",children:"Packagist"})," ","e gera um autoloader que carrega tudo sozinho."]}),e.jsx("h2",{children:"Instalando o Composer"}),e.jsx("p",{children:"Em distros Linux (Arch, Ubuntu) o jeito mais rápido é o gerenciador do sistema. Em qualquer outro lugar, o instalador oficial em PHP funciona:"}),e.jsx(o,{user:"dev",host:"arch",cwd:"~",command:"sudo pacman -S composer",output:`resolving dependencies...
:: composer-2.7.7-1  installed`}),e.jsx(o,{user:"dev",host:"ubuntu",cwd:"~",command:"sudo apt install composer",output:`The following NEW packages will be installed:
  composer
0 upgraded, 1 newly installed, 0 to remove`}),e.jsx("p",{children:"Conferindo a instalação:"}),e.jsx(o,{user:"dev",host:"php",cwd:"~",command:"composer --version",output:"Composer version 2.7.7 2024-06-10 22:11:12"}),e.jsxs(s,{type:"info",title:"Atualização do próprio Composer",children:["Para atualizar a ferramenta para a última versão estável:"," ",e.jsx("code",{children:"composer self-update"}),". Para voltar a uma versão anterior:"," ",e.jsx("code",{children:"composer self-update --rollback"}),"."]}),e.jsxs("h2",{children:["Iniciando um projeto: ",e.jsx("code",{children:"composer init"})]}),e.jsxs("p",{children:["Em vez de criar o ",e.jsx("code",{children:"composer.json"})," à mão, deixe o assistente perguntar as informações básicas:"]}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos/blog",command:"composer init",output:`Welcome to the Composer config generator
Package name (vendor/name): wallyson/blog
Description: Meu blog em PHP
Author: Wallyson Dev <w@dev.io>
Minimum Stability: stable
Package Type: project
License: MIT
Define your dependencies. Search for a package: n
Define your dev dependencies. Search for a package: n
Add PSR-4 autoload mapping? Maps namespace "Wallyson\\Blog" to "src/" (yes)`}),e.jsxs("p",{children:["O resultado é um ",e.jsx("code",{children:"composer.json"})," mínimo:"]}),e.jsx(a,{title:"composer.json",language:"json",code:`{
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
}`}),e.jsxs("h2",{children:["Adicionando packages: ",e.jsx("code",{children:"require"})," e ",e.jsx("code",{children:"remove"})]}),e.jsxs("p",{children:["Para instalar uma dependência de produção, use ",e.jsx("code",{children:"composer require"})," ","com o nome do pacote no Packagist. Vamos adicionar o Monolog (logging) e o ramsey/uuid (UUIDs):"]}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos/blog",command:"composer require monolog/monolog ramsey/uuid",output:`Using version ^3.7 for monolog/monolog
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
8 packages you are using are looking for funding.`}),e.jsxs("p",{children:["Para dependências usadas só em desenvolvimento (testes, linters, geradores), use"," ",e.jsx("code",{children:"--dev"}),":"]}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos/blog",command:"composer require --dev phpunit/phpunit",output:`Using version ^11.5 for phpunit/phpunit
./composer.json has been updated
Package operations: 22 installs, 0 updates, 0 removals
Generating autoload files`}),e.jsx("p",{children:"Removendo um pacote é o caminho inverso:"}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos/blog",command:"composer remove ramsey/uuid",output:`./composer.json has been updated
Package operations: 0 installs, 0 updates, 2 removals
  - Removing ramsey/uuid (4.7.6)
  - Removing ramsey/collection (2.0.0)
Generating autoload files`}),e.jsx("h2",{children:"composer.json vs composer.lock"}),e.jsx("p",{children:"São dois arquivos com papéis bem distintos — confundir os dois é um clássico:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:e.jsx("code",{children:"composer.json"})})," declara as ",e.jsx("em",{children:"regras"}),": quais pacotes você quer e em quais faixas de versão (",e.jsx("code",{children:"^3.7"}),", ",e.jsx("code",{children:"~1.2.0"}),", ",e.jsx("code",{children:">=2.0"}),")."]}),e.jsxs("li",{children:[e.jsx("strong",{children:e.jsx("code",{children:"composer.lock"})})," congela as ",e.jsx("em",{children:"versões exatas"})," que foram instaladas naquele momento (ex.: ",e.jsx("code",{children:"3.7.2"}),"). É essa versão que será instalada em outras máquinas e em produção."]})]}),e.jsx(a,{title:"composer.json — declara faixas",language:"json",code:`{
    "require": {
        "php": "^8.4",
        "monolog/monolog": "^3.7"
    },
    "require-dev": {
        "phpunit/phpunit": "^11.5"
    }
}`}),e.jsx(a,{title:"composer.lock — congela versões",language:"json",code:`{
    "packages": [
        {
            "name": "monolog/monolog",
            "version": "3.7.0",
            "source": { "url": "https://github.com/Seldaek/monolog.git" }
        }
    ]
}`}),e.jsxs(s,{type:"warning",title:"Comite o composer.lock",children:["Sempre versione o ",e.jsx("code",{children:"composer.lock"})," em projetos (apps). Em bibliotecas, a recomendação oficial é ",e.jsx("strong",{children:"não"})," versionar. O ",e.jsx("code",{children:"vendor/"})," ","nunca vai pro git — ele é gerado a partir do lock."]}),e.jsx("h2",{children:"install vs update — a diferença que pega gente"}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos/blog",command:"composer install",output:`Installing dependencies from lock file (including require-dev)
Verifying lock file contents can be installed on current platform
Nothing to install, update or remove
Generating autoload files`}),e.jsxs("p",{children:[e.jsx("code",{children:"install"})," lê o ",e.jsx("code",{children:"composer.lock"})," e instala exatamente o que está lá. É o que CI/CD e produção devem usar."]}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos/blog",command:"composer update monolog/monolog",output:`Loading composer repositories with package information
Updating dependencies
Package operations: 0 installs, 1 update, 0 removals
  - Upgrading monolog/monolog (3.7.0 => 3.8.1)
Writing lock file
Generating autoload files`}),e.jsxs("p",{children:[e.jsx("code",{children:"update"})," ignora o lock para os pacotes pedidos, busca a versão mais nova que satisfaz o ",e.jsx("code",{children:"composer.json"})," e regrava o lock. Use só em desenvolvimento."]}),e.jsx("h2",{children:"Dev vs Prod"}),e.jsxs("p",{children:["Em produção, você não quer o PHPUnit ou ferramentas de debug pesando no servidor. A flag ",e.jsx("code",{children:"--no-dev"})," resolve:"]}),e.jsx(o,{user:"dev",host:"server",cwd:"/var/www/blog",command:"composer install --no-dev --optimize-autoloader --no-interaction",output:`Installing dependencies from lock file
Package operations: 9 installs, 0 updates, 0 removals
Generating optimized autoload files (authoritative)`}),e.jsxs(s,{type:"success",title:"Receita de produção",children:[e.jsx("code",{children:"--no-dev"})," exclui ",e.jsx("code",{children:"require-dev"}),"."," ",e.jsx("code",{children:"--optimize-autoloader"})," (ou ",e.jsx("code",{children:"-o"}),") gera um classmap otimizado."," ",e.jsx("code",{children:"--no-interaction"})," evita travar pedindo input."]}),e.jsx("h2",{children:"Scripts: comandos personalizados do projeto"}),e.jsxs("p",{children:["A seção ",e.jsx("code",{children:"scripts"})," do ",e.jsx("code",{children:"composer.json"}),' deixa você definir atalhos. Vira o "npm scripts" do PHP:']}),e.jsx(a,{title:"composer.json (parcial)",language:"json",code:`{
    "scripts": {
        "test": "phpunit --colors=always",
        "serve": "php -S localhost:8000 -t public",
        "lint": "phpstan analyse src --level=8",
        "post-install-cmd": [
            "@php -r \\"file_exists('.env') || copy('.env.example', '.env');\\""
        ]
    }
}`}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos/blog",command:"composer test",output:`> phpunit --colors=always
PHPUnit 11.5.0
..........                                                  10 / 10 (100%)
Time: 00:00.123, Memory: 8.00 MB
OK (10 tests, 24 assertions)`}),e.jsxs("h2",{children:["Regenerando o autoload: ",e.jsx("code",{children:"dump-autoload"})]}),e.jsxs("p",{children:["Adicionou uma classe nova mas o PHP grita ",e.jsx("em",{children:'"class not found"'}),"? Provavelmente você esqueceu de regenerar o autoload. O comando:"]}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos/blog",command:"composer dump-autoload -o",output:`Generating optimized autoload files
Generated optimized autoload files containing 142 classes`}),e.jsxs("p",{children:["A flag ",e.jsx("code",{children:"-o"})," (",e.jsx("code",{children:"--optimize"}),") faz um classmap completo no momento do dump. Isso deixa a resolução de classes mais rápida em produção."]}),e.jsx("h2",{children:"Packagist: a app store do PHP"}),e.jsxs("p",{children:["Todo nome de pacote (",e.jsx("code",{children:"vendor/nome"}),") que você passa para o"," ",e.jsx("code",{children:"composer require"})," é resolvido contra"," ",e.jsx("a",{href:"https://packagist.org",className:"text-[#9CA4C9] underline",children:"packagist.org"}),". Buscar pelo terminal também funciona:"]}),e.jsx(o,{user:"dev",host:"php",cwd:"~",command:"composer search guzzle",output:`guzzlehttp/guzzle Guzzle is a PHP HTTP client library
guzzlehttp/psr7 PSR-7 message implementation
guzzlehttp/promises Guzzle promises library`}),e.jsx(o,{user:"dev",host:"php",cwd:"~",command:"composer show monolog/monolog",output:`name     : monolog/monolog
descrip. : Sends your logs to files, sockets, inboxes, databases and various web services
keywords : log, logging, psr-3
versions : * 3.8.1
type     : library
license  : MIT License (MIT)`}),e.jsx("h2",{children:"Usando o que você instalou"}),e.jsxs("p",{children:["Basta um ",e.jsx("code",{children:"require"})," do autoload no ponto de entrada e suas"," ",e.jsx("code",{children:"use"})," funcionam:"]}),e.jsx(n,{filename:"public/index.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Monolog\\Logger;
use Monolog\\Handler\\StreamHandler;
use Monolog\\Level;

$log = new Logger('blog');
$log->pushHandler(new StreamHandler('php://stdout', Level::Info));

$log->info('Aplicação iniciou', ['php' => PHP_VERSION]);`,output:'[2025-03-27T15:00:00-03:00] blog.INFO: Aplicação iniciou {"php":"8.4.2"} []'}),e.jsxs(s,{type:"info",title:"Próximo capítulo",children:["Composer instala packages — mas a mágica do ",e.jsx("code",{children:"require autoload.php"})," e do mapeamento PSR-4 merece um capítulo só dela. Bora pro ",e.jsx("strong",{children:"Autoload PSR-4"}),"."]})]})}export{t as default};
