import{j as e}from"./index-Bb4MiiJL.js";import{P as o,a,A as s}from"./AlertBox-BpD-xIsb.js";import{T as r}from"./TerminalBlock-DGurMC1r.js";import{C as t}from"./CodeBlock-C3V-qEkN.js";function l(){return e.jsxs(o,{title:"Mocks e Doubles",subtitle:"Como testar código que depende de banco, HTTP ou tempo sem chamar nada de verdade. Stubs, mocks, spies e fakes — quando usar cada um e quando você não deveria estar mockando.",difficulty:"avancado",timeToRead:"13 min",category:"Testes",children:[e.jsx("h2",{children:"O problema: testes que dependem do mundo"}),e.jsxs("p",{children:["Você tem uma classe ",e.jsx("code",{children:"Notificador"})," que envia e-mail. Para testar a lógica (formatar mensagem, escolher destinatário) você ",e.jsx("em",{children:"não quer"})," mandar e-mail real. Quer testar em milissegundos, sem internet, sem servidor SMTP."]}),e.jsx(a,{filename:"src/Notificador.php",code:`<?php
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
}`}),e.jsxs("p",{children:["Para testar ",e.jsx("code",{children:"avisarPedidoPago()"}),", queremos verificar que ele ",e.jsx("strong",{children:"chamou"})," ","o gateway com os argumentos certos — sem realmente enviar nada. É aí que entram os"," ",e.jsx("strong",{children:"test doubles"}),"."]}),e.jsx("h2",{children:"Os 5 tipos de Test Double (Gerard Meszaros)"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Dummy"})," — preenche um parâmetro mas nunca é usado. Existe só para satisfazer assinatura."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Stub"})," — retorna valores pré-programados. Não verifica chamadas."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Mock"})," — pré-programa retornos ",e.jsx("em",{children:"e"})," verifica que foi chamado como esperado."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Spy"})," — registra todas as chamadas para você inspecionar depois."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Fake"})," — implementação real, mas simplificada (ex.: repositório em array em vez de banco)."]})]}),e.jsx(s,{type:"info",title:"Na prática você usa 2 ou 3",children:"Stubs (controlar entradas) e Mocks (verificar comportamento) cobrem 95% dos casos. Fakes aparecem quando você quer testar com algo mais realista (um repositório em memória)."}),e.jsx("h2",{children:"createMock — o canivete suíço do PHPUnit"}),e.jsx(a,{filename:"tests/NotificadorTest.php",code:`<?php
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
}`,output:`PHPUnit 11.4.3 by Sebastian Bergmann and contributors.

.                                                                   1 / 1 (100%)

Time: 00:00.018, Memory: 8.00 MB

OK (1 test, 2 assertions)`}),e.jsx("p",{children:"Decompondo o que aconteceu:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"createMock(EmailGateway::class)"})," — gera dinamicamente uma classe que ",e.jsx("strong",{children:"implementa"})," a interface, com todos os métodos retornando ",e.jsx("code",{children:"null"}),"."]}),e.jsxs("li",{children:[e.jsx("code",{children:"expects($this->once())"})," — verificação: o método deve ser chamado ",e.jsx("strong",{children:"exatamente uma vez"}),"."]}),e.jsxs("li",{children:[e.jsx("code",{children:"method('enviar')"})," — qual método estamos configurando."]}),e.jsxs("li",{children:[e.jsx("code",{children:"with(...)"})," — quais argumentos esperamos receber. Se vier diferente, o teste falha."]}),e.jsxs("li",{children:[e.jsx("code",{children:"willReturn(true)"})," — o que o método deve retornar."]})]}),e.jsx("h2",{children:"MockObject — o tipo retornado"}),e.jsxs("p",{children:[e.jsx("code",{children:"createMock()"})," retorna ",e.jsx("code",{children:"PHPUnit\\\\Framework\\\\MockObject\\\\MockObject"}),", que é um ",e.jsx("em",{children:"intersection type"})," com a classe original. Ou seja: o objeto se passa por"," ",e.jsx("code",{children:"EmailGateway"})," para o type-hint do construtor, e por ",e.jsx("code",{children:"MockObject"})," para seus métodos de configuração."]}),e.jsx(a,{filename:"src/EmailGateway.php",code:`<?php
declare(strict_types=1);

namespace App;

interface EmailGateway
{
    public function enviar(string $para, string $assunto, string $corpo): bool;
}`}),e.jsx("h2",{children:"Stub puro: só retornar valores"}),e.jsxs("p",{children:["Quando não interessa ",e.jsx("em",{children:"se"})," o método foi chamado, só ",e.jsx("em",{children:"o que ele retorna"}),", use a forma curta sem ",e.jsx("code",{children:"expects()"}),":"]}),e.jsx(a,{filename:"tests/PrecoTest.php",code:`<?php
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
}`,output:`PHPUnit 11.4.3 by Sebastian Bergmann and contributors.

..                                                                  2 / 2 (100%)

Time: 00:00.020, Memory: 8.00 MB

OK (2 tests, 4 assertions)`}),e.jsx("h2",{children:"Verificando exceções e callbacks dinâmicos"}),e.jsx(a,{filename:"tests/CheckoutTest.php",code:`<?php
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
}`,output:`PHPUnit 11.4.3 by Sebastian Bergmann and contributors.

..                                                                  2 / 2 (100%)

OK (2 tests, 3 assertions)`}),e.jsx("h2",{children:"Spy: inspecionar depois em vez de pré-programar"}),e.jsxs("p",{children:["PHPUnit não tem um “spy” explícito, mas você consegue o efeito gravando os argumentos com"," ",e.jsx("code",{children:"willReturnCallback()"}),":"]}),e.jsx(a,{filename:"tests/LogSpy.php",code:`<?php
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
}`,output:"OK (1 test, 3 assertions)"}),e.jsx("h2",{children:"Fake: implementação real, simplificada"}),e.jsxs("p",{children:["Para um repositório de usuários, em vez de mockar cada chamada, faça uma classe"," ",e.jsx("code",{children:"UsuarioRepositorioEmMemoria"})," que implementa a mesma interface usando um array. Você consegue testar fluxos inteiros sem banco."]}),e.jsx(a,{filename:"tests/Fakes/UsuarioRepositorioEmMemoria.php",code:`<?php
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
}`}),e.jsxs(s,{type:"success",title:"Fakes envelhecem melhor que mocks",children:["Em testes de integração, um Fake protege você de ter que reescrever 30 testes só porque adicionou um parâmetro. Use Fakes quando o objeto tem ",e.jsx("em",{children:"estado"}),"; use Mocks/Stubs quando ele é só um colaborador sem memória."]}),e.jsx("h2",{children:"Alternativas: Mockery e Prophecy"}),e.jsx("p",{children:"O ecossistema tem dois outros frameworks de mocking populares, instaláveis via Composer:"}),e.jsx(r,{user:"dev",host:"php",cwd:"~/projetos/loja",command:"composer require --dev mockery/mockery",output:`Using version ^1.6 for mockery/mockery
./composer.json has been updated
Package operations: 2 installs, 0 updates, 0 removals
  - Installing mockery/mockery (1.6.12): Extracting archive`}),e.jsx(a,{filename:"tests/MockeryExemplo.php",code:`<?php
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
}`,output:"OK (1 test, 1 assertion)"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Mockery"})," tem sintaxe mais fluente (",e.jsx("code",{children:"shouldReceive"}),") e suporta truques como ",e.jsx("code",{children:"partial mock"}),". Já ",e.jsx("strong",{children:"Prophecy"})," (separado de PHPUnit desde a v9) usa verificação por ",e.jsx("em",{children:"spies"})," com ",e.jsx("code",{children:"prophesize()"}),". Hoje, ",e.jsx("code",{children:"createMock"})," nativo do PHPUnit cobre a maioria absoluta dos casos."]}),e.jsx(t,{language:"bash",code:`# resumo rápido de quando usar cada um
PHPUnit createMock     → padrão, sem dependências extras
Mockery                → projetos com muito mocking, sintaxe mais limpa
Prophecy               → herança de projetos antigos
Pest mock()            → atalho do Pest, usa Mockery por baixo`}),e.jsx("h2",{children:"O maior antipattern: mockar o que é seu"}),e.jsxs("p",{children:["A regra de ouro: ",e.jsx("strong",{children:"só mocke o que você não controla"})," — interfaces de bibliotecas externas, gateways HTTP, sistemas de arquivos, relógio. ",e.jsx("em",{children:"Nunca"})," mocke uma classe da sua própria camada de domínio só porque ela é grande. Isso indica que ela deveria ser quebrada em partes menores, não escondida atrás de um mock."]}),e.jsxs(s,{type:"danger",title:"Sintomas de mock-hell",children:[e.jsxs("ul",{className:"list-disc ml-5 mt-1 space-y-1",children:[e.jsx("li",{children:"Você precisa configurar 6 mocks para testar uma classe."}),e.jsxs("li",{children:["Mudou um parâmetro e quebrou 40 testes que ",e.jsx("em",{children:"não testavam"})," esse parâmetro."]}),e.jsx("li",{children:"O teste sabe a ordem exata em que métodos internos são chamados."}),e.jsx("li",{children:"Renomear um método quebra os testes mesmo sem mudar comportamento."})]}),"Quando isso acontece, o problema é design — não os mocks."]}),e.jsxs("p",{children:["No próximo capítulo a gente vira a chave: em vez de testar depois, vamos escrever o teste"," ",e.jsx("em",{children:"antes"})," do código com ",e.jsx("strong",{children:"TDD na prática"}),"."]})]})}export{l as default};
