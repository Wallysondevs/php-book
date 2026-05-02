import{j as e}from"./index-Bb4MiiJL.js";import{P as s,a,A as o}from"./AlertBox-BpD-xIsb.js";import{T as r}from"./TerminalBlock-DGurMC1r.js";function l(){return e.jsxs(s,{title:"Nullsafe (?->) e match",subtitle:"Como navegar com segurança em cadeias de objetos que podem ser null e por que match substituiu de vez o velho switch para retornos de valor.",difficulty:"intermediario",timeToRead:"9 min",category:"PHP Moderno",children:[e.jsx("h2",{children:"O problema: a escada do null"}),e.jsxs("p",{children:["Você quer pegar o nome do país do endereço do perfil de um usuário. Em qualquer lugar do caminho, algum elo pode ser ",e.jsx("code",{children:"null"}),". Antes do PHP 8.0, isso virava uma escada de ",e.jsx("code",{children:"isset"}),":"]}),e.jsx(a,{filename:"legado.php",code:`<?php
declare(strict_types=1);

function paisDoUsuario(?object $user): ?string {
    if ($user !== null
        && $user->profile !== null
        && $user->profile->endereco !== null
    ) {
        return $user->profile->endereco->pais;
    }
    return null;
}`}),e.jsxs("p",{children:["Com o operador ",e.jsx("strong",{children:"nullsafe"})," ",e.jsx("code",{children:"?->"}),', a mesma cadeia vira uma única linha que "curto-circuita" no primeiro ',e.jsx("code",{children:"null"}),":"]}),e.jsx(a,{filename:"nullsafe.php",code:`<?php
declare(strict_types=1);

class Endereco { public function __construct(public string $pais) {} }
class Profile  { public function __construct(public ?Endereco $endereco) {} }
class User     { public function __construct(public ?Profile  $profile) {} }

function paisDoUsuario(?User $user): ?string {
    return $user?->profile?->endereco?->pais;
}

$u1 = new User(new Profile(new Endereco("Brasil")));
$u2 = new User(new Profile(null));
$u3 = null;

var_dump(paisDoUsuario($u1));
var_dump(paisDoUsuario($u2));
var_dump(paisDoUsuario($u3));`,output:`string(6) "Brasil"
NULL
NULL`}),e.jsxs("p",{children:['Lê-se assim: "se ',e.jsx("code",{children:"$user"})," for null, devolve null; senão pegue"," ",e.jsx("code",{children:"profile"}),', e siga avaliando — qualquer null na cadeia cancela tudo e o resultado final é null".']}),e.jsx("h2",{children:"Funciona com chamadas de método também"}),e.jsx(a,{filename:"metodos.php",code:`<?php
declare(strict_types=1);

class Carrinho {
    public function __construct(private array $itens = []) {}
    public function total(): int {
        return array_sum(array_column($this->itens, "preco"));
    }
}

class Sessao {
    public function __construct(public ?Carrinho $carrinho = null) {}
}

function totalDoCarrinho(?Sessao $s): int {
    return $s?->carrinho?->total() ?? 0;
}

$ativa = new Sessao(new Carrinho([
    ["nome" => "Café",  "preco" => 25],
    ["nome" => "Bolo",  "preco" => 18],
]));

$vazia = new Sessao(carrinho: null);

echo totalDoCarrinho($ativa) . PHP_EOL;
echo totalDoCarrinho($vazia) . PHP_EOL;
echo totalDoCarrinho(null)   . PHP_EOL;`,output:`43
0
0`}),e.jsxs(o,{type:"info",title:"?-> só funciona em propriedades e métodos",children:["Para ",e.jsx("strong",{children:"arrays"})," não existe sintaxe nullsafe equivalente. Continue usando ",e.jsx("code",{children:"$arr['chave'] ?? padrão"}),", ou converta o array em objeto antes de navegar."]}),e.jsx("h2",{children:"?? vs ?-> — quando usar cada um"}),e.jsx("p",{children:"Os dois lidam com null, mas em momentos diferentes:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"?->"}),' — "se o ',e.jsx("strong",{children:"alvo"}),' for null, não chama nada e devolve null". Atua na ',e.jsx("em",{children:"navegação"}),"."]}),e.jsxs("li",{children:[e.jsx("code",{children:"??"}),' — "se o ',e.jsx("strong",{children:"resultado"}),' for null, use este outro valor". Atua no ',e.jsx("em",{children:"fallback"}),"."]})]}),e.jsx(a,{filename:"combinando.php",code:`<?php
declare(strict_types=1);

class Perfil { public ?string $apelido = null; }
class Usuario { public ?Perfil $perfil = null; }

$u = new Usuario();
$u->perfil = new Perfil(); // perfil existe, mas apelido é null

// SEM nullsafe: erro se $u->perfil for null
// echo $u->perfil->apelido;        // Error se perfil null

// COM nullsafe + fallback:
$nome = $u?->perfil?->apelido ?? "anônimo";
echo $nome . PHP_EOL;

$u2 = new Usuario();           // perfil é null
$nome2 = $u2?->perfil?->apelido ?? "anônimo";
echo $nome2 . PHP_EOL;`,output:`anônimo
anônimo`}),e.jsxs(o,{type:"warning",title:"Nullsafe não vira atribuição",children:["Não dá para escrever ",e.jsx("code",{children:'$user?->profile->nome = "x"'}),". O lado esquerdo de uma atribuição precisa ser determinístico — o operador só funciona em ",e.jsx("em",{children:"leitura"}),". Para escrever, faça o ",e.jsx("code",{children:"if ($user !== null)"})," à moda antiga."]}),e.jsx("h2",{children:"match: o irmão moderno do switch"}),e.jsxs("p",{children:["O ",e.jsx("code",{children:"match"})," chegou no PHP 8.0 e resolve três defeitos eternos do",e.jsx("code",{children:" switch"}),": comparação estrita (",e.jsx("code",{children:"==="}),"), ",e.jsx("em",{children:"expression"})," ","(devolve valor) e ausência de ",e.jsx("em",{children:"fallthrough"})," acidental."]}),e.jsx(a,{filename:"match-basico.php",code:`<?php
declare(strict_types=1);

function statusHttpHumano(int $code): string {
    return match (true) {
        $code >= 200 && $code < 300 => "sucesso",
        $code >= 300 && $code < 400 => "redirecionamento",
        $code >= 400 && $code < 500 => "erro do cliente",
        $code >= 500 && $code < 600 => "erro do servidor",
        default                     => "desconhecido",
    };
}

foreach ([200, 301, 404, 500, 999] as $c) {
    echo "$c → " . statusHttpHumano($c) . PHP_EOL;
}`,output:`200 → sucesso
301 → redirecionamento
404 → erro do cliente
500 → erro do servidor
999 → desconhecido`}),e.jsxs("p",{children:["Note três coisas: ",e.jsx("code",{children:"match"})," retorna um valor (perfeito para"," ",e.jsx("code",{children:"return"}),"), aceita várias condições por ramo via vírgula, e exige cobertura — se nenhum ramo casar e não houver ",e.jsx("code",{children:"default"}),", lança"," ",e.jsx("code",{children:"UnhandledMatchError"}),"."]}),e.jsx("h2",{children:"match com valores múltiplos"}),e.jsx(a,{filename:"match-multi.php",code:`<?php
declare(strict_types=1);

enum Dia: string {
    case Seg = "seg"; case Ter = "ter"; case Qua = "qua";
    case Qui = "qui"; case Sex = "sex";
    case Sab = "sab"; case Dom = "dom";
}

function tipoDoDia(Dia $d): string {
    return match ($d) {
        Dia::Sab, Dia::Dom               => "fim de semana",
        Dia::Seg, Dia::Ter, Dia::Qua,
        Dia::Qui, Dia::Sex               => "dia útil",
    };
}

foreach (Dia::cases() as $d) {
    echo "{$d->value}: " . tipoDoDia($d) . PHP_EOL;
}`,output:`seg: dia útil
ter: dia útil
qua: dia útil
qui: dia útil
sex: dia útil
sab: fim de semana
dom: fim de semana`}),e.jsxs(o,{type:"success",title:"Comparação estrita por padrão",children:["Onde ",e.jsx("code",{children:"switch (1)"})," casaria com ",e.jsx("code",{children:'case "1"'})," (juggling de tipos), ",e.jsx("code",{children:"match (1)"})," NÃO casa com ",e.jsx("code",{children:'"1"'}),". Isso elimina bugs sutis quando o valor vem de input do usuário ou banco e o tipo não é o que você imaginava."]}),e.jsx("h2",{children:"switch vs match lado a lado"}),e.jsx(a,{filename:"comparacao.php",code:`<?php
declare(strict_types=1);

$status = "1";

// switch — ATENÇÃO ao juggling
switch ($status) {
    case 1:
        echo "switch: int 1 casou com string '1' (!)\\n";
        break;
    default:
        echo "switch: nada\\n";
}

// match — comparação estrita
$msg = match ($status) {
    1       => "match: int 1",
    "1"     => "match: string '1' (correto)",
    default => "match: nada",
};
echo $msg . PHP_EOL;`,output:`switch: int 1 casou com string '1' (!)
match: string '1' (correto)`}),e.jsx("h2",{children:"Padrão poderoso: match + nullsafe + ??"}),e.jsx("p",{children:"Os três operadores combinam muito bem para resolver lógica de UI sem if-encadeado. Veja um seletor de mensagem amigável:"}),e.jsx(a,{filename:"ui.php",code:`<?php
declare(strict_types=1);

enum Plano: string {
    case Free = "free";
    case Pro  = "pro";
    case Ent  = "enterprise";
}

class Assinatura { public function __construct(public Plano $plano) {} }
class Conta      { public function __construct(public ?Assinatura $assinatura = null) {} }

function chamadaParaAcao(?Conta $c): string {
    $plano = $c?->assinatura?->plano ?? Plano::Free;
    return match ($plano) {
        Plano::Free => "Faça upgrade e libere tudo!",
        Plano::Pro  => "Convide um colega e ganhe 1 mês grátis.",
        Plano::Ent  => "Acesse o suporte dedicado 24/7.",
    };
}

echo chamadaParaAcao(null) . PHP_EOL;
echo chamadaParaAcao(new Conta()) . PHP_EOL;
echo chamadaParaAcao(new Conta(new Assinatura(Plano::Pro))) . PHP_EOL;
echo chamadaParaAcao(new Conta(new Assinatura(Plano::Ent))) . PHP_EOL;`,output:`Faça upgrade e libere tudo!
Faça upgrade e libere tudo!
Convide um colega e ganhe 1 mês grátis.
Acesse o suporte dedicado 24/7.`}),e.jsx("h2",{children:"Quando NÃO usar nullsafe"}),e.jsxs("ul",{children:[e.jsxs("li",{children:["Quando null no meio da cadeia ",e.jsx("strong",{children:"indica bug"}),": deixe explodir com erro claro em vez de mascarar."]}),e.jsxs("li",{children:["Em assertions e validações de pré-condição — prefira"," ",e.jsx("code",{children:"assert($x !== null)"})," ou throw imediato."]}),e.jsx("li",{children:"Encadeamentos com efeitos colaterais (chamadas que registram log, mutam estado): suprimir silenciosamente é arriscado."})]}),e.jsx("h2",{children:"Verificando a versão"}),e.jsx(r,{user:"dev",host:"php",cwd:"~/projetos/null",command:"php -v",output:"PHP 8.4.1 (cli) — nullsafe (8.0+) e match (8.0+) disponíveis"}),e.jsx(r,{user:"dev",host:"php",cwd:"~/projetos/null",command:"php ui.php",output:`Faça upgrade e libere tudo!
Faça upgrade e libere tudo!
Convide um colega e ganhe 1 mês grátis.
Acesse o suporte dedicado 24/7.`}),e.jsxs("p",{children:["Combinar ",e.jsx("code",{children:"?->"}),", ",e.jsx("code",{children:"??"})," e ",e.jsx("code",{children:"match"})," é a forma moderna de escrever lógica condicional limpa em PHP. No próximo capítulo a gente desce para o tratamento de erros com ",e.jsx("strong",{children:"try/catch/finally"})," ","— onde a hierarquia ",e.jsx("code",{children:"Throwable"})," entra em cena."]})]})}export{l as default};
