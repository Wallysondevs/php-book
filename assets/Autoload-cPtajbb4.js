import{j as e}from"./index-Bb4MiiJL.js";import{P as d,A as r,a}from"./AlertBox-BpD-xIsb.js";import{T as s}from"./TerminalBlock-DGurMC1r.js";import{C as o}from"./CodeBlock-C3V-qEkN.js";function p(){return e.jsxs(d,{title:"Autoload PSR-4",subtitle:"Como o Composer transforma uma simples chamada new App\\Models\\User em mágica: ele lê o composer.json, mapeia namespaces para pastas e carrega arquivos sob demanda.",difficulty:"avancado",timeToRead:"11 min",category:"Namespaces & Composer",children:[e.jsx(r,{type:"info",title:"Pré-requisitos",children:e.jsxs("p",{children:["Antes deste capítulo, é bom já ter visto: ",e.jsx("a",{href:"#/namespaces",className:"text-[#8993BE] underline",children:"Namespaces"})," e ",e.jsx("a",{href:"#/composer",className:"text-[#8993BE] underline",children:"Composer"}),"."]})}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"autoload PSR-4"})," — padrão da comunidade que mapeia ",e.jsx("em",{children:"prefixo de namespace"})," para ",e.jsx("em",{children:"pasta no disco"}),". Existe pra você nunca mais escrever ",e.jsx("code",{children:"require"})," manual: ",e.jsx("code",{children:"App\\Models\\User"})," vira ",e.jsx("code",{children:"src/Models/User.php"})," automaticamente. Configurado na chave ",e.jsx("code",{children:"autoload.psr-4"})," do ",e.jsx("code",{children:"composer.json"}),"."]}),e.jsx("h2",{children:"O mundo sem autoload (e por que ele dói)"}),e.jsx("p",{children:"Antes do PSR-4, qualquer arquivo PHP precisava listar manualmente todas as classes que usava. Imagine 200 classes em 30 arquivos:"}),e.jsx(a,{filename:"velho-mundo.php",code:`<?php
require_once __DIR__ . '/src/Models/User.php';
require_once __DIR__ . '/src/Models/Product.php';
require_once __DIR__ . '/src/Models/Invoice.php';
require_once __DIR__ . '/src/Services/Mailer.php';
require_once __DIR__ . '/src/Services/Payment/StripeGateway.php';
require_once __DIR__ . '/src/Http/Controllers/HomeController.php';
// ... mais 194 linhas de require_once

$user = new User('Ada');
echo $user->nome;`,output:"Ada"}),e.jsxs("p",{children:["Mover um arquivo? Renomear uma classe? Esqueceu um ",e.jsx("code",{children:"require"}),"?"," ",e.jsx("em",{children:"Fatal error."})," O autoload resolve isso registrando uma função que o PHP chama"," ",e.jsx("strong",{children:"automaticamente"})," sempre que encontra uma classe ainda não carregada."]}),e.jsxs("h2",{children:["O autoload que vem na caixa: ",e.jsx("code",{children:"spl_autoload_register"})]}),e.jsxs("p",{children:["PHP nativamente oferece ",e.jsx("code",{children:"spl_autoload_register"})," para você plugar sua própria função carregadora:"]}),e.jsx(a,{filename:"autoload-na-mao.php",code:`<?php
declare(strict_types=1);

spl_autoload_register(function (string $classe): void {
    // App\\Models\\User  ->  src/Models/User.php
    $caminho = __DIR__ . '/src/' . str_replace(['App\\\\', '\\\\'], ['', '/'], $classe) . '.php';
    if (is_file($caminho)) {
        require $caminho;
    }
});

$u = new App\\Models\\User('Ada', 'ada@math.org');
echo $u->nome . PHP_EOL;`,output:"Ada"}),e.jsxs("p",{children:["Funciona — mas você está reinventando a roda toda vez. O Composer faz isso por você seguindo um padrão da comunidade chamado ",e.jsx("strong",{children:"PSR-4"}),"."]}),e.jsx("h2",{children:"O contrato PSR-4 em uma frase"}),e.jsx("p",{children:e.jsxs("em",{children:['"Para cada prefixo de namespace, exista uma pasta base. Substitua o prefixo pela pasta, troque ',e.jsx("code",{children:"\\"})," por ",e.jsx("code",{children:"/"})," e adicione ",e.jsx("code",{children:".php"}),'."']})}),e.jsx(o,{title:"Mapeamento mental",language:"bash",code:`Namespace prefix  ->  Pasta base
App\\               ->  src/

App\\Models\\User    ->  src/Models/User.php
App\\Http\\Kernel    ->  src/Http/Kernel.php
App\\Auth\\JWT       ->  src/Auth/JWT.php`}),e.jsxs("h2",{children:["Configurando PSR-4 no ",e.jsx("code",{children:"composer.json"})]}),e.jsx(o,{title:"composer.json",language:"json",code:`{
    "name": "wallyson/loja",
    "type": "project",
    "require": {
        "php": "^8.4"
    },
    "autoload": {
        "psr-4": {
            "App\\\\": "src/",
            "Loja\\\\": "modulos/loja/src/"
        }
    },
    "autoload-dev": {
        "psr-4": {
            "Tests\\\\": "tests/"
        }
    }
}`}),e.jsx("p",{children:"Repare em três detalhes:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:["O prefixo termina em ",e.jsx("code",{children:"\\\\"})," no JSON (que é apenas ",e.jsx("code",{children:"\\"})," escapado)."]}),e.jsxs("li",{children:["A pasta termina em ",e.jsx("code",{children:"/"})," — é convenção e ajuda a leitura."]}),e.jsxs("li",{children:[e.jsx("code",{children:"autoload-dev"})," só carrega no ambiente de desenvolvimento (excluído com"," ",e.jsx("code",{children:"composer install --no-dev"}),")."]})]}),e.jsx("h2",{children:"Vamos construir um package mínimo do zero"}),e.jsxs("p",{children:["Para entender o autoload na prática, vamos criar uma micro-biblioteca chamada"," ",e.jsx("code",{children:"wallyson/saudacao"})," que exporta uma classe ",e.jsx("code",{children:"Saudador"}),"."]}),e.jsx(s,{user:"dev",host:"php",cwd:"~/packages",command:"mkdir saudacao && cd saudacao && mkdir src"}),e.jsx(o,{title:"composer.json",language:"json",code:`{
    "name": "wallyson/saudacao",
    "description": "Pacote de saudação para o php-book",
    "type": "library",
    "license": "MIT",
    "require": {
        "php": "^8.4"
    },
    "autoload": {
        "psr-4": {
            "Wallyson\\\\Saudacao\\\\": "src/"
        },
        "files": [
            "src/helpers.php"
        ]
    }
}`}),e.jsx(a,{filename:"src/Saudador.php",code:`<?php
declare(strict_types=1);

namespace Wallyson\\Saudacao;

final class Saudador {
    public function __construct(
        public readonly string $idioma = 'pt',
    ) {}

    public function saudar(string $nome): string {
        return match ($this->idioma) {
            'pt' => "Olá, {$nome}!",
            'en' => "Hello, {$nome}!",
            'es' => "¡Hola, {$nome}!",
            default => "Hi, {$nome}!",
        };
    }
}`}),e.jsx(a,{filename:"src/helpers.php",code:`<?php
declare(strict_types=1);

use Wallyson\\Saudacao\\Saudador;

if (!function_exists('saudar')) {
    function saudar(string $nome, string $idioma = 'pt'): string {
        return (new Saudador($idioma))->saudar($nome);
    }
}`}),e.jsxs("p",{children:["Repare que o ",e.jsx("code",{children:"helpers.php"})," não declara classe — só uma função global. Por isso ele entra no autoload pela chave ",e.jsx("code",{children:"files"}),': ele é incluído de cara, sem precisar de "alguma classe" para acionar o autoload.']}),e.jsx(s,{user:"dev",host:"php",cwd:"~/packages/saudacao",command:"composer dump-autoload",output:`Generating autoload files
Generated autoload files`}),e.jsx("h2",{children:"Usando o package localmente"}),e.jsxs("p",{children:["Em outro projeto, declare o package como repositório do tipo ",e.jsx("code",{children:"path"}),":"]}),e.jsx(o,{title:"meu-app/composer.json",language:"json",code:`{
    "name": "wallyson/app",
    "require": {
        "wallyson/saudacao": "@dev"
    },
    "repositories": [
        { "type": "path", "url": "../saudacao" }
    ],
    "autoload": {
        "psr-4": { "App\\\\": "src/" }
    }
}`}),e.jsx(s,{user:"dev",host:"php",cwd:"~/packages/meu-app",command:"composer install",output:`Installing dependencies (including require-dev)
  - Installing wallyson/saudacao (dev-main): Symlinked from ../saudacao
Generating autoload files`}),e.jsx(a,{filename:"public/index.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/../vendor/autoload.php';

use Wallyson\\Saudacao\\Saudador;

// Via classe (autoload PSR-4)
$s = new Saudador('en');
echo $s->saudar('Linus') . PHP_EOL;

// Via função global (autoload de files)
echo saudar('Wallyson') . PHP_EOL;
echo saudar('Carmen', 'es') . PHP_EOL;`,output:`Hello, Linus!
Olá, Wallyson!
¡Hola, Carmen!`}),e.jsx("h2",{children:"classmap: o tira-teima"}),e.jsxs("p",{children:["Às vezes você precisa carregar código ",e.jsx("em",{children:"legado"})," que não segue PSR-4 — várias classes em um arquivo só, namespaces inconsistentes, pastas malucas. Para isso existe ",e.jsx("code",{children:"classmap"}),":"]}),e.jsx(o,{title:"composer.json",language:"json",code:`{
    "autoload": {
        "psr-4": { "App\\\\": "src/" },
        "classmap": [
            "legado/"
        ]
    }
}`}),e.jsxs("p",{children:["Quando você roda ",e.jsx("code",{children:"composer dump-autoload"}),", ele varre a pasta"," ",e.jsx("code",{children:"legado/"}),", encontra todas as ",e.jsx("code",{children:"class"}),", ",e.jsx("code",{children:"interface"}),","," ",e.jsx("code",{children:"trait"})," e ",e.jsx("code",{children:"enum"}),", e gera um array com"," ",e.jsx("em",{children:'"NomeDaClasse → caminho do arquivo"'}),". É a alternativa mais lenta de gerar mas a mais rápida em runtime."]}),e.jsx("h2",{children:"Otimização para produção"}),e.jsx(s,{user:"dev",host:"php",cwd:"/var/www/app",command:"composer dump-autoload --optimize --classmap-authoritative",output:`Generating optimized autoload files
Generated optimized autoload files containing 421 classes`}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"--optimize"})," (",e.jsx("code",{children:"-o"}),"): converte PSR-4 num classmap pré-resolvido."]}),e.jsxs("li",{children:[e.jsx("code",{children:"--classmap-authoritative"}),": ",e.jsx("strong",{children:"nunca"})," consulta o disco em runtime. Se a classe não estiver no classmap, a chamada falha imediato. Mais rápido, exige rebuild a cada deploy."]}),e.jsxs("li",{children:[e.jsx("code",{children:"--apcu"}),": usa a extensão APCu para cachear o lookup em memória entre requests."]})]}),e.jsxs(r,{type:"warning",title:"Esqueceu de regenerar?",children:["Em dev, criou um arquivo novo e bate ",e.jsx("em",{children:'"Class not found"'}),"?"," ",e.jsx("code",{children:"composer dump-autoload"}),". Se você usa ",e.jsx("code",{children:"-o --classmap-authoritative"})," ","em prod, ",e.jsx("strong",{children:"todo deploy"})," precisa rodar esse comando."]}),e.jsx("h2",{children:"Espiando como funciona por dentro"}),e.jsxs("p",{children:["O ",e.jsx("code",{children:"vendor/autoload.php"})," apenas inclui ",e.jsx("code",{children:"vendor/composer/autoload_real.php"}),", que registra um closure no SPL apontando para os mapas gerados em"," ",e.jsx("code",{children:"autoload_psr4.php"}),", ",e.jsx("code",{children:"autoload_classmap.php"})," e ",e.jsx("code",{children:"autoload_files.php"}),". Você pode até inspecionar:"]}),e.jsx(a,{filename:"diag.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

foreach (spl_autoload_functions() as $i => $fn) {
    if (is_array($fn)) {
        $fn = get_class($fn[0]) . '::' . $fn[1];
    }
    echo "[$i] $fn" . PHP_EOL;
}`,output:"[0] Composer\\Autoload\\ClassLoader::loadClass"}),e.jsx(r,{type:"success",title:"Resumo de bolso",children:e.jsxs("ol",{className:"list-decimal ml-5 mt-1 space-y-1",children:[e.jsxs("li",{children:["Use ",e.jsx("strong",{children:"PSR-4"})," para 99% das classes do seu projeto."]}),e.jsxs("li",{children:["Use ",e.jsx("strong",{children:"files"})," para helpers globais (poucos!)."]}),e.jsxs("li",{children:["Use ",e.jsx("strong",{children:"classmap"})," para código legado."]}),e.jsxs("li",{children:["Sempre ",e.jsx("code",{children:"composer dump-autoload -o"})," em produção."]}),e.jsx("li",{children:"Quanto mais previsível seu mapeamento, mais rápido o autoload."})]})}),e.jsxs("p",{children:["Pronto: você entende todo o caminho desde ",e.jsx("code",{children:"new App\\Models\\User"})," até o arquivo no disco. Próximo capítulo entra no mundo web — formulários e dados de usuário."]})]})}export{p as default};
