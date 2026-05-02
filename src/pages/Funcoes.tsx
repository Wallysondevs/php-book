import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Funcoes() {
  return (
    <PageContainer
      title="Funções básicas"
      subtitle="Como declarar funções em PHP, passar parâmetros, retornar valores e por que toda função vive no seu próprio mundo isolado."
      difficulty="iniciante"
      timeToRead="10 min"
      category="Funções"
    >
      <AlertBox type="info" title="Pré-requisitos">
        <p>Antes deste capítulo, é bom já ter visto: <a href="#/variaveis" className="text-[#8993BE] underline">Variáveis</a>, <a href="#/operadores" className="text-[#8993BE] underline">Operadores</a>, <a href="#/if-else" className="text-[#8993BE] underline">if / elseif / else</a>.</p>
      </AlertBox>

      <p><strong className="text-[#8993BE] font-mono">function</strong> — declara uma função (bloco de código nomeado e reutilizável). Existe para você não copiar-e-colar a mesma lógica em três lugares. Sintaxe: <code>{`function nome(params): tipo { ... }`}</code>. O nome segue as mesmas regras de variável (sem o <code>$</code>) e funções em PHP são case-insensitive.</p>

      <p><strong className="text-[#8993BE] font-mono">return</strong> — devolve um valor para quem chamou a função e <strong>encerra a execução imediatamente</strong>. Tudo depois de um <code>return</code> que disparou é ignorado. Sem <code>return</code> (ou usando ele sozinho), a função devolve <code>null</code>.</p>

      <h2>O problema: código que se repete</h2>
      <p>
        Imagine que você precisa formatar o nome completo de um usuário em três telas diferentes do
        seu sistema. Copiar e colar a mesma lógica em três lugares é um convite para bugs: o dia que
        a regra mudar, você vai esquecer de uma das cópias. <strong>Funções</strong> existem
        exatamente para resolver isso — você dá um nome para um bloco de código e passa a chamá-lo
        sempre que precisar.
      </p>

      <PhpBlock
        filename="saudacao.php"
        code={`<?php
declare(strict_types=1);

function saudar(string $nome): string {
    return "Olá, {$nome}! Bem-vindo(a).";
}

echo saudar("Wallyson") . PHP_EOL;
echo saudar("Ada") . PHP_EOL;
echo saudar("Linus") . PHP_EOL;`}
        output={`Olá, Wallyson! Bem-vindo(a).
Olá, Ada! Bem-vindo(a).
Olá, Linus! Bem-vindo(a).`}
      />

      <p>
        A palavra-chave <code>function</code> declara uma função. O nome
        (<code>saudar</code>) segue as mesmas regras de uma variável — só que sem o cifrão.
        Os <strong>parâmetros</strong> ficam entre parênteses e podem ter type hint
        (<code>string $nome</code>). O <strong>tipo de retorno</strong> vem depois dos dois pontos
        (<code>: string</code>). E <code>return</code> devolve o valor para quem chamou.
      </p>

      <h2>Parâmetros, retorno e o caminho de volta</h2>
      <p>
        Uma função pode receber zero, um ou vários parâmetros e devolver no máximo <em>um</em> valor.
        Se ela não tiver <code>return</code>, ela retorna <code>null</code> implicitamente. E
        atenção: a primeira instrução <code>return</code> que executar <strong>encerra a função na
        hora</strong> — qualquer código depois é ignorado.
      </p>

      <PhpBlock
        filename="calculos.php"
        code={`<?php
declare(strict_types=1);

function somar(int $a, int $b): int {
    return $a + $b;
}

function dividir(float $a, float $b): float {
    if ($b === 0.0) {
        return 0.0; // sai aqui — nada abaixo executa
    }
    return $a / $b;
}

echo "3 + 4 = " . somar(3, 4) . PHP_EOL;
echo "10 / 4 = " . dividir(10, 4) . PHP_EOL;
echo "10 / 0 = " . dividir(10, 0) . PHP_EOL;`}
        output={`3 + 4 = 7
10 / 4 = 2.5
10 / 0 = 0`}
      />

      <AlertBox type="info" title="Função sem retorno explícito">
        Use o tipo de retorno <code>void</code> quando a função existe só pelo efeito colateral
        (logar, salvar, imprimir). Veremos isso em detalhes no capítulo de Type Hints.
      </AlertBox>

      <h2>Escopo: cada função é uma ilha</h2>
      <p>
        Esta é a parte que pega muito iniciante de surpresa. Em PHP, <strong>variáveis declaradas
        fora de uma função NÃO são visíveis dentro dela</strong>. Cada função tem seu próprio
        escopo, isolado do resto do programa.
      </p>

      <PhpBlock
        filename="escopo.php"
        code={`<?php
declare(strict_types=1);

$mensagem = "olá do escopo global";

function imprimir(): void {
    // $mensagem NÃO existe aqui dentro
    echo $mensagem ?? "(variável não definida)";
}

imprimir();
echo PHP_EOL;
echo $mensagem; // aqui ainda existe`}
        output={`(variável não definida)
olá do escopo global`}
      />

      <p>
        Esse isolamento é uma <em>feature</em>, não um bug: ele torna funções previsíveis. A regra
        de ouro é simples — <strong>se a função precisa de um dado, passe como parâmetro</strong>.
        Evite a palavra-chave <code>global</code>, que existe por motivos históricos mas é
        considerada má prática em código moderno.
      </p>

      <PhpBlock
        filename="escopo-correto.php"
        code={`<?php
declare(strict_types=1);

$mensagem = "olá do escopo global";

function imprimir(string $texto): void {
    echo $texto;
}

imprimir($mensagem);`}
        output={`olá do escopo global`}
      />

      <h2>Funções dentro de funções</h2>
      <p>
        PHP permite declarar uma função <em>dentro</em> de outra. Mas atenção a uma pegadinha
        importante: a função interna só passa a existir <strong>depois que a função externa for
        chamada</strong>. E ela vira global a partir daí.
      </p>

      <PhpBlock
        filename="aninhada.php"
        code={`<?php
declare(strict_types=1);

function externa(): void {
    function interna(): string {
        return "fui criada agora";
    }
}

// interna() ainda não existe — externa() nunca foi chamada
echo function_exists("interna") ? "sim" : "nao";
echo PHP_EOL;

externa(); // agora interna() é registrada globalmente
echo function_exists("interna") ? "sim" : "nao";
echo PHP_EOL;
echo interna();`}
        output={`nao
sim
fui criada agora`}
      />

      <AlertBox type="warning" title="Não chame externa() duas vezes">
        Como <code>interna()</code> é registrada na segunda chamada, você teria um <em>fatal
        error</em> de função já declarada. Para esse tipo de cenário (função local de verdade),
        use Closures — assunto do capítulo Arrow Functions e Closures.
      </AlertBox>

      <h2>function_exists: descobrindo se algo já foi declarado</h2>
      <p>
        Quando você está escrevendo código que pode rodar em ambientes diferentes (com extensões
        opcionais, por exemplo), <code>function_exists()</code> permite verificar se uma função
        está disponível antes de chamá-la. Ela aceita uma string com o nome.
      </p>

      <PhpBlock
        filename="checagem.php"
        code={`<?php
declare(strict_types=1);

if (function_exists("mb_strtoupper")) {
    echo mb_strtoupper("olá, mundo!", "UTF-8");
} else {
    echo strtoupper("ola, mundo!"); // fallback ASCII
}
echo PHP_EOL;

// também serve para suas próprias funções
function ajudar(): string {
    return "estou aqui";
}

var_dump(function_exists("ajudar"));
var_dump(function_exists("nao_existe"));`}
        output={`OLÁ, MUNDO!
bool(true)
bool(false)`}
      />

      <h2>Função como string: o "callable"</h2>
      <p>
        Em PHP, o nome de uma função em forma de string é um <strong>callable</strong> — pode ser
        passado adiante e invocado. É assim que funções nativas como <code>array_map</code> e{" "}
        <code>usort</code> recebem comportamento customizado.
      </p>

      <PhpBlock
        filename="callable.php"
        code={`<?php
declare(strict_types=1);

function dobrar(int $n): int {
    return $n * 2;
}

// passando o nome como string
$resultado = array_map("dobrar", [1, 2, 3, 4]);
print_r($resultado);

// chamando dinamicamente pelo nome
$nomeFn = "dobrar";
echo $nomeFn(10) . PHP_EOL;

// PHP 8.1+: sintaxe first-class (preferida)
$fn = dobrar(...);
echo $fn(7) . PHP_EOL;`}
        output={`Array
(
    [0] => 2
    [1] => 4
    [2] => 6
    [3] => 8
)
20
14`}
      />

      <AlertBox type="success" title="Sintaxe first-class callable (PHP 8.1+)">
        A forma <code>dobrar(...)</code> com três pontos é o jeito moderno e seguro de pegar uma
        referência para uma função. Ela é checada em tempo de compilação (você descobre o erro na
        hora se digitar errado) e funciona com métodos, closures e até funções nativas:
        <code>strlen(...)</code>.
      </AlertBox>

      <h2>Rodando os exemplos</h2>
      <p>
        Salve qualquer um dos exemplos acima em um arquivo e execute pelo CLI do PHP. Não precisa de
        servidor web — funções são lógica pura.
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos"
        command="php saudacao.php"
        output={`Olá, Wallyson! Bem-vindo(a).
Olá, Ada! Bem-vindo(a).
Olá, Linus! Bem-vindo(a).`}
      />

      <h2>Boas práticas em uma frase</h2>
      <ul>
        <li>Uma função faz <strong>uma coisa</strong>. Se o nome tem "e" no meio, divida.</li>
        <li>Use <code>declare(strict_types=1);</code> e sempre tipe parâmetros e retorno.</li>
        <li>Nunca dependa de variáveis globais. Passe tudo como parâmetro.</li>
        <li>Prefira <code>nome(...)</code> a strings quando passar funções adiante.</li>
      </ul>

      <p>
        No próximo capítulo a gente aprofunda nos <strong>type hints e return types</strong>: union
        types, intersection types, <code>void</code>, <code>never</code> e o tal do{" "}
        <code>strict_types</code> que você já viu rondando os exemplos.
      </p>
    </PageContainer>
  );
}
