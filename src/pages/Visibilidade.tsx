import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Visibilidade() {
  return (
    <PageContainer
      title="Visibilidade e Encapsulamento"
      subtitle="public, protected, private, propriedades readonly e constantes de classe — as ferramentas para você dizer ao mundo o que pode tocar e o que está fora dos limites."
      difficulty="intermediario"
      timeToRead="10 min"
      category="POO"
    >
      <AlertBox type="info" title="Pré-requisitos">
        <p>Antes deste capítulo, é bom já ter visto: <a href="#/classes" className="text-[#8993BE] underline">Classes e Objetos</a> e <a href="#/funcoes" className="text-[#8993BE] underline">Funções</a>.</p>
      </AlertBox>
      <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"public"}</strong> {' — '} {"acessível de qualquer lugar."}
          </li>
        <li>
            <strong>{"protected"}</strong> {' — '} {"visível na própria classe e em filhas."}
          </li>
        <li>
            <strong>{"private"}</strong> {' — '} {"visível só na classe que declarou."}
          </li>
        <li>
            <strong>{"Property promotion (8.0)"}</strong> {' — '} {"public function __construct(private int $id) — declara e atribui em uma linha."}
          </li>
        <li>
            <strong>{"readonly (8.1)"}</strong> {' — '} {"só pode ser escrita uma vez (no construtor)."}
          </li>
        </ul>
    
      <h2>O problema: tudo público é uma armadilha</h2>
      <p>
        Quando toda propriedade é <code>public</code>, qualquer parte do programa pode mexer no estado interno do objeto.
        Resultado: invariantes quebradas, bugs intermitentes, e refatorar vira pesadelo. <strong>Encapsular</strong> é
        decidir o que é interface (público) e o que é implementação (escondido).
      </p>

      <PhpBlock
        filename="ruim.php"
        code={`<?php
declare(strict_types=1);

class Conta {
    public float $saldo = 0.0;
}

$c = new Conta();
$c->saldo = -1_000_000; // ninguém impede!
echo $c->saldo;`}
        output={`-1000000`}
      />

      <p>
        A regra de negócio (<em>saldo nunca pode ficar negativo</em>) ficou só na cabeça do dev. A classe não a defende.
      </p>

      <h2>Os três modificadores</h2>
      <ul>
        <li><code>public</code> — acessível de qualquer lugar (padrão se você não escrever nada).</li>
        <li><code>protected</code> — acessível dentro da classe e em classes que herdam dela.</li>
        <li><code>private</code> — acessível <strong>apenas</strong> dentro da própria classe que declarou.</li>
      </ul>

      <p><strong className="text-[#8993BE] font-mono">readonly</strong> — modificador (PHP 8.1+) que torna uma propriedade gravável apenas uma vez, dentro do construtor. Existe pra modelar Value Objects imutáveis sem ter que escrever getters. Sintaxe: <code>public readonly string $nome;</code>.</p>

      <PhpBlock
        filename="conta.php"
        code={`<?php
declare(strict_types=1);

class Conta {
    public function __construct(
        public readonly string $titular,
        private float $saldo = 0.0,
    ) {}

    public function depositar(float $valor): void {
        if ($valor <= 0) {
            throw new InvalidArgumentException('valor precisa ser positivo');
        }
        $this->saldo += $valor;
    }

    public function sacar(float $valor): void {
        if ($valor > $this->saldo) {
            throw new RuntimeException('saldo insuficiente');
        }
        $this->saldo -= $valor;
    }

    public function saldo(): float {
        return $this->saldo;
    }
}

$c = new Conta('Ada', 100);
$c->depositar(50);
echo $c->saldo() . PHP_EOL;

// $c->saldo = -1_000_000;  // Erro: Cannot access private property`}
        output={`150`}
      />

      <p>
        Agora a única forma de mexer no saldo é passando pelos métodos <code>depositar()</code> e <code>sacar()</code>,
        que protegem as regras. A propriedade <code>$saldo</code> é detalhe de implementação.
      </p>

      <h2>Getters e setters: úteis, mas sem fanatismo</h2>
      <p>
        Em outras linguagens (Java, C#) é comum criar <code>getX()</code>/<code>setX()</code> para tudo. Em PHP moderno
        a recomendação é mais sutil: <strong>exponha intenção, não estado bruto</strong>. Se um valor nunca muda, use
        <code>readonly</code>. Se muda sob regras, exponha métodos com nomes do domínio (<code>depositar</code>) em vez
        de <code>setSaldo</code>.
      </p>

      <PhpBlock
        filename="usuario.php"
        code={`<?php
declare(strict_types=1);

class Usuario {
    public function __construct(
        public readonly string $id,
        private string $email,
    ) {}

    public function email(): string {
        return $this->email;
    }

    public function alterarEmail(string $novo): void {
        if (!filter_var($novo, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException('e-mail inválido');
        }
        $this->email = strtolower($novo);
    }
}

$u = new Usuario('u-1', 'ada@old.com');
$u->alterarEmail('ADA@NEW.COM');
echo $u->email();`}
        output={`ada@new.com`}
      />

      <h2>Propriedades <code>readonly</code> (PHP 8.1+)</h2>
      <p>
        Marcar uma propriedade como <code>readonly</code> diz ao PHP: <em>essa propriedade só pode ser escrita uma vez,
        no construtor</em>. Combina perfeitamente com o constructor promotion para criar objetos imutáveis.
      </p>

      <PhpBlock
        filename="endereco.php"
        code={`<?php
declare(strict_types=1);

final class Endereco {
    public function __construct(
        public readonly string $rua,
        public readonly string $cidade,
        public readonly string $cep,
    ) {}
}

$e = new Endereco('Rua das Flores, 100', 'Recife', '50000-000');
echo $e->cidade . PHP_EOL;

try {
    $e->cidade = 'Olinda'; // proibido
} catch (Error $err) {
    echo 'Erro: ' . $err->getMessage();
}`}
        output={`Recife
Erro: Cannot modify readonly property Endereco::$cidade`}
      />

      <AlertBox type="success" title="Imutabilidade por padrão">
        Para Value Objects (Endereço, Dinheiro, CPF, Coordenada) <strong>sempre prefira <code>readonly</code></strong>.
        Objetos imutáveis são thread-safe, fáceis de cachear, fáceis de testar.
      </AlertBox>

      <h2>Constantes de classe (e visibilidade desde 7.1+)</h2>
      <p>
        Constantes definidas dentro da classe pertencem à classe, não à instância. Acesse com <code>::</code>.
        Desde o PHP 7.1 você pode aplicar visibilidade a elas — útil para esconder configurações internas.
      </p>

      <p><strong className="text-[#8993BE] font-mono">::</strong> — operador de resolução de escopo (<em>scope resolution operator</em>, ou <em>Paamayim Nekudotayim</em>). Acessa membros estáticos, constantes e a versão da classe pai. Sintaxe: <code>Classe::CONST</code>, <code>Classe::metodo()</code>, <code>self::X</code>, <code>parent::__construct()</code>.</p>

      <p><strong className="text-[#8993BE] font-mono">self</strong> — referência à classe atual (a que está sendo escrita), usada com <code>::</code> para acessar constantes e métodos estáticos sem repetir o nome. Sintaxe: <code>self::POR_PAGINA</code>. Diferente de <code>static</code>, é amarrada estaticamente.</p>

      <p><strong className="text-[#8993BE] font-mono">static</strong> (em métodos/propriedades) — declara um membro que pertence à classe, não à instância. Não usa <code>$this</code>. Existe pra fábricas, contadores globais e helpers. Sintaxe: <code>public static function reais(): self</code>.</p>

      <PhpBlock
        filename="http_client.php"
        code={`<?php
declare(strict_types=1);

class HttpClient {
    public const string VERSAO = '1.0';
    private const int TIMEOUT_PADRAO = 30;
    protected const array METODOS_SEGUROS = ['GET', 'HEAD', 'OPTIONS'];

    public function get(string $url): string {
        return "GET {$url} (timeout=" . self::TIMEOUT_PADRAO . 's)';
    }
}

echo HttpClient::VERSAO . PHP_EOL;       // ok — pública
echo (new HttpClient())->get('/users');

// echo HttpClient::TIMEOUT_PADRAO; // Erro: cannot access private const`}
        output={`1.0
GET /users (timeout=30s)`}
      />

      <AlertBox type="info" title="Tipos em constantes (PHP 8.3+)">
        Note o <code>public const string VERSAO</code>. Desde a 8.3 você pode (e deve) tipar constantes para
        evitar surpresas em redefinições por classes filhas.
      </AlertBox>

      <h2>Por que encapsular, em uma frase</h2>
      <p>
        <strong>Para que você possa mudar a implementação sem quebrar quem usa a classe.</strong> Se <code>$saldo</code>
        é privado e amanhã você decidir armazenar em centavos (int) em vez de reais (float), basta atualizar os
        métodos da própria classe. Se fosse público, você quebraria todo o código que escreve <code>$conta-&gt;saldo</code>
        por aí.
      </p>

      <PhpBlock
        filename="encapsulamento.php"
        code={`<?php
declare(strict_types=1);

final class Dinheiro {
    private function __construct(
        private readonly int $centavos,
        public readonly string $moeda,
    ) {}

    public static function reais(float $valor): self {
        return new self((int) round($valor * 100), 'BRL');
    }

    public function somar(Dinheiro $outro): self {
        if ($this->moeda !== $outro->moeda) {
            throw new InvalidArgumentException('moedas diferentes');
        }
        return new self($this->centavos + $outro->centavos, $this->moeda);
    }

    public function formatado(): string {
        return sprintf('R$ %.2f', $this->centavos / 100);
    }
}

$a = Dinheiro::reais(19.90);
$b = Dinheiro::reais(0.10);
echo $a->somar($b)->formatado();`}
        output={`R$ 20.00`}
      />

      <p>
        O usuário da classe nem sabe que internamente armazenamos centavos como inteiros (evitando os clássicos
        problemas de ponto flutuante com dinheiro). Esse é o ganho real do encapsulamento: liberdade de implementação.
      </p>

      <p>
        No próximo capítulo a gente reusa comportamento entre classes parecidas com <strong>herança</strong> — e
        descobre por que ela é uma faca de dois gumes.
      </p>
    </PageContainer>
  );
}
