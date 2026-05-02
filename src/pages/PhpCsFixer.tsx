import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function PhpCsFixer() {
  return (
    <PageContainer
      title="PHP-CS-Fixer & PSR-12"
      subtitle="Pare de discutir indentação no PR. Configure o PHP-CS-Fixer uma vez e nunca mais perca tempo formatando código manualmente."
      difficulty="intermediario"
      timeToRead="12 min"
      category="Qualidade"
    >
      <h2>O problema: o code review virou aula de estilo</h2>
      <p>
        Espaço antes do parêntese? Chaves na mesma linha? <code>use</code> ordenado por nome? Toda
        equipe perde semanas discutindo isso. A solução é delegar a regra para uma ferramenta:{" "}
        <strong>PHP-CS-Fixer</strong>. Ele lê seu código, aplica regras (PSR-12, PER-CS, custom) e{" "}
        <em>reescreve os arquivos</em> automaticamente.
      </p>

      <h2>Instalação</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command="composer require --dev friendsofphp/php-cs-fixer"
        output={`Using version ^3.64 for friendsofphp/php-cs-fixer
./composer.json has been updated
Running composer update friendsofphp/php-cs-fixer
Loading composer repositories with package information
Updating dependencies
Lock file operations: 12 installs, 0 updates, 0 removals
  - Locking friendsofphp/php-cs-fixer (v3.64.0)
Writing lock file
Installing dependencies from lock file (including require-dev)
Generating autoload files`}
      />

      <p>
        O binário fica em <code>vendor/bin/php-cs-fixer</code>. Antes de configurar nada, vamos ver
        o efeito num arquivo bagunçado:
      </p>

      <PhpBlock
        filename="src/Pedido.php (antes)"
        code={`<?php
namespace App;
use App\\Cliente ;
use App\\Item;
use Stringable;

class Pedido{
    public function __construct(public Cliente $cliente,public array $itens){}

    public function total() :float{
        $t=0;foreach($this->itens as $i){$t+=$i->preco;}
        return $t;
    }
}`}
      />

      <p>
        Está funcional, mas é um campo minado de inconsistências: chaves grudadas, espaço sobrando,
        <code>use</code> fora de ordem, sem <code>declare(strict_types=1)</code>. Vamos consertar.
      </p>

      <h2>Configuração com .php-cs-fixer.dist.php</h2>
      <p>
        O CS-Fixer espera um arquivo PHP de configuração na raiz do projeto. O nome canônico é{" "}
        <code>.php-cs-fixer.dist.php</code> (versionado no Git). Devs que queiram regras locais
        criam um <code>.php-cs-fixer.php</code> não versionado.
      </p>

      <PhpBlock
        filename=".php-cs-fixer.dist.php"
        code={`<?php
declare(strict_types=1);

$finder = (new PhpCsFixer\\Finder())
    ->in(__DIR__ . '/src')
    ->in(__DIR__ . '/tests')
    ->exclude('var')
    ->exclude('vendor');

return (new PhpCsFixer\\Config())
    ->setRiskyAllowed(true)
    ->setRules([
        '@PSR12' => true,
        '@PER-CS2.0' => true,
        '@PHP84Migration' => true,
        '@PHPUnit100Migration:risky' => true,
        'declare_strict_types' => true,
        'array_syntax' => ['syntax' => 'short'],
        'ordered_imports' => [
            'sort_algorithm' => 'alpha',
            'imports_order' => ['class', 'function', 'const'],
        ],
        'no_unused_imports' => true,
        'single_quote' => true,
        'trailing_comma_in_multiline' => [
            'elements' => ['arrays', 'arguments', 'parameters'],
        ],
        'binary_operator_spaces' => ['default' => 'single_space'],
        'concat_space' => ['spacing' => 'one'],
        'phpdoc_align' => ['align' => 'left'],
        'native_function_invocation' => [
            'include' => ['@compiler_optimized'],
            'scope' => 'namespaced',
        ],
    ])
    ->setFinder($finder)
    ->setCacheFile(__DIR__ . '/var/.php-cs-fixer.cache');`}
      />

      <p>Os três conjuntos importantes:</p>
      <ul>
        <li><code>@PSR12</code> — o padrão oficial PSR-12 (indentação, espaços, ordem).</li>
        <li><code>@PER-CS2.0</code> — PHP-FIG Extended Coding Style: o sucessor moderno do PSR-12.</li>
        <li><code>@PHP84Migration</code> — moderniza sintaxe pra PHP 8.4 (ex: <code>readonly</code>, named args).</li>
      </ul>

      <AlertBox type="warning" title="Risky rules: o que são?">
        Regras <em>risky</em> mudam <strong>semântica</strong>, não só estilo. Por exemplo,{" "}
        <code>declare_strict_types</code> pode quebrar código que dependia de coerção. Habilite
        com <code>setRiskyAllowed(true)</code> só depois de revisar.
      </AlertBox>

      <h2>Dry-run primeiro: veja antes de aceitar</h2>
      <p>
        Nunca rode o fix direto. Primeiro use <code>--dry-run --diff</code> para ver exatamente o
        que vai mudar:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command="vendor/bin/php-cs-fixer fix --dry-run --diff"
        output={`Loaded config default from "/home/dev/projetos/loja/.php-cs-fixer.dist.php".
Using cache file "/home/dev/projetos/loja/var/.php-cs-fixer.cache".
   1) src/Pedido.php
      ---------- begin diff ----------
      --- src/Pedido.php
      +++ src/Pedido.php
      @@ -1,12 +1,17 @@
       <?php
      +
      +declare(strict_types=1);
      +
       namespace App;
      -use App\\Cliente ;
      +
      +use App\\Cliente;
       use App\\Item;
      -use Stringable;
       
      -class Pedido{
      -    public function __construct(public Cliente $cliente,public array $itens){}
      +class Pedido
      +{
      +    public function __construct(public Cliente $cliente, public array $itens) {}
       
      -    public function total() :float{
      -        $t=0;foreach($this->itens as $i){$t+=$i->preco;}
      +    public function total(): float
      +    {
      +        $t = 0;
      +        foreach ($this->itens as $i) {
      +            $t += $i->preco;
      +        }
               return $t;
           }
       }
      ----------- end diff -----------

Found 1 of 1 files that can be fixed in 0.234 seconds, 12.000 MB memory used`}
      />

      <p>
        Gostou? Aceite. Tira o <code>--dry-run</code>:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command="vendor/bin/php-cs-fixer fix"
        output={`Loaded config default from ".php-cs-fixer.dist.php".
   1) src/Pedido.php
Fixed 1 of 1 files in 0.198 seconds, 12.000 MB memory used`}
      />

      <p>O resultado é o mesmo arquivo, agora respeitando todas as regras:</p>

      <PhpBlock
        filename="src/Pedido.php (depois)"
        code={`<?php

declare(strict_types=1);

namespace App;

use App\\Cliente;
use App\\Item;

class Pedido
{
    public function __construct(public Cliente $cliente, public array $itens) {}

    public function total(): float
    {
        $t = 0;
        foreach ($this->itens as $i) {
            $t += $i->preco;
        }
        return $t;
    }
}`}
      />

      <AlertBox type="info" title="Notou que removeu o use Stringable?">
        A regra <code>no_unused_imports</code> faxinou imports que ninguém usava. Outro motivo pra
        rodar dry-run primeiro — o CS-Fixer faz mais do que indentar.
      </AlertBox>

      <h2>Rodando só nos arquivos alterados</h2>
      <p>
        Em projeto grande você não quer rodar o fixer no repositório inteiro toda vez. Use{" "}
        <code>git diff</code> para alimentar só o que mudou:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command={`vendor/bin/php-cs-fixer fix $(git diff --name-only --diff-filter=ACMR HEAD | grep '\\.php$' | xargs)`}
        output={`Loaded config default from ".php-cs-fixer.dist.php".
   1) src/Carrinho.php
   2) tests/CarrinhoTest.php
Fixed 2 of 2 files in 0.087 seconds, 10.000 MB memory used`}
      />

      <h2>Pre-commit hook com Captain Hook</h2>
      <p>
        O lugar perfeito do CS-Fixer é o <strong>pre-commit hook</strong>: ele formata o código{" "}
        <em>antes</em> do commit nascer. Use o pacote <code>captainhook/captainhook</code>:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command="composer require --dev captainhook/captainhook captainhook/plugin-composer"
        output={`Using version ^5.23 for captainhook/captainhook
./composer.json has been updated
Running composer update captainhook/captainhook captainhook/plugin-composer
Lock file operations: 4 installs, 0 updates, 0 removals
  - Installing captainhook/captainhook (5.23.3): Extracting archive
  - Installing captainhook/plugin-composer (5.3.4): Extracting archive
Generating autoload files
captainhook> CaptainHook installed Git hooks`}
      />

      <p>
        Agora crie o <code>captainhook.json</code> na raiz:
      </p>

      <CodeBlock
        language="json"
        title="captainhook.json"
        code={`{
    "config": {
        "verbosity": "normal"
    },
    "pre-commit": {
        "enabled": true,
        "actions": [
            {
                "action": "vendor/bin/php-cs-fixer fix --config=.php-cs-fixer.dist.php --dry-run --diff",
                "options": [],
                "conditions": []
            },
            {
                "action": "vendor/bin/phpstan analyse --no-progress",
                "options": [],
                "conditions": []
            }
        ]
    }
}`}
      />

      <p>
        Rode <code>vendor/bin/captainhook install</code> uma vez por máquina. Daqui pra frente,
        toda tentativa de commit checa estilo e análise estática:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command={`git commit -m "feat: novo endpoint"`}
        output={`<captainhook>
 - Run \`vendor/bin/php-cs-fixer fix --dry-run --diff\` : {r}FAILED{/}
   src/Api/UserController.php precisa de formatação
 - Skipped subsequent actions
{r}captainhook> aborting commit{/}</captainhook>`}
      />

      <p>
        Ninguém comita código sujo. Se quiser <strong>auto-corrigir</strong> antes de commitar (em
        vez de bloquear), troque <code>--dry-run --diff</code> por nada — mas aí adicione um{" "}
        <code>git add</code> dos arquivos modificados via <code>actions</code> do Captain Hook.
      </p>

      <AlertBox type="success" title="Alternativa leve">
        Se não quiser dependência extra, dá pra ter um pre-commit hook puro em shell em{" "}
        <code>.git/hooks/pre-commit</code>. Captain Hook só ganha por versionar a config no repo
        (todo dev compartilha).
      </AlertBox>

      <h2>Rodando em CI</h2>
      <p>
        No GitHub Actions o CS-Fixer entra como check obrigatório do PR. Use sempre{" "}
        <code>--dry-run</code> em CI — você quer falhar, não corrigir automaticamente:
      </p>

      <TerminalBlock
        user="ci"
        host="github"
        cwd="/runner/work/loja"
        command="vendor/bin/php-cs-fixer fix --dry-run --diff --using-cache=no"
        output={`Loaded config default from ".php-cs-fixer.dist.php".
   1) src/Pedido.php
      ... (diff omitido) ...
Found 1 of 47 files that can be fixed in 1.234 seconds, 22.000 MB memory used
{r}exit 8{/}`}
      />

      <p>
        Estilo deixou de ser opinião humana. É um arquivo de configuração versionado. O PR foca em{" "}
        lógica, não em vírgulas — que é exatamente onde o cérebro humano deve trabalhar.
      </p>
    </PageContainer>
  );
}
