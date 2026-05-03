import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Argumentos() {
  return (
    <PageContainer
      title="Argumentos: default, named, variadic"
      subtitle="Como dar superpoderes às suas assinaturas: valores padrão, argumentos nomeados (8.0), variadic com ...$args, splat na chamada e readonly em constructor promotion (8.1+)."
      difficulty="intermediario"
      timeToRead="11 min"
      category="Funções"
    >
      <AlertBox type="info" title="Pré-requisitos">
        <p>Antes deste capítulo, é bom já ter visto: <a href="#/funcoes" className="text-[#8993BE] underline">Funções básicas</a>, <a href="#/type-hints" className="text-[#8993BE] underline">Type hints</a>, <a href="#/arrow-functions" className="text-[#8993BE] underline">Arrow functions</a>.</p>
      </AlertBox>
      <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"Posicionais"}</strong> {' — '} {"passados na ordem: f(1, 2, 3)."}
          </li>
        <li>
            <strong>{"Nomeados (PHP 8)"}</strong> {' — '} {"f(nome: \"Ana\", idade: 30) — independem da ordem."}
          </li>
        <li>
            <strong>{"Spread"}</strong> {' — '} {"f(...$array) — desempacota array em argumentos."}
          </li>
        <li>
            <strong>{"By value vs reference"}</strong> {' — '} {"function f(&$x) — modificações dentro afetam o original."}
          </li>
        <li>
            <strong>{"Type hints"}</strong> {' — '} {"function f(int $x, ?string $y) — validados em runtime."}
          </li>
        </ul>
    
      <h2>O problema: assinaturas que crescem fora de controle</h2>
      <p>
        Quando uma função aceita 5 ou 6 parâmetros, lembrar a ordem certa de cada um vira pesadelo.
        E pior: alterar a posição de um parâmetro quebra todo mundo que chama a função. Os recursos
        de argumentos modernos do PHP existem para resolver isso — você passa só o que precisa, na
        ordem que quiser, e os defaults cuidam do resto.
      </p>

      <PhpBlock
        filename="problema.php"
        code={`<?php
declare(strict_types=1);

// 5 parâmetros, fácil de errar a ordem
function criarUsuario(
    string $nome,
    string $email,
    bool $ativo = true,
    string $papel = "user",
    ?string $telefone = null,
): array {
    return compact("nome", "email", "ativo", "papel", "telefone");
}

print_r(criarUsuario("Ada", "ada@exemplo.dev"));`}
        output={`Array
(
    [nome] => Ada
    [email] => ada@exemplo.dev
    [ativo] => 1
    [papel] => user
    [telefone] =>
)`}
      />

      <h2>Valores padrão</h2>
      <p>
        Qualquer parâmetro pode ter um valor padrão usando <code>=</code>. O default só é usado
        quando o argumento <strong>não é passado</strong>. A regra clássica era "parâmetros com
        default vêm sempre por último" — com argumentos nomeados isso ficou mais flexível, mas
        ainda é a convenção.
      </p>

      <PhpBlock
        filename="defaults.php"
        code={`<?php
declare(strict_types=1);

function formatarPreco(
    float $valor,
    string $moeda = "BRL",
    int $casas = 2,
    string $separador = ","
): string {
    $formatado = number_format($valor, $casas, $separador, ".");
    return "{$moeda} {$formatado}";
}

echo formatarPreco(1234.5) . PHP_EOL;
echo formatarPreco(1234.5, "USD") . PHP_EOL;
echo formatarPreco(1234.5, "EUR", 3) . PHP_EOL;
echo formatarPreco(1234.5, "JPY", 0) . PHP_EOL;`}
        output={`BRL 1.234,50
USD 1.234,50
EUR 1.234,500
JPY 1.235`}
      />

      <AlertBox type="warning" title="Defaults precisam ser constantes em tempo de compilação">
        Você pode usar literais (<code>"BRL"</code>, <code>2</code>, <code>true</code>, arrays
        literais) e constantes (<code>PHP_INT_MAX</code>). Mas <strong>não pode</strong> chamar
        funções no default (<code>$x = time()</code> não funciona). Para isso, use{" "}
        <code>?Tipo $x = null</code> e calcule dentro da função.
      </AlertBox>

      <h2>Named arguments (PHP 8.0+): chame pelo nome</h2>

      <p><strong className="text-[#8993BE] font-mono">named arguments</strong> — passe argumentos pelo nome do parâmetro, não pela posição (PHP 8.0+). Existe para auto-documentar chamadas com muitos parâmetros e pular opcionais sem se preocupar com ordem. Sintaxe: <code>{`func(nome: "Ada", idade: 30)`}</code>. Posicionais sempre vêm antes dos nomeados.</p>

      <p>
        Em vez de decorar a posição, passe o nome do parâmetro com <code>nome: valor</code>. Você
        pode misturar posicionais (sempre antes) com nomeados, e pular qualquer parâmetro que tenha
        default.
      </p>

      <PhpBlock
        filename="nomeados.php"
        code={`<?php
declare(strict_types=1);

function formatarPreco(
    float $valor,
    string $moeda = "BRL",
    int $casas = 2,
    string $separador = ","
): string {
    $formatado = number_format($valor, $casas, $separador, ".");
    return "{$moeda} {$formatado}";
}

// pulando "moeda" e "casas" — só mudando o separador
echo formatarPreco(1234.5, separador: ".") . PHP_EOL;

// posicional + nomeado
echo formatarPreco(1234.5, "USD", casas: 4) . PHP_EOL;

// fica auto-documentado
echo formatarPreco(
    valor: 99.9,
    moeda: "EUR",
    casas: 2
);`}
        output={`BRL 1.234.50
USD 1.234,5000
EUR 99,90`}
      />

      <AlertBox type="info" title="Named args mudam o jogo da compatibilidade">
        Como agora você chama parâmetros pelo nome, <strong>renomear um parâmetro vira breaking
        change</strong>. Em bibliotecas públicas, escolha nomes pensados para durar.
      </AlertBox>

      <h2>Variadic: aceitando N argumentos com ...$args</h2>

      <p><strong className="text-[#8993BE] font-mono">...$args (variadic)</strong> — coleta um número variável de argumentos em um array. Existe para funções que aceitam N valores (somar, juntar, log com vários campos). Sintaxe: <code>{`function f(int ...$nums) { ... }`}</code>. É <strong>sempre o último parâmetro</strong> e pode ter type hint — todos os valores são validados.</p>

      <p>
        Coloque <code>...</code> antes do nome do parâmetro para receber um número variável de
        valores como array. Ele <strong>obrigatoriamente</strong> é o último parâmetro. Pode (e
        deve) ter type hint — todos os valores serão validados.
      </p>

      <PhpBlock
        filename="variadic.php"
        code={`<?php
declare(strict_types=1);

function somar(int ...$numeros): int {
    return array_sum($numeros);
}

function juntar(string $separador, string ...$partes): string {
    return implode($separador, $partes);
}

echo somar(1, 2, 3) . PHP_EOL;
echo somar(10, 20, 30, 40, 50) . PHP_EOL;
echo somar() . PHP_EOL; // zero argumentos é válido
echo juntar(" / ", "casa", "trabalho", "academia") . PHP_EOL;`}
        output={`6
150
0
casa / trabalho / academia`}
      />

      <h2>Splat: explodindo um array na chamada</h2>
      <p>
        O mesmo <code>...</code> funciona <em>na chamada</em> da função: ele explode um array nos
        argumentos posicionais. Funciona com qualquer função, não só com variadic.
      </p>

      <PhpBlock
        filename="splat.php"
        code={`<?php
declare(strict_types=1);

function multiplicar(int $a, int $b, int $c): int {
    return $a * $b * $c;
}

$valores = [2, 3, 4];
echo multiplicar(...$valores) . PHP_EOL;

function somarTudo(int ...$ns): int {
    return array_sum($ns);
}

$grupo1 = [1, 2, 3];
$grupo2 = [10, 20];

// combinando arrays no splat
echo somarTudo(...$grupo1, ...$grupo2) . PHP_EOL;

// PHP 8.1+: splat com chaves nomeadas vira named args
$config = ["b" => 100, "a" => 1, "c" => 10];
echo multiplicar(...$config);`}
        output={`24
36
1000`}
      />

      <AlertBox type="success" title="Splat com chaves string vira named arguments">
        A partir do PHP 8.1, se o array tem chaves string, o splat as trata como nomes de
        parâmetros. Isso é poderoso para passar configurações sem se preocupar com a ordem.
      </AlertBox>

      <h2>Constructor promotion + readonly (PHP 8.1+)</h2>
      <p>
        A combinação que mudou como escrevemos classes em PHP: declarar visibilidade no parâmetro
        do construtor cria a propriedade automaticamente. Adicionar <code>readonly</code> a impede
        de ser modificada depois de criada — você ganha imutabilidade quase de graça.
      </p>

      <PhpBlock
        filename="promotion.php"
        code={`<?php
declare(strict_types=1);

final class Pedido {
    public function __construct(
        public readonly string $id,
        public readonly string $cliente,
        public readonly float $total,
        public readonly string $status = "pendente",
    ) {}
}

$p = new Pedido(
    id: "PED-001",
    cliente: "Wallyson",
    total: 199.90,
);

echo "Pedido {$p->id} de {$p->cliente}: R$ {$p->total} ({$p->status})";

try {
    // tentar modificar dispara erro em runtime
    $p->status = "pago";
} catch (Error $e) {
    echo PHP_EOL . "erro: " . $e->getMessage();
}`}
        output={`Pedido PED-001 de Wallyson: R$ 199.9 (pendente)
erro: Cannot modify readonly property Pedido::$status`}
      />

      <h2>Caso real: factory com argumentos nomeados</h2>
      <p>
        Junte tudo: defaults, named arguments, variadic e readonly promotion. Você ganha um
        construtor expressivo, seguro e fácil de evoluir sem quebrar callers.
      </p>

      <PhpBlock
        filename="email.php"
        code={`<?php
declare(strict_types=1);

final class Email {
    public function __construct(
        public readonly string $de,
        public readonly string $assunto,
        public readonly string $corpo,
        public readonly array $para,
        public readonly array $cc = [],
        public readonly array $bcc = [],
        public readonly bool $html = false,
    ) {}

    public function preview(): string {
        $destinatarios = implode(", ", $this->para);
        $tipo = $this->html ? "HTML" : "texto";
        return "[{$tipo}] De: {$this->de} | Para: {$destinatarios} | Assunto: {$this->assunto}";
    }
}

$msg = new Email(
    de: "no-reply@exemplo.dev",
    assunto: "Bem-vindo!",
    corpo: "<h1>Oi!</h1>",
    para: ["ada@exemplo.dev", "linus@exemplo.dev"],
    cc: ["log@exemplo.dev"],
    html: true,
);

echo $msg->preview();`}
        output={`[HTML] De: no-reply@exemplo.dev | Para: ada@exemplo.dev, linus@exemplo.dev | Assunto: Bem-vindo!`}
      />

      <h2>Verificando o suporte da sua versão</h2>
      <p>
        Named arguments: PHP 8.0+. Readonly em propriedades: PHP 8.1+. Readonly classes: PHP 8.2+.
        Confirme com:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos"
        command="php -v"
        output={`PHP 8.4.1 (cli) (built: Nov 21 2024 12:34:56) (NTS)
Copyright (c) The PHP Group`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos"
        command="php email.php"
        output={`[HTML] De: no-reply@exemplo.dev | Para: ada@exemplo.dev, linus@exemplo.dev | Assunto: Bem-vindo!`}
      />

      <h2>Resumo prático</h2>
      <ul>
        <li>Use <strong>defaults</strong> para parâmetros opcionais — sempre por último na ordem.</li>
        <li>Prefira <strong>named arguments</strong> quando a chamada tem 3+ parâmetros: vira documentação.</li>
        <li><strong>Variadic</strong> (<code>...$args</code>) coleta N valores em array; é sempre o último.</li>
        <li><strong>Splat</strong> na chamada (<code>foo(...$arr)</code>) explode arrays em argumentos posicionais ou nomeados.</li>
        <li><strong>Constructor promotion + readonly</strong> entrega imutabilidade e concisão sem boilerplate.</li>
      </ul>

      <p>
        Com isso fechamos a trilha de funções. Próximos capítulos a gente entra de cabeça em{" "}
        <strong>orientação a objetos</strong> moderna em PHP — onde o readonly promotion brilha de
        verdade.
      </p>
    </PageContainer>
  );
}
