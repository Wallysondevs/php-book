import{j as e}from"./index-Bb4MiiJL.js";import{P as r,a as s,A as o}from"./AlertBox-BpD-xIsb.js";import{T as a}from"./TerminalBlock-DGurMC1r.js";import{B as i}from"./BrowserBlock-C5ENTT0j.js";function l(){return e.jsxs(r,{title:"Sessões e Cookies",subtitle:"Como manter o usuário logado entre cliques: o ABC de session_start, $_SESSION, regenerate_id contra session fixation e cookies com httponly/secure/samesite.",difficulty:"intermediario",timeToRead:"13 min",category:"Web & Banco",children:[e.jsx("h2",{children:"HTTP é stateless — e por isso a gente precisa de sessões"}),e.jsxs("p",{children:["Cada requisição HTTP é independente: o servidor não lembra que você acabou de logar no clique anterior. A solução é dar ao navegador um ",e.jsx("strong",{children:"cookie"})," com um identificador, e guardar no servidor o estado vinculado a esse identificador. Isso é uma ",e.jsx("strong",{children:"sessão"}),"."]}),e.jsx("h2",{children:"Iniciando uma sessão"}),e.jsxs("p",{children:["A função ",e.jsx("code",{children:"session_start"})," faz dois movimentos: lê o cookie"," ",e.jsx("code",{children:"PHPSESSID"})," do request (criando um se não existir) e popula"," ",e.jsx("code",{children:"$_SESSION"})," com os dados persistidos no servidor."]}),e.jsx(s,{filename:"public/contador.php",code:`<?php
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
</html>`}),e.jsxs(i,{url:"http://localhost:8000/contador.php",children:[e.jsx("h1",{className:"text-2xl font-bold",children:"Você abriu esta página 7 vez(es)"}),e.jsx("p",{className:"mt-2",children:"Atualize a página para ver o número subir."})]}),e.jsxs(o,{type:"warning",title:"session_start ANTES de qualquer saída",children:["Como ",e.jsx("code",{children:"session_start"})," envia o cookie da sessão (header HTTP), ele precisa ser chamado ",e.jsx("strong",{children:"antes"})," de qualquer ",e.jsx("code",{children:"echo"}),", espaço em branco ou",e.jsx("code",{children:"?>"})," que vire output. Se não, o clássico ",e.jsx("em",{children:'"headers already sent"'}),"."]}),e.jsxs("h2",{children:["Lendo, gravando e apagando do ",e.jsx("code",{children:"$_SESSION"})]}),e.jsxs("p",{children:["É um array PHP comum — você atribui chaves, lê, faz ",e.jsx("code",{children:"unset"}),":"]}),e.jsx(s,{filename:"public/carrinho.php",code:`<?php
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

print_r($_SESSION);`,output:`Array
(
    [carrinho] => Array
        (
        )
)`}),e.jsxs("h2",{children:["Logout: ",e.jsx("code",{children:"session_destroy"})]}),e.jsx("p",{children:"Esquecer um detalhe aqui é o erro mais comum. Para um logout completo:"}),e.jsx(s,{filename:"public/logout.php",code:`<?php
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
exit;`}),e.jsx("p",{children:"Os três passos juntos garantem que: o array fica vazio na request atual, o cookie some no cliente, e o arquivo de sessão é apagado no servidor."}),e.jsxs("h2",{children:["Session Fixation e ",e.jsx("code",{children:"regenerate_id"})]}),e.jsxs("p",{children:["Imagine este ataque: o atacante visita seu site, recebe um ",e.jsx("code",{children:"PHPSESSID=ABC"})," ","e envia esse mesmo ID para a vítima por phishing. A vítima loga — mas como o",e.jsx("code",{children:"PHPSESSID"})," não mudou, agora o atacante tem o ID logado também."]}),e.jsxs("p",{children:["A defesa é simples: ",e.jsx("strong",{children:"regenerar o ID da sessão sempre que o nível de privilégio muda"})," — login, logout, troca de senha, ativação de 2FA."]}),e.jsx(s,{filename:"public/login.php",code:`<?php
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
exit;`}),e.jsxs(o,{type:"danger",title:"Sempre regenerate_id no login",children:["Sem isso, qualquer aplicação que aceita IDs de sessão da URL ou que tem XSS no domínio vira presa fácil. ",e.jsx("code",{children:"session_regenerate_id(true)"})," custa quase nada e fecha a porta."]}),e.jsxs("h2",{children:["Cookies à mão: ",e.jsx("code",{children:"setcookie"})," com flags de segurança"]}),e.jsxs("p",{children:['Cookies não-de-sessão (preferência de tema, idioma, "lembrar e-mail") são gravados com ',e.jsx("code",{children:"setcookie"}),". As três flags abaixo são ",e.jsx("strong",{children:"não-negociáveis"}),":"]}),e.jsx(s,{filename:"public/preferencia.php",code:`<?php
declare(strict_types=1);

setcookie('tema', 'dark', [
    'expires'  => time() + 60 * 60 * 24 * 30, // 30 dias
    'path'     => '/',
    'domain'   => '',           // host atual
    'secure'   => true,         // só envia via HTTPS
    'httponly' => true,         // JS não pode ler (defesa contra XSS)
    'samesite' => 'Lax',        // mitiga CSRF
]);

echo 'cookie de tema gravado';`,output:"cookie de tema gravado"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"secure"}),": o cookie só sobe pra rede sob HTTPS. Em dev local pode deixar ",e.jsx("code",{children:"false"}),"; em produção, sempre ",e.jsx("code",{children:"true"}),"."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"httponly"}),": o JavaScript do navegador ",e.jsx("em",{children:"não consegue"})," ler esse cookie. Mesmo que um XSS aconteça, o cookie não vaza."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"samesite"}),": controla se o cookie é enviado em requisições cross-site.",e.jsx("code",{children:"Lax"})," é o padrão sensato; ",e.jsx("code",{children:"Strict"})," é mais rígido;"," ",e.jsx("code",{children:"None"})," exige ",e.jsx("code",{children:"secure=true"}),"."]})]}),e.jsx("p",{children:"Para apagar um cookie, basta gravar com data passada:"}),e.jsx(s,{filename:"apagar.php",code:`<?php
setcookie('tema', '', [
    'expires'  => time() - 3600,
    'path'     => '/',
    'httponly' => true,
    'secure'   => true,
    'samesite' => 'Lax',
]);`}),e.jsx("h2",{children:"Configurando a sessão em si"}),e.jsxs("p",{children:["As mesmas flags valem para o cookie da sessão. A receita ideal vai antes de"," ",e.jsx("code",{children:"session_start"}),":"]}),e.jsx(s,{filename:"public/bootstrap.php",code:`<?php
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

session_start();`}),e.jsx("h2",{children:"Fluxo completo: login, área restrita, logout"}),e.jsx(s,{filename:"public/painel.php",code:`<?php
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
</html>`}),e.jsxs(i,{url:"http://localhost:8000/painel.php",children:[e.jsx("h1",{className:"text-2xl font-bold",children:"Painel"}),e.jsx("p",{children:"Olá, ada@math.org"}),e.jsx("a",{className:"text-blue-700 underline",children:"Sair"})]}),e.jsx("h2",{children:"Inspecionando os arquivos de sessão"}),e.jsxs("p",{children:["Por padrão, o PHP grava sessões em arquivos no diretório do sistema. Em distros Linux é geralmente ",e.jsx("code",{children:"/var/lib/php/sessions"})," ou ",e.jsx("code",{children:"/tmp"}),"."]}),e.jsx(a,{user:"dev",host:"php",cwd:"/tmp",command:"ls -la sess_*",output:`-rw------- 1 dev dev 158 Mar 27 16:42 sess_a3f5b8d2e9c1
-rw------- 1 dev dev  98 Mar 27 16:43 sess_b7e1c4d6f2a8`}),e.jsx(a,{user:"dev",host:"php",cwd:"/tmp",command:"cat sess_a3f5b8d2e9c1",output:'user_id|i:1;user_eml|s:12:"ada@math.org";logged_at|i:1711564920;'}),e.jsxs(o,{type:"info",title:"Em produção, use Redis/Memcached",children:["Sessões em arquivo não escalam quando você tem mais de um servidor PHP. A solução é plugar um handler externo (extensão ",e.jsx("code",{children:"redis"})," ou ",e.jsx("code",{children:"memcached"}),") e configurar via ",e.jsx("code",{children:"session.save_handler"}),". A API do PHP é a mesma —"," ",e.jsx("code",{children:"$_SESSION"})," continua funcionando."]}),e.jsx("h2",{children:"Resumo de bolso"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"session_start"})," antes de qualquer output."]}),e.jsxs("li",{children:[e.jsx("code",{children:"session_regenerate_id(true)"})," a cada login/logout."]}),e.jsxs("li",{children:["Cookies sempre com ",e.jsx("code",{children:"httponly"}),", ",e.jsx("code",{children:"secure"})," e ",e.jsx("code",{children:"samesite"}),"."]}),e.jsxs("li",{children:[e.jsx("code",{children:"session_destroy"})," + apagar cookie + zerar ",e.jsx("code",{children:"$_SESSION"})," no logout."]}),e.jsx("li",{children:"Tempo de vida curto + renovação periódica do ID."})]}),e.jsxs("p",{children:["No próximo capítulo a gente sai do HTML e mergulha no formato que conecta APIs:"," ",e.jsx("strong",{children:"JSON"}),"."]})]})}export{l as default};
