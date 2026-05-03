import{j as e}from"./index-B5-q-eol.js";import{P as s,A as a,a as o}from"./AlertBox-CVbFLZEd.js";import{T as r}from"./TerminalBlock-6fqVIX2R.js";import{C as i}from"./CodeBlock-B36pQ_ak.js";function l(){return e.jsxs(s,{title:"JSON",subtitle:"O formato universal das APIs. PHP traz duas funções para a vida toda: json_encode e json_decode — mas o detalhe está nas flags.",difficulty:"intermediario",timeToRead:"10 min",category:"Web & Banco",children:[e.jsx(a,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"json_encode / json_decode"})," "," — "," ","PHP ↔ JSON; segundo arg true = array associativo."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"JSON_THROW_ON_ERROR"})," "," — "," ","flag que troca silent fail por exceção."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"JSON_UNESCAPED_UNICODE"})," "," — "," ","mantém acentos legíveis na saída."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"JsonSerializable"})," "," — "," ","interface: define jsonSerialize() para classes."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Profundidade"})," "," — "," ","depth default = 512; pode estourar em estruturas grandes."]})]}),e.jsxs("h2",{children:["De array PHP para JSON: ",e.jsx("code",{children:"json_encode"})]}),e.jsx("p",{children:"A maioria das APIs que você vai escrever em PHP só precisa converter arrays e objetos em JSON e devolver na resposta:"}),e.jsx(o,{filename:"encode.php",code:`<?php
declare(strict_types=1);

$usuario = [
    'id'    => 1,
    'nome'  => 'Ada Lovelace',
    'tags'  => ['matemática', 'computação'],
    'ativo' => true,
];

echo json_encode($usuario) . PHP_EOL;`,output:'{"id":1,"nome":"Ada Lovelace","tags":["matem\\u00e1tica","computa\\u00e7\\u00e3o"],"ativo":true}'}),e.jsxs("p",{children:["Repare nos ",e.jsx("code",{children:"\\u00e1"}),": por padrão, o PHP escapa Unicode. Para devolver UTF-8 cru (mais legível e menor) e formatar bonito durante o desenvolvimento, combine flags:"]}),e.jsx(o,{filename:"encode-pretty.php",code:`<?php
declare(strict_types=1);

$usuario = [
    'id'    => 1,
    'nome'  => 'Ada Lovelace',
    'tags'  => ['matemática', 'computação'],
    'ativo' => true,
];

echo json_encode(
    $usuario,
    JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES
) . PHP_EOL;`,output:`{
    "id": 1,
    "nome": "Ada Lovelace",
    "tags": [
        "matemática",
        "computação"
    ],
    "ativo": true
}`}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("code",{children:"JSON_PRETTY_PRINT"}),": indenta com 4 espaços (use só em dev/CLI)."]}),e.jsxs("li",{children:[e.jsx("code",{children:"JSON_UNESCAPED_UNICODE"}),": deixa acentos e emojis intactos."]}),e.jsxs("li",{children:[e.jsx("code",{children:"JSON_UNESCAPED_SLASHES"}),": não escapa ",e.jsx("code",{children:"/"})," em URLs."]})]}),e.jsxs("h2",{children:["De JSON para array PHP: ",e.jsx("code",{children:"json_decode"})]}),e.jsxs("p",{children:["Por padrão, ",e.jsx("code",{children:"json_decode"})," devolve ",e.jsx("code",{children:"stdClass"}),". Em 99% dos casos você quer array associativo — passe ",e.jsx("code",{children:"true"})," no segundo argumento:"]}),e.jsx(o,{filename:"decode.php",code:`<?php
declare(strict_types=1);

$json = '{"id":42,"titulo":"Olá mundo","tags":["php","blog"]}';

$objeto = json_decode($json);
echo $objeto->titulo . PHP_EOL;            // acesso por propriedade

$array = json_decode($json, associative: true);
echo $array['titulo'] . PHP_EOL;           // acesso por chave
print_r($array['tags']);`,output:`Olá mundo
Olá mundo
Array
(
    [0] => php
    [1] => blog
)`}),e.jsxs(a,{type:"info",title:"Argumento nomeado deixa claro",children:["PHP 8 permite ",e.jsx("code",{children:"json_decode($s, associative: true)"})," em vez do segundo parâmetro posicional. Fica mais legível."]}),e.jsx("h2",{children:"Erros silenciosos: o pesadelo do JSON"}),e.jsxs("p",{children:["Antes do PHP 7.3, ",e.jsx("code",{children:"json_decode"})," retornava ",e.jsx("code",{children:"null"})," quando o JSON era inválido — e ",e.jsx("code",{children:"null"})," também era um valor JSON válido. Confusão garantida. Solução moderna: ",e.jsx("code",{children:"JSON_THROW_ON_ERROR"}),"."]}),e.jsx(o,{filename:"decode-throw.php",code:`<?php
declare(strict_types=1);

$invalido = '{"nome": "Ada", '; // truncado de propósito

try {
    $dados = json_decode($invalido, associative: true, flags: JSON_THROW_ON_ERROR);
} catch (\\JsonException $e) {
    echo "JSON inválido: " . $e->getMessage() . PHP_EOL;
}`,output:"JSON inválido: Syntax error"}),e.jsxs("p",{children:["A mesma flag funciona em ",e.jsx("code",{children:"json_encode"})," — útil quando você tenta serializar um ",e.jsx("code",{children:"resource"})," ou um valor circular:"]}),e.jsx(o,{filename:"encode-throw.php",code:`<?php
declare(strict_types=1);

try {
    $arquivo = fopen('php://memory', 'r');
    echo json_encode(['fp' => $arquivo], JSON_THROW_ON_ERROR);
} catch (\\JsonException $e) {
    echo "Falha: " . $e->getMessage() . PHP_EOL;
}`,output:"Falha: Type is not supported"}),e.jsxs(a,{type:"success",title:"Receita moderna",children:["Sempre passe ",e.jsx("code",{children:"JSON_THROW_ON_ERROR"}),". Combine com"," ",e.jsx("code",{children:"JSON_UNESCAPED_UNICODE"})," em respostas HTTP. A vida fica simples."]}),e.jsxs("h2",{children:["Controlando como um objeto vira JSON: ",e.jsx("code",{children:"JsonSerializable"})]}),e.jsxs("p",{children:["Por padrão, ",e.jsx("code",{children:"json_encode"})," só enxerga propriedades ",e.jsx("code",{children:"public"})," de um objeto. Mas e se você quer expor uma versão ",e.jsx("em",{children:"diferente"})," da interna — ocultar campos sensíveis, formatar datas, mudar nomes? Implemente"," ",e.jsx("code",{children:"JsonSerializable"}),":"]}),e.jsx(o,{filename:"src/Usuario.php",code:`<?php
declare(strict_types=1);

namespace App;

final class Usuario implements \\JsonSerializable {
    public function __construct(
        public readonly int $id,
        public readonly string $nome,
        public readonly string $email,
        private readonly string $senhaHash,
        public readonly \\DateTimeImmutable $criadoEm,
    ) {}

    public function jsonSerialize(): array {
        return [
            'id'         => $this->id,
            'nome'       => $this->nome,
            'email'      => $this->email,
            // senhaHash propositalmente fora.
            'criado_em'  => $this->criadoEm->format(\\DateTimeInterface::ATOM),
        ];
    }
}`}),e.jsx(o,{filename:"usar.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/vendor/autoload.php';

use App\\Usuario;

$ada = new Usuario(
    id: 1,
    nome: 'Ada Lovelace',
    email: 'ada@math.org',
    senhaHash: '$2y$10$abcdef...',
    criadoEm: new \\DateTimeImmutable('2025-03-27 10:00:00'),
);

echo json_encode($ada, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE) . PHP_EOL;`,output:`{
    "id": 1,
    "nome": "Ada Lovelace",
    "email": "ada@math.org",
    "criado_em": "2025-03-27T10:00:00+00:00"
}`}),e.jsx("p",{children:"Note que a senha sumiu da saída — é exatamente o ponto do método. Você decide o contrato público sem alterar a estrutura interna."}),e.jsx("h2",{children:"Construindo uma micro-API REST"}),e.jsxs("p",{children:["Com tudo isso, montar um endpoint que devolve JSON é trivial. Lembre só de mandar o header ",e.jsx("code",{children:"Content-Type"})," certo:"]}),e.jsx(o,{filename:"public/api/usuarios.php",code:`<?php
declare(strict_types=1);

require __DIR__ . '/../../vendor/autoload.php';

use App\\Usuario;

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'GET') {
    http_response_code(405);
    echo json_encode(['error' => 'método não permitido'], JSON_THROW_ON_ERROR);
    exit;
}

$usuarios = [
    new Usuario(1, 'Ada Lovelace', 'ada@math.org', 'h1', new \\DateTimeImmutable('2025-03-01')),
    new Usuario(2, 'Linus Torvalds', 'linus@kernel.org', 'h2', new \\DateTimeImmutable('2025-03-15')),
];

echo json_encode(
    ['data' => $usuarios, 'total' => count($usuarios)],
    JSON_THROW_ON_ERROR | JSON_UNESCAPED_UNICODE
);`,output:'{"data":[{"id":1,"nome":"Ada Lovelace","email":"ada@math.org","criado_em":"2025-03-01T00:00:00+00:00"},{"id":2,"nome":"Linus Torvalds","email":"linus@kernel.org","criado_em":"2025-03-15T00:00:00+00:00"}],"total":2}'}),e.jsx("h2",{children:"Recebendo JSON em uma requisição POST"}),e.jsxs("p",{children:["APIs modernas costumam receber JSON no corpo (não ",e.jsx("code",{children:"application/x-www-form-urlencoded"}),"). Você pega tudo de ",e.jsx("code",{children:"php://input"})," e decodifica:"]}),e.jsx(o,{filename:"public/api/criar.php",code:`<?php
declare(strict_types=1);

header('Content-Type: application/json; charset=utf-8');

if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
    http_response_code(405);
    echo json_encode(['error' => 'use POST']);
    exit;
}

$raw = file_get_contents('php://input') ?: '';

try {
    $payload = json_decode($raw, associative: true, flags: JSON_THROW_ON_ERROR);
} catch (\\JsonException $e) {
    http_response_code(400);
    echo json_encode(['error' => 'JSON inválido', 'detalhe' => $e->getMessage()]);
    exit;
}

$nome = $payload['nome'] ?? null;
if (!is_string($nome) || $nome === '') {
    http_response_code(422);
    echo json_encode(['error' => 'nome é obrigatório']);
    exit;
}

http_response_code(201);
echo json_encode([
    'mensagem' => "criado: {$nome}",
    'id'       => random_int(100, 999),
], JSON_UNESCAPED_UNICODE);`}),e.jsxs("p",{children:["Testando com ",e.jsx("code",{children:"curl"}),":"]}),e.jsx(r,{user:"dev",host:"php",cwd:"~/projetos/api",command:`curl -X POST http://localhost:8000/api/criar.php -H 'Content-Type: application/json' -d '{"nome":"Carmen"}'`,output:'{"mensagem":"criado: Carmen","id":421}'}),e.jsx("h2",{children:"Pegadinhas frequentes"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Floats viram strings em JSON?"})," Não. Mas"," ",e.jsx("code",{children:"json_encode(1.0)"})," retorna ",e.jsx("code",{children:'"1"'})," (sem o ponto). Use ",e.jsx("code",{children:"JSON_PRESERVE_ZERO_FRACTION"})," para forçar ",e.jsx("code",{children:'"1.0"'}),"."]}),e.jsxs("li",{children:[e.jsxs("strong",{children:["Array vazio vira ",e.jsx("code",{children:"[]"})," ou ",e.jsx("code",{children:"{}"}),"?"]})," Vira"," ",e.jsx("code",{children:"[]"}),". Para forçar objeto JSON vazio, use"," ",e.jsx("code",{children:"(object) []"})," ou ",e.jsx("code",{children:"new \\stdClass()"}),"."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Profundidade máxima:"})," o terceiro parâmetro é o limite de profundidade (default 512). Estruturas muito aninhadas explodem com"," ",e.jsx("code",{children:"JsonException"}),"."]})]}),e.jsx(i,{title:"JSON resultante de array vazio vs objeto vazio",language:"json",code:`json_encode([])              -> []
json_encode((object) [])    -> {}
json_encode(['a' => 1])     -> {"a":1}
json_encode([1, 2, 3])      -> [1,2,3]`}),e.jsxs(a,{type:"info",title:"Próximo capítulo",children:["Você já sabe falar com o navegador, com APIs e com o usuário. Falta o último elo: ",e.jsx("strong",{children:"banco de dados"}),". No próximo capítulo entra em cena o PDO."]})]})}export{l as default};
