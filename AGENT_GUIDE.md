# PHP Book — Page Authoring Guide for Subagents

You are writing a chapter page for `artifacts/php-book` — a Brazilian Portuguese PHP didactic manual styled like a developer terminal. Each page must be **practical, code-heavy, and run-tested mentally**.

## Reference page (THE TEMPLATE)
Read `artifacts/php-book/src/pages/Sintaxe.tsx` BEFORE writing. Mirror its structure, tone, and component usage exactly.

## Available components (import these only)
```tsx
import { PageContainer } from "@/components/layout/PageContainer";
import { PhpBlock } from "@/components/ui/PhpBlock";          // PHP source + optional terminal output
import { TerminalBlock } from "@/components/ui/TerminalBlock"; // CLI commands (bash, php -S, composer)
import { BrowserBlock } from "@/components/ui/BrowserBlock";   // shows HTML rendered to user
import { CodeBlock } from "@/components/ui/CodeBlock";          // for non-PHP code (json, sql, ini, html)
import { AlertBox } from "@/components/ui/AlertBox";            // info | warning | danger | success
```

### PhpBlock (most used)
```tsx
<PhpBlock
  filename="exemplo.php"
  code={`<?php
declare(strict_types=1);
echo "olá";`}
  output={`olá`}   // optional CLI output
/>
```

### TerminalBlock (for shell commands)
```tsx
<TerminalBlock
  user="dev" host="php" cwd="~/projetos"
  command="composer require monolog/monolog"
  output={`Using version ^3.7 for monolog/monolog
./composer.json has been updated`}
/>
```

### BrowserBlock (when PHP outputs HTML)
```tsx
<BrowserBlock url="http://localhost:8000/users.php">
  <h1>Lista</h1>
  <ul><li>Ada</li><li>Linus</li></ul>
</BrowserBlock>
```

### AlertBox
```tsx
<AlertBox type="warning" title="Atenção">Texto explicativo.</AlertBox>
```

## CRITICAL JSX RULES
1. **NEVER** put `\n` inside `output="..."` strings — always use template literals: ``output={`linha1\nlinha2`}``
2. **NEVER** use `\"` escaping in code/output props — always template literals.
3. The PageContainer auto-styles `<h2>`, `<h3>`, `<p>`, `<ul>`, `<ol>`, `<code>`, `<strong>`, `<em>` — just use plain HTML, no className needed.
4. Wrap any code mention in body text with `<code>...</code>`.
5. Don't import or use lucide-react icons in chapter pages — keep them clean text + components.

## PageContainer header
```tsx
<PageContainer
  title="Título do Capítulo"
  subtitle="Frase de 1-2 linhas explicando o que o leitor vai aprender."
  difficulty="iniciante"  // or "intermediario" or "avancado"
  timeToRead="10 min"
  category="Nome da Seção"
>
```

## Tone & content guidelines
- **Pure Brazilian Portuguese** (PT-BR). Tutorial, conversational, "você" form.
- **Hands-on first**: open with a problem, show code that solves it, explain why.
- **Show the output** for almost every PhpBlock — readers need to see what runs.
- **2-5 PhpBlocks per page minimum.** This is "muita prática" — practical examples first, theory second.
- **Modern PHP**: target PHP 8.4. Always use `declare(strict_types=1);`, type hints, constructor promotion when relevant.
- **Length**: ~250-450 lines of TSX per page is the sweet spot.
- **End** with a brief "próximo capítulo" or "no próximo capítulo" callout if natural.

## File naming
Each page gets exactly one default-exported function. The file name must match what App.tsx imports — DO NOT change route imports.

## Forbidden
- No external image URLs.
- No fictional libraries — only real PHP, real Composer packages (Monolog, PHPUnit, Guzzle, etc.).
- No placeholder text like "TODO" or "lorem ipsum".
- No mocked/fake APIs in the prose ("imagine que...") — show real, runnable PHP.
