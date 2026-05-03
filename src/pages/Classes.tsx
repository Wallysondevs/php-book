import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Classes() {
  return (
    <PageContainer
      title="Classes e Objetos"
      subtitle="Saia dos arrays associativos e entre na orientação a objetos: defina classes, instancie objetos com new, modele estado com propriedades e comportamento com métodos — tudo no estilo PHP 8.4."
      difficulty="intermediario"
      timeToRead="14 min"
      category="POO"
    >
      <AlertBox type="info" title="Pré-requisitos">
        <p>Antes deste capítulo, é bom já ter visto: <a href="#/sintaxe" className="text-[#8993BE] underline">Sintaxe básica</a>, <a href="#/variaveis" className="text-[#8993BE] underline">Variáveis</a>, <a href="#/arrays" className="text-[#8993BE] underline">Arrays</a> e <a href="#/funcoes" className="text-[#8993BE] underline">Funções</a>.</p>
      </AlertBox>
      <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"class Nome"}</strong> {' — '} {"declaração de classe; convenção PascalCase."}
          </li>
        <li>
            <strong>{"$this"}</strong> {' — '} {"referência ao objeto atual dentro de métodos de instância."}
          </li>
        <li>
            <strong>{"new Nome()"}</strong> {' — '} {"instancia a classe, chamando __construct."}
          </li>
        <li>
            <strong>{"Propriedades"}</strong> {' — '} {"public/private/protected $x — variáveis da instância."}
          </li>
        <li>
            <strong>{"self vs $this"}</strong> {' — '} {"self::CONST acessa estático/constante; $this->x é instância."}
          </li>
        </ul>
    
      <h2>O problema: arrays associativos não escalam</h2>
      <p>
        Você começa salvando um usuário num array associativo. Depois precisa validar o e-mail, formatar o nome,
        gerar um cumprimento. Em pouco tempo, você tem funções soltas operando sobre arrays e ninguém sabe mais
        a forma exata de cada estrutura. <strong>Classe</strong> é a resposta: ela junta dados (propriedades) e
        comportamento (métodos) num molde reutilizável.
      </p>

      <PhpBlock
        filename="usuario_array.php"
        code={`<?php
declare(strict_types=1);

$usuario = [
    'nome'  => 'Ada Lovelace',
    'email' => 'ada@exemplo.com',
];

function saudar(array $u): string {
    return "Olá, {$u['nome']}!";
}

echo saudar($usuario);`}
        output={`Olá, Ada Lovelace!`}
      />

      <p>
        Funciona — até alguém escrever <code>$u['name']</code> em vez de <code>'nome'</code> e o PHP ficar quieto.
        Vamos para a versão orientada a objetos.
      </p>

      <h2>Sua primeira classe</h2>
      <p>
        Use a palavra-chave <code>class</code>, declare propriedades com tipos e um construtor (<code>__construct</code>)
        para inicializá-las. <code>new</code> cria um <em>objeto</em> (uma instância da classe).
      </p>

      <p><strong className="text-[#8993BE] font-mono">class</strong> — palavra-chave que define um molde para criar objetos. Existe porque dados soltos não escalam: classe junta estado (propriedades) e comportamento (métodos). Sintaxe: <code>class Nome {`{ ... }`}</code>.</p>

      <p><strong className="text-[#8993BE] font-mono">new</strong> — operador que instancia uma classe, alocando memória e chamando <code>__construct</code>. Sintaxe: <code>$obj = new Classe($args);</code>. Cada <code>new</code> gera um objeto independente.</p>

      <p><strong className="text-[#8993BE] font-mono">$this</strong> — referência ao objeto atual, disponível dentro de métodos não estáticos. Existe porque o método precisa saber em qual instância está rodando. Sintaxe: <code>$this-&gt;propriedade</code> ou <code>$this-&gt;metodo()</code>.</p>

      <p><strong className="text-[#8993BE] font-mono">-&gt;</strong> — operador de acesso a propriedade ou método de uma instância (<em>object operator</em>). Existe porque PHP não usa ponto. Sintaxe: <code>$obj-&gt;nome</code>, <code>$obj-&gt;metodo()</code>.</p>

      <PhpBlock
        filename="src/Usuario.php"
        code={`<?php
declare(strict_types=1);

class Usuario {
    public string $nome;
    public string $email;

    public function __construct(string $nome, string $email) {
        $this->nome  = $nome;
        $this->email = $email;
    }

    public function saudar(): string {
        return "Olá, {$this->nome}!";
    }
}

$ada = new Usuario('Ada Lovelace', 'ada@exemplo.com');
echo $ada->saudar() . PHP_EOL;
echo $ada->email;`}
        output={`Olá, Ada Lovelace!
ada@exemplo.com`}
      />

      <p>
        Três coisas para gravar:
      </p>
      <ul>
        <li><code>$this</code> é a referência ao objeto atual <em>dentro</em> da classe.</li>
        <li>Você acessa propriedades e métodos do objeto com a seta <code>-&gt;</code> (e nunca com ponto).</li>
        <li>O construtor é chamado automaticamente quando você usa <code>new</code>.</li>
      </ul>

      <h2>Constructor property promotion (PHP 8.0+)</h2>
      <p>
        Repetir o nome de cada propriedade três vezes (declaração, parâmetro, atribuição) é entediante. Desde o PHP 8.0
        você pode <strong>promover</strong> os parâmetros do construtor diretamente para propriedades — basta colocar a
        visibilidade na frente do parâmetro.
      </p>

      <PhpBlock
        filename="src/Usuario.php"
        code={`<?php
declare(strict_types=1);

class Usuario {
    public function __construct(
        public string $nome,
        public string $email,
        public int $idade = 0,
    ) {}

    public function saudar(): string {
        return "Olá, {$this->nome} ({$this->idade} anos)!";
    }
}

$linus = new Usuario('Linus Torvalds', 'linus@exemplo.com', 55);
echo $linus->saudar();`}
        output={`Olá, Linus Torvalds (55 anos)!`}
      />

      <AlertBox type="success" title="Por que adotar promotion sempre">
        Menos código boilerplate, menos chance de errar uma atribuição, e o leitor vê a forma do objeto em uma única
        olhada. Esse é o estilo idiomático do PHP moderno (8.0+).
      </AlertBox>

      <h2>Múltiplas instâncias e métodos que mexem no estado</h2>
      <p>
        Cada objeto tem seu próprio conjunto de propriedades. Métodos podem ler e modificar esse estado livremente.
      </p>

      <PhpBlock
        filename="conta_corrente.php"
        code={`<?php
declare(strict_types=1);

class ContaCorrente {
    public function __construct(
        public readonly string $titular,
        private float $saldo = 0.0,
    ) {}

    public function depositar(float $valor): void {
        $this->saldo += $valor;
    }

    public function sacar(float $valor): bool {
        if ($valor > $this->saldo) {
            return false;
        }
        $this->saldo -= $valor;
        return true;
    }

    public function saldo(): float {
        return $this->saldo;
    }
}

$ada   = new ContaCorrente('Ada');
$linus = new ContaCorrente('Linus', 1000.0);

$ada->depositar(500);
$ada->depositar(200);
$linus->sacar(300);

printf("%-6s saldo: R$ %.2f\\n", $ada->titular,   $ada->saldo());
printf("%-6s saldo: R$ %.2f\\n", $linus->titular, $linus->saldo());`}
        output={`Ada    saldo: R$ 700.00
Linus  saldo: R$ 700.00`}
      />

      <p>
        Repare: <code>$ada</code> e <code>$linus</code> são objetos independentes. Mexer em um não afeta o outro.
      </p>

      <h2>O destrutor: <code>__destruct</code></h2>
      <p>
        O destrutor roda quando o objeto sai de escopo (ou no fim do script). Útil para liberar recursos como conexões,
        arquivos abertos ou locks. Na maioria das vezes você não precisa dele — PHP libera memória automaticamente.
      </p>

      <PhpBlock
        filename="arquivo_temporario.php"
        code={`<?php
declare(strict_types=1);

class ArquivoTemporario {
    private $handle;

    public function __construct(public readonly string $caminho) {
        $this->handle = fopen($caminho, 'w');
        echo "[abriu {$caminho}]\\n";
    }

    public function escrever(string $texto): void {
        fwrite($this->handle, $texto);
    }

    public function __destruct() {
        if (is_resource($this->handle)) {
            fclose($this->handle);
        }
        @unlink($this->caminho);
        echo "[fechou e removeu {$this->caminho}]\\n";
    }
}

$tmp = new ArquivoTemporario('/tmp/exemplo.txt');
$tmp->escrever('oi');
unset($tmp); // dispara __destruct imediatamente
echo "fim do script\\n";`}
        output={`[abriu /tmp/exemplo.txt]
[fechou e removeu /tmp/exemplo.txt]
fim do script`}
      />

      <h2>Métodos mágicos: <code>__toString</code>, <code>__get</code>, <code>__set</code>, <code>__call</code></h2>
      <p>
        PHP tem uma família de métodos com prefixo duplo underscore que o interpretador chama em situações especiais.
        Os mais úteis no dia a dia:
      </p>
      <ul>
        <li><code>__toString()</code> — converte o objeto para string (em <code>echo</code>, <code>print</code>, interpolação).</li>
        <li><code>__get($nome)</code> / <code>__set($nome, $valor)</code> — interceptam acesso a propriedades inexistentes.</li>
        <li><code>__call($nome, $args)</code> — intercepta chamadas a métodos inexistentes.</li>
      </ul>

      <PhpBlock
        filename="produto.php"
        code={`<?php
declare(strict_types=1);

class Produto {
    private array $extras = [];

    public function __construct(
        public readonly string $nome,
        public readonly float $preco,
    ) {}

    public function __toString(): string {
        return sprintf('%s — R$ %.2f', $this->nome, $this->preco);
    }

    public function __get(string $chave): mixed {
        return $this->extras[$chave] ?? null;
    }

    public function __set(string $chave, mixed $valor): void {
        $this->extras[$chave] = $valor;
    }

    public function __call(string $metodo, array $args): string {
        return "método {$metodo}() não existe (args: " . count($args) . ')';
    }
}

$p = new Produto('Café especial', 39.9);
echo $p . PHP_EOL;          // usa __toString

$p->cor = 'preto';            // dispara __set
echo $p->cor . PHP_EOL;       // dispara __get

echo $p->qualquerCoisa(1, 2); // dispara __call`}
        output={`Café especial — R$ 39.90
preto
método qualquerCoisa() não existe (args: 2)`}
      />

      <AlertBox type="warning" title="Métodos mágicos: use com parcimônia">
        São poderosos para DSLs e ORMs, mas <strong>matam o autocomplete</strong> e a análise estática.
        Em código de aplicação prefira propriedades e métodos explícitos. Reserve a mágica para frameworks.
      </AlertBox>

      <h2>Comparando objetos: <code>==</code> vs <code>===</code></h2>
      <p>
        Detalhe sutil: <code>==</code> compara objetos pelo conteúdo (mesma classe + mesmas propriedades),
        <code>===</code> compara <strong>identidade</strong> (a mesma instância na memória).
      </p>

      <PhpBlock
        filename="comparacao.php"
        code={`<?php
declare(strict_types=1);

class Ponto {
    public function __construct(public int $x, public int $y) {}
}

$a = new Ponto(1, 2);
$b = new Ponto(1, 2);
$c = $a;

var_dump($a == $b);   // true  — mesmo conteúdo
var_dump($a === $b);  // false — instâncias diferentes
var_dump($a === $c);  // true  — mesma instância (referência)`}
        output={`bool(true)
bool(false)
bool(true)`}
      />

      <h2>Rodando os exemplos</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/poo"
        command="php -v && php conta_corrente.php"
        output={`PHP 8.4.1 (cli) (built: Nov 21 2024 09:50:10) (NTS)
Ada    saldo: R$ 700.00
Linus  saldo: R$ 700.00`}
      />

      <p>
        Você já consegue modelar entidades com classe, construtor promovido, métodos e até um pouco de mágica.
        No próximo capítulo a gente trava as portas: <strong>visibilidade</strong> (<code>public</code>,
        <code>protected</code>, <code>private</code>) e o que significa encapsular de verdade.
      </p>
    </PageContainer>
  );
}
