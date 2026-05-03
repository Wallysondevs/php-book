import{j as e}from"./index-B5-q-eol.js";import{P as a,A as s,a as o}from"./AlertBox-CVbFLZEd.js";import{T as r}from"./TerminalBlock-6fqVIX2R.js";import{B as i}from"./BrowserBlock-pEcgE37D.js";function l(){return e.jsxs(a,{title:"Sintaxe e tags <?php",subtitle:"Como o interpretador PHP enxerga seu arquivo: a tag de abertura, o ponto-e-vírgula sagrado, comentários, case-sensitivity e o porquê de você quase nunca fechar a tag.",difficulty:"iniciante",timeToRead:"8 min",category:"Sintaxe Básica",children:[e.jsx(s,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Nenhum — pode começar por aqui! É o primeiro capítulo do livro."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"<?php"})," "," — "," ","tag de abertura — diz ao interpretador que o que vem a seguir é código PHP. Pode ser misturado a HTML."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"?>"})," "," — "," ","tag de fechamento — opcional em arquivos puramente PHP; omitir evita whitespace acidental."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"echo / print"})," "," — "," ","imprimem strings; echo aceita múltiplos args, print retorna 1."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"; (ponto-e-vírgula)"})," "," — "," ","finaliza cada statement; esquecer dispara erro de parse."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"// /* */ #"})," "," — "," ","as três formas de comentário; # é estilo shell."]})]}),e.jsx("h2",{children:"O modelo mental: PHP é um pré-processador de HTML"}),e.jsxs("p",{children:["Diferente de Python ou Node, o PHP foi desenhado para ",e.jsx("strong",{children:"ser embutido em HTML"}),". O interpretador lê o arquivo de cima para baixo, copia tudo que não estiver entre ",e.jsx("code",{children:"<?php"})," e ",e.jsx("code",{children:"?>"})," ","direto para a saída, e executa o que está dentro como código."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"echo"})," — imprime texto na saída padrão (stdout no CLI, corpo da resposta na web). Sintaxe: ",e.jsx("code",{children:'echo "texto";'}),". Aceita várias coisas separadas por vírgula e é levemente mais rápido que ",e.jsx("code",{children:"print"})," (que retorna ",e.jsx("code",{children:"1"}),")."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"$variavel"})," — toda variável em PHP começa com ",e.jsx("code",{children:"$"}),". O cifrão faz parte do nome e é como o parser distingue variável de constante/função. O capítulo de Variáveis aprofunda escopo e ciclo de vida."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"foreach"})," — laço para percorrer arrays e iteráveis. Forma curta: ",e.jsx("code",{children:"foreach ($array as $item)"}),"; com chave: ",e.jsx("code",{children:"foreach ($array as $k => $v)"}),". É o jeito idiomático em PHP — detalhado no capítulo de Loops."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:`"" vs ''`})," — aspas duplas ",e.jsx("code",{children:'"…"'})," interpolam variáveis (",e.jsx("code",{children:'"olá $nome"'}),"); aspas simples ",e.jsx("code",{children:"'…'"})," são literais. Aspas simples são levemente mais rápidas e seguras quando você não quer interpolação."]}),e.jsx(o,{filename:"ola.php",code:`<h1>Lista de produtos</h1>
<?php
$produtos = ["Café", "Pão", "Manteiga"];
foreach ($produtos as $p) {
    echo "<li>$p</li>";
}
?>
<p>Total: <?= count($produtos) ?> itens.</p>`}),e.jsxs(i,{url:"http://localhost:8000/ola.php",children:[e.jsx("h1",{className:"text-2xl font-bold mb-3",children:"Lista de produtos"}),e.jsx("li",{children:"Café"}),e.jsx("li",{children:"Pão"}),e.jsx("li",{children:"Manteiga"}),e.jsx("p",{className:"mt-3",children:"Total: 3 itens."})]}),e.jsxs("p",{children:["Tudo que está fora do bloco ",e.jsx("code",{children:"<?php ... ?>"})," vai literalmente para o navegador. Tudo que está dentro é interpretado. A tag curta ",e.jsx("code",{children:"<?= ... ?>"})," é açúcar para ",e.jsx("code",{children:"<?php echo ... ?>"})," e é o jeito moderno e idiomático de imprimir variáveis em templates."]}),e.jsx("h2",{children:"A regra de ouro: nunca feche a tag em arquivos só de PHP"}),e.jsxs("p",{children:["Se um arquivo contém ",e.jsx("em",{children:"apenas"})," código PHP (uma classe, uma função, um config), ",e.jsxs("strong",{children:["não escreva o ",e.jsx("code",{children:"?>"})," no final"]}),". Por quê? Porque qualquer espaço, quebra de linha ou BOM acidental depois do ",e.jsx("code",{children:"?>"})," vira saída no navegador e quebra ",e.jsx("code",{children:"header()"}),", redirects e sessões com aquele clássico ",e.jsx("em",{children:"“headers already sent”"}),"."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"declare(strict_types=1)"})," — diretiva que liga a checagem estrita de tipos para o arquivo. Deve ser a primeira instrução. Detalhada na seção logo abaixo."]}),e.jsxs("p",{children:[e.jsx("strong",{className:"text-[#8993BE] font-mono",children:"class / function / public"})," — ",e.jsx("code",{children:"class"})," define um tipo, ",e.jsx("code",{children:"function"})," define uma função/método, ",e.jsx("code",{children:"public"})," é a visibilidade que permite acesso de qualquer lugar (existem também ",e.jsx("code",{children:"protected"})," e ",e.jsx("code",{children:"private"}),"). Aprofundamos tudo isso nos capítulos de OOP."]}),e.jsx(o,{filename:"src/Usuario.php",code:`<?php
declare(strict_types=1);

class Usuario {
    public function __construct(
        public string $nome,
        public string $email,
    ) {}
}
// SEM ?> aqui. É proposital.`}),e.jsxs(s,{type:"warning",title:"Quando faz sentido fechar?",children:["Apenas quando o arquivo mistura HTML e PHP (uma view, um template). Em arquivos puramente PHP, omitir o ",e.jsx("code",{children:"?>"})," é ",e.jsx("strong",{children:"regra do PSR-12"})," e do bom senso."]}),e.jsx("h2",{children:"Ponto-e-vírgula: o terminador"}),e.jsxs("p",{children:["Toda instrução PHP termina em ",e.jsx("code",{children:";"}),". A única exceção é a última instrução antes do"," ",e.jsx("code",{children:"?>"})," de fechamento (PHP é gentil aqui), mas você nunca vai depender disso. Esquecer o ponto-e-vírgula gera o erro mais clássico de PHP:"]}),e.jsx(o,{filename:"erro.php",code:`<?php
$nome = "Wallyson"
echo $nome;`,output:`PHP Parse error:  syntax error, unexpected token "echo",
expecting "," or ";" in /var/www/erro.php on line 3`}),e.jsx("h2",{children:"Case sensitivity: a parte estranha"}),e.jsxs("p",{children:["PHP é uma linguagem com regras ",e.jsx("strong",{children:"mistas"})," — uma das suas heranças mais polêmicas. Memorize:"]}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"Variáveis"})," são ",e.jsx("em",{children:"case-sensitive"}),": ",e.jsx("code",{children:"$nome"})," e ",e.jsx("code",{children:"$Nome"})," são diferentes."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Constantes"})," são ",e.jsx("em",{children:"case-sensitive"}),": ",e.jsx("code",{children:"MAX"})," e ",e.jsx("code",{children:"max"})," são diferentes."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Funções, classes e métodos"})," são ",e.jsx("em",{children:"case-insensitive"}),": ",e.jsx("code",{children:"strlen()"}),", ",e.jsx("code",{children:"STRLEN()"})," e ",e.jsx("code",{children:"StrLen()"})," chamam a mesma função."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Palavras-chave"})," (",e.jsx("code",{children:"if"}),", ",e.jsx("code",{children:"foreach"}),", ",e.jsx("code",{children:"class"}),") são ",e.jsx("em",{children:"case-insensitive"}),"."]})]}),e.jsx(o,{filename:"case.php",code:`<?php
$nome = "Ada";
$Nome = "Lovelace";

echo STRLEN($nome) . PHP_EOL;   // funciona
echo strlen($Nome) . PHP_EOL;   // funciona
echo $nome . " " . $Nome;       // duas variáveis distintas`,output:`3
8
Ada Lovelace`}),e.jsxs(s,{type:"info",title:"Convenção da comunidade",children:["Mesmo o PHP aceitando ",e.jsx("code",{children:"STRLEN()"}),", ",e.jsx("strong",{children:"todo código PHP moderno usa minúsculas para funções nativas"})," (",e.jsx("code",{children:"strlen"}),", ",e.jsx("code",{children:"array_map"}),") e ",e.jsx("code",{children:"PascalCase"})," para classes (",e.jsx("code",{children:"HttpClient"}),") seguindo o padrão PSR-12."]}),e.jsx("h2",{children:"Comentários"}),e.jsx("p",{children:"PHP aceita três estilos. Use o que fizer mais sentido para o trecho:"}),e.jsx(o,{filename:"comentarios.php",code:`<?php
// Comentário de uma linha — estilo C/C++ (preferido)
# Comentário de uma linha — estilo shell (raro hoje)

/*
 * Bloco multi-linha
 * usado para notas longas
 */

/**
 * DocBlock — lido pelo PHPStorm, PHPDoc e analisadores estáticos
 * @param string $nome Nome a saudar
 * @return string Saudação
 */
function saudar(string $nome): string {
    return "Olá, $nome!";
}`}),e.jsx("h2",{children:"Aspas simples vs aspas duplas (importa MUITO)"}),e.jsxs("p",{children:["Esta é a primeira pegadinha que todo iniciante encontra. ",e.jsx("strong",{children:"Aspas duplas interpolam variáveis"}),"; aspas simples não. Aspas simples também são um pouco mais rápidas (e protegem você de injeções acidentais de variáveis)."]}),e.jsx(o,{filename:"aspas.php",code:`<?php
$nome = "Wallyson";

echo 'Olá, $nome!' . PHP_EOL;   // imprime literal
echo "Olá, $nome!" . PHP_EOL;   // interpola
echo "Olá, {$nome}!" . PHP_EOL; // forma explícita (recomendada em strings complexas)
echo "2 + 2 = " . (2 + 2);      // concatena com .`,output:`Olá, $nome!
Olá, Wallyson!
Olá, Wallyson!
2 + 2 = 4`}),e.jsx("h2",{children:"strict_types: o seu melhor amigo"}),e.jsxs("p",{children:["Por padrão, PHP faz ",e.jsx("em",{children:"type juggling"})," — converte tipos automaticamente, o que é a fonte de bugs sutis. Adicionar ",e.jsx("code",{children:"declare(strict_types=1);"})," como ",e.jsx("strong",{children:"primeira instrução"})," do arquivo desliga isso para esse arquivo:"]}),e.jsx(o,{filename:"strict.php",code:`<?php
declare(strict_types=1);

function dobrar(int $n): int {
    return $n * 2;
}

echo dobrar(5);      // 10
echo dobrar("5");    // TypeError: argumento deveria ser int, string dado`,output:`10
PHP Fatal error: Uncaught TypeError: dobrar(): Argument #1 ($n) must be of type int, string given`}),e.jsx(s,{type:"success",title:"Boas práticas para todo arquivo novo",children:e.jsxs("ol",{className:"list-decimal ml-5 mt-1 space-y-1",children:[e.jsxs("li",{children:["Comece com ",e.jsx("code",{children:"<?php"})," sem espaço antes."]}),e.jsxs("li",{children:["Adicione ",e.jsx("code",{children:"declare(strict_types=1);"})," em arquivos de lógica."]}),e.jsx("li",{children:"Use UTF-8 sem BOM e indentação de 4 espaços (PSR-12)."}),e.jsxs("li",{children:[e.jsx("strong",{children:"Nunca"})," escreva ",e.jsx("code",{children:"?>"})," no final de arquivos só de PHP."]})]})}),e.jsx("h2",{children:"Rodando o exemplo"}),e.jsx(r,{user:"dev",host:"php",cwd:"~/projetos",command:"php sintaxe.php",output:`Olá, Wallyson!
Total: 3 itens.`}),e.jsxs("p",{children:["Pronto: você já entende como o PHP lê seu arquivo. No próximo capítulo a gente mergulha em ",e.jsx("strong",{children:"variáveis e escopo"}),", que é onde a maioria dos bugs nascem (e onde fica a diferença entre código profissional e amador)."]})]})}export{l as default};
