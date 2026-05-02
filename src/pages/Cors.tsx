import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Cors() {
  return (
    <PageContainer
      title="CORS na prática"
      subtitle="Por que o navegador bloqueia sua API, o que é preflight, quais headers responder e como debugar o famoso 'blocked by CORS policy' sem chorar."
      difficulty="intermediario"
      timeToRead="11 min"
      category="APIs REST"
    >
      <h2>O problema: o navegador é paranoico (de propósito)</h2>
      <p>
        Você terminou a API em <code>http://api.exemplo.com</code>, abriu o frontend
        em <code>http://app.exemplo.com</code>, fez <code>fetch()</code>... e o console
        cuspiu:
      </p>

      <CodeBlock
        language="bash"
        code={`Access to fetch at 'http://api.exemplo.com/v1/users'
from origin 'http://app.exemplo.com' has been blocked
by CORS policy: No 'Access-Control-Allow-Origin' header
is present on the requested resource.`}
      />

      <p>
        Isso é a <strong>Same-Origin Policy</strong> em ação. O navegador (não o servidor!)
        bloqueia que JavaScript de um domínio leia a resposta de outro domínio, a menos
        que esse outro domínio <em>autorize explicitamente</em>. CORS é a forma de autorizar.
      </p>

      <AlertBox type="info" title="Origin = scheme + host + port">
        <code>https://app.com</code>, <code>http://app.com</code> e <code>https://app.com:8443</code>{" "}
        são <strong>três origens diferentes</strong>. Mude qualquer parte e o navegador trata
        como cross-origin.
      </AlertBox>

      <h2>Resposta mínima: o header que muda tudo</h2>
      <p>
        Para um <code>GET</code> simples, basta o servidor responder com{" "}
        <code>Access-Control-Allow-Origin</code>. Sem esse header, o navegador descarta
        a resposta — mesmo que ela tenha chegado normalmente.
      </p>

      <PhpBlock
        filename="public/index.php"
        code={`<?php
declare(strict_types=1);

header('Access-Control-Allow-Origin: https://app.exemplo.com');
header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'users' => [
        ['id' => 1, 'name' => 'Ada'],
        ['id' => 2, 'name' => 'Linus'],
    ],
]);`}
        output={`{"users":[{"id":1,"name":"Ada"},{"id":2,"name":"Linus"}]}`}
      />

      <TerminalBlock
        user="dev"
        host="api"
        cwd="~/projeto"
        command="curl -i -H 'Origin: https://app.exemplo.com' http://localhost:8000/v1/users"
        output={`HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://app.exemplo.com
Content-Type: application/json; charset=utf-8

{"users":[{"id":1,"name":"Ada"},{"id":2,"name":"Linus"}]}`}
      />

      <h2>Preflight: o pedido que vem antes do pedido</h2>
      <p>
        Quando a requisição é "complicada" — usa <code>PUT</code>, <code>DELETE</code>,
        manda <code>Authorization: Bearer ...</code>, ou tem <code>Content-Type: application/json</code> —
        o navegador faz <strong>antes</strong> uma requisição <code>OPTIONS</code> chamada{" "}
        <em>preflight</em>, perguntando: "ei, posso mandar isso?".
      </p>

      <CodeBlock
        language="bash"
        code={`# O que o navegador envia ANTES do POST/PUT/DELETE de verdade:
OPTIONS /v1/users HTTP/1.1
Host: api.exemplo.com
Origin: https://app.exemplo.com
Access-Control-Request-Method: POST
Access-Control-Request-Headers: authorization,content-type

# E o servidor TEM QUE responder com:
HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.exemplo.com
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type
Access-Control-Max-Age: 86400`}
      />

      <p>
        Só depois dessa "permissão" o navegador manda o <code>POST</code> real.
        Se o preflight falhar, o request principal nunca acontece e você só vê o erro
        no console — sem nenhum log no servidor (porque o navegador nem chegou a
        executar o handler).
      </p>

      <AlertBox type="danger" title="Pegadinha: 200 vs 204 no preflight">
        Alguns navegadores antigos exigem <code>200</code>, modernos aceitam <code>204</code>.
        Devolver <code>204 No Content</code> sem corpo é o jeito limpo. Nunca devolva
        <code> 405 Method Not Allowed</code> para <code>OPTIONS</code> — você vai quebrar todo cliente.
      </AlertBox>

      <h2>Middleware CORS completo</h2>
      <p>
        Em vez de copiar headers em cada endpoint, centralize num middleware. Aqui está
        uma implementação PSR-15 (compatível com Slim, Laminas, Mezzio):
      </p>

      <PhpBlock
        filename="src/Middleware/Cors.php"
        code={`<?php
declare(strict_types=1);

namespace App\\Middleware;

use Psr\\Http\\Message\\ResponseInterface;
use Psr\\Http\\Message\\ServerRequestInterface;
use Psr\\Http\\Server\\MiddlewareInterface;
use Psr\\Http\\Server\\RequestHandlerInterface;
use Nyholm\\Psr7\\Response;

final readonly class Cors implements MiddlewareInterface
{
    public function __construct(
        /** @var string[] */
        private array $allowedOrigins = ['https://app.exemplo.com'],
        private array $allowedMethods = ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'],
        private array $allowedHeaders = ['Authorization', 'Content-Type', 'X-Requested-With'],
        private bool  $allowCredentials = true,
        private int   $maxAge = 86400,
    ) {}

    public function process(ServerRequestInterface $request, RequestHandlerInterface $handler): ResponseInterface
    {
        $origin = $request->getHeaderLine('Origin');
        $allowed = in_array($origin, $this->allowedOrigins, true);

        if ($request->getMethod() === 'OPTIONS') {
            return $this->preflight($origin, $allowed);
        }

        $response = $handler->handle($request);
        return $allowed ? $this->withCorsHeaders($response, $origin) : $response;
    }

    private function preflight(string $origin, bool $allowed): ResponseInterface
    {
        if (!$allowed) {
            return new Response(403);
        }
        return (new Response(204))
            ->withHeader('Access-Control-Allow-Origin', $origin)
            ->withHeader('Access-Control-Allow-Methods', implode(', ', $this->allowedMethods))
            ->withHeader('Access-Control-Allow-Headers', implode(', ', $this->allowedHeaders))
            ->withHeader('Access-Control-Allow-Credentials', $this->allowCredentials ? 'true' : 'false')
            ->withHeader('Access-Control-Max-Age', (string) $this->maxAge)
            ->withHeader('Vary', 'Origin');
    }

    private function withCorsHeaders(ResponseInterface $response, string $origin): ResponseInterface
    {
        return $response
            ->withHeader('Access-Control-Allow-Origin', $origin)
            ->withHeader('Access-Control-Allow-Credentials', $this->allowCredentials ? 'true' : 'false')
            ->withHeader('Vary', 'Origin');
    }
}`}
      />

      <p>
        Três detalhes importantes desse middleware:
      </p>
      <ul>
        <li>
          <strong>Origin é validada por whitelist</strong>, nunca espelhada cegamente. Devolver
          o <code>Origin</code> recebido sem checar é vetor de ataque CSRF em APIs com cookie.
        </li>
        <li>
          <strong>Vary: Origin</strong> evita que CDNs sirvam a mesma resposta para origens diferentes
          (cache poisoning).
        </li>
        <li>
          <strong>Max-Age</strong> faz o navegador cachear o preflight. 24h é razoável; sem ele,
          cada request gera dois roundtrips.
        </li>
      </ul>

      <h2>Credentials: o caso especial dos cookies</h2>
      <p>
        Se sua API usa <em>cookie de sessão</em> (em vez de Bearer token), o frontend precisa
        de <code>fetch(url, {`{ credentials: 'include' }`})</code>. Aí entra a regra mais
        traiçoeira do CORS: <strong>com credenciais, você NÃO PODE usar <code>*</code></strong>{" "}
        no <code>Access-Control-Allow-Origin</code>. Tem que ser uma origem específica.
      </p>

      <PhpBlock
        filename="exemplo-credentials.php"
        code={`<?php
declare(strict_types=1);

// FRONTEND fez:
// fetch('https://api.exemplo.com/me', { credentials: 'include' })

// BACKEND deve responder:
$origin = $_SERVER['HTTP_ORIGIN'] ?? '';
$allowed = ['https://app.exemplo.com', 'https://admin.exemplo.com'];

if (in_array($origin, $allowed, true)) {
    header("Access-Control-Allow-Origin: {$origin}"); // específico, NUNCA *
    header('Access-Control-Allow-Credentials: true');
    header('Vary: Origin');
}

header('Content-Type: application/json');
echo json_encode(['user' => 'Ada']);`}
      />

      <AlertBox type="warning" title="A combinação proibida">
        O navegador rejeita silenciosamente <code>Access-Control-Allow-Origin: *</code> +{" "}
        <code>Access-Control-Allow-Credentials: true</code>. Se você usa cookies, precisa
        de whitelist explícita. Se usa Bearer token, pode usar <code>*</code> à vontade.
      </AlertBox>

      <h2>Debugando: o que olhar na DevTools</h2>
      <p>
        Quando algo dá errado, abra o DevTools do Chrome/Firefox em{" "}
        <strong>Network</strong> e procure pela request <code>OPTIONS</code> antes do request
        principal. Os 3 sintomas mais comuns:
      </p>

      <CodeBlock
        language="bash"
        code={`# Sintoma 1: preflight retornou 200 mas SEM os headers de CORS
→ servidor está respondendo OPTIONS, mas esqueceu Allow-Methods/Allow-Headers
→ verifique se o middleware roda ANTES do roteador (precisa pegar OPTIONS)

# Sintoma 2: preflight retornou 404
→ seu router não conhece a rota OPTIONS /users
→ registre OPTIONS explicitamente OU intercepte no middleware (preferível)

# Sintoma 3: request principal retorna 200 mas o JS quebra com "CORS error"
→ servidor não devolveu Access-Control-Allow-Origin no response real
→ middleware adicionou header só no preflight; precisa adicionar em TODAS respostas`}
      />

      <TerminalBlock
        user="dev"
        host="api"
        cwd="~/projeto"
        command="curl -i -X OPTIONS -H 'Origin: https://app.exemplo.com' -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: authorization,content-type' http://localhost:8000/v1/users"
        output={`HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.exemplo.com
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
Vary: Origin`}
      />

      <h2>Configuração equivalente no Nginx (front-line)</h2>
      <p>
        Em produção, é comum deixar o Nginx responder o preflight, evitando que a request
        suba até o PHP-FPM:
      </p>

      <CodeBlock
        language="nginx"
        code={`location /v1/ {
    if ($request_method = OPTIONS) {
        add_header Access-Control-Allow-Origin "$http_origin" always;
        add_header Access-Control-Allow-Methods "GET, POST, PUT, PATCH, DELETE" always;
        add_header Access-Control-Allow-Headers "Authorization, Content-Type" always;
        add_header Access-Control-Allow-Credentials "true" always;
        add_header Access-Control-Max-Age 86400 always;
        add_header Vary "Origin" always;
        return 204;
    }

    add_header Access-Control-Allow-Origin "$http_origin" always;
    add_header Access-Control-Allow-Credentials "true" always;
    add_header Vary "Origin" always;

    fastcgi_pass php-fpm:9000;
    include fastcgi_params;
}`}
      />

      <AlertBox type="success" title="Resumo de bolso">
        <ol className="list-decimal ml-5 mt-1 space-y-1">
          <li>CORS é problema do <strong>navegador</strong>, não do curl/Postman.</li>
          <li>Preflight (<code>OPTIONS</code>) acontece quando há <code>Authorization</code>, <code>Content-Type: application/json</code>, ou método não-simples.</li>
          <li>Whitelist de origens, nunca <code>*</code> com cookies.</li>
          <li>Sempre adicione <code>Vary: Origin</code> para cache.</li>
          <li>Cacheie o preflight com <code>Access-Control-Max-Age</code>.</li>
        </ol>
      </AlertBox>

      <p>
        Com CORS resolvido, sua API web fica pronta para qualquer SPA. Próximo capítulo
        a gente sai da camada de protocolo e ataca <strong>performance</strong>: começando
        pelo cache de bytecode mais importante do PHP, o <strong>OPcache</strong>.
      </p>
    </PageContainer>
  );
}
