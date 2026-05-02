import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function SecurityHeaders() {
  return (
    <PageContainer
      title="Headers de segurança"
      subtitle="HSTS, CSP, X-Frame-Options, Referrer-Policy e Permissions-Policy — os cabeçalhos HTTP que blindam sua app no navegador, configurados via header() em PHP ou middleware PSR-15."
      difficulty="avancado"
      timeToRead="12 min"
      category="Segurança"
    >
      <h2>Por que headers e não só código</h2>
      <p>
        Você pode escrever PHP perfeito — escapar todo HTML, validar todo input,
        usar prepared statements — e ainda assim levar XSS por causa de um único
        endpoint legado, ou um clickjacking porque o navegador permitiu carregar
        a sua página dentro de um <code>&lt;iframe&gt;</code> malicioso. Headers
        de segurança são a <strong>última linha de defesa</strong>: instruções
        que o navegador <em>obrigatoriamente</em> respeita.
      </p>
      <p>
        São 6 headers que, configurados corretamente, te tiram da maioria dos
        relatórios de pentest e levam sua nota no <code>securityheaders.com</code>{" "}
        de F para A+.
      </p>

      <h2>1. Strict-Transport-Security (HSTS)</h2>
      <p>
        Diz ao navegador: <em>“nunca acesse este domínio por HTTP, sempre HTTPS,
        mesmo que o usuário digite sem o s”</em>. Bloqueia ataques de SSL stripping
        em redes públicas. Vale por <code>max-age</code> segundos a partir da
        primeira visita HTTPS.
      </p>

      <PhpBlock
        filename="hsts.php"
        code={`<?php
declare(strict_types=1);

// Só envia HSTS se a request veio por HTTPS — senão ignora silenciosamente
if (!empty($_SERVER['HTTPS']) || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https') {
    header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
}`}
      />

      <AlertBox type="warning" title="Cuidado com preload">
        O <code>preload</code> manda o domínio para a lista oficial dos
        navegadores em <code>hstspreload.org</code>. Uma vez listado é{" "}
        <strong>quase irreversível</strong> e afeta todos os subdomínios. Só ative
        depois de ter certeza que <em>todo</em> subdomínio (inclusive intranet,
        ambientes legados) está em HTTPS.
      </AlertBox>

      <h2>2. Content-Security-Policy (CSP)</h2>
      <p>
        O header mais poderoso — e o mais chato de calibrar. Você lista quais
        origens podem carregar scripts, estilos, imagens, fontes, frames. Tudo
        que cair fora é <strong>bloqueado pelo navegador</strong>, mesmo que
        venha de um <code>&lt;script&gt;</code> injetado por XSS.
      </p>

      <PhpBlock
        filename="csp.php"
        code={`<?php
declare(strict_types=1);

$nonce = base64_encode(random_bytes(16));   // novo a cada request

$csp = [
    "default-src 'self'",
    "script-src 'self' 'nonce-$nonce' https://cdn.jsdelivr.net",
    "style-src 'self' 'nonce-$nonce' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: https:",
    "connect-src 'self' https://api.meusite.com",
    "frame-ancestors 'none'",
    "base-uri 'self'",
    "form-action 'self'",
    "upgrade-insecure-requests",
];

header('Content-Security-Policy: ' . implode('; ', $csp));

// Disponibiliza o nonce para os templates
$GLOBALS['csp_nonce'] = $nonce;`}
      />

      <PhpBlock
        filename="template.php"
        code={`<?php
declare(strict_types=1);
require __DIR__ . '/csp.php';

$nonce = $GLOBALS['csp_nonce'];
?>
<!DOCTYPE html>
<html lang="pt-br">
<head>
    <meta charset="utf-8">
    <title>Página segura</title>
    <!-- só roda porque tem o nonce do request -->
    <script nonce="<?= htmlspecialchars($nonce) ?>">
        console.log('script autorizado pelo nonce');
    </script>
    <!-- esse aqui o navegador BLOQUEIA -->
    <script>
        console.log('sem nonce — não executa');
    </script>
</head>
<body>
    <h1>Página com CSP estrita</h1>
</body>
</html>`}
      />

      <AlertBox type="info" title="Modo report-only para começar">
        Antes de bloquear de verdade, mande o navegador só <em>relatar</em> as
        violações com <code>Content-Security-Policy-Report-Only</code> + diretiva{" "}
        <code>report-uri /csp-report</code>. Você coleta os logs por uma semana,
        identifica os falsos-positivos e só depois liga o modo <em>enforce</em>.
      </AlertBox>

      <PhpBlock
        filename="csp-report.php"
        code={`<?php
declare(strict_types=1);

// Endpoint que recebe os relatórios de violação
$json = file_get_contents('php://input');
$rel  = json_decode($json, true);

error_log('[CSP-VIOLATION] ' . json_encode($rel['csp-report'] ?? $rel));

http_response_code(204);`}
      />

      <h2>3. X-Content-Type-Options: nosniff</h2>
      <p>
        Versões antigas de IE/Edge tentavam <em>adivinhar</em> o tipo de um
        arquivo se o <code>Content-Type</code> não batesse. Resultado: um upload
        de “imagem.jpg” com payload de JS era executado como script. Esse header
        força o navegador a respeitar o Content-Type que você mandou.
      </p>

      <PhpBlock
        filename="nosniff.php"
        code={`<?php
declare(strict_types=1);

header('X-Content-Type-Options: nosniff');

// Endpoint que serve uploads — agora seguro contra MIME sniffing
header('Content-Type: image/jpeg');
readfile('/uploads/foto-do-usuario.jpg');`}
      />

      <h2>4. X-Frame-Options: DENY (anti-clickjacking)</h2>
      <p>
        Impede que sua página seja carregada dentro de <code>&lt;iframe&gt;</code>{" "}
        de outro site — o que é a base do <em>clickjacking</em>: site malicioso
        sobrepõe um botão transparente por cima do seu, e a vítima clica
        achando que está em outro lugar.
      </p>

      <PhpBlock
        filename="frame-options.php"
        code={`<?php
declare(strict_types=1);

// DENY  — ninguém pode iframear, nem você mesmo (recomendado)
header('X-Frame-Options: DENY');

// SAMEORIGIN — só seu próprio domínio pode iframear
// header('X-Frame-Options: SAMEORIGIN');

// Equivalente moderno é a diretiva CSP frame-ancestors:
// header("Content-Security-Policy: frame-ancestors 'none'");`}
      />

      <AlertBox type="info" title="CSP frame-ancestors substitui X-Frame-Options">
        Navegadores modernos preferem <code>frame-ancestors</code> da CSP.
        Mantenha os dois por compatibilidade — o navegador antigo lê o
        X-Frame-Options, o novo lê o CSP.
      </AlertBox>

      <h2>5. Referrer-Policy</h2>
      <p>
        Controla o que é enviado no header <code>Referer</code> para sites
        externos. Sem essa policy, links para <code>concorrente.com</code>{" "}
        vazam URLs internas como <code>/admin/relatorios/q3-2025</code>.
      </p>

      <PhpBlock
        filename="referrer.php"
        code={`<?php
declare(strict_types=1);

// O default razoável: domínio inteiro em mesma origem,
// só origem (sem path) em cross-origin, nada se sair de HTTPS.
header('Referrer-Policy: strict-origin-when-cross-origin');

// Para apps que NUNCA querem vazar referrer:
// header('Referrer-Policy: no-referrer');`}
      />

      <h2>6. Permissions-Policy (antigo Feature-Policy)</h2>
      <p>
        Desliga APIs do navegador que sua app não usa: câmera, microfone,
        geolocalização, USB, pagamentos. Se um XSS futuro tentar usar, o
        navegador recusa.
      </p>

      <PhpBlock
        filename="permissions.php"
        code={`<?php
declare(strict_types=1);

header('Permissions-Policy: ' . implode(', ', [
    'geolocation=()',
    'camera=()',
    'microphone=()',
    'payment=()',
    'usb=()',
    'fullscreen=(self)',
    'autoplay=()',
    'accelerometer=()',
    'gyroscope=()',
]));`}
      />

      <h2>Pacote tudo num middleware PSR-15</h2>
      <p>
        Repetir <code>header()</code> em cada arquivo é frágil. Em uma app
        moderna baseada em PSR-15 (Slim, Mezzio, Laminas) você concentra tudo num
        único middleware aplicado globalmente.
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/api"
        command="composer require psr/http-server-middleware nyholm/psr7"
        output={`Using version ^1.0 for psr/http-server-middleware
Using version ^1.8 for nyholm/psr7
./composer.json has been updated
  - Installing psr/http-server-middleware (1.0.2): Extracting archive
  - Installing nyholm/psr7 (1.8.13): Extracting archive`}
      />

      <PhpBlock
        filename="src/Middleware/SecurityHeadersMiddleware.php"
        code={`<?php
declare(strict_types=1);

namespace App\\Middleware;

use Psr\\Http\\Message\\ResponseInterface;
use Psr\\Http\\Message\\ServerRequestInterface;
use Psr\\Http\\Server\\MiddlewareInterface;
use Psr\\Http\\Server\\RequestHandlerInterface;

final readonly class SecurityHeadersMiddleware implements MiddlewareInterface
{
    /** @param array<string,string> $headers */
    public function __construct(private array $headers = []) {}

    public static function default(string $nonce): self
    {
        return new self([
            'Strict-Transport-Security' => 'max-age=31536000; includeSubDomains; preload',
            'Content-Security-Policy'   => self::buildCsp($nonce),
            'X-Content-Type-Options'    => 'nosniff',
            'X-Frame-Options'           => 'DENY',
            'Referrer-Policy'           => 'strict-origin-when-cross-origin',
            'Permissions-Policy'        => 'geolocation=(), camera=(), microphone=(), payment=()',
            'Cross-Origin-Opener-Policy'   => 'same-origin',
            'Cross-Origin-Resource-Policy' => 'same-origin',
        ]);
    }

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $response = $handler->handle($request);
        foreach ($this->headers as $nome => $valor) {
            $response = $response->withHeader($nome, $valor);
        }
        return $response;
    }

    private static function buildCsp(string $nonce): string
    {
        return implode('; ', [
            "default-src 'self'",
            "script-src 'self' 'nonce-$nonce'",
            "style-src 'self' 'nonce-$nonce'",
            "img-src 'self' data: https:",
            "font-src 'self'",
            "connect-src 'self'",
            "frame-ancestors 'none'",
            "base-uri 'self'",
            "form-action 'self'",
        ]);
    }
}`}
      />

      <PhpBlock
        filename="public/index.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use App\\Middleware\\SecurityHeadersMiddleware;
use Slim\\Factory\\AppFactory;

$app = AppFactory::create();

$nonce = base64_encode(random_bytes(16));
$app->add(SecurityHeadersMiddleware::default($nonce));

$app->get('/', fn ($req, $res) => $res->getBody()->write('Olá!') ? $res : $res);

$app->run();`}
      />

      <h2>Configurando no servidor (alternativa ao PHP)</h2>
      <p>
        Headers globais e estáticos podem morar direto no Nginx ou Apache — uma
        única fonte de verdade, sem depender do código:
      </p>

      <CodeBlock
        language="nginx"
        title="/etc/nginx/conf.d/security.conf"
        code={`add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), camera=(), microphone=(), payment=()" always;
add_header Cross-Origin-Opener-Policy "same-origin" always;

# CSP geralmente fica no PHP por causa do nonce dinâmico,
# mas para apps estáticas você pode definir aqui também.`}
      />

      <AlertBox type="warning" title="Sempre use 'always' no Nginx">
        Sem <code>always</code>, o Nginx só adiciona o header em respostas 2xx/3xx
        — páginas de erro 4xx/5xx vão sem proteção. <code>always</code> aplica em
        todas.
      </AlertBox>

      <h2>Testando: dois comandos e o securityheaders.com</h2>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command="curl -sI https://meusite.com | grep -iE 'strict-transport|content-security|x-frame|x-content|referrer|permissions'"
        output={`Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-Yk7...'; ...
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=()`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command={`curl -s 'https://securityheaders.com/?q=https://meusite.com&hide=on&followRedirects=on' -o /dev/null -D - | grep -i '^x-score'`}
        output={`x-score: A+`}
      />

      <p>
        Acesse <code>https://securityheaders.com</code> e cole sua URL — você
        recebe nota A+ se todos os headers acima estão presentes e corretos.
        Mozilla Observatory (<code>observatory.mozilla.org</code>) faz uma análise
        ainda mais detalhada.
      </p>

      <AlertBox type="success" title="Resumo executável">
        <ol className="list-decimal ml-5 mt-1 space-y-1">
          <li><strong>HSTS</strong> com <code>max-age=31536000; includeSubDomains</code> (preload depois).</li>
          <li><strong>CSP</strong> começa em report-only por uma semana, depois enforce.</li>
          <li><strong>nosniff</strong>, <strong>X-Frame-Options DENY</strong>, <strong>strict-origin-when-cross-origin</strong> sempre.</li>
          <li><strong>Permissions-Policy</strong> desligando o que não usa.</li>
          <li>Centralize num middleware PSR-15 ou no Nginx — não espalhe pelo código.</li>
          <li>Validar com <code>curl -sI</code> + <code>securityheaders.com</code>.</li>
        </ol>
      </AlertBox>

      <p>
        Pronto: sua app passa a forçar HTTPS, bloqueia clickjacking, limita XSS
        no browser e some das varreduras automatizadas. Combine isso com os
        capítulos anteriores (CSRF/XSS/SQLi, JWT, password_hash) e você cobre o
        essencial do OWASP Top 10 — o resto é disciplina e testes.
      </p>
    </PageContainer>
  );
}
