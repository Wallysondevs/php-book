import{j as e}from"./index-Bb4MiiJL.js";import{P as s,A as a,a as o}from"./AlertBox-BpD-xIsb.js";import{T as r}from"./TerminalBlock-DGurMC1r.js";function n(){return e.jsxs(s,{title:"Operadores",subtitle:"O guia completo dos símbolos do PHP — aritméticos, de atribuição, comparação, lógicos, de string, ternário, null coalescing e o mítico spaceship — com a diferença que separa juniores de seniores: == vs ===.",difficulty:"iniciante",timeToRead:"11 min",category:"Sintaxe Básica",children:[e.jsx(a,{type:"info",title:"Pré-requisitos",children:e.jsxs("p",{children:["Antes deste capítulo, é bom já ter visto: ",e.jsx("a",{href:"#/sintaxe",className:"text-[#8993BE] underline",children:"Sintaxe básica"}),", ",e.jsx("a",{href:"#/variaveis",className:"text-[#8993BE] underline",children:"Variáveis"}),", ",e.jsx("a",{href:"#/tipos",className:"text-[#8993BE] underline",children:"Tipos primitivos"}),"."]})}),e.jsx("h2",{children:"Aritméticos: o feijão com arroz"}),e.jsxs("p",{children:["Os operadores matemáticos são quase iguais aos de qualquer linguagem. Vale destacar três coisas: ",e.jsx("code",{children:"**"})," (potência), ",e.jsx("code",{children:"%"})," (módulo, sempre inteiro) e a divisão que sempre devolve ",e.jsx("code",{children:"float"})," a menos que você use ",e.jsx("code",{children:"intdiv()"}),"."]}),e.jsx(o,{filename:"aritmeticos.php",code:`<?php
declare(strict_types=1);

echo 7 + 3 . PHP_EOL;     // 10
echo 7 - 3 . PHP_EOL;     // 4
echo 7 * 3 . PHP_EOL;     // 21
echo 7 / 3 . PHP_EOL;     // 2.3333333333333 (float!)
echo intdiv(7, 3) . PHP_EOL; // 2 (divisão inteira)
echo 7 % 3 . PHP_EOL;     // 1
echo 2 ** 10 . PHP_EOL;   // 1024
echo -7 . PHP_EOL;        // -7 (unário)

// Incremento e decremento
$n = 5;
echo $n++ . PHP_EOL;      // 5 (pós: usa, depois soma)
echo ++$n . PHP_EOL;      // 7 (pré: soma, depois usa)
echo $n . PHP_EOL;        // 7`,output:`10
4
21
2.3333333333333
2
1
1024
-7
5
7
7`}),e.jsx("h2",{children:"Atribuição combinada: =, +=, .=, ??="}),e.jsxs("p",{children:["A atribuição básica é ",e.jsx("code",{children:"="}),". PHP herda do C as formas combinadas (",e.jsx("code",{children:"+="}),",",e.jsx("code",{children:" -="}),", ",e.jsx("code",{children:"*="}),", ",e.jsx("code",{children:"/="}),", ",e.jsx("code",{children:"%="}),", ",e.jsx("code",{children:"**="}),") e tem as suas próprias: ",e.jsx("code",{children:".="})," para concatenar strings e ",e.jsx("code",{children:"??="}),' para "atribui só se for null".']}),e.jsx(o,{filename:"atribuicao.php",code:`<?php
declare(strict_types=1);

$total = 100;
$total += 25;     // 125
$total -= 10;     // 115
$total *= 2;      // 230
$total /= 4;      // 57.5

$msg = "Olá";
$msg .= ", Wallyson!";   // "Olá, Wallyson!"

$config = ["host" => "localhost"];
$config["host"]    ??= "127.0.0.1"; // não muda (existe)
$config["port"]    ??= 8080;        // atribui (não existia)
$config["timeout"] ??= 30;

echo $total . PHP_EOL;
echo $msg . PHP_EOL;
print_r($config);`,output:`57.5
Olá, Wallyson!
Array
(
    [host] => localhost
    [port] => 8080
    [timeout] => 30
)`}),e.jsx("h2",{children:"Comparação: == vs === (a aula mais importante do PHP)"}),e.jsx("p",{children:"Aqui está a diferença que define se o seu código vai ter bugs misteriosos ou não. O PHP oferece duas famílias de operadores de igualdade:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"=="})," e ",e.jsx("code",{children:"!="})," — ",e.jsx("strong",{children:"frouxos"}),": convertem tipos antes de comparar."]}),e.jsxs("li",{children:[e.jsx("code",{children:"==="})," e ",e.jsx("code",{children:"!=="})," — ",e.jsx("strong",{children:"estritos"}),": comparam tipo E valor."]})]}),e.jsx(o,{filename:"comparacao.php",code:`<?php
declare(strict_types=1);

// Frouxos (perigosos)
var_dump(0 == "0");        // true
var_dump(0 == false);      // true
var_dump(null == false);   // true
var_dump("1" == "01");     // true (ambos viram int 1)
var_dump("10" == "1e1");   // true (notação científica)

// Estritos (corretos)
var_dump(0 === "0");       // false
var_dump(0 === false);     // false
var_dump(null === false);  // false
var_dump("1" === "01");    // false
var_dump(1 === 1);         // true`,output:`bool(true)
bool(true)
bool(true)
bool(true)
bool(true)
bool(false)
bool(false)
bool(false)
bool(false)
bool(true)`}),e.jsxs(a,{type:"danger",title:"Regra de ouro",children:[e.jsxs("strong",{children:["Use sempre ",e.jsx("code",{children:"==="})," e ",e.jsx("code",{children:"!=="})]}),". O ",e.jsx("code",{children:"=="})," deveria ter sido removido da linguagem. A única exceção razoável é quando você ",e.jsx("em",{children:"precisa"}),"comparar valores vindos de input (sempre string) com inteiros — e mesmo aí, prefira converter explicitamente antes de comparar."]}),e.jsxs("p",{children:["Os ordenadores (",e.jsx("code",{children:"<"}),", ",e.jsx("code",{children:">"}),", ",e.jsx("code",{children:"<="}),","," ",e.jsx("code",{children:">="}),") não têm versão estrita — comparam normalmente. E PHP 7+ trouxe o"," ","operador ",e.jsx("em",{children:"spaceship"})," ",e.jsx("code",{children:"<=>"}),", que devolve ",e.jsx("code",{children:"-1"}),","," ",e.jsx("code",{children:"0"})," ou ",e.jsx("code",{children:"1"}),":"]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"fn() =>"})," — arrow function (PHP 7.4+): forma curta de função anônima de uma expressão só. ",e.jsx("code",{children:"fn($a, $b) => $a + $b"})," equivale a uma ",e.jsx("code",{children:"function"})," com ",e.jsx("code",{children:"return"}),". Captura variáveis do escopo automaticamente. Detalhada no capítulo de Funções."]}),e.jsx(o,{filename:"spaceship.php",code:`<?php
declare(strict_types=1);

echo (1 <=> 2) . PHP_EOL;    // -1
echo (2 <=> 2) . PHP_EOL;    //  0
echo (3 <=> 2) . PHP_EOL;    //  1
echo ("ada" <=> "linus") . PHP_EOL; // -1 (alfabética)

// Uso clássico: ordenar arrays
$pessoas = [
    ["nome" => "Linus", "idade" => 54],
    ["nome" => "Ada",   "idade" => 36],
    ["nome" => "Grace", "idade" => 85],
];

usort($pessoas, fn($a, $b) => $a["idade"] <=> $b["idade"]);

foreach ($pessoas as $p) {
    echo "{$p['nome']}: {$p['idade']}" . PHP_EOL;
}`,output:`-1
0
1
-1
Ada: 36
Linus: 54
Grace: 85`}),e.jsx("h2",{children:"Lógicos: &&, ||, ! (e a armadilha do and/or)"}),e.jsxs("p",{children:["PHP tem duas formas para os operadores lógicos: ",e.jsx("code",{children:"&&"}),"/",e.jsx("code",{children:"||"})," e"," ",e.jsx("code",{children:"and"}),"/",e.jsx("code",{children:"or"}),". Eles parecem iguais, ",e.jsx("strong",{children:"mas não são"}),". A diferença está na ",e.jsx("em",{children:"precedência"}),":"]}),e.jsx(o,{filename:"logicos.php",code:`<?php
declare(strict_types=1);

// && tem precedência ALTA (mais alta que =)
$a = true && false;
var_dump($a); // false (correto: $a = (true && false))

// 'and' tem precedência BAIXA (mais baixa que =)
$b = true and false;
var_dump($b); // true (!) o = aconteceu antes do 'and'
              // equivale a: ($b = true) and false

// Negação
var_dump(!true);  // false
var_dump(!false); // true

// Curto-circuito: || e && param de avaliar quando já sabem o resultado
$x = null;
$nome = $x ?? "padrão";   // mais limpo: usa null coalescing
$nome2 = $x ?: "padrão";  // ternário curto: usa "vazio" (perigoso para 0/"")
echo "$nome / $nome2" . PHP_EOL;`,output:`bool(false)
bool(true)
bool(false)
bool(true)
padrão / padrão`}),e.jsxs(a,{type:"warning",title:"Esqueça o and/or",children:["Use ",e.jsx("strong",{children:"sempre"})," ",e.jsx("code",{children:"&&"})," e ",e.jsx("code",{children:"||"}),". As versões em palavras existem por compatibilidade histórica e causam bugs sutis exatamente como o exemplo acima. Não há benefício em usá-las."]}),e.jsx("h2",{children:"Concatenação de string: o ponto solitário"}),e.jsxs("p",{children:["Diferente de quase todas as linguagens modernas, PHP usa ",e.jsx("code",{children:"."})," (ponto) para concatenar strings. Para somar com atribuição combinada, use ",e.jsx("code",{children:".="}),". Em strings com aspas duplas, prefira interpolação direta."]}),e.jsx(o,{filename:"strings.php",code:`<?php
declare(strict_types=1);

$nome = "Ada";
$idade = 36;

// Concatenação clássica
echo "Olá, " . $nome . "! Você tem " . $idade . " anos." . PHP_EOL;

// Interpolação (mais limpo)
echo "Olá, $nome! Você tem $idade anos." . PHP_EOL;

// Interpolação com chaves para expressões/propriedades
$user = (object) ["nome" => "Linus", "idade" => 54];
echo "{$user->nome} tem {$user->idade} anos." . PHP_EOL;

// .= para construir incrementalmente
$saida = "";
foreach (["a", "b", "c"] as $letra) {
    $saida .= "[$letra]";
}
echo $saida . PHP_EOL;`,output:`Olá, Ada! Você tem 36 anos.
Olá, Ada! Você tem 36 anos.
Linus tem 54 anos.
[a][b][c]`}),e.jsx("h2",{children:"Ternário e null coalescing: dois irmãos diferentes"}),e.jsxs("p",{children:["O ternário clássico ",e.jsx("code",{children:"cond ? a : b"})," existe há séculos. PHP adicionou a versão curta ",e.jsx("code",{children:"a ?: b"}),' ("Elvis") e, em PHP 7, o irmão moderno ',e.jsx("code",{children:"a ?? b"})," (null coalescing). Eles parecem iguais, ",e.jsxs("strong",{children:["mas tratam ",e.jsx("code",{children:"0"})," e ",e.jsx("code",{children:'""'})," ","de jeitos diferentes"]}),":"]}),e.jsx(o,{filename:"ternario.php",code:`<?php
declare(strict_types=1);

$entrada = ["nome" => "", "idade" => 0, "ativo" => null];

// Ternário curto ?:  → cai no padrão se for "vazio" (0, "", null, false, [])
echo ($entrada["nome"]   ?: "sem nome") . PHP_EOL;   // "sem nome"
echo ($entrada["idade"]  ?: "sem idade") . PHP_EOL;  // "sem idade" (!)
echo ($entrada["ativo"]  ?: "inativo") . PHP_EOL;    // "inativo"

echo "----" . PHP_EOL;

// Null coalescing ??  → cai no padrão SÓ se for null ou inexistente
echo ($entrada["nome"]   ?? "sem nome") . PHP_EOL;   // "" (existe e não é null)
echo ($entrada["idade"]  ?? "sem idade") . PHP_EOL;  // 0
echo ($entrada["ativo"]  ?? "inativo") . PHP_EOL;    // "inativo" (era null)
echo ($entrada["telefone"] ?? "sem telefone") . PHP_EOL; // "sem telefone"

echo "----" . PHP_EOL;

// Encadeando ?? para fallback em cadeia
$config = [];
$timeout = $config["timeout"] ?? getenv("TIMEOUT") ?: 30;
echo "timeout: $timeout" . PHP_EOL;

// Ternário aninhado (legível com parênteses)
$status = 200;
$cor = ($status < 300)
    ? "verde"
    : (($status < 400) ? "amarelo" : "vermelho");
echo "status $status -> $cor" . PHP_EOL;`,output:`sem nome
sem idade
inativo
----

0
inativo
sem telefone
----
timeout: 30
status 200 -> verde`}),e.jsxs(a,{type:"info",title:"Quando usar cada um",children:["Use ",e.jsx("code",{children:"??"}),' quando "ausência" significa literalmente ',e.jsx("code",{children:"null"})," ou chave inexistente (a maioria dos casos). Use ",e.jsx("code",{children:"?:"}),' quando "vazio" inclui'," ",e.jsx("code",{children:"0"})," e ",e.jsx("code",{children:'""'})," de propósito. Use o ternário completo quando a condição é uma expressão real (não só uma checagem de existência)."]}),e.jsx("h2",{children:"Precedência: a tabela mental que te salva"}),e.jsx("p",{children:'Você não precisa decorar todas as 70+ linhas da tabela oficial — só lembre da hierarquia prática, do mais "forte" para o mais "fraco":'}),e.jsxs("ol",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"**"})," (potência)"]}),e.jsx("li",{children:e.jsx("code",{children:"* / %"})}),e.jsx("li",{children:e.jsx("code",{children:"+ - ."})}),e.jsx("li",{children:e.jsx("code",{children:"< <= > >= <=>"})}),e.jsx("li",{children:e.jsx("code",{children:"== === != !=="})}),e.jsx("li",{children:e.jsx("code",{children:"&&"})}),e.jsx("li",{children:e.jsx("code",{children:"||"})}),e.jsxs("li",{children:[e.jsx("code",{children:"?? ?:"})," e ",e.jsx("code",{children:"? :"})," (ternário)"]}),e.jsx("li",{children:e.jsx("code",{children:"= += .= ??="})}),e.jsxs("li",{children:[e.jsx("code",{children:"and"}),", depois ",e.jsx("code",{children:"or"})," (precedência baixíssima — evite)"]})]}),e.jsx(o,{filename:"precedencia.php",code:`<?php
declare(strict_types=1);

// Sem parênteses, fica ambíguo:
$x = 1 + 2 * 3;          // 7 (não 9)
$y = 10 - 4 - 2;         // 4 (associatividade à esquerda)
$z = 2 ** 3 ** 2;        // 512 (** associa à DIREITA: 2 ** 9)

echo "$x $y $z" . PHP_EOL;

// Quando dúvida, parênteses. Sempre.
$ok = ($x > 0) && ($y > 0);
var_dump($ok);`,output:`7 4 512
bool(true)`}),e.jsx("h2",{children:"Rodando os exemplos"}),e.jsx(r,{user:"dev",host:"php",cwd:"~/projetos/php-book",command:"php comparacao.php",output:`bool(true)
bool(true)
bool(true)
bool(true)
bool(true)
bool(false)
bool(false)
bool(false)
bool(false)
bool(true)`}),e.jsxs("p",{children:["Com operadores dominados, você já consegue construir expressões e tomar decisões. No próximo capítulo entramos em ",e.jsx("strong",{children:"controle de fluxo"}),": ",e.jsx("code",{children:"if/else"}),","," ",e.jsx("code",{children:"match"})," (o substituto moderno do ",e.jsx("code",{children:"switch"}),") e como escrever condicionais que se leem como prosa."]})]})}export{n as default};
