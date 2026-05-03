import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function SplEstruturas() {
  return (
    <PageContainer
      title="SPL: estruturas de dados"
      subtitle="Pilhas, filas, prioridade, mapa por objeto e arrays de tamanho fixo — o que a Standard PHP Library oferece além do array, e quando faz diferença real."
      difficulty="avancado"
      timeToRead="12 min"
      category="SPL & Iteradores"
    >
      <AlertBox type="info" title="Pré-requisitos">
          <p>Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP.</p>
        </AlertBox>
        <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"SplStack/SplQueue"}</strong> {' — '} {"pilha e fila baseadas em DLL."}
          </li>
        <li>
            <strong>{"SplPriorityQueue"}</strong> {' — '} {"fila com prioridade."}
          </li>
        <li>
            <strong>{"SplObjectStorage"}</strong> {' — '} {"mapa onde chaves são objetos."}
          </li>
        <li>
            <strong>{"SplFixedArray"}</strong> {' — '} {"array de tamanho fixo, mais rápido em loops grandes."}
          </li>
        <li>
            <strong>{"SplHeap"}</strong> {' — '} {"heap min/max para algoritmos."}
          </li>
        </ul>
          <h2>O array do PHP é mágico — e às vezes um problema</h2>
      <p>
        O <code>array</code> do PHP é uma estrutura híbrida: serve de lista, mapa, pilha e fila
        ao mesmo tempo. Isso é prático, mas paga o preço — cada elemento ocupa muito mais
        memória que precisaria, e a semântica fica ambígua. A <strong>SPL</strong> (Standard PHP
        Library) traz classes especializadas que resolvem casos pontuais melhor do que o array
        plano.
      </p>

      <h2>SplStack: LIFO sem zoeira</h2>
      <p>
        Pilha clássica: o último que entra é o primeiro que sai. Ótima para histórico de
        navegação, undo/redo, parsing recursivo. Você até consegue isso com{" "}
        <code>array_push</code>/<code>array_pop</code>, mas <code>SplStack</code> deixa a
        intenção explícita e é igualmente rápida:
      </p>

      <PhpBlock
        filename="historico.php"
        code={`<?php
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
}`}
        output={`Página atual: /checkout
Total no histórico: 4
Voltei de: /checkout
Agora estou em: /produtos/42
 - /produtos/42
 - /produtos
 - /home`}
      />

      <h2>SplQueue: FIFO igualmente clean</h2>
      <p>
        Fila: o primeiro que entra é o primeiro a sair. Casos de uso: jobs, processamento de
        eventos, BFS em grafos.
      </p>

      <PhpBlock
        filename="fila-jobs.php"
        code={`<?php
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

echo "Fila vazia? " . ($fila->isEmpty() ? 'sim' : 'não') . PHP_EOL;`}
        output={`Jobs pendentes: 3
Processando email -> ada@x.com
Processando sms -> +551199999
Processando push -> device-42
Fila vazia? sim`}
      />

      <AlertBox type="info" title="Quando usar SplQueue vs Redis">
        <code>SplQueue</code> vive na memória do processo PHP — ideal para fila de tarefas
        dentro de uma única request. Para fila persistente entre processos/servidores, use{" "}
        <strong>predis/predis</strong> com <code>LPUSH</code>/<code>RPOP</code> ou um broker
        como RabbitMQ.
      </AlertBox>

      <h2>SplPriorityQueue: o jeito certo de priorizar</h2>
      <p>
        Aqui sim a SPL te entrega algo difícil de fazer com array. Cada item tem uma
        prioridade, e <code>extract()</code> sempre devolve o de maior prioridade — sem você
        precisar reordenar nada manualmente:
      </p>

      <PhpBlock
        filename="suporte-tickets.php"
        code={`<?php
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
}`}
        output={`-> Site fora do ar
-> Pagamento duplicado
-> Login não funciona
-> Filtro lento na busca
-> Imprimir relatório
-> Cor do botão errada`}
      />

      <AlertBox type="warning" title="Empate de prioridade">
        Itens com a mesma prioridade <strong>não têm ordem garantida</strong>. Se você precisa
        de FIFO em caso de empate, combine prioridade num par <code>[prio, timestamp]</code> e
        implemente <code>compare()</code> numa subclasse — ou use a fila de prioridade do{" "}
        <strong>php-ds/php-ds</strong>.
      </AlertBox>

      <h2>SplObjectStorage: o mapa onde a chave é objeto</h2>
      <p>
        Tente usar um objeto como chave de array nativo: você ganha um{" "}
        <em>Illegal offset type</em>. PHP só aceita <code>int</code> ou <code>string</code>{" "}
        como chave. <code>SplObjectStorage</code> resolve isso — funciona como um mapa{" "}
        <code>objeto =&gt; valor</code>, ideal para anexar metadados sem poluir as próprias
        classes:
      </p>

      <PhpBlock
        filename="permissoes.php"
        code={`<?php
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
echo "Visitante existe? " . ($permissoes->contains($visitante) ? 'sim' : 'não') . PHP_EOL;`}
        output={`Usuários cadastrados: 3
- Ada: admin, editor
- Linus: editor
- Grace: admin
Visitante existe? não`}
      />

      <p>
        Note que o <code>contains()</code> compara por <strong>identidade do objeto</strong> (a
        mesma instância), não por valor. Dois <code>new Usuario('Ada')</code> diferentes são
        chaves distintas.
      </p>

      <h2>SplFixedArray: array de tamanho fixo, mais leve</h2>
      <p>
        Quando você sabe exatamente quantos elementos terá e usa só índices inteiros sequenciais,{" "}
        <code>SplFixedArray</code> consome bem menos memória que um array padrão e tem acesso
        levemente mais rápido. Caso típico: matrizes numéricas, buffers, simulações.
      </p>

      <PhpBlock
        filename="bench-fixed.php"
        code={`<?php
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
echo "Economia: " . number_format(100 - ($memFixed / $memNormal * 100), 1) . "%" . PHP_EOL;`}
        output={`Array normal: 32.00 MB
SplFixedArray: 8.00 MB
Economia: 75.0%`}
      />

      <AlertBox type="success" title="Quando usar SplFixedArray">
        Tamanho conhecido + chaves inteiras + muito grande (centenas de milhares). Para 100
        elementos a diferença é irrelevante. Para 10 milhões, a diferença pode ser entre rodar
        e estourar memória.
      </AlertBox>

      <h2>SplDoublyLinkedList: a base de Stack e Queue</h2>
      <p>
        <code>SplStack</code> e <code>SplQueue</code> herdam de <code>SplDoublyLinkedList</code>{" "}
        — uma lista duplamente ligada. Use direto quando você precisa adicionar/remover de
        ambas as pontas (deque):
      </p>

      <PhpBlock
        filename="deque.php"
        code={`<?php
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
}`}
        output={`Tamanho: 4
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
 < A`}
      />

      <h2>Comparação direta: array vs SPL</h2>
      <p>
        Em prática, qual escolher? A regra de bolso:
      </p>
      <ul>
        <li><strong>Array nativo</strong>: 90% dos casos. Familiar, flexível, performático.</li>
        <li><strong>SplStack/SplQueue</strong>: quando você quer <em>expressar</em> a intenção (pilha/fila), mesmo que array dê conta.</li>
        <li><strong>SplPriorityQueue</strong>: priorização real, com inserção e extração eficiente. Difícil de imitar com array.</li>
        <li><strong>SplObjectStorage</strong>: única opção quando a chave é objeto.</li>
        <li><strong>SplFixedArray</strong>: economia de memória para volumes grandes com chaves int sequenciais.</li>
        <li><strong>SplDoublyLinkedList</strong>: deque (inserir/remover nas duas pontas) com O(1).</li>
      </ul>

      <AlertBox type="info" title="A alternativa moderna: php-ds">
        A extensão <strong>php-ds/php-ds</strong> (também tem fallback em PHP puro) entrega
        estruturas mais rápidas e modernas: <code>Ds\\Vector</code>, <code>Ds\\Map</code>,{" "}
        <code>Ds\\Set</code>, <code>Ds\\PriorityQueue</code>. Em benchmarks ela costuma bater
        SPL (e até array em alguns casos). Vale conhecer.
      </AlertBox>

      <h2>Combinando SPL com generics tipados</h2>
      <p>
        PHP 8.4 não tem generics nativos, mas dá pra documentar com PHPDoc para o PHPStan/PHPStorm
        te ajudarem:
      </p>

      <PhpBlock
        filename="fila-tipada.php"
        code={`<?php
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
}`}
        output={`[j-1] enviar email
[j-2] gerar PDF`}
      />

      <h2>Rodando o benchmark</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/spl"
        command="php -d memory_limit=128M bench-fixed.php"
        output={`Array normal: 32.00 MB
SplFixedArray: 8.00 MB
Economia: 75.0%`}
      />

      <AlertBox type="success" title="Resumindo">
        Use array por padrão. Promova para SPL quando: (1) a semântica importa (pilha/fila),
        (2) precisa priorização real, (3) chave é objeto, ou (4) volume grande justifica a
        economia de memória. Não force SPL onde array já é claro — código que não precisa.
      </AlertBox>

      <p>
        Você agora conhece o arsenal de estruturas além do array. No próximo capítulo a gente
        vê <strong>iteradores</strong> de verdade — como criar suas próprias classes que se
        comportam como coleções nativas no <code>foreach</code>.
      </p>
    </PageContainer>
  );
}
