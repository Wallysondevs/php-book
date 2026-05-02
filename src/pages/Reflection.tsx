import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function Reflection() {
  return (
    <PageContainer
      title="Reflection API"
      subtitle="A capacidade do PHP de inspecionar a si mesmo em tempo de execução: ler classes, métodos, propriedades e atributos para construir frameworks, ORMs e containers de DI."
      difficulty="avancado"
      timeToRead="13 min"
      category="Reflection & Meta"
    >
      <h2>O problema: quero instanciar uma classe sem saber o que ela precisa</h2>
      <p>
        Imagine escrever um container de injeção de dependências. Você recebe o nome de uma classe e
        precisa instanciá-la, descobrindo automaticamente o que o construtor pede. Sem reflexão,
        você teria que codar uma fábrica para cada classe. Com <code>ReflectionClass</code>, o PHP
        te conta tudo que sabe sobre qualquer tipo carregado.
      </p>

      <PhpBlock
        filename="primeiro_olhar.php"
        code={`<?php
declare(strict_types=1);

final class Pedido
{
    public function __construct(
        public readonly int $id,
        public readonly string $cliente,
    ) {}

    public function total(): float { return 99.90; }
}

$r = new ReflectionClass(Pedido::class);

echo "Classe: " . $r->getName() . PHP_EOL;
echo "Final?  " . ($r->isFinal() ? 'sim' : 'não') . PHP_EOL;
echo "Métodos: " . PHP_EOL;
foreach ($r->getMethods() as $m) {
    echo "  - {$m->getName()}()" . PHP_EOL;
}`}
        output={`Classe: Pedido
Final?  sim
Métodos:
  - __construct()
  - total()`}
      />

      <h2>ReflectionMethod e ReflectionProperty</h2>
      <p>
        Você pode descer ainda mais e inspecionar parâmetros, tipos de retorno e propriedades
        individualmente. Cada parâmetro vira um <code>ReflectionParameter</code> com tipo,{" "}
        <code>hasDefaultValue()</code> e o nome do tipo (<code>ReflectionNamedType</code>).
      </p>

      <PhpBlock
        filename="metodos_props.php"
        code={`<?php
declare(strict_types=1);

final class Calculadora
{
    public function __construct(private readonly int $precisao = 2) {}

    public function dividir(float $a, float $b): float
    {
        return round($a / $b, $this->precisao);
    }
}

$r = new ReflectionClass(Calculadora::class);

foreach ($r->getMethod('dividir')->getParameters() as $p) {
    $tipo = $p->getType()?->getName() ?? 'mixed';
    echo "param \\\${$p->getName()}: $tipo" . PHP_EOL;
}

foreach ($r->getProperties() as $prop) {
    $tipo = $prop->getType()?->getName() ?? 'mixed';
    $ro = $prop->isReadOnly() ? ' (readonly)' : '';
    echo "prop \\\${$prop->getName()}: $tipo$ro" . PHP_EOL;
}`}
        output={`param $a: float
param $b: float
prop $precisao: int (readonly)`}
      />

      <h2>Acessar propriedades privadas (sem precisar de setAccessible no PHP 8.1+)</h2>
      <p>
        Antes do PHP 8.1, ler ou escrever propriedades privadas via reflexão exigia chamar{" "}
        <code>setAccessible(true)</code> manualmente. A partir do 8.1 esse método foi marcado como
        sem efeito — reflexão já consegue ler/escrever direto. Útil para serializadores e
        ferramentas de debug.
      </p>

      <PhpBlock
        filename="privado.php"
        code={`<?php
declare(strict_types=1);

final class Conta
{
    private float $saldo = 0.0;

    public function depositar(float $v): void { $this->saldo += $v; }
}

$c = new Conta();
$c->depositar(100);

$prop = new ReflectionProperty(Conta::class, 'saldo');
echo "Saldo lido por reflexão: R$ " . $prop->getValue($c) . PHP_EOL;

$prop->setValue($c, 999.99); // não precisa setAccessible no 8.1+
echo "Saldo após hack: R$ " . $prop->getValue($c) . PHP_EOL;`}
        output={`Saldo lido por reflexão: R$ 100
Saldo após hack: R$ 999.99`}
      />

      <AlertBox type="warning" title="Não use isso em código de negócio">
        Quebrar encapsulamento via reflexão é ferramenta de <em>infra</em> (frameworks, ORMs,
        serializadores). Em regras de domínio, isso é cheiro de design ruim — exponha um método
        público em vez disso.
      </AlertBox>

      <h2>ReflectionAttribute: lendo metadados em runtime</h2>
      <p>
        A partir do PHP 8.0, você pode anotar classes, propriedades e métodos com{" "}
        <strong>atributos</strong> nativos (sintaxe <code>#[Atributo]</code>). A reflexão lê esses
        atributos para alimentar roteadores, validadores, ORMs etc.
      </p>

      <PhpBlock
        filename="atributos.php"
        code={`<?php
declare(strict_types=1);

#[Attribute(Attribute::TARGET_METHOD)]
final readonly class Rota
{
    public function __construct(
        public string $metodo,
        public string $caminho,
    ) {}
}

final class UsuarioController
{
    #[Rota('GET', '/usuarios')]
    public function listar(): void {}

    #[Rota('POST', '/usuarios')]
    public function criar(): void {}
}

$r = new ReflectionClass(UsuarioController::class);
foreach ($r->getMethods() as $m) {
    foreach ($m->getAttributes(Rota::class) as $attr) {
        $rota = $attr->newInstance();
        echo "{$rota->metodo} {$rota->caminho} -> {$m->getName()}()" . PHP_EOL;
    }
}`}
        output={`GET /usuarios -> listar()
POST /usuarios -> criar()`}
      />

      <h2>Invocação dinâmica</h2>
      <p>
        Tanto <code>ReflectionMethod::invoke()</code> quanto{" "}
        <code>ReflectionClass::newInstanceArgs()</code> permitem chamar métodos e construir objetos
        passando argumentos resolvidos em runtime — base de qualquer framework moderno.
      </p>

      <PhpBlock
        filename="invocacao.php"
        code={`<?php
declare(strict_types=1);

final class Saudacao
{
    public function ola(string $nome): string { return "Olá, $nome!"; }
}

$r = new ReflectionClass(Saudacao::class);
$obj = $r->newInstance();
$retorno = $r->getMethod('ola')->invoke($obj, 'Wallyson');

echo $retorno . PHP_EOL;`}
        output={`Olá, Wallyson!`}
      />

      <h2>Mini container de DI: o exemplo prático</h2>
      <p>
        Juntando tudo, dá pra escrever em ~30 linhas um container que resolve dependências
        recursivamente olhando os tipos do construtor — versão didática do que o
        <code> illuminate/container</code> ou o <code>php-di/php-di</code> fazem em produção.
      </p>

      <PhpBlock
        filename="MiniContainer.php"
        code={`<?php
declare(strict_types=1);

final class MiniContainer
{
    /** @var array<class-string, object> */
    private array $instancias = [];

    /**
     * @template T of object
     * @param class-string<T> $classe
     * @return T
     */
    public function get(string $classe): object
    {
        if (isset($this->instancias[$classe])) {
            return $this->instancias[$classe];
        }

        $r = new ReflectionClass($classe);
        $ctor = $r->getConstructor();
        $args = [];

        if ($ctor !== null) {
            foreach ($ctor->getParameters() as $p) {
                $tipo = $p->getType();
                if (!$tipo instanceof ReflectionNamedType || $tipo->isBuiltin()) {
                    throw new RuntimeException("Não sei resolver \\\${$p->getName()}");
                }
                $args[] = $this->get($tipo->getName());
            }
        }

        return $this->instancias[$classe] = $r->newInstanceArgs($args);
    }
}

final class Logger { public function log(string $m): void { echo "[log] $m" . PHP_EOL; } }
final class Mailer { public function __construct(private readonly Logger $l) {} public function enviar(string $para): void { $this->l->log("email -> $para"); } }
final class App    { public function __construct(private readonly Mailer $m) {} public function rodar(): void { $this->m->enviar('ada@example.com'); } }

(new MiniContainer())->get(App::class)->rodar();`}
        output={`[log] email -> ada@example.com`}
      />

      <AlertBox type="info" title="Containers reais que você usa todo dia">
        <code>php-di/php-di</code>, <code>illuminate/container</code> (Laravel),{" "}
        <code>symfony/dependency-injection</code> e o do Slim 4 — todos usam Reflection (cacheado,
        compilado ou em runtime) para a mágica do auto-wiring.
      </AlertBox>

      <h2>O custo de performance</h2>
      <p>
        Reflexão é cara: cada <code>ReflectionClass</code> instancia objetos extras e percorre
        estruturas internas do Zend. Faça um benchmark caseiro:
      </p>

      <PhpBlock
        filename="custo.php"
        code={`<?php
declare(strict_types=1);

final class Dummy { public function __construct(public int $x = 1) {} }

$ini = hrtime(true);
for ($i = 0; $i < 100_000; $i++) new Dummy();
$direto = (hrtime(true) - $ini) / 1e6;

$ini = hrtime(true);
for ($i = 0; $i < 100_000; $i++) (new ReflectionClass(Dummy::class))->newInstance();
$reflexao = (hrtime(true) - $ini) / 1e6;

printf("Direto   : %.2f ms\\n", $direto);
printf("Reflexão : %.2f ms (%.1fx mais lento)\\n", $reflexao, $reflexao / $direto);`}
        output={`Direto   : 4.21 ms
Reflexão : 38.64 ms (9.2x mais lento)`}
      />

      <AlertBox type="danger" title="Cacheie em produção">
        Frameworks sérios <strong>compilam</strong> a resolução do container em arquivo PHP plano
        para o ambiente de produção (Symfony) ou cacheiam o resultado da reflexão (Laravel). Nunca
        deixe reflexão crua no caminho quente de uma request.
      </AlertBox>

      <h2>Rodando os exemplos</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/reflection"
        command="php MiniContainer.php"
        output={`[log] email -> ada@example.com`}
      />

      <p>
        No próximo capítulo a gente fecha a trinca da metaprogramação com{" "}
        <strong>closures avançadas</strong> — bind, fromCallable e a sintaxe first-class callable
        do PHP 8.1.
      </p>
    </PageContainer>
  );
}
