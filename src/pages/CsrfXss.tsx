import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { BrowserBlock } from "@/components/ui/BrowserBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function CsrfXss() {
  return (
    <PageContainer
      title="CSRF, XSS e SQL Injection"
      subtitle="Os três grandes inimigos de toda aplicação web em PHP — como cada um funciona, exemplos vulneráveis lado a lado com a versão segura, e os padrões que acabam com 95% dos buracos."
      difficulty="avancado"
      timeToRead="14 min"
      category="Segurança"
    >
      <AlertBox type="info" title="Pré-requisitos">
          <p>Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP.</p>
        </AlertBox>
        <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"CSRF"}</strong> {' — '} {"forçar usuário logado a executar ação sem querer."}
          </li>
        <li>
            <strong>{"Token CSRF"}</strong> {' — '} {"valor secreto por sessão checado em cada POST."}
          </li>
        <li>
            <strong>{"XSS"}</strong> {' — '} {"injetar JS na página através de input não escapado."}
          </li>
        <li>
            <strong>{"htmlspecialchars()"}</strong> {' — '} {"escapa <, >, \", & — base de defesa contra XSS."}
          </li>
        <li>
            <strong>{"CSP"}</strong> {' — '} {"Content-Security-Policy — header que limita scripts permitidos."}
          </li>
        </ul>
          <h2>Por que esses três (e não outros)</h2>
      <p>
        O OWASP Top 10 muda de ano em ano, mas <strong>injeção</strong> (SQL e
        comandos), <strong>XSS</strong> (cross-site scripting) e <strong>CSRF</strong>
        (cross-site request forgery) continuam sendo os campeões de incidentes em
        apps PHP. A boa notícia: cada um tem uma defesa <em>simples e mecânica</em>{" "}
        que, aplicada disciplinadamente, fecha o buraco. Vamos por partes.
      </p>

      <h2>1. SQL Injection — sempre prepared, nunca concatenação</h2>
      <p>
        SQL injection acontece quando você concatena entrada do usuário direto na
        query. O atacante envia <code>' OR '1'='1</code> no campo de e-mail e a sua
        consulta vira algo bem diferente do que você imaginou.
      </p>

      <PhpBlock
        filename="vulneravel.php"
        code={`<?php
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
// → retorna o primeiro usuário do banco. Game over.`}
      />

      <PhpBlock
        filename="seguro.php"
        code={`<?php
declare(strict_types=1);

// ✅ SEGURO — prepared statement com placeholders
$stmt = $pdo->prepare('SELECT id, email FROM users WHERE email = ? AND ativo = 1');
$stmt->execute([$_POST['email']]);
$user = $stmt->fetch(\\PDO::FETCH_ASSOC);

// Os valores nunca viram parte da string SQL.
// O driver envia o template e os parâmetros separados ao MySQL/Postgres.
// É impossível injetar SQL por aqui.

var_dump($user);`}
        output={`array(2) {
  ["id"]=>
  int(42)
  ["email"]=>
  string(15) "ada@example.com"
}`}
      />

      <p>
        Use placeholders nomeados quando a query tem muitos parâmetros — fica mais
        legível e não importa a ordem:
      </p>

      <PhpBlock
        filename="prepared-nomeados.php"
        code={`<?php
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

echo "Post #" . $pdo->lastInsertId() . " criado." . PHP_EOL;`}
        output={`Post #318 criado.`}
      />

      <AlertBox type="warning" title="E o ORDER BY dinâmico?">
        Placeholders só funcionam para <em>valores</em>, nunca para <em>identificadores</em>{" "}
        (nomes de colunas, tabelas, <code>ASC</code>/<code>DESC</code>). Para esses,
        valide contra uma <strong>whitelist</strong>: <code>match($coluna) &#123; 'nome', 'data' =&gt; $coluna, default =&gt; 'id' &#125;</code>.
      </AlertBox>

      <PhpBlock
        filename="ordenacao-segura.php"
        code={`<?php
declare(strict_types=1);

// ❌ NUNCA: $sql = "SELECT * FROM users ORDER BY {$_GET['ordem']}";

// ✅ Whitelist — só essas colunas são aceitas
$colunasOk = ['nome', 'email', 'criado_em'];
$coluna    = in_array($_GET['ordem'] ?? 'nome', $colunasOk, true) ? $_GET['ordem'] : 'nome';
$direcao   = ($_GET['dir'] ?? 'asc') === 'desc' ? 'DESC' : 'ASC';

$sql = "SELECT * FROM users ORDER BY $coluna $direcao";
$res = $pdo->query($sql);`}
      />

      <h2>2. XSS — sempre escape na saída</h2>
      <p>
        Cross-site scripting acontece quando você devolve dados controlados pelo
        usuário direto no HTML. Se eu mando <code>&lt;script&gt;fetch('/api/transferir?valor=1000')&lt;/script&gt;</code>{" "}
        como meu nome de usuário, e a sua página renderiza <code>&lt;h1&gt;Olá, $nome&lt;/h1&gt;</code>{" "}
        — o navegador da próxima vítima executa meu script com a sessão dela.
      </p>

      <PhpBlock
        filename="xss-vulneravel.php"
        code={`<?php
declare(strict_types=1);

$busca = $_GET['q'] ?? '';
?>
<!DOCTYPE html>
<html lang="pt-br">
<body>
<h1>Resultados para: <?= $busca ?></h1>
<!-- ❌ Atacante manda  ?q=<script>alert('xss')</script>
     e o script roda no navegador da vítima. -->
</body>
</html>`}
      />

      <PhpBlock
        filename="xss-seguro.php"
        code={`<?php
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
<!-- ✅ <script>alert('xss')</script> vira
     &lt;script&gt;alert(&#039;xss&#039;)&lt;/script&gt;
     e aparece como texto literal. -->
</body>
</html>`}
      />

      <BrowserBlock url="http://localhost:8000/?q=<script>alert('xss')</script>">
        <h1 style={{ fontSize: "1.5rem", fontWeight: 700, marginBottom: "0.5rem" }}>
          Resultados para: &lt;script&gt;alert('xss')&lt;/script&gt;
        </h1>
        <p style={{ color: "#555" }}>Nada perigoso — está renderizado como texto.</p>
      </BrowserBlock>

      <AlertBox type="info" title="Crie um helper curto">
        <code>htmlspecialchars(...)</code> em todo lugar polui. A maioria dos
        projetos define uma função <code>e()</code> ou usa um template engine
        (Twig/Blade) que escapa por padrão. Em <strong>Twig</strong>, <code>&#123;&#123; user.nome &#125;&#125;</code>{" "}
        já escapa; só desliga com <code>|raw</code>.
      </AlertBox>

      <h2>Defesa em profundidade: Content-Security-Policy</h2>
      <p>
        Mesmo com escape correto, um único <code>|raw</code> esquecido é o
        suficiente. A segunda camada é o header <strong>CSP</strong>: você diz ao
        navegador quais origens podem executar scripts, e ele bloqueia tudo o que
        sair da lista — inclusive <code>&lt;script&gt;inline&lt;/script&gt;</code>.
      </p>

      <PhpBlock
        filename="bootstrap.php"
        code={`<?php
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
);`}
      />

      <h2>3. CSRF — token por sessão validado em forms POST</h2>
      <p>
        CSRF é o ataque onde um site malicioso faz o navegador da vítima enviar uma
        requisição para o seu site, aproveitando o cookie de sessão dela. Se a
        vítima está logada no seu banco e visita <code>evil.com</code>, um{" "}
        <code>&lt;form action="seubanco.com/transferir" method="POST"&gt;</code>{" "}
        com auto-submit faz a transferência sem ela saber.
      </p>
      <p>
        Defesa: gera um <strong>token aleatório por sessão</strong>, embute em todo
        form POST e valida no servidor. O <code>evil.com</code> não tem como saber
        o token.
      </p>

      <PhpBlock
        filename="csrf.php"
        code={`<?php
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
}`}
      />

      <PhpBlock
        filename="form-transferir.php"
        code={`<?php
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
</form>`}
      />

      <BrowserBlock url="http://localhost:8000/transferir.php">
        <form>
          <input type="hidden" name="_csrf" value="a3f9...e7b1" />
          <div style={{ marginBottom: 8 }}>
            <input
              placeholder="conta destino"
              style={{ padding: "6px 10px", border: "1px solid #ccc", borderRadius: 4 }}
            />
          </div>
          <div style={{ marginBottom: 8 }}>
            <input
              type="number"
              placeholder="valor"
              style={{ padding: "6px 10px", border: "1px solid #ccc", borderRadius: 4 }}
            />
          </div>
          <button
            type="button"
            style={{
              background: "#2563eb",
              color: "white",
              border: 0,
              padding: "8px 14px",
              borderRadius: 4,
            }}
          >
            Transferir
          </button>
        </form>
      </BrowserBlock>

      <AlertBox type="warning" title="Use hash_equals, não ==">
        Comparação direta de strings vaza o token via timing attack (cada byte
        comparado leva tempo diferente). <code>hash_equals()</code> compara em
        tempo constante. Mesma regra do password verify.
      </AlertBox>

      <h2>SameSite cookies — o segundo escudo do CSRF</h2>
      <p>
        Desde 2020, todo navegador moderno respeita o atributo{" "}
        <code>SameSite</code> nos cookies. Marcando a sessão como{" "}
        <code>SameSite=Lax</code>, o navegador <strong>não envia o cookie</strong>{" "}
        em requisições POST cross-site — neutralizando CSRF antes mesmo do token
        entrar em ação.
      </p>

      <PhpBlock
        filename="sessao-segura.php"
        code={`<?php
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
session_regenerate_id(true);   // troca o ID após login (anti-fixation)`}
      />

      <h2>Bonus: command injection e path traversal</h2>
      <p>
        Mesmo padrão das três anteriores: <strong>nunca</strong> passe entrada do
        usuário direto para <code>shell_exec</code>, <code>system</code>,{" "}
        <code>include</code> ou <code>file_get_contents</code> sem validar.
      </p>

      <PhpBlock
        filename="injection.php"
        code={`<?php
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
include "/var/www/views/$view.php";`}
      />

      <h2>Cabeçalhos extras que ajudam</h2>
      <p>Combine com headers de segurança (capítulo dedicado):</p>

      <CodeBlock
        language="nginx"
        title="nginx — headers globais"
        code={`add_header X-Content-Type-Options "nosniff" always;
add_header X-Frame-Options "DENY" always;
add_header Referrer-Policy "strict-origin-when-cross-origin" always;
add_header Permissions-Policy "geolocation=(), camera=(), microphone=()" always;`}
      />

      <h2>Checklist mental para todo PR</h2>

      <AlertBox type="success" title="Antes de mergear, valide">
        <ol className="list-decimal ml-5 mt-1 space-y-1">
          <li>Toda query usa prepared statement? Identificadores via whitelist?</li>
          <li>Toda saída em HTML passa por <code>htmlspecialchars()</code> ou Twig?</li>
          <li>Todo form POST tem <code>_csrf</code> validado com <code>hash_equals()</code>?</li>
          <li>Cookies de sessão estão <code>Secure + HttpOnly + SameSite=Lax</code>?</li>
          <li>Nenhum <code>shell_exec</code>/<code>include</code> recebe input cru?</li>
          <li>CSP definida (mesmo permissiva pra começar) e em log de violações.</li>
        </ol>
      </AlertBox>

      <p>
        No próximo capítulo a gente entra em <strong>JWT</strong> — como assinar e
        verificar tokens com a biblioteca <code>firebase/php-jwt</code>, e por que
        eles <em>não substituem</em> sessão para tudo.
      </p>
    </PageContainer>
  );
}
