import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function DoctrineDbal() {
  return (
    <PageContainer
      title="Doctrine DBAL"
      subtitle="Uma camada fina sobre PDO que dá portabilidade real entre SQLite, MySQL e Postgres, um QueryBuilder fluente e tipos automáticos — sem o peso do ORM completo."
      difficulty="intermediario"
      timeToRead="13 min"
      category="Banco Avançado"
    >
      <h2>O problema: PDO puro acaba virando colcha de retalhos</h2>
      <p>
        PDO funciona, mas você logo descobre dores: o placeholder <code>LIMIT ?</code> aceita string em
        MySQL e int em Postgres, <code>BOOLEAN</code> volta como <code>"1"</code> em um driver e como{" "}
        <code>true</code> em outro, e qualquer query com 5 condicionais opcionais vira concatenação de
        string com <code>if</code>. O <strong>Doctrine DBAL</strong> resolve isso: é uma camada fina sobre o
        PDO que dá <em>portabilidade</em>, <em>conversão de tipos</em> e um <em>QueryBuilder</em> fluente,
        sem o peso (e a curva de aprendizado) do ORM completo.
      </p>

      <h2>Instalação</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command="composer require doctrine/dbal"
        output={`./composer.json has been updated
Running composer update doctrine/dbal
Loading composer repositories with package information
Updating dependencies
Lock file operations: 1 install, 0 updates, 0 removals
  - Locking doctrine/dbal (4.2.1)
Writing lock file
Installing dependencies from lock file (including require-dev)
Package operations: 1 install, 0 updates, 0 removals
  - Installing doctrine/dbal (4.2.1)
Generating optimized autoload files`}
      />

      <h2>Conectando: uma URL para todos os bancos</h2>
      <p>
        A grande sacada do DBAL é receber uma <strong>URL de conexão</strong>. Trocar de SQLite para
        Postgres em produção vira mudar uma string no <code>.env</code> — nada mais.
      </p>

      <PhpBlock
        filename="src/conexao.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Doctrine\\DBAL\\DriverManager;

// SQLite local — perfeito para dev e testes
$conn = DriverManager::getConnection([
    'url' => 'sqlite:///' . __DIR__ . '/../var/loja.db',
]);

// MySQL em produção
// $conn = DriverManager::getConnection([
//     'url' => 'mysql://app:secret@db:3306/loja?charset=utf8mb4',
// ]);

// Postgres
// $conn = DriverManager::getConnection([
//     'url' => 'pgsql://app:secret@db:5432/loja',
// ]);

echo $conn->getDatabasePlatform()::class . PHP_EOL;
echo 'Conectado!' . PHP_EOL;`}
        output={`Doctrine\\DBAL\\Platforms\\SQLitePlatform
Conectado!`}
      />

      <AlertBox type="info" title="Por que URL e não array?">
        Você guarda <code>DATABASE_URL=mysql://app:secret@db/loja</code> no <code>.env</code>, e o mesmo
        código roda em dev (SQLite), CI (SQLite na memória) e produção (MySQL). Zero <em>if</em> no código.
      </AlertBox>

      <h2>Criando schema e populando dados</h2>
      <p>
        <code>executeStatement()</code> roda DDL e DML que <strong>não retornam linhas</strong> (CREATE,
        INSERT, UPDATE, DELETE). Ele devolve o número de linhas afetadas.
      </p>

      <PhpBlock
        filename="bin/seed.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Doctrine\\DBAL\\DriverManager;

$conn = DriverManager::getConnection([
    'url' => 'sqlite:///' . __DIR__ . '/../var/loja.db',
]);

$conn->executeStatement(<<<SQL
    CREATE TABLE IF NOT EXISTS produtos (
        id     INTEGER PRIMARY KEY AUTOINCREMENT,
        nome   TEXT NOT NULL,
        preco  REAL NOT NULL,
        ativo  INTEGER NOT NULL DEFAULT 1
    )
SQL);

$conn->executeStatement('DELETE FROM produtos');

$produtos = [
    ['Café 500g',     29.90, 1],
    ['Pão integral',   8.50, 1],
    ['Manteiga 200g', 18.00, 1],
    ['Leite 1L',       6.20, 0],
];

foreach ($produtos as [$nome, $preco, $ativo]) {
    $linhas = $conn->executeStatement(
        'INSERT INTO produtos (nome, preco, ativo) VALUES (?, ?, ?)',
        [$nome, $preco, $ativo],
    );
    echo "inserido: {$nome} ({$linhas} linha)" . PHP_EOL;
}

echo 'Total: ' . $conn->fetchOne('SELECT COUNT(*) FROM produtos') . PHP_EOL;`}
        output={`inserido: Café 500g (1 linha)
inserido: Pão integral (1 linha)
inserido: Manteiga 200g (1 linha)
inserido: Leite 1L (1 linha)
Total: 4`}
      />

      <h2>Buscando: fetchAssociative e fetchAllAssociative</h2>
      <p>
        Os métodos de leitura mais usados são <code>fetchAssociative()</code> (uma linha como array
        associativo ou <code>false</code>) e <code>fetchAllAssociative()</code> (lista de arrays). Ambos
        já fazem <em>prepared statement</em> com placeholders posicionais ou nomeados.
      </p>

      <PhpBlock
        filename="bin/listar.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Doctrine\\DBAL\\DriverManager;

$conn = DriverManager::getConnection([
    'url' => 'sqlite:///' . __DIR__ . '/../var/loja.db',
]);

// Uma linha
$linha = $conn->fetchAssociative(
    'SELECT id, nome, preco FROM produtos WHERE id = ?',
    [1],
);
print_r($linha);

// Várias linhas, com placeholders nomeados
$ativos = $conn->fetchAllAssociative(
    'SELECT nome, preco FROM produtos WHERE ativo = :ativo ORDER BY preco DESC',
    ['ativo' => 1],
);

foreach ($ativos as $p) {
    printf("%-20s R$ %5.2f%s", $p['nome'], $p['preco'], PHP_EOL);
}

// Valor único
$total = $conn->fetchOne('SELECT SUM(preco) FROM produtos WHERE ativo = 1');
echo "Soma dos ativos: R$ {$total}" . PHP_EOL;`}
        output={`Array
(
    [id] => 1
    [nome] => Café 500g
    [preco] => 29.9
)
Café 500g            R$ 29.90
Manteiga 200g        R$ 18.00
Pão integral         R$  8.50
Soma dos ativos: R$ 56.4`}
      />

      <h2>QueryBuilder: queries que crescem sem virar mingau</h2>
      <p>
        Quando o filtro depende de input do usuário (busca opcional, faixa de preço, paginação), montar
        SQL na unha vira pesadelo. O <code>QueryBuilder</code> resolve isso com uma API fluente que ainda
        protege contra SQL injection automaticamente via <em>parâmetros nomeados</em>.
      </p>

      <PhpBlock
        filename="src/Catalogo.php"
        code={`<?php
declare(strict_types=1);

namespace App;

use Doctrine\\DBAL\\Connection;
use Doctrine\\DBAL\\ParameterType;

final readonly class Catalogo
{
    public function __construct(private Connection $conn) {}

    /** @return list<array{id:int, nome:string, preco:float}> */
    public function buscar(?string $termo, ?float $precoMax, int $pagina = 1): array
    {
        $qb = $this->conn->createQueryBuilder()
            ->select('id', 'nome', 'preco')
            ->from('produtos')
            ->where('ativo = :ativo')
            ->setParameter('ativo', 1, ParameterType::INTEGER)
            ->orderBy('preco', 'ASC')
            ->setFirstResult(($pagina - 1) * 10)
            ->setMaxResults(10);

        if ($termo !== null && $termo !== '') {
            $qb->andWhere('nome LIKE :termo')
               ->setParameter('termo', "%{$termo}%");
        }

        if ($precoMax !== null) {
            $qb->andWhere('preco <= :max')
               ->setParameter('max', $precoMax);
        }

        return $qb->fetchAllAssociative();
    }
}`}
      />

      <PhpBlock
        filename="bin/buscar.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use App\\Catalogo;
use Doctrine\\DBAL\\DriverManager;

$conn = DriverManager::getConnection([
    'url' => 'sqlite:///' . __DIR__ . '/../var/loja.db',
]);

$catalogo = new Catalogo($conn);

print_r($catalogo->buscar(termo: 'Pão', precoMax: null));
print_r($catalogo->buscar(termo: null, precoMax: 20.00));`}
        output={`Array
(
    [0] => Array ( [id] => 2 [nome] => Pão integral [preco] => 8.5 )
)
Array
(
    [0] => Array ( [id] => 2 [nome] => Pão integral [preco] => 8.5 )
    [1] => Array ( [id] => 3 [nome] => Manteiga 200g [preco] => 18 )
)`}
      />

      <AlertBox type="success" title="Por que QueryBuilder ganha de concatenar string?">
        <ul className="list-disc ml-5 mt-1 space-y-1">
          <li>Parâmetros são <strong>sempre</strong> bindados — SQL injection vira impossível por construção.</li>
          <li><code>setFirstResult/setMaxResults</code> traduzem para <code>LIMIT/OFFSET</code> (MySQL/SQLite) ou <code>OFFSET/FETCH</code> (SQL Server) automaticamente.</li>
          <li>Você pode adicionar condições em loops sem se preocupar com vírgulas, parênteses ou <code>AND</code> sobrando.</li>
        </ul>
      </AlertBox>

      <h2>Tipos: deixe o DBAL converter para você</h2>
      <p>
        A maior dor da portabilidade entre bancos é tipo. <code>BOOLEAN</code> no Postgres é <code>true/false</code>;
        no SQLite é <code>1/0</code>; no MySQL é <code>tinyint(1)</code>. <code>DATETIME</code> volta como
        string em todos. O DBAL aceita um <strong>terceiro array de tipos</strong> que faz a conversão na ida e na volta.
      </p>

      <PhpBlock
        filename="bin/tipos.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Doctrine\\DBAL\\DriverManager;
use Doctrine\\DBAL\\Types\\Types;

$conn = DriverManager::getConnection([
    'url' => 'sqlite:///' . __DIR__ . '/../var/loja.db',
]);

$conn->executeStatement('CREATE TABLE IF NOT EXISTS pedidos (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    criado_em TEXT NOT NULL,
    pago INTEGER NOT NULL
)');

$conn->insert('pedidos', [
    'criado_em' => new \\DateTimeImmutable('2025-01-15 10:30:00'),
    'pago'      => true,
], [
    'criado_em' => Types::DATETIME_IMMUTABLE,
    'pago'      => Types::BOOLEAN,
]);

$linha = $conn->fetchAssociative('SELECT * FROM pedidos ORDER BY id DESC LIMIT 1');

echo "criado_em (raw): {$linha['criado_em']}" . PHP_EOL;
echo "pago     (raw): " . var_export($linha['pago'], true) . PHP_EOL;

// Convertendo manualmente na leitura
$platform = $conn->getDatabasePlatform();
$dt   = Types::getType(Types::DATETIME_IMMUTABLE)->convertToPHPValue($linha['criado_em'], $platform);
$pago = Types::getType(Types::BOOLEAN)->convertToPHPValue($linha['pago'], $platform);

echo "criado_em (php): " . $dt->format('d/m/Y H:i') . PHP_EOL;
echo "pago     (php): " . ($pago ? 'sim' : 'não') . PHP_EOL;`}
        output={`criado_em (raw): 2025-01-15 10:30:00
pago     (raw): '1'
criado_em (php): 15/01/2025 10:30
pago     (php): sim`}
      />

      <h2>Portabilidade real entre SQLite, MySQL e Postgres</h2>
      <p>
        O DBAL detecta o <em>platform</em> da conexão e ajusta SQL automaticamente. Funções como
        <code>insert()</code>, <code>update()</code>, <code>delete()</code> e o QueryBuilder cobrem 95%
        do que você precisa de forma portável. Para o resto, você consulta <code>getDatabasePlatform()</code>:
      </p>

      <PhpBlock
        filename="bin/portabilidade.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Doctrine\\DBAL\\DriverManager;
use Doctrine\\DBAL\\Platforms\\MySQLPlatform;
use Doctrine\\DBAL\\Platforms\\PostgreSQLPlatform;
use Doctrine\\DBAL\\Platforms\\SQLitePlatform;

$conn = DriverManager::getConnection([
    'url' => $_ENV['DATABASE_URL'] ?? 'sqlite:///:memory:',
]);

$platform = $conn->getDatabasePlatform();

$sqlAtuais = match (true) {
    $platform instanceof PostgreSQLPlatform => "SELECT NOW()",
    $platform instanceof MySQLPlatform      => "SELECT NOW()",
    $platform instanceof SQLitePlatform     => "SELECT datetime('now')",
};

echo "Platform: " . $platform::class . PHP_EOL;
echo "Agora:    " . $conn->fetchOne($sqlAtuais) . PHP_EOL;`}
        output={`Platform: Doctrine\\DBAL\\Platforms\\SQLitePlatform
Agora:    2025-01-15 13:42:08`}
      />

      <CodeBlock
        title=".env"
        language="ini"
        code={`# Dev local
DATABASE_URL=sqlite:///%kernel.project_dir%/var/loja.db

# CI (rapidíssimo, descartável)
# DATABASE_URL=sqlite:///:memory:

# Produção
# DATABASE_URL=mysql://app:secret@db:3306/loja?charset=utf8mb4
# DATABASE_URL=pgsql://app:secret@db:5432/loja?sslmode=require`}
      />

      <AlertBox type="warning" title="DBAL não é ORM">
        Se você quer mapear classes para tabelas, lazy-loading, relacionamentos e gerenciador de
        entidades, você quer o <strong>Doctrine ORM</strong> (que usa o DBAL por baixo). O DBAL é a
        camada certa quando você quer SQL explícito + portabilidade — perfeito para APIs, scripts e
        repositórios <em>data-mapper</em> escritos à mão.
      </AlertBox>

      <h2>Rodando os exemplos</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command="mkdir -p var && php bin/seed.php && php bin/listar.php"
        output={`inserido: Café 500g (1 linha)
inserido: Pão integral (1 linha)
inserido: Manteiga 200g (1 linha)
inserido: Leite 1L (1 linha)
Total: 4
Café 500g            R$ 29.90
Manteiga 200g        R$ 18.00
Pão integral         R$  8.50
Soma dos ativos: R$ 56.4`}
      />

      <p>
        Com a conexão e o QueryBuilder dominados, o próximo passo é <strong>versionar o schema</strong> —
        e é exatamente isso que <em>migrations</em> resolvem no próximo capítulo.
      </p>
    </PageContainer>
  );
}
