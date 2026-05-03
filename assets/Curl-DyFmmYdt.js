import{j as e}from"./index-B5-q-eol.js";import{P as t,A as o,a as r}from"./AlertBox-CVbFLZEd.js";import{T as s}from"./TerminalBlock-6fqVIX2R.js";function l(){return e.jsxs(t,{title:"cURL nativo",subtitle:"A API que vem dentro do PHP para fazer HTTP. Verbosa, cheia de constantes, mas zero dependências e roda em qualquer lugar. Aprenda multi-handle, uploads, cookies — e por que muita gente prefere Guzzle.",difficulty:"intermediario",timeToRead:"13 min",category:"HTTP Cliente",children:[e.jsx(o,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"curl_init"})," "," — "," ","inicia handle de requisição."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"CURLOPT_*"})," "," — "," ","opções: URL, RETURNTRANSFER, POSTFIELDS, HEADERS."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"curl_exec"})," "," — "," ","executa e devolve body (ou true)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"curl_multi_*"})," "," — "," ","paraleliza requisições."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"CURLOPT_SSL_VERIFYPEER"})," "," — "," ","NUNCA desabilite em produção."]})]}),e.jsx("h2",{children:"O problema: PHP precisa falar com APIs"}),e.jsxs("p",{children:["Você precisa consumir uma API REST, postar para um webhook, fazer upload de uma imagem para um S3 compatível. O PHP traz cURL embutido (extensão ",e.jsx("code",{children:"ext-curl"}),", ativada por padrão na maioria das distros). É a base que o Guzzle, o WordPress e até o Composer usam por baixo dos panos."]}),e.jsx(r,{filename:"get-simples.php",code:`<?php
declare(strict_types=1);

$ch = curl_init('https://api.github.com/repos/php/php-src');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,           // retorna em vez de ecoar
    CURLOPT_FOLLOWLOCATION => true,           // segue 301/302
    CURLOPT_TIMEOUT        => 5,
    CURLOPT_USERAGENT      => 'php-book/1.0',
    CURLOPT_HTTPHEADER     => ['Accept: application/vnd.github+json'],
]);

$body = curl_exec($ch);
$status = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);

if ($body === false) {
    throw new RuntimeException('curl: ' . curl_error($ch));
}
curl_close($ch);

$repo = json_decode($body, true, 512, JSON_THROW_ON_ERROR);
echo "{$repo['full_name']} • {$repo['stargazers_count']} ⭐\\n";
echo "status HTTP: {$status}\\n";`,output:`php/php-src • 38120 ⭐
status HTTP: 200`}),e.jsx("h2",{children:"Os CURLOPT_* que você vai usar todo dia"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"CURLOPT_RETURNTRANSFER"}),": retorna o corpo em vez de imprimir. ",e.jsx("strong",{children:"Sempre ative."})]}),e.jsxs("li",{children:[e.jsx("code",{children:"CURLOPT_FOLLOWLOCATION"}),": segue redirects (301/302)."]}),e.jsxs("li",{children:[e.jsx("code",{children:"CURLOPT_TIMEOUT"}),": timeout total em segundos. Sem isso, sua app pode travar para sempre."]}),e.jsxs("li",{children:[e.jsx("code",{children:"CURLOPT_CONNECTTIMEOUT"}),": timeout só do handshake TCP/TLS."]}),e.jsxs("li",{children:[e.jsx("code",{children:"CURLOPT_HTTPHEADER"}),": array de strings ",e.jsx("code",{children:'"Header: valor"'}),"."]}),e.jsxs("li",{children:[e.jsx("code",{children:"CURLOPT_POST"})," / ",e.jsx("code",{children:"CURLOPT_POSTFIELDS"}),": muda método e envia body."]}),e.jsxs("li",{children:[e.jsx("code",{children:"CURLOPT_CUSTOMREQUEST"}),": para PUT, PATCH, DELETE."]})]}),e.jsx("h2",{children:"POST com JSON e tratamento de erro decente"}),e.jsx(r,{filename:"post-json.php",code:`<?php
declare(strict_types=1);

function postJson(string $url, array $data, array $headers = []): array
{
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_POST           => true,
        CURLOPT_POSTFIELDS     => json_encode($data, JSON_THROW_ON_ERROR),
        CURLOPT_HTTPHEADER     => array_merge([
            'Content-Type: application/json',
            'Accept: application/json',
        ], $headers),
        CURLOPT_TIMEOUT        => 10,
        CURLOPT_CONNECTTIMEOUT => 3,
    ]);

    $body = curl_exec($ch);
    $errno = curl_errno($ch);
    $err   = curl_error($ch);
    $code  = curl_getinfo($ch, CURLINFO_RESPONSE_CODE);
    curl_close($ch);

    if ($errno !== 0) {
        throw new RuntimeException("curl ({$errno}): {$err}");
    }
    if ($code >= 400) {
        throw new RuntimeException("HTTP {$code}: {$body}");
    }

    return json_decode($body, true, 512, JSON_THROW_ON_ERROR);
}

$resp = postJson('https://httpbin.org/post', ['nome' => 'Ada', 'role' => 'pioneer']);
echo $resp['json']['nome'] . PHP_EOL;`,output:"Ada"}),e.jsxs(o,{type:"warning",title:"curl_errno antes de tudo",children:[e.jsx("code",{children:"curl_exec()"})," retorna ",e.jsx("code",{children:"false"})," em erro. Mas mesmo um ",e.jsx("code",{children:"200 OK"})," ","com body vazio é ",e.jsx("code",{children:'""'}),", não ",e.jsx("code",{children:"false"}),". Sempre cheque ",e.jsx("code",{children:"curl_errno()"}),'primeiro para distinguir "deu pau" de "veio vazio".']}),e.jsx("h2",{children:"Autenticação Basic e Bearer"}),e.jsx(r,{filename:"auth.php",code:`<?php
declare(strict_types=1);

// HTTP Basic — cURL monta o header sozinho
$ch = curl_init('https://api.exemplo.com/private');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPAUTH       => CURLAUTH_BASIC,
    CURLOPT_USERPWD        => 'usuario:senha',
]);
$basic = curl_exec($ch);
curl_close($ch);

// Bearer (JWT, OAuth) — você passa o header manual
$ch = curl_init('https://api.exemplo.com/me');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_HTTPHEADER     => ['Authorization: Bearer ' . getenv('API_TOKEN')],
]);
$bearer = curl_exec($ch);
curl_close($ch);

echo "basic: " . strlen($basic) . " bytes\\n";
echo "bearer: " . strlen($bearer) . " bytes\\n";`,output:`basic: 248 bytes
bearer: 1402 bytes`}),e.jsx("h2",{children:"Upload de arquivo com CURLFile"}),e.jsxs("p",{children:["Para enviar ",e.jsx("code",{children:"multipart/form-data"})," (upload de arquivo + campos comuns), use a classe ",e.jsx("code",{children:"CURLFile"}),". cURL cuida do boundary, do Content-Type e da codificação."]}),e.jsx(r,{filename:"upload.php",code:`<?php
declare(strict_types=1);

$ch = curl_init('https://httpbin.org/post');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => [
        'titulo' => 'Foto do gato',
        'tags'   => 'gatos,fofo',
        'arquivo'=> new CURLFile(
            __DIR__ . '/gato.jpg',
            'image/jpeg',
            'gato.jpg',
        ),
    ],
    CURLOPT_TIMEOUT => 30,
]);

$resp = json_decode(curl_exec($ch), true, 512, JSON_THROW_ON_ERROR);
curl_close($ch);

echo "form titulo: " . $resp['form']['titulo'] . "\\n";
echo "files keys: "  . implode(',', array_keys($resp['files'])) . "\\n";`,output:`form titulo: Foto do gato
files keys: arquivo`}),e.jsx("h2",{children:"Cookies persistentes entre requisições"}),e.jsx(r,{filename:"cookies.php",code:`<?php
declare(strict_types=1);

$jar = sys_get_temp_dir() . '/cookies.txt';

// 1) login: salva cookies no arquivo
$ch = curl_init('https://exemplo.com/login');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_POST           => true,
    CURLOPT_POSTFIELDS     => http_build_query(['email' => 'a@b.c', 'senha' => '123']),
    CURLOPT_COOKIEJAR      => $jar,   // grava
]);
curl_exec($ch);
curl_close($ch);

// 2) próxima requisição: lê cookies do mesmo arquivo
$ch = curl_init('https://exemplo.com/dashboard');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_COOKIEFILE     => $jar,   // lê
]);
$dashboard = curl_exec($ch);
curl_close($ch);

echo "dashboard tem 'Bem-vindo': " . (str_contains($dashboard, 'Bem-vindo') ? 'sim' : 'não');`,output:"dashboard tem 'Bem-vindo': sim"}),e.jsx("h2",{children:"Multi-handle: paralelizando requisições"}),e.jsxs("p",{children:["O grande superpoder do cURL nativo: ",e.jsx("strong",{children:"fazer N requisições em paralelo"})," ","com ",e.jsx("code",{children:"curl_multi_*"}),". Em vez de esperar 5 APIs em sequência (5×200ms = 1s), você dispara as 5 ao mesmo tempo (~200ms total)."]}),e.jsx(r,{filename:"multi.php",code:`<?php
declare(strict_types=1);

$urls = [
    'php'    => 'https://api.github.com/repos/php/php-src',
    'symf'   => 'https://api.github.com/repos/symfony/symfony',
    'larav'  => 'https://api.github.com/repos/laravel/laravel',
];

$mh = curl_multi_init();
$handles = [];

foreach ($urls as $key => $url) {
    $ch = curl_init($url);
    curl_setopt_array($ch, [
        CURLOPT_RETURNTRANSFER => true,
        CURLOPT_USERAGENT      => 'php-book/1.0',
        CURLOPT_TIMEOUT        => 10,
    ]);
    curl_multi_add_handle($mh, $ch);
    $handles[$key] = $ch;
}

// Loop de execução paralela
$running = null;
do {
    curl_multi_exec($mh, $running);
    curl_multi_select($mh);   // bloqueia até ter atividade (não queima CPU)
} while ($running > 0);

foreach ($handles as $key => $ch) {
    $repo = json_decode(curl_multi_getcontent($ch), true);
    echo str_pad($key, 6) . ' • ' . $repo['stargazers_count'] . " ⭐\\n";
    curl_multi_remove_handle($mh, $ch);
    curl_close($ch);
}
curl_multi_close($mh);`,output:`php    • 38120 ⭐
symf   • 29810 ⭐
larav  • 78104 ⭐`}),e.jsxs(o,{type:"info",title:"curl_multi_select é importante",children:["Sem ele, o loop ",e.jsx("code",{children:"do/while"})," consome 100% de CPU em busy-wait."," ",e.jsx("code",{children:"curl_multi_select()"})," dorme até alguma das conexões ter dados disponíveis, deixando o loop quase idle."]}),e.jsx("h2",{children:"Inspecionando o que cURL fez"}),e.jsx(r,{filename:"info.php",code:`<?php
declare(strict_types=1);

$ch = curl_init('https://api.github.com');
curl_setopt_array($ch, [
    CURLOPT_RETURNTRANSFER => true,
    CURLOPT_USERAGENT      => 'php-book/1.0',
]);
curl_exec($ch);

$info = curl_getinfo($ch);
printf("status:    %d\\n", $info['http_code']);
printf("dns:       %.3fs\\n", $info['namelookup_time']);
printf("connect:   %.3fs\\n", $info['connect_time']);
printf("ssl:       %.3fs\\n", $info['appconnect_time']);
printf("ttfb:      %.3fs\\n", $info['starttransfer_time']);
printf("total:     %.3fs\\n", $info['total_time']);
printf("download:  %d bytes\\n", $info['size_download']);

curl_close($ch);`,output:`status:    200
dns:       0.012s
connect:   0.045s
ssl:       0.121s
ttfb:      0.187s
total:     0.198s
download:  2048 bytes`}),e.jsx("h2",{children:"Verificando se ext-curl está instalada"}),e.jsx(s,{user:"dev",host:"php",cwd:"~",command:"php -m | grep -i curl",output:"curl"}),e.jsx(s,{user:"dev",host:"php",cwd:"~",command:"php -r 'print_r(curl_version());'",output:`Array
(
    [version_number] => 530176
    [age] => 11
    [features] => 1395909
    [version] => 8.6.0
    [ssl_version] => OpenSSL/3.2.1
    [protocols] => Array (...)
)`}),e.jsx("h2",{children:"Por que muita gente troca cURL por Guzzle?"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"API verbosa"}),": você escreve 10 linhas para um GET com 5 opções."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Sem PSR-7"}),": a resposta vem como string crua, headers separados, sem objetos."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Erros como string"}),": você precisa lembrar de checar ",e.jsx("code",{children:"curl_errno"})," em cada chamada."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Sem middleware"}),": retry, log, cache — você reimplementa do zero."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Multi-handle é manual"}),": o equivalente em Guzzle é ",e.jsx("code",{children:"Pool"})," com promises."]})]}),e.jsx(o,{type:"success",title:"Quando o cURL nativo brilha",children:"Scripts curtos, projetos sem Composer, embarcados em CMS legado, ferramentas CLI sem dependências externas, ou quando cada KB de vendor importa. Para apps de verdade, vá de Guzzle (próximo capítulo)."}),e.jsxs("p",{children:["Você já tem o canivete suíço do HTTP em PHP. No próximo capítulo a gente mostra o",e.jsx("strong",{children:" Guzzle"}),", que envelopa tudo isso em uma API decente, com PSR-7, promises e mock handlers para testes."]})]})}export{l as default};
