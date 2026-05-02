import{j as e}from"./index-Bb4MiiJL.js";import{P as i,a,A as o}from"./AlertBox-BpD-xIsb.js";import{T as r}from"./TerminalBlock-DGurMC1r.js";function d(){return e.jsxs(i,{title:"Readonly & Constructor Promotion",subtitle:"Duas features pequenas que mudam radicalmente como você escreve DTOs, value objects e entidades imutáveis no PHP moderno.",difficulty:"intermediario",timeToRead:"10 min",category:"PHP Moderno",children:[e.jsx("h2",{children:"O problema: classes simples com 30 linhas de boilerplate"}),e.jsxs("p",{children:["No PHP antigo, criar uma classe imutável de três campos exigia: declarar propriedades, declarar parâmetros do construtor, atribuir um a um. Toda essa cerimônia para algo que, semanticamente, é um ",e.jsx("em",{children:"record"}),"."]}),e.jsx(a,{filename:"legado.php",code:`<?php
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
}`}),e.jsxs("p",{children:["O PHP 8.0 introduziu ",e.jsx("strong",{children:"constructor property promotion"})," e o 8.1 adicionou ",e.jsx("strong",{children:"readonly properties"}),". A mesma classe vira praticamente um one-liner — sem perder tipagem nem imutabilidade."]}),e.jsx("h2",{children:"Constructor promotion (PHP 8.0)"}),e.jsxs("p",{children:["A ideia é simples: marcar um parâmetro do construtor com"," ",e.jsx("code",{children:"public"}),", ",e.jsx("code",{children:"protected"})," ou ",e.jsx("code",{children:"private"})," faz o PHP declarar a propriedade ",e.jsx("em",{children:"e"})," atribuir o valor automaticamente."]}),e.jsx(a,{filename:"promotion.php",code:`<?php
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
echo $e->cep . PHP_EOL;`,output:`Recife
50000-000`}),e.jsx(o,{type:"info",title:"O que ganhei?",children:e.jsxs("ul",{className:"list-disc ml-5 mt-1 space-y-1",children:[e.jsx("li",{children:"Uma única lista de campos — fim da duplicação."}),e.jsx("li",{children:"Argumentos nomeados ficam ainda mais legíveis."}),e.jsx("li",{children:"O IDE entende: rename, find-usages, refactor — tudo funciona."})]})}),e.jsx("h2",{children:"Misturando promoted e propriedades comuns"}),e.jsx("p",{children:"Você não precisa promover tudo. Propriedades calculadas ou inicializadas depois continuam declaradas no corpo da classe. Pode também adicionar lógica no construtor (validação) — basta abrir o bloco depois da lista."}),e.jsx(a,{filename:"misto.php",code:`<?php
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

echo "{$c->nome} — CPF {$c->cpf->formatado()} — {$c->idade} anos" . PHP_EOL;`,output:"Ada Lovelace — CPF 123.456.789-09 — 18 anos"}),e.jsx("h2",{children:"readonly properties (PHP 8.1)"}),e.jsxs("p",{children:["A palavra-chave ",e.jsx("code",{children:"readonly"})," trava a propriedade após a primeira atribuição (que tem que acontecer no escopo declarante — geralmente o construtor). Tentar reatribuir resulta em ",e.jsx("code",{children:"Error"}),"."]}),e.jsx(a,{filename:"readonly.php",code:`<?php
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
}`,output:`-8.05, -34.9
erro: Cannot modify readonly property CoordenadaGeografica::$latitude`}),e.jsxs("p",{children:["A combinação ",e.jsx("code",{children:"public readonly"})," é o mais comum: a propriedade é acessível de fora (DTO transparente) mas ninguém consegue mexer depois de criada. Garante imutabilidade ",e.jsx("em",{children:"de verdade"}),", sem precisar esconder atrás de getters."]}),e.jsxs(o,{type:"warning",title:"Readonly e objetos: cuidado",children:[e.jsx("code",{children:"readonly"})," impede reatribuir a ",e.jsx("strong",{children:"referência"}),", não congela o objeto interno. Se a propriedade é um ",e.jsx("code",{children:"array"})," ou um objeto mutável, o conteúdo dele continua mutável. Para imutabilidade profunda, use objetos readonly recursivamente ou estruturas imutáveis."]}),e.jsx("h2",{children:"readonly classes (PHP 8.2)"}),e.jsxs("p",{children:["Quando ",e.jsx("em",{children:"todas"})," as propriedades de uma classe deveriam ser readonly, repetir a palavra-chave em cada uma vira ruído. O PHP 8.2 introduziu o modificador a nível de classe: ",e.jsx("code",{children:"readonly class"})," torna toda propriedade tipada da classe automaticamente readonly."]}),e.jsx(a,{filename:"readonly-class.php",code:`<?php
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

echo $total->format() . PHP_EOL;`,output:"114,90 BRL"}),e.jsxs("p",{children:["Note que ",e.jsx("code",{children:"somar()"})," retorna uma ",e.jsx("strong",{children:"nova instância"}),' em vez de mutar a atual — o jeito idiomático de trabalhar com readonly. Esse padrão (objeto imutável + métodos "with") elimina toda uma classe de bugs de aliasing.']}),e.jsx(o,{type:"success",title:"Quando usar cada um",children:e.jsxs("ul",{className:"list-disc ml-5 mt-1 space-y-1",children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Promotion"}),": praticamente sempre. Exceto quando a propriedade exige inicialização tardia."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"readonly por propriedade"}),": para campos que não podem mudar, mantendo outros mutáveis."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"readonly class"}),": DTOs, value objects, eventos, mensagens — tudo que representa um fato fechado."]})]})}),e.jsx("h2",{children:"Restrições importantes"}),e.jsxs("ul",{children:[e.jsxs("li",{children:["Propriedades readonly precisam ser ",e.jsx("strong",{children:"tipadas"}),". O tipo é o que permite ao PHP saber qual valor faz sentido inicializar."]}),e.jsxs("li",{children:["Não pode ser ",e.jsx("code",{children:"static"}),": ",e.jsx("code",{children:"readonly"})," é por instância."]}),e.jsx("li",{children:"Não pode ter valor padrão na declaração — só inicialização no construtor (ou via reflection, que reseta o flag)."}),e.jsxs("li",{children:[e.jsx("code",{children:"clone"})," respeita readonly: em PHP 8.3+ você pode reatribuir dentro de ",e.jsx("code",{children:"__clone()"})," usando uma sintaxe específica para clonagem profunda."]})]}),e.jsx("h2",{children:"Exemplo de DTO completo: pronto para serializar"}),e.jsx(a,{filename:"dto.php",code:`<?php
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

echo json_encode($dto) . PHP_EOL;`,output:'{"nome":"Linus","email":"linus@kernel.org","idade":54}'}),e.jsx("h2",{children:"Comparação direta: antes e depois"}),e.jsx(a,{filename:"comparacao.php",code:`<?php
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

echo "menos código, mais segurança" . PHP_EOL;`,output:"menos código, mais segurança"}),e.jsx("h2",{children:"Rodando os exemplos"}),e.jsx(r,{user:"dev",host:"php",cwd:"~/projetos/dto",command:"php -v",output:`PHP 8.4.1 (cli)
Copyright (c) The PHP Group`}),e.jsx(r,{user:"dev",host:"php",cwd:"~/projetos/dto",command:"php dto.php",output:'{"nome":"Linus","email":"linus@kernel.org","idade":54}'}),e.jsxs("p",{children:["Promotion + readonly são o atalho moderno para escrever menos boilerplate sem abrir mão de tipagem ou imutabilidade. No próximo capítulo a gente fala sobre ",e.jsx("strong",{children:"nullsafe"})," e ",e.jsx("strong",{children:"match"}),", dois operadores que mudam como você lida com cadeias de chamadas que podem retornar null."]})]})}export{d as default};
