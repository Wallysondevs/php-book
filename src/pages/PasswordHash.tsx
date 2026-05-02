import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";
import { TerminalBlock } from "@/components/ui/TerminalBlock";
import { AlertBox } from "@/components/ui/AlertBox";

export default function PasswordHash() {
  return (
    <PageContainer
      title="Senhas: hash & verify"
      subtitle="Como guardar senhas de usuários do jeito certo em PHP — password_hash, password_verify, password_needs_rehash e por que md5/sha1 são pecado mortal."
      difficulty="intermediario"
      timeToRead="12 min"
      category="Segurança"
    >
      <h2>O problema: o banco vaza. E aí?</h2>
      <p>
        Cedo ou tarde, alguém vaza o seu banco de dados — SQL injection, backup mal
        configurado, ex-funcionário descontente. A pergunta não é <em>se</em>, é{" "}
        <em>quando</em>. E a única defesa que sobra naquele momento é como você
        guardou as senhas. Se elas estavam em texto puro (ou num hash fraco como
        MD5/SHA1), o atacante já tem todas as contas.
      </p>

      <PhpBlock
        filename="errado.php"
        code={`<?php
declare(strict_types=1);

// ❌ NUNCA — texto puro
$pdo->prepare('INSERT INTO users (email, senha) VALUES (?, ?)')
    ->execute(['ada@example.com', 'segredo123']);

// ❌ NUNCA — md5/sha1 (rápidos demais, sem sal)
$hash = md5('segredo123');         // 5e88489...   quebrado em milissegundos
$hash = sha1('segredo123');        // 7c4a8d0...   também quebrado

// ❌ NUNCA — "criptografar" senha
$hash = openssl_encrypt('segredo123', 'aes-256-cbc', $chave, iv: $iv);
// senha não deve ser reversível! ninguém precisa do plaintext de volta.`}
      />

      <AlertBox type="danger" title="Por que MD5/SHA1 são proibidos">
        São hashes de propósito geral — projetados para ser <strong>rápidos</strong>.
        Uma GPU moderna testa 30 bilhões de hashes MD5 por segundo. Se sua senha tem
        8 caracteres, ela cai em segundos via força bruta com rainbow tables.
      </AlertBox>

      <h2>O jeito certo: password_hash() + password_verify()</h2>
      <p>
        PHP tem uma API <strong>nativa</strong>, sem extensão extra, que faz tudo o que
        você precisa: <code>password_hash()</code> gera um hash forte e lento de propósito
        (com sal aleatório embutido) e <code>password_verify()</code> compara em tempo
        constante (resistente a timing attack).
      </p>

      <PhpBlock
        filename="cadastro.php"
        code={`<?php
declare(strict_types=1);

$senhaPlano = 'segredo-do-usuario-2024';

// 1. Geração — sal é aleatório e fica EMBUTIDO no hash retornado
$hash = password_hash($senhaPlano, PASSWORD_BCRYPT, ['cost' => 12]);

echo $hash . PHP_EOL;
echo strlen($hash) . " caracteres" . PHP_EOL;`}
        output={`$2y$12$Q7rQk8eS1nXc4jY2eW4xK.OGZW7fW8qg6dQqp4Z9eR0c6wY3VXs5G
60 caracteres`}
      />

      <p>
        Olha a estrutura desse hash de 60 caracteres: <code>$2y$</code> é o algoritmo
        bcrypt, <code>12</code> é o custo (2¹² = 4096 iterações), seguido de 22
        caracteres de sal e 31 do hash em si. Tudo num campo só — você guarda a string
        inteira no banco e pronto.
      </p>

      <PhpBlock
        filename="login.php"
        code={`<?php
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
echo $id !== null ? "Login OK, user_id=$id" : "Credenciais inválidas";`}
        output={`Login OK, user_id=42`}
      />

      <AlertBox type="info" title="Por que dummy verify quando o e-mail não existe?">
        Sem ele, login com e-mail inexistente responde em ~5ms; com e-mail válido,
        ~80ms (custo do bcrypt). Um atacante mede esse delta e descobre quais e-mails
        estão cadastrados (<em>account enumeration</em>). Rodar um <code>password_verify</code>{" "}
        bobo iguala o tempo.
      </AlertBox>

      <h2>Custo: por que 12 (e não 4)</h2>
      <p>
        O parâmetro <code>cost</code> do bcrypt é o expoente de quantas rodadas o
        algoritmo executa: <code>2^cost</code>. Quanto maior, mais lento — para você{" "}
        <em>e</em> para o atacante. A regra é simples: ajuste para que um login leve
        cerca de <strong>250 a 500 ms</strong> no servidor de produção.
      </p>

      <PhpBlock
        filename="benchmark.php"
        code={`<?php
declare(strict_types=1);

foreach ([10, 11, 12, 13, 14] as $cost) {
    $inicio = microtime(true);
    password_hash('senha-teste', PASSWORD_BCRYPT, ['cost' => $cost]);
    $ms = (microtime(true) - $inicio) * 1000;
    printf("cost=%d  →  %6.1f ms\\n", $cost, $ms);
}`}
        output={`cost=10  →    65.3 ms
cost=11  →   128.7 ms
cost=12  →   258.2 ms
cost=13  →   514.9 ms
cost=14  →  1031.4 ms`}
      />

      <p>
        Em 2025, <strong>12 é o mínimo recomendado</strong> para bcrypt. Servidores
        rápidos podem subir para 13. Não passe disso sem medir — você não quer
        derrubar o login sob carga.
      </p>

      <h2>Argon2id: o algoritmo moderno</h2>
      <p>
        Bcrypt é seguro, mas é de 1999. O vencedor da Password Hashing Competition
        de 2015 foi o <strong>Argon2id</strong>, que adiciona resistência a ataques de GPU
        e ASIC consumindo <em>memória</em>, não só CPU. Se sua build de PHP foi compilada
        com libsodium (padrão hoje), está disponível.
      </p>

      <PhpBlock
        filename="argon.php"
        code={`<?php
declare(strict_types=1);

$hash = password_hash('segredo', PASSWORD_ARGON2ID, [
    'memory_cost' => 65536,   // 64 MB de RAM por hash
    'time_cost'   => 4,       // 4 iterações
    'threads'     => 1,       // 1 thread (PHP-FPM single-thread)
]);

echo $hash . PHP_EOL;
var_dump(password_verify('segredo', $hash));`}
        output={`$argon2id$v=19$m=65536,t=4,p=1$N1pVNlBZdEZJa3l3SkRhMQ$qY2k5wT4Hf+Xy8Ld4fP+0S3aQy1nL8gK9wWvZ4eF6Lc
bool(true)`}
      />

      <AlertBox type="success" title="Bcrypt ou Argon2id: qual?">
        Os dois são aceitáveis. <strong>Argon2id</strong> é tecnicamente superior, mas
        bcrypt é universal e funciona em qualquer build. Use <code>PASSWORD_DEFAULT</code>{" "}
        e deixe o PHP escolher o melhor disponível — hoje é bcrypt, amanhã pode ser
        Argon. Combine com <code>password_needs_rehash</code> para migrar de graça.
      </AlertBox>

      <h2>password_needs_rehash: migração gratuita</h2>
      <p>
        Você subiu o <code>cost</code> de 10 para 12. E os usuários antigos com hash
        custo 10? Reaproveita o login deles para regerar o hash com o novo custo —
        sem pedir nova senha. Funciona também para migrar bcrypt → Argon2id.
      </p>

      <PhpBlock
        filename="login-com-rehash.php"
        code={`<?php
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
}`}
      />

      <h2>Migrando hashes legados (MD5, SHA1, etc.)</h2>
      <p>
        Herdou um sistema com senhas em MD5? Não pode forçar todo mundo a trocar.
        A estratégia clássica é <strong>encapsular o hash antigo dentro de um novo</strong>:
        no próximo login, você reconhece o hash legado, valida e migra para bcrypt.
      </p>

      <PhpBlock
        filename="migracao-legada.php"
        code={`<?php
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
}`}
        output={``}
      />

      <AlertBox type="warning" title="Por que hash_equals e não ===">
        Comparar strings com <code>===</code> sai cedo no primeiro byte diferente,
        vazando informação sobre o hash via timing. <code>hash_equals()</code> compara
        em tempo constante. <strong>Sempre</strong> use ele para qualquer comparação
        de tokens/hashes/HMACs.
      </AlertBox>

      <h2>Schema do banco</h2>
      <p>
        A coluna de hash precisa caber tudo: bcrypt sempre tem 60 caracteres, Argon2id
        chega a ~96. Para deixar margem para algoritmos futuros, use <code>VARCHAR(255)</code>.
      </p>

      <PhpBlock
        filename="migration.sql"
        language="sql"
        code={`CREATE TABLE users (
    id           BIGSERIAL PRIMARY KEY,
    email        VARCHAR(255) NOT NULL UNIQUE,
    senha_hash   VARCHAR(255) NOT NULL,
    criado_em    TIMESTAMPTZ NOT NULL DEFAULT NOW()
);`}
      />

      <h2>Política de senhas: o mínimo</h2>
      <p>
        O NIST atualizou as recomendações: <strong>esqueça</strong> a regra de
        “maiúscula+símbolo+número”. Hoje o que vale é:
      </p>
      <ul>
        <li>Mínimo de <strong>8 caracteres</strong>, ideal de <strong>12+</strong>.</li>
        <li>Não force expiração periódica (usuários só viram <em>senha2024 → senha2025</em>).</li>
        <li>Cheque contra a base do <strong>Have I Been Pwned</strong> (API gratuita).</li>
        <li>Permita pastes de gerenciador de senhas.</li>
      </ul>

      <PhpBlock
        filename="checar-pwned.php"
        code={`<?php
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
var_dump(senhaVazada('xH7$kP9!nQ2vL@'));  // false`}
        output={`bool(true)
bool(false)`}
      />

      <h2>Rodando os exemplos</h2>
      <TerminalBlock
        user="dev"
        host="php"
        cwd="~/projetos/auth"
        command="php benchmark.php"
        output={`cost=10  →    65.3 ms
cost=11  →   128.7 ms
cost=12  →   258.2 ms`}
      />

      <AlertBox type="success" title="Checklist final">
        <ol className="list-decimal ml-5 mt-1 space-y-1">
          <li><code>password_hash($senha, PASSWORD_DEFAULT, ['cost' =&gt; 12])</code> no cadastro.</li>
          <li><code>password_verify()</code> no login — nunca <code>===</code>.</li>
          <li><code>password_needs_rehash()</code> em todo login bem-sucedido.</li>
          <li>Coluna <code>VARCHAR(255)</code>, hash sai do banco e nunca aparece em log.</li>
          <li>Bloqueio temporário após N tentativas (rate limit).</li>
        </ol>
      </AlertBox>

      <p>
        No próximo capítulo a gente entra em <strong>CSRF, XSS e SQL Injection</strong> —
        as três vulnerabilidades que mais derrubam apps PHP e como blindar contra cada uma.
      </p>
    </PageContainer>
  );
}
