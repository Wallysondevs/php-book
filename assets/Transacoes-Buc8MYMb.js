import{j as e}from"./index-Bb4MiiJL.js";import{P as s,a,A as o}from"./AlertBox-BpD-xIsb.js";import{T as r}from"./TerminalBlock-DGurMC1r.js";import{C as n}from"./CodeBlock-C3V-qEkN.js";function l(){return e.jsxs(s,{title:"Transações & Locking",subtitle:"Quando duas operações precisam acontecer juntas (ou nenhuma), bem-vindo às transações. E quando duas conexões disputam a mesma linha, bem-vindo aos locks, savepoints e deadlocks.",difficulty:"avancado",timeToRead:"14 min",category:"Banco Avançado",children:[e.jsx("h2",{children:"O problema clássico: a transferência bancária"}),e.jsxs("p",{children:["Você precisa ",e.jsx("strong",{children:"debitar R$ 100 da conta A"})," e ",e.jsx("strong",{children:"creditar R$ 100 na conta B"}),". Se o servidor cair entre as duas queries, a conta A ficou com R$ 100 a menos e a conta B nunca recebeu — você criou dinheiro do nada (ou destruiu, dependendo da ordem). A solução é tratar as duas operações como ",e.jsx("em",{children:"uma só"}),": ou as duas funcionam, ou nenhuma. Isso é uma ",e.jsx("strong",{children:"transação"}),"."]}),e.jsx("h2",{children:"O padrão sagrado: try / commit / catch / rollBack"}),e.jsx(a,{filename:"src/Transferencia.php",code:`<?php
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
}`}),e.jsx(a,{filename:"bin/transferir.php",code:`<?php
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
}`,output:`Ada    saldo: R$ 350.00
Linus  saldo: R$ 250.00
Falhou (e foi revertida): Saldo insuficiente.
Ada    saldo: R$ 350.00
Linus  saldo: R$ 250.00`}),e.jsxs(o,{type:"warning",title:"O try/catch é obrigatório, não decorativo",children:["Se você não capturar exceções e ",e.jsx("code",{children:"rollBack()"}),", a transação fica ",e.jsx("em",{children:"aberta"})," e a conexão pode ser devolvida ao pool nesse estado. Próxima requisição: caos. Toda transação precisa de um caminho garantido para commit ou rollback."]}),e.jsx("h2",{children:"Níveis de isolamento: o que o seu SELECT enxerga"}),e.jsxs("p",{children:["Dentro de uma transação, o que outras transações concorrentes ",e.jsx("em",{children:"já comitaram"})," aparece para você ou não? Depende do ",e.jsx("strong",{children:"nível de isolamento"}),". Da menos rígida para a mais rígida:"]}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"READ UNCOMMITTED"})," — vê até o que ainda nem foi comitado (",e.jsx("em",{children:"dirty reads"}),"). Praticamente nunca usado."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"READ COMMITTED"})," — só vê o que foi comitado. Padrão do ",e.jsx("em",{children:"Postgres"})," e ",e.jsx("em",{children:"SQL Server"}),"."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"REPEATABLE READ"})," — duas leituras iguais dentro da mesma transação retornam o mesmo resultado, mesmo que outra transação tenha alterado e comitado entre elas. Padrão do ",e.jsx("em",{children:"MySQL/InnoDB"}),"."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"SERIALIZABLE"})," — finge que as transações rodaram uma após a outra. Mais seguro, mais lento, mais sujeito a abortar com erro de serialização."]})]}),e.jsx(a,{filename:"src/IsolamentoMysql.php",code:`<?php
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

$pdo->commit();`}),e.jsxs(o,{type:"info",title:"Qual escolher na prática?",children:["Para 95% dos casos, o padrão do banco serve. Suba para ",e.jsx("code",{children:"SERIALIZABLE"})," apenas em operações financeiras críticas onde você quer que o banco te dê o erro de serialização (e você possa fazer retry). Não vá para ",e.jsx("code",{children:"READ UNCOMMITTED"})," nunca em produção."]}),e.jsx("h2",{children:"SELECT ... FOR UPDATE: travando uma linha"}),e.jsxs("p",{children:["Imagine que duas instâncias do seu app reservam o último ingresso ao mesmo tempo. Mesmo dentro de uma transação, um ",e.jsx("code",{children:"SELECT"})," normal não impede a outra transação de selecionar a mesma linha. ",e.jsx("code",{children:"FOR UPDATE"})," coloca um ",e.jsx("strong",{children:"lock exclusivo"})," nas linhas retornadas — quem chegar depois espera você comitar (ou dar timeout)."]}),e.jsx(a,{filename:"src/ReservaIngresso.php",code:`<?php
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
}`}),e.jsxs(o,{type:"warning",title:"FOR UPDATE só funciona dentro de transação",children:["Sem ",e.jsx("code",{children:"beginTransaction()"})," antes, o lock é liberado imediatamente — o ",e.jsx("code",{children:"FOR UPDATE"})," ","vira inútil. E em SQLite ele é ignorado (SQLite usa lock de banco inteiro), então use bancos reais (MySQL, Postgres) para esse padrão."]}),e.jsx("h2",{children:"Deadlocks: o abraço da morte"}),e.jsxs("p",{children:["Transação A trava a linha 1 e quer travar a 2. Transação B já travou a 2 e quer travar a 1. Ambas esperam para sempre — exceto que o banco percebe e ",e.jsx("strong",{children:"aborta uma delas"})," com erro. Sua aplicação precisa estar pronta para isso, e a resposta correta é quase sempre:"," ",e.jsx("em",{children:"tentar de novo"}),"."]}),e.jsx(a,{filename:"src/RetryTransacao.php",code:`<?php
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
// });`}),e.jsxs(o,{type:"danger",title:"Deadlock NÃO é bug de SQL — é bug de ordem",children:["Para evitar: sempre acesse linhas em ",e.jsx("strong",{children:"ordem consistente"})," (ex.: ordene por id ASC). Mantenha transações ",e.jsx("strong",{children:"curtas"}),". Não mande HTTP, e-mail ou chame APIs externas de dentro de uma transação aberta."]}),e.jsx("h2",{children:"Savepoints: rollback parcial"}),e.jsxs("p",{children:["Às vezes você quer tentar uma operação opcional dentro de uma transação maior — se ela falhar, desfaz só esse pedaço, sem perder o resto. Para isso existem ",e.jsx("strong",{children:"savepoints"}),":"]}),e.jsx(a,{filename:"bin/savepoints.php",code:`<?php
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
}`,output:`Enriquecimento ignorado: cache fora do ar
Cliente 42 salvo (sem cep).`}),e.jsx("h2",{children:"Resumo prático: SQL gerado"}),e.jsx(n,{title:"o que o PDO realmente envia",language:"bash",code:`-- PDO::beginTransaction()
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
ROLLBACK;`}),e.jsx("h2",{children:"Rodando o exemplo"}),e.jsx(r,{user:"dev",host:"php",cwd:"~/projetos/banco",command:"mkdir -p var && php bin/transferir.php",output:`Ada    saldo: R$ 350.00
Linus  saldo: R$ 250.00
Falhou (e foi revertida): Saldo insuficiente.
Ada    saldo: R$ 350.00
Linus  saldo: R$ 250.00`}),e.jsx(o,{type:"success",title:"Checklist de transação correta",children:e.jsxs("ol",{className:"list-decimal ml-5 mt-1 space-y-1",children:[e.jsxs("li",{children:[e.jsx("code",{children:"beginTransaction()"})," → ",e.jsx("code",{children:"try"})," → ",e.jsx("code",{children:"commit()"})," → ",e.jsx("code",{children:"catch"})," → ",e.jsx("code",{children:"rollBack()"})," + re-throw."]}),e.jsxs("li",{children:["Mantenha a transação ",e.jsx("strong",{children:"curta"})," — nada de I/O externo no meio."]}),e.jsxs("li",{children:["Use ",e.jsx("code",{children:"FOR UPDATE"})," quando você vai ler-e-depois-escrever a mesma linha."]}),e.jsx("li",{children:"Padronize a ordem de acesso às tabelas para evitar deadlocks."}),e.jsxs("li",{children:["Implemente ",e.jsx("em",{children:"retry"})," automático para SQLSTATE 40001."]})]})}),e.jsxs("p",{children:["Banco controlado, deadlocks domados. No próximo capítulo a gente sai do disco e vai para a memória pura: ",e.jsx("strong",{children:"cache com Redis"}),"."]})]})}export{l as default};
