import{j as e}from"./index-Bb4MiiJL.js";import{P as r,A as o,a as s}from"./AlertBox-BpD-xIsb.js";import{T as a}from"./TerminalBlock-DGurMC1r.js";import{C as t}from"./CodeBlock-C3V-qEkN.js";function l(){return e.jsxs(r,{title:"PDO — acesso a banco",subtitle:"A camada oficial e portátil de acesso a banco em PHP. Mesma API para SQLite, MySQL e PostgreSQL — e a única que você deveria usar em código novo.",difficulty:"intermediario",timeToRead:"14 min",category:"Web & Banco",children:[e.jsx(o,{type:"info",title:"Pré-requisitos",children:e.jsxs("p",{children:["Antes deste capítulo, é bom já ter visto: ",e.jsx("a",{href:"#/classes",className:"text-[#8993BE] underline",children:"Classes"}),", ",e.jsx("a",{href:"#/exceptions",className:"text-[#8993BE] underline",children:"Try/Catch"}),", ",e.jsx("a",{href:"#/namespaces",className:"text-[#8993BE] underline",children:"Namespaces"})," e ",e.jsx("a",{href:"#/composer",className:"text-[#8993BE] underline",children:"Composer"}),"."]})}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"PDO"})," — classe nativa ",e.jsx("em",{children:"PHP Data Objects"}),": camada uniforme de acesso a banco que fala SQLite, MySQL, PostgreSQL, SQL Server e mais. Existe pra padronizar a API e suportar prepared statements de verdade. Sintaxe: ",e.jsx("code",{children:"$pdo = new PDO($dsn, $user, $pass, $options);"}),"."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"FETCH_ASSOC"})," — constante ",e.jsx("code",{children:"PDO::FETCH_ASSOC"})," que faz cada linha voltar como array associativo (chave = nome da coluna). Existe pra evitar índices duplicados e código mais legível. Sintaxe: ",e.jsx("code",{children:"$stmt->fetch(PDO::FETCH_ASSOC);"})," ou definido global como ",e.jsx("code",{children:"ATTR_DEFAULT_FETCH_MODE"}),"."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"fetch vs fetchAll"})," — ",e.jsx("code",{children:"fetch()"})," retorna ",e.jsx("em",{children:"uma"})," linha por chamada (ideal pra streaming linha-a-linha em loop). ",e.jsx("code",{children:"fetchAll()"})," retorna ",e.jsx("em",{children:"todas"})," as linhas de uma vez como array (use só quando o resultado cabe confortavelmente na memória)."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"lastInsertId"})," — método ",e.jsx("code",{children:"$pdo->lastInsertId()"})," que devolve o ID gerado pelo último ",e.jsx("code",{children:"INSERT"}),". Existe pra você recuperar a chave de um registro recém-criado. No PostgreSQL prefira ",e.jsx("code",{children:"INSERT ... RETURNING id"}),"; em MySQL/SQLite funciona direto."]}),e.jsxs("h2",{children:["Por que PDO e não ",e.jsx("code",{children:"mysql_*"}),"?"]}),e.jsxs("p",{children:["As funções ",e.jsx("code",{children:"mysql_connect"}),", ",e.jsx("code",{children:"mysql_query"})," e companhia foram"," ",e.jsx("strong",{children:"removidas no PHP 7"}),". Não existem mais. Mesmo a sucessora"," ",e.jsx("code",{children:"mysqli"})," só fala MySQL/MariaDB. O PDO (PHP Data Objects) resolve três coisas de uma vez:"]}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Portabilidade"}),": a mesma API serve para SQLite, MySQL, PostgreSQL, SQL Server, Oracle."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Segurança"}),": prepared statements de verdade, blindando contra SQL injection."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Erros como exceções"}),": nada de checar valor de retorno toda hora."]})]}),e.jsx("h2",{children:"Conectando ao banco: a DSN"}),e.jsxs("p",{children:["DSN (",e.jsx("em",{children:"Data Source Name"}),") é a string de conexão. Cada driver tem o seu formato. As três DSNs que você mais vai usar:"]}),e.jsx(t,{title:"Formatos de DSN",language:"bash",code:`# SQLite (arquivo)
sqlite:/var/www/dados/app.sqlite

# SQLite em memória (perfeito para testes)
sqlite::memory:

# MySQL / MariaDB
mysql:host=127.0.0.1;port=3306;dbname=loja;charset=utf8mb4

# PostgreSQL
pgsql:host=127.0.0.1;port=5432;dbname=loja`}),e.jsx("h2",{children:"Primeira conexão (SQLite, sem instalar nada)"}),e.jsx("p",{children:"Vamos começar com SQLite porque ele cria o banco em arquivo, sem servidor:"}),e.jsx(s,{filename:"conexao.php",code:`<?php
declare(strict_types=1);

$dsn = 'sqlite:' . __DIR__ . '/app.sqlite';

$pdo = new PDO($dsn, options: [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
    PDO::ATTR_EMULATE_PREPARES   => false,
]);

echo "Conectado ao SQLite. Driver: " . $pdo->getAttribute(PDO::ATTR_DRIVER_NAME) . PHP_EOL;`,output:"Conectado ao SQLite. Driver: sqlite"}),e.jsx("p",{children:'As três options acima formam o "kit de sobrevivência":'}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:e.jsx("code",{children:"ATTR_ERRMODE = ERRMODE_EXCEPTION"})}),": qualquer erro de SQL vira uma ",e.jsx("code",{children:"PDOException"}),". Sem isso, você precisaria checar o retorno de cada chamada — e ninguém faz isso."]}),e.jsxs("li",{children:[e.jsx("strong",{children:e.jsx("code",{children:"ATTR_DEFAULT_FETCH_MODE = FETCH_ASSOC"})}),": as linhas já vêm como array associativo, sem chaves duplicadas."]}),e.jsxs("li",{children:[e.jsx("strong",{children:e.jsx("code",{children:"ATTR_EMULATE_PREPARES = false"})}),": usa prepared statements ",e.jsx("em",{children:"de verdade"})," do banco, não emulados pelo driver. Mais seguro, mais correto com tipos."]})]}),e.jsx("h2",{children:"MySQL e PostgreSQL — mesma cara"}),e.jsx(s,{filename:"mysql.php",code:`<?php
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

echo $pdo->getAttribute(PDO::ATTR_SERVER_VERSION) . PHP_EOL;`,output:"8.0.36-log"}),e.jsx(s,{filename:"pgsql.php",code:`<?php
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

echo $pdo->getAttribute(PDO::ATTR_SERVER_VERSION) . PHP_EOL;`,output:"16.2"}),e.jsxs(o,{type:"warning",title:"charset=utf8mb4 no MySQL",children:["Sem isso, emojis e caracteres de 4 bytes salvam corrompidos. ",e.jsx("strong",{children:"Nunca"})," ","use ",e.jsx("code",{children:"utf8"})," no MySQL — é alias para ",e.jsx("code",{children:"utf8mb3"})," e está deprecado."]}),e.jsx("h2",{children:"Criando uma tabela e inserindo dados"}),e.jsx(s,{filename:"setup.php",code:`<?php
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

echo "Última ID inserida: " . $pdo->lastInsertId() . PHP_EOL;`,output:"Última ID inserida: 3"}),e.jsxs("p",{children:[e.jsx("code",{children:"exec"})," roda comandos que ",e.jsx("strong",{children:"não retornam linhas"})," (DDL,"," ",e.jsx("code",{children:"INSERT"}),", ",e.jsx("code",{children:"UPDATE"}),", ",e.jsx("code",{children:"DELETE"})," sem ",e.jsx("code",{children:"RETURNING"}),") e devolve o número de linhas afetadas."]}),e.jsxs(o,{type:"danger",title:"exec NUNCA com dados de usuário",children:["Os ",e.jsx("code",{children:"INSERT"})," acima estão hardcoded. Se você concatenar valor de usuário, é SQL injection garantida. Para dados dinâmicos, use ",e.jsx("strong",{children:"prepared statements"})," ","— assunto do próximo capítulo."]}),e.jsx("h2",{children:"Lendo: query, fetch, fetchAll"}),e.jsx(s,{filename:"listar.php",code:`<?php
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
}`,output:`#1 Café 250g  R$ 18.90
#2 Pão        R$  7.50
#3 Manteiga   R$ 12.90`}),e.jsx("h2",{children:"Modos de fetch"}),e.jsxs("p",{children:["O ",e.jsx("code",{children:"fetch"})," aceita um modo que controla a forma do retorno. Os mais úteis:"]}),e.jsx(s,{filename:"modos.php",code:`<?php
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
print_r($mapa);`,output:`Array
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
)`}),e.jsxs("h2",{children:["Hidratando objetos: ",e.jsx("code",{children:"FETCH_CLASS"})]}),e.jsxs("p",{children:["Em vez de array associativo, o PDO pode preencher direto uma classe sua. Combina muito bem com classes ",e.jsx("code",{children:"readonly"}),":"]}),e.jsx(s,{filename:"hidratar.php",code:`<?php
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
}`,output:`Café 250g: R$ 18,90
Pão: R$ 7,50
Manteiga: R$ 12,90`}),e.jsxs("h2",{children:["lastInsertId — pegando o ID do último ",e.jsx("code",{children:"INSERT"})]}),e.jsx(s,{filename:"last-id.php",code:`<?php
declare(strict_types=1);

$pdo = new PDO('sqlite:' . __DIR__ . '/app.sqlite');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$stmt = $pdo->prepare('INSERT INTO produtos (nome, preco) VALUES (?, ?)');
$stmt->execute(['Açúcar 1kg', 590]);

$id = (int) $pdo->lastInsertId();
echo "novo produto criado com id={$id}" . PHP_EOL;`,output:"novo produto criado com id=4"}),e.jsxs(o,{type:"info",title:"No PostgreSQL é diferente",children:["Em PostgreSQL, prefira ",e.jsx("code",{children:"INSERT ... RETURNING id"})," e leia com"," ",e.jsx("code",{children:"fetchColumn"}),". ",e.jsx("code",{children:"lastInsertId"})," em pgsql usa sequences e precisa do nome da sequence — e é frágil."]}),e.jsx("h2",{children:"rowCount — quantas linhas foram afetadas"}),e.jsx(s,{filename:"row-count.php",code:`<?php
declare(strict_types=1);

$pdo = new PDO('sqlite:' . __DIR__ . '/app.sqlite');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$stmt = $pdo->prepare('UPDATE produtos SET preco = preco + ? WHERE preco < ?');
$stmt->execute([100, 1000]);

echo "linhas atualizadas: " . $stmt->rowCount() . PHP_EOL;`,output:"linhas atualizadas: 2"}),e.jsx("h2",{children:"Encapsulando: uma fábrica de PDO reutilizável"}),e.jsx(s,{filename:"src/Database.php",code:`<?php
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
}`}),e.jsx(s,{filename:"public/index.php",code:`<?php
declare(strict_types=1);
require __DIR__ . '/../vendor/autoload.php';

use App\\Database;

$pdo = Database::connect('sqlite:' . __DIR__ . '/../app.sqlite');

$total = (int) $pdo->query('SELECT COUNT(*) FROM produtos')->fetchColumn();
echo "Temos {$total} produtos cadastrados." . PHP_EOL;`,output:"Temos 4 produtos cadastrados."}),e.jsx("h2",{children:"Subindo um banco de teste"}),e.jsx(a,{user:"dev",host:"php",cwd:"~/projetos/loja",command:`php -r 'new PDO("sqlite:app.sqlite"); echo "ok";'`,output:"ok"}),e.jsx(a,{user:"dev",host:"php",cwd:"~/projetos/loja",command:"php -m | grep -i pdo",output:`pdo_mysql
pdo_pgsql
pdo_sqlite
PDO`}),e.jsxs("p",{children:["Se algum driver não aparece, instale a extensão correspondente (no Arch:"," ",e.jsx("code",{children:"php-pgsql"}),", ",e.jsx("code",{children:"php-sqlite"}),"; no Ubuntu: ",e.jsx("code",{children:"php8.4-mysql"})," ","etc.)."]}),e.jsxs(o,{type:"success",title:"O que ficou para o próximo capítulo",children:["Toda interpolação de dados em SQL deve passar por ",e.jsx("strong",{children:"prepared statements"}),". É o que vamos detalhar agora — incluindo ",e.jsx("code",{children:"bindParam"})," vs"," ",e.jsx("code",{children:"bindValue"}),", placeholders nomeados e transações."]})]})}export{l as default};
