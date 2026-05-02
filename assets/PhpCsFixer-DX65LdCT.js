import{j as e}from"./index-Bb4MiiJL.js";import{P as s,a as i,A as r}from"./AlertBox-BpD-xIsb.js";import{T as o}from"./TerminalBlock-DGurMC1r.js";import{C as n}from"./CodeBlock-C3V-qEkN.js";function p(){return e.jsxs(s,{title:"PHP-CS-Fixer & PSR-12",subtitle:"Pare de discutir indentação no PR. Configure o PHP-CS-Fixer uma vez e nunca mais perca tempo formatando código manualmente.",difficulty:"intermediario",timeToRead:"12 min",category:"Qualidade",children:[e.jsx("h2",{children:"O problema: o code review virou aula de estilo"}),e.jsxs("p",{children:["Espaço antes do parêntese? Chaves na mesma linha? ",e.jsx("code",{children:"use"})," ordenado por nome? Toda equipe perde semanas discutindo isso. A solução é delegar a regra para uma ferramenta:"," ",e.jsx("strong",{children:"PHP-CS-Fixer"}),". Ele lê seu código, aplica regras (PSR-12, PER-CS, custom) e"," ",e.jsx("em",{children:"reescreve os arquivos"})," automaticamente."]}),e.jsx("h2",{children:"Instalação"}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos/loja",command:"composer require --dev friendsofphp/php-cs-fixer",output:`Using version ^3.64 for friendsofphp/php-cs-fixer
./composer.json has been updated
Running composer update friendsofphp/php-cs-fixer
Loading composer repositories with package information
Updating dependencies
Lock file operations: 12 installs, 0 updates, 0 removals
  - Locking friendsofphp/php-cs-fixer (v3.64.0)
Writing lock file
Installing dependencies from lock file (including require-dev)
Generating autoload files`}),e.jsxs("p",{children:["O binário fica em ",e.jsx("code",{children:"vendor/bin/php-cs-fixer"}),". Antes de configurar nada, vamos ver o efeito num arquivo bagunçado:"]}),e.jsx(i,{filename:"src/Pedido.php (antes)",code:`<?php
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
}`}),e.jsxs("p",{children:["Está funcional, mas é um campo minado de inconsistências: chaves grudadas, espaço sobrando,",e.jsx("code",{children:"use"})," fora de ordem, sem ",e.jsx("code",{children:"declare(strict_types=1)"}),". Vamos consertar."]}),e.jsx("h2",{children:"Configuração com .php-cs-fixer.dist.php"}),e.jsxs("p",{children:["O CS-Fixer espera um arquivo PHP de configuração na raiz do projeto. O nome canônico é"," ",e.jsx("code",{children:".php-cs-fixer.dist.php"})," (versionado no Git). Devs que queiram regras locais criam um ",e.jsx("code",{children:".php-cs-fixer.php"})," não versionado."]}),e.jsx(i,{filename:".php-cs-fixer.dist.php",code:`<?php
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
    ->setCacheFile(__DIR__ . '/var/.php-cs-fixer.cache');`}),e.jsx("p",{children:"Os três conjuntos importantes:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"@PSR12"})," — o padrão oficial PSR-12 (indentação, espaços, ordem)."]}),e.jsxs("li",{children:[e.jsx("code",{children:"@PER-CS2.0"})," — PHP-FIG Extended Coding Style: o sucessor moderno do PSR-12."]}),e.jsxs("li",{children:[e.jsx("code",{children:"@PHP84Migration"})," — moderniza sintaxe pra PHP 8.4 (ex: ",e.jsx("code",{children:"readonly"}),", named args)."]})]}),e.jsxs(r,{type:"warning",title:"Risky rules: o que são?",children:["Regras ",e.jsx("em",{children:"risky"})," mudam ",e.jsx("strong",{children:"semântica"}),", não só estilo. Por exemplo,"," ",e.jsx("code",{children:"declare_strict_types"})," pode quebrar código que dependia de coerção. Habilite com ",e.jsx("code",{children:"setRiskyAllowed(true)"})," só depois de revisar."]}),e.jsx("h2",{children:"Dry-run primeiro: veja antes de aceitar"}),e.jsxs("p",{children:["Nunca rode o fix direto. Primeiro use ",e.jsx("code",{children:"--dry-run --diff"})," para ver exatamente o que vai mudar:"]}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos/loja",command:"vendor/bin/php-cs-fixer fix --dry-run --diff",output:`Loaded config default from "/home/dev/projetos/loja/.php-cs-fixer.dist.php".
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

Found 1 of 1 files that can be fixed in 0.234 seconds, 12.000 MB memory used`}),e.jsxs("p",{children:["Gostou? Aceite. Tira o ",e.jsx("code",{children:"--dry-run"}),":"]}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos/loja",command:"vendor/bin/php-cs-fixer fix",output:`Loaded config default from ".php-cs-fixer.dist.php".
   1) src/Pedido.php
Fixed 1 of 1 files in 0.198 seconds, 12.000 MB memory used`}),e.jsx("p",{children:"O resultado é o mesmo arquivo, agora respeitando todas as regras:"}),e.jsx(i,{filename:"src/Pedido.php (depois)",code:`<?php

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
}`}),e.jsxs(r,{type:"info",title:"Notou que removeu o use Stringable?",children:["A regra ",e.jsx("code",{children:"no_unused_imports"})," faxinou imports que ninguém usava. Outro motivo pra rodar dry-run primeiro — o CS-Fixer faz mais do que indentar."]}),e.jsx("h2",{children:"Rodando só nos arquivos alterados"}),e.jsxs("p",{children:["Em projeto grande você não quer rodar o fixer no repositório inteiro toda vez. Use"," ",e.jsx("code",{children:"git diff"})," para alimentar só o que mudou:"]}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos/loja",command:"vendor/bin/php-cs-fixer fix $(git diff --name-only --diff-filter=ACMR HEAD | grep '\\.php$' | xargs)",output:`Loaded config default from ".php-cs-fixer.dist.php".
   1) src/Carrinho.php
   2) tests/CarrinhoTest.php
Fixed 2 of 2 files in 0.087 seconds, 10.000 MB memory used`}),e.jsx("h2",{children:"Pre-commit hook com Captain Hook"}),e.jsxs("p",{children:["O lugar perfeito do CS-Fixer é o ",e.jsx("strong",{children:"pre-commit hook"}),": ele formata o código"," ",e.jsx("em",{children:"antes"})," do commit nascer. Use o pacote ",e.jsx("code",{children:"captainhook/captainhook"}),":"]}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos/loja",command:"composer require --dev captainhook/captainhook captainhook/plugin-composer",output:`Using version ^5.23 for captainhook/captainhook
./composer.json has been updated
Running composer update captainhook/captainhook captainhook/plugin-composer
Lock file operations: 4 installs, 0 updates, 0 removals
  - Installing captainhook/captainhook (5.23.3): Extracting archive
  - Installing captainhook/plugin-composer (5.3.4): Extracting archive
Generating autoload files
captainhook> CaptainHook installed Git hooks`}),e.jsxs("p",{children:["Agora crie o ",e.jsx("code",{children:"captainhook.json"})," na raiz:"]}),e.jsx(n,{language:"json",title:"captainhook.json",code:`{
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
}`}),e.jsxs("p",{children:["Rode ",e.jsx("code",{children:"vendor/bin/captainhook install"})," uma vez por máquina. Daqui pra frente, toda tentativa de commit checa estilo e análise estática:"]}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos/loja",command:'git commit -m "feat: novo endpoint"',output:`<captainhook>
 - Run \`vendor/bin/php-cs-fixer fix --dry-run --diff\` : {r}FAILED{/}
   src/Api/UserController.php precisa de formatação
 - Skipped subsequent actions
{r}captainhook> aborting commit{/}</captainhook>`}),e.jsxs("p",{children:["Ninguém comita código sujo. Se quiser ",e.jsx("strong",{children:"auto-corrigir"})," antes de commitar (em vez de bloquear), troque ",e.jsx("code",{children:"--dry-run --diff"})," por nada — mas aí adicione um"," ",e.jsx("code",{children:"git add"})," dos arquivos modificados via ",e.jsx("code",{children:"actions"})," do Captain Hook."]}),e.jsxs(r,{type:"success",title:"Alternativa leve",children:["Se não quiser dependência extra, dá pra ter um pre-commit hook puro em shell em"," ",e.jsx("code",{children:".git/hooks/pre-commit"}),". Captain Hook só ganha por versionar a config no repo (todo dev compartilha)."]}),e.jsx("h2",{children:"Rodando em CI"}),e.jsxs("p",{children:["No GitHub Actions o CS-Fixer entra como check obrigatório do PR. Use sempre"," ",e.jsx("code",{children:"--dry-run"})," em CI — você quer falhar, não corrigir automaticamente:"]}),e.jsx(o,{user:"ci",host:"github",cwd:"/runner/work/loja",command:"vendor/bin/php-cs-fixer fix --dry-run --diff --using-cache=no",output:`Loaded config default from ".php-cs-fixer.dist.php".
   1) src/Pedido.php
      ... (diff omitido) ...
Found 1 of 47 files that can be fixed in 1.234 seconds, 22.000 MB memory used
{r}exit 8{/}`}),e.jsxs("p",{children:["Estilo deixou de ser opinião humana. É um arquivo de configuração versionado. O PR foca em"," ","lógica, não em vírgulas — que é exatamente onde o cérebro humano deve trabalhar."]})]})}export{p as default};
