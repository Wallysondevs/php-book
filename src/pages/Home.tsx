import { Link } from "wouter";
import {
  Terminal, BookOpen, ChevronRight, Folder, Package,
  Code2, Hash, Workflow, ListTree, Boxes, ShieldAlert,
  Database, Sparkles, Calendar, Regex, FolderOpen, Cpu,
  TestTube, Wrench, Network, Server, KeyRound, Gauge, Rocket,
  Layers
} from "lucide-react";
import { motion } from "framer-motion";
import { useEffect, useState } from "react";

const CATEGORIES = [
  { num: "01", title: "Introdução",            desc: "História, motivação e versões do PHP",                           icon: BookOpen,    path: "/historia",         count: 3 },
  { num: "02", title: "Instalação",            desc: "Instalar PHP e rodar seu primeiro script",                       icon: Package,     path: "/instalacao",       count: 3 },
  { num: "03", title: "Sintaxe Básica",        desc: "Tags, variáveis, tipos e operadores",                            icon: Hash,        path: "/sintaxe",          count: 4 },
  { num: "04", title: "Strings & Arrays",      desc: "Manipulação prática das estruturas mais usadas",                 icon: ListTree,    path: "/strings",          count: 3 },
  { num: "05", title: "Controle de Fluxo",     desc: "if, switch, match e loops na prática",                           icon: Workflow,    path: "/if-else",          count: 3 },
  { num: "06", title: "Funções",               desc: "Funções, type hints, closures e arrow fns",                      icon: Code2,       path: "/funcoes",          count: 4 },
  { num: "07", title: "POO",                   desc: "Classes, herança, interfaces, traits e abstract",                icon: Boxes,       path: "/classes",          count: 6 },
  { num: "08", title: "PHP Moderno",           desc: "Enums, attributes, readonly, match, nullsafe (8.x)",             icon: Sparkles,    path: "/enums",            count: 4 },
  { num: "09", title: "Erros & Exceções",      desc: "try/catch/finally e exceptions personalizadas",                  icon: ShieldAlert, path: "/exceptions",       count: 2 },
  { num: "10", title: "Namespaces & Composer", desc: "Organização, autoload PSR-4 e gerenciamento de pacotes",         icon: Folder,      path: "/namespaces",       count: 3 },
  { num: "11", title: "Web & Banco",           desc: "Formulários, sessões, JSON, PDO e prepared statements",          icon: Database,    path: "/forms",            count: 5 },
  { num: "12", title: "Datas & Tempo",         desc: "DateTimeImmutable, intervals, timezones e i18n",                 icon: Calendar,    path: "/datas",            count: 3 },
  { num: "13", title: "Regex (PCRE)",          desc: "preg_*, lookahead, backreferences e ReDoS",                      icon: Regex,       path: "/regex-basico",     count: 2 },
  { num: "14", title: "Arquivos & I/O",        desc: "Leitura, escrita, streams, wrappers e uploads",                  icon: FolderOpen,  path: "/arquivos",         count: 4 },
  { num: "15", title: "SPL & Iteradores",      desc: "Estruturas SPL, Iterator, Generators (yield)",                   icon: Boxes,       path: "/spl-estruturas",   count: 3 },
  { num: "16", title: "Reflection & Meta",     desc: "Reflection API, atributos e closures avançadas",                 icon: Code2,       path: "/reflection",       count: 2 },
  { num: "17", title: "Async & Fibers",        desc: "Fibers (8.1), event loop e ReactPHP",                            icon: Cpu,         path: "/fibers",           count: 2 },
  { num: "18", title: "Testes Automatizados",  desc: "PHPUnit, Pest, mocks/doubles e TDD",                             icon: TestTube,    path: "/phpunit",          count: 4 },
  { num: "19", title: "Qualidade & Análise",   desc: "PHPStan, PHP-CS-Fixer e Rector",                                 icon: Wrench,      path: "/phpstan",          count: 3 },
  { num: "20", title: "Padrões PSR",           desc: "PSR-3 Logger, PSR-7 HTTP, PSR-11 Container, PSR-15 Middleware",  icon: Layers,      path: "/psr3-logger",      count: 4 },
  { num: "21", title: "HTTP Cliente",          desc: "cURL, Guzzle e webhooks com HMAC",                               icon: Network,     path: "/curl",             count: 3 },
  { num: "22", title: "Banco Avançado",        desc: "Doctrine DBAL, migrations e transações",                         icon: Database,    path: "/doctrine-dbal",    count: 3 },
  { num: "23", title: "Cache & Filas",         desc: "Redis, Memcached e filas de processamento",                      icon: Server,      path: "/redis",            count: 3 },
  { num: "24", title: "Segurança",             desc: "bcrypt, CSRF/XSS/SQLi, JWT e headers de segurança",              icon: KeyRound,    path: "/password-hash",    count: 4 },
  { num: "25", title: "APIs REST",             desc: "Design REST, OpenAPI/Swagger e CORS",                            icon: Network,     path: "/rest-design",      count: 3 },
  { num: "26", title: "Performance",           desc: "OPcache, JIT, profiling e otimizações",                          icon: Gauge,       path: "/opcache",          count: 3 },
  { num: "27", title: "Deploy & Produção",     desc: "Nginx+FPM, Docker, CI/CD e checklist final",                     icon: Rocket,      path: "/nginx-fpm",        count: 4 },
];

const HERO_LINES = [
  { delay: 0,    type: "cmd", text: "php --version" },
  { delay: 600,  type: "out", text: "PHP 8.4.0 (cli) (built: Nov 21 2024 12:34:56) (NTS)\nCopyright (c) The PHP Group\nZend Engine v4.4.0, Copyright (c) Zend Technologies" },
  { delay: 1500, type: "cmd", text: "php -r 'echo \"Olá, mundo!\\n\";'" },
  { delay: 2100, type: "out", text: "Olá, mundo!" },
  { delay: 2600, type: "cmd", text: "php -S localhost:8000 -t public" },
  { delay: 3300, type: "out", text: "[Sat May 02 21:00:00 2026] PHP 8.4.0 Development Server (http://localhost:8000) started" },
];

export default function Home() {
  const [visible, setVisible] = useState(0);

  useEffect(() => {
    const timers: number[] = [];
    HERO_LINES.forEach((line, i) => {
      const t = window.setTimeout(() => setVisible(i + 1), line.delay);
      timers.push(t);
    });
    return () => timers.forEach((t) => clearTimeout(t));
  }, []);

  return (
    <div className="min-h-screen arch-grid-bg">
      {/* HERO */}
      <section className="relative overflow-hidden pt-12 sm:pt-20 pb-20 px-4 arch-scanlines">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-b from-[#8993BE]/[0.06] via-transparent to-[#08090C]" />
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[600px] h-[600px] rounded-full bg-[#8993BE]/[0.08] blur-3xl" />
        </div>

        <div className="max-w-6xl mx-auto relative z-10 grid lg:grid-cols-[1.1fr_1fr] gap-12 items-center">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5 }}
          >
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#8993BE]/10 text-[#B0B7D6] border border-[#8993BE]/30 text-xs font-mono mb-6">
              <span className="w-1.5 h-1.5 rounded-full bg-[#8993BE] animate-pulse" />
              v1.0 — manual didático 2026
            </div>
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-black tracking-tight mb-6 leading-[1.05] before:content-none">
              <span className="block text-white">Aprenda</span>
              <span className="block text-transparent bg-clip-text bg-gradient-to-r from-[#8993BE] via-[#B0B7D6] to-[#8993BE] term-glow">
                PHP
              </span>
              <span className="block text-white text-3xl md:text-4xl lg:text-5xl mt-2">
                de verdade. Com muita prática.
              </span>
            </h1>
            <p className="text-base md:text-lg text-[#9aa3b2] mb-8 max-w-xl leading-relaxed">
              Um manual prático em português: <strong className="text-white">cada conceito vem com código rodável</strong>,
              saída do terminal e visualização no navegador. Do <code>echo</code> ao Composer, sem encurtar nada.
            </p>

            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 mb-8">
              <Link
                href="/instalacao"
                className="group px-6 py-3 rounded-md bg-[#8993BE] text-white font-semibold shadow-[0_0_20px_rgba(137,147,190,0.4)] hover:bg-[#9CA4C9] hover:shadow-[0_0_28px_rgba(137,147,190,0.55)] transition-all flex items-center justify-center gap-2 border-0"
              >
                <Terminal className="w-4 h-4" />
                ./start.sh — Começar do Zero
              </Link>
              <Link
                href="/sintaxe"
                className="px-6 py-3 rounded-md bg-[#0d1117] border border-[hsl(220_12%_22%)] text-[#cbd1dc] font-medium hover:border-[#8993BE]/50 hover:text-white transition-all flex items-center justify-center gap-2 font-mono text-sm"
              >
                man php
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>

            <div className="flex items-center gap-6 text-xs font-mono text-[#7c8497]">
              <span><span className="text-[#5fff87]">●</span> 90 capítulos</span>
              <span><span className="text-[#8993BE]">●</span> 27 seções</span>
              <span><span className="text-[#ffd75f]">●</span> 100% PT-BR</span>
            </div>
          </motion.div>

          {/* TERMINAL DEMO */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.5, delay: 0.15 }}
            className="relative"
          >
            <div className="absolute -inset-4 bg-[#8993BE]/10 blur-2xl rounded-2xl" />
            <div className="relative rounded-lg border border-[hsl(220_12%_22%)] bg-[#0a0d11] shadow-2xl overflow-hidden">
              <div className="flex items-center px-3 py-2 bg-gradient-to-b from-[#161a21] to-[#11141a] border-b border-[hsl(220_12%_18%)]">
                <div className="flex gap-1.5">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
                </div>
                <span className="text-[11px] font-mono text-[#7c8497] ml-3">dev@php: ~/projetos</span>
              </div>
              <div className="p-4 font-mono text-[12.5px] leading-[1.55] min-h-[280px]">
                {HERO_LINES.slice(0, visible).map((line, i) => (
                  <div key={i}>
                    {line.type === "cmd" ? (
                      <div>
                        <span className="text-[#7c8497]">[</span>
                        <span className="text-[#5fff87]">dev</span>
                        <span className="text-[#9aa3b2]">@</span>
                        <span className="text-[#8993BE]">php</span>{" "}
                        <span className="text-[#9CA4C9]">~/projetos</span>
                        <span className="text-[#7c8497]">]$ </span>
                        <span className="text-white">{line.text}</span>
                      </div>
                    ) : (
                      <pre className="whitespace-pre-wrap text-[#cbd1dc] m-0">{line.text}</pre>
                    )}
                  </div>
                ))}
                {visible >= HERO_LINES.length && (
                  <div>
                    <span className="text-[#7c8497]">[</span>
                    <span className="text-[#5fff87]">dev</span>
                    <span className="text-[#9aa3b2]">@</span>
                    <span className="text-[#8993BE]">php</span>{" "}
                    <span className="text-[#9CA4C9]">~/projetos</span>
                    <span className="text-[#7c8497]">]$ </span>
                    <span className="arch-cursor" />
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* STATS */}
      <section className="border-y border-[hsl(220_12%_14%)] bg-[#0a0d11] relative z-10">
        <div className="max-w-6xl mx-auto px-4 py-10 grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
          {[
            { value: "90",   label: "capítulos progressivos", color: "text-[#5fff87]" },
            { value: "27",   label: "seções organizadas",     color: "text-[#8993BE]" },
            { value: "100%", label: "português brasileiro",   color: "text-[#ffd75f]" },
            { value: "8.4",  label: "PHP versão alvo",        color: "text-[#ff87ff]" },
          ].map((s, i) => (
            <div key={i}>
              <div className={`text-3xl sm:text-4xl font-black font-mono ${s.color} mb-1`}>{s.value}</div>
              <div className="text-[10px] sm:text-[11px] uppercase tracking-[0.15em] text-[#7c8497] font-mono">{s.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* LEARNING PATH */}
      <section className="py-20 px-4 max-w-6xl mx-auto relative z-10">
        <div className="mb-12">
          <div className="text-xs font-mono text-[#8993BE] uppercase tracking-[0.2em] mb-2 flex items-center gap-2">
            <span className="text-[#5fff87]">$</span>
            <span>ls -1 /docs/capitulos/</span>
          </div>
          <h2 className="text-3xl md:text-4xl font-black mb-3 border-0 before:content-none">
            Trilha do iniciante ao avançado
          </h2>
          <p className="text-[#9aa3b2] max-w-2xl">
            Cada capítulo abre com um problema, mostra o código resolvendo, exibe a saída e explica o porquê.
            Você aprende fazendo, não decorando.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {CATEGORIES.map((cat, i) => {
            const Icon = cat.icon as any;
            return (
              <Link key={i} href={cat.path}>
                <motion.div
                  whileHover={{ y: -3 }}
                  transition={{ duration: 0.15 }}
                  className="group relative p-5 rounded-md bg-[#0d1117] border border-[hsl(220_12%_18%)] hover:border-[#8993BE]/50 hover:bg-[#11151c] transition-all cursor-pointer h-full flex flex-col"
                >
                  <div className="flex items-start justify-between mb-3">
                    <span className="text-[11px] font-mono text-[#5c6370] tracking-widest">{cat.num}</span>
                    <div className="w-8 h-8 rounded bg-[#8993BE]/10 text-[#8993BE] flex items-center justify-center group-hover:bg-[#8993BE]/20 group-hover:scale-110 transition-all">
                      <Icon className="w-4 h-4" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold text-white mb-1.5 mt-0 before:content-none">{cat.title}</h3>
                  <p className="text-xs text-[#9aa3b2] leading-relaxed mb-4 flex-1">{cat.desc}</p>
                  <div className="flex items-center justify-between text-[10px] font-mono">
                    <span className="text-[#5c6370]">{cat.count} {cat.count === 1 ? "capítulo" : "capítulos"}</span>
                    <span className="text-[#8993BE] group-hover:translate-x-1 transition-transform inline-flex items-center gap-1">
                      cd → <ChevronRight className="w-3 h-3" />
                    </span>
                  </div>
                </motion.div>
              </Link>
            );
          })}
        </div>
      </section>

      {/* QUOTE */}
      <section className="border-t border-[hsl(220_12%_14%)] py-20 px-4 bg-[#08090C]">
        <div className="max-w-3xl mx-auto text-center">
          <blockquote className="font-mono text-lg sm:text-xl md:text-2xl text-[#cbd1dc] leading-relaxed">
            <span className="text-[#8993BE]">&lt;?php</span><br />
            <span className="text-[#5fff87]">echo</span> <span className="text-[#ffd75f]">&quot;A melhor forma de aprender uma linguagem é escrevendo código nela.&quot;</span><span className="text-white">;</span>
          </blockquote>
          <div className="mt-6 text-xs font-mono text-[#7c8497] uppercase tracking-[0.2em]">
            — The PHP Way
          </div>
        </div>
      </section>
    </div>
  );
}
