import{j as e}from"./index-Bb4MiiJL.js";import{P as a,a as s,A as r}from"./AlertBox-BpD-xIsb.js";import{T as o}from"./TerminalBlock-DGurMC1r.js";import{C as n}from"./CodeBlock-C3V-qEkN.js";function d(){return e.jsxs(a,{title:"PHPStan — análise estática",subtitle:"O compilador que o PHP nunca teve. Encontra bugs antes de você rodar o código, valida tipos, generics em PHPDoc e te força a escrever PHP profissional.",difficulty:"avancado",timeToRead:"14 min",category:"Qualidade",children:[e.jsx("h2",{children:"O problema: PHP só reclama em runtime"}),e.jsxs("p",{children:["Em linguagens compiladas, o compilador grita antes do código rodar. Em PHP, você só descobre que chamou um método inexistente ",e.jsx("em",{children:"quando o usuário clica no botão em produção"}),". O"," ",e.jsx("strong",{children:"PHPStan"})," resolve isso fazendo análise estática: lê seu código sem executar e aponta erros de tipo, métodos inexistentes, propriedades nulas, branches mortos e muito mais."]}),e.jsx("h2",{children:"Instalação"}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos/loja",command:"composer require --dev phpstan/phpstan",output:`Using version ^1.12 for phpstan/phpstan
./composer.json has been updated
Running composer update phpstan/phpstan
Loading composer repositories with package information
Updating dependencies
Lock file operations: 1 install, 0 updates, 0 removals
  - Locking phpstan/phpstan (1.12.7)
Writing lock file
Installing dependencies from lock file (including require-dev)
Package operations: 1 install, 0 updates, 0 removals
  - Installing phpstan/phpstan (1.12.7): Extracting archive
Generating autoload files`}),e.jsxs("p",{children:["Pronto, você ganhou o binário ",e.jsx("code",{children:"vendor/bin/phpstan"}),". Vamos rodar contra um arquivo propositalmente bugado:"]}),e.jsx(s,{filename:"src/Carrinho.php",code:`<?php
declare(strict_types=1);

namespace App;

final class Carrinho
{
    /** @var array<int, array{nome: string, preco: float}> */
    private array $itens = [];

    public function adicionar(string $nome, float $preco): void
    {
        $this->itens[] = ['nome' => $nome, 'preco' => $preco];
    }

    public function total(): float
    {
        $soma = 0.0;
        foreach ($this->itens as $item) {
            $soma += $item['precoo']; // typo proposital
        }
        return $soma;
    }
}`}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos/loja",command:"vendor/bin/phpstan analyse src --level=9",output:`Note: Using configuration file /home/dev/projetos/loja/phpstan.neon.

 1/1 [============================] 100%

 ------ -------------------------------------------------------------
  Line   src/Carrinho.php
 ------ -------------------------------------------------------------
  20     Offset 'precoo' does not exist on array{nome: string,
         preco: float}.
 ------ -------------------------------------------------------------

 [ERROR] Found 1 error`}),e.jsxs("p",{children:["Sem rodar o código, o PHPStan já encontrou o typo ",e.jsx("code",{children:"$item['precoo']"}),". Ele leu o PHPDoc ",e.jsxs("code",{children:["array","{nome: string, preco: float}"]})," e validou cada acesso de chave. Isso é ouro."]}),e.jsx("h2",{children:"Os níveis: do leve ao paranóico"}),e.jsxs("p",{children:["O PHPStan tem 10 níveis (0 a 9 + ",e.jsx("code",{children:"max"}),"). Cada um adiciona checagens mais rígidas. Resumo prático:"]}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"0"})," — checagens básicas, classes/métodos inexistentes."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"5"})," — tipos de argumentos em chamadas de método."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"7"})," — checa ",e.jsx("code",{children:"null"})," em todo lugar (sai do modo permissivo)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"9"})," — proibe uso de ",e.jsx("code",{children:"mixed"})," sem narrowing."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"max"})," — alias para o nível mais alto disponível na versão."]})]}),e.jsxs(r,{type:"info",title:"Estratégia recomendada",children:["Comece em ",e.jsx("code",{children:"level 0"}),", zere os erros, suba para ",e.jsx("code",{children:"1"}),", repita. Em projeto novo, mire ",e.jsx("code",{children:"level 9"})," desde o dia zero."]}),e.jsx("h2",{children:"Configuração com phpstan.neon"}),e.jsxs("p",{children:["Em vez de passar flags toda hora, crie um ",e.jsx("code",{children:"phpstan.neon"})," na raiz do projeto. O formato NEON é parecido com YAML:"]}),e.jsx(n,{language:"yaml",title:"phpstan.neon",code:`parameters:
    level: 9
    paths:
        - src
        - tests
    excludePaths:
        - src/Legacy/*
        - vendor
    tmpDir: var/phpstan
    treatPhpDocTypesAsCertain: false
    checkMissingIterableValueType: true
    checkGenericClassInNonGenericObjectType: true
    ignoreErrors:
        -
            message: '#Call to an undefined method ReflectionType::getName\\(\\)#'
            path: src/Reflect/Inspector.php
        -
            identifier: missingType.iterableValue
            paths:
                - src/Legacy/*`}),e.jsxs("p",{children:["Agora basta rodar ",e.jsx("code",{children:"vendor/bin/phpstan analyse"})," sem argumentos — ele lê o NEON automaticamente."]}),e.jsx("h2",{children:"Generics em PHPDoc"}),e.jsxs("p",{children:["PHP não tem generics na sintaxe da linguagem, mas o PHPStan entende generics escritos no"," ",e.jsx("code",{children:"@template"})," do PHPDoc. Veja um repositório genérico de verdade:"]}),e.jsx(s,{filename:"src/Repository.php",code:`<?php
declare(strict_types=1);

namespace App;

/**
 * @template T of object
 */
abstract class Repository
{
    /** @var class-string<T> */
    protected string $entity;

    /**
     * @param class-string<T> $entity
     */
    public function __construct(string $entity)
    {
        $this->entity = $entity;
    }

    /**
     * @return T|null
     */
    public function find(int $id): ?object
    {
        // implementação...
        return null;
    }

    /**
     * @return list<T>
     */
    public function all(): array
    {
        return [];
    }
}

final class Usuario {
    public function __construct(public string $nome) {}
}

/**
 * @extends Repository<Usuario>
 */
final class UsuarioRepository extends Repository
{
}

$repo = new UsuarioRepository(Usuario::class);
$u = $repo->find(1);
// PHPStan sabe que $u é Usuario|null
echo $u?->nome ?? 'não achou';`,output:"não achou"}),e.jsxs("p",{children:["Repare: ",e.jsx("code",{children:"$repo->find(1)"})," tem retorno ",e.jsx("code",{children:"?object"})," na assinatura, mas graças ao ",e.jsx("code",{children:"@template T"})," + ",e.jsx("code",{children:"@extends Repository<Usuario>"}),", o PHPStan infere que o retorno real é ",e.jsx("code",{children:"Usuario|null"}),". Você ganha autocomplete correto e checagem de tipos sem mudar uma vírgula da linguagem."]}),e.jsx("h2",{children:"Tipos avançados que só PHPStan entende"}),e.jsx("p",{children:"O PHPStan trouxe um vocabulário de tipos que o PHP nativo não tem. Os mais úteis no dia a dia:"}),e.jsx(s,{filename:"src/Tipos.php",code:`<?php
declare(strict_types=1);

namespace App;

final class Tipos
{
    /** @param non-empty-string $nome */
    public function ola(string $nome): string
    {
        return "olá, {$nome}";
    }

    /** @param positive-int $id */
    public function buscar(int $id): void {}

    /** @param array<string, list<int>> $grupos */
    public function processar(array $grupos): void {}

    /** @param 'GET'|'POST'|'PUT'|'DELETE' $method */
    public function request(string $method): void {}

    /** @return class-string<\\Throwable> */
    public function classeExcecao(): string
    {
        return \\RuntimeException::class;
    }
}

$t = new Tipos();
$t->ola('');           // erro: '' não é non-empty-string
$t->buscar(0);          // erro: 0 não é positive-int
$t->request('PATCH');   // erro: literal não está na união`,output:`------ -----------------------------------------------------
 Line   src/Tipos.php
------ -----------------------------------------------------
 26     Parameter #1 $nome of method App\\Tipos::ola()
        expects non-empty-string, '' given.
 27     Parameter #1 $id of method App\\Tipos::buscar()
        expects int<1, max>, 0 given.
 28     Parameter #1 $method of method App\\Tipos::request()
        expects 'DELETE'|'GET'|'POST'|'PUT', 'PATCH' given.
------ -----------------------------------------------------
 [ERROR] Found 3 errors`}),e.jsx(r,{type:"success",title:"Tipos que você vai usar toda hora",children:e.jsxs("ul",{className:"list-disc ml-5 mt-1 space-y-1",children:[e.jsxs("li",{children:[e.jsx("code",{children:"list<T>"})," — array indexado de 0 sem buracos."]}),e.jsxs("li",{children:[e.jsx("code",{children:"non-empty-string"}),", ",e.jsx("code",{children:"non-empty-array"}),"."]}),e.jsxs("li",{children:[e.jsx("code",{children:"positive-int"}),", ",e.jsx("code",{children:"negative-int"}),", ",e.jsx("code",{children:"int<0, 100>"}),"."]}),e.jsxs("li",{children:[e.jsx("code",{children:"class-string<T>"})," — string que é nome de classe."]}),e.jsxs("li",{children:["Uniões literais: ",e.jsx("code",{children:"'sm'|'md'|'lg'"}),"."]})]})}),e.jsx("h2",{children:"Baseline — salvando legado sem chorar"}),e.jsxs("p",{children:["Caiu de paraquedas num projeto com 800 erros do PHPStan? A pior decisão é ignorar o linter. A melhor é criar um ",e.jsx("strong",{children:"baseline"}),": uma foto dos erros existentes que o PHPStan passa a ignorar, mas ",e.jsx("em",{children:"brilha vermelho"})," em qualquer erro novo."]}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos/legado",command:"vendor/bin/phpstan analyse --generate-baseline",output:`Note: Using configuration file phpstan.neon.

 47/47 [============================] 100%

Baseline generated with 812 errors.`}),e.jsxs("p",{children:["Isso cria um ",e.jsx("code",{children:"phpstan-baseline.neon"}),". Agora inclua ele no ",e.jsx("code",{children:"phpstan.neon"}),":"]}),e.jsx(n,{language:"yaml",title:"phpstan.neon (com baseline)",code:`includes:
    - phpstan-baseline.neon

parameters:
    level: 9
    paths:
        - src`}),e.jsx("p",{children:"Daqui pra frente: código novo é checado no nível 9; código antigo continua livre. Conforme você refatora, regenera o baseline e o número diminui. É a única estratégia humana de adoção em projeto grande."}),e.jsxs(r,{type:"warning",title:"Não vire viciado em baseline",children:["Baseline é remédio, não dieta. Marque no calendário pra ",e.jsx("strong",{children:"regenerar"})," ele toda sprint — caso contrário ele só cresce."]}),e.jsx("h2",{children:"ignoreErrors pontual"}),e.jsxs("p",{children:["Para casos isolados (uma extensão exótica, uma magia inevitável), use"," ",e.jsx("code",{children:"ignoreErrors"})," direcionado em vez de baseline:"]}),e.jsx(n,{language:"yaml",title:"phpstan.neon",code:`parameters:
    ignoreErrors:
        # Por mensagem regex + caminho específico:
        -
            message: '#Method .* should return int but returns mixed#'
            path: src/Adapters/LegacySoap.php
            count: 2
        # Por identificador moderno (mais robusto):
        -
            identifier: argument.type
            path: src/Bridge/*
        # Bloco completo de uma classe:
        -
            message: '#.*#'
            path: src/Generated/*`}),e.jsx("h2",{children:"Integração com CI"}),e.jsxs("p",{children:["O PHPStan retorna exit code ",e.jsx("code",{children:"1"})," quando encontra erros. Plugue ele direto no GitHub Actions, GitLab CI ou no seu pre-commit hook. Em CI fica assim:"]}),e.jsx(o,{user:"ci",host:"github",cwd:"/runner/work/loja",command:"vendor/bin/phpstan analyse --no-progress --error-format=github",output:`::error file=src/Pedido.php,line=42::Call to undefined method App\\Pedido::cancelar().
[ERROR] Found 1 error`}),e.jsxs("p",{children:["Com ",e.jsx("code",{children:"--error-format=github"}),", os erros aparecem inline no diff do PR. Um analista estático que cresce com o projeto: comece hoje, mesmo no nível 0. Seu eu do futuro vai agradecer."]})]})}export{d as default};
