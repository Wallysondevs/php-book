import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Iteradores() {
  return (
    <PageContainer
      title="Iterators e IteratorAggregate"
      subtitle="Aprenda a fazer suas classes funcionarem dentro de um foreach — e como reaproveitar FilterIterator e LimitIterator para compor pipelines elegantes."
      difficulty="intermediario"
      timeToRead="12 min"
      category="SPL & Iteradores"
    >
      <h2>O problema: por que não basta um array?</h2>
      <p>
        Imagine uma classe <code>Carrinho</code> que guarda produtos. Você quer poder escrever{" "}
        <code>foreach ($carrinho as $produto)</code> sem precisar expor o array interno.
        Para isso o PHP oferece duas interfaces: <code>Iterator</code> (controle total) e{" "}
        <code>IteratorAggregate</code> (jeito preguiçoso e quase sempre o certo).
      </p>

      <PhpBlock
        filename="problema.php"
        code={`<?php
declare(strict_types=1);

class Carrinho {
    private array $itens = ["Café", "Pão", "Leite"];
}

$c = new Carrinho();

// Erro: Object of class Carrinho is not iterable
foreach ($c as $item) {
    echo $item . PHP_EOL;
}`}
        output={`PHP Fatal error: Uncaught Error: Object of class Carrinho is not iterable`}
      />

      <h2>Solução fácil: IteratorAggregate</h2>
      <p>
        90% das vezes você quer só dizer “use esse array aí dentro como fonte do <code>foreach</code>”.
        É exatamente isso que <code>IteratorAggregate</code> faz: você implementa um único método{" "}
        <code>getIterator()</code> que devolve um <code>Traversable</code> — geralmente um{" "}
        <code>ArrayIterator</code>.
      </p>

      <PhpBlock
        filename="carrinho_aggregate.php"
        code={`<?php
declare(strict_types=1);

use ArrayIterator;
use IteratorAggregate;
use Traversable;

final class Carrinho implements IteratorAggregate
{
    /** @var list<string> */
    private array $itens = [];

    public function adicionar(string $produto): void
    {
        $this->itens[] = $produto;
    }

    public function getIterator(): Traversable
    {
        return new ArrayIterator($this->itens);
    }
}

$c = new Carrinho();
$c->adicionar("Café");
$c->adicionar("Pão");
$c->adicionar("Leite");

foreach ($c as $i => $item) {
    echo "[$i] $item" . PHP_EOL;
}`}
        output={`[0] Café
[1] Pão
[2] Leite`}
      />

      <AlertBox type="success" title="Regra prática">
        Comece SEMPRE por <code>IteratorAggregate</code>. Só caia para <code>Iterator</code> quando
        precisar de estado mais sofisticado (cursor manual, lazy fetching de banco, conexão
        externa). Para uma lista em memória, <code>ArrayIterator</code> resolve.
      </AlertBox>

      <h2>Implementação completa: a interface Iterator</h2>
      <p>
        Quando você precisa controlar o cursor manualmente (por exemplo, paginar resultados de uma
        API conforme o <code>foreach</code> avança), implemente <code>Iterator</code>. Ela tem cinco
        métodos que o PHP chama nesta ordem em cada iteração:
      </p>
      <ol>
        <li><code>rewind()</code> — chamado UMA vez no início.</li>
        <li><code>valid()</code> — true continua, false sai do loop.</li>
        <li><code>current()</code> — retorna o valor atual.</li>
        <li><code>key()</code> — retorna a chave atual.</li>
        <li><code>next()</code> — avança o cursor.</li>
      </ol>

      <PhpBlock
        filename="contador.php"
        code={`<?php
declare(strict_types=1);

final class ContadorPar implements Iterator
{
    private int $pos = 0;

    public function __construct(
        private readonly int $de,
        private readonly int $ate,
    ) {}

    public function rewind(): void { $this->pos = $this->de; }
    public function valid(): bool  { return $this->pos <= $this->ate; }
    public function current(): int { return $this->pos; }
    public function key(): int     { return ($this->pos - $this->de) / 2; }
    public function next(): void   { $this->pos += 2; }
}

foreach (new ContadorPar(10, 18) as $k => $v) {
    echo "k=$k v=$v" . PHP_EOL;
}`}
        output={`k=0 v=10
k=1 v=12
k=2 v=14
k=3 v=16
k=4 v=18`}
      />

      <h2>Como o foreach realmente funciona por dentro</h2>
      <p>
        Pode ajudar enxergar o <code>foreach</code> como um açúcar sintático. Este código:
      </p>

      <PhpBlock
        filename="foreach_interno.php"
        code={`<?php
declare(strict_types=1);

$it = new ContadorPar(10, 14);

// foreach equivalente, escrito na mão:
for ($it->rewind(); $it->valid(); $it->next()) {
    $k = $it->key();
    $v = $it->current();
    echo "$k => $v" . PHP_EOL;
}`}
        output={`0 => 10
1 => 12
2 => 14`}
      />

      <h2>Compondo pipelines: FilterIterator e LimitIterator</h2>
      <p>
        A SPL traz uma família de iteradores que <strong>envolvem</strong> outros iteradores. O ganho
        é gigante: você combina filtros e limites sem materializar arrays intermediários — útil quando
        a fonte é grande ou cara.
      </p>

      <PhpBlock
        filename="pipeline.php"
        code={`<?php
declare(strict_types=1);

final class SomenteMaiusculas extends FilterIterator
{
    public function accept(): bool
    {
        $v = $this->getInnerIterator()->current();
        return is_string($v) && $v === mb_strtoupper($v);
    }
}

$nomes = new ArrayIterator(["ada", "LINUS", "GRACE", "alan", "DENNIS"]);

// Pega só os MAIÚSCULOS, depois limita aos 2 primeiros.
$pipeline = new LimitIterator(new SomenteMaiusculas($nomes), 0, 2);

foreach ($pipeline as $nome) {
    echo $nome . PHP_EOL;
}`}
        output={`LINUS
GRACE`}
      />

      <AlertBox type="info" title="Outros iteradores prontos">
        A SPL ainda traz <code>RecursiveDirectoryIterator</code> (varrer pastas),{" "}
        <code>RegexIterator</code> (filtrar por regex), <code>CallbackFilterIterator</code> (filtro
        com closure) e <code>InfiniteIterator</code> (loop eterno). Tudo composável.
      </AlertBox>

      <h2>Coleção tipada: o exemplo de produção</h2>
      <p>
        Quase toda aplicação séria define <em>coleções tipadas</em> em vez de arrays soltos. Veja
        como uma <code>ListaDeUsuarios</code> fica imutável, iterável e contável:
      </p>

      <PhpBlock
        filename="ListaDeUsuarios.php"
        code={`<?php
declare(strict_types=1);

final readonly class Usuario
{
    public function __construct(
        public int $id,
        public string $nome,
    ) {}
}

final class ListaDeUsuarios implements IteratorAggregate, Countable
{
    /** @var list<Usuario> */
    private array $itens;

    public function __construct(Usuario ...$itens)
    {
        $this->itens = array_values($itens);
    }

    public function getIterator(): ArrayIterator
    {
        return new ArrayIterator($this->itens);
    }

    public function count(): int
    {
        return count($this->itens);
    }
}

$lista = new ListaDeUsuarios(
    new Usuario(1, "Ada"),
    new Usuario(2, "Linus"),
    new Usuario(3, "Grace"),
);

echo "Total: " . count($lista) . PHP_EOL;
foreach ($lista as $u) {
    echo "#{$u->id} — {$u->nome}" . PHP_EOL;
}`}
        output={`Total: 3
#1 — Ada
#2 — Linus
#3 — Grace`}
      />

      <AlertBox type="warning" title="Cuidado com rewind() em iteradores caros">
        Se sua implementação de <code>Iterator</code> consome um stream (HTTP, banco, arquivo),
        chamar <code>foreach</code> duas vezes pode <strong>quebrar</strong> ou refazer requisições.
        Para fontes únicas, considere usar <code>NoRewindIterator</code> ou um <em>generator</em>{" "}
        (próximo capítulo).
      </AlertBox>

      <h2>Rodando os exemplos</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/iteradores"
        command="php pipeline.php"
        output={`LINUS
GRACE`}
      />

      <p>
        No próximo capítulo a gente sobe um nível: <strong>generators</strong> com <code>yield</code>,
        que dão a você o poder de um <code>Iterator</code> escrevendo basicamente uma função.
      </p>
    </PageContainer>
  );
}
