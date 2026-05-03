import{j as e}from"./index-B5-q-eol.js";import{P as t,A as o,a}from"./AlertBox-CVbFLZEd.js";import{T as i}from"./TerminalBlock-6fqVIX2R.js";function m(){return e.jsxs(t,{title:"DateTimeImmutable",subtitle:"A API orientada a objetos para datas no PHP — imutável, type-safe e à prova de bugs sutis. Saia do date()/strtotime() e entre no mundo civilizado.",difficulty:"intermediario",timeToRead:"13 min",category:"Datas & Tempo",children:[e.jsx(o,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Imutável"})," "," — "," ","cada modify devolve nova instância."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Concorrência"})," "," — "," ","objetos imutáveis são naturalmente thread-safe."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Estilo funcional"})," "," — "," ",'encadeia ->modify("+1 day")->setTime(0,0).']}),e.jsxs("li",{children:[e.jsx("strong",{children:"Padrão moderno"})," "," — "," ","prefira DateTimeImmutable em todo código novo."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Conversão"})," "," — "," ","DateTime::createFromImmutable / setTimezone."]})]}),e.jsx("h2",{children:"O bug que vai te assombrar com DateTime"}),e.jsxs("p",{children:["PHP tem duas classes equivalentes: ",e.jsx("code",{children:"DateTime"})," (mutável) e"," ",e.jsx("code",{children:"DateTimeImmutable"})," (imutável). Elas têm a mesma API — mas a primeira é uma armadilha ambulante. Veja por quê:"]}),e.jsx(a,{filename:"bug-mutavel.php",code:`<?php
declare(strict_types=1);

$pedido = new DateTime('2025-03-21 10:00');
$entrega = $pedido;
$entrega->modify('+3 days');

echo "Pedido:  " . $pedido->format('d/m/Y H:i') . PHP_EOL;
echo "Entrega: " . $entrega->format('d/m/Y H:i');`,output:`Pedido:  24/03/2025 10:00
Entrega: 24/03/2025 10:00`}),e.jsxs("p",{children:["Surpresa: o pedido também avançou três dias! Em PHP, ",e.jsx("code",{children:"$entrega = $pedido"})," copia a"," ",e.jsx("strong",{children:"referência"})," do objeto, e ",e.jsx("code",{children:"modify()"})," altera o objeto original. Isso é a fonte de bugs absurdamente difíceis de rastrear. Agora a versão imutável:"]}),e.jsx(a,{filename:"ok-imutavel.php",code:`<?php
declare(strict_types=1);

$pedido  = new DateTimeImmutable('2025-03-21 10:00');
$entrega = $pedido->modify('+3 days');

echo "Pedido:  " . $pedido->format('d/m/Y H:i') . PHP_EOL;
echo "Entrega: " . $entrega->format('d/m/Y H:i');`,output:`Pedido:  21/03/2025 10:00
Entrega: 24/03/2025 10:00`}),e.jsxs(o,{type:"success",title:"Regra de ouro",children:["Use ",e.jsx("strong",{children:"sempre"})," ",e.jsx("code",{children:"DateTimeImmutable"}),". ",e.jsx("code",{children:"modify()"}),","," ",e.jsx("code",{children:"add()"}),", ",e.jsx("code",{children:"sub()"})," e ",e.jsx("code",{children:"setDate()"})," retornam uma"," ",e.jsx("em",{children:"nova instância"})," em vez de alterar a original. Isso elimina uma classe inteira de bugs."]}),e.jsx("h2",{children:"Criando instâncias"}),e.jsxs("p",{children:["Existem três caminhos principais. O construtor aceita qualquer string que"," ",e.jsx("code",{children:"strtotime()"})," entenda; ",e.jsx("code",{children:"createFromFormat()"})," resolve formatos brasileiros; e ",e.jsx("code",{children:"createFromInterface()"})," converte de um ",e.jsx("code",{children:"DateTime"})," mutável existente."]}),e.jsx(a,{filename:"criando.php",code:`<?php
declare(strict_types=1);

$agora    = new DateTimeImmutable();              // agora
$natal    = new DateTimeImmutable('2025-12-25 00:00:00');
$amanha   = new DateTimeImmutable('tomorrow 9am');

// Formato brasileiro: dia/mês/ano
$brasil = DateTimeImmutable::createFromFormat('d/m/Y H:i', '21/03/2025 14:30');

// A partir de timestamp
$desdeTs = (new DateTimeImmutable())->setTimestamp(1742565000);

foreach ([$agora, $natal, $amanha, $brasil, $desdeTs] as $d) {
    echo $d->format('Y-m-d H:i:s P') . PHP_EOL;
}`,output:`2025-03-21 14:30:00 -03:00
2025-12-25 00:00:00 -03:00
2025-03-22 09:00:00 -03:00
2025-03-21 14:30:00 -03:00
2025-03-21 14:30:00 -03:00`}),e.jsxs(o,{type:"warning",title:"createFromFormat retorna false em erro",children:["Se o formato não bater, você recebe ",e.jsx("code",{children:"false"})," em vez de exceção. Sempre cheque com"," ",e.jsx("code",{children:"if ($dt === false)"})," ou use ",e.jsx("code",{children:"DateTimeImmutable::getLastErrors()"})," para descobrir o que falhou."]}),e.jsx("h2",{children:"format(): controlando como sai a string"}),e.jsxs("p",{children:[e.jsx("code",{children:"format()"})," usa os mesmos caracteres de ",e.jsx("code",{children:"date()"}),", com bônus: o caractere",e.jsx("code",{children:" c"})," devolve ISO 8601 completo, ",e.jsx("code",{children:"r"})," devolve RFC 2822 (formato de email), e ",e.jsx("code",{children:"U"})," devolve o timestamp."]}),e.jsx(a,{filename:"formatos.php",code:`<?php
declare(strict_types=1);

$d = new DateTimeImmutable('2025-03-21 14:30:00', new DateTimeZone('America/Sao_Paulo'));

echo $d->format('c') . PHP_EOL;                 // ISO 8601
echo $d->format('r') . PHP_EOL;                 // RFC 2822 (email)
echo $d->format('U') . PHP_EOL;                 // timestamp
echo $d->format('Y-m-d\\TH:i:s.v\\Z') . PHP_EOL;  // ISO com millis e Z literal
echo $d->format('d/m/Y \\à\\s H\\hi') . PHP_EOL;   // BR amigável
echo $d->format('W \\d\\a \\s\\e\\m\\a
\\a \\d\\e Y');  // semana ISO`,output:`2025-03-21T14:30:00-03:00
Fri, 21 Mar 2025 14:30:00 -0300
1742578200
2025-03-21T14:30:00.000Z
21/03/2025 às 14h30
12 da semana de 2025`}),e.jsx("h2",{children:"diff(): a diferença entre duas datas como objeto"}),e.jsxs("p",{children:["Quer saber quantos dias faltam para o evento? Use ",e.jsx("code",{children:"diff()"}),". Ele retorna um"," ",e.jsx("code",{children:"DateInterval"})," com anos, meses, dias, horas etc. — sem a confusão de dividir timestamps."]}),e.jsx(a,{filename:"diff.php",code:`<?php
declare(strict_types=1);

$nasc  = new DateTimeImmutable('1990-05-15');
$hoje  = new DateTimeImmutable('2025-03-21');
$idade = $nasc->diff($hoje);

printf("Você tem %d anos, %d meses e %d dias.
",
    $idade->y, $idade->m, $idade->d);

$inicio = new DateTimeImmutable('2025-03-21 09:00');
$fim    = new DateTimeImmutable('2025-03-21 17:45');
$jornada = $inicio->diff($fim);
echo $jornada->format('%H:%I horas trabalhadas') . PHP_EOL;

// invert mostra se a segunda data é anterior à primeira
$d = (new DateTimeImmutable('2025-12-31'))
    ->diff(new DateTimeImmutable('2025-01-01'));
echo $d->days . " dias " . ($d->invert ? 'atrás' : 'adiante');`,output:`Você tem 34 anos, 10 meses e 6 dias.
08:45 horas trabalhadas
364 dias atrás`}),e.jsx("h2",{children:"add() e sub() com DateInterval"}),e.jsxs("p",{children:["Para somar tempo, você pode usar ",e.jsx("code",{children:"modify('+3 days')"})," ou ser mais explícito com"," ",e.jsx("code",{children:"DateInterval"}),". A sintaxe ISO 8601 é: ",e.jsx("code",{children:"P"})," (period), depois"," ",e.jsx("code",{children:"nY nM nD"}),", e se precisar de horas, ",e.jsx("code",{children:"T nH nM nS"}),"."]}),e.jsx(a,{filename:"add-sub.php",code:`<?php
declare(strict_types=1);

$pedido = new DateTimeImmutable('2025-03-21 10:00');

$entrega   = $pedido->add(new DateInterval('P3D'));        // +3 dias
$prazo     = $pedido->add(new DateInterval('P1Y2M10D'));   // +1a 2m 10d
$expira    = $pedido->add(new DateInterval('PT2H30M'));    // +2h30m
$ontemHora = $pedido->sub(new DateInterval('PT1H'));       // -1h

// Equivalente, mais legível:
$entregaAlt = $pedido->modify('+3 days');

foreach (['entrega' => $entrega, 'prazo' => $prazo, 'expira' => $expira, 'ontemHora' => $ontemHora] as $k => $v) {
    printf("%-10s %s
", $k . ':', $v->format('d/m/Y H:i'));
}`,output:`entrega:   24/03/2025 10:00
prazo:     31/05/2026 10:00
expira:    21/03/2025 12:30
ontemHora: 21/03/2025 09:00`}),e.jsx("h2",{children:"DatePeriod: iterando datas"}),e.jsxs("p",{children:["Precisa percorrer todos os dias úteis de um mês? Gerar um cronograma semanal? O"," ",e.jsx("code",{children:"DatePeriod"})," é a ferramenta certa."]}),e.jsx(a,{filename:"period.php",code:`<?php
declare(strict_types=1);

$inicio = new DateTimeImmutable('2025-03-17'); // segunda
$fim    = new DateTimeImmutable('2025-03-22'); // sábado
$umDia  = new DateInterval('P1D');

$periodo = new DatePeriod($inicio, $umDia, $fim);

foreach ($periodo as $dia) {
    $diaSemana = $dia->format('N'); // 1=seg ... 7=dom
    if ($diaSemana < 6) {
        echo $dia->format('D d/m') . " — útil" . PHP_EOL;
    }
}

// Toda terça por 4 semanas:
$reunioes = new DatePeriod(
    new DateTimeImmutable('next tuesday 10am'),
    new DateInterval('P7D'),
    3 // gera +1 = 4 ocorrências
);
echo PHP_EOL . "Reuniões:" . PHP_EOL;
foreach ($reunioes as $r) {
    echo " - " . $r->format('d/m/Y H:i') . PHP_EOL;
}`,output:`Mon 17/03 — útil
Tue 18/03 — útil
Wed 19/03 — útil
Thu 20/03 — útil
Fri 21/03 — útil

Reuniões:
 - 25/03/2025 10:00
 - 01/04/2025 10:00
 - 08/04/2025 10:00
 - 15/04/2025 10:00`}),e.jsx("h2",{children:"Comparação: o melhor recurso da API OO"}),e.jsxs("p",{children:["Objetos ",e.jsx("code",{children:"DateTimeImmutable"})," implementam comparação nativa do PHP. Os operadores"," ",e.jsx("code",{children:"<"}),", ",e.jsx("code",{children:">"}),", ",e.jsx("code",{children:"=="}),", ",e.jsx("code",{children:"!="}),", ",e.jsx("code",{children:"<="})," e"," ",e.jsx("code",{children:">="})," funcionam direto, sem precisar comparar timestamps."]}),e.jsx(a,{filename:"comparar-oo.php",code:`<?php
declare(strict_types=1);

$a = new DateTimeImmutable('2025-03-21 10:00');
$b = new DateTimeImmutable('2025-03-21 15:00');
$c = new DateTimeImmutable('2025-03-21 10:00');

var_dump($a < $b);   // true
var_dump($a == $c);  // true (mesmo instante, instâncias diferentes)
var_dump($a === $c); // false (referências diferentes)

// Use no domínio:
final readonly class Assinatura {
    public function __construct(
        public DateTimeImmutable $expiraEm,
    ) {}

    public function vigente(?DateTimeImmutable $agora = null): bool {
        return ($agora ?? new DateTimeImmutable()) < $this->expiraEm;
    }
}

$ass = new Assinatura(new DateTimeImmutable('2025-12-31 23:59:59'));
var_dump($ass->vigente(new DateTimeImmutable('2025-06-01')));`,output:`bool(true)
bool(true)
bool(false)
bool(true)`}),e.jsxs(o,{type:"info",title:"Por que readonly + DateTimeImmutable são amigos",children:["A propriedade ",e.jsx("code",{children:"readonly"})," do PHP 8.1+ garante que ninguém substitua o objeto. Como"," ",e.jsx("code",{children:"DateTimeImmutable"})," também não pode ser modificada in-place, você ganha invariância completa — perfeito para entidades de domínio (datas de assinatura, vencimentos, agendas)."]}),e.jsx("h2",{children:"Type hints: aceite a interface, não a classe"}),e.jsxs("p",{children:["Quando uma função pode receber qualquer tipo de data, use a interface"," ",e.jsx("code",{children:"DateTimeInterface"}),". Assim aceita tanto ",e.jsx("code",{children:"DateTime"})," quanto"," ",e.jsx("code",{children:"DateTimeImmutable"}),":"]}),e.jsx(a,{filename:"interface.php",code:`<?php
declare(strict_types=1);

function diasAte(DateTimeInterface $alvo): int {
    $diff = (new DateTimeImmutable())->diff($alvo);
    return $diff->invert ? -$diff->days : $diff->days;
}

echo diasAte(new DateTimeImmutable('2025-12-25')) . " dias até o Natal" . PHP_EOL;
echo diasAte(new DateTime('2024-01-01')) . " dias até 1/1/2024";`,output:`279 dias até o Natal
-445 dias até 1/1/2024`}),e.jsx("h2",{children:"Rodando os exemplos"}),e.jsx(i,{user:"dev",host:"php",cwd:"~/projetos/datetime",command:"php period.php",output:`Mon 17/03 — útil
Tue 18/03 — útil
Wed 19/03 — útil
Thu 20/03 — útil
Fri 21/03 — útil`}),e.jsxs("p",{children:["Você tem agora uma API completa para manipular datas com segurança. No próximo capítulo atacamos o último monstro do tempo: ",e.jsx("strong",{children:"fusos horários"}),", conversão entre eles, horário de verão e como mostrar datas em português brasileiro de verdade com"," ",e.jsx("code",{children:"IntlDateFormatter"}),"."]})]})}export{m as default};
