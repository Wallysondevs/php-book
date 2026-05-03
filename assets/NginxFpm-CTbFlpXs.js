import{j as e}from"./index-B5-q-eol.js";import{P as i,A as o,a}from"./AlertBox-CVbFLZEd.js";import{T as s}from"./TerminalBlock-6fqVIX2R.js";import{C as r}from"./CodeBlock-B36pQ_ak.js";import{B as n}from"./BrowserBlock-pEcgE37D.js";function m(){return e.jsxs(i,{title:"Nginx + PHP-FPM",subtitle:"O par mais usado em produção PHP. Aqui você entende como o Nginx conversa com o FPM via socket, como configurar pools e workers, e como tunar tudo isso para a carga real do seu app.",difficulty:"avancado",timeToRead:"14 min",category:"Deploy",children:[e.jsx(o,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"PHP-FPM"})," "," — "," ","FastCGI Process Manager — pool de workers PHP."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"fastcgi_pass"})," "," — "," ","nginx → unix:/run/php-fpm.sock ou TCP."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"try_files"})," "," — "," ","try_files $uri /index.php?$query_string; — front controller."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"pm.max_children"})," "," — "," ","workers simultâneos; calcule por RAM."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Buffer"})," "," — "," ","fastcgi_buffers ajusta conforme tamanho de response."]})]}),e.jsx("h2",{children:"Por que FPM, e não mod_php?"}),e.jsxs("p",{children:["O ",e.jsx("strong",{children:"PHP-FPM"})," (FastCGI Process Manager) é um daemon que mantém um pool de processos PHP prontos para atender requests. O Nginx ",e.jsx("em",{children:"não"})," executa PHP — ele apenas encaminha a requisição via FastCGI para o FPM, recebe a resposta e devolve ao cliente."]}),e.jsxs("p",{children:["Isso traz três ganhos enormes sobre o velho ",e.jsx("code",{children:"mod_php"})," do Apache:"]}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Memória previsível"}),": você define quantos workers existem; sem worker, o request enfileira ou retorna 502."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Isolamento de pools"}),": cada site/aplicação pode ter um pool com usuário e limites próprios."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Restart graceful"}),": o FPM recicla workers depois de N requests, evitando vazamento de memória acumulado."]})]}),e.jsx("h2",{children:"Instalação rápida"}),e.jsx(s,{user:"root",host:"srv",cwd:"~",command:"apt install -y nginx php8.4-fpm php8.4-mysql php8.4-mbstring",output:`Setting up php8.4-fpm (8.4.1) ...
Created symlink /etc/systemd/system/multi-user.target.wants/php8.4-fpm.service
Setting up nginx (1.26.0) ...`}),e.jsx(s,{user:"root",host:"srv",cwd:"~",command:"systemctl status php8.4-fpm --no-pager",output:`● php8.4-fpm.service - The PHP 8.4 FastCGI Process Manager
     Loaded: loaded (/lib/systemd/system/php8.4-fpm.service; enabled)
     Active: active (running) since ...
   Main PID: 1287 (php-fpm8.4)
     Status: "Processes active: 0, idle: 2, Requests: 0"
      Tasks: 3 (limit: 4915)`}),e.jsxs("p",{children:["Note o ",e.jsx("strong",{children:"socket Unix"})," que o FPM cria por padrão em sistemas Debian/Ubuntu:",e.jsx("code",{children:" /run/php/php8.4-fpm.sock"}),". É por ele que o Nginx vai falar com o PHP — mais rápido que TCP em loopback porque pula a stack de rede."]}),e.jsx("h2",{children:"Configurando o pool do FPM"}),e.jsxs("p",{children:["O arquivo principal de pool fica em ",e.jsx("code",{children:"/etc/php/8.4/fpm/pool.d/www.conf"}),". Aqui é onde você define quantos workers existem e como eles são gerenciados."]}),e.jsx(r,{title:"/etc/php/8.4/fpm/pool.d/www.conf",language:"ini",code:`[www]
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
php_admin_value[memory_limit] = 256M`}),e.jsx(o,{type:"info",title:"Os 5 modos de pm",children:e.jsxs("ul",{className:"list-disc ml-5 mt-1 space-y-1",children:[e.jsxs("li",{children:[e.jsx("code",{children:"static"}),": número fixo de workers (uso previsível, ótimo em containers)."]}),e.jsxs("li",{children:[e.jsx("code",{children:"dynamic"}),": ajusta entre ",e.jsx("code",{children:"min_spare"})," e ",e.jsx("code",{children:"max_spare"})," (padrão; bom para carga variável)."]}),e.jsxs("li",{children:[e.jsx("code",{children:"ondemand"}),": cria worker só quando chega request (memória mínima, latência maior no primeiro hit)."]})]})}),e.jsx("h2",{children:"O server block do Nginx"}),e.jsxs("p",{children:["Esse é o coração do setup: dizer ao Nginx para servir arquivos estáticos diretamente e passar qualquer ",e.jsx("code",{children:".php"})," para o socket do FPM via ",e.jsx("code",{children:"fastcgi_pass"}),"."]}),e.jsx(r,{title:"/etc/nginx/sites-available/loja.conf",language:"nginx",code:`server {
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
}`}),e.jsx(s,{user:"root",host:"srv",cwd:"~",command:"ln -s /etc/nginx/sites-available/loja.conf /etc/nginx/sites-enabled/ && nginx -t && systemctl reload nginx",output:`nginx: the configuration file /etc/nginx/nginx.conf syntax is ok
nginx: configuration file /etc/nginx/nginx.conf test is successful`}),e.jsx(o,{type:"warning",title:"Dois detalhes que pegam todo mundo",children:e.jsxs("ol",{className:"list-decimal ml-5 mt-1 space-y-1",children:[e.jsxs("li",{children:[e.jsx("code",{children:"try_files $uri =404;"})," dentro do bloco ",e.jsx("code",{children:".php"})," evita o famigerado bug onde o Nginx passa qualquer arquivo inexistente para o FPM (vetor de RCE)."]}),e.jsxs("li",{children:[e.jsx("code",{children:"$realpath_root"})," resolve symlinks — essencial em deploys atomic-symlink (Capistrano, Deployer)."]})]})}),e.jsx("h2",{children:"Um index.php mínimo para testar"}),e.jsx(a,{filename:"/var/www/loja/public/index.php",code:`<?php
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
</html>`}),e.jsxs(n,{url:"http://loja.exemplo.com/",children:[e.jsx("h1",{className:"text-2xl font-bold mb-3",children:"Loja em produção"}),e.jsxs("p",{children:["PHP 8.4.1 rodando como ",e.jsx("strong",{children:"www-data"})]}),e.jsx("p",{children:"SAPI: fpm-fcgi"}),e.jsx("p",{children:"Pid do worker: 1342"})]}),e.jsxs("p",{children:["O ",e.jsx("code",{children:"PHP_SAPI"})," retornar ",e.jsx("code",{children:"fpm-fcgi"})," confirma que o request passou pelo FPM. Recarregando a página algumas vezes, você verá o ",e.jsx("em",{children:"pid"})," alternando entre os workers do pool."]}),e.jsx("h2",{children:"Status page do FPM: o monitor que ninguém usa"}),e.jsxs("p",{children:["Com ",e.jsx("code",{children:"pm.status_path = /fpm-status"})," habilitado no pool, basta criar uma rota no Nginx que encaminhe para o FPM — e proteger por IP."]}),e.jsx(r,{title:"adicione ao server block",language:"nginx",code:`location ~ ^/(fpm-status|fpm-ping)$ {
    allow 127.0.0.1;
    allow 10.0.0.0/8;
    deny all;
    fastcgi_pass unix:/run/php/php8.4-fpm.sock;
    include fastcgi_params;
    fastcgi_param SCRIPT_FILENAME $fastcgi_script_name;
}`}),e.jsx(s,{user:"dev",host:"srv",cwd:"~",command:"curl -s http://localhost/fpm-status?full",output:`pool:                 www
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
slow requests:        3`}),e.jsx(o,{type:"info",title:"Os números que importam",children:e.jsxs("ul",{className:"list-disc ml-5 mt-1 space-y-1",children:[e.jsxs("li",{children:[e.jsx("code",{children:"listen queue"})," > 0 de forma constante = você não tem workers suficientes."]}),e.jsxs("li",{children:[e.jsx("code",{children:"max children reached"})," > 0 = subir ",e.jsx("code",{children:"pm.max_children"}),"."]}),e.jsxs("li",{children:[e.jsx("code",{children:"slow requests"})," crescente = tem código demorado, vá olhar o ",e.jsx("code",{children:"slowlog"}),"."]})]})}),e.jsx("h2",{children:"Calculando pm.max_children para o seu servidor"}),e.jsx("p",{children:"A regra clássica: cada worker do FPM consome em média entre 30MB e 80MB. Reserve memória para o sistema, banco local, OPcache, e divida o resto."}),e.jsx(a,{filename:"calc_workers.php",code:`<?php
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
echo "pm.start_servers sugerido: " . intdiv($calc->maxChildren(), 4) . PHP_EOL;`,output:`pm.max_children sugerido: 61
pm.start_servers sugerido: 15`}),e.jsx("h2",{children:"Medindo memória real dos workers"}),e.jsxs("p",{children:["A teoria é bonita, mas o número certo vem da observação. Use ",e.jsx("code",{children:"ps"})," para descobrir quanto cada worker do ",e.jsx("em",{children:"seu"})," app consome:"]}),e.jsx(s,{user:"root",host:"srv",cwd:"~",command:`ps -ylC php-fpm8.4 --sort:rss | awk 'NR>1 {sum+=$8; n++} END {print n, "workers, média:", sum/n/1024, "MB"}'`,output:"14 workers, média: 47.83 MB"}),e.jsx("h2",{children:"Reload sem downtime"}),e.jsxs("p",{children:["Após mudar a config do FPM ou subir nova versão do código, você precisa reciclar workers. O ",e.jsx("code",{children:"reload"})," faz isso de forma graceful: novos workers nascem com a config nova, antigos terminam o request atual e morrem."]}),e.jsx(s,{user:"root",host:"srv",cwd:"~",command:"systemctl reload php8.4-fpm",output:"(sem saída — reload silencioso e graceful)"}),e.jsxs(o,{type:"success",title:"Combo vencedor para deploy",children:[e.jsxs("ol",{className:"list-decimal ml-5 mt-1 space-y-1",children:[e.jsxs("li",{children:[e.jsx("code",{children:"composer install --no-dev -o"})," com classmap autoritativo."]}),e.jsxs("li",{children:["Atualiza symlink ",e.jsx("code",{children:"current → release-XYZ"}),"."]}),e.jsxs("li",{children:[e.jsx("code",{children:"systemctl reload php8.4-fpm"})," para limpar OPcache."]})]}),"Zero downtime, zero request perdido."]}),e.jsxs("p",{children:["No próximo capítulo a gente embala tudo isso em ",e.jsx("strong",{children:"Docker"}),": Dockerfile com php-fpm-alpine, multi-stage build com Composer, e um ",e.jsx("code",{children:"docker-compose.yml"})," com Nginx + PHP-FPM + MySQL prontos para subir."]})]})}export{m as default};
