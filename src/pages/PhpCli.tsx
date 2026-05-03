import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function PhpCli() {
  return (
    <PageContainer
      title="PHP na linha de comando"
      subtitle="O binário php não é só para servir páginas web — é uma calculadora, um REPL, um linter e a base para todo script de automação que você vai escrever no dia a dia."
      difficulty="iniciante"
      timeToRead="10 min"
      category="Instalação"
    >
      <AlertBox type="info" title="Pré-requisitos">
          <p>Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP.</p>
        </AlertBox>
        <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"php script.php"}</strong> {' — '} {"executa script no terminal."}
          </li>
        <li>
            <strong>{"$argv / $argc"}</strong> {' — '} {"argumentos da linha de comando."}
          </li>
        <li>
            <strong>{"STDIN/STDOUT/STDERR"}</strong> {' — '} {"streams padrão pré-abertos."}
          </li>
        <li>
            <strong>{"php -r"}</strong> {' — '} {"executa código inline."}
          </li>
        <li>
            <strong>{"php -i"}</strong> {' — '} {"mostra info do build (phpinfo equivalente)."}
          </li>
        </ul>
          <h2>Esqueça o Apache por um instante</h2>
      <p>
        Tem uma confusão comum: muita gente acha que PHP <em>é</em> o Apache. Não é. PHP é um programa
        de linha de comando que <strong>também</strong> sabe rodar via servidor web. No terminal,
        você vai usar a CLI todos os dias para testar trechos, rodar scripts, fazer migrations,
        executar testes e disparar comandos do Composer, Laravel Artisan, Symfony Console.
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command="php -v"
        output={`PHP 8.4.1 (cli) (built: Nov 19 2024 18:02:10) (NTS)
Copyright (c) The PHP Group
Zend Engine v4.4.1, Copyright (c) Zend Technologies
    with Zend OPcache v8.4.1, Copyright (c), by Zend Technologies`}
      />

      <p>
        Aquele <code>(cli)</code> ali importa: significa que você está no <em>SAPI</em> de
        linha de comando — o mesmo binário, com comportamento diferente do FPM/Apache (sem timeout
        padrão, sem buffering de output, autoload de stdin/stdout, etc).
      </p>

      <h2>php -r — executar uma linha sem criar arquivo</h2>
      <p>
        A flag <code>-r</code> aceita código PHP como argumento. <strong>Sem</strong> tag de abertura.
        Perfeito para um cálculo rápido, testar uma função, conferir resultado de uma expressão:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command={`php -r 'echo strtoupper("olá mundo") . PHP_EOL;'`}
        output={`OLÁ MUNDO`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command={`php -r 'echo bin2hex(random_bytes(16)) . PHP_EOL;'`}
        output={`a1b2c3d4e5f60718293a4b5c6d7e8f90`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command={`php -r 'echo password_hash("senha123", PASSWORD_BCRYPT) . PHP_EOL;'`}
        output={`$2y$10$Vh1FzPb0e1qJ9bH8f0K6POl4uYn9vJgJ6m/QkYGu4w8yQK2dN5lC.`}
      />

      <AlertBox type="info" title="Quando o -r brilha">
        Gerar tokens, hashear uma senha de teste, validar uma regex, conferir o tamanho de uma string
        em bytes vs caracteres. Tudo que você normalmente abriria um “online tool” para fazer.
      </AlertBox>

      <h2>php -a — REPL interativo</h2>
      <p>
        REPL = <em>Read, Eval, Print, Loop</em>. Você digita código, aperta enter e vê o resultado
        na hora — igual ao <code>python</code> ou <code>node</code>:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command="php -a"
        output={`Interactive shell

php > $nome = "Ada";
php > echo strtoupper($nome) . PHP_EOL;
ADA
php > $numeros = [1, 2, 3, 4, 5];
php > echo array_sum($numeros);
15
php > exit`}
      />

      <p>
        O REPL nativo é <strong>limitado</strong> — não tem autocomplete decente nem histórico bonito.
        Para algo melhor, instale o <strong>PsySH</strong>:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command="composer global require psy/psysh"
        output={`./composer.json has been updated
Installing psy/psysh (v0.12.4): Extracting archive
Generating autoload files`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command="psysh"
        output={`Psy Shell v0.12.4 (PHP 8.4.1 — cli) by Justin Hileman
> $u = new stdClass; $u->nome = "Ada"; $u
=> {#1234
     +"nome": "Ada",
   }
> ls $u
Class Properties:
  $nome
> exit`}
      />

      <h2>php -i — phpinfo() no terminal</h2>
      <p>
        Sabe aquele clássico arquivo <code>info.php</code> com <code>&lt;?php phpinfo();&gt;</code>?
        A versão CLI é melhor — você não precisa subir servidor, não vaza dado, e dá pra filtrar com <code>grep</code>:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command="php -i | head -20"
        output={`phpinfo()
PHP Version => 8.4.1

System => Linux dev 6.8.0-49-generic
Build Date => Nov 19 2024 18:02:10
Build Provider => Ondřej Surý
Compiler => GCC 13.2.0
Architecture => x86_64
Server API => Command Line Interface
Virtual Directory Support => disabled
Configuration File (php.ini) Path => /etc/php/8.4/cli
Loaded Configuration File => /etc/php/8.4/cli/php.ini
Scan this dir for additional .ini files => /etc/php/8.4/cli/conf.d`}
      />

      <p>Casos de uso típicos:</p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command="php -i | grep -i 'memory_limit'"
        output={`memory_limit => 512M => 512M`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command="php -i | grep -i 'date.timezone'"
        output={`Default timezone => America/Sao_Paulo
date.timezone => America/Sao_Paulo => America/Sao_Paulo`}
      />

      <h2>php -l — lint (verificar sintaxe sem executar)</h2>
      <p>
        Antes de fazer commit, ou em qualquer pipeline de CI, rode o lint. Ele só lê o arquivo e
        checa se a sintaxe é válida — <strong>não executa</strong> nada:
      </p>

      <PhpBlock
        filename="ok.php"
        code={`<?php
declare(strict_types=1);

function saudar(string $nome): string {
    return "Olá, $nome!";
}

echo saudar("Linus");`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos"
        command="php -l ok.php"
        output={`No syntax errors detected in ok.php`}
      />

      <PhpBlock
        filename="quebrado.php"
        code={`<?php
declare(strict_types=1);

function saudar(string $nome): string {
    return "Olá, $nome!"
}

echo saudar("Linus");`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos"
        command="php -l quebrado.php"
        output={`PHP Parse error:  syntax error, unexpected token "}", expecting ";" in quebrado.php on line 6
Errors parsing quebrado.php`}
      />

      <p>Para checar todos os arquivos do projeto de uma vez:</p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projeto"
        command={`find src -name "*.php" -print0 | xargs -0 -n1 php -l`}
        output={`No syntax errors detected in src/Models/Usuario.php
No syntax errors detected in src/Controllers/Home.php
No syntax errors detected in src/Services/Email.php`}
      />

      <h2>Outras flags úteis</h2>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command="php -m"
        output={`[PHP Modules]
Core
ctype
curl
date
mbstring
PDO
pdo_pgsql
[Zend Modules]
Zend OPcache`}
      />

      <p>Lista todos os módulos carregados.</p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command="php --ini"
        output={`Configuration File (php.ini) Path: /etc/php/8.4/cli
Loaded Configuration File:         /etc/php/8.4/cli/php.ini
Scan for additional .ini files in: /etc/php/8.4/cli/conf.d
Additional .ini files parsed:      /etc/php/8.4/cli/conf.d/10-opcache.ini`}
      />

      <p>Mostra qual <code>php.ini</code> está sendo usado.</p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command={`php -d memory_limit=2G script.php`}
        output={`Processado 1.000.000 registros em 12.4s`}
      />

      <p>A flag <code>-d</code> sobrescreve qualquer setting do <code>php.ini</code> só para essa execução.</p>

      <h2>Scripts CLI como ferramenta diária</h2>
      <p>
        Aqui é onde a CLI deixa de ser “utilitário” e vira “canivete suíço”. Você pode escrever
        scripts profissionais com argumentos, leitura de stdin, exit codes — tudo idiomático.
      </p>

      <PhpBlock
        filename="contar_linhas.php"
        code={`#!/usr/bin/env php
<?php
declare(strict_types=1);

if ($argc < 2) {
    fwrite(STDERR, "Uso: contar_linhas.php <arquivo>" . PHP_EOL);
    exit(1);
}

$arquivo = $argv[1];

if (!is_readable($arquivo)) {
    fwrite(STDERR, "Erro: '$arquivo' não pode ser lido." . PHP_EOL);
    exit(2);
}

$linhas = 0;
$f = fopen($arquivo, 'r');
while (fgets($f) !== false) {
    $linhas++;
}
fclose($f);

echo "$arquivo: $linhas linhas" . PHP_EOL;
exit(0);`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos"
        command="chmod +x contar_linhas.php && ./contar_linhas.php /etc/passwd"
        output={`/etc/passwd: 47 linhas`}
      />

      <p>
        Repare em três coisas idiomáticas: <code>$argv</code> e <code>$argc</code> para argumentos,
        <code>STDERR</code> para mensagens de erro, e <code>exit(N)</code> com códigos diferentes
        para sucesso/falha (igual a qualquer programa Unix decente).
      </p>

      <h2>Lendo stdin — pipes funcionam</h2>

      <PhpBlock
        filename="upper.php"
        code={`<?php
declare(strict_types=1);

while (($linha = fgets(STDIN)) !== false) {
    echo mb_strtoupper(rtrim($linha)) . PHP_EOL;
}`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos"
        command={`echo -e "olá\\nmundo\\nphp" | php upper.php`}
        output={`OLÁ
MUNDO
PHP`}
      />

      <p>Pronto: você compôs um filtro Unix em PHP. Pode encadear com <code>|</code> que nem cat, grep, sort.</p>

      <h2>Argumentos nomeados com getopt</h2>
      <p>Para scripts mais sérios, em vez de mexer em <code>$argv</code> manualmente, use a função nativa <code>getopt</code>:</p>

      <PhpBlock
        filename="saudar.php"
        code={`<?php
declare(strict_types=1);

$opts = getopt('n:i:', ['nome:', 'idade:']);

$nome  = $opts['nome']  ?? $opts['n'] ?? null;
$idade = $opts['idade'] ?? $opts['i'] ?? null;

if ($nome === null) {
    fwrite(STDERR, "Uso: php saudar.php --nome=Ada [--idade=30]" . PHP_EOL);
    exit(1);
}

echo "Olá, $nome!" . PHP_EOL;
if ($idade !== null) {
    echo "Você tem $idade anos." . PHP_EOL;
}`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos"
        command="php saudar.php --nome=Ada --idade=36"
        output={`Olá, Ada!
Você tem 36 anos.`}
      />

      <h2>Servidor de uma linha (preview)</h2>
      <p>
        E como bônus — a CLI tem um servidor web embutido. Vamos só dar um spoiler aqui, o capítulo
        seguinte é todo dele:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projeto/public"
        command="php -S localhost:8000"
        output={`[Wed Jan 15 10:00:00 2026] PHP 8.4.1 Development Server (http://localhost:8000) started
[Wed Jan 15 10:00:05 2026] 127.0.0.1:54321 [200]: GET /index.php`}
      />

      <AlertBox type="success" title="Resumo das flags que você vai usar para sempre">
        <ul className="list-disc ml-5 mt-1 space-y-1">
          <li><code>php -v</code> — versão do interpretador.</li>
          <li><code>php -r 'CODE'</code> — uma linha sem arquivo.</li>
          <li><code>php -a</code> — REPL interativo.</li>
          <li><code>php -i</code> — phpinfo no terminal.</li>
          <li><code>php -l ARQUIVO</code> — checagem de sintaxe.</li>
          <li><code>php -m</code> — módulos carregados.</li>
          <li><code>php --ini</code> — onde está o php.ini.</li>
          <li><code>php -d KEY=VAL</code> — override de configuração.</li>
          <li><code>php -S host:porta</code> — servidor de desenvolvimento.</li>
        </ul>
      </AlertBox>

      <p>
        Próximo capítulo a gente foca no <strong>servidor embutido (php -S)</strong> — como subir
        um ambiente de dev em literalmente um segundo, sem instalar Apache nem Nginx.
      </p>
    </PageContainer>
  );
}
