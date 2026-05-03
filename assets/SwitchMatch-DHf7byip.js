import{j as e}from"./index-B5-q-eol.js";import{P as s,A as o,a}from"./AlertBox-CVbFLZEd.js";function i(){return e.jsxs(s,{title:"switch e match",subtitle:"O switch tradicional com seu temido fallthrough, o match do PHP 8 com comparação estrita e retorno de expressão, e quando trocar uma cadeia de if/elseif por algo mais elegante.",difficulty:"iniciante",timeToRead:"10 min",category:"Controle de Fluxo",children:[e.jsx(o,{type:"info",title:"Pré-requisitos",children:e.jsxs("p",{children:["Antes deste capítulo, é bom já ter visto: ",e.jsx("a",{href:"#/operadores",className:"text-[#8993BE] underline",children:"Operadores"}),", ",e.jsx("a",{href:"#/if-else",className:"text-[#8993BE] underline",children:"if / elseif / else"}),"."]})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"switch"})," "," — "," ","compara com == (loose); precisa break."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"match (8.0)"})," "," — "," ","expressão; compara com === (estrito); sem fall-through."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"default"})," "," — "," ","caso padrão; em match falha com UnhandledMatchError se ausente."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Múltiplos valores"})," "," — "," ",'match(1,2,3) => "x" — vírgula agrupa.']}),e.jsxs("li",{children:[e.jsx("strong",{children:"Retorno"})," "," — "," ","match retorna valor; switch é statement."]})]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"switch vs match"})," — ambos comparam um valor com várias opções. ",e.jsx("code",{children:"switch"})," é o velho: usa comparação solta (",e.jsx("code",{children:"=="}),"), exige ",e.jsx("code",{children:"break"}),' em cada caso (senão "vaza" para o próximo) e é uma ',e.jsx("em",{children:"declaração"}),". ",e.jsx("code",{children:"match"})," (PHP 8+) é o moderno: comparação estrita (",e.jsx("code",{children:"==="}),"), ",e.jsx("strong",{children:"sem fallthrough"}),", e é uma ",e.jsx("em",{children:"expressão"})," que retorna valor. Quando puder, prefira ",e.jsx("code",{children:"match"}),"."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"break"})," — sai imediatamente do bloco atual (",e.jsx("code",{children:"switch"}),", ",e.jsx("code",{children:"for"}),", ",e.jsx("code",{children:"while"}),", ",e.jsx("code",{children:"foreach"}),"). Em ",e.jsx("code",{children:"switch"})," é obrigatório para evitar fallthrough. Aceita um número opcional (",e.jsx("code",{children:"break 2"}),") para escapar de loops aninhados."]}),e.jsx("h2",{children:"Quando vários ifs viram ruído"}),e.jsxs("p",{children:["Você precisa decidir entre cinco status, traduzir um código numérico para uma label, ou despachar uma ação por nome. Pode escrever ",e.jsx("code",{children:"if/elseif"})," infinitos, mas existe coisa melhor. Em PHP a gente tem dois operadores para isso: o velho ",e.jsx("code",{children:"switch"})," (existe desde sempre) e o moderno",e.jsx("code",{children:" match"})," (PHP 8.0+)."]}),e.jsx("h2",{children:"switch tradicional"}),e.jsxs("p",{children:["O ",e.jsx("code",{children:"switch"})," compara um valor com vários ",e.jsx("code",{children:"case"}),"s. ",e.jsx("strong",{children:"Atenção:"})," a comparação é ",e.jsx("em",{children:"solta"})," (",e.jsx("code",{children:"=="}),", não ",e.jsx("code",{children:"==="}),") e — a pegadinha clássica — você",e.jsx("strong",{children:"precisa"})," de ",e.jsx("code",{children:"break"})," em cada caso, ou o código continua executando os próximos (o famoso ",e.jsx("em",{children:"fallthrough"}),")."]}),e.jsx(a,{filename:"switch-basico.php",code:`<?php
declare(strict_types=1);

$status = "pago";

switch ($status) {
    case "pendente":
        echo "Aguardando pagamento";
        break;
    case "pago":
        echo "Pedido confirmado";
        break;
    case "cancelado":
        echo "Pedido cancelado";
        break;
    default:
        echo "Status desconhecido";
}
echo PHP_EOL;`,output:"Pedido confirmado"}),e.jsxs(o,{type:"danger",title:"Esqueci o break, e agora?",children:["Sem o ",e.jsx("code",{children:"break"}),", o PHP executa o case correspondente ",e.jsx("strong",{children:"e todos os seguintes"})," até achar um ",e.jsx("code",{children:"break"})," ou o fim do bloco. Isso causa bugs sutis. Sempre cheque os ",e.jsx("code",{children:"break"}),"antes de fechar o arquivo."]}),e.jsx("h2",{children:"Fallthrough proposital"}),e.jsx("p",{children:"Tem situações onde fallthrough é exatamente o que você quer: agrupar vários cases que fazem a mesma coisa."}),e.jsx(a,{filename:"fallthrough.php",code:`<?php
declare(strict_types=1);

function tipoDoDia(string $dia): string {
    switch (strtolower($dia)) {
        case "sabado":
        case "domingo":
            return "fim de semana";
        case "segunda":
        case "terca":
        case "quarta":
        case "quinta":
        case "sexta":
            return "dia útil";
        default:
            return "dia inválido";
    }
}

echo tipoDoDia("sabado") . PHP_EOL;
echo tipoDoDia("Quarta") . PHP_EOL;
echo tipoDoDia("xyz") . PHP_EOL;`,output:`fim de semana
dia útil
dia inválido`}),e.jsxs("p",{children:["Aqui o ",e.jsx("code",{children:"return"})," serve como o ",e.jsx("code",{children:"break"}),": encerra o switch (e a função). Esse é um padrão limpo e comum."]}),e.jsxs(o,{type:"warning",title:"A comparação solta morde",children:[e.jsx("code",{children:"switch (0)"})," bate em ",e.jsx("code",{children:'case "qualquer-string"'})," porque ",e.jsx("code",{children:'0 == "qualquer-string"'})," ","era ",e.jsx("code",{children:"true"})," em PHP antigo. No PHP 8 mudou (",e.jsx("code",{children:'"qualquer-string" == 0'})," agora é",e.jsx("code",{children:" false"}),"), mas o switch continua usando ",e.jsx("code",{children:"=="}),". Para comparação estrita, use ",e.jsx("strong",{children:"match"})," — é justamente o problema que ele resolve."]}),e.jsx("h2",{children:"match: o switch que faltava"}),e.jsxs("p",{children:["O ",e.jsx("code",{children:"match"})," chegou no PHP 8.0 e corrigiu três problemas do ",e.jsx("code",{children:"switch"})," de uma vez só:"]}),e.jsxs("ul",{children:[e.jsxs("li",{children:["Comparação ",e.jsx("strong",{children:"estrita"})," (",e.jsx("code",{children:"==="}),"), sem mais surpresas com tipos."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Sem fallthrough"})," — cada braço é independente."]}),e.jsxs("li",{children:["É uma ",e.jsx("strong",{children:"expressão"}),", retorna valor diretamente."]})]}),e.jsx(a,{filename:"match-basico.php",code:`<?php
declare(strict_types=1);

function descricaoStatus(string $status): string {
    return match ($status) {
        "pendente"  => "Aguardando pagamento",
        "pago"      => "Pedido confirmado",
        "cancelado" => "Pedido cancelado",
        default     => "Status desconhecido",
    };
}

echo descricaoStatus("pago") . PHP_EOL;
echo descricaoStatus("xyz") . PHP_EOL;`,output:`Pedido confirmado
Status desconhecido`}),e.jsxs("p",{children:["Note como cada braço usa ",e.jsx("code",{children:"=>"})," e termina com vírgula. Não tem ",e.jsx("code",{children:"break"}),", não tem chaves. Funciona como uma expressão: você atribui, retorna, passa como argumento."]}),e.jsx("h2",{children:"Múltiplos valores no mesmo braço"}),e.jsx("p",{children:"Para agrupar valores, separe por vírgula — equivalente ao fallthrough proposital do switch, mas explícito."}),e.jsx(a,{filename:"match-multi.php",code:`<?php
declare(strict_types=1);

function tipoDoDia(string $dia): string {
    return match (strtolower($dia)) {
        "sabado", "domingo"
            => "fim de semana",
        "segunda", "terca", "quarta", "quinta", "sexta"
            => "dia útil",
        default
            => "dia inválido",
    };
}

echo tipoDoDia("Domingo") . PHP_EOL;
echo tipoDoDia("Sexta") . PHP_EOL;
echo tipoDoDia("hoje") . PHP_EOL;`,output:`fim de semana
dia útil
dia inválido`}),e.jsx("h2",{children:"match sem default lança UnhandledMatchError"}),e.jsxs("p",{children:["Se você omite o ",e.jsx("code",{children:"default"})," e nenhum braço bate, o ",e.jsx("code",{children:"match"})," lança uma exceção",e.jsx("code",{children:" UnhandledMatchError"}),". Isso é uma ",e.jsx("strong",{children:"feature"}),": garante que você cobriu todos os casos possíveis. Útil principalmente com ",e.jsx("code",{children:"enum"}),"s."]}),e.jsx(a,{filename:"match-enum.php",code:`<?php
declare(strict_types=1);

enum StatusPedido: string {
    case Pendente   = "pendente";
    case Pago       = "pago";
    case Cancelado  = "cancelado";
}

function corDoStatus(StatusPedido $s): string {
    return match ($s) {
        StatusPedido::Pendente  => "amarelo",
        StatusPedido::Pago      => "verde",
        StatusPedido::Cancelado => "vermelho",
    };
}

echo corDoStatus(StatusPedido::Pago) . PHP_EOL;
echo corDoStatus(StatusPedido::Pendente) . PHP_EOL;`,output:`verde
amarelo`}),e.jsxs(o,{type:"success",title:"Por que essa combinação é poderosa",children:["Se amanhã você adicionar ",e.jsx("code",{children:"StatusPedido::Reembolsado"}),", o PHP vai te avisar (em runtime, e ferramentas como PHPStan em análise estática) que o ",e.jsx("code",{children:"match"})," não cobre o novo caso. É segurança grátis."]}),e.jsx("h2",{children:"Comparação estrita: o detalhe que pega"}),e.jsx(a,{filename:"estrito.php",code:`<?php
declare(strict_types=1);

$valor = "1";

switch ($valor) {
    case 1:
        echo "switch: bateu em inteiro 1" . PHP_EOL;
        break;
    case "1":
        echo "switch: bateu em string '1'" . PHP_EOL;
        break;
}

$resultado = match ($valor) {
    1   => "match: inteiro 1",
    "1" => "match: string '1'",
};
echo $resultado . PHP_EOL;`,output:`switch: bateu em inteiro 1
match: string '1'`}),e.jsxs("p",{children:["Mesmo valor de entrada, resultado diferente. O ",e.jsx("code",{children:"switch"})," bateu no ",e.jsx("code",{children:"1"})," (comparação solta), o ",e.jsx("code",{children:"match"})," só aceita o tipo certo. Quase sempre você quer o comportamento estrito."]}),e.jsx("h2",{children:"Condições mais ricas com match (true)"}),e.jsxs("p",{children:["O ",e.jsx("code",{children:"match"})," compara o sujeito com cada braço. Se o sujeito for ",e.jsx("code",{children:"true"}),", cada braço vira essencialmente uma condição booleana — uma forma muito limpa de escrever escadas de ",e.jsx("code",{children:"if/elseif"}),"."]}),e.jsx(a,{filename:"match-true.php",code:`<?php
declare(strict_types=1);

function faixaEtaria(int $idade): string {
    return match (true) {
        $idade < 13 => "criança",
        $idade < 18 => "adolescente",
        $idade < 60 => "adulto",
        default     => "idoso",
    };
}

echo faixaEtaria(8) . PHP_EOL;
echo faixaEtaria(16) . PHP_EOL;
echo faixaEtaria(35) . PHP_EOL;
echo faixaEtaria(75) . PHP_EOL;`,output:`criança
adolescente
adulto
idoso`}),e.jsx("h2",{children:"switch ou match? Resumo prático"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Use match"})," sempre que estiver no PHP 8+ e for retornar/atribuir um valor."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Use switch"})," quando precisa rodar ",e.jsx("em",{children:"blocos"})," grandes de código com várias instruções por caso (match espera expressões)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Nunca"})," dependa de comparação solta — se está confiando em ",e.jsx("code",{children:'"1" == 1'})," a lógica está errada."]}),e.jsxs("li",{children:["Combine ",e.jsx("code",{children:"match"})," + ",e.jsx("code",{children:"enum"})," sempre que possível: o compilador vira seu QA."]})]}),e.jsxs("p",{children:["No próximo capítulo vamos para ",e.jsx("strong",{children:"loops"})," — onde você descobre que ",e.jsx("code",{children:"foreach"}),"resolve 95% dos casos e que ",e.jsx("code",{children:"break N"})," existe (e às vezes salva sua vida)."]})]})}export{i as default};
