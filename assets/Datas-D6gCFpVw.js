import{j as e}from"./index-Bb4MiiJL.js";import{P as s,a,A as o}from"./AlertBox-BpD-xIsb.js";import{T as r}from"./TerminalBlock-DGurMC1r.js";import{C as t}from"./CodeBlock-C3V-qEkN.js";function c(){return e.jsxs(s,{title:"Datas e horários",subtitle:"Como o PHP enxerga o tempo: timestamps Unix, date(), strtotime, formatação BR vs ISO 8601 e as armadilhas clássicas de fuso horário.",difficulty:"iniciante",timeToRead:"11 min",category:"Datas & Tempo",children:[e.jsx("h2",{children:'O problema: imprimir "agora" em formato brasileiro'}),e.jsxs("p",{children:["Toda aplicação web precisa, mais cedo ou mais tarde, mostrar a data atual. O cliente quer ver"," ",e.jsx("code",{children:"21/03/2025 às 14h30"}),", não ",e.jsx("code",{children:"1742565000"}),". Vamos do zero: o PHP guarda tempo como um inteiro chamado ",e.jsx("strong",{children:"timestamp Unix"})," — segundos desde 1º de janeiro de 1970."]}),e.jsx(a,{filename:"agora.php",code:`<?php
declare(strict_types=1);

$agora = time();
echo "Timestamp: $agora" . PHP_EOL;
echo "Em ISO:    " . date('Y-m-d H:i:s', $agora) . PHP_EOL;
echo "Em BR:     " . date('d/m/Y H:i:s', $agora) . PHP_EOL;
echo "Por extenso: " . date('l, j \\d\\e F \\d\\e Y', $agora);`,output:`Timestamp: 1742565000
Em ISO:    2025-03-21 14:30:00
Em BR:     21/03/2025 14:30:00
Por extenso: Friday, 21 de March de 2025`}),e.jsxs("p",{children:["A função ",e.jsx("code",{children:"time()"})," devolve o timestamp atual e ",e.jsx("code",{children:"date($formato, $ts)"})," formata ele como string. Se você omitir o segundo argumento, o PHP usa ",e.jsx("code",{children:"time()"})," automaticamente."]}),e.jsx(o,{type:"info",title:"Os caracteres mais usados de date()",children:e.jsxs("ul",{className:"list-disc ml-5 mt-1 space-y-0.5",children:[e.jsxs("li",{children:[e.jsx("code",{children:"Y"})," ano com 4 dígitos · ",e.jsx("code",{children:"y"})," com 2"]}),e.jsxs("li",{children:[e.jsx("code",{children:"m"})," mês 01–12 · ",e.jsx("code",{children:"n"})," sem zero · ",e.jsx("code",{children:"F"})," nome em inglês"]}),e.jsxs("li",{children:[e.jsx("code",{children:"d"})," dia 01–31 · ",e.jsx("code",{children:"j"})," sem zero · ",e.jsx("code",{children:"l"})," dia da semana"]}),e.jsxs("li",{children:[e.jsx("code",{children:"H"})," hora 00–23 · ",e.jsx("code",{children:"i"})," minuto · ",e.jsx("code",{children:"s"})," segundo"]}),e.jsxs("li",{children:["Use ",e.jsx("code",{children:"\\"})," antes de letras literais: ",e.jsx("code",{children:"'d \\d\\e m'"})," imprime ",e.jsx("code",{children:"21 de 03"}),"."]})]})}),e.jsx("h2",{children:"strtotime: o canivete suíço para parsear datas"}),e.jsxs("p",{children:["Você raramente vai trabalhar com timestamps puros. Quase sempre recebe uma string vinda de um formulário, banco ou API. A função ",e.jsx("code",{children:"strtotime()"})," entende uma quantidade absurda de formatos em inglês e devolve um timestamp:"]}),e.jsx(a,{filename:"strtotime.php",code:`<?php
declare(strict_types=1);

$exemplos = [
    'now',
    '2025-03-21',
    '2025-03-21 14:30:00',
    '+1 day',
    '+2 weeks',
    '-3 months',
    'next monday',
    'last day of february 2025',
];

foreach ($exemplos as $expr) {
    $ts = strtotime($expr);
    printf("%-30s -> %s
", $expr, date('Y-m-d H:i:s', $ts));
}`,output:`now                            -> 2025-03-21 14:30:00
2025-03-21                     -> 2025-03-21 00:00:00
2025-03-21 14:30:00            -> 2025-03-21 14:30:00
+1 day                         -> 2025-03-22 14:30:00
+2 weeks                       -> 2025-04-04 14:30:00
-3 months                      -> 2024-12-21 14:30:00
next monday                    -> 2025-03-24 00:00:00
last day of february 2025      -> 2025-02-28 00:00:00`}),e.jsxs(o,{type:"warning",title:"Cuidado com formatos brasileiros",children:[e.jsx("code",{children:"strtotime('21/03/2025')"})," devolve ",e.jsx("code",{children:"false"})," porque o PHP interpreta o primeiro número como mês (formato americano ",e.jsx("code",{children:"m/d/Y"}),"). Para datas com barras use traços (",e.jsx("code",{children:"21-03-2025"})," é tratado como ",e.jsx("code",{children:"d-m-Y"}),") ou prefira"," ",e.jsx("code",{children:"DateTimeImmutable::createFromFormat()"}),", que veremos no próximo capítulo."]}),e.jsx("h2",{children:"mktime: construindo timestamps na unha"}),e.jsxs("p",{children:["Quando você tem os componentes separados (vindos de três ",e.jsx("code",{children:"<select>"}),", por exemplo), use ",e.jsx("code",{children:"mktime()"}),". A assinatura é ",e.jsx("code",{children:"mktime(hora, min, seg, mes, dia, ano)"})," — decore essa ordem porque ela é fácil de errar."]}),e.jsx(a,{filename:"mktime.php",code:`<?php
declare(strict_types=1);

// 25 de dezembro de 2025, meio-dia
$natal = mktime(12, 0, 0, 12, 25, 2025);
echo date('d/m/Y H:i', $natal) . PHP_EOL;

// O mktime também aceita "estouros" e ajusta sozinho:
$ts = mktime(0, 0, 0, 13, 1, 2025); // mês 13 = janeiro do ano seguinte
echo date('d/m/Y', $ts) . PHP_EOL;

// Útil pra calcular "último dia do mês":
$mes = 2; $ano = 2025;
$ultimoDia = mktime(0, 0, 0, $mes + 1, 0, $ano); // dia 0 do mês seguinte
echo "Último dia de fev/$ano: " . date('d/m/Y', $ultimoDia);`,output:`25/12/2025 12:00
01/01/2026
Último dia de fev/2025: 28/02/2025`}),e.jsx("h2",{children:"Comparando datas (sem virar zumbi de fuso)"}),e.jsxs("p",{children:["Como timestamps são inteiros, a comparação é trivial: ",e.jsx("code",{children:"<"}),", ",e.jsx("code",{children:">"}),","," ",e.jsx("code",{children:"==="}),". O segredo é nunca comparar strings de data diretamente — use sempre o timestamp."]}),e.jsx(a,{filename:"comparar.php",code:`<?php
declare(strict_types=1);

function statusEntrega(string $previstoIso): string {
    $previsto = strtotime($previstoIso);
    $agora    = time();

    return match (true) {
        $previsto < $agora               => 'atrasada',
        $previsto - $agora < 86400       => 'entrega hoje',
        $previsto - $agora < 86400 * 3   => 'em breve',
        default                          => 'no prazo',
    };
}

echo statusEntrega('2024-01-01 12:00:00') . PHP_EOL;
echo statusEntrega(date('Y-m-d H:i:s', time() + 3600)) . PHP_EOL;
echo statusEntrega(date('Y-m-d H:i:s', time() + 86400 * 2)) . PHP_EOL;
echo statusEntrega(date('Y-m-d H:i:s', time() + 86400 * 30)) . PHP_EOL;`,output:`atrasada
entrega hoje
em breve
no prazo`}),e.jsxs("p",{children:["Note o uso de ",e.jsx("code",{children:"match (true)"})," com expressões booleanas — um padrão moderno e elegante para substituir cadeias de ",e.jsx("code",{children:"if/elseif"}),". E sim, ",e.jsx("code",{children:"86400"})," é o número de segundos em um dia (24 × 60 × 60)."]}),e.jsx("h2",{children:"ISO 8601 vs formato BR: padronize os dois lados"}),e.jsxs("p",{children:["A regra de ouro: ",e.jsx("strong",{children:"guarde em ISO 8601"})," (",e.jsx("code",{children:"2025-03-21T14:30:00-03:00"}),") no banco, em logs e em APIs. ",e.jsx("strong",{children:"Formate como BR"})," só na hora de mostrar para o usuário."]}),e.jsx(a,{filename:"iso-vs-br.php",code:`<?php
declare(strict_types=1);

$ts = mktime(14, 30, 0, 3, 21, 2025);

// Para banco de dados / API
echo date('c', $ts)       . PHP_EOL;  // ISO 8601 com fuso
echo date('Y-m-d\\TH:i:s', $ts) . PHP_EOL; // sem fuso

// Para o usuário brasileiro
echo date('d/m/Y', $ts)       . PHP_EOL;
echo date('d/m/Y H:i', $ts)   . PHP_EOL;
echo date("d/m/Y \\à\\s H'h'i", $ts);`,output:`2025-03-21T14:30:00-03:00
2025-03-21T14:30:00
21/03/2025
21/03/2025 14:30
21/03/2025 às 14h30`}),e.jsx("h2",{children:"Cálculos com timestamps"}),e.jsxs("p",{children:["Como tudo é segundo, somar e subtrair tempo vira aritmética. Mas ",e.jsx("strong",{children:"não use isso para calcular meses ou anos"})," — meses têm tamanhos diferentes, e em ",e.jsx("em",{children:"dias"})," o horário de verão pode te enganar. Para cálculos seguros, prefira ",e.jsx("code",{children:"DateTimeImmutable"})," ","(próximo capítulo)."]}),e.jsx(a,{filename:"calculos.php",code:`<?php
declare(strict_types=1);

$inicio = strtotime('2025-03-21 09:00:00');
$fim    = strtotime('2025-03-21 17:45:00');

$segundos = $fim - $inicio;
$horas    = intdiv($segundos, 3600);
$minutos  = intdiv($segundos % 3600, 60);

echo "Trabalhou: {$horas}h{$minutos}min" . PHP_EOL;

// Idade aproximada (cuidado: bissextos podem dar +/-1 dia)
$nascimento = strtotime('1990-05-15');
$idadeAprox = intdiv(time() - $nascimento, 86400 * 365);
echo "Idade aproximada: $idadeAprox anos";`,output:`Trabalhou: 8h45min
Idade aproximada: 34 anos`}),e.jsxs(o,{type:"danger",title:"O bug clássico: somar dias com 86400",children:[e.jsx("code",{children:"$amanha = time() + 86400;"})," ",e.jsx("strong",{children:"parece"}),' certo, mas no dia em que o horário de verão entra/sai a conta erra por uma hora. A regra: para somar "1 dia" do ponto de vista humano use ',e.jsx("code",{children:"strtotime('+1 day', $ts)"})," ou"," ",e.jsx("code",{children:"$dt->modify('+1 day')"}),", que respeitam fuso e DST."]}),e.jsx("h2",{children:"Configurando o fuso (faça isso UMA vez)"}),e.jsxs("p",{children:["Se o seu PHP roda com fuso UTC e você não diz nada, todas as datas vão sair três horas adiantadas em relação ao Brasil. Coloque isso no ",e.jsx("code",{children:"php.ini"})," ou no bootstrap da aplicação:"]}),e.jsx(t,{language:"ini",title:"php.ini",code:`; /etc/php/8.4/php.ini
date.timezone = America/Sao_Paulo`}),e.jsx(a,{filename:"bootstrap.php",code:`<?php
declare(strict_types=1);

// Em runtime, antes de qualquer chamada de data
date_default_timezone_set('America/Sao_Paulo');

echo date_default_timezone_get() . PHP_EOL;
echo date('d/m/Y H:i:s O');`,output:`America/Sao_Paulo
21/03/2025 14:30:00 -0300`}),e.jsx("h2",{children:"checkdate: validando antes de processar"}),e.jsx("p",{children:"Recebeu três campos do formulário? Antes de gritar com o usuário, valide:"}),e.jsx(a,{filename:"validar.php",code:`<?php
declare(strict_types=1);

function dataValida(int $dia, int $mes, int $ano): bool {
    return checkdate($mes, $dia, $ano);
}

var_dump(dataValida(29, 2, 2024)); // bissexto -> true
var_dump(dataValida(29, 2, 2025)); // não bissexto -> false
var_dump(dataValida(31, 4, 2025)); // abril não tem 31 -> false
var_dump(dataValida(15, 8, 2025));`,output:`bool(true)
bool(false)
bool(false)
bool(true)`}),e.jsx("h2",{children:"Rodando os exemplos"}),e.jsx(r,{user:"dev",host:"php",cwd:"~/projetos/datas",command:"php agora.php",output:`Timestamp: 1742565000
Em ISO:    2025-03-21 14:30:00
Em BR:     21/03/2025 14:30:00
Por extenso: Friday, 21 de March de 2025`}),e.jsxs("p",{children:["Reparou no ",e.jsx("em",{children:"Friday"})," e ",e.jsx("em",{children:"March"})," em inglês? A função ",e.jsx("code",{children:"date()"})," não tem noção de localidade — para dia/mês em português usaremos ",e.jsx("code",{children:"IntlDateFormatter"})," no capítulo ",e.jsx("strong",{children:"Timezones e i18n"}),". Antes disso, no próximo capítulo vamos trocar essa API procedural pela orientada a objetos com ",e.jsx("code",{children:"DateTimeImmutable"}),", que resolve quase todos os problemas que vimos aqui."]})]})}export{c as default};
