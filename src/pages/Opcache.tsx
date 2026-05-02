import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Opcache() {
  return (
    <PageContainer
      title="OPcache"
      subtitle="O cache de bytecode que faz seu PHP rodar 2-3x mais rápido — de graça. Aprenda a configurar memória, validação de timestamps, preloading e JIT como gente grande."
      difficulty="avancado"
      timeToRead="13 min"
      category="Performance"
    >
      <h2>O problema: a cada request, PHP recompila tudo</h2>
      <p>
        Por padrão, sempre que uma requisição chega, o PHP <strong>lê o arquivo do disco,
        faz lexing, parsing, compila para opcodes e só então executa</strong>. Esse trabalho
        é refeito a cada request. Para o seu Laravel de 200 arquivos isso é absurdo.
      </p>

      <p>
        OPcache compila os arquivos <strong>uma vez</strong>, guarda o bytecode num
        segmento de memória compartilhada e, nas próximas requisições, pula direto para
        a execução. Resultado típico: <strong>2x a 3x</strong> mais throughput sem mudar
        uma linha de código.
      </p>

      <AlertBox type="info" title="Já vem instalado">
        Desde o PHP 5.5, o OPcache faz parte da distribuição oficial. No PHP-FPM em produção
        ele só precisa ser <em>habilitado</em> — o que infelizmente nem sempre é o padrão da
        sua distro.
      </AlertBox>

      <h2>Verificando se está ativo</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command="php -i | grep -i opcache.enable"
        output={`opcache.enable => On => On
opcache.enable_cli => Off => Off`}
      />

      <PhpBlock
        filename="status.php"
        code={`<?php
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
printf("Scripts em cache: %d\\n", $status['opcache_statistics']['num_cached_scripts']);`}
        output={`Memória usada: 78.4 MB / 256.0 MB
Hits:   142387
Misses: 412
Hit rate: 99.71%
Scripts em cache: 1842`}
      />

      <h2>Configuração de produção</h2>
      <p>
        O <code>php.ini</code> de produção precisa de poucos ajustes, mas todos importantes.
        Crie um arquivo dedicado em <code>/etc/php/8.4/fpm/conf.d/10-opcache.ini</code>:
      </p>

      <CodeBlock
        language="ini"
        code={`[opcache]
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
opcache.fast_shutdown=1`}
      />

      <AlertBox type="danger" title="A configuração que mais dá problema">
        <code>opcache.validate_timestamps=0</code> faz o PHP <strong>nunca</strong> reler
        arquivos do disco — é o que dá performance máxima. Mas significa que após um
        deploy, você <strong>tem que</strong> rodar{" "}
        <code>systemctl reload php8.4-fpm</code> ou <code>opcache_reset()</code>.
        Se esquecer, o site continua servindo o código antigo até o próximo reload.
      </AlertBox>

      <h2>Aplicando e medindo</h2>
      <TerminalBlock
        user="root"
        host="prod"
        cwd="/etc/php/8.4/fpm/conf.d"
        command="systemctl reload php8.4-fpm && php-fpm8.4 -tt 2>&1 | grep -i opcache"
        output={`[NOTICE] PHP Started - reload graceful
opcache.enable => On
opcache.memory_consumption => 256
opcache.max_accelerated_files => 20011
opcache.validate_timestamps => Off`}
      />

      <p>
        Em seguida, dispare um benchmark com <code>wrk</code> ou <code>ab</code> e veja
        a diferença. Numa app Laravel típica:
      </p>

      <TerminalBlock
        user="dev"
        host="bench"
        cwd="~"
        command="wrk -t4 -c50 -d30s http://localhost/api/users"
        output={`Running 30s test @ http://localhost/api/users
  4 threads and 50 connections
  Latency     8.42ms   2.13ms  42.10ms   89.21%
  Req/Sec     1.49k   142.31    1.82k    78.40%
Requests/sec:   5942.18
Transfer/sec:    1.34MB`}
      />

      <p>
        Sem OPcache, esse mesmo Laravel costuma fazer ~1500 req/s. Quase 4x de ganho,
        sem refatoração.
      </p>

      <h2>Preloading: o turbo do PHP 7.4+</h2>
      <p>
        Preloading vai além do OPcache: você diz ao PHP, na inicialização do FPM,
        para <strong>carregar e linkar classes na memória uma vez</strong>. Essas classes
        ficam disponíveis para todos os workers, sem nenhum <code>require</code> em
        runtime. É grátis em latência, custa só RAM.
      </p>

      <CodeBlock
        language="ini"
        code={`; em /etc/php/8.4/fpm/conf.d/10-opcache.ini
opcache.preload=/var/www/app/preload.php
opcache.preload_user=www-data`}
      />

      <PhpBlock
        filename="preload.php"
        code={`<?php
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

echo "Preload: classes carregadas em memória.\\n";`}
        output={`Preload: classes carregadas em memória.`}
      />

      <AlertBox type="warning" title="Preload exige reload no deploy">
        Toda vez que você fizer deploy de código que está no preload, precisa{" "}
        <code>systemctl reload php8.4-fpm</code>. As classes ficam <em>congeladas</em>{" "}
        na memória até o próximo restart do FPM.
      </AlertBox>

      <h2>JIT: o nitroso opcional do PHP 8</h2>
      <p>
        O PHP 8 trouxe JIT (<em>Just-In-Time</em>) compilation, que traduz partes do
        bytecode para código de máquina nativo. Para a maioria das aplicações web (que
        gastam tempo em I/O — banco, rede), o ganho é marginal. Para <strong>código
        intensivo em CPU</strong> (cálculo, processamento de imagem, ML), pode ser
        2-4x mais rápido.
      </p>

      <CodeBlock
        language="ini"
        code={`; Buffer extra para o JIT (em bytes, fora do shared memory normal)
opcache.jit_buffer_size=128M

; Modos do JIT — 'tracing' é o recomendado em prod
; 1205 = tracing, sem inline, otimização agressiva
opcache.jit=tracing

; Alternativas:
; opcache.jit=function   ; mais conservador
; opcache.jit=disable    ; desliga (default)
; opcache.jit=off        ; idem
; opcache.jit=0          ; idem`}
      />

      <PhpBlock
        filename="bench-jit.php"
        code={`<?php
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
printf("total=%d  tempo=%.3fs\\n", $total, microtime(true) - $start);`}
        output={`# sem JIT
total=18394621  tempo=2.412s

# com opcache.jit=tracing
total=18394621  tempo=0.687s`}
      />

      <AlertBox type="info" title="Quando NÃO usar JIT">
        Para apps Laravel/Symfony típicas, o ganho do JIT é &lt; 5%. Use só se você fizer
        muito processamento de CPU. Em alguns casos raros, o JIT até <em>piora</em> por
        consumir cache que o OPcache normal usaria melhor.
      </AlertBox>

      <h2>Healthcheck pós-deploy</h2>
      <p>
        Ao subir uma nova versão, exponha um endpoint que conferiu o reset:
      </p>

      <PhpBlock
        filename="public/_opcache.php"
        code={`<?php
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
], JSON_PRETTY_PRINT);`}
        output={`{
    "enabled": true,
    "cached_scripts": 1842,
    "memory_used_mb": 78.4,
    "memory_free_mb": 177.6,
    "hit_rate": 99.71,
    "jit_enabled": true,
    "preload_loaded": true
}`}
      />

      <h2>Deploy zero-downtime com reset</h2>
      <p>
        O fluxo completo de deploy com OPcache+preload em produção:
      </p>

      <TerminalBlock
        user="deploy"
        host="prod"
        cwd="/var/www"
        command={`ln -sfn /var/www/releases/2025-01-15 /var/www/current && sudo systemctl reload php8.4-fpm && curl -s http://localhost/_opcache.php | jq .cached_scripts`}
        output={`1842`}
      />

      <AlertBox type="success" title="Cheatsheet OPcache em prod">
        <ol className="list-decimal ml-5 mt-1 space-y-1">
          <li><code>opcache.enable=1</code> + <code>opcache.enable_cli=1</code></li>
          <li><code>opcache.memory_consumption=256</code> (mais se sua app for grande)</li>
          <li><code>opcache.max_accelerated_files</code> ≥ 2x o nº de arquivos PHP do projeto</li>
          <li><code>opcache.validate_timestamps=0</code> + reload do FPM no deploy</li>
          <li><code>opcache.preload</code> apontando para um <code>preload.php</code></li>
          <li>JIT só se você tiver CPU-bound real</li>
        </ol>
      </AlertBox>

      <p>
        Com o OPcache afinado, você ganhou throughput grátis. Mas e quando, mesmo assim,
        um endpoint demora 800ms? Aí entra <strong>profiling</strong> — o assunto do
        próximo capítulo.
      </p>
    </PageContainer>
  );
}
