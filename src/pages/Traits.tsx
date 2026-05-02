import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Traits() {
  return (
    <PageContainer
      title="Traits"
      subtitle="O jeito do PHP de compartilhar pedaços de código entre classes que não têm uma raiz em comum — copy-paste estruturado, com regras claras para resolver conflitos."
      difficulty="avancado"
      timeToRead="10 min"
      category="POO"
    >
      <AlertBox type="info" title="Pré-requisitos">
        <p>Antes deste capítulo, é bom já ter visto: <a href="#/classes" className="text-[#8993BE] underline">Classes e Objetos</a>, <a href="#/heranca" className="text-[#8993BE] underline">Herança</a> e <a href="#/interfaces" className="text-[#8993BE] underline">Interfaces</a>.</p>
      </AlertBox>

      <p><strong className="text-[#8993BE] font-mono">trait</strong> — bloco de código (propriedades + métodos) que pode ser "colado" em várias classes via <code>use</code>. Existe pra compartilhar comportamento entre classes sem hierarquia comum. Não pode ser instanciada e não gera tipo. Sintaxe: <code>trait Nome {`{ ... }`}</code>; <code>class Foo {`{ use Nome; }`}</code>.</p>

      <h2>O problema: comportamento que aparece em classes não relacionadas</h2>
      <p>
        Você tem três classes — <code>Post</code>, <code>Comentario</code>, <code>Foto</code> — e todas precisam guardar
        <code>createdAt</code> e <code>updatedAt</code>. Não faz sentido criar uma classe pai chamada
        <code>CoisaComTimestamp</code> só para isso. Interfaces? Elas só declaram, não compartilham implementação.
        <strong>Traits</strong> são a resposta: pedaços de código que você “cola” em qualquer classe.
      </p>

      <PhpBlock
        filename="src/HasTimestamps.php"
        code={`<?php
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
print_r($p->timestamps());`}
        output={`Array
(
    [criado_em] => 2025-01-15T10:00:00+00:00
    [atualizado_em] => 2025-01-15T10:00:01+00:00
)`}
      />

      <p>
        A <code>trait</code> não é instanciável — você não faz <code>new HasTimestamps()</code>. Ela só existe para
        ser “consumida” por classes via <code>use</code>.
      </p>

      <h2>Como o PHP enxerga isso por dentro</h2>
      <p>
        Pense em <code>use Trait;</code> como copy-paste em tempo de compilação. O PHP literalmente mescla os métodos
        e propriedades da trait dentro da classe. <strong>Não há herança envolvida</strong>:
        <code>$post instanceof HasTimestamps</code> retorna <code>false</code> porque trait não é tipo.
      </p>

      <PhpBlock
        filename="instanceof_trait.php"
        code={`<?php
declare(strict_types=1);

trait Cantante { public function cantar(): string { return 'lá lá lá'; } }

class Cantor { use Cantante; }

$c = new Cantor();
echo $c->cantar() . PHP_EOL;
var_dump($c instanceof Cantante); // erro? não — apenas false
                                  // (na verdade até gera Warning a depender do PHP)`}
        output={`lá lá lá
PHP Warning: Cannot use Cantante as a class
bool(false)`}
      />

      <AlertBox type="info" title="Quando precisar de tipo, use interface">
        Combine os dois: declare uma <code>interface</code> com a assinatura e uma <code>trait</code> com a
        implementação padrão. Quem usa a trait também declara <code>implements</code>. Aí <code>instanceof</code> funciona.
      </AlertBox>

      <h2>Conflitos: quando duas traits têm o mesmo método</h2>
      <p>
        Se duas traits trazem um método com o mesmo nome para a mesma classe, o PHP <strong>não escolhe sozinho</strong>.
        Erro fatal. Você precisa resolver com <code>insteadof</code> (escolhe qual vence) e <code>as</code> (renomeia
        ou muda visibilidade).
      </p>

      <PhpBlock
        filename="conflito.php"
        code={`<?php
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
$s->logArquivo('iniciando');`}
        output={`[console] iniciando
[arquivo] iniciando`}
      />

      <p>
        Você também pode usar <code>as</code> só para mudar a visibilidade de um método herdado:
      </p>

      <PhpBlock
        filename="visibilidade_trait.php"
        code={`<?php
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

// (new Calculadora())->calcular(2, 3); // erro: Call to protected method`}
        output={`5`}
      />

      <h2>Traits abstratas</h2>
      <p>
        A trait pode declarar métodos <code>abstract</code> — são contratos que a classe consumidora <em>obriga-se</em>
        a implementar. Ótimo para forçar quem usa a trait a fornecer um pedaço da lógica.
      </p>

      <PhpBlock
        filename="auditoria.php"
        code={`<?php
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
$p->auditar('pago');`}
        output={`[10:00:01] Pedido#42 -> criado
[10:00:01] Pedido#42 -> pago`}
      />

      <h2>Trait com propriedades estáticas e constantes (PHP 8.2+)</h2>
      <p>
        Desde a PHP 8.2 traits podem declarar constantes — útil para configuração compartilhada.
      </p>

      <PhpBlock
        filename="paginacao.php"
        code={`<?php
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
echo ListaArtigos::POR_PAGINA;               // 20`}
        output={`40
20`}
      />

      <h2>Quando usar trait — e quando NÃO</h2>
      <p>
        Trait resolve um problema real (DRY entre classes não relacionadas), mas é fácil abusar. Use o seguinte
        critério mental:
      </p>
      <ul>
        <li>
          ✅ <strong>Use trait</strong> quando o mesmo bloco de código apareceria em N classes que não compartilham
          hierarquia natural — e o código não tem dependências externas (logger, repositório, etc).
        </li>
        <li>
          ❌ <strong>Evite trait</strong> quando o comportamento depende de colaboradores externos. Aí é caso clássico
          de <em>composição</em> — passe um objeto pelo construtor.
        </li>
        <li>
          ❌ <strong>Evite trait</strong> quando você quer polimorfismo/contrato. Use <em>interface</em>.
        </li>
        <li>
          ❌ <strong>Evite trait</strong> só para “organizar arquivos grandes”. Se sua classe tem 800 linhas, o problema
          não é onde guardar — é que ela faz coisas demais.
        </li>
      </ul>

      <AlertBox type="warning" title="O lado escuro das traits">
        Traits acoplam estaticamente — não dá pra trocar em runtime, não dá pra mockar facilmente em testes,
        não geram tipo. Frameworks como Laravel usam muito (<code>Notifiable</code>, <code>HasFactory</code>);
        bibliotecas mais arquiteturais (Symfony, em geral) preferem composição.
      </AlertBox>

      <h2>Trait + interface: o combo elegante</h2>
      <p>
        Padrão recomendado para reuso com tipo: declare a interface, ofereça uma trait com implementação padrão.
        Quem implementa pode usar a trait pronta ou escrever a sua versão.
      </p>

      <PhpBlock
        filename="contavel.php"
        code={`<?php
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
echo descricao(new Pasta(['relatorio.pdf']));`}
        output={`tem 3 itens
tem 1 itens`}
      />

      <p>
        Você ganha o melhor dos dois mundos: <strong>tipo via interface</strong> e <strong>código DRY via trait</strong>.
        No próximo capítulo, fechamos o ciclo de POO com <strong>classes abstratas</strong>.
      </p>
    </PageContainer>
  );
}
