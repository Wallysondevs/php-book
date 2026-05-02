import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function CustomExceptions() {
  return (
    <PageContainer
      title="Exceptions personalizadas"
      subtitle="Quando criar a sua própria exception, como organizar uma hierarquia que reflete o domínio e como anexar contexto que torna o debug instantâneo."
      difficulty="avancado"
      timeToRead="10 min"
      category="Erros & Exceções"
    >
      <h2>O problema: RuntimeException para tudo</h2>
      <p>
        É tentador resolver qualquer erro com{" "}
        <code>throw new RuntimeException(&quot;...&quot;)</code>. Mas no <code>catch</code>, você
        não tem como distinguir &quot;saldo insuficiente&quot; de &quot;banco fora do ar&quot; sem
        parsear a mensagem — anti-padrão clássico.
      </p>

      <PhpBlock
        filename="legado.php"
        code={`<?php
declare(strict_types=1);

function transferir(int $valor): void {
    throw new RuntimeException("saldo insuficiente para transferir $valor");
}

try {
    transferir(500);
} catch (RuntimeException $e) {
    // como saber se é erro de saldo, de rede ou de validação?
    if (str_contains($e->getMessage(), "saldo")) {
        echo "trate saldo..." . PHP_EOL;
    } else {
        echo "trate genérico..." . PHP_EOL;
    }
}`}
        output={`trate saldo...`}
      />

      <p>
        A solução é criar exceptions que <strong>são</strong> o erro: uma classe
        para cada conceito do seu domínio. O nome da classe vira documentação, o{" "}
        <code>catch</code> vira preciso e você ganha autocomplete em todo o IDE.
      </p>

      <h2>O básico: estendendo Exception</h2>
      <p>
        Toda exception personalizada estende <code>\\Exception</code> (ou alguma
        descendente). Sem mais nada, ela já é distinguível por tipo:
      </p>

      <PhpBlock
        filename="basico.php"
        code={`<?php
declare(strict_types=1);

class SaldoInsuficiente extends Exception {}
class ContaBloqueada    extends Exception {}

function debitar(string $conta, int $valor, int $saldo, bool $bloqueada): void {
    if ($bloqueada) {
        throw new ContaBloqueada("conta $conta está bloqueada");
    }
    if ($valor > $saldo) {
        throw new SaldoInsuficiente("saldo insuficiente em $conta");
    }
}

foreach ([["A1", 100, 50, false], ["B2", 10, 100, true]] as [$c, $v, $s, $b]) {
    try {
        debitar($c, $v, $s, $b);
    } catch (SaldoInsuficiente $e) {
        echo "[saldo] " . $e->getMessage() . PHP_EOL;
    } catch (ContaBloqueada $e) {
        echo "[bloqueada] " . $e->getMessage() . PHP_EOL;
    }
}`}
        output={`[saldo] saldo insuficiente em A1
[bloqueada] conta B2 está bloqueada`}
      />

      <h2>Hierarquia: aproveitando exceptions da SPL</h2>
      <p>
        A biblioteca padrão do PHP já entrega uma hierarquia base muito útil. Use-a
        como ponto de partida para que seu erro tenha <em>significado semântico</em>:
      </p>
      <ul>
        <li><code>LogicException</code> — bug de programação (precondição violada). Subclasses: <code>InvalidArgumentException</code>, <code>OutOfRangeException</code>, <code>DomainException</code>.</li>
        <li><code>RuntimeException</code> — falha em runtime (rede, IO, recurso indisponível). Subclasses: <code>UnexpectedValueException</code>, <code>OverflowException</code>.</li>
      </ul>

      <AlertBox type="info" title="Por que LogicException vs RuntimeException importa">
        Algumas equipes capturam só <code>RuntimeException</code> em handlers globais
        e deixam <code>LogicException</code> propagar até crash — porque elas
        indicam <em>bug</em> que o teste deveria ter pego. Escolher a base certa
        comunica intenção sem comentário.
      </AlertBox>

      <PhpBlock
        filename="hierarquia.php"
        code={`<?php
declare(strict_types=1);

// Domínio: pagamentos
abstract class PagamentoException extends DomainException {}

class PagamentoRecusado    extends PagamentoException {}
class PagamentoExpirado    extends PagamentoException {}
class GatewayIndisponivel  extends RuntimeException {}

function cobrar(string $cartao, int $centavos): void {
    if (str_starts_with($cartao, "0000")) {
        throw new PagamentoRecusado("cartão recusado pelo emissor");
    }
    if ($centavos > 1_000_000) {
        throw new PagamentoExpirado("limite de transação excedido");
    }
    throw new GatewayIndisponivel("timeout ao chamar gateway");
}

foreach ([["0000-1111", 5000], ["1234-5678", 2_000_000], ["1234-5678", 100]] as [$c, $v]) {
    try {
        cobrar($c, $v);
    } catch (PagamentoException $e) {
        // pega tudo do domínio "pagamento" — mesmo subclasses futuras
        echo "[domínio] " . $e::class . ": " . $e->getMessage() . PHP_EOL;
    } catch (RuntimeException $e) {
        echo "[infra] " . $e->getMessage() . PHP_EOL;
    }
}`}
        output={`[domínio] PagamentoRecusado: cartão recusado pelo emissor
[domínio] PagamentoExpirado: limite de transação excedido
[infra] timeout ao chamar gateway`}
      />

      <p>
        Veja a vantagem: <code>catch (PagamentoException $e)</code> pega{" "}
        <em>qualquer</em> erro de pagamento — recusado, expirado ou um novo tipo
        que você criar amanhã. A camada superior trata o conceito; quem precisa
        distinguir, faz outro <code>catch</code> antes.
      </p>

      <h2>Anexando contexto: propriedades customizadas</h2>
      <p>
        Mensagem em string é boa para humano ler, mas péssima para máquina. Crie
        propriedades tipadas para guardar dados estruturados que o handler
        (logger, monitor) possa serializar.
      </p>

      <PhpBlock
        filename="contexto.php"
        code={`<?php
declare(strict_types=1);

final class ValidacaoFalhou extends DomainException {
    /** @param array<string, string> $erros */
    public function __construct(
        public readonly array $erros,
        public readonly string $entidade,
    ) {
        parent::__construct(
            sprintf("%d campo(s) inválido(s) em %s", count($erros), $entidade)
        );
    }

    public function paraJson(): string {
        return json_encode([
            "tipo"     => "validacao",
            "entidade" => $this->entidade,
            "erros"    => $this->erros,
        ], JSON_UNESCAPED_UNICODE);
    }
}

try {
    throw new ValidacaoFalhou(
        erros: [
            "email" => "formato inválido",
            "idade" => "deve ser maior que 18",
        ],
        entidade: "Cadastro",
    );
} catch (ValidacaoFalhou $e) {
    echo $e->getMessage() . PHP_EOL;
    echo $e->paraJson() . PHP_EOL;
}`}
        output={`2 campo(s) inválido(s) em Cadastro
{"tipo":"validacao","entidade":"Cadastro","erros":{"email":"formato inválido","idade":"deve ser maior que 18"}}`}
      />

      <AlertBox type="success" title="readonly + promotion = exception perfeita">
        Marcar as propriedades como <code>public readonly</code> garante que
        ninguém adultere o contexto depois — útil porque exceptions são
        frequentemente repassadas e logadas em vários pontos.
      </AlertBox>

      <h2>Named constructors: mensagens consistentes</h2>
      <p>
        Em vez de espalhar <code>new MinhaException(&quot;...&quot;)</code> com texto repetido
        em vários arquivos, crie <em>named constructors</em> estáticos. Eles
        garantem mensagem padronizada e reduzem o ruído.
      </p>

      <PhpBlock
        filename="named.php"
        code={`<?php
declare(strict_types=1);

final class UsuarioNaoEncontrado extends RuntimeException {
    public static function porId(int $id): self {
        return new self("Usuário com id=$id não encontrado");
    }

    public static function porEmail(string $email): self {
        return new self("Usuário com email=$email não encontrado");
    }
}

function buscarUsuario(int $id): array {
    throw UsuarioNaoEncontrado::porId($id);
}

try {
    buscarUsuario(42);
} catch (UsuarioNaoEncontrado $e) {
    echo $e->getMessage() . PHP_EOL;
}

try {
    throw UsuarioNaoEncontrado::porEmail("ada@example.com");
} catch (UsuarioNaoEncontrado $e) {
    echo $e->getMessage() . PHP_EOL;
}`}
        output={`Usuário com id=42 não encontrado
Usuário com email=ada@example.com não encontrado`}
      />

      <h2>Exception chaining no domínio</h2>
      <p>
        Quando você converte um erro de infraestrutura em erro de domínio, sempre
        passe a causa original. Em produção, o log mostra a stack inteira; o caller
        só conhece a abstração.
      </p>

      <PhpBlock
        filename="chaining.php"
        code={`<?php
declare(strict_types=1);

class FalhaAoSalvarPedido extends RuntimeException {
    public function __construct(
        public readonly int $pedidoId,
        Throwable $previous,
    ) {
        parent::__construct(
            "não foi possível salvar pedido #$pedidoId",
            previous: $previous,
        );
    }
}

function salvarPedido(int $id): void {
    try {
        // simula falha do PDO
        throw new RuntimeException("SQLSTATE[HY000] connection lost");
    } catch (Throwable $e) {
        throw new FalhaAoSalvarPedido($id, $e);
    }
}

try {
    salvarPedido(789);
} catch (FalhaAoSalvarPedido $e) {
    echo "domínio: " . $e->getMessage() . PHP_EOL;
    echo "  pedido: " . $e->pedidoId . PHP_EOL;
    echo "  causa : " . $e->getPrevious()?->getMessage() . PHP_EOL;
}`}
        output={`domínio: não foi possível salvar pedido #789
  pedido: 789
  causa : SQLSTATE[HY000] connection lost`}
      />

      <h2>Quando criar uma nova exception?</h2>
      <p>
        Nem todo erro merece classe própria. O critério prático:
      </p>
      <ul>
        <li>
          <strong>Sim</strong> — quando alguém vai querer capturar especificamente
          este caso, ou quando o erro carrega contexto estruturado relevante (id,
          campo, regra violada).
        </li>
        <li>
          <strong>Sim</strong> — quando o conceito é central do domínio
          (<code>EstoqueInsuficiente</code>, <code>PrazoVencido</code>): a exception
          é parte da linguagem ubíqua.
        </li>
        <li>
          <strong>Não</strong> — para validações genéricas one-off, um{" "}
          <code>InvalidArgumentException</code> resolve.
        </li>
        <li>
          <strong>Não</strong> — quando você cria 30 classes vazias só para mudar o
          nome. Hierarquia inflada vira ruído.
        </li>
      </ul>

      <AlertBox type="warning" title="Pegadinha: __construct e parent::__construct">
        Se você sobrescreve o construtor da exception com promotion, <strong>não
        esqueça</strong> de chamar <code>parent::__construct(...)</code>. Sem isso,
        <code>$e-&gt;getMessage()</code> volta vazio e <code>$e-&gt;getFile()</code>{" "}
        aponta errado.
      </AlertBox>

      <h2>Organizando no projeto</h2>
      <p>
        A convenção da comunidade PHP é colocar exceptions perto do código que as
        lança, em uma subpasta <code>Exception</code>:
      </p>

      <PhpBlock
        filename="estrutura"
        language="text"
        code={`src/
├── Pagamento/
│   ├── Cobranca.php
│   ├── Gateway.php
│   └── Exception/
│       ├── PagamentoException.php
│       ├── PagamentoRecusado.php
│       └── GatewayIndisponivel.php
└── Usuario/
    ├── Usuario.php
    └── Exception/
        ├── UsuarioNaoEncontrado.php
        └── EmailJaCadastrado.php`}
      />

      <p>
        Cada módulo tem sua própria base abstrata (<code>PagamentoException</code>),
        e quem está fora pode capturar essa base sem se acoplar aos detalhes
        internos.
      </p>

      <h2>Integrando com Monolog</h2>
      <p>
        Bibliotecas como <code>monolog/monolog</code> aceitam exception como
        contexto: ela aparece no log com stack trace e classe, junto dos campos
        extras que você anexar.
      </p>

      <PhpBlock
        filename="logando.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . "/vendor/autoload.php";

use Monolog\\Logger;
use Monolog\\Handler\\StreamHandler;

$log = new Logger("app");
$log->pushHandler(new StreamHandler("php://stderr", Logger::WARNING));

try {
    throw new RuntimeException("deu ruim no checkout");
} catch (Throwable $e) {
    $log->error("falha ao processar pedido", [
        "exception" => $e,
        "pedido_id" => 42,
    ]);
}`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/exc"
        command="composer require monolog/monolog"
        output={`Using version ^3.7 for monolog/monolog
./composer.json has been updated
Running composer update monolog/monolog
Lock file operations: 1 install, 0 updates, 0 removals
Writing lock file
Installing dependencies from lock file
  - Installing monolog/monolog (3.7.0): Extracting`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/exc"
        command="php logando.php"
        output={`[2025-01-20T12:30:45+00:00] app.ERROR: falha ao processar pedido {"pedido_id":42,"exception":"[object] (RuntimeException(code: 0): deu ruim no checkout at /home/dev/projetos/exc/logando.php:14)"} []`}
      />

      <h2>Resumo do checklist</h2>
      <ul>
        <li>Estenda <code>DomainException</code> ou <code>RuntimeException</code>, não <code>Exception</code> diretamente.</li>
        <li>Crie uma classe-base abstrata por módulo para captura agrupada.</li>
        <li>Use <code>readonly</code> properties para guardar contexto estruturado.</li>
        <li>Ofereça <em>named constructors</em> estáticos para mensagens consistentes.</li>
        <li>Sempre encadeie a causa original com <code>previous:</code>.</li>
        <li>Não crie classe vazia se ninguém vai capturar especificamente.</li>
      </ul>

      <p>
        Exceptions personalizadas são a primeira camada de documentação executável
        do seu domínio. Bem feitas, transformam <code>catch</code> em código
        autoexplicativo e fazem o log de produção contar a história inteira do
        problema sem você precisar inferir nada da mensagem.
      </p>
    </PageContainer>
  );
}
