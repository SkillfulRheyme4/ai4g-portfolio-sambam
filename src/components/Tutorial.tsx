import { useState } from "react";
import { useLanguage } from "../context/LanguageContext";

interface TutorialProps {
  onClose: () => void;
}

export function Tutorial({ onClose }: TutorialProps) {
  const { t } = useLanguage();
  const [page, setPage] = useState(0);
  const totalPages = t.tutorial.pages.length;

  const isLast = page === totalPages - 1;

  const handleStart = () => {
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/80 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl shadow-2xl max-w-lg w-full overflow-hidden animate-bounce-in">
        {/* Header with robot */}
        <div className="bg-gradient-to-br from-primary-400 to-primary-600 p-6 text-center relative overflow-hidden">
          <div className="absolute inset-0 opacity-20">
            <div className="absolute top-2 left-4 w-12 h-12 rounded-full bg-white" />
            <div className="absolute bottom-2 right-8 w-8 h-8 rounded-full bg-white" />
            <div className="absolute top-8 right-12 w-6 h-6 rounded-full bg-white" />
          </div>
          <div className="relative">
            <RobotMascot size={72} />
            <h2 className="text-2xl font-bold text-white mt-3">{t.tutorial.title}</h2>
          </div>
        </div>

        {/* Progress dots */}
        <div className="flex justify-center gap-2 pt-4 bg-white">
          {Array.from({ length: totalPages }).map((_, i) => (
            <div
              key={i}
              className={`h-2.5 rounded-full transition-all duration-300 ${
                i === page ? "w-8 bg-primary-500" : "w-2.5 bg-slate-300"
              }`}
            />
          ))}
        </div>

        {/* Content */}
        <div className="p-6 min-h-[180px]">
          <h3 className="text-xl font-bold text-slate-800 mb-2">{t.tutorial.pages[page].title}</h3>
          <p className="text-slate-600 leading-relaxed text-base">{t.tutorial.pages[page].body}</p>

          {/* Visual icons per page */}
          <div className="mt-4 flex justify-center">
            <PageVisual page={page} />
          </div>
        </div>

        {/* Footer buttons */}
        <div className="flex items-center justify-between p-4 bg-slate-50 border-t border-slate-200">
          <button
            onClick={() => (page === 0 ? onClose() : setPage(page - 1))}
            className="px-4 py-2.5 text-slate-500 font-medium hover:text-slate-700 transition-colors rounded-xl hover:bg-slate-200"
          >
            {page === 0 ? t.tutorial.skip : t.tutorial.back}
          </button>

          {isLast ? (
            <button
              onClick={handleStart}
              className="px-8 py-3 bg-success-500 hover:bg-success-600 text-white font-bold rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              {t.tutorial.start}
            </button>
          ) : (
            <button
              onClick={() => setPage(page + 1)}
              className="px-8 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-2xl shadow-lg transition-all hover:scale-105 active:scale-95"
            >
              {t.tutorial.next}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function PageVisual({ page }: { page: number }) {
  switch (page) {
    case 0:
      return (
        <div className="flex gap-4">
          <RobotMascot size={48} />
          <ArrowIcon />
          <StarIcon size={48} />
        </div>
      );
    case 1:
      return (
        <div className="flex gap-3 items-center">
          <div className="w-12 h-12 rounded-xl bg-success-400 flex items-center justify-center text-white font-bold">S</div>
          <div className="flex gap-1">
            {[0, 1, 2].map((i) => (
              <div key={i} className="w-8 h-12 rounded bg-slate-200" />
            ))}
          </div>
          <StarIcon size={40} />
        </div>
      );
    case 2:
      return (
        <div className="flex gap-3">
          <CommandIcon color="bg-blue-400" label="↑" />
          <CommandIcon color="bg-orange-400" label="↓" />
          <CommandIcon color="bg-green-400" label="↺" />
          <CommandIcon color="bg-purple-400" label="↻" />
        </div>
      );
    case 3:
      return (
        <div className="flex gap-3 items-center">
          <div className="px-3 py-2 bg-accent-100 text-accent-700 rounded-xl font-bold text-sm">Easy</div>
          <div className="text-slate-400">|</div>
          <div className="px-3 py-2 bg-slate-700 text-green-400 rounded-xl font-mono text-sm font-bold">code()</div>
        </div>
      );
    case 4:
      return (
        <div className="flex gap-2">
          <StarIcon size={36} filled />
          <StarIcon size={36} filled />
          <StarIcon size={36} filled />
        </div>
      );
    default:
      return null;
  }
}

function CommandIcon({ color, label }: { color: string; label: string }) {
  return (
    <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center text-white text-xl font-bold shadow-md`}>
      {label}
    </div>
  );
}

function ArrowIcon() {
  return (
    <svg width="32" height="48" viewBox="0 0 32 48" className="text-primary-400">
      <path d="M16 4 L16 40 M8 32 L16 44 L24 32" stroke="currentColor" strokeWidth="4" fill="none" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function StarIcon({ size = 24, filled = false }: { size?: number; filled?: boolean }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill={filled ? "#fbbf24" : "none"} stroke={filled ? "#f59e0b" : "#cbd5e1"} strokeWidth="2" strokeLinejoin="round">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
    </svg>
  );
}

export function RobotMascot({ size = 48 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className="drop-shadow-md">
      {/* antenna */}
      <line x1="32" y1="6" x2="32" y2="14" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="6" r="3" fill="#fbbf24" />
      {/* head */}
      <rect x="16" y="14" width="32" height="26" rx="8" fill="#e2e8f0" stroke="#64748b" strokeWidth="2" />
      {/* eyes */}
      <circle cx="24" cy="27" r="5" fill="#1e293b" />
      <circle cx="40" cy="27" r="5" fill="#1e293b" />
      <circle cx="25" cy="25" r="2" fill="white" />
      <circle cx="41" cy="25" r="2" fill="white" />
      {/* mouth */}
      <path d="M24 34 Q32 38 40 34" stroke="#1e293b" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* body */}
      <rect x="20" y="40" width="24" height="18" rx="6" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="2" />
      {/* chest light */}
      <circle cx="32" cy="49" r="4" fill="#fbbf24" />
    </svg>
  );
}
