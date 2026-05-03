import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Strings() {
  return (
    <PageContainer
      title="Strings"
      subtitle="Aspas simples vs duplas, heredoc, nowdoc, sprintf, funções str_*, suporte a multibyte com mb_*, e os helpers modernos do PHP 8: str_contains, str_starts_with e str_ends_with."
      difficulty="iniciante"
      timeToRead="12 min"
      category="Strings & Arrays"
    >
      <AlertBox type="info" title="Pré-requisitos">
        <p>Antes deste capítulo, é bom já ter visto: <a href="#/variaveis" className="text-[#8993BE] underline">Variáveis</a>, <a href="#/tipos" className="text-[#8993BE] underline">Tipos</a>.</p>
      </AlertBox>
      <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"\"\" vs aspas simples"}</strong> {' — '} {"aspas duplas interpolam variáveis e escapes; simples não."}
          </li>
        <li>
            <strong>{"Heredoc"}</strong> {' — '} {"<<<EOT — multiline com interpolação; nowdoc é literal."}
          </li>
        <li>
            <strong>{"sprintf"}</strong> {' — '} {"formatação tipo printf; %d, %s, %.2f."}
          </li>
        <li>
            <strong>{"mb_*"}</strong> {' — '} {"versões multibyte para Unicode (mb_strlen, mb_substr)."}
          </li>
        <li>
            <strong>{"Concatenação"}</strong> {' — '} {"usa . — não +."}
          </li>
        </ul>
    
      <h2>Por que existem dois tipos de aspas?</h2>
      <p>
        Você abre seu primeiro arquivo PHP e logo encontra <code>'texto'</code> e <code>"texto"</code> sendo
        usados sem critério aparente. Não é estilo: a diferença é semântica e tem impacto direto em performance e segurança.
        <strong> Aspas duplas interpolam variáveis e processam escapes. Aspas simples são literais.</strong>
      </p>

      <p><strong className="text-[#8993BE] font-mono">'' vs ""</strong> — aspas simples são literais (mais rápidas, nada é interpretado). Aspas duplas interpolam <code>$variaveis</code> e processam escapes como <code>\n</code>, <code>\t</code>. Sintaxe: <code>'literal'</code> ou <code>"olá $nome"</code>. A regra prática: simples por padrão, duplas só quando precisar interpolar.</p>

      <PhpBlock
        filename="aspas.php"
        code={`<?php
declare(strict_types=1);

$nome = "Wallyson";
$idade = 30;

echo 'Olá, $nome! Você tem $idade anos.' . PHP_EOL;
echo "Olá, $nome! Você tem $idade anos." . PHP_EOL;
echo "Olá, {$nome}! Você tem {$idade} anos." . PHP_EOL;
echo 'Linha 1\nLinha 2' . PHP_EOL;
echo "Linha 1\nLinha 2" . PHP_EOL;`}
        output={`Olá, $nome! Você tem $idade anos.
Olá, Wallyson! Você tem 30 anos.
Olá, Wallyson! Você tem 30 anos.
Linha 1\\nLinha 2
Linha 1
Linha 2`}
      />

      <p>
        A forma <code>{`{$variavel}`}</code> é a recomendada quando a string fica complexa ou quando você acessa
        propriedades e índices: <code>{`"Item: {$produtos[0]}"`}</code> ou <code>{`"Nome: {$user->nome}"`}</code>.
        Sem as chaves, o PHP às vezes interpreta de forma errada.
      </p>

      <AlertBox type="info" title="Regra prática">
        Use <strong>aspas simples</strong> por padrão. Só troque para aspas duplas quando precisar de interpolação
        ou de escapes como <code>\n</code>, <code>\t</code>, <code>\r</code>. Isso deixa intenção explícita.
      </AlertBox>

      <h2>Heredoc: blocos longos com interpolação</h2>
      <p>
        Quando você precisa de um bloco grande de texto (um e-mail, um SQL, um pedaço de HTML) usar concatenação
        com <code>.</code> vira um inferno. Heredoc resolve isso: comporta-se como aspas duplas (interpola variáveis),
        mas em múltiplas linhas, sem precisar escapar aspas.
      </p>

      <p><strong className="text-[#8993BE] font-mono">heredoc</strong> — string multilinhas que se comporta como aspas duplas (interpola variáveis), delimitada por <code>{`<<<IDENT`}</code> ... <code>IDENT;</code>. Existe pra escrever blocos longos (e-mails, SQL, HTML) sem concatenar com <code>.</code> nem escapar aspas. Desde PHP 7.3 o fechamento pode ser indentado. Use <code>{`<<<'IDENT'`}</code> (nowdoc) quando NÃO quiser interpolação.</p>

      <PhpBlock
        filename="heredoc.php"
        code={`<?php
declare(strict_types=1);

$nome = "Ada";
$projeto = "Analytical Engine";

$email = {"<<<"}EMAIL
Olá, {$nome}!

Seu projeto "{$projeto}" foi aprovado para a próxima rodada.
Equipe técnica vai entrar em contato amanhã.

Abraços,
PHP Book
EMAIL;

echo $email;`}
        output={`Olá, Ada!

Seu projeto "Analytical Engine" foi aprovado para a próxima rodada.
Equipe técnica vai entrar em contato amanhã.

Abraços,
PHP Book`}
      />

      <p>
        A partir do PHP 7.3 você pode <strong>indentar o fechamento</strong> e o PHP remove a indentação do
        conteúdo automaticamente. Isso é o que torna heredoc usável dentro de classes e funções.
      </p>

      <PhpBlock
        filename="heredoc-indentado.php"
        code={`<?php
declare(strict_types=1);

function gerarHtml(string $titulo, string $corpo): string {
    return {"<<<"}HTML
        <article>
            <h1>{$titulo}</h1>
            <p>{$corpo}</p>
        </article>
        HTML;
}

echo gerarHtml("Lançamento", "Saiu o PHP 8.4!");`}
        output={`<article>
    <h1>Lançamento</h1>
    <p>Saiu o PHP 8.4!</p>
</article>`}
      />

      <h2>Nowdoc: heredoc literal (sem interpolação)</h2>
      <p>
        Nowdoc usa <strong>aspas simples</strong> no identificador e funciona como aspas simples: nada é
        interpolado. Perfeito para snippets de código, regex e qualquer coisa onde <code>$</code> deve ser literal.
      </p>

      <PhpBlock
        filename="nowdoc.php"
        code={`<?php
declare(strict_types=1);

$snippet = {"<<<"}'JS'
const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);
JS;

echo $snippet;`}
        output={`const $ = (sel) => document.querySelector(sel);
const $$ = (sel) => document.querySelectorAll(sel);`}
      />

      <h2>sprintf: formatação que você consegue ler</h2>
      <p>
        Concatenar <code>"Total: R$ " . number_format($v, 2, ',', '.')</code> funciona, mas <code>sprintf</code>{" "}
        deixa o template do texto separado dos valores. Mais legível, mais fácil de internacionalizar.
      </p>

      <p><strong className="text-[#8993BE] font-mono">sprintf</strong> — formata uma string usando placeholders (<code>%s</code>, <code>%d</code>, <code>%.2f</code>, <code>%05d</code>) e retorna o resultado. Existe pra separar template de valores (legível, fácil de internacionalizar). Sintaxe: <code>sprintf("Olá %s, R$ %.2f", $nome, $valor)</code>. Use <code>printf</code> se quiser imprimir direto.</p>

      <PhpBlock
        filename="sprintf.php"
        code={`<?php
declare(strict_types=1);

$nome = "Linus";
$saldo = 1234.5;
$itens = 7;

echo sprintf("Cliente: %s | Saldo: R$ %.2f | Itens: %d", $nome, $saldo, $itens) . PHP_EOL;
echo sprintf("ID: %05d", 42) . PHP_EOL;
echo sprintf("[%-10s] OK", "deploy") . PHP_EOL;
echo sprintf("[%10s] OK", "deploy") . PHP_EOL;
echo sprintf("Hex: %x | Bin: %b", 255, 5) . PHP_EOL;`}
        output={`Cliente: Linus | Saldo: R$ 1234.50 | Itens: 7
ID: 00042
[deploy    ] OK
[    deploy] OK
Hex: ff | Bin: 101`}
      />

      <AlertBox type="warning" title="printf vs sprintf">
        <code>printf</code> imprime direto. <code>sprintf</code> retorna a string formatada.
        Use <code>sprintf</code> quase sempre — assim você pode armazenar, logar ou retornar o valor.
      </AlertBox>

      <h2>As funções str_* que você vai usar todo dia</h2>
      <p>
        O PHP tem dezenas de funções de string. Estas são as que aparecem em todo projeto real:
      </p>

      <p><strong className="text-[#8993BE] font-mono">str_*</strong> — família de funções nativas para strings ASCII: <code>strlen</code> (tamanho em bytes), <code>strtoupper/strtolower</code>, <code>str_replace</code>, <code>str_repeat</code>, <code>str_pad</code>, <code>substr</code>, <code>trim</code>. Existe porque manipular texto é o pão-com-manteiga do PHP. Pra texto humano com acento, troque pelas equivalentes <code>mb_*</code>.</p>

      <PhpBlock
        filename="str-funcoes.php"
        code={`<?php
declare(strict_types=1);

$frase = "  Aprenda PHP de verdade  ";

echo strlen($frase) . PHP_EOL;
echo strlen(trim($frase)) . PHP_EOL;
echo strtoupper(trim($frase)) . PHP_EOL;
echo strtolower(trim($frase)) . PHP_EOL;
echo ucfirst("php é tranquilo") . PHP_EOL;
echo ucwords("php é tranquilo") . PHP_EOL;
echo str_replace("PHP", "Python", trim($frase)) . PHP_EOL;
echo str_repeat("-", 20) . PHP_EOL;
echo str_pad("42", 6, "0", STR_PAD_LEFT) . PHP_EOL;
echo substr("abcdefgh", 2, 3) . PHP_EOL;
echo substr_count("banana", "na") . PHP_EOL;`}
        output={`27
23
APRENDA PHP DE VERDADE
aprenda php de verdade
Php é tranquilo
Php É Tranquilo
Aprenda Python de verdade
--------------------
000042
cde
2`}
      />

      <p>
        Repare em <code>trim</code>: ele tira espaços, tabs e quebras de linha das pontas. Existem variantes
        <code> ltrim</code> (só esquerda) e <code>rtrim</code> (só direita). Você também pode passar caracteres
        específicos para remover: <code>{`trim($url, '/')`}</code>.
      </p>

      <h2>str_contains, str_starts_with, str_ends_with (PHP 8.0+)</h2>
      <p>
        Antes do PHP 8 a gente fazia <code>{`strpos($s, 'foo') !== false`}</code> e tropeçava no <em>!== false</em>{" "}
        toda vez (já que <code>strpos</code> retorna <code>0</code> quando achou no início). O PHP 8 trouxe
        três funções óbvias que retornam <code>bool</code>:
      </p>

      <p><strong className="text-[#8993BE] font-mono">str_contains / str_starts_with / str_ends_with</strong> — funções booleanas (PHP 8.0+) que respondem "essa string contém / começa com / termina com X?". Existem porque <code>strpos !== false</code> era confuso e propenso a bug. Sintaxe: <code>str_contains($haystack, $needle)</code>. Diferenciam maiúsculas/minúsculas.</p>

      <PhpBlock
        filename="str-contains.php"
        code={`<?php
declare(strict_types=1);

$email = "wallyson@example.com";

var_dump(str_contains($email, "@"));
var_dump(str_starts_with($email, "wallyson"));
var_dump(str_ends_with($email, ".com"));
var_dump(str_ends_with($email, ".br"));

if (str_ends_with("backup.tar.gz", ".gz")) {
    echo "É um gzip!" . PHP_EOL;
}`}
        output={`bool(true)
bool(true)
bool(true)
bool(false)
É um gzip!`}
      />

      <h2>explode e implode: string ↔ array</h2>
      <p>
        Duas das funções mais usadas no mundo real: <code>explode</code> quebra uma string num array por separador,
        <code>implode</code> faz o caminho inverso (também chamado de <code>join</code>).
      </p>

      <PhpBlock
        filename="explode.php"
        code={`<?php
declare(strict_types=1);

$csv = "wallyson,ada,linus,grace";
$nomes = explode(",", $csv);
print_r($nomes);

$frase = implode(" e ", $nomes);
echo $frase . PHP_EOL;

[$user, $domain] = explode("@", "ada@example.com", 2);
echo "Usuário: {$user} | Domínio: {$domain}" . PHP_EOL;`}
        output={`Array
(
    [0] => wallyson
    [1] => ada
    [2] => linus
    [3] => grace
)
wallyson e ada e linus e grace
Usuário: ada | Domínio: example.com`}
      />

      <AlertBox type="warning" title="Pegadinha do explode">
        <code>{`explode(",", "")`}</code> retorna <code>{`[""]`}</code> (array com um elemento vazio), não um array vazio.
        Sempre valide a entrada antes de iterar.
      </AlertBox>

      <h2>mb_*: o mundo é UTF-8 e tem acento</h2>
      <p>
        As funções <code>str*</code> contam <strong>bytes</strong>, não caracteres. Em UTF-8 a letra <code>ã</code>{" "}
        ocupa 2 bytes, <code>ç</code> também. Resultado: <code>strlen("São Paulo")</code> retorna 10, não 9.
        Por isso existem as <code>mb_*</code> (multibyte), que entendem o encoding.
      </p>

      <PhpBlock
        filename="mb.php"
        code={`<?php
declare(strict_types=1);

$cidade = "São Paulo";

echo strlen($cidade) . PHP_EOL;
echo mb_strlen($cidade) . PHP_EOL;

echo strtoupper("ação") . PHP_EOL;
echo mb_strtoupper("ação") . PHP_EOL;

echo substr("coração", 0, 5) . PHP_EOL;
echo mb_substr("coração", 0, 5) . PHP_EOL;`}
        output={`10
9
AÇãO
AÇÃO
cora�
coraçã`}
      />

      <AlertBox type="danger" title="Regra de ouro para texto humano">
        Se a string contém <strong>nomes, descrições, qualquer texto digitado por humano</strong>,
        use <code>mb_strlen</code>, <code>mb_strtoupper</code>, <code>mb_substr</code>, <code>mb_strpos</code>.
        Reserve as <code>str*</code> para identificadores, slugs ASCII e dados técnicos.
      </AlertBox>

      <h2>Rodando os exemplos</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/php-book/strings"
        command="php sprintf.php"
        output={`Cliente: Linus | Saldo: R$ 1234.50 | Itens: 7
ID: 00042
[deploy    ] OK`}
      />

      <p>
        Strings são o tipo que você mais manipula em qualquer aplicação web. Saber escolher entre aspas, dominar
        <code> sprintf</code> e usar <code>mb_*</code> em texto humano elimina 90% dos bugs sutis. No próximo capítulo
        vamos para <strong>arrays</strong>, a outra metade do dia a dia.
      </p>
    </PageContainer>
  );
}
