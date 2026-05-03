import{j as e}from"./index-B5-q-eol.js";import{P as a,A as o,a as r}from"./AlertBox-CVbFLZEd.js";import{T as t}from"./TerminalBlock-6fqVIX2R.js";function c(){return e.jsxs(a,{title:"Iterators e IteratorAggregate",subtitle:"Aprenda a fazer suas classes funcionarem dentro de um foreach — e como reaproveitar FilterIterator e LimitIterator para compor pipelines elegantes.",difficulty:"intermediario",timeToRead:"12 min",category:"SPL & Iteradores",children:[e.jsx(o,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Iterator"})," "," — "," ","interface SPL: rewind, valid, current, key, next."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"IteratorAggregate"})," "," — "," ","mais simples: só implementa getIterator()."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Traversable"})," "," — "," ","super-interface; aceita em foreach."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"ArrayIterator"})," "," — "," ","implementação pronta para arrays."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"vs generator"})," "," — "," ","iterators são objetos completos; generators usam yield."]})]}),e.jsx("h2",{children:"O problema: por que não basta um array?"}),e.jsxs("p",{children:["Imagine uma classe ",e.jsx("code",{children:"Carrinho"})," que guarda produtos. Você quer poder escrever"," ",e.jsx("code",{children:"foreach ($carrinho as $produto)"})," sem precisar expor o array interno. Para isso o PHP oferece duas interfaces: ",e.jsx("code",{children:"Iterator"})," (controle total) e"," ",e.jsx("code",{children:"IteratorAggregate"})," (jeito preguiçoso e quase sempre o certo)."]}),e.jsx(r,{filename:"problema.php",code:`<?php
declare(strict_types=1);

class Carrinho {
    private array $itens = ["Café", "Pão", "Leite"];
}

$c = new Carrinho();

// Erro: Object of class Carrinho is not iterable
foreach ($c as $item) {
    echo $item . PHP_EOL;
}`,output:"PHP Fatal error: Uncaught Error: Object of class Carrinho is not iterable"}),e.jsx("h2",{children:"Solução fácil: IteratorAggregate"}),e.jsxs("p",{children:["90% das vezes você quer só dizer “use esse array aí dentro como fonte do ",e.jsx("code",{children:"foreach"}),"”. É exatamente isso que ",e.jsx("code",{children:"IteratorAggregate"})," faz: você implementa um único método"," ",e.jsx("code",{children:"getIterator()"})," que devolve um ",e.jsx("code",{children:"Traversable"})," — geralmente um"," ",e.jsx("code",{children:"ArrayIterator"}),"."]}),e.jsx(r,{filename:"carrinho_aggregate.php",code:`<?php
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
}`,output:`[0] Café
[1] Pão
[2] Leite`}),e.jsxs(o,{type:"success",title:"Regra prática",children:["Comece SEMPRE por ",e.jsx("code",{children:"IteratorAggregate"}),". Só caia para ",e.jsx("code",{children:"Iterator"})," quando precisar de estado mais sofisticado (cursor manual, lazy fetching de banco, conexão externa). Para uma lista em memória, ",e.jsx("code",{children:"ArrayIterator"})," resolve."]}),e.jsx("h2",{children:"Implementação completa: a interface Iterator"}),e.jsxs("p",{children:["Quando você precisa controlar o cursor manualmente (por exemplo, paginar resultados de uma API conforme o ",e.jsx("code",{children:"foreach"})," avança), implemente ",e.jsx("code",{children:"Iterator"}),". Ela tem cinco métodos que o PHP chama nesta ordem em cada iteração:"]}),e.jsxs("ol",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"rewind()"})," — chamado UMA vez no início."]}),e.jsxs("li",{children:[e.jsx("code",{children:"valid()"})," — true continua, false sai do loop."]}),e.jsxs("li",{children:[e.jsx("code",{children:"current()"})," — retorna o valor atual."]}),e.jsxs("li",{children:[e.jsx("code",{children:"key()"})," — retorna a chave atual."]}),e.jsxs("li",{children:[e.jsx("code",{children:"next()"})," — avança o cursor."]})]}),e.jsx(r,{filename:"contador.php",code:`<?php
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
}`,output:`k=0 v=10
k=1 v=12
k=2 v=14
k=3 v=16
k=4 v=18`}),e.jsx("h2",{children:"Como o foreach realmente funciona por dentro"}),e.jsxs("p",{children:["Pode ajudar enxergar o ",e.jsx("code",{children:"foreach"})," como um açúcar sintático. Este código:"]}),e.jsx(r,{filename:"foreach_interno.php",code:`<?php
declare(strict_types=1);

$it = new ContadorPar(10, 14);

// foreach equivalente, escrito na mão:
for ($it->rewind(); $it->valid(); $it->next()) {
    $k = $it->key();
    $v = $it->current();
    echo "$k => $v" . PHP_EOL;
}`,output:`0 => 10
1 => 12
2 => 14`}),e.jsx("h2",{children:"Compondo pipelines: FilterIterator e LimitIterator"}),e.jsxs("p",{children:["A SPL traz uma família de iteradores que ",e.jsx("strong",{children:"envolvem"})," outros iteradores. O ganho é gigante: você combina filtros e limites sem materializar arrays intermediários — útil quando a fonte é grande ou cara."]}),e.jsx(r,{filename:"pipeline.php",code:`<?php
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
}`,output:`LINUS
GRACE`}),e.jsxs(o,{type:"info",title:"Outros iteradores prontos",children:["A SPL ainda traz ",e.jsx("code",{children:"RecursiveDirectoryIterator"})," (varrer pastas),"," ",e.jsx("code",{children:"RegexIterator"})," (filtrar por regex), ",e.jsx("code",{children:"CallbackFilterIterator"})," (filtro com closure) e ",e.jsx("code",{children:"InfiniteIterator"})," (loop eterno). Tudo composável."]}),e.jsx("h2",{children:"Coleção tipada: o exemplo de produção"}),e.jsxs("p",{children:["Quase toda aplicação séria define ",e.jsx("em",{children:"coleções tipadas"})," em vez de arrays soltos. Veja como uma ",e.jsx("code",{children:"ListaDeUsuarios"})," fica imutável, iterável e contável:"]}),e.jsx(r,{filename:"ListaDeUsuarios.php",code:`<?php
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
}`,output:`Total: 3
#1 — Ada
#2 — Linus
#3 — Grace`}),e.jsxs(o,{type:"warning",title:"Cuidado com rewind() em iteradores caros",children:["Se sua implementação de ",e.jsx("code",{children:"Iterator"})," consome um stream (HTTP, banco, arquivo), chamar ",e.jsx("code",{children:"foreach"})," duas vezes pode ",e.jsx("strong",{children:"quebrar"})," ou refazer requisições. Para fontes únicas, considere usar ",e.jsx("code",{children:"NoRewindIterator"})," ou um ",e.jsx("em",{children:"generator"})," ","(próximo capítulo)."]}),e.jsx("h2",{children:"Rodando os exemplos"}),e.jsx(t,{user:"dev",host:"php",cwd:"~/iteradores",command:"php pipeline.php",output:`LINUS
GRACE`}),e.jsxs("p",{children:["No próximo capítulo a gente sobe um nível: ",e.jsx("strong",{children:"generators"})," com ",e.jsx("code",{children:"yield"}),", que dão a você o poder de um ",e.jsx("code",{children:"Iterator"})," escrevendo basicamente uma função."]})]})}export{c as default};
