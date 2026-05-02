import { useState, useMemo, ReactNode } from "react";
import { Check, Copy, Terminal as TerminalIcon } from "lucide-react";

type TerminalLine =
  | { type: "command"; prompt?: string; text: string; comment?: string }
  | { type: "output"; text: string }
  | { type: "comment"; text: string }
  | { type: "error"; text: string };

interface TerminalBlockProps {
  command?: string;
  output?: string;
  prompt?: string;
  exitCode?: number;
  comment?: string;
  title?: string;
  host?: string;
  user?: string;
  cwd?: string;
  showHeader?: boolean;
  children?: ReactNode;
  lines?: TerminalLine[];
}

/**
 * TerminalBlock — renders an authentic Arch-style terminal session.
 *
 * Two ways to use:
 *   <TerminalBlock command="ls -la" output="total 24\ndrwxr-xr-x ..." />
 *   <TerminalBlock lines={[{type:"command", text:"pacman -Syu"}, {type:"output", text:"..."}]} />
 *
 * Output text supports inline ANSI-ish coloring tokens:
 *   {g}green{/}  {y}yellow{/}  {r}red{/}  {b}blue{/}  {c}cyan{/}  {m}magenta{/}  {w}white{/}
 *   {dim}grey{/} {bold}bold{/}
 */
export function TerminalBlock({
  command,
  output,
  prompt,
  exitCode,
  comment,
  title,
  host = "php",
  user = "user",
  cwd = "~",
  showHeader = true,
  lines,
}: TerminalBlockProps) {
  const [copied, setCopied] = useState(false);

  const promptStr =
    prompt ?? (
      // We render the prompt with its own coloring below; the raw string is for copy.
      `[${user}@${host} ${cwd}]$ `
    );

  const allLines: TerminalLine[] = useMemo(() => {
    if (lines && lines.length) return lines;
    const out: TerminalLine[] = [];
    if (comment) out.push({ type: "comment", text: comment });
    if (command) out.push({ type: "command", text: command });
    if (output) out.push({ type: "output", text: output });
    return out;
  }, [lines, command, output, comment]);

  const copyText = useMemo(() => {
    return allLines
      .map((l) => {
        if (l.type === "command") return `${l.prompt ?? promptStr}${l.text}`;
        if (l.type === "comment") return `# ${l.text}`;
        return l.text;
      })
      .join("\n");
  }, [allLines, promptStr]);

  const handleCopy = () => {
    navigator.clipboard.writeText(copyText);
    setCopied(true);
    setTimeout(() => setCopied(false), 1800);
  };

  return (
    <div className="my-6 rounded-lg overflow-hidden border border-[hsl(220_12%_18%)] shadow-[0_8px_30px_rgba(0,0,0,0.4),inset_0_1px_0_rgba(255,255,255,0.04)] bg-[#0a0d11]">
      {showHeader && (
        <div className="flex items-center justify-between px-3 py-2 bg-gradient-to-b from-[#161a21] to-[#11141a] border-b border-[hsl(220_12%_18%)]">
          <div className="flex items-center gap-2 min-w-0">
            <div className="flex gap-1.5 shrink-0">
              <span className="w-3 h-3 rounded-full bg-[#ff5f56] shadow-[inset_0_0_2px_rgba(0,0,0,0.4)]" />
              <span className="w-3 h-3 rounded-full bg-[#ffbd2e] shadow-[inset_0_0_2px_rgba(0,0,0,0.4)]" />
              <span className="w-3 h-3 rounded-full bg-[#27c93f] shadow-[inset_0_0_2px_rgba(0,0,0,0.4)]" />
            </div>
            <TerminalIcon className="w-3.5 h-3.5 text-[#8993BE] ml-2 shrink-0" />
            <span className="text-[11px] font-mono text-[#9aa3b2] truncate">
              {title ?? `${user}@${host}: ${cwd}`}
            </span>
          </div>
          <button
            onClick={handleCopy}
            className="p-1.5 rounded text-[#7c8497] hover:text-white hover:bg-white/5 transition-colors shrink-0"
            title="Copiar"
            aria-label="Copiar comando"
          >
            {copied ? (
              <Check className="w-3.5 h-3.5 text-[#27c93f]" />
            ) : (
              <Copy className="w-3.5 h-3.5" />
            )}
          </button>
        </div>
      )}

      <div className="terminal-scroll p-4 text-[13px] leading-[1.55] font-mono overflow-x-auto bg-[#0a0d11]">
        {allLines.map((line, i) => (
          <TerminalLineView key={i} line={line} promptStr={promptStr} user={user} host={host} cwd={cwd} />
        ))}
        {typeof exitCode === "number" && exitCode !== 0 && (
          <div className="mt-2 text-[#ff7373]">
            <span className="opacity-60">exit code:</span> {exitCode}
          </div>
        )}
      </div>
    </div>
  );
}

function TerminalLineView({
  line,
  promptStr,
  user,
  host,
  cwd,
}: {
  line: TerminalLine;
  promptStr: string;
  user: string;
  host: string;
  cwd: string;
}) {
  if (line.type === "comment") {
    return (
      <div className="text-[#6c7086] italic">
        <span className="opacity-70"># </span>
        {line.text}
      </div>
    );
  }
  if (line.type === "error") {
    return <pre className="whitespace-pre-wrap text-[#ff7373] m-0">{ansi(line.text)}</pre>;
  }
  if (line.type === "command") {
    return (
      <div className="text-[#e4e4e4]">
        {line.prompt ? (
          <span className="text-[#5fff87] select-none">{line.prompt}</span>
        ) : (
          <ColoredPrompt user={user} host={host} cwd={cwd} />
        )}
        <span className="text-[#e4e4e4]">{line.text}</span>
        {line.comment && (
          <span className="text-[#6c7086] italic ml-3"># {line.comment}</span>
        )}
      </div>
    );
  }
  // output
  return (
    <pre className="whitespace-pre-wrap text-[#d4d8e0] m-0 font-mono">
      {ansi(line.text)}
    </pre>
  );
}

function ColoredPrompt({ user, host, cwd }: { user: string; host: string; cwd: string }) {
  return (
    <span className="select-none">
      <span className="text-[#7c8497]">[</span>
      <span className="text-[#5fff87] font-semibold">{user}</span>
      <span className="text-[#9aa3b2]">@</span>
      <span className="text-[#8993BE] font-semibold">{host}</span>{" "}
      <span className="text-[#9CA4C9]">{cwd}</span>
      <span className="text-[#7c8497]">]$ </span>
    </span>
  );
}

/**
 * Tiny inline-color tokenizer for output strings.
 * Tokens:  {g} {y} {r} {b} {c} {m} {w} {dim} {bold}  closed by {/}
 */
function ansi(text: string): ReactNode[] {
  const tokens = text.split(/(\{\/\}|\{[gyrbcmw]\}|\{dim\}|\{bold\})/g);
  const out: ReactNode[] = [];
  let cls: string | null = null;
  let key = 0;
  for (const tok of tokens) {
    if (tok === "{/}") {
      cls = null;
      continue;
    }
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
    if (cls) {
      out.push(<span key={key++} className={cls}>{tok}</span>);
    } else {
      out.push(<span key={key++}>{tok}</span>);
    }
  }
  return out;
}
