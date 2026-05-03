import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function RegexBasico() {
  return (
    <PageContainer
      title="Regex básico (preg_*)"
      subtitle="Expressões regulares no PHP com a família preg_*: encontrar, extrair, substituir e dividir strings com padrões PCRE."
      difficulty="intermediario"
      timeToRead="13 min"
      category="Regex"
    >
      <AlertBox type="info" title="Pré-requisitos">
          <p>Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP.</p>
        </AlertBox>
        <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"preg_match"}</strong> {' — '} {"verdadeiro/falso + captura primeiro match."}
          </li>
        <li>
            <strong>{"preg_match_all"}</strong> {' — '} {"todos os matches em um array."}
          </li>
        <li>
            <strong>{"preg_replace"}</strong> {' — '} {"substituição por padrão."}
          </li>
        <li>
            <strong>{"Delimitadores"}</strong> {' — '} {"/regex/ — barra é o mais comum, mas qualquer char serve."}
          </li>
        <li>
            <strong>{"Flags"}</strong> {' — '} {"i = case-insensitive, m = multiline, s = . inclui \\\\n."}
          </li>
        </ul>
          <h2>O problema: validar um CEP no formato 12345-678</h2>
      <p>
        Você quer aceitar <code>12345-678</code> mas rejeitar <code>123456789</code>,{" "}
        <code>abcde-fgh</code> e <code>12-345678</code>. Dá para fazer isso com vinte linhas de{" "}
        <code>substr()</code>, <code>strlen()</code> e <code>ctype_digit()</code>... ou com uma linha
        de regex:
      </p>

      <PhpBlock
        filename="cep.php"
        code={`<?php
declare(strict_types=1);

function cepValido(string $cep): bool {
    return preg_match('/^\\d{5}-\\d{3}$/', $cep) === 1;
}

var_dump(cepValido('12345-678'));
var_dump(cepValido('123456789'));
var_dump(cepValido('abcde-fgh'));
var_dump(cepValido(' 12345-678'));`}
        output={`bool(true)
bool(false)
bool(false)
bool(false)`}
      />

      <p>
        Esse é o poder do regex: descrever um <strong>padrão</strong> de texto em vez de programar a
        validação caractere por caractere. Vamos dissecar o que está acontecendo.
      </p>

      <h2>Anatomia de um padrão PCRE</h2>
      <p>
        No PHP, regex usa o engine <strong>PCRE</strong> (Perl Compatible Regular Expressions). Todo
        padrão tem três partes:
      </p>
      <ul>
        <li><strong>Delimitadores</strong>: começam e terminam o padrão. O mais comum é <code>/</code>, mas você pode usar <code>#</code>, <code>~</code> ou <code>{`{}`}</code>.</li>
        <li><strong>O padrão</strong> em si: <code>^\d{`{5}`}-\d{`{3}`}$</code>.</li>
        <li><strong>Modificadores</strong> (flags): <code>i</code>, <code>u</code>, <code>m</code>, <code>s</code> — vão depois do delimitador final.</li>
      </ul>

      <PhpBlock
        filename="delimitadores.php"
        code={`<?php
declare(strict_types=1);

// Todos equivalentes:
$padrao1 = '/^https:\/\/.+/';     // precisa escapar a barra
$padrao2 = '#^https://.+#';       // sem precisar escapar
$padrao3 = '~^https://.+~';

$url = 'https://php.net';
var_dump(preg_match($padrao1, $url) === 1);
var_dump(preg_match($padrao2, $url) === 1);
var_dump(preg_match($padrao3, $url) === 1);`}
        output={`bool(true)
bool(true)
bool(true)`}
      />

      <AlertBox type="info" title="Escolha o delimitador a favor da legibilidade">
        Quando o padrão tem muitas barras (URLs, paths), use <code>#</code> ou <code>~</code>. Vai
        poupar você de uma sopa de <code>\/</code> no código.
      </AlertBox>

      <h2>preg_match: existe? extrai grupos?</h2>
      <p>
        <code>preg_match()</code> retorna <code>1</code> se achou, <code>0</code> se não, ou{" "}
        <code>false</code> se houve erro de sintaxe. O terceiro parâmetro recebe os capturas:
      </p>

      <PhpBlock
        filename="preg-match.php"
        code={`<?php
declare(strict_types=1);

$telefone = '(11) 98765-4321';

// Grupos: (DDD) (numero)
if (preg_match('/^\\((\\d{2})\\)\\s(\\d{4,5}-\\d{4})$/', $telefone, $m) === 1) {
    echo "DDD: {$m[1]}" . PHP_EOL;
    echo "Número: {$m[2]}" . PHP_EOL;
    echo "Match completo: {$m[0]}";
}`}
        output={`DDD: 11
Número: 98765-4321
Match completo: (11) 98765-4321`}
      />

      <p>
        O índice <code>0</code> sempre traz a string completa que casou; <code>1</code>, <code>2</code>,
        <code>3</code>... trazem o conteúdo de cada parêntese, em ordem.
      </p>

      <h2>Classes de caracteres</h2>
      <p>
        Dentro de <code>[ ]</code> você define um <strong>conjunto</strong> de caracteres aceitos.
        Dentro do conjunto, <code>-</code> indica intervalo e <code>^</code> no começo nega.
      </p>

      <PhpBlock
        filename="classes.php"
        code={`<?php
declare(strict_types=1);

$exemplos = [
    'A1B2C3'  => '/^[A-Z0-9]+$/',           // só letras maiúsculas e números
    'wally23' => '/^[a-z][a-z0-9_]*$/',     // identificador de variável
    'ola!'    => '/^[a-zA-Z]+$/',           // só letras
    'XYZ-12'  => '/^[A-Z]{3}-\\d{2}$/',      // placa antiga
];

foreach ($exemplos as $str => $padrao) {
    $ok = preg_match($padrao, $str) === 1 ? 'sim' : 'não';
    printf("%-10s casa %-30s -> %s\n", $str, $padrao, $ok);
}

// Atalhos predefinidos
echo PHP_EOL . "Atalhos:" . PHP_EOL;
echo (preg_match('/^\\d+$/', '12345') ? 'sim' : 'não') . " — \\d = [0-9]" . PHP_EOL;
echo (preg_match('/^\\w+$/', 'wally_23') ? 'sim' : 'não') . " — \\w = [A-Za-z0-9_]" . PHP_EOL;
echo (preg_match('/^\\s+$/', "  \t\n") ? 'sim' : 'não') . " — \\s = espaços";`}
        output={`A1B2C3     casa /^[A-Z0-9]+$/                -> sim
wally23    casa /^[a-z][a-z0-9_]*$/          -> sim
ola!       casa /^[a-zA-Z]+$/                -> não
XYZ-12     casa /^[A-Z]{3}-\\d{2}$/           -> sim

Atalhos:
sim — \\d = [0-9]
sim — \\w = [A-Za-z0-9_]
sim — \\s = espaços`}
      />

      <h2>Quantificadores: quantas vezes pode repetir?</h2>
      <ul>
        <li><code>*</code> — zero ou mais</li>
        <li><code>+</code> — uma ou mais</li>
        <li><code>?</code> — zero ou uma (opcional)</li>
        <li><code>{`{n}`}</code> — exatamente n</li>
        <li><code>{`{n,}`}</code> — n ou mais</li>
        <li><code>{`{n,m}`}</code> — entre n e m</li>
      </ul>

      <PhpBlock
        filename="quantificadores.php"
        code={`<?php
declare(strict_types=1);

$casos = [
    ['/^a*$/',       ['', 'a', 'aaaa', 'b']],
    ['/^a+$/',       ['', 'a', 'aaaa', 'b']],
    ['/^colou?r$/',  ['color', 'colour', 'colouur']],
    ['/^\\d{4}$/',    ['1234', '12345', '12']],
    ['/^\\d{2,4}$/',  ['1', '12', '123', '1234', '12345']],
];

foreach ($casos as [$padrao, $entradas]) {
    echo "Padrão $padrao:" . PHP_EOL;
    foreach ($entradas as $e) {
        $ok = preg_match($padrao, $e) === 1 ? 'OK' : '--';
        printf("  %-8s %s\n", "'$e'", $ok);
    }
}`}
        output={`Padrão /^a*$/:
  ''       OK
  'a'      OK
  'aaaa'   OK
  'b'      --
Padrão /^a+$/:
  ''       --
  'a'      OK
  'aaaa'   OK
  'b'      --
Padrão /^colou?r$/:
  'color'  OK
  'colour' OK
  'colouur' --
Padrão /^\\d{4}$/:
  '1234'   OK
  '12345'  --
  '12'     --
Padrão /^\\d{2,4}$/:
  '1'      --
  '12'     OK
  '123'    OK
  '1234'   OK
  '12345'  --`}
      />

      <h2>Âncoras: ^ e $</h2>
      <p>
        Sem âncoras, regex casa <strong>em qualquer posição</strong> da string. <code>^</code> ancora
        no início, <code>$</code> no final. Se você esquecer, validações ficam furadas:
      </p>

      <PhpBlock
        filename="ancoras.php"
        code={`<?php
declare(strict_types=1);

// SEM âncoras — perigoso!
var_dump(preg_match('/\\d{5}/', '12345-678 e mais texto'));
var_dump(preg_match('/\\d{5}/', 'abc 12345 def'));

// COM âncoras — só casa se a STRING INTEIRA bate
var_dump(preg_match('/^\\d{5}$/', '12345'));
var_dump(preg_match('/^\\d{5}$/', 'abc 12345 def'));`}
        output={`int(1)
int(1)
int(1)
int(0)`}
      />

      <AlertBox type="warning" title="Validação SEMPRE com ^ e $">
        Para validar entrada de usuário, use <code>^...$</code>. Para extrair pedaços de uma string
        maior, omita as âncoras. Esquecer isso é um clássico que abre brechas de validação.
      </AlertBox>

      <h2>preg_match_all: pegar todas as ocorrências</h2>
      <p>
        Quando você quer todos os matches (não só o primeiro), use <code>preg_match_all()</code>.
      </p>

      <PhpBlock
        filename="match-all.php"
        code={`<?php
declare(strict_types=1);

$texto = 'Contatos: ana@exemplo.com, bruno@php.net e carlos@github.io';

preg_match_all('/[\\w.+-]+@[\\w-]+\\.[\\w.-]+/', $texto, $matches);

echo "Achei " . count($matches[0]) . " e-mails:" . PHP_EOL;
foreach ($matches[0] as $email) {
    echo "  - $email" . PHP_EOL;
}

// Com grupos: capturar usuário e domínio separados
preg_match_all('/([\\w.+-]+)@([\\w.-]+)/', $texto, $partes);
echo PHP_EOL . "Usuários: " . implode(', ', $partes[1]) . PHP_EOL;
echo "Domínios: " . implode(', ', $partes[2]);`}
        output={`Achei 3 e-mails:
  - ana@exemplo.com
  - bruno@php.net
  - carlos@github.io

Usuários: ana, bruno, carlos
Domínios: exemplo.com, php.net, github.io`}
      />

      <h2>preg_replace: substituir com padrão</h2>

      <PhpBlock
        filename="replace.php"
        code={`<?php
declare(strict_types=1);

// Mascarar telefones
$texto = 'Ligue (11) 98765-4321 ou (21) 91234-5678';
echo preg_replace('/\\(\\d{2}\\)\\s\\d{4,5}-\\d{4}/', '(**) *****-****', $texto) . PHP_EOL;

// Reordenar usando $1, $2 (referências aos grupos)
$nomes = 'Silva, Ana; Souza, Bruno; Lima, Carla';
echo preg_replace('/(\\w+), (\\w+)/', '$2 $1', $nomes) . PHP_EOL;

// Remover múltiplos espaços
$sujo = "muito    espaço     aqui";
echo preg_replace('/\\s+/', ' ', $sujo);`}
        output={`Ligue (**) *****-**** ou (**) *****-****
Ana Silva; Bruno Souza; Carla Lima
muito espaço aqui`}
      />

      <h2>preg_split: explode com superpoderes</h2>
      <p>
        O <code>explode()</code> só aceita um separador fixo. Quando o separador varia (vários espaços,
        várias vírgulas, mistura), use <code>preg_split()</code>.
      </p>

      <PhpBlock
        filename="split.php"
        code={`<?php
declare(strict_types=1);

// Separar por qualquer combinação de vírgula/espaço/ponto-e-vírgula
$lista = "ana, bruno; carlos,  daniel  ;eva";
$nomes = preg_split('/[,;\\s]+/', $lista, -1, PREG_SPLIT_NO_EMPTY);
print_r($nomes);

// Quebrar CamelCase
$camel = "MinhaClasseSuperComprida";
$palavras = preg_split('/(?=[A-Z])/', $camel, -1, PREG_SPLIT_NO_EMPTY);
print_r($palavras);`}
        output={`Array
(
    [0] => ana
    [1] => bruno
    [2] => carlos
    [3] => daniel
    [4] => eva
)
Array
(
    [0] => Minha
    [1] => Classe
    [2] => Super
    [3] => Comprida
)`}
      />

      <h2>Modificadores: i, u, m, s</h2>
      <ul>
        <li><code>i</code> — <em>case insensitive</em>: <code>/php/i</code> casa &quot;PHP&quot;, &quot;Php&quot;, &quot;php&quot;.</li>
        <li><code>u</code> — Unicode/UTF-8: obrigatório quando seu texto tem acentos ou emojis.</li>
        <li><code>m</code> — multiline: faz <code>^</code> e <code>$</code> casarem em cada linha, não só no início/fim da string.</li>
        <li><code>s</code> — single line: faz <code>.</code> casar também quebras de linha.</li>
      </ul>

      <PhpBlock
        filename="modificadores.php"
        code={`<?php
declare(strict_types=1);

// i — case insensitive
var_dump(preg_match('/php/i', 'PHP é maravilhoso'));

// u — sem isso, \\w não conhece acentos
var_dump(preg_match('/^[\\w\\s]+$/', 'João Não'));    // 0 (acento quebra)
var_dump(preg_match('/^[\\w\\s]+$/u', 'João Não'));   // 1 com flag u

// m — ^ por linha
$texto = "linha 1\nlinha 2\nlinha 3";
preg_match_all('/^linha \\d/m', $texto, $m);
print_r($m[0]);

// s — . engole \n
$html = "<p>linha 1\nlinha 2</p>";
preg_match('/<p>(.+?)<\/p>/s', $html, $m);
echo $m[1];`}
        output={`int(1)
int(0)
int(1)
Array
(
    [0] => linha 1
    [1] => linha 2
    [2] => linha 3
)
linha 1
linha 2`}
      />

      <AlertBox type="danger" title="Regra absoluta para textos em português">
        Qualquer regex que toque texto do usuário (nome, descrição, comentário){" "}
        <strong>precisa do modificador <code>u</code></strong>. Sem ele, <code>\w</code>,{" "}
        <code>\b</code> e <code>.</code> tratam acentos como bytes individuais e podem partir
        caracteres no meio. Use <code>'/.../u'</code> por padrão.
      </AlertBox>

      <h2>Testando regex no terminal</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command={`php -r 'var_dump(preg_match("/^[\\d]{5}-[\\d]{3}$/", "01310-100"));'`}
        output={`int(1)`}
      />

      <p>
        Com isso você cobre 80% dos casos do dia a dia: validar formato, extrair partes, limpar e
        dividir strings. No próximo capítulo vamos para o lado avançado: <strong>grupos nomeados,
        lookahead, backreferences, performance</strong> e validação de CPF — onde regex deixa de ser
        truque e vira ferramenta de domínio.
      </p>
    </PageContainer>
  );
}
