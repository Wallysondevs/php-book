import{j as e}from"./index-Bb4MiiJL.js";import{P as r,a as s,A as a}from"./AlertBox-BpD-xIsb.js";import{B as o}from"./BrowserBlock-C5ENTT0j.js";import{C as i}from"./CodeBlock-C3V-qEkN.js";function l(){return e.jsxs(r,{title:"CSRF, XSS e SQL Injection",subtitle:"Os três grandes inimigos de toda aplicação web em PHP — como cada um funciona, exemplos vulneráveis lado a lado com a versão segura, e os padrões que acabam com 95% dos buracos.",difficulty:"avancado",timeToRead:"14 min",category:"Segurança",children:[e.jsx("h2",{children:"Por que esses três (e não outros)"}),e.jsxs("p",{children:["O OWASP Top 10 muda de ano em ano, mas ",e.jsx("strong",{children:"injeção"})," (SQL e comandos), ",e.jsx("strong",{children:"XSS"})," (cross-site scripting) e ",e.jsx("strong",{children:"CSRF"}),"(cross-site request forgery) continuam sendo os campeões de incidentes em apps PHP. A boa notícia: cada um tem uma defesa ",e.jsx("em",{children:"simples e mecânica"})," ","que, aplicada disciplinadamente, fecha o buraco. Vamos por partes."]}),e.jsx("h2",{children:"1. SQL Injection — sempre prepared, nunca concatenação"}),e.jsxs("p",{children:["SQL injection acontece quando você concatena entrada do usuário direto na query. O atacante envia ",e.jsx("code",{children:"' OR '1'='1"})," no campo de e-mail e a sua consulta vira algo bem diferente do que você imaginou."]}),e.jsx(s,{filename:"vulneravel.php",code:`<?php
declare(strict_types=1);

// ❌ VULNERÁVEL — concatenação direta
$email = $_POST['email'];
$senha = $_POST['senha'];

$sql = "SELECT * FROM users WHERE email = '$email' AND senha = '$senha'";
$res = $pdo->query($sql);

// Atacante envia:
//   email = ' OR 1=1 --
//   senha = qualquer
// SQL final:
//   SELECT * FROM users WHERE email = '' OR 1=1 --' AND senha = 'qualquer'
// → retorna o primeiro usuário do banco. Game over.`}),e.jsx(s,{filename:"seguro.php",code:`<?php
declare(strict_types=1);

// ✅ SEGURO — prepared statement com placeholders
$stmt = $pdo->prepare('SELECT id, email FROM users WHERE email = ? AND ativo = 1');
$stmt->execute([$_POST['email']]);
$user = $stmt->fetch(\\PDO::FETCH_ASSOC);

// Os valores nunca viram parte da string SQL.
// O driver envia o template e os parâmetros separados ao MySQL/Postgres.
// É impossível injetar SQL por aqui.

var_dump($user);`,output:`array(2) {
  ["id"]=>
  int(42)
  ["email"]=>
  string(15) "ada@example.com"
}`}),e.jsx("p",{children:"Use placeholders nomeados quando a query tem muitos parâmetros — fica mais legível e não importa a ordem:"}),e.jsx(s,{filename:"prepared-nomeados.php",code:`<?php
declare(strict_types=1);

$stmt = $pdo->prepare(
    'INSERT INTO posts (titulo, slug, autor_id, publicado_em)
     VALUES (:titulo, :slug, :autor_id, :publicado_em)'
);

$stmt->execute([
    'titulo'       => $_POST['titulo'],
    'slug'         => slugify($_POST['titulo']),
    'autor_id'     => $usuarioLogado->id,
    'publicado_em' => (new DateTimeImmutable())->format('Y-m-d H:i:s'),
]);

echo "Post #" . $pdo->lastInsertId() . " criado." . PHP_EOL;`,output:"Post #318 criado."}),e.jsxs(a,{type:"warning",title:"E o ORDER BY dinâmico?",children:["Placeholders só funcionam para ",e.jsx("em",{children:"valores"}),", nunca para ",e.jsx("em",{children:"identificadores"})," ","(nomes de colunas, tabelas, ",e.jsx("code",{children:"ASC"}),"/",e.jsx("code",{children:"DESC"}),"). Para esses, valide contra uma ",e.jsx("strong",{children:"whitelist"}),": ",e.jsx("code",{children:"match($coluna) { 'nome', 'data' => $coluna, default => 'id' }"}),"."]}),e.jsx(s,{filename:"ordenacao-segura.php",code:`<?php
declare(strict_types=1);

// ❌ NUNCA: $sql = "SELECT * FROM users ORDER BY {$_GET['ordem']}";

// ✅ Whitelist — só essas colunas são aceitas
$colunasOk = ['nome', 'email', 'criado_em'];
$coluna    = in_array($_GET['ordem'] ?? 'nome', $colunasOk, true) ? $_GET['ordem'] : 'nome';
$direcao   = ($_GET['dir'] ?? 'asc') === 'desc' ? 'DESC' : 'ASC';

$sql = "SELECT * FROM users ORDER BY $coluna $direcao";
$res = $pdo->query($sql);`}),e.jsx("h2",{children:"2. XSS — sempre escape na saída"}),e.jsxs("p",{children:["Cross-site scripting acontece quando você devolve dados controlados pelo usuário direto no HTML. Se eu mando ",e.jsx("code",{children:"<script>fetch('/api/transferir?valor=1000')<\/script>"})," ","como meu nome de usuário, e a sua página renderiza ",e.jsx("code",{children:"<h1>Olá, $nome</h1>"})," ","— o navegador da próxima vítima executa meu script com a sessão dela."]}),e.jsx(s,{filename:"xss-vulneravel.php",code:`<?php
declare(strict_types=1);

$busca = $_GET['q'] ?? '';
?>
<!DOCTYPE html>
<html lang="pt-br">
<body>
<h1>Resultados para: <?= $busca ?></h1>
<!-- ❌ Atacante manda  ?q=<script>alert('xss')<\/script>
     e o script roda no navegador da vítima. -->
</body>
</html>`}),e.jsx(s,{filename:"xss-seguro.php",code:`<?php
declare(strict_types=1);

function e(string $valor): string {
    return htmlspecialchars($valor, ENT_QUOTES | ENT_SUBSTITUTE, 'UTF-8');
}

$busca = $_GET['q'] ?? '';
?>
<!DOCTYPE html>
<html lang="pt-br">
<body>
<h1>Resultados para: <?= e($busca) ?></h1>
<!-- ✅ <script>alert('xss')<\/script> vira
     &lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;
     e aparece como texto literal. -->
</body>
</html>`}),e.jsxs(o,{url:"http://localhost:8000/?q=<script>alert('xss')<\/script>",children:[e.jsx("h1",{style:{fontSize:"1.5rem",fontWeight:700,marginBottom:"0.5rem"},children:"Resultados para: <script>alert('xss')<\/script>"}),e.jsx("p",{style:{color:"#555"},children:"Nada perigoso — está renderizado como texto."})]}),e.jsxs(a,{type:"info",title:"Crie um helper curto",children:[e.jsx("code",{children:"htmlspecialchars(...)"})," em todo lugar polui. A maioria dos projetos define uma função ",e.jsx("code",{children:"e()"})," ou usa um template engine (Twig/Blade) que escapa por padrão. Em ",e.jsx("strong",{children:"Twig"}),", ",e.jsx("code",{children:"{{ user.nome }}"})," ","já escapa; só desliga com ",e.jsx("code",{children:"|raw"}),"."]}),e.jsx("h2",{children:"Defesa em profundidade: Content-Security-Policy"}),e.jsxs("p",{children:["Mesmo com escape correto, um único ",e.jsx("code",{children:"|raw"})," esquecido é o suficiente. A segunda camada é o header ",e.jsx("strong",{children:"CSP"}),": você diz ao navegador quais origens podem executar scripts, e ele bloqueia tudo o que sair da lista — inclusive ",e.jsx("code",{children:"<script>inline<\/script>"}),"."]}),e.jsx(s,{filename:"bootstrap.php",code:`<?php
declare(strict_types=1);

header(
    "Content-Security-Policy: " .
    "default-src 'self'; " .
    "script-src 'self' https://cdn.jsdelivr.net; " .
    "style-src 'self' 'unsafe-inline'; " .
    "img-src 'self' data: https:; " .
    "connect-src 'self'; " .
    "frame-ancestors 'none'; " .
    "base-uri 'self'; " .
    "form-action 'self'"
);`}),e.jsx("h2",{children:"3. CSRF — token por sessão validado em forms POST"}),e.jsxs("p",{children:["CSRF é o ataque onde um site malicioso faz o navegador da vítima enviar uma requisição para o seu site, aproveitando o cookie de sessão dela. Se a vítima está logada no seu banco e visita ",e.jsx("code",{children:"evil.com"}),", um"," ",e.jsx("code",{children:'<form action="seubanco.com/transferir" method="POST">'})," ","com auto-submit faz a transferência sem ela saber."]}),e.jsxs("p",{children:["Defesa: gera um ",e.jsx("strong",{children:"token aleatório por sessão"}),", embute em todo form POST e valida no servidor. O ",e.jsx("code",{children:"evil.com"})," não tem como saber o token."]}),e.jsx(s,{filename:"csrf.php",code:`<?php
declare(strict_types=1);

session_start();

function csrfToken(): string {
    if (empty($_SESSION['csrf'])) {
        $_SESSION['csrf'] = bin2hex(random_bytes(32));
    }
    return $_SESSION['csrf'];
}

function csrfCheck(): void {
    $enviado = $_POST['_csrf'] ?? '';
    if (!hash_equals($_SESSION['csrf'] ?? '', $enviado)) {
        http_response_code(419);
        exit('Token CSRF inválido.');
    }
}

function csrfField(): string {
    return '<input type="hidden" name="_csrf" value="' . csrfToken() . '">';
}`}),e.jsx(s,{filename:"form-transferir.php",code:`<?php
declare(strict_types=1);
require __DIR__ . '/csrf.php';

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    csrfCheck();
    transferir((int) $_POST['conta'], (float) $_POST['valor']);
    header('Location: /sucesso');
    exit;
}
?>
<form method="post" action="/transferir.php">
    <?= csrfField() ?>
    <input name="conta" type="text" placeholder="conta destino">
    <input name="valor" type="number" step="0.01">
    <button type="submit">Transferir</button>
</form>`}),e.jsx(o,{url:"http://localhost:8000/transferir.php",children:e.jsxs("form",{children:[e.jsx("input",{type:"hidden",name:"_csrf",value:"a3f9...e7b1"}),e.jsx("div",{style:{marginBottom:8},children:e.jsx("input",{placeholder:"conta destino",style:{padding:"6px 10px",border:"1px solid #ccc",borderRadius:4}})}),e.jsx("div",{style:{marginBottom:8},children:e.jsx("input",{type:"number",placeholder:"valor",style:{padding:"6px 10px",border:"1px solid #ccc",borderRadius:4}})}),e.jsx("button",{type:"button",style:{background:"#2563eb",color:"white",border:0,padding:"8px 14px",borderRadius:4},children:"Transferir"})]})}),e.jsxs(a,{type:"warning",title:"Use hash_equals, não ==",children:["Comparação direta de strings vaza o token via timing attack (cada byte comparado leva tempo diferente). ",e.jsx("code",{children:"hash_equals()"})," compara em tempo constante. Mesma regra do password verify."]}),e.jsx("h2",{children:"SameSite cookies — o segundo escudo do CSRF"}),e.jsxs("p",{children:["Desde 2020, todo navegador moderno respeita o atributo"," ",e.jsx("code",{children:"SameSite"})," nos cookies. Marcando a sessão como"," ",e.jsx("code",{children:"SameSite=Lax"}),", o navegador ",e.jsx("strong",{children:"não envia o cookie"})," ","em requisições POST cross-site — neutralizando CSRF antes mesmo do token entrar em ação."]}),e.jsx(s,{filename:"sessao-segura.php",code:`<?php
declare(strict_types=1);

session_set_cookie_params([
    'lifetime' => 0,
    'path'     => '/',
    'domain'   => '',
    'secure'   => true,        // só HTTPS
    'httponly' => true,        // JS não acessa
    'samesite' => 'Lax',       // ou 'Strict' se sua app não tem login social
]);

session_start();
session_regenerate_id(true);   // troca o ID após login (anti-fixation)`}),e.jsx("h2",{children:"Bonus: command injection e path traversal"}),e.jsxs("p",{children:["Mesmo padrão das três anteriores: ",e.jsx("strong",{children:"nunca"})," passe entrada do usuário direto para ",e.jsx("code",{children:"shell_exec"}),", ",e.jsx("code",{children:"system"}),","," ",e.jsx("code",{children:"include"})," ou ",e.jsx("code",{children:"file_get_contents"})," sem validar."]}),e.jsx(s,{filename:"injection.php",code:`<?php
declare(strict_types=1);

// ❌ command injection
$arquivo = $_GET['arq'];
shell_exec("convert /uploads/$arquivo /thumbs/$arquivo");
// arq=foo.png; rm -rf /  → catástrofe

// ✅ escapeshellarg + whitelist de extensão
$arquivo = $_GET['arq'];
if (!preg_match('/^[a-zA-Z0-9_-]+\\.(png|jpg|jpeg)$/', $arquivo)) {
    http_response_code(400);
    exit('Nome inválido.');
}
$src = escapeshellarg("/uploads/$arquivo");
$dst = escapeshellarg("/thumbs/$arquivo");
shell_exec("convert $src $dst");

// ❌ path traversal
$file = $_GET['view'];
include "/var/www/views/$file.php";
// view=../../../etc/passwd  → leitura do sistema

// ✅ valida com basename + whitelist
$views = ['home', 'sobre', 'contato'];
$view = $_GET['view'] ?? 'home';
if (!in_array($view, $views, true)) {
    http_response_code(404);
    exit('View inexistente.');
}
include "/var/www/views/$view.php";`}),e.jsx("h2",{children:"Cabeçalhos extras que ajudam"}),e.jsx("p",{children:"Combine com headers de segurança (capítulo dedicado):"}),e.jsx(i,{language:"nginx",title:"nginx — headers globais",code:`add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), camera=(), microphone=()" always;`}),e.jsx("h2",{children:"Checklist mental para todo PR"}),e.jsx(a,{type:"success",title:"Antes de mergear, valide",children:e.jsxs("ol",{className:"list-decimal ml-5 mt-1 space-y-1",children:[e.jsx("li",{children:"Toda query usa prepared statement? Identificadores via whitelist?"}),e.jsxs("li",{children:["Toda saída em HTML passa por ",e.jsx("code",{children:"htmlspecialchars()"})," ou Twig?"]}),e.jsxs("li",{children:["Todo form POST tem ",e.jsx("code",{children:"_csrf"})," validado com ",e.jsx("code",{children:"hash_equals()"}),"?"]}),e.jsxs("li",{children:["Cookies de sessão estão ",e.jsx("code",{children:"Secure + HttpOnly + SameSite=Lax"}),"?"]}),e.jsxs("li",{children:["Nenhum ",e.jsx("code",{children:"shell_exec"}),"/",e.jsx("code",{children:"include"})," recebe input cru?"]}),e.jsx("li",{children:"CSP definida (mesmo permissiva pra começar) e em log de violações."})]})}),e.jsxs("p",{children:["No próximo capítulo a gente entra em ",e.jsx("strong",{children:"JWT"})," — como assinar e verificar tokens com a biblioteca ",e.jsx("code",{children:"firebase/php-jwt"}),", e por que eles ",e.jsx("em",{children:"não substituem"})," sessão para tudo."]})]})}export{l as default};
