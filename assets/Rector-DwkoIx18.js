import{j as e}from"./index-Bb4MiiJL.js";import{P as t,a as o,A as i}from"./AlertBox-BpD-xIsb.js";import{T as r}from"./TerminalBlock-DGurMC1r.js";import{C as s}from"./CodeBlock-C3V-qEkN.js";function l(){return e.jsxs(t,{title:"Rector — refactor automático",subtitle:"Atualizar 50 mil linhas de PHP 7.1 para PHP 8.4 manualmente é insanidade. O Rector faz isso commit a commit, com diff revisável, sem você abrir um único arquivo na mão.",difficulty:"avancado",timeToRead:"12 min",category:"Qualidade",children:[e.jsx("h2",{children:"O problema: legado parado é dívida que cresce"}),e.jsxs("p",{children:["Você herdou um projeto PHP 7.1 e o cliente quer rodar em PHP 8.4 (correção de segurança, performance, OPcache JIT). Refatorar à mão? ",e.jsx("code",{children:"list()"})," virando array destructuring,",e.jsx("code",{children:"strtotime"})," virando ",e.jsx("code",{children:"DateTimeImmutable"}),", classes ganhando"," ",e.jsx("code",{children:"readonly"})," e constructor promotion... São ",e.jsx("strong",{children:"milhares"})," de mudanças mecânicas. Trabalho de máquina, não de gente."]}),e.jsxs("p",{children:["O ",e.jsx("strong",{children:"Rector"})," é essa máquina. Ele aplica regras (chamadas ",e.jsx("em",{children:"rectors"}),") que reescrevem o seu código automaticamente, em diffs pequenos que você revisa e comita."]}),e.jsx("h2",{children:"Instalação"}),e.jsx(r,{user:"dev",host:"php",cwd:"~/projetos/legado",command:"composer require --dev rector/rector",output:`Using version ^1.2 for rector/rector
./composer.json has been updated
Running composer update rector/rector
Loading composer repositories with package information
Updating dependencies
Lock file operations: 1 install, 0 updates, 0 removals
  - Locking rector/rector (1.2.10)
Writing lock file
Installing dependencies from lock file (including require-dev)
Package operations: 1 install, 0 updates, 0 removals
  - Installing rector/rector (1.2.10): Extracting archive
Generating autoload files`}),e.jsx("h2",{children:"Configuração com rector.php"}),e.jsxs("p",{children:["O Rector lê um ",e.jsx("code",{children:"rector.php"})," na raiz do projeto. Aqui é onde você diz quais"," ",e.jsx("strong",{children:"sets"})," de regras aplicar e em quais pastas:"]}),e.jsx(o,{filename:"rector.php",code:`<?php
declare(strict_types=1);

use Rector\\Config\\RectorConfig;
use Rector\\Set\\ValueObject\\LevelSetList;
use Rector\\Set\\ValueObject\\SetList;
use Rector\\CodeQuality\\Rector\\If_\\SimplifyIfReturnBoolRector;
use Rector\\TypeDeclaration\\Rector\\Property\\TypedPropertyFromAssignsRector;

return RectorConfig::configure()
    ->withPaths([
        __DIR__ . '/src',
        __DIR__ . '/tests',
    ])
    ->withSkip([
        __DIR__ . '/src/Generated/*',
        __DIR__ . '/src/Legacy/SoapClient.php',
    ])
    ->withSets([
        LevelSetList::UP_TO_PHP_84,
        SetList::DEAD_CODE,
        SetList::EARLY_RETURN,
        SetList::CODE_QUALITY,
        SetList::TYPE_DECLARATION,
        SetList::PRIVATIZATION,
    ])
    ->withRules([
        SimplifyIfReturnBoolRector::class,
        TypedPropertyFromAssignsRector::class,
    ])
    ->withImportNames(removeUnusedImports: true)
    ->withParallel()
    ->withCache(__DIR__ . '/var/rector');`}),e.jsx("p",{children:"Os sets que mais mudam vida:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"LevelSetList::UP_TO_PHP_84"})," — aplica em cascata todas as upgrades de PHP 5.3 até 8.4."]}),e.jsxs("li",{children:[e.jsx("code",{children:"SetList::DEAD_CODE"})," — remove métodos privados sem uso, ifs sempre falsos, branches mortos."]}),e.jsxs("li",{children:[e.jsx("code",{children:"SetList::EARLY_RETURN"})," — converte ",e.jsx("code",{children:"if/else"})," aninhados em early returns."]}),e.jsxs("li",{children:[e.jsx("code",{children:"SetList::CODE_QUALITY"})," — simplificações lógicas (negações duplas, ternários redundantes)."]}),e.jsxs("li",{children:[e.jsx("code",{children:"SetList::TYPE_DECLARATION"})," — adiciona type hints inferindo dos usos."]})]}),e.jsx("h2",{children:"Dry-run sempre primeiro"}),e.jsxs("p",{children:["A regra de ouro: ",e.jsx("strong",{children:"nunca rode o Rector direto"}),". Sempre ",e.jsx("code",{children:"--dry-run"})," ","para ver o diff antes de aceitar. Vamos pegar um arquivo bem PHP 5 raiz e ver o estrago:"]}),e.jsx(o,{filename:"src/Cliente.php (antes)",code:`<?php
namespace App;

class Cliente
{
    private $id;
    private $nome;
    private $email;
    private $ativo;

    public function __construct($id, $nome, $email, $ativo = true)
    {
        $this->id = $id;
        $this->nome = $nome;
        $this->email = $email;
        $this->ativo = $ativo;
    }

    public function isAtivo()
    {
        if ($this->ativo == true) {
            return true;
        } else {
            return false;
        }
    }

    public function getNome()
    {
        return $this->nome;
    }
}`}),e.jsx(r,{user:"dev",host:"php",cwd:"~/projetos/legado",command:"vendor/bin/rector process --dry-run",output:` 1/1 [============================] 100%

1 file with changes
==================

1) src/Cliente.php

    ---------- begin diff ----------
@@ @@
 <?php
+
+declare(strict_types=1);
+
 namespace App;

-class Cliente
+final class Cliente
 {
-    private $id;
-    private $nome;
-    private $email;
-    private $ativo;
-
-    public function __construct($id, $nome, $email, $ativo = true)
-    {
-        $this->id = $id;
-        $this->nome = $nome;
-        $this->email = $email;
-        $this->ativo = $ativo;
-    }
-
-    public function isAtivo()
-    {
-        if ($this->ativo == true) {
-            return true;
-        } else {
-            return false;
-        }
+    public function __construct(
+        private readonly int $id,
+        private readonly string $nome,
+        private readonly string $email,
+        private readonly bool $ativo = true,
+    ) {
     }

-    public function getNome()
+    public function isAtivo(): bool
+    {
+        return $this->ativo;
+    }
+
+    public function getNome(): string
     {
         return $this->nome;
     }
 }
    ----------- end diff ----------

Applied rules:
 * DeclareStrictTypesRector
 * FinalizeClassesWithoutChildrenRector
 * ClassPropertyAssignToConstructorPromotionRector
 * ReadOnlyPropertyRector
 * SimplifyIfReturnBoolRector
 * AddReturnTypeDeclarationFromYieldsRector
 * TypedPropertyFromAssignsRector

[OK] 1 file would have been changed (dry-run) by Rector`}),e.jsxs("p",{children:["Olha quanta coisa em uma única passada: ",e.jsx("code",{children:"declare(strict_types=1)"})," adicionado, a classe virou ",e.jsx("code",{children:"final"}),", propriedades viraram ",e.jsx("strong",{children:"constructor promotion"})," ","com ",e.jsx("code",{children:"readonly"}),", o ",e.jsx("code",{children:"if/else"})," tonto virou ",e.jsx("code",{children:"return $this->ativo"}),"e os métodos ganharam type hints. Aceito? Roda sem o flag:"]}),e.jsx(r,{user:"dev",host:"php",cwd:"~/projetos/legado",command:"vendor/bin/rector process",output:` 1/1 [============================] 100%

1 file with changes
==================

1) src/Cliente.php

[OK] 1 file have been changed by Rector`}),e.jsx("p",{children:"O resultado:"}),e.jsx(o,{filename:"src/Cliente.php (depois)",code:`<?php

declare(strict_types=1);

namespace App;

final class Cliente
{
    public function __construct(
        private readonly int $id,
        private readonly string $nome,
        private readonly string $email,
        private readonly bool $ativo = true,
    ) {
    }

    public function isAtivo(): bool
    {
        return $this->ativo;
    }

    public function getNome(): string
    {
        return $this->nome;
    }
}`}),e.jsx(i,{type:"success",title:"É PHP 8.4 idiomático em segundos",children:"Esse refactor manual leva 5 minutos por classe. Em projeto com 400 classes, são 30 horas de trabalho mecânico. O Rector faz tudo numa madrugada."}),e.jsx("h2",{children:"Sets úteis fora do core"}),e.jsx("p",{children:"Para frameworks específicos, o Rector tem extensões oficiais. As mais usadas:"}),e.jsx(r,{user:"dev",host:"php",cwd:"~/projetos/legado",command:"composer require --dev rector/rector driftingly/rector-laravel",output:`Using version ^1.2 for driftingly/rector-laravel
./composer.json has been updated
Lock file operations: 1 install, 0 updates, 0 removals
  - Locking driftingly/rector-laravel (1.2.5)
Installing dependencies from lock file (including require-dev)
Generating autoload files`}),e.jsxs("p",{children:["E no ",e.jsx("code",{children:"rector.php"}),", basta adicionar os sets do framework:"]}),e.jsx(o,{filename:"rector.php (com Laravel)",code:`<?php
declare(strict_types=1);

use Rector\\Config\\RectorConfig;
use Rector\\Set\\ValueObject\\LevelSetList;
use Rector\\Set\\ValueObject\\SetList;
use RectorLaravel\\Set\\LaravelLevelSetList;
use RectorLaravel\\Set\\LaravelSetList;

return RectorConfig::configure()
    ->withPaths([__DIR__ . '/app', __DIR__ . '/tests'])
    ->withSets([
        LevelSetList::UP_TO_PHP_84,
        LaravelLevelSetList::UP_TO_LARAVEL_110,
        LaravelSetList::LARAVEL_CODE_QUALITY,
        LaravelSetList::LARAVEL_COLLECTION,
        SetList::DEAD_CODE,
        SetList::EARLY_RETURN,
    ])
    ->withParallel();`}),e.jsx("h2",{children:"Modernizando datetime"}),e.jsxs("p",{children:["Um exemplo clássico: código velho usa ",e.jsx("code",{children:"strtotime"})," + ",e.jsx("code",{children:"date()"}),". O set de PHP moderno detecta esse pattern e propõe ",e.jsx("code",{children:"DateTimeImmutable"}),":"]}),e.jsx(o,{filename:"src/Relatorio.php (antes)",code:`<?php
namespace App;

class Relatorio
{
    public function periodo($inicio)
    {
        $ts = strtotime($inicio);
        $fim = $ts + (7 * 86400);
        return date('Y-m-d', $fim);
    }
}`}),e.jsx(r,{user:"dev",host:"php",cwd:"~/projetos/legado",command:"vendor/bin/rector process src/Relatorio.php --dry-run",output:`1) src/Relatorio.php

@@ @@
+declare(strict_types=1);
+
 namespace App;

-class Relatorio
+final class Relatorio
 {
-    public function periodo($inicio)
+    public function periodo(string $inicio): string
     {
-        $ts = strtotime($inicio);
-        $fim = $ts + (7 * 86400);
-        return date('Y-m-d', $fim);
+        $inicioObj = new \\DateTimeImmutable($inicio);
+        return $inicioObj->modify('+7 days')->format('Y-m-d');
     }
 }

Applied rules:
 * StringableForToStringRector
 * StrtotimeToDateTimeRector
 * AddVoidReturnTypeWhereNoReturnRector

[OK] 1 file would have been changed`}),e.jsx("h2",{children:"Custom rector: regras do seu domínio"}),e.jsxs("p",{children:["Você pode escrever ",e.jsx("em",{children:"rectors"})," próprios para padrões internos da equipe. Exemplo: renomear um método legado em todas as chamadas:"]}),e.jsx(s,{language:"bash",code:`vendor/bin/rector custom-rule
# Gera o esqueleto interativo de uma regra customizada,
# já com o teste em PHPUnit. Você só completa o "transform".`}),e.jsx("h2",{children:"Workflow de adoção em projeto grande"}),e.jsx("p",{children:"A pior estratégia é rodar Rector com tudo ligado em 200 mil linhas. PR vira monstro irevisável, ninguém aceita. Estratégia que funciona:"}),e.jsxs("ol",{className:"list-decimal ml-5 space-y-1",children:[e.jsxs("li",{children:["Comece com ",e.jsx("strong",{children:"um set por PR"})," (só DEAD_CODE, por exemplo)."]}),e.jsxs("li",{children:["Restrinja ",e.jsx("code",{children:"withPaths"})," a uma pasta por vez (",e.jsx("code",{children:"src/Domain"}),", depois ",e.jsx("code",{children:"src/Application"}),")."]}),e.jsxs("li",{children:["Após cada Rector, rode ",e.jsx("code",{children:"vendor/bin/phpunit"})," imediatamente — testes precisam continuar verdes."]}),e.jsx("li",{children:"Comita o resultado, abre PR, próxima sessão."})]}),e.jsxs(i,{type:"warning",title:"Rector não pensa por você",children:["Ele aplica padrões. Pode introduzir bugs sutis (ex.: trocar ",e.jsx("code",{children:"=="})," por"," ",e.jsx("code",{children:"==="})," em código que dependia de coerção). ",e.jsx("strong",{children:"Sem testes verdes, não rode Rector"}),". PHPUnit + PHPStan são pré-requisitos, não bônus."]}),e.jsx("h2",{children:"Integrando ao CI"}),e.jsxs("p",{children:["Em CI, use ",e.jsx("code",{children:"--dry-run"})," para falhar se houver melhorias possíveis. Isso vira um"," ","radar permanente: qualquer commit novo já nasce no padrão moderno."]}),e.jsx(r,{user:"ci",host:"github",cwd:"/runner/work/projeto",command:"vendor/bin/rector process --dry-run --no-progress-bar",output:`Loading config: rector.php

[OK] Rector is done!
0 files with changes`}),e.jsxs("p",{children:["Mais nada a refatorar — o build passa. Sai um PR e o pipeline diz ",e.jsx("em",{children:"“peraí, dá pra modernizar isso aqui”"}),". Code review automático, gratuito."]})]})}export{l as default};
