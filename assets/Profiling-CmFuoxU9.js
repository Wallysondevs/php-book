import{j as e}from"./index-Bb4MiiJL.js";import{P as i,A as a,a as s}from"./AlertBox-BpD-xIsb.js";import{T as o}from"./TerminalBlock-DGurMC1r.js";import{C as r}from"./CodeBlock-C3V-qEkN.js";function l(){return e.jsxs(i,{title:"Profiling (Xdebug, Blackfire)",subtitle:"Quando o endpoint demora 800ms, chutar onde está o gargalo é amador. Aprenda a usar Xdebug, Blackfire e SPX para enxergar onde o PHP gasta cada milissegundo e cada byte.",difficulty:"avancado",timeToRead:"13 min",category:"Performance",children:[e.jsx("h2",{children:"O problema: você acha que sabe onde está lento"}),e.jsxs("p",{children:["Toda vez que um endpoint fica lento, o instinto é abrir o código e tentar adivinhar. ",e.jsx("em",{children:'"Deve ser aquele JOIN..."'}),", ",e.jsx("em",{children:'"Acho que é o cache..."'}),". Você refatora 4 horas e o endpoint continua lento — porque o real culpado era uma chamada ",e.jsx("code",{children:"strtolower()"})," dentro de um ",e.jsx("code",{children:"foreach"})," de 50.000 itens que ninguém suspeitou."]}),e.jsxs("p",{children:[e.jsx("strong",{children:"Profiling"})," resolve isso medindo, função por função, quanto tempo e quanta memória cada chamada gastou. Existem três ferramentas principais no ecossistema PHP: ",e.jsx("strong",{children:"Xdebug"})," (grátis, completo, lento), ",e.jsx("strong",{children:"Blackfire"})," ","(SaaS, profissional, leve) e ",e.jsx("strong",{children:"SPX"})," (grátis, leve, simples)."]}),e.jsx("h2",{children:"Xdebug profiler — começando pelo grátis"}),e.jsxs("p",{children:["O Xdebug já é conhecido por debug step-through. Mas ele também tem um modo profiler que gera arquivos no formato ",e.jsx("strong",{children:"cachegrind"}),", lidos pelo QCacheGrind/KCacheGrind. Instalação:"]}),e.jsx(o,{user:"dev",host:"php",cwd:"~",command:"sudo apt install php8.4-xdebug && php -v",output:`PHP 8.4.0 (cli) (built: Nov 21 2024 13:42:11)
Copyright (c) The PHP Group
Zend Engine v4.4.0, Copyright (c) Zend Technologies
    with Xdebug v3.4.0, Copyright (c) 2002-2024, by Derick Rethans`}),e.jsx(r,{language:"ini",code:`; /etc/php/8.4/mods-available/xdebug.ini
; SÓ HABILITE EM DEV — Xdebug em produção mata performance
zend_extension=xdebug.so

xdebug.mode=profile
xdebug.start_with_request=trigger
xdebug.trigger_value=PROFILE
xdebug.output_dir=/tmp/xdebug
xdebug.profiler_output_name=cachegrind.out.%t.%p`}),e.jsxs("p",{children:["Com ",e.jsx("code",{children:"start_with_request=trigger"}),", o profiler só liga quando você manda um trigger explícito — assim ele não é cobrado em todo request acidental. Você dispara via cookie, query string ou variável de ambiente:"]}),e.jsx(o,{user:"dev",host:"api",cwd:"~/projeto",command:"curl -s 'http://localhost:8000/relatorio?XDEBUG_TRIGGER=PROFILE' > /dev/null && ls /tmp/xdebug/",output:"cachegrind.out.1736942112.4291"}),e.jsx("p",{children:"Pronto, o arquivo cachegrind está no disco. Agora abra com QCacheGrind:"}),e.jsx(o,{user:"dev",host:"php",cwd:"~",command:"qcachegrind /tmp/xdebug/cachegrind.out.1736942112.4291",output:"(abre janela GUI mostrando árvore de chamadas, callees, callers)"}),e.jsxs(a,{type:"warning",title:"Cuidado com o overhead",children:["Xdebug em modo profile faz a aplicação rodar ",e.jsx("strong",{children:"5-10x mais devagar"})," ","e gera arquivos de centenas de MB. Use só para uma request por vez, e ",e.jsx("strong",{children:"nunca em produção"})," — nem mesmo com o módulo carregado, porque só de existir ele já rouba performance."]}),e.jsx("h2",{children:"Lendo o cachegrind"}),e.jsx("p",{children:"No QCacheGrind, três métricas importam:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Self"})," — tempo gasto na própria função, sem contar chamadas filhas."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Inclusive (Incl.)"})," — tempo total, incluindo o que ela chamou."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Calls"})," — quantas vezes foi invocada."]})]}),e.jsxs("p",{children:["Ordene por ",e.jsx("code",{children:"Self"}),' decrescente para achar o "trabalho real". Se uma função aparece com ',e.jsx("code",{children:"Self: 8s"})," e ",e.jsx("code",{children:"Calls: 50.000"}),", você achou o gargalo: ou ela é cara demais, ou está sendo chamada vezes demais. Esse é o sintoma clássico de problema ",e.jsx("strong",{children:"N+1"}),"."]}),e.jsx(s,{filename:"exemplo-n-mais-1.php",code:`<?php
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
// Profiler mostra: PDOStatement::execute chamado 2 vezes, 18ms.`,output:`# antes:  101 queries — 712 ms
# depois:   2 queries —  18 ms
# ganho: ~40x`}),e.jsx("h2",{children:"Blackfire — profiling em produção, sem dor"}),e.jsxs("p",{children:["Blackfire é SaaS pago (com tier grátis) feito pela mesma turma do SymfonyCloud. Diferença prática para Xdebug: o overhead é ",e.jsx("strong",{children:"baixo o suficiente para rodar em produção"})," e a UI mostra comparações entre versões, regressões automáticas e assertions de performance. Arquitetura:"]}),e.jsx(r,{language:"bash",code:`# Componentes:
# 1. Probe (extensão PHP) — instrumenta o código no servidor
# 2. Agent (daemon) — coleta amostras do probe e envia ao Blackfire
# 3. CLI 'blackfire' — dispara perfis sob demanda
# 4. Browser extension — perfila qualquer request do navegador
# 5. SaaS (blackfire.io) — UI, gráficos, comparações`}),e.jsx(o,{user:"root",host:"prod",cwd:"~",command:'wget -qO - https://packages.blackfire.io/gpg.key | apt-key add - && echo "deb https://packages.blackfire.io/debian any main" > /etc/apt/sources.list.d/blackfire.list && apt update && apt install blackfire-php blackfire-agent',output:`Setting up blackfire-agent (2.18.0) ...
Setting up blackfire-php (1.94.0) ...
Installing blackfire.so for PHP 8.4`}),e.jsx(r,{language:"ini",code:`; /etc/php/8.4/fpm/conf.d/zz-blackfire.ini
extension=blackfire.so
blackfire.agent_socket=tcp://127.0.0.1:8307
blackfire.agent_timeout=0.25`}),e.jsx("p",{children:"Agora você consegue perfilar qualquer comando ou URL com a CLI:"}),e.jsx(o,{user:"dev",host:"prod",cwd:"~/projeto",command:"blackfire run php artisan import:csv usuarios.csv",output:`Profiling: [########################################] 100%

Profile URL: https://blackfire.io/profiles/c7e8...../graph

Wall Time     2.41s
I/O Wait     412ms
CPU Time     1.99s
Memory      24.8MB
Network        0 B  (0 calls)
SQL          312ms  (1842 queries)`}),e.jsx(o,{user:"dev",host:"prod",cwd:"~",command:"blackfire curl https://api.exemplo.com/v1/relatorio/anual",output:`Profiling: [########################################] 100%

Profile URL: https://blackfire.io/profiles/9a12.....

Wall Time   842ms   ──> top: App\\Report\\Aggregator::sum (412ms, 89% self)
Memory     18.2MB
SQL        102ms`}),e.jsxs(a,{type:"info",title:"Performance budget no CI",children:["O grande charme do Blackfire é o ",e.jsx("strong",{children:"blackfire-player"}),": você escreve cenários YAML e adiciona ",e.jsx("em",{children:"assertions"})," tipo",e.jsx("code",{children:" main.wall_time < 200ms"})," ou",e.jsx("code",{children:" metrics.sql.queries.count < 10"}),". O CI quebra se uma PR introduz regressão de performance."]}),e.jsx(r,{language:"yaml",code:`# scenario.bkf
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
    assert metrics.http.requests.count == 0`}),e.jsx(o,{user:"ci",host:"github",cwd:"~/projeto",command:"blackfire-player run scenario.bkf --endpoint=https://staging.exemplo.com",output:"✓ GET /users   wall_time=142ms  memory=8.4MB  sql.queries=2  PASS"}),e.jsx("h2",{children:"SPX — a alternativa livre e indolor"}),e.jsxs("p",{children:[e.jsx("strong",{children:"SPX"})," (",e.jsx("a",{href:"",children:"github.com/NoiseByNorthwest/php-spx"}),") é uma extensão open-source que faz quase tudo que o Blackfire faz, sem SaaS. Bonita, leve (~1-2% overhead) e com uma UI web embutida."]}),e.jsx(o,{user:"dev",host:"php",cwd:"~/spx",command:"git clone https://github.com/NoiseByNorthwest/php-spx.git && cd php-spx && phpize && ./configure && make && sudo make install",output:`Installing shared extensions:     /usr/lib/php/20240924/
Build complete.`}),e.jsx(r,{language:"ini",code:`; /etc/php/8.4/conf.d/zz-spx.ini
extension=spx.so

; URL secreta para liberar a UI (defina algo aleatório!)
spx.http_enabled=1
spx.http_key="meu-segredo-aleatorio"
spx.http_ip_whitelist="127.0.0.1,10.0.0.0/8"
spx.data_dir=/tmp/spx-profiles`}),e.jsxs("p",{children:["Com SPX habilitado, basta adicionar dois parâmetros na URL para perfilar e depois abrir ",e.jsx("code",{children:"http://localhost:8000/?SPX_KEY=...&SPX_UI_URI=/"})," ","para ver o flame graph interativo:"]}),e.jsx(o,{user:"dev",host:"api",cwd:"~/projeto",command:"curl -s 'http://localhost:8000/relatorio?SPX_KEY=meu-segredo-aleatorio&SPX_ENABLED=1' > /dev/null",output:"(perfil salvo em /tmp/spx-profiles/spx-full-2025-01-15-...)"}),e.jsx(a,{type:"success",title:"Quando usar cada um",children:e.jsxs("ul",{className:"list-disc ml-5 mt-1 space-y-1",children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Xdebug"}),": dev local, problema isolado, sem orçamento."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Blackfire"}),": produção, time grande, regressão automática no CI."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"SPX"}),": você quer flame graph e UI bonita sem pagar nada, e está confortável compilando uma extensão."]})]})}),e.jsx("h2",{children:"Como caçar gargalos: o playbook"}),e.jsx("p",{children:"Independente da ferramenta, o método é o mesmo. Profiling sem método vira ruído."}),e.jsx(s,{filename:"playbook.php",code:`<?php
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
}`,output:`# antes: 100 requests HTTP — 4.2s
# depois:  1 request HTTP — 84ms`}),e.jsx("h2",{children:"Métricas além do tempo"}),e.jsx("p",{children:"Tempo é só uma das dimensões. Em produção você quer monitorar também:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Memory peak"})," — script de relatório consumindo 512MB? Provavelmente carregou a tabela inteira de uma vez. Use generators."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Quantidade de queries SQL"})," — N+1 não dói no tempo de uma request, dói quando 100 usuários simultâneos fazem isso."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Chamadas externas (HTTP, Redis, S3)"})," — latência de rede não aparece em CPU mas mata o p95."]})]}),e.jsxs(a,{type:"danger",title:"Não otimize sem medir",children:['"Loops são lentos", "regex é caro", "objetos são pesados" — todas essas intuições estão erradas em PHP moderno na maior parte do tempo. ',e.jsx("strong",{children:"Sempre meça antes"}),". Otimização sem profiler é loteria."]}),e.jsx("p",{children:'Você agora tem o ferramental para parar de chutar e começar a medir. Profiling é o que separa o time que fala "está lento, sei lá" do time que diz "está lento porque o método X é chamado 4.000 vezes; agrupando viramos 200ms em 12ms".'})]})}export{l as default};
