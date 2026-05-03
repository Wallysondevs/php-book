import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Nullsafe() {
  return (
    <PageContainer
      title="Nullsafe (?->) e match"
      subtitle="Como navegar com segurança em cadeias de objetos que podem ser null e por que match substituiu de vez o velho switch para retornos de valor."
      difficulty="intermediario"
      timeToRead="9 min"
      category="PHP Moderno"
    >
      <AlertBox type="info" title="Pré-requisitos">
          <p>Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP.</p>
        </AlertBox>
        <h2>Glossário rápido</h2>
        <ul>
          <li>
            <strong>{"$o?->m()"}</strong> {' — '} {"chama método só se $o não for null."}
          </li>
        <li>
            <strong>{"Encadeado"}</strong> {' — '} {"$user?->profile?->avatar — para na primeira null."}
          </li>
        <li>
            <strong>{"vs ??"}</strong> {' — '} {"?? trata null no resultado; ?-> evita chamar método."}
          </li>
        <li>
            <strong>{"Limitação"}</strong> {' — '} {"não funciona à esquerda de atribuição."}
          </li>
        <li>
            <strong>{"Combina com ??"}</strong> {' — '} {"$x = $o?->name ?? \"default\";"}
          </li>
        </ul>
          <h2>O problema: a escada do null</h2>
      <p>
        Você quer pegar o nome do país do endereço do perfil de um usuário. Em
        qualquer lugar do caminho, algum elo pode ser <code>null</code>. Antes do
        PHP 8.0, isso virava uma escada de <code>isset</code>:
      </p>

      <PhpBlock
        filename="legado.php"
        code={`<?php
declare(strict_types=1);

function paisDoUsuario(?object $user): ?string {
    if ($user !== null
        && $user->profile !== null
        && $user->profile->endereco !== null
    ) {
        return $user->profile->endereco->pais;
    }
    return null;
}`}
      />

      <p>
        Com o operador <strong>nullsafe</strong> <code>?-&gt;</code>, a mesma cadeia
        vira uma única linha que &quot;curto-circuita&quot; no primeiro <code>null</code>:
      </p>

      <PhpBlock
        filename="nullsafe.php"
        code={`<?php
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
var_dump(paisDoUsuario($u3));`}
        output={`string(6) "Brasil"
NULL
NULL`}
      />

      <p>
        Lê-se assim: &quot;se <code>$user</code> for null, devolve null; senão pegue{" "}
        <code>profile</code>, e siga avaliando — qualquer null na cadeia cancela tudo
        e o resultado final é null&quot;.
      </p>

      <h2>Funciona com chamadas de método também</h2>
      <PhpBlock
        filename="metodos.php"
        code={`<?php
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
echo totalDoCarrinho(null)   . PHP_EOL;`}
        output={`43
0
0`}
      />

      <AlertBox type="info" title="?-> só funciona em propriedades e métodos">
        Para <strong>arrays</strong> não existe sintaxe nullsafe equivalente. Continue
        usando <code>$arr[&apos;chave&apos;] ?? padrão</code>, ou converta o array em objeto
        antes de navegar.
      </AlertBox>

      <h2>?? vs ?-&gt; — quando usar cada um</h2>
      <p>
        Os dois lidam com null, mas em momentos diferentes:
      </p>
      <ul>
        <li>
          <code>?-&gt;</code> — &quot;se o <strong>alvo</strong> for null, não chama nada e
          devolve null&quot;. Atua na <em>navegação</em>.
        </li>
        <li>
          <code>??</code> — &quot;se o <strong>resultado</strong> for null, use este outro
          valor&quot;. Atua no <em>fallback</em>.
        </li>
      </ul>

      <PhpBlock
        filename="combinando.php"
        code={`<?php
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
echo $nome2 . PHP_EOL;`}
        output={`anônimo
anônimo`}
      />

      <AlertBox type="warning" title="Nullsafe não vira atribuição">
        Não dá para escrever <code>$user?-&gt;profile-&gt;nome = &quot;x&quot;</code>. O lado
        esquerdo de uma atribuição precisa ser determinístico — o operador só
        funciona em <em>leitura</em>. Para escrever, faça o <code>if ($user
        !== null)</code> à moda antiga.
      </AlertBox>

      <h2>match: o irmão moderno do switch</h2>
      <p>
        O <code>match</code> chegou no PHP 8.0 e resolve três defeitos eternos do
        <code> switch</code>: comparação estrita (<code>===</code>), <em>expression</em>{" "}
        (devolve valor) e ausência de <em>fallthrough</em> acidental.
      </p>

      <PhpBlock
        filename="match-basico.php"
        code={`<?php
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
}`}
        output={`200 → sucesso
301 → redirecionamento
404 → erro do cliente
500 → erro do servidor
999 → desconhecido`}
      />

      <p>
        Note três coisas: <code>match</code> retorna um valor (perfeito para{" "}
        <code>return</code>), aceita várias condições por ramo via vírgula, e exige
        cobertura — se nenhum ramo casar e não houver <code>default</code>, lança{" "}
        <code>UnhandledMatchError</code>.
      </p>

      <h2>match com valores múltiplos</h2>
      <PhpBlock
        filename="match-multi.php"
        code={`<?php
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
}`}
        output={`seg: dia útil
ter: dia útil
qua: dia útil
qui: dia útil
sex: dia útil
sab: fim de semana
dom: fim de semana`}
      />

      <AlertBox type="success" title="Comparação estrita por padrão">
        Onde <code>switch (1)</code> casaria com <code>case &quot;1&quot;</code> (juggling de
        tipos), <code>match (1)</code> NÃO casa com <code>&quot;1&quot;</code>. Isso elimina
        bugs sutis quando o valor vem de input do usuário ou banco e o tipo não é o
        que você imaginava.
      </AlertBox>

      <h2>switch vs match lado a lado</h2>
      <PhpBlock
        filename="comparacao.php"
        code={`<?php
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
echo $msg . PHP_EOL;`}
        output={`switch: int 1 casou com string '1' (!)
match: string '1' (correto)`}
      />

      <h2>Padrão poderoso: match + nullsafe + ??</h2>
      <p>
        Os três operadores combinam muito bem para resolver lógica de UI sem
        if-encadeado. Veja um seletor de mensagem amigável:
      </p>

      <PhpBlock
        filename="ui.php"
        code={`<?php
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
echo chamadaParaAcao(new Conta(new Assinatura(Plano::Ent))) . PHP_EOL;`}
        output={`Faça upgrade e libere tudo!
Faça upgrade e libere tudo!
Convide um colega e ganhe 1 mês grátis.
Acesse o suporte dedicado 24/7.`}
      />

      <h2>Quando NÃO usar nullsafe</h2>
      <ul>
        <li>
          Quando null no meio da cadeia <strong>indica bug</strong>: deixe explodir
          com erro claro em vez de mascarar.
        </li>
        <li>
          Em assertions e validações de pré-condição — prefira{" "}
          <code>assert($x !== null)</code> ou throw imediato.
        </li>
        <li>
          Encadeamentos com efeitos colaterais (chamadas que registram log, mutam
          estado): suprimir silenciosamente é arriscado.
        </li>
      </ul>

      <h2>Verificando a versão</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/null"
        command="php -v"
        output={`PHP 8.4.1 (cli) — nullsafe (8.0+) e match (8.0+) disponíveis`}
      />

      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/null"
        command="php ui.php"
        output={`Faça upgrade e libere tudo!
Faça upgrade e libere tudo!
Convide um colega e ganhe 1 mês grátis.
Acesse o suporte dedicado 24/7.`}
      />

      <p>
        Combinar <code>?-&gt;</code>, <code>??</code> e <code>match</code> é a forma
        moderna de escrever lógica condicional limpa em PHP. No próximo capítulo a
        gente desce para o tratamento de erros com <strong>try/catch/finally</strong>{" "}
        — onde a hierarquia <code>Throwable</code> entra em cena.
      </p>
    </PageContainer>
  );
}
