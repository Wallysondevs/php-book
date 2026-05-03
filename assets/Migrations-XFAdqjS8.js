import{j as e}from"./index-B5-q-eol.js";import{P as i,A as s,a}from"./AlertBox-CVbFLZEd.js";import{T as o}from"./TerminalBlock-6fqVIX2R.js";import{C as r}from"./CodeBlock-B36pQ_ak.js";function c(){return e.jsxs(i,{title:"Migrations (Phinx)",subtitle:"Versione o schema do banco como você versiona código: cada mudança é um arquivo PHP com up/down, aplicável e reversível em qualquer ambiente.",difficulty:"intermediario",timeToRead:"13 min",category:"Banco Avançado",children:[e.jsx(s,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Migration"})," "," — "," ","arquivo versionado com mudança de schema."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"up / down"})," "," — "," ","aplicar / reverter."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Idempotência"})," "," — "," ","rodar 2x não deve quebrar nem duplicar."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Tools"})," "," — "," ","Phinx, Doctrine Migrations, Laravel Artisan."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Order"})," "," — "," ","timestamp no nome garante ordem de execução."]})]}),e.jsx("h2",{children:"O problema: alguém rodou um ALTER TABLE em produção"}),e.jsxs("p",{children:["Você puxa o último ",e.jsx("code",{children:"git pull"}),", sobe a aplicação e ela quebra: a coluna"," ",e.jsx("code",{children:"users.last_login_at"})," não existe no seu banco local. Quem criou? Quando? Como replicar em staging e em produção sem esquecer nada? ",e.jsx("strong",{children:"Migrations"})," resolvem isso: cada alteração no schema vira um arquivo versionado no Git, com um ",e.jsx("em",{children:"id de timestamp"}),", e o banco mantém uma tabela interna sabendo quais já foram aplicadas."]}),e.jsxs("p",{children:["O ",e.jsx("strong",{children:"Phinx"})," é a biblioteca de migrations standalone mais usada do PHP — funciona fora de qualquer framework, suporta MySQL, Postgres e SQLite, e tem uma API fluente clara."]}),e.jsx("h2",{children:"Instalação"}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos/loja",command:"composer require --dev robmorgan/phinx",output:`Using version ^0.16.0 for robmorgan/phinx
./composer.json has been updated
Running composer update robmorgan/phinx
Lock file operations: 8 installs, 0 updates, 0 removals
  - Locking robmorgan/phinx (0.16.7)
  - Locking symfony/console (v7.2.0)
  - Locking cakephp/database (5.1.3)
Writing lock file
Installing dependencies from lock file (including require-dev)
Package operations: 8 installs, 0 updates, 0 removals
Generating optimized autoload files`}),e.jsx("h2",{children:"Configuração: phinx.php"}),e.jsxs("p",{children:["O Phinx procura um arquivo de config na raiz do projeto. Pode ser ",e.jsx("code",{children:"phinx.yml"}),","," ",e.jsx("code",{children:"phinx.json"})," ou ",e.jsx("code",{children:"phinx.php"})," — escolha PHP, porque assim você lê variáveis de ambiente e reaproveita a mesma config em testes."]}),e.jsx(a,{filename:"phinx.php",code:`<?php
declare(strict_types=1);

return [
    'paths' => [
        'migrations' => __DIR__ . '/db/migrations',
        'seeds'      => __DIR__ . '/db/seeds',
    ],
    'environments' => [
        'default_migration_table' => 'phinxlog',
        'default_environment'     => $_ENV['APP_ENV'] ?? 'development',

        'development' => [
            'adapter' => 'sqlite',
            'name'    => __DIR__ . '/var/loja',
            'suffix'  => '.db',
        ],

        'testing' => [
            'adapter' => 'sqlite',
            'memory'  => true,
        ],

        'production' => [
            'adapter' => 'mysql',
            'host'    => $_ENV['DB_HOST'] ?? 'localhost',
            'name'    => $_ENV['DB_NAME'] ?? 'loja',
            'user'    => $_ENV['DB_USER'] ?? 'app',
            'pass'    => $_ENV['DB_PASS'] ?? '',
            'port'    => 3306,
            'charset' => 'utf8mb4',
        ],
    ],
    'version_order' => 'creation',
];`}),e.jsx("h2",{children:"Criando sua primeira migration"}),e.jsxs("p",{children:["O comando ",e.jsx("code",{children:"create"})," gera um arquivo com timestamp no nome — isso garante que duas pessoas trabalhando em paralelo não tenham conflito de ordenação."]}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos/loja",command:"vendor/bin/phinx create CreateUsersTable",output:`Phinx by CakePHP - https://phinx.org.

using config file ./phinx.php
using config parser php
using migration paths
 - /home/dev/projetos/loja/db/migrations
using migration base class Phinx\\Migration\\AbstractMigration

created db/migrations/20250115120000_create_users_table.php`}),e.jsx(a,{filename:"db/migrations/20250115120000_create_users_table.php",code:`<?php
declare(strict_types=1);

use Phinx\\Migration\\AbstractMigration;

final class CreateUsersTable extends AbstractMigration
{
    public function change(): void
    {
        $this->table('users')
            ->addColumn('email',      'string',  ['limit' => 191])
            ->addColumn('nome',       'string',  ['limit' => 100])
            ->addColumn('senha_hash', 'string',  ['limit' => 255])
            ->addColumn('ativo',      'boolean', ['default' => true])
            ->addColumn('created_at', 'datetime',['default' => 'CURRENT_TIMESTAMP'])
            ->addIndex(['email'], ['unique' => true, 'name' => 'idx_users_email'])
            ->create();
    }
}`}),e.jsxs(s,{type:"info",title:"change() vs up()/down()",children:["Use ",e.jsx("code",{children:"change()"})," sempre que possível: o Phinx ",e.jsx("strong",{children:"infere o down automaticamente"})," ","(criou tabela ⇒ rollback dropa). Para operações irreversíveis (UPDATE de dados, ALTER complexo), implemente ",e.jsx("code",{children:"up()"})," e ",e.jsx("code",{children:"down()"})," separadamente."]}),e.jsx("h2",{children:"Aplicando: migrate"}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos/loja",command:"vendor/bin/phinx migrate -e development",output:`Phinx by CakePHP - https://phinx.org.

using config file ./phinx.php
using adapter sqlite
using database /home/dev/projetos/loja/var/loja.db
ordering by creation time

 == 20250115120000 CreateUsersTable: migrating
 == 20250115120000 CreateUsersTable: migrated 0.0089s

All Done. Took 0.0142s`}),e.jsx("h2",{children:"Status: o que foi e o que falta aplicar"}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos/loja",command:"vendor/bin/phinx status -e development",output:` Status   Migration ID    Started              Finished             Migration Name
-----------------------------------------------------------------------------------
     up  20250115120000  2025-01-15 12:01:43  2025-01-15 12:01:43  CreateUsersTable

ordering by creation time`}),e.jsx("h2",{children:"Migration mais realista: ALTER + foreign keys"}),e.jsx("p",{children:"Migrations brilham quando o schema evolui. Vamos adicionar uma tabela de pedidos referenciando usuários — note como o Phinx abstrai a sintaxe específica de cada banco."}),e.jsx(a,{filename:"db/migrations/20250116090000_create_pedidos_table.php",code:`<?php
declare(strict_types=1);

use Phinx\\Migration\\AbstractMigration;

final class CreatePedidosTable extends AbstractMigration
{
    public function change(): void
    {
        $this->table('pedidos')
            ->addColumn('user_id',    'integer',  ['signed' => false])
            ->addColumn('total',      'decimal',  ['precision' => 10, 'scale' => 2])
            ->addColumn('status',     'string',   ['limit' => 20, 'default' => 'pendente'])
            ->addColumn('created_at', 'datetime', ['default' => 'CURRENT_TIMESTAMP'])
            ->addIndex(['user_id'])
            ->addForeignKey('user_id', 'users', 'id', [
                'delete' => 'RESTRICT',
                'update' => 'CASCADE',
            ])
            ->create();
    }
}`}),e.jsx("h2",{children:"up() e down() explícitos: quando change() não basta"}),e.jsx("p",{children:"Suponha que precisamos popular uma coluna nova com base em outra — algo que o Phinx não consegue reverter sozinho. Aí escrevemos os dois métodos:"}),e.jsx(a,{filename:"db/migrations/20250117150000_add_slug_to_produtos.php",code:`<?php
declare(strict_types=1);

use Phinx\\Migration\\AbstractMigration;

final class AddSlugToProdutos extends AbstractMigration
{
    public function up(): void
    {
        $this->table('produtos')
            ->addColumn('slug', 'string', ['limit' => 150, 'null' => true, 'after' => 'nome'])
            ->update();

        // Backfill: gera slug a partir do nome para linhas existentes
        $rows = $this->fetchAll('SELECT id, nome FROM produtos');
        foreach ($rows as $row) {
            $slug = strtolower(preg_replace('/[^a-z0-9]+/i', '-', $row['nome']));
            $slug = trim($slug, '-');
            $this->execute(
                "UPDATE produtos SET slug = '{$slug}' WHERE id = {$row['id']}"
            );
        }

        $this->table('produtos')
            ->changeColumn('slug', 'string', ['limit' => 150, 'null' => false])
            ->addIndex(['slug'], ['unique' => true])
            ->update();
    }

    public function down(): void
    {
        $this->table('produtos')
            ->removeIndexByName('produtos_slug')
            ->removeColumn('slug')
            ->update();
    }
}`}),e.jsxs(s,{type:"warning",title:"Cuidado com dados em migrations",children:["Backfill de muitas linhas dentro de migration é arriscado em produção: trava a tabela e estoura timeout. Para volumes grandes, faça a migration ",e.jsx("strong",{children:"só do schema"})," (coluna nullable) e rode um ",e.jsx("em",{children:"script de backfill"})," em batch separadamente."]}),e.jsx("h2",{children:"Rollback: voltando uma migration"}),e.jsxs("p",{children:[e.jsx("code",{children:"rollback"})," sem argumento volta apenas a última. Com ",e.jsx("code",{children:"-t 0"})," volta tudo."]}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos/loja",command:"vendor/bin/phinx rollback -e development",output:`Phinx by CakePHP - https://phinx.org.

using config file ./phinx.php
using adapter sqlite
ordering by creation time

 == 20250117150000 AddSlugToProdutos: reverting
 == 20250117150000 AddSlugToProdutos: reverted 0.0124s

All Done. Took 0.0189s`}),e.jsx("h2",{children:"Seeds: dados de exemplo, não dados de produção"}),e.jsx(a,{filename:"db/seeds/UsersSeeder.php",code:`<?php
declare(strict_types=1);

use Phinx\\Seed\\AbstractSeed;

final class UsersSeeder extends AbstractSeed
{
    public function run(): void
    {
        $data = [
            [
                'email'      => 'ada@example.com',
                'nome'       => 'Ada Lovelace',
                'senha_hash' => password_hash('secret123', PASSWORD_DEFAULT),
                'ativo'      => true,
            ],
            [
                'email'      => 'linus@example.com',
                'nome'       => 'Linus Torvalds',
                'senha_hash' => password_hash('secret123', PASSWORD_DEFAULT),
                'ativo'      => true,
            ],
        ];

        $this->table('users')->insert($data)->saveData();
    }
}`}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos/loja",command:"vendor/bin/phinx seed:run -e development",output:`Phinx by CakePHP - https://phinx.org.

using config file ./phinx.php
using adapter sqlite

 == UsersSeeder: seeding
 == UsersSeeder: seeded 0.0061s

All Done. Took 0.0094s`}),e.jsx("h2",{children:"Migrations em CI/CD"}),e.jsxs("p",{children:["A regra de ouro é: ",e.jsx("strong",{children:"migrations rodam antes do deploy do código novo"}),". No GitHub Actions, isso vira um job que sobe um banco de teste, roda ",e.jsx("code",{children:"migrate"})," e só então executa a suíte:"]}),e.jsx(r,{title:".github/workflows/ci.yml",language:"yaml",code:`name: CI
on: [push, pull_request]

jobs:
  test:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup PHP
        uses: shivammathur/setup-php@v2
        with:
          php-version: '8.4'
          coverage: none

      - name: Install dependencies
        run: composer install --no-interaction --prefer-dist

      - name: Rodar migrations
        run: vendor/bin/phinx migrate -e testing

      - name: Verificar status
        run: vendor/bin/phinx status -e testing

      - name: Rodar testes
        run: vendor/bin/phpunit`}),e.jsxs("p",{children:["Em produção o fluxo é parecido — você roda ",e.jsx("code",{children:"migrate -e production"})," num passo do pipeline (com lock de deploy) ",e.jsx("strong",{children:"antes"})," de subir os containers do app novo. Se algo der errado, ",e.jsx("code",{children:"rollback"})," volta o schema e você re-deploya a versão anterior do código."]}),e.jsx(s,{type:"success",title:"Boas práticas que salvam a noite",children:e.jsxs("ul",{className:"list-disc ml-5 mt-1 space-y-1",children:[e.jsx("li",{children:"Uma migration por PR. Não junte 3 ALTERs num arquivo só."}),e.jsx("li",{children:"Nunca edite uma migration que já rodou em qualquer ambiente — crie uma nova."}),e.jsxs("li",{children:["Sempre teste o ",e.jsx("code",{children:"rollback"})," localmente: ele ",e.jsx("em",{children:"vai"})," ser usado."]}),e.jsxs("li",{children:["Migrations destrutivas (DROP COLUMN) merecem PR separado e ",e.jsx("em",{children:"review"})," extra."]})]})}),e.jsxs("p",{children:["Schema versionado, deploys seguros. No próximo capítulo a gente garante que múltiplas operações em sequência ou rolam todas, ou nenhuma — bem-vindo às ",e.jsx("strong",{children:"transações"}),"."]})]})}export{c as default};
