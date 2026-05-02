import { ReactNode } from "react";

interface OutputBlockProps {
  /** The literal stdout the user would see. Supports inline tokens: {g}{/} etc. */
  output: string;
  /**
   * Optional annotations explaining specific lines/columns.
   * Each entry highlights a line index (0-based) or column.
   */
  annotations?: { line: number; note: string }[];
  title?: string;
  caption?: ReactNode;
}

/**
 * OutputBlock — shows a raw terminal output (no prompt) with optional
 * line annotations on the right side, mimicking annotated documentation.
 */
export function OutputBlock({ output, annotations = [], title, caption }: OutputBlockProps) {
  const lines = output.split("\n");
  const annotMap = new Map(annotations.map((a) => [a.line, a.note]));

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-[hsl(220_12%_18%)] shadow-[0_8px_30px_rgba(0,0,0,0.4)] bg-[#0a0d11]">
      {title && (
        <div className="px-3 py-2 bg-gradient-to-b from-[#161a21] to-[#11141a] border-b border-[hsl(220_12%_18%)]">
          <span className="text-[11px] font-mono text-[#8993BE]">⮕ {title}</span>
        </div>
      )}
      <div className="terminal-scroll overflow-x-auto bg-[#0a0d11] p-4 text-[13px] leading-[1.55] font-mono">
        {lines.map((line, i) => {
          const note = annotMap.get(i);
          return (
            <div key={i} className="grid grid-cols-[1fr_auto] gap-4 items-start">
              <pre className="whitespace-pre text-[#d4d8e0] m-0 font-mono">{tokenize(line) || "\u00A0"}</pre>
              {note && (
                <div className="text-[11px] text-[#8993BE] font-mono italic shrink-0 max-w-[260px] text-right">
                  ← {note}
                </div>
              )}
            </div>
          );
        })}
      </div>
      {caption && (
        <div className="px-4 py-2 text-xs text-[#7c8497] border-t border-[hsl(220_12%_18%)] bg-[#0d1117] italic">
          {caption}
        </div>
      )}
    </div>
  );
}

function tokenize(text: string): ReactNode {
  const parts = text.split(/(\{\/\}|\{[gyrbcmw]\}|\{dim\}|\{bold\})/g);
  const out: ReactNode[] = [];
  let cls: string | null = null;
  let key = 0;
  for (const tok of parts) {
    if (tok === "{/}") { cls = null; continue; }
    if (tok === "{g}") { cls = "text-[#5fff87]"; continue; }
    if (tok === "{y}") { cls = "text-[#ffd75f]"; continue; }
    if (tok === "{r}") { cls = "text-[#ff5f5f]"; continue; }
    if (tok === "{b}") { cls = "text-[#9CA4C9]"; continue; }
    if (tok === "{c}") { cls = "text-[#5fffff]"; continue; }
    if (tok === "{m}") { cls = "text-[#ff87ff]"; continue; }
    if (tok === "{w}") { cls = "text-white"; continue; }
    if (tok === "{dim}") { cls = "text-[#6c7086]"; continue; }
    if (tok === "{bold}") { cls = "font-bold text-white"; continue; }
    if (!tok) continue;
    out.push(cls ? <span key={key++} className={cls}>{tok}</span> : <span key={key++}>{tok}</span>);
  }
  return out;
}
