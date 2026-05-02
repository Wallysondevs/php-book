import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function ReadonlyPromotion() {
  return (
    <PageContainer
      title="Readonly & Constructor Promotion"
      subtitle="Duas features pequenas que mudam radicalmente como você escreve DTOs, value objects e entidades imutáveis no PHP moderno."
      difficulty="intermediario"
      timeToRead="10 min"
      category="PHP Moderno"
    >
      <h2>O problema: classes simples com 30 linhas de boilerplate</h2>
      <p>
        No PHP antigo, criar uma classe imutável de três campos exigia: declarar
        propriedades, declarar parâmetros do construtor, atribuir um a um. Toda essa
        cerimônia para algo que, semanticamente, é um <em>record</em>.
      </p>

      <PhpBlock
        filename="legado.php"
        code={`<?php
declare(strict_types=1);

class Endereco {
    private string $rua;
    private string $cidade;
    private string $cep;

    public function __construct(string $rua, string $cidade, string $cep) {
        $this->rua    = $rua;
        $this->cidade = $cidade;
        $this->cep    = $cep;
    }

    public function getRua(): string    { return $this->rua; }
    public function getCidade(): string { return $this->cidade; }
    public function getCep(): string    { return $this->cep; }
}`}
      />

      <p>
        O PHP 8.0 introduziu <strong>constructor property promotion</strong> e o 8.1
        adicionou <strong>readonly properties</strong>. A mesma classe vira
        praticamente um one-liner — sem perder tipagem nem imutabilidade.
      </p>

      <h2>Constructor promotion (PHP 8.0)</h2>
      <p>
        A ideia é simples: marcar um parâmetro do construtor com{" "}
        <code>public</code>, <code>protected</code> ou <code>private</code> faz o PHP
        declarar a propriedade <em>e</em> atribuir o valor automaticamente.
      </p>

      <PhpBlock
        filename="promotion.php"
        code={`<?php
declare(strict_types=1);

class Endereco {
    public function __construct(
        public string $rua,
        public string $cidade,
        public string $cep,
    ) {}
}

$e = new Endereco(
    rua:    "Rua das Flores, 123",
    cidade: "Recife",
    cep:    "50000-000",
);

echo $e->cidade . PHP_EOL;
echo $e->cep . PHP_EOL;`}
        output={`Recife
50000-000`}
      />

      <AlertBox type="info" title="O que ganhei?">
        <ul className="list-disc ml-5 mt-1 space-y-1">
          <li>Uma única lista de campos — fim da duplicação.</li>
          <li>Argumentos nomeados ficam ainda mais legíveis.</li>
          <li>O IDE entende: rename, find-usages, refactor — tudo funciona.</li>
        </ul>
      </AlertBox>

      <h2>Misturando promoted e propriedades comuns</h2>
      <p>
        Você não precisa promover tudo. Propriedades calculadas ou inicializadas
        depois continuam declaradas no corpo da classe. Pode também adicionar lógica
        no construtor (validação) — basta abrir o bloco depois da lista.
      </p>

      <PhpBlock
        filename="misto.php"
        code={`<?php
declare(strict_types=1);

final class Cpf {
    private string $valor;

    public function __construct(string $valor) {
        $apenasDigitos = preg_replace("/\\D/", "", $valor);
        if (strlen($apenasDigitos) !== 11) {
            throw new InvalidArgumentException("CPF deve ter 11 dígitos");
        }
        $this->valor = $apenasDigitos;
    }

    public function formatado(): string {
        return substr($this->valor, 0, 3) . "."
             . substr($this->valor, 3, 3) . "."
             . substr($this->valor, 6, 3) . "-"
             . substr($this->valor, 9, 2);
    }
}

class Cliente {
    public function __construct(
        public string $nome,
        public Cpf    $cpf,
        public int    $idade = 18,        // valor padrão
    ) {}
}

$c = new Cliente(
    nome: "Ada Lovelace",
    cpf:  new Cpf("123.456.789-09"),
);

echo "{$c->nome} — CPF {$c->cpf->formatado()} — {$c->idade} anos" . PHP_EOL;`}
        output={`Ada Lovelace — CPF 123.456.789-09 — 18 anos`}
      />

      <h2>readonly properties (PHP 8.1)</h2>
      <p>
        A palavra-chave <code>readonly</code> trava a propriedade após a primeira
        atribuição (que tem que acontecer no escopo declarante — geralmente o
        construtor). Tentar reatribuir resulta em <code>Error</code>.
      </p>

      <PhpBlock
        filename="readonly.php"
        code={`<?php
declare(strict_types=1);

final class CoordenadaGeografica {
    public function __construct(
        public readonly float $latitude,
        public readonly float $longitude,
    ) {}
}

$ponto = new CoordenadaGeografica(latitude: -8.05, longitude: -34.9);
echo "{$ponto->latitude}, {$ponto->longitude}" . PHP_EOL;

try {
    $ponto->latitude = 0.0;
} catch (Error $e) {
    echo "erro: " . $e->getMessage() . PHP_EOL;
}`}
        output={`-8.05, -34.9
erro: Cannot modify readonly property CoordenadaGeografica::$latitude`}
      />

      <p>
        A combinação <code>public readonly</code> é o mais comum: a propriedade é
        acessível de fora (DTO transparente) mas ninguém consegue mexer depois de
        criada. Garante imutabilidade <em>de verdade</em>, sem precisar esconder
        atrás de getters.
      </p>

      <AlertBox type="warning" title="Readonly e objetos: cuidado">
        <code>readonly</code> impede reatribuir a <strong>referência</strong>, não
        congela o objeto interno. Se a propriedade é um <code>array</code> ou um
        objeto mutável, o conteúdo dele continua mutável. Para imutabilidade
        profunda, use objetos readonly recursivamente ou estruturas imutáveis.
      </AlertBox>

      <h2>readonly classes (PHP 8.2)</h2>
      <p>
        Quando <em>todas</em> as propriedades de uma classe deveriam ser readonly,
        repetir a palavra-chave em cada uma vira ruído. O PHP 8.2 introduziu o
        modificador a nível de classe: <code>readonly class</code> torna toda
        propriedade tipada da classe automaticamente readonly.
      </p>

      <PhpBlock
        filename="readonly-class.php"
        code={`<?php
declare(strict_types=1);

readonly final class Money {
    public function __construct(
        public int    $centavos,
        public string $moeda = "BRL",
    ) {
        if ($centavos < 0) {
            throw new InvalidArgumentException("valor não pode ser negativo");
        }
    }

    public function somar(Money $outro): Money {
        if ($this->moeda !== $outro->moeda) {
            throw new DomainException("moedas incompatíveis");
        }
        return new Money($this->centavos + $outro->centavos, $this->moeda);
    }

    public function format(): string {
        return number_format($this->centavos / 100, 2, ",", ".") . " " . $this->moeda;
    }
}

$preco  = new Money(centavos: 9990);
$frete  = new Money(centavos: 1500);
$total  = $preco->somar($frete);

echo $total->format() . PHP_EOL;`}
        output={`114,90 BRL`}
      />

      <p>
        Note que <code>somar()</code> retorna uma <strong>nova instância</strong> em
        vez de mutar a atual — o jeito idiomático de trabalhar com readonly. Esse
        padrão (objeto imutável + métodos &quot;with&quot;) elimina toda uma classe de
        bugs de aliasing.
      </p>

      <AlertBox type="success" title="Quando usar cada um">
        <ul className="list-disc ml-5 mt-1 space-y-1">
          <li><strong>Promotion</strong>: praticamente sempre. Exceto quando a propriedade exige inicialização tardia.</li>
          <li><strong>readonly por propriedade</strong>: para campos que não podem mudar, mantendo outros mutáveis.</li>
          <li><strong>readonly class</strong>: DTOs, value objects, eventos, mensagens — tudo que representa um fato fechado.</li>
        </ul>
      </AlertBox>

      <h2>Restrições importantes</h2>
      <ul>
        <li>
          Propriedades readonly precisam ser <strong>tipadas</strong>. O tipo é o que
          permite ao PHP saber qual valor faz sentido inicializar.
        </li>
        <li>
          Não pode ser <code>static</code>: <code>readonly</code> é por instância.
        </li>
        <li>
          Não pode ter valor padrão na declaração — só inicialização no construtor (ou
          via reflection, que reseta o flag).
        </li>
        <li>
          <code>clone</code> respeita readonly: em PHP 8.3+ você pode reatribuir
          dentro de <code>__clone()</code> usando uma sintaxe específica para
          clonagem profunda.
        </li>
      </ul>

      <h2>Exemplo de DTO completo: pronto para serializar</h2>
      <PhpBlock
        filename="dto.php"
        code={`<?php
declare(strict_types=1);

readonly final class CriarUsuarioDTO {
    public function __construct(
        public string $nome,
        public string $email,
        public int    $idade,
    ) {
        if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
            throw new InvalidArgumentException("email inválido: $email");
        }
        if ($idade < 0 || $idade > 130) {
            throw new InvalidArgumentException("idade fora do intervalo");
        }
    }

    public static function deArray(array $dados): self {
        return new self(
            nome:  (string) ($dados["nome"]  ?? ""),
            email: (string) ($dados["email"] ?? ""),
            idade: (int)    ($dados["idade"] ?? 0),
        );
    }
}

$dto = CriarUsuarioDTO::deArray([
    "nome"  => "Linus",
    "email" => "linus@kernel.org",
    "idade" => 54,
]);

echo json_encode($dto) . PHP_EOL;`}
        output={`{"nome":"Linus","email":"linus@kernel.org","idade":54}`}
      />

      <h2>Comparação direta: antes e depois</h2>
      <PhpBlock
        filename="comparacao.php"
        code={`<?php
declare(strict_types=1);

// PHP 7 — 22 linhas
class EnderecoLegado {
    private string $rua;
    private string $cidade;
    private string $cep;
    public function __construct(string $rua, string $cidade, string $cep) {
        $this->rua    = $rua;
        $this->cidade = $cidade;
        $this->cep    = $cep;
    }
    public function getRua(): string    { return $this->rua; }
    public function getCidade(): string { return $this->cidade; }
    public function getCep(): string    { return $this->cep; }
}

// PHP 8.2+ — 6 linhas, imutável de verdade
readonly final class Endereco {
    public function __construct(
        public string $rua,
        public string $cidade,
        public string $cep,
    ) {}
}

echo "menos código, mais segurança" . PHP_EOL;`}
        output={`menos código, mais segurança`}
      />

      <h2>Rodando os exemplos</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/dto"
        command="php -v"
        output={`PHP 8.4.1 (cli)
Copyright (c) The PHP Group`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/dto"
        command="php dto.php"
        output={`{"nome":"Linus","email":"linus@kernel.org","idade":54}`}
      />

      <p>
        Promotion + readonly são o atalho moderno para escrever menos boilerplate
        sem abrir mão de tipagem ou imutabilidade. No próximo capítulo a gente fala
        sobre <strong>nullsafe</strong> e <strong>match</strong>, dois operadores que
        mudam como você lida com cadeias de chamadas que podem retornar null.
      </p>
    </PageContainer>
  );
}
