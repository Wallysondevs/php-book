import{j as e}from"./index-B5-q-eol.js";import{P as r,A as s,a}from"./AlertBox-CVbFLZEd.js";import{T as t}from"./TerminalBlock-6fqVIX2R.js";import{C as o}from"./CodeBlock-B36pQ_ak.js";function l(){return e.jsxs(r,{title:"PHPUnit",subtitle:"O framework de testes mais maduro do PHP. Vamos instalar, configurar, escrever os primeiros casos, usar dataProviders e gerar relatório de cobertura HTML.",difficulty:"intermediario",timeToRead:"14 min",category:"Testes",children:[e.jsx(s,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Test case"})," "," — "," ","classe estende TestCase; métodos test* viram testes."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Assertions"})," "," — "," ","assertEquals, assertSame, assertCount, assertInstanceOf."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Setup/teardown"})," "," — "," ","setUp() roda antes de cada teste; tearDown() depois."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"DataProvider"})," "," — "," ","método que devolve casos para parametrizar testes."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Mock"})," "," — "," ","createMock(Class::class)->method(...)->willReturn(...)."]})]}),e.jsx("h2",{children:"Por que PHPUnit?"}),e.jsxs("p",{children:["Você acabou de implementar uma função que calcula desconto. Roda no navegador, parece certo. Daqui a três meses um colega mexe em outra parte do código e seu desconto começa a vir negativo. Sem teste, ninguém percebe — o cliente percebe. Esse é o problema que o ",e.jsx("strong",{children:"PHPUnit"})," resolve: cada regra de negócio vira código executável que ",e.jsx("em",{children:"protege"})," a próxima alteração."]}),e.jsx("h2",{children:"Instalando como dependência de dev"}),e.jsx(t,{user:"dev",host:"php",cwd:"~/projetos/loja",command:"composer require --dev phpunit/phpunit ^11.0",output:`Using version ^11.0 for phpunit/phpunit
./composer.json has been updated
Running composer update phpunit/phpunit
Loading composer repositories with package information
Updating dependencies
Lock file operations: 24 installs, 0 updates, 0 removals
Writing lock file
Installing dependencies from lock file
Package operations: 24 installs, 0 updates, 0 removals
  - Installing phpunit/phpunit (11.4.3): Extracting archive
Generating optimized autoload files`}),e.jsxs("p",{children:["A flag ",e.jsx("code",{children:"--dev"})," coloca o PHPUnit em ",e.jsx("code",{children:"require-dev"})," do"," ",e.jsx("code",{children:"composer.json"}),": ele vai para o ambiente de desenvolvimento e CI, mas"," ",e.jsx("strong",{children:"nunca"})," para a imagem de produção (use ",e.jsx("code",{children:"composer install --no-dev"})," lá)."]}),e.jsx("h2",{children:"Estrutura de pastas convencional"}),e.jsx(o,{language:"bash",code:`projeto/
├── composer.json
├── phpunit.xml
├── src/
│   └── Calculadora.php
├── tests/
│   └── CalculadoraTest.php
└── vendor/`}),e.jsx("h2",{children:"O arquivo phpunit.xml"}),e.jsx("p",{children:"Ele diz ao PHPUnit onde está cada coisa. O mínimo viável para PHPUnit 11:"}),e.jsx(o,{language:"xml",code:`<?xml version="1.0" encoding="UTF-8"?>
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
</phpunit>`}),e.jsx("h2",{children:"Primeiro teste — uma calculadora simples"}),e.jsx(a,{filename:"src/Calculadora.php",code:`<?php
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
}`}),e.jsx(a,{filename:"tests/CalculadoraTest.php",code:`<?php
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
}`}),e.jsx(t,{user:"dev",host:"php",cwd:"~/projetos/loja",command:"./vendor/bin/phpunit",output:`PHPUnit 11.4.3 by Sebastian Bergmann and contributors.

Runtime:       PHP 8.4.0
Configuration: /home/dev/projetos/loja/phpunit.xml

..                                                                  2 / 2 (100%)

Time: 00:00.018, Memory: 8.00 MB

OK (2 tests, 2 assertions)`}),e.jsxs(s,{type:"success",title:"Convenção de nomes",children:["Use ",e.jsx("code",{children:"NomeDaClasseTest"})," e métodos começando com ",e.jsx("code",{children:"test_"})," ou anotados com"," ",e.jsx("code",{children:"#[Test]"}),". PHPUnit 11 abandonou anotações em docblock — agora tudo é"," ",e.jsx("strong",{children:"atributo nativo do PHP 8"}),"."]}),e.jsx("h2",{children:"assertEquals vs assertSame"}),e.jsxs("p",{children:["Esta é ",e.jsx("strong",{children:"a"})," pegadinha mais comum. Ambos comparam, mas:"]}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"assertEquals"})," usa ",e.jsx("code",{children:"=="})," (faz coerção de tipos)."]}),e.jsxs("li",{children:[e.jsx("code",{children:"assertSame"})," usa ",e.jsx("code",{children:"==="})," (compara tipo E valor)."]})]}),e.jsx(a,{filename:"tests/IgualdadeTest.php",code:`<?php
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
}`,output:`PHPUnit 11.4.3 by Sebastian Bergmann and contributors.

...                                                                 3 / 3 (100%)

Time: 00:00.012, Memory: 8.00 MB

OK (3 tests, 5 assertions)`}),e.jsxs(s,{type:"warning",title:"Prefira assertSame por padrão",children:[e.jsx("code",{children:"assertEquals"})," esconde bugs de tipo. Em código com ",e.jsx("code",{children:"declare(strict_types=1)"}),", praticamente nunca faz sentido aceitar coerção. Use ",e.jsx("code",{children:"assertSame"})," e suas variações estritas (",e.jsx("code",{children:"assertCount"}),", ",e.jsx("code",{children:"assertInstanceOf"}),") sempre que possível."]}),e.jsx("h2",{children:"Data Providers — testando 50 casos com 1 método"}),e.jsxs("p",{children:["Em vez de copiar e colar o mesmo teste para 5 valores diferentes, você fornece os dados via"," ",e.jsx("code",{children:"#[DataProvider]"}),":"]}),e.jsx(a,{filename:"tests/SomaTest.php",code:`<?php
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
}`,output:`PHPUnit 11.4.3 by Sebastian Bergmann and contributors.

.....                                                               5 / 5 (100%)

Time: 00:00.014, Memory: 8.00 MB

OK (5 tests, 5 assertions)`}),e.jsxs("p",{children:["Note duas coisas: o método ",e.jsx("code",{children:"casos()"})," é ",e.jsx("strong",{children:"estático"})," (obrigatório no PHPUnit 10+) e a chave do array vira o nome do caso de teste no relatório, ajudando a localizar falhas: ",e.jsx("code",{children:'test_soma with data set "negativos"'}),"."]}),e.jsx("h2",{children:"setUp e tearDown — preparando o cenário"}),e.jsxs("p",{children:["Quando vários testes precisam do mesmo objeto, instancie em ",e.jsx("code",{children:"setUp()"})," — ele roda"," ",e.jsx("strong",{children:"antes de cada teste"}),". Se precisa limpar (apagar arquivo, fechar conexão), use"," ",e.jsx("code",{children:"tearDown()"}),"."]}),e.jsx(a,{filename:"tests/CarrinhoTest.php",code:`<?php
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
}`,output:`PHPUnit 11.4.3 by Sebastian Bergmann and contributors.

..                                                                  2 / 2 (100%)

OK (2 tests, 2 assertions)`}),e.jsxs(s,{type:"info",title:"Cada teste é um mundo isolado",children:["PHPUnit cria ",e.jsx("strong",{children:"uma nova instância"})," da classe de teste para cada método. Estado em propriedades nunca vaza entre testes — exatamente o que você quer."]}),e.jsx("h2",{children:"Filtrando: rodando só um teste"}),e.jsx(t,{user:"dev",host:"php",cwd:"~/projetos/loja",command:"./vendor/bin/phpunit --filter test_soma",output:`PHPUnit 11.4.3 by Sebastian Bergmann and contributors.

.....                                                               5 / 5 (100%)

Time: 00:00.011, Memory: 8.00 MB

OK (5 tests, 5 assertions)`}),e.jsx(t,{user:"dev",host:"php",cwd:"~/projetos/loja",command:"./vendor/bin/phpunit tests/CarrinhoTest.php",output:`PHPUnit 11.4.3 by Sebastian Bergmann and contributors.

..                                                                  2 / 2 (100%)

OK (2 tests, 2 assertions)`}),e.jsx("h2",{children:"Cobertura de código com Xdebug"}),e.jsxs("p",{children:["Cobertura responde: ",e.jsx("em",{children:"quais linhas do meu código são executadas pelos testes?"})," Para gerar relatório HTML, você precisa do Xdebug (ou pcov) instalado."]}),e.jsx(t,{user:"dev",host:"php",cwd:"~/projetos/loja",command:"XDEBUG_MODE=coverage ./vendor/bin/phpunit --coverage-html coverage",output:`PHPUnit 11.4.3 by Sebastian Bergmann and contributors.

........                                                            8 / 8 (100%)

Time: 00:00.234, Memory: 18.00 MB

OK (8 tests, 12 assertions)

Generating code coverage report in HTML format ... done [00:00.412]`}),e.jsxs("p",{children:["Abra ",e.jsx("code",{children:"coverage/index.html"})," no navegador: cada arquivo aparece colorido, verde nas linhas cobertas, vermelho nas que nenhum teste tocou. É a melhor ferramenta para encontrar “zonas escuras” que precisam de mais testes."]}),e.jsxs(s,{type:"warning",title:"Cobertura não é qualidade",children:["100% de cobertura não significa que seu código está correto — significa apenas que todas as linhas ",e.jsx("em",{children:"executaram"}),". Você pode ter testes que cobrem a linha sem assertar nada de útil. Use cobertura como ",e.jsx("strong",{children:"indicador de áreas não testadas"}),", não como meta absoluta."]}),e.jsx("h2",{children:"Comandos do dia a dia"}),e.jsx(o,{language:"bash",code:`# rodar tudo
./vendor/bin/phpunit

# rodar uma suíte específica
./vendor/bin/phpunit --testsuite default

# rodar só testes que falharam na última execução
./vendor/bin/phpunit --order-by=defects --stop-on-defect

# saída detalhada por teste
./vendor/bin/phpunit --testdox

# parar no primeiro erro
./vendor/bin/phpunit --stop-on-failure`}),e.jsxs("p",{children:["No próximo capítulo a gente conhece o ",e.jsx("strong",{children:"Pest"}),", uma camada moderna em cima do PHPUnit que troca classes e métodos por uma sintaxe quase narrativa — ",e.jsx("code",{children:"it('soma corretamente', fn() => ...)"}),"."]})]})}export{l as default};
