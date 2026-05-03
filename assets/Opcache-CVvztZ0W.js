import{j as e}from"./index-B5-q-eol.js";import{P as c,A as a,a as o}from"./AlertBox-CVbFLZEd.js";import{T as s}from"./TerminalBlock-6fqVIX2R.js";import{C as r}from"./CodeBlock-B36pQ_ak.js";function p(){return e.jsxs(c,{title:"OPcache",subtitle:"O cache de bytecode que faz seu PHP rodar 2-3x mais rápido — de graça. Aprenda a configurar memória, validação de timestamps, preloading e JIT como gente grande.",difficulty:"avancado",timeToRead:"13 min",category:"Performance",children:[e.jsx(a,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"OPcache"})," "," — "," ","cache de bytecode — evita reparse a cada request."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"opcache.enable"})," "," — "," ","liga; já vem ativo nos pacotes oficiais."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"preload (7.4+)"})," "," — "," ","carrega arquivos no startup do FPM."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"validate_timestamps"})," "," — "," ","em prod desligue para ganho extra (precisa reload no deploy)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"JIT (8.0+)"})," "," — "," ","compila para máquina; ganho real em CPU-bound."]})]}),e.jsx("h2",{children:"O problema: a cada request, PHP recompila tudo"}),e.jsxs("p",{children:["Por padrão, sempre que uma requisição chega, o PHP ",e.jsx("strong",{children:"lê o arquivo do disco, faz lexing, parsing, compila para opcodes e só então executa"}),". Esse trabalho é refeito a cada request. Para o seu Laravel de 200 arquivos isso é absurdo."]}),e.jsxs("p",{children:["OPcache compila os arquivos ",e.jsx("strong",{children:"uma vez"}),", guarda o bytecode num segmento de memória compartilhada e, nas próximas requisições, pula direto para a execução. Resultado típico: ",e.jsx("strong",{children:"2x a 3x"})," mais throughput sem mudar uma linha de código."]}),e.jsxs(a,{type:"info",title:"Já vem instalado",children:["Desde o PHP 5.5, o OPcache faz parte da distribuição oficial. No PHP-FPM em produção ele só precisa ser ",e.jsx("em",{children:"habilitado"})," — o que infelizmente nem sempre é o padrão da sua distro."]}),e.jsx("h2",{children:"Verificando se está ativo"}),e.jsx(s,{user:"dev",host:"php",cwd:"~",command:"php -i | grep -i opcache.enable",output:`opcache.enable => On => On
opcache.enable_cli => Off => Off`}),e.jsx(o,{filename:"status.php",code:`<?php
declare(strict_types=1);

$status = opcache_get_status(false);
if ($status === false) {
    echo "OPcache desabilitado\\n";
    exit(1);
}

printf("Memória usada: %.1f MB / %.1f MB\\n",
    $status['memory_usage']['used_memory'] / 1024 / 1024,
    ($status['memory_usage']['used_memory'] + $status['memory_usage']['free_memory']) / 1024 / 1024
);
printf("Hits:   %d\\n", $status['opcache_statistics']['hits']);
printf("Misses: %d\\n", $status['opcache_statistics']['misses']);
printf("Hit rate: %.2f%%\\n", $status['opcache_statistics']['opcache_hit_rate']);
printf("Scripts em cache: %d\\n", $status['opcache_statistics']['num_cached_scripts']);`,output:`Memória usada: 78.4 MB / 256.0 MB
Hits:   142387
Misses: 412
Hit rate: 99.71%
Scripts em cache: 1842`}),e.jsx("h2",{children:"Configuração de produção"}),e.jsxs("p",{children:["O ",e.jsx("code",{children:"php.ini"})," de produção precisa de poucos ajustes, mas todos importantes. Crie um arquivo dedicado em ",e.jsx("code",{children:"/etc/php/8.4/fpm/conf.d/10-opcache.ini"}),":"]}),e.jsx(r,{language:"ini",code:`[opcache]
; Liga o OPcache para SAPI web (Apache/FPM)
opcache.enable=1

; Liga também para CLI — útil para Composer, Artisan, scripts longos
opcache.enable_cli=1

; Tamanho do segmento shared (em MB). 256 cobre Laravel/Symfony grandes.
opcache.memory_consumption=256

; Memória dedicada a strings internadas (sintaxe, classes, namespaces)
opcache.interned_strings_buffer=32

; Quantos arquivos PHP únicos podem ser cacheados (use prime number)
; Conte: find . -name '*.php' | wc -l e dobre
opcache.max_accelerated_files=20011

; PROD: NUNCA revalida o disco. Você dá deploy → faz reload do FPM.
opcache.validate_timestamps=0

; DEV: revalida a cada N segundos (descomente em dev, comente em prod)
; opcache.validate_timestamps=1
; opcache.revalidate_freq=2

; Salva comentários (PHPDoc) — necessário para Doctrine, Symfony Routing etc.
opcache.save_comments=1

; Remove código atrás de assert() em prod
opcache.assertions=-1

; Usa fast shutdown (libera memória mais rápido entre requests)
opcache.fast_shutdown=1`}),e.jsxs(a,{type:"danger",title:"A configuração que mais dá problema",children:[e.jsx("code",{children:"opcache.validate_timestamps=0"})," faz o PHP ",e.jsx("strong",{children:"nunca"})," reler arquivos do disco — é o que dá performance máxima. Mas significa que após um deploy, você ",e.jsx("strong",{children:"tem que"})," rodar"," ",e.jsx("code",{children:"systemctl reload php8.4-fpm"})," ou ",e.jsx("code",{children:"opcache_reset()"}),". Se esquecer, o site continua servindo o código antigo até o próximo reload."]}),e.jsx("h2",{children:"Aplicando e medindo"}),e.jsx(s,{user:"root",host:"prod",cwd:"/etc/php/8.4/fpm/conf.d",command:"systemctl reload php8.4-fpm && php-fpm8.4 -tt 2>&1 | grep -i opcache",output:`[NOTICE] PHP Started - reload graceful
opcache.enable => On
opcache.memory_consumption => 256
opcache.max_accelerated_files => 20011
opcache.validate_timestamps => Off`}),e.jsxs("p",{children:["Em seguida, dispare um benchmark com ",e.jsx("code",{children:"wrk"})," ou ",e.jsx("code",{children:"ab"})," e veja a diferença. Numa app Laravel típica:"]}),e.jsx(s,{user:"dev",host:"bench",cwd:"~",command:"wrk -t4 -c50 -d30s http://localhost/api/users",output:`Running 30s test @ http://localhost/api/users
  4 threads and 50 connections
  Latency     8.42ms   2.13ms  42.10ms   89.21%
  Req/Sec     1.49k   142.31    1.82k    78.40%
Requests/sec:   5942.18
Transfer/sec:    1.34MB`}),e.jsx("p",{children:"Sem OPcache, esse mesmo Laravel costuma fazer ~1500 req/s. Quase 4x de ganho, sem refatoração."}),e.jsx("h2",{children:"Preloading: o turbo do PHP 7.4+"}),e.jsxs("p",{children:["Preloading vai além do OPcache: você diz ao PHP, na inicialização do FPM, para ",e.jsx("strong",{children:"carregar e linkar classes na memória uma vez"}),". Essas classes ficam disponíveis para todos os workers, sem nenhum ",e.jsx("code",{children:"require"})," em runtime. É grátis em latência, custa só RAM."]}),e.jsx(r,{language:"ini",code:`; em /etc/php/8.4/fpm/conf.d/10-opcache.ini
opcache.preload=/var/www/app/preload.php
opcache.preload_user=www-data`}),e.jsx(o,{filename:"preload.php",code:`<?php
declare(strict_types=1);

// Roda UMA vez na inicialização do php-fpm.
// Compila e linka as classes mais usadas do projeto.

$root = __DIR__;
require $root . '/vendor/autoload.php';

// Carrega tudo do core do framework (exemplo Symfony)
$files = new RecursiveIteratorIterator(
    new RecursiveDirectoryIterator($root . '/vendor/symfony', FilesystemIterator::SKIP_DOTS)
);

foreach ($files as $file) {
    if ($file->isFile() && $file->getExtension() === 'php') {
        try {
            opcache_compile_file($file->getRealPath());
        } catch (Throwable $e) {
            // Alguns arquivos têm dependências não-resolvidas; ignore.
        }
    }
}

echo "Preload: classes carregadas em memória.\\n";`,output:"Preload: classes carregadas em memória."}),e.jsxs(a,{type:"warning",title:"Preload exige reload no deploy",children:["Toda vez que você fizer deploy de código que está no preload, precisa"," ",e.jsx("code",{children:"systemctl reload php8.4-fpm"}),". As classes ficam ",e.jsx("em",{children:"congeladas"})," ","na memória até o próximo restart do FPM."]}),e.jsx("h2",{children:"JIT: o nitroso opcional do PHP 8"}),e.jsxs("p",{children:["O PHP 8 trouxe JIT (",e.jsx("em",{children:"Just-In-Time"}),") compilation, que traduz partes do bytecode para código de máquina nativo. Para a maioria das aplicações web (que gastam tempo em I/O — banco, rede), o ganho é marginal. Para ",e.jsx("strong",{children:"código intensivo em CPU"})," (cálculo, processamento de imagem, ML), pode ser 2-4x mais rápido."]}),e.jsx(r,{language:"ini",code:`; Buffer extra para o JIT (em bytes, fora do shared memory normal)
opcache.jit_buffer_size=128M

; Modos do JIT — 'tracing' é o recomendado em prod
; 1205 = tracing, sem inline, otimização agressiva
opcache.jit=tracing

; Alternativas:
; opcache.jit=function   ; mais conservador
; opcache.jit=disable    ; desliga (default)
; opcache.jit=off        ; idem
; opcache.jit=0          ; idem`}),e.jsx(o,{filename:"bench-jit.php",code:`<?php
declare(strict_types=1);

function mandelbrot(int $iter, float $cx, float $cy): int {
    $x = $y = 0.0;
    for ($i = 0; $i < $iter; $i++) {
        $x2 = $x * $x;
        $y2 = $y * $y;
        if ($x2 + $y2 > 4.0) return $i;
        $y = 2 * $x * $y + $cy;
        $x = $x2 - $y2 + $cx;
    }
    return $iter;
}

$start = microtime(true);
$total = 0;
for ($py = -50; $py < 50; $py++) {
    for ($px = -100; $px < 100; $px++) {
        $total += mandelbrot(1000, $px / 50.0, $py / 50.0);
    }
}
printf("total=%d  tempo=%.3fs\\n", $total, microtime(true) - $start);`,output:`# sem JIT
total=18394621  tempo=2.412s

# com opcache.jit=tracing
total=18394621  tempo=0.687s`}),e.jsxs(a,{type:"info",title:"Quando NÃO usar JIT",children:["Para apps Laravel/Symfony típicas, o ganho do JIT é < 5%. Use só se você fizer muito processamento de CPU. Em alguns casos raros, o JIT até ",e.jsx("em",{children:"piora"})," por consumir cache que o OPcache normal usaria melhor."]}),e.jsx("h2",{children:"Healthcheck pós-deploy"}),e.jsx("p",{children:"Ao subir uma nova versão, exponha um endpoint que conferiu o reset:"}),e.jsx(o,{filename:"public/_opcache.php",code:`<?php
declare(strict_types=1);

// Proteja com IP whitelist ou auth — não exponha em /opcache.php público!
$allowed = ['127.0.0.1', '10.0.0.0/8'];
if (!in_array($_SERVER['REMOTE_ADDR'] ?? '', $allowed, true)) {
    http_response_code(403);
    exit;
}

header('Content-Type: application/json');

$status = opcache_get_status(false);
$cfg    = opcache_get_configuration();

echo json_encode([
    'enabled'        => $status['opcache_enabled'] ?? false,
    'cached_scripts' => $status['opcache_statistics']['num_cached_scripts'] ?? 0,
    'memory_used_mb' => round(($status['memory_usage']['used_memory'] ?? 0) / 1048576, 1),
    'memory_free_mb' => round(($status['memory_usage']['free_memory'] ?? 0) / 1048576, 1),
    'hit_rate'       => round($status['opcache_statistics']['opcache_hit_rate'] ?? 0, 2),
    'jit_enabled'    => ($cfg['directives']['opcache.jit'] ?? 'disable') !== 'disable',
    'preload_loaded' => isset($status['preload_statistics']),
], JSON_PRETTY_PRINT);`,output:`{
    "enabled": true,
    "cached_scripts": 1842,
    "memory_used_mb": 78.4,
    "memory_free_mb": 177.6,
    "hit_rate": 99.71,
    "jit_enabled": true,
    "preload_loaded": true
}`}),e.jsx("h2",{children:"Deploy zero-downtime com reset"}),e.jsx("p",{children:"O fluxo completo de deploy com OPcache+preload em produção:"}),e.jsx(s,{user:"deploy",host:"prod",cwd:"/var/www",command:"ln -sfn /var/www/releases/2025-01-15 /var/www/current && sudo systemctl reload php8.4-fpm && curl -s http://localhost/_opcache.php | jq .cached_scripts",output:"1842"}),e.jsx(a,{type:"success",title:"Cheatsheet OPcache em prod",children:e.jsxs("ol",{className:"list-decimal ml-5 mt-1 space-y-1",children:[e.jsxs("li",{children:[e.jsx("code",{children:"opcache.enable=1"})," + ",e.jsx("code",{children:"opcache.enable_cli=1"})]}),e.jsxs("li",{children:[e.jsx("code",{children:"opcache.memory_consumption=256"})," (mais se sua app for grande)"]}),e.jsxs("li",{children:[e.jsx("code",{children:"opcache.max_accelerated_files"})," ≥ 2x o nº de arquivos PHP do projeto"]}),e.jsxs("li",{children:[e.jsx("code",{children:"opcache.validate_timestamps=0"})," + reload do FPM no deploy"]}),e.jsxs("li",{children:[e.jsx("code",{children:"opcache.preload"})," apontando para um ",e.jsx("code",{children:"preload.php"})]}),e.jsx("li",{children:"JIT só se você tiver CPU-bound real"})]})}),e.jsxs("p",{children:["Com o OPcache afinado, você ganhou throughput grátis. Mas e quando, mesmo assim, um endpoint demora 800ms? Aí entra ",e.jsx("strong",{children:"profiling"})," — o assunto do próximo capítulo."]})]})}export{p as default};
