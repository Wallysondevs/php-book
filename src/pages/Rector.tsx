import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Rector() {
  return (
    <PageContainer
      title="Rector — refactor automático"
      subtitle="Atualizar 50 mil linhas de PHP 7.1 para PHP 8.4 manualmente é insanidade. O Rector faz isso commit a commit, com diff revisável, sem você abrir um único arquivo na mão."
      difficulty="avancado"
      timeToRead="12 min"
      category="Qualidade"
    >
      <AlertBox type="info" title="Pré-requisitos">
          <p>Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP.</p>
        </AlertBox>
        <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"Rector"}</strong> {' — '} {"refatoração automatizada baseada em regras."}
          </li>
        <li>
            <strong>{"Sets"}</strong> {' — '} {"PHP 7→8, Laravel x→y, Symfony etc."}
          </li>
        <li>
            <strong>{"Custom rules"}</strong> {' — '} {"estenda AbstractRector para suas convenções."}
          </li>
        <li>
            <strong>{"Dry run"}</strong> {' — '} {"rector process --dry-run mostra mudanças sem aplicar."}
          </li>
        <li>
            <strong>{"Use case"}</strong> {' — '} {"upgrades de PHP, deprecations, padronização."}
          </li>
        </ul>
          <h2>O problema: legado parado é dívida que cresce</h2>
      <p>
        Você herdou um projeto PHP 7.1 e o cliente quer rodar em PHP 8.4 (correção de segurança,
        performance, OPcache JIT). Refatorar à mão? <code>list()</code> virando array destructuring,
        <code>strtotime</code> virando <code>DateTimeImmutable</code>, classes ganhando{" "}
        <code>readonly</code> e constructor promotion... São <strong>milhares</strong> de mudanças
        mecânicas. Trabalho de máquina, não de gente.
      </p>

      <p>
        O <strong>Rector</strong> é essa máquina. Ele aplica regras (chamadas <em>rectors</em>) que
        reescrevem o seu código automaticamente, em diffs pequenos que você revisa e comita.
      </p>

      <h2>Instalação</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/legado"
        command="composer require --dev rector/rector"
        output={`Using version ^1.2 for rector/rector
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
Generating autoload files`}
      />

      <h2>Configuração com rector.php</h2>
      <p>
        O Rector lê um <code>rector.php</code> na raiz do projeto. Aqui é onde você diz quais{" "}
        <strong>sets</strong> de regras aplicar e em quais pastas:
      </p>

      <PhpBlock
        filename="rector.php"
        code={`<?php
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
    ->withCache(__DIR__ . '/var/rector');`}
      />

      <p>Os sets que mais mudam vida:</p>
      <ul>
        <li><code>LevelSetList::UP_TO_PHP_84</code> — aplica em cascata todas as upgrades de PHP 5.3 até 8.4.</li>
        <li><code>SetList::DEAD_CODE</code> — remove métodos privados sem uso, ifs sempre falsos, branches mortos.</li>
        <li><code>SetList::EARLY_RETURN</code> — converte <code>if/else</code> aninhados em early returns.</li>
        <li><code>SetList::CODE_QUALITY</code> — simplificações lógicas (negações duplas, ternários redundantes).</li>
        <li><code>SetList::TYPE_DECLARATION</code> — adiciona type hints inferindo dos usos.</li>
      </ul>

      <h2>Dry-run sempre primeiro</h2>
      <p>
        A regra de ouro: <strong>nunca rode o Rector direto</strong>. Sempre <code>--dry-run</code>{" "}
        para ver o diff antes de aceitar. Vamos pegar um arquivo bem PHP 5 raiz e ver o estrago:
      </p>

      <PhpBlock
        filename="src/Cliente.php (antes)"
        code={`<?php
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
}`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/legado"
        command="vendor/bin/rector process --dry-run"
        output={` 1/1 [============================] 100%

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

[OK] 1 file would have been changed (dry-run) by Rector`}
      />

      <p>
        Olha quanta coisa em uma única passada: <code>declare(strict_types=1)</code> adicionado, a
        classe virou <code>final</code>, propriedades viraram <strong>constructor promotion</strong>{" "}
        com <code>readonly</code>, o <code>if/else</code> tonto virou <code>return $this-&gt;ativo</code>
        e os métodos ganharam type hints. Aceito? Roda sem o flag:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/legado"
        command="vendor/bin/rector process"
        output={` 1/1 [============================] 100%

1 file with changes
==================

1) src/Cliente.php

[OK] 1 file have been changed by Rector`}
      />

      <p>O resultado:</p>

      <PhpBlock
        filename="src/Cliente.php (depois)"
        code={`<?php

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
}`}
      />

      <AlertBox type="success" title="É PHP 8.4 idiomático em segundos">
        Esse refactor manual leva 5 minutos por classe. Em projeto com 400 classes, são 30 horas de
        trabalho mecânico. O Rector faz tudo numa madrugada.
      </AlertBox>

      <h2>Sets úteis fora do core</h2>
      <p>
        Para frameworks específicos, o Rector tem extensões oficiais. As mais usadas:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/legado"
        command={`composer require --dev rector/rector driftingly/rector-laravel`}
        output={`Using version ^1.2 for driftingly/rector-laravel
./composer.json has been updated
Lock file operations: 1 install, 0 updates, 0 removals
  - Locking driftingly/rector-laravel (1.2.5)
Installing dependencies from lock file (including require-dev)
Generating autoload files`}
      />

      <p>
        E no <code>rector.php</code>, basta adicionar os sets do framework:
      </p>

      <PhpBlock
        filename="rector.php (com Laravel)"
        code={`<?php
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
    ->withParallel();`}
      />

      <h2>Modernizando datetime</h2>
      <p>
        Um exemplo clássico: código velho usa <code>strtotime</code> + <code>date()</code>. O set
        de PHP moderno detecta esse pattern e propõe <code>DateTimeImmutable</code>:
      </p>

      <PhpBlock
        filename="src/Relatorio.php (antes)"
        code={`<?php
namespace App;

class Relatorio
{
    public function periodo($inicio)
    {
        $ts = strtotime($inicio);
        $fim = $ts + (7 * 86400);
        return date('Y-m-d', $fim);
    }
}`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/legado"
        command="vendor/bin/rector process src/Relatorio.php --dry-run"
        output={`1) src/Relatorio.php

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

[OK] 1 file would have been changed`}
      />

      <h2>Custom rector: regras do seu domínio</h2>
      <p>
        Você pode escrever <em>rectors</em> próprios para padrões internos da equipe. Exemplo:
        renomear um método legado em todas as chamadas:
      </p>

      <CodeBlock
        language="bash"
        code={`vendor/bin/rector custom-rule
# Gera o esqueleto interativo de uma regra customizada,
# já com o teste em PHPUnit. Você só completa o "transform".`}
      />

      <h2>Workflow de adoção em projeto grande</h2>
      <p>
        A pior estratégia é rodar Rector com tudo ligado em 200 mil linhas. PR vira monstro
        irevisável, ninguém aceita. Estratégia que funciona:
      </p>
      <ol className="list-decimal ml-5 space-y-1">
        <li>Comece com <strong>um set por PR</strong> (só DEAD_CODE, por exemplo).</li>
        <li>Restrinja <code>withPaths</code> a uma pasta por vez (<code>src/Domain</code>, depois <code>src/Application</code>).</li>
        <li>Após cada Rector, rode <code>vendor/bin/phpunit</code> imediatamente — testes precisam continuar verdes.</li>
        <li>Comita o resultado, abre PR, próxima sessão.</li>
      </ol>

      <AlertBox type="warning" title="Rector não pensa por você">
        Ele aplica padrões. Pode introduzir bugs sutis (ex.: trocar <code>==</code> por{" "}
        <code>===</code> em código que dependia de coerção). <strong>Sem testes verdes, não rode
        Rector</strong>. PHPUnit + PHPStan são pré-requisitos, não bônus.
      </AlertBox>

      <h2>Integrando ao CI</h2>
      <p>
        Em CI, use <code>--dry-run</code> para falhar se houver melhorias possíveis. Isso vira um{" "}
        radar permanente: qualquer commit novo já nasce no padrão moderno.
      </p>

      <TerminalBlock
        user="ci"
        host="github"
        cwd="/runner/work/projeto"
        command="vendor/bin/rector process --dry-run --no-progress-bar"
        output={`Loading config: rector.php

[OK] Rector is done!
0 files with changes`}
      />

      <p>
        Mais nada a refatorar — o build passa. Sai um PR e o pipeline diz <em>“peraí, dá pra
        modernizar isso aqui”</em>. Code review automático, gratuito.
      </p>
    </PageContainer>
  );
}
