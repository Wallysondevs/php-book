import{j as e}from"./index-Bb4MiiJL.js";import{P as a,A as r,a as o}from"./AlertBox-BpD-xIsb.js";import{T as i}from"./TerminalBlock-DGurMC1r.js";function c(){return e.jsxs(a,{title:"Type hints e return types",subtitle:"Como dizer ao PHP exatamente o que entra e o que sai de cada função — escalares, nullable, union, intersection, void, never e a relação especial entre self, static e parent.",difficulty:"intermediario",timeToRead:"12 min",category:"Funções",children:[e.jsx(r,{type:"info",title:"Pré-requisitos",children:e.jsxs("p",{children:["Antes deste capítulo, é bom já ter visto: ",e.jsx("a",{href:"#/variaveis",className:"text-[#8993BE] underline",children:"Variáveis"}),", ",e.jsx("a",{href:"#/tipos",className:"text-[#8993BE] underline",children:"Tipos"}),", ",e.jsx("a",{href:"#/funcoes",className:"text-[#8993BE] underline",children:"Funções básicas"}),"."]})}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"type hints / return types"})," — anotações de tipo nos parâmetros (",e.jsx("code",{children:"int $n"}),") e no retorno (",e.jsx("code",{children:": string"}),") de uma função. Existem para o PHP vigiar o contrato: chamou com tipo errado, estoura ",e.jsx("code",{children:"TypeError"}),". Combine com ",e.jsx("code",{children:"declare(strict_types=1);"})," para o modo estrito."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"mixed"}),' — tipo "qualquer coisa". Aceita ',e.jsx("code",{children:"int"}),", ",e.jsx("code",{children:"string"}),", ",e.jsx("code",{children:"array"}),", ",e.jsx("code",{children:"object"}),", ",e.jsx("code",{children:"null"}),", etc. Use só quando realmente não dá para ser mais específico — é praticamente desistir da tipagem naquele ponto."]}),e.jsx("h2",{children:"O problema: PHP é generoso demais com tipos"}),e.jsxs("p",{children:["Por padrão, PHP aceita o que você jogar nele e tenta converter automaticamente — o famoso"," ",e.jsx("em",{children:"type juggling"}),". Isso parece útil até o dia em que sua função recebe a string"," ",e.jsx("code",{children:'"abc"'})," onde deveria ter recebido um número e o bug se espalha por três camadas antes de explodir. ",e.jsx("strong",{children:"Type hints"})," resolvem isso: você declara o tipo de cada parâmetro e do retorno, e o PHP passa a vigiar o contrato."]}),e.jsx(o,{filename:"sem-tipo.php",code:`<?php
// SEM type hints — convite ao caos
function dobrar($n) {
    return $n * 2;
}

echo dobrar(5) . PHP_EOL;       // 10
echo dobrar("5 reais") . PHP_EOL; // 10 (?!)
echo dobrar(true) . PHP_EOL;    // 2
echo dobrar(null) . PHP_EOL;    // 0`,output:`10
10
2
0`}),e.jsx("p",{children:"Agora a versão tipada — e estrita:"}),e.jsx(o,{filename:"com-tipo.php",code:`<?php
declare(strict_types=1);

function dobrar(int $n): int {
    return $n * 2;
}

echo dobrar(5) . PHP_EOL;
echo dobrar("5 reais"); // TypeError imediato`,output:`10
PHP Fatal error: Uncaught TypeError: dobrar(): Argument #1 ($n) must be of type int, string given`}),e.jsx("h2",{children:"declare(strict_types=1): a chave do cofre"}),e.jsxs("p",{children:["Sem essa declaração, PHP roda em ",e.jsx("strong",{children:"modo coercivo"}),": ele tenta converter valores para casar com o tipo declarado (",e.jsx("code",{children:'"42"'})," vira ",e.jsx("code",{children:"42"}),","," ",e.jsx("code",{children:"1"})," vira ",e.jsx("code",{children:'"1"'}),"). Com ",e.jsx("code",{children:"declare(strict_types=1);"})," como"," ",e.jsx("em",{children:"primeira instrução"})," do arquivo, o PHP exige o tipo exato. Conversão proibida."]}),e.jsxs(r,{type:"warning",title:"strict_types vale só para o arquivo onde está",children:["A diretiva afeta as ",e.jsx("strong",{children:"chamadas feitas a partir desse arquivo"}),", não a função em si. Se você chama uma função estrita a partir de um arquivo sem ",e.jsx("code",{children:"strict_types"}),", o modo coercivo vale. Por isso a regra é: ",e.jsx("strong",{children:"todo arquivo novo começa com"})," ",e.jsx("code",{children:"declare(strict_types=1);"}),"."]}),e.jsx("h2",{children:"Os tipos escalares e os básicos"}),e.jsxs("p",{children:["PHP suporta os tipos primitivos ",e.jsx("code",{children:"int"}),", ",e.jsx("code",{children:"float"}),", ",e.jsx("code",{children:"string"}),","," ",e.jsx("code",{children:"bool"}),", mais ",e.jsx("code",{children:"array"}),", ",e.jsx("code",{children:"object"}),", ",e.jsx("code",{children:"callable"}),","," ",e.jsx("code",{children:"iterable"}),", ",e.jsx("code",{children:"mixed"})," (qualquer coisa) e os pseudotipos"," ",e.jsx("code",{children:"void"})," e ",e.jsx("code",{children:"never"})," (só para retorno)."]}),e.jsx(o,{filename:"basicos.php",code:`<?php
declare(strict_types=1);

function formatarPreco(float $valor, string $moeda = "BRL"): string {
    return sprintf("%s %.2f", $moeda, $valor);
}

function maioresDeIdade(array $idades): array {
    return array_filter($idades, fn(int $i) => $i >= 18);
}

echo formatarPreco(19.9) . PHP_EOL;
print_r(maioresDeIdade([12, 17, 18, 21, 30]));`,output:`BRL 19.90
Array
(
    [2] => 18
    [3] => 21
    [4] => 30
)`}),e.jsx("h2",{children:'Nullable: o "?" antes do tipo'}),e.jsxs("p",{children:["Coloque um ",e.jsx("code",{children:"?"})," antes do tipo quando o parâmetro (ou retorno) puder ser"," ",e.jsx("code",{children:"null"}),". ",e.jsx("code",{children:"?string"})," é exatamente o mesmo que ",e.jsx("code",{children:"string|null"}),", só mais curto. Use quando faz sentido a ausência de valor — busca que não achou nada, usuário ainda não logado, etc."]}),e.jsx(o,{filename:"nullable.php",code:`<?php
declare(strict_types=1);

function buscarEmailPorId(?int $id): ?string {
    if ($id === null) {
        return null;
    }
    $banco = [1 => "ada@exemplo.dev", 2 => "linus@exemplo.dev"];
    return $banco[$id] ?? null;
}

var_dump(buscarEmailPorId(1));
var_dump(buscarEmailPorId(99));
var_dump(buscarEmailPorId(null));`,output:`string(15) "ada@exemplo.dev"
NULL
NULL`}),e.jsx("h2",{children:'Union types (PHP 8.0+): "ou um, ou outro"'}),e.jsxs("p",{children:["Quando faz sentido aceitar mais de um tipo, separe com pipe (",e.jsx("code",{children:"|"}),"). É comum em funções de formatação que aceitam ",e.jsx("code",{children:"int|float"}),", ou em parsers que aceitam"," ",e.jsx("code",{children:"string|int"}),"."]}),e.jsx(o,{filename:"union.php",code:`<?php
declare(strict_types=1);

function paraNumero(string|int|float $valor): float {
    return (float) $valor;
}

function descrever(int|string $id): string {
    return is_int($id)
        ? "ID numérico: {$id}"
        : "ID alfanumérico: {$id}";
}

echo paraNumero("3.14") . PHP_EOL;
echo paraNumero(42) . PHP_EOL;
echo descrever(7) . PHP_EOL;
echo descrever("ABC-001") . PHP_EOL;`,output:`3.14
42
ID numérico: 7
ID alfanumérico: ABC-001`}),e.jsx("h2",{children:'Intersection types (PHP 8.1+): "tem que ser as duas coisas"'}),e.jsxs("p",{children:["Use ",e.jsx("code",{children:"&"})," para exigir que o valor implemente ",e.jsx("strong",{children:"todas"})," as interfaces listadas. Útil quando você precisa combinar contratos — por exemplo, algo que seja ao mesmo tempo ",e.jsx("code",{children:"Countable"})," e ",e.jsx("code",{children:"Iterator"}),"."]}),e.jsx(o,{filename:"intersection.php",code:`<?php
declare(strict_types=1);

function descreverColecao(\\Countable&\\Traversable $colecao): string {
    $total = count($colecao);
    $primeiros = [];
    foreach ($colecao as $item) {
        $primeiros[] = $item;
        if (count($primeiros) >= 3) break;
    }
    return "Total: {$total}. Primeiros: " . implode(", ", $primeiros);
}

$obj = new ArrayObject(["café", "pão", "manteiga", "geleia", "queijo"]);
echo descreverColecao($obj);`,output:"Total: 5. Primeiros: café, pão, manteiga"}),e.jsxs(r,{type:"info",title:"Union e intersection não se misturam livremente",children:["Até o PHP 8.2 surgiram os ",e.jsx("em",{children:"DNF types"})," (Disjunctive Normal Form), que permitem combinar os dois assim: ",e.jsx("code",{children:"(A&B)|null"}),". Em código novo, prefira começar simples e crescer só quando o domínio realmente exigir."]}),e.jsx("h2",{children:'void: "não retorno nada"'}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"void"}),' — tipo de retorno que diz "essa função não devolve valor". Existe para deixar claro que ela é chamada pelo efeito colateral (logar, salvar, imprimir). Não pode ter ',e.jsx("code",{children:"return $algo;"})," — só ",e.jsx("code",{children:"return;"})," sozinho ou nada."]}),e.jsxs("p",{children:["Use ",e.jsx("code",{children:"void"})," quando a função existe puramente pelo efeito colateral — logar, gravar, imprimir. Funções ",e.jsx("code",{children:"void"})," não podem ter ",e.jsx("code",{children:"return $algo;"}),". Podem ter ",e.jsx("code",{children:"return;"})," sozinho para sair antes do fim."]}),e.jsx(o,{filename:"void.php",code:`<?php
declare(strict_types=1);

function logar(string $msg): void {
    $hora = date("H:i:s");
    echo "[{$hora}] {$msg}" . PHP_EOL;
    // sem return — implícito
}

function avisar(?string $msg): void {
    if ($msg === null) {
        return; // sai antes — permitido
    }
    echo "AVISO: {$msg}" . PHP_EOL;
}

logar("aplicação iniciada");
avisar("disco quase cheio");
avisar(null);
logar("encerrado");`,output:`[14:32:01] aplicação iniciada
AVISO: disco quase cheio
[14:32:01] encerrado`}),e.jsx("h2",{children:'never (PHP 8.1+): "essa função não termina normalmente"'}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"never"}),' — tipo de retorno (PHP 8.1+) que diz "essa função nunca volta para quem chamou": ela ou lança exceção, ou chama ',e.jsx("code",{children:"exit"}),"/",e.jsx("code",{children:"die"}),". Diferente de ",e.jsx("code",{children:"void"}),", que retorna mas sem valor. IDEs e PHPStan usam isso para análise de fluxo."]}),e.jsxs("p",{children:[e.jsx("code",{children:"never"})," é diferente de ",e.jsx("code",{children:"void"}),". Ela diz ao PHP (e à sua IDE) que a função ",e.jsx("strong",{children:"nunca"})," devolve o controle ao chamador — ou ela lança exceção, ou ela chama ",e.jsx("code",{children:"exit"}),"/",e.jsx("code",{children:"die"}),". Útil para handlers de erro e redirects."]}),e.jsx(o,{filename:"never.php",code:`<?php
declare(strict_types=1);

function abortar(string $motivo): never {
    throw new RuntimeException($motivo);
}

function validarIdade(int $idade): int {
    if ($idade < 0) {
        abortar("Idade negativa: {$idade}");
    }
    return $idade;
}

try {
    validarIdade(-5);
} catch (RuntimeException $e) {
    echo "capturado: " . $e->getMessage();
}`,output:"capturado: Idade negativa: -5"}),e.jsx("h2",{children:"self, static e parent em métodos"}),e.jsx("p",{children:"Dentro de classes, três tipos especiais aparecem como retorno:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"self"})," — referência à classe onde o método foi ",e.jsx("em",{children:"declarado"}),"."]}),e.jsxs("li",{children:[e.jsx("code",{children:"static"})," — referência à classe que ",e.jsx("em",{children:"chamou"})," o método (late static binding). É o que você quase sempre quer em métodos fluentes."]}),e.jsxs("li",{children:[e.jsx("code",{children:"parent"})," — referência à classe pai."]})]}),e.jsx(o,{filename:"self-static.php",code:`<?php
declare(strict_types=1);

class QueryBuilder {
    protected array $where = [];

    public function where(string $cond): static {
        $this->where[] = $cond;
        return $this;
    }

    public function toSql(): string {
        return "SELECT * WHERE " . implode(" AND ", $this->where);
    }
}

class UserQueryBuilder extends QueryBuilder {
    public function ativos(): static {
        return $this->where("ativo = 1");
    }
}

$sql = (new UserQueryBuilder())
    ->ativos()
    ->where("idade >= 18")
    ->toSql();

echo $sql;`,output:"SELECT * WHERE ativo = 1 AND idade >= 18"}),e.jsxs(r,{type:"success",title:"Por que static em vez de self?",children:["Se ",e.jsx("code",{children:"where()"})," retornasse ",e.jsx("code",{children:"self"}),", o tipo declarado seria"," ",e.jsx("code",{children:"QueryBuilder"})," e a IDE perderia a referência da subclasse"," ",e.jsx("code",{children:"UserQueryBuilder"})," no encadeamento. Com ",e.jsx("code",{children:"static"}),", o tipo se ajusta à classe concreta que chamou. Em APIs fluentes, prefira sempre ",e.jsx("code",{children:"static"}),"."]}),e.jsx("h2",{children:"Verificando a versão e rodando"}),e.jsxs("p",{children:["Union types pedem PHP 8.0+. Intersection e ",e.jsx("code",{children:"never"})," pedem PHP 8.1+. Confira sua versão antes de adotar:"]}),e.jsx(i,{user:"dev",host:"php",cwd:"~/projetos",command:"php -v",output:`PHP 8.4.1 (cli) (built: Nov 21 2024 12:34:56) (NTS)
Copyright (c) The PHP Group
Zend Engine v4.4.1, Copyright (c) Zend Technologies`}),e.jsx(i,{user:"dev",host:"php",cwd:"~/projetos",command:"php intersection.php",output:"Total: 5. Primeiros: café, pão, manteiga"}),e.jsx("h2",{children:"Resumo prático"}),e.jsxs("ul",{children:[e.jsxs("li",{children:["Sempre comece arquivos com ",e.jsx("code",{children:"declare(strict_types=1);"}),"."]}),e.jsxs("li",{children:["Tipe ",e.jsx("strong",{children:"todos"})," os parâmetros e o retorno — sem exceções."]}),e.jsxs("li",{children:["Use ",e.jsx("code",{children:"?Tipo"})," para nullable; ",e.jsx("code",{children:"Tipo|Outro"})," para union; ",e.jsx("code",{children:"Tipo&Outro"})," para intersection."]}),e.jsxs("li",{children:["Métodos fluentes retornam ",e.jsx("code",{children:"static"}),", nunca ",e.jsx("code",{children:"self"}),"."]}),e.jsxs("li",{children:["Use ",e.jsx("code",{children:"void"})," para efeito colateral; ",e.jsx("code",{children:"never"})," quando a execução não retorna."]})]}),e.jsxs("p",{children:["No próximo capítulo a gente entra no mundo das ",e.jsx("strong",{children:"arrow functions e closures"})," ","— aquelas funções pequenininhas que vivem dentro de ",e.jsx("code",{children:"array_map"})," e amigos."]})]})}export{c as default};
