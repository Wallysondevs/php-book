import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Historia() {
  return (
    <PageContainer
      title="História do PHP"
      subtitle="De um conjunto de scripts CGI escritos por Rasmus Lerdorf em 1994 para contar visitas no currículo dele, até o PHP 8.4 com JIT — a jornada da linguagem que silenciosamente roda a maior parte da web."
      difficulty="iniciante"
      timeToRead="10 min"
      category="Introdução"
    >
      <h2>1994: o currículo de Rasmus</h2>
      <p>
        Tudo começou quando o dinamarquês-canadense <strong>Rasmus Lerdorf</strong> precisava de algo
        simples: contar quantas pessoas visitavam a página do currículo dele. Ele escreveu uns scripts
        em C que rodavam como CGI e batizou o conjunto de <strong>Personal Home Page Tools</strong> —
        a sigla original do PHP. O ano: 1994. A web ainda usava modems discados.
      </p>

      <PhpBlock
        filename="php_v1_estilo.php"
        code={`<!--include /home/rasmus/contador.html-->
<!--exec cmd="date"-->
<!--echo $REMOTE_ADDR-->`}
      />

      <p>
        Era assim a cara da PHP/FI 1.0: tags HTML especiais que o interpretador substituía por valores
        dinâmicos. Mais um motor de templates do que uma linguagem de programação. Ainda assim,
        a ideia de <em>“embutir lógica dentro do HTML”</em> ficou para sempre no DNA do PHP.
      </p>

      <h2>1997 — PHP 3 e a reescrita de Andi e Zeev</h2>
      <p>
        Dois estudantes israelenses, <strong>Andi Gutmans</strong> e <strong>Zeev Suraski</strong>,
        precisavam de uma linguagem decente para construir um sistema de e-commerce. Olharam para o
        PHP/FI 2 e pensaram: “isso aqui não escala”. Reescreveram o parser do zero e lançaram o
        <strong> PHP 3</strong> em 1997 — agora com <em>extensibilidade real</em>, suporte a banco de dados
        e a sintaxe <code>&lt;?php ?&gt;</code> que sobrevive até hoje.
      </p>

      <PhpBlock
        filename="php3_estilo.php"
        code={`<?php
$conexao = mysql_connect("localhost", "root", "");
mysql_select_db("loja");
$resultado = mysql_query("SELECT nome FROM produtos");
while ($linha = mysql_fetch_array($resultado)) {
    echo $linha["nome"] . "<br>";
}
?>`}
      />

      <AlertBox type="warning" title="Por que isso parece datado">
        Funções <code>mysql_*</code> foram removidas em PHP 7. Hoje usamos <code>PDO</code> com
        prepared statements. Mas é importante reconhecer este estilo: bilhões de linhas de código
        legado por aí ainda parecem com isso.
      </AlertBox>

      <h2>2000 — PHP 4 e o nascimento do Zend Engine</h2>
      <p>
        Andi e Zeev separaram a parte de <em>execução</em> do parser, criando um motor independente:
        o <strong>Zend Engine</strong> (Zend = Zeev + Andi). PHP 4 foi a versão que <em>levou o PHP a
        sério</em> — caching de opcodes, sessões nativas, e desempenho muito superior. Foi nessa época
        que apareceram WordPress, MediaWiki, phpBB.
      </p>

      <h2>2004 — PHP 5 e a chegada do OOP de verdade</h2>
      <p>
        PHP 5 (Zend Engine 2) trouxe o que faltava para o PHP virar uma linguagem profissional:
        objetos por referência, modificadores de visibilidade, interfaces, exceções, namespaces
        (no 5.3), traits (5.4), e o operador <code>?:</code> curto. O PHP deixou de ser “script
        para iniciantes” e virou base de frameworks como <strong>Symfony</strong> e
        <strong> Laravel</strong>.
      </p>

      <PhpBlock
        filename="php5_oop.php"
        code={`<?php
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
echo $p->format();`}
        output={`Café — R$ 24.90`}
      />

      <h2>2015 — PHP 7 e o salto de performance</h2>
      <p>
        O número 6 foi pulado (longa história: virou um experimento abandonado de Unicode). PHP 7
        chegou com o <strong>PHPNG</strong> — um motor refatorado que <strong>dobrou a velocidade</strong>
        do PHP 5.6 e cortou o uso de memória pela metade. O Facebook tinha pressionado o ecossistema
        com o HHVM; o time do PHP respondeu à altura.
      </p>
      <p>Junto vieram as <em>scalar type declarations</em>, return types, o operador <code>??</code>{" "}
      e a <em>spaceship</em> <code>&lt;=&gt;</code>. PHP virou, finalmente, uma linguagem com tipos.</p>

      <PhpBlock
        filename="php7_tipos.php"
        code={`<?php
declare(strict_types=1);

function somar(int $a, int $b): int {
    return $a + $b;
}

$config = $usuario['nome'] ?? 'anônimo';
$ordem = [3, 1, 2];
usort($ordem, fn(int $a, int $b) => $a <=> $b);

echo somar(2, 3) . PHP_EOL;
echo $config . PHP_EOL;
echo implode(",", $ordem);`}
        output={`5
anônimo
1,2,3`}
      />

      <h2>2020 — PHP 8 e a era moderna</h2>
      <p>
        PHP 8.0 foi um divisor de águas. Trouxe coisas que a comunidade pedia há anos:
      </p>
      <ul>
        <li><strong>JIT</strong> (Just-In-Time compilation) — código matemático/CPU-bound 3x mais rápido.</li>
        <li><strong>Named arguments</strong> — chamar funções sem decorar a ordem dos parâmetros.</li>
        <li><strong>Constructor promotion</strong> — construtores em uma linha.</li>
        <li><strong>Match expression</strong> — switch decente, com retorno e sem fall-through.</li>
        <li><strong>Attributes</strong> — metadados nativos (substitui anotações em comentário).</li>
        <li><strong>Nullsafe operator</strong> <code>?-&gt;</code>.</li>
      </ul>

      <PhpBlock
        filename="php8_moderno.php"
        code={`<?php
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
};`}
        output={`Ada Lovelace está ativo`}
      />

      <AlertBox type="success" title="Compare com a era PHP 5">
        O mesmo código “Cliente com status” em PHP 5 levaria 25+ linhas, getters/setters manuais e
        uma constante de classe para o status. PHP 8.x reduziu o ruído drasticamente.
      </AlertBox>

      <h2>2021–2024 — PHP 8.1, 8.2, 8.3, 8.4</h2>
      <p>
        Cada release anual trouxe melhorias incrementais sólidas:
      </p>
      <ul>
        <li><strong>8.1</strong> — Enums nativos, <code>readonly</code> properties, <code>never</code> return type, fibers.</li>
        <li><strong>8.2</strong> — <code>readonly</code> classes, <code>true</code>/<code>false</code>/<code>null</code> como tipos, DNF types.</li>
        <li><strong>8.3</strong> — Constantes tipadas em classes, <code>json_validate()</code>, clone profundo de readonly.</li>
        <li><strong>8.4</strong> — <em>Property hooks</em> (getters/setters declarativos), <em>asymmetric visibility</em>, novo HTML5 parser.</li>
      </ul>

      <PhpBlock
        filename="php84_property_hooks.php"
        code={`<?php
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
echo $t->fahrenheit . "°F";`}
        output={`36.8°C
98.24°F`}
      />

      <h2>Verificando a versão na sua máquina</h2>
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

      <h2>Como o PHP virou a língua franca da web</h2>
      <p>
        Três fatores explicam por que o PHP roda tanta coisa:
      </p>
      <ol>
        <li>
          <strong>Hospedagem barata</strong>. Nos anos 2000, qualquer hospedagem compartilhada de
          R$ 5/mês já vinha com Apache + PHP + MySQL. Era só fazer upload por FTP e funcionava.
        </li>
        <li>
          <strong>WordPress</strong>. Lançado em 2003, hoje roda mais de 40% de toda a web pública.
          Sozinho, ele justifica milhões de empregos PHP.
        </li>
        <li>
          <strong>Composer + Laravel</strong>. A partir de 2012 o ecossistema ficou moderno: gerenciador
          de dependências sério, frameworks excelentes, padrões PSR. PHP virou prazer de escrever.
        </li>
      </ol>

      <AlertBox type="info" title="Quem usa PHP hoje">
        Wikipedia, WordPress.com, Mailchimp, Slack (parte), Etsy, Tumblr, Vimeo, Wikimedia. Em larga
        escala. PHP é a linguagem que ninguém comenta sobre, mas que está sempre lá.
      </AlertBox>

      <h2>Linha do tempo enxuta</h2>
      <ul>
        <li><strong>1994</strong> — Rasmus escreve PHP/FI para contar visitas no currículo.</li>
        <li><strong>1997</strong> — PHP 3 (Andi + Zeev). Sintaxe <code>&lt;?php&gt;</code> nasce.</li>
        <li><strong>2000</strong> — PHP 4 + Zend Engine. Sessões, opcodes.</li>
        <li><strong>2004</strong> — PHP 5. OOP “de verdade”, exceções, PDO.</li>
        <li><strong>2009–2014</strong> — Namespaces, traits, generators, Composer.</li>
        <li><strong>2015</strong> — PHP 7. 2x mais rápido. Tipos escalares.</li>
        <li><strong>2020</strong> — PHP 8. JIT, match, attributes, promotion.</li>
        <li><strong>2021–2024</strong> — Enums, readonly, property hooks (8.4).</li>
      </ul>

      <p>
        No próximo capítulo a gente responde a pergunta justa: <strong>“Mas faz sentido aprender PHP em 2026?”</strong>
        Spoiler: sim, e não é por nostalgia.
      </p>
    </PageContainer>
  );
}
