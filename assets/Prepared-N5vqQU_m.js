import{j as e}from"./index-B5-q-eol.js";import{P as r,A as o,a as s}from"./AlertBox-CVbFLZEd.js";import{C as a}from"./CodeBlock-B36pQ_ak.js";function t(){return e.jsxs(r,{title:"Prepared Statements",subtitle:"A defesa contra SQL injection e o mecanismo que separa código novato de código profissional. Aqui você aprende prepare/execute, bind* e transações.",difficulty:"avancado",timeToRead:"13 min",category:"Web & Banco",children:[e.jsx(o,{type:"info",title:"Pré-requisitos",children:e.jsxs("p",{children:["Antes deste capítulo, é bom já ter visto: ",e.jsx("a",{href:"#/pdo",className:"text-[#8993BE] underline",children:"PDO"}),", ",e.jsx("a",{href:"#/exceptions",className:"text-[#8993BE] underline",children:"Try/Catch"})," e ",e.jsx("a",{href:"#/classes",className:"text-[#8993BE] underline",children:"Classes"}),"."]})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"prepare()"})," "," — "," ","pré-compila SQL com placeholders ? ou :nome."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"execute([...])"})," "," — "," ","roda passando os valores; eles NÃO viram SQL."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"bindValue / bindParam"})," "," — "," ","liga placeholders; bindParam é por referência."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Anti-injection"})," "," — "," ","driver escapa por você — nunca concatene strings."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Performance"})," "," — "," ","driver pode reusar plano de execução."]})]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"prepare"})," — método ",e.jsx("code",{children:"$pdo->prepare($sql)"})," que envia a query (com placeholders ",e.jsx("code",{children:"?"})," ou ",e.jsx("code",{children:":nome"}),") ao banco para parsing. Existe pra separar ",e.jsx("em",{children:"código SQL"})," de ",e.jsx("em",{children:"valores"}),", blindando contra SQL injection. Devolve um ",e.jsx("code",{children:"PDOStatement"}),"."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"execute"})," — método ",e.jsx("code",{children:"$stmt->execute($params)"})," que roda o statement preparado, opcionalmente recebendo um array com os valores dos placeholders. Pode ser chamado várias vezes mudando só os parâmetros — o banco reaproveita o plano."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"bindValue vs bindParam"})," — ",e.jsx("code",{children:"bindValue"})," copia o valor ",e.jsx("em",{children:"na hora da chamada"}),"; mudar a variável depois não afeta. ",e.jsx("code",{children:"bindParam"})," amarra ",e.jsx("em",{children:"por referência"}),": o valor é lido só no ",e.jsx("code",{children:"execute"}),", ideal para loops. Sintaxe: ",e.jsx("code",{children:"$stmt->bindValue(':n', $nome, PDO::PARAM_STR);"}),"."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"beginTransaction"})," — método ",e.jsx("code",{children:"$pdo->beginTransaction()"})," que abre uma transação: várias queries que devem ser commitadas ",e.jsx("em",{children:"juntas"})," ou desfeitas com ",e.jsx("code",{children:"rollBack()"}),' em caso de erro. Existe pra garantir consistência ("tudo ou nada"). Sempre encerre com ',e.jsx("code",{children:"commit()"})," ou ",e.jsx("code",{children:"rollBack()"}),"."]}),e.jsx("h2",{children:"O bug que derrubou meio mundo"}),e.jsxs("p",{children:["Concatenar valor de usuário em SQL é a porta de entrada mais clássica do SQL injection. Olhe esse código ",e.jsx("strong",{children:"perigoso"}),":"]}),e.jsx(s,{filename:"inseguro.php",code:`<?php
declare(strict_types=1);

$pdo = new PDO('sqlite:' . __DIR__ . '/app.sqlite');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$email = $_GET['email'] ?? '';
$senha = $_GET['senha'] ?? '';

// NUNCA faça isso
$sql = "SELECT * FROM usuarios WHERE email = '$email' AND senha = '$senha'";
$row = $pdo->query($sql)->fetch();

var_dump($row !== false);`}),e.jsxs("p",{children:["Se o atacante usa ",e.jsx("code",{children:"?email=' OR 1=1 --&senha=qualquer"}),", a query final vira:"]}),e.jsx(a,{title:"SQL real executado",language:"sql",code:"SELECT * FROM usuarios WHERE email = '' OR 1=1 --' AND senha = 'qualquer'"}),e.jsxs("p",{children:["O ",e.jsx("code",{children:"--"})," comenta o resto, ",e.jsx("code",{children:"OR 1=1"})," casa qualquer linha — login sem senha. A solução é usar ",e.jsx("strong",{children:"prepared statements"}),", que separam ",e.jsx("em",{children:"código SQL"})," de ",e.jsx("em",{children:"valores"}),":"]}),e.jsx(s,{filename:"seguro.php",code:`<?php
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
}`,output:"ok, user_id=1"}),e.jsxs("p",{children:["O ",e.jsx("code",{children:"?"})," é um ",e.jsx("strong",{children:"placeholder"}),": o banco recebe a query"," ",e.jsx("em",{children:"uma vez"})," e os valores depois, sem possibilidade de virar código."]}),e.jsxs("h2",{children:["Dois estilos de placeholder: ",e.jsx("code",{children:"?"})," e ",e.jsx("code",{children:":nome"})]}),e.jsx(s,{filename:"placeholders.php",code:`<?php
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
print_r($stmt->fetchAll(PDO::FETCH_COLUMN, 1));`,output:`Array
(
    [0] => Café 250g
    [1] => Manteiga
)
Array
(
    [0] => Café 250g
    [1] => Manteiga
)`}),e.jsxs(o,{type:"info",title:"Quando usar cada um?",children:[e.jsx("strong",{children:"Posicional (?)"})," é mais curto e ideal quando há poucos parâmetros.",e.jsx("br",{}),e.jsx("strong",{children:"Nomeado (:nome)"})," brilha em queries longas com muitos parâmetros — fica mais legível e o mesmo nome pode aparecer várias vezes."]}),e.jsxs("h2",{children:[e.jsx("code",{children:"bindParam"})," vs ",e.jsx("code",{children:"bindValue"})]}),e.jsxs("p",{children:["Em vez de passar tudo no ",e.jsx("code",{children:"execute"}),", você pode amarrar os parâmetros antes. A diferença entre os dois métodos é sutil mas importante:"]}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:e.jsx("code",{children:"bindValue"})}),": copia o valor ",e.jsx("em",{children:"na hora da chamada"}),". Mudanças posteriores na variável não afetam o statement."]}),e.jsxs("li",{children:[e.jsx("strong",{children:e.jsx("code",{children:"bindParam"})}),": amarra a variável ",e.jsx("em",{children:"por referência"}),". O valor é lido ",e.jsxs("em",{children:["no momento do ",e.jsx("code",{children:"execute"})]}),". Excelente para loops."]})]}),e.jsx(s,{filename:"bind-value.php",code:`<?php
declare(strict_types=1);

$pdo = new PDO('sqlite:' . __DIR__ . '/app.sqlite');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$nome = 'Café 250g';

$stmt = $pdo->prepare('SELECT id FROM produtos WHERE nome = :n');
$stmt->bindValue(':n', $nome, PDO::PARAM_STR);

$nome = 'OUTRA COISA'; // mudança IGNORADA — bindValue copiou na hora

$stmt->execute();
echo $stmt->fetchColumn() . PHP_EOL;`,output:"1"}),e.jsx(s,{filename:"bind-param.php",code:`<?php
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

echo "inseridos: " . count($novos) . PHP_EOL;`,output:"inseridos: 3"}),e.jsxs("p",{children:["Repare como o mesmo ",e.jsx("code",{children:"$stmt"})," é executado três vezes mudando apenas as variáveis amarradas — o banco prepara a query uma vez só e ganha em performance."]}),e.jsx("h2",{children:"Tipos PDO::PARAM_*"}),e.jsx("p",{children:"Os tipos suportados que você usa no dia a dia:"}),e.jsx(a,{title:"Tipos PDO::PARAM_*",language:"php",code:`PDO::PARAM_STR    // string (default)
PDO::PARAM_INT    // inteiro
PDO::PARAM_BOOL   // booleano
PDO::PARAM_NULL   // NULL
PDO::PARAM_LOB    // BLOB (binário grande)`}),e.jsx("h2",{children:"Lendo coleções com IN (...)"}),e.jsxs("p",{children:["Uma das pegadinhas: ",e.jsx("strong",{children:"placeholders não expandem arrays"}),". Você precisa gerar a quantidade certa de ",e.jsx("code",{children:"?"})," dinamicamente:"]}),e.jsx(s,{filename:"in.php",code:`<?php
declare(strict_types=1);

$pdo = new PDO('sqlite:' . __DIR__ . '/app.sqlite');
$pdo->setAttribute(PDO::ATTR_ERRMODE, PDO::ERRMODE_EXCEPTION);

$ids = [1, 2, 4];

// Gera o mesmo número de ? que de IDs
$placeholders = implode(',', array_fill(0, count($ids), '?'));
$sql = "SELECT id, nome FROM produtos WHERE id IN ($placeholders)";

$stmt = $pdo->prepare($sql);
$stmt->execute($ids);

print_r($stmt->fetchAll(PDO::FETCH_KEY_PAIR));`,output:`Array
(
    [1] => Café 250g
    [2] => Pão
    [4] => Açúcar 1kg
)`}),e.jsx("h2",{children:"Transações: tudo ou nada"}),e.jsxs("p",{children:["Quando uma operação envolve ",e.jsx("strong",{children:"várias queries que precisam acontecer juntas"})," ","— como debitar de uma conta e creditar em outra — você usa transações. Se uma falha, nada é gravado."]}),e.jsx(s,{filename:"transferencia.php",code:`<?php
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
}`,output:"transferência ok"}),e.jsxs("p",{children:["O ciclo é sempre o mesmo: ",e.jsx("code",{children:"beginTransaction"})," →"," ","várias queries → ",e.jsx("code",{children:"commit"})," em caso de sucesso, ",e.jsx("code",{children:"rollBack"})," ","em qualquer exceção. Se você esquecer o ",e.jsx("code",{children:"rollBack"})," e estourar uma exceção, a próxima conexão herda uma transação aberta — uma fonte clássica de bugs."]}),e.jsx(o,{type:"warning",title:"Pegadinhas das transações",children:e.jsxs("ul",{className:"list-disc ml-5 mt-1 space-y-1",children:[e.jsxs("li",{children:["SQLite tem ",e.jsx("em",{children:"locking"})," de arquivo — transações longas travam outros leitores."]}),e.jsxs("li",{children:["MySQL com tabelas ",e.jsx("code",{children:"MyISAM"})," ignora transações silenciosamente. Use sempre ",e.jsx("code",{children:"InnoDB"}),"."]}),e.jsxs("li",{children:["Comandos DDL (",e.jsx("code",{children:"CREATE TABLE"}),", ",e.jsx("code",{children:"ALTER"}),") em MySQL fazem commit implícito — não use dentro de transação."]})]})}),e.jsx("h2",{children:"Pattern: o repositório"}),e.jsxs("p",{children:["Em vez de espalhar ",e.jsx("code",{children:"prepare"}),"/",e.jsx("code",{children:"execute"})," pela aplicação, encapsule num repositório. Fica testável, reutilizável e isolado:"]}),e.jsx(s,{filename:"src/ProdutoRepository.php",code:`<?php
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
}`}),e.jsx(s,{filename:"usar.php",code:`<?php
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
echo "encontrado: {$prod['nome']} por {$prod['preco']}c" . PHP_EOL;`,output:`criado id=8
encontrado: Granola 500g por 1690c`}),e.jsx("h2",{children:"Quando o nome da tabela é dinâmico — perigo!"}),e.jsxs("p",{children:["Placeholders só funcionam para ",e.jsx("strong",{children:"valores"}),", não para identificadores (nome de tabela, coluna, ",e.jsx("code",{children:"ORDER BY"}),"). Se você precisa que esses sejam dinâmicos, use uma ",e.jsx("em",{children:"allowlist"}),":"]}),e.jsx(s,{filename:"ordenacao-segura.php",code:`<?php
declare(strict_types=1);

$pdo = new PDO('sqlite:' . __DIR__ . '/app.sqlite');

$pedida = $_GET['ordem'] ?? 'id';

// Allowlist: só nomes que VOCÊ definiu são aceitos
$colunas = ['id', 'nome', 'preco'];
$ordem = in_array($pedida, $colunas, true) ? $pedida : 'id';

$sql = "SELECT id, nome, preco FROM produtos ORDER BY {$ordem}";
$stmt = $pdo->query($sql);
print_r($stmt->fetchAll(PDO::FETCH_ASSOC));`}),e.jsx(o,{type:"success",title:"Cheat sheet de prepared statements",children:e.jsxs("ol",{className:"list-decimal ml-5 mt-1 space-y-1",children:[e.jsxs("li",{children:["Toda query com dado de fora vai por ",e.jsx("code",{children:"prepare"})," + ",e.jsx("code",{children:"execute"}),"."]}),e.jsxs("li",{children:["Use ",e.jsx("code",{children:"?"})," para queries curtas, ",e.jsx("code",{children:":nome"})," para queries longas."]}),e.jsxs("li",{children:[e.jsx("code",{children:"bindValue"})," copia o valor na hora; ",e.jsx("code",{children:"bindParam"})," amarra por referência."]}),e.jsxs("li",{children:["Para ",e.jsx("code",{children:"IN (...)"}),", gere os ",e.jsx("code",{children:"?"})," dinamicamente."]}),e.jsxs("li",{children:["Operações múltiplas que dependem entre si vão dentro de ",e.jsx("code",{children:"beginTransaction"}),"/",e.jsx("code",{children:"commit"}),"."]}),e.jsxs("li",{children:["Identificadores dinâmicos vão por ",e.jsx("strong",{children:"allowlist"}),", nunca por concatenação direta."]})]})}),e.jsx("p",{children:"Você agora conhece tudo que precisa para falar com banco em PHP de forma profissional e segura. SQL injection deixa de ser preocupação — vira impossibilidade."})]})}export{t as default};
