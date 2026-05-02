import{j as e}from"./index-Bb4MiiJL.js";import{P as a,A as o,a as s}from"./AlertBox-BpD-xIsb.js";function t(){return e.jsxs(a,{title:"Visibilidade e Encapsulamento",subtitle:"public, protected, private, propriedades readonly e constantes de classe — as ferramentas para você dizer ao mundo o que pode tocar e o que está fora dos limites.",difficulty:"intermediario",timeToRead:"10 min",category:"POO",children:[e.jsx(o,{type:"info",title:"Pré-requisitos",children:e.jsxs("p",{children:["Antes deste capítulo, é bom já ter visto: ",e.jsx("a",{href:"#/classes",className:"text-[#8993BE] underline",children:"Classes e Objetos"})," e ",e.jsx("a",{href:"#/funcoes",className:"text-[#8993BE] underline",children:"Funções"}),"."]})}),e.jsx("h2",{children:"O problema: tudo público é uma armadilha"}),e.jsxs("p",{children:["Quando toda propriedade é ",e.jsx("code",{children:"public"}),", qualquer parte do programa pode mexer no estado interno do objeto. Resultado: invariantes quebradas, bugs intermitentes, e refatorar vira pesadelo. ",e.jsx("strong",{children:"Encapsular"})," é decidir o que é interface (público) e o que é implementação (escondido)."]}),e.jsx(s,{filename:"ruim.php",code:`<?php
declare(strict_types=1);

class Conta {
    public float $saldo = 0.0;
}

$c = new Conta();
$c->saldo = -1_000_000; // ninguém impede!
echo $c->saldo;`,output:"-1000000"}),e.jsxs("p",{children:["A regra de negócio (",e.jsx("em",{children:"saldo nunca pode ficar negativo"}),") ficou só na cabeça do dev. A classe não a defende."]}),e.jsx("h2",{children:"Os três modificadores"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"public"})," — acessível de qualquer lugar (padrão se você não escrever nada)."]}),e.jsxs("li",{children:[e.jsx("code",{children:"protected"})," — acessível dentro da classe e em classes que herdam dela."]}),e.jsxs("li",{children:[e.jsx("code",{children:"private"})," — acessível ",e.jsx("strong",{children:"apenas"})," dentro da própria classe que declarou."]})]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"readonly"})," — modificador (PHP 8.1+) que torna uma propriedade gravável apenas uma vez, dentro do construtor. Existe pra modelar Value Objects imutáveis sem ter que escrever getters. Sintaxe: ",e.jsx("code",{children:"public readonly string $nome;"}),"."]}),e.jsx(s,{filename:"conta.php",code:`<?php
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

// $c->saldo = -1_000_000;  // Erro: Cannot access private property`,output:"150"}),e.jsxs("p",{children:["Agora a única forma de mexer no saldo é passando pelos métodos ",e.jsx("code",{children:"depositar()"})," e ",e.jsx("code",{children:"sacar()"}),", que protegem as regras. A propriedade ",e.jsx("code",{children:"$saldo"})," é detalhe de implementação."]}),e.jsx("h2",{children:"Getters e setters: úteis, mas sem fanatismo"}),e.jsxs("p",{children:["Em outras linguagens (Java, C#) é comum criar ",e.jsx("code",{children:"getX()"}),"/",e.jsx("code",{children:"setX()"})," para tudo. Em PHP moderno a recomendação é mais sutil: ",e.jsx("strong",{children:"exponha intenção, não estado bruto"}),". Se um valor nunca muda, use",e.jsx("code",{children:"readonly"}),". Se muda sob regras, exponha métodos com nomes do domínio (",e.jsx("code",{children:"depositar"}),") em vez de ",e.jsx("code",{children:"setSaldo"}),"."]}),e.jsx(s,{filename:"usuario.php",code:`<?php
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
echo $u->email();`,output:"ada@new.com"}),e.jsxs("h2",{children:["Propriedades ",e.jsx("code",{children:"readonly"})," (PHP 8.1+)"]}),e.jsxs("p",{children:["Marcar uma propriedade como ",e.jsx("code",{children:"readonly"})," diz ao PHP: ",e.jsx("em",{children:"essa propriedade só pode ser escrita uma vez, no construtor"}),". Combina perfeitamente com o constructor promotion para criar objetos imutáveis."]}),e.jsx(s,{filename:"endereco.php",code:`<?php
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
}`,output:`Recife
Erro: Cannot modify readonly property Endereco::$cidade`}),e.jsxs(o,{type:"success",title:"Imutabilidade por padrão",children:["Para Value Objects (Endereço, Dinheiro, CPF, Coordenada) ",e.jsxs("strong",{children:["sempre prefira ",e.jsx("code",{children:"readonly"})]}),". Objetos imutáveis são thread-safe, fáceis de cachear, fáceis de testar."]}),e.jsx("h2",{children:"Constantes de classe (e visibilidade desde 7.1+)"}),e.jsxs("p",{children:["Constantes definidas dentro da classe pertencem à classe, não à instância. Acesse com ",e.jsx("code",{children:"::"}),". Desde o PHP 7.1 você pode aplicar visibilidade a elas — útil para esconder configurações internas."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"::"})," — operador de resolução de escopo (",e.jsx("em",{children:"scope resolution operator"}),", ou ",e.jsx("em",{children:"Paamayim Nekudotayim"}),"). Acessa membros estáticos, constantes e a versão da classe pai. Sintaxe: ",e.jsx("code",{children:"Classe::CONST"}),", ",e.jsx("code",{children:"Classe::metodo()"}),", ",e.jsx("code",{children:"self::X"}),", ",e.jsx("code",{children:"parent::__construct()"}),"."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"self"})," — referência à classe atual (a que está sendo escrita), usada com ",e.jsx("code",{children:"::"})," para acessar constantes e métodos estáticos sem repetir o nome. Sintaxe: ",e.jsx("code",{children:"self::POR_PAGINA"}),". Diferente de ",e.jsx("code",{children:"static"}),", é amarrada estaticamente."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"static"})," (em métodos/propriedades) — declara um membro que pertence à classe, não à instância. Não usa ",e.jsx("code",{children:"$this"}),". Existe pra fábricas, contadores globais e helpers. Sintaxe: ",e.jsx("code",{children:"public static function reais(): self"}),"."]}),e.jsx(s,{filename:"http_client.php",code:`<?php
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

// echo HttpClient::TIMEOUT_PADRAO; // Erro: cannot access private const`,output:`1.0
GET /users (timeout=30s)`}),e.jsxs(o,{type:"info",title:"Tipos em constantes (PHP 8.3+)",children:["Note o ",e.jsx("code",{children:"public const string VERSAO"}),". Desde a 8.3 você pode (e deve) tipar constantes para evitar surpresas em redefinições por classes filhas."]}),e.jsx("h2",{children:"Por que encapsular, em uma frase"}),e.jsxs("p",{children:[e.jsx("strong",{children:"Para que você possa mudar a implementação sem quebrar quem usa a classe."})," Se ",e.jsx("code",{children:"$saldo"}),"é privado e amanhã você decidir armazenar em centavos (int) em vez de reais (float), basta atualizar os métodos da própria classe. Se fosse público, você quebraria todo o código que escreve ",e.jsx("code",{children:"$conta->saldo"}),"por aí."]}),e.jsx(s,{filename:"encapsulamento.php",code:`<?php
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
echo $a->somar($b)->formatado();`,output:"R$ 20.00"}),e.jsx("p",{children:"O usuário da classe nem sabe que internamente armazenamos centavos como inteiros (evitando os clássicos problemas de ponto flutuante com dinheiro). Esse é o ganho real do encapsulamento: liberdade de implementação."}),e.jsxs("p",{children:["No próximo capítulo a gente reusa comportamento entre classes parecidas com ",e.jsx("strong",{children:"herança"})," — e descobre por que ela é uma faca de dois gumes."]})]})}export{t as default};
