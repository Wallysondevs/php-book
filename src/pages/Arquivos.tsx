import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Arquivos() {
  return (
    <PageContainer
      title="Lendo e escrevendo arquivos"
      subtitle="Do atalho preguiçoso (e poderoso) com file_get_contents até o controle fino com fopen, locking e leitura linha-a-linha sem estourar a memória."
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
            <strong>{"file_get_contents / file_put_contents"}</strong> {' — '} {"leitura/escrita rápida em uma chamada."}
          </li>
        <li>
            <strong>{"fopen/fread/fwrite"}</strong> {' — '} {"controle granular com handle."}
          </li>
        <li>
            <strong>{"SplFileObject"}</strong> {' — '} {"OO: itera linha a linha."}
          </li>
        <li>
            <strong>{"flock"}</strong> {' — '} {"lock cooperativo entre processos."}
          </li>
        <li>
            <strong>{"realpath"}</strong> {' — '} {"resolve .., symlinks; null se não existe."}
          </li>
        </ul>
          <h2>O problema: você precisa ler um arquivo. E daí?</h2>
      <p>
        Em quase todo projeto real, mais cedo ou mais tarde, surge a necessidade de ler ou
        gravar arquivos: um <code>.env</code>, um <code>config.json</code>, um log, um CSV
        gigantesco. PHP tem duas famílias de funções para isso — as <strong>atalho</strong> (uma
        chamada e pronto) e as <strong>baseadas em handle</strong> (mais verbosas, porém com
        controle total). Vamos do mais fácil para o mais sério.
      </p>

      <h2>O atalho: file_get_contents e file_put_contents</h2>
      <p>
        Para 80% dos casos do dia-a-dia, esse par resolve. Você passa o caminho e recebe a
        string inteira (ou grava a string inteira). É simples assim.
      </p>

      <PhpBlock
        filename="ler-config.php"
        code={`<?php
declare(strict_types=1);

$json = file_get_contents(__DIR__ . '/config.json');

if ($json === false) {
    throw new RuntimeException('Não consegui abrir config.json');
}

$config = json_decode($json, associative: true, flags: JSON_THROW_ON_ERROR);

echo "App: {$config['app']}" . PHP_EOL;
echo "Versão: {$config['versao']}" . PHP_EOL;`}
        output={`App: php-book
Versão: 1.0`}
      />

      <AlertBox type="warning" title="Sempre cheque o retorno">
        <code>file_get_contents()</code> retorna <code>false</code> em erro (arquivo inexistente,
        sem permissão). Em PHP moderno você também pode habilitar exceções com{" "}
        <code>set_error_handler</code>, mas o <code>=== false</code> é o idioma mais usado.
      </AlertBox>

      <p>
        Para gravar, o gêmeo <code>file_put_contents()</code> aceita uma string e devolve quantos
        bytes escreveu. Por padrão ele <strong>sobrescreve</strong> o arquivo:
      </p>

      <PhpBlock
        filename="gravar-config.php"
        code={`<?php
declare(strict_types=1);

$config = [
    'app' => 'php-book',
    'versao' => '1.1',
    'debug' => false,
];

$json = json_encode($config, JSON_PRETTY_PRINT | JSON_THROW_ON_ERROR);
$bytes = file_put_contents(__DIR__ . '/config.json', $json);

echo "Escrevi {$bytes} bytes." . PHP_EOL;`}
        output={`Escrevi 64 bytes.`}
      />

      <h2>FILE_APPEND: anexar em vez de sobrescrever</h2>
      <p>
        O caso clássico é log: você não quer apagar o histórico, quer carimbar mais uma linha no
        final. Use a flag <code>FILE_APPEND</code>:
      </p>

      <PhpBlock
        filename="log-simples.php"
        code={`<?php
declare(strict_types=1);

function logar(string $mensagem): void {
    $linha = sprintf("[%s] %s%s", date('Y-m-d H:i:s'), $mensagem, PHP_EOL);
    file_put_contents(__DIR__ . '/app.log', $linha, FILE_APPEND | LOCK_EX);
}

logar('Servidor iniciado');
logar('Usuário 42 fez login');
logar('Pedido #1337 confirmado');

echo file_get_contents(__DIR__ . '/app.log');`}
        output={`[2025-01-15 10:00:01] Servidor iniciado
[2025-01-15 10:00:01] Usuário 42 fez login
[2025-01-15 10:00:01] Pedido #1337 confirmado`}
      />

      <AlertBox type="info" title="LOCK_EX: por que importa">
        Se dois processos PHP gravarem no mesmo log <em>ao mesmo tempo</em>, as linhas podem se
        misturar (literalmente caracter no meio de outro). <code>LOCK_EX</code> pede um lock
        exclusivo no arquivo durante a escrita — o segundo processo espera. Para logs sérios,
        prefira <strong>Monolog</strong>, que já cuida disso.
      </AlertBox>

      <h2>file(): ler e já voltar como array de linhas</h2>
      <p>
        Quando o arquivo é uma lista (e-mails, IPs banidos, IDs), <code>file()</code> economiza
        um <code>explode</code>:
      </p>

      <PhpBlock
        filename="ler-emails.php"
        code={`<?php
declare(strict_types=1);

$emails = file(__DIR__ . '/lista.txt', FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES);

if ($emails === false) {
    throw new RuntimeException('Falha ao ler lista.txt');
}

echo "Total: " . count($emails) . PHP_EOL;
foreach ($emails as $i => $email) {
    echo ($i + 1) . ". {$email}" . PHP_EOL;
}`}
        output={`Total: 3
1. ada@example.com
2. linus@example.com
3. grace@example.com`}
      />

      <p>
        As flags <code>FILE_IGNORE_NEW_LINES</code> e <code>FILE_SKIP_EMPTY_LINES</code> tiram o{" "}
        <code>\n</code> do final de cada linha e ignoram linhas em branco — combinação que você
        vai querer em 99% dos casos.
      </p>

      <h2>O problema do arquivo gigante: fopen + fgets</h2>
      <p>
        Tudo funciona lindo até alguém te pedir para processar um CSV de 2 GB. Aí{" "}
        <code>file_get_contents</code> tenta carregar tudo na memória e seu PHP dá um belo{" "}
        <em>Allowed memory size exhausted</em>. A solução: abrir um <strong>handle</strong> e ler
        linha a linha.
      </p>

      <PhpBlock
        filename="processa-csv.php"
        code={`<?php
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
echo "Total vendido: R$ " . number_format($total, 2, ',', '.') . PHP_EOL;`}
        output={`Linhas processadas: 50000
Total vendido: R$ 1.247.832,55`}
      />

      <AlertBox type="success" title="Por que fgets é mágico">
        <code>fgets()</code> lê <strong>uma linha por vez</strong> direto do disco. A memória
        usada é constante, não importa se o arquivo tem 1 KB ou 1 TB. Sempre que ouvir
        “processar arquivo grande”, pense <code>fopen</code> + loop.
      </AlertBox>

      <h2>Os modos de fopen</h2>
      <p>
        O segundo argumento de <code>fopen()</code> diz <em>como</em> você quer abrir o arquivo.
        Os principais:
      </p>
      <ul>
        <li><code>'r'</code> — leitura, ponteiro no início. Falha se não existir.</li>
        <li><code>'w'</code> — escrita, <strong>trunca</strong> o arquivo (apaga conteúdo) ou cria.</li>
        <li><code>'a'</code> — escrita, ponteiro no final (append). Cria se não existir.</li>
        <li><code>'x'</code> — escrita, falha se já existir (útil para evitar sobrescrita).</li>
        <li><code>'r+'</code>, <code>'w+'</code>, <code>'a+'</code> — leitura E escrita.</li>
        <li>Adicione <code>'b'</code> (ex: <code>'rb'</code>) para arquivos binários no Windows.</li>
      </ul>

      <h2>Escrevendo com fwrite e travando o arquivo</h2>
      <p>
        Quando você grava em loop, fica mais explícito ter o handle aberto e usar{" "}
        <code>flock()</code> para bloquear:
      </p>

      <PhpBlock
        filename="contador-acessos.php"
        code={`<?php
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

echo "Acessos: {$novo}" . PHP_EOL;`}
        output={`Acessos: 1`}
      />

      <AlertBox type="warning" title="Sempre feche o que você abriu">
        Cada <code>fopen()</code> consome um <em>file descriptor</em> do sistema. Esquecer{" "}
        <code>fclose()</code> em loops longos é receita para <em>Too many open files</em>. PHP
        fecha automaticamente no fim do script, mas em CLI longo (workers, daemons) isso vira
        problema rápido.
      </AlertBox>

      <h2>Lendo só um pedaço com fread</h2>
      <p>
        Para pegar bytes específicos (cabeçalho de imagem, magic number, primeiros KB de um
        upload), <code>fread()</code> aceita o tamanho:
      </p>

      <PhpBlock
        filename="magic-bytes.php"
        code={`<?php
declare(strict_types=1);

$handle = fopen(__DIR__ . '/foto.png', 'rb');
$bytes = fread($handle, 8);
fclose($handle);

// PNG sempre começa com: 89 50 4E 47 0D 0A 1A 0A
$hex = bin2hex($bytes);
echo "Primeiros 8 bytes: {$hex}" . PHP_EOL;
echo str_starts_with($hex, '89504e47') ? 'É PNG ✓' : 'Não é PNG';`}
        output={`Primeiros 8 bytes: 89504e470d0a1a0a
É PNG ✓`}
      />

      <h2>Verificações antes de mexer</h2>
      <p>
        Sempre que o caminho vier de fora (usuário, banco, env), valide:
      </p>

      <PhpBlock
        filename="seguro.php"
        code={`<?php
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

echo lerSeguro('/var/dados/relatorio.txt');`}
        output={`Relatório do mês: tudo certo!`}
      />

      <p>
        O <code>realpath()</code> resolve <code>..</code>, links simbólicos e caminhos relativos
        — fundamental para evitar <em>path traversal</em>, que vamos detalhar no capítulo de
        uploads.
      </p>

      <h2>Rodando os exemplos</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/io"
        command="php processa-csv.php"
        output={`Linhas processadas: 50000
Total vendido: R$ 1.247.832,55`}
      />

      <p>
        Você já tem o essencial: <strong>file_get/put_contents</strong> para a maioria, e{" "}
        <strong>fopen/fgets/fwrite</strong> quando precisa de controle. No próximo capítulo a
        gente sai do arquivo único e atravessa <strong>diretórios</strong> inteiros com{" "}
        <code>scandir</code>, <code>glob</code> e os iteradores recursivos da SPL.
      </p>
    </PageContainer>
  );
}
