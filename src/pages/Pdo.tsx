import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Pdo() {
  return (
    <PageContainer
      title="PDO — acesso a banco"
      subtitle="A camada oficial e portátil de acesso a banco em PHP. Mesma API para SQLite, MySQL e PostgreSQL — e a única que você deveria usar em código novo."
      difficulty="intermediario"
      timeToRead="14 min"
      category="Web & Banco"
    >
      <AlertBox type="info" title="Pré-requisitos">
        <p>Antes deste capítulo, é bom já ter visto: <a href="#/classes" className="text-[#8993BE] underline">Classes</a>, <a href="#/exceptions" className="text-[#8993BE] underline">Try/Catch</a>, <a href="#/namespaces" className="text-[#8993BE] underline">Namespaces</a> e <a href="#/composer" className="text-[#8993BE] underline">Composer</a>.</p>
      </AlertBox>
      <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"PDO"}</strong> {' — '} {"PHP Data Objects — abstração unificada para múltiplos bancos."}
          </li>
        <li>
            <strong>{"DSN"}</strong> {' — '} {"string de conexão: \"mysql:host=...;dbname=...\""}
          </li>
        <li>
            <strong>{"Prepared statements"}</strong> {' — '} {"separa SQL de dados — anti SQL injection."}
          </li>
        <li>
            <strong>{"fetch / fetchAll"}</strong> {' — '} {"lê 1 linha / todas; modos FETCH_ASSOC, FETCH_OBJ."}
          </li>
        <li>
            <strong>{"ATTR_ERRMODE"}</strong> {' — '} {"PDO::ERRMODE_EXCEPTION força exceções em erros."}
          </li>
        </ul>
    
      <p><strong className="text-[#8993BE] font-mono">PDO</strong> — classe nativa <em>PHP Data Objects</em>: camada uniforme de acesso a banco que fala SQLite, MySQL, PostgreSQL, SQL Server e mais. Existe pra padronizar a API e suportar prepared statements de verdade. Sintaxe: <code>$pdo = new PDO($dsn, $user, $pass, $options);</code>.</p>

      <p><strong className="text-[#8993BE] font-mono">FETCH_ASSOC</strong> — constante <code>PDO::FETCH_ASSOC</code> que faz cada linha voltar como array associativo (chave = nome da coluna). Existe pra evitar índices duplicados e código mais legível. Sintaxe: <code>$stmt-&gt;fetch(PDO::FETCH_ASSOC);</code> ou definido global como <code>ATTR_DEFAULT_FETCH_MODE</code>.</p>

      <p><strong className="text-[#8993BE] font-mono">fetch vs fetchAll</strong> — <code>fetch()</code> retorna <em>uma</em> linha por chamada (ideal pra streaming linha-a-linha em loop). <code>fetchAll()</code> retorna <em>todas</em> as linhas de uma vez como array (use só quando o resultado cabe confortavelmente na memória).</p>

      <p><strong className="text-[#8993BE] font-mono">lastInsertId</strong> — método <code>$pdo-&gt;lastInsertId()</code> que devolve o ID gerado pelo último <code>INSERT</code>. Existe pra você recuperar a chave de um registro recém-criado. No PostgreSQL prefira <code>INSERT ... RETURNING id</code>; em MySQL/SQLite funciona direto.</p>

      <h2>Por que PDO e não <code>mysql_*</code>?</h2>
      <p>
        As funções <code>mysql_connect</code>, <code>mysql_query</code> e companhia foram{" "}
        <strong>removidas no PHP 7</strong>. Não existem mais. Mesmo a sucessora{" "}
        <code>mysqli</code> só fala MySQL/MariaDB. O PDO (PHP Data Objects) resolve três
        coisas de uma vez:
      </p>
      <ul>
        <li><strong>Portabilidade</strong>: a mesma API serve para SQLite, MySQL, PostgreSQL, SQL Server, Oracle.</li>
        <li><strong>Segurança</strong>: prepared statements de verdade, blindando contra SQL injection.</li>
        <li><strong>Erros como exceções</strong>: nada de checar valor de retorno toda hora.</li>
      </ul>

      <h2>Conectando ao banco: a DSN</h2>
      <p>
        DSN (<em>Data Source Name</em>) é a string de conexão. Cada driver tem o seu
        formato. As três DSNs que você mais vai usar:
      </p>

      <CodeBlock
        title="Formatos de DSN"
        language="bash"
        code={`# SQLite (arquivo)
sqlite:/var/www/dados/app.sqlite

# SQLite em memória (perfeito para testes)
sqlite::memory:

# MySQL / MariaDB
mysql:host=127.0.0.1;port=3306;dbname=loja;charset=utf8mb4

# PostgreSQL
pgsql:host=127.0.0.1;port=5432;dbname=loja`}
      />

      <h2>Primeira conexão (SQLite, sem instalar nada)</h2>
      <p>
        Vamos começar com SQLite porque ele cria o banco em arquivo, sem servidor:
      </p>

      <PhpBlock
        filename="conexao.php"
        code={`<?php
declare(strict_types=1);

$dsn = 'sqlite:' . __DIR__ . '/app.sqlite';

$pdo = new PDO($dsn, options: [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
]);

echo "Conectado ao SQLite. Driver: " . $pdo->getAttribute(PDO::ATTR_DRIVER_NAME) . PHP_EOL;`}
        output={`Conectado ao SQLite. Driver: sqlite`}
      />

      <p>As três options acima formam o "kit de sobrevivência":</p>
      <ul>
        <li>
          <strong><code>ATTR_ERRMODE = ERRMODE_EXCEPTION</code></strong>: qualquer erro
          de SQL vira uma <code>PDOException</code>. Sem isso, você precisaria checar
          o retorno de cada chamada — e ninguém faz isso.
        </li>
        <li>
          <strong><code>ATTR_DEFAULT_FETCH_MODE = FETCH_ASSOC</code></strong>: as linhas
          já vêm como array associativo, sem chaves duplicadas.
        </li>
        <li>
          <strong><code>ATTR_EMULATE_PREPARES = false</code></strong>: usa prepared
          statements <em>de verdade</em> do banco, não emulados pelo driver.
          Mais seguro, mais correto com tipos.
        </li>
      </ul>

      <h2>MySQL e PostgreSQL — mesma cara</h2>

      <PhpBlock
        filename="mysql.php"
        code={`<?php
declare(strict_types=1);

$pdo = new PDO(
    dsn: 'mysql:host=127.0.0.1;port=3306;dbname=loja;charset=utf8mb4',
    username: 'app',
    password: 'secret',
    options: [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
        PDO::MYSQL_ATTR_INIT_COMMAND => "SET sql_mode='STRICT_ALL_TABLES'",
    ],
);

echo $pdo->getAttribute(PDO::ATTR_SERVER_VERSION) . PHP_EOL;`}
        output={`8.0.36-log`}
      />

      <PhpBlock
        filename="pgsql.php"
        code={`<?php
declare(strict_types=1);

$pdo = new PDO(
    dsn: 'pgsql:host=127.0.0.1;port=5432;dbname=loja',
    username: 'app',
    password: 'secret',
    options: [
        PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES   => false,
    ],
);

echo $pdo->getAttribute(PDO::ATTR_SERVER_VERSION) . PHP_EOL;`}
        output={`16.2`}
      />

      <AlertBox type="warning" title="charset=utf8mb4 no MySQL">
        Sem isso, emojis e caracteres de 4 bytes salvam corrompidos. <strong>Nunca</strong>{" "}
        use <code>utf8</code> no MySQL — é alias para <code>utf8mb3</code> e está deprecado.
      </AlertBox>

      <h2>Criando uma tabela e inserindo dados</h2>

      <PhpBlock
        filename="setup.php"
        code={`<?php
declare(strict_types=1);

$pdo = new PDO('sqlite:' . __DIR__ . '/app.sqlite', options: [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

$pdo->exec(<<<SQL
    CREATE TABLE IF NOT EXISTS produtos (
        id    INTEGER PRIMARY KEY AUTOINCREMENT,
        nome  TEXT NOT NULL,
        preco INTEGER NOT NULL
    );
SQL);

$pdo->exec("INSERT INTO produtos (nome, preco) VALUES ('Café 250g', 1890)");
$pdo->exec("INSERT INTO produtos (nome, preco) VALUES ('Pão', 750)");
$pdo->exec("INSERT INTO produtos (nome, preco) VALUES ('Manteiga', 1290)");

echo "Última ID inserida: " . $pdo->lastInsertId() . PHP_EOL;`}
        output={`Última ID inserida: 3`}
      />

      <p>
        <code>exec</code> roda comandos que <strong>não retornam linhas</strong> (DDL,{" "}
        <code>INSERT</code>, <code>UPDATE</code>, <code>DELETE</code> sem <code>RETURNING</code>) e
        devolve o número de linhas afetadas.
      </p>

      <AlertBox type="danger" title="exec NUNCA com dados de usuário">
        Os <code>INSERT</code> acima estão hardcoded. Se você concatenar valor de usuário,
        é SQL injection garantida. Para dados dinâmicos, use <strong>prepared statements</strong>{" "}
        — assunto do próximo capítulo.
      </AlertBox>

      <h2>Lendo: query, fetch, fetchAll</h2>

      <PhpBlock
        filename="listar.php"
        code={`<?php
declare(strict_types=1);

$pdo = new PDO('sqlite:' . __DIR__ . '/app.sqlite', options: [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

// fetchAll — todas as linhas de uma vez
$stmt = $pdo->query('SELECT id, nome, preco FROM produtos ORDER BY id');
foreach ($stmt as $row) {
    printf("#%d %-10s R$ %5.2f%s",
        $row['id'],
        $row['nome'],
        $row['preco'] / 100,
        PHP_EOL,
    );
}`}
        output={`#1 Café 250g  R$ 18.90
#2 Pão        R$  7.50
#3 Manteiga   R$ 12.90`}
      />

      <h2>Modos de fetch</h2>
      <p>
        O <code>fetch</code> aceita um modo que controla a forma do retorno. Os mais úteis:
      </p>

      <PhpBlock
        filename="modos.php"
        code={`<?php
declare(strict_types=1);

$pdo = new PDO('sqlite:' . __DIR__ . '/app.sqlite');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$stmt = $pdo->query('SELECT id, nome, preco FROM produtos LIMIT 1');

// 1) Array associativo
$assoc = $stmt->fetch(PDO::FETCH_ASSOC);
print_r($assoc);

// 2) Objeto stdClass
$stmt = $pdo->query('SELECT id, nome, preco FROM produtos LIMIT 1');
$obj  = $stmt->fetch(PDO::FETCH_OBJ);
echo $obj->nome . PHP_EOL;

// 3) Coluna única
$stmt = $pdo->query('SELECT nome FROM produtos');
$nomes = $stmt->fetchAll(PDO::FETCH_COLUMN);
print_r($nomes);

// 4) Pares chave => valor
$stmt = $pdo->query('SELECT id, nome FROM produtos');
$mapa = $stmt->fetchAll(PDO::FETCH_KEY_PAIR);
print_r($mapa);`}
        output={`Array
(
    [id] => 1
    [nome] => Café 250g
    [preco] => 1890
)
Café 250g
Array
(
    [0] => Café 250g
    [1] => Pão
    [2] => Manteiga
)
Array
(
    [1] => Café 250g
    [2] => Pão
    [3] => Manteiga
)`}
      />

      <h2>Hidratando objetos: <code>FETCH_CLASS</code></h2>
      <p>
        Em vez de array associativo, o PDO pode preencher direto uma classe sua. Combina
        muito bem com classes <code>readonly</code>:
      </p>

      <PhpBlock
        filename="hidratar.php"
        code={`<?php
declare(strict_types=1);

final class Produto {
    public int $id;
    public string $nome;
    public int $preco;

    public function precoFormatado(): string {
        return 'R$ ' . number_format($this->preco / 100, 2, ',', '.');
    }
}

$pdo = new PDO('sqlite:' . __DIR__ . '/app.sqlite');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$stmt = $pdo->query('SELECT id, nome, preco FROM produtos');
$produtos = $stmt->fetchAll(PDO::FETCH_CLASS, Produto::class);

foreach ($produtos as $p) {
    echo "{$p->nome}: {$p->precoFormatado()}" . PHP_EOL;
}`}
        output={`Café 250g: R$ 18,90
Pão: R$ 7,50
Manteiga: R$ 12,90`}
      />

      <h2>lastInsertId — pegando o ID do último <code>INSERT</code></h2>

      <PhpBlock
        filename="last-id.php"
        code={`<?php
declare(strict_types=1);

$pdo = new PDO('sqlite:' . __DIR__ . '/app.sqlite');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$stmt = $pdo->prepare('INSERT INTO produtos (nome, preco) VALUES (?, ?)');
$stmt->execute(['Açúcar 1kg', 590]);

$id = (int) $pdo->lastInsertId();
echo "novo produto criado com id={$id}" . PHP_EOL;`}
        output={`novo produto criado com id=4`}
      />

      <AlertBox type="info" title="No PostgreSQL é diferente">
        Em PostgreSQL, prefira <code>INSERT ... RETURNING id</code> e leia com{" "}
        <code>fetchColumn</code>. <code>lastInsertId</code> em pgsql usa sequences e
        precisa do nome da sequence — e é frágil.
      </AlertBox>

      <h2>rowCount — quantas linhas foram afetadas</h2>

      <PhpBlock
        filename="row-count.php"
        code={`<?php
declare(strict_types=1);

$pdo = new PDO('sqlite:' . __DIR__ . '/app.sqlite');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$stmt = $pdo->prepare('UPDATE produtos SET preco = preco + ? WHERE preco < ?');
$stmt->execute([100, 1000]);

echo "linhas atualizadas: " . $stmt->rowCount() . PHP_EOL;`}
        output={`linhas atualizadas: 2`}
      />

      <h2>Encapsulando: uma fábrica de PDO reutilizável</h2>

      <PhpBlock
        filename="src/Database.php"
        code={`<?php
declare(strict_types=1);

namespace App;

final class Database {
    public static function connect(string $dsn, ?string $user = null, ?string $pass = null): \\PDO {
        return new \\PDO($dsn, $user, $pass, [
            \\PDO::ATTR_ERRMODE            => \\PDO::ERRMODE_EXCEPTION,
            \\PDO::ATTR_DEFAULT_FETCH_MODE => \\PDO::FETCH_ASSOC,
            \\PDO::ATTR_EMULATE_PREPARES   => false,
        ]);
    }
}`}
      />

      <PhpBlock
        filename="public/index.php"
        code={`<?php
declare(strict_types=1);
require __DIR__ . '/../vendor/autoload.php';

use App\\Database;

$pdo = Database::connect('sqlite:' . __DIR__ . '/../app.sqlite');

$total = (int) $pdo->query('SELECT COUNT(*) FROM produtos')->fetchColumn();
echo "Temos {$total} produtos cadastrados." . PHP_EOL;`}
        output={`Temos 4 produtos cadastrados.`}
      />

      <h2>Subindo um banco de teste</h2>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command={`php -r 'new PDO("sqlite:app.sqlite"); echo "ok";'`}
        output={`ok`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command="php -m | grep -i pdo"
        output={`pdo_mysql
pdo_pgsql
pdo_sqlite
PDO`}
      />

      <p>
        Se algum driver não aparece, instale a extensão correspondente (no Arch:{" "}
        <code>php-pgsql</code>, <code>php-sqlite</code>; no Ubuntu: <code>php8.4-mysql</code>{" "}
        etc.).
      </p>

      <AlertBox type="success" title="O que ficou para o próximo capítulo">
        Toda interpolação de dados em SQL deve passar por <strong>prepared statements</strong>.
        É o que vamos detalhar agora — incluindo <code>bindParam</code> vs{" "}
        <code>bindValue</code>, placeholders nomeados e transações.
      </AlertBox>
    </PageContainer>
  );
}
