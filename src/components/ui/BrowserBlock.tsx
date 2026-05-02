import { ReactNode } from "react";
import { Globe, Lock } from "lucide-react";

interface BrowserBlockProps {
  url?: string;
  title?: string;
  children: ReactNode;
}

/**
 * BrowserBlock — fake browser chrome to show what a PHP page renders to the user.
 * Use for pages that produce HTML output.
 */
export function BrowserBlock({
  url = "http://localhost:8000",
  title = "Resultado no navegador",
  children,
}: BrowserBlockProps) {
  return (
    <div className="my-6 rounded-lg overflow-hidden border border-[hsl(220_12%_18%)] shadow-[0_8px_30px_rgba(0,0,0,0.4)] bg-[#0a0d11]">
      {/* Browser top bar */}
      <div className="bg-gradient-to-b from-[#1d2030] to-[#171a26] border-b border-[hsl(232_18%_22%)]">
        <div className="flex items-center px-3 py-2 gap-2">
          <div className="flex gap-1.5 shrink-0">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          <Globe className="w-3.5 h-3.5 text-[#8993BE] ml-2 shrink-0" />
          <span className="text-[11px] font-mono text-[#9aa3b2]">{title}</span>
        </div>
        {/* URL bar */}
        <div className="px-3 pb-2 flex items-center gap-2">
          <div className="flex-1 flex items-center gap-2 px-3 py-1.5 bg-[#0d1117] border border-[hsl(220_12%_18%)] rounded text-[11px] font-mono text-[#cbd1dc]">
            <Lock className="w-3 h-3 text-[#5fff87]" />
            <span className="truncate">{url}</span>
          </div>
        </div>
      </div>

      {/* Rendered content */}
      <div className="bg-white text-[#1a1a1a] p-6 text-sm leading-relaxed font-sans browser-content">
        {children}
      </div>
    </div>
  );
}
