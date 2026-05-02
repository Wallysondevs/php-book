import{j as e}from"./index-Bb4MiiJL.js";import{P as a,a as r,A as s}from"./AlertBox-BpD-xIsb.js";import{T as o}from"./TerminalBlock-DGurMC1r.js";import{C as i}from"./CodeBlock-C3V-qEkN.js";function l(){return e.jsxs(a,{title:"Headers de segurança",subtitle:"HSTS, CSP, X-Frame-Options, Referrer-Policy e Permissions-Policy — os cabeçalhos HTTP que blindam sua app no navegador, configurados via header() em PHP ou middleware PSR-15.",difficulty:"avancado",timeToRead:"12 min",category:"Segurança",children:[e.jsx("h2",{children:"Por que headers e não só código"}),e.jsxs("p",{children:["Você pode escrever PHP perfeito — escapar todo HTML, validar todo input, usar prepared statements — e ainda assim levar XSS por causa de um único endpoint legado, ou um clickjacking porque o navegador permitiu carregar a sua página dentro de um ",e.jsx("code",{children:"<iframe>"})," malicioso. Headers de segurança são a ",e.jsx("strong",{children:"última linha de defesa"}),": instruções que o navegador ",e.jsx("em",{children:"obrigatoriamente"})," respeita."]}),e.jsxs("p",{children:["São 6 headers que, configurados corretamente, te tiram da maioria dos relatórios de pentest e levam sua nota no ",e.jsx("code",{children:"securityheaders.com"})," ","de F para A+."]}),e.jsx("h2",{children:"1. Strict-Transport-Security (HSTS)"}),e.jsxs("p",{children:["Diz ao navegador: ",e.jsx("em",{children:"“nunca acesse este domínio por HTTP, sempre HTTPS, mesmo que o usuário digite sem o s”"}),". Bloqueia ataques de SSL stripping em redes públicas. Vale por ",e.jsx("code",{children:"max-age"})," segundos a partir da primeira visita HTTPS."]}),e.jsx(r,{filename:"hsts.php",code:`<?php
declare(strict_types=1);

// Só envia HSTS se a request veio por HTTPS — senão ignora silenciosamente
if (!empty($_SERVER['HTTPS']) || ($_SERVER['HTTP_X_FORWARDED_PROTO'] ?? '') === 'https') {
    header('Strict-Transport-Security: max-age=31536000; includeSubDomains; preload');
}`}),e.jsxs(s,{type:"warning",title:"Cuidado com preload",children:["O ",e.jsx("code",{children:"preload"})," manda o domínio para a lista oficial dos navegadores em ",e.jsx("code",{children:"hstspreload.org"}),". Uma vez listado é"," ",e.jsx("strong",{children:"quase irreversível"})," e afeta todos os subdomínios. Só ative depois de ter certeza que ",e.jsx("em",{children:"todo"})," subdomínio (inclusive intranet, ambientes legados) está em HTTPS."]}),e.jsx("h2",{children:"2. Content-Security-Policy (CSP)"}),e.jsxs("p",{children:["O header mais poderoso — e o mais chato de calibrar. Você lista quais origens podem carregar scripts, estilos, imagens, fontes, frames. Tudo que cair fora é ",e.jsx("strong",{children:"bloqueado pelo navegador"}),", mesmo que venha de um ",e.jsx("code",{children:"<script>"})," injetado por XSS."]}),e.jsx(r,{filename:"csp.php",code:`<?php
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
$GLOBALS['csp_nonce'] = $nonce;`}),e.jsx(r,{filename:"template.php",code:`<?php
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
    <\/script>
    <!-- esse aqui o navegador BLOQUEIA -->
    <script>
        console.log('sem nonce — não executa');
    <\/script>
</head>
<body>
    <h1>Página com CSP estrita</h1>
</body>
</html>`}),e.jsxs(s,{type:"info",title:"Modo report-only para começar",children:["Antes de bloquear de verdade, mande o navegador só ",e.jsx("em",{children:"relatar"})," as violações com ",e.jsx("code",{children:"Content-Security-Policy-Report-Only"})," + diretiva"," ",e.jsx("code",{children:"report-uri /csp-report"}),". Você coleta os logs por uma semana, identifica os falsos-positivos e só depois liga o modo ",e.jsx("em",{children:"enforce"}),"."]}),e.jsx(r,{filename:"csp-report.php",code:`<?php
declare(strict_types=1);

// Endpoint que recebe os relatórios de violação
$json = file_get_contents('php://input');
$rel  = json_decode($json, true);

error_log('[CSP-VIOLATION] ' . json_encode($rel['csp-report'] ?? $rel));

http_response_code(204);`}),e.jsx("h2",{children:"3. X-Content-Type-Options: nosniff"}),e.jsxs("p",{children:["Versões antigas de IE/Edge tentavam ",e.jsx("em",{children:"adivinhar"})," o tipo de um arquivo se o ",e.jsx("code",{children:"Content-Type"})," não batesse. Resultado: um upload de “imagem.jpg” com payload de JS era executado como script. Esse header força o navegador a respeitar o Content-Type que você mandou."]}),e.jsx(r,{filename:"nosniff.php",code:`<?php
declare(strict_types=1);

header('X-Content-Type-Options: nosniff');

// Endpoint que serve uploads — agora seguro contra MIME sniffing
header('Content-Type: image/jpeg');
readfile('/uploads/foto-do-usuario.jpg');`}),e.jsx("h2",{children:"4. X-Frame-Options: DENY (anti-clickjacking)"}),e.jsxs("p",{children:["Impede que sua página seja carregada dentro de ",e.jsx("code",{children:"<iframe>"})," ","de outro site — o que é a base do ",e.jsx("em",{children:"clickjacking"}),": site malicioso sobrepõe um botão transparente por cima do seu, e a vítima clica achando que está em outro lugar."]}),e.jsx(r,{filename:"frame-options.php",code:`<?php
declare(strict_types=1);

// DENY  — ninguém pode iframear, nem você mesmo (recomendado)
header('X-Frame-Options: DENY');

// SAMEORIGIN — só seu próprio domínio pode iframear
// header('X-Frame-Options: SAMEORIGIN');

// Equivalente moderno é a diretiva CSP frame-ancestors:
// header("Content-Security-Policy: frame-ancestors 'none'");`}),e.jsxs(s,{type:"info",title:"CSP frame-ancestors substitui X-Frame-Options",children:["Navegadores modernos preferem ",e.jsx("code",{children:"frame-ancestors"})," da CSP. Mantenha os dois por compatibilidade — o navegador antigo lê o X-Frame-Options, o novo lê o CSP."]}),e.jsx("h2",{children:"5. Referrer-Policy"}),e.jsxs("p",{children:["Controla o que é enviado no header ",e.jsx("code",{children:"Referer"})," para sites externos. Sem essa policy, links para ",e.jsx("code",{children:"concorrente.com"})," ","vazam URLs internas como ",e.jsx("code",{children:"/admin/relatorios/q3-2025"}),"."]}),e.jsx(r,{filename:"referrer.php",code:`<?php
declare(strict_types=1);

// O default razoável: domínio inteiro em mesma origem,
// só origem (sem path) em cross-origin, nada se sair de HTTPS.
header('Referrer-Policy: strict-origin-when-cross-origin');

// Para apps que NUNCA querem vazar referrer:
// header('Referrer-Policy: no-referrer');`}),e.jsx("h2",{children:"6. Permissions-Policy (antigo Feature-Policy)"}),e.jsx("p",{children:"Desliga APIs do navegador que sua app não usa: câmera, microfone, geolocalização, USB, pagamentos. Se um XSS futuro tentar usar, o navegador recusa."}),e.jsx(r,{filename:"permissions.php",code:`<?php
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
]));`}),e.jsx("h2",{children:"Pacote tudo num middleware PSR-15"}),e.jsxs("p",{children:["Repetir ",e.jsx("code",{children:"header()"})," em cada arquivo é frágil. Em uma app moderna baseada em PSR-15 (Slim, Mezzio, Laminas) você concentra tudo num único middleware aplicado globalmente."]}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos/api",command:"composer require psr/http-server-middleware nyholm/psr7",output:`Using version ^1.0 for psr/http-server-middleware
Using version ^1.8 for nyholm/psr7
./composer.json has been updated
  - Installing psr/http-server-middleware (1.0.2): Extracting archive
  - Installing nyholm/psr7 (1.8.13): Extracting archive`}),e.jsx(r,{filename:"src/Middleware/SecurityHeadersMiddleware.php",code:`<?php
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
}`}),e.jsx(r,{filename:"public/index.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use App\\Middleware\\SecurityHeadersMiddleware;
use Slim\\Factory\\AppFactory;

$app = AppFactory::create();

$nonce = base64_encode(random_bytes(16));
$app->add(SecurityHeadersMiddleware::default($nonce));

$app->get('/', fn ($req, $res) => $res->getBody()->write('Olá!') ? $res : $res);

$app->run();`}),e.jsx("h2",{children:"Configurando no servidor (alternativa ao PHP)"}),e.jsx("p",{children:"Headers globais e estáticos podem morar direto no Nginx ou Apache — uma única fonte de verdade, sem depender do código:"}),e.jsx(i,{language:"nginx",title:"/etc/nginx/conf.d/security.conf",code:`add_header Strict-Transport-Security "max-age=31536000; includeSubDomains; preload" always;
add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), camera=(), microphone=(), payment=()" always;
add_header Cross-Origin-Opener-Policy "same-origin" always;

# CSP geralmente fica no PHP por causa do nonce dinâmico,
# mas para apps estáticas você pode definir aqui também.`}),e.jsxs(s,{type:"warning",title:"Sempre use 'always' no Nginx",children:["Sem ",e.jsx("code",{children:"always"}),", o Nginx só adiciona o header em respostas 2xx/3xx — páginas de erro 4xx/5xx vão sem proteção. ",e.jsx("code",{children:"always"})," aplica em todas."]}),e.jsx("h2",{children:"Testando: dois comandos e o securityheaders.com"}),e.jsx(o,{user:"dev",host:"php",cwd:"~",command:"curl -sI https://meusite.com | grep -iE 'strict-transport|content-security|x-frame|x-content|referrer|permissions'",output:`Strict-Transport-Security: max-age=31536000; includeSubDomains; preload
Content-Security-Policy: default-src 'self'; script-src 'self' 'nonce-Yk7...'; ...
X-Content-Type-Options: nosniff
X-Frame-Options: DENY
Referrer-Policy: strict-origin-when-cross-origin
Permissions-Policy: geolocation=(), camera=(), microphone=(), payment=()`}),e.jsx(o,{user:"dev",host:"php",cwd:"~",command:"curl -s 'https://securityheaders.com/?q=https://meusite.com&hide=on&followRedirects=on' -o /dev/null -D - | grep -i '^x-score'",output:"x-score: A+"}),e.jsxs("p",{children:["Acesse ",e.jsx("code",{children:"https://securityheaders.com"})," e cole sua URL — você recebe nota A+ se todos os headers acima estão presentes e corretos. Mozilla Observatory (",e.jsx("code",{children:"observatory.mozilla.org"}),") faz uma análise ainda mais detalhada."]}),e.jsx(s,{type:"success",title:"Resumo executável",children:e.jsxs("ol",{className:"list-decimal ml-5 mt-1 space-y-1",children:[e.jsxs("li",{children:[e.jsx("strong",{children:"HSTS"})," com ",e.jsx("code",{children:"max-age=31536000; includeSubDomains"})," (preload depois)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"CSP"})," começa em report-only por uma semana, depois enforce."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"nosniff"}),", ",e.jsx("strong",{children:"X-Frame-Options DENY"}),", ",e.jsx("strong",{children:"strict-origin-when-cross-origin"})," sempre."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Permissions-Policy"})," desligando o que não usa."]}),e.jsx("li",{children:"Centralize num middleware PSR-15 ou no Nginx — não espalhe pelo código."}),e.jsxs("li",{children:["Validar com ",e.jsx("code",{children:"curl -sI"})," + ",e.jsx("code",{children:"securityheaders.com"}),"."]})]})}),e.jsx("p",{children:"Pronto: sua app passa a forçar HTTPS, bloqueia clickjacking, limita XSS no browser e some das varreduras automatizadas. Combine isso com os capítulos anteriores (CSRF/XSS/SQLi, JWT, password_hash) e você cobre o essencial do OWASP Top 10 — o resto é disciplina e testes."})]})}export{l as default};
