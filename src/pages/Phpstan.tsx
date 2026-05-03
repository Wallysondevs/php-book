import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Phpstan() {
  return (
    <PageContainer
      title="PHPStan — análise estática"
      subtitle="O compilador que o PHP nunca teve. Encontra bugs antes de você rodar o código, valida tipos, generics em PHPDoc e te força a escrever PHP profissional."
      difficulty="avancado"
      timeToRead="14 min"
      category="Qualidade"
    >
      <AlertBox type="info" title="Pré-requisitos">
          <p>Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP.</p>
        </AlertBox>
        <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"PHPStan"}</strong> {' — '} {"análise estática — encontra bugs sem rodar código."}
          </li>
        <li>
            <strong>{"Levels"}</strong> {' — '} {"0 a 9 (ou max); aumente gradualmente."}
          </li>
        <li>
            <strong>{"baseline"}</strong> {' — '} {"congela erros existentes para corrigir aos poucos."}
          </li>
        <li>
            <strong>{"Generics"}</strong> {' — '} {"documente em docblock para PHPStan inferir tipos."}
          </li>
        <li>
            <strong>{"vs Psalm"}</strong> {' — '} {"concorrente direto; APIs semelhantes."}
          </li>
        </ul>
          <h2>O problema: PHP só reclama em runtime</h2>
      <p>
        Em linguagens compiladas, o compilador grita antes do código rodar. Em PHP, você só descobre
        que chamou um método inexistente <em>quando o usuário clica no botão em produção</em>. O{" "}
        <strong>PHPStan</strong> resolve isso fazendo análise estática: lê seu código sem executar e
        aponta erros de tipo, métodos inexistentes, propriedades nulas, branches mortos e muito mais.
      </p>

      <h2>Instalação</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command="composer require --dev phpstan/phpstan"
        output={`Using version ^1.12 for phpstan/phpstan
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
Generating autoload files`}
      />

      <p>
        Pronto, você ganhou o binário <code>vendor/bin/phpstan</code>. Vamos rodar contra um arquivo
        propositalmente bugado:
      </p>

      <PhpBlock
        filename="src/Carrinho.php"
        code={`<?php
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
}`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command="vendor/bin/phpstan analyse src --level=9"
        output={`Note: Using configuration file /home/dev/projetos/loja/phpstan.neon.

 1/1 [============================] 100%

 ------ -------------------------------------------------------------
  Line   src/Carrinho.php
 ------ -------------------------------------------------------------
  20     Offset 'precoo' does not exist on array{nome: string,
         preco: float}.
 ------ -------------------------------------------------------------

 [ERROR] Found 1 error`}
      />

      <p>
        Sem rodar o código, o PHPStan já encontrou o typo <code>$item['precoo']</code>. Ele leu o
        PHPDoc <code>array{`{nome: string, preco: float}`}</code> e validou cada acesso de chave.
        Isso é ouro.
      </p>

      <h2>Os níveis: do leve ao paranóico</h2>
      <p>
        O PHPStan tem 10 níveis (0 a 9 + <code>max</code>). Cada um adiciona checagens mais rígidas.
        Resumo prático:
      </p>
      <ul>
        <li><strong>0</strong> — checagens básicas, classes/métodos inexistentes.</li>
        <li><strong>5</strong> — tipos de argumentos em chamadas de método.</li>
        <li><strong>7</strong> — checa <code>null</code> em todo lugar (sai do modo permissivo).</li>
        <li><strong>9</strong> — proibe uso de <code>mixed</code> sem narrowing.</li>
        <li><strong>max</strong> — alias para o nível mais alto disponível na versão.</li>
      </ul>

      <AlertBox type="info" title="Estratégia recomendada">
        Comece em <code>level 0</code>, zere os erros, suba para <code>1</code>, repita. Em projeto
        novo, mire <code>level 9</code> desde o dia zero.
      </AlertBox>

      <h2>Configuração com phpstan.neon</h2>
      <p>
        Em vez de passar flags toda hora, crie um <code>phpstan.neon</code> na raiz do projeto. O
        formato NEON é parecido com YAML:
      </p>

      <CodeBlock
        language="yaml"
        title="phpstan.neon"
        code={`parameters:
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
                - src/Legacy/*`}
      />

      <p>
        Agora basta rodar <code>vendor/bin/phpstan analyse</code> sem argumentos — ele lê o NEON
        automaticamente.
      </p>

      <h2>Generics em PHPDoc</h2>
      <p>
        PHP não tem generics na sintaxe da linguagem, mas o PHPStan entende generics escritos no{" "}
        <code>@template</code> do PHPDoc. Veja um repositório genérico de verdade:
      </p>

      <PhpBlock
        filename="src/Repository.php"
        code={`<?php
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
echo $u?->nome ?? 'não achou';`}
        output={`não achou`}
      />

      <p>
        Repare: <code>$repo-&gt;find(1)</code> tem retorno <code>?object</code> na assinatura, mas
        graças ao <code>@template T</code> + <code>@extends Repository&lt;Usuario&gt;</code>, o
        PHPStan infere que o retorno real é <code>Usuario|null</code>. Você ganha autocomplete
        correto e checagem de tipos sem mudar uma vírgula da linguagem.
      </p>

      <h2>Tipos avançados que só PHPStan entende</h2>
      <p>
        O PHPStan trouxe um vocabulário de tipos que o PHP nativo não tem. Os mais úteis no dia a
        dia:
      </p>

      <PhpBlock
        filename="src/Tipos.php"
        code={`<?php
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
$t->request('PATCH');   // erro: literal não está na união`}
        output={`------ -----------------------------------------------------
 Line   src/Tipos.php
------ -----------------------------------------------------
 26     Parameter #1 $nome of method App\\Tipos::ola()
        expects non-empty-string, '' given.
 27     Parameter #1 $id of method App\\Tipos::buscar()
        expects int<1, max>, 0 given.
 28     Parameter #1 $method of method App\\Tipos::request()
        expects 'DELETE'|'GET'|'POST'|'PUT', 'PATCH' given.
------ -----------------------------------------------------
 [ERROR] Found 3 errors`}
      />

      <AlertBox type="success" title="Tipos que você vai usar toda hora">
        <ul className="list-disc ml-5 mt-1 space-y-1">
          <li><code>list&lt;T&gt;</code> — array indexado de 0 sem buracos.</li>
          <li><code>non-empty-string</code>, <code>non-empty-array</code>.</li>
          <li><code>positive-int</code>, <code>negative-int</code>, <code>int&lt;0, 100&gt;</code>.</li>
          <li><code>class-string&lt;T&gt;</code> — string que é nome de classe.</li>
          <li>Uniões literais: <code>'sm'|'md'|'lg'</code>.</li>
        </ul>
      </AlertBox>

      <h2>Baseline — salvando legado sem chorar</h2>
      <p>
        Caiu de paraquedas num projeto com 800 erros do PHPStan? A pior decisão é ignorar o linter.
        A melhor é criar um <strong>baseline</strong>: uma foto dos erros existentes que o PHPStan
        passa a ignorar, mas <em>brilha vermelho</em> em qualquer erro novo.
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/legado"
        command="vendor/bin/phpstan analyse --generate-baseline"
        output={`Note: Using configuration file phpstan.neon.

 47/47 [============================] 100%

Baseline generated with 812 errors.`}
      />

      <p>
        Isso cria um <code>phpstan-baseline.neon</code>. Agora inclua ele no <code>phpstan.neon</code>:
      </p>

      <CodeBlock
        language="yaml"
        title="phpstan.neon (com baseline)"
        code={`includes:
    - phpstan-baseline.neon

parameters:
    level: 9
    paths:
        - src`}
      />

      <p>
        Daqui pra frente: código novo é checado no nível 9; código antigo continua livre. Conforme
        você refatora, regenera o baseline e o número diminui. É a única estratégia humana de
        adoção em projeto grande.
      </p>

      <AlertBox type="warning" title="Não vire viciado em baseline">
        Baseline é remédio, não dieta. Marque no calendário pra <strong>regenerar</strong> ele toda
        sprint — caso contrário ele só cresce.
      </AlertBox>

      <h2>ignoreErrors pontual</h2>
      <p>
        Para casos isolados (uma extensão exótica, uma magia inevitável), use{" "}
        <code>ignoreErrors</code> direcionado em vez de baseline:
      </p>

      <CodeBlock
        language="yaml"
        title="phpstan.neon"
        code={`parameters:
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
            path: src/Generated/*`}
      />

      <h2>Integração com CI</h2>
      <p>
        O PHPStan retorna exit code <code>1</code> quando encontra erros. Plugue ele direto no GitHub
        Actions, GitLab CI ou no seu pre-commit hook. Em CI fica assim:
      </p>

      <TerminalBlock
        user="ci"
        host="github"
        cwd="/runner/work/loja"
        command="vendor/bin/phpstan analyse --no-progress --error-format=github"
        output={`::error file=src/Pedido.php,line=42::Call to undefined method App\\Pedido::cancelar().
[ERROR] Found 1 error`}
      />

      <p>
        Com <code>--error-format=github</code>, os erros aparecem inline no diff do PR. Um analista
        estático que cresce com o projeto: comece hoje, mesmo no nível 0. Seu eu do futuro vai
        agradecer.
      </p>
    </PageContainer>
  );
}
