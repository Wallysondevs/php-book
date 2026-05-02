import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { BrowserBlock } from "@/components/ui/BrowserBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Uploads() {
  return (
    <PageContainer
      title="Upload de arquivos"
      subtitle="Receber arquivos do usuário sem virar manchete de invasão: validação de tipo MIME real, limites do php.ini, defesa contra path traversal e múltiplos uploads."
      difficulty="intermediario"
      timeToRead="13 min"
      category="Arquivos & I/O"
    >
      <h2>O ponto de partida: o formulário HTML</h2>
      <p>
        O navegador só envia um arquivo se o formulário tiver{" "}
        <code>enctype=&quot;multipart/form-data&quot;</code> e o input for{" "}
        <code>type=&quot;file&quot;</code>. Esquecer o <code>enctype</code> é a fonte número um
        de upload que “não chega no PHP”.
      </p>

      <CodeBlock
        language="bash"
        title="upload.html"
        code={`<form action="/upload.php" method="POST" enctype="multipart/form-data">
  <input type="file" name="avatar" accept="image/*" required>
  <button type="submit">Enviar</button>
</form>`}
      />

      <BrowserBlock url="http://localhost:8000/upload.html">
        <form className="space-y-3">
          <div>
            <input type="file" disabled className="text-sm" />
          </div>
          <button
            type="button"
            disabled
            className="px-4 py-2 bg-blue-600 text-white rounded text-sm"
          >
            Enviar
          </button>
        </form>
      </BrowserBlock>

      <h2>$_FILES: o que o PHP te entrega</h2>
      <p>
        Quando o upload chega, o PHP popula o superglobal <code>$_FILES</code>. Ele é um array
        associativo com cinco chaves por arquivo:
      </p>

      <PhpBlock
        filename="ver-files.php"
        code={`<?php
declare(strict_types=1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    exit('Envie um arquivo no formulário');
}

print_r($_FILES);`}
        output={`Array
(
    [avatar] => Array
        (
            [name] => foto.png
            [full_path] => foto.png
            [type] => image/png
            [tmp_name] => /tmp/phpA1b2C3
            [error] => 0
            [size] => 24573
        )
)`}
      />

      <ul>
        <li><code>name</code> — nome original (vem do cliente, <strong>nunca confie</strong>).</li>
        <li><code>type</code> — MIME informado pelo cliente (também <strong>não confie</strong>).</li>
        <li><code>tmp_name</code> — caminho temporário onde o PHP gravou o upload.</li>
        <li><code>error</code> — código <code>UPLOAD_ERR_*</code> (0 = sucesso).</li>
        <li><code>size</code> — tamanho em bytes.</li>
      </ul>

      <AlertBox type="danger" title="O que o cliente manda é apenas DICA">
        Tanto <code>name</code> quanto <code>type</code> vêm do navegador. Um atacante pode
        enviar um <code>.php</code> chamado <code>foto.png</code> com{" "}
        <code>type: image/png</code>. Sua defesa precisa olhar o <strong>conteúdo real</strong>{" "}
        do arquivo — vamos ver com <code>finfo</code> daqui a pouco.
      </AlertBox>

      <h2>O fluxo correto: move_uploaded_file</h2>
      <p>
        O arquivo chega num diretório temporário e o PHP apaga ele no fim do request. Para
        guardar, você usa <code>move_uploaded_file()</code> — não <code>rename()</code>, não{" "}
        <code>copy()</code>. <code>move_uploaded_file</code> verifica que o arquivo realmente
        veio de upload HTTP, evitando truques onde alguém aponta para <code>/etc/passwd</code>.
      </p>

      <PhpBlock
        filename="upload-basico.php"
        code={`<?php
declare(strict_types=1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    exit('POST only');
}

if (!isset($_FILES['avatar']) || $_FILES['avatar']['error'] !== UPLOAD_ERR_OK) {
    http_response_code(400);
    exit('Erro no upload');
}

$destino = __DIR__ . '/uploads/' . bin2hex(random_bytes(16)) . '.png';

if (!move_uploaded_file($_FILES['avatar']['tmp_name'], $destino)) {
    http_response_code(500);
    exit('Falha ao salvar');
}

echo "Salvo em: " . basename($destino) . PHP_EOL;`}
        output={`Salvo em: 9f3a2b1c8d4e7f6a0b1c2d3e4f5a6b7c.png`}
      />

      <AlertBox type="success" title="Por que random_bytes para nome?">
        Usar o <code>name</code> original deixa você vulnerável a path traversal
        (<code>../../etc/passwd</code>) e colisão (dois usuários enviando “foto.png”). Um nome
        aleatório resolve os dois problemas de uma vez.
      </AlertBox>

      <h2>Decodificando os erros</h2>
      <p>
        Quando o upload falha, o código em <code>$_FILES['x']['error']</code> te diz por quê.
        Vale ter um <code>match</code> à mão:
      </p>

      <PhpBlock
        filename="erros-upload.php"
        code={`<?php
declare(strict_types=1);

function descreverErro(int $code): string {
    return match($code) {
        UPLOAD_ERR_OK         => 'Sucesso',
        UPLOAD_ERR_INI_SIZE   => 'Maior que upload_max_filesize do php.ini',
        UPLOAD_ERR_FORM_SIZE  => 'Maior que MAX_FILE_SIZE do formulário',
        UPLOAD_ERR_PARTIAL    => 'Upload incompleto',
        UPLOAD_ERR_NO_FILE    => 'Nenhum arquivo enviado',
        UPLOAD_ERR_NO_TMP_DIR => 'Sem pasta temporária no servidor',
        UPLOAD_ERR_CANT_WRITE => 'Falha ao gravar no disco',
        UPLOAD_ERR_EXTENSION  => 'Bloqueado por extensão PHP',
        default               => "Erro desconhecido ({$code})",
    };
}

echo descreverErro(UPLOAD_ERR_INI_SIZE) . PHP_EOL;
echo descreverErro(UPLOAD_ERR_NO_FILE) . PHP_EOL;`}
        output={`Maior que upload_max_filesize do php.ini
Nenhum arquivo enviado`}
      />

      <h2>Validando o MIME real com finfo</h2>
      <p>
        A extensão <code>fileinfo</code> (vem ligada por padrão) lê os primeiros bytes do
        arquivo e identifica o tipo de verdade — independente do que o cliente disse:
      </p>

      <PhpBlock
        filename="upload-validado.php"
        code={`<?php
declare(strict_types=1);

const MIMES_PERMITIDOS = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_BYTES = 2 * 1024 * 1024; // 2 MB

if (($_FILES['foto']['error'] ?? UPLOAD_ERR_NO_FILE) !== UPLOAD_ERR_OK) {
    http_response_code(400);
    exit('Sem arquivo válido');
}

$arquivo = $_FILES['foto'];

// 1. Tamanho
if ($arquivo['size'] > MAX_BYTES) {
    http_response_code(413);
    exit('Arquivo maior que 2 MB');
}

// 2. MIME REAL (não o do cliente)
$finfo = new finfo(FILEINFO_MIME_TYPE);
$mime = $finfo->file($arquivo['tmp_name']);

if (!in_array($mime, MIMES_PERMITIDOS, true)) {
    http_response_code(415);
    exit("Tipo {$mime} não permitido");
}

// 3. Extensão derivada do MIME real
$ext = match($mime) {
    'image/jpeg' => 'jpg',
    'image/png'  => 'png',
    'image/webp' => 'webp',
};

$nome = bin2hex(random_bytes(16)) . '.' . $ext;
$destino = __DIR__ . '/uploads/' . $nome;

if (!move_uploaded_file($arquivo['tmp_name'], $destino)) {
    http_response_code(500);
    exit('Falha ao mover');
}

echo "OK: {$nome} ({$mime})" . PHP_EOL;`}
        output={`OK: 7f3a2b1c8d4e7f6a0b1c2d3e4f5a6b7c.png (image/png)`}
      />

      <h2>Múltiplos arquivos no mesmo input</h2>
      <p>
        Adicione <code>multiple</code> no input e use a notação <code>name=&quot;fotos[]&quot;</code>.
        O <code>$_FILES</code> chega com estrutura diferente — paralela, não associativa por
        índice:
      </p>

      <CodeBlock
        language="bash"
        title="multi.html"
        code={`<input type="file" name="fotos[]" multiple>`}
      />

      <PhpBlock
        filename="multi-upload.php"
        code={`<?php
declare(strict_types=1);

if (empty($_FILES['fotos']['name'][0])) {
    exit('Selecione pelo menos um arquivo');
}

$total = count($_FILES['fotos']['name']);

for ($i = 0; $i < $total; $i++) {
    $erro = $_FILES['fotos']['error'][$i];

    if ($erro !== UPLOAD_ERR_OK) {
        echo "[{$i}] erro {$erro}, pulando" . PHP_EOL;
        continue;
    }

    $tmp     = $_FILES['fotos']['tmp_name'][$i];
    $tamanho = $_FILES['fotos']['size'][$i];
    $original = $_FILES['fotos']['name'][$i];
    $nome    = bin2hex(random_bytes(8)) . '.bin';

    move_uploaded_file($tmp, __DIR__ . '/uploads/' . $nome);

    echo "[{$i}] {$original} ({$tamanho} bytes) -> {$nome}" . PHP_EOL;
}`}
        output={`[0] foto1.jpg (84231 bytes) -> a1b2c3d4e5f60708.bin
[1] foto2.png (12389 bytes) -> 9f8e7d6c5b4a3210.bin
[2] foto3.webp (45122 bytes) -> 1122334455667788.bin`}
      />

      <AlertBox type="info" title="Estrutura paralela: a parte estranha">
        Em vez de <code>$_FILES['fotos'][0]['name']</code>, vem{" "}
        <code>$_FILES['fotos']['name'][0]</code>. Para algo mais saudável, considere o pacote{" "}
        <strong>laminas/laminas-diactoros</strong> (PSR-7) ou Symfony HttpFoundation, que
        normalizam isso para você.
      </AlertBox>

      <h2>Os limites do php.ini</h2>
      <p>
        Não adianta validar 50 MB no PHP se o servidor rejeita antes mesmo do script rodar.
        Quatro diretivas controlam o jogo:
      </p>

      <CodeBlock
        language="ini"
        title="php.ini"
        code={`; Tamanho máximo por arquivo enviado
upload_max_filesize = 10M

; Tamanho máximo do POST inteiro (precisa ser maior que upload_max_filesize)
post_max_size = 12M

; Quantos arquivos no mesmo POST
max_file_uploads = 20

; Memória máxima do script
memory_limit = 128M`}
      />

      <AlertBox type="warning" title="A regra de ouro">
        <code>post_max_size</code> deve ser <strong>maior</strong> que{" "}
        <code>upload_max_filesize</code> (porque o POST inclui o arquivo + outros campos), e{" "}
        <code>memory_limit</code> deve ser maior que <code>post_max_size</code>. Se essa cadeia
        quebrar, uploads grandes falham silenciosamente.
      </AlertBox>

      <h2>Path traversal: a vulnerabilidade clássica</h2>
      <p>
        Imagine que você usa o nome original e o usuário envia algo chamado{" "}
        <code>../../var/www/html/shell.php</code>. Sem proteção, você acabou de gravar um
        webshell na raiz do site. Defesa em camadas:
      </p>

      <PhpBlock
        filename="defesa-traversal.php"
        code={`<?php
declare(strict_types=1);

const PASTA_BASE = '/var/app/uploads/';

function caminhoSeguro(string $nomeOriginal): string {
    // 1. Tira diretórios do nome (mantém só basename)
    $nome = basename($nomeOriginal);

    // 2. Remove tudo que não for letra/número/ponto/traço
    $nome = preg_replace('/[^A-Za-z0-9._-]/', '_', $nome);

    // 3. Bloqueia extensões executáveis
    $extensoesPerigosas = ['php', 'phtml', 'phar', 'sh', 'exe', 'js', 'html'];
    $ext = strtolower(pathinfo($nome, PATHINFO_EXTENSION));
    if (in_array($ext, $extensoesPerigosas, true)) {
        throw new RuntimeException("Extensão proibida: .{$ext}");
    }

    // 4. Resolve e confirma que o caminho final está dentro da PASTA_BASE
    $destino = PASTA_BASE . $nome;
    $real = realpath(dirname($destino));

    if ($real === false || !str_starts_with($real . '/', PASTA_BASE)) {
        throw new RuntimeException('Caminho fora da pasta permitida');
    }

    return $destino;
}

echo caminhoSeguro('foto bonita.jpg') . PHP_EOL;
// caminhoSeguro('../../etc/passwd'); -> seria '/var/app/uploads/passwd' (basename já cortou)
// caminhoSeguro('shell.php');         -> RuntimeException`}
        output={`/var/app/uploads/foto_bonita.jpg`}
      />

      <h2>Resposta visível no navegador</h2>
      <BrowserBlock url="http://localhost:8000/upload-validado.php">
        <div className="text-green-700 font-medium">
          ✓ Upload concluído
        </div>
        <div className="mt-2 text-sm text-gray-700">
          Arquivo: <code>7f3a2b1c8d4e7f6a.png</code>
        </div>
        <div className="text-sm text-gray-700">
          Tipo: <code>image/png</code>
        </div>
      </BrowserBlock>

      <h2>Checklist de produção</h2>
      <AlertBox type="success" title="Antes de subir para produção">
        <ol className="list-decimal ml-5 mt-1 space-y-1">
          <li>Validar <code>error</code>, <code>size</code> e MIME real com <code>finfo</code>.</li>
          <li>Renomear sempre para algo aleatório (<code>random_bytes</code>).</li>
          <li>Salvar fora do <code>document_root</code> e servir via script.</li>
          <li>Configurar <code>upload_max_filesize</code> e <code>post_max_size</code>.</li>
          <li>Bloquear execução de PHP na pasta de uploads (Nginx/Apache).</li>
          <li>Para projetos sérios, usar <strong>league/flysystem</strong> e mandar para S3.</li>
        </ol>
      </AlertBox>

      <p>
        Você já consegue receber e validar uploads sem virar tutorial de invasão. No próximo
        capítulo a gente troca de pasta: vamos para <strong>SPL: estruturas de dados</strong>{" "}
        (pilhas, filas, prioridade) e descobrir quando vale mais que <code>array</code>.
      </p>
    </PageContainer>
  );
}
