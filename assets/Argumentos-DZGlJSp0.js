import{j as e}from"./index-Bb4MiiJL.js";import{P as s,A as o,a}from"./AlertBox-BpD-xIsb.js";import{T as r}from"./TerminalBlock-DGurMC1r.js";function d(){return e.jsxs(s,{title:"Argumentos: default, named, variadic",subtitle:"Como dar superpoderes às suas assinaturas: valores padrão, argumentos nomeados (8.0), variadic com ...$args, splat na chamada e readonly em constructor promotion (8.1+).",difficulty:"intermediario",timeToRead:"11 min",category:"Funções",children:[e.jsx(o,{type:"info",title:"Pré-requisitos",children:e.jsxs("p",{children:["Antes deste capítulo, é bom já ter visto: ",e.jsx("a",{href:"#/funcoes",className:"text-[#8993BE] underline",children:"Funções básicas"}),", ",e.jsx("a",{href:"#/type-hints",className:"text-[#8993BE] underline",children:"Type hints"}),", ",e.jsx("a",{href:"#/arrow-functions",className:"text-[#8993BE] underline",children:"Arrow functions"}),"."]})}),e.jsx("h2",{children:"O problema: assinaturas que crescem fora de controle"}),e.jsx("p",{children:"Quando uma função aceita 5 ou 6 parâmetros, lembrar a ordem certa de cada um vira pesadelo. E pior: alterar a posição de um parâmetro quebra todo mundo que chama a função. Os recursos de argumentos modernos do PHP existem para resolver isso — você passa só o que precisa, na ordem que quiser, e os defaults cuidam do resto."}),e.jsx(a,{filename:"problema.php",code:`<?php
declare(strict_types=1);

// 5 parâmetros, fácil de errar a ordem
function criarUsuario(
    string $nome,
    string $email,
    bool $ativo = true,
    string $papel = "user",
    ?string $telefone = null,
): array {
    return compact("nome", "email", "ativo", "papel", "telefone");
}

print_r(criarUsuario("Ada", "ada@exemplo.dev"));`,output:`Array
(
    [nome] => Ada
    [email] => ada@exemplo.dev
    [ativo] => 1
    [papel] => user
    [telefone] =>
)`}),e.jsx("h2",{children:"Valores padrão"}),e.jsxs("p",{children:["Qualquer parâmetro pode ter um valor padrão usando ",e.jsx("code",{children:"="}),". O default só é usado quando o argumento ",e.jsx("strong",{children:"não é passado"}),'. A regra clássica era "parâmetros com default vêm sempre por último" — com argumentos nomeados isso ficou mais flexível, mas ainda é a convenção.']}),e.jsx(a,{filename:"defaults.php",code:`<?php
declare(strict_types=1);

function formatarPreco(
    float $valor,
    string $moeda = "BRL",
    int $casas = 2,
    string $separador = ","
): string {
    $formatado = number_format($valor, $casas, $separador, ".");
    return "{$moeda} {$formatado}";
}

echo formatarPreco(1234.5) . PHP_EOL;
echo formatarPreco(1234.5, "USD") . PHP_EOL;
echo formatarPreco(1234.5, "EUR", 3) . PHP_EOL;
echo formatarPreco(1234.5, "JPY", 0) . PHP_EOL;`,output:`BRL 1.234,50
USD 1.234,50
EUR 1.234,500
JPY 1.235`}),e.jsxs(o,{type:"warning",title:"Defaults precisam ser constantes em tempo de compilação",children:["Você pode usar literais (",e.jsx("code",{children:'"BRL"'}),", ",e.jsx("code",{children:"2"}),", ",e.jsx("code",{children:"true"}),", arrays literais) e constantes (",e.jsx("code",{children:"PHP_INT_MAX"}),"). Mas ",e.jsx("strong",{children:"não pode"})," chamar funções no default (",e.jsx("code",{children:"$x = time()"})," não funciona). Para isso, use"," ",e.jsx("code",{children:"?Tipo $x = null"})," e calcule dentro da função."]}),e.jsx("h2",{children:"Named arguments (PHP 8.0+): chame pelo nome"}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"named arguments"})," — passe argumentos pelo nome do parâmetro, não pela posição (PHP 8.0+). Existe para auto-documentar chamadas com muitos parâmetros e pular opcionais sem se preocupar com ordem. Sintaxe: ",e.jsx("code",{children:'func(nome: "Ada", idade: 30)'}),". Posicionais sempre vêm antes dos nomeados."]}),e.jsxs("p",{children:["Em vez de decorar a posição, passe o nome do parâmetro com ",e.jsx("code",{children:"nome: valor"}),". Você pode misturar posicionais (sempre antes) com nomeados, e pular qualquer parâmetro que tenha default."]}),e.jsx(a,{filename:"nomeados.php",code:`<?php
declare(strict_types=1);

function formatarPreco(
    float $valor,
    string $moeda = "BRL",
    int $casas = 2,
    string $separador = ","
): string {
    $formatado = number_format($valor, $casas, $separador, ".");
    return "{$moeda} {$formatado}";
}

// pulando "moeda" e "casas" — só mudando o separador
echo formatarPreco(1234.5, separador: ".") . PHP_EOL;

// posicional + nomeado
echo formatarPreco(1234.5, "USD", casas: 4) . PHP_EOL;

// fica auto-documentado
echo formatarPreco(
    valor: 99.9,
    moeda: "EUR",
    casas: 2
);`,output:`BRL 1.234.50
USD 1.234,5000
EUR 99,90`}),e.jsxs(o,{type:"info",title:"Named args mudam o jogo da compatibilidade",children:["Como agora você chama parâmetros pelo nome, ",e.jsx("strong",{children:"renomear um parâmetro vira breaking change"}),". Em bibliotecas públicas, escolha nomes pensados para durar."]}),e.jsx("h2",{children:"Variadic: aceitando N argumentos com ...$args"}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"...$args (variadic)"})," — coleta um número variável de argumentos em um array. Existe para funções que aceitam N valores (somar, juntar, log com vários campos). Sintaxe: ",e.jsx("code",{children:"function f(int ...$nums) { ... }"}),". É ",e.jsx("strong",{children:"sempre o último parâmetro"})," e pode ter type hint — todos os valores são validados."]}),e.jsxs("p",{children:["Coloque ",e.jsx("code",{children:"..."})," antes do nome do parâmetro para receber um número variável de valores como array. Ele ",e.jsx("strong",{children:"obrigatoriamente"})," é o último parâmetro. Pode (e deve) ter type hint — todos os valores serão validados."]}),e.jsx(a,{filename:"variadic.php",code:`<?php
declare(strict_types=1);

function somar(int ...$numeros): int {
    return array_sum($numeros);
}

function juntar(string $separador, string ...$partes): string {
    return implode($separador, $partes);
}

echo somar(1, 2, 3) . PHP_EOL;
echo somar(10, 20, 30, 40, 50) . PHP_EOL;
echo somar() . PHP_EOL; // zero argumentos é válido
echo juntar(" / ", "casa", "trabalho", "academia") . PHP_EOL;`,output:`6
150
0
casa / trabalho / academia`}),e.jsx("h2",{children:"Splat: explodindo um array na chamada"}),e.jsxs("p",{children:["O mesmo ",e.jsx("code",{children:"..."})," funciona ",e.jsx("em",{children:"na chamada"})," da função: ele explode um array nos argumentos posicionais. Funciona com qualquer função, não só com variadic."]}),e.jsx(a,{filename:"splat.php",code:`<?php
declare(strict_types=1);

function multiplicar(int $a, int $b, int $c): int {
    return $a * $b * $c;
}

$valores = [2, 3, 4];
echo multiplicar(...$valores) . PHP_EOL;

function somarTudo(int ...$ns): int {
    return array_sum($ns);
}

$grupo1 = [1, 2, 3];
$grupo2 = [10, 20];

// combinando arrays no splat
echo somarTudo(...$grupo1, ...$grupo2) . PHP_EOL;

// PHP 8.1+: splat com chaves nomeadas vira named args
$config = ["b" => 100, "a" => 1, "c" => 10];
echo multiplicar(...$config);`,output:`24
36
1000`}),e.jsx(o,{type:"success",title:"Splat com chaves string vira named arguments",children:"A partir do PHP 8.1, se o array tem chaves string, o splat as trata como nomes de parâmetros. Isso é poderoso para passar configurações sem se preocupar com a ordem."}),e.jsx("h2",{children:"Constructor promotion + readonly (PHP 8.1+)"}),e.jsxs("p",{children:["A combinação que mudou como escrevemos classes em PHP: declarar visibilidade no parâmetro do construtor cria a propriedade automaticamente. Adicionar ",e.jsx("code",{children:"readonly"})," a impede de ser modificada depois de criada — você ganha imutabilidade quase de graça."]}),e.jsx(a,{filename:"promotion.php",code:`<?php
declare(strict_types=1);

final class Pedido {
    public function __construct(
        public readonly string $id,
        public readonly string $cliente,
        public readonly float $total,
        public readonly string $status = "pendente",
    ) {}
}

$p = new Pedido(
    id: "PED-001",
    cliente: "Wallyson",
    total: 199.90,
);

echo "Pedido {$p->id} de {$p->cliente}: R$ {$p->total} ({$p->status})";

try {
    // tentar modificar dispara erro em runtime
    $p->status = "pago";
} catch (Error $e) {
    echo PHP_EOL . "erro: " . $e->getMessage();
}`,output:`Pedido PED-001 de Wallyson: R$ 199.9 (pendente)
erro: Cannot modify readonly property Pedido::$status`}),e.jsx("h2",{children:"Caso real: factory com argumentos nomeados"}),e.jsx("p",{children:"Junte tudo: defaults, named arguments, variadic e readonly promotion. Você ganha um construtor expressivo, seguro e fácil de evoluir sem quebrar callers."}),e.jsx(a,{filename:"email.php",code:`<?php
declare(strict_types=1);

final class Email {
    public function __construct(
        public readonly string $de,
        public readonly string $assunto,
        public readonly string $corpo,
        public readonly array $para,
        public readonly array $cc = [],
        public readonly array $bcc = [],
        public readonly bool $html = false,
    ) {}

    public function preview(): string {
        $destinatarios = implode(", ", $this->para);
        $tipo = $this->html ? "HTML" : "texto";
        return "[{$tipo}] De: {$this->de} | Para: {$destinatarios} | Assunto: {$this->assunto}";
    }
}

$msg = new Email(
    de: "no-reply@exemplo.dev",
    assunto: "Bem-vindo!",
    corpo: "<h1>Oi!</h1>",
    para: ["ada@exemplo.dev", "linus@exemplo.dev"],
    cc: ["log@exemplo.dev"],
    html: true,
);

echo $msg->preview();`,output:"[HTML] De: no-reply@exemplo.dev | Para: ada@exemplo.dev, linus@exemplo.dev | Assunto: Bem-vindo!"}),e.jsx("h2",{children:"Verificando o suporte da sua versão"}),e.jsx("p",{children:"Named arguments: PHP 8.0+. Readonly em propriedades: PHP 8.1+. Readonly classes: PHP 8.2+. Confirme com:"}),e.jsx(r,{user:"dev",host:"php",cwd:"~/projetos",command:"php -v",output:`PHP 8.4.1 (cli) (built: Nov 21 2024 12:34:56) (NTS)
Copyright (c) The PHP Group`}),e.jsx(r,{user:"dev",host:"php",cwd:"~/projetos",command:"php email.php",output:"[HTML] De: no-reply@exemplo.dev | Para: ada@exemplo.dev, linus@exemplo.dev | Assunto: Bem-vindo!"}),e.jsx("h2",{children:"Resumo prático"}),e.jsxs("ul",{children:[e.jsxs("li",{children:["Use ",e.jsx("strong",{children:"defaults"})," para parâmetros opcionais — sempre por último na ordem."]}),e.jsxs("li",{children:["Prefira ",e.jsx("strong",{children:"named arguments"})," quando a chamada tem 3+ parâmetros: vira documentação."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Variadic"})," (",e.jsx("code",{children:"...$args"}),") coleta N valores em array; é sempre o último."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Splat"})," na chamada (",e.jsx("code",{children:"foo(...$arr)"}),") explode arrays em argumentos posicionais ou nomeados."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Constructor promotion + readonly"})," entrega imutabilidade e concisão sem boilerplate."]})]}),e.jsxs("p",{children:["Com isso fechamos a trilha de funções. Próximos capítulos a gente entra de cabeça em"," ",e.jsx("strong",{children:"orientação a objetos"})," moderna em PHP — onde o readonly promotion brilha de verdade."]})]})}export{d as default};
