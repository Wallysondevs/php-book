import{j as e}from"./index-B5-q-eol.js";import{P as a,A as o,a as r}from"./AlertBox-CVbFLZEd.js";import{T as i}from"./TerminalBlock-6fqVIX2R.js";function n(){return e.jsxs(a,{title:"Diretórios e SPL FileInfo",subtitle:"Listar, criar, percorrer e buscar arquivos em árvores inteiras — do clássico scandir até os iteradores recursivos da SPL que substituem find no shell.",difficulty:"intermediario",timeToRead:"12 min",category:"Arquivos & I/O",children:[e.jsx(o,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"scandir / glob"})," "," — "," ","lista arquivos; glob aceita padrões."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"mkdir/rmdir"})," "," — "," ","cria/remove; mkdir tem flag recursiva."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"DirectoryIterator"})," "," — "," ","OO; melhor para iteração."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"RecursiveDirectoryIterator"})," "," — "," ","desce subpastas."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Path traversal"})," "," — "," ","sanitize input — nunca confie em ../ vindo de fora."]})]}),e.jsx("h2",{children:"O problema: listar o que tem numa pasta"}),e.jsxs("p",{children:["A função mais simples para isso é ",e.jsx("code",{children:"scandir()"}),". Ela devolve um array com todos os nomes de arquivos e subpastas dentro do caminho informado — incluindo os famosos"," ",e.jsx("code",{children:"."})," e ",e.jsx("code",{children:".."})," que você quase sempre quer descartar."]}),e.jsx(r,{filename:"listar.php",code:`<?php
declare(strict_types=1);

$itens = scandir(__DIR__ . '/uploads');

if ($itens === false) {
    throw new RuntimeException('Pasta não pôde ser lida');
}

// Tira . e ..
$itens = array_diff($itens, ['.', '..']);

foreach ($itens as $nome) {
    echo $nome . PHP_EOL;
}`,output:`avatar.png
contrato.pdf
foto-perfil.jpg
relatorio.csv`}),e.jsx("h2",{children:"glob: pattern matching como no shell"}),e.jsxs("p",{children:["Quando você só quer arquivos com certa extensão ou prefixo, ",e.jsx("code",{children:"glob()"})," é imbatível. Ele aceita os mesmos curingas do bash (",e.jsx("code",{children:"*"}),", ",e.jsx("code",{children:"?"}),","," ",e.jsx("code",{children:"[abc]"}),") e devolve um array com os caminhos completos:"]}),e.jsx(r,{filename:"buscar-imagens.php",code:`<?php
declare(strict_types=1);

$imagens = glob(__DIR__ . '/uploads/*.{jpg,jpeg,png,webp}', GLOB_BRACE);

echo "Encontrei " . count($imagens) . " imagens:" . PHP_EOL;
foreach ($imagens as $caminho) {
    $tamanho = filesize($caminho);
    printf("- %s (%s KB)%s", basename($caminho), number_format($tamanho / 1024, 1), PHP_EOL);
}`,output:`Encontrei 3 imagens:
- avatar.png (12.3 KB)
- foto-perfil.jpg (245.7 KB)
- banner.webp (88.1 KB)`}),e.jsxs(o,{type:"info",title:"GLOB_BRACE é mágico",children:["A flag ",e.jsx("code",{children:"GLOB_BRACE"})," ativa ",e.jsx("code",{children:"{jpg,png}"}),", perfeita para múltiplas extensões. Sem ela, você teria que chamar ",e.jsx("code",{children:"glob()"})," várias vezes e dar"," ",e.jsx("code",{children:"array_merge"}),"."]}),e.jsx("h2",{children:"opendir / readdir: streaming de diretórios grandes"}),e.jsxs("p",{children:[e.jsx("code",{children:"scandir()"})," e ",e.jsx("code",{children:"glob()"})," carregam tudo na memória. Se a pasta tem 500 mil arquivos, isso dói. A alternativa é abrir um handle de diretório e ler item-a-item — o equivalente do ",e.jsx("code",{children:"fopen"}),"/",e.jsx("code",{children:"fgets"})," do capítulo anterior:"]}),e.jsx(r,{filename:"streaming.php",code:`<?php
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

echo "Itens na pasta: {$total}" . PHP_EOL;`,output:"Itens na pasta: 487213"}),e.jsx("h2",{children:"Criando e removendo pastas"}),e.jsxs("p",{children:[e.jsx("code",{children:"mkdir()"})," aceita um terceiro parâmetro ",e.jsx("code",{children:"recursive: true"})," que cria toda a hierarquia de uma vez — equivalente ao ",e.jsx("code",{children:"mkdir -p"})," do shell:"]}),e.jsx(r,{filename:"criar-arvore.php",code:`<?php
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
echo "Removida (se vazia)." . PHP_EOL;`,output:`Criado: /var/app/storage/2025/01/uploads
Removida (se vazia).`}),e.jsxs(o,{type:"warning",title:"rmdir só apaga vazio",children:["Para apagar uma árvore inteira (pasta + tudo dentro) você precisa percorrer recursivamente. Veja o exemplo de ",e.jsx("code",{children:"RecursiveDirectoryIterator"})," mais à frente — ou use ",e.jsx("strong",{children:"symfony/filesystem"})," que tem ",e.jsx("code",{children:"$fs->remove($caminho)"})," ","pronto."]}),e.jsx("h2",{children:"SplFileInfo: o canivete suíço de cada arquivo"}),e.jsxs("p",{children:["Em vez de chamar ",e.jsx("code",{children:"filesize()"}),", ",e.jsx("code",{children:"filemtime()"}),", ",e.jsx("code",{children:"pathinfo()"})," ","separadamente, a SPL te dá ",e.jsx("strong",{children:"SplFileInfo"})," — um objeto que conhece tudo sobre o arquivo:"]}),e.jsx(r,{filename:"fileinfo.php",code:`<?php
declare(strict_types=1);

$info = new SplFileInfo(__DIR__ . '/uploads/contrato.pdf');

echo 'Nome:       ' . $info->getFilename() . PHP_EOL;
echo 'Caminho:    ' . $info->getPath() . PHP_EOL;
echo 'Extensão:   ' . $info->getExtension() . PHP_EOL;
echo 'Tamanho:    ' . $info->getSize() . ' bytes' . PHP_EOL;
echo 'Modificado: ' . date('Y-m-d H:i:s', $info->getMTime()) . PHP_EOL;
echo 'Tipo:       ' . $info->getType() . PHP_EOL;
echo 'Legível:    ' . ($info->isReadable() ? 'sim' : 'não') . PHP_EOL;`,output:`Nome:       contrato.pdf
Caminho:    /var/app/uploads
Extensão:   pdf
Tamanho:    284732 bytes
Modificado: 2025-01-10 14:22:17
Tipo:       file
Legível:    sim`}),e.jsx("h2",{children:"SplFileObject: SplFileInfo + iteração de linhas"}),e.jsxs("p",{children:["Subclasse de ",e.jsx("code",{children:"SplFileInfo"})," que abre o arquivo e permite iterar como se fosse um array de linhas — sem manage de handles:"]}),e.jsx(r,{filename:"csv-objeto.php",code:`<?php
declare(strict_types=1);

$file = new SplFileObject(__DIR__ . '/vendas.csv', 'r');
$file->setFlags(SplFileObject::READ_CSV | SplFileObject::SKIP_EMPTY | SplFileObject::READ_AHEAD);

$total = 0.0;
foreach ($file as $linha) {
    if ($file->key() === 0) continue; // pula cabeçalho
    [, , $valor] = $linha;
    $total += (float) $valor;
}

echo "Total: R$ " . number_format($total, 2, ',', '.') . PHP_EOL;`,output:"Total: R$ 32.481,90"}),e.jsx("h2",{children:"Buscando recursivo: o substituto de find"}),e.jsxs("p",{children:["Aqui está a parte que ",e.jsx("strong",{children:"vale por toda a SPL"}),": combinar"," ",e.jsx("code",{children:"RecursiveDirectoryIterator"})," com ",e.jsx("code",{children:"RecursiveIteratorIterator"})," para atravessar uma árvore inteira de pastas, devolvendo cada arquivo como um"," ",e.jsx("code",{children:"SplFileInfo"}),"."]}),e.jsx(r,{filename:"buscar-recursivo.php",code:`<?php
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
echo "Linhas totais: {$totalLinhas}" . PHP_EOL;`,output:`Arquivos PHP: 142
Linhas totais: 18374`}),e.jsxs(o,{type:"success",title:"Por que isso é lindo",children:["Em ~10 linhas você fez o equivalente de ",e.jsx("code",{children:'find . -name "*.php" | xargs wc -l'}),". E ainda é cross-platform: roda igual no Linux, macOS e Windows."]}),e.jsx("h2",{children:"Filtrando com RegexIterator"}),e.jsxs("p",{children:["Em vez do ",e.jsx("code",{children:"if"})," dentro do loop, você pode encadear um"," ",e.jsx("code",{children:"RegexIterator"})," para deixar o iterador só com o que interessa:"]}),e.jsx(r,{filename:"filtrar-regex.php",code:`<?php
declare(strict_types=1);

$dir = new RecursiveDirectoryIterator(__DIR__ . '/src', RecursiveDirectoryIterator::SKIP_DOTS);
$flat = new RecursiveIteratorIterator($dir);
$apenasTeste = new RegexIterator($flat, '/Test\\.php$/i');

foreach ($apenasTeste as $arquivo) {
    echo $arquivo->getPathname() . PHP_EOL;
}`,output:`/var/app/src/User/UserTest.php
/var/app/src/Order/OrderTest.php
/var/app/src/Payment/StripePaymentTest.php`}),e.jsx("h2",{children:"Apagando uma árvore inteira"}),e.jsxs("p",{children:["O caso clássico: limpar um cache. A pegadinha é que você precisa apagar de baixo para cima (arquivos antes das pastas), e a SPL tem o modo ",e.jsx("code",{children:"CHILD_FIRST"})," exatamente para isso:"]}),e.jsx(r,{filename:"limpar-cache.php",code:`<?php
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
echo 'Cache limpo!' . PHP_EOL;`,output:"Cache limpo!"}),e.jsx("h2",{children:"Rodando no terminal"}),e.jsx(i,{user:"dev",host:"php",cwd:"~/projetos/io",command:"php buscar-recursivo.php",output:`Arquivos PHP: 142
Linhas totais: 18374`}),e.jsxs(o,{type:"info",title:"Quando usar Symfony Finder",children:["Para casos mais sofisticados (filtro por data, profundidade, exclusão de",e.jsx("code",{children:"vendor/"}),"), o pacote ",e.jsx("strong",{children:"symfony/finder"})," oferece uma API fluente em cima desses iteradores. Vale para qualquer projeto não-trivial."]}),e.jsxs("p",{children:["Você agora consegue listar, criar, varrer e podar diretórios inteiros. No próximo capítulo a gente desce mais um nível: ",e.jsx("strong",{children:"streams e wrappers"}),", onde descobrimos que ",e.jsx("code",{children:"file://"}),", ",e.jsx("code",{children:"http://"})," e até a memória são todos “arquivos” pro PHP."]})]})}export{n as default};
