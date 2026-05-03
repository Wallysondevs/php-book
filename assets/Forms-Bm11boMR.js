import{j as e}from"./index-B5-q-eol.js";import{P as i,A as o,a as s}from"./AlertBox-CVbFLZEd.js";import{T as a}from"./TerminalBlock-6fqVIX2R.js";import{B as r}from"./BrowserBlock-pEcgE37D.js";function n(){return e.jsxs(i,{title:"Formulários ($_GET, $_POST)",subtitle:"A web é feita de formulários: do search até o checkout. Aqui você aprende a receber dados de forma segura, validar com filter_input e blindar contra XSS.",difficulty:"intermediario",timeToRead:"13 min",category:"Web & Banco",children:[e.jsx(o,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"$_GET / $_POST"})," "," — "," ","arrays com dados de URL/body."]}),e.jsxs("li",{children:[e.jsx("strong",{children:'enctype="multipart/form-data"'})," "," — "," ","obrigatório para upload de arquivos."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"CSRF"})," "," — "," ","token único por sessão para evitar requisições forjadas."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Validação"})," "," — "," ","sempre no servidor — front-end valida só por UX."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"htmlspecialchars()"})," "," — "," ","escapa output para evitar XSS."]})]}),e.jsx("h2",{children:"O básico: um formulário e quem o recebe"}),e.jsxs("p",{children:["O navegador envia dados via dois métodos principais: ",e.jsx("strong",{children:"GET"})," (na URL) e"," ",e.jsx("strong",{children:"POST"})," (no corpo da requisição). PHP expõe esses dados nos super-globais ",e.jsx("code",{children:"$_GET"})," e ",e.jsx("code",{children:"$_POST"}),"."]}),e.jsx(s,{filename:"public/contato.php",code:`<?php
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
</html>`}),e.jsxs(r,{url:"http://localhost:8000/contato.php",children:[e.jsx("h1",{className:"text-2xl font-bold mb-3",children:"Fale com a gente"}),e.jsxs("div",{className:"space-y-2",children:[e.jsxs("div",{children:["Nome: ",e.jsx("input",{className:"border px-2 py-1 rounded",defaultValue:"Ada"})]}),e.jsxs("div",{children:["Email: ",e.jsx("input",{className:"border px-2 py-1 rounded",defaultValue:"ada@math.org"})]}),e.jsxs("div",{children:["Idade: ",e.jsx("input",{className:"border px-2 py-1 rounded",defaultValue:"36"})]}),e.jsxs("div",{children:["Mensagem:",e.jsx("br",{}),e.jsx("textarea",{className:"border px-2 py-1 rounded w-full",rows:3,defaultValue:"Quero saber mais."})]}),e.jsx("button",{className:"bg-blue-600 text-white px-4 py-1 rounded mt-2",children:"Enviar"})]})]}),e.jsx("h2",{children:"GET vs POST — qual usar?"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"GET"}),": ideal para ",e.jsx("em",{children:"buscas"})," e ",e.jsx("em",{children:"filtros"}),". Os dados viram parte da URL (",e.jsx("code",{children:"?q=php&page=2"}),"), são compartilháveis, ficam no histórico do navegador e são cacheáveis. Limite prático de ~2KB."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"POST"}),": ideal para ",e.jsx("em",{children:"criar/alterar"})," dados. Vai no corpo da requisição, não aparece na URL, suporta payloads grandes e arquivos."]})]}),e.jsxs("p",{children:["Regra mental: se a ação ",e.jsx("strong",{children:"muda algo no servidor"})," (cadastro, login, deletar), use ",e.jsx("strong",{children:"POST"}),". Se só ",e.jsx("strong",{children:"lê"}),", use ",e.jsx("strong",{children:"GET"}),"."]}),e.jsx("h2",{children:"Lendo dados de POST"}),e.jsx(s,{filename:"public/enviar.php",code:`<?php
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
echo "Mensagem: {$msg}" . PHP_EOL;`,output:`Recebido de Ada (ada@math.org)
Idade: 36
Mensagem: Quero saber mais.`}),e.jsxs(o,{type:"info",title:"Por que o ?? '' em todo lugar?",children:["Se a chave não existir em ",e.jsx("code",{children:"$_POST"}),", acessar diretamente lança um warning. O operador ",e.jsx("code",{children:"??"})," (null coalescing) devolve o valor default sem ruído. É padrão em código profissional."]}),e.jsxs("h2",{children:["O perigo XSS — e ",e.jsx("code",{children:"htmlspecialchars"})]}),e.jsxs("p",{children:["Se você ecoa qualquer coisa que veio do usuário direto no HTML, abre uma porteira para",e.jsx("strong",{children:" Cross-Site Scripting (XSS)"}),". Olha o estrago:"]}),e.jsx(s,{filename:"public/inseguro.php",code:`<?php
declare(strict_types=1);

$nome = $_GET['nome'] ?? 'visitante';
echo "<h1>Olá, $nome!</h1>";`}),e.jsxs("p",{children:["Se o usuário acessar"," ",e.jsx("code",{children:"?nome=<script>alert('hack')<\/script>"}),", o navegador vai executar o JavaScript no contexto do seu site. Roubar cookies, redirecionar — tudo possível."]}),e.jsx(s,{filename:"public/seguro.php",code:`<?php
declare(strict_types=1);

$nome = $_GET['nome'] ?? 'visitante';
$nomeSeguro = htmlspecialchars($nome, ENT_QUOTES | ENT_HTML5, 'UTF-8');

echo "<h1>Olá, {$nomeSeguro}!</h1>";`}),e.jsx(r,{url:"http://localhost:8000/seguro.php?nome=<script>alert('hack')<\/script>",children:e.jsx("h1",{className:"text-2xl font-bold",children:"Olá, <script>alert('hack')<\/script>!"})}),e.jsxs("p",{children:["O ",e.jsx("code",{children:"htmlspecialchars"})," converte ",e.jsx("code",{children:"<"}),", ",e.jsx("code",{children:">"}),","," ",e.jsx("code",{children:'"'}),", ",e.jsx("code",{children:"'"})," e ",e.jsx("code",{children:"&"})," em entidades HTML. O navegador renderiza como texto, não como código."]}),e.jsxs(o,{type:"warning",title:"Regra prática",children:["Sempre escape ao ",e.jsx("strong",{children:"imprimir"}),", nunca ao ",e.jsx("strong",{children:"salvar"}),". Os dados ficam crus no banco e são tratados na hora da renderização."]}),e.jsxs("h2",{children:["Validação com ",e.jsx("code",{children:"filter_input"})]}),e.jsxs("p",{children:["PHP traz validadores nativos para os formatos mais comuns. Use"," ",e.jsx("code",{children:"filter_input"})," em vez de acessar ",e.jsx("code",{children:"$_POST"})," direto e ganhe validação gratuitamente:"]}),e.jsx(s,{filename:"public/validar.php",code:`<?php
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

echo "tudo válido: $email, $idade anos, $site, $ip" . PHP_EOL;`,output:"tudo válido: ada@math.org, 36 anos, https://ada.dev, 192.168.0.1"}),e.jsxs("p",{children:[e.jsx("code",{children:"filter_input"})," retorna ",e.jsx("code",{children:"false"})," quando a validação falha,"," ",e.jsx("code",{children:"null"})," quando o campo não existe, ou o ",e.jsx("strong",{children:"valor já no tipo correto"})," ","(int, no caso do ",e.jsx("code",{children:"FILTER_VALIDATE_INT"}),")."]}),e.jsx("h2",{children:"$_REQUEST: o coringa que você quase nunca quer"}),e.jsxs("p",{children:[e.jsx("code",{children:"$_REQUEST"})," mistura ",e.jsx("code",{children:"$_GET"}),", ",e.jsx("code",{children:"$_POST"})," e"," ",e.jsx("code",{children:"$_COOKIE"}),". Parece prático, mas é uma fonte de bugs sutis: você nunca sabe de onde o dado veio. ",e.jsx("strong",{children:"Prefira"})," sempre o super-global específico."]}),e.jsx(s,{filename:"evitar.php",code:`<?php
// Evite — quem mandou o id? GET? POST? Cookie?
$id = $_REQUEST['id'] ?? null;

// Prefira — explícito sobre a origem.
$id = filter_input(INPUT_GET, 'id', FILTER_VALIDATE_INT);`}),e.jsx("h2",{children:"O padrão Post-Redirect-Get (PRG)"}),e.jsxs("p",{children:["Quando o usuário envia um POST com sucesso e dá ",e.jsx("em",{children:"F5"}),', o navegador pergunta se quer reenviar — e a maioria clica "ok" sem ler. Resultado: pedido duplicado, post em dobro, cobrança replicada.']}),e.jsxs("p",{children:["A solução é processar o POST e ",e.jsx("strong",{children:"redirecionar com 303 (ou 302)"})," para uma página GET de confirmação. O F5 agora apenas recarrega a página de confirmação."]}),e.jsx(s,{filename:"public/criar-post.php",code:`<?php
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
exit('Use POST.');`}),e.jsx(s,{filename:"public/sucesso.php",code:`<?php
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
</html>`}),e.jsxs(r,{url:"http://localhost:8000/sucesso.php",children:[e.jsx("div",{className:"bg-green-100 border border-green-400 text-green-800 p-3 rounded mb-2",children:'Post "Lançamos o blog!" publicado!'}),e.jsx("a",{className:"text-blue-700 underline",children:"Voltar"})]}),e.jsxs(o,{type:"success",title:"Receita PRG",children:[e.jsxs("ol",{className:"list-decimal ml-5 mt-1 space-y-1",children:[e.jsx("li",{children:"Recebe POST"}),e.jsx("li",{children:"Valida"}),e.jsx("li",{children:"Persiste"}),e.jsx("li",{children:e.jsx("code",{children:"header('Location: ...', true, 303); exit;"})})]}),"Sem o ",e.jsx("code",{children:"exit"})," o script continua executando depois do redirect."]}),e.jsx("h2",{children:"Subindo o servidor para testar"}),e.jsx("p",{children:"Não precisa Apache nem Nginx para experimentar. PHP traz um servidor embutido:"}),e.jsx(a,{user:"dev",host:"php",cwd:"~/projetos/forms",command:"php -S localhost:8000 -t public",output:`[Thu Mar 27 16:00:00 2025] PHP 8.4.2 Development Server (http://localhost:8000) started
[Thu Mar 27 16:00:12 2025] 127.0.0.1:54321 [200]: GET /contato.php
[Thu Mar 27 16:00:18 2025] 127.0.0.1:54322 [303]: POST /enviar.php
[Thu Mar 27 16:00:18 2025] 127.0.0.1:54323 [200]: GET /sucesso.php`}),e.jsx("h2",{children:"Checklist final de um formulário decente"}),e.jsxs("ul",{children:[e.jsxs("li",{children:["Use ",e.jsx("code",{children:'method="post"'})," para mudanças de estado."]}),e.jsxs("li",{children:["Cheque ",e.jsx("code",{children:"$_SERVER['REQUEST_METHOD']"})," antes de processar."]}),e.jsxs("li",{children:["Valide com ",e.jsx("code",{children:"filter_input"}),"/",e.jsx("code",{children:"FILTER_VALIDATE_*"}),"."]}),e.jsxs("li",{children:["Escape com ",e.jsx("code",{children:"htmlspecialchars"})," ao imprimir."]}),e.jsx("li",{children:"Use Post-Redirect-Get para fluxos de submissão."}),e.jsx("li",{children:"Ainda falta CSRF token — assunto do capítulo de Sessões."})]})]})}export{n as default};
