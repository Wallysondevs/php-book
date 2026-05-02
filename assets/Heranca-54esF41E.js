import{j as e}from"./index-Bb4MiiJL.js";import{P as r,A as o,a}from"./AlertBox-BpD-xIsb.js";function n(){return e.jsxs(r,{title:"Herança",subtitle:"extends, parent::, override, final, polimorfismo — e o motivo pelo qual a comunidade hoje grita 'composição em vez de herança'.",difficulty:"intermediario",timeToRead:"12 min",category:"POO",children:[e.jsx(o,{type:"info",title:"Pré-requisitos",children:e.jsxs("p",{children:["Antes deste capítulo, é bom já ter visto: ",e.jsx("a",{href:"#/classes",className:"text-[#8993BE] underline",children:"Classes e Objetos"})," e ",e.jsx("a",{href:"#/visibilidade",className:"text-[#8993BE] underline",children:"Visibilidade"}),"."]})}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"extends"}),' — declara que uma classe herda propriedades e métodos de outra (a "pai"). Existe pra reaproveitar código quando há relação clara ',e.jsx("em",{children:'"é um"'}),". Sintaxe: ",e.jsxs("code",{children:["class Filha extends Pai ","{}"]}),". Cada classe só pode estender uma única classe."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"parent"})," — palavra-chave que se refere à classe pai dentro de uma filha, sempre usada com ",e.jsx("code",{children:"::"}),". Existe pra você poder chamar a versão original do método que sobrescreveu. Sintaxe: ",e.jsx("code",{children:"parent::__construct(...)"}),", ",e.jsx("code",{children:"parent::metodo()"}),"."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"final"})," — modificador que impede sobrescrita. ",e.jsx("code",{children:"final class"})," não pode ser estendida; ",e.jsx("code",{children:"final function"})," não pode ser sobrescrita por filhas. Existe pra travar invariantes do design. Sintaxe: ",e.jsxs("code",{children:["final class Cpf ","{}"]}),"."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"interface"})," (no contexto de implementação) — contrato puro: lista métodos que a classe promete implementar. Diferente de ",e.jsx("code",{children:"extends"}),", você pode implementar várias. Sintaxe: ",e.jsxs("code",{children:["class Foo implements Bar, Baz ","{}"]}),". Detalhe completo no próximo capítulo."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"implements"})," — diz que a classe cumpre uma ou mais ",e.jsx("code",{children:"interface"}),"s. Sintaxe: ",e.jsxs("code",{children:["class ConsoleLogger implements Logger ","{}"]}),". Aceita lista separada por vírgula."]}),e.jsx("h2",{children:"O problema: classes parecidas com código duplicado"}),e.jsxs("p",{children:["Você tem uma classe ",e.jsx("code",{children:"Funcionario"})," e precisa criar ",e.jsx("code",{children:"Gerente"}),". Quase tudo é igual: nome, salário, método de cálculo de imposto. Só muda que gerentes têm um bônus. Copiar tudo é insano.",e.jsx("strong",{children:"Herança"})," permite dizer: ",e.jsx("em",{children:"“Gerente é um Funcionario, mas com algumas adições/mudanças”."})]}),e.jsx(a,{filename:"funcionario.php",code:`<?php
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
echo $g->descricao();`,output:`Ada ganha R$ 4.250,00
Linus ganha R$ 8.800,00`}),e.jsx("p",{children:"Três conceitos fundamentais nesse exemplo:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"extends"})," — declara que ",e.jsx("code",{children:"Gerente"})," herda de ",e.jsx("code",{children:"Funcionario"}),"."]}),e.jsxs("li",{children:[e.jsx("code",{children:"parent::"})," — chama um método/construtor da classe pai."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Override"})," — ",e.jsx("code",{children:"Gerente"})," redefiniu ",e.jsx("code",{children:"salarioLiquido()"}),", mas o método herdado ",e.jsx("code",{children:"descricao()"})," continua chamando a versão certa graças ao polimorfismo."]})]}),e.jsx("h2",{children:"Polimorfismo na prática"}),e.jsxs("p",{children:["Polimorfismo é a capacidade de tratar objetos de tipos diferentes pela mesma interface — e cada um responder do seu jeito. Quando você passa ",e.jsx("code",{children:"Gerente"})," para uma função que espera ",e.jsx("code",{children:"Funcionario"}),", tudo funciona."]}),e.jsx(a,{filename:"folha.php",code:`<?php
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

printf("Folha total: R$ %.2f", folhaTotal($equipe));`,output:"Folha total: R$ 13800.00"}),e.jsxs("p",{children:["A função ",e.jsx("code",{children:"folhaTotal()"})," não sabe (e não precisa saber) qual subclasse está recebendo. Cada objeto executa ",e.jsx("em",{children:"sua versão"})," de ",e.jsx("code",{children:"salarioLiquido()"}),". Esse é o coração do polimorfismo."]}),e.jsxs("h2",{children:[e.jsx("code",{children:"final"}),": travando portas"]}),e.jsxs("p",{children:["Use ",e.jsx("code",{children:"final class"})," para impedir que alguém herde da sua classe. Use ",e.jsx("code",{children:"final function"})," para impedir que uma classe filha sobrescreva um método específico. É uma forma de proteger invariantes."]}),e.jsx(a,{filename:"moeda.php",code:`<?php
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

// PHP Fatal error: Class CpfFalso cannot extend final class Cpf`,output:"PHP Fatal error: Class CpfFalso cannot extend final class Cpf"}),e.jsxs(o,{type:"info",title:"Final por padrão?",children:["Vários autores (Matthias Noback, Marco Pivetta) defendem marcar ",e.jsx("strong",{children:"todas"})," as classes da sua aplicação como ",e.jsx("code",{children:"final"}),". Quem precisar estender é forçado a justificar removendo o final. Você protege o design e ganha liberdade de refatorar internamente."]}),e.jsx("h2",{children:"O lado escuro: hierarquias profundas"}),e.jsxs("p",{children:["Herança parece linda no exemplo de ",e.jsx("code",{children:"Animal -> Cachorro"}),". Em sistemas reais, ela apodrece rápido. Imagine essa cadeia:"]}),e.jsx(a,{filename:"hierarquia_problemática.php",code:`<?php
declare(strict_types=1);

class Veiculo {}
class VeiculoMotorizado extends Veiculo {}
class Carro extends VeiculoMotorizado {}
class CarroEletrico extends Carro {}
class CarroEletricoEsportivo extends CarroEletrico {}
class CarroEletricoEsportivoConversivel extends CarroEletricoEsportivo {}

// E quando aparecer uma "moto elétrica esportiva"?
// Ou um "carro híbrido conversível"?
// A árvore não consegue representar combinações.`}),e.jsx("p",{children:"Os problemas reais:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Acoplamento forte:"})," mudar a classe pai quebra todas as filhas."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Combinação explosiva:"})," herança modela hierarquia única; o mundo real tem combinações."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Frágil base class problem:"})," adicionar método na base pode silenciosamente sobrescrever algo numa filha distante."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Difícil de testar:"})," a filha herda comportamento que talvez você nem queira no teste."]})]}),e.jsx("h2",{children:"Composição: a alternativa moderna"}),e.jsxs("p",{children:["Em vez de dizer “Notificador ",e.jsx("em",{children:"é um"})," Logger”, diga “Notificador ",e.jsx("em",{children:"tem um"})," Logger”. Você passa as dependências via construtor (constructor injection) e ganha flexibilidade absurda."]}),e.jsx(a,{filename:"composicao.php",code:`<?php
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
$n->notificar('ada@exemplo.com', 'Bem-vinda!');`,output:"[info] enviando 'Bem-vinda!' para ada@exemplo.com"}),e.jsxs("p",{children:["Quer trocar para um logger que escreve em arquivo? Cria uma ",e.jsx("code",{children:"FileLogger"})," implementando a mesma interface e injeta. Sem mexer em ",e.jsx("code",{children:"Notificador"}),". Sem hierarquia."]}),e.jsxs(o,{type:"success",title:"A regra prática",children:[e.jsx("strong",{children:"Use herança"})," quando há uma relação clara “é um” (",e.jsx("em",{children:"is-a"}),") e o comportamento é estável.",e.jsx("strong",{children:"Prefira composição"})," quando há relação “tem um” (",e.jsx("em",{children:"has-a"}),") ou quando você precisa trocar comportamento em runtime. Na dúvida, composição."]}),e.jsx("h2",{children:"Acessando membros do pai"}),e.jsxs("p",{children:["Dentro da classe filha você usa ",e.jsx("code",{children:"parent::"})," para chamar a versão do pai (útil quando você sobrescreveu um método mas quer reaproveitar parte da lógica)."]}),e.jsx(a,{filename:"parent_call.php",code:`<?php
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

echo (new Cachorro())->descrever();`,output:"sou um animal — mais especificamente, um cachorro"}),e.jsxs("p",{children:["Herança ainda tem seu lugar — em ",e.jsx("strong",{children:"classes abstratas"})," usadas como template, em frameworks que precisam expor pontos de extensão. Nos próximos capítulos a gente vê ",e.jsx("strong",{children:"interfaces"}),",",e.jsx("strong",{children:"classes abstratas"})," e ",e.jsx("strong",{children:"traits"})," — e quando cada uma é a ferramenta certa."]})]})}export{n as default};
