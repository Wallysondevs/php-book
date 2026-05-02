import { useState, useEffect, lazy, Suspense } from "react";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { useHashLocation } from "wouter/use-hash-location";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import { Sidebar } from "@/components/layout/Sidebar";
import { Header } from "@/components/layout/Header";
import Home from "@/pages/Home";

// All chapter pages are lazy-loaded → each becomes its own chunk.
// Initial bundle only ships Home + shared components.

// 1. Introdução
const Historia = lazy(() => import("@/pages/Historia"));
const PorQuePhp = lazy(() => import("@/pages/PorQuePhp"));
const Versoes = lazy(() => import("@/pages/Versoes"));

// 2. Instalação
const Instalacao = lazy(() => import("@/pages/Instalacao"));
const PhpCli = lazy(() => import("@/pages/PhpCli"));
const ServidorEmbutido = lazy(() => import("@/pages/ServidorEmbutido"));

// 3. Sintaxe
const Sintaxe = lazy(() => import("@/pages/Sintaxe"));
const Variaveis = lazy(() => import("@/pages/Variaveis"));
const Tipos = lazy(() => import("@/pages/Tipos"));
const Operadores = lazy(() => import("@/pages/Operadores"));

// 4. Strings & Arrays
const Strings = lazy(() => import("@/pages/Strings"));
const Arrays = lazy(() => import("@/pages/Arrays"));
const ArrayFunctions = lazy(() => import("@/pages/ArrayFunctions"));

// 5. Controle de Fluxo
const IfElse = lazy(() => import("@/pages/IfElse"));
const SwitchMatch = lazy(() => import("@/pages/SwitchMatch"));
const Loops = lazy(() => import("@/pages/Loops"));

// 6. Funções
const Funcoes = lazy(() => import("@/pages/Funcoes"));
const TypeHints = lazy(() => import("@/pages/TypeHints"));
const ArrowFunctions = lazy(() => import("@/pages/ArrowFunctions"));
const Argumentos = lazy(() => import("@/pages/Argumentos"));

// 7. POO
const Classes = lazy(() => import("@/pages/Classes"));
const Visibilidade = lazy(() => import("@/pages/Visibilidade"));
const Heranca = lazy(() => import("@/pages/Heranca"));
const Interfaces = lazy(() => import("@/pages/Interfaces"));
const Traits = lazy(() => import("@/pages/Traits"));
const Abstract = lazy(() => import("@/pages/Abstract"));

// 8. PHP Moderno
const Enums = lazy(() => import("@/pages/Enums"));
const Attributes = lazy(() => import("@/pages/Attributes"));
const ReadonlyPromotion = lazy(() => import("@/pages/ReadonlyPromotion"));
const Nullsafe = lazy(() => import("@/pages/Nullsafe"));

// 9. Erros
const Exceptions = lazy(() => import("@/pages/Exceptions"));
const CustomExceptions = lazy(() => import("@/pages/CustomExceptions"));

// 10. Namespaces & Composer
const Namespaces = lazy(() => import("@/pages/Namespaces"));
const Composer = lazy(() => import("@/pages/Composer"));
const Autoload = lazy(() => import("@/pages/Autoload"));

// 11. Web & DB
const Forms = lazy(() => import("@/pages/Forms"));
const Sessoes = lazy(() => import("@/pages/Sessoes"));
const Json = lazy(() => import("@/pages/Json"));
const Pdo = lazy(() => import("@/pages/Pdo"));
const Prepared = lazy(() => import("@/pages/Prepared"));

// 12. Datas & Tempo
const Datas = lazy(() => import("@/pages/Datas"));
const DatetimeImutavel = lazy(() => import("@/pages/DatetimeImutavel"));
const Timezones = lazy(() => import("@/pages/Timezones"));

// 13. Regex
const RegexBasico = lazy(() => import("@/pages/RegexBasico"));
const RegexAvancado = lazy(() => import("@/pages/RegexAvancado"));

// 14. Arquivos & I/O
const Arquivos = lazy(() => import("@/pages/Arquivos"));
const Diretorios = lazy(() => import("@/pages/Diretorios"));
const Streams = lazy(() => import("@/pages/Streams"));
const Uploads = lazy(() => import("@/pages/Uploads"));

// 15. SPL & Iteradores
const SplEstruturas = lazy(() => import("@/pages/SplEstruturas"));
const Iteradores = lazy(() => import("@/pages/Iteradores"));
const Generators = lazy(() => import("@/pages/Generators"));

// 16. Reflection & Meta
const Reflection = lazy(() => import("@/pages/Reflection"));
const ClosuresAvancadas = lazy(() => import("@/pages/ClosuresAvancadas"));

// 17. Async & Fibers
const Fibers = lazy(() => import("@/pages/Fibers"));
const Reactphp = lazy(() => import("@/pages/Reactphp"));

// 18. Testes
const Phpunit = lazy(() => import("@/pages/Phpunit"));
const Pest = lazy(() => import("@/pages/Pest"));
const Mocks = lazy(() => import("@/pages/Mocks"));
const Tdd = lazy(() => import("@/pages/Tdd"));

// 19. Qualidade
const Phpstan = lazy(() => import("@/pages/Phpstan"));
const PhpCsFixer = lazy(() => import("@/pages/PhpCsFixer"));
const Rector = lazy(() => import("@/pages/Rector"));

// 20. PSR
const Psr3Logger = lazy(() => import("@/pages/Psr3Logger"));
const Psr7Http = lazy(() => import("@/pages/Psr7Http"));
const Psr11Container = lazy(() => import("@/pages/Psr11Container"));
const Psr15Middleware = lazy(() => import("@/pages/Psr15Middleware"));

// 21. HTTP Cliente
const Curl = lazy(() => import("@/pages/Curl"));
const Guzzle = lazy(() => import("@/pages/Guzzle"));
const Webhooks = lazy(() => import("@/pages/Webhooks"));

// 22. Banco Avançado
const DoctrineDbal = lazy(() => import("@/pages/DoctrineDbal"));
const Migrations = lazy(() => import("@/pages/Migrations"));
const Transacoes = lazy(() => import("@/pages/Transacoes"));

// 23. Cache & Filas
const Redis = lazy(() => import("@/pages/Redis"));
const Memcached = lazy(() => import("@/pages/Memcached"));
const Filas = lazy(() => import("@/pages/Filas"));

// 24. Segurança
const PasswordHash = lazy(() => import("@/pages/PasswordHash"));
const CsrfXss = lazy(() => import("@/pages/CsrfXss"));
const Jwt = lazy(() => import("@/pages/Jwt"));
const SecurityHeaders = lazy(() => import("@/pages/SecurityHeaders"));

// 25. APIs REST
const RestDesign = lazy(() => import("@/pages/RestDesign"));
const Openapi = lazy(() => import("@/pages/Openapi"));
const Cors = lazy(() => import("@/pages/Cors"));

// 26. Performance
const Opcache = lazy(() => import("@/pages/Opcache"));
const Profiling = lazy(() => import("@/pages/Profiling"));
const Otimizacoes = lazy(() => import("@/pages/Otimizacoes"));

// 27. Deploy
const NginxFpm = lazy(() => import("@/pages/NginxFpm"));
const Docker = lazy(() => import("@/pages/Docker"));
const CiCd = lazy(() => import("@/pages/CiCd"));
const Producao = lazy(() => import("@/pages/Producao"));

const NotFound = lazy(() => import("@/pages/not-found"));

const queryClient = new QueryClient();

function ChapterFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="font-mono text-sm text-[#7c8497] flex items-center gap-3">
        <span className="inline-block w-2 h-4 bg-[#8993BE] animate-pulse" />
        carregando capítulo…
      </div>
    </div>
  );
}

function Layout({ children }: { children: React.ReactNode }) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [location] = useHashLocation();
  useEffect(() => {
    setIsSidebarOpen(false);
    window.scrollTo(0, 0);
  }, [location]);

  return (
    <div className="min-h-screen bg-background text-foreground flex">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="flex-1 lg:pl-72 flex flex-col min-w-0 transition-all duration-300">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1">{children}</main>
      </div>
    </div>
  );
}

function Router() {
  return (
    <Layout>
      <Suspense fallback={<ChapterFallback />}>
        <Switch>
          <Route path="/" component={Home} />

          <Route path="/historia" component={Historia} />
          <Route path="/por-que-php" component={PorQuePhp} />
          <Route path="/versoes" component={Versoes} />

          <Route path="/instalacao" component={Instalacao} />
          <Route path="/php-cli" component={PhpCli} />
          <Route path="/servidor-embutido" component={ServidorEmbutido} />

          <Route path="/sintaxe" component={Sintaxe} />
          <Route path="/variaveis" component={Variaveis} />
          <Route path="/tipos" component={Tipos} />
          <Route path="/operadores" component={Operadores} />

          <Route path="/strings" component={Strings} />
          <Route path="/arrays" component={Arrays} />
          <Route path="/array-functions" component={ArrayFunctions} />

          <Route path="/if-else" component={IfElse} />
          <Route path="/switch-match" component={SwitchMatch} />
          <Route path="/loops" component={Loops} />

          <Route path="/funcoes" component={Funcoes} />
          <Route path="/type-hints" component={TypeHints} />
          <Route path="/arrow-functions" component={ArrowFunctions} />
          <Route path="/argumentos" component={Argumentos} />

          <Route path="/classes" component={Classes} />
          <Route path="/visibilidade" component={Visibilidade} />
          <Route path="/heranca" component={Heranca} />
          <Route path="/interfaces" component={Interfaces} />
          <Route path="/traits" component={Traits} />
          <Route path="/abstract" component={Abstract} />

          <Route path="/enums" component={Enums} />
          <Route path="/attributes" component={Attributes} />
          <Route path="/readonly-promotion" component={ReadonlyPromotion} />
          <Route path="/nullsafe" component={Nullsafe} />

          <Route path="/exceptions" component={Exceptions} />
          <Route path="/custom-exceptions" component={CustomExceptions} />

          <Route path="/namespaces" component={Namespaces} />
          <Route path="/composer" component={Composer} />
          <Route path="/autoload" component={Autoload} />

          <Route path="/forms" component={Forms} />
          <Route path="/sessoes" component={Sessoes} />
          <Route path="/json" component={Json} />
          <Route path="/pdo" component={Pdo} />
          <Route path="/prepared" component={Prepared} />

          <Route path="/datas" component={Datas} />
          <Route path="/datetime-imutavel" component={DatetimeImutavel} />
          <Route path="/timezones" component={Timezones} />

          <Route path="/regex-basico" component={RegexBasico} />
          <Route path="/regex-avancado" component={RegexAvancado} />

          <Route path="/arquivos" component={Arquivos} />
          <Route path="/diretorios" component={Diretorios} />
          <Route path="/streams" component={Streams} />
          <Route path="/uploads" component={Uploads} />

          <Route path="/spl-estruturas" component={SplEstruturas} />
          <Route path="/iteradores" component={Iteradores} />
          <Route path="/generators" component={Generators} />

          <Route path="/reflection" component={Reflection} />
          <Route path="/closures-avancadas" component={ClosuresAvancadas} />

          <Route path="/fibers" component={Fibers} />
          <Route path="/reactphp" component={Reactphp} />

          <Route path="/phpunit" component={Phpunit} />
          <Route path="/pest" component={Pest} />
          <Route path="/mocks" component={Mocks} />
          <Route path="/tdd" component={Tdd} />

          <Route path="/phpstan" component={Phpstan} />
          <Route path="/php-cs-fixer" component={PhpCsFixer} />
          <Route path="/rector" component={Rector} />

          <Route path="/psr3-logger" component={Psr3Logger} />
          <Route path="/psr7-http" component={Psr7Http} />
          <Route path="/psr11-container" component={Psr11Container} />
          <Route path="/psr15-middleware" component={Psr15Middleware} />

          <Route path="/curl" component={Curl} />
          <Route path="/guzzle" component={Guzzle} />
          <Route path="/webhooks" component={Webhooks} />

          <Route path="/doctrine-dbal" component={DoctrineDbal} />
          <Route path="/migrations" component={Migrations} />
          <Route path="/transacoes" component={Transacoes} />

          <Route path="/redis" component={Redis} />
          <Route path="/memcached" component={Memcached} />
          <Route path="/filas" component={Filas} />

          <Route path="/password-hash" component={PasswordHash} />
          <Route path="/csrf-xss" component={CsrfXss} />
          <Route path="/jwt" component={Jwt} />
          <Route path="/security-headers" component={SecurityHeaders} />

          <Route path="/rest-design" component={RestDesign} />
          <Route path="/openapi" component={Openapi} />
          <Route path="/cors" component={Cors} />

          <Route path="/opcache" component={Opcache} />
          <Route path="/profiling" component={Profiling} />
          <Route path="/otimizacoes" component={Otimizacoes} />

          <Route path="/nginx-fpm" component={NginxFpm} />
          <Route path="/docker" component={Docker} />
          <Route path="/ci-cd" component={CiCd} />
          <Route path="/producao" component={Producao} />

          <Route component={NotFound} />
        </Switch>
      </Suspense>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <WouterRouter hook={useHashLocation}>
        <Router />
      </WouterRouter>
    </QueryClientProvider>
  );
}

export default App;
