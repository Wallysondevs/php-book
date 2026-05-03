import{j as e}from"./index-B5-q-eol.js";import{P as a,A as o,a as s}from"./AlertBox-CVbFLZEd.js";import{T as i}from"./TerminalBlock-6fqVIX2R.js";import{C as r}from"./CodeBlock-B36pQ_ak.js";function c(){return e.jsxs(a,{title:"CORS na prática",subtitle:"Por que o navegador bloqueia sua API, o que é preflight, quais headers responder e como debugar o famoso 'blocked by CORS policy' sem chorar.",difficulty:"intermediario",timeToRead:"11 min",category:"APIs REST",children:[e.jsx(o,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"CORS"})," "," — "," ","Cross-Origin Resource Sharing — quem pode chamar sua API."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Access-Control-Allow-Origin"})," "," — "," ","origem(s) permitida(s); * é amplo demais para credentials."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Preflight"})," "," — "," ","browser manda OPTIONS antes de métodos não-simples."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Allow-Credentials"})," "," — "," ","true permite cookies; exige Origin específica."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Allow-Headers/Methods"})," "," — "," ","whitelist do que client pode enviar."]})]}),e.jsx("h2",{children:"O problema: o navegador é paranoico (de propósito)"}),e.jsxs("p",{children:["Você terminou a API em ",e.jsx("code",{children:"http://api.exemplo.com"}),", abriu o frontend em ",e.jsx("code",{children:"http://app.exemplo.com"}),", fez ",e.jsx("code",{children:"fetch()"}),"... e o console cuspiu:"]}),e.jsx(r,{language:"bash",code:`Access to fetch at 'http://api.exemplo.com/v1/users'
from origin 'http://app.exemplo.com' has been blocked
by CORS policy: No 'Access-Control-Allow-Origin' header
is present on the requested resource.`}),e.jsxs("p",{children:["Isso é a ",e.jsx("strong",{children:"Same-Origin Policy"})," em ação. O navegador (não o servidor!) bloqueia que JavaScript de um domínio leia a resposta de outro domínio, a menos que esse outro domínio ",e.jsx("em",{children:"autorize explicitamente"}),". CORS é a forma de autorizar."]}),e.jsxs(o,{type:"info",title:"Origin = scheme + host + port",children:[e.jsx("code",{children:"https://app.com"}),", ",e.jsx("code",{children:"http://app.com"})," e ",e.jsx("code",{children:"https://app.com:8443"})," ","são ",e.jsx("strong",{children:"três origens diferentes"}),". Mude qualquer parte e o navegador trata como cross-origin."]}),e.jsx("h2",{children:"Resposta mínima: o header que muda tudo"}),e.jsxs("p",{children:["Para um ",e.jsx("code",{children:"GET"})," simples, basta o servidor responder com"," ",e.jsx("code",{children:"Access-Control-Allow-Origin"}),". Sem esse header, o navegador descarta a resposta — mesmo que ela tenha chegado normalmente."]}),e.jsx(s,{filename:"public/index.php",code:`<?php
declare(strict_types=1);

header('Access-Control-Allow-Origin: https://app.exemplo.com');
header('Content-Type: application/json; charset=utf-8');

echo json_encode([
    'users' => [
        ['id' => 1, 'name' => 'Ada'],
        ['id' => 2, 'name' => 'Linus'],
    ],
]);`,output:'{"users":[{"id":1,"name":"Ada"},{"id":2,"name":"Linus"}]}'}),e.jsx(i,{user:"dev",host:"api",cwd:"~/projeto",command:"curl -i -H 'Origin: https://app.exemplo.com' http://localhost:8000/v1/users",output:`HTTP/1.1 200 OK
Access-Control-Allow-Origin: https://app.exemplo.com
Content-Type: application/json; charset=utf-8

{"users":[{"id":1,"name":"Ada"},{"id":2,"name":"Linus"}]}`}),e.jsx("h2",{children:"Preflight: o pedido que vem antes do pedido"}),e.jsxs("p",{children:['Quando a requisição é "complicada" — usa ',e.jsx("code",{children:"PUT"}),", ",e.jsx("code",{children:"DELETE"}),", manda ",e.jsx("code",{children:"Authorization: Bearer ..."}),", ou tem ",e.jsx("code",{children:"Content-Type: application/json"})," — o navegador faz ",e.jsx("strong",{children:"antes"})," uma requisição ",e.jsx("code",{children:"OPTIONS"})," chamada"," ",e.jsx("em",{children:"preflight"}),', perguntando: "ei, posso mandar isso?".']}),e.jsx(r,{language:"bash",code:`# O que o navegador envia ANTES do POST/PUT/DELETE de verdade:
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
Access-Control-Max-Age: 86400`}),e.jsxs("p",{children:['Só depois dessa "permissão" o navegador manda o ',e.jsx("code",{children:"POST"})," real. Se o preflight falhar, o request principal nunca acontece e você só vê o erro no console — sem nenhum log no servidor (porque o navegador nem chegou a executar o handler)."]}),e.jsxs(o,{type:"danger",title:"Pegadinha: 200 vs 204 no preflight",children:["Alguns navegadores antigos exigem ",e.jsx("code",{children:"200"}),", modernos aceitam ",e.jsx("code",{children:"204"}),". Devolver ",e.jsx("code",{children:"204 No Content"})," sem corpo é o jeito limpo. Nunca devolva",e.jsx("code",{children:" 405 Method Not Allowed"})," para ",e.jsx("code",{children:"OPTIONS"})," — você vai quebrar todo cliente."]}),e.jsx("h2",{children:"Middleware CORS completo"}),e.jsx("p",{children:"Em vez de copiar headers em cada endpoint, centralize num middleware. Aqui está uma implementação PSR-15 (compatível com Slim, Laminas, Mezzio):"}),e.jsx(s,{filename:"src/Middleware/Cors.php",code:`<?php
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
}`}),e.jsx("p",{children:"Três detalhes importantes desse middleware:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Origin é validada por whitelist"}),", nunca espelhada cegamente. Devolver o ",e.jsx("code",{children:"Origin"})," recebido sem checar é vetor de ataque CSRF em APIs com cookie."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Vary: Origin"})," evita que CDNs sirvam a mesma resposta para origens diferentes (cache poisoning)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Max-Age"})," faz o navegador cachear o preflight. 24h é razoável; sem ele, cada request gera dois roundtrips."]})]}),e.jsx("h2",{children:"Credentials: o caso especial dos cookies"}),e.jsxs("p",{children:["Se sua API usa ",e.jsx("em",{children:"cookie de sessão"})," (em vez de Bearer token), o frontend precisa de ",e.jsxs("code",{children:["fetch(url, ","{ credentials: 'include' }",")"]}),". Aí entra a regra mais traiçoeira do CORS: ",e.jsxs("strong",{children:["com credenciais, você NÃO PODE usar ",e.jsx("code",{children:"*"})]})," ","no ",e.jsx("code",{children:"Access-Control-Allow-Origin"}),". Tem que ser uma origem específica."]}),e.jsx(s,{filename:"exemplo-credentials.php",code:`<?php
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
echo json_encode(['user' => 'Ada']);`}),e.jsxs(o,{type:"warning",title:"A combinação proibida",children:["O navegador rejeita silenciosamente ",e.jsx("code",{children:"Access-Control-Allow-Origin: *"})," +"," ",e.jsx("code",{children:"Access-Control-Allow-Credentials: true"}),". Se você usa cookies, precisa de whitelist explícita. Se usa Bearer token, pode usar ",e.jsx("code",{children:"*"})," à vontade."]}),e.jsx("h2",{children:"Debugando: o que olhar na DevTools"}),e.jsxs("p",{children:["Quando algo dá errado, abra o DevTools do Chrome/Firefox em"," ",e.jsx("strong",{children:"Network"})," e procure pela request ",e.jsx("code",{children:"OPTIONS"})," antes do request principal. Os 3 sintomas mais comuns:"]}),e.jsx(r,{language:"bash",code:`# Sintoma 1: preflight retornou 200 mas SEM os headers de CORS
→ servidor está respondendo OPTIONS, mas esqueceu Allow-Methods/Allow-Headers
→ verifique se o middleware roda ANTES do roteador (precisa pegar OPTIONS)

# Sintoma 2: preflight retornou 404
→ seu router não conhece a rota OPTIONS /users
→ registre OPTIONS explicitamente OU intercepte no middleware (preferível)

# Sintoma 3: request principal retorna 200 mas o JS quebra com "CORS error"
→ servidor não devolveu Access-Control-Allow-Origin no response real
→ middleware adicionou header só no preflight; precisa adicionar em TODAS respostas`}),e.jsx(i,{user:"dev",host:"api",cwd:"~/projeto",command:"curl -i -X OPTIONS -H 'Origin: https://app.exemplo.com' -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: authorization,content-type' http://localhost:8000/v1/users",output:`HTTP/1.1 204 No Content
Access-Control-Allow-Origin: https://app.exemplo.com
Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE
Access-Control-Allow-Headers: Authorization, Content-Type, X-Requested-With
Access-Control-Allow-Credentials: true
Access-Control-Max-Age: 86400
Vary: Origin`}),e.jsx("h2",{children:"Configuração equivalente no Nginx (front-line)"}),e.jsx("p",{children:"Em produção, é comum deixar o Nginx responder o preflight, evitando que a request suba até o PHP-FPM:"}),e.jsx(r,{language:"nginx",code:`location /v1/ {
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
}`}),e.jsx(o,{type:"success",title:"Resumo de bolso",children:e.jsxs("ol",{className:"list-decimal ml-5 mt-1 space-y-1",children:[e.jsxs("li",{children:["CORS é problema do ",e.jsx("strong",{children:"navegador"}),", não do curl/Postman."]}),e.jsxs("li",{children:["Preflight (",e.jsx("code",{children:"OPTIONS"}),") acontece quando há ",e.jsx("code",{children:"Authorization"}),", ",e.jsx("code",{children:"Content-Type: application/json"}),", ou método não-simples."]}),e.jsxs("li",{children:["Whitelist de origens, nunca ",e.jsx("code",{children:"*"})," com cookies."]}),e.jsxs("li",{children:["Sempre adicione ",e.jsx("code",{children:"Vary: Origin"})," para cache."]}),e.jsxs("li",{children:["Cacheie o preflight com ",e.jsx("code",{children:"Access-Control-Max-Age"}),"."]})]})}),e.jsxs("p",{children:["Com CORS resolvido, sua API web fica pronta para qualquer SPA. Próximo capítulo a gente sai da camada de protocolo e ataca ",e.jsx("strong",{children:"performance"}),": começando pelo cache de bytecode mais importante do PHP, o ",e.jsx("strong",{children:"OPcache"}),"."]})]})}export{c as default};
