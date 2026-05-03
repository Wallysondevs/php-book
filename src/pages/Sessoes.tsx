import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { BrowserBlock } from "@/components/ui/BrowserBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Sessoes() {
  return (
    <PageContainer
      title="Sessões e Cookies"
      subtitle="Como manter o usuário logado entre cliques: o ABC de session_start, $_SESSION, regenerate_id contra session fixation e cookies com httponly/secure/samesite."
      difficulty="intermediario"
      timeToRead="13 min"
      category="Web & Banco"
    >
      <AlertBox type="info" title="Pré-requisitos">
          <p>Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP.</p>
        </AlertBox>
        <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"session_start()"}</strong> {' — '} {"inicia/recupera sessão; manda cookie PHPSESSID."}
          </li>
        <li>
            <strong>{"$_SESSION"}</strong> {' — '} {"array superglobal persistido entre requests."}
          </li>
        <li>
            <strong>{"Handler"}</strong> {' — '} {"pode salvar em arquivo (default), Redis, Memcached, banco."}
          </li>
        <li>
            <strong>{"Lifetime"}</strong> {' — '} {"session.gc_maxlifetime + cookie_lifetime no php.ini."}
          </li>
        <li>
            <strong>{"Hijack"}</strong> {' — '} {"regenere ID após login: session_regenerate_id(true)."}
          </li>
        </ul>
          <h2>HTTP é stateless — e por isso a gente precisa de sessões</h2>
      <p>
        Cada requisição HTTP é independente: o servidor não lembra que você acabou de logar
        no clique anterior. A solução é dar ao navegador um <strong>cookie</strong> com um
        identificador, e guardar no servidor o estado vinculado a esse identificador.
        Isso é uma <strong>sessão</strong>.
      </p>

      <h2>Iniciando uma sessão</h2>
      <p>
        A função <code>session_start</code> faz dois movimentos: lê o cookie{" "}
        <code>PHPSESSID</code> do request (criando um se não existir) e popula{" "}
        <code>$_SESSION</code> com os dados persistidos no servidor.
      </p>

      <PhpBlock
        filename="public/contador.php"
        code={`<?php
declare(strict_types=1);

session_start();

$_SESSION['hits'] = ($_SESSION['hits'] ?? 0) + 1;
?>
<!doctype html>
<html lang="pt-br">
<body>
  <h1>Você abriu esta página <?= $_SESSION['hits'] ?> vez(es)</h1>
  <p>Atualize a página para ver o número subir.</p>
</body>
</html>`}
      />

      <BrowserBlock url="http://localhost:8000/contador.php">
        <h1 className="text-2xl font-bold">Você abriu esta página 7 vez(es)</h1>
        <p className="mt-2">Atualize a página para ver o número subir.</p>
      </BrowserBlock>

      <AlertBox type="warning" title="session_start ANTES de qualquer saída">
        Como <code>session_start</code> envia o cookie da sessão (header HTTP), ele precisa
        ser chamado <strong>antes</strong> de qualquer <code>echo</code>, espaço em branco ou
        <code>?&gt;</code> que vire output. Se não, o clássico <em>"headers already sent"</em>.
      </AlertBox>

      <h2>Lendo, gravando e apagando do <code>$_SESSION</code></h2>
      <p>
        É um array PHP comum — você atribui chaves, lê, faz <code>unset</code>:
      </p>

      <PhpBlock
        filename="public/carrinho.php"
        code={`<?php
declare(strict_types=1);

session_start();

// Inicializa
$_SESSION['carrinho'] ??= [];

// Adiciona item
$_SESSION['carrinho'][] = ['sku' => 'A-100', 'qtd' => 2];

// Lê
$itens = $_SESSION['carrinho'];

// Remove um item específico
unset($_SESSION['carrinho'][0]);

// Limpa o carrinho inteiro
$_SESSION['carrinho'] = [];

print_r($_SESSION);`}
        output={`Array
(
    [carrinho] => Array
        (
        )
)`}
      />

      <h2>Logout: <code>session_destroy</code></h2>
      <p>
        Esquecer um detalhe aqui é o erro mais comum. Para um logout completo:
      </p>

      <PhpBlock
        filename="public/logout.php"
        code={`<?php
declare(strict_types=1);

session_start();

// 1) Limpa o array $_SESSION
$_SESSION = [];

// 2) Apaga o cookie da sessão no navegador
if (ini_get('session.use_cookies')) {
    $params = session_get_cookie_params();
    setcookie(session_name(), '', [
        'expires'  => time() - 42000,
        'path'     => $params['path'],
        'domain'   => $params['domain'],
        'secure'   => $params['secure'],
        'httponly' => $params['httponly'],
        'samesite' => $params['samesite'] ?: 'Lax',
    ]);
}

// 3) Destrói o storage no servidor
session_destroy();

header('Location: /login.php', true, 303);
exit;`}
      />

      <p>
        Os três passos juntos garantem que: o array fica vazio na request atual, o cookie
        some no cliente, e o arquivo de sessão é apagado no servidor.
      </p>

      <h2>Session Fixation e <code>regenerate_id</code></h2>
      <p>
        Imagine este ataque: o atacante visita seu site, recebe um <code>PHPSESSID=ABC</code>{" "}
        e envia esse mesmo ID para a vítima por phishing. A vítima loga — mas como o
        <code>PHPSESSID</code> não mudou, agora o atacante tem o ID logado também.
      </p>
      <p>
        A defesa é simples: <strong>regenerar o ID da sessão sempre que o nível de privilégio
        muda</strong> — login, logout, troca de senha, ativação de 2FA.
      </p>

      <PhpBlock
        filename="public/login.php"
        code={`<?php
declare(strict_types=1);

session_start();

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('use POST');
}

$email = filter_input(INPUT_POST, 'email', FILTER_VALIDATE_EMAIL);
$senha = $_POST['senha'] ?? '';

// Em produção, busca no banco e valida com password_verify().
$usuarios = [
    'ada@math.org' => password_hash('s3gr3da', PASSWORD_DEFAULT),
];

if (!$email || !isset($usuarios[$email]) || !password_verify($senha, $usuarios[$email])) {
    http_response_code(401);
    exit('credenciais inválidas');
}

// >>> DEFESA: troca o ID antes de marcar como logado
session_regenerate_id(true); // true = apaga a sessão antiga

$_SESSION['user_id']  = 1;
$_SESSION['user_eml'] = $email;
$_SESSION['logged_at'] = time();

header('Location: /painel.php', true, 303);
exit;`}
      />

      <AlertBox type="danger" title="Sempre regenerate_id no login">
        Sem isso, qualquer aplicação que aceita IDs de sessão da URL ou que tem XSS no domínio
        vira presa fácil. <code>session_regenerate_id(true)</code> custa quase nada e fecha a porta.
      </AlertBox>

      <h2>Cookies à mão: <code>setcookie</code> com flags de segurança</h2>
      <p>
        Cookies não-de-sessão (preferência de tema, idioma, "lembrar e-mail") são gravados
        com <code>setcookie</code>. As três flags abaixo são <strong>não-negociáveis</strong>:
      </p>

      <PhpBlock
        filename="public/preferencia.php"
        code={`<?php
declare(strict_types=1);

setcookie('tema', 'dark', [
    'expires'  => time() + 60 * 60 * 24 * 30, // 30 dias
    'path'     => '/',
    'domain'   => '',           // host atual
    'secure'   => true,         // só envia via HTTPS
    'httponly' => true,         // JS não pode ler (defesa contra XSS)
    'samesite' => 'Lax',        // mitiga CSRF
]);

echo 'cookie de tema gravado';`}
        output={`cookie de tema gravado`}
      />

      <ul>
        <li>
          <strong>secure</strong>: o cookie só sobe pra rede sob HTTPS. Em dev local pode
          deixar <code>false</code>; em produção, sempre <code>true</code>.
        </li>
        <li>
          <strong>httponly</strong>: o JavaScript do navegador <em>não consegue</em> ler esse
          cookie. Mesmo que um XSS aconteça, o cookie não vaza.
        </li>
        <li>
          <strong>samesite</strong>: controla se o cookie é enviado em requisições cross-site.
          <code>Lax</code> é o padrão sensato; <code>Strict</code> é mais rígido;{" "}
          <code>None</code> exige <code>secure=true</code>.
        </li>
      </ul>

      <p>Para apagar um cookie, basta gravar com data passada:</p>

      <PhpBlock
        filename="apagar.php"
        code={`<?php
setcookie('tema', '', [
    'expires'  => time() - 3600,
    'path'     => '/',
    'httponly' => true,
    'secure'   => true,
    'samesite' => 'Lax',
]);`}
      />

      <h2>Configurando a sessão em si</h2>
      <p>
        As mesmas flags valem para o cookie da sessão. A receita ideal vai antes de{" "}
        <code>session_start</code>:
      </p>

      <PhpBlock
        filename="public/bootstrap.php"
        code={`<?php
declare(strict_types=1);

session_set_cookie_params([
    'lifetime' => 0,           // até fechar o navegador
    'path'     => '/',
    'secure'   => true,
    'httponly' => true,
    'samesite' => 'Lax',
]);

ini_set('session.use_strict_mode', '1'); // ignora session IDs inventados pelo cliente
ini_set('session.use_only_cookies', '1'); // nunca aceita session_id na URL

session_start();`}
      />

      <h2>Fluxo completo: login, área restrita, logout</h2>

      <PhpBlock
        filename="public/painel.php"
        code={`<?php
declare(strict_types=1);
require __DIR__ . '/bootstrap.php';

if (!isset($_SESSION['user_id'])) {
    header('Location: /login.php', true, 303);
    exit;
}

// Hardening: regenera ID de tempos em tempos
$idade = time() - ($_SESSION['logged_at'] ?? 0);
if ($idade > 60 * 30) {
    session_regenerate_id(true);
    $_SESSION['logged_at'] = time();
}

$nome = htmlspecialchars($_SESSION['user_eml'], ENT_QUOTES, 'UTF-8');
?>
<!doctype html>
<html lang="pt-br">
<body>
  <h1>Painel</h1>
  <p>Olá, <?= $nome ?></p>
  <a href="/logout.php">Sair</a>
</body>
</html>`}
      />

      <BrowserBlock url="http://localhost:8000/painel.php">
        <h1 className="text-2xl font-bold">Painel</h1>
        <p>Olá, ada@math.org</p>
        <a className="text-blue-700 underline">Sair</a>
      </BrowserBlock>

      <h2>Inspecionando os arquivos de sessão</h2>
      <p>
        Por padrão, o PHP grava sessões em arquivos no diretório do sistema. Em distros Linux
        é geralmente <code>/var/lib/php/sessions</code> ou <code>/tmp</code>.
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="/tmp"
        command="ls -la sess_*"
        output={`-rw------- 1 dev dev 158 Mar 27 16:42 sess_a3f5b8d2e9c1
-rw------- 1 dev dev  98 Mar 27 16:43 sess_b7e1c4d6f2a8`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="/tmp"
        command="cat sess_a3f5b8d2e9c1"
        output={`user_id|i:1;user_eml|s:12:"ada@math.org";logged_at|i:1711564920;`}
      />

      <AlertBox type="info" title="Em produção, use Redis/Memcached">
        Sessões em arquivo não escalam quando você tem mais de um servidor PHP. A solução é
        plugar um handler externo (extensão <code>redis</code> ou <code>memcached</code>) e
        configurar via <code>session.save_handler</code>. A API do PHP é a mesma —{" "}
        <code>$_SESSION</code> continua funcionando.
      </AlertBox>

      <h2>Resumo de bolso</h2>
      <ul>
        <li><code>session_start</code> antes de qualquer output.</li>
        <li><code>session_regenerate_id(true)</code> a cada login/logout.</li>
        <li>Cookies sempre com <code>httponly</code>, <code>secure</code> e <code>samesite</code>.</li>
        <li><code>session_destroy</code> + apagar cookie + zerar <code>$_SESSION</code> no logout.</li>
        <li>Tempo de vida curto + renovação periódica do ID.</li>
      </ul>

      <p>
        No próximo capítulo a gente sai do HTML e mergulha no formato que conecta APIs:{" "}
        <strong>JSON</strong>.
      </p>
    </PageContainer>
  );
}
