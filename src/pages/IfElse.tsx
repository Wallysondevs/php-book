import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function IfElse() {
  return (
    <PageContainer
      title="if / else / elseif"
      subtitle="A estrutura mais básica de controle de fluxo, a sintaxe alternativa para templates, ternário, null coalescing e a tabela de truthy/falsy que todo dev PHP precisa decorar."
      difficulty="iniciante"
      timeToRead="8 min"
      category="Controle de Fluxo"
    >
      <AlertBox type="info" title="Pré-requisitos">
        <p>Antes deste capítulo, é bom já ter visto: <a href="#/sintaxe" className="text-[#8993BE] underline">Sintaxe básica</a>, <a href="#/variaveis" className="text-[#8993BE] underline">Variáveis</a>, <a href="#/operadores" className="text-[#8993BE] underline">Operadores</a>.</p>
      </AlertBox>

      <h2>O if que você já conhece</h2>

      <p><strong className="text-[#8993BE] font-mono">if / elseif / else</strong> — bloco de decisão. <code>if</code> testa a condição; se for verdadeira executa o bloco. <code>elseif</code> (uma palavra só) encadeia outra condição quando a anterior falhou. <code>else</code> é o "qualquer outra coisa". Sintaxe: <code>{`if (cond) { ... } elseif (cond2) { ... } else { ... }`}</code>.</p>
      <p>
        A estrutura é igual à de qualquer linguagem da família C. O que muda em PHP é o <strong>conceito de
        truthy/falsy</strong> — e ele tem algumas pegadinhas que vamos ver já já.
      </p>

      <PhpBlock
        filename="if-basico.php"
        code={`<?php
declare(strict_types=1);

$idade = 17;

if ($idade >= 18) {
    echo "Maior de idade";
} elseif ($idade >= 16) {
    echo "Pode votar facultativamente";
} else {
    echo "Menor de 16";
}
echo PHP_EOL;`}
        output={`Pode votar facultativamente`}
      />

      <p>
        Repare: é <code>elseif</code> (uma palavra) — não <code>else if</code>. Os dois funcionam, mas
        <code> elseif</code> é a forma idiomática e a única aceita pela sintaxe alternativa que veremos a seguir.
      </p>

      <h2>Sintaxe alternativa (a que aparece em templates)</h2>
      <p>
        Em vez de chaves, você abre com <code>:</code> e fecha com <code>endif</code>. Parece exótico até você
        editar uma view de WordPress, Laravel Blade compilado ou um arquivo PHP cheio de HTML — aí você entende.
        Sem chaves, o HTML fica muito mais legível.
      </p>

      <PhpBlock
        filename="alternativa.php"
        code={`<?php
declare(strict_types=1);

$logado = true;
$nome = "Ada";
?>
<nav>
<?php if ($logado): ?>
    <span>Olá, <?= $nome ?></span>
    <a href="/sair">Sair</a>
<?php else: ?>
    <a href="/entrar">Entrar</a>
<?php endif; ?>
</nav>`}
        output={`<nav>
    <span>Olá, Ada</span>
    <a href="/sair">Sair</a>
</nav>`}
      />

      <AlertBox type="info" title="Quando usar cada uma?">
        Use <strong>chaves</strong> em código de lógica (classes, services, scripts CLI). Use a
        <strong> alternativa</strong> em arquivos que misturam HTML e PHP. Misturar os dois estilos no mesmo arquivo
        é considerado má prática.
      </AlertBox>

      <h2>Truthy e falsy: a tabela que muda tudo</h2>
      <p>
        PHP converte qualquer expressão para booleano quando ela aparece em um <code>if</code>. As regras não são
        óbvias e vivem causando bugs. Decore esta lista de valores <strong>falsy</strong>:
      </p>
      <ul>
        <li><code>false</code></li>
        <li><code>null</code></li>
        <li><code>0</code> (inteiro), <code>0.0</code> (float)</li>
        <li><code>""</code> (string vazia)</li>
        <li><code>"0"</code> (string com o caractere zero! sim, é falsy)</li>
        <li><code>[]</code> (array vazio)</li>
      </ul>
      <p>
        <strong>Tudo o mais é truthy</strong>: <code>"0.0"</code>, <code>"false"</code>, <code>" "</code>{" "}
        (string com espaço), <code>-1</code>, qualquer objeto.
      </p>

      <PhpBlock
        filename="truthy-falsy.php"
        code={`<?php
declare(strict_types=1);

$valores = [false, null, 0, 0.0, "", "0", [], "0.0", "false", " ", -1, [0]];

foreach ($valores as $v) {
    $tipo = gettype($v);
    $repr = var_export($v, true);
    $bool = $v ? "TRUTHY" : "falsy ";
    echo "{$bool}  {$tipo}\\t{$repr}" . PHP_EOL;
}`}
        output={`falsy   boolean        false
falsy   NULL    NULL
falsy   integer 0
falsy   double  0.0
falsy   string  ''
falsy   string  '0'
falsy   array   array (
)
TRUTHY  string  '0.0'
TRUTHY  string  'false'
TRUTHY  string  ' '
TRUTHY  integer -1
TRUTHY  array   array (
  0 => 0,
)`}
      />

      <AlertBox type="danger" title="A pegadinha clássica">
        Usuário digita <code>"0"</code> em um formulário de busca. Você faz <code>if ($busca) {`{ ... }`}</code>{" "}
        para validar e o código pula a busca achando que está vazio. Sempre use comparação explícita:
        <code> if ($busca !== "") { /* ... */ }</code> ou <code>if (isset($busca) &amp;&amp; $busca !== "")</code>.
      </AlertBox>

      <h2>Ternário: o if em uma linha</h2>
      <p>
        Quando você só precisa escolher entre dois valores, o ternário é mais limpo. A sintaxe é
        <code> condicao ? seSim : seNao</code>.
      </p>

      <PhpBlock
        filename="ternario.php"
        code={`<?php
declare(strict_types=1);

$idade = 20;
$status = $idade >= 18 ? "adulto" : "menor";
echo $status . PHP_EOL;

$role = "admin";
$saudacao = "Bem-vindo, " . ($role === "admin" ? "chefe" : "usuário");
echo $saudacao . PHP_EOL;

$nome = "";
$exibir = $nome ?: "Anônimo";
echo $exibir . PHP_EOL;`}
        output={`adulto
Bem-vindo, chefe
Anônimo`}
      />

      <p>
        O <code>?:</code> (sem o meio) é o <strong>operador Elvis</strong>: <code>$a ?: $b</code> retorna
        <code> $a</code> se ele for <em>truthy</em>, senão <code>$b</code>. É um atalho para
        <code> $a ? $a : $b</code>.
      </p>

      <AlertBox type="warning" title="Evite ternário aninhado">
        <code>$x ? "a" : ($y ? "b" : "c")</code> funciona, mas é horrível de ler. PHP 8 inclusive exige os
        parênteses explícitos. Se chegou nesse nível de complexidade, volte para <code>if/elseif/else</code> ou
        use <code>match</code> (vamos ver no próximo capítulo).
      </AlertBox>

      <h2>Null coalescing (??): o operador que substituiu isset()</h2>
      <p>
        Antes do PHP 7, todo código era cheio de <code>{`isset($arr['key']) ? $arr['key'] : 'padrão'`}</code>.
        O <code>??</code> faz exatamente isso, mas em uma forma muito mais legível: retorna o lado esquerdo se
        ele <strong>existir e não for null</strong>, senão retorna o lado direito.
      </p>

      <PhpBlock
        filename="null-coalescing.php"
        code={`<?php
declare(strict_types=1);

$config = ["host" => "localhost", "port" => 5432];

$host = $config["host"] ?? "127.0.0.1";
$user = $config["user"] ?? "root";
$port = $config["port"] ?? 5432;

echo "host={$host} user={$user} port={$port}" . PHP_EOL;

$dados = ["nome" => "Ada", "email" => null];
$email = $dados["email"] ?? "sem email";
echo $email . PHP_EOL;

$_GET["q"] = null;
$busca = $_GET["q"] ?? "padrão";
echo $busca . PHP_EOL;`}
        output={`host=localhost user=root port=5432
sem email
padrão`}
      />

      <p>
        Existe também o <code>??=</code> (atribuição com null coalescing): só atribui se a variável for
        <code> null</code> ou não existir. Ótimo para defaults em arrays de config.
      </p>

      <PhpBlock
        filename="null-coalescing-assign.php"
        code={`<?php
declare(strict_types=1);

$config = ["host" => "localhost"];

$config["port"] ??= 5432;
$config["host"] ??= "127.0.0.1";
$config["user"] ??= "guest";

print_r($config);`}
        output={`Array
(
    [host] => localhost
    [port] => 5432
    [user] => guest
)`}
      />

      <AlertBox type="success" title="?? vs ?:">
        <code>??</code> só dispara quando o valor é <strong>null ou não existe</strong>.
        <code> ?:</code> dispara em qualquer valor <strong>falsy</strong> (incluindo <code>0</code> e <code>""</code>).
        Quase sempre você quer <code>??</code> — ele evita a pegadinha do <code>0</code> ser tratado como ausência de valor.
      </AlertBox>

      <h2>Combinando tudo: validação real</h2>

      <PhpBlock
        filename="validacao.php"
        code={`<?php
declare(strict_types=1);

function validarUsuario(array $dados): string {
    $nome = trim($dados["nome"] ?? "");
    $email = trim($dados["email"] ?? "");
    $idade = $dados["idade"] ?? null;

    if ($nome === "") {
        return "Erro: nome obrigatório";
    }

    if (!filter_var($email, FILTER_VALIDATE_EMAIL)) {
        return "Erro: e-mail inválido";
    }

    if ($idade !== null && $idade < 18) {
        return "Erro: precisa ser maior de idade";
    }

    return "OK: cadastro de {$nome}";
}

echo validarUsuario(["nome" => "Ada", "email" => "ada@x.com"]) . PHP_EOL;
echo validarUsuario(["nome" => "", "email" => "x@x.com"]) . PHP_EOL;
echo validarUsuario(["nome" => "Bob", "email" => "errado"]) . PHP_EOL;
echo validarUsuario(["nome" => "Tim", "email" => "tim@x.com", "idade" => 15]) . PHP_EOL;`}
        output={`OK: cadastro de Ada
Erro: nome obrigatório
Erro: e-mail inválido
Erro: precisa ser maior de idade`}
      />

      <p>
        Repare como o <code>??</code> elimina a checagem de existência de chave, e o <code>!==</code> com string
        vazia evita a pegadinha do <em>truthy/falsy</em>. No próximo capítulo: <strong>switch e match</strong>,
        que é onde escolher múltiplos caminhos fica realmente elegante.
      </p>
    </PageContainer>
  );
}
