import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Enums() {
  return (
    <PageContainer
      title="Enums (PHP 8.1)"
      subtitle="Adeus às constantes soltas e aos magic strings: enums dão tipo, autocomplete e métodos para conjuntos finitos de valores como status, papéis e tipos de pagamento."
      difficulty="intermediario"
      timeToRead="11 min"
      category="PHP Moderno"
    >
      <h2>O problema: constantes soltas e strings mágicas</h2>
      <p>
        Antes do PHP 8.1, era comum modelar status de pedido com constantes de classe
        ou — pior — strings cruas espalhadas pelo código. Resultado: erros de digitação
        viravam bugs silenciosos e o IDE não conseguia ajudar com autocomplete.
      </p>

      <PhpBlock
        filename="legado.php"
        code={`<?php
declare(strict_types=1);

class Pedido {
    public string $status = "pendente";
}

function aprovar(Pedido $p): void {
    // typo silencioso: "aprovaado" nunca casa em comparações
    $p->status = "aprovaado";
}

$p = new Pedido();
aprovar($p);
var_dump($p->status === "aprovado");`}
        output={`bool(false)`}
      />

      <p>
        Com <code>enum</code>, o conjunto de status vira <strong>um tipo</strong>: o
        compilador reclama se você inventar um caso e o IDE lista todas as opções
        possíveis automaticamente.
      </p>

      <h2>Enum simples: só os casos</h2>
      <p>
        A forma mais básica é a <em>pure enum</em>: uma lista nomeada sem valor
        atrelado. Cada caso é uma instância única (singleton) — você compara com{" "}
        <code>===</code>.
      </p>

      <PhpBlock
        filename="status.php"
        code={`<?php
declare(strict_types=1);

enum StatusPedido {
    case Pendente;
    case Aprovado;
    case Cancelado;
}

class Pedido {
    public StatusPedido $status = StatusPedido::Pendente;
}

$p = new Pedido();
$p->status = StatusPedido::Aprovado;

if ($p->status === StatusPedido::Aprovado) {
    echo "Pedido aprovado!" . PHP_EOL;
}

echo $p->status->name . PHP_EOL;`}
        output={`Pedido aprovado!
Aprovado`}
      />

      <p>
        Toda instância de enum tem a propriedade mágica <code>name</code> que devolve o
        nome do caso como string. Use isso para logar/exibir, mas evite reconstruir o
        enum a partir do <code>name</code> — para serializar, prefira <em>backed enums</em>.
      </p>

      <h2>Backed enums: cada caso tem um valor</h2>
      <p>
        Quando você precisa salvar o estado em banco, JSON ou query string, declara o
        enum com um tipo escalar — <code>string</code> ou <code>int</code> — e atribui
        um <code>value</code> a cada caso.
      </p>

      <PhpBlock
        filename="papel.php"
        code={`<?php
declare(strict_types=1);

enum Papel: string {
    case Admin     = "admin";
    case Editor    = "editor";
    case Visitante = "visitante";
}

enum Prioridade: int {
    case Baixa = 1;
    case Media = 2;
    case Alta  = 3;
}

$p = Papel::Editor;
echo $p->value . PHP_EOL;          // editor
echo Prioridade::Alta->value . PHP_EOL; // 3

// salvando no banco/JSON:
echo json_encode(["papel" => $p, "prio" => Prioridade::Alta]);`}
        output={`editor
3
{"papel":"editor","prio":3}`}
      />

      <AlertBox type="info" title="Backed enum serializa sozinho">
        Backed enums implementam <code>JsonSerializable</code> automaticamente: quando
        passados para <code>json_encode</code>, viram o seu <code>value</code>. Pure
        enums dão erro se serializados — use backed sempre que houver persistência.
      </AlertBox>

      <h2>from() e tryFrom(): voltando do valor para o enum</h2>
      <p>
        Backed enums ganham dois métodos estáticos prontos:
      </p>
      <ul>
        <li><code>::from($valor)</code> — devolve o caso ou lança <code>ValueError</code> se não existir.</li>
        <li><code>::tryFrom($valor)</code> — devolve o caso ou <code>null</code>, sem exceção.</li>
      </ul>

      <PhpBlock
        filename="from.php"
        code={`<?php
declare(strict_types=1);

enum Papel: string {
    case Admin     = "admin";
    case Editor    = "editor";
    case Visitante = "visitante";
}

// vindo do banco: string crua → enum tipado
$do_banco = "editor";
$papel = Papel::from($do_banco);
echo $papel->name . PHP_EOL;

// entrada do usuário: pode ser inválida
$entrada = $_GET["papel"] ?? "hacker";
$papel = Papel::tryFrom($entrada) ?? Papel::Visitante;
echo "papel efetivo: " . $papel->name . PHP_EOL;

// from() com valor inválido explode
try {
    Papel::from("hacker");
} catch (\\ValueError $e) {
    echo "erro: " . $e->getMessage() . PHP_EOL;
}`}
        output={`Editor
papel efetivo: Visitante
erro: "hacker" is not a valid backing value for enum Papel`}
      />

      <h2>cases(): iterando sobre todas as opções</h2>
      <p>
        O método estático <code>::cases()</code> devolve um array com todos os casos do
        enum na ordem em que foram declarados. Perfeito para popular um <code>&lt;select&gt;</code>{" "}
        ou validar entrada.
      </p>

      <PhpBlock
        filename="cases.php"
        code={`<?php
declare(strict_types=1);

enum Prioridade: int {
    case Baixa = 1;
    case Media = 2;
    case Alta  = 3;
}

foreach (Prioridade::cases() as $p) {
    echo "{$p->value} → {$p->name}" . PHP_EOL;
}

// montando options de um <select>
$html = "";
foreach (Prioridade::cases() as $p) {
    $html .= "<option value=\\"{$p->value}\\">{$p->name}</option>" . PHP_EOL;
}
echo $html;`}
        output={`1 → Baixa
2 → Media
3 → Alta
<option value="1">Baixa</option>
<option value="2">Media</option>
<option value="3">Alta</option>`}
      />

      <h2>Métodos no enum: comportamento junto dos dados</h2>
      <p>
        Enums podem ter métodos como qualquer classe. O segredo: dentro do método,{" "}
        <code>$this</code> é a instância do caso atual. Use <code>match</code> para
        despachar comportamento sem if encadeado.
      </p>

      <PhpBlock
        filename="metodo.php"
        code={`<?php
declare(strict_types=1);

enum StatusPedido: string {
    case Pendente  = "pendente";
    case Aprovado  = "aprovado";
    case Enviado   = "enviado";
    case Cancelado = "cancelado";

    public function label(): string {
        return match ($this) {
            self::Pendente  => "Aguardando pagamento",
            self::Aprovado  => "Pagamento confirmado",
            self::Enviado   => "Em transporte",
            self::Cancelado => "Cancelado pelo cliente",
        };
    }

    public function podeCancelar(): bool {
        return match ($this) {
            self::Pendente, self::Aprovado => true,
            default                        => false,
        };
    }
}

foreach (StatusPedido::cases() as $s) {
    $cancela = $s->podeCancelar() ? "sim" : "não";
    echo "{$s->value}: {$s->label()} (cancelar? {$cancela})" . PHP_EOL;
}`}
        output={`pendente: Aguardando pagamento (cancelar? sim)
aprovado: Pagamento confirmado (cancelar? sim)
enviado: Em transporte (cancelar? não)
cancelado: Cancelado pelo cliente (cancelar? não)`}
      />

      <AlertBox type="success" title="match esgota o enum">
        Quando o <code>match</code> cobre todos os casos do enum, o PHP <em>e</em>{" "}
        ferramentas como PHPStan garantem que você não esqueceu nenhum. Adicionou um
        novo caso? O analisador estático aponta exatamente onde faltou tratamento.
      </AlertBox>

      <h2>Enums implementam interfaces</h2>
      <p>
        Como qualquer classe, um enum pode implementar uma ou mais interfaces. Isso é
        muito útil para padronizar contratos (ex.: tudo que pode ser exibido em uma UI).
      </p>

      <PhpBlock
        filename="interface.php"
        code={`<?php
declare(strict_types=1);

interface TemRotulo {
    public function rotulo(): string;
}

enum Moeda: string implements TemRotulo {
    case BRL = "BRL";
    case USD = "USD";
    case EUR = "EUR";

    public function rotulo(): string {
        return match ($this) {
            self::BRL => "Real brasileiro",
            self::USD => "Dólar americano",
            self::EUR => "Euro",
        };
    }
}

function imprimir(TemRotulo $item): void {
    echo $item->rotulo() . PHP_EOL;
}

imprimir(Moeda::BRL);
imprimir(Moeda::USD);`}
        output={`Real brasileiro
Dólar americano`}
      />

      <h2>O que enum NÃO pode fazer</h2>
      <ul>
        <li>
          <strong>Não tem estado mutável</strong>: você não pode declarar propriedades
          comuns. Cada caso é singleton e imutável por construção.
        </li>
        <li>
          <strong>Não pode ser instanciado com <code>new</code></strong>: só existem os
          casos declarados.
        </li>
        <li>
          <strong>Não pode estender outra classe</strong>: enums só implementam
          interfaces e podem usar traits (sem propriedades).
        </li>
      </ul>

      <AlertBox type="warning" title="Migrando código legado">
        Trocar <code>const STATUS_APROVADO = "aprovado"</code> por enum geralmente quebra
        comparações com strings. Mantenha o backed value <strong>idêntico</strong> ao
        valor antigo para serializar igualzinho ao banco e adicione{" "}
        <code>StatusPedido::from($linha[&apos;status&apos;])</code> na borda da camada de dados.
      </AlertBox>

      <h2>Rodando os exemplos</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/enums"
        command="php -v"
        output={`PHP 8.4.1 (cli) (built: ...)
Copyright (c) The PHP Group
Zend Engine v4.4.1`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/enums"
        command="php metodo.php"
        output={`pendente: Aguardando pagamento (cancelar? sim)
aprovado: Pagamento confirmado (cancelar? sim)
enviado: Em transporte (cancelar? não)
cancelado: Cancelado pelo cliente (cancelar? não)`}
      />

      <p>
        Enums viraram a forma idiomática de modelar conjuntos finitos no PHP moderno.
        No próximo capítulo a gente explora <strong>Attributes</strong>, que são
        metadados estruturados — a base de frameworks como Symfony, Laravel routing e
        validadores como o <code>symfony/validator</code>.
      </p>
    </PageContainer>
  );
}
