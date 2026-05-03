import{j as e}from"./index-B5-q-eol.js";import{P as o,A as r,a}from"./AlertBox-CVbFLZEd.js";function s(){return e.jsxs(o,{title:"Classes Abstratas",subtitle:"Quando você tem comportamento concreto pra compartilhar mas não quer que ninguém instancie a base. abstract une o que interface não pode: contrato + implementação parcial.",difficulty:"intermediario",timeToRead:"10 min",category:"POO",children:[e.jsx(r,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"abstract class"})," "," — "," ","não pode ser instanciada diretamente."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"abstract function"})," "," — "," ","método sem corpo — força filha a implementar."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"vs interface"})," "," — "," ","classe abstrata pode ter código e estado; interface não."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Template method"})," "," — "," ","padrão clássico onde abstract define esqueleto."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"protected abstract"})," "," — "," ","comum para hooks usados internamente pela base."]})]}),e.jsx("h2",{children:"O problema: o pai que não deveria existir sozinho"}),e.jsxs("p",{children:["Você tem ",e.jsx("code",{children:"NotificadorEmail"}),", ",e.jsx("code",{children:"NotificadorSms"})," e ",e.jsx("code",{children:"NotificadorPush"}),". Todos gravam log, formatam timestamp e validam o destinatário ",e.jsx("strong",{children:"do mesmo jeito"}),". Só muda como entregam a mensagem. Faz sentido criar um ",e.jsx("code",{children:"Notificador"})," base — mas ",e.jsx("em",{children:"instanciar"})," um “notificador genérico” não faz sentido nenhum. É exatamente para isso que existe ",e.jsx("code",{children:"abstract class"}),"."]}),e.jsx(a,{filename:"src/Notificador.php",code:`<?php
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

// new Notificador('app'); // Erro: Cannot instantiate abstract class`,output:`[10:00:00] app -> ada@exemplo.com
  [email] Bem-vinda!
[10:00:00] app -> +5581999990000
  [sms] Codigo: 123`}),e.jsx("p",{children:"Três coisas mudaram em relação a uma classe normal:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"abstract class"})," — não pode ser instanciada com ",e.jsx("code",{children:"new"}),"."]}),e.jsxs("li",{children:[e.jsx("code",{children:"abstract function"})," — método sem corpo. Subclasse ",e.jsx("strong",{children:"tem"})," que implementar."]}),e.jsxs("li",{children:[e.jsx("code",{children:"final function notificar()"})," — quem herda não pode mexer no fluxo principal. Esse é o",e.jsx("strong",{children:"Template Method Pattern"}),": o pai define o esqueleto, os filhos preenchem os buracos."]})]}),e.jsx("h2",{children:"Métodos concretos compartilhados"}),e.jsxs("p",{children:["Diferente de interface, classe abstrata pode ter ",e.jsx("strong",{children:"código pronto"})," que as filhas reaproveitam sem reescrever. Tudo que é genérico vive lá em cima."]}),e.jsx(a,{filename:"forma.php",code:`<?php
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
}`,output:`Retângulo | área=20.00 | perímetro=18.00
Círculo | área=28.27 | perímetro=18.85`}),e.jsxs("p",{children:[e.jsx("code",{children:"descricao()"})," está implementado uma única vez no pai e funciona pra qualquer filha — porque ele chama ",e.jsx("code",{children:"area()"})," e ",e.jsx("code",{children:"perimetro()"}),", que cada filha sabe responder."]}),e.jsx("h2",{children:"Template Method na prática"}),e.jsxs("p",{children:["O padrão é tão comum que merece um exemplo dedicado. Imagine importadores de arquivo: o fluxo é sempre",e.jsx("em",{children:"abrir → validar → processar linha a linha → fechar"}),". Só muda como cada formato é parseado."]}),e.jsx(a,{filename:"importador.php",code:`<?php
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
echo "total: {$total}";`,output:`importando: ada@exemplo.com
importando: linus@exemplo.com
total: 2`}),e.jsxs(r,{type:"success",title:"Por que template method é tão poderoso",children:["Você protege o ",e.jsx("em",{children:"fluxo"})," (abre → valida → lê → processa → fecha) na classe base. Quem cria um novo importador (JSON, XML, Excel) não consegue esquecer um passo nem fazer fora de ordem — o pai garante."]}),e.jsx("h2",{children:"Construtor abstrato? Não exatamente"}),e.jsxs("p",{children:["Não existe ",e.jsx("code",{children:"abstract __construct"}),". Mas a abstrata ",e.jsx("em",{children:"pode"})," ter construtor próprio (e geralmente tem) — que será chamado pelas filhas com ",e.jsx("code",{children:"parent::__construct()"}),"."]}),e.jsx(a,{filename:"construtor_abstrato.php",code:`<?php
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

echo (new Carro('Toyota', 'Corolla', 4))->ficha();`,output:"[carro] Toyota Corolla"}),e.jsx("h2",{children:"Interface vs Classe Abstrata: o resumão"}),e.jsx("p",{children:"A pergunta retorna sempre. Abaixo, quando cada uma brilha:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Interface"}),": só contrato, sem código, sem estado. Você pode implementar várias por classe. Use para descrever ",e.jsx("em",{children:"capacidades"})," (",e.jsx("code",{children:"Countable"}),", ",e.jsx("code",{children:"JsonSerializable"}),",",e.jsx("code",{children:"LoggerInterface"}),")."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Classe abstrata"}),": contrato + código compartilhado + estado (propriedades, construtor). Só pode estender uma. Use para um ",e.jsx("em",{children:"tipo base"})," com fluxo comum entre filhas próximas (template method)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Combinando"}),": defina a interface, depois ofereça uma classe abstrata que implementa parte do contrato. Quem quiser tudo pronto herda da abstrata; quem quiser começar do zero implementa só a interface."]})]}),e.jsx(a,{filename:"combinando.php",code:`<?php
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
echo $cache->lerOuArmazenar('saudacao', fn() => 'NÃO VAI APARECER');`,output:`olá 10:00:00
olá 10:00:00`}),e.jsxs("p",{children:["A segunda chamada bate no cache e nem executa o callback — exatamente porque ",e.jsx("code",{children:"lerOuArmazenar()"}),"está pronto na classe abstrata e funciona pra qualquer implementação concreta."]}),e.jsxs(r,{type:"info",title:"Regra prática",children:["Comece sempre pela ",e.jsx("strong",{children:"interface"})," (descreve o que). Só promova para classe abstrata quando você tiver código ",e.jsx("em",{children:"genuinamente"})," compartilhado entre várias implementações — nunca antes."]}),e.jsxs("p",{children:["Com isso fechamos o ciclo de POO em PHP: classes, encapsulamento, herança, interfaces, traits e abstratas. Próximos capítulos atacam outros temas modernos do PHP — ",e.jsx("strong",{children:"enums"}),", ",e.jsx("strong",{children:"namespaces"}),",",e.jsx("strong",{children:"autoload via Composer"})," e por aí vai."]})]})}export{s as default};
