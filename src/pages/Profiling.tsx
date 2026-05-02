import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { CodeBlock } from "@/components/ui/CodeBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Profiling() {
  return (
    <PageContainer
      title="Profiling (Xdebug, Blackfire)"
      subtitle="Quando o endpoint demora 800ms, chutar onde está o gargalo é amador. Aprenda a usar Xdebug, Blackfire e SPX para enxergar onde o PHP gasta cada milissegundo e cada byte."
      difficulty="avancado"
      timeToRead="13 min"
      category="Performance"
    >
      <h2>O problema: você acha que sabe onde está lento</h2>
      <p>
        Toda vez que um endpoint fica lento, o instinto é abrir o código e tentar
        adivinhar. <em>"Deve ser aquele JOIN..."</em>, <em>"Acho que é o cache..."</em>.
        Você refatora 4 horas e o endpoint continua lento — porque o real culpado era
        uma chamada <code>strtolower()</code> dentro de um <code>foreach</code> de 50.000 itens
        que ninguém suspeitou.
      </p>

      <p>
        <strong>Profiling</strong> resolve isso medindo, função por função, quanto tempo
        e quanta memória cada chamada gastou. Existem três ferramentas principais no
        ecossistema PHP: <strong>Xdebug</strong> (grátis, completo, lento), <strong>Blackfire</strong>{" "}
        (SaaS, profissional, leve) e <strong>SPX</strong> (grátis, leve, simples).
      </p>

      <h2>Xdebug profiler — começando pelo grátis</h2>
      <p>
        O Xdebug já é conhecido por debug step-through. Mas ele também tem um modo
        profiler que gera arquivos no formato <strong>cachegrind</strong>, lidos pelo
        QCacheGrind/KCacheGrind. Instalação:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command="sudo apt install php8.4-xdebug && php -v"
        output={`PHP 8.4.0 (cli) (built: Nov 21 2024 13:42:11)
Copyright (c) The PHP Group
Zend Engine v4.4.0, Copyright (c) Zend Technologies
    with Xdebug v3.4.0, Copyright (c) 2002-2024, by Derick Rethans`}
      />

      <CodeBlock
        language="ini"
        code={`; /etc/php/8.4/mods-available/xdebug.ini
; SÓ HABILITE EM DEV — Xdebug em produção mata performance
zend_extension=xdebug.so

xdebug.mode=profile
xdebug.start_with_request=trigger
xdebug.trigger_value=PROFILE
xdebug.output_dir=/tmp/xdebug
xdebug.profiler_output_name=cachegrind.out.%t.%p`}
      />

      <p>
        Com <code>start_with_request=trigger</code>, o profiler só liga quando você
        manda um trigger explícito — assim ele não é cobrado em todo request acidental.
        Você dispara via cookie, query string ou variável de ambiente:
      </p>

      <TerminalBlock
        user="dev"
        host="api"
        cwd="~/projeto"
        command={`curl -s 'http://localhost:8000/relatorio?XDEBUG_TRIGGER=PROFILE' > /dev/null && ls /tmp/xdebug/`}
        output={`cachegrind.out.1736942112.4291`}
      />

      <p>
        Pronto, o arquivo cachegrind está no disco. Agora abra com QCacheGrind:
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~"
        command="qcachegrind /tmp/xdebug/cachegrind.out.1736942112.4291"
        output={`(abre janela GUI mostrando árvore de chamadas, callees, callers)`}
      />

      <AlertBox type="warning" title="Cuidado com o overhead">
        Xdebug em modo profile faz a aplicação rodar <strong>5-10x mais devagar</strong>{" "}
        e gera arquivos de centenas de MB. Use só para uma request por vez, e <strong>nunca
        em produção</strong> — nem mesmo com o módulo carregado, porque só de existir ele já
        rouba performance.
      </AlertBox>

      <h2>Lendo o cachegrind</h2>
      <p>
        No QCacheGrind, três métricas importam:
      </p>
      <ul>
        <li><strong>Self</strong> — tempo gasto na própria função, sem contar chamadas filhas.</li>
        <li><strong>Inclusive (Incl.)</strong> — tempo total, incluindo o que ela chamou.</li>
        <li><strong>Calls</strong> — quantas vezes foi invocada.</li>
      </ul>

      <p>
        Ordene por <code>Self</code> decrescente para achar o "trabalho real". Se uma
        função aparece com <code>Self: 8s</code> e <code>Calls: 50.000</code>, você
        achou o gargalo: ou ela é cara demais, ou está sendo chamada vezes demais.
        Esse é o sintoma clássico de problema <strong>N+1</strong>.
      </p>

      <PhpBlock
        filename="exemplo-n-mais-1.php"
        code={`<?php
declare(strict_types=1);

// ANTES — 1 query para users + N queries (uma por user) para orders
$users = $pdo->query('SELECT * FROM users LIMIT 100')->fetchAll();
foreach ($users as &$user) {
    $stmt = $pdo->prepare('SELECT * FROM orders WHERE user_id = ?');
    $stmt->execute([$user['id']]);
    $user['orders'] = $stmt->fetchAll();
}
// Profiler mostra: PDOStatement::execute chamado 101 vezes, 700ms.

// DEPOIS — 2 queries no total, agrupando em PHP
$users = $pdo->query('SELECT * FROM users LIMIT 100')->fetchAll();
$ids   = array_column($users, 'id');
$placeholders = implode(',', array_fill(0, count($ids), '?'));
$stmt = $pdo->prepare("SELECT * FROM orders WHERE user_id IN ($placeholders)");
$stmt->execute($ids);
$orders = $stmt->fetchAll();

$grouped = [];
foreach ($orders as $o) {
    $grouped[$o['user_id']][] = $o;
}
foreach ($users as &$user) {
    $user['orders'] = $grouped[$user['id']] ?? [];
}
// Profiler mostra: PDOStatement::execute chamado 2 vezes, 18ms.`}
        output={`# antes:  101 queries — 712 ms
# depois:   2 queries —  18 ms
# ganho: ~40x`}
      />

      <h2>Blackfire — profiling em produção, sem dor</h2>
      <p>
        Blackfire é SaaS pago (com tier grátis) feito pela mesma turma do SymfonyCloud.
        Diferença prática para Xdebug: o overhead é <strong>baixo o suficiente para rodar
        em produção</strong> e a UI mostra comparações entre versões, regressões automáticas
        e assertions de performance. Arquitetura:
      </p>

      <CodeBlock
        language="bash"
        code={`# Componentes:
# 1. Probe (extensão PHP) — instrumenta o código no servidor
# 2. Agent (daemon) — coleta amostras do probe e envia ao Blackfire
# 3. CLI 'blackfire' — dispara perfis sob demanda
# 4. Browser extension — perfila qualquer request do navegador
# 5. SaaS (blackfire.io) — UI, gráficos, comparações`}
      />

      <TerminalBlock
        user="root"
        host="prod"
        cwd="~"
        command={`wget -qO - https://packages.blackfire.io/gpg.key | apt-key add - && echo "deb https://packages.blackfire.io/debian any main" > /etc/apt/sources.list.d/blackfire.list && apt update && apt install blackfire-php blackfire-agent`}
        output={`Setting up blackfire-agent (2.18.0) ...
Setting up blackfire-php (1.94.0) ...
Installing blackfire.so for PHP 8.4`}
      />

      <CodeBlock
        language="ini"
        code={`; /etc/php/8.4/fpm/conf.d/zz-blackfire.ini
extension=blackfire.so
blackfire.agent_socket=tcp://127.0.0.1:8307
blackfire.agent_timeout=0.25`}
      />

      <p>
        Agora você consegue perfilar qualquer comando ou URL com a CLI:
      </p>

      <TerminalBlock
        user="dev"
        host="prod"
        cwd="~/projeto"
        command="blackfire run php artisan import:csv usuarios.csv"
        output={`Profiling: [########################################] 100%

Profile URL: https://blackfire.io/profiles/c7e8...../graph

Wall Time     2.41s
I/O Wait     412ms
CPU Time     1.99s
Memory      24.8MB
Network        0 B  (0 calls)
SQL          312ms  (1842 queries)`}
      />

      <TerminalBlock
        user="dev"
        host="prod"
        cwd="~"
        command="blackfire curl https://api.exemplo.com/v1/relatorio/anual"
        output={`Profiling: [########################################] 100%

Profile URL: https://blackfire.io/profiles/9a12.....

Wall Time   842ms   ──> top: App\\Report\\Aggregator::sum (412ms, 89% self)
Memory     18.2MB
SQL        102ms`}
      />

      <AlertBox type="info" title="Performance budget no CI">
        O grande charme do Blackfire é o <strong>blackfire-player</strong>: você escreve
        cenários YAML e adiciona <em>assertions</em> tipo
        <code> main.wall_time &lt; 200ms</code> ou
        <code> metrics.sql.queries.count &lt; 10</code>. O CI quebra se uma PR introduz
        regressão de performance.
      </AlertBox>

      <CodeBlock
        language="yaml"
        code={`# scenario.bkf
scenario
  name "Listagem de usuários"
  set warmup true
  set samples 5

  visit url('/v1/users?limit=20')
    name "GET /users"
    expect status_code() == 200
    assert main.wall_time < 200ms
    assert main.peak_memory < 16mb
    assert metrics.sql.queries.count <= 3
    assert metrics.http.requests.count == 0`}
      />

      <TerminalBlock
        user="ci"
        host="github"
        cwd="~/projeto"
        command="blackfire-player run scenario.bkf --endpoint=https://staging.exemplo.com"
        output={`✓ GET /users   wall_time=142ms  memory=8.4MB  sql.queries=2  PASS`}
      />

      <h2>SPX — a alternativa livre e indolor</h2>
      <p>
        <strong>SPX</strong> (<a href="">github.com/NoiseByNorthwest/php-spx</a>) é uma extensão
        open-source que faz quase tudo que o Blackfire faz, sem SaaS. Bonita,
        leve (~1-2% overhead) e com uma UI web embutida.
      </p>

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/spx"
        command="git clone https://github.com/NoiseByNorthwest/php-spx.git && cd php-spx && phpize && ./configure && make && sudo make install"
        output={`Installing shared extensions:     /usr/lib/php/20240924/
Build complete.`}
      />

      <CodeBlock
        language="ini"
        code={`; /etc/php/8.4/conf.d/zz-spx.ini
extension=spx.so

; URL secreta para liberar a UI (defina algo aleatório!)
spx.http_enabled=1
spx.http_key="meu-segredo-aleatorio"
spx.http_ip_whitelist="127.0.0.1,10.0.0.0/8"
spx.data_dir=/tmp/spx-profiles`}
      />

      <p>
        Com SPX habilitado, basta adicionar dois parâmetros na URL para perfilar e
        depois abrir <code>http://localhost:8000/?SPX_KEY=...&amp;SPX_UI_URI=/</code>{" "}
        para ver o flame graph interativo:
      </p>

      <TerminalBlock
        user="dev"
        host="api"
        cwd="~/projeto"
        command="curl -s 'http://localhost:8000/relatorio?SPX_KEY=meu-segredo-aleatorio&SPX_ENABLED=1' > /dev/null"
        output={`(perfil salvo em /tmp/spx-profiles/spx-full-2025-01-15-...)`}
      />

      <AlertBox type="success" title="Quando usar cada um">
        <ul className="list-disc ml-5 mt-1 space-y-1">
          <li><strong>Xdebug</strong>: dev local, problema isolado, sem orçamento.</li>
          <li><strong>Blackfire</strong>: produção, time grande, regressão automática no CI.</li>
          <li><strong>SPX</strong>: você quer flame graph e UI bonita sem pagar nada, e está confortável compilando uma extensão.</li>
        </ul>
      </AlertBox>

      <h2>Como caçar gargalos: o playbook</h2>
      <p>
        Independente da ferramenta, o método é o mesmo. Profiling sem método vira ruído.
      </p>

      <PhpBlock
        filename="playbook.php"
        code={`<?php
declare(strict_types=1);

/**
 * 1. Reproduza o caso lento ISOLADO (1 request, dados de prod-like).
 * 2. Rode o profiler — capture o cachegrind/perfil.
 * 3. Ordene por SELF time decrescente. Top 5 = suspeitos.
 * 4. Para cada suspeito, pergunte:
 *    a) Está sendo chamado vezes demais? (N+1, loop dentro de loop)
 *    b) Está fazendo algo caro toda chamada? (regex, json_decode gigante)
 *    c) Pode ser cacheado? (resultado puro, mesmas entradas)
 * 5. Otimize UM ponto. Re-perfile. Compare.
 * 6. Pare quando estiver "bom o suficiente" — não persiga -1ms eternamente.
 */

// Anti-padrão clássico que o profiler revela na hora:
foreach ($itens as $item) {
    $cliente = json_decode(file_get_contents('http://api/clientes/' . $item->id), true); // N+1 de rede!
}

// Versão correta:
$ids   = array_map(fn($i) => $i->id, $itens);
$batch = json_decode(file_get_contents('http://api/clientes?ids=' . implode(',', $ids)), true);
$map   = array_column($batch, null, 'id');
foreach ($itens as $item) {
    $cliente = $map[$item->id] ?? null;
}`}
        output={`# antes: 100 requests HTTP — 4.2s
# depois:  1 request HTTP — 84ms`}
      />

      <h2>Métricas além do tempo</h2>
      <p>
        Tempo é só uma das dimensões. Em produção você quer monitorar também:
      </p>
      <ul>
        <li><strong>Memory peak</strong> — script de relatório consumindo 512MB? Provavelmente carregou a tabela inteira de uma vez. Use generators.</li>
        <li><strong>Quantidade de queries SQL</strong> — N+1 não dói no tempo de uma request, dói quando 100 usuários simultâneos fazem isso.</li>
        <li><strong>Chamadas externas (HTTP, Redis, S3)</strong> — latência de rede não aparece em CPU mas mata o p95.</li>
      </ul>

      <AlertBox type="danger" title="Não otimize sem medir">
        "Loops são lentos", "regex é caro", "objetos são pesados" — todas essas
        intuições estão erradas em PHP moderno na maior parte do tempo. <strong>Sempre
        meça antes</strong>. Otimização sem profiler é loteria.
      </AlertBox>

      <p>
        Você agora tem o ferramental para parar de chutar e começar a medir. Profiling
        é o que separa o time que fala "está lento, sei lá" do time que diz "está lento
        porque o método X é chamado 4.000 vezes; agrupando viramos 200ms em 12ms".
      </p>
    </PageContainer>
  );
}
