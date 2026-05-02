import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Transacoes() {
  return (
    <PageContainer
      title="Transações & Locking"
      subtitle="Quando duas operações precisam acontecer juntas (ou nenhuma), bem-vindo às transações. E quando duas conexões disputam a mesma linha, bem-vindo aos locks, savepoints e deadlocks."
      difficulty="avancado"
      timeToRead="14 min"
      category="Banco Avançado"
    >
      <h2>O problema clássico: a transferência bancária</h2>
      <p>
        Você precisa <strong>debitar R$ 100 da conta A</strong> e <strong>creditar R$ 100 na conta B</strong>.
        Se o servidor cair entre as duas queries, a conta A ficou com R$ 100 a menos e a conta B nunca
        recebeu — você criou dinheiro do nada (ou destruiu, dependendo da ordem). A solução é tratar as
        duas operações como <em>uma só</em>: ou as duas funcionam, ou nenhuma. Isso é uma <strong>transação</strong>.
      </p>

      <h2>O padrão sagrado: try / commit / catch / rollBack</h2>
      <PhpBlock
        filename="src/Transferencia.php"
        code={`<?php
declare(strict_types=1);

namespace App;

use PDO;
use Throwable;

final readonly class Transferencia
{
    public function __construct(private PDO $pdo) {}

    public function executar(int $deId, int $paraId, int $centavos): void
    {
        $this->pdo->beginTransaction();

        try {
            $debitar = $this->pdo->prepare(
                'UPDATE contas SET saldo = saldo - :v WHERE id = :id AND saldo >= :v'
            );
            $debitar->execute(['v' => $centavos, 'id' => $deId]);

            if ($debitar->rowCount() === 0) {
                throw new \\RuntimeException('Saldo insuficiente.');
            }

            $creditar = $this->pdo->prepare(
                'UPDATE contas SET saldo = saldo + :v WHERE id = :id'
            );
            $creditar->execute(['v' => $centavos, 'id' => $paraId]);

            if ($creditar->rowCount() === 0) {
                throw new \\RuntimeException('Conta destino não existe.');
            }

            $this->pdo->commit();
        } catch (Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }
}`}
      />

      <PhpBlock
        filename="bin/transferir.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use App\\Transferencia;

$pdo = new PDO('sqlite:' . __DIR__ . '/../var/banco.db');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$pdo->exec('CREATE TABLE IF NOT EXISTS contas (
    id INTEGER PRIMARY KEY, titular TEXT, saldo INTEGER NOT NULL
)');
$pdo->exec("INSERT OR REPLACE INTO contas VALUES (1,'Ada',  50000)");
$pdo->exec("INSERT OR REPLACE INTO contas VALUES (2,'Linus',10000)");

$svc = new Transferencia($pdo);

$svc->executar(deId: 1, paraId: 2, centavos: 15000);

foreach ($pdo->query('SELECT * FROM contas') as $r) {
    printf("%-6s saldo: R$ %6.2f%s", $r['titular'], $r['saldo'] / 100, PHP_EOL);
}

try {
    $svc->executar(deId: 1, paraId: 2, centavos: 999999);
} catch (\\RuntimeException $e) {
    echo "Falhou (e foi revertida): {$e->getMessage()}" . PHP_EOL;
}

foreach ($pdo->query('SELECT * FROM contas') as $r) {
    printf("%-6s saldo: R$ %6.2f%s", $r['titular'], $r['saldo'] / 100, PHP_EOL);
}`}
        output={`Ada    saldo: R$ 350.00
Linus  saldo: R$ 250.00
Falhou (e foi revertida): Saldo insuficiente.
Ada    saldo: R$ 350.00
Linus  saldo: R$ 250.00`}
      />

      <AlertBox type="warning" title="O try/catch é obrigatório, não decorativo">
        Se você não capturar exceções e <code>rollBack()</code>, a transação fica <em>aberta</em> e a
        conexão pode ser devolvida ao pool nesse estado. Próxima requisição: caos. Toda transação
        precisa de um caminho garantido para commit ou rollback.
      </AlertBox>

      <h2>Níveis de isolamento: o que o seu SELECT enxerga</h2>
      <p>
        Dentro de uma transação, o que outras transações concorrentes <em>já comitaram</em> aparece para
        você ou não? Depende do <strong>nível de isolamento</strong>. Da menos rígida para a mais rígida:
      </p>
      <ul>
        <li><strong>READ UNCOMMITTED</strong> — vê até o que ainda nem foi comitado (<em>dirty reads</em>). Praticamente nunca usado.</li>
        <li><strong>READ COMMITTED</strong> — só vê o que foi comitado. Padrão do <em>Postgres</em> e <em>SQL Server</em>.</li>
        <li><strong>REPEATABLE READ</strong> — duas leituras iguais dentro da mesma transação retornam o mesmo resultado, mesmo que outra transação tenha alterado e comitado entre elas. Padrão do <em>MySQL/InnoDB</em>.</li>
        <li><strong>SERIALIZABLE</strong> — finge que as transações rodaram uma após a outra. Mais seguro, mais lento, mais sujeito a abortar com erro de serialização.</li>
      </ul>

      <PhpBlock
        filename="src/IsolamentoMysql.php"
        code={`<?php
declare(strict_types=1);

$pdo = new PDO(
    'mysql:host=db;dbname=loja;charset=utf8mb4',
    'app',
    'secret',
    [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION],
);

// Ajustando o nível só desta sessão (não da próxima conexão do pool).
$pdo->exec('SET SESSION TRANSACTION ISOLATION LEVEL SERIALIZABLE');

$pdo->beginTransaction();

$saldo = (int) $pdo->query('SELECT saldo FROM contas WHERE id = 1')
                   ->fetchColumn();

// ... regra de negócio com $saldo ...

$pdo->prepare('UPDATE contas SET saldo = :s WHERE id = 1')
    ->execute(['s' => $saldo - 1000]);

$pdo->commit();`}
      />

      <AlertBox type="info" title="Qual escolher na prática?">
        Para 95% dos casos, o padrão do banco serve. Suba para <code>SERIALIZABLE</code> apenas em
        operações financeiras críticas onde você quer que o banco te dê o erro de serialização (e você
        possa fazer retry). Não vá para <code>READ UNCOMMITTED</code> nunca em produção.
      </AlertBox>

      <h2>SELECT ... FOR UPDATE: travando uma linha</h2>
      <p>
        Imagine que duas instâncias do seu app reservam o último ingresso ao mesmo tempo. Mesmo dentro
        de uma transação, um <code>SELECT</code> normal não impede a outra transação de selecionar a
        mesma linha. <code>FOR UPDATE</code> coloca um <strong>lock exclusivo</strong> nas linhas
        retornadas — quem chegar depois espera você comitar (ou dar timeout).
      </p>

      <PhpBlock
        filename="src/ReservaIngresso.php"
        code={`<?php
declare(strict_types=1);

namespace App;

use PDO;
use RuntimeException;
use Throwable;

final readonly class ReservaIngresso
{
    public function __construct(private PDO $pdo) {}

    public function reservar(int $eventoId, int $usuarioId): int
    {
        $this->pdo->beginTransaction();

        try {
            // Trava o ingresso disponível mais antigo até a transação fechar.
            $stmt = $this->pdo->prepare(<<<SQL
                SELECT id FROM ingressos
                WHERE evento_id = :ev AND status = 'livre'
                ORDER BY id
                LIMIT 1
                FOR UPDATE
            SQL);
            $stmt->execute(['ev' => $eventoId]);
            $id = $stmt->fetchColumn();

            if ($id === false) {
                throw new RuntimeException('Sem ingressos disponíveis.');
            }

            $this->pdo->prepare(
                "UPDATE ingressos SET status = 'reservado', usuario_id = :u WHERE id = :id"
            )->execute(['u' => $usuarioId, 'id' => $id]);

            $this->pdo->commit();
            return (int) $id;
        } catch (Throwable $e) {
            $this->pdo->rollBack();
            throw $e;
        }
    }
}`}
      />

      <AlertBox type="warning" title="FOR UPDATE só funciona dentro de transação">
        Sem <code>beginTransaction()</code> antes, o lock é liberado imediatamente — o <code>FOR UPDATE</code>{" "}
        vira inútil. E em SQLite ele é ignorado (SQLite usa lock de banco inteiro), então use bancos
        reais (MySQL, Postgres) para esse padrão.
      </AlertBox>

      <h2>Deadlocks: o abraço da morte</h2>
      <p>
        Transação A trava a linha 1 e quer travar a 2. Transação B já travou a 2 e quer travar a 1.
        Ambas esperam para sempre — exceto que o banco percebe e <strong>aborta uma delas</strong> com
        erro. Sua aplicação precisa estar pronta para isso, e a resposta correta é quase sempre:{" "}
        <em>tentar de novo</em>.
      </p>

      <PhpBlock
        filename="src/RetryTransacao.php"
        code={`<?php
declare(strict_types=1);

namespace App;

use PDO;
use PDOException;
use Throwable;

final class RetryTransacao
{
    public static function executar(PDO $pdo, callable $bloco, int $maxTentativas = 3): mixed
    {
        $tentativa = 0;

        while (true) {
            $tentativa++;
            $pdo->beginTransaction();

            try {
                $resultado = $bloco($pdo);
                $pdo->commit();
                return $resultado;
            } catch (PDOException $e) {
                $pdo->rollBack();

                // SQLSTATE 40001 = deadlock no MySQL/Postgres.
                $isDeadlock = $e->getCode() === '40001'
                           || str_contains($e->getMessage(), 'Deadlock');

                if (!$isDeadlock || $tentativa >= $maxTentativas) {
                    throw $e;
                }

                usleep(50_000 * $tentativa); // backoff: 50ms, 100ms, 150ms
            } catch (Throwable $e) {
                $pdo->rollBack();
                throw $e;
            }
        }
    }
}

// Uso:
// RetryTransacao::executar($pdo, function (PDO $pdo) {
//     $pdo->exec('UPDATE estoque SET qtd = qtd - 1 WHERE id = 10');
//     $pdo->exec('UPDATE estoque SET qtd = qtd + 1 WHERE id = 11');
// });`}
      />

      <AlertBox type="danger" title="Deadlock NÃO é bug de SQL — é bug de ordem">
        Para evitar: sempre acesse linhas em <strong>ordem consistente</strong> (ex.: ordene por id
        ASC). Mantenha transações <strong>curtas</strong>. Não mande HTTP, e-mail ou chame APIs externas
        de dentro de uma transação aberta.
      </AlertBox>

      <h2>Savepoints: rollback parcial</h2>
      <p>
        Às vezes você quer tentar uma operação opcional dentro de uma transação maior — se ela falhar,
        desfaz só esse pedaço, sem perder o resto. Para isso existem <strong>savepoints</strong>:
      </p>

      <PhpBlock
        filename="bin/savepoints.php"
        code={`<?php
declare(strict_types=1);

$pdo = new PDO('mysql:host=db;dbname=loja', 'app', 'secret', [
    PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
]);

$pdo->beginTransaction();

try {
    $pdo->exec("INSERT INTO clientes (nome) VALUES ('Ada')");
    $clienteId = (int) $pdo->lastInsertId();

    // Tentativa opcional: enriquecer com CEP via cache. Se falhar, segue.
    $pdo->exec('SAVEPOINT enriquecer');
    try {
        $pdo->prepare('UPDATE clientes SET cep = ? WHERE id = ?')
            ->execute(['00000-000', $clienteId]);
        // simulando falha:
        throw new RuntimeException('cache fora do ar');
        $pdo->exec('RELEASE SAVEPOINT enriquecer');
    } catch (Throwable $e) {
        $pdo->exec('ROLLBACK TO SAVEPOINT enriquecer');
        echo "Enriquecimento ignorado: {$e->getMessage()}" . PHP_EOL;
    }

    $pdo->exec("INSERT INTO logs (mensagem) VALUES ('cliente criado')");
    $pdo->commit();

    echo "Cliente {$clienteId} salvo (sem cep)." . PHP_EOL;
} catch (Throwable $e) {
    $pdo->rollBack();
    throw $e;
}`}
        output={`Enriquecimento ignorado: cache fora do ar
Cliente 42 salvo (sem cep).`}
      />

      <h2>Resumo prático: SQL gerado</h2>
      <CodeBlock
        title="o que o PDO realmente envia"
        language="bash"
        code={`-- PDO::beginTransaction()
START TRANSACTION;

-- queries...
UPDATE contas SET saldo = saldo - 100 WHERE id = 1;
UPDATE contas SET saldo = saldo + 100 WHERE id = 2;

-- savepoints (suportados por MySQL e Postgres)
SAVEPOINT pulo1;
ROLLBACK TO SAVEPOINT pulo1;
RELEASE SAVEPOINT pulo1;

-- PDO::commit()
COMMIT;

-- PDO::rollBack()
ROLLBACK;`}
      />

      <h2>Rodando o exemplo</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/banco"
        command="mkdir -p var && php bin/transferir.php"
        output={`Ada    saldo: R$ 350.00
Linus  saldo: R$ 250.00
Falhou (e foi revertida): Saldo insuficiente.
Ada    saldo: R$ 350.00
Linus  saldo: R$ 250.00`}
      />

      <AlertBox type="success" title="Checklist de transação correta">
        <ol className="list-decimal ml-5 mt-1 space-y-1">
          <li><code>beginTransaction()</code> → <code>try</code> → <code>commit()</code> → <code>catch</code> → <code>rollBack()</code> + re-throw.</li>
          <li>Mantenha a transação <strong>curta</strong> — nada de I/O externo no meio.</li>
          <li>Use <code>FOR UPDATE</code> quando você vai ler-e-depois-escrever a mesma linha.</li>
          <li>Padronize a ordem de acesso às tabelas para evitar deadlocks.</li>
          <li>Implemente <em>retry</em> automático para SQLSTATE 40001.</li>
        </ol>
      </AlertBox>

      <p>
        Banco controlado, deadlocks domados. No próximo capítulo a gente sai do disco e vai para a
        memória pura: <strong>cache com Redis</strong>.
      </p>
    </PageContainer>
  );
}
