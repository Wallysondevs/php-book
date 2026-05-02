import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Producao() {
  return (
    <PageContainer
      title="Checklist de produção"
      subtitle="Tudo que precisa estar certo antes de apontar o DNS para o seu servidor: php.ini hardened, sessões fora do disco, HTTPS, backups, monitoramento e estratégia de rollback."
      difficulty="avancado"
      timeToRead="14 min"
      category="Deploy"
    >
      <h2>O abismo entre dev e produção</h2>
      <p>
        Em desenvolvimento, você quer ver erros gritando na tela. Em produção, mostrar erro para o
        usuário é <strong>vazamento de informação</strong> — caminho de arquivo, query SQL,
        possivelmente até credenciais. Esse capítulo é o checklist final que separa um app
        amador de um app de verdade.
      </p>

      <h2>1. php.ini: a configuração que ninguém revisa</h2>
      <p>
        Todo PHP vem com dois templates: <code>php.ini-development</code> e
        <code> php.ini-production</code>. Em produção, copie o de produção. Mas mesmo ele tem
        ajustes adicionais que você precisa fazer:
      </p>

      <CodeBlock
        title="/etc/php/8.4/fpm/php.ini (trechos críticos)"
        language="ini"
        code={`; ============ Erros ============
display_errors = Off
display_startup_errors = Off
log_errors = On
error_log = /var/log/php/error.log
error_reporting = E_ALL
log_errors_max_len = 4096

; ============ Esconder o PHP ============
expose_php = Off

; ============ Limites ============
memory_limit = 256M
max_execution_time = 30
post_max_size = 20M
upload_max_filesize = 10M
max_input_vars = 2000

; ============ Sessões ============
session.cookie_httponly = 1
session.cookie_secure = 1
session.cookie_samesite = "Lax"
session.use_strict_mode = 1
session.use_only_cookies = 1
session.gc_maxlifetime = 1800

; ============ OPcache (PERFORMANCE) ============
opcache.enable = 1
opcache.memory_consumption = 256
opcache.interned_strings_buffer = 16
opcache.max_accelerated_files = 20000
opcache.validate_timestamps = 0
opcache.revalidate_freq = 0
opcache.fast_shutdown = 1
opcache.save_comments = 1`}
      />

      <AlertBox type="danger" title="O efeito de validate_timestamps = 0">
        Com isso, o OPcache <strong>nunca</strong> verifica se o arquivo <code>.php</code> mudou
        no disco. Ganho de performance enorme, MAS: depois de cada deploy você
        <strong> obrigatoriamente</strong> precisa rodar <code>systemctl reload php8.4-fpm</code>{" "}
        ou <code>opcache_reset()</code>. Senão, o servidor continua servindo a versão antiga.
      </AlertBox>

      <PhpBlock
        filename="public/info.php"
        code={`<?php
declare(strict_types=1);

// Usado uma vez para validar a config — nunca deixe em produção real
header('Content-Type: text/plain; charset=utf-8');

$check = [
    'display_errors'        => ini_get('display_errors'),
    'log_errors'            => ini_get('log_errors'),
    'expose_php'            => ini_get('expose_php'),
    'opcache.enable'        => ini_get('opcache.enable'),
    'opcache.validate_ts'   => ini_get('opcache.validate_timestamps'),
    'session.cookie_secure' => ini_get('session.cookie_secure'),
];

foreach ($check as $k => $v) {
    printf("%-25s = %s\\n", $k, var_export($v, true));
}`}
        output={`display_errors            = '0'
log_errors                = '1'
expose_php                = '0'
opcache.enable            = '1'
opcache.validate_ts       = '0'
session.cookie_secure     = '1'`}
      />

      <h2>2. Não vaze quem você é</h2>
      <p>
        Com <code>expose_php = On</code>, o PHP adiciona um header
        <code> X-Powered-By: PHP/8.4.1</code> em toda resposta. Isso ajuda atacantes a buscar
        CVEs específicas para a sua versão. Desligue.
      </p>

      <TerminalBlock
        user="dev"
        host="srv"
        cwd="~"
        command="curl -I https://loja.com.br | grep -i powered"
        output={`(sem saída — header removido com sucesso)`}
      />

      <p>
        Combine com a remoção do header <code>Server</code> do Nginx (<code>server_tokens off;</code>{" "}
        no <code>nginx.conf</code>) e o atacante perde os dois pivôs principais de fingerprint.
      </p>

      <h2>3. Sessões em Redis, não em disco</h2>
      <p>
        O default de PHP é gravar sessão em arquivos no disco — funciona em servidor único, mas
        morre em qualquer setup com mais de uma instância (load balancer com round-robin manda
        request para outro servidor que não tem o arquivo). A solução é colocar a sessão num
        store compartilhado: <code>Redis</code>.
      </p>

      <TerminalBlock
        user="root"
        host="srv"
        cwd="~"
        command="apt install -y redis-server php8.4-redis && systemctl enable --now redis-server"
        output={`Setting up redis-server (7.4.0) ...
Setting up php8.4-redis (6.1.0) ...`}
      />

      <CodeBlock
        title="/etc/php/8.4/fpm/conf.d/50-session-redis.ini"
        language="ini"
        code={`session.save_handler = redis
session.save_path    = "tcp://127.0.0.1:6379?auth=senhaforte&database=0&timeout=2"`}
      />

      <PhpBlock
        filename="public/login.php"
        code={`<?php
declare(strict_types=1);

session_start();

$_SESSION['user_id']   = 42;
$_SESSION['ultimo_ip'] = $_SERVER['REMOTE_ADDR'] ?? '';
$_SESSION['login_em']  = (new DateTimeImmutable())->format(DATE_ATOM);

echo "Sessão " . session_id() . " gravada no Redis." . PHP_EOL;`}
        output={`Sessão 9b3a2f1e... gravada no Redis.`}
      />

      <TerminalBlock
        user="dev"
        host="srv"
        cwd="~"
        command="redis-cli -a senhaforte KEYS 'PHPREDIS_SESSION:*'"
        output={`1) "PHPREDIS_SESSION:9b3a2f1e7c4d8b6a5e9f2c1d8b7a6e5"
2) "PHPREDIS_SESSION:1a2b3c4d5e6f7081928374a5b6c7d8"`}
      />

      <AlertBox type="success" title="Bônus: invalidar sessão fica trivial">
        Para deslogar um usuário comprometido em todo o cluster, basta um <code>redis-cli DEL</code>{" "}
        da chave dele — não precisa varrer disco em N servidores.
      </AlertBox>

      <h2>4. HTTPS obrigatório (e gratuito)</h2>
      <p>
        Em 2025 não existe desculpa para servir HTTP. Use Let’s Encrypt via Certbot — emite,
        renova e configura o Nginx automaticamente.
      </p>

      <TerminalBlock
        user="root"
        host="srv"
        cwd="~"
        command="certbot --nginx -d loja.com.br -d www.loja.com.br --redirect --hsts"
        output={`Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/loja.com.br/fullchain.pem
Deploying certificate
Successfully deployed certificate for loja.com.br
Redirecting all traffic on port 80 to ssl in /etc/nginx/sites-enabled/loja.conf`}
      />

      <CodeBlock
        title="adicione no server { } HTTPS"
        language="nginx"
        code={`add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
server_tokens off;

ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
ssl_prefer_server_ciphers on;`}
      />

      <h2>5. .env fora do repositório (e fora do webroot)</h2>
      <p>
        O arquivo <code>.env</code> tem credenciais de banco, chaves de API, secrets. Ele
        <strong> nunca</strong> entra no Git e <strong>nunca</strong> fica dentro de
        <code> public/</code>. Coloque um nível acima do webroot.
      </p>

      <PhpBlock
        filename="bootstrap.php"
        code={`<?php
declare(strict_types=1);

use Dotenv\\Dotenv;

require __DIR__ . '/vendor/autoload.php';

// Lê .env de FORA do diretório público
$dotenv = Dotenv::createImmutable(__DIR__);
$dotenv->safeLoad();
$dotenv->required([
    'APP_ENV',
    'DB_HOST',
    'DB_NAME',
    'DB_PASS',
    'REDIS_PASS',
])->notEmpty();

if ($_ENV['APP_ENV'] === 'production' && filter_var($_ENV['APP_DEBUG'] ?? 'false', FILTER_VALIDATE_BOOL)) {
    throw new RuntimeException('APP_DEBUG=true é proibido em produção!');
}`}
      />

      <CodeBlock
        title=".gitignore (mínimo obrigatório)"
        language="bash"
        code={`/.env
/.env.local
/.env.*.local
/vendor/
/node_modules/
/storage/logs/*
!/storage/logs/.gitkeep
*.cache
.phpunit.result.cache
.php-cs-fixer.cache`}
      />

      <h2>6. Backups diários do banco (testados!)</h2>
      <p>
        Backup que nunca foi restaurado <strong>não é backup, é fé</strong>. Configure um cron
        diário e <em>periodicamente</em> teste o restore num servidor de staging.
      </p>

      <CodeBlock
        title="/etc/cron.d/backup-mysql"
        language="bash"
        code={`# Backup full diário às 2h, retenção de 14 dias
0 2 * * * root /usr/local/bin/backup-mysql.sh >> /var/log/backup.log 2>&1`}
      />

      <PhpBlock
        filename="/usr/local/bin/backup-mysql.sh"
        language="bash"
        code={`#!/bin/bash
set -euo pipefail

DEST=/var/backups/mysql
DATE=$(date +%F_%H-%M)
mkdir -p "$DEST"

mysqldump --single-transaction --quick --routines --triggers \\
    --user=backup --password="$MYSQL_BACKUP_PASS" loja \\
    | gzip -9 > "$DEST/loja-$DATE.sql.gz"

# Sobe para S3 e remove backups locais > 14 dias
aws s3 cp "$DEST/loja-$DATE.sql.gz" "s3://backups-loja/db/"
find "$DEST" -name 'loja-*.sql.gz' -mtime +14 -delete

echo "[$DATE] backup ok: $(du -h "$DEST/loja-$DATE.sql.gz" | cut -f1)"`}
      />

      <TerminalBlock
        user="root"
        host="srv"
        cwd="~"
        command="bash /usr/local/bin/backup-mysql.sh"
        output={`upload: ../var/backups/mysql/loja-2025-01-29_02-00.sql.gz to s3://backups-loja/db/loja-2025-01-29_02-00.sql.gz
[2025-01-29_02-00] backup ok: 184M`}
      />

      <h2>7. Monitoramento: você precisa saber antes do usuário</h2>
      <p>
        Um app sem monitor é uma roleta-russa. Use <strong>Sentry</strong> (ou New Relic) para
        capturar exceções não tratadas e métricas de performance. Em PHP é uma instalação Composer
        e três linhas de bootstrap.
      </p>

      <TerminalBlock
        user="dev"
        host="srv"
        cwd="~/app"
        command="composer require sentry/sentry"
        output={`Using version ^4.9 for sentry/sentry
./composer.json has been updated
> Sentry\\Composer\\PluginInstaller::onPostInstall`}
      />

      <PhpBlock
        filename="bootstrap.php (continuação)"
        code={`<?php
declare(strict_types=1);

\\Sentry\\init([
    'dsn'              => $_ENV['SENTRY_DSN'],
    'environment'      => $_ENV['APP_ENV'],
    'release'          => $_ENV['APP_VERSION'] ?? 'unknown',
    'traces_sample_rate' => 0.1,
    'send_default_pii' => false,
]);

set_exception_handler(function (\\Throwable $e): void {
    \\Sentry\\captureException($e);
    http_response_code(500);
    echo json_encode(['erro' => 'Erro interno. Já fomos avisados.']);
});`}
      />

      <PhpBlock
        filename="src/Logger.php"
        code={`<?php
declare(strict_types=1);

namespace App;

use Monolog\\Handler\\RotatingFileHandler;
use Monolog\\Handler\\SyslogHandler;
use Monolog\\Logger as Mono;
use Monolog\\Level;

final class Logger
{
    public static function build(string $canal): Mono {
        $logger = new Mono($canal);
        $logger->pushHandler(new RotatingFileHandler(
            __DIR__ . '/../storage/logs/app.log',
            maxFiles: 14,
            level: Level::Info,
        ));
        $logger->pushHandler(new SyslogHandler('loja', LOG_USER, Level::Warning));
        return $logger;
    }
}

$log = Logger::build('checkout');
$log->info('Pagamento processado', ['pedido' => 1012, 'valor' => 199.90]);`}
        output={`[2025-01-29T14:32:11+00:00] checkout.INFO: Pagamento processado {"pedido":1012,"valor":199.9}`}
      />

      <h2>8. Estratégia de rollback: o reset que salva o emprego</h2>
      <p>
        Quando o deploy quebra produção às 23h numa sexta, você quer <strong>uma linha</strong>{" "}
        para voltar à versão anterior. O padrão atomic-symlink é a forma mais simples de garantir
        isso:
      </p>

      <CodeBlock
        title="estrutura no servidor"
        language="bash"
        code={`/var/www/loja/
├── current -> releases/2025-01-29_14-30/   # symlink que o nginx serve
├── releases/
│   ├── 2025-01-28_09-15/
│   ├── 2025-01-28_18-44/
│   ├── 2025-01-29_14-30/                   # release atual
│   └── 2025-01-29_15-02/                   # release nova, ainda não ativada
└── shared/
    ├── .env
    └── storage/`}
      />

      <TerminalBlock
        user="deploy"
        host="srv"
        cwd="/var/www/loja"
        command="ln -sfn releases/2025-01-29_15-02 current && systemctl reload php8.4-fpm"
        output={`(novo release ativo, OPcache esvaziado, requests em voo terminam no release antigo)`}
      />

      <TerminalBlock
        user="deploy"
        host="srv"
        cwd="/var/www/loja"
        command="ln -sfn releases/2025-01-29_14-30 current && systemctl reload php8.4-fpm"
        output={`(rollback feito em <1s — sem rebuild, sem composer install, sem migration)`}
      />

      <AlertBox type="warning" title="Migrations e rollback">
        O símbolo do rollback é o <em>código</em> voltar; <strong>schema do banco não volta
        automaticamente</strong>. Faça migrations <em>aditivas</em> (nunca <code>DROP COLUMN</code>{" "}
        no mesmo deploy que adiciona) para que rollback de código continue funcionando com o
        schema novo.
      </AlertBox>

      <h2>O checklist final, em uma página</h2>
      <AlertBox type="success" title="Antes de apontar o DNS">
        <ol className="list-decimal ml-5 mt-1 space-y-1">
          <li><code>display_errors=Off</code>, <code>log_errors=On</code>, <code>expose_php=Off</code>.</li>
          <li><code>opcache.enable=1</code>, <code>opcache.validate_timestamps=0</code> + reload no deploy.</li>
          <li>Sessões em Redis (ou outro store compartilhado).</li>
          <li>HTTPS via Let’s Encrypt + HSTS habilitado.</li>
          <li><code>.env</code> fora do <code>public/</code> e fora do Git.</li>
          <li>Backup diário do banco para storage externo (S3, B2) — restore testado.</li>
          <li>Sentry (ou equivalente) capturando exceções não tratadas.</li>
          <li>Monolog gravando em arquivo rotativo + syslog.</li>
          <li>Healthcheck respondendo em <code>/health</code> para o load balancer.</li>
          <li>Deploy atomic-symlink para rollback em &lt;1s.</li>
        </ol>
      </AlertBox>

      <p>
        Esse foi o último capítulo da trilha de Deploy. Você agora tem o suficiente para colocar
        um app PHP <strong>de verdade</strong> no ar — com a mesma cara dos sistemas que servem
        milhões de requests por dia. <code>echo &quot;EOF&quot;;</code>
      </p>
    </PageContainer>
  );
}
