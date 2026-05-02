import { ReactNode } from "react";

interface FlagItem {
  flag: string;
  long?: string;
  description: ReactNode;
  example?: string;
}

interface CommandFlagListProps {
  command: string;
  items: FlagItem[];
}

/**
 * CommandFlagList — displays a documentation table of every flag/option
 * for a given command, in a terminal-style layout.
 */
export function CommandFlagList({ command, items }: CommandFlagListProps) {
  return (
    <div className="my-6 rounded-lg border border-[hsl(220_12%_18%)] bg-[#0d1117] overflow-hidden">
      <div className="px-4 py-2.5 bg-gradient-to-b from-[#161a21] to-[#11141a] border-b border-[hsl(220_12%_18%)] flex items-center gap-2">
        <span className="text-[#5fff87] font-mono text-xs">$</span>
        <span className="font-mono text-sm text-[#8993BE] font-semibold">{command}</span>
        <span className="text-xs text-[#7c8497] font-mono ml-auto">flags &amp; opções</span>
      </div>
      <div className="divide-y divide-[hsl(220_12%_14%)]">
        {items.map((item, i) => (
          <div key={i} className="grid grid-cols-1 md:grid-cols-[180px_1fr] gap-4 px-4 py-3.5 hover:bg-white/[0.015] transition-colors">
            <div className="flex flex-col gap-0.5 min-w-0">
              <code className="font-mono text-sm text-[#8993BE] font-semibold bg-transparent border-0 p-0">
                {item.flag}
              </code>
              {item.long && (
                <code className="font-mono text-[11px] text-[#7c8497] bg-transparent border-0 p-0">
                  {item.long}
                </code>
              )}
            </div>
            <div className="text-sm text-[#cbd1dc] leading-relaxed">
              {item.description}
              {item.example && (
                <div className="mt-2 px-3 py-1.5 rounded bg-[#080a0e] border border-[hsl(220_12%_16%)] font-mono text-[12px] text-[#9aa3b2]">
                  <span className="text-[#5fff87] mr-2">$</span>
                  {item.example}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
