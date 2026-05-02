import{j as e}from"./index-Bb4MiiJL.js";import{P as r,a as o,A as a}from"./AlertBox-BpD-xIsb.js";import{T as i}from"./TerminalBlock-DGurMC1r.js";function c(){return e.jsxs(r,{title:"Reflection API",subtitle:"A capacidade do PHP de inspecionar a si mesmo em tempo de execução: ler classes, métodos, propriedades e atributos para construir frameworks, ORMs e containers de DI.",difficulty:"avancado",timeToRead:"13 min",category:"Reflection & Meta",children:[e.jsx("h2",{children:"O problema: quero instanciar uma classe sem saber o que ela precisa"}),e.jsxs("p",{children:["Imagine escrever um container de injeção de dependências. Você recebe o nome de uma classe e precisa instanciá-la, descobrindo automaticamente o que o construtor pede. Sem reflexão, você teria que codar uma fábrica para cada classe. Com ",e.jsx("code",{children:"ReflectionClass"}),", o PHP te conta tudo que sabe sobre qualquer tipo carregado."]}),e.jsx(o,{filename:"primeiro_olhar.php",code:`<?php
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
}`,output:`Classe: Pedido
Final?  sim
Métodos:
  - __construct()
  - total()`}),e.jsx("h2",{children:"ReflectionMethod e ReflectionProperty"}),e.jsxs("p",{children:["Você pode descer ainda mais e inspecionar parâmetros, tipos de retorno e propriedades individualmente. Cada parâmetro vira um ",e.jsx("code",{children:"ReflectionParameter"})," com tipo,"," ",e.jsx("code",{children:"hasDefaultValue()"})," e o nome do tipo (",e.jsx("code",{children:"ReflectionNamedType"}),")."]}),e.jsx(o,{filename:"metodos_props.php",code:`<?php
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
}`,output:`param $a: float
param $b: float
prop $precisao: int (readonly)`}),e.jsx("h2",{children:"Acessar propriedades privadas (sem precisar de setAccessible no PHP 8.1+)"}),e.jsxs("p",{children:["Antes do PHP 8.1, ler ou escrever propriedades privadas via reflexão exigia chamar"," ",e.jsx("code",{children:"setAccessible(true)"})," manualmente. A partir do 8.1 esse método foi marcado como sem efeito — reflexão já consegue ler/escrever direto. Útil para serializadores e ferramentas de debug."]}),e.jsx(o,{filename:"privado.php",code:`<?php
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
echo "Saldo após hack: R$ " . $prop->getValue($c) . PHP_EOL;`,output:`Saldo lido por reflexão: R$ 100
Saldo após hack: R$ 999.99`}),e.jsxs(a,{type:"warning",title:"Não use isso em código de negócio",children:["Quebrar encapsulamento via reflexão é ferramenta de ",e.jsx("em",{children:"infra"})," (frameworks, ORMs, serializadores). Em regras de domínio, isso é cheiro de design ruim — exponha um método público em vez disso."]}),e.jsx("h2",{children:"ReflectionAttribute: lendo metadados em runtime"}),e.jsxs("p",{children:["A partir do PHP 8.0, você pode anotar classes, propriedades e métodos com"," ",e.jsx("strong",{children:"atributos"})," nativos (sintaxe ",e.jsx("code",{children:"#[Atributo]"}),"). A reflexão lê esses atributos para alimentar roteadores, validadores, ORMs etc."]}),e.jsx(o,{filename:"atributos.php",code:`<?php
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
}`,output:`GET /usuarios -> listar()
POST /usuarios -> criar()`}),e.jsx("h2",{children:"Invocação dinâmica"}),e.jsxs("p",{children:["Tanto ",e.jsx("code",{children:"ReflectionMethod::invoke()"})," quanto"," ",e.jsx("code",{children:"ReflectionClass::newInstanceArgs()"})," permitem chamar métodos e construir objetos passando argumentos resolvidos em runtime — base de qualquer framework moderno."]}),e.jsx(o,{filename:"invocacao.php",code:`<?php
declare(strict_types=1);

final class Saudacao
{
    public function ola(string $nome): string { return "Olá, $nome!"; }
}

$r = new ReflectionClass(Saudacao::class);
$obj = $r->newInstance();
$retorno = $r->getMethod('ola')->invoke($obj, 'Wallyson');

echo $retorno . PHP_EOL;`,output:"Olá, Wallyson!"}),e.jsx("h2",{children:"Mini container de DI: o exemplo prático"}),e.jsxs("p",{children:["Juntando tudo, dá pra escrever em ~30 linhas um container que resolve dependências recursivamente olhando os tipos do construtor — versão didática do que o",e.jsx("code",{children:" illuminate/container"})," ou o ",e.jsx("code",{children:"php-di/php-di"})," fazem em produção."]}),e.jsx(o,{filename:"MiniContainer.php",code:`<?php
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

(new MiniContainer())->get(App::class)->rodar();`,output:"[log] email -> ada@example.com"}),e.jsxs(a,{type:"info",title:"Containers reais que você usa todo dia",children:[e.jsx("code",{children:"php-di/php-di"}),", ",e.jsx("code",{children:"illuminate/container"})," (Laravel),"," ",e.jsx("code",{children:"symfony/dependency-injection"})," e o do Slim 4 — todos usam Reflection (cacheado, compilado ou em runtime) para a mágica do auto-wiring."]}),e.jsx("h2",{children:"O custo de performance"}),e.jsxs("p",{children:["Reflexão é cara: cada ",e.jsx("code",{children:"ReflectionClass"})," instancia objetos extras e percorre estruturas internas do Zend. Faça um benchmark caseiro:"]}),e.jsx(o,{filename:"custo.php",code:`<?php
declare(strict_types=1);

final class Dummy { public function __construct(public int $x = 1) {} }

$ini = hrtime(true);
for ($i = 0; $i < 100_000; $i++) new Dummy();
$direto = (hrtime(true) - $ini) / 1e6;

$ini = hrtime(true);
for ($i = 0; $i < 100_000; $i++) (new ReflectionClass(Dummy::class))->newInstance();
$reflexao = (hrtime(true) - $ini) / 1e6;

printf("Direto   : %.2f ms\\n", $direto);
printf("Reflexão : %.2f ms (%.1fx mais lento)\\n", $reflexao, $reflexao / $direto);`,output:`Direto   : 4.21 ms
Reflexão : 38.64 ms (9.2x mais lento)`}),e.jsxs(a,{type:"danger",title:"Cacheie em produção",children:["Frameworks sérios ",e.jsx("strong",{children:"compilam"})," a resolução do container em arquivo PHP plano para o ambiente de produção (Symfony) ou cacheiam o resultado da reflexão (Laravel). Nunca deixe reflexão crua no caminho quente de uma request."]}),e.jsx("h2",{children:"Rodando os exemplos"}),e.jsx(i,{user:"dev",host:"php",cwd:"~/reflection",command:"php MiniContainer.php",output:"[log] email -> ada@example.com"}),e.jsxs("p",{children:["No próximo capítulo a gente fecha a trinca da metaprogramação com"," ",e.jsx("strong",{children:"closures avançadas"})," — bind, fromCallable e a sintaxe first-class callable do PHP 8.1."]})]})}export{c as default};
