import{j as e}from"./index-B5-q-eol.js";import{P as r,A as a,a as o}from"./AlertBox-CVbFLZEd.js";import{T as s}from"./TerminalBlock-6fqVIX2R.js";function d(){return e.jsxs(r,{title:"Enums (PHP 8.1)",subtitle:"Adeus às constantes soltas e aos magic strings: enums dão tipo, autocomplete e métodos para conjuntos finitos de valores como status, papéis e tipos de pagamento.",difficulty:"intermediario",timeToRead:"11 min",category:"PHP Moderno",children:[e.jsx(a,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"enum Status"})," "," — "," ","tipo enumerado nativo (PHP 8.1+)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Pure vs backed"})," "," — "," ","puro = só nome; backed = nome + valor (string ou int)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"cases()"})," "," — "," ","método estático que devolve todos os casos."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"from() / tryFrom()"})," "," — "," ","converte valor → enum; tryFrom devolve null se inválido."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Métodos"})," "," — "," ","enums podem ter métodos e implementar interfaces."]})]}),e.jsx("h2",{children:"O problema: constantes soltas e strings mágicas"}),e.jsx("p",{children:"Antes do PHP 8.1, era comum modelar status de pedido com constantes de classe ou — pior — strings cruas espalhadas pelo código. Resultado: erros de digitação viravam bugs silenciosos e o IDE não conseguia ajudar com autocomplete."}),e.jsx(o,{filename:"legado.php",code:`<?php
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
var_dump($p->status === "aprovado");`,output:"bool(false)"}),e.jsxs("p",{children:["Com ",e.jsx("code",{children:"enum"}),", o conjunto de status vira ",e.jsx("strong",{children:"um tipo"}),": o compilador reclama se você inventar um caso e o IDE lista todas as opções possíveis automaticamente."]}),e.jsx("h2",{children:"Enum simples: só os casos"}),e.jsxs("p",{children:["A forma mais básica é a ",e.jsx("em",{children:"pure enum"}),": uma lista nomeada sem valor atrelado. Cada caso é uma instância única (singleton) — você compara com"," ",e.jsx("code",{children:"==="}),"."]}),e.jsx(o,{filename:"status.php",code:`<?php
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

echo $p->status->name . PHP_EOL;`,output:`Pedido aprovado!
Aprovado`}),e.jsxs("p",{children:["Toda instância de enum tem a propriedade mágica ",e.jsx("code",{children:"name"})," que devolve o nome do caso como string. Use isso para logar/exibir, mas evite reconstruir o enum a partir do ",e.jsx("code",{children:"name"})," — para serializar, prefira ",e.jsx("em",{children:"backed enums"}),"."]}),e.jsx("h2",{children:"Backed enums: cada caso tem um valor"}),e.jsxs("p",{children:["Quando você precisa salvar o estado em banco, JSON ou query string, declara o enum com um tipo escalar — ",e.jsx("code",{children:"string"})," ou ",e.jsx("code",{children:"int"})," — e atribui um ",e.jsx("code",{children:"value"})," a cada caso."]}),e.jsx(o,{filename:"papel.php",code:`<?php
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
echo json_encode(["papel" => $p, "prio" => Prioridade::Alta]);`,output:`editor
3
{"papel":"editor","prio":3}`}),e.jsxs(a,{type:"info",title:"Backed enum serializa sozinho",children:["Backed enums implementam ",e.jsx("code",{children:"JsonSerializable"})," automaticamente: quando passados para ",e.jsx("code",{children:"json_encode"}),", viram o seu ",e.jsx("code",{children:"value"}),". Pure enums dão erro se serializados — use backed sempre que houver persistência."]}),e.jsx("h2",{children:"from() e tryFrom(): voltando do valor para o enum"}),e.jsx("p",{children:"Backed enums ganham dois métodos estáticos prontos:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"::from($valor)"})," — devolve o caso ou lança ",e.jsx("code",{children:"ValueError"})," se não existir."]}),e.jsxs("li",{children:[e.jsx("code",{children:"::tryFrom($valor)"})," — devolve o caso ou ",e.jsx("code",{children:"null"}),", sem exceção."]})]}),e.jsx(o,{filename:"from.php",code:`<?php
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
}`,output:`Editor
papel efetivo: Visitante
erro: "hacker" is not a valid backing value for enum Papel`}),e.jsx("h2",{children:"cases(): iterando sobre todas as opções"}),e.jsxs("p",{children:["O método estático ",e.jsx("code",{children:"::cases()"})," devolve um array com todos os casos do enum na ordem em que foram declarados. Perfeito para popular um ",e.jsx("code",{children:"<select>"})," ","ou validar entrada."]}),e.jsx(o,{filename:"cases.php",code:`<?php
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
echo $html;`,output:`1 → Baixa
2 → Media
3 → Alta
<option value="1">Baixa</option>
<option value="2">Media</option>
<option value="3">Alta</option>`}),e.jsx("h2",{children:"Métodos no enum: comportamento junto dos dados"}),e.jsxs("p",{children:["Enums podem ter métodos como qualquer classe. O segredo: dentro do método,"," ",e.jsx("code",{children:"$this"})," é a instância do caso atual. Use ",e.jsx("code",{children:"match"})," para despachar comportamento sem if encadeado."]}),e.jsx(o,{filename:"metodo.php",code:`<?php
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
}`,output:`pendente: Aguardando pagamento (cancelar? sim)
aprovado: Pagamento confirmado (cancelar? sim)
enviado: Em transporte (cancelar? não)
cancelado: Cancelado pelo cliente (cancelar? não)`}),e.jsxs(a,{type:"success",title:"match esgota o enum",children:["Quando o ",e.jsx("code",{children:"match"})," cobre todos os casos do enum, o PHP ",e.jsx("em",{children:"e"})," ","ferramentas como PHPStan garantem que você não esqueceu nenhum. Adicionou um novo caso? O analisador estático aponta exatamente onde faltou tratamento."]}),e.jsx("h2",{children:"Enums implementam interfaces"}),e.jsx("p",{children:"Como qualquer classe, um enum pode implementar uma ou mais interfaces. Isso é muito útil para padronizar contratos (ex.: tudo que pode ser exibido em uma UI)."}),e.jsx(o,{filename:"interface.php",code:`<?php
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
imprimir(Moeda::USD);`,output:`Real brasileiro
Dólar americano`}),e.jsx("h2",{children:"O que enum NÃO pode fazer"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Não tem estado mutável"}),": você não pode declarar propriedades comuns. Cada caso é singleton e imutável por construção."]}),e.jsxs("li",{children:[e.jsxs("strong",{children:["Não pode ser instanciado com ",e.jsx("code",{children:"new"})]}),": só existem os casos declarados."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Não pode estender outra classe"}),": enums só implementam interfaces e podem usar traits (sem propriedades)."]})]}),e.jsxs(a,{type:"warning",title:"Migrando código legado",children:["Trocar ",e.jsx("code",{children:'const STATUS_APROVADO = "aprovado"'})," por enum geralmente quebra comparações com strings. Mantenha o backed value ",e.jsx("strong",{children:"idêntico"})," ao valor antigo para serializar igualzinho ao banco e adicione"," ",e.jsx("code",{children:"StatusPedido::from($linha['status'])"})," na borda da camada de dados."]}),e.jsx("h2",{children:"Rodando os exemplos"}),e.jsx(s,{user:"dev",host:"php",cwd:"~/projetos/enums",command:"php -v",output:`PHP 8.4.1 (cli) (built: ...)
Copyright (c) The PHP Group
Zend Engine v4.4.1`}),e.jsx(s,{user:"dev",host:"php",cwd:"~/projetos/enums",command:"php metodo.php",output:`pendente: Aguardando pagamento (cancelar? sim)
aprovado: Pagamento confirmado (cancelar? sim)
enviado: Em transporte (cancelar? não)
cancelado: Cancelado pelo cliente (cancelar? não)`}),e.jsxs("p",{children:["Enums viraram a forma idiomática de modelar conjuntos finitos no PHP moderno. No próximo capítulo a gente explora ",e.jsx("strong",{children:"Attributes"}),", que são metadados estruturados — a base de frameworks como Symfony, Laravel routing e validadores como o ",e.jsx("code",{children:"symfony/validator"}),"."]})]})}export{d as default};
