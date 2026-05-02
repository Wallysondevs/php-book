import{j as e}from"./index-Bb4MiiJL.js";import{P as r,a,A as o}from"./AlertBox-BpD-xIsb.js";import{T as s}from"./TerminalBlock-DGurMC1r.js";function n(){return e.jsxs(r,{title:"Regex avançado",subtitle:"Grupos nomeados, lookahead, backreferences, preg_replace_callback, performance e validações reais como CPF e e-mail.",difficulty:"avancado",timeToRead:"14 min",category:"Regex",children:[e.jsx("h2",{children:"O problema: extrair partes nomeadas, não numeradas"}),e.jsxs("p",{children:["Você está parseando logs e quer extrair ",e.jsx("code",{children:"data"}),", ",e.jsx("code",{children:"nivel"})," e"," ",e.jsx("code",{children:"mensagem"}),". Com grupos numerados (",e.jsx("code",{children:"$m[1]"}),", ",e.jsx("code",{children:"$m[2]"}),") o código fica frágil — basta adicionar um parêntese no meio para tudo desalinhar. A solução são"," ",e.jsx("strong",{children:"grupos nomeados"}),":"]}),e.jsx(a,{filename:"grupos-nomeados.php",code:`<?php
declare(strict_types=1);

$linha = '[2025-03-21 14:30:00] ERROR: Falha ao conectar no banco';

$padrao = '/^\\[(?P<data>[\\d\\-\\s:]+)\\]\\s+(?P<nivel>\\w+):\\s+(?P<msg>.+)$/';

if (preg_match($padrao, $linha, $m) === 1) {
    echo "Data:     {$m['data']}" . PHP_EOL;
    echo "Nível:    {$m['nivel']}" . PHP_EOL;
    echo "Mensagem: {$m['msg']}";
}`,output:`Data:     2025-03-21 14:30:00
Nível:    ERROR
Mensagem: Falha ao conectar no banco`}),e.jsxs("p",{children:["A sintaxe é ",e.jsx("code",{children:"(?P<nome>...)"})," — também aceita ",e.jsx("code",{children:"(?<nome>...)"})," ","sem o ",e.jsx("code",{children:"P"}),". Os grupos numerados continuam funcionando em paralelo, então"," ",e.jsx("code",{children:"$m[1]"})," e ",e.jsx("code",{children:"$m['data']"})," apontam para o mesmo conteúdo."]}),e.jsxs(o,{type:"info",title:"Por que P? Porra de detalhe histórico",children:["O ",e.jsx("code",{children:"P"})," vem do Python, que inventou essa sintaxe. PCRE adotou. PHP aceita as duas formas — escolha a com ",e.jsx("code",{children:"P"})," se quiser compatibilidade máxima com bibliotecas e ferramentas que checam padrões."]}),e.jsx("h2",{children:"Lookahead (?=...) e Lookbehind (?<=...)"}),e.jsxs("p",{children:["Asserções de ",e.jsx("em",{children:"lookaround"})," permitem casar com base no que vem antes ou depois"," ",e.jsx("strong",{children:"sem incluir esse trecho no match"}),". Útil quando você quer extrair um pedaço cercado por contexto."]}),e.jsx(a,{filename:"lookaround.php",code:`<?php
declare(strict_types=1);

// Pegar só o número, sem o R$
$preco = 'Total: R$ 1.234,50 hoje';
preg_match('/(?<=R$ )[\\d.,]+/', $preco, $m);
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
var_dump(senhaForte('Curta1'));`,output:`Valor: 1.234,50
Usuário: ana
Senha sem ponto final? sim
bool(true)
bool(false)
bool(false)`}),e.jsxs("p",{children:["Repare o truque das senhas: três ",e.jsx("code",{children:"(?=...)"})," seguidos no início agem como"," ",e.jsx("strong",{children:"condições simultâneas"})," — todas precisam casar a partir do mesmo ponto, mas nenhuma consome caracteres. Depois delas o padrão real ",e.jsxs("code",{children:["[A-Za-z\\d@$!%*?&]","{8,}"]})," ","que casa a senha inteira."]}),e.jsxs(o,{type:"warning",title:"Lookbehind tem que ter tamanho fixo (PCRE2)",children:["No PHP 7.3+ (PCRE2) o lookbehind aceita ramos de tamanhos diferentes via"," ",e.jsx("code",{children:"(?<=foo|barr)"}),", mas cada ramo precisa ter tamanho conhecido. Quantificadores variáveis como ",e.jsx("code",{children:".+"})," dentro de lookbehind continuam proibidos."]}),e.jsx("h2",{children:"Backreferences: referenciar o que já casou"}),e.jsxs("p",{children:["Dentro do mesmo padrão, ",e.jsx("code",{children:"\\1"}),", ",e.jsx("code",{children:"\\2"})," (ou ",e.jsx("code",{children:"(?P=nome)"}),") referenciam grupos já capturados. Útil para encontrar palavras repetidas, tags HTML balanceadas e duplicatas."]}),e.jsx(a,{filename:"backreference.php",code:`<?php
declare(strict_types=1);

// Achar palavras duplicadas
$texto = 'isso isso é teste teste mesmo';
preg_match_all('/\b(\\w+)\\s+\\1\b/i', $texto, $m);
print_r($m[1]);

// Tag HTML balanceada (versão simplificada)
$html = '<strong>negrito</strong> e <em>itálico</em>';
preg_match_all('/<(\\w+)>(.*?)</\\1>/', $html, $m, PREG_SET_ORDER);
foreach ($m as $tag) {
    echo "Tag {$tag[1]}: '{$tag[2]}'" . PHP_EOL;
}

// Em substituição, usa $1 (no replacement) — mas dentro do padrão é \\1
$datas = '2025-03-21 e 2024-12-25';
echo preg_replace('/(\\d{4})-(\\d{2})-(\\d{2})/', '$3/$2/$1', $datas);`,output:`Array
(
    [0] => isso
    [1] => teste
)
Tag strong: 'negrito'
Tag em: 'itálico'
21/03/2025 e 25/12/2024`}),e.jsx("h2",{children:"preg_replace_callback: lógica programática na substituição"}),e.jsxs("p",{children:["Quando a substituição depende de ",e.jsx("strong",{children:"processar"})," o trecho casado (somar, formatar, consultar), use ",e.jsx("code",{children:"preg_replace_callback()"}),". Ele chama uma função para cada match e usa o retorno como substituto."]}),e.jsx(a,{filename:"callback.php",code:`<?php
declare(strict_types=1);

// Converter todos os preços de USD para BRL (cotação fictícia)
$texto = 'Camiseta US$ 30 | Caneca US$ 12 | Adesivo US$ 5';
$cotacao = 5.10;

$convertido = preg_replace_callback(
    '/US$\\s?(\\d+(?:\\.\\d+)?)/',
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
echo $mascarado;`,output:`Camiseta R$ 153,00 | Caneca R$ 61,20 | Adesivo R$ 25,50
usuário ***.***.789-09 entrou; outro ***.***.321-00 saiu`}),e.jsx("h2",{children:"Validação real: CPF"}),e.jsxs("p",{children:["Regex sozinha valida o ",e.jsx("strong",{children:"formato"}),"; para validar o CPF de verdade precisa calcular os dois dígitos verificadores. A função abaixo combina os dois mundos:"]}),e.jsx(a,{filename:"cpf.php",code:`<?php
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
    printf("%-18s -> %s
", $c, cpfValido($c) ? 'VÁLIDO' : 'inválido');
}`,output:`529.982.247-25     -> VÁLIDO
52998224725        -> VÁLIDO
111.111.111-11     -> inválido
123.456.789-09     -> inválido
abc                -> inválido`}),e.jsx("h2",{children:"Validação de e-mail: regex vs filter_var"}),e.jsxs("p",{children:["E-mail é o caso clássico onde regex DIY é uma armadilha. A spec RFC 5322 é gigantesca. A recomendação é usar ",e.jsx("code",{children:"filter_var()"})," e, se quiser uma checagem regex extra, manter ela simples e prática:"]}),e.jsx(a,{filename:"email.php",code:`<?php
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
    printf("%-25s -> %s
", $e, emailValido($e) ? 'OK' : 'reject');
}`,output:`ana@php.net               -> OK
usuario.com.br            -> reject
a@b.c                     -> reject
wally+tag@gmail.com       -> OK
João@exemplo.com          -> reject`}),e.jsxs(o,{type:"info",title:"Quando rejeitar acentos no e-mail?",children:["E-mails internacionalizados (IDN) com acentos são válidos pela RFC, mas a maioria dos provedores não suporta. Em sistemas brasileiros, é razoável rejeitá-los para evitar problemas de entrega. Se precisar aceitar, troque ",e.jsx("code",{children:"[A-Za-z]"})," por ",e.jsxs("code",{children:["[\\p","{L}","]"]})," com a flag ",e.jsx("code",{children:"u"}),"."]}),e.jsx("h2",{children:"Performance: o pesadelo do backtracking catastrófico"}),e.jsxs("p",{children:["Padrões aninhados com quantificadores podem fazer o PCRE explorar bilhões de possibilidades antes de desistir. Esse fenômeno é chamado ",e.jsx("strong",{children:"catastrophic backtracking"})," e pode derrubar seu servidor com uma única requisição maliciosa (ReDoS)."]}),e.jsx(a,{filename:"redos.php",code:`<?php
declare(strict_types=1);

// Padrão tóxico — (a+)+ é a forma clássica
$toxico = '/^(a+)+$/';

$entrada = str_repeat('a', 25) . '!';   // 25 'a's seguidos de '!'
$inicio = hrtime(true);
$ok = @preg_match($toxico, $entrada);
$ms = (hrtime(true) - $inicio) / 1e6;

echo "Resultado: " . var_export($ok, true) . PHP_EOL;
printf("Tempo: %.2f ms
", $ms);
echo "Erro PCRE: " . preg_last_error_msg();`,output:`Resultado: false
Tempo: 142.35 ms
Erro PCRE: Backtrack limit exhausted`}),e.jsxs("p",{children:["O PHP tem dois limites de proteção em ",e.jsx("code",{children:"php.ini"}),":"," ",e.jsx("code",{children:"pcre.backtrack_limit"})," (1.000.000) e ",e.jsx("code",{children:"pcre.recursion_limit"})," (100.000). Quando estouram, ",e.jsx("code",{children:"preg_match()"})," devolve ",e.jsx("code",{children:"false"})," em vez de explodir — mas já consumiu CPU."]}),e.jsx(o,{type:"danger",title:"Como evitar ReDoS",children:e.jsxs("ul",{className:"list-disc ml-5 mt-1 space-y-1",children:[e.jsxs("li",{children:["Evite quantificadores aninhados: ",e.jsx("code",{children:"(a+)+"}),", ",e.jsx("code",{children:"(.*)*"}),", ",e.jsx("code",{children:"(a|a)+"}),"."]}),e.jsxs("li",{children:["Prefira classes específicas: ",e.jsx("code",{children:'[^"]*'})," em vez de ",e.jsx("code",{children:".*"})," dentro de strings."]}),e.jsxs("li",{children:["Use quantificadores possessivos quando puder: ",e.jsx("code",{children:"a++"}),", ",e.jsx("code",{children:"(?>...)"})," (atomic group) — não fazem backtracking."]}),e.jsxs("li",{children:["Sempre ",e.jsx("strong",{children:"cheque o retorno"})," de ",e.jsx("code",{children:"preg_match"}),": ",e.jsx("code",{children:"=== 1"}),", não apenas ",e.jsx("em",{children:"truthy"}),"."]})]})}),e.jsx(a,{filename:"atomico.php",code:`<?php
declare(strict_types=1);

// Versão segura: grupo atômico (?>...) não permite backtracking
$seguro = '/^(?>a+)+$/';
$entrada = str_repeat('a', 30) . '!';

$inicio = hrtime(true);
$ok = preg_match($seguro, $entrada);
$ms = (hrtime(true) - $inicio) / 1e6;

echo "Resultado: " . var_export($ok, true) . PHP_EOL;
printf("Tempo: %.4f ms
", $ms);`,output:`Resultado: 0
Tempo: 0.0120 ms`}),e.jsx("h2",{children:"Modificadores avançados: x para regex legível"}),e.jsxs("p",{children:["Com a flag ",e.jsx("code",{children:"x"})," você ganha permissão para quebrar o padrão em várias linhas e adicionar comentários — espaços e linhas em branco são ignorados (use ",e.jsx("code",{children:"\\s"})," ou"," ",e.jsx("code",{children:"[ ]"})," quando quiser um espaço literal):"]}),e.jsx(a,{filename:"legivel.php",code:`<?php
declare(strict_types=1);

$padrao = '/
    ^                          # início
    (?P<protocolo>https?)      # http ou https
    ://
    (?P<host>[w.-]+)         # domínio
    (?::(?P<porta>d+))?       # porta opcional
    (?P<path>/[^s?#]*)?      # path opcional
    (?:?(?P<query>[^s#]*))?  # query opcional
    $
/x';

preg_match($padrao, 'https://api.php.net:8080/v1/users?ativo=1', $m);
print_r(array_filter($m, fn($k) => !is_int($k), ARRAY_FILTER_USE_KEY));`,output:`Array
(
    [protocolo] => https
    [host] => api.php.net
    [porta] => 8080
    [path] => /v1/users
    [query] => ativo=1
)`}),e.jsx("h2",{children:"Testando regex no terminal"}),e.jsx(s,{user:"dev",host:"php",cwd:"~",command:`php -r 'preg_match("/(?P<dia>\\d{2})\\/(?P<mes>\\d{2})/", "21/03", \\$m); print_r(\\$m);'`,output:`Array
(
    [0] => 21/03
    [dia] => 21
    1 => 21
    [mes] => 03
    2 => 03
)`}),e.jsxs("p",{children:["Você cobriu o arsenal completo de regex no PHP: grupos nomeados, lookaround, backreferences, callbacks e — o mais importante — como evitar que regex derrube sua aplicação. Use com moderação: regex é poderoso, mas ",e.jsx("strong",{children:"código com regex é código que precisa de teste"}),". No próximo capítulo trocamos texto por bytes brutos e mergulhamos em ",e.jsx("strong",{children:"arquivos e streams"}),"."]})]})}export{n as default};
