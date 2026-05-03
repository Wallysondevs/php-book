import{j as e}from"./index-B5-q-eol.js";import{P as o,A as r,a}from"./AlertBox-CVbFLZEd.js";import{T as s}from"./TerminalBlock-6fqVIX2R.js";function l(){return e.jsxs(o,{title:"Regex básico (preg_*)",subtitle:"Expressões regulares no PHP com a família preg_*: encontrar, extrair, substituir e dividir strings com padrões PCRE.",difficulty:"intermediario",timeToRead:"13 min",category:"Regex",children:[e.jsx(r,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"preg_match"})," "," — "," ","verdadeiro/falso + captura primeiro match."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"preg_match_all"})," "," — "," ","todos os matches em um array."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"preg_replace"})," "," — "," ","substituição por padrão."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Delimitadores"})," "," — "," ","/regex/ — barra é o mais comum, mas qualquer char serve."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Flags"})," "," — "," ","i = case-insensitive, m = multiline, s = . inclui \\\\n."]})]}),e.jsx("h2",{children:"O problema: validar um CEP no formato 12345-678"}),e.jsxs("p",{children:["Você quer aceitar ",e.jsx("code",{children:"12345-678"})," mas rejeitar ",e.jsx("code",{children:"123456789"}),","," ",e.jsx("code",{children:"abcde-fgh"})," e ",e.jsx("code",{children:"12-345678"}),". Dá para fazer isso com vinte linhas de"," ",e.jsx("code",{children:"substr()"}),", ",e.jsx("code",{children:"strlen()"})," e ",e.jsx("code",{children:"ctype_digit()"}),"... ou com uma linha de regex:"]}),e.jsx(a,{filename:"cep.php",code:`<?php
declare(strict_types=1);

function cepValido(string $cep): bool {
    return preg_match('/^\\d{5}-\\d{3}$/', $cep) === 1;
}

var_dump(cepValido('12345-678'));
var_dump(cepValido('123456789'));
var_dump(cepValido('abcde-fgh'));
var_dump(cepValido(' 12345-678'));`,output:`bool(true)
bool(false)
bool(false)
bool(false)`}),e.jsxs("p",{children:["Esse é o poder do regex: descrever um ",e.jsx("strong",{children:"padrão"})," de texto em vez de programar a validação caractere por caractere. Vamos dissecar o que está acontecendo."]}),e.jsx("h2",{children:"Anatomia de um padrão PCRE"}),e.jsxs("p",{children:["No PHP, regex usa o engine ",e.jsx("strong",{children:"PCRE"})," (Perl Compatible Regular Expressions). Todo padrão tem três partes:"]}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Delimitadores"}),": começam e terminam o padrão. O mais comum é ",e.jsx("code",{children:"/"}),", mas você pode usar ",e.jsx("code",{children:"#"}),", ",e.jsx("code",{children:"~"})," ou ",e.jsx("code",{children:"{}"}),"."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"O padrão"})," em si: ",e.jsxs("code",{children:["^\\d","{5}","-\\d","{3}","$"]}),"."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Modificadores"})," (flags): ",e.jsx("code",{children:"i"}),", ",e.jsx("code",{children:"u"}),", ",e.jsx("code",{children:"m"}),", ",e.jsx("code",{children:"s"})," — vão depois do delimitador final."]})]}),e.jsx(a,{filename:"delimitadores.php",code:`<?php
declare(strict_types=1);

// Todos equivalentes:
$padrao1 = '/^https://.+/';     // precisa escapar a barra
$padrao2 = '#^https://.+#';       // sem precisar escapar
$padrao3 = '~^https://.+~';

$url = 'https://php.net';
var_dump(preg_match($padrao1, $url) === 1);
var_dump(preg_match($padrao2, $url) === 1);
var_dump(preg_match($padrao3, $url) === 1);`,output:`bool(true)
bool(true)
bool(true)`}),e.jsxs(r,{type:"info",title:"Escolha o delimitador a favor da legibilidade",children:["Quando o padrão tem muitas barras (URLs, paths), use ",e.jsx("code",{children:"#"})," ou ",e.jsx("code",{children:"~"}),". Vai poupar você de uma sopa de ",e.jsx("code",{children:"\\/"})," no código."]}),e.jsx("h2",{children:"preg_match: existe? extrai grupos?"}),e.jsxs("p",{children:[e.jsx("code",{children:"preg_match()"})," retorna ",e.jsx("code",{children:"1"})," se achou, ",e.jsx("code",{children:"0"})," se não, ou"," ",e.jsx("code",{children:"false"})," se houve erro de sintaxe. O terceiro parâmetro recebe os capturas:"]}),e.jsx(a,{filename:"preg-match.php",code:`<?php
declare(strict_types=1);

$telefone = '(11) 98765-4321';

// Grupos: (DDD) (numero)
if (preg_match('/^\\((\\d{2})\\)\\s(\\d{4,5}-\\d{4})$/', $telefone, $m) === 1) {
    echo "DDD: {$m[1]}" . PHP_EOL;
    echo "Número: {$m[2]}" . PHP_EOL;
    echo "Match completo: {$m[0]}";
}`,output:`DDD: 11
Número: 98765-4321
Match completo: (11) 98765-4321`}),e.jsxs("p",{children:["O índice ",e.jsx("code",{children:"0"})," sempre traz a string completa que casou; ",e.jsx("code",{children:"1"}),", ",e.jsx("code",{children:"2"}),",",e.jsx("code",{children:"3"}),"... trazem o conteúdo de cada parêntese, em ordem."]}),e.jsx("h2",{children:"Classes de caracteres"}),e.jsxs("p",{children:["Dentro de ",e.jsx("code",{children:"[ ]"})," você define um ",e.jsx("strong",{children:"conjunto"})," de caracteres aceitos. Dentro do conjunto, ",e.jsx("code",{children:"-"})," indica intervalo e ",e.jsx("code",{children:"^"})," no começo nega."]}),e.jsx(a,{filename:"classes.php",code:`<?php
declare(strict_types=1);

$exemplos = [
    'A1B2C3'  => '/^[A-Z0-9]+$/',           // só letras maiúsculas e números
    'wally23' => '/^[a-z][a-z0-9_]*$/',     // identificador de variável
    'ola!'    => '/^[a-zA-Z]+$/',           // só letras
    'XYZ-12'  => '/^[A-Z]{3}-\\d{2}$/',      // placa antiga
];

foreach ($exemplos as $str => $padrao) {
    $ok = preg_match($padrao, $str) === 1 ? 'sim' : 'não';
    printf("%-10s casa %-30s -> %s
", $str, $padrao, $ok);
}

// Atalhos predefinidos
echo PHP_EOL . "Atalhos:" . PHP_EOL;
echo (preg_match('/^\\d+$/', '12345') ? 'sim' : 'não') . " — \\d = [0-9]" . PHP_EOL;
echo (preg_match('/^\\w+$/', 'wally_23') ? 'sim' : 'não') . " — \\w = [A-Za-z0-9_]" . PHP_EOL;
echo (preg_match('/^\\s+$/', "  	
") ? 'sim' : 'não') . " — \\s = espaços";`,output:`A1B2C3     casa /^[A-Z0-9]+$/                -> sim
wally23    casa /^[a-z][a-z0-9_]*$/          -> sim
ola!       casa /^[a-zA-Z]+$/                -> não
XYZ-12     casa /^[A-Z]{3}-\\d{2}$/           -> sim

Atalhos:
sim — \\d = [0-9]
sim — \\w = [A-Za-z0-9_]
sim — \\s = espaços`}),e.jsx("h2",{children:"Quantificadores: quantas vezes pode repetir?"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"*"})," — zero ou mais"]}),e.jsxs("li",{children:[e.jsx("code",{children:"+"})," — uma ou mais"]}),e.jsxs("li",{children:[e.jsx("code",{children:"?"})," — zero ou uma (opcional)"]}),e.jsxs("li",{children:[e.jsx("code",{children:"{n}"})," — exatamente n"]}),e.jsxs("li",{children:[e.jsx("code",{children:"{n,}"})," — n ou mais"]}),e.jsxs("li",{children:[e.jsx("code",{children:"{n,m}"})," — entre n e m"]})]}),e.jsx(a,{filename:"quantificadores.php",code:`<?php
declare(strict_types=1);

$casos = [
    ['/^a*$/',       ['', 'a', 'aaaa', 'b']],
    ['/^a+$/',       ['', 'a', 'aaaa', 'b']],
    ['/^colou?r$/',  ['color', 'colour', 'colouur']],
    ['/^\\d{4}$/',    ['1234', '12345', '12']],
    ['/^\\d{2,4}$/',  ['1', '12', '123', '1234', '12345']],
];

foreach ($casos as [$padrao, $entradas]) {
    echo "Padrão $padrao:" . PHP_EOL;
    foreach ($entradas as $e) {
        $ok = preg_match($padrao, $e) === 1 ? 'OK' : '--';
        printf("  %-8s %s
", "'$e'", $ok);
    }
}`,output:`Padrão /^a*$/:
  ''       OK
  'a'      OK
  'aaaa'   OK
  'b'      --
Padrão /^a+$/:
  ''       --
  'a'      OK
  'aaaa'   OK
  'b'      --
Padrão /^colou?r$/:
  'color'  OK
  'colour' OK
  'colouur' --
Padrão /^\\d{4}$/:
  '1234'   OK
  '12345'  --
  '12'     --
Padrão /^\\d{2,4}$/:
  '1'      --
  '12'     OK
  '123'    OK
  '1234'   OK
  '12345'  --`}),e.jsx("h2",{children:"Âncoras: ^ e $"}),e.jsxs("p",{children:["Sem âncoras, regex casa ",e.jsx("strong",{children:"em qualquer posição"})," da string. ",e.jsx("code",{children:"^"})," ancora no início, ",e.jsx("code",{children:"$"})," no final. Se você esquecer, validações ficam furadas:"]}),e.jsx(a,{filename:"ancoras.php",code:`<?php
declare(strict_types=1);

// SEM âncoras — perigoso!
var_dump(preg_match('/\\d{5}/', '12345-678 e mais texto'));
var_dump(preg_match('/\\d{5}/', 'abc 12345 def'));

// COM âncoras — só casa se a STRING INTEIRA bate
var_dump(preg_match('/^\\d{5}$/', '12345'));
var_dump(preg_match('/^\\d{5}$/', 'abc 12345 def'));`,output:`int(1)
int(1)
int(1)
int(0)`}),e.jsxs(r,{type:"warning",title:"Validação SEMPRE com ^ e $",children:["Para validar entrada de usuário, use ",e.jsx("code",{children:"^...$"}),". Para extrair pedaços de uma string maior, omita as âncoras. Esquecer isso é um clássico que abre brechas de validação."]}),e.jsx("h2",{children:"preg_match_all: pegar todas as ocorrências"}),e.jsxs("p",{children:["Quando você quer todos os matches (não só o primeiro), use ",e.jsx("code",{children:"preg_match_all()"}),"."]}),e.jsx(a,{filename:"match-all.php",code:`<?php
declare(strict_types=1);

$texto = 'Contatos: ana@exemplo.com, bruno@php.net e carlos@github.io';

preg_match_all('/[\\w.+-]+@[\\w-]+\\.[\\w.-]+/', $texto, $matches);

echo "Achei " . count($matches[0]) . " e-mails:" . PHP_EOL;
foreach ($matches[0] as $email) {
    echo "  - $email" . PHP_EOL;
}

// Com grupos: capturar usuário e domínio separados
preg_match_all('/([\\w.+-]+)@([\\w.-]+)/', $texto, $partes);
echo PHP_EOL . "Usuários: " . implode(', ', $partes[1]) . PHP_EOL;
echo "Domínios: " . implode(', ', $partes[2]);`,output:`Achei 3 e-mails:
  - ana@exemplo.com
  - bruno@php.net
  - carlos@github.io

Usuários: ana, bruno, carlos
Domínios: exemplo.com, php.net, github.io`}),e.jsx("h2",{children:"preg_replace: substituir com padrão"}),e.jsx(a,{filename:"replace.php",code:`<?php
declare(strict_types=1);

// Mascarar telefones
$texto = 'Ligue (11) 98765-4321 ou (21) 91234-5678';
echo preg_replace('/\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}/', '(**) *****-****', $texto) . PHP_EOL;

// Reordenar usando $1, $2 (referências aos grupos)
$nomes = 'Silva, Ana; Souza, Bruno; Lima, Carla';
echo preg_replace('/(\\w+), (\\w+)/', '$2 $1', $nomes) . PHP_EOL;

// Remover múltiplos espaços
$sujo = "muito    espaço     aqui";
echo preg_replace('/\\s+/', ' ', $sujo);`,output:`Ligue (**) *****-**** ou (**) *****-****
Ana Silva; Bruno Souza; Carla Lima
muito espaço aqui`}),e.jsx("h2",{children:"preg_split: explode com superpoderes"}),e.jsxs("p",{children:["O ",e.jsx("code",{children:"explode()"})," só aceita um separador fixo. Quando o separador varia (vários espaços, várias vírgulas, mistura), use ",e.jsx("code",{children:"preg_split()"}),"."]}),e.jsx(a,{filename:"split.php",code:`<?php
declare(strict_types=1);

// Separar por qualquer combinação de vírgula/espaço/ponto-e-vírgula
$lista = "ana, bruno; carlos,  daniel  ;eva";
$nomes = preg_split('/[,;\\s]+/', $lista, -1, PREG_SPLIT_NO_EMPTY);
print_r($nomes);

// Quebrar CamelCase
$camel = "MinhaClasseSuperComprida";
$palavras = preg_split('/(?=[A-Z])/', $camel, -1, PREG_SPLIT_NO_EMPTY);
print_r($palavras);`,output:`Array
(
    [0] => ana
    [1] => bruno
    [2] => carlos
    [3] => daniel
    [4] => eva
)
Array
(
    [0] => Minha
    [1] => Classe
    [2] => Super
    [3] => Comprida
)`}),e.jsx("h2",{children:"Modificadores: i, u, m, s"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"i"})," — ",e.jsx("em",{children:"case insensitive"}),": ",e.jsx("code",{children:"/php/i"}),' casa "PHP", "Php", "php".']}),e.jsxs("li",{children:[e.jsx("code",{children:"u"})," — Unicode/UTF-8: obrigatório quando seu texto tem acentos ou emojis."]}),e.jsxs("li",{children:[e.jsx("code",{children:"m"})," — multiline: faz ",e.jsx("code",{children:"^"})," e ",e.jsx("code",{children:"$"})," casarem em cada linha, não só no início/fim da string."]}),e.jsxs("li",{children:[e.jsx("code",{children:"s"})," — single line: faz ",e.jsx("code",{children:"."})," casar também quebras de linha."]})]}),e.jsx(a,{filename:"modificadores.php",code:`<?php
declare(strict_types=1);

// i — case insensitive
var_dump(preg_match('/php/i', 'PHP é maravilhoso'));

// u — sem isso, \\w não conhece acentos
var_dump(preg_match('/^[\\w\\s]+$/', 'João Não'));    // 0 (acento quebra)
var_dump(preg_match('/^[\\w\\s]+$/u', 'João Não'));   // 1 com flag u

// m — ^ por linha
$texto = "linha 1
linha 2
linha 3";
preg_match_all('/^linha \\d/m', $texto, $m);
print_r($m[0]);

// s — . engole 

$html = "<p>linha 1
linha 2</p>";
preg_match('/<p>(.+?)</p>/s', $html, $m);
echo $m[1];`,output:`int(1)
int(0)
int(1)
Array
(
    [0] => linha 1
    [1] => linha 2
    [2] => linha 3
)
linha 1
linha 2`}),e.jsxs(r,{type:"danger",title:"Regra absoluta para textos em português",children:["Qualquer regex que toque texto do usuário (nome, descrição, comentário)"," ",e.jsxs("strong",{children:["precisa do modificador ",e.jsx("code",{children:"u"})]}),". Sem ele, ",e.jsx("code",{children:"\\w"}),","," ",e.jsx("code",{children:"\\b"})," e ",e.jsx("code",{children:"."})," tratam acentos como bytes individuais e podem partir caracteres no meio. Use ",e.jsx("code",{children:"'/.../u'"})," por padrão."]}),e.jsx("h2",{children:"Testando regex no terminal"}),e.jsx(s,{user:"dev",host:"php",cwd:"~",command:`php -r 'var_dump(preg_match("/^[\\d]{5}-[\\d]{3}$/", "01310-100"));'`,output:"int(1)"}),e.jsxs("p",{children:["Com isso você cobre 80% dos casos do dia a dia: validar formato, extrair partes, limpar e dividir strings. No próximo capítulo vamos para o lado avançado: ",e.jsx("strong",{children:"grupos nomeados, lookahead, backreferences, performance"})," e validação de CPF — onde regex deixa de ser truque e vira ferramenta de domínio."]})]})}export{l as default};
