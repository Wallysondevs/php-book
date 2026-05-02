import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function SwitchMatch() {
  return (
    <PageContainer
      title="switch e match"
      subtitle="O switch tradicional com seu temido fallthrough, o match do PHP 8 com comparação estrita e retorno de expressão, e quando trocar uma cadeia de if/elseif por algo mais elegante."
      difficulty="iniciante"
      timeToRead="10 min"
      category="Controle de Fluxo"
    >
      <AlertBox type="info" title="Pré-requisitos">
        <p>Antes deste capítulo, é bom já ter visto: <a href="#/operadores" className="text-[#8993BE] underline">Operadores</a>, <a href="#/if-else" className="text-[#8993BE] underline">if / elseif / else</a>.</p>
      </AlertBox>

      <p><strong className="text-[#8993BE] font-mono">switch vs match</strong> — ambos comparam um valor com várias opções. <code>switch</code> é o velho: usa comparação solta (<code>==</code>), exige <code>break</code> em cada caso (senão "vaza" para o próximo) e é uma <em>declaração</em>. <code>match</code> (PHP 8+) é o moderno: comparação estrita (<code>===</code>), <strong>sem fallthrough</strong>, e é uma <em>expressão</em> que retorna valor. Quando puder, prefira <code>match</code>.</p>

      <p><strong className="text-[#8993BE] font-mono">break</strong> — sai imediatamente do bloco atual (<code>switch</code>, <code>for</code>, <code>while</code>, <code>foreach</code>). Em <code>switch</code> é obrigatório para evitar fallthrough. Aceita um número opcional (<code>break 2</code>) para escapar de loops aninhados.</p>

      <h2>Quando vários ifs viram ruído</h2>
      <p>
        Você precisa decidir entre cinco status, traduzir um código numérico para uma label, ou despachar uma
        ação por nome. Pode escrever <code>if/elseif</code> infinitos, mas existe coisa melhor. Em PHP a gente
        tem dois operadores para isso: o velho <code>switch</code> (existe desde sempre) e o moderno
        <code> match</code> (PHP 8.0+).
      </p>

      <h2>switch tradicional</h2>
      <p>
        O <code>switch</code> compara um valor com vários <code>case</code>s. <strong>Atenção:</strong> a
        comparação é <em>solta</em> (<code>==</code>, não <code>===</code>) e — a pegadinha clássica — você
        <strong>precisa</strong> de <code>break</code> em cada caso, ou o código continua executando os
        próximos (o famoso <em>fallthrough</em>).
      </p>

      <PhpBlock
        filename="switch-basico.php"
        code={`<?php
declare(strict_types=1);

$status = "pago";

switch ($status) {
    case "pendente":
        echo "Aguardando pagamento";
        break;
    case "pago":
        echo "Pedido confirmado";
        break;
    case "cancelado":
        echo "Pedido cancelado";
        break;
    default:
        echo "Status desconhecido";
}
echo PHP_EOL;`}
        output={`Pedido confirmado`}
      />

      <AlertBox type="danger" title="Esqueci o break, e agora?">
        Sem o <code>break</code>, o PHP executa o case correspondente <strong>e todos os seguintes</strong> até
        achar um <code>break</code> ou o fim do bloco. Isso causa bugs sutis. Sempre cheque os <code>break</code>
        antes de fechar o arquivo.
      </AlertBox>

      <h2>Fallthrough proposital</h2>
      <p>
        Tem situações onde fallthrough é exatamente o que você quer: agrupar vários cases que fazem a mesma coisa.
      </p>

      <PhpBlock
        filename="fallthrough.php"
        code={`<?php
declare(strict_types=1);

function tipoDoDia(string $dia): string {
    switch (strtolower($dia)) {
        case "sabado":
        case "domingo":
            return "fim de semana";
        case "segunda":
        case "terca":
        case "quarta":
        case "quinta":
        case "sexta":
            return "dia útil";
        default:
            return "dia inválido";
    }
}

echo tipoDoDia("sabado") . PHP_EOL;
echo tipoDoDia("Quarta") . PHP_EOL;
echo tipoDoDia("xyz") . PHP_EOL;`}
        output={`fim de semana
dia útil
dia inválido`}
      />

      <p>
        Aqui o <code>return</code> serve como o <code>break</code>: encerra o switch (e a função). Esse é um
        padrão limpo e comum.
      </p>

      <AlertBox type="warning" title="A comparação solta morde">
        <code>switch (0)</code> bate em <code>case "qualquer-string"</code> porque <code>0 == "qualquer-string"</code>{" "}
        era <code>true</code> em PHP antigo. No PHP 8 mudou (<code>"qualquer-string" == 0</code> agora é
        <code> false</code>), mas o switch continua usando <code>==</code>. Para comparação estrita,
        use <strong>match</strong> — é justamente o problema que ele resolve.
      </AlertBox>

      <h2>match: o switch que faltava</h2>
      <p>
        O <code>match</code> chegou no PHP 8.0 e corrigiu três problemas do <code>switch</code> de uma vez só:
      </p>
      <ul>
        <li>Comparação <strong>estrita</strong> (<code>===</code>), sem mais surpresas com tipos.</li>
        <li><strong>Sem fallthrough</strong> — cada braço é independente.</li>
        <li>É uma <strong>expressão</strong>, retorna valor diretamente.</li>
      </ul>

      <PhpBlock
        filename="match-basico.php"
        code={`<?php
declare(strict_types=1);

function descricaoStatus(string $status): string {
    return match ($status) {
        "pendente"  => "Aguardando pagamento",
        "pago"      => "Pedido confirmado",
        "cancelado" => "Pedido cancelado",
        default     => "Status desconhecido",
    };
}

echo descricaoStatus("pago") . PHP_EOL;
echo descricaoStatus("xyz") . PHP_EOL;`}
        output={`Pedido confirmado
Status desconhecido`}
      />

      <p>
        Note como cada braço usa <code>=&gt;</code> e termina com vírgula. Não tem <code>break</code>, não tem
        chaves. Funciona como uma expressão: você atribui, retorna, passa como argumento.
      </p>

      <h2>Múltiplos valores no mesmo braço</h2>
      <p>
        Para agrupar valores, separe por vírgula — equivalente ao fallthrough proposital do switch, mas
        explícito.
      </p>

      <PhpBlock
        filename="match-multi.php"
        code={`<?php
declare(strict_types=1);

function tipoDoDia(string $dia): string {
    return match (strtolower($dia)) {
        "sabado", "domingo"
            => "fim de semana",
        "segunda", "terca", "quarta", "quinta", "sexta"
            => "dia útil",
        default
            => "dia inválido",
    };
}

echo tipoDoDia("Domingo") . PHP_EOL;
echo tipoDoDia("Sexta") . PHP_EOL;
echo tipoDoDia("hoje") . PHP_EOL;`}
        output={`fim de semana
dia útil
dia inválido`}
      />

      <h2>match sem default lança UnhandledMatchError</h2>
      <p>
        Se você omite o <code>default</code> e nenhum braço bate, o <code>match</code> lança uma exceção
        <code> UnhandledMatchError</code>. Isso é uma <strong>feature</strong>: garante que você cobriu todos os
        casos possíveis. Útil principalmente com <code>enum</code>s.
      </p>

      <PhpBlock
        filename="match-enum.php"
        code={`<?php
declare(strict_types=1);

enum StatusPedido: string {
    case Pendente   = "pendente";
    case Pago       = "pago";
    case Cancelado  = "cancelado";
}

function corDoStatus(StatusPedido $s): string {
    return match ($s) {
        StatusPedido::Pendente  => "amarelo",
        StatusPedido::Pago      => "verde",
        StatusPedido::Cancelado => "vermelho",
    };
}

echo corDoStatus(StatusPedido::Pago) . PHP_EOL;
echo corDoStatus(StatusPedido::Pendente) . PHP_EOL;`}
        output={`verde
amarelo`}
      />

      <AlertBox type="success" title="Por que essa combinação é poderosa">
        Se amanhã você adicionar <code>StatusPedido::Reembolsado</code>, o PHP vai te avisar (em runtime, e
        ferramentas como PHPStan em análise estática) que o <code>match</code> não cobre o novo caso.
        É segurança grátis.
      </AlertBox>

      <h2>Comparação estrita: o detalhe que pega</h2>

      <PhpBlock
        filename="estrito.php"
        code={`<?php
declare(strict_types=1);

$valor = "1";

switch ($valor) {
    case 1:
        echo "switch: bateu em inteiro 1" . PHP_EOL;
        break;
    case "1":
        echo "switch: bateu em string '1'" . PHP_EOL;
        break;
}

$resultado = match ($valor) {
    1   => "match: inteiro 1",
    "1" => "match: string '1'",
};
echo $resultado . PHP_EOL;`}
        output={`switch: bateu em inteiro 1
match: string '1'`}
      />

      <p>
        Mesmo valor de entrada, resultado diferente. O <code>switch</code> bateu no <code>1</code> (comparação
        solta), o <code>match</code> só aceita o tipo certo. Quase sempre você quer o comportamento estrito.
      </p>

      <h2>Condições mais ricas com match (true)</h2>
      <p>
        O <code>match</code> compara o sujeito com cada braço. Se o sujeito for <code>true</code>, cada braço
        vira essencialmente uma condição booleana — uma forma muito limpa de escrever escadas de <code>if/elseif</code>.
      </p>

      <PhpBlock
        filename="match-true.php"
        code={`<?php
declare(strict_types=1);

function faixaEtaria(int $idade): string {
    return match (true) {
        $idade < 13 => "criança",
        $idade < 18 => "adolescente",
        $idade < 60 => "adulto",
        default     => "idoso",
    };
}

echo faixaEtaria(8) . PHP_EOL;
echo faixaEtaria(16) . PHP_EOL;
echo faixaEtaria(35) . PHP_EOL;
echo faixaEtaria(75) . PHP_EOL;`}
        output={`criança
adolescente
adulto
idoso`}
      />

      <h2>switch ou match? Resumo prático</h2>
      <ul>
        <li><strong>Use match</strong> sempre que estiver no PHP 8+ e for retornar/atribuir um valor.</li>
        <li><strong>Use switch</strong> quando precisa rodar <em>blocos</em> grandes de código com várias instruções por caso (match espera expressões).</li>
        <li><strong>Nunca</strong> dependa de comparação solta — se está confiando em <code>"1" == 1</code> a lógica está errada.</li>
        <li>Combine <code>match</code> + <code>enum</code> sempre que possível: o compilador vira seu QA.</li>
      </ul>

      <p>
        No próximo capítulo vamos para <strong>loops</strong> — onde você descobre que <code>foreach</code>
        resolve 95% dos casos e que <code>break N</code> existe (e às vezes salva sua vida).
      </p>
    </PageContainer>
  );
}
