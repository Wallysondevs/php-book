import{j as e}from"./index-Bb4MiiJL.js";import{P as i,A as a,a as o}from"./AlertBox-BpD-xIsb.js";import{T as s}from"./TerminalBlock-DGurMC1r.js";import{C as r}from"./CodeBlock-C3V-qEkN.js";function p(){return e.jsxs(i,{title:"JWT — JSON Web Tokens",subtitle:"Como assinar e verificar tokens JWT em PHP com firebase/php-jwt — claims, HS256, RS256 com chaves assimétricas, refresh tokens e o que NUNCA colocar dentro do payload.",difficulty:"avancado",timeToRead:"13 min",category:"Segurança",children:[e.jsx("h2",{children:"O que é JWT (e o que ele NÃO é)"}),e.jsxs("p",{children:["Um JSON Web Token é uma string compacta dividida em três partes separadas por ponto: ",e.jsx("code",{children:"header.payload.signature"}),". Header e payload são JSON codificado em base64url; a assinatura prova que o conteúdo não foi alterado por quem não tem a chave."]}),e.jsxs("p",{children:["JWT serve para ",e.jsx("strong",{children:"autenticação stateless"}),": o servidor emite o token no login, o cliente envia em todo request, o servidor valida a assinatura sem consultar banco. Funciona muito bem entre microsserviços e em APIs públicas."]}),e.jsxs(a,{type:"danger",title:"JWT NÃO é criptografia",children:["O payload é apenas ",e.jsx("strong",{children:"base64"})," — qualquer um lê com"," ",e.jsx("code",{children:"jwt.io"}),". A assinatura impede ",e.jsx("em",{children:"alteração"}),", não"," ",e.jsx("em",{children:"leitura"}),". Nunca coloque senha, CPF, cartão ou qualquer dado sensível dentro de um JWT. Para criptografar, você precisa de JWE — não coberto aqui porque raramente vale a pena em vez de TLS + sessão."]}),e.jsx("h2",{children:"Instalação"}),e.jsxs("p",{children:["A biblioteca padrão de fato é ",e.jsx("code",{children:"firebase/php-jwt"})," — auditada, zero dependências, suporta HS256/HS384/HS512, RS256, ES256 e EdDSA."]}),e.jsx(s,{user:"dev",host:"php",cwd:"~/projetos/api",command:"composer require firebase/php-jwt",output:`Using version ^6.10 for firebase/php-jwt
./composer.json has been updated
Running composer update firebase/php-jwt
Lock file operations: 1 install, 0 updates, 0 removals
  - Locking firebase/php-jwt (v6.10.1)
Writing lock file
Installing dependencies from lock file (including require-dev)
Package operations: 1 install, 0 updates, 0 removals
  - Installing firebase/php-jwt (v6.10.1): Extracting archive`}),e.jsx("h2",{children:"Emitindo um token: HS256 (chave simétrica)"}),e.jsxs("p",{children:["HS256 usa uma ",e.jsx("em",{children:"única chave secreta"})," compartilhada — emissor e verificador conhecem o mesmo segredo. Ideal quando o mesmo serviço emite e valida (login monolítico)."]}),e.jsx(o,{filename:"emitir.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use Firebase\\JWT\\JWT;

$segredo = $_ENV['JWT_SECRET'];   // 32+ bytes aleatórios, em variável de ambiente
$agora   = time();

$payload = [
    'iss' => 'https://api.meusite.com',   // issuer (quem emitiu)
    'aud' => 'https://app.meusite.com',   // audience (para quem)
    'sub' => '42',                         // subject (id do usuário)
    'iat' => $agora,                       // issued at
    'nbf' => $agora,                       // not before
    'exp' => $agora + 900,                 // expira em 15 min
    'jti' => bin2hex(random_bytes(16)),    // jwt id (para revogação opcional)
    // claims customizadas — só dados não sensíveis
    'roles' => ['user', 'editor'],
];

$token = JWT::encode($payload, $segredo, 'HS256');

echo $token . PHP_EOL;`,output:"eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJpc3MiOiJodHRwczovL2FwaS5tZXVzaXRlLmNvbSIsImF1ZCI6Imh0dHBzOi8vYXBwLm1ldXNpdGUuY29tIiwic3ViIjoiNDIiLCJpYXQiOjE3MzIyNzA0MDAsIm5iZiI6MTczMjI3MDQwMCwiZXhwIjoxNzMyMjcxMzAwLCJqdGkiOiJhM2Y5MjFiYzdkOGUyMmYwIiwicm9sZXMiOlsidXNlciIsImVkaXRvciJdfQ.7c4a8d09ca3762af61e59520943dc26494f8941b"}),e.jsxs(a,{type:"info",title:"Sobre o segredo",children:["Gere com ",e.jsx("code",{children:"openssl rand -base64 48"})," e guarde em variável de ambiente — ",e.jsx("strong",{children:"nunca"})," em código ou git. Se o segredo vazar, qualquer um forja tokens válidos. Rotacione periodicamente."]}),e.jsx("h2",{children:"Verificando um token recebido"}),e.jsxs("p",{children:["No endpoint protegido, você lê o header ",e.jsx("code",{children:"Authorization: Bearer ..."})," ","e chama ",e.jsx("code",{children:"JWT::decode()"}),". Se a assinatura for inválida, o token estiver expirado ou os claims não baterem, ele lança exceção."]}),e.jsx(o,{filename:"middleware-auth.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use Firebase\\JWT\\JWT;
use Firebase\\JWT\\Key;
use Firebase\\JWT\\ExpiredException;
use Firebase\\JWT\\SignatureInvalidException;

function autenticar(): object {
    $auth = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
    if (!preg_match('/Bearer\\s+(\\S+)/', $auth, $m)) {
        http_response_code(401);
        exit(json_encode(['erro' => 'Token ausente']));
    }

    try {
        $payload = JWT::decode($m[1], new Key($_ENV['JWT_SECRET'], 'HS256'));
    } catch (ExpiredException) {
        http_response_code(401);
        exit(json_encode(['erro' => 'Token expirado']));
    } catch (SignatureInvalidException) {
        http_response_code(401);
        exit(json_encode(['erro' => 'Assinatura inválida']));
    } catch (\\Throwable $e) {
        http_response_code(401);
        exit(json_encode(['erro' => 'Token inválido']));
    }

    return $payload;
}

// uso
$user = autenticar();
echo "Olá, usuário #{$user->sub}. Roles: " . implode(',', $user->roles);`,output:"Olá, usuário #42. Roles: user,editor"}),e.jsxs("p",{children:["A biblioteca já valida automaticamente ",e.jsx("code",{children:"exp"}),", ",e.jsx("code",{children:"nbf"})," e"," ",e.jsx("code",{children:"iat"}),". Mas ",e.jsx("code",{children:"iss"})," e ",e.jsx("code",{children:"aud"})," você precisa checar à mão — sempre faça:"]}),e.jsx(o,{filename:"claims-check.php",code:`<?php
declare(strict_types=1);

if (($payload->iss ?? '') !== 'https://api.meusite.com') {
    http_response_code(401);
    exit(json_encode(['erro' => 'Issuer inválido']));
}

if (($payload->aud ?? '') !== 'https://app.meusite.com') {
    http_response_code(401);
    exit(json_encode(['erro' => 'Audience inválida']));
}`}),e.jsx("h2",{children:"RS256: chaves assimétricas para múltiplos serviços"}),e.jsxs("p",{children:["Em arquiteturas com vários microsserviços, você quer que ",e.jsx("em",{children:"só o auth-service"})," ","possa emitir tokens, mas ",e.jsx("em",{children:"todos"})," possam verificar. RS256 resolve: chave privada assina (fica só no emissor), chave pública verifica (distribuída para todos). Comprometer uma instância consumidora não permite forjar tokens."]}),e.jsx(s,{user:"dev",host:"php",cwd:"~/projetos/api/keys",command:"openssl genrsa -out private.pem 2048 && openssl rsa -in private.pem -pubout -out public.pem",output:`Generating RSA private key, 2048 bit long modulus (2 primes)
.............+++++
.....................+++++
e is 65537 (0x010001)
writing RSA key
-----BEGIN PUBLIC KEY-----
MIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEA...
-----END PUBLIC KEY-----`}),e.jsx(o,{filename:"rs256-emitir.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use Firebase\\JWT\\JWT;

$privada = file_get_contents(__DIR__ . '/keys/private.pem');

$payload = [
    'iss' => 'auth-service',
    'sub' => '42',
    'iat' => time(),
    'exp' => time() + 900,
];

$token = JWT::encode($payload, $privada, 'RS256', kid: 'key-2025-01');

echo $token . PHP_EOL;`,output:"eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImtpZCI6ImtleS0yMDI1LTAxIn0.eyJpc3MiOiJhdXRoLXNlcnZpY2UiLCJzdWIiOiI0MiIsImlhdCI6MTczMjI3MDQwMCwiZXhwIjoxNzMyMjcxMzAwfQ.QkRz...assinatura-de-256-bytes..."}),e.jsx(o,{filename:"rs256-verificar.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use Firebase\\JWT\\JWT;
use Firebase\\JWT\\Key;

$publica = file_get_contents(__DIR__ . '/keys/public.pem');

$token = $_SERVER['HTTP_AUTHORIZATION'] ?? '';
$token = str_replace('Bearer ', '', $token);

$payload = JWT::decode($token, new Key($publica, 'RS256'));

echo "Sub: {$payload->sub}, expira em: " . date('H:i:s', $payload->exp);`,output:"Sub: 42, expira em: 14:35:00"}),e.jsxs(a,{type:"info",title:"Rotação de chaves com kid",children:["O ",e.jsx("code",{children:"kid"})," (key id) no header do JWT permite trocar a chave sem invalidar tokens em circulação: o verificador olha o ",e.jsx("code",{children:"kid"})," e escolhe a chave certa de um array. Padrão usado por Auth0, Cognito, Keycloak."]}),e.jsx(o,{filename:"kid-rotacao.php",code:`<?php
declare(strict_types=1);

use Firebase\\JWT\\JWT;
use Firebase\\JWT\\Key;

$chaves = [
    'key-2024-12' => new Key(file_get_contents('keys/old.pem'), 'RS256'),
    'key-2025-01' => new Key(file_get_contents('keys/new.pem'), 'RS256'),
];

$payload = JWT::decode($token, $chaves);
// JWT escolhe a chave automaticamente pelo kid do header.`}),e.jsx("h2",{children:"Refresh tokens: vida longa sem perder segurança"}),e.jsxs("p",{children:["Tokens de acesso devem ser ",e.jsx("strong",{children:"curtos"})," (5-15 min). Para não forçar login frequente, você emite junto um ",e.jsx("em",{children:"refresh token"})," de vida longa (dias ou semanas), guardado de forma segura, que é trocado por um novo access token."]}),e.jsx(o,{filename:"refresh.php",code:`<?php
declare(strict_types=1);

use Firebase\\JWT\\JWT;
use Firebase\\JWT\\Key;

function emitirParAposLogin(int $userId, \\PDO $pdo): array {
    $accessPayload = [
        'iss' => 'auth-service',
        'sub' => (string) $userId,
        'iat' => time(),
        'exp' => time() + 900,             // 15 min
    ];

    $refreshId = bin2hex(random_bytes(32));
    $refreshPayload = [
        'iss' => 'auth-service',
        'sub' => (string) $userId,
        'iat' => time(),
        'exp' => time() + 7 * 86400,       // 7 dias
        'jti' => $refreshId,
        'typ' => 'refresh',
    ];

    // Persistir o jti para poder revogar — é o que torna logout possível
    $pdo->prepare('INSERT INTO refresh_tokens (jti, user_id, expira_em) VALUES (?, ?, ?)')
        ->execute([$refreshId, $userId, date('Y-m-d H:i:s', time() + 7 * 86400)]);

    $segredo = $_ENV['JWT_SECRET'];
    return [
        'access_token'  => JWT::encode($accessPayload, $segredo, 'HS256'),
        'refresh_token' => JWT::encode($refreshPayload, $segredo, 'HS256'),
        'expires_in'    => 900,
    ];
}`}),e.jsx(o,{filename:"refresh-endpoint.php",code:`<?php
declare(strict_types=1);

use Firebase\\JWT\\JWT;
use Firebase\\JWT\\Key;

function trocarRefreshPorAccess(string $refreshToken, \\PDO $pdo): array {
    $payload = JWT::decode($refreshToken, new Key($_ENV['JWT_SECRET'], 'HS256'));

    if (($payload->typ ?? '') !== 'refresh') {
        throw new \\RuntimeException('Não é um refresh token');
    }

    // Revogado? — chave de defesa contra reuso
    $stmt = $pdo->prepare('SELECT 1 FROM refresh_tokens WHERE jti = ? AND revogado = 0');
    $stmt->execute([$payload->jti]);
    if ($stmt->fetchColumn() === false) {
        throw new \\RuntimeException('Refresh revogado ou inválido');
    }

    // Rotação: invalida o atual e emite par novo (defende contra roubo)
    $pdo->prepare('UPDATE refresh_tokens SET revogado = 1 WHERE jti = ?')
        ->execute([$payload->jti]);

    return emitirParAposLogin((int) $payload->sub, $pdo);
}`}),e.jsx("p",{children:"Resposta típica de um endpoint de login que retorna o par de tokens:"}),e.jsx(r,{language:"json",title:"POST /auth/login → 200",code:`{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "token_type": "Bearer",
  "expires_in": 900
}`}),e.jsx("h2",{children:"Onde guardar os tokens no cliente"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"localStorage"}),": simples, mas vulnerável a XSS — qualquer script da página lê. Evite se você renderiza HTML do usuário."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Cookie HttpOnly + Secure + SameSite=Strict"}),": mais seguro, inacessível ao JS, mas requer proteção CSRF (token + double-submit) para requests com efeito colateral."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Memória do app (variável JS)"}),": zero persistência, perde ao recarregar — bom para SPAs com refresh em cookie HttpOnly."]})]}),e.jsx(a,{type:"warning",title:"Pegadinhas clássicas",children:e.jsxs("ul",{className:"list-disc ml-5 mt-1 space-y-1",children:[e.jsxs("li",{children:[e.jsx("strong",{children:'Algoritmo "none"'}),": alguns parsers aceitam tokens sem assinatura. ",e.jsx("code",{children:"firebase/php-jwt"})," bloqueia, mas confirme: você passa o algo no ",e.jsx("code",{children:"Key"})," e ele recusa qualquer outro."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Confusão HS/RS"}),": nunca passe a chave pública RS256 para verificar com HS256 — atacante pode assinar com ela. Sempre amarre algoritmo + chave."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Sem expiração"}),": token sem ",e.jsx("code",{children:"exp"})," = senha permanente. Sempre defina."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Logout"}),": JWT puro é stateless. Sem lista de jti revogados, você não consegue fazer logout antes do exp. Refresh tokens persistidos resolvem."]})]})}),e.jsx("h2",{children:"Rodando o exemplo de ponta a ponta"}),e.jsx(s,{user:"dev",host:"php",cwd:"~/projetos/api",command:"curl -X POST http://localhost:8000/auth/login -d 'email=ada@x&senha=123' | jq",output:`{
  "access_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "refresh_token": "eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9...",
  "expires_in": 900
}`}),e.jsx(s,{user:"dev",host:"php",cwd:"~/projetos/api",command:'curl http://localhost:8000/me -H "Authorization: Bearer eyJ0eXAiOiJKV1QiLCJhbGciOi..."',output:'{"id":42,"email":"ada@example.com","roles":["user","editor"]}'}),e.jsxs("p",{children:["No próximo capítulo a gente fecha a trilha de segurança com"," ",e.jsx("strong",{children:"headers HTTP"})," — HSTS, CSP, X-Frame-Options e amigos — configurados via PHP ou middleware PSR-15."]})]})}export{p as default};
