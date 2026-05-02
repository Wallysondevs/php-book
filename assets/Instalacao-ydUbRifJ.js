import{j as e}from"./index-Bb4MiiJL.js";import{P as n,A as a,a as r}from"./AlertBox-BpD-xIsb.js";import{T as o}from"./TerminalBlock-DGurMC1r.js";import{C as i}from"./CodeBlock-C3V-qEkN.js";function c(){return e.jsxs(n,{title:"Instalando PHP",subtitle:"Como instalar PHP 8.4 em Linux (apt/dnf/pacman), macOS (brew) e Windows. Conferindo a instalação, ativando extensões essenciais e Docker como plano B universal.",difficulty:"iniciante",timeToRead:"12 min",category:"Instalação",children:[e.jsxs("h2",{children:["O objetivo: ",e.jsx("code",{children:"php -v"})," imprimindo 8.4"]}),e.jsx("p",{children:"Você terminou este capítulo quando conseguir abrir um terminal e ver algo como:"}),e.jsx(o,{user:"dev",host:"php",cwd:"~",command:"php -v",output:`PHP 8.4.1 (cli) (built: Nov 19 2024 18:02:10) (NTS)
Copyright (c) The PHP Group
Zend Engine v4.4.1, Copyright (c) Zend Technologies
    with Zend OPcache v8.4.1, Copyright (c), by Zend Technologies`}),e.jsx("p",{children:"Vamos chegar lá em qualquer sistema operacional."}),e.jsx("h2",{children:"Linux: o caminho mais reto"}),e.jsx("h3",{children:"Ubuntu / Debian — repositório do Ondřej Surý"}),e.jsx("p",{children:"O repositório oficial do Ubuntu costuma ficar uma versão atrás. Para PHP 8.4 fresquinho, adicione o PPA do Ondřej, mantenedor histórico dos pacotes PHP:"}),e.jsx(o,{user:"dev",host:"ubuntu",cwd:"~",command:"sudo add-apt-repository ppa:ondrej/php && sudo apt update",output:`Adding PPA: ppa:ondrej/php
Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease
Get:2 https://ppa.launchpadcontent.net/ondrej/php/ubuntu noble InRelease
Reading package lists... Done`}),e.jsx(o,{user:"dev",host:"ubuntu",cwd:"~",command:"sudo apt install -y php8.4 php8.4-cli php8.4-mbstring php8.4-xml php8.4-curl php8.4-mysql php8.4-pgsql",output:`Setting up php8.4-cli (8.4.1-1+ubuntu24.04.1) ...
Setting up php8.4 (8.4.1-1+ubuntu24.04.1) ...
update-alternatives: using /usr/bin/php8.4 to provide /usr/bin/php (php) in auto mode`}),e.jsx("h3",{children:"Fedora / RHEL — DNF + Remi"}),e.jsx(o,{user:"dev",host:"fedora",cwd:"~",command:"sudo dnf install -y https://rpms.remirepo.net/fedora/remi-release-41.rpm",output:`Last metadata expiration check: ...
Installed: remi-release-41-1.fc41.remi.noarch`}),e.jsx(o,{user:"dev",host:"fedora",cwd:"~",command:"sudo dnf module reset php && sudo dnf module install -y php:remi-8.4",output:`Installing: php8.4
Installing: php-cli, php-common, php-mbstring, php-xml, php-pdo
Complete!`}),e.jsx("h3",{children:"Arch Linux — sempre na última"}),e.jsx(o,{user:"dev",host:"arch",cwd:"~",command:"sudo pacman -S php php-pgsql php-gd",output:`resolving dependencies...
Packages (3) php-8.4.1-1  php-pgsql-8.4.1-1  php-gd-8.4.1-1

Total Download Size:   12.45 MiB
:: Proceed with installation? [Y/n] Y`}),e.jsxs(a,{type:"info",title:"Arch é diferente das outras distros",children:["No Arch, as ",e.jsx("em",{children:"extensões"})," vêm como pacotes separados (",e.jsx("code",{children:"php-pgsql"}),", ",e.jsx("code",{children:"php-gd"}),",",e.jsx("code",{children:"php-imagick"}),") e você precisa habilitá-las descomentando linhas em",e.jsx("code",{children:"/etc/php/php.ini"})," (procure por ",e.jsx("code",{children:";extension=pdo_pgsql"}),")."]}),e.jsx("h2",{children:"macOS — Homebrew sem dor"}),e.jsxs("p",{children:["No macOS, o caminho civilizado é o ",e.jsx("a",{href:"https://brew.sh",children:e.jsx("code",{children:"brew"})}),":"]}),e.jsx(o,{user:"dev",host:"mac",cwd:"~",command:"brew install php",output:`==> Downloading https://ghcr.io/v2/homebrew/core/php/manifests/8.4.1
==> Pouring php-8.4.1.arm64_sequoia.bottle.tar.gz
==> Caveats
To start php now and restart at login:
  brew services start php
==> Summary
🍺  /opt/homebrew/Cellar/php/8.4.1: 525 files, 86MB`}),e.jsx("p",{children:"Para uma versão específica:"}),e.jsx(o,{user:"dev",host:"mac",cwd:"~",command:"brew install php@8.3 && brew link --overwrite --force php@8.3",output:`==> Pouring php@8.3-8.3.14.arm64_sequoia.bottle.tar.gz
Linking /opt/homebrew/Cellar/php@8.3/8.3.14... 25 symlinks created`}),e.jsx("h2",{children:"Windows — três caminhos"}),e.jsx("p",{children:"Em ordem de recomendação:"}),e.jsx("h3",{children:"1) WSL2 (Windows Subsystem for Linux) — o melhor"}),e.jsx("p",{children:"Abra o PowerShell como administrador e instale o Ubuntu dentro do Windows:"}),e.jsx(o,{user:"dev",host:"windows",cwd:"C:\\\\Users\\\\dev",command:"wsl --install -d Ubuntu-24.04",output:`Installing: Ubuntu 24.04 LTS
Ubuntu 24.04 LTS has been installed.
Launching Ubuntu 24.04 LTS...`}),e.jsx("p",{children:"Depois disso, dentro do Ubuntu, é o mesmo passo da seção Ubuntu acima. Esta é a forma usada por 90% dos devs PHP profissionais que precisam estar no Windows."}),e.jsx("h3",{children:"2) XAMPP — pacote Apache + PHP + MariaDB"}),e.jsxs("p",{children:["Baixe em ",e.jsx("code",{children:"apachefriends.org"}),". Instala Apache, PHP e MariaDB num único clique. Depois adicione ",e.jsx("code",{children:"C:\\xampp\\php"})," ao ",e.jsx("strong",{children:"PATH"}),":"]}),e.jsx(i,{title:"PowerShell",language:"powershell",code:`$env:Path += ";C:\\xampp\\php"
[Environment]::SetEnvironmentVariable("Path", $env:Path, "User")`}),e.jsx("h3",{children:"3) Instalador oficial (php.net/downloads)"}),e.jsxs("p",{children:["Baixe o ",e.jsx("em",{children:"Windows Thread Safe"})," (para Apache) ou ",e.jsx("em",{children:"Non Thread Safe"})," (para CLI/Nginx), extraia em ",e.jsx("code",{children:"C:\\php"}),", copie ",e.jsx("code",{children:"php.ini-development"})," para ",e.jsx("code",{children:"php.ini"}),", e adicione ao PATH."]}),e.jsx("h2",{children:"Conferindo a instalação"}),e.jsx(o,{user:"dev",host:"php",cwd:"~",command:"php -v",output:`PHP 8.4.1 (cli) (built: Nov 19 2024 18:02:10) (NTS)
Copyright (c) The PHP Group
Zend Engine v4.4.1, Copyright (c) Zend Technologies
    with Zend OPcache v8.4.1`}),e.jsx("p",{children:"Rode também o seu primeiro script:"}),e.jsx(r,{filename:"ola.php",code:`<?php
declare(strict_types=1);

$linguagem = 'PHP';
$versao = PHP_VERSION;

echo "Olá, $linguagem $versao rodando em " . PHP_OS . PHP_EOL;
echo "Memória limite: " . ini_get('memory_limit') . PHP_EOL;
echo "Diretório atual: " . __DIR__ . PHP_EOL;`,output:`Olá, PHP 8.4.1 rodando em Linux
Memória limite: 128M
Diretório atual: /home/dev/projetos`}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos",command:"php ola.php",output:`Olá, PHP 8.4.1 rodando em Linux
Memória limite: 128M
Diretório atual: /home/dev/projetos`}),e.jsx("h2",{children:"Extensões: o pão e a manteiga"}),e.jsxs("p",{children:["O PHP “puro” faz pouca coisa. As ",e.jsx("strong",{children:"extensões"})," dão poderes ao interpretador. Veja o que está ativo:"]}),e.jsx(o,{user:"dev",host:"php",cwd:"~",command:"php -m",output:`[PHP Modules]
Core
ctype
curl
date
dom
fileinfo
filter
hash
iconv
json
libxml
mbstring
openssl
pcre
PDO
pdo_mysql
pdo_pgsql
Phar
Reflection
session
SimpleXML
SPL
tokenizer
xml
xmlreader
xmlwriter
zip
zlib

[Zend Modules]
Zend OPcache`}),e.jsx("p",{children:"As extensões que você quase sempre vai querer instaladas:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"mbstring"})," — manipulação de strings UTF-8."]}),e.jsxs("li",{children:[e.jsx("code",{children:"curl"})," — HTTP client (Guzzle depende disso)."]}),e.jsxs("li",{children:[e.jsx("code",{children:"pdo_mysql"})," ou ",e.jsx("code",{children:"pdo_pgsql"})," — banco de dados."]}),e.jsxs("li",{children:[e.jsx("code",{children:"xml"})," e ",e.jsx("code",{children:"dom"})," — parser XML/HTML."]}),e.jsxs("li",{children:[e.jsx("code",{children:"gd"})," ou ",e.jsx("code",{children:"imagick"})," — manipulação de imagens."]}),e.jsxs("li",{children:[e.jsx("code",{children:"zip"})," — empacotamento (Composer usa)."]}),e.jsxs("li",{children:[e.jsx("code",{children:"opcache"})," — cache de bytecode (essencial para produção)."]}),e.jsxs("li",{children:[e.jsx("code",{children:"intl"})," — internacionalização (datas, formatação)."]})]}),e.jsx("p",{children:"Instalando uma extensão extra no Ubuntu:"}),e.jsx(o,{user:"dev",host:"ubuntu",cwd:"~",command:"sudo apt install -y php8.4-intl php8.4-gd php8.4-redis",output:`Setting up php8.4-intl (8.4.1-1+ubuntu24.04.1) ...
Setting up php8.4-gd (8.4.1-1+ubuntu24.04.1) ...
Setting up php8.4-redis (6.1.0+1.0.0-1+ubuntu24.04.1) ...`}),e.jsx(r,{filename:"intl.php",code:`<?php
declare(strict_types=1);

$fmt = new NumberFormatter('pt_BR', NumberFormatter::CURRENCY);
echo $fmt->format(1599.90) . PHP_EOL;

$data = new DateTimeImmutable('2026-01-15 10:00');
$dataFmt = IntlDateFormatter::create(
    'pt_BR',
    IntlDateFormatter::FULL,
    IntlDateFormatter::SHORT,
);
echo $dataFmt->format($data);`,output:`R$ 1.599,90
quinta-feira, 15 de janeiro de 2026 10:00`}),e.jsx("h2",{children:"Onde está o php.ini?"}),e.jsx("p",{children:"O arquivo de configuração principal. Para descobrir onde ele vive na sua máquina:"}),e.jsx(o,{user:"dev",host:"php",cwd:"~",command:"php --ini",output:`Configuration File (php.ini) Path: /etc/php/8.4/cli
Loaded Configuration File:         /etc/php/8.4/cli/php.ini
Scan for additional .ini files in: /etc/php/8.4/cli/conf.d
Additional .ini files parsed:      /etc/php/8.4/cli/conf.d/10-mysqlnd.ini,
                                   /etc/php/8.4/cli/conf.d/10-opcache.ini`}),e.jsx("p",{children:"Settings que você quase sempre vai querer ajustar para desenvolvimento:"}),e.jsx(i,{title:"/etc/php/8.4/cli/conf.d/99-dev.ini",language:"ini",code:`memory_limit = 512M
upload_max_filesize = 64M
post_max_size = 64M
display_errors = On
error_reporting = E_ALL
date.timezone = America/Sao_Paulo

; OPcache liberal para dev
opcache.enable = 1
opcache.enable_cli = 1
opcache.validate_timestamps = 1
opcache.revalidate_freq = 0`}),e.jsxs(a,{type:"warning",title:"display_errors em produção: NUNCA",children:["Em produção, ",e.jsx("strong",{children:"desligue"})," ",e.jsx("code",{children:"display_errors"})," e mande tudo para log:",e.jsx("code",{children:"display_errors = Off"})," + ",e.jsx("code",{children:"log_errors = On"})," + ",e.jsx("code",{children:"error_log = /var/log/php/error.log"}),". Vazar stack trace para o navegador é falha de segurança."]}),e.jsx("h2",{children:"Plano B universal: Docker"}),e.jsx("p",{children:"Se você não quer instalar nada na máquina (ou quer congelar a versão por projeto), use a imagem oficial. Funciona idêntico em Linux, macOS e Windows:"}),e.jsx(o,{user:"dev",host:"docker",cwd:"~/projeto",command:"docker run --rm -it -v $PWD:/app -w /app php:8.4-cli php -v",output:`Unable to find image 'php:8.4-cli' locally
8.4-cli: Pulling from library/php
Status: Downloaded newer image for php:8.4-cli
PHP 8.4.1 (cli) (built: Nov 19 2024)
Copyright (c) The PHP Group
Zend Engine v4.4.1`}),e.jsxs("p",{children:["Para um setup recorrente, um ",e.jsx("code",{children:"Dockerfile"})," simples:"]}),e.jsx(i,{title:"Dockerfile",language:"dockerfile",code:`FROM php:8.4-cli-alpine

RUN apk add --no-cache git unzip libpq-dev icu-dev \\
 && docker-php-ext-install pdo_pgsql intl opcache

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]`}),e.jsx(o,{user:"dev",host:"docker",cwd:"~/projeto",command:"docker build -t meu-app . && docker run -p 8000:8000 meu-app",output:`Successfully built b0a9c1ff0011
Successfully tagged meu-app:latest
[Wed Jan 15 10:00:00 2026] PHP 8.4.1 Development Server (http://0.0.0.0:8000) started`}),e.jsx("h2",{children:"Recapitulando"}),e.jsxs("ol",{children:[e.jsxs("li",{children:["Linux/Ubuntu: ",e.jsx("code",{children:"apt install php8.4"})," (com PPA do Ondřej)."]}),e.jsxs("li",{children:["macOS: ",e.jsx("code",{children:"brew install php"}),"."]}),e.jsx("li",{children:"Windows: WSL2 + Ubuntu (recomendado), ou XAMPP."}),e.jsxs("li",{children:["Confira com ",e.jsx("code",{children:"php -v"})," e rode ",e.jsx("code",{children:"php arquivo.php"}),"."]}),e.jsxs("li",{children:["Instale extensões com ",e.jsx("code",{children:"php8.4-NOME"}),"."]}),e.jsxs("li",{children:["Em caso de dúvida, Docker: ",e.jsx("code",{children:"docker run --rm php:8.4-cli"}),"."]})]}),e.jsxs("p",{children:["Próximo capítulo: ",e.jsx("strong",{children:"PHP na linha de comando"})," — onde você vai descobrir que ",e.jsx("code",{children:"php"})," ","é também uma calculadora, REPL e canivete suíço."]})]})}export{c as default};
