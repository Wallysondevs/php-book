import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Interfaces() {
  return (
    <PageContainer
      title="Interfaces"
      subtitle="Contratos sem implementação: interface declara o que uma classe sabe fazer, mas não o como. É a chave para baixo acoplamento, testes e arquiteturas plugáveis."
      difficulty="intermediario"
      timeToRead="11 min"
      category="POO"
    >
      <AlertBox type="info" title="Pré-requisitos">
        <p>Antes deste capítulo, é bom já ter visto: <a href="#/classes" className="text-[#8993BE] underline">Classes e Objetos</a>, <a href="#/visibilidade" className="text-[#8993BE] underline">Visibilidade</a> e <a href="#/heranca" className="text-[#8993BE] underline">Herança</a>.</p>
      </AlertBox>
      <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"interface"}</strong> {' — '} {"só assinaturas; sem implementação (constants permitidas)."}
          </li>
        <li>
            <strong>{"implements"}</strong> {' — '} {"class X implements I, J — múltiplas interfaces."}
          </li>
        <li>
            <strong>{"Polimorfismo"}</strong> {' — '} {"aceitar I como tipo permite trocar implementações sem mexer no código."}
          </li>
        <li>
            <strong>{"vs abstract"}</strong> {' — '} {"interface = só contratos; abstract = contratos + código parcial."}
          </li>
        <li>
            <strong>{"Constantes"}</strong> {' — '} {"interfaces podem declarar const PI = 3.14."}
          </li>
        </ul>
    
      <p><strong className="text-[#8993BE] font-mono">interface</strong> — declara um contrato de métodos públicos sem implementação. Existe pra desacoplar quem usa de quem implementa. Sintaxe: <code>interface Logger {`{ public function info(string $m): void; }`}</code>. Não pode ser instanciada com <code>new</code>.</p>

      <p><strong className="text-[#8993BE] font-mono">abstract</strong> — modificador para classes/métodos parcialmente implementados. <code>abstract class</code> não pode ser instanciada; <code>abstract function</code> não tem corpo e obriga a filha concreta a implementar. Sintaxe: <code>abstract class Forma2D {`{ abstract public function area(): float; }`}</code>.</p>

      <p><strong className="text-[#8993BE] font-mono">instanceof</strong> — operador booleano que testa se um objeto é instância de uma classe ou implementa uma interface. Existe pra checar tipo em runtime. Sintaxe: <code>{`if ($obj instanceof Lavavel) { ... }`}</code>.</p>

      <h2>O problema: código grudado na implementação</h2>
      <p>
        Você escreveu um <code>UsuarioService</code> que usa <code>MySQLUsuarioRepository</code> diretamente. Hora de
        trocar para PostgreSQL. Hora de testar sem banco. Hora de cachear em memória. Toda mudança vira refatoração
        em cascata. <strong>Interface</strong> resolve isso: o serviço depende de uma <em>promessa</em>
        (“existe quem saiba salvar usuário”), não de uma classe específica.
      </p>

      <h2>Anatomia de uma interface</h2>
      <p>
        Uma <code>interface</code> declara assinaturas de métodos públicos — sem corpo. Quem implementa promete cumprir
        o contrato. Constantes podem aparecer; propriedades, não (até PHP 8.4 só métodos e constantes).
      </p>

      <PhpBlock
        filename="src/Repository/UsuarioRepository.php"
        code={`<?php
declare(strict_types=1);

interface UsuarioRepository {
    public const int LIMITE_PADRAO = 50;

    public function buscarPorId(string $id): ?Usuario;
    public function salvar(Usuario $usuario): void;
    public function listar(int $limite = self::LIMITE_PADRAO): array;
}`}
      />

      <p>
        Tudo aqui é <em>público por definição</em> — não faz sentido contrato privado. Métodos não têm corpo. Você não
        instancia uma interface; você implementa.
      </p>

      <h2>Implementando: várias estratégias, uma interface</h2>

      <PhpBlock
        filename="src/Repository/PdoUsuarioRepository.php"
        code={`<?php
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
}`}
      />

      <p>
        Em testes você não quer banco real. Cria uma versão em memória — implementando a mesma interface:
      </p>

      <PhpBlock
        filename="src/Repository/InMemoryUsuarioRepository.php"
        code={`<?php
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
}`}
        output={`u-1 → Ada
u-2 → Linus`}
      />

      <p>
        Quem usa o repositório nem sabe (nem deveria saber) qual versão recebeu:
      </p>

      <PhpBlock
        filename="src/UsuarioService.php"
        code={`<?php
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
echo "criado: {$novo->id} - {$novo->nome}";`}
        output={`criado: 9f3a7b21 - Grace Hopper`}
      />

      <AlertBox type="success" title="Inversão de dependência (o D do SOLID)">
        Módulos de alto nível (<code>UsuarioService</code>) não devem depender de módulos de baixo nível
        (<code>PdoUsuarioRepository</code>). Ambos dependem de uma abstração — a interface.
      </AlertBox>

      <h2>Implementando múltiplas interfaces</h2>
      <p>
        Diferente de classes (uma única pai), uma classe pode implementar <strong>quantas interfaces quiser</strong>.
        Isso é como dizer “esse objeto sabe fazer tudo isso aqui”.
      </p>

      <PhpBlock
        filename="cache.php"
        code={`<?php
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
if ($c instanceof Passavel) { $c->passar(); }`}
        output={`lavando camisa azul
passando camisa azul`}
      />

      <h2>Interface herda de interface</h2>
      <p>
        Interfaces também podem estender outras (com <code>extends</code>) e até várias ao mesmo tempo. É como compor
        contratos maiores a partir de menores.
      </p>

      <PhpBlock
        filename="leitura_escrita.php"
        code={`<?php
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
echo $cache->ler('saudacao');`}
        output={`olá mundo`}
      />

      <h2>Interface vs classe abstrata: quando cada uma?</h2>
      <ul>
        <li>
          <strong>Interface</strong> = contrato puro. Sem código, sem estado. Use quando precisar dizer apenas
          <em>“o que”</em>, e várias hierarquias diferentes podem cumprir o contrato.
        </li>
        <li>
          <strong>Classe abstrata</strong> = contrato + implementação parcial compartilhada. Use quando classes filhas
          têm muito código em comum (template method).
        </li>
        <li>
          Você pode <strong>implementar muitas interfaces</strong>, mas só pode <strong>herdar de uma classe</strong>
          (abstrata ou não).
        </li>
      </ul>

      <PhpBlock
        filename="quando_usar.php"
        code={`<?php
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

echo (new Quadrado(5))->descricao();`}
        output={`Quadrado com área 25.00`}
      />

      <h2>Pacotes reais que vivem de interfaces</h2>
      <p>
        Quase todo framework moderno gira em torno de interfaces PSR (PHP Standards Recommendations) — Logger,
        Cache, Container, HTTP. Quando você instala Monolog via Composer, está recebendo uma implementação de
        <code>Psr\Log\LoggerInterface</code>:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/api"
        command="composer require monolog/monolog psr/log"
        output={`Using version ^3.7 for monolog/monolog
Using version ^3.0 for psr/log
./composer.json has been updated
Generating autoload files`}
      />

      <PhpBlock
        filename="logging.php"
        code={`<?php
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

(new Servico($logger))->executar();`}
        output={`[2025-01-15T10:00:00.000+00:00] app.INFO: serviço iniciado [] []`}
      />

      <p>
        Amanhã, se você quiser trocar Monolog por outro logger, basta que ele implemente a mesma
        <code>LoggerInterface</code>. Seu <code>Servico</code> nem percebe.
      </p>

      <p>
        No próximo capítulo: <strong>traits</strong> — o jeito do PHP de compartilhar pedaços de código entre classes
        que não compartilham herança.
      </p>
    </PageContainer>
  );
}
