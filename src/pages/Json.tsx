import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Json() {
  return (
    <PageContainer
      title="JSON"
      subtitle="O formato universal das APIs. PHP traz duas funções para a vida toda: json_encode e json_decode — mas o detalhe está nas flags."
      difficulty="intermediario"
      timeToRead="10 min"
      category="Web & Banco"
    >
      <h2>De array PHP para JSON: <code>json_encode</code></h2>
      <p>
        A maioria das APIs que você vai escrever em PHP só precisa converter arrays e objetos
        em JSON e devolver na resposta:
      </p>

      <PhpBlock
        filename="encode.php"
        code={`<?php
declare(strict_types=1);

$usuario = [
    'id'    => 1,
    'nome'  => 'Ada Lovelace',
    'tags'  => ['matemática', 'computação'],
    'ativo' => true,
];

echo json_encode($usuario) . PHP_EOL;`}
        output={`{"id":1,"nome":"Ada Lovelace","tags":["matem\\u00e1tica","computa\\u00e7\\u00e3o"],"ativo":true}`}
      />

      <p>
        Repare nos <code>\u00e1</code>: por padrão, o PHP escapa Unicode. Para devolver UTF-8
        cru (mais legível e menor) e formatar bonito durante o desenvolvimento, combine flags:
      </p>

      <PhpBlock
        filename="encode-pretty.php"
        code={`<?php
declare(strict_types=1);

$usuario = [
    'id'    => 1,
    'nome'  => 'Ada Lovelace',
    'tags'  => ['matemática', 'computação'],
    'ativo' => true,
];

echo json_encode(
    $usuario,
    JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
) . PHP_EOL;`}
        output={`{
    "id": 1,
    "nome": "Ada Lovelace",
    "tags": [
        "matemática",
        "computação"
    ],
    "ativo": true
}`}
      />

      <ul>
        <li><code>JSON_PRETTY_PRINT</code>: indenta com 4 espaços (use só em dev/CLI).</li>
        <li><code>JSON_UNESCAPED_UNICODE</code>: deixa acentos e emojis intactos.</li>
        <li><code>JSON_UNESCAPED_SLASHES</code>: não escapa <code>/</code> em URLs.</li>
      </ul>

      <h2>De JSON para array PHP: <code>json_decode</code></h2>
      <p>
        Por padrão, <code>json_decode</code> devolve <code>stdClass</code>. Em 99% dos casos
        você quer array associativo — passe <code>true</code> no segundo argumento:
      </p>

      <PhpBlock
        filename="decode.php"
        code={`<?php
declare(strict_types=1);

$json = '{"id":42,"titulo":"Olá mundo","tags":["php","blog"]}';

$objeto = json_decode($json);
echo $objeto->titulo . PHP_EOL;            // acesso por propriedade

$array = json_decode($json, associative: true);
echo $array['titulo'] . PHP_EOL;           // acesso por chave
print_r($array['tags']);`}
        output={`Olá mundo
Olá mundo
Array
(
    [0] => php
    [1] => blog
)`}
      />

      <AlertBox type="info" title="Argumento nomeado deixa claro">
        PHP 8 permite <code>json_decode($s, associative: true)</code> em vez do segundo
        parâmetro posicional. Fica mais legível.
      </AlertBox>

      <h2>Erros silenciosos: o pesadelo do JSON</h2>
      <p>
        Antes do PHP 7.3, <code>json_decode</code> retornava <code>null</code> quando o
        JSON era inválido — e <code>null</code> também era um valor JSON válido. Confusão
        garantida. Solução moderna: <code>JSON_THROW_ON_ERROR</code>.
      </p>

      <PhpBlock
        filename="decode-throw.php"
        code={`<?php
declare(strict_types=1);

$invalido = '{"nome": "Ada", '; // truncado de propósito

try {
    $dados = json_decode($invalido, associative: true, flags: JSON_THROW_ON_ERROR);
} catch (\\JsonException $e) {
    echo "JSON inválido: " . $e->getMessage() . PHP_EOL;
}`}
        output={`JSON inválido: Syntax error`}
      />

      <p>
        A mesma flag funciona em <code>json_encode</code> — útil quando você tenta serializar
        um <code>resource</code> ou um valor circular:
      </p>

      <PhpBlock
        filename="encode-throw.php"
        code={`<?php
declare(strict_types=1);

try {
    $arquivo = fopen('php://memory', 'r');
    echo json_encode(['fp' => $arquivo], JSON_THROW_ON_ERROR);
} catch (\\JsonException $e) {
    echo "Falha: " . $e->getMessage() . PHP_EOL;
}`}
        output={`Falha: Type is not supported`}
      />

      <AlertBox type="success" title="Receita moderna">
        Sempre passe <code>JSON_THROW_ON_ERROR</code>. Combine com{" "}
        <code>JSON_UNESCAPED_UNICODE</code> em respostas HTTP. A vida fica simples.
      </AlertBox>

      <h2>Controlando como um objeto vira JSON: <code>JsonSerializable</code></h2>
      <p>
        Por padrão, <code>json_encode</code> só enxerga propriedades <code>public</code> de
        um objeto. Mas e se você quer expor uma versão <em>diferente</em> da interna —
        ocultar campos sensíveis, formatar datas, mudar nomes? Implemente{" "}
        <code>JsonSerializable</code>:
      </p>

      <PhpBlock
        filename="src/Usuario.php"
        code={`<?php
declare(strict_types=1);

namespace App;

final class Usuario implements \\JsonSerializable {
    public function __construct(
        public readonly int $id,
        public readonly string $nome,
        public readonly string $email,
        private readonly string $senhaHash,
        public readonly \\DateTimeImmutable $criadoEm,
    ) {}

    public function jsonSerialize(): array {
        return [
            'id'         => $this->id,
            'nome'       => $this->nome,
            'email'      => $this->email,
            // senhaHash propositalmente fora.
            'criado_em'  => $this->criadoEm->format(\\DateTimeInterface::ATOM),
        ];
    }
}`}
      />

      <PhpBlock
        filename="usar.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use App\\Usuario;

$ada = new Usuario(
    id: 1,
    nome: 'Ada Lovelace',
    email: 'ada@math.org',
    senhaHash: '$2y$10$abcdef...',
    criadoEm: new \\DateTimeImmutable('2025-03-27 10:00:00'),
);

echo json_encode($ada, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . PHP_EOL;`}
        output={`{
    "id": 1,
    "nome": "Ada Lovelace",
    "email": "ada@math.org",
    "criado_em": "2025-03-27T10:00:00+00:00"
}`}
      />

      <p>
        Note que a senha sumiu da saída — é exatamente o ponto do método. Você decide o
        contrato público sem alterar a estrutura interna.
      </p>

      <h2>Construindo uma micro-API REST</h2>
      <p>
        Com tudo isso, montar um endpoint que devolve JSON é trivial. Lembre só de mandar o
        header <code>Content-Type</code> certo:
      </p>

      <PhpBlock
        filename="public/api/usuarios.php"
        code={`<?php
declare(strict_types=1);

require __DIR__ . '/../../vendor/autoload.php';

use App\\Usuario;

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'método não permitido'], JSON_THROW_ON_ERROR);
    exit;
}

$usuarios = [
    new Usuario(1, 'Ada Lovelace', 'ada@math.org', 'h1', new \\DateTimeImmutable('2025-03-01')),
    new Usuario(2, 'Linus Torvalds', 'linus@kernel.org', 'h2', new \\DateTimeImmutable('2025-03-15')),
];

echo json_encode(
    ['data' => $usuarios, 'total' => count($usuarios)],
    JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE
);`}
        output={`{"data":[{"id":1,"nome":"Ada Lovelace","email":"ada@math.org","criado_em":"2025-03-01T00:00:00+00:00"},{"id":2,"nome":"Linus Torvalds","email":"linus@kernel.org","criado_em":"2025-03-15T00:00:00+00:00"}],"total":2}`}
      />

      <h2>Recebendo JSON em uma requisição POST</h2>
      <p>
        APIs modernas costumam receber JSON no corpo (não <code>application/x-www-form-urlencoded</code>).
        Você pega tudo de <code>php://input</code> e decodifica:
      </p>

      <PhpBlock
        filename="public/api/criar.php"
        code={`<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'use POST']);
    exit;
}

$raw = file_get_contents('php://input') ?: '';

try {
    $payload = json_decode($raw, associative: true, flags: JSON_THROW_ON_ERROR);
} catch (\\JsonException $e) {
    http_response_code(400);
    echo json_encode(['error' => 'JSON inválido', 'detalhe' => $e->getMessage()]);
    exit;
}

$nome = $payload['nome'] ?? null;
if (!is_string($nome) || $nome === '') {
    http_response_code(422);
    echo json_encode(['error' => 'nome é obrigatório']);
    exit;
}

http_response_code(201);
echo json_encode([
    'mensagem' => "criado: {$nome}",
    'id'       => random_int(100, 999),
], JSON_UNESCAPED_UNICODE);`}
      />

      <p>
        Testando com <code>curl</code>:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/api"
        command={`curl -X POST http://localhost:8000/api/criar.php -H 'Content-Type: application/json' -d '{"nome":"Carmen"}'`}
        output={`{"mensagem":"criado: Carmen","id":421}`}
      />

      <h2>Pegadinhas frequentes</h2>
      <ul>
        <li>
          <strong>Floats viram strings em JSON?</strong> Não. Mas{" "}
          <code>json_encode(1.0)</code> retorna <code>"1"</code> (sem o ponto).
          Use <code>JSON_PRESERVE_ZERO_FRACTION</code> para forçar <code>"1.0"</code>.
        </li>
        <li>
          <strong>Array vazio vira <code>[]</code> ou <code>{`{}`}</code>?</strong> Vira{" "}
          <code>[]</code>. Para forçar objeto JSON vazio, use{" "}
          <code>(object) []</code> ou <code>new \stdClass()</code>.
        </li>
        <li>
          <strong>Profundidade máxima:</strong> o terceiro parâmetro é o limite de profundidade
          (default 512). Estruturas muito aninhadas explodem com{" "}
          <code>JsonException</code>.
        </li>
      </ul>

      <CodeBlock
        title="JSON resultante de array vazio vs objeto vazio"
        language="json"
        code={`json_encode([])              -> []
json_encode((object) [])    -> {}
json_encode(['a' => 1])     -> {"a":1}
json_encode([1, 2, 3])      -> [1,2,3]`}
      />

      <AlertBox type="info" title="Próximo capítulo">
        Você já sabe falar com o navegador, com APIs e com o usuário. Falta o último
        elo: <strong>banco de dados</strong>. No próximo capítulo entra em cena o PDO.
      </AlertBox>
    </PageContainer>
  );
}
