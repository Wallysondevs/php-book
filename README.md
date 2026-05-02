# PHP — Manual Definitivo

Manual didático em **português brasileiro** para PHP 8.4. Construído como SPA com Vite + React 19, hash-routed para funcionar no GitHub Pages, com **90 capítulos** distribuídos em **27 seções** indo do "Olá, mundo!" até `Docker`, `CI/CD` e checklist de produção.

> Site publicado: **https://wallysondevs.github.io/php-book/**

## Filosofia

Aprender fazendo. Cada capítulo abre com um problema, mostra o código resolvendo, exibe a saída e explica o porquê. Tudo em PHP 8.4 moderno (`declare(strict_types=1)`, type hints, constructor promotion, `readonly`, enums, `match`).

## Estrutura

```
src/
├── App.tsx                        # roteamento (React.lazy por capítulo)
├── pages/                         # 90 capítulos + Home + 404
├── components/
│   ├── layout/                    # Sidebar, Header, PageContainer
│   └── ui/                        # PhpBlock, BrowserBlock, TerminalBlock, CodeBlock, AlertBox
├── lib/
└── index.css                      # tema PHP (#8993BE)
```

## Rodando localmente

```bash
pnpm install
pnpm dev          # http://localhost:5173/php-book/
pnpm typecheck
pnpm build        # gera dist/public/
```

Build de produção precisa das variáveis `PORT` e `BASE_PATH`:

```bash
PORT=5173 BASE_PATH=/php-book/ NODE_ENV=production pnpm build
```

## Deploy

Push no branch `main` dispara o workflow `.github/workflows/deploy.yml` que builda e publica em `gh-pages` automaticamente.

## Componentes didáticos

- **`PhpBlock`** — bloco `<?php` com painel de output do CLI.
- **`BrowserBlock`** — moldura de navegador fake para exemplos que geram HTML.
- **`TerminalBlock`** — comando shell com output (composer, phpunit, docker, etc).
- **`CodeBlock`** — código genérico com syntax highlighting (json, yaml, nginx, dockerfile, ini, bash).
- **`AlertBox`** — destaques (info, warning, danger, success).

## Stack

- React 19 + TypeScript + Vite 7
- wouter (router) + `useHashLocation`
- TailwindCSS + shadcn/ui
- framer-motion · lucide-react · @tanstack/react-query
- highlight.js para syntax highlighting

## Licença

MIT — sinta-se livre pra usar, modificar e contribuir.
