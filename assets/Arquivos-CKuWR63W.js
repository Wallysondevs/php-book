import{j as e}from"./index-B5-q-eol.js";import{P as i,A as s,a as o}from"./AlertBox-CVbFLZEd.js";import{T as a}from"./TerminalBlock-6fqVIX2R.js";function t(){return e.jsxs(i,{title:"Lendo e escrevendo arquivos",subtitle:"Do atalho preguiçoso (e poderoso) com file_get_contents até o controle fino com fopen, locking e leitura linha-a-linha sem estourar a memória.",difficulty:"intermediario",timeToRead:"12 min",category:"Arquivos & I/O",children:[e.jsx(s,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"file_get_contents / file_put_contents"})," "," — "," ","leitura/escrita rápida em uma chamada."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"fopen/fread/fwrite"})," "," — "," ","controle granular com handle."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"SplFileObject"})," "," — "," ","OO: itera linha a linha."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"flock"})," "," — "," ","lock cooperativo entre processos."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"realpath"})," "," — "," ","resolve .., symlinks; null se não existe."]})]}),e.jsx("h2",{children:"O problema: você precisa ler um arquivo. E daí?"}),e.jsxs("p",{children:["Em quase todo projeto real, mais cedo ou mais tarde, surge a necessidade de ler ou gravar arquivos: um ",e.jsx("code",{children:".env"}),", um ",e.jsx("code",{children:"config.json"}),", um log, um CSV gigantesco. PHP tem duas famílias de funções para isso — as ",e.jsx("strong",{children:"atalho"})," (uma chamada e pronto) e as ",e.jsx("strong",{children:"baseadas em handle"})," (mais verbosas, porém com controle total). Vamos do mais fácil para o mais sério."]}),e.jsx("h2",{children:"O atalho: file_get_contents e file_put_contents"}),e.jsx("p",{children:"Para 80% dos casos do dia-a-dia, esse par resolve. Você passa o caminho e recebe a string inteira (ou grava a string inteira). É simples assim."}),e.jsx(o,{filename:"ler-config.php",code:`<?php
declare(strict_types=1);

$json = file_get_contents(__DIR__ . '/config.json');

if ($json === false) {
    throw new RuntimeException('Não consegui abrir config.json');
}

$config = json_decode($json, associative: true, flags: JSON_THROW_ON_ERROR);

echo "App: {$config['app']}" . PHP_EOL;
echo "Versão: {$config['versao']}" . PHP_EOL;`,output:`App: php-book
Versão: 1.0`}),e.jsxs(s,{type:"warning",title:"Sempre cheque o retorno",children:[e.jsx("code",{children:"file_get_contents()"})," retorna ",e.jsx("code",{children:"false"})," em erro (arquivo inexistente, sem permissão). Em PHP moderno você também pode habilitar exceções com"," ",e.jsx("code",{children:"set_error_handler"}),", mas o ",e.jsx("code",{children:"=== false"})," é o idioma mais usado."]}),e.jsxs("p",{children:["Para gravar, o gêmeo ",e.jsx("code",{children:"file_put_contents()"})," aceita uma string e devolve quantos bytes escreveu. Por padrão ele ",e.jsx("strong",{children:"sobrescreve"})," o arquivo:"]}),e.jsx(o,{filename:"gravar-config.php",code:`<?php
declare(strict_types=1);

$config = [
    'app' => 'php-book',
    'versao' => '1.1',
    'debug' => false,
];

$json = json_encode($config, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR);
$bytes = file_put_contents(__DIR__ . '/config.json', $json);

echo "Escrevi {$bytes} bytes." . PHP_EOL;`,output:"Escrevi 64 bytes."}),e.jsx("h2",{children:"FILE_APPEND: anexar em vez de sobrescrever"}),e.jsxs("p",{children:["O caso clássico é log: você não quer apagar o histórico, quer carimbar mais uma linha no final. Use a flag ",e.jsx("code",{children:"FILE_APPEND"}),":"]}),e.jsx(o,{filename:"log-simples.php",code:`<?php
declare(strict_types=1);

function logar(string $mensagem): void {
    $linha = sprintf("[%s] %s%s", date('Y-m-d H:i:s'), $mensagem, PHP_EOL);
    file_put_contents(__DIR__ . '/app.log', $linha, FILE_APPEND | LOCK_EX);
}

logar('Servidor iniciado');
logar('Usuário 42 fez login');
logar('Pedido #1337 confirmado');

echo file_get_contents(__DIR__ . '/app.log');`,output:`[2025-01-15 10:00:01] Servidor iniciado
[2025-01-15 10:00:01] Usuário 42 fez login
[2025-01-15 10:00:01] Pedido #1337 confirmado`}),e.jsxs(s,{type:"info",title:"LOCK_EX: por que importa",children:["Se dois processos PHP gravarem no mesmo log ",e.jsx("em",{children:"ao mesmo tempo"}),", as linhas podem se misturar (literalmente caracter no meio de outro). ",e.jsx("code",{children:"LOCK_EX"})," pede um lock exclusivo no arquivo durante a escrita — o segundo processo espera. Para logs sérios, prefira ",e.jsx("strong",{children:"Monolog"}),", que já cuida disso."]}),e.jsx("h2",{children:"file(): ler e já voltar como array de linhas"}),e.jsxs("p",{children:["Quando o arquivo é uma lista (e-mails, IPs banidos, IDs), ",e.jsx("code",{children:"file()"})," economiza um ",e.jsx("code",{children:"explode"}),":"]}),e.jsx(o,{filename:"ler-emails.php",code:`<?php
declare(strict_types=1);

$emails = file(__DIR__ . '/lista.txt', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

if ($emails === false) {
    throw new RuntimeException('Falha ao ler lista.txt');
}

echo "Total: " . count($emails) . PHP_EOL;
foreach ($emails as $i => $email) {
    echo ($i + 1) . ". {$email}" . PHP_EOL;
}`,output:`Total: 3
1. ada@example.com
2. linus@example.com
3. grace@example.com`}),e.jsxs("p",{children:["As flags ",e.jsx("code",{children:"FILE_IGNORE_NEW_LINES"})," e ",e.jsx("code",{children:"FILE_SKIP_EMPTY_LINES"})," tiram o"," ",e.jsx("code",{children:"\\n"})," do final de cada linha e ignoram linhas em branco — combinação que você vai querer em 99% dos casos."]}),e.jsx("h2",{children:"O problema do arquivo gigante: fopen + fgets"}),e.jsxs("p",{children:["Tudo funciona lindo até alguém te pedir para processar um CSV de 2 GB. Aí"," ",e.jsx("code",{children:"file_get_contents"})," tenta carregar tudo na memória e seu PHP dá um belo"," ",e.jsx("em",{children:"Allowed memory size exhausted"}),". A solução: abrir um ",e.jsx("strong",{children:"handle"})," e ler linha a linha."]}),e.jsx(o,{filename:"processa-csv.php",code:`<?php
declare(strict_types=1);

$handle = fopen(__DIR__ . '/vendas.csv', 'r');

if ($handle === false) {
    throw new RuntimeException('Não abriu vendas.csv');
}

$total = 0.0;
$linhas = 0;

// Pula o cabeçalho
fgets($handle);

while (($linha = fgets($handle)) !== false) {
    [$id, $produto, $valor] = str_getcsv($linha);
    $total += (float) $valor;
    $linhas++;
}

fclose($handle);

echo "Linhas processadas: {$linhas}" . PHP_EOL;
echo "Total vendido: R$ " . number_format($total, 2, ',', '.') . PHP_EOL;`,output:`Linhas processadas: 50000
Total vendido: R$ 1.247.832,55`}),e.jsxs(s,{type:"success",title:"Por que fgets é mágico",children:[e.jsx("code",{children:"fgets()"})," lê ",e.jsx("strong",{children:"uma linha por vez"})," direto do disco. A memória usada é constante, não importa se o arquivo tem 1 KB ou 1 TB. Sempre que ouvir “processar arquivo grande”, pense ",e.jsx("code",{children:"fopen"})," + loop."]}),e.jsx("h2",{children:"Os modos de fopen"}),e.jsxs("p",{children:["O segundo argumento de ",e.jsx("code",{children:"fopen()"})," diz ",e.jsx("em",{children:"como"})," você quer abrir o arquivo. Os principais:"]}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"'r'"})," — leitura, ponteiro no início. Falha se não existir."]}),e.jsxs("li",{children:[e.jsx("code",{children:"'w'"})," — escrita, ",e.jsx("strong",{children:"trunca"})," o arquivo (apaga conteúdo) ou cria."]}),e.jsxs("li",{children:[e.jsx("code",{children:"'a'"})," — escrita, ponteiro no final (append). Cria se não existir."]}),e.jsxs("li",{children:[e.jsx("code",{children:"'x'"})," — escrita, falha se já existir (útil para evitar sobrescrita)."]}),e.jsxs("li",{children:[e.jsx("code",{children:"'r+'"}),", ",e.jsx("code",{children:"'w+'"}),", ",e.jsx("code",{children:"'a+'"})," — leitura E escrita."]}),e.jsxs("li",{children:["Adicione ",e.jsx("code",{children:"'b'"})," (ex: ",e.jsx("code",{children:"'rb'"}),") para arquivos binários no Windows."]})]}),e.jsx("h2",{children:"Escrevendo com fwrite e travando o arquivo"}),e.jsxs("p",{children:["Quando você grava em loop, fica mais explícito ter o handle aberto e usar"," ",e.jsx("code",{children:"flock()"})," para bloquear:"]}),e.jsx(o,{filename:"contador-acessos.php",code:`<?php
declare(strict_types=1);

$arquivo = __DIR__ . '/acessos.txt';
$handle = fopen($arquivo, 'c+'); // c+ = leitura/escrita, não trunca, cria se não existir

if ($handle === false) {
    throw new RuntimeException('Falha ao abrir contador');
}

if (!flock($handle, LOCK_EX)) {
    fclose($handle);
    throw new RuntimeException('Não consegui o lock');
}

$conteudo = stream_get_contents($handle);
$atual = (int) ($conteudo ?: '0');
$novo  = $atual + 1;

ftruncate($handle, 0);   // zera o arquivo
rewind($handle);          // ponteiro no início
fwrite($handle, (string) $novo);
fflush($handle);          // garante escrita no disco

flock($handle, LOCK_UN);
fclose($handle);

echo "Acessos: {$novo}" . PHP_EOL;`,output:"Acessos: 1"}),e.jsxs(s,{type:"warning",title:"Sempre feche o que você abriu",children:["Cada ",e.jsx("code",{children:"fopen()"})," consome um ",e.jsx("em",{children:"file descriptor"})," do sistema. Esquecer"," ",e.jsx("code",{children:"fclose()"})," em loops longos é receita para ",e.jsx("em",{children:"Too many open files"}),". PHP fecha automaticamente no fim do script, mas em CLI longo (workers, daemons) isso vira problema rápido."]}),e.jsx("h2",{children:"Lendo só um pedaço com fread"}),e.jsxs("p",{children:["Para pegar bytes específicos (cabeçalho de imagem, magic number, primeiros KB de um upload), ",e.jsx("code",{children:"fread()"})," aceita o tamanho:"]}),e.jsx(o,{filename:"magic-bytes.php",code:`<?php
declare(strict_types=1);

$handle = fopen(__DIR__ . '/foto.png', 'rb');
$bytes = fread($handle, 8);
fclose($handle);

// PNG sempre começa com: 89 50 4E 47 0D 0A 1A 0A
$hex = bin2hex($bytes);
echo "Primeiros 8 bytes: {$hex}" . PHP_EOL;
echo str_starts_with($hex, '89504e47') ? 'É PNG ✓' : 'Não é PNG';`,output:`Primeiros 8 bytes: 89504e470d0a1a0a
É PNG ✓`}),e.jsx("h2",{children:"Verificações antes de mexer"}),e.jsx("p",{children:"Sempre que o caminho vier de fora (usuário, banco, env), valide:"}),e.jsx(o,{filename:"seguro.php",code:`<?php
declare(strict_types=1);

function lerSeguro(string $caminho): string {
    if (!file_exists($caminho)) {
        throw new RuntimeException("Arquivo não existe: {$caminho}");
    }
    if (!is_readable($caminho)) {
        throw new RuntimeException("Sem permissão de leitura: {$caminho}");
    }
    if (!is_file($caminho)) {
        throw new RuntimeException("Não é arquivo (talvez diretório): {$caminho}");
    }

    $real = realpath($caminho);
    if ($real === false || !str_starts_with($real, '/var/dados/')) {
        throw new RuntimeException('Caminho fora da pasta permitida');
    }

    return file_get_contents($real);
}

echo lerSeguro('/var/dados/relatorio.txt');`,output:"Relatório do mês: tudo certo!"}),e.jsxs("p",{children:["O ",e.jsx("code",{children:"realpath()"})," resolve ",e.jsx("code",{children:".."}),", links simbólicos e caminhos relativos — fundamental para evitar ",e.jsx("em",{children:"path traversal"}),", que vamos detalhar no capítulo de uploads."]}),e.jsx("h2",{children:"Rodando os exemplos"}),e.jsx(a,{user:"dev",host:"php",cwd:"~/projetos/io",command:"php processa-csv.php",output:`Linhas processadas: 50000
Total vendido: R$ 1.247.832,55`}),e.jsxs("p",{children:["Você já tem o essencial: ",e.jsx("strong",{children:"file_get/put_contents"})," para a maioria, e"," ",e.jsx("strong",{children:"fopen/fgets/fwrite"})," quando precisa de controle. No próximo capítulo a gente sai do arquivo único e atravessa ",e.jsx("strong",{children:"diretórios"})," inteiros com"," ",e.jsx("code",{children:"scandir"}),", ",e.jsx("code",{children:"glob"})," e os iteradores recursivos da SPL."]})]})}export{t as default};
