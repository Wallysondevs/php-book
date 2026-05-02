import{j as e}from"./index-Bb4MiiJL.js";import{P as r,a as s,A as o}from"./AlertBox-BpD-xIsb.js";import{T as a}from"./TerminalBlock-DGurMC1r.js";function t(){return e.jsxs(r,{title:"História do PHP",subtitle:"De um conjunto de scripts CGI escritos por Rasmus Lerdorf em 1994 para contar visitas no currículo dele, até o PHP 8.4 com JIT — a jornada da linguagem que silenciosamente roda a maior parte da web.",difficulty:"iniciante",timeToRead:"10 min",category:"Introdução",children:[e.jsx("h2",{children:"1994: o currículo de Rasmus"}),e.jsxs("p",{children:["Tudo começou quando o dinamarquês-canadense ",e.jsx("strong",{children:"Rasmus Lerdorf"})," precisava de algo simples: contar quantas pessoas visitavam a página do currículo dele. Ele escreveu uns scripts em C que rodavam como CGI e batizou o conjunto de ",e.jsx("strong",{children:"Personal Home Page Tools"})," — a sigla original do PHP. O ano: 1994. A web ainda usava modems discados."]}),e.jsx(s,{filename:"php_v1_estilo.php",code:`<!--include /home/rasmus/contador.html-->
<!--exec cmd="date"-->
<!--echo $REMOTE_ADDR-->`}),e.jsxs("p",{children:["Era assim a cara da PHP/FI 1.0: tags HTML especiais que o interpretador substituía por valores dinâmicos. Mais um motor de templates do que uma linguagem de programação. Ainda assim, a ideia de ",e.jsx("em",{children:"“embutir lógica dentro do HTML”"})," ficou para sempre no DNA do PHP."]}),e.jsx("h2",{children:"1997 — PHP 3 e a reescrita de Andi e Zeev"}),e.jsxs("p",{children:["Dois estudantes israelenses, ",e.jsx("strong",{children:"Andi Gutmans"})," e ",e.jsx("strong",{children:"Zeev Suraski"}),", precisavam de uma linguagem decente para construir um sistema de e-commerce. Olharam para o PHP/FI 2 e pensaram: “isso aqui não escala”. Reescreveram o parser do zero e lançaram o",e.jsx("strong",{children:" PHP 3"})," em 1997 — agora com ",e.jsx("em",{children:"extensibilidade real"}),", suporte a banco de dados e a sintaxe ",e.jsx("code",{children:"<?php ?>"})," que sobrevive até hoje."]}),e.jsx(s,{filename:"php3_estilo.php",code:`<?php
$conexao = mysql_connect("localhost", "root", "");
mysql_select_db("loja");
$resultado = mysql_query("SELECT nome FROM produtos");
while ($linha = mysql_fetch_array($resultado)) {
    echo $linha["nome"] . "<br>";
}
?>`}),e.jsxs(o,{type:"warning",title:"Por que isso parece datado",children:["Funções ",e.jsx("code",{children:"mysql_*"})," foram removidas em PHP 7. Hoje usamos ",e.jsx("code",{children:"PDO"})," com prepared statements. Mas é importante reconhecer este estilo: bilhões de linhas de código legado por aí ainda parecem com isso."]}),e.jsx("h2",{children:"2000 — PHP 4 e o nascimento do Zend Engine"}),e.jsxs("p",{children:["Andi e Zeev separaram a parte de ",e.jsx("em",{children:"execução"})," do parser, criando um motor independente: o ",e.jsx("strong",{children:"Zend Engine"})," (Zend = Zeev + Andi). PHP 4 foi a versão que ",e.jsx("em",{children:"levou o PHP a sério"})," — caching de opcodes, sessões nativas, e desempenho muito superior. Foi nessa época que apareceram WordPress, MediaWiki, phpBB."]}),e.jsx("h2",{children:"2004 — PHP 5 e a chegada do OOP de verdade"}),e.jsxs("p",{children:["PHP 5 (Zend Engine 2) trouxe o que faltava para o PHP virar uma linguagem profissional: objetos por referência, modificadores de visibilidade, interfaces, exceções, namespaces (no 5.3), traits (5.4), e o operador ",e.jsx("code",{children:"?:"})," curto. O PHP deixou de ser “script para iniciantes” e virou base de frameworks como ",e.jsx("strong",{children:"Symfony"})," e",e.jsx("strong",{children:" Laravel"}),"."]}),e.jsx(s,{filename:"php5_oop.php",code:`<?php
namespace App\\Models;

class Produto {
    private $nome;
    private $preco;

    public function __construct($nome, $preco) {
        $this->nome = $nome;
        $this->preco = $preco;
    }

    public function format() {
        return sprintf("%s — R$ %.2f", $this->nome, $this->preco);
    }
}

$p = new Produto("Café", 24.90);
echo $p->format();`,output:"Café — R$ 24.90"}),e.jsx("h2",{children:"2015 — PHP 7 e o salto de performance"}),e.jsxs("p",{children:["O número 6 foi pulado (longa história: virou um experimento abandonado de Unicode). PHP 7 chegou com o ",e.jsx("strong",{children:"PHPNG"})," — um motor refatorado que ",e.jsx("strong",{children:"dobrou a velocidade"}),"do PHP 5.6 e cortou o uso de memória pela metade. O Facebook tinha pressionado o ecossistema com o HHVM; o time do PHP respondeu à altura."]}),e.jsxs("p",{children:["Junto vieram as ",e.jsx("em",{children:"scalar type declarations"}),", return types, o operador ",e.jsx("code",{children:"??"})," ","e a ",e.jsx("em",{children:"spaceship"})," ",e.jsx("code",{children:"<=>"}),". PHP virou, finalmente, uma linguagem com tipos."]}),e.jsx(s,{filename:"php7_tipos.php",code:`<?php
declare(strict_types=1);

function somar(int $a, int $b): int {
    return $a + $b;
}

$config = $usuario['nome'] ?? 'anônimo';
$ordem = [3, 1, 2];
usort($ordem, fn(int $a, int $b) => $a <=> $b);

echo somar(2, 3) . PHP_EOL;
echo $config . PHP_EOL;
echo implode(",", $ordem);`,output:`5
anônimo
1,2,3`}),e.jsx("h2",{children:"2020 — PHP 8 e a era moderna"}),e.jsx("p",{children:"PHP 8.0 foi um divisor de águas. Trouxe coisas que a comunidade pedia há anos:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"JIT"})," (Just-In-Time compilation) — código matemático/CPU-bound 3x mais rápido."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Named arguments"})," — chamar funções sem decorar a ordem dos parâmetros."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Constructor promotion"})," — construtores em uma linha."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Match expression"})," — switch decente, com retorno e sem fall-through."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Attributes"})," — metadados nativos (substitui anotações em comentário)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Nullsafe operator"})," ",e.jsx("code",{children:"?->"}),"."]})]}),e.jsx(s,{filename:"php8_moderno.php",code:`<?php
declare(strict_types=1);

enum Status: string {
    case Ativo   = 'ativo';
    case Pausado = 'pausado';
}

final class Cliente {
    public function __construct(
        public readonly string $nome,
        public readonly Status $status = Status::Ativo,
    ) {}
}

$c = new Cliente(nome: "Ada Lovelace");

echo match ($c->status) {
    Status::Ativo   => "{$c->nome} está ativo",
    Status::Pausado => "{$c->nome} está pausado",
};`,output:"Ada Lovelace está ativo"}),e.jsx(o,{type:"success",title:"Compare com a era PHP 5",children:"O mesmo código “Cliente com status” em PHP 5 levaria 25+ linhas, getters/setters manuais e uma constante de classe para o status. PHP 8.x reduziu o ruído drasticamente."}),e.jsx("h2",{children:"2021–2024 — PHP 8.1, 8.2, 8.3, 8.4"}),e.jsx("p",{children:"Cada release anual trouxe melhorias incrementais sólidas:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"8.1"})," — Enums nativos, ",e.jsx("code",{children:"readonly"})," properties, ",e.jsx("code",{children:"never"})," return type, fibers."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"8.2"})," — ",e.jsx("code",{children:"readonly"})," classes, ",e.jsx("code",{children:"true"}),"/",e.jsx("code",{children:"false"}),"/",e.jsx("code",{children:"null"})," como tipos, DNF types."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"8.3"})," — Constantes tipadas em classes, ",e.jsx("code",{children:"json_validate()"}),", clone profundo de readonly."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"8.4"})," — ",e.jsx("em",{children:"Property hooks"})," (getters/setters declarativos), ",e.jsx("em",{children:"asymmetric visibility"}),", novo HTML5 parser."]})]}),e.jsx(s,{filename:"php84_property_hooks.php",code:`<?php
declare(strict_types=1);

final class Temperatura {
    public function __construct(
        public float $celsius {
            set => round($value, 1);
        }
    ) {}

    public float $fahrenheit {
        get => $this->celsius * 9 / 5 + 32;
    }
}

$t = new Temperatura(36.789);
echo $t->celsius . "°C" . PHP_EOL;
echo $t->fahrenheit . "°F";`,output:`36.8°C
98.24°F`}),e.jsx("h2",{children:"Verificando a versão na sua máquina"}),e.jsx(a,{user:"dev",host:"php",cwd:"~",command:"php -v",output:`PHP 8.4.1 (cli) (built: Nov 19 2024 18:02:10) (NTS)
Copyright (c) The PHP Group
Zend Engine v4.4.1, Copyright (c) Zend Technologies
    with Zend OPcache v8.4.1, Copyright (c), by Zend Technologies`}),e.jsx("h2",{children:"Como o PHP virou a língua franca da web"}),e.jsx("p",{children:"Três fatores explicam por que o PHP roda tanta coisa:"}),e.jsxs("ol",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Hospedagem barata"}),". Nos anos 2000, qualquer hospedagem compartilhada de R$ 5/mês já vinha com Apache + PHP + MySQL. Era só fazer upload por FTP e funcionava."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"WordPress"}),". Lançado em 2003, hoje roda mais de 40% de toda a web pública. Sozinho, ele justifica milhões de empregos PHP."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Composer + Laravel"}),". A partir de 2012 o ecossistema ficou moderno: gerenciador de dependências sério, frameworks excelentes, padrões PSR. PHP virou prazer de escrever."]})]}),e.jsx(o,{type:"info",title:"Quem usa PHP hoje",children:"Wikipedia, WordPress.com, Mailchimp, Slack (parte), Etsy, Tumblr, Vimeo, Wikimedia. Em larga escala. PHP é a linguagem que ninguém comenta sobre, mas que está sempre lá."}),e.jsx("h2",{children:"Linha do tempo enxuta"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"1994"})," — Rasmus escreve PHP/FI para contar visitas no currículo."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"1997"})," — PHP 3 (Andi + Zeev). Sintaxe ",e.jsx("code",{children:"<?php>"})," nasce."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"2000"})," — PHP 4 + Zend Engine. Sessões, opcodes."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"2004"})," — PHP 5. OOP “de verdade”, exceções, PDO."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"2009–2014"})," — Namespaces, traits, generators, Composer."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"2015"})," — PHP 7. 2x mais rápido. Tipos escalares."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"2020"})," — PHP 8. JIT, match, attributes, promotion."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"2021–2024"})," — Enums, readonly, property hooks (8.4)."]})]}),e.jsxs("p",{children:["No próximo capítulo a gente responde a pergunta justa: ",e.jsx("strong",{children:"“Mas faz sentido aprender PHP em 2026?”"}),"Spoiler: sim, e não é por nostalgia."]})]})}export{t as default};
