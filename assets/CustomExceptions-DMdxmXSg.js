import{j as e}from"./index-Bb4MiiJL.js";import{P as i,a as o,A as a}from"./AlertBox-BpD-xIsb.js";import{T as n}from"./TerminalBlock-DGurMC1r.js";function c(){return e.jsxs(i,{title:"Exceptions personalizadas",subtitle:"Quando criar a sua própria exception, como organizar uma hierarquia que reflete o domínio e como anexar contexto que torna o debug instantâneo.",difficulty:"avancado",timeToRead:"10 min",category:"Erros & Exceções",children:[e.jsx("h2",{children:"O problema: RuntimeException para tudo"}),e.jsxs("p",{children:["É tentador resolver qualquer erro com"," ",e.jsx("code",{children:'throw new RuntimeException("...")'}),". Mas no ",e.jsx("code",{children:"catch"}),', você não tem como distinguir "saldo insuficiente" de "banco fora do ar" sem parsear a mensagem — anti-padrão clássico.']}),e.jsx(o,{filename:"legado.php",code:`<?php
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
}`,output:"trate saldo..."}),e.jsxs("p",{children:["A solução é criar exceptions que ",e.jsx("strong",{children:"são"})," o erro: uma classe para cada conceito do seu domínio. O nome da classe vira documentação, o"," ",e.jsx("code",{children:"catch"})," vira preciso e você ganha autocomplete em todo o IDE."]}),e.jsx("h2",{children:"O básico: estendendo Exception"}),e.jsxs("p",{children:["Toda exception personalizada estende ",e.jsx("code",{children:"\\\\Exception"})," (ou alguma descendente). Sem mais nada, ela já é distinguível por tipo:"]}),e.jsx(o,{filename:"basico.php",code:`<?php
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
}`,output:`[saldo] saldo insuficiente em A1
[bloqueada] conta B2 está bloqueada`}),e.jsx("h2",{children:"Hierarquia: aproveitando exceptions da SPL"}),e.jsxs("p",{children:["A biblioteca padrão do PHP já entrega uma hierarquia base muito útil. Use-a como ponto de partida para que seu erro tenha ",e.jsx("em",{children:"significado semântico"}),":"]}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"LogicException"})," — bug de programação (precondição violada). Subclasses: ",e.jsx("code",{children:"InvalidArgumentException"}),", ",e.jsx("code",{children:"OutOfRangeException"}),", ",e.jsx("code",{children:"DomainException"}),"."]}),e.jsxs("li",{children:[e.jsx("code",{children:"RuntimeException"})," — falha em runtime (rede, IO, recurso indisponível). Subclasses: ",e.jsx("code",{children:"UnexpectedValueException"}),", ",e.jsx("code",{children:"OverflowException"}),"."]})]}),e.jsxs(a,{type:"info",title:"Por que LogicException vs RuntimeException importa",children:["Algumas equipes capturam só ",e.jsx("code",{children:"RuntimeException"})," em handlers globais e deixam ",e.jsx("code",{children:"LogicException"})," propagar até crash — porque elas indicam ",e.jsx("em",{children:"bug"})," que o teste deveria ter pego. Escolher a base certa comunica intenção sem comentário."]}),e.jsx(o,{filename:"hierarquia.php",code:`<?php
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
}`,output:`[domínio] PagamentoRecusado: cartão recusado pelo emissor
[domínio] PagamentoExpirado: limite de transação excedido
[infra] timeout ao chamar gateway`}),e.jsxs("p",{children:["Veja a vantagem: ",e.jsx("code",{children:"catch (PagamentoException $e)"})," pega"," ",e.jsx("em",{children:"qualquer"})," erro de pagamento — recusado, expirado ou um novo tipo que você criar amanhã. A camada superior trata o conceito; quem precisa distinguir, faz outro ",e.jsx("code",{children:"catch"})," antes."]}),e.jsx("h2",{children:"Anexando contexto: propriedades customizadas"}),e.jsx("p",{children:"Mensagem em string é boa para humano ler, mas péssima para máquina. Crie propriedades tipadas para guardar dados estruturados que o handler (logger, monitor) possa serializar."}),e.jsx(o,{filename:"contexto.php",code:`<?php
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
}`,output:`2 campo(s) inválido(s) em Cadastro
{"tipo":"validacao","entidade":"Cadastro","erros":{"email":"formato inválido","idade":"deve ser maior que 18"}}`}),e.jsxs(a,{type:"success",title:"readonly + promotion = exception perfeita",children:["Marcar as propriedades como ",e.jsx("code",{children:"public readonly"})," garante que ninguém adultere o contexto depois — útil porque exceptions são frequentemente repassadas e logadas em vários pontos."]}),e.jsx("h2",{children:"Named constructors: mensagens consistentes"}),e.jsxs("p",{children:["Em vez de espalhar ",e.jsx("code",{children:'new MinhaException("...")'})," com texto repetido em vários arquivos, crie ",e.jsx("em",{children:"named constructors"})," estáticos. Eles garantem mensagem padronizada e reduzem o ruído."]}),e.jsx(o,{filename:"named.php",code:`<?php
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
}`,output:`Usuário com id=42 não encontrado
Usuário com email=ada@example.com não encontrado`}),e.jsx("h2",{children:"Exception chaining no domínio"}),e.jsx("p",{children:"Quando você converte um erro de infraestrutura em erro de domínio, sempre passe a causa original. Em produção, o log mostra a stack inteira; o caller só conhece a abstração."}),e.jsx(o,{filename:"chaining.php",code:`<?php
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
}`,output:`domínio: não foi possível salvar pedido #789
  pedido: 789
  causa : SQLSTATE[HY000] connection lost`}),e.jsx("h2",{children:"Quando criar uma nova exception?"}),e.jsx("p",{children:"Nem todo erro merece classe própria. O critério prático:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Sim"})," — quando alguém vai querer capturar especificamente este caso, ou quando o erro carrega contexto estruturado relevante (id, campo, regra violada)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Sim"})," — quando o conceito é central do domínio (",e.jsx("code",{children:"EstoqueInsuficiente"}),", ",e.jsx("code",{children:"PrazoVencido"}),"): a exception é parte da linguagem ubíqua."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Não"})," — para validações genéricas one-off, um"," ",e.jsx("code",{children:"InvalidArgumentException"})," resolve."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Não"})," — quando você cria 30 classes vazias só para mudar o nome. Hierarquia inflada vira ruído."]})]}),e.jsxs(a,{type:"warning",title:"Pegadinha: __construct e parent::__construct",children:["Se você sobrescreve o construtor da exception com promotion, ",e.jsx("strong",{children:"não esqueça"})," de chamar ",e.jsx("code",{children:"parent::__construct(...)"}),". Sem isso,",e.jsx("code",{children:"$e->getMessage()"})," volta vazio e ",e.jsx("code",{children:"$e->getFile()"})," ","aponta errado."]}),e.jsx("h2",{children:"Organizando no projeto"}),e.jsxs("p",{children:["A convenção da comunidade PHP é colocar exceptions perto do código que as lança, em uma subpasta ",e.jsx("code",{children:"Exception"}),":"]}),e.jsx(o,{filename:"estrutura",language:"text",code:`src/
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
        └── EmailJaCadastrado.php`}),e.jsxs("p",{children:["Cada módulo tem sua própria base abstrata (",e.jsx("code",{children:"PagamentoException"}),"), e quem está fora pode capturar essa base sem se acoplar aos detalhes internos."]}),e.jsx("h2",{children:"Integrando com Monolog"}),e.jsxs("p",{children:["Bibliotecas como ",e.jsx("code",{children:"monolog/monolog"})," aceitam exception como contexto: ela aparece no log com stack trace e classe, junto dos campos extras que você anexar."]}),e.jsx(o,{filename:"logando.php",code:`<?php
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
}`}),e.jsx(n,{user:"dev",host:"php",cwd:"~/projetos/exc",command:"composer require monolog/monolog",output:`Using version ^3.7 for monolog/monolog
./composer.json has been updated
Running composer update monolog/monolog
Lock file operations: 1 install, 0 updates, 0 removals
Writing lock file
Installing dependencies from lock file
  - Installing monolog/monolog (3.7.0): Extracting`}),e.jsx(n,{user:"dev",host:"php",cwd:"~/projetos/exc",command:"php logando.php",output:'[2025-01-20T12:30:45+00:00] app.ERROR: falha ao processar pedido {"pedido_id":42,"exception":"[object] (RuntimeException(code: 0): deu ruim no checkout at /home/dev/projetos/exc/logando.php:14)"} []'}),e.jsx("h2",{children:"Resumo do checklist"}),e.jsxs("ul",{children:[e.jsxs("li",{children:["Estenda ",e.jsx("code",{children:"DomainException"})," ou ",e.jsx("code",{children:"RuntimeException"}),", não ",e.jsx("code",{children:"Exception"})," diretamente."]}),e.jsx("li",{children:"Crie uma classe-base abstrata por módulo para captura agrupada."}),e.jsxs("li",{children:["Use ",e.jsx("code",{children:"readonly"})," properties para guardar contexto estruturado."]}),e.jsxs("li",{children:["Ofereça ",e.jsx("em",{children:"named constructors"})," estáticos para mensagens consistentes."]}),e.jsxs("li",{children:["Sempre encadeie a causa original com ",e.jsx("code",{children:"previous:"}),"."]}),e.jsx("li",{children:"Não crie classe vazia se ninguém vai capturar especificamente."})]}),e.jsxs("p",{children:["Exceptions personalizadas são a primeira camada de documentação executável do seu domínio. Bem feitas, transformam ",e.jsx("code",{children:"catch"})," em código autoexplicativo e fazem o log de produção contar a história inteira do problema sem você precisar inferir nada da mensagem."]})]})}export{c as default};
