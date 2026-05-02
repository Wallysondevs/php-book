import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Psr3Logger() {
  return (
    <PageContainer
      title="PSR-3 Logger (Monolog)"
      subtitle="Pare de usar var_dump em produção. PSR-3 padroniza como bibliotecas PHP escrevem logs, e o Monolog é a implementação que todo mundo usa há mais de uma década."
      difficulty="intermediario"
      timeToRead="13 min"
      category="PSR Standards"
    >
      <h2>O problema: cada lib quer seu próprio jeito de logar</h2>
      <p>
        Sem padrão, sua aplicação termina com Symfony usando um objeto, Laravel outro, sua{" "}
        <code>App\Logger</code> outro, e a SDK da AWS um quarto. A <strong>PSR-3</strong> resolveu
        isso definindo uma única interface: <code>Psr\Log\LoggerInterface</code>. Toda biblioteca
        séria aceita ela. Você passa o seu logger uma vez, ele flui pelo sistema inteiro.
      </p>

      <h2>A interface PSR-3</h2>
      <p>
        Toda implementação precisa expor 8 níveis (vindos do RFC 5424 do syslog) mais um método
        genérico <code>log()</code>:
      </p>

      <PhpBlock
        filename="vendor/psr/log/src/LoggerInterface.php"
        code={`<?php
declare(strict_types=1);

namespace Psr\\Log;

interface LoggerInterface
{
    public function emergency(string|\\Stringable $message, array $context = []): void;
    public function alert(string|\\Stringable $message, array $context = []): void;
    public function critical(string|\\Stringable $message, array $context = []): void;
    public function error(string|\\Stringable $message, array $context = []): void;
    public function warning(string|\\Stringable $message, array $context = []): void;
    public function notice(string|\\Stringable $message, array $context = []): void;
    public function info(string|\\Stringable $message, array $context = []): void;
    public function debug(string|\\Stringable $message, array $context = []): void;

    public function log($level, string|\\Stringable $message, array $context = []): void;
}`}
      />

      <p>
        Os níveis vão do mais grave (<code>emergency</code> — sistema inutilizável) ao mais
        verboso (<code>debug</code> — detalhes só úteis em desenvolvimento). Decorar essa escala é
        meio caminho pra ter logs úteis:
      </p>
      <ul>
        <li><strong>emergency</strong> — o sistema parou. Acordar todo mundo agora.</li>
        <li><strong>alert</strong> — ação imediata necessária (banco caiu).</li>
        <li><strong>critical</strong> — falha crítica de componente.</li>
        <li><strong>error</strong> — erro que precisa ser corrigido, mas não pra agora.</li>
        <li><strong>warning</strong> — algo estranho, ainda não é erro.</li>
        <li><strong>notice</strong> — evento normal porém digno de nota.</li>
        <li><strong>info</strong> — eventos esperados (login, pedido criado).</li>
        <li><strong>debug</strong> — detalhe técnico para diagnóstico.</li>
      </ul>

      <h2>Instalando Monolog</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command="composer require monolog/monolog"
        output={`Using version ^3.7 for monolog/monolog
./composer.json has been updated
Running composer update monolog/monolog
Loading composer repositories with package information
Updating dependencies
Lock file operations: 3 installs, 0 updates, 0 removals
  - Locking monolog/monolog (3.7.0)
  - Locking psr/log (3.0.2)
  - Locking psr/log-implementation (1.0.0)
Writing lock file
Installing dependencies from lock file (including require-dev)
Generating autoload files`}
      />

      <h2>Primeiro logger: arquivo + console</h2>

      <PhpBlock
        filename="src/log_basico.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Monolog\\Logger;
use Monolog\\Handler\\StreamHandler;
use Monolog\\Level;

$log = new Logger('loja');
$log->pushHandler(new StreamHandler(__DIR__ . '/../var/log/app.log', Level::Debug));
$log->pushHandler(new StreamHandler('php://stdout', Level::Info));

$log->info('Pedido criado', ['pedido_id' => 1042, 'cliente' => 'ada@hacker.io']);
$log->warning('Estoque baixo', ['sku' => 'CAFE-500G', 'restante' => 3]);
$log->error('Falha ao cobrar cartão', ['gateway' => 'stripe', 'codigo' => 'card_declined']);`}
        output={`[2025-02-14T10:34:21+00:00] loja.INFO: Pedido criado {"pedido_id":1042,"cliente":"ada@hacker.io"} []
[2025-02-14T10:34:21+00:00] loja.WARNING: Estoque baixo {"sku":"CAFE-500G","restante":3} []
[2025-02-14T10:34:21+00:00] loja.ERROR: Falha ao cobrar cartão {"gateway":"stripe","codigo":"card_declined"} []`}
      />

      <p>
        Repare em três coisas que o Monolog (e a PSR-3) fazem por você:
      </p>
      <ul>
        <li>O nome <code>'loja'</code> é o <strong>canal</strong> — útil para ter loggers diferentes (db, http, cron) no mesmo log.</li>
        <li>O segundo argumento de cada método é o <strong>contexto</strong>: array associativo com dados estruturados.</li>
        <li>O <code>StreamHandler</code> com nível <code>Info</code> ignora <code>debug</code>; o do arquivo aceita tudo.</li>
      </ul>

      <AlertBox type="info" title="Handlers empilham (LIFO)">
        Cada handler decide se a mensagem para nele (<code>setBubble(false)</code>) ou continua
        para os próximos. Por padrão, a mensagem passa por todos. Útil pra ter <em>arquivo
        completo</em> + <em>console resumido</em> + <em>email só pros críticos</em>.
      </AlertBox>

      <h2>Interpolação de mensagem (PSR-3 nativo)</h2>
      <p>
        A PSR-3 define um formato de placeholder com chaves: <code>{`{nome}`}</code>. Os valores
        vêm do contexto. Não confunda com interpolação do PHP — é a biblioteca quem substitui:
      </p>

      <PhpBlock
        filename="src/interpolacao.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Monolog\\Logger;
use Monolog\\Handler\\StreamHandler;

$log = new Logger('checkout');
$log->pushHandler(new StreamHandler('php://stdout'));

$log->info('Cliente {nome} (#{id}) gastou R$ {total}', [
    'nome'  => 'Ada Lovelace',
    'id'    => 42,
    'total' => 199.90,
]);`}
        output={`[2025-02-14T10:36:02+00:00] checkout.INFO: Cliente Ada Lovelace (#42) gastou R$ 199.9 {"nome":"Ada Lovelace","id":42,"total":199.9} []`}
      />

      <h2>RotatingFileHandler — sem encher o disco</h2>
      <p>
        Em produção, um único arquivo de log cresce até estourar o disco. Use o{" "}
        <code>RotatingFileHandler</code>: ele cria um arquivo por dia e mantém apenas N dias:
      </p>

      <PhpBlock
        filename="src/log_rotacao.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Monolog\\Logger;
use Monolog\\Handler\\RotatingFileHandler;
use Monolog\\Level;

$log = new Logger('app');

// Mantém 14 dias de logs, arquivos nomeados app-YYYY-MM-DD.log
$log->pushHandler(new RotatingFileHandler(
    filename: __DIR__ . '/../var/log/app.log',
    maxFiles: 14,
    level: Level::Info,
));

$log->info('Aplicação iniciou', ['env' => 'prod', 'pid' => getmypid()]);`}
        output={`# arquivos gerados em var/log/:
# app-2025-02-14.log
# app-2025-02-13.log
# app-2025-02-12.log
# ...`}
      />

      <h2>Mandando para o syslog do Linux</h2>
      <p>
        Em servidores Linux modernos, o lugar canônico de log é o <code>journald</code>/syslog. O
        Monolog escreve direto via <code>SyslogHandler</code>, e aí <code>journalctl</code> lê:
      </p>

      <PhpBlock
        filename="src/log_syslog.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Monolog\\Logger;
use Monolog\\Handler\\SyslogHandler;
use Monolog\\Level;

$log = new Logger('loja-api');
$log->pushHandler(new SyslogHandler('loja-api', LOG_USER, Level::Info));

$log->error('Cobrança falhou', [
    'gateway' => 'stripe',
    'pedido'  => 1042,
]);`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command="journalctl -t loja-api -n 5 -o short"
        output={`Feb 14 10:42:11 srv01 loja-api[12834]: loja-api.ERROR: Cobrança falhou {"gateway":"stripe","pedido":1042} []
Feb 14 10:43:55 srv01 loja-api[12834]: loja-api.INFO: Login bem-sucedido {"user_id":7} []`}
      />

      <h2>Processadores: enriquecendo todo log</h2>
      <p>
        Em vez de adicionar <code>'request_id' =&gt; $id</code> em cada chamada, registre um{" "}
        <strong>processor</strong>. Ele roda em toda mensagem e injeta dados no contexto:
      </p>

      <PhpBlock
        filename="src/log_processors.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Monolog\\Logger;
use Monolog\\Handler\\StreamHandler;
use Monolog\\Processor\\WebProcessor;
use Monolog\\Processor\\IntrospectionProcessor;
use Monolog\\Processor\\MemoryUsageProcessor;
use Monolog\\Processor\\UidProcessor;

$log = new Logger('api');
$log->pushHandler(new StreamHandler('php://stdout'));

$log->pushProcessor(new UidProcessor(8));        // request id curto
$log->pushProcessor(new WebProcessor());          // url, método, ip
$log->pushProcessor(new MemoryUsageProcessor());  // RAM atual
$log->pushProcessor(new IntrospectionProcessor()); // arquivo:linha que chamou

// processor inline para o usuário logado
$log->pushProcessor(function (\\Monolog\\LogRecord $record): \\Monolog\\LogRecord {
    $record->extra['user_id'] = $_SESSION['user_id'] ?? null;
    return $record;
});

$log->info('Pedido criado', ['id' => 1042]);`}
        output={`[2025-02-14T10:51:00+00:00] api.INFO: Pedido criado {"id":1042} {"uid":"a3f81c92","url":"/checkout","ip":"203.0.113.4","http_method":"POST","memory_usage":"8 MB","file":"/srv/loja/src/Controller.php","line":47,"user_id":7}`}
      />

      <AlertBox type="success" title="Esses 5 processors mudam tudo">
        Com eles habilitados, qualquer log vira evidência forense: você sabe quem, de onde, em
        qual rota, em qual arquivo:linha, e com qual ID de request, tudo sem nenhum esforço no
        código de aplicação.
      </AlertBox>

      <h2>Formatters: JSON pra ELK / Loki / Grafana</h2>
      <p>
        Texto cru é ótimo pra ler com <code>tail -f</code>. Mas plataformas de log (Elasticsearch,
        Loki, CloudWatch, Datadog) querem <strong>JSON</strong>. Troque o formatter:
      </p>

      <PhpBlock
        filename="src/log_json.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Monolog\\Logger;
use Monolog\\Handler\\StreamHandler;
use Monolog\\Formatter\\JsonFormatter;

$handler = new StreamHandler('php://stdout');
$handler->setFormatter(new JsonFormatter());

$log = new Logger('api');
$log->pushHandler($handler);

$log->info('Login OK', ['user_id' => 42, 'ip' => '203.0.113.4']);`}
        output={`{"message":"Login OK","context":{"user_id":42,"ip":"203.0.113.4"},"level":200,"level_name":"INFO","channel":"api","datetime":"2025-02-14T10:55:32+00:00","extra":{}}`}
      />

      <p>
        Cada linha vira um documento JSON, ideal para o Filebeat enviar pro Elasticsearch sem
        parsing.
      </p>

      <h2>Recebendo logger por dependency injection</h2>
      <p>
        A grande sacada da PSR-3: suas classes nunca dependem do Monolog diretamente. Elas pedem o{" "}
        <code>LoggerInterface</code> e seguem felizes:
      </p>

      <PhpBlock
        filename="src/PaymentService.php"
        code={`<?php
declare(strict_types=1);

namespace App;

use Psr\\Log\\LoggerInterface;
use Psr\\Log\\NullLogger;

final class PaymentService
{
    public function __construct(
        private readonly LoggerInterface $log = new NullLogger(),
    ) {}

    public function cobrar(int $pedidoId, int $valorCentavos): bool
    {
        $this->log->info('Iniciando cobrança', [
            'pedido_id' => $pedidoId,
            'valor'     => $valorCentavos,
        ]);

        try {
            // ... chamada ao gateway ...
            $this->log->notice('Cobrança aprovada', ['pedido_id' => $pedidoId]);
            return true;
        } catch (\\Throwable $e) {
            $this->log->error('Cobrança falhou', [
                'pedido_id' => $pedidoId,
                'exception' => $e,
            ]);
            return false;
        }
    }
}

// uso:
$svc = new PaymentService(new \\Monolog\\Logger('pagto', [
    new \\Monolog\\Handler\\StreamHandler('php://stdout'),
]));
$svc->cobrar(1042, 19990);`}
        output={`[2025-02-14T11:02:01+00:00] pagto.INFO: Iniciando cobrança {"pedido_id":1042,"valor":19990} []
[2025-02-14T11:02:01+00:00] pagto.NOTICE: Cobrança aprovada {"pedido_id":1042} []`}
      />

      <AlertBox type="info" title="NullLogger é seu amigo">
        Use <code>NullLogger</code> como default no construtor. Sua classe roda em testes sem
        logger, em scripts CLI sem config, e em produção com Monolog completo — todos os três
        cenários sem mudar uma linha do código de domínio.
      </AlertBox>

      <h2>Boas práticas de mensagem</h2>
      <ul>
        <li><strong>Mensagem fixa, dados no contexto.</strong> Nunca <code>"Pedido $id falhou"</code>; sempre <code>"Pedido falhou"</code> + <code>['id' =&gt; $id]</code>. Isso permite agrupar por mensagem em ferramentas como Sentry.</li>
        <li><strong>Inclua exceções inteiras no contexto</strong> com a chave <code>'exception'</code> — Monolog detecta e loga stack trace.</li>
        <li><strong>Evite logar dados sensíveis</strong>: senhas, tokens, números de cartão. Use processors pra mascarar antes de chegar no handler.</li>
        <li><strong>Em CLI</strong>, prefira nível <code>Debug</code> com <code>StreamHandler</code> em <code>stderr</code>; em web, <code>Info</code>.</li>
      </ul>

      <h2>Configurando via array (entra fácil em DI)</h2>
      <p>
        Em projetos grandes, descreva os handlers num arquivo de config e instancie via container:
      </p>

      <CodeBlock
        language="json"
        title="config/logger.json"
        code={`{
    "channel": "api",
    "handlers": [
        {
            "type": "rotating_file",
            "path": "var/log/app.log",
            "level": "info",
            "max_files": 14,
            "formatter": "line"
        },
        {
            "type": "syslog",
            "ident": "loja-api",
            "level": "warning"
        }
    ],
    "processors": ["uid", "web", "memory"]
}`}
      />

      <p>
        Pronto: você tem logging padronizado, plugável, com retenção de disco resolvida, integrado
        ao journald e pronto pra subir pro stack de observabilidade. PSR-3 é a base do PHP
        moderno — toda lib séria já entrega o suporte.
      </p>
    </PageContainer>
  );
}
