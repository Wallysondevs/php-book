import{j as e}from"./index-B5-q-eol.js";import{P as s,A as r,a as o}from"./AlertBox-CVbFLZEd.js";import{T as a}from"./TerminalBlock-6fqVIX2R.js";function t(){return e.jsxs(s,{title:"Try / Catch / Finally",subtitle:"Como o PHP moderno sinaliza, propaga e recupera erros: a hierarquia Throwable, catch múltiplo, finally, exit codes em CLI e exception chaining.",difficulty:"intermediario",timeToRead:"12 min",category:"Erros & Exceções",children:[e.jsx(r,{type:"info",title:"Pré-requisitos",children:e.jsxs("p",{children:["Antes deste capítulo, é bom já ter visto: ",e.jsx("a",{href:"#/funcoes",className:"text-[#8993BE] underline",children:"Funções"}),", ",e.jsx("a",{href:"#/classes",className:"text-[#8993BE] underline",children:"Classes"})," e ",e.jsx("a",{href:"#/heranca",className:"text-[#8993BE] underline",children:"Herança"}),"."]})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"throw new Exception()"})," "," — "," ","dispara erro recuperável."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"try/catch/finally"})," "," — "," ","captura, trata e roda cleanup."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Hierarquia"})," "," — "," ","Throwable > {Error, Exception} — Error costuma ser fatal."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Múltiplos catch"})," "," — "," ","catch (A|B $e) — captura união (PHP 8)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Re-throw"})," "," — "," ","lançar de novo com new Custom(prev: $e) preserva cadeia."]})]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"throw"})," — lança uma exceção, interrompendo a execução até encontrar um ",e.jsx("code",{children:"catch"})," compatível na pilha. Existe pra sinalizar que algo deu errado de forma estruturada. Sintaxe: ",e.jsx("code",{children:'throw new RuntimeException("msg");'}),". Desde 8.0 também é uma expressão."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"try"})," / ",e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"catch"})," — bloco que envolve código que pode falhar (",e.jsx("code",{children:"try"}),") e captura erros específicos (",e.jsx("code",{children:"catch"}),"). Existe pra recuperar de falhas sem matar o programa. Sintaxe: ",e.jsx("code",{children:"try { ... } catch (TypeException $e) { ... }"}),". Desde 8.0, ",e.jsx("code",{children:"catch"})," dispensa a variável."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"finally"})," — bloco opcional que ",e.jsx("em",{children:"sempre"})," roda após ",e.jsx("code",{children:"try"}),"/",e.jsx("code",{children:"catch"}),", com sucesso ou erro. Existe pra liberar recursos (fechar arquivo, soltar lock). Sintaxe: ",e.jsx("code",{children:"try { ... } finally { fclose($f); }"}),". Use só pra side-effects, nunca pra retornar."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"Exception vs Error"})," — ambos implementam ",e.jsx("code",{children:"Throwable"}),". ",e.jsx("code",{children:"Exception"})," sinaliza problemas de domínio (arquivo ausente, valor inválido) que você normalmente captura. ",e.jsx("code",{children:"Error"})," sinaliza problemas do PHP (",e.jsx("code",{children:"TypeError"}),", ",e.jsx("code",{children:"DivisionByZeroError"}),") que você raramente deve capturar — quase sempre é bug."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"::class"})," — pseudo-constante que retorna o nome totalmente qualificado da classe como string. Existe pra evitar string mágica e ganhar refactor seguro. Sintaxe: ",e.jsx("code",{children:"Usuario::class"})," devolve ",e.jsx("code",{children:'"App\\Models\\Usuario"'}),". Funciona em instância: ",e.jsx("code",{children:"$obj::class"}),"."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"STDOUT"})," / ",e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"STDERR"})," — handles abertos automaticamente em scripts CLI: saída padrão e saída de erro. Existem pra você separar mensagens normais de mensagens de erro. Sintaxe: ",e.jsx("code",{children:'fwrite(STDERR, "falha\\n");'}),"."]}),e.jsx("h2",{children:"O problema: erros silenciosos quebram seu domínio"}),e.jsxs("p",{children:["Sem tratamento explícito, um erro em qualquer ponto do código vira uma página em branco em produção, ou — pior — corrompe dados antes de morrer. O modelo do PHP moderno é simples: ",e.jsx("strong",{children:"quem detecta o problema lança"}),"; quem sabe lidar ",e.jsx("strong",{children:"captura"}),"; quem precisa garantir limpeza usa"," ",e.jsx("code",{children:"finally"}),"."]}),e.jsx(o,{filename:"dividir.php",code:`<?php
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

echo "programa continua" . PHP_EOL;`,output:`5
erro capturado: não dá para dividir por zero
programa continua`}),e.jsxs("p",{children:["Três coisas para notar: ",e.jsx("code",{children:"throw"}),' interrompe a execução do bloco atual e "sobe" até encontrar um ',e.jsx("code",{children:"catch"})," compatível. O bloco"," ",e.jsx("code",{children:"try"})," não precisa estar próximo do ",e.jsx("code",{children:"throw"})," — ele pode capturar erros que vieram de dez chamadas dentro da pilha."]}),e.jsx("h2",{children:"A hierarquia Throwable"}),e.jsxs("p",{children:["Tudo que pode ser lançado em PHP implementa a interface"," ",e.jsx("code",{children:"Throwable"}),". Abaixo dela ficam dois galhos:"]}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:e.jsx("code",{children:"Exception"})})," — problemas do domínio: arquivo não existe, JSON inválido, valor fora do range. Você normalmente captura."]}),e.jsxs("li",{children:[e.jsx("strong",{children:e.jsx("code",{children:"Error"})})," — problemas do PHP em si: ",e.jsx("code",{children:"TypeError"}),", ",e.jsx("code",{children:"DivisionByZeroError"}),", ",e.jsx("code",{children:"ParseError"}),". Capture com cuidado."]})]}),e.jsx(o,{filename:"hierarquia.php",code:`<?php
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
});`,output:`[RuntimeException] falha de runtime
[InvalidArgumentException] arg ruim
[DivisionByZeroError] Division by zero
[Error] Attempt to call method "metodoQueNaoExiste" on int`}),e.jsxs(r,{type:"info",title:"Throwable é o catch genérico",children:["Capturar ",e.jsx("code",{children:"Throwable"})," pega tudo — Exception ",e.jsx("em",{children:"e"}),' Error. Útil em "global handlers" (logger no topo do CLI ou middleware HTTP), mas evite no código de domínio: você acaba escondendo bugs sérios.']}),e.jsx("h2",{children:"Catch múltiplo (PHP 8.0)"}),e.jsxs("p",{children:["Quando o tratamento é o mesmo para vários tipos, em vez de duplicar o bloco você lista as classes separadas por ",e.jsx("code",{children:"|"}),":"]}),e.jsx(o,{filename:"catch-multi.php",code:`<?php
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
}`,output:`erro do app: config corrompida
erro do app: token expirado
tente de novo em 1min: API offline`}),e.jsxs("p",{children:["A ordem importa: o PHP testa os ",e.jsx("code",{children:"catch"})," de cima para baixo e usa o primeiro que casar. Sempre coloque os tipos mais específicos antes dos genéricos."]}),e.jsx("h2",{children:"finally: limpeza garantida"}),e.jsxs("p",{children:["O bloco ",e.jsx("code",{children:"finally"})," roda ",e.jsx("strong",{children:"sempre"})," — com sucesso, com exceção capturada, com exceção propagada. É onde você fecha conexão, libera lock, restaura estado."]}),e.jsx(o,{filename:"finally.php",code:`<?php
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
}`,output:`lendo /etc/hostname...
fechando handle
capturado fora: erro lendo conteúdo`}),e.jsxs(r,{type:"warning",title:"finally x return",children:["Se o ",e.jsx("code",{children:"try"})," tiver um ",e.jsx("code",{children:"return"}),", o ",e.jsx("code",{children:"finally"})," ","roda ",e.jsx("strong",{children:"antes"})," da função retornar. Se o ",e.jsx("code",{children:"finally"})," ","também tiver ",e.jsx("code",{children:"return"}),", ele ",e.jsx("em",{children:"vence"})," e sobrescreve o do try — quase sempre fonte de bug. Use ",e.jsx("code",{children:"finally"})," só para side-effects de limpeza, nunca para retornar valor."]}),e.jsx("h2",{children:"Exception chaining: causa raiz preservada"}),e.jsxs("p",{children:["Quando você captura uma exception baixa-nível e relança uma de domínio, passe a original como terceiro argumento (",e.jsx("code",{children:"$previous"}),"). O stack trace inteiro fica acessível via ",e.jsx("code",{children:"getPrevious()"}),"."]}),e.jsx(o,{filename:"chaining.php",code:`<?php
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
}`,output:`topo: não foi possível processar a cobrança
causa: [RuntimeException] connection timeout to gateway`}),e.jsx("p",{children:"Esse padrão preserva o contexto técnico (causa raiz) sem vazar detalhes para a camada superior. O log no canto da operação registra os dois — o usuário vê só a mensagem do topo."}),e.jsx("h2",{children:"Métodos úteis de Throwable"}),e.jsx(o,{filename:"info.php",code:`<?php
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
}`,output:`classe:    RuntimeException
mensagem:  algo deu errado
code:      42
arquivo:   info.php
linha:     5
primeira linha do trace:
  #0 {main}`}),e.jsx("h2",{children:"Exit codes em CLI"}),e.jsxs("p",{children:["Em scripts PHP de linha de comando, o ",e.jsx("strong",{children:"exit code"})," é como outros programas (e o seu CI) descobrem que algo falhou. Convenção UNIX:"," ",e.jsx("code",{children:"0"})," é sucesso, qualquer coisa de ",e.jsx("code",{children:"1"})," a ",e.jsx("code",{children:"255"})," ","é erro."]}),e.jsx(o,{filename:"cli.php",code:`<?php
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
}`}),e.jsx(a,{user:"dev",host:"php",cwd:"~/projetos/cli",command:'php cli.php /tmp/inexistente.csv ; echo "exit=$?"',output:`ERRO: arquivo inacessível: /tmp/inexistente.csv
exit=1`}),e.jsx(a,{user:"dev",host:"php",cwd:"~/projetos/cli",command:'php cli.php usuarios.csv ; echo "exit=$?"',output:`ok: 12 usuários importados
exit=0`}),e.jsxs(r,{type:"info",title:"STDERR x STDOUT",children:["Use ",e.jsx("code",{children:"STDERR"})," para mensagens de erro: scripts shell que pipam a saída para outro processo continuam funcionando, e logs de erro ficam separados de output legítimo. ",e.jsx("code",{children:'fwrite(STDERR, "...")'})," é a forma idiomática."]}),e.jsx("h2",{children:"Padrão de handler global"}),e.jsx("p",{children:"Em uma aplicação real, você quer um único ponto que captura qualquer exception não tratada — para logar com Monolog e devolver resposta amigável."}),e.jsx(o,{filename:"bootstrap.php",code:`<?php
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

rodar();`,output:"[FATAL] RuntimeException: bug não previsto em bootstrap.php:18"}),e.jsx("h2",{children:"Boas práticas que valem ouro"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Capture específico, propague genérico"}),": pegue só o que sabe tratar; deixe o resto subir."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Não use exception para fluxo de controle"}),": se a condição é normal (item não encontrado em busca), retorne null/Optional, não lance."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Mensagens em português?"})," Para o usuário final, sim. Para logs, prefira inglês — mais fácil de buscar erros parecidos."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Sempre encadeie a causa"})," quando relançar — você vai agradecer no debug."]}),e.jsxs("li",{children:[e.jsxs("strong",{children:["Não engula com ",e.jsx("code",{children:"catch (Throwable $e) "})]})," — é o jeito mais rápido de criar bugs invisíveis."]})]}),e.jsxs("p",{children:["Try/catch/finally é a infraestrutura: o que muda projetos é como você organiza ",e.jsx("strong",{children:"suas próprias exceptions"})," de domínio. É isso que a gente vê no próximo capítulo: ",e.jsx("strong",{children:"Exceptions personalizadas"}),"."]})]})}export{t as default};
