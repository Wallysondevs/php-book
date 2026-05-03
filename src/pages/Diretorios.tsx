import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Diretorios() {
  return (
    <PageContainer
      title="Diretórios e SPL FileInfo"
      subtitle="Listar, criar, percorrer e buscar arquivos em árvores inteiras — do clássico scandir até os iteradores recursivos da SPL que substituem find no shell."
      difficulty="intermediario"
      timeToRead="12 min"
      category="Arquivos & I/O"
    >
      <AlertBox type="info" title="Pré-requisitos">
          <p>Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP.</p>
        </AlertBox>
        <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"scandir / glob"}</strong> {' — '} {"lista arquivos; glob aceita padrões."}
          </li>
        <li>
            <strong>{"mkdir/rmdir"}</strong> {' — '} {"cria/remove; mkdir tem flag recursiva."}
          </li>
        <li>
            <strong>{"DirectoryIterator"}</strong> {' — '} {"OO; melhor para iteração."}
          </li>
        <li>
            <strong>{"RecursiveDirectoryIterator"}</strong> {' — '} {"desce subpastas."}
          </li>
        <li>
            <strong>{"Path traversal"}</strong> {' — '} {"sanitize input — nunca confie em ../ vindo de fora."}
          </li>
        </ul>
          <h2>O problema: listar o que tem numa pasta</h2>
      <p>
        A função mais simples para isso é <code>scandir()</code>. Ela devolve um array com todos
        os nomes de arquivos e subpastas dentro do caminho informado — incluindo os famosos{" "}
        <code>.</code> e <code>..</code> que você quase sempre quer descartar.
      </p>

      <PhpBlock
        filename="listar.php"
        code={`<?php
declare(strict_types=1);

$itens = scandir(__DIR__ . '/uploads');

if ($itens === false) {
    throw new RuntimeException('Pasta não pôde ser lida');
}

// Tira . e ..
$itens = array_diff($itens, ['.', '..']);

foreach ($itens as $nome) {
    echo $nome . PHP_EOL;
}`}
        output={`avatar.png
contrato.pdf
foto-perfil.jpg
relatorio.csv`}
      />

      <h2>glob: pattern matching como no shell</h2>
      <p>
        Quando você só quer arquivos com certa extensão ou prefixo, <code>glob()</code> é
        imbatível. Ele aceita os mesmos curingas do bash (<code>*</code>, <code>?</code>,{" "}
        <code>[abc]</code>) e devolve um array com os caminhos completos:
      </p>

      <PhpBlock
        filename="buscar-imagens.php"
        code={`<?php
declare(strict_types=1);

$imagens = glob(__DIR__ . '/uploads/*.{jpg,jpeg,png,webp}', GLOB_BRACE);

echo "Encontrei " . count($imagens) . " imagens:" . PHP_EOL;
foreach ($imagens as $caminho) {
    $tamanho = filesize($caminho);
    printf("- %s (%s KB)%s", basename($caminho), number_format($tamanho / 1024, 1), PHP_EOL);
}`}
        output={`Encontrei 3 imagens:
- avatar.png (12.3 KB)
- foto-perfil.jpg (245.7 KB)
- banner.webp (88.1 KB)`}
      />

      <AlertBox type="info" title="GLOB_BRACE é mágico">
        A flag <code>GLOB_BRACE</code> ativa <code>{`{jpg,png}`}</code>, perfeita para múltiplas
        extensões. Sem ela, você teria que chamar <code>glob()</code> várias vezes e dar{" "}
        <code>array_merge</code>.
      </AlertBox>

      <h2>opendir / readdir: streaming de diretórios grandes</h2>
      <p>
        <code>scandir()</code> e <code>glob()</code> carregam tudo na memória. Se a pasta tem 500
        mil arquivos, isso dói. A alternativa é abrir um handle de diretório e ler
        item-a-item — o equivalente do <code>fopen</code>/<code>fgets</code> do capítulo
        anterior:
      </p>

      <PhpBlock
        filename="streaming.php"
        code={`<?php
declare(strict_types=1);

$dh = opendir(__DIR__ . '/cache');

if ($dh === false) {
    throw new RuntimeException('Falha ao abrir cache/');
}

$total = 0;
while (($nome = readdir($dh)) !== false) {
    if ($nome === '.' || $nome === '..') continue;
    $total++;
}
closedir($dh);

echo "Itens na pasta: {$total}" . PHP_EOL;`}
        output={`Itens na pasta: 487213`}
      />

      <h2>Criando e removendo pastas</h2>
      <p>
        <code>mkdir()</code> aceita um terceiro parâmetro <code>recursive: true</code> que
        cria toda a hierarquia de uma vez — equivalente ao <code>mkdir -p</code> do shell:
      </p>

      <PhpBlock
        filename="criar-arvore.php"
        code={`<?php
declare(strict_types=1);

$caminho = __DIR__ . '/storage/2025/01/uploads';

if (!is_dir($caminho)) {
    if (!mkdir($caminho, mode: 0755, recursive: true)) {
        throw new RuntimeException("Não consegui criar {$caminho}");
    }
    echo "Criado: {$caminho}" . PHP_EOL;
} else {
    echo "Já existia." . PHP_EOL;
}

// Remover só funciona em pasta VAZIA
@rmdir($caminho);
echo "Removida (se vazia)." . PHP_EOL;`}
        output={`Criado: /var/app/storage/2025/01/uploads
Removida (se vazia).`}
      />

      <AlertBox type="warning" title="rmdir só apaga vazio">
        Para apagar uma árvore inteira (pasta + tudo dentro) você precisa percorrer
        recursivamente. Veja o exemplo de <code>RecursiveDirectoryIterator</code> mais à frente
        — ou use <strong>symfony/filesystem</strong> que tem <code>$fs-&gt;remove($caminho)</code>{" "}
        pronto.
      </AlertBox>

      <h2>SplFileInfo: o canivete suíço de cada arquivo</h2>
      <p>
        Em vez de chamar <code>filesize()</code>, <code>filemtime()</code>, <code>pathinfo()</code>{" "}
        separadamente, a SPL te dá <strong>SplFileInfo</strong> — um objeto que conhece tudo
        sobre o arquivo:
      </p>

      <PhpBlock
        filename="fileinfo.php"
        code={`<?php
declare(strict_types=1);

$info = new SplFileInfo(__DIR__ . '/uploads/contrato.pdf');

echo 'Nome:       ' . $info->getFilename() . PHP_EOL;
echo 'Caminho:    ' . $info->getPath() . PHP_EOL;
echo 'Extensão:   ' . $info->getExtension() . PHP_EOL;
echo 'Tamanho:    ' . $info->getSize() . ' bytes' . PHP_EOL;
echo 'Modificado: ' . date('Y-m-d H:i:s', $info->getMTime()) . PHP_EOL;
echo 'Tipo:       ' . $info->getType() . PHP_EOL;
echo 'Legível:    ' . ($info->isReadable() ? 'sim' : 'não') . PHP_EOL;`}
        output={`Nome:       contrato.pdf
Caminho:    /var/app/uploads
Extensão:   pdf
Tamanho:    284732 bytes
Modificado: 2025-01-10 14:22:17
Tipo:       file
Legível:    sim`}
      />

      <h2>SplFileObject: SplFileInfo + iteração de linhas</h2>
      <p>
        Subclasse de <code>SplFileInfo</code> que abre o arquivo e permite iterar como se fosse
        um array de linhas — sem manage de handles:
      </p>

      <PhpBlock
        filename="csv-objeto.php"
        code={`<?php
declare(strict_types=1);

$file = new SplFileObject(__DIR__ . '/vendas.csv', 'r');
$file->setFlags(SplFileObject::READ_CSV | SplFileObject::SKIP_EMPTY | SplFileObject::READ_AHEAD);

$total = 0.0;
foreach ($file as $linha) {
    if ($file->key() === 0) continue; // pula cabeçalho
    [, , $valor] = $linha;
    $total += (float) $valor;
}

echo "Total: R$ " . number_format($total, 2, ',', '.') . PHP_EOL;`}
        output={`Total: R$ 32.481,90`}
      />

      <h2>Buscando recursivo: o substituto de find</h2>
      <p>
        Aqui está a parte que <strong>vale por toda a SPL</strong>: combinar{" "}
        <code>RecursiveDirectoryIterator</code> com <code>RecursiveIteratorIterator</code> para
        atravessar uma árvore inteira de pastas, devolvendo cada arquivo como um{" "}
        <code>SplFileInfo</code>.
      </p>

      <PhpBlock
        filename="buscar-recursivo.php"
        code={`<?php
declare(strict_types=1);

$dir = new RecursiveDirectoryIterator(
    __DIR__ . '/projeto',
    RecursiveDirectoryIterator::SKIP_DOTS,
);
$iterator = new RecursiveIteratorIterator($dir);

$totalLinhas = 0;
$arquivosPhp = 0;

foreach ($iterator as $arquivo) {
    /** @var SplFileInfo $arquivo */
    if ($arquivo->getExtension() !== 'php') continue;

    $arquivosPhp++;
    $totalLinhas += count(file($arquivo->getPathname()));
}

echo "Arquivos PHP: {$arquivosPhp}" . PHP_EOL;
echo "Linhas totais: {$totalLinhas}" . PHP_EOL;`}
        output={`Arquivos PHP: 142
Linhas totais: 18374`}
      />

      <AlertBox type="success" title="Por que isso é lindo">
        Em ~10 linhas você fez o equivalente de <code>find . -name &quot;*.php&quot; | xargs wc -l</code>.
        E ainda é cross-platform: roda igual no Linux, macOS e Windows.
      </AlertBox>

      <h2>Filtrando com RegexIterator</h2>
      <p>
        Em vez do <code>if</code> dentro do loop, você pode encadear um{" "}
        <code>RegexIterator</code> para deixar o iterador só com o que interessa:
      </p>

      <PhpBlock
        filename="filtrar-regex.php"
        code={`<?php
declare(strict_types=1);

$dir = new RecursiveDirectoryIterator(__DIR__ . '/src', RecursiveDirectoryIterator::SKIP_DOTS);
$flat = new RecursiveIteratorIterator($dir);
$apenasTeste = new RegexIterator($flat, '/Test\\.php$/i');

foreach ($apenasTeste as $arquivo) {
    echo $arquivo->getPathname() . PHP_EOL;
}`}
        output={`/var/app/src/User/UserTest.php
/var/app/src/Order/OrderTest.php
/var/app/src/Payment/StripePaymentTest.php`}
      />

      <h2>Apagando uma árvore inteira</h2>
      <p>
        O caso clássico: limpar um cache. A pegadinha é que você precisa apagar de baixo para
        cima (arquivos antes das pastas), e a SPL tem o modo <code>CHILD_FIRST</code> exatamente
        para isso:
      </p>

      <PhpBlock
        filename="limpar-cache.php"
        code={`<?php
declare(strict_types=1);

function apagarRecursivo(string $caminho): void {
    if (!is_dir($caminho)) return;

    $iter = new RecursiveIteratorIterator(
        new RecursiveDirectoryIterator($caminho, RecursiveDirectoryIterator::SKIP_DOTS),
        RecursiveIteratorIterator::CHILD_FIRST,
    );

    foreach ($iter as $arquivo) {
        if ($arquivo->isDir()) {
            rmdir($arquivo->getPathname());
        } else {
            unlink($arquivo->getPathname());
        }
    }
    rmdir($caminho);
}

apagarRecursivo(__DIR__ . '/cache');
echo 'Cache limpo!' . PHP_EOL;`}
        output={`Cache limpo!`}
      />

      <h2>Rodando no terminal</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/io"
        command="php buscar-recursivo.php"
        output={`Arquivos PHP: 142
Linhas totais: 18374`}
      />

      <AlertBox type="info" title="Quando usar Symfony Finder">
        Para casos mais sofisticados (filtro por data, profundidade, exclusão de
        <code>vendor/</code>), o pacote <strong>symfony/finder</strong> oferece uma API fluente
        em cima desses iteradores. Vale para qualquer projeto não-trivial.
      </AlertBox>

      <p>
        Você agora consegue listar, criar, varrer e podar diretórios inteiros. No próximo
        capítulo a gente desce mais um nível: <strong>streams e wrappers</strong>, onde
        descobrimos que <code>file://</code>, <code>http://</code> e até a memória são todos
        “arquivos” pro PHP.
      </p>
    </PageContainer>
  );
}
