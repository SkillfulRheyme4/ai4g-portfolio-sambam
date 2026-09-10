import { useLanguage } from "../context/LanguageContext";
import type { CommandType } from "../game/engine";

interface EasyCommandPanelProps {
  sequence: CommandType[];
  onAdd: (cmd: CommandType) => void;
  onRemove: (index: number) => void;
  onClear: () => void;
  disabled: boolean;
  activeStep: number;
}

const COMMAND_META: Record<
  CommandType,
  { color: string; icon: string; key: keyof ReturnType<typeof useLanguage>["t"]["commands"] }
> = {
  forward: { color: "bg-blue-500 hover:bg-blue-600", icon: "↑", key: "forward" },
  backward: { color: "bg-orange-500 hover:bg-orange-600", icon: "↓", key: "backward" },
  left: { color: "bg-emerald-500 hover:bg-emerald-600", icon: "↺", key: "left" },
  right: { color: "bg-rose-500 hover:bg-rose-600", icon: "↻", key: "right" },
};

export function EasyCommandPanel({
  sequence,
  onAdd,
  onRemove,
  onClear,
  disabled,
  activeStep,
}: EasyCommandPanelProps) {
  const { t } = useLanguage();
  const commands = t.commands;
  const cmdTypes: CommandType[] = ["forward", "backward", "left", "right"];

  return (
    <div className="space-y-4">
      {/* Command buttons */}
      <div className="grid grid-cols-2 gap-3">
        {cmdTypes.map((cmd) => {
          const meta = COMMAND_META[cmd];
          const label = commands[meta.key];
          return (
            <button
              key={cmd}
              onClick={() => onAdd(cmd)}
              disabled={disabled}
              className={`${meta.color} disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-2xl p-4 shadow-md transition-all hover:scale-[1.03] active:scale-95 flex flex-col items-center gap-1`}
            >
              <span className="text-3xl font-bold leading-none">{meta.icon}</span>
              <span className="text-sm font-semibold">{label}</span>
            </button>
          );
        })}
      </div>

      {/* Sequence display */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <h3 className="text-sm font-bold text-slate-600">{commands.sequence}</h3>
          {sequence.length > 0 && (
            <button
              onClick={onClear}
              disabled={disabled}
              className="text-xs px-3 py-1.5 bg-slate-200 hover:bg-slate-300 text-slate-600 rounded-lg font-medium transition-colors disabled:opacity-40"
            >
              {commands.clear}
            </button>
          )}
        </div>

        {sequence.length === 0 ? (
          <div className="bg-slate-50 border-2 border-dashed border-slate-200 rounded-xl p-4 text-center">
            <p className="text-sm text-slate-400">{commands.empty}</p>
          </div>
        ) : (
          <div className="flex flex-wrap gap-2 min-h-[60px] p-3 bg-slate-50 rounded-xl border border-slate-200">
            {sequence.map((cmd, i) => {
              const meta = COMMAND_META[cmd];
              const label = commands[meta.key];
              const isActive = i === activeStep;
              return (
                <div
                  key={i}
                  className={`flex items-center gap-1.5 px-3 py-2 rounded-xl font-medium text-sm transition-all ${
                    isActive
                      ? "ring-2 ring-primary-500 ring-offset-1 scale-110 shadow-lg " + meta.color
                      : meta.color
                  } text-white shadow-sm`}
                >
                  <span className="text-base leading-none">{meta.icon}</span>
                  <span>{label}</span>
                  {!disabled && (
                    <button
                      onClick={() => onRemove(i)}
                      className="ml-1 w-5 h-5 rounded-full bg-white/30 hover:bg-white/50 flex items-center justify-center text-xs font-bold transition-colors"
                      aria-label={commands.remove}
                    >
                      ×
                    </button>
                  )}
                  {isActive && (
                    <span className="ml-1 w-2 h-2 rounded-full bg-white animate-pulse" />
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
