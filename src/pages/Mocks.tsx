import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Mocks() {
  return (
    <PageContainer
      title="Mocks e Doubles"
      subtitle="Como testar código que depende de banco, HTTP ou tempo sem chamar nada de verdade. Stubs, mocks, spies e fakes — quando usar cada um e quando você não deveria estar mockando."
      difficulty="avancado"
      timeToRead="13 min"
      category="Testes"
    >
      <h2>O problema: testes que dependem do mundo</h2>
      <p>
        Você tem uma classe <code>Notificador</code> que envia e-mail. Para testar a lógica
        (formatar mensagem, escolher destinatário) você <em>não quer</em> mandar e-mail real. Quer
        testar em milissegundos, sem internet, sem servidor SMTP.
      </p>

      <PhpBlock
        filename="src/Notificador.php"
        code={`<?php
declare(strict_types=1);

namespace App;

final class Notificador
{
    public function __construct(
        private readonly EmailGateway $gateway,
    ) {}

    public function avisarPedidoPago(string $email, int $pedidoId): bool
    {
        $assunto  = "Pedido #{$pedidoId} confirmado";
        $corpo    = "Recebemos o pagamento do seu pedido.";
        return $this->gateway->enviar($email, $assunto, $corpo);
    }
}`}
      />

      <p>
        Para testar <code>avisarPedidoPago()</code>, queremos verificar que ele <strong>chamou</strong>{" "}
        o gateway com os argumentos certos — sem realmente enviar nada. É aí que entram os{" "}
        <strong>test doubles</strong>.
      </p>

      <h2>Os 5 tipos de Test Double (Gerard Meszaros)</h2>
      <ul>
        <li><strong>Dummy</strong> — preenche um parâmetro mas nunca é usado. Existe só para satisfazer assinatura.</li>
        <li><strong>Stub</strong> — retorna valores pré-programados. Não verifica chamadas.</li>
        <li><strong>Mock</strong> — pré-programa retornos <em>e</em> verifica que foi chamado como esperado.</li>
        <li><strong>Spy</strong> — registra todas as chamadas para você inspecionar depois.</li>
        <li><strong>Fake</strong> — implementação real, mas simplificada (ex.: repositório em array em vez de banco).</li>
      </ul>

      <AlertBox type="info" title="Na prática você usa 2 ou 3">
        Stubs (controlar entradas) e Mocks (verificar comportamento) cobrem 95% dos casos. Fakes
        aparecem quando você quer testar com algo mais realista (um repositório em memória).
      </AlertBox>

      <h2>createMock — o canivete suíço do PHPUnit</h2>
      <PhpBlock
        filename="tests/NotificadorTest.php"
        code={`<?php
declare(strict_types=1);

namespace Tests;

use App\\EmailGateway;
use App\\Notificador;
use PHPUnit\\Framework\\TestCase;

final class NotificadorTest extends TestCase
{
    public function test_envia_email_para_o_destinatario_correto(): void
    {
        $gateway = $this->createMock(EmailGateway::class);

        $gateway
            ->expects($this->once())
            ->method('enviar')
            ->with(
                'ada@example.com',
                'Pedido #42 confirmado',
                'Recebemos o pagamento do seu pedido.',
            )
            ->willReturn(true);

        $notificador = new Notificador($gateway);
        $resultado   = $notificador->avisarPedidoPago('ada@example.com', 42);

        $this->assertTrue($resultado);
    }
}`}
        output={`PHPUnit 11.4.3 by Sebastian Bergmann and contributors.

.                                                                   1 / 1 (100%)

Time: 00:00.018, Memory: 8.00 MB

OK (1 test, 2 assertions)`}
      />

      <p>Decompondo o que aconteceu:</p>
      <ul>
        <li><code>createMock(EmailGateway::class)</code> — gera dinamicamente uma classe que <strong>implementa</strong> a interface, com todos os métodos retornando <code>null</code>.</li>
        <li><code>expects($this-&gt;once())</code> — verificação: o método deve ser chamado <strong>exatamente uma vez</strong>.</li>
        <li><code>method('enviar')</code> — qual método estamos configurando.</li>
        <li><code>with(...)</code> — quais argumentos esperamos receber. Se vier diferente, o teste falha.</li>
        <li><code>willReturn(true)</code> — o que o método deve retornar.</li>
      </ul>

      <h2>MockObject — o tipo retornado</h2>
      <p>
        <code>createMock()</code> retorna <code>PHPUnit\\Framework\\MockObject\\MockObject</code>, que é
        um <em>intersection type</em> com a classe original. Ou seja: o objeto se passa por{" "}
        <code>EmailGateway</code> para o type-hint do construtor, e por <code>MockObject</code> para
        seus métodos de configuração.
      </p>

      <PhpBlock
        filename="src/EmailGateway.php"
        code={`<?php
declare(strict_types=1);

namespace App;

interface EmailGateway
{
    public function enviar(string $para, string $assunto, string $corpo): bool;
}`}
      />

      <h2>Stub puro: só retornar valores</h2>
      <p>
        Quando não interessa <em>se</em> o método foi chamado, só <em>o que ele retorna</em>, use a
        forma curta sem <code>expects()</code>:
      </p>

      <PhpBlock
        filename="tests/PrecoTest.php"
        code={`<?php
declare(strict_types=1);

namespace Tests;

use App\\CotacaoMoeda;
use App\\Conversor;
use PHPUnit\\Framework\\TestCase;

final class PrecoTest extends TestCase
{
    public function test_converte_dolar_para_real(): void
    {
        $cotacao = $this->createMock(CotacaoMoeda::class);
        $cotacao->method('dolarHoje')->willReturn(5.20);

        $conversor = new Conversor($cotacao);
        $this->assertSame(52.00, $conversor->paraReal(10.00));
    }

    public function test_retornos_diferentes_em_cada_chamada(): void
    {
        $cotacao = $this->createMock(CotacaoMoeda::class);
        $cotacao->method('dolarHoje')
            ->willReturnOnConsecutiveCalls(5.20, 5.30, 5.40);

        $this->assertSame(52.00, (new Conversor($cotacao))->paraReal(10.00));
        $this->assertSame(53.00, (new Conversor($cotacao))->paraReal(10.00));
        $this->assertSame(54.00, (new Conversor($cotacao))->paraReal(10.00));
    }
}`}
        output={`PHPUnit 11.4.3 by Sebastian Bergmann and contributors.

..                                                                  2 / 2 (100%)

Time: 00:00.020, Memory: 8.00 MB

OK (2 tests, 4 assertions)`}
      />

      <h2>Verificando exceções e callbacks dinâmicos</h2>
      <PhpBlock
        filename="tests/CheckoutTest.php"
        code={`<?php
declare(strict_types=1);

namespace Tests;

use App\\Checkout;
use App\\PagamentoGateway;
use App\\PagamentoRecusado;
use PHPUnit\\Framework\\TestCase;

final class CheckoutTest extends TestCase
{
    public function test_lanca_excecao_se_gateway_recusar(): void
    {
        $gateway = $this->createMock(PagamentoGateway::class);
        $gateway->method('cobrar')
            ->willThrowException(new PagamentoRecusado('saldo insuficiente'));

        $this->expectException(PagamentoRecusado::class);
        $this->expectExceptionMessage('saldo insuficiente');

        (new Checkout($gateway))->finalizar('ada@x.com', 100.0);
    }

    public function test_inspeciona_argumento_complexo(): void
    {
        $gateway = $this->createMock(PagamentoGateway::class);

        $gateway->expects($this->once())
            ->method('cobrar')
            ->with($this->callback(function (array $payload): bool {
                return $payload['email'] === 'ada@x.com'
                    && $payload['valor_centavos'] === 10000;
            }))
            ->willReturn(['id' => 'tx_1']);

        (new Checkout($gateway))->finalizar('ada@x.com', 100.0);
    }
}`}
        output={`PHPUnit 11.4.3 by Sebastian Bergmann and contributors.

..                                                                  2 / 2 (100%)

OK (2 tests, 3 assertions)`}
      />

      <h2>Spy: inspecionar depois em vez de pré-programar</h2>
      <p>
        PHPUnit não tem um “spy” explícito, mas você consegue o efeito gravando os argumentos com{" "}
        <code>willReturnCallback()</code>:
      </p>

      <PhpBlock
        filename="tests/LogSpy.php"
        code={`<?php
declare(strict_types=1);

namespace Tests;

use App\\Auditoria;
use App\\Logger;
use PHPUnit\\Framework\\TestCase;

final class LogSpyTest extends TestCase
{
    public function test_registra_todos_os_eventos(): void
    {
        $logger    = $this->createMock(Logger::class);
        $chamadas  = [];

        $logger->method('info')
            ->willReturnCallback(function (string $msg) use (&$chamadas): void {
                $chamadas[] = $msg;
            });

        (new Auditoria($logger))->registrar('login', 'logout', 'pagamento');

        $this->assertCount(3, $chamadas);
        $this->assertSame('login', $chamadas[0]);
        $this->assertSame('pagamento', $chamadas[2]);
    }
}`}
        output={`OK (1 test, 3 assertions)`}
      />

      <h2>Fake: implementação real, simplificada</h2>
      <p>
        Para um repositório de usuários, em vez de mockar cada chamada, faça uma classe{" "}
        <code>UsuarioRepositorioEmMemoria</code> que implementa a mesma interface usando um array.
        Você consegue testar fluxos inteiros sem banco.
      </p>

      <PhpBlock
        filename="tests/Fakes/UsuarioRepositorioEmMemoria.php"
        code={`<?php
declare(strict_types=1);

namespace Tests\\Fakes;

use App\\Usuario;
use App\\UsuarioRepositorio;

final class UsuarioRepositorioEmMemoria implements UsuarioRepositorio
{
    /** @var array<int, Usuario> */
    private array $itens = [];
    private int $proximoId = 1;

    public function salvar(Usuario $u): Usuario
    {
        $u->id = $this->proximoId++;
        $this->itens[$u->id] = $u;
        return $u;
    }

    public function buscar(int $id): ?Usuario
    {
        return $this->itens[$id] ?? null;
    }
}`}
      />

      <AlertBox type="success" title="Fakes envelhecem melhor que mocks">
        Em testes de integração, um Fake protege você de ter que reescrever 30 testes só porque
        adicionou um parâmetro. Use Fakes quando o objeto tem <em>estado</em>; use Mocks/Stubs quando ele
        é só um colaborador sem memória.
      </AlertBox>

      <h2>Alternativas: Mockery e Prophecy</h2>
      <p>
        O ecossistema tem dois outros frameworks de mocking populares, instaláveis via Composer:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command="composer require --dev mockery/mockery"
        output={`Using version ^1.6 for mockery/mockery
./composer.json has been updated
Package operations: 2 installs, 0 updates, 0 removals
  - Installing mockery/mockery (1.6.12): Extracting archive`}
      />

      <PhpBlock
        filename="tests/MockeryExemplo.php"
        code={`<?php
declare(strict_types=1);

namespace Tests;

use App\\EmailGateway;
use App\\Notificador;
use Mockery;
use PHPUnit\\Framework\\TestCase;

final class MockeryExemploTest extends TestCase
{
    protected function tearDown(): void
    {
        Mockery::close();
    }

    public function test_sintaxe_mockery(): void
    {
        $gateway = Mockery::mock(EmailGateway::class);
        $gateway->shouldReceive('enviar')
            ->once()
            ->with('ada@x.com', Mockery::any(), Mockery::any())
            ->andReturn(true);

        $notificador = new Notificador($gateway);
        $this->assertTrue($notificador->avisarPedidoPago('ada@x.com', 1));
    }
}`}
        output={`OK (1 test, 1 assertion)`}
      />

      <p>
        <strong>Mockery</strong> tem sintaxe mais fluente (<code>shouldReceive</code>) e suporta truques
        como <code>partial mock</code>. Já <strong>Prophecy</strong> (separado de PHPUnit desde a v9) usa
        verificação por <em>spies</em> com <code>prophesize()</code>. Hoje, <code>createMock</code> nativo
        do PHPUnit cobre a maioria absoluta dos casos.
      </p>

      <CodeBlock
        language="bash"
        code={`# resumo rápido de quando usar cada um
PHPUnit createMock     → padrão, sem dependências extras
Mockery                → projetos com muito mocking, sintaxe mais limpa
Prophecy               → herança de projetos antigos
Pest mock()            → atalho do Pest, usa Mockery por baixo`}
      />

      <h2>O maior antipattern: mockar o que é seu</h2>
      <p>
        A regra de ouro: <strong>só mocke o que você não controla</strong> — interfaces de bibliotecas
        externas, gateways HTTP, sistemas de arquivos, relógio. <em>Nunca</em> mocke uma classe da sua
        própria camada de domínio só porque ela é grande. Isso indica que ela deveria ser quebrada em
        partes menores, não escondida atrás de um mock.
      </p>

      <AlertBox type="danger" title="Sintomas de mock-hell">
        <ul className="list-disc ml-5 mt-1 space-y-1">
          <li>Você precisa configurar 6 mocks para testar uma classe.</li>
          <li>Mudou um parâmetro e quebrou 40 testes que <em>não testavam</em> esse parâmetro.</li>
          <li>O teste sabe a ordem exata em que métodos internos são chamados.</li>
          <li>Renomear um método quebra os testes mesmo sem mudar comportamento.</li>
        </ul>
        Quando isso acontece, o problema é design — não os mocks.
      </AlertBox>

      <p>
        No próximo capítulo a gente vira a chave: em vez de testar depois, vamos escrever o teste{" "}
        <em>antes</em> do código com <strong>TDD na prática</strong>.
      </p>
    </PageContainer>
  );
}
