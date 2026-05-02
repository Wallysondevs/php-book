import{j as e}from"./index-Bb4MiiJL.js";import{P as i,A as r,a as s}from"./AlertBox-BpD-xIsb.js";import{T as o}from"./TerminalBlock-DGurMC1r.js";function p(){return e.jsxs(i,{title:"PHP na linha de comando",subtitle:"O binário php não é só para servir páginas web — é uma calculadora, um REPL, um linter e a base para todo script de automação que você vai escrever no dia a dia.",difficulty:"iniciante",timeToRead:"10 min",category:"Instalação",children:[e.jsx("h2",{children:"Esqueça o Apache por um instante"}),e.jsxs("p",{children:["Tem uma confusão comum: muita gente acha que PHP ",e.jsx("em",{children:"é"})," o Apache. Não é. PHP é um programa de linha de comando que ",e.jsx("strong",{children:"também"})," sabe rodar via servidor web. No terminal, você vai usar a CLI todos os dias para testar trechos, rodar scripts, fazer migrations, executar testes e disparar comandos do Composer, Laravel Artisan, Symfony Console."]}),e.jsx(o,{user:"dev",host:"php",cwd:"~",command:"php -v",output:`PHP 8.4.1 (cli) (built: Nov 19 2024 18:02:10) (NTS)
Copyright (c) The PHP Group
Zend Engine v4.4.1, Copyright (c) Zend Technologies
    with Zend OPcache v8.4.1, Copyright (c), by Zend Technologies`}),e.jsxs("p",{children:["Aquele ",e.jsx("code",{children:"(cli)"})," ali importa: significa que você está no ",e.jsx("em",{children:"SAPI"})," de linha de comando — o mesmo binário, com comportamento diferente do FPM/Apache (sem timeout padrão, sem buffering de output, autoload de stdin/stdout, etc)."]}),e.jsx("h2",{children:"php -r — executar uma linha sem criar arquivo"}),e.jsxs("p",{children:["A flag ",e.jsx("code",{children:"-r"})," aceita código PHP como argumento. ",e.jsx("strong",{children:"Sem"})," tag de abertura. Perfeito para um cálculo rápido, testar uma função, conferir resultado de uma expressão:"]}),e.jsx(o,{user:"dev",host:"php",cwd:"~",command:`php -r 'echo strtoupper("olá mundo") . PHP_EOL;'`,output:"OLÁ MUNDO"}),e.jsx(o,{user:"dev",host:"php",cwd:"~",command:"php -r 'echo bin2hex(random_bytes(16)) . PHP_EOL;'",output:"a1b2c3d4e5f60718293a4b5c6d7e8f90"}),e.jsx(o,{user:"dev",host:"php",cwd:"~",command:`php -r 'echo password_hash("senha123", PASSWORD_BCRYPT) . PHP_EOL;'`,output:"$2y$10$Vh1FzPb0e1qJ9bH8f0K6POl4uYn9vJgJ6m/QkYGu4w8yQK2dN5lC."}),e.jsx(r,{type:"info",title:"Quando o -r brilha",children:"Gerar tokens, hashear uma senha de teste, validar uma regex, conferir o tamanho de uma string em bytes vs caracteres. Tudo que você normalmente abriria um “online tool” para fazer."}),e.jsx("h2",{children:"php -a — REPL interativo"}),e.jsxs("p",{children:["REPL = ",e.jsx("em",{children:"Read, Eval, Print, Loop"}),". Você digita código, aperta enter e vê o resultado na hora — igual ao ",e.jsx("code",{children:"python"})," ou ",e.jsx("code",{children:"node"}),":"]}),e.jsx(o,{user:"dev",host:"php",cwd:"~",command:"php -a",output:`Interactive shell

php > $nome = "Ada";
php > echo strtoupper($nome) . PHP_EOL;
ADA
php > $numeros = [1, 2, 3, 4, 5];
php > echo array_sum($numeros);
15
php > exit`}),e.jsxs("p",{children:["O REPL nativo é ",e.jsx("strong",{children:"limitado"})," — não tem autocomplete decente nem histórico bonito. Para algo melhor, instale o ",e.jsx("strong",{children:"PsySH"}),":"]}),e.jsx(o,{user:"dev",host:"php",cwd:"~",command:"composer global require psy/psysh",output:`./composer.json has been updated
Installing psy/psysh (v0.12.4): Extracting archive
Generating autoload files`}),e.jsx(o,{user:"dev",host:"php",cwd:"~",command:"psysh",output:`Psy Shell v0.12.4 (PHP 8.4.1 — cli) by Justin Hileman
> $u = new stdClass; $u->nome = "Ada"; $u
=> {#1234
     +"nome": "Ada",
   }
> ls $u
Class Properties:
  $nome
> exit`}),e.jsx("h2",{children:"php -i — phpinfo() no terminal"}),e.jsxs("p",{children:["Sabe aquele clássico arquivo ",e.jsx("code",{children:"info.php"})," com ",e.jsx("code",{children:"<?php phpinfo();>"}),"? A versão CLI é melhor — você não precisa subir servidor, não vaza dado, e dá pra filtrar com ",e.jsx("code",{children:"grep"}),":"]}),e.jsx(o,{user:"dev",host:"php",cwd:"~",command:"php -i | head -20",output:`phpinfo()
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
Scan this dir for additional .ini files => /etc/php/8.4/cli/conf.d`}),e.jsx("p",{children:"Casos de uso típicos:"}),e.jsx(o,{user:"dev",host:"php",cwd:"~",command:"php -i | grep -i 'memory_limit'",output:"memory_limit => 512M => 512M"}),e.jsx(o,{user:"dev",host:"php",cwd:"~",command:"php -i | grep -i 'date.timezone'",output:`Default timezone => America/Sao_Paulo
date.timezone => America/Sao_Paulo => America/Sao_Paulo`}),e.jsx("h2",{children:"php -l — lint (verificar sintaxe sem executar)"}),e.jsxs("p",{children:["Antes de fazer commit, ou em qualquer pipeline de CI, rode o lint. Ele só lê o arquivo e checa se a sintaxe é válida — ",e.jsx("strong",{children:"não executa"})," nada:"]}),e.jsx(s,{filename:"ok.php",code:`<?php
declare(strict_types=1);

function saudar(string $nome): string {
    return "Olá, $nome!";
}

echo saudar("Linus");`}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos",command:"php -l ok.php",output:"No syntax errors detected in ok.php"}),e.jsx(s,{filename:"quebrado.php",code:`<?php
declare(strict_types=1);

function saudar(string $nome): string {
    return "Olá, $nome!"
}

echo saudar("Linus");`}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos",command:"php -l quebrado.php",output:`PHP Parse error:  syntax error, unexpected token "}", expecting ";" in quebrado.php on line 6
Errors parsing quebrado.php`}),e.jsx("p",{children:"Para checar todos os arquivos do projeto de uma vez:"}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projeto",command:'find src -name "*.php" -print0 | xargs -0 -n1 php -l',output:`No syntax errors detected in src/Models/Usuario.php
No syntax errors detected in src/Controllers/Home.php
No syntax errors detected in src/Services/Email.php`}),e.jsx("h2",{children:"Outras flags úteis"}),e.jsx(o,{user:"dev",host:"php",cwd:"~",command:"php -m",output:`[PHP Modules]
Core
ctype
curl
date
mbstring
PDO
pdo_pgsql
[Zend Modules]
Zend OPcache`}),e.jsx("p",{children:"Lista todos os módulos carregados."}),e.jsx(o,{user:"dev",host:"php",cwd:"~",command:"php --ini",output:`Configuration File (php.ini) Path: /etc/php/8.4/cli
Loaded Configuration File:         /etc/php/8.4/cli/php.ini
Scan for additional .ini files in: /etc/php/8.4/cli/conf.d
Additional .ini files parsed:      /etc/php/8.4/cli/conf.d/10-opcache.ini`}),e.jsxs("p",{children:["Mostra qual ",e.jsx("code",{children:"php.ini"})," está sendo usado."]}),e.jsx(o,{user:"dev",host:"php",cwd:"~",command:"php -d memory_limit=2G script.php",output:"Processado 1.000.000 registros em 12.4s"}),e.jsxs("p",{children:["A flag ",e.jsx("code",{children:"-d"})," sobrescreve qualquer setting do ",e.jsx("code",{children:"php.ini"})," só para essa execução."]}),e.jsx("h2",{children:"Scripts CLI como ferramenta diária"}),e.jsx("p",{children:"Aqui é onde a CLI deixa de ser “utilitário” e vira “canivete suíço”. Você pode escrever scripts profissionais com argumentos, leitura de stdin, exit codes — tudo idiomático."}),e.jsx(s,{filename:"contar_linhas.php",code:`#!/usr/bin/env php
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
exit(0);`}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos",command:"chmod +x contar_linhas.php && ./contar_linhas.php /etc/passwd",output:"/etc/passwd: 47 linhas"}),e.jsxs("p",{children:["Repare em três coisas idiomáticas: ",e.jsx("code",{children:"$argv"})," e ",e.jsx("code",{children:"$argc"})," para argumentos,",e.jsx("code",{children:"STDERR"})," para mensagens de erro, e ",e.jsx("code",{children:"exit(N)"})," com códigos diferentes para sucesso/falha (igual a qualquer programa Unix decente)."]}),e.jsx("h2",{children:"Lendo stdin — pipes funcionam"}),e.jsx(s,{filename:"upper.php",code:`<?php
declare(strict_types=1);

while (($linha = fgets(STDIN)) !== false) {
    echo mb_strtoupper(rtrim($linha)) . PHP_EOL;
}`}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos",command:'echo -e "olá\\nmundo\\nphp" | php upper.php',output:`OLÁ
MUNDO
PHP`}),e.jsxs("p",{children:["Pronto: você compôs um filtro Unix em PHP. Pode encadear com ",e.jsx("code",{children:"|"})," que nem cat, grep, sort."]}),e.jsx("h2",{children:"Argumentos nomeados com getopt"}),e.jsxs("p",{children:["Para scripts mais sérios, em vez de mexer em ",e.jsx("code",{children:"$argv"})," manualmente, use a função nativa ",e.jsx("code",{children:"getopt"}),":"]}),e.jsx(s,{filename:"saudar.php",code:`<?php
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
}`}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projetos",command:"php saudar.php --nome=Ada --idade=36",output:`Olá, Ada!
Você tem 36 anos.`}),e.jsx("h2",{children:"Servidor de uma linha (preview)"}),e.jsx("p",{children:"E como bônus — a CLI tem um servidor web embutido. Vamos só dar um spoiler aqui, o capítulo seguinte é todo dele:"}),e.jsx(o,{user:"dev",host:"php",cwd:"~/projeto/public",command:"php -S localhost:8000",output:`[Wed Jan 15 10:00:00 2026] PHP 8.4.1 Development Server (http://localhost:8000) started
[Wed Jan 15 10:00:05 2026] 127.0.0.1:54321 [200]: GET /index.php`}),e.jsx(r,{type:"success",title:"Resumo das flags que você vai usar para sempre",children:e.jsxs("ul",{className:"list-disc ml-5 mt-1 space-y-1",children:[e.jsxs("li",{children:[e.jsx("code",{children:"php -v"})," — versão do interpretador."]}),e.jsxs("li",{children:[e.jsx("code",{children:"php -r 'CODE'"})," — uma linha sem arquivo."]}),e.jsxs("li",{children:[e.jsx("code",{children:"php -a"})," — REPL interativo."]}),e.jsxs("li",{children:[e.jsx("code",{children:"php -i"})," — phpinfo no terminal."]}),e.jsxs("li",{children:[e.jsx("code",{children:"php -l ARQUIVO"})," — checagem de sintaxe."]}),e.jsxs("li",{children:[e.jsx("code",{children:"php -m"})," — módulos carregados."]}),e.jsxs("li",{children:[e.jsx("code",{children:"php --ini"})," — onde está o php.ini."]}),e.jsxs("li",{children:[e.jsx("code",{children:"php -d KEY=VAL"})," — override de configuração."]}),e.jsxs("li",{children:[e.jsx("code",{children:"php -S host:porta"})," — servidor de desenvolvimento."]})]})}),e.jsxs("p",{children:["Próximo capítulo a gente foca no ",e.jsx("strong",{children:"servidor embutido (php -S)"})," — como subir um ambiente de dev em literalmente um segundo, sem instalar Apache nem Nginx."]})]})}export{p as default};
