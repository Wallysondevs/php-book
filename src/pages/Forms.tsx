import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { BrowserBlock } from "@/components/ui/BrowserBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Forms() {
  return (
    <PageContainer
      title="Formulários ($_GET, $_POST)"
      subtitle="A web é feita de formulários: do search até o checkout. Aqui você aprende a receber dados de forma segura, validar com filter_input e blindar contra XSS."
      difficulty="intermediario"
      timeToRead="13 min"
      category="Web & Banco"
    >
      <h2>O básico: um formulário e quem o recebe</h2>
      <p>
        O navegador envia dados via dois métodos principais: <strong>GET</strong> (na URL) e{" "}
        <strong>POST</strong> (no corpo da requisição). PHP expõe esses dados nos
        super-globais <code>$_GET</code> e <code>$_POST</code>.
      </p>

      <PhpBlock
        filename="public/contato.php"
        code={`<?php
declare(strict_types=1);
?>
<!doctype html>
<html lang="pt-br">
<head><meta charset="utf-8"><title>Contato</title></head>
<body>
  <h1>Fale com a gente</h1>
  <form action="/enviar.php" method="post">
    <label>Nome: <input name="nome" required></label><br>
    <label>Email: <input name="email" type="email" required></label><br>
    <label>Idade: <input name="idade" type="number" min="1"></label><br>
    <label>Mensagem:<br>
      <textarea name="msg" rows="4" required></textarea>
    </label><br>
    <button type="submit">Enviar</button>
  </form>
</body>
</html>`}
      />

      <BrowserBlock url="http://localhost:8000/contato.php">
        <h1 className="text-2xl font-bold mb-3">Fale com a gente</h1>
        <div className="space-y-2">
          <div>Nome: <input className="border px-2 py-1 rounded" defaultValue="Ada" /></div>
          <div>Email: <input className="border px-2 py-1 rounded" defaultValue="ada@math.org" /></div>
          <div>Idade: <input className="border px-2 py-1 rounded" defaultValue="36" /></div>
          <div>Mensagem:<br/>
            <textarea className="border px-2 py-1 rounded w-full" rows={3} defaultValue="Quero saber mais." />
          </div>
          <button className="bg-blue-600 text-white px-4 py-1 rounded mt-2">Enviar</button>
        </div>
      </BrowserBlock>

      <h2>GET vs POST — qual usar?</h2>
      <ul>
        <li>
          <strong>GET</strong>: ideal para <em>buscas</em> e <em>filtros</em>. Os dados viram
          parte da URL (<code>?q=php&amp;page=2</code>), são compartilháveis, ficam no histórico
          do navegador e são cacheáveis. Limite prático de ~2KB.
        </li>
        <li>
          <strong>POST</strong>: ideal para <em>criar/alterar</em> dados. Vai no corpo da
          requisição, não aparece na URL, suporta payloads grandes e arquivos.
        </li>
      </ul>

      <p>
        Regra mental: se a ação <strong>muda algo no servidor</strong> (cadastro, login, deletar),
        use <strong>POST</strong>. Se só <strong>lê</strong>, use <strong>GET</strong>.
      </p>

      <h2>Lendo dados de POST</h2>

      <PhpBlock
        filename="public/enviar.php"
        code={`<?php
declare(strict_types=1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('Método não permitido');
}

$nome  = trim($_POST['nome']  ?? '');
$email = trim($_POST['email'] ?? '');
$idade = (int) ($_POST['idade'] ?? 0);
$msg   = trim($_POST['msg']   ?? '');

if ($nome === '' || $email === '' || $msg === '') {
    http_response_code(400);
    exit('Preencha todos os campos.');
}

echo "Recebido de {$nome} ({$email})" . PHP_EOL;
echo "Idade: {$idade}" . PHP_EOL;
echo "Mensagem: {$msg}" . PHP_EOL;`}
        output={`Recebido de Ada (ada@math.org)
Idade: 36
Mensagem: Quero saber mais.`}
      />

      <AlertBox type="info" title="Por que o ?? '' em todo lugar?">
        Se a chave não existir em <code>$_POST</code>, acessar diretamente lança um warning.
        O operador <code>??</code> (null coalescing) devolve o valor default sem ruído. É padrão
        em código profissional.
      </AlertBox>

      <h2>O perigo XSS — e <code>htmlspecialchars</code></h2>
      <p>
        Se você ecoa qualquer coisa que veio do usuário direto no HTML, abre uma porteira para
        <strong> Cross-Site Scripting (XSS)</strong>. Olha o estrago:
      </p>

      <PhpBlock
        filename="public/inseguro.php"
        code={`<?php
declare(strict_types=1);

$nome = $_GET['nome'] ?? 'visitante';
echo "<h1>Olá, $nome!</h1>";`}
      />

      <p>
        Se o usuário acessar{" "}
        <code>?nome=&lt;script&gt;alert('hack')&lt;/script&gt;</code>, o navegador vai executar
        o JavaScript no contexto do seu site. Roubar cookies, redirecionar — tudo possível.
      </p>

      <PhpBlock
        filename="public/seguro.php"
        code={`<?php
declare(strict_types=1);

$nome = $_GET['nome'] ?? 'visitante';
$nomeSeguro = htmlspecialchars($nome, ENT_QUOTES | ENT_HTML5, 'UTF-8');

echo "<h1>Olá, {$nomeSeguro}!</h1>";`}
      />

      <BrowserBlock url="http://localhost:8000/seguro.php?nome=<script>alert('hack')</script>">
        <h1 className="text-2xl font-bold">{`Olá, <script>alert('hack')</script>!`}</h1>
      </BrowserBlock>

      <p>
        O <code>htmlspecialchars</code> converte <code>&lt;</code>, <code>&gt;</code>,{" "}
        <code>"</code>, <code>'</code> e <code>&amp;</code> em entidades HTML. O navegador
        renderiza como texto, não como código.
      </p>

      <AlertBox type="warning" title="Regra prática">
        Sempre escape ao <strong>imprimir</strong>, nunca ao <strong>salvar</strong>. Os
        dados ficam crus no banco e são tratados na hora da renderização.
      </AlertBox>

      <h2>Validação com <code>filter_input</code></h2>
      <p>
        PHP traz validadores nativos para os formatos mais comuns. Use{" "}
        <code>filter_input</code> em vez de acessar <code>$_POST</code> direto e ganhe validação
        gratuitamente:
      </p>

      <PhpBlock
        filename="public/validar.php"
        code={`<?php
declare(strict_types=1);

$email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
$idade = filter_input(INPUT_POST, 'idade', FILTER_VALIDATE_INT, [
    'options' => ['min_range' => 1, 'max_range' => 130],
]);
$site  = filter_input(INPUT_POST, 'site', FILTER_VALIDATE_URL);
$ip    = filter_input(INPUT_POST, 'ip',   FILTER_VALIDATE_IP);

$erros = [];
if ($email === false || $email === null) $erros[] = 'email inválido';
if ($idade === false || $idade === null) $erros[] = 'idade fora do intervalo';
if ($site  === false)                    $erros[] = 'URL inválida';
if ($ip    === false)                    $erros[] = 'IP inválido';

if ($erros) {
    http_response_code(422);
    echo implode(PHP_EOL, $erros);
    exit;
}

echo "tudo válido: $email, $idade anos, $site, $ip" . PHP_EOL;`}
        output={`tudo válido: ada@math.org, 36 anos, https://ada.dev, 192.168.0.1`}
      />

      <p>
        <code>filter_input</code> retorna <code>false</code> quando a validação falha,{" "}
        <code>null</code> quando o campo não existe, ou o <strong>valor já no tipo correto</strong>{" "}
        (int, no caso do <code>FILTER_VALIDATE_INT</code>).
      </p>

      <h2>$_REQUEST: o coringa que você quase nunca quer</h2>
      <p>
        <code>$_REQUEST</code> mistura <code>$_GET</code>, <code>$_POST</code> e{" "}
        <code>$_COOKIE</code>. Parece prático, mas é uma fonte de bugs sutis: você nunca sabe
        de onde o dado veio. <strong>Prefira</strong> sempre o super-global específico.
      </p>

      <PhpBlock
        filename="evitar.php"
        code={`<?php
// Evite — quem mandou o id? GET? POST? Cookie?
$id = $_REQUEST['id'] ?? null;

// Prefira — explícito sobre a origem.
$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);`}
      />

      <h2>O padrão Post-Redirect-Get (PRG)</h2>
      <p>
        Quando o usuário envia um POST com sucesso e dá <em>F5</em>, o navegador pergunta
        se quer reenviar — e a maioria clica "ok" sem ler. Resultado: pedido duplicado, post
        em dobro, cobrança replicada.
      </p>
      <p>
        A solução é processar o POST e <strong>redirecionar com 303 (ou 302)</strong> para uma
        página GET de confirmação. O F5 agora apenas recarrega a página de confirmação.
      </p>

      <PhpBlock
        filename="public/criar-post.php"
        code={`<?php
declare(strict_types=1);
session_start();

if ($_SERVER['REQUEST_METHOD'] === 'POST') {
    $titulo = trim($_POST['titulo'] ?? '');
    $corpo  = trim($_POST['corpo']  ?? '');

    if ($titulo === '' || $corpo === '') {
        $_SESSION['flash_error'] = 'Preencha todos os campos.';
        header('Location: /novo.php', true, 303);
        exit;
    }

    // ... aqui salva no banco ...

    $_SESSION['flash_success'] = "Post \\"{$titulo}\\" publicado!";
    header('Location: /sucesso.php', true, 303);
    exit;
}

http_response_code(405);
exit('Use POST.');`}
      />

      <PhpBlock
        filename="public/sucesso.php"
        code={`<?php
declare(strict_types=1);
session_start();

$msg = $_SESSION['flash_success'] ?? null;
unset($_SESSION['flash_success']);
?>
<!doctype html>
<html lang="pt-br">
<body>
  <?php if ($msg): ?>
    <div class="ok"><?= htmlspecialchars($msg, ENT_QUOTES, 'UTF-8') ?></div>
  <?php endif ?>
  <a href="/">Voltar</a>
</body>
</html>`}
      />

      <BrowserBlock url="http://localhost:8000/sucesso.php">
        <div className="bg-green-100 border border-green-400 text-green-800 p-3 rounded mb-2">
          {`Post "Lançamos o blog!" publicado!`}
        </div>
        <a className="text-blue-700 underline">Voltar</a>
      </BrowserBlock>

      <AlertBox type="success" title="Receita PRG">
        <ol className="list-decimal ml-5 mt-1 space-y-1">
          <li>Recebe POST</li>
          <li>Valida</li>
          <li>Persiste</li>
          <li><code>header('Location: ...', true, 303); exit;</code></li>
        </ol>
        Sem o <code>exit</code> o script continua executando depois do redirect.
      </AlertBox>

      <h2>Subindo o servidor para testar</h2>
      <p>
        Não precisa Apache nem Nginx para experimentar. PHP traz um servidor embutido:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/forms"
        command="php -S localhost:8000 -t public"
        output={`[Thu Mar 27 16:00:00 2025] PHP 8.4.2 Development Server (http://localhost:8000) started
[Thu Mar 27 16:00:12 2025] 127.0.0.1:54321 [200]: GET /contato.php
[Thu Mar 27 16:00:18 2025] 127.0.0.1:54322 [303]: POST /enviar.php
[Thu Mar 27 16:00:18 2025] 127.0.0.1:54323 [200]: GET /sucesso.php`}
      />

      <h2>Checklist final de um formulário decente</h2>
      <ul>
        <li>Use <code>method="post"</code> para mudanças de estado.</li>
        <li>Cheque <code>$_SERVER['REQUEST_METHOD']</code> antes de processar.</li>
        <li>Valide com <code>filter_input</code>/<code>FILTER_VALIDATE_*</code>.</li>
        <li>Escape com <code>htmlspecialchars</code> ao imprimir.</li>
        <li>Use Post-Redirect-Get para fluxos de submissão.</li>
        <li>Ainda falta CSRF token — assunto do capítulo de Sessões.</li>
      </ul>
    </PageContainer>
  );
}
