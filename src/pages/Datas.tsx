import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";
import { CodeBlock } from "@/components/ui/CodeBlock";

export default function Datas() {
  return (
    <PageContainer
      title="Datas e horários"
      subtitle="Como o PHP enxerga o tempo: timestamps Unix, date(), strtotime, formatação BR vs ISO 8601 e as armadilhas clássicas de fuso horário."
      difficulty="iniciante"
      timeToRead="11 min"
      category="Datas & Tempo"
    >
      <AlertBox type="info" title="Pré-requisitos">
          <p>Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP.</p>
        </AlertBox>
        <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"DateTime"}</strong> {' — '} {"classe principal; mutável."}
          </li>
        <li>
            <strong>{"DateTimeImmutable"}</strong> {' — '} {"preferida — modify retorna nova."}
          </li>
        <li>
            <strong>{"DateInterval"}</strong> {' — '} {"duração; P1Y2M3D = 1 ano 2 meses 3 dias."}
          </li>
        <li>
            <strong>{"DateTimeZone"}</strong> {' — '} {"timezone explícito evita bug de DST."}
          </li>
        <li>
            <strong>{"format()"}</strong> {' — '} {"Y-m-d H:i:s — letras seguem strftime expandido."}
          </li>
        </ul>
          <h2>O problema: imprimir &quot;agora&quot; em formato brasileiro</h2>
      <p>
        Toda aplicação web precisa, mais cedo ou mais tarde, mostrar a data atual. O cliente quer ver{" "}
        <code>21/03/2025 às 14h30</code>, não <code>1742565000</code>. Vamos do zero: o PHP guarda tempo
        como um inteiro chamado <strong>timestamp Unix</strong> — segundos desde 1º de janeiro de 1970.
      </p>

      <PhpBlock
        filename="agora.php"
        code={`<?php
declare(strict_types=1);

$agora = time();
echo "Timestamp: $agora" . PHP_EOL;
echo "Em ISO:    " . date('Y-m-d H:i:s', $agora) . PHP_EOL;
echo "Em BR:     " . date('d/m/Y H:i:s', $agora) . PHP_EOL;
echo "Por extenso: " . date('l, j \\d\\e F \\d\\e Y', $agora);`}
        output={`Timestamp: 1742565000
Em ISO:    2025-03-21 14:30:00
Em BR:     21/03/2025 14:30:00
Por extenso: Friday, 21 de March de 2025`}
      />

      <p>
        A função <code>time()</code> devolve o timestamp atual e <code>date($formato, $ts)</code> formata
        ele como string. Se você omitir o segundo argumento, o PHP usa <code>time()</code> automaticamente.
      </p>

      <AlertBox type="info" title="Os caracteres mais usados de date()">
        <ul className="list-disc ml-5 mt-1 space-y-0.5">
          <li><code>Y</code> ano com 4 dígitos · <code>y</code> com 2</li>
          <li><code>m</code> mês 01–12 · <code>n</code> sem zero · <code>F</code> nome em inglês</li>
          <li><code>d</code> dia 01–31 · <code>j</code> sem zero · <code>l</code> dia da semana</li>
          <li><code>H</code> hora 00–23 · <code>i</code> minuto · <code>s</code> segundo</li>
          <li>Use <code>\</code> antes de letras literais: <code>'d \d\e m'</code> imprime <code>21 de 03</code>.</li>
        </ul>
      </AlertBox>

      <h2>strtotime: o canivete suíço para parsear datas</h2>
      <p>
        Você raramente vai trabalhar com timestamps puros. Quase sempre recebe uma string vinda de um
        formulário, banco ou API. A função <code>strtotime()</code> entende uma quantidade absurda de
        formatos em inglês e devolve um timestamp:
      </p>

      <PhpBlock
        filename="strtotime.php"
        code={`<?php
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
    printf("%-30s -> %s\n", $expr, date('Y-m-d H:i:s', $ts));
}`}
        output={`now                            -> 2025-03-21 14:30:00
2025-03-21                     -> 2025-03-21 00:00:00
2025-03-21 14:30:00            -> 2025-03-21 14:30:00
+1 day                         -> 2025-03-22 14:30:00
+2 weeks                       -> 2025-04-04 14:30:00
-3 months                      -> 2024-12-21 14:30:00
next monday                    -> 2025-03-24 00:00:00
last day of february 2025      -> 2025-02-28 00:00:00`}
      />

      <AlertBox type="warning" title="Cuidado com formatos brasileiros">
        <code>strtotime('21/03/2025')</code> devolve <code>false</code> porque o PHP interpreta o
        primeiro número como mês (formato americano <code>m/d/Y</code>). Para datas com barras use
        traços (<code>21-03-2025</code> é tratado como <code>d-m-Y</code>) ou prefira{" "}
        <code>DateTimeImmutable::createFromFormat()</code>, que veremos no próximo capítulo.
      </AlertBox>

      <h2>mktime: construindo timestamps na unha</h2>
      <p>
        Quando você tem os componentes separados (vindos de três <code>&lt;select&gt;</code>, por exemplo),
        use <code>mktime()</code>. A assinatura é <code>mktime(hora, min, seg, mes, dia, ano)</code> —
        decore essa ordem porque ela é fácil de errar.
      </p>

      <PhpBlock
        filename="mktime.php"
        code={`<?php
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
echo "Último dia de fev/$ano: " . date('d/m/Y', $ultimoDia);`}
        output={`25/12/2025 12:00
01/01/2026
Último dia de fev/2025: 28/02/2025`}
      />

      <h2>Comparando datas (sem virar zumbi de fuso)</h2>
      <p>
        Como timestamps são inteiros, a comparação é trivial: <code>&lt;</code>, <code>&gt;</code>,{" "}
        <code>===</code>. O segredo é nunca comparar strings de data diretamente — use sempre o timestamp.
      </p>

      <PhpBlock
        filename="comparar.php"
        code={`<?php
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
echo statusEntrega(date('Y-m-d H:i:s', time() + 86400 * 30)) . PHP_EOL;`}
        output={`atrasada
entrega hoje
em breve
no prazo`}
      />

      <p>
        Note o uso de <code>match (true)</code> com expressões booleanas — um padrão moderno e elegante
        para substituir cadeias de <code>if/elseif</code>. E sim, <code>86400</code> é o número de
        segundos em um dia (24 × 60 × 60).
      </p>

      <h2>ISO 8601 vs formato BR: padronize os dois lados</h2>
      <p>
        A regra de ouro: <strong>guarde em ISO 8601</strong> (<code>2025-03-21T14:30:00-03:00</code>) no
        banco, em logs e em APIs. <strong>Formate como BR</strong> só na hora de mostrar para o usuário.
      </p>

      <PhpBlock
        filename="iso-vs-br.php"
        code={`<?php
declare(strict_types=1);

$ts = mktime(14, 30, 0, 3, 21, 2025);

// Para banco de dados / API
echo date('c', $ts)       . PHP_EOL;  // ISO 8601 com fuso
echo date('Y-m-d\\TH:i:s', $ts) . PHP_EOL; // sem fuso

// Para o usuário brasileiro
echo date('d/m/Y', $ts)       . PHP_EOL;
echo date('d/m/Y H:i', $ts)   . PHP_EOL;
echo date("d/m/Y \\à\\s H'h'i", $ts);`}
        output={`2025-03-21T14:30:00-03:00
2025-03-21T14:30:00
21/03/2025
21/03/2025 14:30
21/03/2025 às 14h30`}
      />

      <h2>Cálculos com timestamps</h2>
      <p>
        Como tudo é segundo, somar e subtrair tempo vira aritmética. Mas <strong>não use isso para
        calcular meses ou anos</strong> — meses têm tamanhos diferentes, e em <em>dias</em> o horário
        de verão pode te enganar. Para cálculos seguros, prefira <code>DateTimeImmutable</code>{" "}
        (próximo capítulo).
      </p>

      <PhpBlock
        filename="calculos.php"
        code={`<?php
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
echo "Idade aproximada: $idadeAprox anos";`}
        output={`Trabalhou: 8h45min
Idade aproximada: 34 anos`}
      />

      <AlertBox type="danger" title="O bug clássico: somar dias com 86400">
        <code>$amanha = time() + 86400;</code> <strong>parece</strong> certo, mas no dia em que o
        horário de verão entra/sai a conta erra por uma hora. A regra: para somar &quot;1 dia&quot; do
        ponto de vista humano use <code>strtotime('+1 day', $ts)</code> ou{" "}
        <code>$dt-&gt;modify('+1 day')</code>, que respeitam fuso e DST.
      </AlertBox>

      <h2>Configurando o fuso (faça isso UMA vez)</h2>
      <p>
        Se o seu PHP roda com fuso UTC e você não diz nada, todas as datas vão sair três horas
        adiantadas em relação ao Brasil. Coloque isso no <code>php.ini</code> ou no bootstrap da
        aplicação:
      </p>

      <CodeBlock
        language="ini"
        title="php.ini"
        code={`; /etc/php/8.4/php.ini
date.timezone = America/Sao_Paulo`}
      />

      <PhpBlock
        filename="bootstrap.php"
        code={`<?php
declare(strict_types=1);

// Em runtime, antes de qualquer chamada de data
date_default_timezone_set('America/Sao_Paulo');

echo date_default_timezone_get() . PHP_EOL;
echo date('d/m/Y H:i:s O');`}
        output={`America/Sao_Paulo
21/03/2025 14:30:00 -0300`}
      />

      <h2>checkdate: validando antes de processar</h2>
      <p>
        Recebeu três campos do formulário? Antes de gritar com o usuário, valide:
      </p>

      <PhpBlock
        filename="validar.php"
        code={`<?php
declare(strict_types=1);

function dataValida(int $dia, int $mes, int $ano): bool {
    return checkdate($mes, $dia, $ano);
}

var_dump(dataValida(29, 2, 2024)); // bissexto -> true
var_dump(dataValida(29, 2, 2025)); // não bissexto -> false
var_dump(dataValida(31, 4, 2025)); // abril não tem 31 -> false
var_dump(dataValida(15, 8, 2025));`}
        output={`bool(true)
bool(false)
bool(false)
bool(true)`}
      />

      <h2>Rodando os exemplos</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/datas"
        command="php agora.php"
        output={`Timestamp: 1742565000
Em ISO:    2025-03-21 14:30:00
Em BR:     21/03/2025 14:30:00
Por extenso: Friday, 21 de March de 2025`}
      />

      <p>
        Reparou no <em>Friday</em> e <em>March</em> em inglês? A função <code>date()</code> não tem
        noção de localidade — para dia/mês em português usaremos <code>IntlDateFormatter</code> no
        capítulo <strong>Timezones e i18n</strong>. Antes disso, no próximo capítulo vamos trocar essa
        API procedural pela orientada a objetos com <code>DateTimeImmutable</code>, que resolve quase
        todos os problemas que vimos aqui.
      </p>
    </PageContainer>
  );
}
