import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function TypeHints() {
  return (
    <PageContainer
      title="Type hints e return types"
      subtitle="Como dizer ao PHP exatamente o que entra e o que sai de cada função — escalares, nullable, union, intersection, void, never e a relação especial entre self, static e parent."
      difficulty="intermediario"
      timeToRead="12 min"
      category="Funções"
    >
      <AlertBox type="info" title="Pré-requisitos">
        <p>Antes deste capítulo, é bom já ter visto: <a href="#/variaveis" className="text-[#8993BE] underline">Variáveis</a>, <a href="#/tipos" className="text-[#8993BE] underline">Tipos</a>, <a href="#/funcoes" className="text-[#8993BE] underline">Funções básicas</a>.</p>
      </AlertBox>
      <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"Escalares"}</strong> {' — '} {"int, float, string, bool — desde PHP 7."}
          </li>
        <li>
            <strong>{"Nullable"}</strong> {' — '} {"?int — aceita int ou null."}
          </li>
        <li>
            <strong>{"Union types (8.0)"}</strong> {' — '} {"int|string — múltiplos tipos permitidos."}
          </li>
        <li>
            <strong>{"Intersection (8.1)"}</strong> {' — '} {"A&B — exige implementar ambas as interfaces."}
          </li>
        <li>
            <strong>{"void/never"}</strong> {' — '} {"void: não retorna nada; never: nunca retorna (lança/exit)."}
          </li>
        </ul>
    
      <p><strong className="text-[#8993BE] font-mono">type hints / return types</strong> — anotações de tipo nos parâmetros (<code>int $n</code>) e no retorno (<code>: string</code>) de uma função. Existem para o PHP vigiar o contrato: chamou com tipo errado, estoura <code>TypeError</code>. Combine com <code>declare(strict_types=1);</code> para o modo estrito.</p>

      <p><strong className="text-[#8993BE] font-mono">mixed</strong> — tipo "qualquer coisa". Aceita <code>int</code>, <code>string</code>, <code>array</code>, <code>object</code>, <code>null</code>, etc. Use só quando realmente não dá para ser mais específico — é praticamente desistir da tipagem naquele ponto.</p>

      <h2>O problema: PHP é generoso demais com tipos</h2>
      <p>
        Por padrão, PHP aceita o que você jogar nele e tenta converter automaticamente — o famoso{" "}
        <em>type juggling</em>. Isso parece útil até o dia em que sua função recebe a string{" "}
        <code>"abc"</code> onde deveria ter recebido um número e o bug se espalha por três camadas
        antes de explodir. <strong>Type hints</strong> resolvem isso: você declara o tipo de cada
        parâmetro e do retorno, e o PHP passa a vigiar o contrato.
      </p>

      <PhpBlock
        filename="sem-tipo.php"
        code={`<?php
// SEM type hints — convite ao caos
function dobrar($n) {
    return $n * 2;
}

echo dobrar(5) . PHP_EOL;       // 10
echo dobrar("5 reais") . PHP_EOL; // 10 (?!)
echo dobrar(true) . PHP_EOL;    // 2
echo dobrar(null) . PHP_EOL;    // 0`}
        output={`10
10
2
0`}
      />

      <p>Agora a versão tipada — e estrita:</p>

      <PhpBlock
        filename="com-tipo.php"
        code={`<?php
declare(strict_types=1);

function dobrar(int $n): int {
    return $n * 2;
}

echo dobrar(5) . PHP_EOL;
echo dobrar("5 reais"); // TypeError imediato`}
        output={`10
PHP Fatal error: Uncaught TypeError: dobrar(): Argument #1 ($n) must be of type int, string given`}
      />

      <h2>declare(strict_types=1): a chave do cofre</h2>
      <p>
        Sem essa declaração, PHP roda em <strong>modo coercivo</strong>: ele tenta converter
        valores para casar com o tipo declarado (<code>"42"</code> vira <code>42</code>,{" "}
        <code>1</code> vira <code>"1"</code>). Com <code>declare(strict_types=1);</code> como{" "}
        <em>primeira instrução</em> do arquivo, o PHP exige o tipo exato. Conversão proibida.
      </p>

      <AlertBox type="warning" title="strict_types vale só para o arquivo onde está">
        A diretiva afeta as <strong>chamadas feitas a partir desse arquivo</strong>, não a função
        em si. Se você chama uma função estrita a partir de um arquivo sem <code>strict_types</code>,
        o modo coercivo vale. Por isso a regra é: <strong>todo arquivo novo começa com</strong>{" "}
        <code>declare(strict_types=1);</code>.
      </AlertBox>

      <h2>Os tipos escalares e os básicos</h2>
      <p>
        PHP suporta os tipos primitivos <code>int</code>, <code>float</code>, <code>string</code>,{" "}
        <code>bool</code>, mais <code>array</code>, <code>object</code>, <code>callable</code>,{" "}
        <code>iterable</code>, <code>mixed</code> (qualquer coisa) e os pseudotipos{" "}
        <code>void</code> e <code>never</code> (só para retorno).
      </p>

      <PhpBlock
        filename="basicos.php"
        code={`<?php
declare(strict_types=1);

function formatarPreco(float $valor, string $moeda = "BRL"): string {
    return sprintf("%s %.2f", $moeda, $valor);
}

function maioresDeIdade(array $idades): array {
    return array_filter($idades, fn(int $i) => $i >= 18);
}

echo formatarPreco(19.9) . PHP_EOL;
print_r(maioresDeIdade([12, 17, 18, 21, 30]));`}
        output={`BRL 19.90
Array
(
    [2] => 18
    [3] => 21
    [4] => 30
)`}
      />

      <h2>Nullable: o "?" antes do tipo</h2>
      <p>
        Coloque um <code>?</code> antes do tipo quando o parâmetro (ou retorno) puder ser{" "}
        <code>null</code>. <code>?string</code> é exatamente o mesmo que <code>string|null</code>,
        só mais curto. Use quando faz sentido a ausência de valor — busca que não achou nada,
        usuário ainda não logado, etc.
      </p>

      <PhpBlock
        filename="nullable.php"
        code={`<?php
declare(strict_types=1);

function buscarEmailPorId(?int $id): ?string {
    if ($id === null) {
        return null;
    }
    $banco = [1 => "ada@exemplo.dev", 2 => "linus@exemplo.dev"];
    return $banco[$id] ?? null;
}

var_dump(buscarEmailPorId(1));
var_dump(buscarEmailPorId(99));
var_dump(buscarEmailPorId(null));`}
        output={`string(15) "ada@exemplo.dev"
NULL
NULL`}
      />

      <h2>Union types (PHP 8.0+): "ou um, ou outro"</h2>
      <p>
        Quando faz sentido aceitar mais de um tipo, separe com pipe (<code>|</code>). É comum em
        funções de formatação que aceitam <code>int|float</code>, ou em parsers que aceitam{" "}
        <code>string|int</code>.
      </p>

      <PhpBlock
        filename="union.php"
        code={`<?php
declare(strict_types=1);

function paraNumero(string|int|float $valor): float {
    return (float) $valor;
}

function descrever(int|string $id): string {
    return is_int($id)
        ? "ID numérico: {$id}"
        : "ID alfanumérico: {$id}";
}

echo paraNumero("3.14") . PHP_EOL;
echo paraNumero(42) . PHP_EOL;
echo descrever(7) . PHP_EOL;
echo descrever("ABC-001") . PHP_EOL;`}
        output={`3.14
42
ID numérico: 7
ID alfanumérico: ABC-001`}
      />

      <h2>Intersection types (PHP 8.1+): "tem que ser as duas coisas"</h2>
      <p>
        Use <code>&amp;</code> para exigir que o valor implemente <strong>todas</strong> as
        interfaces listadas. Útil quando você precisa combinar contratos — por exemplo, algo que
        seja ao mesmo tempo <code>Countable</code> e <code>Iterator</code>.
      </p>

      <PhpBlock
        filename="intersection.php"
        code={`<?php
declare(strict_types=1);

function descreverColecao(\\Countable&\\Traversable $colecao): string {
    $total = count($colecao);
    $primeiros = [];
    foreach ($colecao as $item) {
        $primeiros[] = $item;
        if (count($primeiros) >= 3) break;
    }
    return "Total: {$total}. Primeiros: " . implode(", ", $primeiros);
}

$obj = new ArrayObject(["café", "pão", "manteiga", "geleia", "queijo"]);
echo descreverColecao($obj);`}
        output={`Total: 5. Primeiros: café, pão, manteiga`}
      />

      <AlertBox type="info" title="Union e intersection não se misturam livremente">
        Até o PHP 8.2 surgiram os <em>DNF types</em> (Disjunctive Normal Form), que permitem
        combinar os dois assim: <code>(A&amp;B)|null</code>. Em código novo, prefira começar simples
        e crescer só quando o domínio realmente exigir.
      </AlertBox>

      <h2>void: "não retorno nada"</h2>

      <p><strong className="text-[#8993BE] font-mono">void</strong> — tipo de retorno que diz "essa função não devolve valor". Existe para deixar claro que ela é chamada pelo efeito colateral (logar, salvar, imprimir). Não pode ter <code>return $algo;</code> — só <code>return;</code> sozinho ou nada.</p>

      <p>
        Use <code>void</code> quando a função existe puramente pelo efeito colateral — logar,
        gravar, imprimir. Funções <code>void</code> não podem ter <code>return $algo;</code>.
        Podem ter <code>return;</code> sozinho para sair antes do fim.
      </p>

      <PhpBlock
        filename="void.php"
        code={`<?php
declare(strict_types=1);

function logar(string $msg): void {
    $hora = date("H:i:s");
    echo "[{$hora}] {$msg}" . PHP_EOL;
    // sem return — implícito
}

function avisar(?string $msg): void {
    if ($msg === null) {
        return; // sai antes — permitido
    }
    echo "AVISO: {$msg}" . PHP_EOL;
}

logar("aplicação iniciada");
avisar("disco quase cheio");
avisar(null);
logar("encerrado");`}
        output={`[14:32:01] aplicação iniciada
AVISO: disco quase cheio
[14:32:01] encerrado`}
      />

      <h2>never (PHP 8.1+): "essa função não termina normalmente"</h2>

      <p><strong className="text-[#8993BE] font-mono">never</strong> — tipo de retorno (PHP 8.1+) que diz "essa função nunca volta para quem chamou": ela ou lança exceção, ou chama <code>exit</code>/<code>die</code>. Diferente de <code>void</code>, que retorna mas sem valor. IDEs e PHPStan usam isso para análise de fluxo.</p>

      <p>
        <code>never</code> é diferente de <code>void</code>. Ela diz ao PHP (e à sua IDE) que a
        função <strong>nunca</strong> devolve o controle ao chamador — ou ela lança exceção, ou
        ela chama <code>exit</code>/<code>die</code>. Útil para handlers de erro e redirects.
      </p>

      <PhpBlock
        filename="never.php"
        code={`<?php
declare(strict_types=1);

function abortar(string $motivo): never {
    throw new RuntimeException($motivo);
}

function validarIdade(int $idade): int {
    if ($idade < 0) {
        abortar("Idade negativa: {$idade}");
    }
    return $idade;
}

try {
    validarIdade(-5);
} catch (RuntimeException $e) {
    echo "capturado: " . $e->getMessage();
}`}
        output={`capturado: Idade negativa: -5`}
      />

      <h2>self, static e parent em métodos</h2>
      <p>
        Dentro de classes, três tipos especiais aparecem como retorno:
      </p>
      <ul>
        <li><code>self</code> — referência à classe onde o método foi <em>declarado</em>.</li>
        <li><code>static</code> — referência à classe que <em>chamou</em> o método (late static binding). É o que você quase sempre quer em métodos fluentes.</li>
        <li><code>parent</code> — referência à classe pai.</li>
      </ul>

      <PhpBlock
        filename="self-static.php"
        code={`<?php
declare(strict_types=1);

class QueryBuilder {
    protected array $where = [];

    public function where(string $cond): static {
        $this->where[] = $cond;
        return $this;
    }

    public function toSql(): string {
        return "SELECT * WHERE " . implode(" AND ", $this->where);
    }
}

class UserQueryBuilder extends QueryBuilder {
    public function ativos(): static {
        return $this->where("ativo = 1");
    }
}

$sql = (new UserQueryBuilder())
    ->ativos()
    ->where("idade >= 18")
    ->toSql();

echo $sql;`}
        output={`SELECT * WHERE ativo = 1 AND idade >= 18`}
      />

      <AlertBox type="success" title="Por que static em vez de self?">
        Se <code>where()</code> retornasse <code>self</code>, o tipo declarado seria{" "}
        <code>QueryBuilder</code> e a IDE perderia a referência da subclasse{" "}
        <code>UserQueryBuilder</code> no encadeamento. Com <code>static</code>, o tipo se ajusta à
        classe concreta que chamou. Em APIs fluentes, prefira sempre <code>static</code>.
      </AlertBox>

      <h2>Verificando a versão e rodando</h2>
      <p>
        Union types pedem PHP 8.0+. Intersection e <code>never</code> pedem PHP 8.1+. Confira sua
        versão antes de adotar:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos"
        command="php -v"
        output={`PHP 8.4.1 (cli) (built: Nov 21 2024 12:34:56) (NTS)
Copyright (c) The PHP Group
Zend Engine v4.4.1, Copyright (c) Zend Technologies`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos"
        command="php intersection.php"
        output={`Total: 5. Primeiros: café, pão, manteiga`}
      />

      <h2>Resumo prático</h2>
      <ul>
        <li>Sempre comece arquivos com <code>declare(strict_types=1);</code>.</li>
        <li>Tipe <strong>todos</strong> os parâmetros e o retorno — sem exceções.</li>
        <li>Use <code>?Tipo</code> para nullable; <code>Tipo|Outro</code> para union; <code>Tipo&amp;Outro</code> para intersection.</li>
        <li>Métodos fluentes retornam <code>static</code>, nunca <code>self</code>.</li>
        <li>Use <code>void</code> para efeito colateral; <code>never</code> quando a execução não retorna.</li>
      </ul>

      <p>
        No próximo capítulo a gente entra no mundo das <strong>arrow functions e closures</strong>{" "}
        — aquelas funções pequenininhas que vivem dentro de <code>array_map</code> e amigos.
      </p>
    </PageContainer>
  );
}
