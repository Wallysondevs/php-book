import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Instalacao() {
  return (
    <PageContainer
      title="Instalando PHP"
      subtitle="Como instalar PHP 8.4 em Linux (apt/dnf/pacman), macOS (brew) e Windows. Conferindo a instalação, ativando extensões essenciais e Docker como plano B universal."
      difficulty="iniciante"
      timeToRead="12 min"
      category="Instalação"
    >
      <AlertBox type="info" title="Pré-requisitos">
          <p>Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP.</p>
        </AlertBox>
        <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"Linux"}</strong> {' — '} {"apt install php8.3-fpm + extensões (mbstring, xml, curl)."}
          </li>
        <li>
            <strong>{"macOS"}</strong> {' — '} {"brew install php; ou Herd."}
          </li>
        <li>
            <strong>{"Windows"}</strong> {' — '} {"XAMPP, Laragon ou php.exe + IIS."}
          </li>
        <li>
            <strong>{"Docker"}</strong> {' — '} {"php:8.3-fpm-alpine + composer:2."}
          </li>
        <li>
            <strong>{"php -v / php -m"}</strong> {' — '} {"verifica versão e módulos."}
          </li>
        </ul>
          <h2>O objetivo: <code>php -v</code> imprimindo 8.4</h2>
      <p>
        Você terminou este capítulo quando conseguir abrir um terminal e ver algo como:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command="php -v"
        output={`PHP 8.4.1 (cli) (built: Nov 19 2024 18:02:10) (NTS)
Copyright (c) The PHP Group
Zend Engine v4.4.1, Copyright (c) Zend Technologies
    with Zend OPcache v8.4.1, Copyright (c), by Zend Technologies`}
      />

      <p>Vamos chegar lá em qualquer sistema operacional.</p>

      <h2>Linux: o caminho mais reto</h2>

      <h3>Ubuntu / Debian — repositório do Ondřej Surý</h3>
      <p>
        O repositório oficial do Ubuntu costuma ficar uma versão atrás. Para PHP 8.4 fresquinho,
        adicione o PPA do Ondřej, mantenedor histórico dos pacotes PHP:
      </p>

      <TerminalBlock
        user="dev"
        host="ubuntu"
        cwd="~"
        command="sudo add-apt-repository ppa:ondrej/php && sudo apt update"
        output={`Adding PPA: ppa:ondrej/php
Hit:1 http://archive.ubuntu.com/ubuntu noble InRelease
Get:2 https://ppa.launchpadcontent.net/ondrej/php/ubuntu noble InRelease
Reading package lists... Done`}
      />

      <TerminalBlock
        user="dev"
        host="ubuntu"
        cwd="~"
        command="sudo apt install -y php8.4 php8.4-cli php8.4-mbstring php8.4-xml php8.4-curl php8.4-mysql php8.4-pgsql"
        output={`Setting up php8.4-cli (8.4.1-1+ubuntu24.04.1) ...
Setting up php8.4 (8.4.1-1+ubuntu24.04.1) ...
update-alternatives: using /usr/bin/php8.4 to provide /usr/bin/php (php) in auto mode`}
      />

      <h3>Fedora / RHEL — DNF + Remi</h3>
      <TerminalBlock
        user="dev"
        host="fedora"
        cwd="~"
        command="sudo dnf install -y https://rpms.remirepo.net/fedora/remi-release-41.rpm"
        output={`Last metadata expiration check: ...
Installed: remi-release-41-1.fc41.remi.noarch`}
      />

      <TerminalBlock
        user="dev"
        host="fedora"
        cwd="~"
        command="sudo dnf module reset php && sudo dnf module install -y php:remi-8.4"
        output={`Installing: php8.4
Installing: php-cli, php-common, php-mbstring, php-xml, php-pdo
Complete!`}
      />

      <h3>Arch Linux — sempre na última</h3>
      <TerminalBlock
        user="dev"
        host="arch"
        cwd="~"
        command="sudo pacman -S php php-pgsql php-gd"
        output={`resolving dependencies...
Packages (3) php-8.4.1-1  php-pgsql-8.4.1-1  php-gd-8.4.1-1

Total Download Size:   12.45 MiB
:: Proceed with installation? [Y/n] Y`}
      />

      <AlertBox type="info" title="Arch é diferente das outras distros">
        No Arch, as <em>extensões</em> vêm como pacotes separados (<code>php-pgsql</code>, <code>php-gd</code>,
        <code>php-imagick</code>) e você precisa habilitá-las descomentando linhas em
        <code>/etc/php/php.ini</code> (procure por <code>;extension=pdo_pgsql</code>).
      </AlertBox>

      <h2>macOS — Homebrew sem dor</h2>
      <p>
        No macOS, o caminho civilizado é o <a href="https://brew.sh"><code>brew</code></a>:
      </p>

      <TerminalBlock
        user="dev"
        host="mac"
        cwd="~"
        command="brew install php"
        output={`==> Downloading https://ghcr.io/v2/homebrew/core/php/manifests/8.4.1
==> Pouring php-8.4.1.arm64_sequoia.bottle.tar.gz
==> Caveats
To start php now and restart at login:
  brew services start php
==> Summary
🍺  /opt/homebrew/Cellar/php/8.4.1: 525 files, 86MB`}
      />

      <p>Para uma versão específica:</p>

      <TerminalBlock
        user="dev"
        host="mac"
        cwd="~"
        command="brew install php@8.3 && brew link --overwrite --force php@8.3"
        output={`==> Pouring php@8.3-8.3.14.arm64_sequoia.bottle.tar.gz
Linking /opt/homebrew/Cellar/php@8.3/8.3.14... 25 symlinks created`}
      />

      <h2>Windows — três caminhos</h2>
      <p>Em ordem de recomendação:</p>

      <h3>1) WSL2 (Windows Subsystem for Linux) — o melhor</h3>
      <p>
        Abra o PowerShell como administrador e instale o Ubuntu dentro do Windows:
      </p>

      <TerminalBlock
        user="dev"
        host="windows"
        cwd="C:\\Users\\dev"
        command="wsl --install -d Ubuntu-24.04"
        output={`Installing: Ubuntu 24.04 LTS
Ubuntu 24.04 LTS has been installed.
Launching Ubuntu 24.04 LTS...`}
      />

      <p>
        Depois disso, dentro do Ubuntu, é o mesmo passo da seção Ubuntu acima. Esta é a forma usada
        por 90% dos devs PHP profissionais que precisam estar no Windows.
      </p>

      <h3>2) XAMPP — pacote Apache + PHP + MariaDB</h3>
      <p>
        Baixe em <code>apachefriends.org</code>. Instala Apache, PHP e MariaDB num único clique.
        Depois adicione <code>C:\xampp\php</code> ao <strong>PATH</strong>:
      </p>

      <CodeBlock
        title="PowerShell"
        language="powershell"
        code={`$env:Path += ";C:\\xampp\\php"
[Environment]::SetEnvironmentVariable("Path", $env:Path, "User")`}
      />

      <h3>3) Instalador oficial (php.net/downloads)</h3>
      <p>
        Baixe o <em>Windows Thread Safe</em> (para Apache) ou <em>Non Thread Safe</em> (para CLI/Nginx),
        extraia em <code>C:\php</code>, copie <code>php.ini-development</code> para <code>php.ini</code>,
        e adicione ao PATH.
      </p>

      <h2>Conferindo a instalação</h2>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command="php -v"
        output={`PHP 8.4.1 (cli) (built: Nov 19 2024 18:02:10) (NTS)
Copyright (c) The PHP Group
Zend Engine v4.4.1, Copyright (c) Zend Technologies
    with Zend OPcache v8.4.1`}
      />

      <p>Rode também o seu primeiro script:</p>

      <PhpBlock
        filename="ola.php"
        code={`<?php
declare(strict_types=1);

$linguagem = 'PHP';
$versao = PHP_VERSION;

echo "Olá, $linguagem $versao rodando em " . PHP_OS . PHP_EOL;
echo "Memória limite: " . ini_get('memory_limit') . PHP_EOL;
echo "Diretório atual: " . __DIR__ . PHP_EOL;`}
        output={`Olá, PHP 8.4.1 rodando em Linux
Memória limite: 128M
Diretório atual: /home/dev/projetos`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos"
        command="php ola.php"
        output={`Olá, PHP 8.4.1 rodando em Linux
Memória limite: 128M
Diretório atual: /home/dev/projetos`}
      />

      <h2>Extensões: o pão e a manteiga</h2>
      <p>
        O PHP “puro” faz pouca coisa. As <strong>extensões</strong> dão poderes ao interpretador.
        Veja o que está ativo:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command="php -m"
        output={`[PHP Modules]
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
Zend OPcache`}
      />

      <p>
        As extensões que você quase sempre vai querer instaladas:
      </p>
      <ul>
        <li><code>mbstring</code> — manipulação de strings UTF-8.</li>
        <li><code>curl</code> — HTTP client (Guzzle depende disso).</li>
        <li><code>pdo_mysql</code> ou <code>pdo_pgsql</code> — banco de dados.</li>
        <li><code>xml</code> e <code>dom</code> — parser XML/HTML.</li>
        <li><code>gd</code> ou <code>imagick</code> — manipulação de imagens.</li>
        <li><code>zip</code> — empacotamento (Composer usa).</li>
        <li><code>opcache</code> — cache de bytecode (essencial para produção).</li>
        <li><code>intl</code> — internacionalização (datas, formatação).</li>
      </ul>

      <p>Instalando uma extensão extra no Ubuntu:</p>

      <TerminalBlock
        user="dev"
        host="ubuntu"
        cwd="~"
        command="sudo apt install -y php8.4-intl php8.4-gd php8.4-redis"
        output={`Setting up php8.4-intl (8.4.1-1+ubuntu24.04.1) ...
Setting up php8.4-gd (8.4.1-1+ubuntu24.04.1) ...
Setting up php8.4-redis (6.1.0+1.0.0-1+ubuntu24.04.1) ...`}
      />

      <PhpBlock
        filename="intl.php"
        code={`<?php
declare(strict_types=1);

$fmt = new NumberFormatter('pt_BR', NumberFormatter::CURRENCY);
echo $fmt->format(1599.90) . PHP_EOL;

$data = new DateTimeImmutable('2026-01-15 10:00');
$dataFmt = IntlDateFormatter::create(
    'pt_BR',
    IntlDateFormatter::FULL,
    IntlDateFormatter::SHORT,
);
echo $dataFmt->format($data);`}
        output={`R$ 1.599,90
quinta-feira, 15 de janeiro de 2026 10:00`}
      />

      <h2>Onde está o php.ini?</h2>
      <p>O arquivo de configuração principal. Para descobrir onde ele vive na sua máquina:</p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command="php --ini"
        output={`Configuration File (php.ini) Path: /etc/php/8.4/cli
Loaded Configuration File:         /etc/php/8.4/cli/php.ini
Scan for additional .ini files in: /etc/php/8.4/cli/conf.d
Additional .ini files parsed:      /etc/php/8.4/cli/conf.d/10-mysqlnd.ini,
                                   /etc/php/8.4/cli/conf.d/10-opcache.ini`}
      />

      <p>Settings que você quase sempre vai querer ajustar para desenvolvimento:</p>

      <CodeBlock
        title="/etc/php/8.4/cli/conf.d/99-dev.ini"
        language="ini"
        code={`memory_limit = 512M
upload_max_filesize = 64M
post_max_size = 64M
display_errors = On
error_reporting = E_ALL
date.timezone = America/Sao_Paulo

; OPcache liberal para dev
opcache.enable = 1
opcache.enable_cli = 1
opcache.validate_timestamps = 1
opcache.revalidate_freq = 0`}
      />

      <AlertBox type="warning" title="display_errors em produção: NUNCA">
        Em produção, <strong>desligue</strong> <code>display_errors</code> e mande tudo para log:
        <code>display_errors = Off</code> + <code>log_errors = On</code> + <code>error_log = /var/log/php/error.log</code>.
        Vazar stack trace para o navegador é falha de segurança.
      </AlertBox>

      <h2>Plano B universal: Docker</h2>
      <p>
        Se você não quer instalar nada na máquina (ou quer congelar a versão por projeto), use a
        imagem oficial. Funciona idêntico em Linux, macOS e Windows:
      </p>

      <TerminalBlock
        user="dev"
        host="docker"
        cwd="~/projeto"
        command="docker run --rm -it -v $PWD:/app -w /app php:8.4-cli php -v"
        output={`Unable to find image 'php:8.4-cli' locally
8.4-cli: Pulling from library/php
Status: Downloaded newer image for php:8.4-cli
PHP 8.4.1 (cli) (built: Nov 19 2024)
Copyright (c) The PHP Group
Zend Engine v4.4.1`}
      />

      <p>
        Para um setup recorrente, um <code>Dockerfile</code> simples:
      </p>

      <CodeBlock
        title="Dockerfile"
        language="dockerfile"
        code={`FROM php:8.4-cli-alpine

RUN apk add --no-cache git unzip libpq-dev icu-dev \\
 && docker-php-ext-install pdo_pgsql intl opcache

COPY --from=composer:2 /usr/bin/composer /usr/bin/composer

WORKDIR /app
CMD ["php", "-S", "0.0.0.0:8000", "-t", "public"]`}
      />

      <TerminalBlock
        user="dev"
        host="docker"
        cwd="~/projeto"
        command="docker build -t meu-app . && docker run -p 8000:8000 meu-app"
        output={`Successfully built b0a9c1ff0011
Successfully tagged meu-app:latest
[Wed Jan 15 10:00:00 2026] PHP 8.4.1 Development Server (http://0.0.0.0:8000) started`}
      />

      <h2>Recapitulando</h2>
      <ol>
        <li>Linux/Ubuntu: <code>apt install php8.4</code> (com PPA do Ondřej).</li>
        <li>macOS: <code>brew install php</code>.</li>
        <li>Windows: WSL2 + Ubuntu (recomendado), ou XAMPP.</li>
        <li>Confira com <code>php -v</code> e rode <code>php arquivo.php</code>.</li>
        <li>Instale extensões com <code>php8.4-NOME</code>.</li>
        <li>Em caso de dúvida, Docker: <code>docker run --rm php:8.4-cli</code>.</li>
      </ol>

      <p>
        Próximo capítulo: <strong>PHP na linha de comando</strong> — onde você vai descobrir que <code>php</code>{" "}
        é também uma calculadora, REPL e canivete suíço.
      </p>
    </PageContainer>
  );
}
