import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { BrowserBlock } from "@/components/ui/BrowserBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Sintaxe() {
  return (
    <PageContainer
      title="Sintaxe e tags <?php"
      subtitle="Como o interpretador PHP enxerga seu arquivo: a tag de abertura, o ponto-e-vírgula sagrado, comentários, case-sensitivity e o porquê de você quase nunca fechar a tag."
      difficulty="iniciante"
      timeToRead="8 min"
      category="Sintaxe Básica"
    >
      <AlertBox type="info" title="Pré-requisitos">
        <p>Nenhum — pode começar por aqui! É o primeiro capítulo do livro.</p>
      </AlertBox>
      <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"<?php"}</strong> {' — '} {"tag de abertura — diz ao interpretador que o que vem a seguir é código PHP. Pode ser misturado a HTML."}
          </li>
        <li>
            <strong>{"?>"}</strong> {' — '} {"tag de fechamento — opcional em arquivos puramente PHP; omitir evita whitespace acidental."}
          </li>
        <li>
            <strong>{"echo / print"}</strong> {' — '} {"imprimem strings; echo aceita múltiplos args, print retorna 1."}
          </li>
        <li>
            <strong>{"; (ponto-e-vírgula)"}</strong> {' — '} {"finaliza cada statement; esquecer dispara erro de parse."}
          </li>
        <li>
            <strong>{"// /* */ #"}</strong> {' — '} {"as três formas de comentário; # é estilo shell."}
          </li>
        </ul>
    
      <h2>O modelo mental: PHP é um pré-processador de HTML</h2>
      <p>
        Diferente de Python ou Node, o PHP foi desenhado para <strong>ser embutido em HTML</strong>.
        O interpretador lê o arquivo de cima para baixo, copia tudo que não estiver entre <code>&lt;?php</code> e <code>?&gt;</code>{" "}
        direto para a saída, e executa o que está dentro como código.
      </p>

      <p><strong className="text-[#8993BE] font-mono">echo</strong> — imprime texto na saída padrão (stdout no CLI, corpo da resposta na web). Sintaxe: <code>echo "texto";</code>. Aceita várias coisas separadas por vírgula e é levemente mais rápido que <code>print</code> (que retorna <code>1</code>).</p>
      <p><strong className="text-[#8993BE] font-mono">$variavel</strong> — toda variável em PHP começa com <code>$</code>. O cifrão faz parte do nome e é como o parser distingue variável de constante/função. O capítulo de Variáveis aprofunda escopo e ciclo de vida.</p>
      <p><strong className="text-[#8993BE] font-mono">foreach</strong> — laço para percorrer arrays e iteráveis. Forma curta: <code>foreach ($array as $item)</code>; com chave: <code>foreach ($array as $k =&gt; $v)</code>. É o jeito idiomático em PHP — detalhado no capítulo de Loops.</p>
      <p><strong className="text-[#8993BE] font-mono">"" vs ''</strong> — aspas duplas <code>"…"</code> interpolam variáveis (<code>"olá $nome"</code>); aspas simples <code>'…'</code> são literais. Aspas simples são levemente mais rápidas e seguras quando você não quer interpolação.</p>

      <PhpBlock
        filename="ola.php"
        code={`<h1>Lista de produtos</h1>
<?php
$produtos = ["Café", "Pão", "Manteiga"];
foreach ($produtos as $p) {
    echo "<li>$p</li>";
}
?>
<p>Total: <?= count($produtos) ?> itens.</p>`}
      />

      <BrowserBlock url="http://localhost:8000/ola.php">
        <h1 className="text-2xl font-bold mb-3">Lista de produtos</h1>
        <li>Café</li>
        <li>Pão</li>
        <li>Manteiga</li>
        <p className="mt-3">Total: 3 itens.</p>
      </BrowserBlock>

      <p>
        Tudo que está fora do bloco <code>&lt;?php ... ?&gt;</code> vai literalmente para o navegador.
        Tudo que está dentro é interpretado. A tag curta <code>&lt;?= ... ?&gt;</code> é açúcar
        para <code>&lt;?php echo ... ?&gt;</code> e é o jeito moderno e idiomático de imprimir variáveis
        em templates.
      </p>

      <h2>A regra de ouro: nunca feche a tag em arquivos só de PHP</h2>
      <p>
        Se um arquivo contém <em>apenas</em> código PHP (uma classe, uma função, um config), <strong>não escreva o <code>?&gt;</code> no final</strong>.
        Por quê? Porque qualquer espaço, quebra de linha ou BOM acidental depois do <code>?&gt;</code> vira saída no navegador
        e quebra <code>header()</code>, redirects e sessões com aquele clássico <em>“headers already sent”</em>.
      </p>

      <p><strong className="text-[#8993BE] font-mono">declare(strict_types=1)</strong> — diretiva que liga a checagem estrita de tipos para o arquivo. Deve ser a primeira instrução. Detalhada na seção logo abaixo.</p>
      <p><strong className="text-[#8993BE] font-mono">class / function / public</strong> — <code>class</code> define um tipo, <code>function</code> define uma função/método, <code>public</code> é a visibilidade que permite acesso de qualquer lugar (existem também <code>protected</code> e <code>private</code>). Aprofundamos tudo isso nos capítulos de OOP.</p>

      <PhpBlock
        filename="src/Usuario.php"
        code={`<?php
declare(strict_types=1);

class Usuario {
    public function __construct(
        public string $nome,
        public string $email,
    ) {}
}
// SEM ?> aqui. É proposital.`}
      />

      <AlertBox type="warning" title="Quando faz sentido fechar?">
        Apenas quando o arquivo mistura HTML e PHP (uma view, um template). Em arquivos puramente PHP,
        omitir o <code>?&gt;</code> é <strong>regra do PSR-12</strong> e do bom senso.
      </AlertBox>

      <h2>Ponto-e-vírgula: o terminador</h2>
      <p>
        Toda instrução PHP termina em <code>;</code>. A única exceção é a última instrução antes do{" "}
        <code>?&gt;</code> de fechamento (PHP é gentil aqui), mas você nunca vai depender disso.
        Esquecer o ponto-e-vírgula gera o erro mais clássico de PHP:
      </p>

      <PhpBlock
        filename="erro.php"
        code={`<?php
$nome = "Wallyson"
echo $nome;`}
        output={`PHP Parse error:  syntax error, unexpected token "echo",
expecting "," or ";" in /var/www/erro.php on line 3`}
      />

      <h2>Case sensitivity: a parte estranha</h2>
      <p>
        PHP é uma linguagem com regras <strong>mistas</strong> — uma das suas heranças mais polêmicas.
        Memorize:
      </p>
      <ul>
        <li><strong>Variáveis</strong> são <em>case-sensitive</em>: <code>$nome</code> e <code>$Nome</code> são diferentes.</li>
        <li><strong>Constantes</strong> são <em>case-sensitive</em>: <code>MAX</code> e <code>max</code> são diferentes.</li>
        <li><strong>Funções, classes e métodos</strong> são <em>case-insensitive</em>: <code>strlen()</code>, <code>STRLEN()</code> e <code>StrLen()</code> chamam a mesma função.</li>
        <li><strong>Palavras-chave</strong> (<code>if</code>, <code>foreach</code>, <code>class</code>) são <em>case-insensitive</em>.</li>
      </ul>

      <PhpBlock
        filename="case.php"
        code={`<?php
$nome = "Ada";
$Nome = "Lovelace";

echo STRLEN($nome) . PHP_EOL;   // funciona
echo strlen($Nome) . PHP_EOL;   // funciona
echo $nome . " " . $Nome;       // duas variáveis distintas`}
        output={`3
8
Ada Lovelace`}
      />

      <AlertBox type="info" title="Convenção da comunidade">
        Mesmo o PHP aceitando <code>STRLEN()</code>, <strong>todo código PHP moderno usa minúsculas para
        funções nativas</strong> (<code>strlen</code>, <code>array_map</code>) e <code>PascalCase</code> para classes
        (<code>HttpClient</code>) seguindo o padrão PSR-12.
      </AlertBox>

      <h2>Comentários</h2>
      <p>PHP aceita três estilos. Use o que fizer mais sentido para o trecho:</p>

      <PhpBlock
        filename="comentarios.php"
        code={`<?php
// Comentário de uma linha — estilo C/C++ (preferido)
# Comentário de uma linha — estilo shell (raro hoje)

/*
 * Bloco multi-linha
 * usado para notas longas
 */

/**
 * DocBlock — lido pelo PHPStorm, PHPDoc e analisadores estáticos
 * @param string $nome Nome a saudar
 * @return string Saudação
 */
function saudar(string $nome): string {
    return "Olá, $nome!";
}`}
      />

      <h2>Aspas simples vs aspas duplas (importa MUITO)</h2>
      <p>
        Esta é a primeira pegadinha que todo iniciante encontra. <strong>Aspas duplas interpolam variáveis</strong>;
        aspas simples não. Aspas simples também são um pouco mais rápidas (e protegem você de injeções acidentais
        de variáveis).
      </p>

      <PhpBlock
        filename="aspas.php"
        code={`<?php
$nome = "Wallyson";

echo 'Olá, $nome!' . PHP_EOL;   // imprime literal
echo "Olá, $nome!" . PHP_EOL;   // interpola
echo "Olá, {$nome}!" . PHP_EOL; // forma explícita (recomendada em strings complexas)
echo "2 + 2 = " . (2 + 2);      // concatena com .`}
        output={`Olá, $nome!
Olá, Wallyson!
Olá, Wallyson!
2 + 2 = 4`}
      />

      <h2>strict_types: o seu melhor amigo</h2>
      <p>
        Por padrão, PHP faz <em>type juggling</em> — converte tipos automaticamente, o que é a fonte de bugs
        sutis. Adicionar <code>declare(strict_types=1);</code> como <strong>primeira instrução</strong> do
        arquivo desliga isso para esse arquivo:
      </p>

      <PhpBlock
        filename="strict.php"
        code={`<?php
declare(strict_types=1);

function dobrar(int $n): int {
    return $n * 2;
}

echo dobrar(5);      // 10
echo dobrar("5");    // TypeError: argumento deveria ser int, string dado`}
        output={`10
PHP Fatal error: Uncaught TypeError: dobrar(): Argument #1 ($n) must be of type int, string given`}
      />

      <AlertBox type="success" title="Boas práticas para todo arquivo novo">
        <ol className="list-decimal ml-5 mt-1 space-y-1">
          <li>Comece com <code>&lt;?php</code> sem espaço antes.</li>
          <li>Adicione <code>declare(strict_types=1);</code> em arquivos de lógica.</li>
          <li>Use UTF-8 sem BOM e indentação de 4 espaços (PSR-12).</li>
          <li><strong>Nunca</strong> escreva <code>?&gt;</code> no final de arquivos só de PHP.</li>
        </ol>
      </AlertBox>

      <h2>Rodando o exemplo</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos"
        command="php sintaxe.php"
        output={`Olá, Wallyson!
Total: 3 itens.`}
      />

      <p>
        Pronto: você já entende como o PHP lê seu arquivo. No próximo capítulo a gente mergulha em <strong>variáveis e escopo</strong>,
        que é onde a maioria dos bugs nascem (e onde fica a diferença entre código profissional e amador).
      </p>
    </PageContainer>
  );
}
