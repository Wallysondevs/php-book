import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { BrowserBlock } from "@/components/ui/BrowserBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function PorQuePhp() {
  return (
    <PageContainer
      title="Por que aprender PHP em 2026"
      subtitle="A linguagem que silenciosamente roda 75% da web pública. Performance moderna com JIT, ergonomia 8.x, ecossistema Composer e um mercado de trabalho que não para de pedir gente."
      difficulty="iniciante"
      timeToRead="8 min"
      category="Introdução"
    >
      <h2>O argumento que ninguém quer ouvir, mas é verdade</h2>
      <p>
        Toda vez que alguém pergunta “PHP ainda vale a pena?”, a resposta honesta é mostrar dois números:
      </p>
      <ul>
        <li><strong>~75%</strong> de todos os sites com servidor identificável rodam PHP (W3Techs, 2024).</li>
        <li><strong>~43%</strong> da web pública roda WordPress — e WordPress é PHP.</li>
      </ul>
      <p>
        Wikipedia, Mailchimp, Slack (parte do backend), Etsy, Tumblr, Vimeo, Wikimedia. Cada uma dessas
        respondeu uma requisição PHP enquanto você lia este parágrafo.
      </p>

      <h2>Veja o que dá pra fazer com pouco código moderno</h2>
      <p>
        Antes de qualquer “história triste” do PHP que você já ouviu, olhe um mini-API funcional em
        PHP 8.4 — usando só o que vem na linguagem:
      </p>

      <PhpBlock
        filename="api.php"
        code={`<?php
declare(strict_types=1);

enum Status: string {
    case Ativo   = 'ativo';
    case Inativo = 'inativo';
}

final readonly class Usuario {
    public function __construct(
        public int $id,
        public string $nome,
        public Status $status,
    ) {}
}

$usuarios = [
    new Usuario(1, "Ada Lovelace", Status::Ativo),
    new Usuario(2, "Linus Torvalds", Status::Ativo),
    new Usuario(3, "Grace Hopper", Status::Inativo),
];

header('Content-Type: application/json');
echo json_encode(
    array_filter($usuarios, fn(Usuario $u) => $u->status === Status::Ativo),
    JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
);`}
      />

      <BrowserBlock url="http://localhost:8000/api.php">
        <pre className="text-xs">{`[
    {"id":1,"nome":"Ada Lovelace","status":"ativo"},
    {"id":2,"nome":"Linus Torvalds","status":"ativo"}
]`}</pre>
      </BrowserBlock>

      <p>
        Enums tipados, classes <code>readonly</code>, constructor promotion, arrow functions,
        type hints estritos. Isso é PHP <em>moderno</em> — nada do <code>mysql_query()</code> que
        você viu em tutorial de 2008.
      </p>

      <h2>Performance: JIT mudou o jogo</h2>
      <p>
        PHP 7 já era 2x mais rápido que PHP 5. PHP 8 trouxe o <strong>JIT</strong> (Just-In-Time compilation),
        que turbina código numérico/CPU-bound em até 3x. Em web típico (banco + I/O), o ganho é menor
        mas o consumo de memória continua caindo a cada release.
      </p>

      <PhpBlock
        filename="bench.php"
        code={`<?php
declare(strict_types=1);

function fib(int $n): int {
    return $n < 2 ? $n : fib($n - 1) + fib($n - 2);
}

$inicio = microtime(true);
$resultado = fib(30);
$fim = microtime(true);

printf("fib(30) = %d em %.3fs%s", $resultado, $fim - $inicio, PHP_EOL);`}
        output={`fib(30) = 832040 em 0.094s`}
      />

      <AlertBox type="info" title="Comparação justa">
        O mesmo Fibonacci recursivo em PHP 5.6 levaria ~0.6s. PHP 8.4 com JIT habilitado: ~0.09s.
        Não vai vencer Rust, mas <strong>vence Python e fica no nível do Node</strong> em workloads
        web reais.
      </AlertBox>

      <h2>Ecossistema: Composer mudou tudo</h2>
      <p>
        Antes do <strong>Composer</strong> (2012), instalar uma biblioteca PHP era baixar um <code>.zip</code>,
        extrair em <code>vendor/</code> e rezar. Hoje:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projeto"
        command="composer require monolog/monolog guzzlehttp/guzzle ramsey/uuid"
        output={`Using version ^3.7 for monolog/monolog
Using version ^7.9 for guzzlehttp/guzzle
Using version ^4.7 for ramsey/uuid
./composer.json has been updated
Running composer update monolog/monolog guzzlehttp/guzzle ramsey/uuid
Generating optimized autoload files
3 packages you are using are looking for funding.`}
      />

      <p>
        E em três linhas você tem logging estruturado, cliente HTTP profissional e geração de UUID v7:
      </p>

      <PhpBlock
        filename="exemplo.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use Monolog\\Logger;
use Monolog\\Handler\\StreamHandler;
use GuzzleHttp\\Client;
use Ramsey\\Uuid\\Uuid;

$log = new Logger('app');
$log->pushHandler(new StreamHandler('php://stdout', Logger::INFO));

$id = Uuid::uuid7()->toString();
$log->info('Iniciando requisição', ['request_id' => $id]);

$http = new Client(['timeout' => 5.0]);
$resp = $http->get('https://httpbin.org/uuid');
$log->info('Resposta', ['status' => $resp->getStatusCode()]);`}
        output={`[2026-01-15T10:00:01+00:00] app.INFO: Iniciando requisição {"request_id":"019421a8-..."}
[2026-01-15T10:00:02+00:00] app.INFO: Resposta {"status":200}`}
      />

      <h2>Ergonomia 8.x: o PHP virou prazeroso</h2>
      <p>
        Pegue um padrão que em qualquer linguagem dá trabalho — uma “entidade” imutável com validação:
      </p>

      <PhpBlock
        filename="ddd.php"
        code={`<?php
declare(strict_types=1);

final readonly class Email {
    public function __construct(public string $valor) {
        if (!filter_var($valor, FILTER_VALIDATE_EMAIL)) {
            throw new \\InvalidArgumentException("Email inválido: $valor");
        }
    }
}

final readonly class Cliente {
    public function __construct(
        public string $nome,
        public Email $email,
    ) {}
}

$cliente = new Cliente(
    nome: "Ada",
    email: new Email("ada@lovelace.dev"),
);

echo "{$cliente->nome} <{$cliente->email->valor}>";`}
        output={`Ada <ada@lovelace.dev>`}
      />

      <AlertBox type="success" title="O que essa pequena classe te dá">
        Imutabilidade (readonly), validação no construtor, type hints, named arguments, sem precisar
        de Lombok, decoradores ou geradores de código. Tudo nativo, sem dependência externa.
      </AlertBox>

      <h2>Mercado de trabalho: a oferta gigantesca</h2>
      <p>
        Existe uma piada: “ninguém quer trabalhar com PHP, mas todo mundo precisa contratar gente
        de PHP”. Em 2026 a realidade é:
      </p>
      <ul>
        <li>
          <strong>WordPress</strong> sozinho é uma indústria. Plugin, tema, manutenção, hospedagem,
          consultoria — tudo PHP.
        </li>
        <li>
          <strong>Laravel</strong> é o framework mais usado para SaaS e dashboards no mundo (sim, na
          frente do Rails). Vagas remotas pagando bem, internacionalmente.
        </li>
        <li>
          <strong>Magento, Drupal, Symfony</strong> rodam e-commerces e governos inteiros. Manutenção
          paga muito bem.
        </li>
        <li>
          <strong>Sistemas legados</strong>. Cada banco, cada governo, cada hospital tem um sistema
          PHP rodando em produção há 10+ anos. Quem entende disso tem trabalho garantido.
        </li>
      </ul>

      <h2>Por que NÃO escolher PHP?</h2>
      <p>Sendo honesto: PHP não é a melhor escolha quando você precisa de…</p>
      <ul>
        <li>Aplicações <em>realtime</em> com WebSocket de longa duração (Node ou Elixir resolvem melhor).</li>
        <li>Mobile nativo (óbvio — use Swift, Kotlin ou Flutter).</li>
        <li>Computação numérica/ML pesada (Python, R, Julia).</li>
        <li>Processamento concorrente massivo (Go, Rust, Erlang).</li>
      </ul>
      <p>
        Para o resto — APIs REST/GraphQL, dashboards admin, sites institucionais, e-commerces, SaaS,
        integrações, scripts de automação — PHP entrega rápido e bem.
      </p>

      <h2>O resumo honesto</h2>
      <p>
        Aprenda PHP em 2026 se você quer:
      </p>
      <ol>
        <li><strong>Empregabilidade real.</strong> Tem vaga em qualquer cidade.</li>
        <li><strong>Construir produtos rápido.</strong> Laravel + PostgreSQL te coloca em produção numa tarde.</li>
        <li><strong>Trabalhar em projetos com impacto.</strong> Você só precisa abrir Wikipedia para ver.</li>
        <li><strong>Hospedagem barata.</strong> R$ 10/mês ainda hospeda site PHP, e bem.</li>
      </ol>

      <p>
        Próximo capítulo: <strong>versões e roadmap</strong> — qual PHP escolher, o que está fora de suporte,
        e como gerenciar várias versões na mesma máquina.
      </p>
    </PageContainer>
  );
}
