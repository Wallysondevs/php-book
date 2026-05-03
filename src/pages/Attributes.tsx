import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Attributes() {
  return (
    <PageContainer
      title="Attributes (PHP 8.0)"
      subtitle="Metadados estruturados anexados a classes, métodos e propriedades — a base moderna de routing, validação, ORMs e DI no Symfony, Laravel e Doctrine."
      difficulty="avancado"
      timeToRead="12 min"
      category="PHP Moderno"
    >
      <AlertBox type="info" title="Pré-requisitos">
          <p>Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP.</p>
        </AlertBox>
        <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"#[Attribute]"}</strong> {' — '} {"metadados estruturados em classes/métodos/props."}
          </li>
        <li>
            <strong>{"Compile-time"}</strong> {' — '} {"parsed mas não executados sem reflection."}
          </li>
        <li>
            <strong>{"vs annotations"}</strong> {' — '} {"sintaxe nativa, sem doc-comment hack."}
          </li>
        <li>
            <strong>{"Uso comum"}</strong> {' — '} {"rotas, validação, ORM mapping (Doctrine, Symfony)."}
          </li>
        <li>
            <strong>{"Targets"}</strong> {' — '} {"#[Attribute(Attribute::TARGET_METHOD)] limita onde se aplica."}
          </li>
        </ul>
          <h2>O problema: docblocks como código disfarçado de comentário</h2>
      <p>
        Antes do PHP 8, frameworks como Symfony e Doctrine guardavam metadados em
        comentários DocBlock. Funciona, mas é frágil: o IDE não checa, um typo passa
        batido, e ferramentas tinham que parsear strings para entender a sua
        intenção.
      </p>

      <PhpBlock
        filename="legado.php"
        code={`<?php
declare(strict_types=1);

class UserController {
    /**
     * @Route("/usuarios/{id}", methods={"GET"})
     */
    public function show(int $id): void {
        // ...
    }
}`}
      />

      <p>
        Com <strong>Attributes</strong>, esses metadados viram código real:
        a sintaxe <code>#[Attr(args)]</code> é parseada pelo PHP, validada na hora e
        consultável via <code>Reflection</code>.
      </p>

      <h2>A sintaxe nova: #[Attr(args)]</h2>
      <p>
        Um attribute é uma <strong>classe comum</strong> marcada com{" "}
        <code>#[Attribute]</code>. Você instancia ela escrevendo{" "}
        <code>#[NomeDaClasse(...)]</code> logo acima do alvo (classe, método,
        propriedade, parâmetro, constante, função).
      </p>

      <PhpBlock
        filename="primeiro.php"
        code={`<?php
declare(strict_types=1);

#[Attribute]
class Route {
    public function __construct(
        public string $path,
        public string $method = "GET",
    ) {}
}

class UserController {
    #[Route("/usuarios/{id}", method: "GET")]
    public function show(int $id): string {
        return "user $id";
    }

    #[Route("/usuarios", method: "POST")]
    public function create(): string {
        return "criado";
    }
}

echo "controller pronto" . PHP_EOL;`}
        output={`controller pronto`}
      />

      <AlertBox type="info" title="Quem executa os attributes?">
        Por padrão <strong>ninguém</strong>. Attributes são metadados passivos: o PHP
        os armazena junto do alvo, mas só ganham vida quando algum código (um router,
        um validador, o framework) usa <code>ReflectionAttribute</code> para
        inspecioná-los.
      </AlertBox>

      <h2>Lendo attributes com Reflection</h2>
      <p>
        A API <code>ReflectionClass</code> / <code>ReflectionMethod</code> ganhou o
        método <code>getAttributes()</code>, que devolve um array de{" "}
        <code>ReflectionAttribute</code>. Chame <code>-&gt;newInstance()</code> para
        materializar o attribute como objeto.
      </p>

      <PhpBlock
        filename="router.php"
        code={`<?php
declare(strict_types=1);

#[Attribute]
class Route {
    public function __construct(
        public string $path,
        public string $method = "GET",
    ) {}
}

class UserController {
    #[Route("/usuarios/{id}", method: "GET")]
    public function show(int $id): string {
        return "user $id";
    }

    #[Route("/usuarios", method: "POST")]
    public function create(): string {
        return "criado";
    }
}

$ref = new ReflectionClass(UserController::class);

foreach ($ref->getMethods() as $m) {
    foreach ($m->getAttributes(Route::class) as $attr) {
        $route = $attr->newInstance();
        printf("%-4s %-25s -> %s::%s()\\n",
            $route->method, $route->path,
            $ref->getShortName(), $m->getName()
        );
    }
}`}
        output={`GET  /usuarios/{id}          -> UserController::show()
POST /usuarios               -> UserController::create()`}
      />

      <p>
        Esse loop de cinco linhas é, em essência, como Symfony e Laravel
        descobrem rotas declaradas no estilo attribute. Cada framework adiciona
        cache e DI, mas o coração é Reflection + <code>newInstance()</code>.
      </p>

      <h2>Restringindo onde o attribute pode aparecer</h2>
      <p>
        O attribute <code>#[Attribute]</code> aceita flags que limitam o alvo. Se você
        tentar usar fora do escopo permitido, o PHP avisa em runtime ao chamar{" "}
        <code>newInstance()</code>.
      </p>

      <PhpBlock
        filename="alvo.php"
        code={`<?php
declare(strict_types=1);

// só pode ser usado em métodos, e várias vezes no mesmo método
#[Attribute(Attribute::TARGET_METHOD | Attribute::IS_REPEATABLE)]
class Cache {
    public function __construct(public int $ttl) {}
}

class Relatorio {
    #[Cache(ttl: 60)]
    #[Cache(ttl: 3600)]
    public function totais(): array {
        return [];
    }
}

$m = new ReflectionMethod(Relatorio::class, "totais");
foreach ($m->getAttributes(Cache::class) as $a) {
    echo "ttl: " . $a->newInstance()->ttl . PHP_EOL;
}`}
        output={`ttl: 60
ttl: 3600`}
      />

      <p>As flags principais:</p>
      <ul>
        <li><code>TARGET_CLASS</code> — só em classes.</li>
        <li><code>TARGET_METHOD</code> — métodos e funções.</li>
        <li><code>TARGET_PROPERTY</code> — propriedades.</li>
        <li><code>TARGET_PARAMETER</code> — parâmetros de método/função.</li>
        <li><code>TARGET_ALL</code> — em qualquer lugar (padrão).</li>
        <li><code>IS_REPEATABLE</code> — pode aparecer mais de uma vez no mesmo alvo.</li>
      </ul>

      <h2>Validação declarativa: criando um attribute útil</h2>
      <p>
        Vamos construir um mini validador inspirado em <code>symfony/validator</code>.
        Você marca propriedades com regras e o validador as inspeciona via Reflection.
      </p>

      <PhpBlock
        filename="validador.php"
        code={`<?php
declare(strict_types=1);

#[Attribute(Attribute::TARGET_PROPERTY)]
class NotBlank {}

#[Attribute(Attribute::TARGET_PROPERTY)]
class Length {
    public function __construct(public int $min, public int $max) {}
}

class Cadastro {
    #[NotBlank]
    #[Length(min: 3, max: 30)]
    public string $nome = "";

    #[NotBlank]
    public string $email = "";
}

function validar(object $obj): array {
    $erros = [];
    $ref   = new ReflectionObject($obj);

    foreach ($ref->getProperties() as $prop) {
        $valor = $prop->getValue($obj);
        foreach ($prop->getAttributes() as $attr) {
            $regra = $attr->newInstance();
            if ($regra instanceof NotBlank && trim((string) $valor) === "") {
                $erros[] = "{$prop->getName()}: não pode ser vazio";
            }
            if ($regra instanceof Length) {
                $len = mb_strlen((string) $valor);
                if ($len < $regra->min || $len > $regra->max) {
                    $erros[] = "{$prop->getName()}: tamanho fora de [{$regra->min}, {$regra->max}]";
                }
            }
        }
    }
    return $erros;
}

$c = new Cadastro();
$c->nome  = "Jo";
$c->email = "";

foreach (validar($c) as $e) {
    echo "- $e" . PHP_EOL;
}`}
        output={`- nome: tamanho fora de [3, 30]
- email: não pode ser vazio`}
      />

      <AlertBox type="success" title="Por que isso é poderoso">
        As regras vivem <strong>juntas</strong> da propriedade que descrevem. Quando
        você renomeia o campo, refatora ou apaga, as regras vão junto. Acabaram-se os
        arquivos YAML/XML separados e dessincronizados do código.
      </AlertBox>

      <h2>Argumentos: nomeados, padrões e tipados</h2>
      <p>
        Como o attribute é uma classe normal, você ganha de graça: argumentos
        nomeados, valores padrão, tipos e até validação no construtor. Isso elimina
        toda a categoria de bugs que existia em DocBlocks.
      </p>

      <PhpBlock
        filename="tipados.php"
        code={`<?php
declare(strict_types=1);

#[Attribute]
class Coluna {
    public function __construct(
        public string $nome,
        public string $tipo = "VARCHAR(255)",
        public bool   $nullable = false,
    ) {
        if (!preg_match("/^[a-z_][a-z0-9_]*$/", $nome)) {
            throw new InvalidArgumentException("nome de coluna inválido: $nome");
        }
    }
}

class Usuario {
    #[Coluna(nome: "id", tipo: "BIGINT", nullable: false)]
    public int $id = 0;

    #[Coluna(nome: "email")]
    public string $email = "";
}

$ref = new ReflectionClass(Usuario::class);
foreach ($ref->getProperties() as $p) {
    foreach ($p->getAttributes(Coluna::class) as $a) {
        $col = $a->newInstance();
        printf("%-10s %s%s\\n",
            $col->nome,
            $col->tipo,
            $col->nullable ? " NULL" : " NOT NULL"
        );
    }
}`}
        output={`id         BIGINT NOT NULL
email      VARCHAR(255) NOT NULL`}
      />

      <h2>Comparação rápida: DocBlock vs Attribute</h2>
      <ul>
        <li>
          <strong>Validação</strong>: DocBlock falha em runtime com mensagem confusa;
          attribute falha na hora com erro do PHP.
        </li>
        <li>
          <strong>IDE/refactor</strong>: attribute é classe — autocomplete, rename,
          find-usages funcionam. DocBlock é string opaca.
        </li>
        <li>
          <strong>Performance</strong>: Reflection nativa é mais rápida que parsear
          docblock com regex toda execução.
        </li>
        <li>
          <strong>Distribuição</strong>: attributes funcionam em qualquer projeto PHP
          8+ sem dependência extra.
        </li>
      </ul>

      <AlertBox type="warning" title="Pegadinha clássica">
        O parser do PHP enxerga <code>#[Attr]</code> como attribute, mas em PHP 7
        seria interpretado como comentário (<code>#</code> = comment). Se o seu
        código precisa rodar em ambos, mantenha attributes em arquivos que <em>só</em>{" "}
        são carregados em PHP 8+ — ou simplesmente exija PHP 8.4 no{" "}
        <code>composer.json</code>.
      </AlertBox>

      <h2>Verificando suporte e rodando</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/attrs"
        command="php -v"
        output={`PHP 8.4.1 (cli)
Copyright (c) The PHP Group
Zend Engine v4.4.1`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/attrs"
        command="php router.php"
        output={`GET  /usuarios/{id}          -> UserController::show()
POST /usuarios               -> UserController::create()`}
      />

      <h2>Onde você vai encontrar attributes na prática</h2>
      <ul>
        <li><strong>Symfony</strong> — <code>#[Route]</code>, <code>#[AsCommand]</code>, <code>#[AsEventListener]</code>.</li>
        <li><strong>Laravel</strong> — <code>#[Scope]</code>, <code>#[ObservedBy]</code>, attributes de validação.</li>
        <li><strong>Doctrine ORM 3</strong> — <code>#[Entity]</code>, <code>#[Column]</code>, <code>#[ManyToOne]</code>.</li>
        <li><strong>PHPUnit 10+</strong> — <code>#[Test]</code>, <code>#[DataProvider]</code>, <code>#[Group]</code>.</li>
      </ul>

      <p>
        Attributes são a fundação invisível do PHP moderno: você usa todo dia, mesmo
        que nunca tenha escrito um. No próximo capítulo a gente revisita propriedades
        com <strong>readonly e constructor promotion</strong>, dois recursos que
        deixam DTOs e value objects quase triviais de escrever.
      </p>
    </PageContainer>
  );
}
