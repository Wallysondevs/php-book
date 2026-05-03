import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { BrowserBlock } from "@/components/ui/BrowserBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function ServidorEmbutido() {
  return (
    <PageContainer
      title="Servidor embutido (php -S)"
      subtitle="Suba um servidor web de desenvolvimento em 1 segundo, sem instalar Apache ou Nginx. Aprenda quando vale a pena, como roteador customizado funciona, e por que NUNCA usar isso em produção."
      difficulty="iniciante"
      timeToRead="8 min"
      category="Instalação"
    >
      <AlertBox type="info" title="Pré-requisitos">
          <p>Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP.</p>
        </AlertBox>
        <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"php -S"}</strong> {' — '} {"servidor de desenvolvimento embutido."}
          </li>
        <li>
            <strong>{"Single threaded"}</strong> {' — '} {"serve 1 request por vez — só dev."}
          </li>
        <li>
            <strong>{"Router"}</strong> {' — '} {"php -S 0.0.0.0:8000 router.php — front controller."}
          </li>
        <li>
            <strong>{"Limitações"}</strong> {' — '} {"sem .htaccess, sem rewrite avançado."}
          </li>
        <li>
            <strong>{"Uso"}</strong> {' — '} {"protótipos, REPL, testes locais."}
          </li>
        </ul>
          <h2>Um servidor em uma linha</h2>
      <p>
        Antes de qualquer teoria, veja a coisa mais útil que você vai aprender hoje:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projeto"
        command="php -S localhost:8000"
        output={`[Wed Jan 15 10:00:00 2026] PHP 8.4.1 Development Server (http://localhost:8000) started
Listening on http://localhost:8000
Document root is /home/dev/projeto
Press Ctrl-C to quit.`}
      />

      <p>
        Pronto. Você tem um servidor web rodando, sem Apache, sem Nginx, sem virtual host. Crie um
        <code> index.php</code> nesse diretório e abra <code>http://localhost:8000</code>:
      </p>

      <PhpBlock
        filename="index.php"
        code={`<?php
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
</html>`}
      />

      <BrowserBlock url="http://localhost:8000/">
        <h1 className="text-2xl font-bold mb-2">Olá da CLI!</h1>
        <p>PHP 8.4.1 rodando em Linux.</p>
        <p>Esta é sua visita número 1.</p>
      </BrowserBlock>

      <h2>A flag -t: pasta pública</h2>
      <p>
        Projetos modernos (Laravel, Symfony, Slim) seguem um padrão: <strong>tudo</strong> que é
        acessível via web fica numa pasta <code>public/</code>; o resto (<code>src/</code>,
        <code>vendor/</code>, <code>config/</code>) fica fora dela. A flag <code>-t</code> diz
        “use esta pasta como document root”:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projeto"
        command="php -S localhost:8000 -t public"
        output={`[Wed Jan 15 10:01:22 2026] PHP 8.4.1 Development Server (http://localhost:8000) started
Listening on http://localhost:8000
Document root is /home/dev/projeto/public
Press Ctrl-C to quit.`}
      />

      <p>
        Estrutura típica que isso protege:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projeto"
        command="ls -la"
        output={`drwxr-xr-x  vendor/
drwxr-xr-x  src/
drwxr-xr-x  config/
drwxr-xr-x  public/      ← apenas esta vai pro mundo
-rw-r--r--  composer.json
-rw-r--r--  .env         ← NUNCA exposto`}
      />

      <AlertBox type="warning" title="Por que isso importa">
        Se você apontar o <code>-t</code> para a raiz do projeto, qualquer um na rede pode acessar
        <code>http://localhost:8000/.env</code> e <strong>ver suas credenciais</strong>. Por isso o
        padrão <code>public/</code>: o que é privado fica fora dele por design.
      </AlertBox>

      <h2>Bind: localhost vs 0.0.0.0</h2>
      <p>
        Por padrão <code>localhost</code> só aceita conexões da sua máquina. Se você quer testar pelo
        celular na mesma rede Wi-Fi (ou de uma VM), use <code>0.0.0.0</code>:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projeto"
        command="php -S 0.0.0.0:8000 -t public"
        output={`[Wed Jan 15 10:02:00 2026] PHP 8.4.1 Development Server (http://0.0.0.0:8000) started
Listening on http://0.0.0.0:8000
Document root is /home/dev/projeto/public`}
      />

      <p>
        Agora, descubra seu IP local (<code>ip a</code> no Linux, <code>ipconfig</code> no Windows)
        e acesse <code>http://192.168.0.X:8000</code> de outro dispositivo. Útil para debug mobile.
      </p>

      <h2>Roteador customizado (router.php)</h2>
      <p>
        Por padrão, o servidor embutido procura por um arquivo correspondente à URL. Mas frameworks
        querem um <strong>front controller</strong>: <em>todas</em> as requests caem num único
        <code>index.php</code>. Para isso existe a sintaxe:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projeto"
        command="php -S localhost:8000 -t public public/index.php"
        output={`[Wed Jan 15 10:03:00 2026] PHP 8.4.1 Development Server (http://localhost:8000) started
Listening on http://localhost:8000
Document root is /home/dev/projeto/public
Press Ctrl-C to quit.`}
      />

      <p>
        Aqui o <em>último</em> argumento é o <strong>router</strong>: um script que decide o que
        fazer com cada request. Ele recebe a URL no <code>$_SERVER</code> e ou retorna <code>false</code>{" "}
        (deixando o servidor servir o arquivo estático) ou imprime a resposta:
      </p>

      <PhpBlock
        filename="public/index.php"
        code={`<?php
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
}`}
      />

      <BrowserBlock url="http://localhost:8000/sobre">
        <h1 className="text-2xl font-bold mb-2">Sobre</h1>
        <p>Feito com PHP 8.4.</p>
      </BrowserBlock>

      <BrowserBlock url="http://localhost:8000/api/ping">
        <pre className="text-xs">{`{"pong":true,"time":1736937600}`}</pre>
      </BrowserBlock>

      <p>
        Repare no <code>return false</code>: ele é o sinal mágico para o servidor embutido
        “esquecer” o roteador e servir o arquivo do disco. Sem isso, qualquer pedido a
        <code> /style.css</code> seria roteado pelo PHP — sobrecarga inútil.
      </p>

      <h2>Vendo as requests no terminal</h2>
      <p>
        Cada request gera uma linha de log automaticamente, com IP, método, status e URL. Excelente
        para debug rápido:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projeto"
        command="php -S localhost:8000 -t public public/index.php"
        output={`[Wed Jan 15 10:05:00 2026] PHP 8.4.1 Development Server (http://localhost:8000) started
[Wed Jan 15 10:05:14 2026] 127.0.0.1:54322 [200]: GET /
[Wed Jan 15 10:05:18 2026] 127.0.0.1:54323 [200]: GET /sobre
[Wed Jan 15 10:05:24 2026] 127.0.0.1:54324 [200]: GET /api/ping
[Wed Jan 15 10:05:31 2026] 127.0.0.1:54325 [404]: GET /naoexiste`}
      />

      <h2>Sobrescrevendo o php.ini só para essa execução</h2>
      <p>
        Quer mais memória ou desligar OPcache só durante a sessão de dev? Use <code>-d</code>:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projeto"
        command="php -d memory_limit=1G -d opcache.enable=0 -S localhost:8000 -t public"
        output={`[Wed Jan 15 10:06:00 2026] PHP 8.4.1 Development Server (http://localhost:8000) started
Listening on http://localhost:8000
Document root is /home/dev/projeto/public`}
      />

      <h2>Quando NÃO usar (importante)</h2>

      <AlertBox type="danger" title="O servidor embutido NÃO É para produção">
        A documentação oficial é categórica: <em>“This web server is designed to aid application
        development. It may also be useful for testing purposes. It is not intended to be a
        full-featured web server. It should not be used on a public network.”</em>
      </AlertBox>

      <p>Os limites técnicos:</p>
      <ul>
        <li>
          <strong>Single-threaded.</strong> Atende uma request por vez. Se uma demora 3s, todas as
          outras esperam. Em produção isso é um DoS instantâneo.
        </li>
        <li>
          <strong>Sem HTTPS nativo.</strong> Não terminação SSL. Em produção você precisa de Nginx/Apache
          na frente.
        </li>
        <li>
          <strong>Sem rewrite rules sofisticadas.</strong> Tudo precisa passar pelo router PHP, o que
          é caríssimo para arquivos estáticos em escala.
        </li>
        <li>
          <strong>Sem gerenciamento de processos.</strong> Cai e não levanta sozinho.
        </li>
      </ul>

      <h2>Comparação rápida com Apache e Nginx</h2>
      <p>
        Para você ter o modelo mental certo de <em>quando</em> usar cada um:
      </p>
      <ul>
        <li>
          <strong>php -S</strong> — desenvolvimento local. Liga em 1 segundo, ideal para hackear.
        </li>
        <li>
          <strong>Apache + mod_php</strong> — modelo clássico. Cada request gera um worker. Bom para
          hospedagens compartilhadas e WordPress legado. Configuração via <code>.htaccess</code>.
        </li>
        <li>
          <strong>Nginx + PHP-FPM</strong> — padrão moderno em produção. Nginx serve estáticos
          rapidíssimo e passa requests dinâmicas para o PHP-FPM via FastCGI. Escala muito melhor.
        </li>
      </ul>

      <p>Setup mínimo de produção (só para você ver o tamanho da diferença):</p>

      <PhpBlock
        filename="/etc/nginx/sites-available/app"
        language="nginx"
        code={`server {
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
}`}
      />

      <p>
        Em desenvolvimento, esquece tudo isso. Use <code>php -S</code>:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projeto"
        command="php -S localhost:8000 -t public public/index.php"
        output={`[Wed Jan 15 10:08:00 2026] PHP 8.4.1 Development Server (http://localhost:8000) started`}
      />

      <h2>Truques úteis no dia a dia</h2>

      <h3>Servir um diretório qualquer rapidamente</h3>
      <p>
        Precisa compartilhar uma pasta de arquivos com alguém na rede? Sem PHP nem nada — só estáticos:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/Downloads/relatorios"
        command="php -S 0.0.0.0:8080"
        output={`[Wed Jan 15 10:09:00 2026] PHP 8.4.1 Development Server (http://0.0.0.0:8080) started
Listening on http://0.0.0.0:8080
Document root is /home/dev/Downloads/relatorios
[Wed Jan 15 10:09:05 2026] 192.168.0.42:54100 [200]: GET /relatorio_q4.pdf`}
      />

      <h3>Roteador que loga tudo (sem mexer no app)</h3>

      <PhpBlock
        filename="logger.php"
        code={`<?php
declare(strict_types=1);

$uri = $_SERVER['REQUEST_URI'];
$metodo = $_SERVER['REQUEST_METHOD'];

fwrite(STDERR, sprintf("[%s] %s %s%s", date('H:i:s'), $metodo, $uri, PHP_EOL));

// Se for arquivo real no disco, deixa servir normalmente
if ($uri !== '/' && file_exists(__DIR__ . '/public' . parse_url($uri, PHP_URL_PATH))) {
    return false;
}

// Caso contrário, delega para o front controller
require __DIR__ . '/public/index.php';`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projeto"
        command="php -S localhost:8000 -t public logger.php"
        output={`[10:10:00] GET /
[10:10:01] GET /css/app.css
[10:10:01] GET /js/app.js
[10:10:14] POST /api/login`}
      />

      <h2>Quando o servidor embutido brilha</h2>
      <ul>
        <li>Demonstrações e workshops — “rode em 1 segundo”.</li>
        <li>Desenvolvimento local sem dependência de Docker/Apache.</li>
        <li>Testes E2E rodando em CI (subir, bater, derrubar).</li>
        <li>Compartilhar um arquivo na LAN sem instalar nada.</li>
        <li>Prototipar uma API REST em 30 minutos.</li>
      </ul>

      <AlertBox type="success" title="O essencial em uma colher de chá">
        <code>php -S localhost:8000 -t public public/index.php</code> é o comando que você vai
        digitar centenas de vezes. Memorize. Aliás esse no <code>.bashrc</code> ou <code>.zshrc</code>:
        {" "}<code>alias dev='php -S localhost:8000 -t public public/index.php'</code>.
      </AlertBox>

      <p>
        Pronto: ambiente de desenvolvimento configurado. Da próxima vez, a gente entra na sintaxe
        propriamente dita — variáveis, tipos e o famoso <code>strict_types</code>.
      </p>
    </PageContainer>
  );
}
