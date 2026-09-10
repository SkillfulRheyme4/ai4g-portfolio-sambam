import { useState, useEffect, useRef, useCallback } from "react";
import { useLanguage } from "./context/LanguageContext";
import type { Lang } from "./game/translations";
import { MAZES, generateRandomMaze } from "./game/mazes";
import {
  type CommandType,
  type Dir,
  type ExecutionResult,
  type Instruction,
  executeCommands,
  executeProgram,
  instructionKindUsed,
  shortestPathMoves,
  calculateStars,
  type StarResult,
} from "./game/engine";
import { parseProgram } from "./game/parser";
import { Tutorial, RobotMascot } from "./components/Tutorial";
import { MazeRenderer } from "./components/MazeRenderer";
import { EasyCommandPanel } from "./components/EasyCommandPanel";
import { AdvancedCodePanel } from "./components/AdvancedCodePanel";
import { FeedbackPanel } from "./components/FeedbackPanel";

type GameMode = "easy" | "advanced" | "expert";
type Status = "idle" | "running" | "wall" | "bounds" | "success" | "notReached" | "limit";
type RunCommand = { type: CommandType; label: string };

const STEP_DELAY = 600;

export default function App() {
  const { lang, setLang, t } = useLanguage();

  const [showTutorial, setShowTutorial] = useState(true);
  const [mode, setMode] = useState<GameMode>("easy");
  const [mazeIndex, setMazeIndex] = useState(0);
  const [randomMaze, setRandomMaze] = useState<ReturnType<typeof generateRandomMaze> | null>(
    () => generateRandomMaze(Date.now(), 1)
  );
  const maze = randomMaze ?? MAZES[mazeIndex];

  // Easy mode sequence
  const [sequence, setSequence] = useState<CommandType[]>([]);

  // Advanced mode code
  const [code, setCode] = useState("");

  // Expert mode code
  const [expertCode, setExpertCode] = useState("");

  // Execution state
  const [robotRow, setRobotRow] = useState(maze.start.row);
  const [robotCol, setRobotCol] = useState(maze.start.col);
  const [robotDir, setRobotDir] = useState<Dir>(maze.start.dir);
  const [stepIndex, setStepIndex] = useState(-1);
  const [hitWall, setHitWall] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [currentCmdLabel, setCurrentCmdLabel] = useState<string | null>(null);
  const [starResult, setStarResult] = useState<StarResult | null>(null);
  const [trail, setTrail] = useState<{ row: number; col: number }[]>([]);
  const [parseError, setParseError] = useState<string | null>(null);
  const [parsedCommands, setParsedCommands] = useState<CommandType[] | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const [conceptIntro, setConceptIntro] = useState<{ title: string; body: string } | null>(null);

  const runCommandsRef = useRef<RunCommand[]>([]);
  const execResultRef = useRef<ExecutionResult | null>(null);
  const optimalMoves = shortestPathMoves(maze);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const isRunning = status === "running";

  const resetRobot = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
    setRobotRow(maze.start.row);
    setRobotCol(maze.start.col);
    setRobotDir(maze.start.dir);
    setStepIndex(-1);
    setHitWall(false);
    setStatus("idle");
    setCurrentCmdLabel(null);
    setStarResult(null);
    setTrail([]);
    setShowConfetti(false);
  }, [maze.start.row, maze.start.col, maze.start.dir]);

  // Reset robot when maze changes
  useEffect(() => {
    resetRobot();
  }, [mazeIndex, randomMaze, resetRobot]);

  // Shows a one-time explainer the first time a kid uses a loop or a conditional.
  const maybeShowConceptIntro = useCallback(
    (program: Instruction[]) => {
      if (!localStorage.getItem("rmq_seen_loop") && instructionKindUsed(program, "repeat")) {
        localStorage.setItem("rmq_seen_loop", "1");
        setConceptIntro({ title: t.concepts.loopTitle, body: t.concepts.loopBody });
        return;
      }
      if (!localStorage.getItem("rmq_seen_conditional") && instructionKindUsed(program, "if")) {
        localStorage.setItem("rmq_seen_conditional", "1");
        setConceptIntro({ title: t.concepts.conditionalTitle, body: t.concepts.conditionalBody });
      }
    },
    [t]
  );

  const buildRunCommands = useCallback((): { execResult: ExecutionResult; built: RunCommand[]; program: Instruction[] | null } | { error: string } => {
    const codeLabels: Record<CommandType, string> = {
      forward: "move_forward()",
      backward: "move_backward()",
      left: "turn_left()",
      right: "turn_right()",
    };

    if (mode === "easy") {
      const labels: Record<CommandType, string> = {
        forward: t.commands.forward,
        backward: t.commands.backward,
        left: t.commands.left,
        right: t.commands.right,
      };
      const built = sequence.map((c) => ({ type: c, label: labels[c] }));
      setParsedCommands(sequence);
      return { execResult: executeCommands(maze, sequence), built, program: null };
    }

    // Advanced mode introduces repeat loops only; Expert adds conditionals on top.
    const result = parseProgram(mode === "advanced" ? code : expertCode, {
      allowConditionals: mode === "expert",
    });
    if (result.error) {
      return { error: result.error };
    }
    const execResult = executeProgram(maze, result.program!);
    const built = execResult.steps.map((s) => ({ type: s.command, label: codeLabels[s.command] }));
    setParsedCommands(built.map((c) => c.type));
    return { execResult, built, program: result.program };
  }, [mode, sequence, code, expertCode, maze, t]);


  const runStep = useCallback(
    (stepIdx: number, commands: RunCommand[]) => {
      if (stepIdx >= commands.length) {
        // Finished all commands without error — check if reached goal
        const result = execResultRef.current!;
        if (result.reachedGoal) {
          setStatus("success");
          const stars = calculateStars(result.totalMoves, optimalMoves ?? 0, true);
          setStarResult(stars);
          setShowConfetti(true);
        } else if (result.error === "limit") {
          setStatus("limit");
        } else {
          setStatus("notReached");
        }
        setCurrentCmdLabel(null);
        setStepIndex(-1);
        return;
      }

      const result = execResultRef.current!;
      const step = result.steps[stepIdx];
      setStepIndex(stepIdx);
      setCurrentCmdLabel(commands[stepIdx].label);

      if (step.status === "wall") {
        setRobotRow(step.row);
        setRobotCol(step.col);
        setRobotDir(step.dir);
        setHitWall(true);
        setStatus("wall");
        setCurrentCmdLabel(null);
        setStepIndex(-1);
        return;
      }

      if (step.status === "bounds") {
        setRobotRow(step.row);
        setRobotCol(step.col);
        setRobotDir(step.dir);
        setStatus("bounds");
        setCurrentCmdLabel(null);
        setStepIndex(-1);
        return;
      }

      // valid step
      setRobotRow(step.row);
      setRobotCol(step.col);
      setRobotDir(step.dir);
      setTrail((prev) => {
        if (prev.some((p) => p.row === step.row && p.col === step.col)) return prev;
        return [...prev, { row: step.row, col: step.col }];
      });

      if (step.status === "goal") {
        setStatus("success");
        const stars = calculateStars(result.totalMoves, optimalMoves ?? 0, true);
        setStarResult(stars);
        setShowConfetti(true);
        setCurrentCmdLabel(null);
        setStepIndex(-1);
        return;
      }

      // schedule next step
      timeoutRef.current = setTimeout(() => runStep(stepIdx + 1, commands), STEP_DELAY);
    },
    [optimalMoves]
  );

  const handleRun = useCallback(() => {
    // Clear any previous parse error display state
    setParseError(null);

    const prepared = buildRunCommands();
    if ("error" in prepared) {
      const errKey = prepared.error;
      const errs = mode === "expert" ? t.expert : t.advanced;
      if (errKey === "EMPTY") {
        setParseError(errs.errorEmpty);
      } else if (errKey.startsWith("SYNTAX:")) {
        const parts = errKey.split(":");
        setParseError(errs.errorSyntax.replace("{n}", parts[1]));
      } else if (errKey.startsWith("UNKNOWN:")) {
        const parts = errKey.split(":");
        setParseError(
          errs.errorUnknown.replace("{n}", parts[1]).replace("{cmd}", parts[2] + "()")
        );
      } else if (errKey.startsWith("INDENT:") && mode === "expert") {
        const parts = errKey.split(":");
        setParseError(t.expert.errorIndent.replace("{n}", parts[1]));
      } else if (errKey.startsWith("NOCONDITIONAL:") && mode === "advanced") {
        const parts = errKey.split(":");
        setParseError(t.advanced.errorConditionalNotAllowed.replace("{n}", parts[1]));
      }
      return;
    }

    const { execResult, built, program } = prepared;
    if (built.length === 0) return;

    if (program) {
      maybeShowConceptIntro(program);
    }

    // Reset robot to start
    setRobotRow(maze.start.row);
    setRobotCol(maze.start.col);
    setRobotDir(maze.start.dir);
    setTrail([{ row: maze.start.row, col: maze.start.col }]);
    setHitWall(false);
    setStarResult(null);
    setShowConfetti(false);
    setStatus("running");

    execResultRef.current = execResult;
    runCommandsRef.current = built;

    // Start stepping through
    timeoutRef.current = setTimeout(() => runStep(0, built), STEP_DELAY);
  }, [buildRunCommands, maze, runStep, t, mode, maybeShowConceptIntro]);


  const handleReplay = useCallback(() => {
    resetRobot();
    // Re-run after a brief delay for visual reset
    setTimeout(() => handleRun(), 300);
  }, [resetRobot, handleRun]);

  const handleClearCommands = useCallback(() => {
    setSequence([]);
    resetRobot();
  }, [resetRobot]);

  const handleAddCommand = useCallback((cmd: CommandType) => {
    setSequence((prev) => [...prev, cmd]);
  }, []);

  const handleRemoveCommand = useCallback((index: number) => {
    setSequence((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleNewMaze = useCallback(() => {
    const level = (mazeIndex + 1) as 1 | 2 | 3;
    setRandomMaze(generateRandomMaze(Date.now(), level));
    setSequence([]);
    setCode("");
    setExpertCode("");
    setParseError(null);
  }, [mazeIndex]);

  const canRun =
    mode === "easy"
      ? sequence.length > 0 && !isRunning
      : mode === "advanced"
      ? code.trim() !== "" && !isRunning
      : expertCode.trim() !== "" && !isRunning;

  const currentMazeName = lang === "en" ? maze.nameEn : maze.nameNl;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-100 via-blue-50 to-slate-100">
      {/* Confetti */}
      {showConfetti && <Confetti />}

      {/* Tutorial */}
      {showTutorial && <Tutorial onClose={() => setShowTutorial(false)} />}

      {/* First-time loop/conditional explainer */}
      {conceptIntro && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <div className="bg-white rounded-3xl shadow-2xl p-6 max-w-sm w-full text-center animate-bounce-in">
            <h3 className="text-xl font-bold text-slate-800 mb-2">{conceptIntro.title}</h3>
            <p className="text-sm text-slate-600 mb-5">{conceptIntro.body}</p>
            <button
              onClick={() => setConceptIntro(null)}
              className="px-5 py-2.5 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-xl transition-colors"
            >
              {t.concepts.close}
            </button>
          </div>
        </div>
      )}

      <div className="max-w-6xl mx-auto px-4 py-5 lg:py-8">
        {/* Header */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-6">
          <div className="flex items-center gap-3">
            <RobotMascot size={56} />
            <div>
              <h1 className="text-2xl lg:text-3xl font-bold text-slate-800 leading-tight">
                {t.header.title}
              </h1>
              <p className="text-sm text-slate-500">{t.header.subtitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Language selector */}
            <LanguageSelector lang={lang} setLang={setLang} label={t.lang.label} />

            {/* Tutorial button */}
            <button
              onClick={() => setShowTutorial(true)}
              className="flex items-center gap-2 px-4 py-2.5 bg-white hover:bg-slate-50 text-slate-600 rounded-xl font-medium text-sm shadow-sm border border-slate-200 transition-colors"
            >
              <span className="text-lg">📖</span>
              {t.tutorial.button}
            </button>
          </div>
        </header>

        {/* Mode switcher */}
        <div className="flex flex-col sm:flex-row gap-3 mb-6">
          <ModeButton
            active={mode === "easy"}
            onClick={() => {
              setMode("easy");
              resetRobot();
            }}
            title={t.mode.easy}
            desc={t.mode.easyDesc}
            icon="🎮"
            color="easy"
          />
          <ModeButton
            active={mode === "advanced"}
            onClick={() => {
              setMode("advanced");
              resetRobot();
            }}
            title={t.mode.advanced}
            desc={t.mode.advancedDesc}
            icon="💻"
            color="advanced"
          />
          <ModeButton
            active={mode === "expert"}
            onClick={() => {
              setMode("expert");
              resetRobot();
            }}
            title={t.mode.expert}
            desc={t.mode.expertDesc}
            icon="🧠"
            color="expert"
          />
        </div>

        {/* Main game area */}
        <div className="grid lg:grid-cols-2 gap-5">
          {/* Left: Maze + maze selector */}
          <div className="space-y-4">
            {/* Maze selector */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-sm font-bold text-slate-600">{t.mazes.title}:</span>
              {MAZES.map((m, i) => (
                <button
                  key={m.id}
                  onClick={() => {
                    setMazeIndex(i);
                    setRandomMaze(generateRandomMaze(Date.now(), (i + 1) as 1 | 2 | 3));
                    setSequence([]);
                    setCode("");
                    setExpertCode("");
                    setParseError(null);
                  }}
                  className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    i === mazeIndex
                      ? "bg-primary-500 text-white shadow-md"
                      : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                  }`}
                >
                  {t.mazes.level} {i + 1}
                </button>
              ))}
              <button
                onClick={handleNewMaze}
                className="ml-auto px-3 py-1.5 rounded-lg text-sm font-medium bg-accent-400 hover:bg-accent-500 text-white transition-colors"
              >
                {t.actions.newMaze}
              </button>
            </div>

            {/* Maze name */}
            <div className="text-center">
              <h2 className="text-lg font-bold text-slate-700">{currentMazeName}</h2>
            </div>

            {/* Maze renderer */}
            <div className="bg-white rounded-3xl shadow-lg p-4 lg:p-6 flex justify-center">
              <MazeRenderer
                maze={maze}
                robotRow={robotRow}
                robotCol={robotCol}
                robotDir={robotDir}
                stepIndex={stepIndex}
                hitWall={hitWall}
                trail={trail}
              />
            </div>

            {/* Action buttons */}
            <div className="flex flex-wrap gap-3 justify-center">
              <button
                onClick={handleRun}
                disabled={!canRun}
                className="flex items-center gap-2 px-6 py-3 bg-success-500 hover:bg-success-600 disabled:bg-slate-300 disabled:cursor-not-allowed text-white font-bold rounded-2xl shadow-md transition-all hover:scale-[1.03] active:scale-95 text-base"
              >
                <span className="text-xl">▶</span>
                {mode === "advanced" ? t.advanced.run : mode === "expert" ? t.expert.run : t.actions.run}
              </button>
              <button
                onClick={resetRobot}
                disabled={isRunning}
                className="flex items-center gap-2 px-5 py-3 bg-slate-200 hover:bg-slate-300 disabled:opacity-50 text-slate-600 font-bold rounded-2xl transition-colors text-base"
              >
                <span className="text-xl">↺</span>
                {t.actions.reset}
              </button>
              {(status === "success" || status === "wall" || status === "bounds" || status === "notReached") && (
                <button
                  onClick={handleReplay}
                  className="flex items-center gap-2 px-5 py-3 bg-primary-500 hover:bg-primary-600 text-white font-bold rounded-2xl shadow-md transition-all hover:scale-[1.03] active:scale-95 text-base"
                >
                  <span className="text-xl">🔁</span>
                  {t.actions.replay}
                </button>
              )}
            </div>
          </div>

          {/* Right: Command area + Feedback */}
          <div className="space-y-4">
            {/* Command panel */}
            <div className="bg-white rounded-3xl shadow-lg p-4 lg:p-5">
              {mode === "easy" ? (
                <EasyCommandPanel
                  sequence={sequence}
                  onAdd={handleAddCommand}
                  onRemove={handleRemoveCommand}
                  onClear={handleClearCommands}
                  disabled={isRunning}
                  activeStep={stepIndex}
                />
              ) : mode === "advanced" ? (
                <>
                  <AdvancedCodePanel
                    code={code}
                    onChange={setCode}
                    disabled={isRunning}
                    activeStep={stepIndex}
                    parsedCommands={parsedCommands}
                  />
                  {parseError && (
                    <div className="mt-3 bg-danger-50 border border-danger-200 text-danger-700 rounded-xl p-3 text-sm font-medium animate-bounce-in">
                      ⚠️ {parseError}
                    </div>
                  )}
                </>
              ) : (
                <>
                  <AdvancedCodePanel
                    code={expertCode}
                    onChange={setExpertCode}
                    disabled={isRunning}
                    activeStep={stepIndex}
                    parsedCommands={parsedCommands}
                    placeholder={t.expert.placeholder}
                    hint={t.expert.hint}
                  />
                  {parseError && (
                    <div className="mt-3 bg-danger-50 border border-danger-200 text-danger-700 rounded-xl p-3 text-sm font-medium animate-bounce-in">
                      ⚠️ {parseError}
                    </div>
                  )}
                </>
              )}
            </div>

            {/* Feedback panel */}
            <div className="bg-white rounded-3xl shadow-lg p-4 lg:p-5">
              <FeedbackPanel
                status={status}
                currentCmd={currentCmdLabel}
                starResult={starResult}
                optimalMoves={optimalMoves}
              />
            </div>
          </div>
        </div>

        {/* Footer */}
        <footer className="text-center mt-8 text-sm text-slate-400">
          {t.footer}
        </footer>
      </div>
    </div>
  );
}

function LanguageSelector({
  lang,
  setLang,
  label,
}: {
  lang: Lang;
  setLang: (l: Lang) => void;
  label: string;
}) {
  return (
    <div className="flex items-center gap-1 bg-white rounded-xl shadow-sm border border-slate-200 p-1">
      <span className="text-xs text-slate-400 px-2 hidden sm:inline">{label}</span>
      <button
        onClick={() => setLang("en")}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          lang === "en" ? "bg-primary-500 text-white" : "text-slate-500 hover:bg-slate-100"
        }`}
      >
        EN
      </button>
      <button
        onClick={() => setLang("nl")}
        className={`px-3 py-1.5 rounded-lg text-sm font-medium transition-colors ${
          lang === "nl" ? "bg-primary-500 text-white" : "text-slate-500 hover:bg-slate-100"
        }`}
      >
        NL
      </button>
    </div>
  );
}

function ModeButton({
  active,
  onClick,
  title,
  desc,
  icon,
  color,
}: {
  active: boolean;
  onClick: () => void;
  title: string;
  desc: string;
  icon: string;
  color: "easy" | "advanced" | "expert";
}) {
  const activeColor =
    color === "easy"
      ? "bg-gradient-to-br from-primary-500 to-primary-600 text-white"
      : color === "advanced"
      ? "bg-gradient-to-br from-slate-700 to-slate-800 text-white"
      : "bg-gradient-to-br from-purple-700 to-purple-900 text-white";
  return (
    <button
      onClick={onClick}
      className={`flex-1 flex items-start gap-3 p-4 rounded-2xl text-left transition-all ${
        active
          ? `${activeColor} shadow-lg scale-[1.02]`
          : "bg-white border border-slate-200 text-slate-600 hover:bg-slate-50 shadow-sm"
      }`}
    >
      <span className="text-2xl flex-shrink-0">{icon}</span>
      <div>
        <div className="font-bold text-base">{title}</div>
        <div className={`text-xs mt-0.5 ${active ? "text-white/80" : "text-slate-400"}`}>{desc}</div>
      </div>
    </button>
  );
}

function Confetti() {
  const pieces = Array.from({ length: 40 });
  const colors = ["#fbbf24", "#3b82f6", "#10b981", "#ef4444", "#f97316", "#8b5cf6"];
  return (
    <div className="fixed inset-0 pointer-events-none z-40 overflow-hidden">
      {pieces.map((_, i) => {
        const left = Math.random() * 100;
        const delay = Math.random() * 2;
        const duration = 2 + Math.random() * 2;
        const color = colors[i % colors.length];
        const size = 8 + Math.random() * 8;
        return (
          <div
            key={i}
            style={{
              position: "absolute",
              left: `${left}%`,
              top: "-10px",
              width: `${size}px`,
              height: `${size}px`,
              backgroundColor: color,
              borderRadius: Math.random() > 0.5 ? "50%" : "2px",
              animation: `confetti-fall ${duration}s linear ${delay}s forwards`,
            }}
          />
        );
      })}
    </div>
  );
}
