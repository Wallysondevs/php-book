import{j as e}from"./index-B5-q-eol.js";import{P as i,A as s,a as o}from"./AlertBox-CVbFLZEd.js";import{T as a}from"./TerminalBlock-6fqVIX2R.js";import{B as r}from"./BrowserBlock-pEcgE37D.js";function c(){return e.jsxs(i,{title:"Por que aprender PHP em 2026",subtitle:"A linguagem que silenciosamente roda 75% da web pública. Performance moderna com JIT, ergonomia 8.x, ecossistema Composer e um mercado de trabalho que não para de pedir gente.",difficulty:"iniciante",timeToRead:"8 min",category:"Introdução",children:[e.jsx(s,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Onipresente"})," "," — "," ","roda em ~75% da web — WordPress, Wikipedia, Facebook (origem)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Curva baixa"})," "," — "," ",'do "olá mundo" ao app real em horas.']}),e.jsxs("li",{children:[e.jsx("strong",{children:"Stateless por request"})," "," — "," ","modelo que escala horizontalmente fácil."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Composer + PSR"})," "," — "," ","ecossistema maduro e padronizado."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"PHP 8+"})," "," — "," ","tipos, JIT, enums, attributes — linguagem moderna."]})]}),e.jsx("h2",{children:"O argumento que ninguém quer ouvir, mas é verdade"}),e.jsx("p",{children:"Toda vez que alguém pergunta “PHP ainda vale a pena?”, a resposta honesta é mostrar dois números:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"~75%"})," de todos os sites com servidor identificável rodam PHP (W3Techs, 2024)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"~43%"})," da web pública roda WordPress — e WordPress é PHP."]})]}),e.jsx("p",{children:"Wikipedia, Mailchimp, Slack (parte do backend), Etsy, Tumblr, Vimeo, Wikimedia. Cada uma dessas respondeu uma requisição PHP enquanto você lia este parágrafo."}),e.jsx("h2",{children:"Veja o que dá pra fazer com pouco código moderno"}),e.jsx("p",{children:"Antes de qualquer “história triste” do PHP que você já ouviu, olhe um mini-API funcional em PHP 8.4 — usando só o que vem na linguagem:"}),e.jsx(o,{filename:"api.php",code:`<?php
declare(strict_types=1);

enum Status: string {
    case Ativo   = 'ativo';
    case Inativo = 'inativo';
}

final readonly class Usuario {
    public function __construct(
        public int $id,
        public string $nome,
        public Status $status,
    ) {}
}

$usuarios = [
    new Usuario(1, "Ada Lovelace", Status::Ativo),
    new Usuario(2, "Linus Torvalds", Status::Ativo),
    new Usuario(3, "Grace Hopper", Status::Inativo),
];

header('Content-Type: application/json');
echo json_encode(
    array_filter($usuarios, fn(Usuario $u) => $u->status === Status::Ativo),
    JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE
);`}),e.jsx(r,{url:"http://localhost:8000/api.php",children:e.jsx("pre",{className:"text-xs",children:`[
    {"id":1,"nome":"Ada Lovelace","status":"ativo"},
    {"id":2,"nome":"Linus Torvalds","status":"ativo"}
]`})}),e.jsxs("p",{children:["Enums tipados, classes ",e.jsx("code",{children:"readonly"}),", constructor promotion, arrow functions, type hints estritos. Isso é PHP ",e.jsx("em",{children:"moderno"})," — nada do ",e.jsx("code",{children:"mysql_query()"})," que você viu em tutorial de 2008."]}),e.jsx("h2",{children:"Performance: JIT mudou o jogo"}),e.jsxs("p",{children:["PHP 7 já era 2x mais rápido que PHP 5. PHP 8 trouxe o ",e.jsx("strong",{children:"JIT"})," (Just-In-Time compilation), que turbina código numérico/CPU-bound em até 3x. Em web típico (banco + I/O), o ganho é menor mas o consumo de memória continua caindo a cada release."]}),e.jsx(o,{filename:"bench.php",code:`<?php
declare(strict_types=1);

function fib(int $n): int {
    return $n < 2 ? $n : fib($n - 1) + fib($n - 2);
}

$inicio = microtime(true);
$resultado = fib(30);
$fim = microtime(true);

printf("fib(30) = %d em %.3fs%s", $resultado, $fim - $inicio, PHP_EOL);`,output:"fib(30) = 832040 em 0.094s"}),e.jsxs(s,{type:"info",title:"Comparação justa",children:["O mesmo Fibonacci recursivo em PHP 5.6 levaria ~0.6s. PHP 8.4 com JIT habilitado: ~0.09s. Não vai vencer Rust, mas ",e.jsx("strong",{children:"vence Python e fica no nível do Node"})," em workloads web reais."]}),e.jsx("h2",{children:"Ecossistema: Composer mudou tudo"}),e.jsxs("p",{children:["Antes do ",e.jsx("strong",{children:"Composer"})," (2012), instalar uma biblioteca PHP era baixar um ",e.jsx("code",{children:".zip"}),", extrair em ",e.jsx("code",{children:"vendor/"})," e rezar. Hoje:"]}),e.jsx(a,{user:"dev",host:"php",cwd:"~/projeto",command:"composer require monolog/monolog guzzlehttp/guzzle ramsey/uuid",output:`Using version ^3.7 for monolog/monolog
Using version ^7.9 for guzzlehttp/guzzle
Using version ^4.7 for ramsey/uuid
./composer.json has been updated
Running composer update monolog/monolog guzzlehttp/guzzle ramsey/uuid
Generating optimized autoload files
3 packages you are using are looking for funding.`}),e.jsx("p",{children:"E em três linhas você tem logging estruturado, cliente HTTP profissional e geração de UUID v7:"}),e.jsx(o,{filename:"exemplo.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use Monolog\\Logger;
use Monolog\\Handler\\StreamHandler;
use GuzzleHttp\\Client;
use Ramsey\\Uuid\\Uuid;

$log = new Logger('app');
$log->pushHandler(new StreamHandler('php://stdout', Logger::INFO));

$id = Uuid::uuid7()->toString();
$log->info('Iniciando requisição', ['request_id' => $id]);

$http = new Client(['timeout' => 5.0]);
$resp = $http->get('https://httpbin.org/uuid');
$log->info('Resposta', ['status' => $resp->getStatusCode()]);`,output:`[2026-01-15T10:00:01+00:00] app.INFO: Iniciando requisição {"request_id":"019421a8-..."}
[2026-01-15T10:00:02+00:00] app.INFO: Resposta {"status":200}`}),e.jsx("h2",{children:"Ergonomia 8.x: o PHP virou prazeroso"}),e.jsx("p",{children:"Pegue um padrão que em qualquer linguagem dá trabalho — uma “entidade” imutável com validação:"}),e.jsx(o,{filename:"ddd.php",code:`<?php
declare(strict_types=1);

final readonly class Email {
    public function __construct(public string $valor) {
        if (!filter_var($valor, FILTER_VALIDATE_EMAIL)) {
            throw new \\InvalidArgumentException("Email inválido: $valor");
        }
    }
}

final readonly class Cliente {
    public function __construct(
        public string $nome,
        public Email $email,
    ) {}
}

$cliente = new Cliente(
    nome: "Ada",
    email: new Email("ada@lovelace.dev"),
);

echo "{$cliente->nome} <{$cliente->email->valor}>";`,output:"Ada <ada@lovelace.dev>"}),e.jsx(s,{type:"success",title:"O que essa pequena classe te dá",children:"Imutabilidade (readonly), validação no construtor, type hints, named arguments, sem precisar de Lombok, decoradores ou geradores de código. Tudo nativo, sem dependência externa."}),e.jsx("h2",{children:"Mercado de trabalho: a oferta gigantesca"}),e.jsx("p",{children:"Existe uma piada: “ninguém quer trabalhar com PHP, mas todo mundo precisa contratar gente de PHP”. Em 2026 a realidade é:"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"WordPress"})," sozinho é uma indústria. Plugin, tema, manutenção, hospedagem, consultoria — tudo PHP."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Laravel"})," é o framework mais usado para SaaS e dashboards no mundo (sim, na frente do Rails). Vagas remotas pagando bem, internacionalmente."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Magento, Drupal, Symfony"})," rodam e-commerces e governos inteiros. Manutenção paga muito bem."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Sistemas legados"}),". Cada banco, cada governo, cada hospital tem um sistema PHP rodando em produção há 10+ anos. Quem entende disso tem trabalho garantido."]})]}),e.jsx("h2",{children:"Por que NÃO escolher PHP?"}),e.jsx("p",{children:"Sendo honesto: PHP não é a melhor escolha quando você precisa de…"}),e.jsxs("ul",{children:[e.jsxs("li",{children:["Aplicações ",e.jsx("em",{children:"realtime"})," com WebSocket de longa duração (Node ou Elixir resolvem melhor)."]}),e.jsx("li",{children:"Mobile nativo (óbvio — use Swift, Kotlin ou Flutter)."}),e.jsx("li",{children:"Computação numérica/ML pesada (Python, R, Julia)."}),e.jsx("li",{children:"Processamento concorrente massivo (Go, Rust, Erlang)."})]}),e.jsx("p",{children:"Para o resto — APIs REST/GraphQL, dashboards admin, sites institucionais, e-commerces, SaaS, integrações, scripts de automação — PHP entrega rápido e bem."}),e.jsx("h2",{children:"O resumo honesto"}),e.jsx("p",{children:"Aprenda PHP em 2026 se você quer:"}),e.jsxs("ol",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Empregabilidade real."})," Tem vaga em qualquer cidade."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Construir produtos rápido."})," Laravel + PostgreSQL te coloca em produção numa tarde."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Trabalhar em projetos com impacto."})," Você só precisa abrir Wikipedia para ver."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Hospedagem barata."})," R$ 10/mês ainda hospeda site PHP, e bem."]})]}),e.jsxs("p",{children:["Próximo capítulo: ",e.jsx("strong",{children:"versões e roadmap"})," — qual PHP escolher, o que está fora de suporte, e como gerenciar várias versões na mesma máquina."]})]})}export{c as default};
