import { Link } from "wouter";
import { Home as HomeIcon, FileQuestion } from "lucide-react";

export default function NotFound() {
  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4">
      <div className="max-w-md w-full text-center">
        <div className="inline-flex w-20 h-20 items-center justify-center rounded-full bg-[#8993BE]/10 border border-[#8993BE]/30 mb-6">
          <FileQuestion className="w-10 h-10 text-[#8993BE]" />
        </div>
        <div className="font-mono text-xs text-[#7c8497] uppercase tracking-[0.2em] mb-3">
          <span className="text-[#5fff87]">$</span> php -r "echo 404;"
        </div>
        <h1 className="text-5xl font-black text-white mb-3">404 — Not Found</h1>
        <p className="text-[#9aa3b2] mb-8 font-mono text-sm">
          <span className="text-[#ff5f5f]">PHP Fatal error:</span> rota inexistente neste manual.
        </p>
        <Link
          href="/"
          className="inline-flex items-center gap-2 px-5 py-3 rounded-md bg-[#8993BE] text-white font-semibold hover:bg-[#9CA4C9] transition-colors"
        >
          <HomeIcon className="w-4 h-4" />
          Voltar ao início
        </Link>
      </div>
    </div>
  );
}
