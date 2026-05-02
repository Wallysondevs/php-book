import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import {
  BookOpen, Terminal, Settings, FileText, Network,
  History, PenTool, Search, X, Folder, Lock, Package, Code2,
  Eye, ChevronRight, GitBranch, Database, Layers, Sparkles,
  FileCode, ScrollText, Variable, Workflow, Zap, Boxes,
  ShieldAlert, Repeat, ListTree, Hash, Type, Cog, Cookie,
  Send, Globe, Wrench, Calendar, Regex, FolderOpen, Cpu,
  TestTube, ShieldCheck, Server, Gauge, Rocket, Bug,
  Activity, Cloud, KeyRound
} from "lucide-react";

const NAVIGATION = [
  {
    title: "1. Introdução",
    items: [
      { path: "/", label: "Início", icon: BookOpen },
      { path: "/historia", label: "História do PHP", icon: History },
      { path: "/por-que-php", label: "Por que aprender PHP", icon: PenTool },
      { path: "/versoes", label: "Versões e Roadmap", icon: GitBranch },
    ]
  },
  {
    title: "2. Instalação & Setup",
    items: [
      { path: "/instalacao", label: "Instalando PHP", icon: Package },
      { path: "/php-cli", label: "PHP na linha de comando", icon: Terminal },
      { path: "/servidor-embutido", label: "Servidor embutido (php -S)", icon: Globe },
    ]
  },
  {
    title: "3. Sintaxe Básica",
    items: [
      { path: "/sintaxe", label: "Sintaxe e tags <?php", icon: FileCode },
      { path: "/variaveis", label: "Variáveis e escopo", icon: Variable },
      { path: "/tipos", label: "Tipos primitivos", icon: Type },
      { path: "/operadores", label: "Operadores", icon: Hash },
    ]
  },
  {
    title: "4. Strings & Arrays",
    items: [
      { path: "/strings", label: "Strings", icon: FileText },
      { path: "/arrays", label: "Arrays", icon: ListTree },
      { path: "/array-functions", label: "Funções de array", icon: ListTree },
    ]
  },
  {
    title: "5. Controle de Fluxo",
    items: [
      { path: "/if-else", label: "if / else / elseif", icon: Workflow },
      { path: "/switch-match", label: "switch e match", icon: Workflow },
      { path: "/loops", label: "Loops (for, while, foreach)", icon: Repeat },
    ]
  },
  {
    title: "6. Funções",
    items: [
      { path: "/funcoes", label: "Funções básicas", icon: Code2 },
      { path: "/type-hints", label: "Type hints e return types", icon: Type },
      { path: "/arrow-functions", label: "Arrow functions e Closures", icon: Zap },
      { path: "/argumentos", label: "Argumentos: default, named, variadic", icon: Settings },
    ]
  },
  {
    title: "7. POO — Orientação a Objetos",
    items: [
      { path: "/classes", label: "Classes e Objetos", icon: Boxes },
      { path: "/visibilidade", label: "Visibilidade e Encapsulamento", icon: Lock },
      { path: "/heranca", label: "Herança", icon: Layers },
      { path: "/interfaces", label: "Interfaces", icon: Layers },
      { path: "/traits", label: "Traits", icon: Layers },
      { path: "/abstract", label: "Classes Abstratas", icon: Layers },
    ]
  },
  {
    title: "8. PHP Moderno (8.x)",
    items: [
      { path: "/enums", label: "Enums (8.1)", icon: ListTree },
      { path: "/attributes", label: "Attributes (8.0)", icon: Sparkles },
      { path: "/readonly-promotion", label: "Readonly & Constructor Promotion", icon: Lock },
      { path: "/nullsafe", label: "Nullsafe e Match", icon: Zap },
    ]
  },
  {
    title: "9. Erros & Exceções",
    items: [
      { path: "/exceptions", label: "Try / Catch / Finally", icon: ShieldAlert },
      { path: "/custom-exceptions", label: "Exceptions personalizadas", icon: ShieldAlert },
    ]
  },
  {
    title: "10. Namespaces & Composer",
    items: [
      { path: "/namespaces", label: "Namespaces", icon: Folder },
      { path: "/composer", label: "Composer", icon: Package },
      { path: "/autoload", label: "Autoload PSR-4", icon: Cog },
    ]
  },
  {
    title: "11. Web & Banco de Dados",
    items: [
      { path: "/forms", label: "Formulários ($_GET, $_POST)", icon: Send },
      { path: "/sessoes", label: "Sessões e Cookies", icon: Cookie },
      { path: "/json", label: "JSON", icon: ScrollText },
      { path: "/pdo", label: "PDO — acesso a banco", icon: Database },
      { path: "/prepared", label: "Prepared Statements", icon: Database },
    ]
  },
  {
    title: "12. Datas & Tempo",
    items: [
      { path: "/datas", label: "Datas e horários", icon: Calendar },
      { path: "/datetime-imutavel", label: "DateTimeImmutable", icon: Calendar },
      { path: "/timezones", label: "Timezones e i18n", icon: Globe },
    ]
  },
  {
    title: "13. Regex (PCRE)",
    items: [
      { path: "/regex-basico", label: "Regex básico (preg_*)", icon: Regex },
      { path: "/regex-avancado", label: "Regex avançado", icon: Regex },
    ]
  },
  {
    title: "14. Arquivos & I/O",
    items: [
      { path: "/arquivos", label: "Lendo e escrevendo arquivos", icon: FileText },
      { path: "/diretorios", label: "Diretórios e SPL FileInfo", icon: FolderOpen },
      { path: "/streams", label: "Streams e wrappers", icon: Activity },
      { path: "/uploads", label: "Upload de arquivos", icon: Send },
    ]
  },
  {
    title: "15. SPL & Iteradores",
    items: [
      { path: "/spl-estruturas", label: "SPL: estruturas de dados", icon: Boxes },
      { path: "/iteradores", label: "Iterators e IteratorAggregate", icon: Repeat },
      { path: "/generators", label: "Generators (yield)", icon: Zap },
    ]
  },
  {
    title: "16. Reflection & Meta",
    items: [
      { path: "/reflection", label: "Reflection API", icon: Eye },
      { path: "/closures-avancadas", label: "Closures avançadas", icon: Zap },
    ]
  },
  {
    title: "17. Async & Fibers",
    items: [
      { path: "/fibers", label: "Fibers (PHP 8.1)", icon: Cpu },
      { path: "/reactphp", label: "ReactPHP — event loop", icon: Cpu },
    ]
  },
  {
    title: "18. Testes Automatizados",
    items: [
      { path: "/phpunit", label: "PHPUnit", icon: TestTube },
      { path: "/pest", label: "Pest — testes elegantes", icon: TestTube },
      { path: "/mocks", label: "Mocks e Doubles", icon: TestTube },
      { path: "/tdd", label: "TDD na prática", icon: TestTube },
    ]
  },
  {
    title: "19. Qualidade & Análise",
    items: [
      { path: "/phpstan", label: "PHPStan — análise estática", icon: Bug },
      { path: "/php-cs-fixer", label: "PHP-CS-Fixer & PSR-12", icon: Wrench },
      { path: "/rector", label: "Rector — refactor automático", icon: Wrench },
    ]
  },
  {
    title: "20. Padrões PSR",
    items: [
      { path: "/psr3-logger", label: "PSR-3 Logger (Monolog)", icon: ScrollText },
      { path: "/psr7-http", label: "PSR-7 HTTP Messages", icon: Network },
      { path: "/psr11-container", label: "PSR-11 Container (DI)", icon: Boxes },
      { path: "/psr15-middleware", label: "PSR-15 Middleware", icon: Layers },
    ]
  },
  {
    title: "21. HTTP Cliente",
    items: [
      { path: "/curl", label: "cURL nativo", icon: Network },
      { path: "/guzzle", label: "Guzzle HTTP Client", icon: Network },
      { path: "/webhooks", label: "Webhooks (recebendo)", icon: Send },
    ]
  },
  {
    title: "22. Banco Avançado",
    items: [
      { path: "/doctrine-dbal", label: "Doctrine DBAL", icon: Database },
      { path: "/migrations", label: "Migrations (Phinx)", icon: Database },
      { path: "/transacoes", label: "Transações & Locking", icon: Database },
    ]
  },
  {
    title: "23. Cache & Filas",
    items: [
      { path: "/redis", label: "Redis (Predis)", icon: Server },
      { path: "/memcached", label: "Memcached", icon: Server },
      { path: "/filas", label: "Filas de processamento", icon: Workflow },
    ]
  },
  {
    title: "24. Segurança",
    items: [
      { path: "/password-hash", label: "Senhas: hash & verify", icon: KeyRound },
      { path: "/csrf-xss", label: "CSRF, XSS e SQL Injection", icon: ShieldCheck },
      { path: "/jwt", label: "JWT — JSON Web Tokens", icon: KeyRound },
      { path: "/security-headers", label: "Headers de segurança", icon: ShieldCheck },
    ]
  },
  {
    title: "25. APIs REST",
    items: [
      { path: "/rest-design", label: "Design de API REST", icon: Network },
      { path: "/openapi", label: "OpenAPI/Swagger", icon: ScrollText },
      { path: "/cors", label: "CORS na prática", icon: Globe },
    ]
  },
  {
    title: "26. Performance",
    items: [
      { path: "/opcache", label: "OPcache", icon: Gauge },
      { path: "/profiling", label: "Profiling (Xdebug, Blackfire)", icon: Gauge },
      { path: "/otimizacoes", label: "Otimizações práticas", icon: Gauge },
    ]
  },
  {
    title: "27. Deploy & Produção",
    items: [
      { path: "/nginx-fpm", label: "Nginx + PHP-FPM", icon: Server },
      { path: "/docker", label: "Docker para PHP", icon: Cloud },
      { path: "/ci-cd", label: "CI/CD com GitHub Actions", icon: Rocket },
      { path: "/producao", label: "Checklist de produção", icon: Rocket },
    ]
  },
];

interface SidebarProps {
  isOpen: boolean;
  setIsOpen: (v: boolean) => void;
}

export function Sidebar({ isOpen, setIsOpen }: SidebarProps) {
  const [location] = useLocation();

  return (
    <>
      {isOpen && (
        <div
          className="fixed inset-0 bg-background/80 backdrop-blur-sm z-40 lg:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      <aside
        className={cn(
          "fixed top-0 bottom-0 left-0 z-50 w-72 transition-transform duration-300 ease-in-out lg:translate-x-0 arch-scroll overflow-y-auto",
          "bg-[#080a0e] border-r border-[hsl(220_12%_14%)]",
          isOpen ? "translate-x-0" : "-translate-x-full"
        )}
      >
        <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-[#8993BE] to-transparent opacity-40" />

        <div className="p-5">
          <div className="flex items-center justify-between lg:justify-start mb-6">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative w-10 h-10 flex items-center justify-center">
                <svg viewBox="0 0 100 100" className="w-10 h-10 drop-shadow-[0_0_8px_rgba(137,147,190,0.45)]">
                  <defs>
                    <linearGradient id="phpGrad" x1="0%" y1="0%" x2="0%" y2="100%">
                      <stop offset="0%" stopColor="#8993BE" />
                      <stop offset="100%" stopColor="#4F5B93" />
                    </linearGradient>
                  </defs>
                  <ellipse cx="50" cy="50" rx="44" ry="28" fill="url(#phpGrad)" stroke="#8993BE" strokeWidth="1.5" />
                  <text
                    x="50" y="60"
                    fontFamily="Inter,system-ui,sans-serif"
                    fontSize="26"
                    fontWeight="900"
                    fill="#ffffff"
                    textAnchor="middle"
                  >
                    php
                  </text>
                </svg>
              </div>
              <div>
                <h2 className="text-base font-bold mt-0 mb-0 pb-0 border-0 leading-tight text-white before:content-none">
                  PHP
                </h2>
                <p className="text-[10px] text-[#7c8497] font-mono uppercase tracking-wider">
                  Manual Definitivo
                </p>
              </div>
            </Link>
            <button
              className="lg:hidden p-2 text-[#7c8497] hover:text-white"
              onClick={() => setIsOpen(false)}
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="mb-5 px-2.5 py-2 rounded bg-[#0d1117] border border-[hsl(220_12%_14%)] font-mono text-[11px] flex items-center gap-1.5">
            <Search className="w-3 h-3 text-[#5fff87]" />
            <span className="text-[#5fff87]">$</span>
            <span className="text-[#7c8497]">php --manual</span>
            <span className="ml-auto text-[10px] text-[#5c6370]">⌘K</span>
          </div>

          <nav className="space-y-5">
            {NAVIGATION.map((section, idx) => (
              <div key={idx}>
                <h4 className="text-[10px] font-bold text-[#8993BE] uppercase tracking-[0.15em] mb-2 px-2 font-mono before:content-none">
                  {section.title}
                </h4>
                <ul className="space-y-0.5">
                  {section.items.map((item, i) => {
                    const isActive = location === item.path;
                    const Icon = item.icon;
                    return (
                      <li key={i}>
                        <Link
                          href={item.path}
                          onClick={() => setIsOpen(false)}
                          className={cn(
                            "flex items-center gap-2.5 px-2.5 py-1.5 rounded text-[13px] transition-all duration-150 group relative",
                            isActive
                              ? "bg-[#8993BE]/15 text-[#B0B7D6] font-medium border-l-2 border-[#8993BE] -ml-[2px] pl-[14px]"
                              : "text-[#9aa3b2] hover:bg-white/[0.03] hover:text-white"
                          )}
                        >
                          <Icon
                            className={cn(
                              "w-3.5 h-3.5 shrink-0 transition-transform group-hover:scale-110",
                              isActive ? "text-[#8993BE]" : "opacity-60"
                            )}
                          />
                          <span className="truncate">{item.label}</span>
                          {isActive && <ChevronRight className="w-3 h-3 ml-auto text-[#8993BE]" />}
                        </Link>
                      </li>
                    );
                  })}
                </ul>
              </div>
            ))}
          </nav>

          <div className="mt-8 pt-4 border-t border-[hsl(220_12%_14%)]">
            <a
              href="https://www.php.net"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-2 py-1.5 text-[11px] text-[#5c6370] hover:text-[#8993BE] transition-colors font-mono border-0"
            >
              <GitBranch className="w-3 h-3" />
              php.net →
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
