import{j as e}from"./index-B5-q-eol.js";import{P as o,A as a,a as s}from"./AlertBox-CVbFLZEd.js";import{T as r}from"./TerminalBlock-6fqVIX2R.js";function d(){return e.jsxs(o,{title:"Senhas: hash & verify",subtitle:"Como guardar senhas de usuários do jeito certo em PHP — password_hash, password_verify, password_needs_rehash e por que md5/sha1 são pecado mortal.",difficulty:"intermediario",timeToRead:"12 min",category:"Segurança",children:[e.jsx(a,{type:"info",title:"Pré-requisitos",children:e.jsx("p",{children:"Antes deste capítulo, é bom já ter visto os capítulos anteriores. Este texto se apoia no que já foi visto sobre PHP."})}),e.jsx("h2",{children:"Glossário rápido"}),e.jsxs("ul",{children:[e.jsxs("li",{children:[e.jsx("strong",{children:"password_hash()"})," "," — "," ","gera hash seguro com salt automático (bcrypt/argon2)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"password_verify()"})," "," — "," ","compara senha vs hash em tempo constante."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"PASSWORD_BCRYPT/ARGON2ID"})," "," — "," ","algoritmos suportados; argon2id é state-of-the-art."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"cost"})," "," — "," ","fator de trabalho — quanto maior, mais lento (segurança)."]}),e.jsxs("li",{children:[e.jsx("strong",{children:"Rehash"})," "," — "," ","password_needs_rehash detecta hash antigo para regerar."]})]}),e.jsx("h2",{children:"O problema: o banco vaza. E aí?"}),e.jsxs("p",{children:["Cedo ou tarde, alguém vaza o seu banco de dados — SQL injection, backup mal configurado, ex-funcionário descontente. A pergunta não é ",e.jsx("em",{children:"se"}),", é"," ",e.jsx("em",{children:"quando"}),". E a única defesa que sobra naquele momento é como você guardou as senhas. Se elas estavam em texto puro (ou num hash fraco como MD5/SHA1), o atacante já tem todas as contas."]}),e.jsx(s,{filename:"errado.php",code:`<?php
declare(strict_types=1);

// ❌ NUNCA — texto puro
$pdo->prepare('INSERT INTO users (email, senha) VALUES (?, ?)')
    ->execute(['ada@example.com', 'segredo123']);

// ❌ NUNCA — md5/sha1 (rápidos demais, sem sal)
$hash = md5('segredo123');         // 5e88489...   quebrado em milissegundos
$hash = sha1('segredo123');        // 7c4a8d0...   também quebrado

// ❌ NUNCA — "criptografar" senha
$hash = openssl_encrypt('segredo123', 'aes-256-cbc', $chave, iv: $iv);
// senha não deve ser reversível! ninguém precisa do plaintext de volta.`}),e.jsxs(a,{type:"danger",title:"Por que MD5/SHA1 são proibidos",children:["São hashes de propósito geral — projetados para ser ",e.jsx("strong",{children:"rápidos"}),". Uma GPU moderna testa 30 bilhões de hashes MD5 por segundo. Se sua senha tem 8 caracteres, ela cai em segundos via força bruta com rainbow tables."]}),e.jsx("h2",{children:"O jeito certo: password_hash() + password_verify()"}),e.jsxs("p",{children:["PHP tem uma API ",e.jsx("strong",{children:"nativa"}),", sem extensão extra, que faz tudo o que você precisa: ",e.jsx("code",{children:"password_hash()"})," gera um hash forte e lento de propósito (com sal aleatório embutido) e ",e.jsx("code",{children:"password_verify()"})," compara em tempo constante (resistente a timing attack)."]}),e.jsx(s,{filename:"cadastro.php",code:`<?php
declare(strict_types=1);

$senhaPlano = 'segredo-do-usuario-2024';

// 1. Geração — sal é aleatório e fica EMBUTIDO no hash retornado
$hash = password_hash($senhaPlano, PASSWORD_BCRYPT, ['cost' => 12]);

echo $hash . PHP_EOL;
echo strlen($hash) . " caracteres" . PHP_EOL;`,output:`$2y$12$Q7rQk8eS1nXc4jY2eW4xK.OGZW7fW8qg6dQqp4Z9eR0c6wY3VXs5G
60 caracteres`}),e.jsxs("p",{children:["Olha a estrutura desse hash de 60 caracteres: ",e.jsx("code",{children:"$2y$"})," é o algoritmo bcrypt, ",e.jsx("code",{children:"12"})," é o custo (2¹² = 4096 iterações), seguido de 22 caracteres de sal e 31 do hash em si. Tudo num campo só — você guarda a string inteira no banco e pronto."]}),e.jsx(s,{filename:"login.php",code:`<?php
declare(strict_types=1);

function autenticar(\\PDO $pdo, string $email, string $senha): ?int {
    $stmt = $pdo->prepare('SELECT id, senha_hash FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch(\\PDO::FETCH_ASSOC);

    if ($user === false) {
        // hash dummy para evitar timing attack revelando se o e-mail existe
        password_verify($senha, '$2y$12$' . str_repeat('a', 53));
        return null;
    }

    if (!password_verify($senha, $user['senha_hash'])) {
        return null;
    }

    return (int) $user['id'];
}

// uso
$id = autenticar($pdo, 'ada@example.com', 'segredo-do-usuario-2024');
echo $id !== null ? "Login OK, user_id=$id" : "Credenciais inválidas";`,output:"Login OK, user_id=42"}),e.jsxs(a,{type:"info",title:"Por que dummy verify quando o e-mail não existe?",children:["Sem ele, login com e-mail inexistente responde em ~5ms; com e-mail válido, ~80ms (custo do bcrypt). Um atacante mede esse delta e descobre quais e-mails estão cadastrados (",e.jsx("em",{children:"account enumeration"}),"). Rodar um ",e.jsx("code",{children:"password_verify"})," ","bobo iguala o tempo."]}),e.jsx("h2",{children:"Custo: por que 12 (e não 4)"}),e.jsxs("p",{children:["O parâmetro ",e.jsx("code",{children:"cost"})," do bcrypt é o expoente de quantas rodadas o algoritmo executa: ",e.jsx("code",{children:"2^cost"}),". Quanto maior, mais lento — para você"," ",e.jsx("em",{children:"e"})," para o atacante. A regra é simples: ajuste para que um login leve cerca de ",e.jsx("strong",{children:"250 a 500 ms"})," no servidor de produção."]}),e.jsx(s,{filename:"benchmark.php",code:`<?php
declare(strict_types=1);

foreach ([10, 11, 12, 13, 14] as $cost) {
    $inicio = microtime(true);
    password_hash('senha-teste', PASSWORD_BCRYPT, ['cost' => $cost]);
    $ms = (microtime(true) - $inicio) * 1000;
    printf("cost=%d  →  %6.1f ms\\n", $cost, $ms);
}`,output:`cost=10  →    65.3 ms
cost=11  →   128.7 ms
cost=12  →   258.2 ms
cost=13  →   514.9 ms
cost=14  →  1031.4 ms`}),e.jsxs("p",{children:["Em 2025, ",e.jsx("strong",{children:"12 é o mínimo recomendado"})," para bcrypt. Servidores rápidos podem subir para 13. Não passe disso sem medir — você não quer derrubar o login sob carga."]}),e.jsx("h2",{children:"Argon2id: o algoritmo moderno"}),e.jsxs("p",{children:["Bcrypt é seguro, mas é de 1999. O vencedor da Password Hashing Competition de 2015 foi o ",e.jsx("strong",{children:"Argon2id"}),", que adiciona resistência a ataques de GPU e ASIC consumindo ",e.jsx("em",{children:"memória"}),", não só CPU. Se sua build de PHP foi compilada com libsodium (padrão hoje), está disponível."]}),e.jsx(s,{filename:"argon.php",code:`<?php
declare(strict_types=1);

$hash = password_hash('segredo', PASSWORD_ARGON2ID, [
    'memory_cost' => 65536,   // 64 MB de RAM por hash
    'time_cost'   => 4,       // 4 iterações
    'threads'     => 1,       // 1 thread (PHP-FPM single-thread)
]);

echo $hash . PHP_EOL;
var_dump(password_verify('segredo', $hash));`,output:`$argon2id$v=19$m=65536,t=4,p=1$N1pVNlBZdEZJa3l3SkRhMQ$qY2k5wT4Hf+Xy8Ld4fP+0S3aQy1nL8gK9wWvZ4eF6Lc
bool(true)`}),e.jsxs(a,{type:"success",title:"Bcrypt ou Argon2id: qual?",children:["Os dois são aceitáveis. ",e.jsx("strong",{children:"Argon2id"})," é tecnicamente superior, mas bcrypt é universal e funciona em qualquer build. Use ",e.jsx("code",{children:"PASSWORD_DEFAULT"})," ","e deixe o PHP escolher o melhor disponível — hoje é bcrypt, amanhã pode ser Argon. Combine com ",e.jsx("code",{children:"password_needs_rehash"})," para migrar de graça."]}),e.jsx("h2",{children:"password_needs_rehash: migração gratuita"}),e.jsxs("p",{children:["Você subiu o ",e.jsx("code",{children:"cost"})," de 10 para 12. E os usuários antigos com hash custo 10? Reaproveita o login deles para regerar o hash com o novo custo — sem pedir nova senha. Funciona também para migrar bcrypt → Argon2id."]}),e.jsx(s,{filename:"login-com-rehash.php",code:`<?php
declare(strict_types=1);

const HASH_OPTS = ['cost' => 12];

function autenticar(\\PDO $pdo, string $email, string $senha): ?int {
    $stmt = $pdo->prepare('SELECT id, senha_hash FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch(\\PDO::FETCH_ASSOC);

    if (!$user || !password_verify($senha, $user['senha_hash'])) {
        return null;
    }

    // Hash desatualizado? Regera com os parâmetros atuais.
    if (password_needs_rehash($user['senha_hash'], PASSWORD_DEFAULT, HASH_OPTS)) {
        $novo = password_hash($senha, PASSWORD_DEFAULT, HASH_OPTS);
        $pdo->prepare('UPDATE users SET senha_hash = ? WHERE id = ?')
            ->execute([$novo, $user['id']]);
    }

    return (int) $user['id'];
}`}),e.jsx("h2",{children:"Migrando hashes legados (MD5, SHA1, etc.)"}),e.jsxs("p",{children:["Herdou um sistema com senhas em MD5? Não pode forçar todo mundo a trocar. A estratégia clássica é ",e.jsx("strong",{children:"encapsular o hash antigo dentro de um novo"}),": no próximo login, você reconhece o hash legado, valida e migra para bcrypt."]}),e.jsx(s,{filename:"migracao-legada.php",code:`<?php
declare(strict_types=1);

function autenticarLegado(\\PDO $pdo, string $email, string $senha): ?int {
    $stmt = $pdo->prepare('SELECT id, senha_hash, hash_legado FROM users WHERE email = ?');
    $stmt->execute([$email]);
    $user = $stmt->fetch(\\PDO::FETCH_ASSOC);
    if (!$user) return null;

    // Caminho 1: já migrado
    if ($user['senha_hash'] !== null) {
        return password_verify($senha, $user['senha_hash']) ? (int) $user['id'] : null;
    }

    // Caminho 2: ainda em MD5 — valida e migra agora
    if (hash_equals($user['hash_legado'], md5($senha))) {
        $novo = password_hash($senha, PASSWORD_DEFAULT, ['cost' => 12]);
        $pdo->prepare('UPDATE users SET senha_hash = ?, hash_legado = NULL WHERE id = ?')
            ->execute([$novo, $user['id']]);
        return (int) $user['id'];
    }

    return null;
}`,output:""}),e.jsxs(a,{type:"warning",title:"Por que hash_equals e não ===",children:["Comparar strings com ",e.jsx("code",{children:"==="})," sai cedo no primeiro byte diferente, vazando informação sobre o hash via timing. ",e.jsx("code",{children:"hash_equals()"})," compara em tempo constante. ",e.jsx("strong",{children:"Sempre"})," use ele para qualquer comparação de tokens/hashes/HMACs."]}),e.jsx("h2",{children:"Schema do banco"}),e.jsxs("p",{children:["A coluna de hash precisa caber tudo: bcrypt sempre tem 60 caracteres, Argon2id chega a ~96. Para deixar margem para algoritmos futuros, use ",e.jsx("code",{children:"VARCHAR(255)"}),"."]}),e.jsx(s,{filename:"migration.sql",language:"sql",code:`CREATE TABLE users (
    id           BIGSERIAL PRIMARY KEY,
    email        VARCHAR(255) NOT NULL UNIQUE,
    senha_hash   VARCHAR(255) NOT NULL,
    criado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`}),e.jsx("h2",{children:"Política de senhas: o mínimo"}),e.jsxs("p",{children:["O NIST atualizou as recomendações: ",e.jsx("strong",{children:"esqueça"})," a regra de “maiúscula+símbolo+número”. Hoje o que vale é:"]}),e.jsxs("ul",{children:[e.jsxs("li",{children:["Mínimo de ",e.jsx("strong",{children:"8 caracteres"}),", ideal de ",e.jsx("strong",{children:"12+"}),"."]}),e.jsxs("li",{children:["Não force expiração periódica (usuários só viram ",e.jsx("em",{children:"senha2024 → senha2025"}),")."]}),e.jsxs("li",{children:["Cheque contra a base do ",e.jsx("strong",{children:"Have I Been Pwned"})," (API gratuita)."]}),e.jsx("li",{children:"Permita pastes de gerenciador de senhas."})]}),e.jsx(s,{filename:"checar-pwned.php",code:`<?php
declare(strict_types=1);

/**
 * Consulta a API k-anonymity do HaveIBeenPwned: envia só os
 * 5 primeiros caracteres do SHA1 — a senha nunca trafega.
 */
function senhaVazada(string $senha): bool {
    $sha1   = strtoupper(sha1($senha));
    $prefixo = substr($sha1, 0, 5);
    $sufixo  = substr($sha1, 5);

    $resposta = file_get_contents("https://api.pwnedpasswords.com/range/$prefixo");
    foreach (explode("\\n", $resposta) as $linha) {
        [$hashSufixo, $contagem] = explode(':', trim($linha));
        if ($hashSufixo === $sufixo) {
            return (int) $contagem > 0;
        }
    }
    return false;
}

var_dump(senhaVazada('123456'));         // true (vazada milhões de vezes)
var_dump(senhaVazada('xH7$kP9!nQ2vL@'));  // false`,output:`bool(true)
bool(false)`}),e.jsx("h2",{children:"Rodando os exemplos"}),e.jsx(r,{user:"dev",host:"php",cwd:"~/projetos/auth",command:"php benchmark.php",output:`cost=10  →    65.3 ms
cost=11  →   128.7 ms
cost=12  →   258.2 ms`}),e.jsx(a,{type:"success",title:"Checklist final",children:e.jsxs("ol",{className:"list-decimal ml-5 mt-1 space-y-1",children:[e.jsxs("li",{children:[e.jsx("code",{children:"password_hash($senha, PASSWORD_DEFAULT, ['cost' => 12])"})," no cadastro."]}),e.jsxs("li",{children:[e.jsx("code",{children:"password_verify()"})," no login — nunca ",e.jsx("code",{children:"==="}),"."]}),e.jsxs("li",{children:[e.jsx("code",{children:"password_needs_rehash()"})," em todo login bem-sucedido."]}),e.jsxs("li",{children:["Coluna ",e.jsx("code",{children:"VARCHAR(255)"}),", hash sai do banco e nunca aparece em log."]}),e.jsx("li",{children:"Bloqueio temporário após N tentativas (rate limit)."})]})}),e.jsxs("p",{children:["No próximo capítulo a gente entra em ",e.jsx("strong",{children:"CSRF, XSS e SQL Injection"})," — as três vulnerabilidades que mais derrubam apps PHP e como blindar contra cada uma."]})]})}export{d as default};
