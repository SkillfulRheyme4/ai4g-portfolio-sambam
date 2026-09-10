import { useLanguage } from "../context/LanguageContext";
import type { CommandType } from "../game/engine";

interface AdvancedCodePanelProps {
  code: string;
  onChange: (code: string) => void;
  disabled: boolean;
  activeStep: number;
  parsedCommands: CommandType[] | null;
  placeholder?: string;
  hint?: string;
}

export function AdvancedCodePanel({
  code,
  onChange,
  disabled,
  activeStep,
  parsedCommands,
  placeholder,
  hint,
}: AdvancedCodePanelProps) {
  const adv = useLanguage().t.advanced;

  const lineCount = code.split("\n").length;

  return (
    <div className="space-y-3">
      {/* Editor */}
      <div className="relative rounded-xl overflow-hidden border border-slate-700 shadow-lg">
        {/* Title bar */}
        <div className="flex items-center gap-2 bg-slate-800 px-3 py-2 border-b border-slate-700">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-400" />
            <div className="w-3 h-3 rounded-full bg-yellow-400" />
            <div className="w-3 h-3 rounded-full bg-green-400" />
          </div>
          <span className="text-slate-400 text-xs font-mono ml-2">robot_commands.py</span>
        </div>

        {/* Code area with line numbers */}
        <div className="flex bg-slate-900 max-h-[280px] overflow-auto">
          {/* Line numbers */}
          <div className="flex-shrink-0 bg-slate-800/50 py-3 px-2 text-right select-none">
            {Array.from({ length: Math.max(lineCount, 1) }).map((_, i) => (
              <div
                key={i}
                className={`text-xs font-mono leading-6 ${
                  parsedCommands && i === activeStep ? "text-primary-400 font-bold" : "text-slate-500"
                }`}
              >
                {i + 1}
              </div>
            ))}
          </div>

          {/* Textarea */}
          <textarea
            value={code}
            onChange={(e) => onChange(e.target.value)}
            disabled={disabled}
            spellCheck={false}
            className="flex-1 bg-slate-900 text-green-400 font-mono text-sm leading-6 p-3 resize-none focus:outline-none disabled:opacity-60"
            style={{ minHeight: "180px", whiteSpace: "pre", overflowWrap: "normal", overflowX: "auto" }}
            placeholder={placeholder ?? adv.placeholder}
          />
        </div>
      </div>

      <p className="text-xs text-slate-400">{hint ?? adv.hint}</p>
    </div>
  );
}
