import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function CiCd() {
  return (
    <PageContainer
      title="CI/CD com GitHub Actions"
      subtitle="Rodar PHPUnit, PHPStan e PHP-CS-Fixer em toda Pull Request, em três versões de PHP, com cache do Composer — e disparar deploy quando o merge cair na main."
      difficulty="avancado"
      timeToRead="13 min"
      category="Deploy"
    >
      <AlertBox type="info" title="Pré-requisitos">
          <p>Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP.</p>
        </AlertBox>
        <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"CI"}</strong> {' — '} {"Continuous Integration — build + testes a cada push."}
          </li>
        <li>
            <strong>{"CD"}</strong> {' — '} {"Continuous Delivery/Deployment — deploy automático."}
          </li>
        <li>
            <strong>{"GitHub Actions"}</strong> {' — '} {".github/workflows/*.yml define jobs."}
          </li>
        <li>
            <strong>{"Cache"}</strong> {' — '} {"Composer cache acelera muito (~/.composer/cache)."}
          </li>
        <li>
            <strong>{"Matrix"}</strong> {' — '} {"testa em múltiplas versões de PHP em paralelo."}
          </li>
        </ul>
          <h2>O que é CI, e por que GitHub Actions?</h2>
      <p>
        <strong>CI (Continuous Integration)</strong> é um robô que, a cada push, baixa seu código,
        instala as dependências e roda os testes. Se algo quebra, o robô avisa <em>antes</em> do
        seu colega revisar o PR. <strong>CD (Continuous Delivery/Deployment)</strong> é o passo
        seguinte: quando a <code>main</code> está verde, o mesmo robô empacota e publica.
      </p>
      <p>
        GitHub Actions vem grátis para repositórios públicos (e com cota generosa para privados),
        roda direto no GitHub e tem uma action oficial mantida pela comunidade PHP:
        <code> shivammathur/setup-php</code>, com tudo que você precisa.
      </p>

      <AlertBox type="info" title="Anatomia de um workflow">
        Um arquivo <code>.yml</code> dentro de <code>.github/workflows/</code> descreve um <strong>workflow</strong>{" "}
        composto por <strong>jobs</strong> (rodam em paralelo por padrão) e cada job tem
        <strong> steps</strong> (rodam em sequência dentro daquele job).
      </AlertBox>

      <h2>O ci.yml mínimo que já é útil</h2>
      <p>
        Vamos começar com um workflow que faz três coisas: instala o PHP, instala as dependências
        com Composer, e roda o PHPUnit. Já é melhor que muito projeto em produção.
      </p>

      <CodeBlock
        title=".github/workflows/ci.yml"
        language="yaml"
        code={`name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  testes:
    runs-on: ubuntu-24.04
    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.4'
          extensions: mbstring, intl, pdo_mysql, zip, bcmath
          coverage: none

      - name: Instalar dependências
        run: composer install --prefer-dist --no-progress --no-interaction

      - name: Rodar PHPUnit
        run: vendor/bin/phpunit --colors=always`}
      />

      <p>
        Você comita esse arquivo, abre um PR, e em ~40 segundos o GitHub mostra o ✅ ou ❌. Mas a
        gente quer mais: testar em <strong>três versões de PHP</strong>, cachear o Composer e
        rodar análise estática. Bora.
      </p>

      <h2>Matrix: o mesmo job em PHP 8.2, 8.3 e 8.4</h2>
      <p>
        Se sua biblioteca é distribuída, ela precisa funcionar em todas as versões suportadas. Em
        vez de copiar o job três vezes, use <code>strategy.matrix</code>: o GitHub roda o mesmo
        job em paralelo, uma vez para cada combinação.
      </p>

      <CodeBlock
        title=".github/workflows/ci.yml (com matrix + cache)"
        language="yaml"
        code={`name: CI

on:
  push:
    branches: [main]
  pull_request:

jobs:
  testes:
    runs-on: ubuntu-24.04

    strategy:
      fail-fast: false
      matrix:
        php: ['8.2', '8.3', '8.4']

    name: PHP \${{ matrix.php }}

    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP \${{ matrix.php }}
        uses: shivammathur/setup-php@v2
        with:
          php-version: \${{ matrix.php }}
          extensions: mbstring, intl, pdo_mysql, zip, bcmath
          coverage: xdebug
          tools: composer:v2

      - name: Localizar diretório de cache do Composer
        id: composer-cache
        run: echo "dir=$(composer config cache-files-dir)" >> $GITHUB_OUTPUT

      - name: Cachear dependências do Composer
        uses: actions/cache@v4
        with:
          path: \${{ steps.composer-cache.outputs.dir }}
          key: \${{ runner.os }}-composer-\${{ matrix.php }}-\${{ hashFiles('**/composer.lock') }}
          restore-keys: |
            \${{ runner.os }}-composer-\${{ matrix.php }}-

      - name: Instalar dependências
        run: composer install --prefer-dist --no-progress --no-interaction

      - name: PHPStan
        run: vendor/bin/phpstan analyse --no-progress --error-format=github

      - name: PHP-CS-Fixer (dry-run)
        run: vendor/bin/php-cs-fixer fix --dry-run --diff --using-cache=no

      - name: PHPUnit + cobertura
        run: vendor/bin/phpunit --colors=always --coverage-text`}
      />

      <AlertBox type="success" title="Por que esse cache importa">
        A <code>actions/cache@v4</code> reaproveita o tarball do Composer entre runs. Em projetos
        com 100+ pacotes, isso corta o <code>composer install</code> de ~25s para ~3s. A chave
        inclui o hash do <code>composer.lock</code> — se a lock muda, o cache é invalidado
        automaticamente.
      </AlertBox>

      <h2>O composer.json com os scripts certos</h2>
      <p>
        Padronize os comandos no <code>composer.json</code>. Assim, qualquer dev (ou robô) sabe
        que <code>composer test</code> roda a suíte inteira, sem precisar decorar flags.
      </p>

      <CodeBlock
        title="composer.json (trecho)"
        language="json"
        code={`{
    "require": {
        "php": "^8.2",
        "monolog/monolog": "^3.7"
    },
    "require-dev": {
        "phpunit/phpunit": "^11.4",
        "phpstan/phpstan": "^1.12",
        "friendsofphp/php-cs-fixer": "^3.64"
    },
    "autoload":     { "psr-4": { "App\\\\":      "src/" } },
    "autoload-dev": { "psr-4": { "App\\\\Tests\\\\": "tests/" } },
    "scripts": {
        "test":     "phpunit --colors=always",
        "stan":     "phpstan analyse",
        "cs":       "php-cs-fixer fix --dry-run --diff",
        "cs-fix":   "php-cs-fixer fix",
        "ci": [
            "@cs",
            "@stan",
            "@test"
        ]
    }
}`}
      />

      <TerminalBlock
        user="dev"
        host="ci"
        cwd="~/app"
        command="composer ci"
        output={`> @cs
> php-cs-fixer fix --dry-run --diff
Loaded config from ".php-cs-fixer.dist.php".
   1) src/Service/Email.php
> @stan
> phpstan analyse
 [OK] No errors

> @test
> phpunit --colors=always
PHPUnit 11.4.0 by Sebastian Bergmann.
.................................                                 33 / 33 (100%)
OK (33 tests, 71 assertions)`}
      />

      <h2>Um teste de exemplo (para o pipeline ter o que rodar)</h2>
      <PhpBlock
        filename="src/Service/Email.php"
        code={`<?php
declare(strict_types=1);

namespace App\\Service;

final class Email
{
    public function __construct(
        public readonly string $endereco,
    ) {
        if (!filter_var($endereco, FILTER_VALIDATE_EMAIL)) {
            throw new \\InvalidArgumentException("Email inválido: $endereco");
        }
    }

    public function dominio(): string
    {
        return substr($this->endereco, (int) strpos($this->endereco, '@') + 1);
    }
}`}
      />

      <PhpBlock
        filename="tests/Service/EmailTest.php"
        code={`<?php
declare(strict_types=1);

namespace App\\Tests\\Service;

use App\\Service\\Email;
use PHPUnit\\Framework\\Attributes\\Test;
use PHPUnit\\Framework\\TestCase;

final class EmailTest extends TestCase
{
    #[Test]
    public function extrai_o_dominio_corretamente(): void
    {
        $email = new Email('ada@exemplo.com');
        $this->assertSame('exemplo.com', $email->dominio());
    }

    #[Test]
    public function rejeita_email_invalido(): void
    {
        $this->expectException(\\InvalidArgumentException::class);
        new Email('nao-tem-arroba');
    }
}`}
        output={`PHPUnit 11.4.0 by Sebastian Bergmann.

..                                                                  2 / 2 (100%)

Time: 00:00.014, Memory: 6.00 MB
OK (2 tests, 2 assertions)`}
      />

      <h2>Deploy via SSH (jeito clássico)</h2>
      <p>
        Quando o job de teste passa na <code>main</code>, dispare um job de deploy que conecta no
        servidor e faz pull + composer install. Use o segredo <code>SSH_PRIVATE_KEY</code>{" "}
        cadastrado em <em>Settings → Secrets and variables → Actions</em>.
      </p>

      <CodeBlock
        title=".github/workflows/deploy.yml"
        language="yaml"
        code={`name: Deploy

on:
  workflow_run:
    workflows: ['CI']
    types: [completed]
    branches: [main]

jobs:
  deploy:
    if: \${{ github.event.workflow_run.conclusion == 'success' }}
    runs-on: ubuntu-24.04
    environment: production
    steps:
      - uses: actions/checkout@v4

      - name: Configurar chave SSH
        uses: webfactory/ssh-agent@v0.9.0
        with:
          ssh-private-key: \${{ secrets.SSH_PRIVATE_KEY }}

      - name: Adicionar host conhecido
        run: ssh-keyscan -H \${{ secrets.SSH_HOST }} >> ~/.ssh/known_hosts

      - name: Deploy via SSH
        run: |
          ssh \${{ secrets.SSH_USER }}@\${{ secrets.SSH_HOST }} <<'EOF'
            set -e
            cd /var/www/loja
            git pull --ff-only
            composer install --no-dev --optimize-autoloader --classmap-authoritative
            php bin/console cache:clear --env=prod
            sudo systemctl reload php8.4-fpm
          EOF`}
      />

      <h2>Deploy via Docker registry (jeito moderno)</h2>
      <p>
        Para apps containerizados, o fluxo é diferente: o pipeline <strong>buildar a imagem</strong>{" "}
        e <strong>empurra para um registry</strong> (GHCR, Docker Hub, ECR). O servidor só puxa a
        nova tag.
      </p>

      <CodeBlock
        title=".github/workflows/docker.yml"
        language="yaml"
        code={`name: Docker

on:
  push:
    branches: [main]
    tags: ['v*']

jobs:
  build-push:
    runs-on: ubuntu-24.04
    permissions:
      contents: read
      packages: write
    steps:
      - uses: actions/checkout@v4

      - name: Login no GHCR
        uses: docker/login-action@v3
        with:
          registry: ghcr.io
          username: \${{ github.actor }}
          password: \${{ secrets.GITHUB_TOKEN }}

      - name: Metadata
        id: meta
        uses: docker/metadata-action@v5
        with:
          images: ghcr.io/\${{ github.repository }}
          tags: |
            type=ref,event=branch
            type=semver,pattern={{version}}
            type=sha,prefix=

      - name: Build & push
        uses: docker/build-push-action@v6
        with:
          context: .
          push: true
          tags: \${{ steps.meta.outputs.tags }}
          labels: \${{ steps.meta.outputs.labels }}
          cache-from: type=gha
          cache-to: type=gha,mode=max`}
      />

      <TerminalBlock
        user="root"
        host="srv"
        cwd="~"
        command="docker pull ghcr.io/wallyson/loja:main && docker compose up -d"
        output={`main: Pulling from wallyson/loja
Digest: sha256:b9a2... Status: Downloaded newer image
[+] Running 3/3
 ✔ Container loja-app-1    Recreated
 ✔ Container loja-nginx-1  Started
 ✔ Container loja-db-1     Running`}
      />

      <h2>Badge de status no README</h2>
      <p>
        Mostre o status atual do CI no topo do README. Funciona como vitrine de qualidade — e
        chama atenção quando algo quebra.
      </p>

      <CodeBlock
        title="README.md"
        language="bash"
        code={`![CI](https://github.com/wallyson/loja/actions/workflows/ci.yml/badge.svg)
![Coverage](https://img.shields.io/badge/coverage-89%25-brightgreen)
![PHP](https://img.shields.io/badge/PHP-8.4-777BB4?logo=php)`}
      />

      <AlertBox type="warning" title="Segredos: nunca, jamais, em hipótese alguma">
        <ul className="list-disc ml-5 mt-1 space-y-1">
          <li>Não comite credenciais nem em comentário, nem em <code>.env.example</code> com valor real.</li>
          <li>Use <code>secrets.NOME</code> em workflows. Eles aparecem mascarados (<code>***</code>) no log.</li>
          <li>Para PRs de forks, segredos <em>não são expostos</em>: isso é por segurança, e às vezes faz seu workflow falhar de propósito.</li>
        </ul>
      </AlertBox>

      <p>
        Para fechar a trilha de produção, no próximo capítulo você vai conferir o
        <strong> checklist final</strong>: tudo que precisa estar configurado antes de apontar o
        DNS para o servidor novo.
      </p>
    </PageContainer>
  );
}
