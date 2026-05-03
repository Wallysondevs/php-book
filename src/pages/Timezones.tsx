import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Timezones() {
  return (
    <PageContainer
      title="Timezones e i18n"
      subtitle="Como o PHP lida com fusos horários, conversão entre regiões, horário de verão e como formatar datas e moedas no padrão brasileiro de verdade."
      difficulty="intermediario"
      timeToRead="12 min"
      category="Datas & Tempo"
    >
      <AlertBox type="info" title="Pré-requisitos">
          <p>Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP.</p>
        </AlertBox>
        <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"UTC sempre internamente"}</strong> {' — '} {"guarde em UTC; converta só na exibição."}
          </li>
        <li>
            <strong>{"date_default_timezone_set"}</strong> {' — '} {"define padrão; evita warnings."}
          </li>
        <li>
            <strong>{"DateTimeZone"}</strong> {' — '} {"aceita \"America/Sao_Paulo\" (não BRT — BRT muda em DST)."}
          </li>
        <li>
            <strong>{"DST"}</strong> {' — '} {"horário de verão; bug clássico em datas históricas."}
          </li>
        <li>
            <strong>{"Banco"}</strong> {' — '} {"TIMESTAMP em UTC, exibição em local."}
          </li>
        </ul>
          <h2>O sintoma: as datas estão 3 horas adiantadas</h2>
      <p>
        Você sobe sua API em produção (provavelmente um container Linux com fuso UTC), grava{" "}
        <code>now()</code> no banco e quando o usuário em São Paulo abre o app, vê uma hora a mais do
        que deveria. Bem-vindo ao inferno dos timezones — vamos sair dele de forma definitiva.
      </p>

      <PhpBlock
        filename="problema.php"
        code={`<?php
declare(strict_types=1);

// Servidor sem timezone configurado (default UTC)
echo "Servidor: " . date_default_timezone_get() . PHP_EOL;
echo "date():   " . date('d/m/Y H:i') . PHP_EOL;

// "Corrigindo" globalmente:
date_default_timezone_set('America/Sao_Paulo');
echo "Depois:   " . date('d/m/Y H:i');`}
        output={`Servidor: UTC
date():   21/03/2025 17:30
Depois:   21/03/2025 14:30`}
      />

      <p>
        Existem três lugares onde você pode setar o fuso. Em ordem de prioridade decrescente:
      </p>
      <ol>
        <li><code>date_default_timezone_set()</code> em runtime (vence todos os outros).</li>
        <li><code>date.timezone</code> no <code>php.ini</code>.</li>
        <li>Variável de ambiente <code>TZ</code> do sistema operacional.</li>
      </ol>

      <CodeBlock
        language="ini"
        title="/etc/php/8.4/php.ini"
        code={`date.timezone = America/Sao_Paulo`}
      />

      <CodeBlock
        language="dockerfile"
        title="Dockerfile (alternativa)"
        code={`FROM php:8.4-fpm-alpine
ENV TZ=America/Sao_Paulo
RUN apk add --no-cache tzdata \\
 && cp /usr/share/zoneinfo/America/Sao_Paulo /etc/localtime \\
 && echo "America/Sao_Paulo" > /etc/timezone`}
      />

      <h2>DateTimeZone: trabalhando com vários fusos ao mesmo tempo</h2>
      <p>
        Mexer no fuso global é perigoso quando sua aplicação atende usuários em regiões diferentes. A
        solução é não tocar no global e usar <code>DateTimeZone</code> por instância:
      </p>

      <PhpBlock
        filename="zonas.php"
        code={`<?php
declare(strict_types=1);

date_default_timezone_set('America/Sao_Paulo');

$brasil = new DateTimeZone('America/Sao_Paulo');
$tokyo  = new DateTimeZone('Asia/Tokyo');
$ny     = new DateTimeZone('America/New_York');
$utc    = new DateTimeZone('UTC');

$reuniao = new DateTimeImmutable('2025-03-21 10:00', $brasil);

echo "BR:   " . $reuniao->format('d/m/Y H:i P') . PHP_EOL;
echo "JP:   " . $reuniao->setTimezone($tokyo)->format('d/m/Y H:i P') . PHP_EOL;
echo "NYC:  " . $reuniao->setTimezone($ny)->format('d/m/Y H:i P') . PHP_EOL;
echo "UTC:  " . $reuniao->setTimezone($utc)->format('d/m/Y H:i P');`}
        output={`BR:   21/03/2025 10:00 -03:00
JP:   21/03/2025 22:00 +09:00
NYC:  21/03/2025 09:00 -04:00
UTC:  21/03/2025 13:00 +00:00`}
      />

      <p>
        Reparou? <code>setTimezone()</code> não muda o &quot;instante&quot; representado — só muda como
        ele é exibido. O timestamp Unix continua o mesmo. Por isso a regra:
      </p>

      <AlertBox type="success" title="Padrão de ouro para apps multi-fuso">
        <ol className="list-decimal ml-5 mt-1 space-y-1">
          <li>Armazene tudo em <strong>UTC</strong> no banco.</li>
          <li>Receba do usuário com o fuso dele (ou converta no front).</li>
          <li>Converta para o fuso do usuário só na hora de mostrar.</li>
        </ol>
      </AlertBox>

      <h2>Conversão entre fusos na prática</h2>
      <p>
        Vamos modelar uma agenda de reuniões internacionais. O servidor armazena UTC; cada participante
        vê no fuso dele:
      </p>

      <PhpBlock
        filename="agenda.php"
        code={`<?php
declare(strict_types=1);

final readonly class Reuniao {
    public function __construct(
        public string $titulo,
        public DateTimeImmutable $quandoUtc,
    ) {}

    public function paraFuso(string $tz): string {
        $local = $this->quandoUtc->setTimezone(new DateTimeZone($tz));
        return $local->format('D d/m/Y H:i (T)');
    }
}

$kickoff = new Reuniao(
    'Kickoff Q2',
    new DateTimeImmutable('2025-04-01 13:00', new DateTimeZone('UTC')),
);

foreach (['America/Sao_Paulo', 'Europe/Lisbon', 'Asia/Tokyo'] as $tz) {
    printf("%-22s %s\n", $tz, $kickoff->paraFuso($tz));
}`}
        output={`America/Sao_Paulo      Tue 01/04/2025 10:00 (-03)
Europe/Lisbon          Tue 01/04/2025 14:00 (WEST)
Asia/Tokyo             Tue 01/04/2025 22:00 (JST)`}
      />

      <h2>Horário de verão (DST): a maior pegadinha</h2>
      <p>
        O Brasil aboliu o horário de verão em 2019, mas grande parte do mundo (EUA, Europa, Austrália)
        ainda usa. Nesses países, dois dias por ano têm <strong>23 ou 25 horas</strong>. Se você somar
        86400 segundos para &quot;ir para amanhã&quot;, vai errar uma hora.
      </p>

      <PhpBlock
        filename="dst.php"
        code={`<?php
declare(strict_types=1);

// 9 de março de 2025: DST começa nos EUA às 02:00 (vira 03:00)
$ny = new DateTimeZone('America/New_York');
$antes = new DateTimeImmutable('2025-03-09 01:30', $ny);

// Errado: somar 86400 segundos
$amanhaSeg = $antes->add(new DateInterval('PT86400S'));

// Certo: somar "1 dia" deixa o relógio na mesma hora local
$amanhaDia = $antes->add(new DateInterval('P1D'));

echo "Antes:        " . $antes->format('d/m H:i T') . PHP_EOL;
echo "+86400s:      " . $amanhaSeg->format('d/m H:i T') . PHP_EOL;
echo "+P1D (certo): " . $amanhaDia->format('d/m H:i T');`}
        output={`Antes:        09/03 01:30 EST
+86400s:      10/03 02:30 EDT
+P1D (certo): 10/03 01:30 EDT`}
      />

      <AlertBox type="warning" title="Quando usar segundos vs dias?">
        <strong>Segundos</strong> (<code>PT86400S</code>) = duração física fixa, ignora calendário.
        Útil para cache TTL, métricas. <strong>Dias</strong> (<code>P1D</code>) = &quot;mesmo horário
        amanhã&quot;, respeita DST. Útil para agendas, lembretes, vencimentos.
      </AlertBox>

      <h2>IntlDateFormatter: datas em pt-BR de verdade</h2>
      <p>
        A função <code>date()</code> não sabe português — sempre devolve dias e meses em inglês. Para
        nomes localizados, use a extensão <code>intl</code> (geralmente já vem instalada com PHP).
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command="php -m | grep -i intl"
        output={`intl`}
      />

      <PhpBlock
        filename="intl-data.php"
        code={`<?php
declare(strict_types=1);

$data = new DateTimeImmutable('2025-03-21 14:30', new DateTimeZone('America/Sao_Paulo'));

// Estilos pré-definidos
$completo = new IntlDateFormatter(
    'pt_BR',
    IntlDateFormatter::FULL,
    IntlDateFormatter::SHORT,
    'America/Sao_Paulo',
);
echo $completo->format($data) . PHP_EOL;

// Padrão customizado (sintaxe ICU, não a do PHP!)
$mesPorExtenso = new IntlDateFormatter(
    'pt_BR',
    IntlDateFormatter::NONE,
    IntlDateFormatter::NONE,
    'America/Sao_Paulo',
    null,
    "EEEE, dd 'de' MMMM 'de' yyyy"
);
echo $mesPorExtenso->format($data) . PHP_EOL;

// Mês curto
$curto = new IntlDateFormatter(
    'pt_BR', IntlDateFormatter::NONE, IntlDateFormatter::NONE,
    'America/Sao_Paulo', null, "dd 'de' MMM"
);
echo $curto->format($data);`}
        output={`sexta-feira, 21 de março de 2025 14:30
sexta-feira, 21 de março de 2025
21 de mar.`}
      />

      <AlertBox type="info" title="Padrão ICU vs padrão PHP">
        <code>IntlDateFormatter</code> usa o padrão internacional ICU, que é DIFERENTE do{" "}
        <code>date()</code>. Os principais: <code>yyyy</code> (ano), <code>MM</code> (mês),{" "}
        <code>dd</code> (dia), <code>HH</code> (hora 24h), <code>mm</code> (minuto),{" "}
        <code>EEEE</code> (dia da semana), <code>MMMM</code> (mês por extenso). Texto literal vai entre
        aspas simples.
      </AlertBox>

      <h2>NumberFormatter: moeda em real</h2>
      <p>
        Mesma família, agora para números. Formate <code>1234.5</code> como <code>R$ 1.234,50</code> sem
        gambiarra:
      </p>

      <PhpBlock
        filename="moeda.php"
        code={`<?php
declare(strict_types=1);

$brl = new NumberFormatter('pt_BR', NumberFormatter::CURRENCY);
$dec = new NumberFormatter('pt_BR', NumberFormatter::DECIMAL);
$pct = new NumberFormatter('pt_BR', NumberFormatter::PERCENT);
$ord = new NumberFormatter('pt_BR', NumberFormatter::SPELLOUT);

echo $brl->formatCurrency(1234.5, 'BRL') . PHP_EOL;
echo $brl->formatCurrency(99.9, 'USD') . PHP_EOL;
echo $dec->format(1234567.89) . PHP_EOL;
echo $pct->format(0.075) . PHP_EOL;
echo $ord->format(2025);`}
        output={`R$ 1.234,50
US$ 99,90
1.234.567,89
8%
dois mil e vinte e cinco`}
      />

      <p>
        O <code>NumberFormatter::PERCENT</code> arredonda para inteiro por padrão. Para 7,5% use:
      </p>

      <PhpBlock
        filename="percent.php"
        code={`<?php
declare(strict_types=1);

$pct = new NumberFormatter('pt_BR', NumberFormatter::PERCENT);
$pct->setAttribute(NumberFormatter::MIN_FRACTION_DIGITS, 1);
$pct->setAttribute(NumberFormatter::MAX_FRACTION_DIGITS, 2);

echo $pct->format(0.075) . PHP_EOL;
echo $pct->format(0.1234);`}
        output={`7,5%
12,34%`}
      />

      <h2>Tudo junto: invoice em pt-BR</h2>

      <PhpBlock
        filename="recibo.php"
        code={`<?php
declare(strict_types=1);

date_default_timezone_set('America/Sao_Paulo');

final readonly class Recibo {
    public function __construct(
        public string $cliente,
        public float $valor,
        public DateTimeImmutable $emitidoEm,
    ) {}

    public function html(): string {
        $fmtData = new IntlDateFormatter(
            'pt_BR', IntlDateFormatter::NONE, IntlDateFormatter::NONE,
            'America/Sao_Paulo', null,
            "dd 'de' MMMM 'de' yyyy 'às' HH:mm"
        );
        $fmtMoeda = new NumberFormatter('pt_BR', NumberFormatter::CURRENCY);

        return sprintf(
            "<article><h1>Recibo</h1><p>Cliente: <strong>%s</strong></p>"
            . "<p>Valor: %s</p><p>Emitido em %s</p></article>",
            htmlspecialchars($this->cliente),
            $fmtMoeda->formatCurrency($this->valor, 'BRL'),
            $fmtData->format($this->emitidoEm),
        );
    }
}

$r = new Recibo(
    cliente: 'Acme Ltda.',
    valor: 1234.5,
    emitidoEm: new DateTimeImmutable('2025-03-21 14:30'),
);

echo $r->html();`}
        output={`<article><h1>Recibo</h1><p>Cliente: <strong>Acme Ltda.</strong></p><p>Valor: R$ 1.234,50</p><p>Emitido em 21 de março de 2025 às 14:30</p></article>`}
      />

      <h2>Listando fusos disponíveis</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command="php -r 'foreach (DateTimeZone::listIdentifiers(DateTimeZone::AMERICA) as $tz) echo $tz . PHP_EOL;' | head -8"
        output={`America/Adak
America/Anchorage
America/Araguaina
America/Argentina/Buenos_Aires
America/Bahia
America/Belem
America/Boa_Vista
America/Bogota`}
      />

      <AlertBox type="danger" title="Nunca use abreviações como BRT, EST, PST">
        Elas são ambíguas (BRT pode ser Brasil ou Bangladesh dependendo do contexto) e não respeitam
        DST. Use sempre o formato <code>Continente/Cidade</code> da base IANA — ela é a fonte de
        verdade para fusos no mundo.
      </AlertBox>

      <p>
        Pronto: você sabe agora gravar em UTC, exibir em qualquer fuso, formatar em pt-BR e até lidar
        com horário de verão estrangeiro. No próximo capítulo deixamos o tempo de lado e mergulhamos em{" "}
        <strong>regex</strong> com a família <code>preg_*</code>.
      </p>
    </PageContainer>
  );
}
