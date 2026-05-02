import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Variaveis() {
  return (
    <PageContainer
      title="Variáveis e escopo"
      subtitle="Por que toda variável em PHP começa com $, como o escopo realmente funciona (spoiler: não é igual a outras linguagens) e as funções que você vai usar todo dia para lidar com elas."
      difficulty="iniciante"
      timeToRead="10 min"
      category="Sintaxe Básica"
    >
      <AlertBox type="info" title="Pré-requisitos">
        <p>Antes deste capítulo, é bom já ter visto: <a href="#/sintaxe" className="text-[#8993BE] underline">Sintaxe básica</a>.</p>
      </AlertBox>

      <h2>O cifrão não é decoração</h2>
      <p>
        Em PHP, <strong>toda variável começa com <code>$</code></strong>. Isso não é estilo:
        é parte da sintaxe que o parser usa para distinguir variáveis de funções, constantes e
        palavras-chave. Sem o <code>$</code>, o PHP acha que você está chamando uma constante.
      </p>

      <PhpBlock
        filename="cifrao.php"
        code={`<?php
declare(strict_types=1);

$nome = "Wallyson";
$idade = 30;
$ativo = true;

echo "Nome: $nome" . PHP_EOL;
echo "Idade: $idade" . PHP_EOL;
echo "Ativo: " . ($ativo ? "sim" : "não") . PHP_EOL;

// Sem o $, vira tentativa de constante:
echo nome;`}
        output={`Nome: Wallyson
Idade: 30
Ativo: sim
PHP Warning:  Use of undefined constant nome - assumed 'nome' (this will throw an Error in a future version)
nome`}
      />

      <p>
        Atribuição é simples: <code>$variavel = valor;</code>. PHP é <em>dinamicamente tipado</em>,
        então você não declara o tipo na criação — a variável passa a existir no momento da primeira
        atribuição e pode mudar de tipo depois (embora, com <code>strict_types</code> e type hints,
        você consiga muito mais segurança).
      </p>

      <h2>Nomes válidos: regras curtas</h2>
      <ul>
        <li>Começam com <code>$</code> seguido de letra ou underscore: <code>$nome</code>, <code>$_id</code>.</li>
        <li>Depois aceitam letras, números e underscore: <code>$user2</code>, <code>$total_geral</code>.</li>
        <li><strong>Case-sensitive</strong>: <code>$nome</code> e <code>$Nome</code> são variáveis diferentes.</li>
        <li>Convenção PSR-12: <code>$camelCase</code> para variáveis e parâmetros.</li>
      </ul>

      <h2>O escopo do PHP é diferente do que você espera</h2>
      <p>
        Aqui mora uma das maiores pegadinhas. Em Python ou JavaScript, uma função consegue
        "enxergar" variáveis declaradas no arquivo (escopo léxico). Em PHP, <strong>não</strong>.
        Funções têm um escopo <em>completamente isolado</em> do script.
      </p>

      <PhpBlock
        filename="escopo.php"
        code={`<?php
declare(strict_types=1);

$mensagem = "olá do script";

function imprimir(): void {
    // $mensagem NÃO existe aqui dentro
    echo $mensagem ?? "(indefinida)";
}

imprimir();`}
        output={`(indefinida)`}
      />

      <p>
        Surpreso? Boas-vindas ao PHP. Para usar uma variável de fora dentro da função, você tem
        três caminhos — em ordem do <strong>melhor</strong> para o <strong>pior</strong>:
      </p>

      <PhpBlock
        filename="escopo_solucoes.php"
        code={`<?php
declare(strict_types=1);

$mensagem = "olá do script";

// 1. MELHOR: passe como parâmetro
function imprimir1(string $msg): void {
    echo $msg . PHP_EOL;
}
imprimir1($mensagem);

// 2. ACEITÁVEL: $GLOBALS (superglobal sempre disponível)
function imprimir2(): void {
    echo $GLOBALS["mensagem"] . PHP_EOL;
}
imprimir2();

// 3. EVITE: keyword global (legado, dificulta testes)
function imprimir3(): void {
    global $mensagem;
    echo $mensagem . PHP_EOL;
}
imprimir3();`}
        output={`olá do script
olá do script
olá do script`}
      />

      <AlertBox type="warning" title="Regra prática">
        Na vida real, <strong>passe parâmetros</strong>. Funções que dependem de <code>global</code> ou
        <code> $GLOBALS</code> são difíceis de testar, debugar e reaproveitar. Se você está tentado a
        usá-los, provavelmente o que você quer é uma classe com propriedades.
      </AlertBox>

      <h2>static: a variável que sobrevive entre chamadas</h2>
      <p>
        Variáveis comuns dentro de uma função morrem quando ela termina. Uma variável marcada como
        <code> static</code> mantém o valor entre chamadas — útil para contadores, caches simples ou
        memoização. A inicialização só roda uma vez.
      </p>

      <PhpBlock
        filename="static.php"
        code={`<?php
declare(strict_types=1);

function contador(): int {
    static $n = 0;
    $n++;
    return $n;
}

echo contador() . PHP_EOL; // 1
echo contador() . PHP_EOL; // 2
echo contador() . PHP_EOL; // 3
echo contador() . PHP_EOL; // 4`}
        output={`1
2
3
4`}
      />

      <h2>Variáveis variáveis ($$x): use com parcimônia</h2>
      <p>
        PHP permite que o <em>nome</em> de uma variável venha de outra variável. É um truque
        poderoso, esotérico, e quase sempre uma má ideia. Veja em ação para reconhecer quando
        encontrar em código antigo:
      </p>

      <PhpBlock
        filename="varvar.php"
        code={`<?php
declare(strict_types=1);

$campo = "email";
$$campo = "ada@example.com";

// $$campo cria a variável $email
echo $email . PHP_EOL;

// Mesma coisa com sintaxe explícita:
${'${"endereco"}'} = "Rua Lovelace, 1815";
echo $endereco . PHP_EOL;`}
        output={`ada@example.com
Rua Lovelace, 1815`}
      />

      <AlertBox type="danger" title="Por que evitar $$x">
        Variáveis variáveis quebram análise estática, autocomplete e refactor. Se você precisa
        mapear nomes a valores, use um <code>array</code> associativo: <code>$dados["email"]</code>.
        Quase 100% dos casos têm uma alternativa mais limpa.
      </AlertBox>

      <h2>isset, empty e unset: o trio obrigatório</h2>
      <p>
        Para checar se uma variável existe, está vazia, ou para destruí-la, o PHP oferece três
        construções nativas. Cada uma responde a uma pergunta diferente:
      </p>
      <ul>
        <li><code>isset($x)</code> — a variável existe e é <strong>diferente de <code>null</code></strong>?</li>
        <li><code>empty($x)</code> — a variável é <em>"vazia"</em>? (<code>0</code>, <code>"0"</code>, <code>""</code>, <code>null</code>, <code>[]</code>, <code>false</code> são "vazios").</li>
        <li><code>unset($x)</code> — destrói a variável (depois disso, <code>isset</code> volta <code>false</code>).</li>
      </ul>

      <p><strong className="text-[#8993BE] font-mono">var_dump</strong> — imprime tipo + valor de qualquer expressão. Ferramenta nº 1 de debug. Mostra <code>bool(true)</code>, <code>int(42)</code>, <code>string(3) "Ada"</code> etc. Aceita várias variáveis separadas por vírgula.</p>
      <p><strong className="text-[#8993BE] font-mono">isset / empty / unset</strong> — três construções da linguagem (não funções): <code>isset</code> testa se existe E não é <code>null</code>; <code>empty</code> testa se é "vazio" (inclui <code>0</code> e <code>"0"</code>!); <code>unset</code> destrói a variável.</p>

      <PhpBlock
        filename="isset_empty.php"
        code={`<?php
declare(strict_types=1);

$nome = "Ada";
$zero = 0;
$nulo = null;
$vazio = "";

var_dump(isset($nome));    // true
var_dump(isset($nulo));    // false (existe, mas é null)
var_dump(isset($inexistente)); // false

var_dump(empty($nome));    // false
var_dump(empty($zero));    // true (cuidado!)
var_dump(empty($vazio));   // true
var_dump(empty("0"));      // true (mais cuidado ainda!)

unset($nome);
var_dump(isset($nome));    // false`}
        output={`bool(true)
bool(false)
bool(false)
bool(false)
bool(true)
bool(true)
bool(true)
bool(false)`}
      />

      <AlertBox type="warning" title="A pegadinha do empty()">
        <code>empty($x)</code> considera <strong><code>0</code> e <code>"0"</code> como vazios</strong>.
        Se você está validando "o usuário preencheu o campo idade?" e ele digita <code>0</code>,
        <code> empty</code> diz que está vazio. Para validar presença sem essa armadilha, prefira
        <code> isset($x) &amp;&amp; $x !== ""</code>.
      </AlertBox>

      <h2>Coalescência nula: o atalho moderno</h2>
      <p>
        Em PHP 7+, o operador <code>??</code> substitui o velho padrão{" "}
        <code>isset($x) ? $x : "default"</code>. Ele devolve o lado esquerdo se ele existir e não
        for <code>null</code>; caso contrário, o lado direito. Combine com <code>??=</code> para
        atribuir só quando ainda não existe.
      </p>

      <p><strong className="text-[#8993BE] font-mono">??</strong> e <strong className="text-[#8993BE] font-mono">??=</strong> — <code>??</code> (null coalescing) devolve o lado esquerdo se existir e não for <code>null</code>; senão, o direito. <code>??=</code> atribui só quando a chave/var é <code>null</code> ou inexistente. Substituem o velho <code>isset($x) ? $x : padrão</code>.</p>
      <p><strong className="text-[#8993BE] font-mono">print_r</strong> — imprime arrays e objetos em formato amigável (sem tipos, diferente de <code>var_dump</code>). Aceita um segundo argumento <code>true</code> para retornar string em vez de imprimir.</p>

      <PhpBlock
        filename="coalesce.php"
        code={`<?php
declare(strict_types=1);

$config = ["host" => "localhost"];

$host = $config["host"] ?? "127.0.0.1";
$port = $config["port"] ?? 5432;

echo "$host:$port" . PHP_EOL;

// ??= atribui só se for null/inexistente
$config["timeout"] ??= 30;
$config["host"] ??= "outro";  // não muda, já existe

print_r($config);`}
        output={`localhost:5432
Array
(
    [host] => localhost
    [timeout] => 30
)`}
      />

      <h2>Rodando os exemplos</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/php-book"
        command="php escopo_solucoes.php"
        output={`olá do script
olá do script
olá do script`}
      />

      <p>
        Você já entende como variáveis nascem, vivem (em escopos isolados!) e morrem em PHP. No
        próximo capítulo a gente atravessa os <strong>tipos primitivos</strong> — quem é quem na
        zoologia de <code>int</code>, <code>float</code>, <code>string</code>, <code>array</code> e
        amigos — e aprende a domar o famoso <em>type juggling</em>.
      </p>
    </PageContainer>
  );
}
