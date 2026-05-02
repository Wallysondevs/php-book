import{j as e}from"./index-Bb4MiiJL.js";import{P as r,A as a,a as s}from"./AlertBox-BpD-xIsb.js";import{T as t}from"./TerminalBlock-DGurMC1r.js";import{C as i}from"./CodeBlock-C3V-qEkN.js";function p(){return e.jsxs(r,{title:"TDD na prática",subtitle:"Test-Driven Development sem religião: o ciclo Red-Green-Refactor aplicado em código PHP real, do FizzBuzz ao parser. Você vai sentir a diferença na primeira meia hora.",difficulty:"avancado",timeToRead:"14 min",category:"Testes",children:[e.jsx("h2",{children:"O que é TDD (e o que NÃO é)"}),e.jsxs("p",{children:["TDD é uma ",e.jsx("strong",{children:"disciplina de design"}),": você escreve o teste antes do código de produção. Não é “ter muitos testes”, não é “100% de cobertura” — é uma sequência muito específica de três passos curtos, repetida indefinidamente:"]}),e.jsxs("ol",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Red"})," — escreva um teste que falha (e que falha pelo motivo certo)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Green"})," — escreva o ",e.jsx("em",{children:"mínimo"})," de código para o teste passar."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Refactor"})," — limpe o código, mantendo todos os testes verdes."]})]}),e.jsxs(a,{type:"info",title:"A lição de Kent Beck",children:["Cada ciclo deve durar de 30 segundos a 5 minutos. Se está demorando mais, seu passo é grande demais — quebre em fatias menores. TDD é sobre ",e.jsx("em",{children:"passos pequenos confiantes"}),", não sobre escrever especificações elaboradas."]}),e.jsx("h2",{children:"Kata clássico: FizzBuzz dirigido por testes"}),e.jsx("p",{children:"Regra: para cada número de 1 a N, retorne o número como string. Exceto múltiplos de 3 (“Fizz”), múltiplos de 5 (“Buzz”) e múltiplos de ambos (“FizzBuzz”)."}),e.jsx("h3",{children:"Ciclo 1 — RED: o teste mais simples possível"}),e.jsx(s,{filename:"tests/FizzBuzzTest.php",code:`<?php
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
}`,output:`PHPUnit 11.4.3 by Sebastian Bergmann and contributors.

E                                                                   1 / 1 (100%)

There was 1 error:
1) Tests\\FizzBuzzTest::test_um_retorna_um
Error: Class "App\\FizzBuzz" not found

ERRORS! Tests: 1, Assertions: 0, Errors: 1.`}),e.jsxs("p",{children:["O teste falha — perfeito. Agora a quantidade ",e.jsx("em",{children:"mínima"})," de código para passar:"]}),e.jsx("h3",{children:"Ciclo 1 — GREEN"}),e.jsx(s,{filename:"src/FizzBuzz.php",code:`<?php
declare(strict_types=1);

namespace App;

final class FizzBuzz
{
    public static function para(int $n): string
    {
        return '1';
    }
}`,output:"OK (1 test, 1 assertion)"}),e.jsxs(a,{type:"warning",title:'"Mas isso não está certo!"',children:["Está sim — está certo ",e.jsx("em",{children:"para o teste que existe"}),". A pressão para escrever lógica que ainda não foi testada é exatamente o que TDD combate. Se você quer que retorne mais que ",e.jsx("code",{children:"'1'"}),", escreva o próximo teste primeiro."]}),e.jsx("h3",{children:"Ciclo 2 — RED + GREEN: o caso 2"}),e.jsx(s,{filename:"tests/FizzBuzzTest.php (após mudança)",code:`<?php
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
}`,output:`F                                                                   3 / 3 (33%)

There was 1 failure:
Failed asserting that '1' is identical to '2'.

FAILURES! Tests: 3, Assertions: 3, Failures: 1.`}),e.jsx(s,{filename:"src/FizzBuzz.php",code:`<?php
declare(strict_types=1);

namespace App;

final class FizzBuzz
{
    public static function para(int $n): string
    {
        return (string) $n;
    }
}`,output:"OK (3 tests, 3 assertions)"}),e.jsx("h3",{children:"Ciclo 3 — Fizz para múltiplos de 3"}),e.jsx(s,{filename:"tests/FizzBuzzTest.php (caso novo)",code:`<?php

public function test_multiplo_de_tres_retorna_fizz(): void
{
    $this->assertSame('Fizz', FizzBuzz::para(3));
    $this->assertSame('Fizz', FizzBuzz::para(6));
}`,output:`F                                                                   1 / 4 (25%)
Failed asserting that '3' is identical to 'Fizz'.`}),e.jsx(s,{filename:"src/FizzBuzz.php",code:`<?php
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
}`,output:"OK (4 tests, 5 assertions)"}),e.jsx("h3",{children:"Ciclos 4 e 5 — Buzz e FizzBuzz"}),e.jsxs("p",{children:["Você adiciona ",e.jsx("code",{children:"test_multiplo_de_cinco"}),", vê falhar, implementa, vê passar. Depois"," ",e.jsx("code",{children:"test_multiplo_de_quinze"}),", vê falhar, implementa. O resultado final, em poucos minutos:"]}),e.jsx(s,{filename:"src/FizzBuzz.php",code:`<?php
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
}`,output:"OK (6 tests, 12 assertions)"}),e.jsxs("p",{children:["Note como o ",e.jsx("code",{children:"match"})," só apareceu no ",e.jsx("strong",{children:"Refactor"}),", depois que todos os testes estavam verdes. Antes disso, era uma sequência de ",e.jsx("code",{children:"if"}),"s — mais feio, mas cobrindo o suficiente para evoluir com segurança."]}),e.jsx("h2",{children:"Exemplo real: parser de moeda dirigido por testes"}),e.jsxs("p",{children:["Vamos converter strings como ",e.jsx("code",{children:'"R$ 1.234,56"'})," em centavos. TDD nos força a pensar nos casos de borda ",e.jsx("em",{children:"antes"})," de escrever qualquer código."]}),e.jsx("h3",{children:"RED — primeira regra"}),e.jsx(s,{filename:"tests/MoedaParserTest.php",code:`<?php
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
}`,output:'Error: Class "App\\MoedaParser" not found'}),e.jsx("h3",{children:"GREEN — mínimo absoluto"}),e.jsx(s,{filename:"src/MoedaParser.php",code:`<?php
declare(strict_types=1);

namespace App;

final class MoedaParser
{
    public static function paraCentavos(string $input): int
    {
        return 1056;
    }
}`,output:"OK (1 test, 1 assertion)"}),e.jsx("h3",{children:"RED — generaliza"}),e.jsx(s,{filename:"tests/MoedaParserTest.php",code:`<?php

public function test_outros_valores(): void
{
    $this->assertSame(100,    MoedaParser::paraCentavos('R$ 1,00'));
    $this->assertSame(123456, MoedaParser::paraCentavos('R$ 1.234,56'));
    $this->assertSame(50,     MoedaParser::paraCentavos('R$ 0,50'));
}`,output:"Failed asserting that 1056 is identical to 100."}),e.jsx("h3",{children:"GREEN — implementação real"}),e.jsx(s,{filename:"src/MoedaParser.php",code:`<?php
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
}`,output:"OK (4 tests, 4 assertions)"}),e.jsx("h3",{children:"RED — caso de borda inesperado"}),e.jsx(s,{filename:"tests/MoedaParserTest.php",code:`<?php

public function test_string_invalida_lanca_excecao(): void
{
    $this->expectException(\\InvalidArgumentException::class);
    MoedaParser::paraCentavos('abc');
}`,output:'Failed asserting that exception of type "InvalidArgumentException" is thrown.'}),e.jsx("h3",{children:"GREEN — adiciona validação"}),e.jsx(s,{filename:"src/MoedaParser.php",code:`<?php
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
}`,output:"OK (5 tests, 5 assertions)"}),e.jsx("h2",{children:"Por que dá certo: design emerge dos testes"}),e.jsxs("p",{children:["Repare: você não desenhou a classe primeiro e depois testou. Você ",e.jsx("strong",{children:"descobriu"})," a interface usando-a no teste. ",e.jsx("code",{children:"MoedaParser::paraCentavos(string): int"})," é o que ficou natural escrever no teste — então é a API correta. Em código sem TDD, a tendência é criar uma classe gigante com 8 métodos antes de saber se você precisa de algum deles."]}),e.jsx("h2",{children:"Rodando o ciclo no terminal"}),e.jsx(t,{user:"dev",host:"php",cwd:"~/projetos/parser",command:"./vendor/bin/phpunit --testdox --stop-on-failure",output:`PHPUnit 11.4.3 by Sebastian Bergmann and contributors.

Moeda Parser
 ✔ Valor com centavos
 ✔ Outros valores
 ✔ String invalida lanca excecao

Time: 00:00.022, Memory: 8.00 MB

OK (3 tests, 5 assertions)`}),e.jsxs("p",{children:["A flag ",e.jsx("code",{children:"--stop-on-failure"})," casa perfeitamente com TDD: assim que algo quebra, você para e conserta — sem deixar uma fila de testes vermelhos acumular."]}),e.jsx("h2",{children:"TDD vs testes-depois"}),e.jsx(i,{language:"bash",code:`Testes-depois (TAD)                    TDD
─────────────────────────────────────  ─────────────────────────────────
1. escreve a classe                    1. escreve teste que falha
2. tenta cobrir com testes             2. escreve código mínimo
3. percebe que é difícil testar        3. refatora
4. mocka tudo para tampar buracos      4. próximo ciclo
5. cobertura alta, design ruim         5. design simples, sem dívida`}),e.jsxs(a,{type:"warning",title:"Cobertura é lagging indicator",children:["Cobertura mostra o passado: ",e.jsx("em",{children:"quanto do meu código está coberto agora"}),". TDD é o leading indicator: ",e.jsx("em",{children:"nenhuma linha existe sem teste, porque o teste veio primeiro"}),". Times com TDD atingem 90%+ sem perseguir a métrica — ela é consequência."]}),e.jsx("h2",{children:"Os três valores de Kent Beck"}),e.jsxs("p",{children:["Em ",e.jsx("em",{children:"Test-Driven Development by Example"}),", Beck resume:"]}),e.jsxs("ol",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Comunicação"})," — o teste documenta a intenção."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Simplicidade"})," — você só escreve o necessário."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Feedback"})," — segundos entre uma alteração e saber se quebrou."]})]}),e.jsx("h2",{children:"Quando NÃO usar TDD"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Spike/protótipo descartável"})," — quando o objetivo é provar uma ideia em 1 hora e jogar fora."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Aprendendo uma API nova"})," — explore primeiro, depois escreva testes para o que decidir manter."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"UI puramente visual"})," — testes de pixel são caros e quebradiços."]})]}),e.jsxs("p",{children:["Para ",e.jsx("em",{children:"tudo o mais"})," que entra em produção e vai ser mantido por mais de uma semana, TDD é o melhor investimento de tempo que você pode fazer. Comece pelo próximo bug que precisar consertar: escreva um teste que reproduz o bug, veja-o falhar, conserte, veja-o passar. Você nunca mais vai regredir naquele caso específico — esse é o efeito composto de TDD."]}),e.jsxs("p",{children:["Combine TDD com os capítulos anteriores: ",e.jsx("strong",{children:"Pest"})," para sintaxe leve,"," ",e.jsx("strong",{children:"Mocks"})," para isolar dependências externas, ",e.jsx("strong",{children:"cobertura"})," como verificação final. O resultado é código que você muda sem medo — e essa é a verdadeira produtividade de longo prazo."]})]})}export{p as default};
