import{j as e}from"./index-B5-q-eol.js";import{P as i,A as s,a as o}from"./AlertBox-CVbFLZEd.js";import{T as a}from"./TerminalBlock-6fqVIX2R.js";function d(){return e.jsxs(i,{title:"Variáveis e escopo",subtitle:"Por que toda variável em PHP começa com $, como o escopo realmente funciona (spoiler: não é igual a outras linguagens) e as funções que você vai usar todo dia para lidar com elas.",difficulty:"iniciante",timeToRead:"10 min",category:"Sintaxe Básica",children:[e.jsx(s,{type:"info",title:"Pré-requisitos",children:e.jsxs("p",{children:["Antes deste capítulo, é bom já ter visto: ",e.jsx("a",{href:"#/sintaxe",className:"text-[#8993BE] underline",children:"Sintaxe básica"}),"."]})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"$nome"})," "," — "," ","toda variável começa com $ seguido de letra ou _; é case-sensitive."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Escopo local"})," "," — "," ","variáveis dentro de função NÃO enxergam as de fora — diferente de Python ou JS."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"global $x"})," "," — "," ","palavra-chave que importa variável do escopo global para dentro da função."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"static $x"})," "," — "," ","preserva o valor entre chamadas da mesma função."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"unset() / isset()"})," "," — "," ","destrói uma variável / verifica se existe e não é null."]})]}),e.jsx("h2",{children:"O cifrão não é decoração"}),e.jsxs("p",{children:["Em PHP, ",e.jsxs("strong",{children:["toda variável começa com ",e.jsx("code",{children:"$"})]}),". Isso não é estilo: é parte da sintaxe que o parser usa para distinguir variáveis de funções, constantes e palavras-chave. Sem o ",e.jsx("code",{children:"$"}),", o PHP acha que você está chamando uma constante."]}),e.jsx(o,{filename:"cifrao.php",code:`<?php
declare(strict_types=1);

$nome = "Wallyson";
$idade = 30;
$ativo = true;

echo "Nome: $nome" . PHP_EOL;
echo "Idade: $idade" . PHP_EOL;
echo "Ativo: " . ($ativo ? "sim" : "não") . PHP_EOL;

// Sem o $, vira tentativa de constante:
echo nome;`,output:`Nome: Wallyson
Idade: 30
Ativo: sim
PHP Warning:  Use of undefined constant nome - assumed 'nome' (this will throw an Error in a future version)
nome`}),e.jsxs("p",{children:["Atribuição é simples: ",e.jsx("code",{children:"$variavel = valor;"}),". PHP é ",e.jsx("em",{children:"dinamicamente tipado"}),", então você não declara o tipo na criação — a variável passa a existir no momento da primeira atribuição e pode mudar de tipo depois (embora, com ",e.jsx("code",{children:"strict_types"})," e type hints, você consiga muito mais segurança)."]}),e.jsx("h2",{children:"Nomes válidos: regras curtas"}),e.jsxs("ul",{children:[e.jsxs("li",{children:["Começam com ",e.jsx("code",{children:"$"})," seguido de letra ou underscore: ",e.jsx("code",{children:"$nome"}),", ",e.jsx("code",{children:"$_id"}),"."]}),e.jsxs("li",{children:["Depois aceitam letras, números e underscore: ",e.jsx("code",{children:"$user2"}),", ",e.jsx("code",{children:"$total_geral"}),"."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Case-sensitive"}),": ",e.jsx("code",{children:"$nome"})," e ",e.jsx("code",{children:"$Nome"})," são variáveis diferentes."]}),e.jsxs("li",{children:["Convenção PSR-12: ",e.jsx("code",{children:"$camelCase"})," para variáveis e parâmetros."]})]}),e.jsx("h2",{children:"O escopo do PHP é diferente do que você espera"}),e.jsxs("p",{children:['Aqui mora uma das maiores pegadinhas. Em Python ou JavaScript, uma função consegue "enxergar" variáveis declaradas no arquivo (escopo léxico). Em PHP, ',e.jsx("strong",{children:"não"}),". Funções têm um escopo ",e.jsx("em",{children:"completamente isolado"})," do script."]}),e.jsx(o,{filename:"escopo.php",code:`<?php
declare(strict_types=1);

$mensagem = "olá do script";

function imprimir(): void {
    // $mensagem NÃO existe aqui dentro
    echo $mensagem ?? "(indefinida)";
}

imprimir();`,output:"(indefinida)"}),e.jsxs("p",{children:["Surpreso? Boas-vindas ao PHP. Para usar uma variável de fora dentro da função, você tem três caminhos — em ordem do ",e.jsx("strong",{children:"melhor"})," para o ",e.jsx("strong",{children:"pior"}),":"]}),e.jsx(o,{filename:"escopo_solucoes.php",code:`<?php
declare(strict_types=1);

$mensagem = "olá do script";

// 1. MELHOR: passe como parâmetro
function imprimir1(string $msg): void {
    echo $msg . PHP_EOL;
}
imprimir1($mensagem);

// 2. ACEITÁVEL: $GLOBALS (superglobal sempre disponível)
function imprimir2(): void {
    echo $GLOBALS["mensagem"] . PHP_EOL;
}
imprimir2();

// 3. EVITE: keyword global (legado, dificulta testes)
function imprimir3(): void {
    global $mensagem;
    echo $mensagem . PHP_EOL;
}
imprimir3();`,output:`olá do script
olá do script
olá do script`}),e.jsxs(s,{type:"warning",title:"Regra prática",children:["Na vida real, ",e.jsx("strong",{children:"passe parâmetros"}),". Funções que dependem de ",e.jsx("code",{children:"global"})," ou",e.jsx("code",{children:" $GLOBALS"})," são difíceis de testar, debugar e reaproveitar. Se você está tentado a usá-los, provavelmente o que você quer é uma classe com propriedades."]}),e.jsx("h2",{children:"static: a variável que sobrevive entre chamadas"}),e.jsxs("p",{children:["Variáveis comuns dentro de uma função morrem quando ela termina. Uma variável marcada como",e.jsx("code",{children:" static"})," mantém o valor entre chamadas — útil para contadores, caches simples ou memoização. A inicialização só roda uma vez."]}),e.jsx(o,{filename:"static.php",code:`<?php
declare(strict_types=1);

function contador(): int {
    static $n = 0;
    $n++;
    return $n;
}

echo contador() . PHP_EOL; // 1
echo contador() . PHP_EOL; // 2
echo contador() . PHP_EOL; // 3
echo contador() . PHP_EOL; // 4`,output:`1
2
3
4`}),e.jsx("h2",{children:"Variáveis variáveis ($$x): use com parcimônia"}),e.jsxs("p",{children:["PHP permite que o ",e.jsx("em",{children:"nome"})," de uma variável venha de outra variável. É um truque poderoso, esotérico, e quase sempre uma má ideia. Veja em ação para reconhecer quando encontrar em código antigo:"]}),e.jsx(o,{filename:"varvar.php",code:`<?php
declare(strict_types=1);

$campo = "email";
$$campo = "ada@example.com";

// $$campo cria a variável $email
echo $email . PHP_EOL;

// Mesma coisa com sintaxe explícita:
\${"endereco"} = "Rua Lovelace, 1815";
echo $endereco . PHP_EOL;`,output:`ada@example.com
Rua Lovelace, 1815`}),e.jsxs(s,{type:"danger",title:"Por que evitar $$x",children:["Variáveis variáveis quebram análise estática, autocomplete e refactor. Se você precisa mapear nomes a valores, use um ",e.jsx("code",{children:"array"})," associativo: ",e.jsx("code",{children:'$dados["email"]'}),". Quase 100% dos casos têm uma alternativa mais limpa."]}),e.jsx("h2",{children:"isset, empty e unset: o trio obrigatório"}),e.jsx("p",{children:"Para checar se uma variável existe, está vazia, ou para destruí-la, o PHP oferece três construções nativas. Cada uma responde a uma pergunta diferente:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"isset($x)"})," — a variável existe e é ",e.jsxs("strong",{children:["diferente de ",e.jsx("code",{children:"null"})]}),"?"]}),e.jsxs("li",{children:[e.jsx("code",{children:"empty($x)"})," — a variável é ",e.jsx("em",{children:'"vazia"'}),"? (",e.jsx("code",{children:"0"}),", ",e.jsx("code",{children:'"0"'}),", ",e.jsx("code",{children:'""'}),", ",e.jsx("code",{children:"null"}),", ",e.jsx("code",{children:"[]"}),", ",e.jsx("code",{children:"false"}),' são "vazios").']}),e.jsxs("li",{children:[e.jsx("code",{children:"unset($x)"})," — destrói a variável (depois disso, ",e.jsx("code",{children:"isset"})," volta ",e.jsx("code",{children:"false"}),")."]})]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"var_dump"})," — imprime tipo + valor de qualquer expressão. Ferramenta nº 1 de debug. Mostra ",e.jsx("code",{children:"bool(true)"}),", ",e.jsx("code",{children:"int(42)"}),", ",e.jsx("code",{children:'string(3) "Ada"'})," etc. Aceita várias variáveis separadas por vírgula."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"isset / empty / unset"})," — três construções da linguagem (não funções): ",e.jsx("code",{children:"isset"})," testa se existe E não é ",e.jsx("code",{children:"null"}),"; ",e.jsx("code",{children:"empty"}),' testa se é "vazio" (inclui ',e.jsx("code",{children:"0"})," e ",e.jsx("code",{children:'"0"'}),"!); ",e.jsx("code",{children:"unset"})," destrói a variável."]}),e.jsx(o,{filename:"isset_empty.php",code:`<?php
declare(strict_types=1);

$nome = "Ada";
$zero = 0;
$nulo = null;
$vazio = "";

var_dump(isset($nome));    // true
var_dump(isset($nulo));    // false (existe, mas é null)
var_dump(isset($inexistente)); // false

var_dump(empty($nome));    // false
var_dump(empty($zero));    // true (cuidado!)
var_dump(empty($vazio));   // true
var_dump(empty("0"));      // true (mais cuidado ainda!)

unset($nome);
var_dump(isset($nome));    // false`,output:`bool(true)
bool(false)
bool(false)
bool(false)
bool(true)
bool(true)
bool(true)
bool(false)`}),e.jsxs(s,{type:"warning",title:"A pegadinha do empty()",children:[e.jsx("code",{children:"empty($x)"})," considera ",e.jsxs("strong",{children:[e.jsx("code",{children:"0"})," e ",e.jsx("code",{children:'"0"'})," como vazios"]}),'. Se você está validando "o usuário preencheu o campo idade?" e ele digita ',e.jsx("code",{children:"0"}),",",e.jsx("code",{children:" empty"})," diz que está vazio. Para validar presença sem essa armadilha, prefira",e.jsx("code",{children:' isset($x) && $x !== ""'}),"."]}),e.jsx("h2",{children:"Coalescência nula: o atalho moderno"}),e.jsxs("p",{children:["Em PHP 7+, o operador ",e.jsx("code",{children:"??"})," substitui o velho padrão"," ",e.jsx("code",{children:'isset($x) ? $x : "default"'}),". Ele devolve o lado esquerdo se ele existir e não for ",e.jsx("code",{children:"null"}),"; caso contrário, o lado direito. Combine com ",e.jsx("code",{children:"??="})," para atribuir só quando ainda não existe."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"??"})," e ",e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"??="})," — ",e.jsx("code",{children:"??"})," (null coalescing) devolve o lado esquerdo se existir e não for ",e.jsx("code",{children:"null"}),"; senão, o direito. ",e.jsx("code",{children:"??="})," atribui só quando a chave/var é ",e.jsx("code",{children:"null"})," ou inexistente. Substituem o velho ",e.jsx("code",{children:"isset($x) ? $x : padrão"}),"."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"print_r"})," — imprime arrays e objetos em formato amigável (sem tipos, diferente de ",e.jsx("code",{children:"var_dump"}),"). Aceita um segundo argumento ",e.jsx("code",{children:"true"})," para retornar string em vez de imprimir."]}),e.jsx(o,{filename:"coalesce.php",code:`<?php
declare(strict_types=1);

$config = ["host" => "localhost"];

$host = $config["host"] ?? "127.0.0.1";
$port = $config["port"] ?? 5432;

echo "$host:$port" . PHP_EOL;

// ??= atribui só se for null/inexistente
$config["timeout"] ??= 30;
$config["host"] ??= "outro";  // não muda, já existe

print_r($config);`,output:`localhost:5432
Array
(
    [host] => localhost
    [timeout] => 30
)`}),e.jsx("h2",{children:"Rodando os exemplos"}),e.jsx(a,{user:"dev",host:"php",cwd:"~/projetos/php-book",command:"php escopo_solucoes.php",output:`olá do script
olá do script
olá do script`}),e.jsxs("p",{children:["Você já entende como variáveis nascem, vivem (em escopos isolados!) e morrem em PHP. No próximo capítulo a gente atravessa os ",e.jsx("strong",{children:"tipos primitivos"})," — quem é quem na zoologia de ",e.jsx("code",{children:"int"}),", ",e.jsx("code",{children:"float"}),", ",e.jsx("code",{children:"string"}),", ",e.jsx("code",{children:"array"})," e amigos — e aprende a domar o famoso ",e.jsx("em",{children:"type juggling"}),"."]})]})}export{d as default};
