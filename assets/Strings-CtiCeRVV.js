import{j as e}from"./index-Bb4MiiJL.js";import{P as r,A as o,a as s}from"./AlertBox-BpD-xIsb.js";import{T as a}from"./TerminalBlock-DGurMC1r.js";function c(){return e.jsxs(r,{title:"Strings",subtitle:"Aspas simples vs duplas, heredoc, nowdoc, sprintf, funções str_*, suporte a multibyte com mb_*, e os helpers modernos do PHP 8: str_contains, str_starts_with e str_ends_with.",difficulty:"iniciante",timeToRead:"12 min",category:"Strings & Arrays",children:[e.jsx(o,{type:"info",title:"Pré-requisitos",children:e.jsxs("p",{children:["Antes deste capítulo, é bom já ter visto: ",e.jsx("a",{href:"#/variaveis",className:"text-[#8993BE] underline",children:"Variáveis"}),", ",e.jsx("a",{href:"#/tipos",className:"text-[#8993BE] underline",children:"Tipos"}),"."]})}),e.jsx("h2",{children:"Por que existem dois tipos de aspas?"}),e.jsxs("p",{children:["Você abre seu primeiro arquivo PHP e logo encontra ",e.jsx("code",{children:"'texto'"})," e ",e.jsx("code",{children:'"texto"'})," sendo usados sem critério aparente. Não é estilo: a diferença é semântica e tem impacto direto em performance e segurança.",e.jsx("strong",{children:" Aspas duplas interpolam variáveis e processam escapes. Aspas simples são literais."})]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:`'' vs ""`})," — aspas simples são literais (mais rápidas, nada é interpretado). Aspas duplas interpolam ",e.jsx("code",{children:"$variaveis"})," e processam escapes como ",e.jsx("code",{children:"\\n"}),", ",e.jsx("code",{children:"\\t"}),". Sintaxe: ",e.jsx("code",{children:"'literal'"})," ou ",e.jsx("code",{children:'"olá $nome"'}),". A regra prática: simples por padrão, duplas só quando precisar interpolar."]}),e.jsx(s,{filename:"aspas.php",code:`<?php
declare(strict_types=1);

$nome = "Wallyson";
$idade = 30;

echo 'Olá, $nome! Você tem $idade anos.' . PHP_EOL;
echo "Olá, $nome! Você tem $idade anos." . PHP_EOL;
echo "Olá, {$nome}! Você tem {$idade} anos." . PHP_EOL;
echo 'Linha 1
Linha 2' . PHP_EOL;
echo "Linha 1
Linha 2" . PHP_EOL;`,output:`Olá, $nome! Você tem $idade anos.
Olá, Wallyson! Você tem 30 anos.
Olá, Wallyson! Você tem 30 anos.
Linha 1\\nLinha 2
Linha 1
Linha 2`}),e.jsxs("p",{children:["A forma ",e.jsx("code",{children:"{$variavel}"})," é a recomendada quando a string fica complexa ou quando você acessa propriedades e índices: ",e.jsx("code",{children:'"Item: {$produtos[0]}"'})," ou ",e.jsx("code",{children:'"Nome: {$user->nome}"'}),". Sem as chaves, o PHP às vezes interpreta de forma errada."]}),e.jsxs(o,{type:"info",title:"Regra prática",children:["Use ",e.jsx("strong",{children:"aspas simples"})," por padrão. Só troque para aspas duplas quando precisar de interpolação ou de escapes como ",e.jsx("code",{children:"\\n"}),", ",e.jsx("code",{children:"\\t"}),", ",e.jsx("code",{children:"\\r"}),". Isso deixa intenção explícita."]}),e.jsx("h2",{children:"Heredoc: blocos longos com interpolação"}),e.jsxs("p",{children:["Quando você precisa de um bloco grande de texto (um e-mail, um SQL, um pedaço de HTML) usar concatenação com ",e.jsx("code",{children:"."})," vira um inferno. Heredoc resolve isso: comporta-se como aspas duplas (interpola variáveis), mas em múltiplas linhas, sem precisar escapar aspas."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"heredoc"})," — string multilinhas que se comporta como aspas duplas (interpola variáveis), delimitada por ",e.jsx("code",{children:"<<<IDENT"})," ... ",e.jsx("code",{children:"IDENT;"}),". Existe pra escrever blocos longos (e-mails, SQL, HTML) sem concatenar com ",e.jsx("code",{children:"."})," nem escapar aspas. Desde PHP 7.3 o fechamento pode ser indentado. Use ",e.jsx("code",{children:"<<<'IDENT'"})," (nowdoc) quando NÃO quiser interpolação."]}),e.jsx(s,{filename:"heredoc.php",code:`<?php
declare(strict_types=1);

$nome = "Ada";
$projeto = "Analytical Engine";

$email = <<<EMAIL
Olá, {$nome}!

Seu projeto "{$projeto}" foi aprovado para a próxima rodada.
Equipe técnica vai entrar em contato amanhã.

Abraços,
PHP Book
EMAIL;

echo $email;`,output:`Olá, Ada!

Seu projeto "Analytical Engine" foi aprovado para a próxima rodada.
Equipe técnica vai entrar em contato amanhã.

Abraços,
PHP Book`}),e.jsxs("p",{children:["A partir do PHP 7.3 você pode ",e.jsx("strong",{children:"indentar o fechamento"})," e o PHP remove a indentação do conteúdo automaticamente. Isso é o que torna heredoc usável dentro de classes e funções."]}),e.jsx(s,{filename:"heredoc-indentado.php",code:`<?php
declare(strict_types=1);

function gerarHtml(string $titulo, string $corpo): string {
    return <<<HTML
        <article>
            <h1>{$titulo}</h1>
            <p>{$corpo}</p>
        </article>
        HTML;
}

echo gerarHtml("Lançamento", "Saiu o PHP 8.4!");`,output:`<article>
    <h1>Lançamento</h1>
    <p>Saiu o PHP 8.4!</p>
</article>`}),e.jsx("h2",{children:"Nowdoc: heredoc literal (sem interpolação)"}),e.jsxs("p",{children:["Nowdoc usa ",e.jsx("strong",{children:"aspas simples"})," no identificador e funciona como aspas simples: nada é interpolado. Perfeito para snippets de código, regex e qualquer coisa onde ",e.jsx("code",{children:"$"})," deve ser literal."]}),e.jsx(s,{filename:"nowdoc.php",code:`<?php
declare(strict_types=1);

$snippet = <<<'JS'
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
JS;

echo $snippet;`,output:`const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);`}),e.jsx("h2",{children:"sprintf: formatação que você consegue ler"}),e.jsxs("p",{children:["Concatenar ",e.jsx("code",{children:`"Total: R$ " . number_format($v, 2, ',', '.')`})," funciona, mas ",e.jsx("code",{children:"sprintf"})," ","deixa o template do texto separado dos valores. Mais legível, mais fácil de internacionalizar."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"sprintf"})," — formata uma string usando placeholders (",e.jsx("code",{children:"%s"}),", ",e.jsx("code",{children:"%d"}),", ",e.jsx("code",{children:"%.2f"}),", ",e.jsx("code",{children:"%05d"}),") e retorna o resultado. Existe pra separar template de valores (legível, fácil de internacionalizar). Sintaxe: ",e.jsx("code",{children:'sprintf("Olá %s, R$ %.2f", $nome, $valor)'}),". Use ",e.jsx("code",{children:"printf"})," se quiser imprimir direto."]}),e.jsx(s,{filename:"sprintf.php",code:`<?php
declare(strict_types=1);

$nome = "Linus";
$saldo = 1234.5;
$itens = 7;

echo sprintf("Cliente: %s | Saldo: R$ %.2f | Itens: %d", $nome, $saldo, $itens) . PHP_EOL;
echo sprintf("ID: %05d", 42) . PHP_EOL;
echo sprintf("[%-10s] OK", "deploy") . PHP_EOL;
echo sprintf("[%10s] OK", "deploy") . PHP_EOL;
echo sprintf("Hex: %x | Bin: %b", 255, 5) . PHP_EOL;`,output:`Cliente: Linus | Saldo: R$ 1234.50 | Itens: 7
ID: 00042
[deploy    ] OK
[    deploy] OK
Hex: ff | Bin: 101`}),e.jsxs(o,{type:"warning",title:"printf vs sprintf",children:[e.jsx("code",{children:"printf"})," imprime direto. ",e.jsx("code",{children:"sprintf"})," retorna a string formatada. Use ",e.jsx("code",{children:"sprintf"})," quase sempre — assim você pode armazenar, logar ou retornar o valor."]}),e.jsx("h2",{children:"As funções str_* que você vai usar todo dia"}),e.jsx("p",{children:"O PHP tem dezenas de funções de string. Estas são as que aparecem em todo projeto real:"}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"str_*"})," — família de funções nativas para strings ASCII: ",e.jsx("code",{children:"strlen"})," (tamanho em bytes), ",e.jsx("code",{children:"strtoupper/strtolower"}),", ",e.jsx("code",{children:"str_replace"}),", ",e.jsx("code",{children:"str_repeat"}),", ",e.jsx("code",{children:"str_pad"}),", ",e.jsx("code",{children:"substr"}),", ",e.jsx("code",{children:"trim"}),". Existe porque manipular texto é o pão-com-manteiga do PHP. Pra texto humano com acento, troque pelas equivalentes ",e.jsx("code",{children:"mb_*"}),"."]}),e.jsx(s,{filename:"str-funcoes.php",code:`<?php
declare(strict_types=1);

$frase = "  Aprenda PHP de verdade  ";

echo strlen($frase) . PHP_EOL;
echo strlen(trim($frase)) . PHP_EOL;
echo strtoupper(trim($frase)) . PHP_EOL;
echo strtolower(trim($frase)) . PHP_EOL;
echo ucfirst("php é tranquilo") . PHP_EOL;
echo ucwords("php é tranquilo") . PHP_EOL;
echo str_replace("PHP", "Python", trim($frase)) . PHP_EOL;
echo str_repeat("-", 20) . PHP_EOL;
echo str_pad("42", 6, "0", STR_PAD_LEFT) . PHP_EOL;
echo substr("abcdefgh", 2, 3) . PHP_EOL;
echo substr_count("banana", "na") . PHP_EOL;`,output:`27
23
APRENDA PHP DE VERDADE
aprenda php de verdade
Php é tranquilo
Php É Tranquilo
Aprenda Python de verdade
--------------------
000042
cde
2`}),e.jsxs("p",{children:["Repare em ",e.jsx("code",{children:"trim"}),": ele tira espaços, tabs e quebras de linha das pontas. Existem variantes",e.jsx("code",{children:" ltrim"})," (só esquerda) e ",e.jsx("code",{children:"rtrim"})," (só direita). Você também pode passar caracteres específicos para remover: ",e.jsx("code",{children:"trim($url, '/')"}),"."]}),e.jsx("h2",{children:"str_contains, str_starts_with, str_ends_with (PHP 8.0+)"}),e.jsxs("p",{children:["Antes do PHP 8 a gente fazia ",e.jsx("code",{children:"strpos($s, 'foo') !== false"})," e tropeçava no ",e.jsx("em",{children:"!== false"})," ","toda vez (já que ",e.jsx("code",{children:"strpos"})," retorna ",e.jsx("code",{children:"0"})," quando achou no início). O PHP 8 trouxe três funções óbvias que retornam ",e.jsx("code",{children:"bool"}),":"]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"str_contains / str_starts_with / str_ends_with"}),' — funções booleanas (PHP 8.0+) que respondem "essa string contém / começa com / termina com X?". Existem porque ',e.jsx("code",{children:"strpos !== false"})," era confuso e propenso a bug. Sintaxe: ",e.jsx("code",{children:"str_contains($haystack, $needle)"}),". Diferenciam maiúsculas/minúsculas."]}),e.jsx(s,{filename:"str-contains.php",code:`<?php
declare(strict_types=1);

$email = "wallyson@example.com";

var_dump(str_contains($email, "@"));
var_dump(str_starts_with($email, "wallyson"));
var_dump(str_ends_with($email, ".com"));
var_dump(str_ends_with($email, ".br"));

if (str_ends_with("backup.tar.gz", ".gz")) {
    echo "É um gzip!" . PHP_EOL;
}`,output:`bool(true)
bool(true)
bool(true)
bool(false)
É um gzip!`}),e.jsx("h2",{children:"explode e implode: string ↔ array"}),e.jsxs("p",{children:["Duas das funções mais usadas no mundo real: ",e.jsx("code",{children:"explode"})," quebra uma string num array por separador,",e.jsx("code",{children:"implode"})," faz o caminho inverso (também chamado de ",e.jsx("code",{children:"join"}),")."]}),e.jsx(s,{filename:"explode.php",code:`<?php
declare(strict_types=1);

$csv = "wallyson,ada,linus,grace";
$nomes = explode(",", $csv);
print_r($nomes);

$frase = implode(" e ", $nomes);
echo $frase . PHP_EOL;

[$user, $domain] = explode("@", "ada@example.com", 2);
echo "Usuário: {$user} | Domínio: {$domain}" . PHP_EOL;`,output:`Array
(
    [0] => wallyson
    [1] => ada
    [2] => linus
    [3] => grace
)
wallyson e ada e linus e grace
Usuário: ada | Domínio: example.com`}),e.jsxs(o,{type:"warning",title:"Pegadinha do explode",children:[e.jsx("code",{children:'explode(",", "")'})," retorna ",e.jsx("code",{children:'[""]'})," (array com um elemento vazio), não um array vazio. Sempre valide a entrada antes de iterar."]}),e.jsx("h2",{children:"mb_*: o mundo é UTF-8 e tem acento"}),e.jsxs("p",{children:["As funções ",e.jsx("code",{children:"str*"})," contam ",e.jsx("strong",{children:"bytes"}),", não caracteres. Em UTF-8 a letra ",e.jsx("code",{children:"ã"})," ","ocupa 2 bytes, ",e.jsx("code",{children:"ç"})," também. Resultado: ",e.jsx("code",{children:'strlen("São Paulo")'})," retorna 10, não 9. Por isso existem as ",e.jsx("code",{children:"mb_*"})," (multibyte), que entendem o encoding."]}),e.jsx(s,{filename:"mb.php",code:`<?php
declare(strict_types=1);

$cidade = "São Paulo";

echo strlen($cidade) . PHP_EOL;
echo mb_strlen($cidade) . PHP_EOL;

echo strtoupper("ação") . PHP_EOL;
echo mb_strtoupper("ação") . PHP_EOL;

echo substr("coração", 0, 5) . PHP_EOL;
echo mb_substr("coração", 0, 5) . PHP_EOL;`,output:`10
9
AÇãO
AÇÃO
cora�
coraçã`}),e.jsxs(o,{type:"danger",title:"Regra de ouro para texto humano",children:["Se a string contém ",e.jsx("strong",{children:"nomes, descrições, qualquer texto digitado por humano"}),", use ",e.jsx("code",{children:"mb_strlen"}),", ",e.jsx("code",{children:"mb_strtoupper"}),", ",e.jsx("code",{children:"mb_substr"}),", ",e.jsx("code",{children:"mb_strpos"}),". Reserve as ",e.jsx("code",{children:"str*"})," para identificadores, slugs ASCII e dados técnicos."]}),e.jsx("h2",{children:"Rodando os exemplos"}),e.jsx(a,{user:"dev",host:"php",cwd:"~/php-book/strings",command:"php sprintf.php",output:`Cliente: Linus | Saldo: R$ 1234.50 | Itens: 7
ID: 00042
[deploy    ] OK`}),e.jsxs("p",{children:["Strings são o tipo que você mais manipula em qualquer aplicação web. Saber escolher entre aspas, dominar",e.jsx("code",{children:" sprintf"})," e usar ",e.jsx("code",{children:"mb_*"})," em texto humano elimina 90% dos bugs sutis. No próximo capítulo vamos para ",e.jsx("strong",{children:"arrays"}),", a outra metade do dia a dia."]})]})}export{c as default};
