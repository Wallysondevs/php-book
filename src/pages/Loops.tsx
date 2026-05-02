import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Loops() {
  return (
    <PageContainer
      title="Loops"
      subtitle="for, while, do-while e foreach (com chave, valor e por referência), os comandos break N e continue N, e por que foreach resolve quase todos os seus problemas."
      difficulty="iniciante"
      timeToRead="11 min"
      category="Controle de Fluxo"
    >
      <AlertBox type="info" title="Pré-requisitos">
        <p>Antes deste capítulo, é bom já ter visto: <a href="#/operadores" className="text-[#8993BE] underline">Operadores</a>, <a href="#/arrays" className="text-[#8993BE] underline">Arrays</a>, <a href="#/if-else" className="text-[#8993BE] underline">if / elseif / else</a>.</p>
      </AlertBox>

      <p><strong className="text-[#8993BE] font-mono">foreach</strong> — itera sobre arrays e qualquer coisa <code>iterable</code>. Existe porque iterar com índice à mão é chato e propenso a erro. Sintaxe: <code>{`foreach ($arr as $valor) { ... }`}</code> ou <code>{`foreach ($arr as $chave => $valor) { ... }`}</code> quando você precisa também da chave.</p>

      <h2>foreach: o loop que você usa 95% das vezes</h2>
      <p>
        Em PHP moderno, se você está escrevendo <code>for</code> com índice numérico para iterar um array,
        provavelmente está fazendo errado. O <code>foreach</code> existe exatamente para isso, é mais legível,
        funciona com índices numéricos, associativos, objetos iteráveis e geradores.
      </p>

      <PhpBlock
        filename="foreach-basico.php"
        code={`<?php
declare(strict_types=1);

$linguagens = ["PHP", "Python", "Go"];

foreach ($linguagens as $lang) {
    echo "- {$lang}" . PHP_EOL;
}`}
        output={`- PHP
- Python
- Go`}
      />

      <h2>foreach com chave e valor</h2>
      <p>
        Quando o array é associativo (ou você precisa do índice), use a forma <code>$chave =&gt; $valor</code>.
        Funciona em qualquer array, indexado ou não.
      </p>

      <PhpBlock
        filename="foreach-kv.php"
        code={`<?php
declare(strict_types=1);

$config = [
    "host" => "localhost",
    "port" => 5432,
    "user" => "admin",
];

foreach ($config as $chave => $valor) {
    echo str_pad($chave, 6) . " = {$valor}" . PHP_EOL;
}

$frutas = ["maçã", "banana", "pera"];
foreach ($frutas as $i => $f) {
    echo "{$i}: {$f}" . PHP_EOL;
}`}
        output={`host   = localhost
port   = 5432
user   = admin
0: maçã
1: banana
2: pera`}
      />

      <h2>foreach por referência: editando in-place</h2>
      <p>
        Por padrão, <code>$valor</code> dentro do <code>foreach</code> é uma <strong>cópia</strong> — modificar
        ele não muda o array. Se você quer alterar os elementos no lugar, use <code>&amp;$valor</code>.
        E aí vem a pegadinha mais famosa do PHP: <strong>sempre dê unset na variável depois do foreach por referência</strong>.
      </p>

      <PhpBlock
        filename="foreach-ref.php"
        code={`<?php
declare(strict_types=1);

$precos = [10.0, 20.0, 30.0];

foreach ($precos as &$p) {
    $p = $p * 1.1;
}
unset($p);

print_r($precos);`}
        output={`Array
(
    [0] => 11
    [1] => 22
    [2] => 33
)`}
      />

      <AlertBox type="danger" title="A pegadinha do referência sem unset">
        Se você não fizer <code>unset($p)</code> após o foreach por referência, a variável <code>$p</code>
        continua apontando para o último elemento do array. Qualquer atribuição posterior a <code>$p</code> vai{" "}
        <strong>silenciosamente alterar o último item do array</strong>. Já causou bug em projeto sério —
        sempre dê <code>unset</code>.
      </AlertBox>

      <p>
        Se preferir evitar referências (recomendável), reescreva com <code>array_map</code> ou reatribuindo via chave:
      </p>

      <PhpBlock
        filename="foreach-sem-ref.php"
        code={`<?php
declare(strict_types=1);

$precos = [10.0, 20.0, 30.0];

foreach ($precos as $i => $p) {
    $precos[$i] = $p * 1.1;
}

print_r($precos);

$alternativa = array_map(fn(float $p): float => $p * 1.1, [10.0, 20.0, 30.0]);
print_r($alternativa);`}
        output={`Array
(
    [0] => 11
    [1] => 22
    [2] => 33
)
Array
(
    [0] => 11
    [1] => 22
    [2] => 33
)`}
      />

      <h2>for: o clássico com contador</h2>

      <p><strong className="text-[#8993BE] font-mono">for</strong> — loop com contador explícito. Existe quando você precisa controlar o índice manualmente (pular de N em N, contar pra trás). Sintaxe: <code>{`for (init; cond; passo) { ... }`}</code>. As três partes são separadas por <code>;</code> e qualquer uma pode ficar vazia.</p>

      <p>
        O <code>for</code> tem três partes separadas por <code>;</code>: inicialização, condição e incremento.
        Use quando o loop é <strong>baseado em um número</strong>, não em uma coleção.
      </p>

      <PhpBlock
        filename="for.php"
        code={`<?php
declare(strict_types=1);

for ($i = 1; $i <= 5; $i++) {
    echo "Iteração {$i}" . PHP_EOL;
}

for ($i = 10; $i >= 0; $i -= 2) {
    echo $i . " ";
}
echo PHP_EOL;`}
        output={`Iteração 1
Iteração 2
Iteração 3
Iteração 4
Iteração 5
10 8 6 4 2 0 `}
      />

      <AlertBox type="info" title="Quando usar for em vez de foreach">
        Use <code>for</code> quando você está <strong>gerando</strong> uma sequência (ex.: imprimir o cabeçalho
        de uma tabela com 10 colunas), quando precisa pular de N em N, ou quando o índice tem significado
        próprio (não é só "posição no array").
      </AlertBox>

      <h2>while e do-while</h2>

      <p><strong className="text-[#8993BE] font-mono">while</strong> — repete enquanto a condição for verdadeira, testando <em>antes</em> de cada iteração. Existe quando você não sabe quantas voltas vai dar (consumir fila, ler stream). Sintaxe: <code>{`while (cond) { ... }`}</code>. Pode rodar zero vezes se a condição já começar falsa.</p>

      <p><strong className="text-[#8993BE] font-mono">do-while</strong> — irmão do <code>while</code>, mas testa <em>depois</em> de executar. Garante pelo menos uma execução. Sintaxe: <code>{`do { ... } while (cond);`}</code>. Note o <code>;</code> no final — é exigido.</p>

      <p>
        <code>while</code> testa a condição <strong>antes</strong> de executar. <code>do-while</code> executa
        pelo menos uma vez e testa <strong>depois</strong>. Na prática, <code>while</code> aparece quando você
        consome de uma fila ou stream sem saber quantos itens virão.
      </p>

      <PhpBlock
        filename="while.php"
        code={`<?php
declare(strict_types=1);

$fila = ["job-1", "job-2", "job-3"];

while ($fila !== []) {
    $job = array_shift($fila);
    echo "Processando: {$job}" . PHP_EOL;
}
echo "Fila vazia." . PHP_EOL;

$tentativa = 0;
do {
    $tentativa++;
    echo "Tentativa #{$tentativa}" . PHP_EOL;
} while ($tentativa < 3);`}
        output={`Processando: job-1
Processando: job-2
Processando: job-3
Fila vazia.
Tentativa #1
Tentativa #2
Tentativa #3`}
      />

      <AlertBox type="warning" title="while infinito">
        Esquecer de modificar a condição dentro do <code>while</code> trava o script. Em CLI o PHP eventualmente
        atinge o <code>memory_limit</code> ou <code>max_execution_time</code> — em produção isso vira indisponibilidade.
        Sempre que for incerto, coloque uma trava de segurança: <code>{`if (++$i > 1000) break;`}</code>.
      </AlertBox>

      <h2>break e continue</h2>

      <p><strong className="text-[#8993BE] font-mono">break</strong> — interrompe o loop imediatamente, pulando para o código depois dele. Aceita um número (<code>break 2</code>) para sair de N níveis aninhados de uma vez.</p>

      <p><strong className="text-[#8993BE] font-mono">continue</strong> — pula direto para a próxima iteração do loop atual, ignorando o resto do bloco. Também aceita número (<code>continue 2</code>) para pular iterações de loops mais externos.</p>

      <p>
        <code>break</code> sai do loop. <code>continue</code> pula para a próxima iteração. Já vimos eles em
        switch — em loops o uso é o mesmo.
      </p>

      <PhpBlock
        filename="break-continue.php"
        code={`<?php
declare(strict_types=1);

foreach (range(1, 10) as $n) {
    if ($n % 2 === 0) {
        continue;
    }
    if ($n > 7) {
        break;
    }
    echo $n . " ";
}
echo PHP_EOL;`}
        output={`1 3 5 7 `}
      />

      <h2>break N e continue N: saindo de loops aninhados</h2>
      <p>
        Diferente da maioria das linguagens, o PHP aceita um <strong>número</strong> após <code>break</code> ou
        <code> continue</code>. Esse número diz quantos níveis pular. <code>break 2</code> sai do loop atual
        <em> e</em> do loop externo.
      </p>

      <PhpBlock
        filename="break-n.php"
        code={`<?php
declare(strict_types=1);

$matriz = [
    [1, 2, 3],
    [4, 5, 6],
    [7, 8, 9],
];

$alvo = 5;
foreach ($matriz as $i => $linha) {
    foreach ($linha as $j => $valor) {
        if ($valor === $alvo) {
            echo "Encontrado em [{$i}][{$j}]" . PHP_EOL;
            break 2;
        }
    }
}

foreach (range(1, 3) as $linha) {
    foreach (range(1, 3) as $col) {
        if ($col === 2) {
            continue 2;
        }
        echo "L{$linha}C{$col} ";
    }
}
echo PHP_EOL;`}
        output={`Encontrado em [1][1]
L1C1 L2C1 L3C1 `}
      />

      <AlertBox type="success" title="Por que isso é útil">
        A alternativa sem <code>break N</code> é criar uma flag booleana e checar em cada nível
        — código verboso e fácil de errar. <code>break 2</code> resolve em uma palavra. Use com moderação:
        loops com mais de dois níveis aninhados geralmente pedem refatoração para uma função separada.
      </AlertBox>

      <h2>foreach com generators: lazy iteration</h2>
      <p>
        Um <code>foreach</code> não precisa receber array — ele aceita qualquer <code>iterable</code>. Uma
        função com <code>yield</code> vira um generator: produz valores sob demanda, sem alocar tudo na memória
        de uma vez. Ótimo para processar arquivos grandes ou streams.
      </p>

      <PhpBlock
        filename="generator.php"
        code={`<?php
declare(strict_types=1);

function ler(string $arquivo): iterable {
    $h = fopen($arquivo, "r");
    while (($linha = fgets($h)) !== false) {
        yield trim($linha);
    }
    fclose($h);
}

file_put_contents("/tmp/lista.txt", "ada\\nlinus\\ngrace\\n");

foreach (ler("/tmp/lista.txt") as $nome) {
    echo "- {$nome}" . PHP_EOL;
}`}
        output={`- ada
- linus
- grace`}
      />

      <h2>Resumo: qual loop usar?</h2>
      <ul>
        <li><strong>foreach</strong> — iterar arrays, objetos iteráveis e generators. Padrão.</li>
        <li><strong>for</strong> — gerar sequências, pular de N em N, índice tem significado próprio.</li>
        <li><strong>while</strong> — consumir filas/streams enquanto condição valer.</li>
        <li><strong>do-while</strong> — quando precisa rodar pelo menos uma vez (raro, mas existe).</li>
        <li><strong>array_map / array_filter</strong> — quando você quer transformar/filtrar e o foco é o resultado, não o efeito colateral.</li>
      </ul>

      <p>
        Pronto para o próximo nível: vamos sair do controle de fluxo e mergulhar em <strong>funções</strong>,
        que é onde o código deixa de ser script e vira programa de verdade.
      </p>
    </PageContainer>
  );
}
