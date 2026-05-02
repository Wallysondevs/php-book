import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Prepared() {
  return (
    <PageContainer
      title="Prepared Statements"
      subtitle="A defesa contra SQL injection e o mecanismo que separa código novato de código profissional. Aqui você aprende prepare/execute, bind* e transações."
      difficulty="avancado"
      timeToRead="13 min"
      category="Web & Banco"
    >
      <AlertBox type="info" title="Pré-requisitos">
        <p>Antes deste capítulo, é bom já ter visto: <a href="#/pdo" className="text-[#8993BE] underline">PDO</a>, <a href="#/exceptions" className="text-[#8993BE] underline">Try/Catch</a> e <a href="#/classes" className="text-[#8993BE] underline">Classes</a>.</p>
      </AlertBox>

      <p><strong className="text-[#8993BE] font-mono">prepare</strong> — método <code>$pdo-&gt;prepare($sql)</code> que envia a query (com placeholders <code>?</code> ou <code>:nome</code>) ao banco para parsing. Existe pra separar <em>código SQL</em> de <em>valores</em>, blindando contra SQL injection. Devolve um <code>PDOStatement</code>.</p>

      <p><strong className="text-[#8993BE] font-mono">execute</strong> — método <code>$stmt-&gt;execute($params)</code> que roda o statement preparado, opcionalmente recebendo um array com os valores dos placeholders. Pode ser chamado várias vezes mudando só os parâmetros — o banco reaproveita o plano.</p>

      <p><strong className="text-[#8993BE] font-mono">bindValue vs bindParam</strong> — <code>bindValue</code> copia o valor <em>na hora da chamada</em>; mudar a variável depois não afeta. <code>bindParam</code> amarra <em>por referência</em>: o valor é lido só no <code>execute</code>, ideal para loops. Sintaxe: <code>$stmt-&gt;bindValue(':n', $nome, PDO::PARAM_STR);</code>.</p>

      <p><strong className="text-[#8993BE] font-mono">beginTransaction</strong> — método <code>$pdo-&gt;beginTransaction()</code> que abre uma transação: várias queries que devem ser commitadas <em>juntas</em> ou desfeitas com <code>rollBack()</code> em caso de erro. Existe pra garantir consistência ("tudo ou nada"). Sempre encerre com <code>commit()</code> ou <code>rollBack()</code>.</p>

      <h2>O bug que derrubou meio mundo</h2>
      <p>
        Concatenar valor de usuário em SQL é a porta de entrada mais clássica do SQL injection.
        Olhe esse código <strong>perigoso</strong>:
      </p>

      <PhpBlock
        filename="inseguro.php"
        code={`<?php
declare(strict_types=1);

$pdo = new PDO('sqlite:' . __DIR__ . '/app.sqlite');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$email = $_GET['email'] ?? '';
$senha = $_GET['senha'] ?? '';

// NUNCA faça isso
$sql = "SELECT * FROM usuarios WHERE email = '$email' AND senha = '$senha'";
$row = $pdo->query($sql)->fetch();

var_dump($row !== false);`}
      />

      <p>
        Se o atacante usa <code>?email=' OR 1=1 --&amp;senha=qualquer</code>, a query final vira:
      </p>

      <CodeBlock
        title="SQL real executado"
        language="sql"
        code={`SELECT * FROM usuarios WHERE email = '' OR 1=1 --' AND senha = 'qualquer'`}
      />

      <p>
        O <code>--</code> comenta o resto, <code>OR 1=1</code> casa qualquer linha — login sem
        senha. A solução é usar <strong>prepared statements</strong>, que separam <em>código
        SQL</em> de <em>valores</em>:
      </p>

      <PhpBlock
        filename="seguro.php"
        code={`<?php
declare(strict_types=1);

$pdo = new PDO('sqlite:' . __DIR__ . '/app.sqlite');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);
$pdo->setAttribute(PDO::ATTR_EMULATE_PREPARES, false);

$email = $_GET['email'] ?? '';
$senha = $_GET['senha'] ?? '';

$stmt = $pdo->prepare('SELECT id, senha_hash FROM usuarios WHERE email = ?');
$stmt->execute([$email]);
$row = $stmt->fetch(PDO::FETCH_ASSOC);

if ($row && password_verify($senha, $row['senha_hash'])) {
    echo "ok, user_id={$row['id']}" . PHP_EOL;
} else {
    echo "credenciais inválidas" . PHP_EOL;
}`}
        output={`ok, user_id=1`}
      />

      <p>
        O <code>?</code> é um <strong>placeholder</strong>: o banco recebe a query{" "}
        <em>uma vez</em> e os valores depois, sem possibilidade de virar código.
      </p>

      <h2>Dois estilos de placeholder: <code>?</code> e <code>:nome</code></h2>

      <PhpBlock
        filename="placeholders.php"
        code={`<?php
declare(strict_types=1);

$pdo = new PDO('sqlite:' . __DIR__ . '/app.sqlite');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

// Posicional (?) — passa array indexado
$stmt = $pdo->prepare('SELECT * FROM produtos WHERE preco BETWEEN ? AND ?');
$stmt->execute([1000, 2000]);
print_r($stmt->fetchAll(PDO::FETCH_COLUMN, 1));

// Nomeado (:chave) — passa array associativo
$stmt = $pdo->prepare('SELECT * FROM produtos WHERE preco BETWEEN :min AND :max');
$stmt->execute(['min' => 1000, 'max' => 2000]);
print_r($stmt->fetchAll(PDO::FETCH_COLUMN, 1));`}
        output={`Array
(
    [0] => Café 250g
    [1] => Manteiga
)
Array
(
    [0] => Café 250g
    [1] => Manteiga
)`}
      />

      <AlertBox type="info" title="Quando usar cada um?">
        <strong>Posicional (?)</strong> é mais curto e ideal quando há poucos parâmetros.
        <br />
        <strong>Nomeado (:nome)</strong> brilha em queries longas com muitos parâmetros — fica
        mais legível e o mesmo nome pode aparecer várias vezes.
      </AlertBox>

      <h2><code>bindParam</code> vs <code>bindValue</code></h2>
      <p>
        Em vez de passar tudo no <code>execute</code>, você pode amarrar os parâmetros antes.
        A diferença entre os dois métodos é sutil mas importante:
      </p>

      <ul>
        <li>
          <strong><code>bindValue</code></strong>: copia o valor <em>na hora da chamada</em>.
          Mudanças posteriores na variável não afetam o statement.
        </li>
        <li>
          <strong><code>bindParam</code></strong>: amarra a variável <em>por referência</em>.
          O valor é lido <em>no momento do <code>execute</code></em>. Excelente para loops.
        </li>
      </ul>

      <PhpBlock
        filename="bind-value.php"
        code={`<?php
declare(strict_types=1);

$pdo = new PDO('sqlite:' . __DIR__ . '/app.sqlite');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$nome = 'Café 250g';

$stmt = $pdo->prepare('SELECT id FROM produtos WHERE nome = :n');
$stmt->bindValue(':n', $nome, PDO::PARAM_STR);

$nome = 'OUTRA COISA'; // mudança IGNORADA — bindValue copiou na hora

$stmt->execute();
echo $stmt->fetchColumn() . PHP_EOL;`}
        output={`1`}
      />

      <PhpBlock
        filename="bind-param.php"
        code={`<?php
declare(strict_types=1);

$pdo = new PDO('sqlite:' . __DIR__ . '/app.sqlite');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$nome  = '';
$preco = 0;

$stmt = $pdo->prepare('INSERT INTO produtos (nome, preco) VALUES (:n, :p)');
$stmt->bindParam(':n', $nome, PDO::PARAM_STR);
$stmt->bindParam(':p', $preco, PDO::PARAM_INT);

$novos = [
    ['Leite 1L', 590],
    ['Iogurte', 480],
    ['Queijo', 2890],
];

foreach ($novos as [$n, $p]) {
    $nome  = $n;   // bindParam relê na hora do execute
    $preco = $p;
    $stmt->execute();
}

echo "inseridos: " . count($novos) . PHP_EOL;`}
        output={`inseridos: 3`}
      />

      <p>
        Repare como o mesmo <code>$stmt</code> é executado três vezes mudando apenas as
        variáveis amarradas — o banco prepara a query uma vez só e ganha em performance.
      </p>

      <h2>Tipos PDO::PARAM_*</h2>
      <p>
        Os tipos suportados que você usa no dia a dia:
      </p>

      <CodeBlock
        title="Tipos PDO::PARAM_*"
        language="php"
        code={`PDO::PARAM_STR    // string (default)
PDO::PARAM_INT    // inteiro
PDO::PARAM_BOOL   // booleano
PDO::PARAM_NULL   // NULL
PDO::PARAM_LOB    // BLOB (binário grande)`}
      />

      <h2>Lendo coleções com IN (...)</h2>
      <p>
        Uma das pegadinhas: <strong>placeholders não expandem arrays</strong>. Você precisa
        gerar a quantidade certa de <code>?</code> dinamicamente:
      </p>

      <PhpBlock
        filename="in.php"
        code={`<?php
declare(strict_types=1);

$pdo = new PDO('sqlite:' . __DIR__ . '/app.sqlite');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$ids = [1, 2, 4];

// Gera o mesmo número de ? que de IDs
$placeholders = implode(',', array_fill(0, count($ids), '?'));
$sql = "SELECT id, nome FROM produtos WHERE id IN ($placeholders)";

$stmt = $pdo->prepare($sql);
$stmt->execute($ids);

print_r($stmt->fetchAll(PDO::FETCH_KEY_PAIR));`}
        output={`Array
(
    [1] => Café 250g
    [2] => Pão
    [4] => Açúcar 1kg
)`}
      />

      <h2>Transações: tudo ou nada</h2>
      <p>
        Quando uma operação envolve <strong>várias queries que precisam acontecer juntas</strong>{" "}
        — como debitar de uma conta e creditar em outra — você usa transações. Se uma falha,
        nada é gravado.
      </p>

      <PhpBlock
        filename="transferencia.php"
        code={`<?php
declare(strict_types=1);

$pdo = new PDO('sqlite:' . __DIR__ . '/contas.sqlite');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

function transferir(PDO $pdo, int $de, int $para, int $centavos): void {
    $pdo->beginTransaction();

    try {
        $debita = $pdo->prepare('UPDATE contas SET saldo = saldo - :v WHERE id = :id AND saldo >= :v');
        $debita->execute(['v' => $centavos, 'id' => $de]);

        if ($debita->rowCount() === 0) {
            throw new RuntimeException('saldo insuficiente');
        }

        $credita = $pdo->prepare('UPDATE contas SET saldo = saldo + :v WHERE id = :id');
        $credita->execute(['v' => $centavos, 'id' => $para]);

        $pdo->commit();
    } catch (\\Throwable $e) {
        $pdo->rollBack();
        throw $e;
    }
}

try {
    transferir($pdo, de: 1, para: 2, centavos: 5000);
    echo "transferência ok" . PHP_EOL;
} catch (\\Throwable $e) {
    echo "falhou: " . $e->getMessage() . PHP_EOL;
}`}
        output={`transferência ok`}
      />

      <p>
        O ciclo é sempre o mesmo: <code>beginTransaction</code> →{" "}
        várias queries → <code>commit</code> em caso de sucesso, <code>rollBack</code>{" "}
        em qualquer exceção. Se você esquecer o <code>rollBack</code> e estourar uma exceção,
        a próxima conexão herda uma transação aberta — uma fonte clássica de bugs.
      </p>

      <AlertBox type="warning" title="Pegadinhas das transações">
        <ul className="list-disc ml-5 mt-1 space-y-1">
          <li>SQLite tem <em>locking</em> de arquivo — transações longas travam outros leitores.</li>
          <li>MySQL com tabelas <code>MyISAM</code> ignora transações silenciosamente. Use sempre <code>InnoDB</code>.</li>
          <li>Comandos DDL (<code>CREATE TABLE</code>, <code>ALTER</code>) em MySQL fazem commit implícito — não use dentro de transação.</li>
        </ul>
      </AlertBox>

      <h2>Pattern: o repositório</h2>
      <p>
        Em vez de espalhar <code>prepare</code>/<code>execute</code> pela aplicação,
        encapsule num repositório. Fica testável, reutilizável e isolado:
      </p>

      <PhpBlock
        filename="src/ProdutoRepository.php"
        code={`<?php
declare(strict_types=1);

namespace App;

final readonly class ProdutoRepository {
    public function __construct(private \\PDO $pdo) {}

    public function buscarPorId(int $id): ?array {
        $stmt = $this->pdo->prepare('SELECT id, nome, preco FROM produtos WHERE id = :id');
        $stmt->execute(['id' => $id]);
        $row = $stmt->fetch(\\PDO::FETCH_ASSOC);
        return $row === false ? null : $row;
    }

    public function listar(int $limite = 50): array {
        $stmt = $this->pdo->prepare('SELECT id, nome, preco FROM produtos ORDER BY id DESC LIMIT :lim');
        $stmt->bindValue(':lim', $limite, \\PDO::PARAM_INT);
        $stmt->execute();
        return $stmt->fetchAll(\\PDO::FETCH_ASSOC);
    }

    public function criar(string $nome, int $preco): int {
        $stmt = $this->pdo->prepare('INSERT INTO produtos (nome, preco) VALUES (:n, :p)');
        $stmt->execute(['n' => $nome, 'p' => $preco]);
        return (int) $this->pdo->lastInsertId();
    }
}`}
      />

      <PhpBlock
        filename="usar.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use App\\ProdutoRepository;

$pdo = new PDO('sqlite:' . __DIR__ . '/app.sqlite', options: [
    PDO::ATTR_ERRMODE            => PDO::ERRMODE_EXCEPTION,
    PDO::ATTR_EMULATE_PREPARES   => false,
    PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
]);

$repo = new ProdutoRepository($pdo);

$id = $repo->criar('Granola 500g', 1690);
echo "criado id={$id}" . PHP_EOL;

$prod = $repo->buscarPorId($id);
echo "encontrado: {$prod['nome']} por {$prod['preco']}c" . PHP_EOL;`}
        output={`criado id=8
encontrado: Granola 500g por 1690c`}
      />

      <h2>Quando o nome da tabela é dinâmico — perigo!</h2>
      <p>
        Placeholders só funcionam para <strong>valores</strong>, não para identificadores
        (nome de tabela, coluna, <code>ORDER BY</code>). Se você precisa que esses sejam
        dinâmicos, use uma <em>allowlist</em>:
      </p>

      <PhpBlock
        filename="ordenacao-segura.php"
        code={`<?php
declare(strict_types=1);

$pdo = new PDO('sqlite:' . __DIR__ . '/app.sqlite');

$pedida = $_GET['ordem'] ?? 'id';

// Allowlist: só nomes que VOCÊ definiu são aceitos
$colunas = ['id', 'nome', 'preco'];
$ordem = in_array($pedida, $colunas, true) ? $pedida : 'id';

$sql = "SELECT id, nome, preco FROM produtos ORDER BY {$ordem}";
$stmt = $pdo->query($sql);
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));`}
      />

      <AlertBox type="success" title="Cheat sheet de prepared statements">
        <ol className="list-decimal ml-5 mt-1 space-y-1">
          <li>Toda query com dado de fora vai por <code>prepare</code> + <code>execute</code>.</li>
          <li>Use <code>?</code> para queries curtas, <code>:nome</code> para queries longas.</li>
          <li><code>bindValue</code> copia o valor na hora; <code>bindParam</code> amarra por referência.</li>
          <li>Para <code>IN (...)</code>, gere os <code>?</code> dinamicamente.</li>
          <li>Operações múltiplas que dependem entre si vão dentro de <code>beginTransaction</code>/<code>commit</code>.</li>
          <li>Identificadores dinâmicos vão por <strong>allowlist</strong>, nunca por concatenação direta.</li>
        </ol>
      </AlertBox>

      <p>
        Você agora conhece tudo que precisa para falar com banco em PHP de forma profissional
        e segura. SQL injection deixa de ser preocupação — vira impossibilidade.
      </p>
    </PageContainer>
  );
}
