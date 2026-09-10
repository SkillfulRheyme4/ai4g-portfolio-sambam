import type { Maze, Dir } from "../game/engine";

interface MazeRendererProps {
  maze: Maze;
  robotRow: number;
  robotCol: number;
  robotDir: Dir;
  stepIndex: number;
  hitWall: boolean;
  trail: { row: number; col: number }[];
}

const DIR_ROTATION: Record<Dir, number> = {
  0: 0,   // up
  1: 90,  // right
  2: 180, // down
  3: 270, // left
};

export function MazeRenderer({
  maze,
  robotRow,
  robotCol,
  robotDir,
  stepIndex,
  hitWall,
  trail,
}: MazeRendererProps) {
  const rows = maze.grid.length;
  const cols = maze.grid[0].length;

  // Compute tile size that fits nicely
  const maxDim = Math.max(rows, cols);
  const tileSize = maxDim <= 5 ? 64 : maxDim <= 7 ? 52 : 44;

  return (
    <div className="flex justify-center">
      <div
        className="relative bg-slate-800 rounded-2xl p-3 shadow-inner"
        style={{ display: "inline-block" }}
      >
        <div
          className="relative"
          style={{
            display: "grid",
            gridTemplateColumns: `repeat(${cols}, ${tileSize}px)`,
            gridTemplateRows: `repeat(${rows}, ${tileSize}px)`,
            gap: "2px",
          }}
        >
          {maze.grid.map((rowTiles, r) =>
            rowTiles.map((tile, c) => {
              const isStart = tile === "start";
              const isGoal = tile === "goal";
              const isWall = tile === "wall";
              const hasRobot = r === robotRow && c === robotCol;
              const inTrail = trail.some((p) => p.row === r && p.col === c) && !hasRobot;

              return (
                <div
                  key={`${r}-${c}`}
                  className={`relative rounded-lg transition-colors duration-200 ${
                    isWall
                      ? "bg-slate-600 shadow-inner"
                      : isStart
                      ? "bg-success-200"
                      : isGoal
                      ? "bg-accent-100"
                      : "bg-slate-200"
                  }`}
                  style={{ width: tileSize, height: tileSize }}
                >
                  {/* Wall texture */}
                  {isWall && (
                    <div className="absolute inset-1 rounded-md bg-slate-500/50 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-slate-700" />
                    </div>
                  )}

                  {/* Start marker */}
                  {isStart && !hasRobot && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-success-600 font-bold text-lg">S</span>
                    </div>
                  )}

                  {/* Goal star */}
                  {isGoal && (
                    <div
                      className={`absolute inset-0 flex items-center justify-center ${
                        !hasRobot ? "animate-pop-in" : ""
                      }`}
                    >
                      <StarTile size={tileSize * 0.7} />
                    </div>
                  )}

                  {/* Trail dots */}
                  {inTrail && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="w-3 h-3 rounded-full bg-primary-300 opacity-60" />
                    </div>
                  )}

                  {/* Robot */}
                  {hasRobot && (
                    <div
                      className={`absolute inset-0 flex items-center justify-center transition-all duration-300 ${
                        hitWall ? "animate-shake" : ""
                      }`}
                      style={{
                        transform: `rotate(${DIR_ROTATION[robotDir]}deg)`,
                      }}
                    >
                      <div className={stepIndex >= 0 ? "animate-pop-in" : ""}>
                        <RobotOnTile size={tileSize * 0.75} />
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}

function StarTile({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#fbbf24" stroke="#f59e0b" strokeWidth="1.5" strokeLinejoin="round" className="drop-shadow-md">
      <polygon points="12,2 15.09,8.26 22,9.27 17,14.14 18.18,21.02 12,17.77 5.82,21.02 7,14.14 2,9.27 8.91,8.26" />
      <animate attributeName="opacity" values="1;0.7;1" dur="2s" repeatCount="indefinite" />
    </svg>
  );
}

function RobotOnTile({ size }: { size: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 64 64" className="drop-shadow-lg">
      {/* Direction arrow on top */}
      <path d="M32 2 L38 12 L26 12 Z" fill="#10b981" />
      {/* antenna */}
      <line x1="32" y1="14" x2="32" y2="18" stroke="#64748b" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="14" r="2.5" fill="#fbbf24" />
      {/* head */}
      <rect x="18" y="18" width="28" height="22" rx="6" fill="#e2e8f0" stroke="#475569" strokeWidth="1.5" />
      {/* eyes */}
      <circle cx="25" cy="29" r="4" fill="#1e293b" />
      <circle cx="39" cy="29" r="4" fill="#1e293b" />
      <circle cx="26" cy="27" r="1.5" fill="white" />
      <circle cx="40" cy="27" r="1.5" fill="white" />
      {/* mouth */}
      <path d="M25 35 Q32 38 39 35" stroke="#1e293b" strokeWidth="1.5" fill="none" strokeLinecap="round" />
      {/* body */}
      <rect x="22" y="40" width="20" height="16" rx="5" fill="#3b82f6" stroke="#1d4ed8" strokeWidth="1.5" />
      <circle cx="32" cy="48" r="3" fill="#fbbf24" />
    </svg>
  );
}
