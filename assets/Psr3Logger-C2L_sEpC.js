import{j as e}from"./index-Bb4MiiJL.js";import{P as s,a as o,A as r}from"./AlertBox-BpD-xIsb.js";import{T as a}from"./TerminalBlock-DGurMC1r.js";import{C as n}from"./CodeBlock-C3V-qEkN.js";function t(){return e.jsxs(s,{title:"PSR-3 Logger (Monolog)",subtitle:"Pare de usar var_dump em produção. PSR-3 padroniza como bibliotecas PHP escrevem logs, e o Monolog é a implementação que todo mundo usa há mais de uma década.",difficulty:"intermediario",timeToRead:"13 min",category:"PSR Standards",children:[e.jsx("h2",{children:"O problema: cada lib quer seu próprio jeito de logar"}),e.jsxs("p",{children:["Sem padrão, sua aplicação termina com Symfony usando um objeto, Laravel outro, sua"," ",e.jsx("code",{children:"App\\Logger"})," outro, e a SDK da AWS um quarto. A ",e.jsx("strong",{children:"PSR-3"})," resolveu isso definindo uma única interface: ",e.jsx("code",{children:"Psr\\Log\\LoggerInterface"}),". Toda biblioteca séria aceita ela. Você passa o seu logger uma vez, ele flui pelo sistema inteiro."]}),e.jsx("h2",{children:"A interface PSR-3"}),e.jsxs("p",{children:["Toda implementação precisa expor 8 níveis (vindos do RFC 5424 do syslog) mais um método genérico ",e.jsx("code",{children:"log()"}),":"]}),e.jsx(o,{filename:"vendor/psr/log/src/LoggerInterface.php",code:`<?php
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
}`}),e.jsxs("p",{children:["Os níveis vão do mais grave (",e.jsx("code",{children:"emergency"})," — sistema inutilizável) ao mais verboso (",e.jsx("code",{children:"debug"})," — detalhes só úteis em desenvolvimento). Decorar essa escala é meio caminho pra ter logs úteis:"]}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"emergency"})," — o sistema parou. Acordar todo mundo agora."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"alert"})," — ação imediata necessária (banco caiu)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"critical"})," — falha crítica de componente."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"error"})," — erro que precisa ser corrigido, mas não pra agora."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"warning"})," — algo estranho, ainda não é erro."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"notice"})," — evento normal porém digno de nota."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"info"})," — eventos esperados (login, pedido criado)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"debug"})," — detalhe técnico para diagnóstico."]})]}),e.jsx("h2",{children:"Instalando Monolog"}),e.jsx(a,{user:"dev",host:"php",cwd:"~/projetos/loja",command:"composer require monolog/monolog",output:`Using version ^3.7 for monolog/monolog
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
Generating autoload files`}),e.jsx("h2",{children:"Primeiro logger: arquivo + console"}),e.jsx(o,{filename:"src/log_basico.php",code:`<?php
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
$log->error('Falha ao cobrar cartão', ['gateway' => 'stripe', 'codigo' => 'card_declined']);`,output:`[2025-02-14T10:34:21+00:00] loja.INFO: Pedido criado {"pedido_id":1042,"cliente":"ada@hacker.io"} []
[2025-02-14T10:34:21+00:00] loja.WARNING: Estoque baixo {"sku":"CAFE-500G","restante":3} []
[2025-02-14T10:34:21+00:00] loja.ERROR: Falha ao cobrar cartão {"gateway":"stripe","codigo":"card_declined"} []`}),e.jsx("p",{children:"Repare em três coisas que o Monolog (e a PSR-3) fazem por você:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:["O nome ",e.jsx("code",{children:"'loja'"})," é o ",e.jsx("strong",{children:"canal"})," — útil para ter loggers diferentes (db, http, cron) no mesmo log."]}),e.jsxs("li",{children:["O segundo argumento de cada método é o ",e.jsx("strong",{children:"contexto"}),": array associativo com dados estruturados."]}),e.jsxs("li",{children:["O ",e.jsx("code",{children:"StreamHandler"})," com nível ",e.jsx("code",{children:"Info"})," ignora ",e.jsx("code",{children:"debug"}),"; o do arquivo aceita tudo."]})]}),e.jsxs(r,{type:"info",title:"Handlers empilham (LIFO)",children:["Cada handler decide se a mensagem para nele (",e.jsx("code",{children:"setBubble(false)"}),") ou continua para os próximos. Por padrão, a mensagem passa por todos. Útil pra ter ",e.jsx("em",{children:"arquivo completo"})," + ",e.jsx("em",{children:"console resumido"})," + ",e.jsx("em",{children:"email só pros críticos"}),"."]}),e.jsx("h2",{children:"Interpolação de mensagem (PSR-3 nativo)"}),e.jsxs("p",{children:["A PSR-3 define um formato de placeholder com chaves: ",e.jsx("code",{children:"{nome}"}),". Os valores vêm do contexto. Não confunda com interpolação do PHP — é a biblioteca quem substitui:"]}),e.jsx(o,{filename:"src/interpolacao.php",code:`<?php
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
]);`,output:'[2025-02-14T10:36:02+00:00] checkout.INFO: Cliente Ada Lovelace (#42) gastou R$ 199.9 {"nome":"Ada Lovelace","id":42,"total":199.9} []'}),e.jsx("h2",{children:"RotatingFileHandler — sem encher o disco"}),e.jsxs("p",{children:["Em produção, um único arquivo de log cresce até estourar o disco. Use o"," ",e.jsx("code",{children:"RotatingFileHandler"}),": ele cria um arquivo por dia e mantém apenas N dias:"]}),e.jsx(o,{filename:"src/log_rotacao.php",code:`<?php
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

$log->info('Aplicação iniciou', ['env' => 'prod', 'pid' => getmypid()]);`,output:`# arquivos gerados em var/log/:
# app-2025-02-14.log
# app-2025-02-13.log
# app-2025-02-12.log
# ...`}),e.jsx("h2",{children:"Mandando para o syslog do Linux"}),e.jsxs("p",{children:["Em servidores Linux modernos, o lugar canônico de log é o ",e.jsx("code",{children:"journald"}),"/syslog. O Monolog escreve direto via ",e.jsx("code",{children:"SyslogHandler"}),", e aí ",e.jsx("code",{children:"journalctl"})," lê:"]}),e.jsx(o,{filename:"src/log_syslog.php",code:`<?php
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
]);`}),e.jsx(a,{user:"dev",host:"php",cwd:"~/projetos/loja",command:"journalctl -t loja-api -n 5 -o short",output:`Feb 14 10:42:11 srv01 loja-api[12834]: loja-api.ERROR: Cobrança falhou {"gateway":"stripe","pedido":1042} []
Feb 14 10:43:55 srv01 loja-api[12834]: loja-api.INFO: Login bem-sucedido {"user_id":7} []`}),e.jsx("h2",{children:"Processadores: enriquecendo todo log"}),e.jsxs("p",{children:["Em vez de adicionar ",e.jsx("code",{children:"'request_id' => $id"})," em cada chamada, registre um"," ",e.jsx("strong",{children:"processor"}),". Ele roda em toda mensagem e injeta dados no contexto:"]}),e.jsx(o,{filename:"src/log_processors.php",code:`<?php
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

$log->info('Pedido criado', ['id' => 1042]);`,output:'[2025-02-14T10:51:00+00:00] api.INFO: Pedido criado {"id":1042} {"uid":"a3f81c92","url":"/checkout","ip":"203.0.113.4","http_method":"POST","memory_usage":"8 MB","file":"/srv/loja/src/Controller.php","line":47,"user_id":7}'}),e.jsx(r,{type:"success",title:"Esses 5 processors mudam tudo",children:"Com eles habilitados, qualquer log vira evidência forense: você sabe quem, de onde, em qual rota, em qual arquivo:linha, e com qual ID de request, tudo sem nenhum esforço no código de aplicação."}),e.jsx("h2",{children:"Formatters: JSON pra ELK / Loki / Grafana"}),e.jsxs("p",{children:["Texto cru é ótimo pra ler com ",e.jsx("code",{children:"tail -f"}),". Mas plataformas de log (Elasticsearch, Loki, CloudWatch, Datadog) querem ",e.jsx("strong",{children:"JSON"}),". Troque o formatter:"]}),e.jsx(o,{filename:"src/log_json.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Monolog\\Logger;
use Monolog\\Handler\\StreamHandler;
use Monolog\\Formatter\\JsonFormatter;

$handler = new StreamHandler('php://stdout');
$handler->setFormatter(new JsonFormatter());

$log = new Logger('api');
$log->pushHandler($handler);

$log->info('Login OK', ['user_id' => 42, 'ip' => '203.0.113.4']);`,output:'{"message":"Login OK","context":{"user_id":42,"ip":"203.0.113.4"},"level":200,"level_name":"INFO","channel":"api","datetime":"2025-02-14T10:55:32+00:00","extra":{}}'}),e.jsx("p",{children:"Cada linha vira um documento JSON, ideal para o Filebeat enviar pro Elasticsearch sem parsing."}),e.jsx("h2",{children:"Recebendo logger por dependency injection"}),e.jsxs("p",{children:["A grande sacada da PSR-3: suas classes nunca dependem do Monolog diretamente. Elas pedem o"," ",e.jsx("code",{children:"LoggerInterface"})," e seguem felizes:"]}),e.jsx(o,{filename:"src/PaymentService.php",code:`<?php
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
$svc->cobrar(1042, 19990);`,output:`[2025-02-14T11:02:01+00:00] pagto.INFO: Iniciando cobrança {"pedido_id":1042,"valor":19990} []
[2025-02-14T11:02:01+00:00] pagto.NOTICE: Cobrança aprovada {"pedido_id":1042} []`}),e.jsxs(r,{type:"info",title:"NullLogger é seu amigo",children:["Use ",e.jsx("code",{children:"NullLogger"})," como default no construtor. Sua classe roda em testes sem logger, em scripts CLI sem config, e em produção com Monolog completo — todos os três cenários sem mudar uma linha do código de domínio."]}),e.jsx("h2",{children:"Boas práticas de mensagem"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Mensagem fixa, dados no contexto."})," Nunca ",e.jsx("code",{children:'"Pedido $id falhou"'}),"; sempre ",e.jsx("code",{children:'"Pedido falhou"'})," + ",e.jsx("code",{children:"['id' => $id]"}),". Isso permite agrupar por mensagem em ferramentas como Sentry."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Inclua exceções inteiras no contexto"})," com a chave ",e.jsx("code",{children:"'exception'"})," — Monolog detecta e loga stack trace."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Evite logar dados sensíveis"}),": senhas, tokens, números de cartão. Use processors pra mascarar antes de chegar no handler."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Em CLI"}),", prefira nível ",e.jsx("code",{children:"Debug"})," com ",e.jsx("code",{children:"StreamHandler"})," em ",e.jsx("code",{children:"stderr"}),"; em web, ",e.jsx("code",{children:"Info"}),"."]})]}),e.jsx("h2",{children:"Configurando via array (entra fácil em DI)"}),e.jsx("p",{children:"Em projetos grandes, descreva os handlers num arquivo de config e instancie via container:"}),e.jsx(n,{language:"json",title:"config/logger.json",code:`{
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
}`}),e.jsx("p",{children:"Pronto: você tem logging padronizado, plugável, com retenção de disco resolvida, integrado ao journald e pronto pra subir pro stack de observabilidade. PSR-3 é a base do PHP moderno — toda lib séria já entrega o suporte."})]})}export{t as default};
