import{j as e}from"./index-B5-q-eol.js";import{P as a,A as r,a as o}from"./AlertBox-CVbFLZEd.js";import{T as s}from"./TerminalBlock-6fqVIX2R.js";import{C as i}from"./CodeBlock-B36pQ_ak.js";function c(){return e.jsxs(a,{title:"Versões e Roadmap",subtitle:"PHP 7.x vs 8.x, novidades de 8.0 a 8.4, datas de fim de suporte (EOL) e como gerenciar várias versões na mesma máquina com phpenv ou asdf.",difficulty:"iniciante",timeToRead:"9 min",category:"Introdução",children:[e.jsx(r,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Active support"})," "," — "," ","2 anos de bugs + 1 ano só segurança."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"EOL"})," "," — "," ","após 3 anos — atualize antes."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"php.net/supported-versions"})," "," — "," ","tabela oficial sempre atualizada."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Migração"})," "," — "," ","use Rector + PHPStan para upgrades grandes."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Composer platform"})," "," — "," ","declare requirePHP em composer.json."]})]}),e.jsx("h2",{children:"Qual versão você deve usar agora"}),e.jsxs("p",{children:["Se você está começando um projeto hoje, a resposta é simples: ",e.jsx("strong",{children:"PHP 8.4"}),". Se a sua empresa ainda está em 8.1 ou 8.2, está tudo bem — são versões maduras. Se está em 7.x, você tem um problema de segurança: a série 7 está totalmente ",e.jsx("em",{children:"fora de suporte"})," desde o final de 2022."]}),e.jsx(r,{type:"danger",title:"Versões fora de suporte são risco de segurança",children:"Sem patches de segurança, qualquer CVE descoberta no interpretador fica aberta para sempre. Plataformas como WordPress, Laravel e Symfony já recusam rodar em PHP < 8.1."}),e.jsx("h2",{children:"O calendário oficial (resumido)"}),e.jsxs("p",{children:["O time do PHP segue um ciclo previsível: ",e.jsx("strong",{children:"2 anos de bugfix + 1 ano só de segurança"}),". Depois disso, a versão é EOL (End-Of-Life)."]}),e.jsx(i,{title:"suporte.txt",language:"text",code:`Versão   Lançamento   Bugfix até   Segurança até   Status
PHP 7.4  2019-11-28   2021-11-28   2022-11-28      EOL ❌
PHP 8.0  2020-11-26   2022-11-26   2023-11-26      EOL ❌
PHP 8.1  2021-11-25   2023-11-25   2025-12-31      Só segurança
PHP 8.2  2022-12-08   2024-12-08   2026-12-31      Só segurança
PHP 8.3  2023-11-23   2025-11-23   2027-12-31      Ativo ✅
PHP 8.4  2024-11-21   2026-11-21   2028-12-31      Ativo ✅ (recomendado)`}),e.jsx("h2",{children:"O salto do 7.4 para o 8.0 — por que importa tanto"}),e.jsx("p",{children:"PHP 8.0 foi quem trouxe a maioria das “coisas modernas” que hoje a gente usa todo dia. Vamos ver o mesmo problema escrito nas duas versões:"}),e.jsx(o,{filename:"produto_php74.php",code:`<?php
// PHP 7.4 — verboso, sem named args, switch tradicional
class Produto {
    private string $nome;
    private float $preco;
    private string $tipo;

    public function __construct(string $nome, float $preco, string $tipo) {
        $this->nome = $nome;
        $this->preco = $preco;
        $this->tipo = $tipo;
    }

    public function imposto(): float {
        switch ($this->tipo) {
            case 'eletronico': return $this->preco * 0.20;
            case 'livro':      return 0;
            case 'comida':     return $this->preco * 0.05;
            default:           return $this->preco * 0.10;
        }
    }
}

$p = new Produto("Kindle", 800.0, "eletronico");
echo $p->imposto();`,output:"160"}),e.jsx(o,{filename:"produto_php84.php",code:`<?php
declare(strict_types=1);

enum Tipo: string {
    case Eletronico = 'eletronico';
    case Livro      = 'livro';
    case Comida     = 'comida';
}

final readonly class Produto {
    public function __construct(
        public string $nome,
        public float $preco,
        public Tipo $tipo,
    ) {}

    public function imposto(): float {
        return match ($this->tipo) {
            Tipo::Eletronico => $this->preco * 0.20,
            Tipo::Livro      => 0.0,
            Tipo::Comida     => $this->preco * 0.05,
        };
    }
}

$p = new Produto(nome: "Kindle", preco: 800.0, tipo: Tipo::Eletronico);
echo $p->imposto();`,output:"160"}),e.jsxs("p",{children:["O resultado é o mesmo. O código 8.4 tem ",e.jsx("strong",{children:"menos repetição"}),", é ",e.jsx("strong",{children:"imutável"})," ","por padrão, e o ",e.jsx("code",{children:"match"})," é exaustivo — se você adicionar um novo case no enum e esquecer de tratar, o PHP avisa em runtime com ",e.jsx("code",{children:"UnhandledMatchError"}),"."]}),e.jsx("h2",{children:"Novidades por versão (sem decoreba)"}),e.jsx("h3",{children:"PHP 8.0 (2020)"}),e.jsxs("ul",{children:[e.jsx("li",{children:"JIT compiler."}),e.jsx("li",{children:"Constructor promotion."}),e.jsx("li",{children:"Named arguments."}),e.jsxs("li",{children:[e.jsx("code",{children:"match"})," expression."]}),e.jsxs("li",{children:["Attributes (",e.jsx("code",{children:"#[Route('/')]"}),")."]}),e.jsxs("li",{children:["Nullsafe ",e.jsx("code",{children:"?->"}),"."]}),e.jsxs("li",{children:[e.jsx("code",{children:"str_contains"}),", ",e.jsx("code",{children:"str_starts_with"}),", ",e.jsx("code",{children:"str_ends_with"}),"."]})]}),e.jsx("h3",{children:"PHP 8.1 (2021)"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Enums"})," nativos."]}),e.jsxs("li",{children:[e.jsx("code",{children:"readonly"})," properties."]}),e.jsxs("li",{children:[e.jsx("code",{children:"never"})," return type."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Fibers"})," (base para AMP, ReactPHP modernos)."]}),e.jsxs("li",{children:["First-class callable syntax: ",e.jsx("code",{children:"strlen(...)"}),"."]})]}),e.jsx(o,{filename:"enums.php",code:`<?php
declare(strict_types=1);

enum Prioridade: int {
    case Baixa  = 1;
    case Media  = 5;
    case Alta   = 10;

    public function label(): string {
        return match ($this) {
            self::Baixa => '🟢 Baixa',
            self::Media => '🟡 Média',
            self::Alta  => '🔴 Alta',
        };
    }
}

foreach (Prioridade::cases() as $p) {
    echo "{$p->value} → {$p->label()}" . PHP_EOL;
}`,output:`1 → 🟢 Baixa
5 → 🟡 Média
10 → 🔴 Alta`}),e.jsx("h3",{children:"PHP 8.2 (2022)"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"readonly"})," classes inteiras."]}),e.jsxs("li",{children:["Tipos ",e.jsx("code",{children:"true"}),", ",e.jsx("code",{children:"false"}),", ",e.jsx("code",{children:"null"})," independentes."]}),e.jsxs("li",{children:["DNF types: ",e.jsx("code",{children:"(A&B)|null"}),"."]}),e.jsx("li",{children:"Constantes em traits."})]}),e.jsx("h3",{children:"PHP 8.3 (2023)"}),e.jsxs("ul",{children:[e.jsxs("li",{children:["Constantes ",e.jsx("em",{children:"tipadas"})," em classes."]}),e.jsxs("li",{children:[e.jsx("code",{children:"json_validate()"})," nativo."]}),e.jsxs("li",{children:["Override attribute ",e.jsx("code",{children:"#[\\Override]"}),"."]}),e.jsxs("li",{children:["Linting de arquivos múltiplos com ",e.jsx("code",{children:"php -l file1 file2"}),"."]})]}),e.jsx(o,{filename:"json_validate.php",code:`<?php
declare(strict_types=1);

$payload = '{"id":1,"nome":"Ada"}';

if (json_validate($payload)) {
    $dados = json_decode($payload, true);
    echo "Olá, {$dados['nome']}!";
} else {
    echo "JSON inválido.";
}`,output:"Olá, Ada!"}),e.jsx("h3",{children:"PHP 8.4 (2024)"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Property hooks"})," — getters/setters declarativos sem boilerplate."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Asymmetric visibility"})," — propriedade ",e.jsx("code",{children:"public"})," de leitura mas ",e.jsx("code",{children:"private"})," para escrita."]}),e.jsxs("li",{children:["Novo parser HTML5 (",e.jsx("code",{children:"Dom\\HTMLDocument"}),")."]}),e.jsxs("li",{children:["Method chaining em ",e.jsx("code",{children:"new"})," sem parênteses extras: ",e.jsx("code",{children:"new Foo()->bar()"}),"."]}),e.jsxs("li",{children:[e.jsx("code",{children:"array_find"}),", ",e.jsx("code",{children:"array_find_key"}),", ",e.jsx("code",{children:"array_any"}),", ",e.jsx("code",{children:"array_all"}),"."]})]}),e.jsx(o,{filename:"asymmetric.php",code:`<?php
declare(strict_types=1);

final class Conta {
    public function __construct(
        public private(set) float $saldo = 0.0,
    ) {}

    public function depositar(float $valor): void {
        $this->saldo += $valor;
    }
}

$c = new Conta();
$c->depositar(100.50);
echo "Saldo: R$ " . number_format($c->saldo, 2, ',', '.');

// $c->saldo = 9999.99; // Erro: cannot modify private(set) property`,output:"Saldo: R$ 100,50"}),e.jsxs(r,{type:"success",title:"Para projetos novos em 2026",children:["Comece em ",e.jsx("strong",{children:"PHP 8.4"}),". Você tem suporte até 2028, todas as features modernas, e compatibilidade com qualquer framework atual (Laravel 11+, Symfony 7+, WordPress 6.4+)."]}),e.jsx("h2",{children:"Gerenciando múltiplas versões"}),e.jsx("p",{children:"Cedo ou tarde você vai trabalhar em dois projetos: um em PHP 8.1 (legado) e outro em 8.4 (novo). Não tente instalar duas versões manualmente — use um gerenciador."}),e.jsx("h3",{children:"Opção 1: asdf (recomendado, multi-linguagem)"}),e.jsx(s,{user:"dev",host:"php",cwd:"~",command:"asdf plugin add php https://github.com/asdf-community/asdf-php.git",output:`initializing plugin repository...
plugin "php" added`}),e.jsx(s,{user:"dev",host:"php",cwd:"~",command:"asdf install php 8.4.1 && asdf install php 8.1.31",output:`Downloading php-8.4.1...
Compiling php-8.4.1... done
Downloading php-8.1.31...
Compiling php-8.1.31... done`}),e.jsxs("p",{children:["Agora dentro de cada projeto você fixa a versão criando um ",e.jsx("code",{children:".tool-versions"}),":"]}),e.jsx(i,{title:".tool-versions",language:"text",code:"php 8.4.1"}),e.jsx(s,{user:"dev",host:"php",cwd:"~/projeto-novo",command:"php -v",output:`PHP 8.4.1 (cli) (built: Nov 19 2024 18:02:10) (NTS)
Copyright (c) The PHP Group
Zend Engine v4.4.1, Copyright (c) Zend Technologies`}),e.jsx("h3",{children:"Opção 2: phpenv (só PHP, estilo rbenv)"}),e.jsx(s,{user:"dev",host:"php",cwd:"~",command:"phpenv install 8.4.1 && phpenv global 8.4.1",output:`[Info]: Loaded php-build version ...
[Success]: Built 8.4.1 successfully.`}),e.jsx("h3",{children:"Opção 3 (Linux): pacotes do sistema com sufixo"}),e.jsxs("p",{children:["No Ubuntu/Debian o repositório ",e.jsx("em",{children:"ondrej/php"})," permite ter ",e.jsx("code",{children:"php8.1"}),", ",e.jsx("code",{children:"php8.3"})," ","e ",e.jsx("code",{children:"php8.4"})," instalados lado a lado:"]}),e.jsx(s,{user:"dev",host:"ubuntu",cwd:"~",command:"sudo update-alternatives --config php",output:`There are 3 choices for the alternative php (providing /usr/bin/php).

  Selection    Path             Priority   Status
------------------------------------------------------------
* 0            /usr/bin/php8.4   84        auto mode
  1            /usr/bin/php8.1   81        manual mode
  2            /usr/bin/php8.3   83        manual mode
  3            /usr/bin/php8.4   84        manual mode

Press <enter> to keep the current choice, or type selection number:`}),e.jsx("h2",{children:"O que evitar"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"PHP 5.x e 7.x em produção."})," EOL absoluto. Migre."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Dependências sem suporte para a versão alvo."})," Antes de subir para 8.4, rode ",e.jsx("code",{children:"composer outdated"})," e ",e.jsx("code",{children:"composer audit"}),"."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Misturar versões com Docker e local."})," Padronize: ou tudo via ",e.jsx("code",{children:"asdf"})," ","ou tudo via container. Nunca os dois esquecidos um do outro."]})]}),e.jsx("h2",{children:"Verificando o que você tem"}),e.jsx(s,{user:"dev",host:"php",cwd:"~",command:"php -v && php -m | head -20",output:`PHP 8.4.1 (cli) (built: Nov 19 2024 18:02:10) (NTS)
Copyright (c) The PHP Group
Zend Engine v4.4.1, Copyright (c) Zend Technologies
    with Zend OPcache v8.4.1

[PHP Modules]
Core
ctype
curl
date
dom
fileinfo
filter
hash
iconv
json
libxml
mbstring
openssl
pcre
PDO
pdo_mysql
pdo_pgsql
Phar`}),e.jsxs("p",{children:["No próximo capítulo a gente ",e.jsx("strong",{children:"instala o PHP do zero"})," em Linux, macOS e Windows (com plano B usando Docker, sempre que der tilt)."]})]})}export{c as default};
