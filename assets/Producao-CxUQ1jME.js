import{j as e}from"./index-Bb4MiiJL.js";import{P as i,A as r,a as s}from"./AlertBox-BpD-xIsb.js";import{T as o}from"./TerminalBlock-DGurMC1r.js";import{C as a}from"./CodeBlock-C3V-qEkN.js";function l(){return e.jsxs(i,{title:"Checklist de produção",subtitle:"Tudo que precisa estar certo antes de apontar o DNS para o seu servidor: php.ini hardened, sessões fora do disco, HTTPS, backups, monitoramento e estratégia de rollback.",difficulty:"avancado",timeToRead:"14 min",category:"Deploy",children:[e.jsx("h2",{children:"O abismo entre dev e produção"}),e.jsxs("p",{children:["Em desenvolvimento, você quer ver erros gritando na tela. Em produção, mostrar erro para o usuário é ",e.jsx("strong",{children:"vazamento de informação"})," — caminho de arquivo, query SQL, possivelmente até credenciais. Esse capítulo é o checklist final que separa um app amador de um app de verdade."]}),e.jsx("h2",{children:"1. php.ini: a configuração que ninguém revisa"}),e.jsxs("p",{children:["Todo PHP vem com dois templates: ",e.jsx("code",{children:"php.ini-development"})," e",e.jsx("code",{children:" php.ini-production"}),". Em produção, copie o de produção. Mas mesmo ele tem ajustes adicionais que você precisa fazer:"]}),e.jsx(a,{title:"/etc/php/8.4/fpm/php.ini (trechos críticos)",language:"ini",code:`; ============ Erros ============
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
opcache.save_comments = 1`}),e.jsxs(r,{type:"danger",title:"O efeito de validate_timestamps = 0",children:["Com isso, o OPcache ",e.jsx("strong",{children:"nunca"})," verifica se o arquivo ",e.jsx("code",{children:".php"})," mudou no disco. Ganho de performance enorme, MAS: depois de cada deploy você",e.jsx("strong",{children:" obrigatoriamente"})," precisa rodar ",e.jsx("code",{children:"systemctl reload php8.4-fpm"})," ","ou ",e.jsx("code",{children:"opcache_reset()"}),". Senão, o servidor continua servindo a versão antiga."]}),e.jsx(s,{filename:"public/info.php",code:`<?php
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
}`,output:`display_errors            = '0'
log_errors                = '1'
expose_php                = '0'
opcache.enable            = '1'
opcache.validate_ts       = '0'
session.cookie_secure     = '1'`}),e.jsx("h2",{children:"2. Não vaze quem você é"}),e.jsxs("p",{children:["Com ",e.jsx("code",{children:"expose_php = On"}),", o PHP adiciona um header",e.jsx("code",{children:" X-Powered-By: PHP/8.4.1"})," em toda resposta. Isso ajuda atacantes a buscar CVEs específicas para a sua versão. Desligue."]}),e.jsx(o,{user:"dev",host:"srv",cwd:"~",command:"curl -I https://loja.com.br | grep -i powered",output:"(sem saída — header removido com sucesso)"}),e.jsxs("p",{children:["Combine com a remoção do header ",e.jsx("code",{children:"Server"})," do Nginx (",e.jsx("code",{children:"server_tokens off;"})," ","no ",e.jsx("code",{children:"nginx.conf"}),") e o atacante perde os dois pivôs principais de fingerprint."]}),e.jsx("h2",{children:"3. Sessões em Redis, não em disco"}),e.jsxs("p",{children:["O default de PHP é gravar sessão em arquivos no disco — funciona em servidor único, mas morre em qualquer setup com mais de uma instância (load balancer com round-robin manda request para outro servidor que não tem o arquivo). A solução é colocar a sessão num store compartilhado: ",e.jsx("code",{children:"Redis"}),"."]}),e.jsx(o,{user:"root",host:"srv",cwd:"~",command:"apt install -y redis-server php8.4-redis && systemctl enable --now redis-server",output:`Setting up redis-server (7.4.0) ...
Setting up php8.4-redis (6.1.0) ...`}),e.jsx(a,{title:"/etc/php/8.4/fpm/conf.d/50-session-redis.ini",language:"ini",code:`session.save_handler = redis
session.save_path    = "tcp://127.0.0.1:6379?auth=senhaforte&database=0&timeout=2"`}),e.jsx(s,{filename:"public/login.php",code:`<?php
declare(strict_types=1);

session_start();

$_SESSION['user_id']   = 42;
$_SESSION['ultimo_ip'] = $_SERVER['REMOTE_ADDR'] ?? '';
$_SESSION['login_em']  = (new DateTimeImmutable())->format(DATE_ATOM);

echo "Sessão " . session_id() . " gravada no Redis." . PHP_EOL;`,output:"Sessão 9b3a2f1e... gravada no Redis."}),e.jsx(o,{user:"dev",host:"srv",cwd:"~",command:"redis-cli -a senhaforte KEYS 'PHPREDIS_SESSION:*'",output:`1) "PHPREDIS_SESSION:9b3a2f1e7c4d8b6a5e9f2c1d8b7a6e5"
2) "PHPREDIS_SESSION:1a2b3c4d5e6f7081928374a5b6c7d8"`}),e.jsxs(r,{type:"success",title:"Bônus: invalidar sessão fica trivial",children:["Para deslogar um usuário comprometido em todo o cluster, basta um ",e.jsx("code",{children:"redis-cli DEL"})," ","da chave dele — não precisa varrer disco em N servidores."]}),e.jsx("h2",{children:"4. HTTPS obrigatório (e gratuito)"}),e.jsx("p",{children:"Em 2025 não existe desculpa para servir HTTP. Use Let’s Encrypt via Certbot — emite, renova e configura o Nginx automaticamente."}),e.jsx(o,{user:"root",host:"srv",cwd:"~",command:"certbot --nginx -d loja.com.br -d www.loja.com.br --redirect --hsts",output:`Successfully received certificate.
Certificate is saved at: /etc/letsencrypt/live/loja.com.br/fullchain.pem
Deploying certificate
Successfully deployed certificate for loja.com.br
Redirecting all traffic on port 80 to ssl in /etc/nginx/sites-enabled/loja.conf`}),e.jsx(a,{title:"adicione no server { } HTTPS",language:"nginx",code:`add_header Strict-Transport-Security "max-age=63072000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "SAMEORIGIN" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
server_tokens off;

ssl_protocols TLSv1.2 TLSv1.3;
ssl_ciphers HIGH:!aNULL:!MD5;
ssl_prefer_server_ciphers on;`}),e.jsx("h2",{children:"5. .env fora do repositório (e fora do webroot)"}),e.jsxs("p",{children:["O arquivo ",e.jsx("code",{children:".env"})," tem credenciais de banco, chaves de API, secrets. Ele",e.jsx("strong",{children:" nunca"})," entra no Git e ",e.jsx("strong",{children:"nunca"})," fica dentro de",e.jsx("code",{children:" public/"}),". Coloque um nível acima do webroot."]}),e.jsx(s,{filename:"bootstrap.php",code:`<?php
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
}`}),e.jsx(a,{title:".gitignore (mínimo obrigatório)",language:"bash",code:`/.env
/.env.local
/.env.*.local
/vendor/
/node_modules/
/storage/logs/*
!/storage/logs/.gitkeep
*.cache
.phpunit.result.cache
.php-cs-fixer.cache`}),e.jsx("h2",{children:"6. Backups diários do banco (testados!)"}),e.jsxs("p",{children:["Backup que nunca foi restaurado ",e.jsx("strong",{children:"não é backup, é fé"}),". Configure um cron diário e ",e.jsx("em",{children:"periodicamente"})," teste o restore num servidor de staging."]}),e.jsx(a,{title:"/etc/cron.d/backup-mysql",language:"bash",code:`# Backup full diário às 2h, retenção de 14 dias
0 2 * * * root /usr/local/bin/backup-mysql.sh >> /var/log/backup.log 2>&1`}),e.jsx(s,{filename:"/usr/local/bin/backup-mysql.sh",language:"bash",code:`#!/bin/bash
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

echo "[$DATE] backup ok: $(du -h "$DEST/loja-$DATE.sql.gz" | cut -f1)"`}),e.jsx(o,{user:"root",host:"srv",cwd:"~",command:"bash /usr/local/bin/backup-mysql.sh",output:`upload: ../var/backups/mysql/loja-2025-01-29_02-00.sql.gz to s3://backups-loja/db/loja-2025-01-29_02-00.sql.gz
[2025-01-29_02-00] backup ok: 184M`}),e.jsx("h2",{children:"7. Monitoramento: você precisa saber antes do usuário"}),e.jsxs("p",{children:["Um app sem monitor é uma roleta-russa. Use ",e.jsx("strong",{children:"Sentry"})," (ou New Relic) para capturar exceções não tratadas e métricas de performance. Em PHP é uma instalação Composer e três linhas de bootstrap."]}),e.jsx(o,{user:"dev",host:"srv",cwd:"~/app",command:"composer require sentry/sentry",output:`Using version ^4.9 for sentry/sentry
./composer.json has been updated
> Sentry\\Composer\\PluginInstaller::onPostInstall`}),e.jsx(s,{filename:"bootstrap.php (continuação)",code:`<?php
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
});`}),e.jsx(s,{filename:"src/Logger.php",code:`<?php
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
$log->info('Pagamento processado', ['pedido' => 1012, 'valor' => 199.90]);`,output:'[2025-01-29T14:32:11+00:00] checkout.INFO: Pagamento processado {"pedido":1012,"valor":199.9}'}),e.jsx("h2",{children:"8. Estratégia de rollback: o reset que salva o emprego"}),e.jsxs("p",{children:["Quando o deploy quebra produção às 23h numa sexta, você quer ",e.jsx("strong",{children:"uma linha"})," ","para voltar à versão anterior. O padrão atomic-symlink é a forma mais simples de garantir isso:"]}),e.jsx(a,{title:"estrutura no servidor",language:"bash",code:`/var/www/loja/
├── current -> releases/2025-01-29_14-30/   # symlink que o nginx serve
├── releases/
│   ├── 2025-01-28_09-15/
│   ├── 2025-01-28_18-44/
│   ├── 2025-01-29_14-30/                   # release atual
│   └── 2025-01-29_15-02/                   # release nova, ainda não ativada
└── shared/
    ├── .env
    └── storage/`}),e.jsx(o,{user:"deploy",host:"srv",cwd:"/var/www/loja",command:"ln -sfn releases/2025-01-29_15-02 current && systemctl reload php8.4-fpm",output:"(novo release ativo, OPcache esvaziado, requests em voo terminam no release antigo)"}),e.jsx(o,{user:"deploy",host:"srv",cwd:"/var/www/loja",command:"ln -sfn releases/2025-01-29_14-30 current && systemctl reload php8.4-fpm",output:"(rollback feito em <1s — sem rebuild, sem composer install, sem migration)"}),e.jsxs(r,{type:"warning",title:"Migrations e rollback",children:["O símbolo do rollback é o ",e.jsx("em",{children:"código"})," voltar; ",e.jsx("strong",{children:"schema do banco não volta automaticamente"}),". Faça migrations ",e.jsx("em",{children:"aditivas"})," (nunca ",e.jsx("code",{children:"DROP COLUMN"})," ","no mesmo deploy que adiciona) para que rollback de código continue funcionando com o schema novo."]}),e.jsx("h2",{children:"O checklist final, em uma página"}),e.jsx(r,{type:"success",title:"Antes de apontar o DNS",children:e.jsxs("ol",{className:"list-decimal ml-5 mt-1 space-y-1",children:[e.jsxs("li",{children:[e.jsx("code",{children:"display_errors=Off"}),", ",e.jsx("code",{children:"log_errors=On"}),", ",e.jsx("code",{children:"expose_php=Off"}),"."]}),e.jsxs("li",{children:[e.jsx("code",{children:"opcache.enable=1"}),", ",e.jsx("code",{children:"opcache.validate_timestamps=0"})," + reload no deploy."]}),e.jsx("li",{children:"Sessões em Redis (ou outro store compartilhado)."}),e.jsx("li",{children:"HTTPS via Let’s Encrypt + HSTS habilitado."}),e.jsxs("li",{children:[e.jsx("code",{children:".env"})," fora do ",e.jsx("code",{children:"public/"})," e fora do Git."]}),e.jsx("li",{children:"Backup diário do banco para storage externo (S3, B2) — restore testado."}),e.jsx("li",{children:"Sentry (ou equivalente) capturando exceções não tratadas."}),e.jsx("li",{children:"Monolog gravando em arquivo rotativo + syslog."}),e.jsxs("li",{children:["Healthcheck respondendo em ",e.jsx("code",{children:"/health"})," para o load balancer."]}),e.jsx("li",{children:"Deploy atomic-symlink para rollback em <1s."})]})}),e.jsxs("p",{children:["Esse foi o último capítulo da trilha de Deploy. Você agora tem o suficiente para colocar um app PHP ",e.jsx("strong",{children:"de verdade"})," no ar — com a mesma cara dos sistemas que servem milhões de requests por dia. ",e.jsx("code",{children:'echo "EOF";'})]})]})}export{l as default};
