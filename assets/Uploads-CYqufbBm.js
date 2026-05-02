import{j as e}from"./index-Bb4MiiJL.js";import{P as s,a as o,A as a}from"./AlertBox-BpD-xIsb.js";import{B as r}from"./BrowserBlock-C5ENTT0j.js";import{C as i}from"./CodeBlock-C3V-qEkN.js";function c(){return e.jsxs(s,{title:"Upload de arquivos",subtitle:"Receber arquivos do usuário sem virar manchete de invasão: validação de tipo MIME real, limites do php.ini, defesa contra path traversal e múltiplos uploads.",difficulty:"intermediario",timeToRead:"13 min",category:"Arquivos & I/O",children:[e.jsx("h2",{children:"O ponto de partida: o formulário HTML"}),e.jsxs("p",{children:["O navegador só envia um arquivo se o formulário tiver"," ",e.jsx("code",{children:'enctype="multipart/form-data"'})," e o input for"," ",e.jsx("code",{children:'type="file"'}),". Esquecer o ",e.jsx("code",{children:"enctype"})," é a fonte número um de upload que “não chega no PHP”."]}),e.jsx(i,{language:"bash",title:"upload.html",code:`<form action="/upload.php" method="POST" enctype="multipart/form-data">
  <input type="file" name="avatar" accept="image/*" required>
  <button type="submit">Enviar</button>
</form>`}),e.jsx(r,{url:"http://localhost:8000/upload.html",children:e.jsxs("form",{className:"space-y-3",children:[e.jsx("div",{children:e.jsx("input",{type:"file",disabled:!0,className:"text-sm"})}),e.jsx("button",{type:"button",disabled:!0,className:"px-4 py-2 bg-blue-600 text-white rounded text-sm",children:"Enviar"})]})}),e.jsx("h2",{children:"$_FILES: o que o PHP te entrega"}),e.jsxs("p",{children:["Quando o upload chega, o PHP popula o superglobal ",e.jsx("code",{children:"$_FILES"}),". Ele é um array associativo com cinco chaves por arquivo:"]}),e.jsx(o,{filename:"ver-files.php",code:`<?php
declare(strict_types=1);

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    exit('Envie um arquivo no formulário');
}

print_r($_FILES);`,output:`Array
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
)`}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"name"})," — nome original (vem do cliente, ",e.jsx("strong",{children:"nunca confie"}),")."]}),e.jsxs("li",{children:[e.jsx("code",{children:"type"})," — MIME informado pelo cliente (também ",e.jsx("strong",{children:"não confie"}),")."]}),e.jsxs("li",{children:[e.jsx("code",{children:"tmp_name"})," — caminho temporário onde o PHP gravou o upload."]}),e.jsxs("li",{children:[e.jsx("code",{children:"error"})," — código ",e.jsx("code",{children:"UPLOAD_ERR_*"})," (0 = sucesso)."]}),e.jsxs("li",{children:[e.jsx("code",{children:"size"})," — tamanho em bytes."]})]}),e.jsxs(a,{type:"danger",title:"O que o cliente manda é apenas DICA",children:["Tanto ",e.jsx("code",{children:"name"})," quanto ",e.jsx("code",{children:"type"})," vêm do navegador. Um atacante pode enviar um ",e.jsx("code",{children:".php"})," chamado ",e.jsx("code",{children:"foto.png"})," com"," ",e.jsx("code",{children:"type: image/png"}),". Sua defesa precisa olhar o ",e.jsx("strong",{children:"conteúdo real"})," ","do arquivo — vamos ver com ",e.jsx("code",{children:"finfo"})," daqui a pouco."]}),e.jsx("h2",{children:"O fluxo correto: move_uploaded_file"}),e.jsxs("p",{children:["O arquivo chega num diretório temporário e o PHP apaga ele no fim do request. Para guardar, você usa ",e.jsx("code",{children:"move_uploaded_file()"})," — não ",e.jsx("code",{children:"rename()"}),", não"," ",e.jsx("code",{children:"copy()"}),". ",e.jsx("code",{children:"move_uploaded_file"})," verifica que o arquivo realmente veio de upload HTTP, evitando truques onde alguém aponta para ",e.jsx("code",{children:"/etc/passwd"}),"."]}),e.jsx(o,{filename:"upload-basico.php",code:`<?php
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

echo "Salvo em: " . basename($destino) . PHP_EOL;`,output:"Salvo em: 9f3a2b1c8d4e7f6a0b1c2d3e4f5a6b7c.png"}),e.jsxs(a,{type:"success",title:"Por que random_bytes para nome?",children:["Usar o ",e.jsx("code",{children:"name"})," original deixa você vulnerável a path traversal (",e.jsx("code",{children:"../../etc/passwd"}),") e colisão (dois usuários enviando “foto.png”). Um nome aleatório resolve os dois problemas de uma vez."]}),e.jsx("h2",{children:"Decodificando os erros"}),e.jsxs("p",{children:["Quando o upload falha, o código em ",e.jsx("code",{children:"$_FILES['x']['error']"})," te diz por quê. Vale ter um ",e.jsx("code",{children:"match"})," à mão:"]}),e.jsx(o,{filename:"erros-upload.php",code:`<?php
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
echo descreverErro(UPLOAD_ERR_NO_FILE) . PHP_EOL;`,output:`Maior que upload_max_filesize do php.ini
Nenhum arquivo enviado`}),e.jsx("h2",{children:"Validando o MIME real com finfo"}),e.jsxs("p",{children:["A extensão ",e.jsx("code",{children:"fileinfo"})," (vem ligada por padrão) lê os primeiros bytes do arquivo e identifica o tipo de verdade — independente do que o cliente disse:"]}),e.jsx(o,{filename:"upload-validado.php",code:`<?php
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

echo "OK: {$nome} ({$mime})" . PHP_EOL;`,output:"OK: 7f3a2b1c8d4e7f6a0b1c2d3e4f5a6b7c.png (image/png)"}),e.jsx("h2",{children:"Múltiplos arquivos no mesmo input"}),e.jsxs("p",{children:["Adicione ",e.jsx("code",{children:"multiple"})," no input e use a notação ",e.jsx("code",{children:'name="fotos[]"'}),". O ",e.jsx("code",{children:"$_FILES"})," chega com estrutura diferente — paralela, não associativa por índice:"]}),e.jsx(i,{language:"bash",title:"multi.html",code:'<input type="file" name="fotos[]" multiple>'}),e.jsx(o,{filename:"multi-upload.php",code:`<?php
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
}`,output:`[0] foto1.jpg (84231 bytes) -> a1b2c3d4e5f60708.bin
[1] foto2.png (12389 bytes) -> 9f8e7d6c5b4a3210.bin
[2] foto3.webp (45122 bytes) -> 1122334455667788.bin`}),e.jsxs(a,{type:"info",title:"Estrutura paralela: a parte estranha",children:["Em vez de ",e.jsx("code",{children:"$_FILES['fotos'][0]['name']"}),", vem"," ",e.jsx("code",{children:"$_FILES['fotos']['name'][0]"}),". Para algo mais saudável, considere o pacote"," ",e.jsx("strong",{children:"laminas/laminas-diactoros"})," (PSR-7) ou Symfony HttpFoundation, que normalizam isso para você."]}),e.jsx("h2",{children:"Os limites do php.ini"}),e.jsx("p",{children:"Não adianta validar 50 MB no PHP se o servidor rejeita antes mesmo do script rodar. Quatro diretivas controlam o jogo:"}),e.jsx(i,{language:"ini",title:"php.ini",code:`; Tamanho máximo por arquivo enviado
upload_max_filesize = 10M

; Tamanho máximo do POST inteiro (precisa ser maior que upload_max_filesize)
post_max_size = 12M

; Quantos arquivos no mesmo POST
max_file_uploads = 20

; Memória máxima do script
memory_limit = 128M`}),e.jsxs(a,{type:"warning",title:"A regra de ouro",children:[e.jsx("code",{children:"post_max_size"})," deve ser ",e.jsx("strong",{children:"maior"})," que"," ",e.jsx("code",{children:"upload_max_filesize"})," (porque o POST inclui o arquivo + outros campos), e"," ",e.jsx("code",{children:"memory_limit"})," deve ser maior que ",e.jsx("code",{children:"post_max_size"}),". Se essa cadeia quebrar, uploads grandes falham silenciosamente."]}),e.jsx("h2",{children:"Path traversal: a vulnerabilidade clássica"}),e.jsxs("p",{children:["Imagine que você usa o nome original e o usuário envia algo chamado"," ",e.jsx("code",{children:"../../var/www/html/shell.php"}),". Sem proteção, você acabou de gravar um webshell na raiz do site. Defesa em camadas:"]}),e.jsx(o,{filename:"defesa-traversal.php",code:`<?php
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
// caminhoSeguro('shell.php');         -> RuntimeException`,output:"/var/app/uploads/foto_bonita.jpg"}),e.jsx("h2",{children:"Resposta visível no navegador"}),e.jsxs(r,{url:"http://localhost:8000/upload-validado.php",children:[e.jsx("div",{className:"text-green-700 font-medium",children:"✓ Upload concluído"}),e.jsxs("div",{className:"mt-2 text-sm text-gray-700",children:["Arquivo: ",e.jsx("code",{children:"7f3a2b1c8d4e7f6a.png"})]}),e.jsxs("div",{className:"text-sm text-gray-700",children:["Tipo: ",e.jsx("code",{children:"image/png"})]})]}),e.jsx("h2",{children:"Checklist de produção"}),e.jsx(a,{type:"success",title:"Antes de subir para produção",children:e.jsxs("ol",{className:"list-decimal ml-5 mt-1 space-y-1",children:[e.jsxs("li",{children:["Validar ",e.jsx("code",{children:"error"}),", ",e.jsx("code",{children:"size"})," e MIME real com ",e.jsx("code",{children:"finfo"}),"."]}),e.jsxs("li",{children:["Renomear sempre para algo aleatório (",e.jsx("code",{children:"random_bytes"}),")."]}),e.jsxs("li",{children:["Salvar fora do ",e.jsx("code",{children:"document_root"})," e servir via script."]}),e.jsxs("li",{children:["Configurar ",e.jsx("code",{children:"upload_max_filesize"})," e ",e.jsx("code",{children:"post_max_size"}),"."]}),e.jsx("li",{children:"Bloquear execução de PHP na pasta de uploads (Nginx/Apache)."}),e.jsxs("li",{children:["Para projetos sérios, usar ",e.jsx("strong",{children:"league/flysystem"})," e mandar para S3."]})]})}),e.jsxs("p",{children:["Você já consegue receber e validar uploads sem virar tutorial de invasão. No próximo capítulo a gente troca de pasta: vamos para ",e.jsx("strong",{children:"SPL: estruturas de dados"})," ","(pilhas, filas, prioridade) e descobrir quando vale mais que ",e.jsx("code",{children:"array"}),"."]})]})}export{c as default};
