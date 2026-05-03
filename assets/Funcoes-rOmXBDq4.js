import{j as e}from"./index-B5-q-eol.js";import{P as r,A as a,a as o}from"./AlertBox-CVbFLZEd.js";import{T as s}from"./TerminalBlock-6fqVIX2R.js";function d(){return e.jsxs(r,{title:"Funções básicas",subtitle:"Como declarar funções em PHP, passar parâmetros, retornar valores e por que toda função vive no seu próprio mundo isolado.",difficulty:"iniciante",timeToRead:"10 min",category:"Funções",children:[e.jsx(a,{type:"info",title:"Pré-requisitos",children:e.jsxs("p",{children:["Antes deste capítulo, é bom já ter visto: ",e.jsx("a",{href:"#/variaveis",className:"text-[#8993BE] underline",children:"Variáveis"}),", ",e.jsx("a",{href:"#/operadores",className:"text-[#8993BE] underline",children:"Operadores"}),", ",e.jsx("a",{href:"#/if-else",className:"text-[#8993BE] underline",children:"if / elseif / else"}),"."]})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"function nome()"})," "," — "," ","declaração; PHP é case-insensitive para nomes de função."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Tipo de retorno"})," "," — "," ","function f(): int — declarado depois dos parênteses."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Parâmetro default"})," "," — "," ","$x = 10 — torna o argumento opcional."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Variádicos"})," "," — "," ","function f(...$args) — recebe N argumentos como array."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Funções anônimas"})," "," — "," ","closures criadas com function() use ($var) {...}."]})]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"function"})," — declara uma função (bloco de código nomeado e reutilizável). Existe para você não copiar-e-colar a mesma lógica em três lugares. Sintaxe: ",e.jsx("code",{children:"function nome(params): tipo { ... }"}),". O nome segue as mesmas regras de variável (sem o ",e.jsx("code",{children:"$"}),") e funções em PHP são case-insensitive."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"return"})," — devolve um valor para quem chamou a função e ",e.jsx("strong",{children:"encerra a execução imediatamente"}),". Tudo depois de um ",e.jsx("code",{children:"return"})," que disparou é ignorado. Sem ",e.jsx("code",{children:"return"})," (ou usando ele sozinho), a função devolve ",e.jsx("code",{children:"null"}),"."]}),e.jsx("h2",{children:"O problema: código que se repete"}),e.jsxs("p",{children:["Imagine que você precisa formatar o nome completo de um usuário em três telas diferentes do seu sistema. Copiar e colar a mesma lógica em três lugares é um convite para bugs: o dia que a regra mudar, você vai esquecer de uma das cópias. ",e.jsx("strong",{children:"Funções"})," existem exatamente para resolver isso — você dá um nome para um bloco de código e passa a chamá-lo sempre que precisar."]}),e.jsx(o,{filename:"saudacao.php",code:`<?php
declare(strict_types=1);

function saudar(string $nome): string {
    return "Olá, {$nome}! Bem-vindo(a).";
}

echo saudar("Wallyson") . PHP_EOL;
echo saudar("Ada") . PHP_EOL;
echo saudar("Linus") . PHP_EOL;`,output:`Olá, Wallyson! Bem-vindo(a).
Olá, Ada! Bem-vindo(a).
Olá, Linus! Bem-vindo(a).`}),e.jsxs("p",{children:["A palavra-chave ",e.jsx("code",{children:"function"})," declara uma função. O nome (",e.jsx("code",{children:"saudar"}),") segue as mesmas regras de uma variável — só que sem o cifrão. Os ",e.jsx("strong",{children:"parâmetros"})," ficam entre parênteses e podem ter type hint (",e.jsx("code",{children:"string $nome"}),"). O ",e.jsx("strong",{children:"tipo de retorno"})," vem depois dos dois pontos (",e.jsx("code",{children:": string"}),"). E ",e.jsx("code",{children:"return"})," devolve o valor para quem chamou."]}),e.jsx("h2",{children:"Parâmetros, retorno e o caminho de volta"}),e.jsxs("p",{children:["Uma função pode receber zero, um ou vários parâmetros e devolver no máximo ",e.jsx("em",{children:"um"})," valor. Se ela não tiver ",e.jsx("code",{children:"return"}),", ela retorna ",e.jsx("code",{children:"null"})," implicitamente. E atenção: a primeira instrução ",e.jsx("code",{children:"return"})," que executar ",e.jsx("strong",{children:"encerra a função na hora"})," — qualquer código depois é ignorado."]}),e.jsx(o,{filename:"calculos.php",code:`<?php
declare(strict_types=1);

function somar(int $a, int $b): int {
    return $a + $b;
}

function dividir(float $a, float $b): float {
    if ($b === 0.0) {
        return 0.0; // sai aqui — nada abaixo executa
    }
    return $a / $b;
}

echo "3 + 4 = " . somar(3, 4) . PHP_EOL;
echo "10 / 4 = " . dividir(10, 4) . PHP_EOL;
echo "10 / 0 = " . dividir(10, 0) . PHP_EOL;`,output:`3 + 4 = 7
10 / 4 = 2.5
10 / 0 = 0`}),e.jsxs(a,{type:"info",title:"Função sem retorno explícito",children:["Use o tipo de retorno ",e.jsx("code",{children:"void"})," quando a função existe só pelo efeito colateral (logar, salvar, imprimir). Veremos isso em detalhes no capítulo de Type Hints."]}),e.jsx("h2",{children:"Escopo: cada função é uma ilha"}),e.jsxs("p",{children:["Esta é a parte que pega muito iniciante de surpresa. Em PHP, ",e.jsx("strong",{children:"variáveis declaradas fora de uma função NÃO são visíveis dentro dela"}),". Cada função tem seu próprio escopo, isolado do resto do programa."]}),e.jsx(o,{filename:"escopo.php",code:`<?php
declare(strict_types=1);

$mensagem = "olá do escopo global";

function imprimir(): void {
    // $mensagem NÃO existe aqui dentro
    echo $mensagem ?? "(variável não definida)";
}

imprimir();
echo PHP_EOL;
echo $mensagem; // aqui ainda existe`,output:`(variável não definida)
olá do escopo global`}),e.jsxs("p",{children:["Esse isolamento é uma ",e.jsx("em",{children:"feature"}),", não um bug: ele torna funções previsíveis. A regra de ouro é simples — ",e.jsx("strong",{children:"se a função precisa de um dado, passe como parâmetro"}),". Evite a palavra-chave ",e.jsx("code",{children:"global"}),", que existe por motivos históricos mas é considerada má prática em código moderno."]}),e.jsx(o,{filename:"escopo-correto.php",code:`<?php
declare(strict_types=1);

$mensagem = "olá do escopo global";

function imprimir(string $texto): void {
    echo $texto;
}

imprimir($mensagem);`,output:"olá do escopo global"}),e.jsx("h2",{children:"Funções dentro de funções"}),e.jsxs("p",{children:["PHP permite declarar uma função ",e.jsx("em",{children:"dentro"})," de outra. Mas atenção a uma pegadinha importante: a função interna só passa a existir ",e.jsx("strong",{children:"depois que a função externa for chamada"}),". E ela vira global a partir daí."]}),e.jsx(o,{filename:"aninhada.php",code:`<?php
declare(strict_types=1);

function externa(): void {
    function interna(): string {
        return "fui criada agora";
    }
}

// interna() ainda não existe — externa() nunca foi chamada
echo function_exists("interna") ? "sim" : "nao";
echo PHP_EOL;

externa(); // agora interna() é registrada globalmente
echo function_exists("interna") ? "sim" : "nao";
echo PHP_EOL;
echo interna();`,output:`nao
sim
fui criada agora`}),e.jsxs(a,{type:"warning",title:"Não chame externa() duas vezes",children:["Como ",e.jsx("code",{children:"interna()"})," é registrada na segunda chamada, você teria um ",e.jsx("em",{children:"fatal error"})," de função já declarada. Para esse tipo de cenário (função local de verdade), use Closures — assunto do capítulo Arrow Functions e Closures."]}),e.jsx("h2",{children:"function_exists: descobrindo se algo já foi declarado"}),e.jsxs("p",{children:["Quando você está escrevendo código que pode rodar em ambientes diferentes (com extensões opcionais, por exemplo), ",e.jsx("code",{children:"function_exists()"})," permite verificar se uma função está disponível antes de chamá-la. Ela aceita uma string com o nome."]}),e.jsx(o,{filename:"checagem.php",code:`<?php
declare(strict_types=1);

if (function_exists("mb_strtoupper")) {
    echo mb_strtoupper("olá, mundo!", "UTF-8");
} else {
    echo strtoupper("ola, mundo!"); // fallback ASCII
}
echo PHP_EOL;

// também serve para suas próprias funções
function ajudar(): string {
    return "estou aqui";
}

var_dump(function_exists("ajudar"));
var_dump(function_exists("nao_existe"));`,output:`OLÁ, MUNDO!
bool(true)
bool(false)`}),e.jsx("h2",{children:'Função como string: o "callable"'}),e.jsxs("p",{children:["Em PHP, o nome de uma função em forma de string é um ",e.jsx("strong",{children:"callable"})," — pode ser passado adiante e invocado. É assim que funções nativas como ",e.jsx("code",{children:"array_map"})," e"," ",e.jsx("code",{children:"usort"})," recebem comportamento customizado."]}),e.jsx(o,{filename:"callable.php",code:`<?php
declare(strict_types=1);

function dobrar(int $n): int {
    return $n * 2;
}

// passando o nome como string
$resultado = array_map("dobrar", [1, 2, 3, 4]);
print_r($resultado);

// chamando dinamicamente pelo nome
$nomeFn = "dobrar";
echo $nomeFn(10) . PHP_EOL;

// PHP 8.1+: sintaxe first-class (preferida)
$fn = dobrar(...);
echo $fn(7) . PHP_EOL;`,output:`Array
(
    [0] => 2
    [1] => 4
    [2] => 6
    [3] => 8
)
20
14`}),e.jsxs(a,{type:"success",title:"Sintaxe first-class callable (PHP 8.1+)",children:["A forma ",e.jsx("code",{children:"dobrar(...)"})," com três pontos é o jeito moderno e seguro de pegar uma referência para uma função. Ela é checada em tempo de compilação (você descobre o erro na hora se digitar errado) e funciona com métodos, closures e até funções nativas:",e.jsx("code",{children:"strlen(...)"}),"."]}),e.jsx("h2",{children:"Rodando os exemplos"}),e.jsx("p",{children:"Salve qualquer um dos exemplos acima em um arquivo e execute pelo CLI do PHP. Não precisa de servidor web — funções são lógica pura."}),e.jsx(s,{user:"dev",host:"php",cwd:"~/projetos",command:"php saudacao.php",output:`Olá, Wallyson! Bem-vindo(a).
Olá, Ada! Bem-vindo(a).
Olá, Linus! Bem-vindo(a).`}),e.jsx("h2",{children:"Boas práticas em uma frase"}),e.jsxs("ul",{children:[e.jsxs("li",{children:["Uma função faz ",e.jsx("strong",{children:"uma coisa"}),'. Se o nome tem "e" no meio, divida.']}),e.jsxs("li",{children:["Use ",e.jsx("code",{children:"declare(strict_types=1);"})," e sempre tipe parâmetros e retorno."]}),e.jsx("li",{children:"Nunca dependa de variáveis globais. Passe tudo como parâmetro."}),e.jsxs("li",{children:["Prefira ",e.jsx("code",{children:"nome(...)"})," a strings quando passar funções adiante."]})]}),e.jsxs("p",{children:["No próximo capítulo a gente aprofunda nos ",e.jsx("strong",{children:"type hints e return types"}),": union types, intersection types, ",e.jsx("code",{children:"void"}),", ",e.jsx("code",{children:"never"})," e o tal do"," ",e.jsx("code",{children:"strict_types"})," que você já viu rondando os exemplos."]})]})}export{d as default};
