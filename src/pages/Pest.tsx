import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Pest() {
  return (
    <PageContainer
      title="Pest — testes elegantes"
      subtitle="A mesma engine do PHPUnit, com a sintaxe do Jest. Menos boilerplate, mais expressividade, e um output que dá gosto de olhar."
      difficulty="intermediario"
      timeToRead="12 min"
      category="Testes"
    >
      <AlertBox type="info" title="Pré-requisitos">
          <p>Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP.</p>
        </AlertBox>
        <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"Pest"}</strong> {' — '} {"DSL elegante em cima do PHPUnit."}
          </li>
        <li>
            <strong>{"it(\"...\", fn() => ...)"}</strong> {' — '} {"sintaxe expressiva inspirada no Jest."}
          </li>
        <li>
            <strong>{"expect()"}</strong> {' — '} {"API fluente: expect($x)->toBe(1)->toBeInt()."}
          </li>
        <li>
            <strong>{"Higher Order"}</strong> {' — '} {"encadeia testes sem bloco: it()->expect()->toBe()."}
          </li>
        <li>
            <strong>{"Plugins"}</strong> {' — '} {"pest-faker, pest-laravel, parallel, mutation."}
          </li>
        </ul>
          <h2>O problema: PHPUnit é verboso</h2>
      <p>
        Em PHPUnit, escrever um teste simples exige uma classe, um namespace, um <code>extends TestCase</code>,
        um método com prefixo <code>test_</code> e um <code>$this-&gt;</code>. Para algo que conceitualmente
        é só <em>“dado X, espero Y”</em>, é bastante cerimônia.
      </p>

      <p>O Pest comprime tudo isso em uma linha:</p>

      <PhpBlock
        filename="tests/SomaTest.php (PHPUnit)"
        code={`<?php
declare(strict_types=1);

namespace Tests;

use App\\Calculadora;
use PHPUnit\\Framework\\TestCase;

final class SomaTest extends TestCase
{
    public function test_soma_dois_numeros(): void
    {
        $resultado = (new Calculadora())->somar(2, 3);
        $this->assertSame(5, $resultado);
    }
}`}
      />

      <PhpBlock
        filename="tests/Soma.php (Pest)"
        code={`<?php

use App\\Calculadora;

it('soma dois números', function (): void {
    expect((new Calculadora())->somar(2, 3))->toBe(5);
});`}
      />

      <p>
        Mesma coisa em 3 linhas úteis em vez de 13. Por baixo dos panos, o Pest ainda gera classes e
        roda em cima do PHPUnit — você ganha sintaxe sem perder o ecossistema.
      </p>

      <h2>Instalando</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command="composer require --dev pestphp/pest --with-all-dependencies"
        output={`Using version ^3.5 for pestphp/pest
./composer.json has been updated
Running composer update pestphp/pest
Lock file operations: 8 installs, 0 updates, 0 removals
Writing lock file
Installing dependencies from lock file
Package operations: 8 installs, 0 updates, 0 removals
  - Installing pestphp/pest (v3.5.1): Extracting archive
Generating optimized autoload files`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command="./vendor/bin/pest --init"
        output={`   INFO  Initializing Pest...

  ✓ Created Pest.php
  ✓ Created tests/Pest.php
  ✓ Created tests/Feature/ExampleTest.php
  ✓ Created tests/Unit/ExampleTest.php
  ✓ Updated phpunit.xml`}
      />

      <h2>Anatomia de um teste Pest</h2>
      <p>
        Não tem <code>class</code>, não tem <code>function test_</code>, não tem <code>$this</code>.
        Você descreve o cenário com <code>it('faz tal coisa', fn () =&gt; ...)</code> ou{" "}
        <code>test('descrição', fn () =&gt; ...)</code> — escolha do gosto.
      </p>

      <PhpBlock
        filename="tests/Unit/CalculadoraTest.php"
        code={`<?php

use App\\Calculadora;

beforeEach(function (): void {
    $this->calc = new Calculadora();
});

it('soma dois inteiros', function (): void {
    expect($this->calc->somar(2, 3))->toBe(5);
});

it('lança erro ao dividir por zero', function (): void {
    $this->calc->dividir(10, 0);
})->throws(DivisionByZeroError::class);

it('multiplica e ainda retorna inteiro', function (): void {
    expect($this->calc->multiplicar(4, 5))
        ->toBe(20)
        ->toBeInt();
});`}
        output={`   PASS  Tests\\Unit\\CalculadoraTest
  ✓ it soma dois inteiros                                       0.01s
  ✓ it lança erro ao dividir por zero                           0.01s
  ✓ it multiplica e ainda retorna inteiro                       0.01s

  Tests:    3 passed (4 assertions)
  Duration: 0.04s`}
      />

      <AlertBox type="success" title="Output que importa">
        O Pest mostra a descrição em texto natural (<em>“soma dois inteiros”</em>) em vez de{" "}
        <code>test_soma_dois_inteiros</code>. Quando alguém quebra o teste, a mensagem fica imediatamente
        legível para quem nunca leu o código.
      </AlertBox>

      <h2>A API expect() em cadeia</h2>
      <p>
        O <code>expect($valor)</code> retorna um objeto que aceita <strong>dezenas</strong> de
        verificações encadeáveis. Você descreve um valor por todos os ângulos em uma frase só:
      </p>

      <PhpBlock
        filename="tests/Unit/ExpectTest.php"
        code={`<?php

it('valida um array de produtos', function (): void {
    $produtos = ['café', 'pão', 'manteiga'];

    expect($produtos)
        ->toBeArray()
        ->toHaveCount(3)
        ->toContain('café')
        ->not->toContain('chá');
});

it('valida uma resposta de api', function (): void {
    $resposta = [
        'status' => 'ok',
        'dados'  => ['id' => 42, 'nome' => 'Ada'],
    ];

    expect($resposta)
        ->toBeArray()
        ->toHaveKeys(['status', 'dados'])
        ->and($resposta['dados']['id'])->toBe(42)
        ->and($resposta['dados']['nome'])->toBeString();
});`}
        output={`   PASS  Tests\\Unit\\ExpectTest
  ✓ it valida um array de produtos                              0.01s
  ✓ it valida uma resposta de api                               0.01s

  Tests:    2 passed (8 assertions)
  Duration: 0.03s`}
      />

      <p>
        Métodos comuns: <code>toBe</code>, <code>toEqual</code>, <code>toBeTrue</code>,{" "}
        <code>toBeFalse</code>, <code>toBeNull</code>, <code>toBeArray</code>, <code>toBeString</code>,{" "}
        <code>toBeInt</code>, <code>toBeFloat</code>, <code>toBeInstanceOf</code>, <code>toContain</code>,{" "}
        <code>toHaveCount</code>, <code>toHaveKey</code>, <code>toMatch</code>,{" "}
        <code>toThrow</code>. Tudo prefixado com <code>not-&gt;</code> para inverter.
      </p>

      <h2>describe — agrupando testes relacionados</h2>
      <p>
        Igual ao Jest/RSpec, você pode aninhar contextos com <code>describe()</code>. Útil para
        organizar dezenas de testes da mesma classe:
      </p>

      <PhpBlock
        filename="tests/Unit/CarrinhoTest.php"
        code={`<?php

use App\\Carrinho;

describe('Carrinho de compras', function (): void {
    beforeEach(fn () => $this->carrinho = new Carrinho());

    describe('quando vazio', function (): void {
        it('tem total zero', function (): void {
            expect($this->carrinho->total())->toBe(0.0);
        });

        it('não tem itens', function (): void {
            expect($this->carrinho->itens())->toBeEmpty();
        });
    });

    describe('com itens', function (): void {
        beforeEach(function (): void {
            $this->carrinho->adicionar('café', 12.50);
            $this->carrinho->adicionar('pão', 0.75);
        });

        it('soma o total corretamente', function (): void {
            expect($this->carrinho->total())->toBe(13.25);
        });

        it('lista os itens na ordem inserida', function (): void {
            expect($this->carrinho->itens())
                ->toHaveCount(2)
                ->and($this->carrinho->itens()[0])->toBe('café');
        });
    });
});`}
        output={`   PASS  Tests\\Unit\\CarrinhoTest
  ✓ Carrinho de compras → quando vazio → it tem total zero
  ✓ Carrinho de compras → quando vazio → it não tem itens
  ✓ Carrinho de compras → com itens → it soma o total corretamente
  ✓ Carrinho de compras → com itens → it lista os itens na ordem inserida

  Tests:    4 passed (5 assertions)
  Duration: 0.03s`}
      />

      <h2>Datasets — testando muitos casos sem repetir</h2>
      <p>
        O equivalente Pest do <code>DataProvider</code> do PHPUnit, só que muito mais limpo:
      </p>

      <PhpBlock
        filename="tests/Unit/EmailTest.php"
        code={`<?php

use App\\Validador;

it('aceita emails válidos', function (string $email): void {
    expect(Validador::email($email))->toBeTrue();
})->with([
    'ada@example.com',
    'wallyson.dev@gmail.com',
    'a+filtro@dominio.io',
]);

it('rejeita emails inválidos', function (string $email): void {
    expect(Validador::email($email))->toBeFalse();
})->with([
    'sem-arroba',
    '@semusuario.com',
    'usuario@',
    '',
]);`}
        output={`   PASS  Tests\\Unit\\EmailTest
  ✓ it aceita emails válidos with ('ada@example.com')           0.01s
  ✓ it aceita emails válidos with ('wallyson.dev@gmail.com')    0.01s
  ✓ it aceita emails válidos with ('a+filtro@dominio.io')       0.01s
  ✓ it rejeita emails inválidos with ('sem-arroba')             0.01s
  ✓ it rejeita emails inválidos with ('@semusuario.com')        0.01s
  ✓ it rejeita emails inválidos with ('usuario@')               0.01s
  ✓ it rejeita emails inválidos with ('')                       0.01s

  Tests:    7 passed (7 assertions)
  Duration: 0.07s`}
      />

      <p>
        Datasets também funcionam com arrays multi-coluna, igual o DataProvider:
      </p>

      <PhpBlock
        filename="tests/Unit/SomaTest.php"
        code={`<?php

use App\\Calculadora;

it('soma valores', function (int $a, int $b, int $esperado): void {
    expect((new Calculadora())->somar($a, $b))->toBe($esperado);
})->with([
    'positivos'  => [2, 3, 5],
    'negativos'  => [-1, -1, -2],
    'misturados' => [-5, 10, 5],
]);`}
        output={`   PASS  Tests\\Unit\\SomaTest
  ✓ it soma valores with data set "positivos"                   0.01s
  ✓ it soma valores with data set "negativos"                   0.01s
  ✓ it soma valores with data set "misturados"                  0.01s

  Tests:    3 passed (3 assertions)
  Duration: 0.03s`}
      />

      <h2>Hooks: beforeEach, afterEach, beforeAll, afterAll</h2>
      <CodeBlock
        language="bash"
        code={`beforeAll  → roda 1 vez antes de TODOS os testes do arquivo
beforeEach → roda antes de CADA teste (igual setUp do PHPUnit)
afterEach  → roda depois de CADA teste (igual tearDown)
afterAll   → roda 1 vez depois de TODOS os testes`}
      />

      <h2>Plugins: o ecossistema</h2>
      <p>
        Pest tem plugins oficiais que adicionam superpoderes. Os mais usados:
      </p>
      <ul>
        <li><code>pest-plugin-arch</code> — testes de arquitetura (<em>“nada em src/Domain pode usar nada de Doctrine”</em>).</li>
        <li><code>pest-plugin-faker</code> — integração com a biblioteca Faker para gerar dados.</li>
        <li><code>pest-plugin-mutation</code> — mutation testing para descobrir testes fracos.</li>
        <li><code>pest-plugin-stressless</code> — load testing escrito como teste Pest.</li>
        <li><code>pest-plugin-watch</code> — re-roda os testes ao salvar arquivos.</li>
      </ul>

      <PhpBlock
        filename="tests/ArchTest.php"
        code={`<?php

arch('domínio é puro')
    ->expect('App\\Domain')
    ->not->toUse(['Doctrine', 'Symfony', 'Illuminate']);

arch('controllers só dependem de services')
    ->expect('App\\Http\\Controllers')
    ->toOnlyUse(['App\\Services', 'Psr\\Http']);`}
        output={`   PASS  Tests\\ArchTest
  ✓ arch domínio é puro                                          0.05s
  ✓ arch controllers só dependem de services                     0.04s`}
      />

      <h2>Comparação direta com PHPUnit</h2>
      <CodeBlock
        language="bash"
        code={`PHPUnit                                Pest
─────────────────────────────────────  ─────────────────────────────────
class FooTest extends TestCase {       (nada — só código)
public function test_x(): void {       it('x', function () {
$this->assertSame(2, $r);              expect($r)->toBe(2);
$this->expectException(E::class);      ->throws(E::class)
@dataProvider                          ->with([...])
setUp() / tearDown()                   beforeEach() / afterEach()`}
      />

      <AlertBox type="info" title="Você não precisa migrar tudo">
        Pest e PHPUnit <strong>convivem no mesmo projeto</strong>. O comando <code>./vendor/bin/pest</code>
        roda os dois. Você pode começar a escrever <em>novos</em> testes em Pest e deixar os antigos como
        estão — sem big bang.
      </AlertBox>

      <h2>Rodando</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command="./vendor/bin/pest --parallel --coverage"
        output={`   PASS  Tests\\Unit\\CalculadoraTest
   PASS  Tests\\Unit\\CarrinhoTest
   PASS  Tests\\Unit\\EmailTest

  Tests:    14 passed (32 assertions)
  Duration: 0.21s
  Parallel: 8 processes

  Coverage:  92.4%`}
      />

      <p>
        No próximo capítulo a gente vai fundo em <strong>Mocks e Doubles</strong> — como simular
        dependências externas (banco, HTTP, gateways) para que seus testes rodem em milissegundos sem
        depender da internet.
      </p>
    </PageContainer>
  );
}
