import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function DatetimeImutavel() {
  return (
    <PageContainer
      title="DateTimeImmutable"
      subtitle="A API orientada a objetos para datas no PHP — imutável, type-safe e à prova de bugs sutis. Saia do date()/strtotime() e entre no mundo civilizado."
      difficulty="intermediario"
      timeToRead="13 min"
      category="Datas & Tempo"
    >
      <h2>O bug que vai te assombrar com DateTime</h2>
      <p>
        PHP tem duas classes equivalentes: <code>DateTime</code> (mutável) e{" "}
        <code>DateTimeImmutable</code> (imutável). Elas têm a mesma API — mas a primeira é uma armadilha
        ambulante. Veja por quê:
      </p>

      <PhpBlock
        filename="bug-mutavel.php"
        code={`<?php
declare(strict_types=1);

$pedido = new DateTime('2025-03-21 10:00');
$entrega = $pedido;
$entrega->modify('+3 days');

echo "Pedido:  " . $pedido->format('d/m/Y H:i') . PHP_EOL;
echo "Entrega: " . $entrega->format('d/m/Y H:i');`}
        output={`Pedido:  24/03/2025 10:00
Entrega: 24/03/2025 10:00`}
      />

      <p>
        Surpresa: o pedido também avançou três dias! Em PHP, <code>$entrega = $pedido</code> copia a{" "}
        <strong>referência</strong> do objeto, e <code>modify()</code> altera o objeto original.
        Isso é a fonte de bugs absurdamente difíceis de rastrear. Agora a versão imutável:
      </p>

      <PhpBlock
        filename="ok-imutavel.php"
        code={`<?php
declare(strict_types=1);

$pedido  = new DateTimeImmutable('2025-03-21 10:00');
$entrega = $pedido->modify('+3 days');

echo "Pedido:  " . $pedido->format('d/m/Y H:i') . PHP_EOL;
echo "Entrega: " . $entrega->format('d/m/Y H:i');`}
        output={`Pedido:  21/03/2025 10:00
Entrega: 24/03/2025 10:00`}
      />

      <AlertBox type="success" title="Regra de ouro">
        Use <strong>sempre</strong> <code>DateTimeImmutable</code>. <code>modify()</code>,{" "}
        <code>add()</code>, <code>sub()</code> e <code>setDate()</code> retornam uma{" "}
        <em>nova instância</em> em vez de alterar a original. Isso elimina uma classe inteira de bugs.
      </AlertBox>

      <h2>Criando instâncias</h2>
      <p>
        Existem três caminhos principais. O construtor aceita qualquer string que{" "}
        <code>strtotime()</code> entenda; <code>createFromFormat()</code> resolve formatos brasileiros;
        e <code>createFromInterface()</code> converte de um <code>DateTime</code> mutável existente.
      </p>

      <PhpBlock
        filename="criando.php"
        code={`<?php
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
}`}
        output={`2025-03-21 14:30:00 -03:00
2025-12-25 00:00:00 -03:00
2025-03-22 09:00:00 -03:00
2025-03-21 14:30:00 -03:00
2025-03-21 14:30:00 -03:00`}
      />

      <AlertBox type="warning" title="createFromFormat retorna false em erro">
        Se o formato não bater, você recebe <code>false</code> em vez de exceção. Sempre cheque com{" "}
        <code>if ($dt === false)</code> ou use <code>DateTimeImmutable::getLastErrors()</code> para
        descobrir o que falhou.
      </AlertBox>

      <h2>format(): controlando como sai a string</h2>
      <p>
        <code>format()</code> usa os mesmos caracteres de <code>date()</code>, com bônus: o caractere
        <code> c</code> devolve ISO 8601 completo, <code>r</code> devolve RFC 2822 (formato de email),
        e <code>U</code> devolve o timestamp.
      </p>

      <PhpBlock
        filename="formatos.php"
        code={`<?php
declare(strict_types=1);

$d = new DateTimeImmutable('2025-03-21 14:30:00', new DateTimeZone('America/Sao_Paulo'));

echo $d->format('c') . PHP_EOL;                 // ISO 8601
echo $d->format('r') . PHP_EOL;                 // RFC 2822 (email)
echo $d->format('U') . PHP_EOL;                 // timestamp
echo $d->format('Y-m-d\\TH:i:s.v\\Z') . PHP_EOL;  // ISO com millis e Z literal
echo $d->format('d/m/Y \\à\\s H\\hi') . PHP_EOL;   // BR amigável
echo $d->format('W \\d\\a \\s\\e\\m\\a\n\\a \\d\\e Y');  // semana ISO`}
        output={`2025-03-21T14:30:00-03:00
Fri, 21 Mar 2025 14:30:00 -0300
1742578200
2025-03-21T14:30:00.000Z
21/03/2025 às 14h30
12 da semana de 2025`}
      />

      <h2>diff(): a diferença entre duas datas como objeto</h2>
      <p>
        Quer saber quantos dias faltam para o evento? Use <code>diff()</code>. Ele retorna um{" "}
        <code>DateInterval</code> com anos, meses, dias, horas etc. — sem a confusão de dividir
        timestamps.
      </p>

      <PhpBlock
        filename="diff.php"
        code={`<?php
declare(strict_types=1);

$nasc  = new DateTimeImmutable('1990-05-15');
$hoje  = new DateTimeImmutable('2025-03-21');
$idade = $nasc->diff($hoje);

printf("Você tem %d anos, %d meses e %d dias.\n",
    $idade->y, $idade->m, $idade->d);

$inicio = new DateTimeImmutable('2025-03-21 09:00');
$fim    = new DateTimeImmutable('2025-03-21 17:45');
$jornada = $inicio->diff($fim);
echo $jornada->format('%H:%I horas trabalhadas') . PHP_EOL;

// invert mostra se a segunda data é anterior à primeira
$d = (new DateTimeImmutable('2025-12-31'))
    ->diff(new DateTimeImmutable('2025-01-01'));
echo $d->days . " dias " . ($d->invert ? 'atrás' : 'adiante');`}
        output={`Você tem 34 anos, 10 meses e 6 dias.
08:45 horas trabalhadas
364 dias atrás`}
      />

      <h2>add() e sub() com DateInterval</h2>
      <p>
        Para somar tempo, você pode usar <code>modify('+3 days')</code> ou ser mais explícito com{" "}
        <code>DateInterval</code>. A sintaxe ISO 8601 é: <code>P</code> (period), depois{" "}
        <code>nY nM nD</code>, e se precisar de horas, <code>T nH nM nS</code>.
      </p>

      <PhpBlock
        filename="add-sub.php"
        code={`<?php
declare(strict_types=1);

$pedido = new DateTimeImmutable('2025-03-21 10:00');

$entrega   = $pedido->add(new DateInterval('P3D'));        // +3 dias
$prazo     = $pedido->add(new DateInterval('P1Y2M10D'));   // +1a 2m 10d
$expira    = $pedido->add(new DateInterval('PT2H30M'));    // +2h30m
$ontemHora = $pedido->sub(new DateInterval('PT1H'));       // -1h

// Equivalente, mais legível:
$entregaAlt = $pedido->modify('+3 days');

foreach (['entrega' => $entrega, 'prazo' => $prazo, 'expira' => $expira, 'ontemHora' => $ontemHora] as $k => $v) {
    printf("%-10s %s\n", $k . ':', $v->format('d/m/Y H:i'));
}`}
        output={`entrega:   24/03/2025 10:00
prazo:     31/05/2026 10:00
expira:    21/03/2025 12:30
ontemHora: 21/03/2025 09:00`}
      />

      <h2>DatePeriod: iterando datas</h2>
      <p>
        Precisa percorrer todos os dias úteis de um mês? Gerar um cronograma semanal? O{" "}
        <code>DatePeriod</code> é a ferramenta certa.
      </p>

      <PhpBlock
        filename="period.php"
        code={`<?php
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
}`}
        output={`Mon 17/03 — útil
Tue 18/03 — útil
Wed 19/03 — útil
Thu 20/03 — útil
Fri 21/03 — útil

Reuniões:
 - 25/03/2025 10:00
 - 01/04/2025 10:00
 - 08/04/2025 10:00
 - 15/04/2025 10:00`}
      />

      <h2>Comparação: o melhor recurso da API OO</h2>
      <p>
        Objetos <code>DateTimeImmutable</code> implementam comparação nativa do PHP. Os operadores{" "}
        <code>&lt;</code>, <code>&gt;</code>, <code>==</code>, <code>!=</code>, <code>&lt;=</code> e{" "}
        <code>&gt;=</code> funcionam direto, sem precisar comparar timestamps.
      </p>

      <PhpBlock
        filename="comparar-oo.php"
        code={`<?php
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
var_dump($ass->vigente(new DateTimeImmutable('2025-06-01')));`}
        output={`bool(true)
bool(true)
bool(false)
bool(true)`}
      />

      <AlertBox type="info" title="Por que readonly + DateTimeImmutable são amigos">
        A propriedade <code>readonly</code> do PHP 8.1+ garante que ninguém substitua o objeto. Como{" "}
        <code>DateTimeImmutable</code> também não pode ser modificada in-place, você ganha invariância
        completa — perfeito para entidades de domínio (datas de assinatura, vencimentos, agendas).
      </AlertBox>

      <h2>Type hints: aceite a interface, não a classe</h2>
      <p>
        Quando uma função pode receber qualquer tipo de data, use a interface{" "}
        <code>DateTimeInterface</code>. Assim aceita tanto <code>DateTime</code> quanto{" "}
        <code>DateTimeImmutable</code>:
      </p>

      <PhpBlock
        filename="interface.php"
        code={`<?php
declare(strict_types=1);

function diasAte(DateTimeInterface $alvo): int {
    $diff = (new DateTimeImmutable())->diff($alvo);
    return $diff->invert ? -$diff->days : $diff->days;
}

echo diasAte(new DateTimeImmutable('2025-12-25')) . " dias até o Natal" . PHP_EOL;
echo diasAte(new DateTime('2024-01-01')) . " dias até 1/1/2024";`}
        output={`279 dias até o Natal
-445 dias até 1/1/2024`}
      />

      <h2>Rodando os exemplos</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/datetime"
        command="php period.php"
        output={`Mon 17/03 — útil
Tue 18/03 — útil
Wed 19/03 — útil
Thu 20/03 — útil
Fri 21/03 — útil`}
      />

      <p>
        Você tem agora uma API completa para manipular datas com segurança. No próximo capítulo
        atacamos o último monstro do tempo: <strong>fusos horários</strong>, conversão entre eles,
        horário de verão e como mostrar datas em português brasileiro de verdade com{" "}
        <code>IntlDateFormatter</code>.
      </p>
    </PageContainer>
  );
}
