import{j as e}from"./index-Bb4MiiJL.js";import{P as s,A as o,a}from"./AlertBox-BpD-xIsb.js";function r(){return e.jsxs(s,{title:"Traits",subtitle:"O jeito do PHP de compartilhar pedaços de código entre classes que não têm uma raiz em comum — copy-paste estruturado, com regras claras para resolver conflitos.",difficulty:"avancado",timeToRead:"10 min",category:"POO",children:[e.jsx(o,{type:"info",title:"Pré-requisitos",children:e.jsxs("p",{children:["Antes deste capítulo, é bom já ter visto: ",e.jsx("a",{href:"#/classes",className:"text-[#8993BE] underline",children:"Classes e Objetos"}),", ",e.jsx("a",{href:"#/heranca",className:"text-[#8993BE] underline",children:"Herança"})," e ",e.jsx("a",{href:"#/interfaces",className:"text-[#8993BE] underline",children:"Interfaces"}),"."]})}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"trait"}),' — bloco de código (propriedades + métodos) que pode ser "colado" em várias classes via ',e.jsx("code",{children:"use"}),". Existe pra compartilhar comportamento entre classes sem hierarquia comum. Não pode ser instanciada e não gera tipo. Sintaxe: ",e.jsxs("code",{children:["trait Nome ","{ ... }"]}),"; ",e.jsxs("code",{children:["class Foo ","{ use Nome; }"]}),"."]}),e.jsx("h2",{children:"O problema: comportamento que aparece em classes não relacionadas"}),e.jsxs("p",{children:["Você tem três classes — ",e.jsx("code",{children:"Post"}),", ",e.jsx("code",{children:"Comentario"}),", ",e.jsx("code",{children:"Foto"})," — e todas precisam guardar",e.jsx("code",{children:"createdAt"})," e ",e.jsx("code",{children:"updatedAt"}),". Não faz sentido criar uma classe pai chamada",e.jsx("code",{children:"CoisaComTimestamp"})," só para isso. Interfaces? Elas só declaram, não compartilham implementação.",e.jsx("strong",{children:"Traits"})," são a resposta: pedaços de código que você “cola” em qualquer classe."]}),e.jsx(a,{filename:"src/HasTimestamps.php",code:`<?php
declare(strict_types=1);

trait HasTimestamps {
    private ?DateTimeImmutable $createdAt = null;
    private ?DateTimeImmutable $updatedAt = null;

    public function marcarCriacao(): void {
        $this->createdAt = new DateTimeImmutable();
        $this->updatedAt = $this->createdAt;
    }

    public function marcarAtualizacao(): void {
        $this->updatedAt = new DateTimeImmutable();
    }

    public function timestamps(): array {
        return [
            'criado_em'    => $this->createdAt?->format('c'),
            'atualizado_em'=> $this->updatedAt?->format('c'),
        ];
    }
}

class Post {
    use HasTimestamps;
    public function __construct(public string $titulo) {
        $this->marcarCriacao();
    }
}

class Comentario {
    use HasTimestamps;
    public function __construct(public string $texto) {
        $this->marcarCriacao();
    }
}

$p = new Post('Olá Mundo');
sleep(1);
$p->marcarAtualizacao();
print_r($p->timestamps());`,output:`Array
(
    [criado_em] => 2025-01-15T10:00:00+00:00
    [atualizado_em] => 2025-01-15T10:00:01+00:00
)`}),e.jsxs("p",{children:["A ",e.jsx("code",{children:"trait"})," não é instanciável — você não faz ",e.jsx("code",{children:"new HasTimestamps()"}),". Ela só existe para ser “consumida” por classes via ",e.jsx("code",{children:"use"}),"."]}),e.jsx("h2",{children:"Como o PHP enxerga isso por dentro"}),e.jsxs("p",{children:["Pense em ",e.jsx("code",{children:"use Trait;"})," como copy-paste em tempo de compilação. O PHP literalmente mescla os métodos e propriedades da trait dentro da classe. ",e.jsx("strong",{children:"Não há herança envolvida"}),":",e.jsx("code",{children:"$post instanceof HasTimestamps"})," retorna ",e.jsx("code",{children:"false"})," porque trait não é tipo."]}),e.jsx(a,{filename:"instanceof_trait.php",code:`<?php
declare(strict_types=1);

trait Cantante { public function cantar(): string { return 'lá lá lá'; } }

class Cantor { use Cantante; }

$c = new Cantor();
echo $c->cantar() . PHP_EOL;
var_dump($c instanceof Cantante); // erro? não — apenas false
                                  // (na verdade até gera Warning a depender do PHP)`,output:`lá lá lá
PHP Warning: Cannot use Cantante as a class
bool(false)`}),e.jsxs(o,{type:"info",title:"Quando precisar de tipo, use interface",children:["Combine os dois: declare uma ",e.jsx("code",{children:"interface"})," com a assinatura e uma ",e.jsx("code",{children:"trait"})," com a implementação padrão. Quem usa a trait também declara ",e.jsx("code",{children:"implements"}),". Aí ",e.jsx("code",{children:"instanceof"})," funciona."]}),e.jsx("h2",{children:"Conflitos: quando duas traits têm o mesmo método"}),e.jsxs("p",{children:["Se duas traits trazem um método com o mesmo nome para a mesma classe, o PHP ",e.jsx("strong",{children:"não escolhe sozinho"}),". Erro fatal. Você precisa resolver com ",e.jsx("code",{children:"insteadof"})," (escolhe qual vence) e ",e.jsx("code",{children:"as"})," (renomeia ou muda visibilidade)."]}),e.jsx(a,{filename:"conflito.php",code:`<?php
declare(strict_types=1);

trait LogConsole {
    public function log(string $msg): void {
        echo "[console] {$msg}\\n";
    }
}

trait LogArquivo {
    public function log(string $msg): void {
        echo "[arquivo] {$msg}\\n";
    }
}

class Servico {
    use LogConsole, LogArquivo {
        LogConsole::log insteadof LogArquivo;       // console vence
        LogArquivo::log as logArquivo;              // mas o de arquivo fica acessível com outro nome
    }
}

$s = new Servico();
$s->log('iniciando');
$s->logArquivo('iniciando');`,output:`[console] iniciando
[arquivo] iniciando`}),e.jsxs("p",{children:["Você também pode usar ",e.jsx("code",{children:"as"})," só para mudar a visibilidade de um método herdado:"]}),e.jsx(a,{filename:"visibilidade_trait.php",code:`<?php
declare(strict_types=1);

trait Calculo {
    public function calcular(int $a, int $b): int {
        return $a + $b;
    }
}

class Calculadora {
    use Calculo {
        calcular as protected; // restringe visibilidade nessa classe
    }

    public function somar(int $a, int $b): int {
        return $this->calcular($a, $b);
    }
}

echo (new Calculadora())->somar(2, 3);

// (new Calculadora())->calcular(2, 3); // erro: Call to protected method`,output:"5"}),e.jsx("h2",{children:"Traits abstratas"}),e.jsxs("p",{children:["A trait pode declarar métodos ",e.jsx("code",{children:"abstract"})," — são contratos que a classe consumidora ",e.jsx("em",{children:"obriga-se"}),"a implementar. Ótimo para forçar quem usa a trait a fornecer um pedaço da lógica."]}),e.jsx(a,{filename:"auditoria.php",code:`<?php
declare(strict_types=1);

trait Auditavel {
    abstract protected function nomeEntidade(): string;

    public function auditar(string $acao): void {
        $entidade = $this->nomeEntidade();
        printf("[%s] %s -> %s\\n", date('H:i:s'), $entidade, $acao);
    }
}

final class Pedido {
    use Auditavel;

    public function __construct(public readonly int $id) {}

    protected function nomeEntidade(): string {
        return "Pedido#{$this->id}";
    }
}

$p = new Pedido(42);
$p->auditar('criado');
$p->auditar('pago');`,output:`[10:00:01] Pedido#42 -> criado
[10:00:01] Pedido#42 -> pago`}),e.jsx("h2",{children:"Trait com propriedades estáticas e constantes (PHP 8.2+)"}),e.jsx("p",{children:"Desde a PHP 8.2 traits podem declarar constantes — útil para configuração compartilhada."}),e.jsx(a,{filename:"paginacao.php",code:`<?php
declare(strict_types=1);

trait Paginavel {
    public const int POR_PAGINA = 20;

    public function offset(int $pagina): int {
        return max(0, ($pagina - 1) * self::POR_PAGINA);
    }
}

final class ListaArtigos {
    use Paginavel;
}

$lista = new ListaArtigos();
echo $lista->offset(3) . PHP_EOL;            // 40
echo ListaArtigos::POR_PAGINA;               // 20`,output:`40
20`}),e.jsx("h2",{children:"Quando usar trait — e quando NÃO"}),e.jsx("p",{children:"Trait resolve um problema real (DRY entre classes não relacionadas), mas é fácil abusar. Use o seguinte critério mental:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:["✅ ",e.jsx("strong",{children:"Use trait"})," quando o mesmo bloco de código apareceria em N classes que não compartilham hierarquia natural — e o código não tem dependências externas (logger, repositório, etc)."]}),e.jsxs("li",{children:["❌ ",e.jsx("strong",{children:"Evite trait"})," quando o comportamento depende de colaboradores externos. Aí é caso clássico de ",e.jsx("em",{children:"composição"})," — passe um objeto pelo construtor."]}),e.jsxs("li",{children:["❌ ",e.jsx("strong",{children:"Evite trait"})," quando você quer polimorfismo/contrato. Use ",e.jsx("em",{children:"interface"}),"."]}),e.jsxs("li",{children:["❌ ",e.jsx("strong",{children:"Evite trait"})," só para “organizar arquivos grandes”. Se sua classe tem 800 linhas, o problema não é onde guardar — é que ela faz coisas demais."]})]}),e.jsxs(o,{type:"warning",title:"O lado escuro das traits",children:["Traits acoplam estaticamente — não dá pra trocar em runtime, não dá pra mockar facilmente em testes, não geram tipo. Frameworks como Laravel usam muito (",e.jsx("code",{children:"Notifiable"}),", ",e.jsx("code",{children:"HasFactory"}),"); bibliotecas mais arquiteturais (Symfony, em geral) preferem composição."]}),e.jsx("h2",{children:"Trait + interface: o combo elegante"}),e.jsx("p",{children:"Padrão recomendado para reuso com tipo: declare a interface, ofereça uma trait com implementação padrão. Quem implementa pode usar a trait pronta ou escrever a sua versão."}),e.jsx(a,{filename:"contavel.php",code:`<?php
declare(strict_types=1);

interface Contavel {
    public function contar(): int;
}

trait ContaItens {
    public function contar(): int {
        return count($this->itens ?? []);
    }
}

final class Carrinho implements Contavel {
    use ContaItens;
    public function __construct(public array $itens) {}
}

final class Pasta implements Contavel {
    use ContaItens;
    public function __construct(public array $itens) {}
}

function descricao(Contavel $c): string {
    return "tem {$c->contar()} itens";
}

echo descricao(new Carrinho(['café', 'pão', 'leite'])) . PHP_EOL;
echo descricao(new Pasta(['relatorio.pdf']));`,output:`tem 3 itens
tem 1 itens`}),e.jsxs("p",{children:["Você ganha o melhor dos dois mundos: ",e.jsx("strong",{children:"tipo via interface"})," e ",e.jsx("strong",{children:"código DRY via trait"}),". No próximo capítulo, fechamos o ciclo de POO com ",e.jsx("strong",{children:"classes abstratas"}),"."]})]})}export{r as default};
