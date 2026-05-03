import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function RegexAvancado() {
  return (
    <PageContainer
      title="Regex avançado"
      subtitle="Grupos nomeados, lookahead, backreferences, preg_replace_callback, performance e validações reais como CPF e e-mail."
      difficulty="avancado"
      timeToRead="14 min"
      category="Regex"
    >
      <AlertBox type="info" title="Pré-requisitos">
          <p>Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP.</p>
        </AlertBox>
        <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"Lookahead/behind"}</strong> {' — '} {"(?=...) e (?<=...) — afirmações sem consumir."}
          </li>
        <li>
            <strong>{"Backreference"}</strong> {' — '} {"\\\\1 ou (?P<n>...) com (?P=n)."}
          </li>
        <li>
            <strong>{"Quantificadores"}</strong> {' — '} {"? * + {n,m} e a versão lazy ?? *? +?."}
          </li>
        <li>
            <strong>{"Grupos não-captura"}</strong> {' — '} {"(?:...) — agrupa sem armazenar."}
          </li>
        <li>
            <strong>{"preg_replace_callback"}</strong> {' — '} {"usa função para construir o replacement."}
          </li>
        </ul>
          <h2>O problema: extrair partes nomeadas, não numeradas</h2>
      <p>
        Você está parseando logs e quer extrair <code>data</code>, <code>nivel</code> e{" "}
        <code>mensagem</code>. Com grupos numerados (<code>$m[1]</code>, <code>$m[2]</code>) o código
        fica frágil — basta adicionar um parêntese no meio para tudo desalinhar. A solução são{" "}
        <strong>grupos nomeados</strong>:
      </p>

      <PhpBlock
        filename="grupos-nomeados.php"
        code={`<?php
declare(strict_types=1);

$linha = '[2025-03-21 14:30:00] ERROR: Falha ao conectar no banco';

$padrao = '/^\\[(?P<data>[\\d\\-\\s:]+)\\]\\s+(?P<nivel>\\w+):\\s+(?P<msg>.+)$/';

if (preg_match($padrao, $linha, $m) === 1) {
    echo "Data:     {$m['data']}" . PHP_EOL;
    echo "Nível:    {$m['nivel']}" . PHP_EOL;
    echo "Mensagem: {$m['msg']}";
}`}
        output={`Data:     2025-03-21 14:30:00
Nível:    ERROR
Mensagem: Falha ao conectar no banco`}
      />

      <p>
        A sintaxe é <code>(?P&lt;nome&gt;...)</code> — também aceita <code>(?&lt;nome&gt;...)</code>{" "}
        sem o <code>P</code>. Os grupos numerados continuam funcionando em paralelo, então{" "}
        <code>$m[1]</code> e <code>$m['data']</code> apontam para o mesmo conteúdo.
      </p>

      <AlertBox type="info" title="Por que P? Porra de detalhe histórico">
        O <code>P</code> vem do Python, que inventou essa sintaxe. PCRE adotou. PHP aceita as duas
        formas — escolha a com <code>P</code> se quiser compatibilidade máxima com bibliotecas e
        ferramentas que checam padrões.
      </AlertBox>

      <h2>Lookahead (?=...) e Lookbehind (?&lt;=...)</h2>
      <p>
        Asserções de <em>lookaround</em> permitem casar com base no que vem antes ou depois{" "}
        <strong>sem incluir esse trecho no match</strong>. Útil quando você quer extrair um pedaço
        cercado por contexto.
      </p>

      <PhpBlock
        filename="lookaround.php"
        code={`<?php
declare(strict_types=1);

// Pegar só o número, sem o R$
$preco = 'Total: R$ 1.234,50 hoje';
preg_match('/(?<=R\$ )[\\d.,]+/', $preco, $m);
echo "Valor: {$m[0]}" . PHP_EOL;

// Pegar palavra que vem ANTES de "@"
preg_match('/\\w+(?=@)/', 'contato: ana@exemplo.com', $m);
echo "Usuário: {$m[0]}" . PHP_EOL;

// Lookahead negativo: senha que NÃO termina com .
$senha = 'minhasenha123';
$ok = preg_match('/^[\\w]+(?<!\\.)$/', $senha) === 1;
echo "Senha sem ponto final? " . ($ok ? 'sim' : 'não') . PHP_EOL;

// Validar senha forte: 8+ chars, ao menos 1 maiúscula, 1 minúscula, 1 dígito
function senhaForte(string $s): bool {
    return preg_match(
        '/^(?=.*[A-Z])(?=.*[a-z])(?=.*\\d)[A-Za-z\\d@$!%*?&]{8,}$/',
        $s
    ) === 1;
}
var_dump(senhaForte('Senha123'));
var_dump(senhaForte('senha123'));
var_dump(senhaForte('Curta1'));`}
        output={`Valor: 1.234,50
Usuário: ana
Senha sem ponto final? sim
bool(true)
bool(false)
bool(false)`}
      />

      <p>
        Repare o truque das senhas: três <code>(?=...)</code> seguidos no início agem como{" "}
        <strong>condições simultâneas</strong> — todas precisam casar a partir do mesmo ponto, mas
        nenhuma consome caracteres. Depois delas o padrão real <code>[A-Za-z\d@$!%*?&]{`{8,}`}</code>{" "}
        que casa a senha inteira.
      </p>

      <AlertBox type="warning" title="Lookbehind tem que ter tamanho fixo (PCRE2)">
        No PHP 7.3+ (PCRE2) o lookbehind aceita ramos de tamanhos diferentes via{" "}
        <code>(?&lt;=foo|barr)</code>, mas cada ramo precisa ter tamanho conhecido. Quantificadores
        variáveis como <code>.+</code> dentro de lookbehind continuam proibidos.
      </AlertBox>

      <h2>Backreferences: referenciar o que já casou</h2>
      <p>
        Dentro do mesmo padrão, <code>\1</code>, <code>\2</code> (ou <code>(?P=nome)</code>)
        referenciam grupos já capturados. Útil para encontrar palavras repetidas, tags HTML balanceadas
        e duplicatas.
      </p>

      <PhpBlock
        filename="backreference.php"
        code={`<?php
declare(strict_types=1);

// Achar palavras duplicadas
$texto = 'isso isso é teste teste mesmo';
preg_match_all('/\b(\\w+)\\s+\\1\b/i', $texto, $m);
print_r($m[1]);

// Tag HTML balanceada (versão simplificada)
$html = '<strong>negrito</strong> e <em>itálico</em>';
preg_match_all('/<(\\w+)>(.*?)<\/\\1>/', $html, $m, PREG_SET_ORDER);
foreach ($m as $tag) {
    echo "Tag {$tag[1]}: '{$tag[2]}'" . PHP_EOL;
}

// Em substituição, usa $1 (no replacement) — mas dentro do padrão é \\1
$datas = '2025-03-21 e 2024-12-25';
echo preg_replace('/(\\d{4})-(\\d{2})-(\\d{2})/', '$3/$2/$1', $datas);`}
        output={`Array
(
    [0] => isso
    [1] => teste
)
Tag strong: 'negrito'
Tag em: 'itálico'
21/03/2025 e 25/12/2024`}
      />

      <h2>preg_replace_callback: lógica programática na substituição</h2>
      <p>
        Quando a substituição depende de <strong>processar</strong> o trecho casado (somar, formatar,
        consultar), use <code>preg_replace_callback()</code>. Ele chama uma função para cada match
        e usa o retorno como substituto.
      </p>

      <PhpBlock
        filename="callback.php"
        code={`<?php
declare(strict_types=1);

// Converter todos os preços de USD para BRL (cotação fictícia)
$texto = 'Camiseta US$ 30 | Caneca US$ 12 | Adesivo US$ 5';
$cotacao = 5.10;

$convertido = preg_replace_callback(
    '/US\$\\s?(\\d+(?:\\.\\d+)?)/',
    static function (array $m) use ($cotacao): string {
        $brl = (float) $m[1] * $cotacao;
        return 'R$ ' . number_format($brl, 2, ',', '.');
    },
    $texto,
);
echo $convertido . PHP_EOL;

// Mascarar CPFs em logs
$log = 'usuário 123.456.789-09 entrou; outro 987.654.321-00 saiu';
$mascarado = preg_replace_callback(
    '/(\\d{3})\\.(\\d{3})\\.(\\d{3})-(\\d{2})/',
    static fn(array $m) => "***.***.{$m[3]}-{$m[4]}",
    $log,
);
echo $mascarado;`}
        output={`Camiseta R$ 153,00 | Caneca R$ 61,20 | Adesivo R$ 25,50
usuário ***.***.789-09 entrou; outro ***.***.321-00 saiu`}
      />

      <h2>Validação real: CPF</h2>
      <p>
        Regex sozinha valida o <strong>formato</strong>; para validar o CPF de verdade precisa
        calcular os dois dígitos verificadores. A função abaixo combina os dois mundos:
      </p>

      <PhpBlock
        filename="cpf.php"
        code={`<?php
declare(strict_types=1);

function cpfValido(string $cpf): bool {
    // Aceita "123.456.789-09" ou "12345678909"
    if (preg_match('/^(\\d{3})\\.?(\\d{3})\\.?(\\d{3})-?(\\d{2})$/', $cpf, $m) !== 1) {
        return false;
    }

    $digitos = $m[1] . $m[2] . $m[3] . $m[4];

    // Rejeita sequências repetidas (000... 111... etc.)
    if (preg_match('/^(\\d)\\1{10}$/', $digitos) === 1) {
        return false;
    }

    // Calcula DV1 e DV2
    foreach ([9, 10] as $tamanho) {
        $soma = 0;
        for ($i = 0; $i < $tamanho; $i++) {
            $soma += (int) $digitos[$i] * (($tamanho + 1) - $i);
        }
        $dv = ($soma * 10) % 11;
        if ($dv === 10) {
            $dv = 0;
        }
        if ($dv !== (int) $digitos[$tamanho]) {
            return false;
        }
    }
    return true;
}

foreach (['529.982.247-25', '52998224725', '111.111.111-11', '123.456.789-09', 'abc'] as $c) {
    printf("%-18s -> %s\n", $c, cpfValido($c) ? 'VÁLIDO' : 'inválido');
}`}
        output={`529.982.247-25     -> VÁLIDO
52998224725        -> VÁLIDO
111.111.111-11     -> inválido
123.456.789-09     -> inválido
abc                -> inválido`}
      />

      <h2>Validação de e-mail: regex vs filter_var</h2>
      <p>
        E-mail é o caso clássico onde regex DIY é uma armadilha. A spec RFC 5322 é gigantesca. A
        recomendação é usar <code>filter_var()</code> e, se quiser uma checagem regex extra, manter
        ela simples e prática:
      </p>

      <PhpBlock
        filename="email.php"
        code={`<?php
declare(strict_types=1);

function emailValido(string $e): bool {
    // 1. Filtro nativo (cobre 99% dos casos legítimos)
    if (filter_var($e, FILTER_VALIDATE_EMAIL) === false) {
        return false;
    }
    // 2. Regex extra para barrar formatos esquisitos que o filtro deixa passar
    return preg_match('/^[A-Za-z0-9._%+\\-]+@[A-Za-z0-9.\\-]+\\.[A-Za-z]{2,}$/', $e) === 1;
}

$casos = [
    'ana@php.net',
    'usuario.com.br',
    'a@b.c',
    'wally+tag@gmail.com',
    'João@exemplo.com',
];

foreach ($casos as $e) {
    printf("%-25s -> %s\n", $e, emailValido($e) ? 'OK' : 'reject');
}`}
        output={`ana@php.net               -> OK
usuario.com.br            -> reject
a@b.c                     -> reject
wally+tag@gmail.com       -> OK
João@exemplo.com          -> reject`}
      />

      <AlertBox type="info" title="Quando rejeitar acentos no e-mail?">
        E-mails internacionalizados (IDN) com acentos são válidos pela RFC, mas a maioria dos
        provedores não suporta. Em sistemas brasileiros, é razoável rejeitá-los para evitar problemas
        de entrega. Se precisar aceitar, troque <code>[A-Za-z]</code> por <code>[\p{`{L}`}]</code> com
        a flag <code>u</code>.
      </AlertBox>

      <h2>Performance: o pesadelo do backtracking catastrófico</h2>
      <p>
        Padrões aninhados com quantificadores podem fazer o PCRE explorar bilhões de possibilidades
        antes de desistir. Esse fenômeno é chamado <strong>catastrophic backtracking</strong> e pode
        derrubar seu servidor com uma única requisição maliciosa (ReDoS).
      </p>

      <PhpBlock
        filename="redos.php"
        code={`<?php
declare(strict_types=1);

// Padrão tóxico — (a+)+ é a forma clássica
$toxico = '/^(a+)+$/';

$entrada = str_repeat('a', 25) . '!';   // 25 'a's seguidos de '!'
$inicio = hrtime(true);
$ok = @preg_match($toxico, $entrada);
$ms = (hrtime(true) - $inicio) / 1e6;

echo "Resultado: " . var_export($ok, true) . PHP_EOL;
printf("Tempo: %.2f ms\n", $ms);
echo "Erro PCRE: " . preg_last_error_msg();`}
        output={`Resultado: false
Tempo: 142.35 ms
Erro PCRE: Backtrack limit exhausted`}
      />

      <p>
        O PHP tem dois limites de proteção em <code>php.ini</code>:{" "}
        <code>pcre.backtrack_limit</code> (1.000.000) e <code>pcre.recursion_limit</code> (100.000).
        Quando estouram, <code>preg_match()</code> devolve <code>false</code> em vez de explodir — mas
        já consumiu CPU.
      </p>

      <AlertBox type="danger" title="Como evitar ReDoS">
        <ul className="list-disc ml-5 mt-1 space-y-1">
          <li>Evite quantificadores aninhados: <code>(a+)+</code>, <code>(.*)*</code>, <code>(a|a)+</code>.</li>
          <li>Prefira classes específicas: <code>[^"]*</code> em vez de <code>.*</code> dentro de strings.</li>
          <li>Use quantificadores possessivos quando puder: <code>a++</code>, <code>(?&gt;...)</code> (atomic group) — não fazem backtracking.</li>
          <li>Sempre <strong>cheque o retorno</strong> de <code>preg_match</code>: <code>=== 1</code>, não apenas <em>truthy</em>.</li>
        </ul>
      </AlertBox>

      <PhpBlock
        filename="atomico.php"
        code={`<?php
declare(strict_types=1);

// Versão segura: grupo atômico (?>...) não permite backtracking
$seguro = '/^(?>a+)+$/';
$entrada = str_repeat('a', 30) . '!';

$inicio = hrtime(true);
$ok = preg_match($seguro, $entrada);
$ms = (hrtime(true) - $inicio) / 1e6;

echo "Resultado: " . var_export($ok, true) . PHP_EOL;
printf("Tempo: %.4f ms\n", $ms);`}
        output={`Resultado: 0
Tempo: 0.0120 ms`}
      />

      <h2>Modificadores avançados: x para regex legível</h2>
      <p>
        Com a flag <code>x</code> você ganha permissão para quebrar o padrão em várias linhas e
        adicionar comentários — espaços e linhas em branco são ignorados (use <code>\s</code> ou{" "}
        <code>[ ]</code> quando quiser um espaço literal):
      </p>

      <PhpBlock
        filename="legivel.php"
        code={`<?php
declare(strict_types=1);

$padrao = '/
    ^                          # início
    (?P<protocolo>https?)      # http ou https
    :\/\/
    (?P<host>[\w.\-]+)         # domínio
    (?::(?P<porta>\d+))?       # porta opcional
    (?P<path>\/[^\s?#]*)?      # path opcional
    (?:\?(?P<query>[^\s#]*))?  # query opcional
    $
/x';

preg_match($padrao, 'https://api.php.net:8080/v1/users?ativo=1', $m);
print_r(array_filter($m, fn($k) => !is_int($k), ARRAY_FILTER_USE_KEY));`}
        output={`Array
(
    [protocolo] => https
    [host] => api.php.net
    [porta] => 8080
    [path] => /v1/users
    [query] => ativo=1
)`}
      />

      <h2>Testando regex no terminal</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command={`php -r 'preg_match("/(?P<dia>\\d{2})\\/(?P<mes>\\d{2})/", "21/03", \\$m); print_r(\\$m);'`}
        output={`Array
(
    [0] => 21/03
    [dia] => 21
    1 => 21
    [mes] => 03
    2 => 03
)`}
      />

      <p>
        Você cobriu o arsenal completo de regex no PHP: grupos nomeados, lookaround, backreferences,
        callbacks e — o mais importante — como evitar que regex derrube sua aplicação. Use com
        moderação: regex é poderoso, mas <strong>código com regex é código que precisa de teste</strong>.
        No próximo capítulo trocamos texto por bytes brutos e mergulhamos em <strong>arquivos e
        streams</strong>.
      </p>
    </PageContainer>
  );
}
