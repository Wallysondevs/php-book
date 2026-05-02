import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Heranca() {
  return (
    <PageContainer
      title="Herança"
      subtitle="extends, parent::, override, final, polimorfismo — e o motivo pelo qual a comunidade hoje grita 'composição em vez de herança'."
      difficulty="intermediario"
      timeToRead="12 min"
      category="POO"
    >
      <AlertBox type="info" title="Pré-requisitos">
        <p>Antes deste capítulo, é bom já ter visto: <a href="#/classes" className="text-[#8993BE] underline">Classes e Objetos</a> e <a href="#/visibilidade" className="text-[#8993BE] underline">Visibilidade</a>.</p>
      </AlertBox>

      <p><strong className="text-[#8993BE] font-mono">extends</strong> — declara que uma classe herda propriedades e métodos de outra (a "pai"). Existe pra reaproveitar código quando há relação clara <em>"é um"</em>. Sintaxe: <code>class Filha extends Pai {`{}`}</code>. Cada classe só pode estender uma única classe.</p>

      <p><strong className="text-[#8993BE] font-mono">parent</strong> — palavra-chave que se refere à classe pai dentro de uma filha, sempre usada com <code>::</code>. Existe pra você poder chamar a versão original do método que sobrescreveu. Sintaxe: <code>parent::__construct(...)</code>, <code>parent::metodo()</code>.</p>

      <p><strong className="text-[#8993BE] font-mono">final</strong> — modificador que impede sobrescrita. <code>final class</code> não pode ser estendida; <code>final function</code> não pode ser sobrescrita por filhas. Existe pra travar invariantes do design. Sintaxe: <code>final class Cpf {`{}`}</code>.</p>

      <p><strong className="text-[#8993BE] font-mono">interface</strong> (no contexto de implementação) — contrato puro: lista métodos que a classe promete implementar. Diferente de <code>extends</code>, você pode implementar várias. Sintaxe: <code>class Foo implements Bar, Baz {`{}`}</code>. Detalhe completo no próximo capítulo.</p>

      <p><strong className="text-[#8993BE] font-mono">implements</strong> — diz que a classe cumpre uma ou mais <code>interface</code>s. Sintaxe: <code>class ConsoleLogger implements Logger {`{}`}</code>. Aceita lista separada por vírgula.</p>

      <h2>O problema: classes parecidas com código duplicado</h2>
      <p>
        Você tem uma classe <code>Funcionario</code> e precisa criar <code>Gerente</code>. Quase tudo é igual:
        nome, salário, método de cálculo de imposto. Só muda que gerentes têm um bônus. Copiar tudo é insano.
        <strong>Herança</strong> permite dizer: <em>“Gerente é um Funcionario, mas com algumas adições/mudanças”.</em>
      </p>

      <PhpBlock
        filename="funcionario.php"
        code={`<?php
declare(strict_types=1);

class Funcionario {
    public function __construct(
        public readonly string $nome,
        protected float $salario,
    ) {}

    public function salarioLiquido(): float {
        return $this->salario * 0.85; // 15% de imposto
    }

    public function descricao(): string {
        return "{$this->nome} ganha R$ " . number_format($this->salarioLiquido(), 2, ',', '.');
    }
}

class Gerente extends Funcionario {
    public function __construct(
        string $nome,
        float $salario,
        private float $bonus,
    ) {
        parent::__construct($nome, $salario);
    }

    public function salarioLiquido(): float {
        return parent::salarioLiquido() + $this->bonus;
    }
}

$f = new Funcionario('Ada', 5000);
$g = new Gerente('Linus', 8000, 2000);

echo $f->descricao() . PHP_EOL;
echo $g->descricao();`}
        output={`Ada ganha R$ 4.250,00
Linus ganha R$ 8.800,00`}
      />

      <p>
        Três conceitos fundamentais nesse exemplo:
      </p>
      <ul>
        <li><code>extends</code> — declara que <code>Gerente</code> herda de <code>Funcionario</code>.</li>
        <li><code>parent::</code> — chama um método/construtor da classe pai.</li>
        <li><strong>Override</strong> — <code>Gerente</code> redefiniu <code>salarioLiquido()</code>, mas o método
          herdado <code>descricao()</code> continua chamando a versão certa graças ao polimorfismo.</li>
      </ul>

      <h2>Polimorfismo na prática</h2>
      <p>
        Polimorfismo é a capacidade de tratar objetos de tipos diferentes pela mesma interface — e cada um responder
        do seu jeito. Quando você passa <code>Gerente</code> para uma função que espera <code>Funcionario</code>, tudo funciona.
      </p>

      <PhpBlock
        filename="folha.php"
        code={`<?php
declare(strict_types=1);

class Funcionario {
    public function __construct(public string $nome, protected float $salario) {}
    public function salarioLiquido(): float { return $this->salario * 0.85; }
}

class Estagiario extends Funcionario {
    public function salarioLiquido(): float { return $this->salario; } // sem desconto
}

class Gerente extends Funcionario {
    public function __construct(string $nome, float $salario, private float $bonus) {
        parent::__construct($nome, $salario);
    }
    public function salarioLiquido(): float { return $this->salario * 0.85 + $this->bonus; }
}

function folhaTotal(array $funcionarios): float {
    return array_sum(array_map(fn(Funcionario $f) => $f->salarioLiquido(), $funcionarios));
}

$equipe = [
    new Funcionario('Ada', 5000),
    new Estagiario('Bia', 1500),
    new Gerente('Linus', 8000, 2000),
];

printf("Folha total: R$ %.2f", folhaTotal($equipe));`}
        output={`Folha total: R$ 13800.00`}
      />

      <p>
        A função <code>folhaTotal()</code> não sabe (e não precisa saber) qual subclasse está recebendo. Cada objeto
        executa <em>sua versão</em> de <code>salarioLiquido()</code>. Esse é o coração do polimorfismo.
      </p>

      <h2><code>final</code>: travando portas</h2>
      <p>
        Use <code>final class</code> para impedir que alguém herde da sua classe. Use <code>final function</code> para
        impedir que uma classe filha sobrescreva um método específico. É uma forma de proteger invariantes.
      </p>

      <PhpBlock
        filename="moeda.php"
        code={`<?php
declare(strict_types=1);

final class Cpf {
    public function __construct(public readonly string $valor) {
        if (!preg_match('/^\\d{11}$/', $valor)) {
            throw new InvalidArgumentException('CPF inválido');
        }
    }
}

// Tentar herdar dispara erro:
class CpfFalso extends Cpf {}

// PHP Fatal error: Class CpfFalso cannot extend final class Cpf`}
        output={`PHP Fatal error: Class CpfFalso cannot extend final class Cpf`}
      />

      <AlertBox type="info" title="Final por padrão?">
        Vários autores (Matthias Noback, Marco Pivetta) defendem marcar <strong>todas</strong> as classes da sua
        aplicação como <code>final</code>. Quem precisar estender é forçado a justificar removendo o final.
        Você protege o design e ganha liberdade de refatorar internamente.
      </AlertBox>

      <h2>O lado escuro: hierarquias profundas</h2>
      <p>
        Herança parece linda no exemplo de <code>Animal -&gt; Cachorro</code>. Em sistemas reais, ela apodrece rápido.
        Imagine essa cadeia:
      </p>

      <PhpBlock
        filename="hierarquia_problemática.php"
        code={`<?php
declare(strict_types=1);

class Veiculo {}
class VeiculoMotorizado extends Veiculo {}
class Carro extends VeiculoMotorizado {}
class CarroEletrico extends Carro {}
class CarroEletricoEsportivo extends CarroEletrico {}
class CarroEletricoEsportivoConversivel extends CarroEletricoEsportivo {}

// E quando aparecer uma "moto elétrica esportiva"?
// Ou um "carro híbrido conversível"?
// A árvore não consegue representar combinações.`}
      />

      <p>
        Os problemas reais:
      </p>
      <ul>
        <li><strong>Acoplamento forte:</strong> mudar a classe pai quebra todas as filhas.</li>
        <li><strong>Combinação explosiva:</strong> herança modela hierarquia única; o mundo real tem combinações.</li>
        <li><strong>Frágil base class problem:</strong> adicionar método na base pode silenciosamente sobrescrever
          algo numa filha distante.</li>
        <li><strong>Difícil de testar:</strong> a filha herda comportamento que talvez você nem queira no teste.</li>
      </ul>

      <h2>Composição: a alternativa moderna</h2>
      <p>
        Em vez de dizer “Notificador <em>é um</em> Logger”, diga “Notificador <em>tem um</em> Logger”. Você passa as
        dependências via construtor (constructor injection) e ganha flexibilidade absurda.
      </p>

      <PhpBlock
        filename="composicao.php"
        code={`<?php
declare(strict_types=1);

interface Logger {
    public function info(string $msg): void;
}

final class ConsoleLogger implements Logger {
    public function info(string $msg): void { echo "[info] {$msg}\\n"; }
}

final class Notificador {
    public function __construct(private Logger $logger) {}

    public function notificar(string $email, string $assunto): void {
        $this->logger->info("enviando '{$assunto}' para {$email}");
        // ... lógica de envio
    }
}

$n = new Notificador(new ConsoleLogger());
$n->notificar('ada@exemplo.com', 'Bem-vinda!');`}
        output={`[info] enviando 'Bem-vinda!' para ada@exemplo.com`}
      />

      <p>
        Quer trocar para um logger que escreve em arquivo? Cria uma <code>FileLogger</code> implementando a mesma
        interface e injeta. Sem mexer em <code>Notificador</code>. Sem hierarquia.
      </p>

      <AlertBox type="success" title="A regra prática">
        <strong>Use herança</strong> quando há uma relação clara “é um” (<em>is-a</em>) e o comportamento é estável.
        <strong>Prefira composição</strong> quando há relação “tem um” (<em>has-a</em>) ou quando você precisa trocar
        comportamento em runtime. Na dúvida, composição.
      </AlertBox>

      <h2>Acessando membros do pai</h2>
      <p>
        Dentro da classe filha você usa <code>parent::</code> para chamar a versão do pai (útil quando você
        sobrescreveu um método mas quer reaproveitar parte da lógica).
      </p>

      <PhpBlock
        filename="parent_call.php"
        code={`<?php
declare(strict_types=1);

class Animal {
    public function descrever(): string {
        return 'sou um animal';
    }
}

class Cachorro extends Animal {
    public function descrever(): string {
        return parent::descrever() . ' — mais especificamente, um cachorro';
    }
}

echo (new Cachorro())->descrever();`}
        output={`sou um animal — mais especificamente, um cachorro`}
      />

      <p>
        Herança ainda tem seu lugar — em <strong>classes abstratas</strong> usadas como template, em frameworks
        que precisam expor pontos de extensão. Nos próximos capítulos a gente vê <strong>interfaces</strong>,
        <strong>classes abstratas</strong> e <strong>traits</strong> — e quando cada uma é a ferramenta certa.
      </p>
    </PageContainer>
  );
}
