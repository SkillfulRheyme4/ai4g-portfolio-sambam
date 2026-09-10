import { useLanguage } from "../context/LanguageContext";
import type { StarResult } from "../game/engine";
import { StarIcon } from "./Tutorial";

interface FeedbackPanelProps {
  status: "idle" | "running" | "wall" | "bounds" | "success" | "notReached" | "limit";
  currentCmd: string | null;
  starResult: StarResult | null;
  optimalMoves: number | null;
}

export function FeedbackPanel({ status, currentCmd, starResult, optimalMoves }: FeedbackPanelProps) {
  const { t } = useLanguage();
  const fb = t.feedback;
  const sc = t.scoring;

  const statusConfig = {
    idle: { bg: "bg-slate-100", text: "text-slate-500", icon: "💡" },
    running: { bg: "bg-primary-100", text: "text-primary-700", icon: "🤖" },
    wall: { bg: "bg-danger-100", text: "text-danger-700", icon: "🧱" },
    bounds: { bg: "bg-danger-100", text: "text-danger-700", icon: "⚠️" },
    success: { bg: "bg-success-100", text: "text-success-700", icon: "⭐" },
    notReached: { bg: "bg-accent-100", text: "text-accent-700", icon: "📍" },
    limit: { bg: "bg-danger-100", text: "text-danger-700", icon: "♾️" },
  };

  const cfg = statusConfig[status];
  const message =
    status === "running" && currentCmd
      ? fb.runningCmd.replace("{cmd}", currentCmd)
      : fb[status as keyof typeof fb] ?? fb.idle;

  return (
    <div className="space-y-3">
      {/* Status banner */}
      <div className={`rounded-2xl p-4 transition-all ${cfg.bg} ${cfg.text}`}>
        <div className="flex items-center gap-3">
          <span className="text-2xl">{cfg.icon}</span>
          <p className="font-semibold text-sm flex-1">{message}</p>
        </div>
      </div>

      {/* Score / star rating */}
      {starResult && (status === "success") && (
        <div className="bg-white rounded-2xl p-5 shadow-md border border-slate-200 animate-bounce-in">
          {/* Stars */}
          <div className="flex justify-center gap-2 mb-3">
            {[0, 1, 2].map((i) => (
              <div
                key={i}
                className={i < starResult.stars ? "animate-pop-in" : "opacity-30"}
                style={{ animationDelay: `${i * 200}ms` }}
              >
                <StarIcon size={48} filled={i < starResult.stars} />
              </div>
            ))}
          </div>

          {/* Message */}
          <p className="text-center font-bold text-slate-700 mb-3">
            {sc[starResult.messageKey]}
          </p>

          {/* Stats */}
          <div className="grid grid-cols-2 gap-3">
            <StatBox label={sc.moves} value={starResult.moves} color="text-primary-600" />
            <StatBox label={sc.optimal} value={optimalMoves ?? "—"} color="text-success-600" />
          </div>
        </div>
      )}
    </div>
  );
}

function StatBox({ label, value, color }: { label: string; value: string | number; color: string }) {
  return (
    <div className="bg-slate-50 rounded-xl p-3 text-center">
      <div className={`text-2xl font-bold ${color}`}>{value}</div>
      <div className="text-xs text-slate-500 font-medium mt-0.5">{label}</div>
    </div>
  );
}
