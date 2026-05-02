import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Migrations() {
  return (
    <PageContainer
      title="Migrations (Phinx)"
      subtitle="Versione o schema do banco como você versiona código: cada mudança é um arquivo PHP com up/down, aplicável e reversível em qualquer ambiente."
      difficulty="intermediario"
      timeToRead="13 min"
      category="Banco Avançado"
    >
      <h2>O problema: alguém rodou um ALTER TABLE em produção</h2>
      <p>
        Você puxa o último <code>git pull</code>, sobe a aplicação e ela quebra: a coluna{" "}
        <code>users.last_login_at</code> não existe no seu banco local. Quem criou? Quando? Como replicar
        em staging e em produção sem esquecer nada? <strong>Migrations</strong> resolvem isso: cada
        alteração no schema vira um arquivo versionado no Git, com um <em>id de timestamp</em>, e o
        banco mantém uma tabela interna sabendo quais já foram aplicadas.
      </p>
      <p>
        O <strong>Phinx</strong> é a biblioteca de migrations standalone mais usada do PHP — funciona
        fora de qualquer framework, suporta MySQL, Postgres e SQLite, e tem uma API fluente clara.
      </p>

      <h2>Instalação</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command="composer require --dev robmorgan/phinx"
        output={`Using version ^0.16.0 for robmorgan/phinx
./composer.json has been updated
Running composer update robmorgan/phinx
Lock file operations: 8 installs, 0 updates, 0 removals
  - Locking robmorgan/phinx (0.16.7)
  - Locking symfony/console (v7.2.0)
  - Locking cakephp/database (5.1.3)
Writing lock file
Installing dependencies from lock file (including require-dev)
Package operations: 8 installs, 0 updates, 0 removals
Generating optimized autoload files`}
      />

      <h2>Configuração: phinx.php</h2>
      <p>
        O Phinx procura um arquivo de config na raiz do projeto. Pode ser <code>phinx.yml</code>,{" "}
        <code>phinx.json</code> ou <code>phinx.php</code> — escolha PHP, porque assim você lê variáveis
        de ambiente e reaproveita a mesma config em testes.
      </p>

      <PhpBlock
        filename="phinx.php"
        code={`<?php
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
];`}
      />

      <h2>Criando sua primeira migration</h2>
      <p>
        O comando <code>create</code> gera um arquivo com timestamp no nome — isso garante que duas
        pessoas trabalhando em paralelo não tenham conflito de ordenação.
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command="vendor/bin/phinx create CreateUsersTable"
        output={`Phinx by CakePHP - https://phinx.org.

using config file ./phinx.php
using config parser php
using migration paths
 - /home/dev/projetos/loja/db/migrations
using migration base class Phinx\\Migration\\AbstractMigration

created db/migrations/20250115120000_create_users_table.php`}
      />

      <PhpBlock
        filename="db/migrations/20250115120000_create_users_table.php"
        code={`<?php
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
}`}
      />

      <AlertBox type="info" title="change() vs up()/down()">
        Use <code>change()</code> sempre que possível: o Phinx <strong>infere o down automaticamente</strong>{" "}
        (criou tabela ⇒ rollback dropa). Para operações irreversíveis (UPDATE de dados, ALTER complexo),
        implemente <code>up()</code> e <code>down()</code> separadamente.
      </AlertBox>

      <h2>Aplicando: migrate</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command="vendor/bin/phinx migrate -e development"
        output={`Phinx by CakePHP - https://phinx.org.

using config file ./phinx.php
using adapter sqlite
using database /home/dev/projetos/loja/var/loja.db
ordering by creation time

 == 20250115120000 CreateUsersTable: migrating
 == 20250115120000 CreateUsersTable: migrated 0.0089s

All Done. Took 0.0142s`}
      />

      <h2>Status: o que foi e o que falta aplicar</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command="vendor/bin/phinx status -e development"
        output={` Status   Migration ID    Started              Finished             Migration Name
-----------------------------------------------------------------------------------
     up  20250115120000  2025-01-15 12:01:43  2025-01-15 12:01:43  CreateUsersTable

ordering by creation time`}
      />

      <h2>Migration mais realista: ALTER + foreign keys</h2>
      <p>
        Migrations brilham quando o schema evolui. Vamos adicionar uma tabela de pedidos referenciando
        usuários — note como o Phinx abstrai a sintaxe específica de cada banco.
      </p>

      <PhpBlock
        filename="db/migrations/20250116090000_create_pedidos_table.php"
        code={`<?php
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
}`}
      />

      <h2>up() e down() explícitos: quando change() não basta</h2>
      <p>
        Suponha que precisamos popular uma coluna nova com base em outra — algo que o Phinx não consegue
        reverter sozinho. Aí escrevemos os dois métodos:
      </p>

      <PhpBlock
        filename="db/migrations/20250117150000_add_slug_to_produtos.php"
        code={`<?php
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
}`}
      />

      <AlertBox type="warning" title="Cuidado com dados em migrations">
        Backfill de muitas linhas dentro de migration é arriscado em produção: trava a tabela e estoura
        timeout. Para volumes grandes, faça a migration <strong>só do schema</strong> (coluna
        nullable) e rode um <em>script de backfill</em> em batch separadamente.
      </AlertBox>

      <h2>Rollback: voltando uma migration</h2>
      <p>
        <code>rollback</code> sem argumento volta apenas a última. Com <code>-t 0</code> volta tudo.
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command="vendor/bin/phinx rollback -e development"
        output={`Phinx by CakePHP - https://phinx.org.

using config file ./phinx.php
using adapter sqlite
ordering by creation time

 == 20250117150000 AddSlugToProdutos: reverting
 == 20250117150000 AddSlugToProdutos: reverted 0.0124s

All Done. Took 0.0189s`}
      />

      <h2>Seeds: dados de exemplo, não dados de produção</h2>
      <PhpBlock
        filename="db/seeds/UsersSeeder.php"
        code={`<?php
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
}`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/loja"
        command="vendor/bin/phinx seed:run -e development"
        output={`Phinx by CakePHP - https://phinx.org.

using config file ./phinx.php
using adapter sqlite

 == UsersSeeder: seeding
 == UsersSeeder: seeded 0.0061s

All Done. Took 0.0094s`}
      />

      <h2>Migrations em CI/CD</h2>
      <p>
        A regra de ouro é: <strong>migrations rodam antes do deploy do código novo</strong>. No GitHub
        Actions, isso vira um job que sobe um banco de teste, roda <code>migrate</code> e só então
        executa a suíte:
      </p>

      <CodeBlock
        title=".github/workflows/ci.yml"
        language="yaml"
        code={`name: CI
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
        run: vendor/bin/phpunit`}
      />

      <p>
        Em produção o fluxo é parecido — você roda <code>migrate -e production</code> num passo do
        pipeline (com lock de deploy) <strong>antes</strong> de subir os containers do app novo. Se algo
        der errado, <code>rollback</code> volta o schema e você re-deploya a versão anterior do código.
      </p>

      <AlertBox type="success" title="Boas práticas que salvam a noite">
        <ul className="list-disc ml-5 mt-1 space-y-1">
          <li>Uma migration por PR. Não junte 3 ALTERs num arquivo só.</li>
          <li>Nunca edite uma migration que já rodou em qualquer ambiente — crie uma nova.</li>
          <li>Sempre teste o <code>rollback</code> localmente: ele <em>vai</em> ser usado.</li>
          <li>Migrations destrutivas (DROP COLUMN) merecem PR separado e <em>review</em> extra.</li>
        </ul>
      </AlertBox>

      <p>
        Schema versionado, deploys seguros. No próximo capítulo a gente garante que múltiplas operações
        em sequência ou rolam todas, ou nenhuma — bem-vindo às <strong>transações</strong>.
      </p>
    </PageContainer>
  );
}
