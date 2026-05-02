import { useState } from "react";
import { Check, Copy, FileCode } from "lucide-react";
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter";
import { vscDarkPlus } from "react-syntax-highlighter/dist/esm/styles/prism";

interface PhpBlockProps {
  code: string;
  filename?: string;
  output?: string;
  showLineNumbers?: boolean;
  language?: string;
}

/**
 * PhpBlock — renders a PHP source file with syntax highlighting + optional output panel.
 * Designed to look like a code editor file tab on top + (optional) terminal output below.
 */
export function PhpBlock({
  code,
  filename = "script.php",
  output,
  showLineNumbers = true,
  language = "php",
}: PhpBlockProps) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(code.trim());
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-[hsl(220_12%_18%)] shadow-[0_8px_30px_rgba(0,0,0,0.4)] bg-[#0a0d11]">
      {/* Editor tab */}
      <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-b from-[#1d2030] to-[#171a26] border-b border-[hsl(232_18%_22%)]">
        <div className="flex items-center gap-2 min-w-0">
          <div className="flex gap-1.5 shrink-0">
            <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
            <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
            <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
          </div>
          <FileCode className="w-3.5 h-3.5 text-[#8993BE] ml-2 shrink-0" />
          <span className="text-[11px] font-mono text-[#cbd1dc] truncate">{filename}</span>
          <span className="text-[10px] font-mono text-[#7c8497] uppercase tracking-wider ml-2 shrink-0">{language}</span>
        </div>
        <button
          onClick={handleCopy}
          className="p-1.5 rounded text-[#7c8497] hover:text-white hover:bg-white/5 transition-colors shrink-0"
          title="Copiar código"
          aria-label="Copiar código"
        >
          {copied ? (
            <Check className="w-3.5 h-3.5 text-[#27c93f]" />
          ) : (
            <Copy className="w-3.5 h-3.5" />
          )}
        </button>
      </div>

      {/* Code */}
      <div className="p-4 text-[13px] font-mono overflow-x-auto bg-[#0a0d11]">
        <SyntaxHighlighter
          language={language}
          style={vscDarkPlus}
          showLineNumbers={showLineNumbers}
          customStyle={{
            margin: 0,
            padding: 0,
            background: "transparent",
            fontSize: "13px",
            lineHeight: "1.55",
          }}
          lineNumberStyle={{ color: "#3c4252", paddingRight: "1em", minWidth: "2.25em" }}
          wrapLines
        >
          {code.trim()}
        </SyntaxHighlighter>
      </div>

      {/* Optional output panel */}
      {output && (
        <>
          <div className="px-3 py-1.5 bg-[#11141a] border-y border-[hsl(220_12%_18%)] text-[10px] font-mono text-[#8993BE] uppercase tracking-[0.15em] flex items-center gap-2">
            <span className="text-[#5fff87]">→</span> saída
          </div>
          <pre className="terminal-scroll p-4 text-[12.5px] leading-[1.6] font-mono text-[#d4d8e0] overflow-x-auto bg-[#080a0e] m-0 whitespace-pre-wrap">
            {output.trim()}
          </pre>
        </>
      )}
    </div>
  );
}
