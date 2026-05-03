import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Docker() {
  return (
    <PageContainer
      title="Docker para PHP"
      subtitle="Imagem leve com php:8.4-fpm-alpine, multi-stage build com Composer, e um docker-compose.yml com FPM + Nginx + MySQL prontos para subir em qualquer máquina."
      difficulty="avancado"
      timeToRead="14 min"
      category="Deploy"
    >
      <AlertBox type="info" title="Pré-requisitos">
          <p>Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP.</p>
        </AlertBox>
        <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"Dockerfile"}</strong> {' — '} {"receita: FROM, RUN, COPY, ENTRYPOINT."}
          </li>
        <li>
            <strong>{"php:8.3-fpm-alpine"}</strong> {' — '} {"imagem base comum para web."}
          </li>
        <li>
            <strong>{"Multi-stage"}</strong> {' — '} {"build em uma stage, runtime em outra menor."}
          </li>
        <li>
            <strong>{"docker-compose.yml"}</strong> {' — '} {"orquestra app + db + redis em dev."}
          </li>
        <li>
            <strong>{"Volumes"}</strong> {' — '} {"monta código sem rebuild em dev."}
          </li>
        </ul>
          <h2>Por que Docker para PHP?</h2>
      <p>
        “Funciona na minha máquina” acabou virando meme por motivo. Versão de PHP, extensões
        instaladas, versão do MySQL, configuração do Nginx — qualquer divergência entre dev e
        produção vira bug em produção. Docker resolve isso entregando o ambiente <strong>inteiro</strong>{" "}
        como artefato versionado.
      </p>

      <AlertBox type="info" title="Imagens oficiais do PHP">
        O time do PHP mantém imagens em <code>hub.docker.com/_/php</code>. As variantes que mais
        importam:
        <ul className="list-disc ml-5 mt-1 space-y-1">
          <li><code>php:8.4-fpm-alpine</code> — minúscula (~30MB), ótima para FPM atrás do Nginx.</li>
          <li><code>php:8.4-cli-alpine</code> — para workers, jobs e scripts.</li>
          <li><code>php:8.4-apache</code> — para quem ainda usa <code>mod_php</code> em legados.</li>
        </ul>
      </AlertBox>

      <h2>Um Dockerfile mínimo (mas correto)</h2>
      <p>
        Vamos começar com uma versão simples e ir refatorando. Esta já é melhor que 80% dos
        Dockerfiles que circulam por aí: instala apenas as extensões necessárias, com cache de
        build.
      </p>

      <CodeBlock
        title="Dockerfile"
        language="dockerfile"
        code={`FROM php:8.4-fpm-alpine

# Dependências de build (removidas no fim) + runtime
RUN apk add --no-cache \\
        icu-dev \\
        oniguruma-dev \\
        libzip-dev \\
        zlib-dev \\
    && docker-php-ext-install -j$(nproc) \\
        pdo_mysql \\
        opcache \\
        intl \\
        mbstring \\
        zip \\
        bcmath

# OPcache em modo produção
COPY docker/opcache.ini /usr/local/etc/php/conf.d/opcache.ini

# Composer (copiado da imagem oficial)
COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer

WORKDIR /var/www/html

EXPOSE 9000
CMD ["php-fpm"]`}
      />

      <PhpBlock
        filename="docker/opcache.ini"
        language="ini"
        code={`opcache.enable=1
opcache.enable_cli=0
opcache.memory_consumption=256
opcache.interned_strings_buffer=16
opcache.max_accelerated_files=20000
opcache.validate_timestamps=0
opcache.save_comments=1
opcache.fast_shutdown=1
opcache.preload=/var/www/html/preload.php
opcache.preload_user=www-data`}
      />

      <TerminalBlock
        user="dev"
        host="docker"
        cwd="~/loja"
        command="docker build -t loja-php:dev ."
        output={`[+] Building 24.1s (8/8) FINISHED
 => [internal] load build definition from Dockerfile
 => [1/4] FROM docker.io/library/php:8.4-fpm-alpine
 => [2/4] RUN apk add --no-cache icu-dev oniguruma-dev libzip-dev zlib-dev && docker-php-ext-install ...
 => [3/4] COPY docker/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
 => [4/4] COPY --from=composer:2.7 /usr/bin/composer /usr/bin/composer
 => exporting to image
 => => writing image sha256:9f3a... => => naming to docker.io/library/loja-php:dev`}
      />

      <h2>Multi-stage build: imagem final sem o Composer</h2>
      <p>
        A imagem acima ainda carrega o Composer no resultado final — desnecessário para runtime.
        Em produção a gente quer o vendor já instalado e <em>nada mais</em>. Multi-stage build é
        a técnica para isso: um estágio “builder” roda o Composer, e o estágio final só copia o
        diretório <code>vendor/</code>.
      </p>

      <CodeBlock
        title="Dockerfile (multi-stage)"
        language="dockerfile"
        code={`# ===== Stage 1: vendor =====
FROM composer:2.7 AS vendor

WORKDIR /app
COPY composer.json composer.lock ./
RUN composer install \\
        --no-dev \\
        --no-scripts \\
        --no-autoloader \\
        --prefer-dist

COPY . .
RUN composer dump-autoload --optimize --classmap-authoritative --no-dev

# ===== Stage 2: runtime =====
FROM php:8.4-fpm-alpine

RUN apk add --no-cache icu-dev oniguruma-dev libzip-dev \\
    && docker-php-ext-install -j$(nproc) pdo_mysql opcache intl mbstring zip bcmath \\
    && apk del --no-network icu-dev oniguruma-dev libzip-dev

COPY docker/opcache.ini /usr/local/etc/php/conf.d/opcache.ini
COPY docker/www.conf    /usr/local/etc/php-fpm.d/www.conf

WORKDIR /var/www/html
COPY --from=vendor --chown=www-data:www-data /app /var/www/html

USER www-data
EXPOSE 9000

HEALTHCHECK --interval=30s --timeout=3s --retries=3 \\
    CMD php -r "if(!@fsockopen('127.0.0.1', 9000)){exit(1);}"

CMD ["php-fpm"]`}
      />

      <AlertBox type="success" title="Por que isso é melhor">
        <ul className="list-disc ml-5 mt-1 space-y-1">
          <li>O cache do Docker reaproveita a camada do vendor enquanto <code>composer.lock</code> não muda — builds 10x mais rápidos.</li>
          <li>A imagem final não tem Composer, headers de dev (<code>-dev</code> dos pacotes apk), nem ferramentas de build. Menos superfície, menos CVE.</li>
          <li><code>USER www-data</code> evita rodar PHP como root dentro do container (regra básica de segurança).</li>
        </ul>
      </AlertBox>

      <h2>Healthcheck: deixe o orquestrador saber quando o container quebrou</h2>
      <p>
        Sem healthcheck, o Docker considera “saudável” qualquer container cujo processo principal
        ainda está vivo — mesmo que o PHP-FPM esteja travado em deadlock. O bloco
        <code> HEALTHCHECK</code> testa se a porta 9000 aceita conexão a cada 30s.
      </p>

      <PhpBlock
        filename="public/health.php"
        code={`<?php
declare(strict_types=1);

header('Content-Type: application/json');

try {
    $pdo = new PDO(
        sprintf('mysql:host=%s;dbname=%s', getenv('DB_HOST'), getenv('DB_NAME')),
        getenv('DB_USER'),
        getenv('DB_PASS'),
        [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION, PDO::ATTR_TIMEOUT => 2],
    );
    $pdo->query('SELECT 1');

    echo json_encode([
        'status' => 'ok',
        'php'    => PHP_VERSION,
        'time'   => date(DATE_ATOM),
    ]);
} catch (Throwable $e) {
    http_response_code(503);
    echo json_encode(['status' => 'down', 'erro' => $e->getMessage()]);
}`}
        output={`HTTP/1.1 200 OK
Content-Type: application/json

{"status":"ok","php":"8.4.1","time":"2025-01-29T14:22:08+00:00"}`}
      />

      <h2>docker-compose.yml: subindo o stack inteiro</h2>
      <p>
        Em dev, você não quer rodar três <code>docker run</code> separados. O Compose orquestra
        <strong> php-fpm + nginx + mysql</strong> com volumes, rede privada e dependências entre
        serviços.
      </p>

      <CodeBlock
        title="docker-compose.yml"
        language="yaml"
        code={`services:
  app:
    build: .
    image: loja-php:dev
    volumes:
      - ./:/var/www/html:cached
    environment:
      DB_HOST: db
      DB_NAME: loja
      DB_USER: app
      DB_PASS: secret
    depends_on:
      db:
        condition: service_healthy
    networks: [loja]

  nginx:
    image: nginx:1.27-alpine
    ports:
      - "8080:80"
    volumes:
      - ./:/var/www/html:cached
      - ./docker/nginx.conf:/etc/nginx/conf.d/default.conf:ro
    depends_on: [app]
    networks: [loja]

  db:
    image: mysql:8.4
    environment:
      MYSQL_ROOT_PASSWORD: rootsecret
      MYSQL_DATABASE: loja
      MYSQL_USER: app
      MYSQL_PASSWORD: secret
    volumes:
      - db-data:/var/lib/mysql
    healthcheck:
      test: ["CMD", "mysqladmin", "ping", "-h", "localhost"]
      interval: 10s
      timeout: 5s
      retries: 5
    networks: [loja]

volumes:
  db-data:

networks:
  loja:
    driver: bridge`}
      />

      <CodeBlock
        title="docker/nginx.conf"
        language="nginx"
        code={`server {
    listen 80;
    server_name _;
    root /var/www/html/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \\.php$ {
        try_files $uri =404;
        fastcgi_pass app:9000;
        fastcgi_index index.php;
        include fastcgi_params;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
    }
}`}
      />

      <AlertBox type="warning" title="Socket Unix vs TCP em containers">
        Diferente de instalação bare-metal, dentro de containers a comunicação Nginx → FPM é
        feita por <strong>TCP</strong> (<code>app:9000</code>), não por socket Unix. Isso porque
        cada container tem seu próprio filesystem — compartilhar socket exigiria volume extra.
      </AlertBox>

      <h2>Subindo, testando e olhando logs</h2>
      <TerminalBlock
        user="dev"
        host="docker"
        cwd="~/loja"
        command="docker compose up -d --build"
        output={`[+] Running 4/4
 ✔ Network loja_loja  Created
 ✔ Container loja-db-1     Healthy
 ✔ Container loja-app-1    Started
 ✔ Container loja-nginx-1  Started`}
      />

      <TerminalBlock
        user="dev"
        host="docker"
        cwd="~/loja"
        command="docker compose ps"
        output={`NAME            IMAGE              STATUS                   PORTS
loja-app-1      loja-php:dev       Up 12s (healthy)         9000/tcp
loja-db-1       mysql:8.4          Up 22s (healthy)         3306/tcp
loja-nginx-1    nginx:1.27-alpine  Up 11s                   0.0.0.0:8080->80/tcp`}
      />

      <TerminalBlock
        user="dev"
        host="docker"
        cwd="~/loja"
        command="curl -s http://localhost:8080/health.php"
        output={`{"status":"ok","php":"8.4.1","time":"2025-01-29T14:30:11+00:00"}`}
      />

      <h2>Rodando comandos PHP dentro do container</h2>
      <p>
        Composer, migrations, testes — tudo deve rodar <em>dentro</em> do container, com a mesma
        versão de PHP da produção. Nada de instalar PHP no host.
      </p>

      <TerminalBlock
        user="dev"
        host="docker"
        cwd="~/loja"
        command="docker compose exec app composer require monolog/monolog"
        output={`Using version ^3.7 for monolog/monolog
./composer.json has been updated
Running composer update monolog/monolog
Loading composer repositories with package information
Updating dependencies
Lock file operations: 1 install, 0 updates, 0 removals
  - Locking monolog/monolog (3.7.0)`}
      />

      <TerminalBlock
        user="dev"
        host="docker"
        cwd="~/loja"
        command="docker compose exec app vendor/bin/phpunit"
        output={`PHPUnit 11.4.0 by Sebastian Bergmann.

...........................                                       27 / 27 (100%)

Time: 00:00.412, Memory: 14.00 MB
OK (27 tests, 51 assertions)`}
      />

      <h2>Variáveis de ambiente: o jeito 12-Factor</h2>
      <PhpBlock
        filename="src/Config.php"
        code={`<?php
declare(strict_types=1);

namespace App;

final readonly class Config
{
    public function __construct(
        public string $dbHost,
        public string $dbName,
        public string $dbUser,
        public string $dbPass,
        public bool   $debug,
    ) {}

    public static function fromEnv(): self
    {
        return new self(
            dbHost: self::env('DB_HOST'),
            dbName: self::env('DB_NAME'),
            dbUser: self::env('DB_USER'),
            dbPass: self::env('DB_PASS'),
            debug:  filter_var(getenv('APP_DEBUG') ?: 'false', FILTER_VALIDATE_BOOL),
        );
    }

    private static function env(string $key): string
    {
        $v = getenv($key);
        if ($v === false || $v === '') {
            throw new \\RuntimeException("Variável de ambiente $key não definida");
        }
        return $v;
    }
}

$config = Config::fromEnv();
echo "Conectando em {$config->dbHost}/{$config->dbName}" . PHP_EOL;`}
        output={`Conectando em db/loja`}
      />

      <AlertBox type="success" title="Resultado">
        Mesmo Dockerfile, mesmo Compose: você muda o <code>DB_HOST</code> no <code>.env</code> de
        produção e o app aponta para o RDS, sem rebuild de imagem. É a essência do
        <em> 12-Factor App</em>.
      </AlertBox>

      <p>
        No próximo capítulo a gente automatiza tudo isso com <strong>GitHub Actions</strong>:
        rodar testes em PRs, buildar a imagem Docker e fazer deploy quando o merge cair na
        <code> main</code>.
      </p>
    </PageContainer>
  );
}
