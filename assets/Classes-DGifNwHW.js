import{j as e}from"./index-Bb4MiiJL.js";import{P as s,A as a,a as o}from"./AlertBox-BpD-xIsb.js";import{T as r}from"./TerminalBlock-DGurMC1r.js";function c(){return e.jsxs(s,{title:"Classes e Objetos",subtitle:"Saia dos arrays associativos e entre na orientação a objetos: defina classes, instancie objetos com new, modele estado com propriedades e comportamento com métodos — tudo no estilo PHP 8.4.",difficulty:"intermediario",timeToRead:"14 min",category:"POO",children:[e.jsx(a,{type:"info",title:"Pré-requisitos",children:e.jsxs("p",{children:["Antes deste capítulo, é bom já ter visto: ",e.jsx("a",{href:"#/sintaxe",className:"text-[#8993BE] underline",children:"Sintaxe básica"}),", ",e.jsx("a",{href:"#/variaveis",className:"text-[#8993BE] underline",children:"Variáveis"}),", ",e.jsx("a",{href:"#/arrays",className:"text-[#8993BE] underline",children:"Arrays"})," e ",e.jsx("a",{href:"#/funcoes",className:"text-[#8993BE] underline",children:"Funções"}),"."]})}),e.jsx("h2",{children:"O problema: arrays associativos não escalam"}),e.jsxs("p",{children:["Você começa salvando um usuário num array associativo. Depois precisa validar o e-mail, formatar o nome, gerar um cumprimento. Em pouco tempo, você tem funções soltas operando sobre arrays e ninguém sabe mais a forma exata de cada estrutura. ",e.jsx("strong",{children:"Classe"})," é a resposta: ela junta dados (propriedades) e comportamento (métodos) num molde reutilizável."]}),e.jsx(o,{filename:"usuario_array.php",code:`<?php
declare(strict_types=1);

$usuario = [
    'nome'  => 'Ada Lovelace',
    'email' => 'ada@exemplo.com',
];

function saudar(array $u): string {
    return "Olá, {$u['nome']}!";
}

echo saudar($usuario);`,output:"Olá, Ada Lovelace!"}),e.jsxs("p",{children:["Funciona — até alguém escrever ",e.jsx("code",{children:"$u['name']"})," em vez de ",e.jsx("code",{children:"'nome'"})," e o PHP ficar quieto. Vamos para a versão orientada a objetos."]}),e.jsx("h2",{children:"Sua primeira classe"}),e.jsxs("p",{children:["Use a palavra-chave ",e.jsx("code",{children:"class"}),", declare propriedades com tipos e um construtor (",e.jsx("code",{children:"__construct"}),") para inicializá-las. ",e.jsx("code",{children:"new"})," cria um ",e.jsx("em",{children:"objeto"})," (uma instância da classe)."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"class"})," — palavra-chave que define um molde para criar objetos. Existe porque dados soltos não escalam: classe junta estado (propriedades) e comportamento (métodos). Sintaxe: ",e.jsxs("code",{children:["class Nome ","{ ... }"]}),"."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"new"})," — operador que instancia uma classe, alocando memória e chamando ",e.jsx("code",{children:"__construct"}),". Sintaxe: ",e.jsx("code",{children:"$obj = new Classe($args);"}),". Cada ",e.jsx("code",{children:"new"})," gera um objeto independente."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"$this"})," — referência ao objeto atual, disponível dentro de métodos não estáticos. Existe porque o método precisa saber em qual instância está rodando. Sintaxe: ",e.jsx("code",{children:"$this->propriedade"})," ou ",e.jsx("code",{children:"$this->metodo()"}),"."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"->"})," — operador de acesso a propriedade ou método de uma instância (",e.jsx("em",{children:"object operator"}),"). Existe porque PHP não usa ponto. Sintaxe: ",e.jsx("code",{children:"$obj->nome"}),", ",e.jsx("code",{children:"$obj->metodo()"}),"."]}),e.jsx(o,{filename:"src/Usuario.php",code:`<?php
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
echo $ada->email;`,output:`Olá, Ada Lovelace!
ada@exemplo.com`}),e.jsx("p",{children:"Três coisas para gravar:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"$this"})," é a referência ao objeto atual ",e.jsx("em",{children:"dentro"})," da classe."]}),e.jsxs("li",{children:["Você acessa propriedades e métodos do objeto com a seta ",e.jsx("code",{children:"->"})," (e nunca com ponto)."]}),e.jsxs("li",{children:["O construtor é chamado automaticamente quando você usa ",e.jsx("code",{children:"new"}),"."]})]}),e.jsx("h2",{children:"Constructor property promotion (PHP 8.0+)"}),e.jsxs("p",{children:["Repetir o nome de cada propriedade três vezes (declaração, parâmetro, atribuição) é entediante. Desde o PHP 8.0 você pode ",e.jsx("strong",{children:"promover"})," os parâmetros do construtor diretamente para propriedades — basta colocar a visibilidade na frente do parâmetro."]}),e.jsx(o,{filename:"src/Usuario.php",code:`<?php
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
echo $linus->saudar();`,output:"Olá, Linus Torvalds (55 anos)!"}),e.jsx(a,{type:"success",title:"Por que adotar promotion sempre",children:"Menos código boilerplate, menos chance de errar uma atribuição, e o leitor vê a forma do objeto em uma única olhada. Esse é o estilo idiomático do PHP moderno (8.0+)."}),e.jsx("h2",{children:"Múltiplas instâncias e métodos que mexem no estado"}),e.jsx("p",{children:"Cada objeto tem seu próprio conjunto de propriedades. Métodos podem ler e modificar esse estado livremente."}),e.jsx(o,{filename:"conta_corrente.php",code:`<?php
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
printf("%-6s saldo: R$ %.2f\\n", $linus->titular, $linus->saldo());`,output:`Ada    saldo: R$ 700.00
Linus  saldo: R$ 700.00`}),e.jsxs("p",{children:["Repare: ",e.jsx("code",{children:"$ada"})," e ",e.jsx("code",{children:"$linus"})," são objetos independentes. Mexer em um não afeta o outro."]}),e.jsxs("h2",{children:["O destrutor: ",e.jsx("code",{children:"__destruct"})]}),e.jsx("p",{children:"O destrutor roda quando o objeto sai de escopo (ou no fim do script). Útil para liberar recursos como conexões, arquivos abertos ou locks. Na maioria das vezes você não precisa dele — PHP libera memória automaticamente."}),e.jsx(o,{filename:"arquivo_temporario.php",code:`<?php
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
echo "fim do script\\n";`,output:`[abriu /tmp/exemplo.txt]
[fechou e removeu /tmp/exemplo.txt]
fim do script`}),e.jsxs("h2",{children:["Métodos mágicos: ",e.jsx("code",{children:"__toString"}),", ",e.jsx("code",{children:"__get"}),", ",e.jsx("code",{children:"__set"}),", ",e.jsx("code",{children:"__call"})]}),e.jsx("p",{children:"PHP tem uma família de métodos com prefixo duplo underscore que o interpretador chama em situações especiais. Os mais úteis no dia a dia:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"__toString()"})," — converte o objeto para string (em ",e.jsx("code",{children:"echo"}),", ",e.jsx("code",{children:"print"}),", interpolação)."]}),e.jsxs("li",{children:[e.jsx("code",{children:"__get($nome)"})," / ",e.jsx("code",{children:"__set($nome, $valor)"})," — interceptam acesso a propriedades inexistentes."]}),e.jsxs("li",{children:[e.jsx("code",{children:"__call($nome, $args)"})," — intercepta chamadas a métodos inexistentes."]})]}),e.jsx(o,{filename:"produto.php",code:`<?php
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

echo $p->qualquerCoisa(1, 2); // dispara __call`,output:`Café especial — R$ 39.90
preto
método qualquerCoisa() não existe (args: 2)`}),e.jsxs(a,{type:"warning",title:"Métodos mágicos: use com parcimônia",children:["São poderosos para DSLs e ORMs, mas ",e.jsx("strong",{children:"matam o autocomplete"})," e a análise estática. Em código de aplicação prefira propriedades e métodos explícitos. Reserve a mágica para frameworks."]}),e.jsxs("h2",{children:["Comparando objetos: ",e.jsx("code",{children:"=="})," vs ",e.jsx("code",{children:"==="})]}),e.jsxs("p",{children:["Detalhe sutil: ",e.jsx("code",{children:"=="})," compara objetos pelo conteúdo (mesma classe + mesmas propriedades),",e.jsx("code",{children:"==="})," compara ",e.jsx("strong",{children:"identidade"})," (a mesma instância na memória)."]}),e.jsx(o,{filename:"comparacao.php",code:`<?php
declare(strict_types=1);

class Ponto {
    public function __construct(public int $x, public int $y) {}
}

$a = new Ponto(1, 2);
$b = new Ponto(1, 2);
$c = $a;

var_dump($a == $b);   // true  — mesmo conteúdo
var_dump($a === $b);  // false — instâncias diferentes
var_dump($a === $c);  // true  — mesma instância (referência)`,output:`bool(true)
bool(false)
bool(true)`}),e.jsx("h2",{children:"Rodando os exemplos"}),e.jsx(r,{user:"dev",host:"php",cwd:"~/projetos/poo",command:"php -v && php conta_corrente.php",output:`PHP 8.4.1 (cli) (built: Nov 21 2024 09:50:10) (NTS)
Ada    saldo: R$ 700.00
Linus  saldo: R$ 700.00`}),e.jsxs("p",{children:["Você já consegue modelar entidades com classe, construtor promovido, métodos e até um pouco de mágica. No próximo capítulo a gente trava as portas: ",e.jsx("strong",{children:"visibilidade"})," (",e.jsx("code",{children:"public"}),",",e.jsx("code",{children:"protected"}),", ",e.jsx("code",{children:"private"}),") e o que significa encapsular de verdade."]})]})}export{c as default};
