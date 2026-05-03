import{j as e}from"./index-B5-q-eol.js";import{P as r,A as o,a}from"./AlertBox-CVbFLZEd.js";import{T as i}from"./TerminalBlock-6fqVIX2R.js";function c(){return e.jsxs(r,{title:"SPL: estruturas de dados",subtitle:"Pilhas, filas, prioridade, mapa por objeto e arrays de tamanho fixo — o que a Standard PHP Library oferece além do array, e quando faz diferença real.",difficulty:"avancado",timeToRead:"12 min",category:"SPL & Iteradores",children:[e.jsx(o,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"SplStack/SplQueue"})," "," — "," ","pilha e fila baseadas em DLL."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"SplPriorityQueue"})," "," — "," ","fila com prioridade."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"SplObjectStorage"})," "," — "," ","mapa onde chaves são objetos."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"SplFixedArray"})," "," — "," ","array de tamanho fixo, mais rápido em loops grandes."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"SplHeap"})," "," — "," ","heap min/max para algoritmos."]})]}),e.jsx("h2",{children:"O array do PHP é mágico — e às vezes um problema"}),e.jsxs("p",{children:["O ",e.jsx("code",{children:"array"})," do PHP é uma estrutura híbrida: serve de lista, mapa, pilha e fila ao mesmo tempo. Isso é prático, mas paga o preço — cada elemento ocupa muito mais memória que precisaria, e a semântica fica ambígua. A ",e.jsx("strong",{children:"SPL"})," (Standard PHP Library) traz classes especializadas que resolvem casos pontuais melhor do que o array plano."]}),e.jsx("h2",{children:"SplStack: LIFO sem zoeira"}),e.jsxs("p",{children:["Pilha clássica: o último que entra é o primeiro que sai. Ótima para histórico de navegação, undo/redo, parsing recursivo. Você até consegue isso com"," ",e.jsx("code",{children:"array_push"}),"/",e.jsx("code",{children:"array_pop"}),", mas ",e.jsx("code",{children:"SplStack"})," deixa a intenção explícita e é igualmente rápida:"]}),e.jsx(a,{filename:"historico.php",code:`<?php
declare(strict_types=1);

$historico = new SplStack();

$historico->push('/home');
$historico->push('/produtos');
$historico->push('/produtos/42');
$historico->push('/checkout');

echo "Página atual: " . $historico->top() . PHP_EOL;
echo "Total no histórico: " . count($historico) . PHP_EOL;

// Voltar
echo "Voltei de: " . $historico->pop() . PHP_EOL;
echo "Agora estou em: " . $historico->top() . PHP_EOL;

// Iterar do topo para a base
foreach ($historico as $url) {
    echo " - {$url}" . PHP_EOL;
}`,output:`Página atual: /checkout
Total no histórico: 4
Voltei de: /checkout
Agora estou em: /produtos/42
 - /produtos/42
 - /produtos
 - /home`}),e.jsx("h2",{children:"SplQueue: FIFO igualmente clean"}),e.jsx("p",{children:"Fila: o primeiro que entra é o primeiro a sair. Casos de uso: jobs, processamento de eventos, BFS em grafos."}),e.jsx(a,{filename:"fila-jobs.php",code:`<?php
declare(strict_types=1);

$fila = new SplQueue();

$fila->enqueue(['tipo' => 'email', 'destino' => 'ada@x.com']);
$fila->enqueue(['tipo' => 'sms',   'destino' => '+551199999']);
$fila->enqueue(['tipo' => 'push',  'destino' => 'device-42']);

echo "Jobs pendentes: " . count($fila) . PHP_EOL;

while (!$fila->isEmpty()) {
    $job = $fila->dequeue();
    echo "Processando {$job['tipo']} -> {$job['destino']}" . PHP_EOL;
}

echo "Fila vazia? " . ($fila->isEmpty() ? 'sim' : 'não') . PHP_EOL;`,output:`Jobs pendentes: 3
Processando email -> ada@x.com
Processando sms -> +551199999
Processando push -> device-42
Fila vazia? sim`}),e.jsxs(o,{type:"info",title:"Quando usar SplQueue vs Redis",children:[e.jsx("code",{children:"SplQueue"})," vive na memória do processo PHP — ideal para fila de tarefas dentro de uma única request. Para fila persistente entre processos/servidores, use"," ",e.jsx("strong",{children:"predis/predis"})," com ",e.jsx("code",{children:"LPUSH"}),"/",e.jsx("code",{children:"RPOP"})," ou um broker como RabbitMQ."]}),e.jsx("h2",{children:"SplPriorityQueue: o jeito certo de priorizar"}),e.jsxs("p",{children:["Aqui sim a SPL te entrega algo difícil de fazer com array. Cada item tem uma prioridade, e ",e.jsx("code",{children:"extract()"})," sempre devolve o de maior prioridade — sem você precisar reordenar nada manualmente:"]}),e.jsx(a,{filename:"suporte-tickets.php",code:`<?php
declare(strict_types=1);

enum Prioridade: int {
    case Baixa  = 1;
    case Media  = 5;
    case Alta   = 10;
    case Critica = 100;
}

$tickets = new SplPriorityQueue();

$tickets->insert('Imprimir relatório',         Prioridade::Baixa->value);
$tickets->insert('Login não funciona',         Prioridade::Alta->value);
$tickets->insert('Site fora do ar',            Prioridade::Critica->value);
$tickets->insert('Cor do botão errada',        Prioridade::Baixa->value);
$tickets->insert('Pagamento duplicado',        Prioridade::Critica->value);
$tickets->insert('Filtro lento na busca',      Prioridade::Media->value);

while (!$tickets->isEmpty()) {
    echo '-> ' . $tickets->extract() . PHP_EOL;
}`,output:`-> Site fora do ar
-> Pagamento duplicado
-> Login não funciona
-> Filtro lento na busca
-> Imprimir relatório
-> Cor do botão errada`}),e.jsxs(o,{type:"warning",title:"Empate de prioridade",children:["Itens com a mesma prioridade ",e.jsx("strong",{children:"não têm ordem garantida"}),". Se você precisa de FIFO em caso de empate, combine prioridade num par ",e.jsx("code",{children:"[prio, timestamp]"})," e implemente ",e.jsx("code",{children:"compare()"})," numa subclasse — ou use a fila de prioridade do"," ",e.jsx("strong",{children:"php-ds/php-ds"}),"."]}),e.jsx("h2",{children:"SplObjectStorage: o mapa onde a chave é objeto"}),e.jsxs("p",{children:["Tente usar um objeto como chave de array nativo: você ganha um"," ",e.jsx("em",{children:"Illegal offset type"}),". PHP só aceita ",e.jsx("code",{children:"int"})," ou ",e.jsx("code",{children:"string"})," ","como chave. ",e.jsx("code",{children:"SplObjectStorage"})," resolve isso — funciona como um mapa"," ",e.jsx("code",{children:"objeto => valor"}),", ideal para anexar metadados sem poluir as próprias classes:"]}),e.jsx(a,{filename:"permissoes.php",code:`<?php
declare(strict_types=1);

final readonly class Usuario {
    public function __construct(public string $nome) {}
}

$ada    = new Usuario('Ada');
$linus  = new Usuario('Linus');
$grace  = new Usuario('Grace');

$permissoes = new SplObjectStorage();
$permissoes[$ada]   = ['admin', 'editor'];
$permissoes[$linus] = ['editor'];
$permissoes[$grace] = ['admin'];

echo "Usuários cadastrados: " . count($permissoes) . PHP_EOL;

foreach ($permissoes as $u) {
    $roles = $permissoes[$u];
    echo "- {$u->nome}: " . implode(', ', $roles) . PHP_EOL;
}

// Tem entrada para esse usuário?
$visitante = new Usuario('?');
echo "Visitante existe? " . ($permissoes->contains($visitante) ? 'sim' : 'não') . PHP_EOL;`,output:`Usuários cadastrados: 3
- Ada: admin, editor
- Linus: editor
- Grace: admin
Visitante existe? não`}),e.jsxs("p",{children:["Note que o ",e.jsx("code",{children:"contains()"})," compara por ",e.jsx("strong",{children:"identidade do objeto"})," (a mesma instância), não por valor. Dois ",e.jsx("code",{children:"new Usuario('Ada')"})," diferentes são chaves distintas."]}),e.jsx("h2",{children:"SplFixedArray: array de tamanho fixo, mais leve"}),e.jsxs("p",{children:["Quando você sabe exatamente quantos elementos terá e usa só índices inteiros sequenciais,"," ",e.jsx("code",{children:"SplFixedArray"})," consome bem menos memória que um array padrão e tem acesso levemente mais rápido. Caso típico: matrizes numéricas, buffers, simulações."]}),e.jsx(a,{filename:"bench-fixed.php",code:`<?php
declare(strict_types=1);

const N = 1_000_000;

$mem0 = memory_get_usage();
$normal = [];
for ($i = 0; $i < N; $i++) {
    $normal[$i] = $i;
}
$memNormal = memory_get_usage() - $mem0;

unset($normal);

$mem0 = memory_get_usage();
$fixed = new SplFixedArray(N);
for ($i = 0; $i < N; $i++) {
    $fixed[$i] = $i;
}
$memFixed = memory_get_usage() - $mem0;

echo "Array normal: " . number_format($memNormal / 1024 / 1024, 2) . " MB" . PHP_EOL;
echo "SplFixedArray: " . number_format($memFixed / 1024 / 1024, 2) . " MB" . PHP_EOL;
echo "Economia: " . number_format(100 - ($memFixed / $memNormal * 100), 1) . "%" . PHP_EOL;`,output:`Array normal: 32.00 MB
SplFixedArray: 8.00 MB
Economia: 75.0%`}),e.jsx(o,{type:"success",title:"Quando usar SplFixedArray",children:"Tamanho conhecido + chaves inteiras + muito grande (centenas de milhares). Para 100 elementos a diferença é irrelevante. Para 10 milhões, a diferença pode ser entre rodar e estourar memória."}),e.jsx("h2",{children:"SplDoublyLinkedList: a base de Stack e Queue"}),e.jsxs("p",{children:[e.jsx("code",{children:"SplStack"})," e ",e.jsx("code",{children:"SplQueue"})," herdam de ",e.jsx("code",{children:"SplDoublyLinkedList"})," ","— uma lista duplamente ligada. Use direto quando você precisa adicionar/remover de ambas as pontas (deque):"]}),e.jsx(a,{filename:"deque.php",code:`<?php
declare(strict_types=1);

$lista = new SplDoublyLinkedList();

$lista->push('B');       // [B]
$lista->push('C');       // [B, C]
$lista->unshift('A');    // [A, B, C]
$lista->push('D');       // [A, B, C, D]

echo "Tamanho: " . count($lista) . PHP_EOL;
echo "Primeiro: " . $lista[0] . PHP_EOL;
echo "Último: "   . $lista[count($lista) - 1] . PHP_EOL;

// Iterar normal
foreach ($lista as $valor) {
    echo " > {$valor}" . PHP_EOL;
}

// Iterar de trás para frente
$lista->setIteratorMode(SplDoublyLinkedList::IT_MODE_LIFO | SplDoublyLinkedList::IT_MODE_KEEP);
echo "De trás pra frente:" . PHP_EOL;
foreach ($lista as $valor) {
    echo " < {$valor}" . PHP_EOL;
}`,output:`Tamanho: 4
Primeiro: A
Último: D
 > A
 > B
 > C
 > D
De trás pra frente:
 < D
 < C
 < B
 < A`}),e.jsx("h2",{children:"Comparação direta: array vs SPL"}),e.jsx("p",{children:"Em prática, qual escolher? A regra de bolso:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Array nativo"}),": 90% dos casos. Familiar, flexível, performático."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"SplStack/SplQueue"}),": quando você quer ",e.jsx("em",{children:"expressar"})," a intenção (pilha/fila), mesmo que array dê conta."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"SplPriorityQueue"}),": priorização real, com inserção e extração eficiente. Difícil de imitar com array."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"SplObjectStorage"}),": única opção quando a chave é objeto."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"SplFixedArray"}),": economia de memória para volumes grandes com chaves int sequenciais."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"SplDoublyLinkedList"}),": deque (inserir/remover nas duas pontas) com O(1)."]})]}),e.jsxs(o,{type:"info",title:"A alternativa moderna: php-ds",children:["A extensão ",e.jsx("strong",{children:"php-ds/php-ds"})," (também tem fallback em PHP puro) entrega estruturas mais rápidas e modernas: ",e.jsx("code",{children:"Ds\\\\Vector"}),", ",e.jsx("code",{children:"Ds\\\\Map"}),","," ",e.jsx("code",{children:"Ds\\\\Set"}),", ",e.jsx("code",{children:"Ds\\\\PriorityQueue"}),". Em benchmarks ela costuma bater SPL (e até array em alguns casos). Vale conhecer."]}),e.jsx("h2",{children:"Combinando SPL com generics tipados"}),e.jsx("p",{children:"PHP 8.4 não tem generics nativos, mas dá pra documentar com PHPDoc para o PHPStan/PHPStorm te ajudarem:"}),e.jsx(a,{filename:"fila-tipada.php",code:`<?php
declare(strict_types=1);

final readonly class Job {
    public function __construct(
        public string $id,
        public string $payload,
    ) {}
}

/**
 * @extends SplQueue<Job>
 */
final class JobQueue extends SplQueue {
    public function enqueueJob(Job $job): void {
        $this->enqueue($job);
    }

    public function next(): ?Job {
        return $this->isEmpty() ? null : $this->dequeue();
    }
}

$fila = new JobQueue();
$fila->enqueueJob(new Job('j-1', 'enviar email'));
$fila->enqueueJob(new Job('j-2', 'gerar PDF'));

while ($job = $fila->next()) {
    echo "[{$job->id}] {$job->payload}" . PHP_EOL;
}`,output:`[j-1] enviar email
[j-2] gerar PDF`}),e.jsx("h2",{children:"Rodando o benchmark"}),e.jsx(i,{user:"dev",host:"php",cwd:"~/projetos/spl",command:"php -d memory_limit=128M bench-fixed.php",output:`Array normal: 32.00 MB
SplFixedArray: 8.00 MB
Economia: 75.0%`}),e.jsx(o,{type:"success",title:"Resumindo",children:"Use array por padrão. Promova para SPL quando: (1) a semântica importa (pilha/fila), (2) precisa priorização real, (3) chave é objeto, ou (4) volume grande justifica a economia de memória. Não force SPL onde array já é claro — código que não precisa."}),e.jsxs("p",{children:["Você agora conhece o arsenal de estruturas além do array. No próximo capítulo a gente vê ",e.jsx("strong",{children:"iteradores"})," de verdade — como criar suas próprias classes que se comportam como coleções nativas no ",e.jsx("code",{children:"foreach"}),"."]})]})}export{c as default};
