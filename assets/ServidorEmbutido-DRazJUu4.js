import{j as e}from"./index-B5-q-eol.js";import{P as t,A as s,a as r}from"./AlertBox-CVbFLZEd.js";import{T as o}from"./TerminalBlock-6fqVIX2R.js";import{B as i}from"./BrowserBlock-pEcgE37D.js";function l(){return e.jsxs(t,{title:"Servidor embutido (php -S)",subtitle:"Suba um servidor web de desenvolvimento em 1 segundo, sem instalar Apache ou Nginx. Aprenda quando vale a pena, como roteador customizado funciona, e por que NUNCA usar isso em produção.",difficulty:"iniciante",timeToRead:"8 min",category:"Instalação",children:[e.jsx(s,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"php -S"})," "," — "," ","servidor de desenvolvimento embutido."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Single threaded"})," "," — "," ","serve 1 request por vez — só dev."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Router"})," "," — "," ","php -S 0.0.0.0:8000 router.php — front controller."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Limitações"})," "," — "," ","sem .htaccess, sem rewrite avançado."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Uso"})," "," — "," ","protótipos, REPL, testes locais."]})]}),e.jsx("h2",{children:"Um servidor em uma linha"}),e.jsx("p",{children:"Antes de qualquer teoria, veja a coisa mais útil que você vai aprender hoje:"}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projeto",command:"php -S localhost:8000",output:`[Wed Jan 15 10:00:00 2026] PHP 8.4.1 Development Server (http://localhost:8000) started
Listening on http://localhost:8000
Document root is /home/dev/projeto
Press Ctrl-C to quit.`}),e.jsxs("p",{children:["Pronto. Você tem um servidor web rodando, sem Apache, sem Nginx, sem virtual host. Crie um",e.jsx("code",{children:" index.php"})," nesse diretório e abra ",e.jsx("code",{children:"http://localhost:8000"}),":"]}),e.jsx(r,{filename:"index.php",code:`<?php
declare(strict_types=1);

$visitas = $_SESSION['visitas'] ?? 0;
session_start();
$_SESSION['visitas'] = ++$visitas;
?>
<!doctype html>
<html lang="pt-BR">
<head><meta charset="utf-8"><title>Olá</title></head>
<body>
  <h1>Olá da CLI!</h1>
  <p>PHP <?= PHP_VERSION ?> rodando em <?= PHP_OS ?>.</p>
  <p>Esta é sua visita número <?= $visitas ?>.</p>
</body>
</html>`}),e.jsxs(i,{url:"http://localhost:8000/",children:[e.jsx("h1",{className:"text-2xl font-bold mb-2",children:"Olá da CLI!"}),e.jsx("p",{children:"PHP 8.4.1 rodando em Linux."}),e.jsx("p",{children:"Esta é sua visita número 1."})]}),e.jsx("h2",{children:"A flag -t: pasta pública"}),e.jsxs("p",{children:["Projetos modernos (Laravel, Symfony, Slim) seguem um padrão: ",e.jsx("strong",{children:"tudo"})," que é acessível via web fica numa pasta ",e.jsx("code",{children:"public/"}),"; o resto (",e.jsx("code",{children:"src/"}),",",e.jsx("code",{children:"vendor/"}),", ",e.jsx("code",{children:"config/"}),") fica fora dela. A flag ",e.jsx("code",{children:"-t"})," diz “use esta pasta como document root”:"]}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projeto",command:"php -S localhost:8000 -t public",output:`[Wed Jan 15 10:01:22 2026] PHP 8.4.1 Development Server (http://localhost:8000) started
Listening on http://localhost:8000
Document root is /home/dev/projeto/public
Press Ctrl-C to quit.`}),e.jsx("p",{children:"Estrutura típica que isso protege:"}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projeto",command:"ls -la",output:`drwxr-xr-x  vendor/
drwxr-xr-x  src/
drwxr-xr-x  config/
drwxr-xr-x  public/      ← apenas esta vai pro mundo
-rw-r--r--  composer.json
-rw-r--r--  .env         ← NUNCA exposto`}),e.jsxs(s,{type:"warning",title:"Por que isso importa",children:["Se você apontar o ",e.jsx("code",{children:"-t"})," para a raiz do projeto, qualquer um na rede pode acessar",e.jsx("code",{children:"http://localhost:8000/.env"})," e ",e.jsx("strong",{children:"ver suas credenciais"}),". Por isso o padrão ",e.jsx("code",{children:"public/"}),": o que é privado fica fora dele por design."]}),e.jsx("h2",{children:"Bind: localhost vs 0.0.0.0"}),e.jsxs("p",{children:["Por padrão ",e.jsx("code",{children:"localhost"})," só aceita conexões da sua máquina. Se você quer testar pelo celular na mesma rede Wi-Fi (ou de uma VM), use ",e.jsx("code",{children:"0.0.0.0"}),":"]}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projeto",command:"php -S 0.0.0.0:8000 -t public",output:`[Wed Jan 15 10:02:00 2026] PHP 8.4.1 Development Server (http://0.0.0.0:8000) started
Listening on http://0.0.0.0:8000
Document root is /home/dev/projeto/public`}),e.jsxs("p",{children:["Agora, descubra seu IP local (",e.jsx("code",{children:"ip a"})," no Linux, ",e.jsx("code",{children:"ipconfig"})," no Windows) e acesse ",e.jsx("code",{children:"http://192.168.0.X:8000"})," de outro dispositivo. Útil para debug mobile."]}),e.jsx("h2",{children:"Roteador customizado (router.php)"}),e.jsxs("p",{children:["Por padrão, o servidor embutido procura por um arquivo correspondente à URL. Mas frameworks querem um ",e.jsx("strong",{children:"front controller"}),": ",e.jsx("em",{children:"todas"})," as requests caem num único",e.jsx("code",{children:"index.php"}),". Para isso existe a sintaxe:"]}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projeto",command:"php -S localhost:8000 -t public public/index.php",output:`[Wed Jan 15 10:03:00 2026] PHP 8.4.1 Development Server (http://localhost:8000) started
Listening on http://localhost:8000
Document root is /home/dev/projeto/public
Press Ctrl-C to quit.`}),e.jsxs("p",{children:["Aqui o ",e.jsx("em",{children:"último"})," argumento é o ",e.jsx("strong",{children:"router"}),": um script que decide o que fazer com cada request. Ele recebe a URL no ",e.jsx("code",{children:"$_SERVER"})," e ou retorna ",e.jsx("code",{children:"false"})," ","(deixando o servidor servir o arquivo estático) ou imprime a resposta:"]}),e.jsx(r,{filename:"public/index.php",code:`<?php
declare(strict_types=1);

$uri = parse_url($_SERVER['REQUEST_URI'], PHP_URL_PATH);

// Deixa o PHP servir CSS/JS/imagens estáticas direto
if ($uri !== '/' && file_exists(__DIR__ . $uri)) {
    return false;
}

// Roteamento minúsculo
$rotas = [
    '/'         => fn() => "<h1>Início</h1><a href='/sobre'>Sobre</a>",
    '/sobre'    => fn() => "<h1>Sobre</h1><p>Feito com PHP 8.4.</p>",
    '/api/ping' => function (): string {
        header('Content-Type: application/json');
        return json_encode(['pong' => true, 'time' => time()]);
    },
];

if (isset($rotas[$uri])) {
    echo $rotas[$uri]();
} else {
    http_response_code(404);
    echo "<h1>404</h1><p>Rota '$uri' não existe.</p>";
}`}),e.jsxs(i,{url:"http://localhost:8000/sobre",children:[e.jsx("h1",{className:"text-2xl font-bold mb-2",children:"Sobre"}),e.jsx("p",{children:"Feito com PHP 8.4."})]}),e.jsx(i,{url:"http://localhost:8000/api/ping",children:e.jsx("pre",{className:"text-xs",children:'{"pong":true,"time":1736937600}'})}),e.jsxs("p",{children:["Repare no ",e.jsx("code",{children:"return false"}),": ele é o sinal mágico para o servidor embutido “esquecer” o roteador e servir o arquivo do disco. Sem isso, qualquer pedido a",e.jsx("code",{children:" /style.css"})," seria roteado pelo PHP — sobrecarga inútil."]}),e.jsx("h2",{children:"Vendo as requests no terminal"}),e.jsx("p",{children:"Cada request gera uma linha de log automaticamente, com IP, método, status e URL. Excelente para debug rápido:"}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projeto",command:"php -S localhost:8000 -t public public/index.php",output:`[Wed Jan 15 10:05:00 2026] PHP 8.4.1 Development Server (http://localhost:8000) started
[Wed Jan 15 10:05:14 2026] 127.0.0.1:54322 [200]: GET /
[Wed Jan 15 10:05:18 2026] 127.0.0.1:54323 [200]: GET /sobre
[Wed Jan 15 10:05:24 2026] 127.0.0.1:54324 [200]: GET /api/ping
[Wed Jan 15 10:05:31 2026] 127.0.0.1:54325 [404]: GET /naoexiste`}),e.jsx("h2",{children:"Sobrescrevendo o php.ini só para essa execução"}),e.jsxs("p",{children:["Quer mais memória ou desligar OPcache só durante a sessão de dev? Use ",e.jsx("code",{children:"-d"}),":"]}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projeto",command:"php -d memory_limit=1G -d opcache.enable=0 -S localhost:8000 -t public",output:`[Wed Jan 15 10:06:00 2026] PHP 8.4.1 Development Server (http://localhost:8000) started
Listening on http://localhost:8000
Document root is /home/dev/projeto/public`}),e.jsx("h2",{children:"Quando NÃO usar (importante)"}),e.jsxs(s,{type:"danger",title:"O servidor embutido NÃO É para produção",children:["A documentação oficial é categórica: ",e.jsx("em",{children:"“This web server is designed to aid application development. It may also be useful for testing purposes. It is not intended to be a full-featured web server. It should not be used on a public network.”"})]}),e.jsx("p",{children:"Os limites técnicos:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Single-threaded."})," Atende uma request por vez. Se uma demora 3s, todas as outras esperam. Em produção isso é um DoS instantâneo."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Sem HTTPS nativo."})," Não terminação SSL. Em produção você precisa de Nginx/Apache na frente."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Sem rewrite rules sofisticadas."})," Tudo precisa passar pelo router PHP, o que é caríssimo para arquivos estáticos em escala."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Sem gerenciamento de processos."})," Cai e não levanta sozinho."]})]}),e.jsx("h2",{children:"Comparação rápida com Apache e Nginx"}),e.jsxs("p",{children:["Para você ter o modelo mental certo de ",e.jsx("em",{children:"quando"})," usar cada um:"]}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"php -S"})," — desenvolvimento local. Liga em 1 segundo, ideal para hackear."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Apache + mod_php"})," — modelo clássico. Cada request gera um worker. Bom para hospedagens compartilhadas e WordPress legado. Configuração via ",e.jsx("code",{children:".htaccess"}),"."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Nginx + PHP-FPM"})," — padrão moderno em produção. Nginx serve estáticos rapidíssimo e passa requests dinâmicas para o PHP-FPM via FastCGI. Escala muito melhor."]})]}),e.jsx("p",{children:"Setup mínimo de produção (só para você ver o tamanho da diferença):"}),e.jsx(r,{filename:"/etc/nginx/sites-available/app",language:"nginx",code:`server {
    listen 80;
    server_name app.example.com;
    root /var/www/app/public;
    index index.php;

    location / {
        try_files $uri $uri/ /index.php?$query_string;
    }

    location ~ \\.php$ {
        fastcgi_pass unix:/run/php/php8.4-fpm.sock;
        fastcgi_index index.php;
        fastcgi_param SCRIPT_FILENAME $document_root$fastcgi_script_name;
        include fastcgi_params;
    }
}`}),e.jsxs("p",{children:["Em desenvolvimento, esquece tudo isso. Use ",e.jsx("code",{children:"php -S"}),":"]}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projeto",command:"php -S localhost:8000 -t public public/index.php",output:"[Wed Jan 15 10:08:00 2026] PHP 8.4.1 Development Server (http://localhost:8000) started"}),e.jsx("h2",{children:"Truques úteis no dia a dia"}),e.jsx("h3",{children:"Servir um diretório qualquer rapidamente"}),e.jsx("p",{children:"Precisa compartilhar uma pasta de arquivos com alguém na rede? Sem PHP nem nada — só estáticos:"}),e.jsx(o,{user:"dev",host:"php",cwd:"~/Downloads/relatorios",command:"php -S 0.0.0.0:8080",output:`[Wed Jan 15 10:09:00 2026] PHP 8.4.1 Development Server (http://0.0.0.0:8080) started
Listening on http://0.0.0.0:8080
Document root is /home/dev/Downloads/relatorios
[Wed Jan 15 10:09:05 2026] 192.168.0.42:54100 [200]: GET /relatorio_q4.pdf`}),e.jsx("h3",{children:"Roteador que loga tudo (sem mexer no app)"}),e.jsx(r,{filename:"logger.php",code:`<?php
declare(strict_types=1);

$uri = $_SERVER['REQUEST_URI'];
$metodo = $_SERVER['REQUEST_METHOD'];

fwrite(STDERR, sprintf("[%s] %s %s%s", date('H:i:s'), $metodo, $uri, PHP_EOL));

// Se for arquivo real no disco, deixa servir normalmente
if ($uri !== '/' && file_exists(__DIR__ . '/public' . parse_url($uri, PHP_URL_PATH))) {
    return false;
}

// Caso contrário, delega para o front controller
require __DIR__ . '/public/index.php';`}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projeto",command:"php -S localhost:8000 -t public logger.php",output:`[10:10:00] GET /
[10:10:01] GET /css/app.css
[10:10:01] GET /js/app.js
[10:10:14] POST /api/login`}),e.jsx("h2",{children:"Quando o servidor embutido brilha"}),e.jsxs("ul",{children:[e.jsx("li",{children:"Demonstrações e workshops — “rode em 1 segundo”."}),e.jsx("li",{children:"Desenvolvimento local sem dependência de Docker/Apache."}),e.jsx("li",{children:"Testes E2E rodando em CI (subir, bater, derrubar)."}),e.jsx("li",{children:"Compartilhar um arquivo na LAN sem instalar nada."}),e.jsx("li",{children:"Prototipar uma API REST em 30 minutos."})]}),e.jsxs(s,{type:"success",title:"O essencial em uma colher de chá",children:[e.jsx("code",{children:"php -S localhost:8000 -t public public/index.php"})," é o comando que você vai digitar centenas de vezes. Memorize. Aliás esse no ",e.jsx("code",{children:".bashrc"})," ou ",e.jsx("code",{children:".zshrc"}),":"," ",e.jsx("code",{children:"alias dev='php -S localhost:8000 -t public public/index.php'"}),"."]}),e.jsxs("p",{children:["Pronto: ambiente de desenvolvimento configurado. Da próxima vez, a gente entra na sintaxe propriamente dita — variáveis, tipos e o famoso ",e.jsx("code",{children:"strict_types"}),"."]})]})}export{l as default};
