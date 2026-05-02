import{j as e}from"./index-Bb4MiiJL.js";import{P as t,a as o,A as r}from"./AlertBox-BpD-xIsb.js";import{T as s}from"./TerminalBlock-DGurMC1r.js";function c(){return e.jsxs(t,{title:"Attributes (PHP 8.0)",subtitle:"Metadados estruturados anexados a classes, métodos e propriedades — a base moderna de routing, validação, ORMs e DI no Symfony, Laravel e Doctrine.",difficulty:"avancado",timeToRead:"12 min",category:"PHP Moderno",children:[e.jsx("h2",{children:"O problema: docblocks como código disfarçado de comentário"}),e.jsx("p",{children:"Antes do PHP 8, frameworks como Symfony e Doctrine guardavam metadados em comentários DocBlock. Funciona, mas é frágil: o IDE não checa, um typo passa batido, e ferramentas tinham que parsear strings para entender a sua intenção."}),e.jsx(o,{filename:"legado.php",code:`<?php
declare(strict_types=1);

class UserController {
    /**
     * @Route("/usuarios/{id}", methods={"GET"})
     */
    public function show(int $id): void {
        // ...
    }
}`}),e.jsxs("p",{children:["Com ",e.jsx("strong",{children:"Attributes"}),", esses metadados viram código real: a sintaxe ",e.jsx("code",{children:"#[Attr(args)]"})," é parseada pelo PHP, validada na hora e consultável via ",e.jsx("code",{children:"Reflection"}),"."]}),e.jsx("h2",{children:"A sintaxe nova: #[Attr(args)]"}),e.jsxs("p",{children:["Um attribute é uma ",e.jsx("strong",{children:"classe comum"})," marcada com"," ",e.jsx("code",{children:"#[Attribute]"}),". Você instancia ela escrevendo"," ",e.jsx("code",{children:"#[NomeDaClasse(...)]"})," logo acima do alvo (classe, método, propriedade, parâmetro, constante, função)."]}),e.jsx(o,{filename:"primeiro.php",code:`<?php
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

echo "controller pronto" . PHP_EOL;`,output:"controller pronto"}),e.jsxs(r,{type:"info",title:"Quem executa os attributes?",children:["Por padrão ",e.jsx("strong",{children:"ninguém"}),". Attributes são metadados passivos: o PHP os armazena junto do alvo, mas só ganham vida quando algum código (um router, um validador, o framework) usa ",e.jsx("code",{children:"ReflectionAttribute"})," para inspecioná-los."]}),e.jsx("h2",{children:"Lendo attributes com Reflection"}),e.jsxs("p",{children:["A API ",e.jsx("code",{children:"ReflectionClass"})," / ",e.jsx("code",{children:"ReflectionMethod"})," ganhou o método ",e.jsx("code",{children:"getAttributes()"}),", que devolve um array de"," ",e.jsx("code",{children:"ReflectionAttribute"}),". Chame ",e.jsx("code",{children:"->newInstance()"})," para materializar o attribute como objeto."]}),e.jsx(o,{filename:"router.php",code:`<?php
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
}`,output:`GET  /usuarios/{id}          -> UserController::show()
POST /usuarios               -> UserController::create()`}),e.jsxs("p",{children:["Esse loop de cinco linhas é, em essência, como Symfony e Laravel descobrem rotas declaradas no estilo attribute. Cada framework adiciona cache e DI, mas o coração é Reflection + ",e.jsx("code",{children:"newInstance()"}),"."]}),e.jsx("h2",{children:"Restringindo onde o attribute pode aparecer"}),e.jsxs("p",{children:["O attribute ",e.jsx("code",{children:"#[Attribute]"})," aceita flags que limitam o alvo. Se você tentar usar fora do escopo permitido, o PHP avisa em runtime ao chamar"," ",e.jsx("code",{children:"newInstance()"}),"."]}),e.jsx(o,{filename:"alvo.php",code:`<?php
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
}`,output:`ttl: 60
ttl: 3600`}),e.jsx("p",{children:"As flags principais:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"TARGET_CLASS"})," — só em classes."]}),e.jsxs("li",{children:[e.jsx("code",{children:"TARGET_METHOD"})," — métodos e funções."]}),e.jsxs("li",{children:[e.jsx("code",{children:"TARGET_PROPERTY"})," — propriedades."]}),e.jsxs("li",{children:[e.jsx("code",{children:"TARGET_PARAMETER"})," — parâmetros de método/função."]}),e.jsxs("li",{children:[e.jsx("code",{children:"TARGET_ALL"})," — em qualquer lugar (padrão)."]}),e.jsxs("li",{children:[e.jsx("code",{children:"IS_REPEATABLE"})," — pode aparecer mais de uma vez no mesmo alvo."]})]}),e.jsx("h2",{children:"Validação declarativa: criando um attribute útil"}),e.jsxs("p",{children:["Vamos construir um mini validador inspirado em ",e.jsx("code",{children:"symfony/validator"}),". Você marca propriedades com regras e o validador as inspeciona via Reflection."]}),e.jsx(o,{filename:"validador.php",code:`<?php
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
}`,output:`- nome: tamanho fora de [3, 30]
- email: não pode ser vazio`}),e.jsxs(r,{type:"success",title:"Por que isso é poderoso",children:["As regras vivem ",e.jsx("strong",{children:"juntas"})," da propriedade que descrevem. Quando você renomeia o campo, refatora ou apaga, as regras vão junto. Acabaram-se os arquivos YAML/XML separados e dessincronizados do código."]}),e.jsx("h2",{children:"Argumentos: nomeados, padrões e tipados"}),e.jsx("p",{children:"Como o attribute é uma classe normal, você ganha de graça: argumentos nomeados, valores padrão, tipos e até validação no construtor. Isso elimina toda a categoria de bugs que existia em DocBlocks."}),e.jsx(o,{filename:"tipados.php",code:`<?php
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
}`,output:`id         BIGINT NOT NULL
email      VARCHAR(255) NOT NULL`}),e.jsx("h2",{children:"Comparação rápida: DocBlock vs Attribute"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Validação"}),": DocBlock falha em runtime com mensagem confusa; attribute falha na hora com erro do PHP."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"IDE/refactor"}),": attribute é classe — autocomplete, rename, find-usages funcionam. DocBlock é string opaca."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Performance"}),": Reflection nativa é mais rápida que parsear docblock com regex toda execução."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Distribuição"}),": attributes funcionam em qualquer projeto PHP 8+ sem dependência extra."]})]}),e.jsxs(r,{type:"warning",title:"Pegadinha clássica",children:["O parser do PHP enxerga ",e.jsx("code",{children:"#[Attr]"})," como attribute, mas em PHP 7 seria interpretado como comentário (",e.jsx("code",{children:"#"})," = comment). Se o seu código precisa rodar em ambos, mantenha attributes em arquivos que ",e.jsx("em",{children:"só"})," ","são carregados em PHP 8+ — ou simplesmente exija PHP 8.4 no"," ",e.jsx("code",{children:"composer.json"}),"."]}),e.jsx("h2",{children:"Verificando suporte e rodando"}),e.jsx(s,{user:"dev",host:"php",cwd:"~/projetos/attrs",command:"php -v",output:`PHP 8.4.1 (cli)
Copyright (c) The PHP Group
Zend Engine v4.4.1`}),e.jsx(s,{user:"dev",host:"php",cwd:"~/projetos/attrs",command:"php router.php",output:`GET  /usuarios/{id}          -> UserController::show()
POST /usuarios               -> UserController::create()`}),e.jsx("h2",{children:"Onde você vai encontrar attributes na prática"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Symfony"})," — ",e.jsx("code",{children:"#[Route]"}),", ",e.jsx("code",{children:"#[AsCommand]"}),", ",e.jsx("code",{children:"#[AsEventListener]"}),"."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Laravel"})," — ",e.jsx("code",{children:"#[Scope]"}),", ",e.jsx("code",{children:"#[ObservedBy]"}),", attributes de validação."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Doctrine ORM 3"})," — ",e.jsx("code",{children:"#[Entity]"}),", ",e.jsx("code",{children:"#[Column]"}),", ",e.jsx("code",{children:"#[ManyToOne]"}),"."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"PHPUnit 10+"})," — ",e.jsx("code",{children:"#[Test]"}),", ",e.jsx("code",{children:"#[DataProvider]"}),", ",e.jsx("code",{children:"#[Group]"}),"."]})]}),e.jsxs("p",{children:["Attributes são a fundação invisível do PHP moderno: você usa todo dia, mesmo que nunca tenha escrito um. No próximo capítulo a gente revisita propriedades com ",e.jsx("strong",{children:"readonly e constructor promotion"}),", dois recursos que deixam DTOs e value objects quase triviais de escrever."]})]})}export{c as default};
