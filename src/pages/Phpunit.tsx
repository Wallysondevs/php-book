import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Phpunit() {
  return (
    <PageContainer
      title="PHPUnit"
      subtitle="O framework de testes mais maduro do PHP. Vamos instalar, configurar, escrever os primeiros casos, usar dataProviders e gerar relatório de cobertura HTML."
      difficulty="intermediario"
      timeToRead="14 min"
      category="Testes"
    >
      <h2>Por que PHPUnit?</h2>
      <p>
        Você acabou de implementar uma função que calcula desconto. Roda no navegador, parece certo.
        Daqui a três meses um colega mexe em outra parte do código e seu desconto começa a vir negativo.
        Sem teste, ninguém percebe — o cliente percebe. Esse é o problema que o <strong>PHPUnit</strong> resolve:
        cada regra de negócio vira código executável que <em>protege</em> a próxima alteração.
      </p>

      <h2>Instalando como dependência de dev</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command="composer require --dev phpunit/phpunit ^11.0"
        output={`Using version ^11.0 for phpunit/phpunit
./composer.json has been updated
Running composer update phpunit/phpunit
Loading composer repositories with package information
Updating dependencies
Lock file operations: 24 installs, 0 updates, 0 removals
Writing lock file
Installing dependencies from lock file
Package operations: 24 installs, 0 updates, 0 removals
  - Installing phpunit/phpunit (11.4.3): Extracting archive
Generating optimized autoload files`}
      />

      <p>
        A flag <code>--dev</code> coloca o PHPUnit em <code>require-dev</code> do{" "}
        <code>composer.json</code>: ele vai para o ambiente de desenvolvimento e CI, mas{" "}
        <strong>nunca</strong> para a imagem de produção (use <code>composer install --no-dev</code> lá).
      </p>

      <h2>Estrutura de pastas convencional</h2>
      <CodeBlock
        language="bash"
        code={`projeto/
├── composer.json
├── phpunit.xml
├── src/
│   └── Calculadora.php
├── tests/
│   └── CalculadoraTest.php
└── vendor/`}
      />

      <h2>O arquivo phpunit.xml</h2>
      <p>
        Ele diz ao PHPUnit onde está cada coisa. O mínimo viável para PHPUnit 11:
      </p>

      <CodeBlock
        language="xml"
        code={`<?xml version="1.0" encoding="UTF-8"?>
<phpunit xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
         xsi:noNamespaceSchemaLocation="vendor/phpunit/phpunit/phpunit.xsd"
         bootstrap="vendor/autoload.php"
         colors="true"
         cacheDirectory=".phpunit.cache">

    <testsuites>
        <testsuite name="default">
            <directory>tests</directory>
        </testsuite>
    </testsuites>

    <source>
        <include>
            <directory>src</directory>
        </include>
    </source>
</phpunit>`}
      />

      <h2>Primeiro teste — uma calculadora simples</h2>
      <PhpBlock
        filename="src/Calculadora.php"
        code={`<?php
declare(strict_types=1);

namespace App;

final class Calculadora
{
    public function somar(int $a, int $b): int
    {
        return $a + $b;
    }

    public function dividir(int $a, int $b): float
    {
        if ($b === 0) {
            throw new \\DivisionByZeroError('divisor não pode ser zero');
        }
        return $a / $b;
    }
}`}
      />

      <PhpBlock
        filename="tests/CalculadoraTest.php"
        code={`<?php
declare(strict_types=1);

namespace Tests;

use App\\Calculadora;
use PHPUnit\\Framework\\TestCase;

final class CalculadoraTest extends TestCase
{
    public function test_soma_dois_inteiros(): void
    {
        $calc = new Calculadora();
        $resultado = $calc->somar(2, 3);
        $this->assertSame(5, $resultado);
    }

    public function test_divisao_por_zero_lanca_excecao(): void
    {
        $this->expectException(\\DivisionByZeroError::class);
        (new Calculadora())->dividir(10, 0);
    }
}`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command="./vendor/bin/phpunit"
        output={`PHPUnit 11.4.3 by Sebastian Bergmann and contributors.

Runtime:       PHP 8.4.0
Configuration: /home/dev/projetos/loja/phpunit.xml

..                                                                  2 / 2 (100%)

Time: 00:00.018, Memory: 8.00 MB

OK (2 tests, 2 assertions)`}
      />

      <AlertBox type="success" title="Convenção de nomes">
        Use <code>NomeDaClasseTest</code> e métodos começando com <code>test_</code> ou anotados com{" "}
        <code>#[Test]</code>. PHPUnit 11 abandonou anotações em docblock — agora tudo é{" "}
        <strong>atributo nativo do PHP 8</strong>.
      </AlertBox>

      <h2>assertEquals vs assertSame</h2>
      <p>
        Esta é <strong>a</strong> pegadinha mais comum. Ambos comparam, mas:
      </p>
      <ul>
        <li><code>assertEquals</code> usa <code>==</code> (faz coerção de tipos).</li>
        <li><code>assertSame</code> usa <code>===</code> (compara tipo E valor).</li>
      </ul>

      <PhpBlock
        filename="tests/IgualdadeTest.php"
        code={`<?php
declare(strict_types=1);

namespace Tests;

use PHPUnit\\Framework\\TestCase;

final class IgualdadeTest extends TestCase
{
    public function test_assert_equals_aceita_tipos_diferentes(): void
    {
        $this->assertEquals(1, '1');     // passa
        $this->assertEquals(true, 1);    // passa
    }

    public function test_assert_same_e_estrito(): void
    {
        $this->assertSame(1, 1);         // passa
        $this->assertSame('a', 'a');     // passa
        // $this->assertSame(1, '1');    // FALHARIA
    }

    public function test_assert_true_so_aceita_true_puro(): void
    {
        $this->assertTrue(true);
        // $this->assertTrue(1);         // FALHARIA — não é true puro
    }
}`}
        output={`PHPUnit 11.4.3 by Sebastian Bergmann and contributors.

...                                                                 3 / 3 (100%)

Time: 00:00.012, Memory: 8.00 MB

OK (3 tests, 5 assertions)`}
      />

      <AlertBox type="warning" title="Prefira assertSame por padrão">
        <code>assertEquals</code> esconde bugs de tipo. Em código com <code>declare(strict_types=1)</code>,
        praticamente nunca faz sentido aceitar coerção. Use <code>assertSame</code> e suas variações
        estritas (<code>assertCount</code>, <code>assertInstanceOf</code>) sempre que possível.
      </AlertBox>

      <h2>Data Providers — testando 50 casos com 1 método</h2>
      <p>
        Em vez de copiar e colar o mesmo teste para 5 valores diferentes, você fornece os dados via{" "}
        <code>#[DataProvider]</code>:
      </p>

      <PhpBlock
        filename="tests/SomaTest.php"
        code={`<?php
declare(strict_types=1);

namespace Tests;

use App\\Calculadora;
use PHPUnit\\Framework\\Attributes\\DataProvider;
use PHPUnit\\Framework\\TestCase;

final class SomaTest extends TestCase
{
    #[DataProvider('casos')]
    public function test_soma(int $a, int $b, int $esperado): void
    {
        $this->assertSame($esperado, (new Calculadora())->somar($a, $b));
    }

    public static function casos(): array
    {
        return [
            'positivos'    => [2, 3, 5],
            'negativos'    => [-1, -1, -2],
            'zero'         => [0, 0, 0],
            'misturados'   => [-5, 10, 5],
            'grandes'      => [1_000_000, 1, 1_000_001],
        ];
    }
}`}
        output={`PHPUnit 11.4.3 by Sebastian Bergmann and contributors.

.....                                                               5 / 5 (100%)

Time: 00:00.014, Memory: 8.00 MB

OK (5 tests, 5 assertions)`}
      />

      <p>
        Note duas coisas: o método <code>casos()</code> é <strong>estático</strong> (obrigatório no
        PHPUnit 10+) e a chave do array vira o nome do caso de teste no relatório, ajudando a localizar
        falhas: <code>test_soma with data set "negativos"</code>.
      </p>

      <h2>setUp e tearDown — preparando o cenário</h2>
      <p>
        Quando vários testes precisam do mesmo objeto, instancie em <code>setUp()</code> — ele roda{" "}
        <strong>antes de cada teste</strong>. Se precisa limpar (apagar arquivo, fechar conexão), use{" "}
        <code>tearDown()</code>.
      </p>

      <PhpBlock
        filename="tests/CarrinhoTest.php"
        code={`<?php
declare(strict_types=1);

namespace Tests;

use App\\Carrinho;
use PHPUnit\\Framework\\TestCase;

final class CarrinhoTest extends TestCase
{
    private Carrinho $carrinho;

    protected function setUp(): void
    {
        $this->carrinho = new Carrinho();
        $this->carrinho->adicionar('café', 12.50);
        $this->carrinho->adicionar('pão', 0.75);
    }

    protected function tearDown(): void
    {
        unset($this->carrinho);
    }

    public function test_total(): void
    {
        $this->assertSame(13.25, $this->carrinho->total());
    }

    public function test_quantidade_de_itens(): void
    {
        $this->assertCount(2, $this->carrinho->itens());
    }
}`}
        output={`PHPUnit 11.4.3 by Sebastian Bergmann and contributors.

..                                                                  2 / 2 (100%)

OK (2 tests, 2 assertions)`}
      />

      <AlertBox type="info" title="Cada teste é um mundo isolado">
        PHPUnit cria <strong>uma nova instância</strong> da classe de teste para cada método. Estado
        em propriedades nunca vaza entre testes — exatamente o que você quer.
      </AlertBox>

      <h2>Filtrando: rodando só um teste</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command="./vendor/bin/phpunit --filter test_soma"
        output={`PHPUnit 11.4.3 by Sebastian Bergmann and contributors.

.....                                                               5 / 5 (100%)

Time: 00:00.011, Memory: 8.00 MB

OK (5 tests, 5 assertions)`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command="./vendor/bin/phpunit tests/CarrinhoTest.php"
        output={`PHPUnit 11.4.3 by Sebastian Bergmann and contributors.

..                                                                  2 / 2 (100%)

OK (2 tests, 2 assertions)`}
      />

      <h2>Cobertura de código com Xdebug</h2>
      <p>
        Cobertura responde: <em>quais linhas do meu código são executadas pelos testes?</em> Para gerar
        relatório HTML, você precisa do Xdebug (ou pcov) instalado.
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command="XDEBUG_MODE=coverage ./vendor/bin/phpunit --coverage-html coverage"
        output={`PHPUnit 11.4.3 by Sebastian Bergmann and contributors.

........                                                            8 / 8 (100%)

Time: 00:00.234, Memory: 18.00 MB

OK (8 tests, 12 assertions)

Generating code coverage report in HTML format ... done [00:00.412]`}
      />

      <p>
        Abra <code>coverage/index.html</code> no navegador: cada arquivo aparece colorido, verde nas
        linhas cobertas, vermelho nas que nenhum teste tocou. É a melhor ferramenta para encontrar
        “zonas escuras” que precisam de mais testes.
      </p>

      <AlertBox type="warning" title="Cobertura não é qualidade">
        100% de cobertura não significa que seu código está correto — significa apenas que todas as
        linhas <em>executaram</em>. Você pode ter testes que cobrem a linha sem assertar nada de útil.
        Use cobertura como <strong>indicador de áreas não testadas</strong>, não como meta absoluta.
      </AlertBox>

      <h2>Comandos do dia a dia</h2>
      <CodeBlock
        language="bash"
        code={`# rodar tudo
./vendor/bin/phpunit

# rodar uma suíte específica
./vendor/bin/phpunit --testsuite default

# rodar só testes que falharam na última execução
./vendor/bin/phpunit --order-by=defects --stop-on-defect

# saída detalhada por teste
./vendor/bin/phpunit --testdox

# parar no primeiro erro
./vendor/bin/phpunit --stop-on-failure`}
      />

      <p>
        No próximo capítulo a gente conhece o <strong>Pest</strong>, uma camada moderna em cima do
        PHPUnit que troca classes e métodos por uma sintaxe quase narrativa — <code>it('soma corretamente',
        fn() =&gt; ...)</code>.
      </p>
    </PageContainer>
  );
}
