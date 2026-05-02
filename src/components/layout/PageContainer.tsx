import { ReactNode, useEffect, useState } from "react";
import { DifficultyBadge } from "../ui/DifficultyBadge";
import { motion } from "framer-motion";
import { Clock } from "lucide-react";

interface PageContainerProps {
  title: string;
  subtitle?: string;
  difficulty?: "iniciante" | "intermediario" | "avancado";
  timeToRead?: string;
  category?: string;
  children: ReactNode;
}

export function PageContainer({
  title,
  subtitle,
  difficulty,
  timeToRead,
  category,
  children,
}: PageContainerProps) {
  const [scrollProgress, setScrollProgress] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      const totalScroll = document.documentElement.scrollTop;
      const windowHeight =
        document.documentElement.scrollHeight - document.documentElement.clientHeight;
      const scroll = windowHeight > 0 ? totalScroll / windowHeight : 0;
      setScrollProgress(scroll);
    };

    window.addEventListener("scroll", handleScroll);
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 lg:px-8 pb-32 arch-scroll">
      <div className="fixed top-0 left-0 right-0 h-[2px] z-50 bg-[hsl(220_12%_14%)]/40 pointer-events-none">
        <div
          className="h-full bg-gradient-to-r from-[#8993BE] via-[#B0B7D6] to-[#8993BE] transition-[width] duration-150 ease-out shadow-[0_0_8px_rgba(137,147,190,0.6)]"
          style={{ width: `${scrollProgress * 100}%` }}
        />
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
      >
        {category && (
          <div className="text-[11px] font-mono text-[#8993BE] uppercase tracking-[0.2em] mb-3 flex items-center gap-2">
            <span className="text-[#5fff87]">$</span>
            <span>cd /docs/{category.toLowerCase().replace(/\s+/g, "-")}</span>
          </div>
        )}

        <header className="mb-10 pb-8 border-b border-[hsl(220_12%_14%)]">
          <div className="flex flex-wrap items-center gap-3 mb-5">
            {difficulty && <DifficultyBadge level={difficulty} />}
            {timeToRead && (
              <span className="text-xs text-[#7c8497] font-mono flex items-center gap-1.5 px-2.5 py-1 rounded border border-[hsl(220_12%_18%)] bg-[#0d1117]">
                <Clock className="w-3 h-3" />
                {timeToRead}
              </span>
            )}
          </div>
          <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-white mb-4 before:content-none">
            {title}
          </h1>
          {subtitle && (
            <p className="text-lg text-[#9aa3b2] leading-relaxed max-w-3xl">
              {subtitle}
            </p>
          )}
        </header>

        <div className="prose prose-invert max-w-none arch-content">{children}</div>
      </motion.div>

      <div className="mt-16 pt-6 border-t border-[hsl(220_12%_14%)] flex items-center justify-between text-xs font-mono text-[#5c6370]">
        <span>
          <span className="text-[#5fff87]">$</span> echo &quot;EOF&quot;<span className="text-[#8993BE]">;</span>
        </span>
        <span className="opacity-60">php-book v1.0</span>
      </div>
    </div>
  );
}
