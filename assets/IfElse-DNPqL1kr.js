import{j as e}from"./index-B5-q-eol.js";import{P as o,A as s,a}from"./AlertBox-CVbFLZEd.js";function l(){return e.jsxs(o,{title:"if / else / elseif",subtitle:"A estrutura mais básica de controle de fluxo, a sintaxe alternativa para templates, ternário, null coalescing e a tabela de truthy/falsy que todo dev PHP precisa decorar.",difficulty:"iniciante",timeToRead:"8 min",category:"Controle de Fluxo",children:[e.jsx(s,{type:"info",title:"Pré-requisitos",children:e.jsxs("p",{children:["Antes deste capítulo, é bom já ter visto: ",e.jsx("a",{href:"#/sintaxe",className:"text-[#8993BE] underline",children:"Sintaxe básica"}),", ",e.jsx("a",{href:"#/variaveis",className:"text-[#8993BE] underline",children:"Variáveis"}),", ",e.jsx("a",{href:"#/operadores",className:"text-[#8993BE] underline",children:"Operadores"}),"."]})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"if/elseif/else"})," "," — "," ","estrutura clássica de decisão; elseif é uma palavra só."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Sintaxe alternativa"})," "," — "," ","if (...): ... endif; — usada em templates HTML."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Truthy/Falsy"})," "," — "," ",'0, "0", "", null, [] e false são falsy; resto é truthy.']}),e.jsxs("li",{children:[e.jsx("strong",{children:"Ternário"})," "," — "," ","cond ? a : b — versão expressão do if."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"match (PHP 8)"})," "," — "," ","compara estrito (===) e retorna valor; sucessor moderno do switch."]})]}),e.jsx("h2",{children:"O if que você já conhece"}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"if / elseif / else"})," — bloco de decisão. ",e.jsx("code",{children:"if"})," testa a condição; se for verdadeira executa o bloco. ",e.jsx("code",{children:"elseif"})," (uma palavra só) encadeia outra condição quando a anterior falhou. ",e.jsx("code",{children:"else"}),' é o "qualquer outra coisa". Sintaxe: ',e.jsx("code",{children:"if (cond) { ... } elseif (cond2) { ... } else { ... }"}),"."]}),e.jsxs("p",{children:["A estrutura é igual à de qualquer linguagem da família C. O que muda em PHP é o ",e.jsx("strong",{children:"conceito de truthy/falsy"})," — e ele tem algumas pegadinhas que vamos ver já já."]}),e.jsx(a,{filename:"if-basico.php",code:`<?php
declare(strict_types=1);

$idade = 17;

if ($idade >= 18) {
    echo "Maior de idade";
} elseif ($idade >= 16) {
    echo "Pode votar facultativamente";
} else {
    echo "Menor de 16";
}
echo PHP_EOL;`,output:"Pode votar facultativamente"}),e.jsxs("p",{children:["Repare: é ",e.jsx("code",{children:"elseif"})," (uma palavra) — não ",e.jsx("code",{children:"else if"}),". Os dois funcionam, mas",e.jsx("code",{children:" elseif"})," é a forma idiomática e a única aceita pela sintaxe alternativa que veremos a seguir."]}),e.jsx("h2",{children:"Sintaxe alternativa (a que aparece em templates)"}),e.jsxs("p",{children:["Em vez de chaves, você abre com ",e.jsx("code",{children:":"})," e fecha com ",e.jsx("code",{children:"endif"}),". Parece exótico até você editar uma view de WordPress, Laravel Blade compilado ou um arquivo PHP cheio de HTML — aí você entende. Sem chaves, o HTML fica muito mais legível."]}),e.jsx(a,{filename:"alternativa.php",code:`<?php
declare(strict_types=1);

$logado = true;
$nome = "Ada";
?>
<nav>
<?php if ($logado): ?>
    <span>Olá, <?= $nome ?></span>
    <a href="/sair">Sair</a>
<?php else: ?>
    <a href="/entrar">Entrar</a>
<?php endif; ?>
</nav>`,output:`<nav>
    <span>Olá, Ada</span>
    <a href="/sair">Sair</a>
</nav>`}),e.jsxs(s,{type:"info",title:"Quando usar cada uma?",children:["Use ",e.jsx("strong",{children:"chaves"})," em código de lógica (classes, services, scripts CLI). Use a",e.jsx("strong",{children:" alternativa"})," em arquivos que misturam HTML e PHP. Misturar os dois estilos no mesmo arquivo é considerado má prática."]}),e.jsx("h2",{children:"Truthy e falsy: a tabela que muda tudo"}),e.jsxs("p",{children:["PHP converte qualquer expressão para booleano quando ela aparece em um ",e.jsx("code",{children:"if"}),". As regras não são óbvias e vivem causando bugs. Decore esta lista de valores ",e.jsx("strong",{children:"falsy"}),":"]}),e.jsxs("ul",{children:[e.jsx("li",{children:e.jsx("code",{children:"false"})}),e.jsx("li",{children:e.jsx("code",{children:"null"})}),e.jsxs("li",{children:[e.jsx("code",{children:"0"})," (inteiro), ",e.jsx("code",{children:"0.0"})," (float)"]}),e.jsxs("li",{children:[e.jsx("code",{children:'""'})," (string vazia)"]}),e.jsxs("li",{children:[e.jsx("code",{children:'"0"'})," (string com o caractere zero! sim, é falsy)"]}),e.jsxs("li",{children:[e.jsx("code",{children:"[]"})," (array vazio)"]})]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Tudo o mais é truthy"}),": ",e.jsx("code",{children:'"0.0"'}),", ",e.jsx("code",{children:'"false"'}),", ",e.jsx("code",{children:'" "'})," ","(string com espaço), ",e.jsx("code",{children:"-1"}),", qualquer objeto."]}),e.jsx(a,{filename:"truthy-falsy.php",code:`<?php
declare(strict_types=1);

$valores = [false, null, 0, 0.0, "", "0", [], "0.0", "false", " ", -1, [0]];

foreach ($valores as $v) {
    $tipo = gettype($v);
    $repr = var_export($v, true);
    $bool = $v ? "TRUTHY" : "falsy ";
    echo "{$bool}  {$tipo}\\t{$repr}" . PHP_EOL;
}`,output:`falsy   boolean        false
falsy   NULL    NULL
falsy   integer 0
falsy   double  0.0
falsy   string  ''
falsy   string  '0'
falsy   array   array (
)
TRUTHY  string  '0.0'
TRUTHY  string  'false'
TRUTHY  string  ' '
TRUTHY  integer -1
TRUTHY  array   array (
  0 => 0,
)`}),e.jsxs(s,{type:"danger",title:"A pegadinha clássica",children:["Usuário digita ",e.jsx("code",{children:'"0"'})," em um formulário de busca. Você faz ",e.jsxs("code",{children:["if ($busca) ","{ ... }"]})," ","para validar e o código pula a busca achando que está vazio. Sempre use comparação explícita:",e.jsx("code",{children:' if ($busca !== "") '})," ou ",e.jsx("code",{children:'if (isset($busca) && $busca !== "")'}),"."]}),e.jsx("h2",{children:"Ternário: o if em uma linha"}),e.jsxs("p",{children:["Quando você só precisa escolher entre dois valores, o ternário é mais limpo. A sintaxe é",e.jsx("code",{children:" condicao ? seSim : seNao"}),"."]}),e.jsx(a,{filename:"ternario.php",code:`<?php
declare(strict_types=1);

$idade = 20;
$status = $idade >= 18 ? "adulto" : "menor";
echo $status . PHP_EOL;

$role = "admin";
$saudacao = "Bem-vindo, " . ($role === "admin" ? "chefe" : "usuário");
echo $saudacao . PHP_EOL;

$nome = "";
$exibir = $nome ?: "Anônimo";
echo $exibir . PHP_EOL;`,output:`adulto
Bem-vindo, chefe
Anônimo`}),e.jsxs("p",{children:["O ",e.jsx("code",{children:"?:"})," (sem o meio) é o ",e.jsx("strong",{children:"operador Elvis"}),": ",e.jsx("code",{children:"$a ?: $b"})," retorna",e.jsx("code",{children:" $a"})," se ele for ",e.jsx("em",{children:"truthy"}),", senão ",e.jsx("code",{children:"$b"}),". É um atalho para",e.jsx("code",{children:" $a ? $a : $b"}),"."]}),e.jsxs(s,{type:"warning",title:"Evite ternário aninhado",children:[e.jsx("code",{children:'$x ? "a" : ($y ? "b" : "c")'})," funciona, mas é horrível de ler. PHP 8 inclusive exige os parênteses explícitos. Se chegou nesse nível de complexidade, volte para ",e.jsx("code",{children:"if/elseif/else"})," ou use ",e.jsx("code",{children:"match"})," (vamos ver no próximo capítulo)."]}),e.jsx("h2",{children:"Null coalescing (??): o operador que substituiu isset()"}),e.jsxs("p",{children:["Antes do PHP 7, todo código era cheio de ",e.jsx("code",{children:"isset($arr['key']) ? $arr['key'] : 'padrão'"}),". O ",e.jsx("code",{children:"??"})," faz exatamente isso, mas em uma forma muito mais legível: retorna o lado esquerdo se ele ",e.jsx("strong",{children:"existir e não for null"}),", senão retorna o lado direito."]}),e.jsx(a,{filename:"null-coalescing.php",code:`<?php
declare(strict_types=1);

$config = ["host" => "localhost", "port" => 5432];

$host = $config["host"] ?? "127.0.0.1";
$user = $config["user"] ?? "root";
$port = $config["port"] ?? 5432;

echo "host={$host} user={$user} port={$port}" . PHP_EOL;

$dados = ["nome" => "Ada", "email" => null];
$email = $dados["email"] ?? "sem email";
echo $email . PHP_EOL;

$_GET["q"] = null;
$busca = $_GET["q"] ?? "padrão";
echo $busca . PHP_EOL;`,output:`host=localhost user=root port=5432
sem email
padrão`}),e.jsxs("p",{children:["Existe também o ",e.jsx("code",{children:"??="})," (atribuição com null coalescing): só atribui se a variável for",e.jsx("code",{children:" null"})," ou não existir. Ótimo para defaults em arrays de config."]}),e.jsx(a,{filename:"null-coalescing-assign.php",code:`<?php
declare(strict_types=1);

$config = ["host" => "localhost"];

$config["port"] ??= 5432;
$config["host"] ??= "127.0.0.1";
$config["user"] ??= "guest";

print_r($config);`,output:`Array
(
    [host] => localhost
    [port] => 5432
    [user] => guest
)`}),e.jsxs(s,{type:"success",title:"?? vs ?:",children:[e.jsx("code",{children:"??"})," só dispara quando o valor é ",e.jsx("strong",{children:"null ou não existe"}),".",e.jsx("code",{children:" ?:"})," dispara em qualquer valor ",e.jsx("strong",{children:"falsy"})," (incluindo ",e.jsx("code",{children:"0"})," e ",e.jsx("code",{children:'""'}),"). Quase sempre você quer ",e.jsx("code",{children:"??"})," — ele evita a pegadinha do ",e.jsx("code",{children:"0"})," ser tratado como ausência de valor."]}),e.jsx("h2",{children:"Combinando tudo: validação real"}),e.jsx(a,{filename:"validacao.php",code:`<?php
declare(strict_types=1);

function validarUsuario(array $dados): string {
    $nome = trim($dados["nome"] ?? "");
    $email = trim($dados["email"] ?? "");
    $idade = $dados["idade"] ?? null;

    if ($nome === "") {
        return "Erro: nome obrigatório";
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return "Erro: e-mail inválido";
    }

    if ($idade !== null && $idade < 18) {
        return "Erro: precisa ser maior de idade";
    }

    return "OK: cadastro de {$nome}";
}

echo validarUsuario(["nome" => "Ada", "email" => "ada@x.com"]) . PHP_EOL;
echo validarUsuario(["nome" => "", "email" => "x@x.com"]) . PHP_EOL;
echo validarUsuario(["nome" => "Bob", "email" => "errado"]) . PHP_EOL;
echo validarUsuario(["nome" => "Tim", "email" => "tim@x.com", "idade" => 15]) . PHP_EOL;`,output:`OK: cadastro de Ada
Erro: nome obrigatório
Erro: e-mail inválido
Erro: precisa ser maior de idade`}),e.jsxs("p",{children:["Repare como o ",e.jsx("code",{children:"??"})," elimina a checagem de existência de chave, e o ",e.jsx("code",{children:"!=="})," com string vazia evita a pegadinha do ",e.jsx("em",{children:"truthy/falsy"}),". No próximo capítulo: ",e.jsx("strong",{children:"switch e match"}),", que é onde escolher múltiplos caminhos fica realmente elegante."]})]})}export{l as default};
