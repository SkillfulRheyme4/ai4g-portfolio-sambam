export type Dir = 0 | 1 | 2 | 3; // 0=up, 1=right, 2=down, 3=left
export type TileType = "wall" | "path" | "start" | "goal";

export interface Maze {
  id: number;
  nameEn: string;
  nameNl: string;
  grid: TileType[][]; // rows × cols
  start: { row: number; col: number; dir: Dir };
  goal: { row: number; col: number };
}

export type CommandType = "forward" | "backward" | "left" | "right";

export interface ExecutedStep {
  row: number;
  col: number;
  dir: Dir;
  command: CommandType;
  status: "ok" | "wall" | "bounds" | "goal";
  moveCount: number;
}

export interface ExecutionResult {
  steps: ExecutedStep[];
  finalRow: number;
  finalCol: number;
  finalDir: Dir;
  totalMoves: number;
  reachedGoal: boolean;
  error: "wall" | "bounds" | "limit" | null;
  errorStepIndex: number;
}

const DELTA: Record<Dir, [number, number]> = {
  0: [-1, 0], // up
  1: [0, 1],  // right
  2: [1, 0],  // down
  3: [0, -1], // left
};

export function turnLeft(dir: Dir): Dir {
  return ((dir + 3) % 4) as Dir;
}

export function turnRight(dir: Dir): Dir {
  return ((dir + 1) % 4) as Dir;
}

export function turnAround(dir: Dir): Dir {
  return ((dir + 2) % 4) as Dir;
}

/**
 * Execute a list of commands against a maze.
 * "Moves" (forward/backward) count toward moveCount; turns do not.
 */
export function executeCommands(maze: Maze, commands: CommandType[]): ExecutionResult {
  let row = maze.start.row;
  let col = maze.start.col;
  let dir = maze.start.dir;
  let moveCount = 0;
  const steps: ExecutedStep[] = [];
  let error: "wall" | "bounds" | null = null;
  let errorStepIndex = -1;

  for (let i = 0; i < commands.length; i++) {
    const cmd = commands[i];

    if (cmd === "left") {
      dir = turnLeft(dir);
      steps.push({ row, col, dir, command: cmd, status: "ok", moveCount });
      continue;
    }
    if (cmd === "right") {
      dir = turnRight(dir);
      steps.push({ row, col, dir, command: cmd, status: "ok", moveCount });
      continue;
    }

    // forward or backward — a real move
    const moveDir = cmd === "forward" ? dir : turnAround(dir);
    const [dr, dc] = DELTA[moveDir];
    const newRow = row + dr;
    const newCol = col + dc;

    // bounds check
    if (
      newRow < 0 ||
      newRow >= maze.grid.length ||
      newCol < 0 ||
      newCol >= maze.grid[0].length
    ) {
      steps.push({ row, col, dir, command: cmd, status: "bounds", moveCount });
      error = "bounds";
      errorStepIndex = i;
      break;
    }

    // wall check
    if (maze.grid[newRow][newCol] === "wall") {
      steps.push({ row, col, dir, command: cmd, status: "wall", moveCount });
      error = "wall";
      errorStepIndex = i;
      break;
    }

    // valid move
    row = newRow;
    col = newCol;
    moveCount++;
    const reachedGoal = row === maze.goal.row && col === maze.goal.col;
    steps.push({
      row,
      col,
      dir,
      command: cmd,
      status: reachedGoal ? "goal" : "ok",
      moveCount,
    });

    if (reachedGoal) break; // stop after reaching goal
  }

  return {
    steps,
    finalRow: row,
    finalCol: col,
    finalDir: dir,
    totalMoves: moveCount,
    reachedGoal: row === maze.goal.row && col === maze.goal.col,
    error,
    errorStepIndex,
  };
}

// --- Expert mode: loops & conditionals ---

export type Condition = "wall_ahead" | "path_ahead";

export type Instruction =
  | { kind: "cmd"; cmd: CommandType }
  | { kind: "repeat"; count: number; body: Instruction[] }
  | { kind: "if"; condition: Condition; body: Instruction[]; elseBody: Instruction[] | null };

/** Recursively checks whether a parsed program uses a given instruction kind (e.g. to detect first-time loop/conditional use). */
export function instructionKindUsed(program: Instruction[], kind: "repeat" | "if"): boolean {
  for (const instr of program) {
    if (instr.kind === kind) return true;
    if (instr.kind === "repeat" && instructionKindUsed(instr.body, kind)) return true;
    if (instr.kind === "if") {
      if (instructionKindUsed(instr.body, kind)) return true;
      if (instr.elseBody && instructionKindUsed(instr.elseBody, kind)) return true;
    }
  }
  return false;
}

const MAX_PROGRAM_STEPS = 500;

/**
 * Interprets an Expert-mode program (supports repeat loops and if/else
 * conditions on wall_ahead/path_ahead) into the same flat ExecutedStep
 * stream produced by executeCommands, so the UI can step through it
 * identically regardless of mode.
 */
export function executeProgram(maze: Maze, program: Instruction[]): ExecutionResult {
  let row = maze.start.row;
  let col = maze.start.col;
  let dir = maze.start.dir;
  let moveCount = 0;
  const steps: ExecutedStep[] = [];
  let error: "wall" | "bounds" | "limit" | null = null;
  let errorStepIndex = -1;
  let halted = false;

  const isWallAhead = (): boolean => {
    const [dr, dc] = DELTA[dir];
    const nr = row + dr;
    const nc = col + dc;
    if (nr < 0 || nr >= maze.grid.length || nc < 0 || nc >= maze.grid[0].length) return true;
    return maze.grid[nr][nc] === "wall";
  };

  const run = (instructions: Instruction[]) => {
    for (const instr of instructions) {
      if (halted) return;
      if (steps.length >= MAX_PROGRAM_STEPS) {
        error = "limit";
        halted = true;
        return;
      }

      if (instr.kind === "cmd") {
        const cmd = instr.cmd;

        if (cmd === "left" || cmd === "right") {
          dir = cmd === "left" ? turnLeft(dir) : turnRight(dir);
          steps.push({ row, col, dir, command: cmd, status: "ok", moveCount });
          continue;
        }

        const moveDir = cmd === "forward" ? dir : turnAround(dir);
        const [dr, dc] = DELTA[moveDir];
        const newRow = row + dr;
        const newCol = col + dc;

        if (
          newRow < 0 ||
          newRow >= maze.grid.length ||
          newCol < 0 ||
          newCol >= maze.grid[0].length
        ) {
          steps.push({ row, col, dir, command: cmd, status: "bounds", moveCount });
          error = "bounds";
          errorStepIndex = steps.length - 1;
          halted = true;
          return;
        }

        if (maze.grid[newRow][newCol] === "wall") {
          steps.push({ row, col, dir, command: cmd, status: "wall", moveCount });
          error = "wall";
          errorStepIndex = steps.length - 1;
          halted = true;
          return;
        }

        row = newRow;
        col = newCol;
        moveCount++;
        const reachedGoal = row === maze.goal.row && col === maze.goal.col;
        steps.push({ row, col, dir, command: cmd, status: reachedGoal ? "goal" : "ok", moveCount });
        if (reachedGoal) {
          halted = true;
          return;
        }
      } else if (instr.kind === "repeat") {
        for (let i = 0; i < instr.count; i++) {
          run(instr.body);
          if (halted) return;
        }
      } else {
        const conditionMet = instr.condition === "wall_ahead" ? isWallAhead() : !isWallAhead();
        if (conditionMet) run(instr.body);
        else if (instr.elseBody) run(instr.elseBody);
      }
    }
  };

  run(program);

  const reachedGoal = steps.length > 0 && steps[steps.length - 1].status === "goal";

  return {
    steps,
    finalRow: row,
    finalCol: col,
    finalDir: dir,
    totalMoves: moveCount,
    reachedGoal,
    error,
    errorStepIndex,
  };
}

/**
 * BFS to find the shortest path (in move steps) from start to goal.
 * Returns the minimum number of move commands required, ignoring turns.
 */
export function shortestPathMoves(maze: Maze): number | null {
  const rows = maze.grid.length;
  const cols = maze.grid[0].length;
  const visited = Array.from({ length: rows }, () => Array<boolean>(cols).fill(false));
  const queue: { row: number; col: number; dist: number }[] = [
    { row: maze.start.row, col: maze.start.col, dist: 0 },
  ];
  visited[maze.start.row][maze.start.col] = true;

  while (queue.length > 0) {
    const { row, col, dist } = queue.shift()!;
    if (row === maze.goal.row && col === maze.goal.col) return dist;

    for (const [dr, dc] of Object.values(DELTA)) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (visited[nr][nc]) continue;
      if (maze.grid[nr][nc] === "wall") continue;
      visited[nr][nc] = true;
      queue.push({ row: nr, col: nc, dist: dist + 1 });
    }
  }
  return null;
}

export interface StarResult {
  stars: 0 | 1 | 2 | 3;
  moves: number;
  optimal: number;
  messageKey: "threeStar" | "twoStar" | "oneStar";
}

/**
 * Calculate star rating based on moves vs optimal.
 * 3 stars: moves === optimal
 * 2 stars: moves <= optimal + 3
 * 1 star: completed but more than optimal + 3
 */
export function calculateStars(moves: number, optimal: number, reachedGoal: boolean): StarResult {
  if (!reachedGoal || optimal === 0) return { stars: 0, moves, optimal, messageKey: "threeStar" };
  if (moves <= optimal) return { stars: 3, moves, optimal, messageKey: "threeStar" };
  if (moves <= optimal + 3) return { stars: 2, moves, optimal, messageKey: "twoStar" };
  return { stars: 1, moves, optimal, messageKey: "oneStar" };
}
