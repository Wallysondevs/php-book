import{j as e}from"./index-Bb4MiiJL.js";import{P as t,a as o,A as a}from"./AlertBox-BpD-xIsb.js";import{T as r}from"./TerminalBlock-DGurMC1r.js";import{C as i}from"./CodeBlock-C3V-qEkN.js";function l(){return e.jsxs(t,{title:"Doctrine DBAL",subtitle:"Uma camada fina sobre PDO que dá portabilidade real entre SQLite, MySQL e Postgres, um QueryBuilder fluente e tipos automáticos — sem o peso do ORM completo.",difficulty:"intermediario",timeToRead:"13 min",category:"Banco Avançado",children:[e.jsx("h2",{children:"O problema: PDO puro acaba virando colcha de retalhos"}),e.jsxs("p",{children:["PDO funciona, mas você logo descobre dores: o placeholder ",e.jsx("code",{children:"LIMIT ?"})," aceita string em MySQL e int em Postgres, ",e.jsx("code",{children:"BOOLEAN"})," volta como ",e.jsx("code",{children:'"1"'})," em um driver e como"," ",e.jsx("code",{children:"true"})," em outro, e qualquer query com 5 condicionais opcionais vira concatenação de string com ",e.jsx("code",{children:"if"}),". O ",e.jsx("strong",{children:"Doctrine DBAL"})," resolve isso: é uma camada fina sobre o PDO que dá ",e.jsx("em",{children:"portabilidade"}),", ",e.jsx("em",{children:"conversão de tipos"})," e um ",e.jsx("em",{children:"QueryBuilder"})," fluente, sem o peso (e a curva de aprendizado) do ORM completo."]}),e.jsx("h2",{children:"Instalação"}),e.jsx(r,{user:"dev",host:"php",cwd:"~/projetos/loja",command:"composer require doctrine/dbal",output:`./composer.json has been updated
Running composer update doctrine/dbal
Loading composer repositories with package information
Updating dependencies
Lock file operations: 1 install, 0 updates, 0 removals
  - Locking doctrine/dbal (4.2.1)
Writing lock file
Installing dependencies from lock file (including require-dev)
Package operations: 1 install, 0 updates, 0 removals
  - Installing doctrine/dbal (4.2.1)
Generating optimized autoload files`}),e.jsx("h2",{children:"Conectando: uma URL para todos os bancos"}),e.jsxs("p",{children:["A grande sacada do DBAL é receber uma ",e.jsx("strong",{children:"URL de conexão"}),". Trocar de SQLite para Postgres em produção vira mudar uma string no ",e.jsx("code",{children:".env"})," — nada mais."]}),e.jsx(o,{filename:"src/conexao.php",code:`<?php
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
echo 'Conectado!' . PHP_EOL;`,output:`Doctrine\\DBAL\\Platforms\\SQLitePlatform
Conectado!`}),e.jsxs(a,{type:"info",title:"Por que URL e não array?",children:["Você guarda ",e.jsx("code",{children:"DATABASE_URL=mysql://app:secret@db/loja"})," no ",e.jsx("code",{children:".env"}),", e o mesmo código roda em dev (SQLite), CI (SQLite na memória) e produção (MySQL). Zero ",e.jsx("em",{children:"if"})," no código."]}),e.jsx("h2",{children:"Criando schema e populando dados"}),e.jsxs("p",{children:[e.jsx("code",{children:"executeStatement()"})," roda DDL e DML que ",e.jsx("strong",{children:"não retornam linhas"})," (CREATE, INSERT, UPDATE, DELETE). Ele devolve o número de linhas afetadas."]}),e.jsx(o,{filename:"bin/seed.php",code:`<?php
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

echo 'Total: ' . $conn->fetchOne('SELECT COUNT(*) FROM produtos') . PHP_EOL;`,output:`inserido: Café 500g (1 linha)
inserido: Pão integral (1 linha)
inserido: Manteiga 200g (1 linha)
inserido: Leite 1L (1 linha)
Total: 4`}),e.jsx("h2",{children:"Buscando: fetchAssociative e fetchAllAssociative"}),e.jsxs("p",{children:["Os métodos de leitura mais usados são ",e.jsx("code",{children:"fetchAssociative()"})," (uma linha como array associativo ou ",e.jsx("code",{children:"false"}),") e ",e.jsx("code",{children:"fetchAllAssociative()"})," (lista de arrays). Ambos já fazem ",e.jsx("em",{children:"prepared statement"})," com placeholders posicionais ou nomeados."]}),e.jsx(o,{filename:"bin/listar.php",code:`<?php
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
echo "Soma dos ativos: R$ {$total}" . PHP_EOL;`,output:`Array
(
    [id] => 1
    [nome] => Café 500g
    [preco] => 29.9
)
Café 500g            R$ 29.90
Manteiga 200g        R$ 18.00
Pão integral         R$  8.50
Soma dos ativos: R$ 56.4`}),e.jsx("h2",{children:"QueryBuilder: queries que crescem sem virar mingau"}),e.jsxs("p",{children:["Quando o filtro depende de input do usuário (busca opcional, faixa de preço, paginação), montar SQL na unha vira pesadelo. O ",e.jsx("code",{children:"QueryBuilder"})," resolve isso com uma API fluente que ainda protege contra SQL injection automaticamente via ",e.jsx("em",{children:"parâmetros nomeados"}),"."]}),e.jsx(o,{filename:"src/Catalogo.php",code:`<?php
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
}`}),e.jsx(o,{filename:"bin/buscar.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use App\\Catalogo;
use Doctrine\\DBAL\\DriverManager;

$conn = DriverManager::getConnection([
    'url' => 'sqlite:///' . __DIR__ . '/../var/loja.db',
]);

$catalogo = new Catalogo($conn);

print_r($catalogo->buscar(termo: 'Pão', precoMax: null));
print_r($catalogo->buscar(termo: null, precoMax: 20.00));`,output:`Array
(
    [0] => Array ( [id] => 2 [nome] => Pão integral [preco] => 8.5 )
)
Array
(
    [0] => Array ( [id] => 2 [nome] => Pão integral [preco] => 8.5 )
    [1] => Array ( [id] => 3 [nome] => Manteiga 200g [preco] => 18 )
)`}),e.jsx(a,{type:"success",title:"Por que QueryBuilder ganha de concatenar string?",children:e.jsxs("ul",{className:"list-disc ml-5 mt-1 space-y-1",children:[e.jsxs("li",{children:["Parâmetros são ",e.jsx("strong",{children:"sempre"})," bindados — SQL injection vira impossível por construção."]}),e.jsxs("li",{children:[e.jsx("code",{children:"setFirstResult/setMaxResults"})," traduzem para ",e.jsx("code",{children:"LIMIT/OFFSET"})," (MySQL/SQLite) ou ",e.jsx("code",{children:"OFFSET/FETCH"})," (SQL Server) automaticamente."]}),e.jsxs("li",{children:["Você pode adicionar condições em loops sem se preocupar com vírgulas, parênteses ou ",e.jsx("code",{children:"AND"})," sobrando."]})]})}),e.jsx("h2",{children:"Tipos: deixe o DBAL converter para você"}),e.jsxs("p",{children:["A maior dor da portabilidade entre bancos é tipo. ",e.jsx("code",{children:"BOOLEAN"})," no Postgres é ",e.jsx("code",{children:"true/false"}),"; no SQLite é ",e.jsx("code",{children:"1/0"}),"; no MySQL é ",e.jsx("code",{children:"tinyint(1)"}),". ",e.jsx("code",{children:"DATETIME"})," volta como string em todos. O DBAL aceita um ",e.jsx("strong",{children:"terceiro array de tipos"})," que faz a conversão na ida e na volta."]}),e.jsx(o,{filename:"bin/tipos.php",code:`<?php
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
echo "pago     (php): " . ($pago ? 'sim' : 'não') . PHP_EOL;`,output:`criado_em (raw): 2025-01-15 10:30:00
pago     (raw): '1'
criado_em (php): 15/01/2025 10:30
pago     (php): sim`}),e.jsx("h2",{children:"Portabilidade real entre SQLite, MySQL e Postgres"}),e.jsxs("p",{children:["O DBAL detecta o ",e.jsx("em",{children:"platform"})," da conexão e ajusta SQL automaticamente. Funções como",e.jsx("code",{children:"insert()"}),", ",e.jsx("code",{children:"update()"}),", ",e.jsx("code",{children:"delete()"})," e o QueryBuilder cobrem 95% do que você precisa de forma portável. Para o resto, você consulta ",e.jsx("code",{children:"getDatabasePlatform()"}),":"]}),e.jsx(o,{filename:"bin/portabilidade.php",code:`<?php
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
echo "Agora:    " . $conn->fetchOne($sqlAtuais) . PHP_EOL;`,output:`Platform: Doctrine\\DBAL\\Platforms\\SQLitePlatform
Agora:    2025-01-15 13:42:08`}),e.jsx(i,{title:".env",language:"ini",code:`# Dev local
DATABASE_URL=sqlite:///%kernel.project_dir%/var/loja.db

# CI (rapidíssimo, descartável)
# DATABASE_URL=sqlite:///:memory:

# Produção
# DATABASE_URL=mysql://app:secret@db:3306/loja?charset=utf8mb4
# DATABASE_URL=pgsql://app:secret@db:5432/loja?sslmode=require`}),e.jsxs(a,{type:"warning",title:"DBAL não é ORM",children:["Se você quer mapear classes para tabelas, lazy-loading, relacionamentos e gerenciador de entidades, você quer o ",e.jsx("strong",{children:"Doctrine ORM"})," (que usa o DBAL por baixo). O DBAL é a camada certa quando você quer SQL explícito + portabilidade — perfeito para APIs, scripts e repositórios ",e.jsx("em",{children:"data-mapper"})," escritos à mão."]}),e.jsx("h2",{children:"Rodando os exemplos"}),e.jsx(r,{user:"dev",host:"php",cwd:"~/projetos/loja",command:"mkdir -p var && php bin/seed.php && php bin/listar.php",output:`inserido: Café 500g (1 linha)
inserido: Pão integral (1 linha)
inserido: Manteiga 200g (1 linha)
inserido: Leite 1L (1 linha)
Total: 4
Café 500g            R$ 29.90
Manteiga 200g        R$ 18.00
Pão integral         R$  8.50
Soma dos ativos: R$ 56.4`}),e.jsxs("p",{children:["Com a conexão e o QueryBuilder dominados, o próximo passo é ",e.jsx("strong",{children:"versionar o schema"})," — e é exatamente isso que ",e.jsx("em",{children:"migrations"})," resolvem no próximo capítulo."]})]})}export{l as default};
