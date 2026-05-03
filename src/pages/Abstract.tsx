import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Abstract() {
  return (
    <PageContainer
      title="Classes Abstratas"
      subtitle="Quando você tem comportamento concreto pra compartilhar mas não quer que ninguém instancie a base. abstract une o que interface não pode: contrato + implementação parcial."
      difficulty="intermediario"
      timeToRead="10 min"
      category="POO"
    >
      <AlertBox type="info" title="Pré-requisitos">
          <p>Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP.</p>
        </AlertBox>
        <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"abstract class"}</strong> {' — '} {"não pode ser instanciada diretamente."}
          </li>
        <li>
            <strong>{"abstract function"}</strong> {' — '} {"método sem corpo — força filha a implementar."}
          </li>
        <li>
            <strong>{"vs interface"}</strong> {' — '} {"classe abstrata pode ter código e estado; interface não."}
          </li>
        <li>
            <strong>{"Template method"}</strong> {' — '} {"padrão clássico onde abstract define esqueleto."}
          </li>
        <li>
            <strong>{"protected abstract"}</strong> {' — '} {"comum para hooks usados internamente pela base."}
          </li>
        </ul>
          <h2>O problema: o pai que não deveria existir sozinho</h2>
      <p>
        Você tem <code>NotificadorEmail</code>, <code>NotificadorSms</code> e <code>NotificadorPush</code>. Todos
        gravam log, formatam timestamp e validam o destinatário <strong>do mesmo jeito</strong>. Só muda como entregam
        a mensagem. Faz sentido criar um <code>Notificador</code> base — mas <em>instanciar</em> um “notificador
        genérico” não faz sentido nenhum. É exatamente para isso que existe <code>abstract class</code>.
      </p>

      <PhpBlock
        filename="src/Notificador.php"
        code={`<?php
declare(strict_types=1);

abstract class Notificador {
    public function __construct(protected string $remetente) {}

    public final function notificar(string $destino, string $mensagem): void {
        $this->validar($destino);
        $hora = (new DateTimeImmutable())->format('H:i:s');
        echo "[{$hora}] {$this->remetente} -> {$destino}\\n";
        $this->entregar($destino, $mensagem);
    }

    protected function validar(string $destino): void {
        if (trim($destino) === '') {
            throw new InvalidArgumentException('destino vazio');
        }
    }

    // contrato: cada subclasse implementa do seu jeito
    abstract protected function entregar(string $destino, string $mensagem): void;
}

final class NotificadorEmail extends Notificador {
    protected function entregar(string $destino, string $msg): void {
        echo "  [email] {$msg}\\n";
    }
}

final class NotificadorSms extends Notificador {
    protected function validar(string $destino): void {
        parent::validar($destino);
        if (!preg_match('/^\\+?\\d{10,}$/', $destino)) {
            throw new InvalidArgumentException('telefone inválido');
        }
    }
    protected function entregar(string $destino, string $msg): void {
        echo "  [sms] {$msg}\\n";
    }
}

(new NotificadorEmail('app'))->notificar('ada@exemplo.com', 'Bem-vinda!');
(new NotificadorSms('app'))->notificar('+5581999990000', 'Codigo: 123');

// new Notificador('app'); // Erro: Cannot instantiate abstract class`}
        output={`[10:00:00] app -> ada@exemplo.com
  [email] Bem-vinda!
[10:00:00] app -> +5581999990000
  [sms] Codigo: 123`}
      />

      <p>
        Três coisas mudaram em relação a uma classe normal:
      </p>
      <ul>
        <li><code>abstract class</code> — não pode ser instanciada com <code>new</code>.</li>
        <li><code>abstract function</code> — método sem corpo. Subclasse <strong>tem</strong> que implementar.</li>
        <li><code>final function notificar()</code> — quem herda não pode mexer no fluxo principal. Esse é o
          <strong>Template Method Pattern</strong>: o pai define o esqueleto, os filhos preenchem os buracos.</li>
      </ul>

      <h2>Métodos concretos compartilhados</h2>
      <p>
        Diferente de interface, classe abstrata pode ter <strong>código pronto</strong> que as filhas reaproveitam
        sem reescrever. Tudo que é genérico vive lá em cima.
      </p>

      <PhpBlock
        filename="forma.php"
        code={`<?php
declare(strict_types=1);

abstract class Forma {
    public function __construct(public readonly string $nome) {}

    abstract public function area(): float;
    abstract public function perimetro(): float;

    public function descricao(): string {
        return sprintf(
            '%s | área=%.2f | perímetro=%.2f',
            $this->nome,
            $this->area(),
            $this->perimetro(),
        );
    }
}

final class Retangulo extends Forma {
    public function __construct(public float $largura, public float $altura) {
        parent::__construct('Retângulo');
    }
    public function area(): float      { return $this->largura * $this->altura; }
    public function perimetro(): float { return 2 * ($this->largura + $this->altura); }
}

final class Circulo extends Forma {
    public function __construct(public float $raio) {
        parent::__construct('Círculo');
    }
    public function area(): float      { return M_PI * $this->raio ** 2; }
    public function perimetro(): float { return 2 * M_PI * $this->raio; }
}

$formas = [new Retangulo(4, 5), new Circulo(3)];
foreach ($formas as $f) {
    echo $f->descricao() . PHP_EOL;
}`}
        output={`Retângulo | área=20.00 | perímetro=18.00
Círculo | área=28.27 | perímetro=18.85`}
      />

      <p>
        <code>descricao()</code> está implementado uma única vez no pai e funciona pra qualquer filha — porque ele
        chama <code>area()</code> e <code>perimetro()</code>, que cada filha sabe responder.
      </p>

      <h2>Template Method na prática</h2>
      <p>
        O padrão é tão comum que merece um exemplo dedicado. Imagine importadores de arquivo: o fluxo é sempre
        <em>abrir → validar → processar linha a linha → fechar</em>. Só muda como cada formato é parseado.
      </p>

      <PhpBlock
        filename="importador.php"
        code={`<?php
declare(strict_types=1);

abstract class Importador {
    public final function importar(string $caminho): int {
        $handle = $this->abrir($caminho);
        $this->validarCabecalho($handle);

        $linhas = 0;
        while (($registro = $this->lerProximo($handle)) !== null) {
            $this->processar($registro);
            $linhas++;
        }
        $this->fechar($handle);
        return $linhas;
    }

    /** Abre o arquivo. Pode ser sobrescrito se precisar (ex.: gzip). */
    protected function abrir(string $caminho): mixed {
        return fopen($caminho, 'r') ?: throw new RuntimeException("não abriu {$caminho}");
    }

    protected function fechar(mixed $handle): void {
        fclose($handle);
    }

    abstract protected function validarCabecalho(mixed $handle): void;
    abstract protected function lerProximo(mixed $handle): ?array;
    abstract protected function processar(array $registro): void;
}

final class ImportadorCsv extends Importador {
    private array $cabecalho = [];

    protected function validarCabecalho(mixed $h): void {
        $this->cabecalho = fgetcsv($h, escape: '\\\\') ?: [];
        if (!in_array('email', $this->cabecalho, true)) {
            throw new RuntimeException('CSV precisa ter coluna email');
        }
    }

    protected function lerProximo(mixed $h): ?array {
        $linha = fgetcsv($h, escape: '\\\\');
        return $linha === false ? null : array_combine($this->cabecalho, $linha);
    }

    protected function processar(array $r): void {
        echo "importando: {$r['email']}\\n";
    }
}

file_put_contents('/tmp/u.csv', "nome,email\\nAda,ada@exemplo.com\\nLinus,linus@exemplo.com\\n");
$total = (new ImportadorCsv())->importar('/tmp/u.csv');
echo "total: {$total}";`}
        output={`importando: ada@exemplo.com
importando: linus@exemplo.com
total: 2`}
      />

      <AlertBox type="success" title="Por que template method é tão poderoso">
        Você protege o <em>fluxo</em> (abre → valida → lê → processa → fecha) na classe base. Quem cria um novo
        importador (JSON, XML, Excel) não consegue esquecer um passo nem fazer fora de ordem — o pai garante.
      </AlertBox>

      <h2>Construtor abstrato? Não exatamente</h2>
      <p>
        Não existe <code>abstract __construct</code>. Mas a abstrata <em>pode</em> ter construtor próprio (e geralmente
        tem) — que será chamado pelas filhas com <code>parent::__construct()</code>.
      </p>

      <PhpBlock
        filename="construtor_abstrato.php"
        code={`<?php
declare(strict_types=1);

abstract class Veiculo {
    public function __construct(
        public readonly string $marca,
        public readonly string $modelo,
    ) {}

    abstract public function tipo(): string;

    public function ficha(): string {
        return "[{$this->tipo()}] {$this->marca} {$this->modelo}";
    }
}

final class Carro extends Veiculo {
    public function __construct(string $marca, string $modelo, public readonly int $portas) {
        parent::__construct($marca, $modelo);
    }
    public function tipo(): string { return 'carro'; }
}

echo (new Carro('Toyota', 'Corolla', 4))->ficha();`}
        output={`[carro] Toyota Corolla`}
      />

      <h2>Interface vs Classe Abstrata: o resumão</h2>
      <p>
        A pergunta retorna sempre. Abaixo, quando cada uma brilha:
      </p>
      <ul>
        <li>
          <strong>Interface</strong>: só contrato, sem código, sem estado. Você pode implementar várias por classe.
          Use para descrever <em>capacidades</em> (<code>Countable</code>, <code>JsonSerializable</code>,
          <code>LoggerInterface</code>).
        </li>
        <li>
          <strong>Classe abstrata</strong>: contrato + código compartilhado + estado (propriedades, construtor).
          Só pode estender uma. Use para um <em>tipo base</em> com fluxo comum entre filhas próximas
          (template method).
        </li>
        <li>
          <strong>Combinando</strong>: defina a interface, depois ofereça uma classe abstrata que implementa parte do
          contrato. Quem quiser tudo pronto herda da abstrata; quem quiser começar do zero implementa só a interface.
        </li>
      </ul>

      <PhpBlock
        filename="combinando.php"
        code={`<?php
declare(strict_types=1);

interface Cache {
    public function ler(string $chave): ?string;
    public function escrever(string $chave, string $valor, int $ttlSegundos = 300): void;
    public function limpar(): void;
}

abstract class CacheBase implements Cache {
    public function lerOuArmazenar(string $chave, callable $gerador, int $ttl = 300): string {
        $valor = $this->ler($chave);
        if ($valor !== null) {
            return $valor;
        }
        $valor = $gerador();
        $this->escrever($chave, $valor, $ttl);
        return $valor;
    }
}

final class CacheMemoria extends CacheBase {
    private array $store = [];

    public function ler(string $c): ?string {
        return $this->store[$c]['valor'] ?? null;
    }
    public function escrever(string $c, string $v, int $ttl = 300): void {
        $this->store[$c] = ['valor' => $v, 'expira' => time() + $ttl];
    }
    public function limpar(): void { $this->store = []; }
}

$cache = new CacheMemoria();
echo $cache->lerOuArmazenar('saudacao', fn() => 'olá ' . date('H:i:s')) . PHP_EOL;
echo $cache->lerOuArmazenar('saudacao', fn() => 'NÃO VAI APARECER');`}
        output={`olá 10:00:00
olá 10:00:00`}
      />

      <p>
        A segunda chamada bate no cache e nem executa o callback — exatamente porque <code>lerOuArmazenar()</code>
        está pronto na classe abstrata e funciona pra qualquer implementação concreta.
      </p>

      <AlertBox type="info" title="Regra prática">
        Comece sempre pela <strong>interface</strong> (descreve o que). Só promova para classe abstrata quando você
        tiver código <em>genuinamente</em> compartilhado entre várias implementações — nunca antes.
      </AlertBox>

      <p>
        Com isso fechamos o ciclo de POO em PHP: classes, encapsulamento, herança, interfaces, traits e abstratas.
        Próximos capítulos atacam outros temas modernos do PHP — <strong>enums</strong>, <strong>namespaces</strong>,
        <strong>autoload via Composer</strong> e por aí vai.
      </p>
    </PageContainer>
  );
}
