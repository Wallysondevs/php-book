import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Exceptions() {
  return (
    <PageContainer
      title="Try / Catch / Finally"
      subtitle="Como o PHP moderno sinaliza, propaga e recupera erros: a hierarquia Throwable, catch múltiplo, finally, exit codes em CLI e exception chaining."
      difficulty="intermediario"
      timeToRead="12 min"
      category="Erros & Exceções"
    >
      <AlertBox type="info" title="Pré-requisitos">
        <p>Antes deste capítulo, é bom já ter visto: <a href="#/funcoes" className="text-[#8993BE] underline">Funções</a>, <a href="#/classes" className="text-[#8993BE] underline">Classes</a> e <a href="#/heranca" className="text-[#8993BE] underline">Herança</a>.</p>
      </AlertBox>

      <p><strong className="text-[#8993BE] font-mono">throw</strong> — lança uma exceção, interrompendo a execução até encontrar um <code>catch</code> compatível na pilha. Existe pra sinalizar que algo deu errado de forma estruturada. Sintaxe: <code>throw new RuntimeException("msg");</code>. Desde 8.0 também é uma expressão.</p>

      <p><strong className="text-[#8993BE] font-mono">try</strong> / <strong className="text-[#8993BE] font-mono">catch</strong> — bloco que envolve código que pode falhar (<code>try</code>) e captura erros específicos (<code>catch</code>). Existe pra recuperar de falhas sem matar o programa. Sintaxe: <code>{`try { ... } catch (TypeException $e) { ... }`}</code>. Desde 8.0, <code>catch</code> dispensa a variável.</p>

      <p><strong className="text-[#8993BE] font-mono">finally</strong> — bloco opcional que <em>sempre</em> roda após <code>try</code>/<code>catch</code>, com sucesso ou erro. Existe pra liberar recursos (fechar arquivo, soltar lock). Sintaxe: <code>{`try { ... } finally { fclose($f); }`}</code>. Use só pra side-effects, nunca pra retornar.</p>

      <p><strong className="text-[#8993BE] font-mono">Exception vs Error</strong> — ambos implementam <code>Throwable</code>. <code>Exception</code> sinaliza problemas de domínio (arquivo ausente, valor inválido) que você normalmente captura. <code>Error</code> sinaliza problemas do PHP (<code>TypeError</code>, <code>DivisionByZeroError</code>) que você raramente deve capturar — quase sempre é bug.</p>

      <p><strong className="text-[#8993BE] font-mono">::class</strong> — pseudo-constante que retorna o nome totalmente qualificado da classe como string. Existe pra evitar string mágica e ganhar refactor seguro. Sintaxe: <code>Usuario::class</code> devolve <code>"App\Models\Usuario"</code>. Funciona em instância: <code>$obj::class</code>.</p>

      <p><strong className="text-[#8993BE] font-mono">STDOUT</strong> / <strong className="text-[#8993BE] font-mono">STDERR</strong> — handles abertos automaticamente em scripts CLI: saída padrão e saída de erro. Existem pra você separar mensagens normais de mensagens de erro. Sintaxe: <code>fwrite(STDERR, "falha\n");</code>.</p>

      <h2>O problema: erros silenciosos quebram seu domínio</h2>
      <p>
        Sem tratamento explícito, um erro em qualquer ponto do código vira uma página
        em branco em produção, ou — pior — corrompe dados antes de morrer. O modelo
        do PHP moderno é simples: <strong>quem detecta o problema lança</strong>; quem
        sabe lidar <strong>captura</strong>; quem precisa garantir limpeza usa{" "}
        <code>finally</code>.
      </p>

      <PhpBlock
        filename="dividir.php"
        code={`<?php
declare(strict_types=1);

function dividir(int $a, int $b): int {
    if ($b === 0) {
        throw new InvalidArgumentException("não dá para dividir por zero");
    }
    return intdiv($a, $b);
}

try {
    echo dividir(10, 2) . PHP_EOL;
    echo dividir(10, 0) . PHP_EOL;
    echo "essa linha não roda" . PHP_EOL;
} catch (InvalidArgumentException $e) {
    echo "erro capturado: " . $e->getMessage() . PHP_EOL;
}

echo "programa continua" . PHP_EOL;`}
        output={`5
erro capturado: não dá para dividir por zero
programa continua`}
      />

      <p>
        Três coisas para notar: <code>throw</code> interrompe a execução do bloco
        atual e &quot;sobe&quot; até encontrar um <code>catch</code> compatível. O bloco{" "}
        <code>try</code> não precisa estar próximo do <code>throw</code> — ele pode
        capturar erros que vieram de dez chamadas dentro da pilha.
      </p>

      <h2>A hierarquia Throwable</h2>
      <p>
        Tudo que pode ser lançado em PHP implementa a interface{" "}
        <code>Throwable</code>. Abaixo dela ficam dois galhos:
      </p>
      <ul>
        <li><strong><code>Exception</code></strong> — problemas do domínio: arquivo não existe, JSON inválido, valor fora do range. Você normalmente captura.</li>
        <li><strong><code>Error</code></strong> — problemas do PHP em si: <code>TypeError</code>, <code>DivisionByZeroError</code>, <code>ParseError</code>. Capture com cuidado.</li>
      </ul>

      <PhpBlock
        filename="hierarquia.php"
        code={`<?php
declare(strict_types=1);

function testar(callable $fn): void {
    try {
        $fn();
    } catch (Throwable $t) {
        printf("[%s] %s\\n", $t::class, $t->getMessage());
    }
}

testar(fn() => throw new RuntimeException("falha de runtime"));
testar(fn() => throw new InvalidArgumentException("arg ruim"));
testar(fn() => intdiv(1, 0));
testar(function () {
    $x = 1;
    $x->metodoQueNaoExiste();
});`}
        output={`[RuntimeException] falha de runtime
[InvalidArgumentException] arg ruim
[DivisionByZeroError] Division by zero
[Error] Attempt to call method "metodoQueNaoExiste" on int`}
      />

      <AlertBox type="info" title="Throwable é o catch genérico">
        Capturar <code>Throwable</code> pega tudo — Exception <em>e</em> Error.
        Útil em &quot;global handlers&quot; (logger no topo do CLI ou middleware HTTP), mas
        evite no código de domínio: você acaba escondendo bugs sérios.
      </AlertBox>

      <h2>Catch múltiplo (PHP 8.0)</h2>
      <p>
        Quando o tratamento é o mesmo para vários tipos, em vez de duplicar o bloco
        você lista as classes separadas por <code>|</code>:
      </p>

      <PhpBlock
        filename="catch-multi.php"
        code={`<?php
declare(strict_types=1);

class ConfigInvalida extends RuntimeException {}
class CredencialFalha extends RuntimeException {}
class ServicoIndisponivel extends RuntimeException {}

function conectar(string $servico): void {
    throw match ($servico) {
        "config" => new ConfigInvalida("config corrompida"),
        "auth"   => new CredencialFalha("token expirado"),
        "api"    => new ServicoIndisponivel("API offline"),
    };
}

foreach (["config", "auth", "api"] as $svc) {
    try {
        conectar($svc);
    } catch (ConfigInvalida | CredencialFalha $e) {
        echo "erro do app: " . $e->getMessage() . PHP_EOL;
    } catch (ServicoIndisponivel $e) {
        echo "tente de novo em 1min: " . $e->getMessage() . PHP_EOL;
    }
}`}
        output={`erro do app: config corrompida
erro do app: token expirado
tente de novo em 1min: API offline`}
      />

      <p>
        A ordem importa: o PHP testa os <code>catch</code> de cima para baixo e usa o
        primeiro que casar. Sempre coloque os tipos mais específicos antes dos
        genéricos.
      </p>

      <h2>finally: limpeza garantida</h2>
      <p>
        O bloco <code>finally</code> roda <strong>sempre</strong> — com sucesso, com
        exceção capturada, com exceção propagada. É onde você fecha conexão, libera
        lock, restaura estado.
      </p>

      <PhpBlock
        filename="finally.php"
        code={`<?php
declare(strict_types=1);

function processar(string $arquivo): void {
    $f = fopen($arquivo, "r");
    if ($f === false) {
        throw new RuntimeException("não consegui abrir $arquivo");
    }

    try {
        echo "lendo $arquivo..." . PHP_EOL;
        // simula falha no meio do processamento
        throw new RuntimeException("erro lendo conteúdo");
    } finally {
        echo "fechando handle" . PHP_EOL;
        fclose($f);
    }
}

try {
    processar("/etc/hostname");
} catch (Throwable $e) {
    echo "capturado fora: " . $e->getMessage() . PHP_EOL;
}`}
        output={`lendo /etc/hostname...
fechando handle
capturado fora: erro lendo conteúdo`}
      />

      <AlertBox type="warning" title="finally x return">
        Se o <code>try</code> tiver um <code>return</code>, o <code>finally</code>{" "}
        roda <strong>antes</strong> da função retornar. Se o <code>finally</code>{" "}
        também tiver <code>return</code>, ele <em>vence</em> e sobrescreve o do
        try — quase sempre fonte de bug. Use <code>finally</code> só para
        side-effects de limpeza, nunca para retornar valor.
      </AlertBox>

      <h2>Exception chaining: causa raiz preservada</h2>
      <p>
        Quando você captura uma exception baixa-nível e relança uma de domínio,
        passe a original como terceiro argumento (<code>$previous</code>). O stack
        trace inteiro fica acessível via <code>getPrevious()</code>.
      </p>

      <PhpBlock
        filename="chaining.php"
        code={`<?php
declare(strict_types=1);

class FalhaDePagamento extends RuntimeException {}

function cobrar(int $valor): void {
    try {
        // simula erro do gateway
        throw new RuntimeException("connection timeout to gateway");
    } catch (Throwable $original) {
        throw new FalhaDePagamento(
            "não foi possível processar a cobrança",
            previous: $original,
        );
    }
}

try {
    cobrar(9990);
} catch (FalhaDePagamento $e) {
    echo "topo: " . $e->getMessage() . PHP_EOL;
    $cause = $e->getPrevious();
    if ($cause !== null) {
        echo "causa: [" . $cause::class . "] " . $cause->getMessage() . PHP_EOL;
    }
}`}
        output={`topo: não foi possível processar a cobrança
causa: [RuntimeException] connection timeout to gateway`}
      />

      <p>
        Esse padrão preserva o contexto técnico (causa raiz) sem vazar detalhes
        para a camada superior. O log no canto da operação registra os dois — o
        usuário vê só a mensagem do topo.
      </p>

      <h2>Métodos úteis de Throwable</h2>
      <PhpBlock
        filename="info.php"
        code={`<?php
declare(strict_types=1);

try {
    throw new RuntimeException("algo deu errado", code: 42);
} catch (Throwable $e) {
    echo "classe:    " . $e::class . PHP_EOL;
    echo "mensagem:  " . $e->getMessage() . PHP_EOL;
    echo "code:      " . $e->getCode() . PHP_EOL;
    echo "arquivo:   " . basename($e->getFile()) . PHP_EOL;
    echo "linha:     " . $e->getLine() . PHP_EOL;
    echo "primeira linha do trace:" . PHP_EOL;
    echo "  " . explode("\\n", $e->getTraceAsString())[0] . PHP_EOL;
}`}
        output={`classe:    RuntimeException
mensagem:  algo deu errado
code:      42
arquivo:   info.php
linha:     5
primeira linha do trace:
  #0 {main}`}
      />

      <h2>Exit codes em CLI</h2>
      <p>
        Em scripts PHP de linha de comando, o <strong>exit code</strong> é como
        outros programas (e o seu CI) descobrem que algo falhou. Convenção UNIX:{" "}
        <code>0</code> é sucesso, qualquer coisa de <code>1</code> a <code>255</code>{" "}
        é erro.
      </p>

      <PhpBlock
        filename="cli.php"
        code={`<?php
declare(strict_types=1);

function importarUsuarios(string $csv): int {
    if (!is_readable($csv)) {
        throw new RuntimeException("arquivo inacessível: $csv");
    }
    return 12; // simulando contagem
}

try {
    $n = importarUsuarios($argv[1] ?? "");
    fwrite(STDOUT, "ok: $n usuários importados\\n");
    exit(0);
} catch (Throwable $e) {
    fwrite(STDERR, "ERRO: " . $e->getMessage() . "\\n");
    exit(1);
}`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/cli"
        command={`php cli.php /tmp/inexistente.csv ; echo "exit=$?"`}
        output={`ERRO: arquivo inacessível: /tmp/inexistente.csv
exit=1`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/cli"
        command={`php cli.php usuarios.csv ; echo "exit=$?"`}
        output={`ok: 12 usuários importados
exit=0`}
      />

      <AlertBox type="info" title="STDERR x STDOUT">
        Use <code>STDERR</code> para mensagens de erro: scripts shell que pipam a
        saída para outro processo continuam funcionando, e logs de erro ficam
        separados de output legítimo. <code>fwrite(STDERR, &quot;...&quot;)</code> é a
        forma idiomática.
      </AlertBox>

      <h2>Padrão de handler global</h2>
      <p>
        Em uma aplicação real, você quer um único ponto que captura qualquer
        exception não tratada — para logar com Monolog e devolver resposta amigável.
      </p>

      <PhpBlock
        filename="bootstrap.php"
        code={`<?php
declare(strict_types=1);

set_exception_handler(function (Throwable $t): void {
    fwrite(STDERR, sprintf(
        "[FATAL] %s: %s em %s:%d\\n",
        $t::class,
        $t->getMessage(),
        $t->getFile(),
        $t->getLine(),
    ));
    exit(1);
});

// daqui pra baixo qualquer throw não capturado cai no handler:
function rodar(): void {
    throw new RuntimeException("bug não previsto");
}

rodar();`}
        output={`[FATAL] RuntimeException: bug não previsto em bootstrap.php:18`}
      />

      <h2>Boas práticas que valem ouro</h2>
      <ul>
        <li><strong>Capture específico, propague genérico</strong>: pegue só o que sabe tratar; deixe o resto subir.</li>
        <li><strong>Não use exception para fluxo de controle</strong>: se a condição é normal (item não encontrado em busca), retorne null/Optional, não lance.</li>
        <li><strong>Mensagens em português?</strong> Para o usuário final, sim. Para logs, prefira inglês — mais fácil de buscar erros parecidos.</li>
        <li><strong>Sempre encadeie a causa</strong> quando relançar — você vai agradecer no debug.</li>
        <li><strong>Não engula com <code>catch (Throwable $e) {}</code></strong> — é o jeito mais rápido de criar bugs invisíveis.</li>
      </ul>

      <p>
        Try/catch/finally é a infraestrutura: o que muda projetos é como você
        organiza <strong>suas próprias exceptions</strong> de domínio. É isso que a
        gente vê no próximo capítulo: <strong>Exceptions personalizadas</strong>.
      </p>
    </PageContainer>
  );
}
