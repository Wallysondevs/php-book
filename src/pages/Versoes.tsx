import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Versoes() {
  return (
    <PageContainer
      title="Versões e Roadmap"
      subtitle="PHP 7.x vs 8.x, novidades de 8.0 a 8.4, datas de fim de suporte (EOL) e como gerenciar várias versões na mesma máquina com phpenv ou asdf."
      difficulty="iniciante"
      timeToRead="9 min"
      category="Introdução"
    >
      <h2>Qual versão você deve usar agora</h2>
      <p>
        Se você está começando um projeto hoje, a resposta é simples: <strong>PHP 8.4</strong>. Se a sua
        empresa ainda está em 8.1 ou 8.2, está tudo bem — são versões maduras. Se está em 7.x, você
        tem um problema de segurança: a série 7 está totalmente <em>fora de suporte</em> desde o final
        de 2022.
      </p>

      <AlertBox type="danger" title="Versões fora de suporte são risco de segurança">
        Sem patches de segurança, qualquer CVE descoberta no interpretador fica aberta para sempre.
        Plataformas como WordPress, Laravel e Symfony já recusam rodar em PHP &lt; 8.1.
      </AlertBox>

      <h2>O calendário oficial (resumido)</h2>
      <p>
        O time do PHP segue um ciclo previsível: <strong>2 anos de bugfix + 1 ano só de segurança</strong>.
        Depois disso, a versão é EOL (End-Of-Life).
      </p>

      <CodeBlock
        title="suporte.txt"
        language="text"
        code={`Versão   Lançamento   Bugfix até   Segurança até   Status
PHP 7.4  2019-11-28   2021-11-28   2022-11-28      EOL ❌
PHP 8.0  2020-11-26   2022-11-26   2023-11-26      EOL ❌
PHP 8.1  2021-11-25   2023-11-25   2025-12-31      Só segurança
PHP 8.2  2022-12-08   2024-12-08   2026-12-31      Só segurança
PHP 8.3  2023-11-23   2025-11-23   2027-12-31      Ativo ✅
PHP 8.4  2024-11-21   2026-11-21   2028-12-31      Ativo ✅ (recomendado)`}
      />

      <h2>O salto do 7.4 para o 8.0 — por que importa tanto</h2>
      <p>
        PHP 8.0 foi quem trouxe a maioria das “coisas modernas” que hoje a gente usa todo dia. Vamos ver o mesmo problema escrito nas duas versões:
      </p>

      <PhpBlock
        filename="produto_php74.php"
        code={`<?php
// PHP 7.4 — verboso, sem named args, switch tradicional
class Produto {
    private string $nome;
    private float $preco;
    private string $tipo;

    public function __construct(string $nome, float $preco, string $tipo) {
        $this->nome = $nome;
        $this->preco = $preco;
        $this->tipo = $tipo;
    }

    public function imposto(): float {
        switch ($this->tipo) {
            case 'eletronico': return $this->preco * 0.20;
            case 'livro':      return 0;
            case 'comida':     return $this->preco * 0.05;
            default:           return $this->preco * 0.10;
        }
    }
}

$p = new Produto("Kindle", 800.0, "eletronico");
echo $p->imposto();`}
        output={`160`}
      />

      <PhpBlock
        filename="produto_php84.php"
        code={`<?php
declare(strict_types=1);

enum Tipo: string {
    case Eletronico = 'eletronico';
    case Livro      = 'livro';
    case Comida     = 'comida';
}

final readonly class Produto {
    public function __construct(
        public string $nome,
        public float $preco,
        public Tipo $tipo,
    ) {}

    public function imposto(): float {
        return match ($this->tipo) {
            Tipo::Eletronico => $this->preco * 0.20,
            Tipo::Livro      => 0.0,
            Tipo::Comida     => $this->preco * 0.05,
        };
    }
}

$p = new Produto(nome: "Kindle", preco: 800.0, tipo: Tipo::Eletronico);
echo $p->imposto();`}
        output={`160`}
      />

      <p>
        O resultado é o mesmo. O código 8.4 tem <strong>menos repetição</strong>, é <strong>imutável</strong>{" "}
        por padrão, e o <code>match</code> é exaustivo — se você adicionar um novo case no enum e esquecer
        de tratar, o PHP avisa em runtime com <code>UnhandledMatchError</code>.
      </p>

      <h2>Novidades por versão (sem decoreba)</h2>

      <h3>PHP 8.0 (2020)</h3>
      <ul>
        <li>JIT compiler.</li>
        <li>Constructor promotion.</li>
        <li>Named arguments.</li>
        <li><code>match</code> expression.</li>
        <li>Attributes (<code>#[Route('/')]</code>).</li>
        <li>Nullsafe <code>?-&gt;</code>.</li>
        <li><code>str_contains</code>, <code>str_starts_with</code>, <code>str_ends_with</code>.</li>
      </ul>

      <h3>PHP 8.1 (2021)</h3>
      <ul>
        <li><strong>Enums</strong> nativos.</li>
        <li><code>readonly</code> properties.</li>
        <li><code>never</code> return type.</li>
        <li><strong>Fibers</strong> (base para AMP, ReactPHP modernos).</li>
        <li>First-class callable syntax: <code>strlen(...)</code>.</li>
      </ul>

      <PhpBlock
        filename="enums.php"
        code={`<?php
declare(strict_types=1);

enum Prioridade: int {
    case Baixa  = 1;
    case Media  = 5;
    case Alta   = 10;

    public function label(): string {
        return match ($this) {
            self::Baixa => '🟢 Baixa',
            self::Media => '🟡 Média',
            self::Alta  => '🔴 Alta',
        };
    }
}

foreach (Prioridade::cases() as $p) {
    echo "{$p->value} → {$p->label()}" . PHP_EOL;
}`}
        output={`1 → 🟢 Baixa
5 → 🟡 Média
10 → 🔴 Alta`}
      />

      <h3>PHP 8.2 (2022)</h3>
      <ul>
        <li><code>readonly</code> classes inteiras.</li>
        <li>Tipos <code>true</code>, <code>false</code>, <code>null</code> independentes.</li>
        <li>DNF types: <code>(A&amp;B)|null</code>.</li>
        <li>Constantes em traits.</li>
      </ul>

      <h3>PHP 8.3 (2023)</h3>
      <ul>
        <li>Constantes <em>tipadas</em> em classes.</li>
        <li><code>json_validate()</code> nativo.</li>
        <li>Override attribute <code>#[\Override]</code>.</li>
        <li>Linting de arquivos múltiplos com <code>php -l file1 file2</code>.</li>
      </ul>

      <PhpBlock
        filename="json_validate.php"
        code={`<?php
declare(strict_types=1);

$payload = '{"id":1,"nome":"Ada"}';

if (json_validate($payload)) {
    $dados = json_decode($payload, true);
    echo "Olá, {$dados['nome']}!";
} else {
    echo "JSON inválido.";
}`}
        output={`Olá, Ada!`}
      />

      <h3>PHP 8.4 (2024)</h3>
      <ul>
        <li><strong>Property hooks</strong> — getters/setters declarativos sem boilerplate.</li>
        <li><strong>Asymmetric visibility</strong> — propriedade <code>public</code> de leitura mas <code>private</code> para escrita.</li>
        <li>Novo parser HTML5 (<code>Dom\HTMLDocument</code>).</li>
        <li>Method chaining em <code>new</code> sem parênteses extras: <code>new Foo()-&gt;bar()</code>.</li>
        <li><code>array_find</code>, <code>array_find_key</code>, <code>array_any</code>, <code>array_all</code>.</li>
      </ul>

      <PhpBlock
        filename="asymmetric.php"
        code={`<?php
declare(strict_types=1);

final class Conta {
    public function __construct(
        public private(set) float $saldo = 0.0,
    ) {}

    public function depositar(float $valor): void {
        $this->saldo += $valor;
    }
}

$c = new Conta();
$c->depositar(100.50);
echo "Saldo: R$ " . number_format($c->saldo, 2, ',', '.');

// $c->saldo = 9999.99; // Erro: cannot modify private(set) property`}
        output={`Saldo: R$ 100,50`}
      />

      <AlertBox type="success" title="Para projetos novos em 2026">
        Comece em <strong>PHP 8.4</strong>. Você tem suporte até 2028, todas as features modernas, e
        compatibilidade com qualquer framework atual (Laravel 11+, Symfony 7+, WordPress 6.4+).
      </AlertBox>

      <h2>Gerenciando múltiplas versões</h2>
      <p>
        Cedo ou tarde você vai trabalhar em dois projetos: um em PHP 8.1 (legado) e outro em 8.4 (novo).
        Não tente instalar duas versões manualmente — use um gerenciador.
      </p>

      <h3>Opção 1: asdf (recomendado, multi-linguagem)</h3>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command="asdf plugin add php https://github.com/asdf-community/asdf-php.git"
        output={`initializing plugin repository...
plugin "php" added`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command="asdf install php 8.4.1 && asdf install php 8.1.31"
        output={`Downloading php-8.4.1...
Compiling php-8.4.1... done
Downloading php-8.1.31...
Compiling php-8.1.31... done`}
      />

      <p>
        Agora dentro de cada projeto você fixa a versão criando um <code>.tool-versions</code>:
      </p>

      <CodeBlock
        title=".tool-versions"
        language="text"
        code={`php 8.4.1`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projeto-novo"
        command="php -v"
        output={`PHP 8.4.1 (cli) (built: Nov 19 2024 18:02:10) (NTS)
Copyright (c) The PHP Group
Zend Engine v4.4.1, Copyright (c) Zend Technologies`}
      />

      <h3>Opção 2: phpenv (só PHP, estilo rbenv)</h3>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command="phpenv install 8.4.1 && phpenv global 8.4.1"
        output={`[Info]: Loaded php-build version ...
[Success]: Built 8.4.1 successfully.`}
      />

      <h3>Opção 3 (Linux): pacotes do sistema com sufixo</h3>
      <p>
        No Ubuntu/Debian o repositório <em>ondrej/php</em> permite ter <code>php8.1</code>, <code>php8.3</code>{" "}
        e <code>php8.4</code> instalados lado a lado:
      </p>

      <TerminalBlock
        user="dev"
        host="ubuntu"
        cwd="~"
        command="sudo update-alternatives --config php"
        output={`There are 3 choices for the alternative php (providing /usr/bin/php).

  Selection    Path             Priority   Status
------------------------------------------------------------
* 0            /usr/bin/php8.4   84        auto mode
  1            /usr/bin/php8.1   81        manual mode
  2            /usr/bin/php8.3   83        manual mode
  3            /usr/bin/php8.4   84        manual mode

Press <enter> to keep the current choice, or type selection number:`}
      />

      <h2>O que evitar</h2>
      <ul>
        <li><strong>PHP 5.x e 7.x em produção.</strong> EOL absoluto. Migre.</li>
        <li>
          <strong>Dependências sem suporte para a versão alvo.</strong> Antes de subir para 8.4,
          rode <code>composer outdated</code> e <code>composer audit</code>.
        </li>
        <li>
          <strong>Misturar versões com Docker e local.</strong> Padronize: ou tudo via <code>asdf</code>{" "}
          ou tudo via container. Nunca os dois esquecidos um do outro.
        </li>
      </ul>

      <h2>Verificando o que você tem</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command="php -v && php -m | head -20"
        output={`PHP 8.4.1 (cli) (built: Nov 19 2024 18:02:10) (NTS)
Copyright (c) The PHP Group
Zend Engine v4.4.1, Copyright (c) Zend Technologies
    with Zend OPcache v8.4.1

[PHP Modules]
Core
ctype
curl
date
dom
fileinfo
filter
hash
iconv
json
libxml
mbstring
openssl
pcre
PDO
pdo_mysql
pdo_pgsql
Phar`}
      />

      <p>
        No próximo capítulo a gente <strong>instala o PHP do zero</strong> em Linux, macOS e Windows
        (com plano B usando Docker, sempre que der tilt).
      </p>
    </PageContainer>
  );
}
