import{j as e}from"./index-Bb4MiiJL.js";import{P as a,a as s,A as o}from"./AlertBox-BpD-xIsb.js";import{T as t}from"./TerminalBlock-DGurMC1r.js";import{C as i}from"./CodeBlock-C3V-qEkN.js";function l(){return e.jsxs(a,{title:"Pest — testes elegantes",subtitle:"A mesma engine do PHPUnit, com a sintaxe do Jest. Menos boilerplate, mais expressividade, e um output que dá gosto de olhar.",difficulty:"intermediario",timeToRead:"12 min",category:"Testes",children:[e.jsx("h2",{children:"O problema: PHPUnit é verboso"}),e.jsxs("p",{children:["Em PHPUnit, escrever um teste simples exige uma classe, um namespace, um ",e.jsx("code",{children:"extends TestCase"}),", um método com prefixo ",e.jsx("code",{children:"test_"})," e um ",e.jsx("code",{children:"$this->"}),". Para algo que conceitualmente é só ",e.jsx("em",{children:"“dado X, espero Y”"}),", é bastante cerimônia."]}),e.jsx("p",{children:"O Pest comprime tudo isso em uma linha:"}),e.jsx(s,{filename:"tests/SomaTest.php (PHPUnit)",code:`<?php
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
}`}),e.jsx(s,{filename:"tests/Soma.php (Pest)",code:`<?php

use App\\Calculadora;

it('soma dois números', function (): void {
    expect((new Calculadora())->somar(2, 3))->toBe(5);
});`}),e.jsx("p",{children:"Mesma coisa em 3 linhas úteis em vez de 13. Por baixo dos panos, o Pest ainda gera classes e roda em cima do PHPUnit — você ganha sintaxe sem perder o ecossistema."}),e.jsx("h2",{children:"Instalando"}),e.jsx(t,{user:"dev",host:"php",cwd:"~/projetos/loja",command:"composer require --dev pestphp/pest --with-all-dependencies",output:`Using version ^3.5 for pestphp/pest
./composer.json has been updated
Running composer update pestphp/pest
Lock file operations: 8 installs, 0 updates, 0 removals
Writing lock file
Installing dependencies from lock file
Package operations: 8 installs, 0 updates, 0 removals
  - Installing pestphp/pest (v3.5.1): Extracting archive
Generating optimized autoload files`}),e.jsx(t,{user:"dev",host:"php",cwd:"~/projetos/loja",command:"./vendor/bin/pest --init",output:`   INFO  Initializing Pest...

  ✓ Created Pest.php
  ✓ Created tests/Pest.php
  ✓ Created tests/Feature/ExampleTest.php
  ✓ Created tests/Unit/ExampleTest.php
  ✓ Updated phpunit.xml`}),e.jsx("h2",{children:"Anatomia de um teste Pest"}),e.jsxs("p",{children:["Não tem ",e.jsx("code",{children:"class"}),", não tem ",e.jsx("code",{children:"function test_"}),", não tem ",e.jsx("code",{children:"$this"}),". Você descreve o cenário com ",e.jsx("code",{children:"it('faz tal coisa', fn () => ...)"})," ou"," ",e.jsx("code",{children:"test('descrição', fn () => ...)"})," — escolha do gosto."]}),e.jsx(s,{filename:"tests/Unit/CalculadoraTest.php",code:`<?php

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
});`,output:`   PASS  Tests\\Unit\\CalculadoraTest
  ✓ it soma dois inteiros                                       0.01s
  ✓ it lança erro ao dividir por zero                           0.01s
  ✓ it multiplica e ainda retorna inteiro                       0.01s

  Tests:    3 passed (4 assertions)
  Duration: 0.04s`}),e.jsxs(o,{type:"success",title:"Output que importa",children:["O Pest mostra a descrição em texto natural (",e.jsx("em",{children:"“soma dois inteiros”"}),") em vez de"," ",e.jsx("code",{children:"test_soma_dois_inteiros"}),". Quando alguém quebra o teste, a mensagem fica imediatamente legível para quem nunca leu o código."]}),e.jsx("h2",{children:"A API expect() em cadeia"}),e.jsxs("p",{children:["O ",e.jsx("code",{children:"expect($valor)"})," retorna um objeto que aceita ",e.jsx("strong",{children:"dezenas"})," de verificações encadeáveis. Você descreve um valor por todos os ângulos em uma frase só:"]}),e.jsx(s,{filename:"tests/Unit/ExpectTest.php",code:`<?php

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
});`,output:`   PASS  Tests\\Unit\\ExpectTest
  ✓ it valida um array de produtos                              0.01s
  ✓ it valida uma resposta de api                               0.01s

  Tests:    2 passed (8 assertions)
  Duration: 0.03s`}),e.jsxs("p",{children:["Métodos comuns: ",e.jsx("code",{children:"toBe"}),", ",e.jsx("code",{children:"toEqual"}),", ",e.jsx("code",{children:"toBeTrue"}),","," ",e.jsx("code",{children:"toBeFalse"}),", ",e.jsx("code",{children:"toBeNull"}),", ",e.jsx("code",{children:"toBeArray"}),", ",e.jsx("code",{children:"toBeString"}),","," ",e.jsx("code",{children:"toBeInt"}),", ",e.jsx("code",{children:"toBeFloat"}),", ",e.jsx("code",{children:"toBeInstanceOf"}),", ",e.jsx("code",{children:"toContain"}),","," ",e.jsx("code",{children:"toHaveCount"}),", ",e.jsx("code",{children:"toHaveKey"}),", ",e.jsx("code",{children:"toMatch"}),","," ",e.jsx("code",{children:"toThrow"}),". Tudo prefixado com ",e.jsx("code",{children:"not->"})," para inverter."]}),e.jsx("h2",{children:"describe — agrupando testes relacionados"}),e.jsxs("p",{children:["Igual ao Jest/RSpec, você pode aninhar contextos com ",e.jsx("code",{children:"describe()"}),". Útil para organizar dezenas de testes da mesma classe:"]}),e.jsx(s,{filename:"tests/Unit/CarrinhoTest.php",code:`<?php

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
});`,output:`   PASS  Tests\\Unit\\CarrinhoTest
  ✓ Carrinho de compras → quando vazio → it tem total zero
  ✓ Carrinho de compras → quando vazio → it não tem itens
  ✓ Carrinho de compras → com itens → it soma o total corretamente
  ✓ Carrinho de compras → com itens → it lista os itens na ordem inserida

  Tests:    4 passed (5 assertions)
  Duration: 0.03s`}),e.jsx("h2",{children:"Datasets — testando muitos casos sem repetir"}),e.jsxs("p",{children:["O equivalente Pest do ",e.jsx("code",{children:"DataProvider"})," do PHPUnit, só que muito mais limpo:"]}),e.jsx(s,{filename:"tests/Unit/EmailTest.php",code:`<?php

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
]);`,output:`   PASS  Tests\\Unit\\EmailTest
  ✓ it aceita emails válidos with ('ada@example.com')           0.01s
  ✓ it aceita emails válidos with ('wallyson.dev@gmail.com')    0.01s
  ✓ it aceita emails válidos with ('a+filtro@dominio.io')       0.01s
  ✓ it rejeita emails inválidos with ('sem-arroba')             0.01s
  ✓ it rejeita emails inválidos with ('@semusuario.com')        0.01s
  ✓ it rejeita emails inválidos with ('usuario@')               0.01s
  ✓ it rejeita emails inválidos with ('')                       0.01s

  Tests:    7 passed (7 assertions)
  Duration: 0.07s`}),e.jsx("p",{children:"Datasets também funcionam com arrays multi-coluna, igual o DataProvider:"}),e.jsx(s,{filename:"tests/Unit/SomaTest.php",code:`<?php

use App\\Calculadora;

it('soma valores', function (int $a, int $b, int $esperado): void {
    expect((new Calculadora())->somar($a, $b))->toBe($esperado);
})->with([
    'positivos'  => [2, 3, 5],
    'negativos'  => [-1, -1, -2],
    'misturados' => [-5, 10, 5],
]);`,output:`   PASS  Tests\\Unit\\SomaTest
  ✓ it soma valores with data set "positivos"                   0.01s
  ✓ it soma valores with data set "negativos"                   0.01s
  ✓ it soma valores with data set "misturados"                  0.01s

  Tests:    3 passed (3 assertions)
  Duration: 0.03s`}),e.jsx("h2",{children:"Hooks: beforeEach, afterEach, beforeAll, afterAll"}),e.jsx(i,{language:"bash",code:`beforeAll  → roda 1 vez antes de TODOS os testes do arquivo
beforeEach → roda antes de CADA teste (igual setUp do PHPUnit)
afterEach  → roda depois de CADA teste (igual tearDown)
afterAll   → roda 1 vez depois de TODOS os testes`}),e.jsx("h2",{children:"Plugins: o ecossistema"}),e.jsx("p",{children:"Pest tem plugins oficiais que adicionam superpoderes. Os mais usados:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"pest-plugin-arch"})," — testes de arquitetura (",e.jsx("em",{children:"“nada em src/Domain pode usar nada de Doctrine”"}),")."]}),e.jsxs("li",{children:[e.jsx("code",{children:"pest-plugin-faker"})," — integração com a biblioteca Faker para gerar dados."]}),e.jsxs("li",{children:[e.jsx("code",{children:"pest-plugin-mutation"})," — mutation testing para descobrir testes fracos."]}),e.jsxs("li",{children:[e.jsx("code",{children:"pest-plugin-stressless"})," — load testing escrito como teste Pest."]}),e.jsxs("li",{children:[e.jsx("code",{children:"pest-plugin-watch"})," — re-roda os testes ao salvar arquivos."]})]}),e.jsx(s,{filename:"tests/ArchTest.php",code:`<?php

arch('domínio é puro')
    ->expect('App\\Domain')
    ->not->toUse(['Doctrine', 'Symfony', 'Illuminate']);

arch('controllers só dependem de services')
    ->expect('App\\Http\\Controllers')
    ->toOnlyUse(['App\\Services', 'Psr\\Http']);`,output:`   PASS  Tests\\ArchTest
  ✓ arch domínio é puro                                          0.05s
  ✓ arch controllers só dependem de services                     0.04s`}),e.jsx("h2",{children:"Comparação direta com PHPUnit"}),e.jsx(i,{language:"bash",code:`PHPUnit                                Pest
─────────────────────────────────────  ─────────────────────────────────
class FooTest extends TestCase {       (nada — só código)
public function test_x(): void {       it('x', function () {
$this->assertSame(2, $r);              expect($r)->toBe(2);
$this->expectException(E::class);      ->throws(E::class)
@dataProvider                          ->with([...])
setUp() / tearDown()                   beforeEach() / afterEach()`}),e.jsxs(o,{type:"info",title:"Você não precisa migrar tudo",children:["Pest e PHPUnit ",e.jsx("strong",{children:"convivem no mesmo projeto"}),". O comando ",e.jsx("code",{children:"./vendor/bin/pest"}),"roda os dois. Você pode começar a escrever ",e.jsx("em",{children:"novos"})," testes em Pest e deixar os antigos como estão — sem big bang."]}),e.jsx("h2",{children:"Rodando"}),e.jsx(t,{user:"dev",host:"php",cwd:"~/projetos/loja",command:"./vendor/bin/pest --parallel --coverage",output:`   PASS  Tests\\Unit\\CalculadoraTest
   PASS  Tests\\Unit\\CarrinhoTest
   PASS  Tests\\Unit\\EmailTest

  Tests:    14 passed (32 assertions)
  Duration: 0.21s
  Parallel: 8 processes

  Coverage:  92.4%`}),e.jsxs("p",{children:["No próximo capítulo a gente vai fundo em ",e.jsx("strong",{children:"Mocks e Doubles"})," — como simular dependências externas (banco, HTTP, gateways) para que seus testes rodem em milissegundos sem depender da internet."]})]})}export{l as default};
