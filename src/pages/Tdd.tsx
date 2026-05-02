import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Tdd() {
  return (
    <PageContainer
      title="TDD na prática"
      subtitle="Test-Driven Development sem religião: o ciclo Red-Green-Refactor aplicado em código PHP real, do FizzBuzz ao parser. Você vai sentir a diferença na primeira meia hora."
      difficulty="avancado"
      timeToRead="14 min"
      category="Testes"
    >
      <h2>O que é TDD (e o que NÃO é)</h2>
      <p>
        TDD é uma <strong>disciplina de design</strong>: você escreve o teste antes do código de
        produção. Não é “ter muitos testes”, não é “100% de cobertura” — é uma sequência muito
        específica de três passos curtos, repetida indefinidamente:
      </p>
      <ol>
        <li><strong>Red</strong> — escreva um teste que falha (e que falha pelo motivo certo).</li>
        <li><strong>Green</strong> — escreva o <em>mínimo</em> de código para o teste passar.</li>
        <li><strong>Refactor</strong> — limpe o código, mantendo todos os testes verdes.</li>
      </ol>

      <AlertBox type="info" title="A lição de Kent Beck">
        Cada ciclo deve durar de 30 segundos a 5 minutos. Se está demorando mais, seu passo é
        grande demais — quebre em fatias menores. TDD é sobre <em>passos pequenos confiantes</em>, não
        sobre escrever especificações elaboradas.
      </AlertBox>

      <h2>Kata clássico: FizzBuzz dirigido por testes</h2>
      <p>
        Regra: para cada número de 1 a N, retorne o número como string. Exceto múltiplos de 3 (“Fizz”),
        múltiplos de 5 (“Buzz”) e múltiplos de ambos (“FizzBuzz”).
      </p>

      <h3>Ciclo 1 — RED: o teste mais simples possível</h3>
      <PhpBlock
        filename="tests/FizzBuzzTest.php"
        code={`<?php
declare(strict_types=1);

namespace Tests;

use App\\FizzBuzz;
use PHPUnit\\Framework\\TestCase;

final class FizzBuzzTest extends TestCase
{
    public function test_um_retorna_um(): void
    {
        $this->assertSame('1', FizzBuzz::para(1));
    }
}`}
        output={`PHPUnit 11.4.3 by Sebastian Bergmann and contributors.

E                                                                   1 / 1 (100%)

There was 1 error:
1) Tests\\FizzBuzzTest::test_um_retorna_um
Error: Class "App\\FizzBuzz" not found

ERRORS! Tests: 1, Assertions: 0, Errors: 1.`}
      />

      <p>O teste falha — perfeito. Agora a quantidade <em>mínima</em> de código para passar:</p>

      <h3>Ciclo 1 — GREEN</h3>
      <PhpBlock
        filename="src/FizzBuzz.php"
        code={`<?php
declare(strict_types=1);

namespace App;

final class FizzBuzz
{
    public static function para(int $n): string
    {
        return '1';
    }
}`}
        output={`OK (1 test, 1 assertion)`}
      />

      <AlertBox type="warning" title='"Mas isso não está certo!"'>
        Está sim — está certo <em>para o teste que existe</em>. A pressão para escrever lógica que ainda
        não foi testada é exatamente o que TDD combate. Se você quer que retorne mais que <code>'1'</code>,
        escreva o próximo teste primeiro.
      </AlertBox>

      <h3>Ciclo 2 — RED + GREEN: o caso 2</h3>
      <PhpBlock
        filename="tests/FizzBuzzTest.php (após mudança)"
        code={`<?php
declare(strict_types=1);

namespace Tests;

use App\\FizzBuzz;
use PHPUnit\\Framework\\Attributes\\DataProvider;
use PHPUnit\\Framework\\TestCase;

final class FizzBuzzTest extends TestCase
{
    #[DataProvider('casosNumericos')]
    public function test_numeros_simples(int $entrada, string $esperado): void
    {
        $this->assertSame($esperado, FizzBuzz::para($entrada));
    }

    public static function casosNumericos(): array
    {
        return [
            [1, '1'],
            [2, '2'],
            [4, '4'],
        ];
    }
}`}
        output={`F                                                                   3 / 3 (33%)

There was 1 failure:
Failed asserting that '1' is identical to '2'.

FAILURES! Tests: 3, Assertions: 3, Failures: 1.`}
      />

      <PhpBlock
        filename="src/FizzBuzz.php"
        code={`<?php
declare(strict_types=1);

namespace App;

final class FizzBuzz
{
    public static function para(int $n): string
    {
        return (string) $n;
    }
}`}
        output={`OK (3 tests, 3 assertions)`}
      />

      <h3>Ciclo 3 — Fizz para múltiplos de 3</h3>
      <PhpBlock
        filename="tests/FizzBuzzTest.php (caso novo)"
        code={`<?php

public function test_multiplo_de_tres_retorna_fizz(): void
{
    $this->assertSame('Fizz', FizzBuzz::para(3));
    $this->assertSame('Fizz', FizzBuzz::para(6));
}`}
        output={`F                                                                   1 / 4 (25%)
Failed asserting that '3' is identical to 'Fizz'.`}
      />

      <PhpBlock
        filename="src/FizzBuzz.php"
        code={`<?php
declare(strict_types=1);

namespace App;

final class FizzBuzz
{
    public static function para(int $n): string
    {
        if ($n % 3 === 0) {
            return 'Fizz';
        }
        return (string) $n;
    }
}`}
        output={`OK (4 tests, 5 assertions)`}
      />

      <h3>Ciclos 4 e 5 — Buzz e FizzBuzz</h3>
      <p>
        Você adiciona <code>test_multiplo_de_cinco</code>, vê falhar, implementa, vê passar. Depois{" "}
        <code>test_multiplo_de_quinze</code>, vê falhar, implementa. O resultado final, em poucos
        minutos:
      </p>

      <PhpBlock
        filename="src/FizzBuzz.php"
        code={`<?php
declare(strict_types=1);

namespace App;

final class FizzBuzz
{
    public static function para(int $n): string
    {
        return match (true) {
            $n % 15 === 0 => 'FizzBuzz',
            $n % 3  === 0 => 'Fizz',
            $n % 5  === 0 => 'Buzz',
            default       => (string) $n,
        };
    }
}`}
        output={`OK (6 tests, 12 assertions)`}
      />

      <p>
        Note como o <code>match</code> só apareceu no <strong>Refactor</strong>, depois que todos os
        testes estavam verdes. Antes disso, era uma sequência de <code>if</code>s — mais feio, mas
        cobrindo o suficiente para evoluir com segurança.
      </p>

      <h2>Exemplo real: parser de moeda dirigido por testes</h2>
      <p>
        Vamos converter strings como <code>"R$ 1.234,56"</code> em centavos. TDD nos força a pensar nos
        casos de borda <em>antes</em> de escrever qualquer código.
      </p>

      <h3>RED — primeira regra</h3>
      <PhpBlock
        filename="tests/MoedaParserTest.php"
        code={`<?php
declare(strict_types=1);

namespace Tests;

use App\\MoedaParser;
use PHPUnit\\Framework\\TestCase;

final class MoedaParserTest extends TestCase
{
    public function test_valor_com_centavos(): void
    {
        $this->assertSame(1056, MoedaParser::paraCentavos('R$ 10,56'));
    }
}`}
        output={`Error: Class "App\\MoedaParser" not found`}
      />

      <h3>GREEN — mínimo absoluto</h3>
      <PhpBlock
        filename="src/MoedaParser.php"
        code={`<?php
declare(strict_types=1);

namespace App;

final class MoedaParser
{
    public static function paraCentavos(string $input): int
    {
        return 1056;
    }
}`}
        output={`OK (1 test, 1 assertion)`}
      />

      <h3>RED — generaliza</h3>
      <PhpBlock
        filename="tests/MoedaParserTest.php"
        code={`<?php

public function test_outros_valores(): void
{
    $this->assertSame(100,    MoedaParser::paraCentavos('R$ 1,00'));
    $this->assertSame(123456, MoedaParser::paraCentavos('R$ 1.234,56'));
    $this->assertSame(50,     MoedaParser::paraCentavos('R$ 0,50'));
}`}
        output={`Failed asserting that 1056 is identical to 100.`}
      />

      <h3>GREEN — implementação real</h3>
      <PhpBlock
        filename="src/MoedaParser.php"
        code={`<?php
declare(strict_types=1);

namespace App;

final class MoedaParser
{
    public static function paraCentavos(string $input): int
    {
        $limpo = preg_replace('/[^\\d,]/', '', $input) ?? '';
        [$reais, $centavos] = explode(',', $limpo . ',00') + ['', '00'];
        return (int) $reais * 100 + (int) substr($centavos . '00', 0, 2);
    }
}`}
        output={`OK (4 tests, 4 assertions)`}
      />

      <h3>RED — caso de borda inesperado</h3>
      <PhpBlock
        filename="tests/MoedaParserTest.php"
        code={`<?php

public function test_string_invalida_lanca_excecao(): void
{
    $this->expectException(\\InvalidArgumentException::class);
    MoedaParser::paraCentavos('abc');
}`}
        output={`Failed asserting that exception of type "InvalidArgumentException" is thrown.`}
      />

      <h3>GREEN — adiciona validação</h3>
      <PhpBlock
        filename="src/MoedaParser.php"
        code={`<?php
declare(strict_types=1);

namespace App;

final class MoedaParser
{
    public static function paraCentavos(string $input): int
    {
        if (!preg_match('/\\d/', $input)) {
            throw new \\InvalidArgumentException("valor inválido: {$input}");
        }
        $limpo = preg_replace('/[^\\d,]/', '', $input) ?? '';
        [$reais, $centavos] = explode(',', $limpo . ',00') + ['', '00'];
        return (int) $reais * 100 + (int) substr($centavos . '00', 0, 2);
    }
}`}
        output={`OK (5 tests, 5 assertions)`}
      />

      <h2>Por que dá certo: design emerge dos testes</h2>
      <p>
        Repare: você não desenhou a classe primeiro e depois testou. Você <strong>descobriu</strong> a
        interface usando-a no teste. <code>MoedaParser::paraCentavos(string): int</code> é o que ficou
        natural escrever no teste — então é a API correta. Em código sem TDD, a tendência é criar uma
        classe gigante com 8 métodos antes de saber se você precisa de algum deles.
      </p>

      <h2>Rodando o ciclo no terminal</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/parser"
        command="./vendor/bin/phpunit --testdox --stop-on-failure"
        output={`PHPUnit 11.4.3 by Sebastian Bergmann and contributors.

Moeda Parser
 ✔ Valor com centavos
 ✔ Outros valores
 ✔ String invalida lanca excecao

Time: 00:00.022, Memory: 8.00 MB

OK (3 tests, 5 assertions)`}
      />

      <p>
        A flag <code>--stop-on-failure</code> casa perfeitamente com TDD: assim que algo quebra,
        você para e conserta — sem deixar uma fila de testes vermelhos acumular.
      </p>

      <h2>TDD vs testes-depois</h2>
      <CodeBlock
        language="bash"
        code={`Testes-depois (TAD)                    TDD
─────────────────────────────────────  ─────────────────────────────────
1. escreve a classe                    1. escreve teste que falha
2. tenta cobrir com testes             2. escreve código mínimo
3. percebe que é difícil testar        3. refatora
4. mocka tudo para tampar buracos      4. próximo ciclo
5. cobertura alta, design ruim         5. design simples, sem dívida`}
      />

      <AlertBox type="warning" title="Cobertura é lagging indicator">
        Cobertura mostra o passado: <em>quanto do meu código está coberto agora</em>. TDD é o leading
        indicator: <em>nenhuma linha existe sem teste, porque o teste veio primeiro</em>. Times com TDD
        atingem 90%+ sem perseguir a métrica — ela é consequência.
      </AlertBox>

      <h2>Os três valores de Kent Beck</h2>
      <p>Em <em>Test-Driven Development by Example</em>, Beck resume:</p>
      <ol>
        <li><strong>Comunicação</strong> — o teste documenta a intenção.</li>
        <li><strong>Simplicidade</strong> — você só escreve o necessário.</li>
        <li><strong>Feedback</strong> — segundos entre uma alteração e saber se quebrou.</li>
      </ol>

      <h2>Quando NÃO usar TDD</h2>
      <ul>
        <li><strong>Spike/protótipo descartável</strong> — quando o objetivo é provar uma ideia em 1 hora e jogar fora.</li>
        <li><strong>Aprendendo uma API nova</strong> — explore primeiro, depois escreva testes para o que decidir manter.</li>
        <li><strong>UI puramente visual</strong> — testes de pixel são caros e quebradiços.</li>
      </ul>

      <p>
        Para <em>tudo o mais</em> que entra em produção e vai ser mantido por mais de uma semana, TDD
        é o melhor investimento de tempo que você pode fazer. Comece pelo próximo bug que precisar
        consertar: escreva um teste que reproduz o bug, veja-o falhar, conserte, veja-o passar. Você
        nunca mais vai regredir naquele caso específico — esse é o efeito composto de TDD.
      </p>

      <p>
        Combine TDD com os capítulos anteriores: <strong>Pest</strong> para sintaxe leve,{" "}
        <strong>Mocks</strong> para isolar dependências externas, <strong>cobertura</strong> como
        verificação final. O resultado é código que você muda sem medo — e essa é a verdadeira
        produtividade de longo prazo.
      </p>
    </PageContainer>
  );
}
