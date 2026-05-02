import { Menu, Search, Moon, Sun, Github } from "lucide-react";
import { useTheme } from "@/hooks/use-theme";

interface HeaderProps {
  onMenuClick: () => void;
}

export function Header({ onMenuClick }: HeaderProps) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="sticky top-0 z-30 w-full glass-panel border-b border-[hsl(220_12%_18%)] px-4 sm:px-6 h-14 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <button
          onClick={onMenuClick}
          aria-label="Abrir menu de navegação"
          className="lg:hidden p-2 -ml-2 rounded-md text-[#9aa3b2] hover:text-white hover:bg-white/5 transition-colors"
        >
          <Menu className="w-5 h-5" aria-hidden="true" />
        </button>

        <div
          role="presentation"
          aria-hidden="true"
          className="hidden sm:flex items-center gap-2 px-3 py-1.5 bg-[#0d1117] border border-[hsl(220_12%_18%)] rounded text-xs font-mono text-[#7c8497] w-72 select-none"
        >
          <Search className="w-3.5 h-3.5 text-[#5fff87]" />
          <span className="text-[#5fff87]">$</span>
          <span>php --manual — use a barra lateral</span>
          <span className="ml-auto text-[10px] opacity-60 border border-[hsl(220_12%_22%)] rounded px-1.5 py-0.5">
            v1.0
          </span>
        </div>
      </div>

      <div className="flex items-center gap-1.5">
        <a
          href="https://www.php.net/manual/pt_BR"
          target="_blank"
          rel="noopener noreferrer"
          className="hidden sm:flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-[#9aa3b2] hover:text-[#8993BE] hover:bg-white/5 rounded transition-colors border-0"
        >
          PHP Manual →
        </a>
        <a
          href="https://github.com/Wallysondevs"
          target="_blank"
          rel="noopener noreferrer"
          aria-label="GitHub do autor"
          className="p-2 rounded text-[#9aa3b2] hover:text-white hover:bg-white/5 transition-colors border-0"
          title="GitHub"
        >
          <Github className="w-4 h-4" aria-hidden="true" />
        </a>
        <button
          onClick={toggleTheme}
          aria-label={theme === "dark" ? "Mudar para tema claro" : "Mudar para tema escuro"}
          className="p-2 rounded text-[#9aa3b2] hover:text-white hover:bg-white/5 transition-colors"
          title="Alternar tema"
        >
          {theme === "dark" ? <Sun className="w-4 h-4" aria-hidden="true" /> : <Moon className="w-4 h-4" aria-hidden="true" />}
        </button>
      </div>
    </header>
  );
}
