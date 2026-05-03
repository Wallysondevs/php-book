import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { BrowserBlock } from "@/components/ui/BrowserBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function NginxFpm() {
  return (
    <PageContainer
      title="Nginx + PHP-FPM"
      subtitle="O par mais usado em produção PHP. Aqui você entende como o Nginx conversa com o FPM via socket, como configurar pools e workers, e como tunar tudo isso para a carga real do seu app."
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
            <strong>{"PHP-FPM"}</strong> {' — '} {"FastCGI Process Manager — pool de workers PHP."}
          </li>
        <li>
            <strong>{"fastcgi_pass"}</strong> {' — '} {"nginx → unix:/run/php-fpm.sock ou TCP."}
          </li>
        <li>
            <strong>{"try_files"}</strong> {' — '} {"try_files $uri /index.php?$query_string; — front controller."}
          </li>
        <li>
            <strong>{"pm.max_children"}</strong> {' — '} {"workers simultâneos; calcule por RAM."}
          </li>
        <li>
            <strong>{"Buffer"}</strong> {' — '} {"fastcgi_buffers ajusta conforme tamanho de response."}
          </li>
        </ul>
          <h2>Por que FPM, e não mod_php?</h2>
      <p>
        O <strong>PHP-FPM</strong> (FastCGI Process Manager) é um daemon que mantém um pool de
        processos PHP prontos para atender requests. O Nginx <em>não</em> executa PHP — ele apenas
        encaminha a requisição via FastCGI para o FPM, recebe a resposta e devolve ao cliente.
      </p>
      <p>
        Isso traz três ganhos enormes sobre o velho <code>mod_php</code> do Apache:
      </p>
      <ul>
        <li><strong>Memória previsível</strong>: você define quantos workers existem; sem worker, o request enfileira ou retorna 502.</li>
        <li><strong>Isolamento de pools</strong>: cada site/aplicação pode ter um pool com usuário e limites próprios.</li>
        <li><strong>Restart graceful</strong>: o FPM recicla workers depois de N requests, evitando vazamento de memória acumulado.</li>
      </ul>

      <h2>Instalação rápida</h2>
      <TerminalBlock
        user="root"
        host="srv"
        cwd="~"
        command="apt install -y nginx php8.4-fpm php8.4-mysql php8.4-mbstring"
        output={`Setting up php8.4-fpm (8.4.1) ...
Created symlink /etc/systemd/system/multi-user.target.wants/php8.4-fpm.service
Setting up nginx (1.26.0) ...`}
      />

      <TerminalBlock
        user="root"
        host="srv"
        cwd="~"
        command="systemctl status php8.4-fpm --no-pager"
        output={`● php8.4-fpm.service - The PHP 8.4 FastCGI Process Manager
     Loaded: loaded (/lib/systemd/system/php8.4-fpm.service; enabled)
     Active: active (running) since ...
   Main PID: 1287 (php-fpm8.4)
     Status: "Processes active: 0, idle: 2, Requests: 0"
      Tasks: 3 (limit: 4915)`}
      />

      <p>
        Note o <strong>socket Unix</strong> que o FPM cria por padrão em sistemas Debian/Ubuntu:
        <code> /run/php/php8.4-fpm.sock</code>. É por ele que o Nginx vai falar com o PHP — mais
        rápido que TCP em loopback porque pula a stack de rede.
      </p>

      <h2>Configurando o pool do FPM</h2>
      <p>
        O arquivo principal de pool fica em <code>/etc/php/8.4/fpm/pool.d/www.conf</code>. Aqui é
        onde você define quantos workers existem e como eles são gerenciados.
      </p>

      <CodeBlock
        title="/etc/php/8.4/fpm/pool.d/www.conf"
        language="ini"
        code={`[www]
user = www-data
group = www-data
listen = /run/php/php8.4-fpm.sock
listen.owner = www-data
listen.group = www-data
listen.mode = 0660

; Estratégia de processos
pm = dynamic
pm.max_children = 50
pm.start_servers = 8
pm.min_spare_servers = 4
pm.max_spare_servers = 12
pm.max_requests = 500

; Status page (não exponha publicamente)
pm.status_path = /fpm-status
ping.path = /fpm-ping

; Logs
access.log = /var/log/php-fpm/www-access.log
slowlog = /var/log/php-fpm/www-slow.log
request_slowlog_timeout = 5s

; Limites
request_terminate_timeout = 30s
php_admin_value[memory_limit] = 256M`}
      />

      <AlertBox type="info" title="Os 5 modos de pm">
        <ul className="list-disc ml-5 mt-1 space-y-1">
          <li><code>static</code>: número fixo de workers (uso previsível, ótimo em containers).</li>
          <li><code>dynamic</code>: ajusta entre <code>min_spare</code> e <code>max_spare</code> (padrão; bom para carga variável).</li>
          <li><code>ondemand</code>: cria worker só quando chega request (memória mínima, latência maior no primeiro hit).</li>
        </ul>
      </AlertBox>

      <h2>O server block do Nginx</h2>
      <p>
        Esse é o coração do setup: dizer ao Nginx para servir arquivos estáticos diretamente e
        passar qualquer <code>.php</code> para o socket do FPM via <code>fastcgi_pass</code>.
      </p>

      <CodeBlock
        title="/etc/nginx/sites-available/loja.conf"
        language="nginx"
        code={`server {
    listen 80;
    server_name loja.exemplo.com;
    root /var/www/loja/public;
    index index.php;

    # Logs
    access_log /var/log/nginx/loja-access.log;
    error_log  /var/log/nginx/loja-error.log warn;

    # Front controller pattern (Laravel, Symfony, Slim, etc.)
    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \\.php$ {
        try_files $uri =404;
        fastcgi_split_path_info ^(.+\\.php)(/.+)$;
        fastcgi_pass   unix:/run/php/php8.4-fpm.sock;
        fastcgi_index  index.php;
        include        fastcgi_params;
        fastcgi_param  SCRIPT_FILENAME $realpath_root$fastcgi_script_name;
        fastcgi_param  DOCUMENT_ROOT   $realpath_root;
        fastcgi_read_timeout 60s;
    }

    # Proteção: não servir .env, .git, .htaccess
    location ~ /\\.(?!well-known) {
        deny all;
    }

    # Cache leve para estáticos
    location ~* \\.(?:css|js|jpg|jpeg|png|gif|svg|ico|woff2)$ {
        expires 7d;
        access_log off;
        add_header Cache-Control "public";
    }
}`}
      />

      <TerminalBlock
        user="root"
        host="srv"
        cwd="~"
        command="ln -s /etc/nginx/sites-available/loja.conf /etc/nginx/sites-enabled/ && nginx -t && systemctl reload nginx"
        output={`nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful`}
      />

      <AlertBox type="warning" title="Dois detalhes que pegam todo mundo">
        <ol className="list-decimal ml-5 mt-1 space-y-1">
          <li><code>try_files $uri =404;</code> dentro do bloco <code>.php</code> evita o famigerado bug onde o Nginx passa qualquer arquivo inexistente para o FPM (vetor de RCE).</li>
          <li><code>$realpath_root</code> resolve symlinks — essencial em deploys atomic-symlink (Capistrano, Deployer).</li>
        </ol>
      </AlertBox>

      <h2>Um index.php mínimo para testar</h2>
      <PhpBlock
        filename="/var/www/loja/public/index.php"
        code={`<?php
declare(strict_types=1);

header('Content-Type: text/html; charset=utf-8');

$user = posix_getpwuid(posix_geteuid())['name'];
?>
<!doctype html>
<html lang="pt-br">
<head><meta charset="utf-8"><title>Loja</title></head>
<body>
    <h1>Loja em produção</h1>
    <p>PHP <?= PHP_VERSION ?> rodando como <strong><?= htmlspecialchars($user) ?></strong></p>
    <p>SAPI: <?= PHP_SAPI ?></p>
    <p>Pid do worker: <?= getmypid() ?></p>
</body>
</html>`}
      />

      <BrowserBlock url="http://loja.exemplo.com/">
        <h1 className="text-2xl font-bold mb-3">Loja em produção</h1>
        <p>PHP 8.4.1 rodando como <strong>www-data</strong></p>
        <p>SAPI: fpm-fcgi</p>
        <p>Pid do worker: 1342</p>
      </BrowserBlock>

      <p>
        O <code>PHP_SAPI</code> retornar <code>fpm-fcgi</code> confirma que o request passou pelo
        FPM. Recarregando a página algumas vezes, você verá o <em>pid</em> alternando entre os
        workers do pool.
      </p>

      <h2>Status page do FPM: o monitor que ninguém usa</h2>
      <p>
        Com <code>pm.status_path = /fpm-status</code> habilitado no pool, basta criar uma rota no
        Nginx que encaminhe para o FPM — e proteger por IP.
      </p>

      <CodeBlock
        title="adicione ao server block"
        language="nginx"
        code={`location ~ ^/(fpm-status|fpm-ping)$ {
    allow 127.0.0.1;
    allow 10.0.0.0/8;
    deny all;
    fastcgi_pass unix:/run/php/php8.4-fpm.sock;
    include fastcgi_params;
    fastcgi_param SCRIPT_FILENAME $fastcgi_script_name;
}`}
      />

      <TerminalBlock
        user="dev"
        host="srv"
        cwd="~"
        command="curl -s http://localhost/fpm-status?full"
        output={`pool:                 www
process manager:      dynamic
start time:           29/Jan/2025:14:02:11 -0300
accepted conn:        184329
listen queue:         0
max listen queue:     2
idle processes:       6
active processes:     2
total processes:      8
max active processes: 14
max children reached: 0
slow requests:        3`}
      />

      <AlertBox type="info" title="Os números que importam">
        <ul className="list-disc ml-5 mt-1 space-y-1">
          <li><code>listen queue</code> &gt; 0 de forma constante = você não tem workers suficientes.</li>
          <li><code>max children reached</code> &gt; 0 = subir <code>pm.max_children</code>.</li>
          <li><code>slow requests</code> crescente = tem código demorado, vá olhar o <code>slowlog</code>.</li>
        </ul>
      </AlertBox>

      <h2>Calculando pm.max_children para o seu servidor</h2>
      <p>
        A regra clássica: cada worker do FPM consome em média entre 30MB e 80MB. Reserve memória
        para o sistema, banco local, OPcache, e divida o resto.
      </p>

      <PhpBlock
        filename="calc_workers.php"
        code={`<?php
declare(strict_types=1);

final class CalculadoraWorkers
{
    public function __construct(
        public readonly int $ramTotalMb,
        public readonly int $reservadoSistemaMb,
        public readonly int $memoriaPorWorkerMb,
    ) {}

    public function maxChildren(): int
    {
        $disponivel = $this->ramTotalMb - $this->reservadoSistemaMb;
        return intdiv($disponivel, $this->memoriaPorWorkerMb);
    }
}

// Servidor 4GB, 1GB para SO+nginx+banco, ~50MB por worker PHP típico
$calc = new CalculadoraWorkers(
    ramTotalMb: 4096,
    reservadoSistemaMb: 1024,
    memoriaPorWorkerMb: 50,
);

echo "pm.max_children sugerido: " . $calc->maxChildren() . PHP_EOL;
echo "pm.start_servers sugerido: " . intdiv($calc->maxChildren(), 4) . PHP_EOL;`}
        output={`pm.max_children sugerido: 61
pm.start_servers sugerido: 15`}
      />

      <h2>Medindo memória real dos workers</h2>
      <p>
        A teoria é bonita, mas o número certo vem da observação. Use <code>ps</code> para descobrir
        quanto cada worker do <em>seu</em> app consome:
      </p>

      <TerminalBlock
        user="root"
        host="srv"
        cwd="~"
        command={`ps -ylC php-fpm8.4 --sort:rss | awk 'NR>1 {sum+=$8; n++} END {print n, "workers, média:", sum/n/1024, "MB"}'`}
        output={`14 workers, média: 47.83 MB`}
      />

      <h2>Reload sem downtime</h2>
      <p>
        Após mudar a config do FPM ou subir nova versão do código, você precisa reciclar workers.
        O <code>reload</code> faz isso de forma graceful: novos workers nascem com a config nova,
        antigos terminam o request atual e morrem.
      </p>

      <TerminalBlock
        user="root"
        host="srv"
        cwd="~"
        command="systemctl reload php8.4-fpm"
        output={`(sem saída — reload silencioso e graceful)`}
      />

      <AlertBox type="success" title="Combo vencedor para deploy">
        <ol className="list-decimal ml-5 mt-1 space-y-1">
          <li><code>composer install --no-dev -o</code> com classmap autoritativo.</li>
          <li>Atualiza symlink <code>current → release-XYZ</code>.</li>
          <li><code>systemctl reload php8.4-fpm</code> para limpar OPcache.</li>
        </ol>
        Zero downtime, zero request perdido.
      </AlertBox>

      <p>
        No próximo capítulo a gente embala tudo isso em <strong>Docker</strong>: Dockerfile com
        php-fpm-alpine, multi-stage build com Composer, e um <code>docker-compose.yml</code> com
        Nginx + PHP-FPM + MySQL prontos para subir.
      </p>
    </PageContainer>
  );
}
