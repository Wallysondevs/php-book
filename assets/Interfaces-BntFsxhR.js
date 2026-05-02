import{j as e}from"./index-Bb4MiiJL.js";import{P as r,A as o,a}from"./AlertBox-BpD-xIsb.js";import{T as s}from"./TerminalBlock-DGurMC1r.js";function c(){return e.jsxs(r,{title:"Interfaces",subtitle:"Contratos sem implementação: interface declara o que uma classe sabe fazer, mas não o como. É a chave para baixo acoplamento, testes e arquiteturas plugáveis.",difficulty:"intermediario",timeToRead:"11 min",category:"POO",children:[e.jsx(o,{type:"info",title:"Pré-requisitos",children:e.jsxs("p",{children:["Antes deste capítulo, é bom já ter visto: ",e.jsx("a",{href:"#/classes",className:"text-[#8993BE] underline",children:"Classes e Objetos"}),", ",e.jsx("a",{href:"#/visibilidade",className:"text-[#8993BE] underline",children:"Visibilidade"})," e ",e.jsx("a",{href:"#/heranca",className:"text-[#8993BE] underline",children:"Herança"}),"."]})}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"interface"})," — declara um contrato de métodos públicos sem implementação. Existe pra desacoplar quem usa de quem implementa. Sintaxe: ",e.jsxs("code",{children:["interface Logger ","{ public function info(string $m): void; }"]}),". Não pode ser instanciada com ",e.jsx("code",{children:"new"}),"."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"abstract"})," — modificador para classes/métodos parcialmente implementados. ",e.jsx("code",{children:"abstract class"})," não pode ser instanciada; ",e.jsx("code",{children:"abstract function"})," não tem corpo e obriga a filha concreta a implementar. Sintaxe: ",e.jsxs("code",{children:["abstract class Forma2D ","{ abstract public function area(): float; }"]}),"."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"instanceof"})," — operador booleano que testa se um objeto é instância de uma classe ou implementa uma interface. Existe pra checar tipo em runtime. Sintaxe: ",e.jsx("code",{children:"if ($obj instanceof Lavavel) { ... }"}),"."]}),e.jsx("h2",{children:"O problema: código grudado na implementação"}),e.jsxs("p",{children:["Você escreveu um ",e.jsx("code",{children:"UsuarioService"})," que usa ",e.jsx("code",{children:"MySQLUsuarioRepository"})," diretamente. Hora de trocar para PostgreSQL. Hora de testar sem banco. Hora de cachear em memória. Toda mudança vira refatoração em cascata. ",e.jsx("strong",{children:"Interface"})," resolve isso: o serviço depende de uma ",e.jsx("em",{children:"promessa"}),"(“existe quem saiba salvar usuário”), não de uma classe específica."]}),e.jsx("h2",{children:"Anatomia de uma interface"}),e.jsxs("p",{children:["Uma ",e.jsx("code",{children:"interface"})," declara assinaturas de métodos públicos — sem corpo. Quem implementa promete cumprir o contrato. Constantes podem aparecer; propriedades, não (até PHP 8.4 só métodos e constantes)."]}),e.jsx(a,{filename:"src/Repository/UsuarioRepository.php",code:`<?php
declare(strict_types=1);

interface UsuarioRepository {
    public const int LIMITE_PADRAO = 50;

    public function buscarPorId(string $id): ?Usuario;
    public function salvar(Usuario $usuario): void;
    public function listar(int $limite = self::LIMITE_PADRAO): array;
}`}),e.jsxs("p",{children:["Tudo aqui é ",e.jsx("em",{children:"público por definição"})," — não faz sentido contrato privado. Métodos não têm corpo. Você não instancia uma interface; você implementa."]}),e.jsx("h2",{children:"Implementando: várias estratégias, uma interface"}),e.jsx(a,{filename:"src/Repository/PdoUsuarioRepository.php",code:`<?php
declare(strict_types=1);

final class Usuario {
    public function __construct(
        public readonly string $id,
        public readonly string $nome,
    ) {}
}

interface UsuarioRepository {
    public function buscarPorId(string $id): ?Usuario;
    public function salvar(Usuario $usuario): void;
    public function listar(int $limite = 50): array;
}

final class PdoUsuarioRepository implements UsuarioRepository {
    public function __construct(private PDO $pdo) {}

    public function buscarPorId(string $id): ?Usuario {
        $stmt = $this->pdo->prepare('SELECT id, nome FROM usuarios WHERE id = ?');
        $stmt->execute([$id]);
        $row = $stmt->fetch(PDO::FETCH_ASSOC);
        return $row ? new Usuario($row['id'], $row['nome']) : null;
    }

    public function salvar(Usuario $u): void {
        $this->pdo->prepare('INSERT INTO usuarios (id, nome) VALUES (?, ?)')
                  ->execute([$u->id, $u->nome]);
    }

    public function listar(int $limite = 50): array {
        $stmt = $this->pdo->prepare('SELECT id, nome FROM usuarios LIMIT ?');
        $stmt->execute([$limite]);
        return array_map(
            fn(array $r) => new Usuario($r['id'], $r['nome']),
            $stmt->fetchAll(PDO::FETCH_ASSOC),
        );
    }
}`}),e.jsx("p",{children:"Em testes você não quer banco real. Cria uma versão em memória — implementando a mesma interface:"}),e.jsx(a,{filename:"src/Repository/InMemoryUsuarioRepository.php",code:`<?php
declare(strict_types=1);

final class InMemoryUsuarioRepository implements UsuarioRepository {
    /** @var array<string, Usuario> */
    private array $dados = [];

    public function buscarPorId(string $id): ?Usuario {
        return $this->dados[$id] ?? null;
    }

    public function salvar(Usuario $u): void {
        $this->dados[$u->id] = $u;
    }

    public function listar(int $limite = 50): array {
        return array_slice(array_values($this->dados), 0, $limite);
    }
}

$repo = new InMemoryUsuarioRepository();
$repo->salvar(new Usuario('u-1', 'Ada'));
$repo->salvar(new Usuario('u-2', 'Linus'));

foreach ($repo->listar() as $u) {
    echo "{$u->id} → {$u->nome}\\n";
}`,output:`u-1 → Ada
u-2 → Linus`}),e.jsx("p",{children:"Quem usa o repositório nem sabe (nem deveria saber) qual versão recebeu:"}),e.jsx(a,{filename:"src/UsuarioService.php",code:`<?php
declare(strict_types=1);

final class UsuarioService {
    public function __construct(private UsuarioRepository $repo) {}

    public function cadastrar(string $nome): Usuario {
        $u = new Usuario(bin2hex(random_bytes(4)), $nome);
        $this->repo->salvar($u);
        return $u;
    }
}

// produção: $service = new UsuarioService(new PdoUsuarioRepository($pdo));
// teste:   $service = new UsuarioService(new InMemoryUsuarioRepository());

$service = new UsuarioService(new InMemoryUsuarioRepository());
$novo = $service->cadastrar('Grace Hopper');
echo "criado: {$novo->id} - {$novo->nome}";`,output:"criado: 9f3a7b21 - Grace Hopper"}),e.jsxs(o,{type:"success",title:"Inversão de dependência (o D do SOLID)",children:["Módulos de alto nível (",e.jsx("code",{children:"UsuarioService"}),") não devem depender de módulos de baixo nível (",e.jsx("code",{children:"PdoUsuarioRepository"}),"). Ambos dependem de uma abstração — a interface."]}),e.jsx("h2",{children:"Implementando múltiplas interfaces"}),e.jsxs("p",{children:["Diferente de classes (uma única pai), uma classe pode implementar ",e.jsx("strong",{children:"quantas interfaces quiser"}),". Isso é como dizer “esse objeto sabe fazer tudo isso aqui”."]}),e.jsx(a,{filename:"cache.php",code:`<?php
declare(strict_types=1);

interface Lavavel { public function lavar(): void; }
interface Secavel { public function secar(): void; }
interface Passavel { public function passar(): void; }

final class Camisa implements Lavavel, Secavel, Passavel {
    public function __construct(public readonly string $cor) {}
    public function lavar(): void  { echo "lavando camisa {$this->cor}\\n"; }
    public function secar(): void  { echo "secando camisa {$this->cor}\\n"; }
    public function passar(): void { echo "passando camisa {$this->cor}\\n"; }
}

$c = new Camisa('azul');

if ($c instanceof Lavavel)  { $c->lavar(); }
if ($c instanceof Passavel) { $c->passar(); }`,output:`lavando camisa azul
passando camisa azul`}),e.jsx("h2",{children:"Interface herda de interface"}),e.jsxs("p",{children:["Interfaces também podem estender outras (com ",e.jsx("code",{children:"extends"}),") e até várias ao mesmo tempo. É como compor contratos maiores a partir de menores."]}),e.jsx(a,{filename:"leitura_escrita.php",code:`<?php
declare(strict_types=1);

interface Lavel  { public function ler(string $chave): ?string; }
interface Escrevel { public function escrever(string $chave, string $valor): void; }

interface Cache extends Lavel, Escrevel {
    public function limpar(): void;
}

final class CacheMemoria implements Cache {
    private array $store = [];
    public function ler(string $c): ?string { return $this->store[$c] ?? null; }
    public function escrever(string $c, string $v): void { $this->store[$c] = $v; }
    public function limpar(): void { $this->store = []; }
}

$cache = new CacheMemoria();
$cache->escrever('saudacao', 'olá mundo');
echo $cache->ler('saudacao');`,output:"olá mundo"}),e.jsx("h2",{children:"Interface vs classe abstrata: quando cada uma?"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Interface"})," = contrato puro. Sem código, sem estado. Use quando precisar dizer apenas",e.jsx("em",{children:"“o que”"}),", e várias hierarquias diferentes podem cumprir o contrato."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Classe abstrata"})," = contrato + implementação parcial compartilhada. Use quando classes filhas têm muito código em comum (template method)."]}),e.jsxs("li",{children:["Você pode ",e.jsx("strong",{children:"implementar muitas interfaces"}),", mas só pode ",e.jsx("strong",{children:"herdar de uma classe"}),"(abstrata ou não)."]})]}),e.jsx(a,{filename:"quando_usar.php",code:`<?php
declare(strict_types=1);

// Interface: só o contrato
interface FormaGeometrica {
    public function area(): float;
}

// Classe abstrata: contrato + comportamento concreto compartilhado
abstract class Forma2D implements FormaGeometrica {
    public function __construct(public readonly string $nome) {}

    public function descricao(): string {
        return sprintf('%s com área %.2f', $this->nome, $this->area());
    }

    // cada filha implementa essa
    abstract public function area(): float;
}

final class Quadrado extends Forma2D {
    public function __construct(public readonly float $lado) {
        parent::__construct('Quadrado');
    }
    public function area(): float { return $this->lado ** 2; }
}

echo (new Quadrado(5))->descricao();`,output:"Quadrado com área 25.00"}),e.jsx("h2",{children:"Pacotes reais que vivem de interfaces"}),e.jsxs("p",{children:["Quase todo framework moderno gira em torno de interfaces PSR (PHP Standards Recommendations) — Logger, Cache, Container, HTTP. Quando você instala Monolog via Composer, está recebendo uma implementação de",e.jsx("code",{children:"Psr\\Log\\LoggerInterface"}),":"]}),e.jsx(s,{user:"dev",host:"php",cwd:"~/projetos/api",command:"composer require monolog/monolog psr/log",output:`Using version ^3.7 for monolog/monolog
Using version ^3.0 for psr/log
./composer.json has been updated
Generating autoload files`}),e.jsx(a,{filename:"logging.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use Monolog\\Logger;
use Monolog\\Handler\\StreamHandler;
use Psr\\Log\\LoggerInterface;

final class Servico {
    public function __construct(private LoggerInterface $logger) {}

    public function executar(): void {
        $this->logger->info('serviço iniciado');
    }
}

$logger = new Logger('app');
$logger->pushHandler(new StreamHandler('php://stdout'));

(new Servico($logger))->executar();`,output:"[2025-01-15T10:00:00.000+00:00] app.INFO: serviço iniciado [] []"}),e.jsxs("p",{children:["Amanhã, se você quiser trocar Monolog por outro logger, basta que ele implemente a mesma",e.jsx("code",{children:"LoggerInterface"}),". Seu ",e.jsx("code",{children:"Servico"})," nem percebe."]}),e.jsxs("p",{children:["No próximo capítulo: ",e.jsx("strong",{children:"traits"})," — o jeito do PHP de compartilhar pedaços de código entre classes que não compartilham herança."]})]})}export{c as default};
