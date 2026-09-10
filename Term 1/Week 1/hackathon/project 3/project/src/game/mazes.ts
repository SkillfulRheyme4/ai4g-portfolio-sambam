import type { Maze, TileType, CommandType } from "./engine";

export const MAZES: Maze[] = [
  {
    id: 1,
    nameEn: "First Steps",
    nameNl: "Eerste Stappen",
    grid: parseGrid([
      "....",
      ".##.",
      ".##.",
      "...*",
    ]),
    start: { row: 0, col: 0, dir: 1 },
    goal: { row: 3, col: 3 },
  },
  {
    id: 2,
    nameEn: "The Detour",
    nameNl: "De Omweg",
    grid: parseGrid([
      "S....",
      ".###.",
      ".#...",
      ".#.##",
      "....*",
    ]),
    start: { row: 0, col: 0, dir: 1 },
    goal: { row: 4, col: 4 },
  },
  {
    id: 3,
    nameEn: "Twisty Corridor",
    nameNl: "Kronkelpad",
    grid: parseGrid([
      ".......",
      "###.###",
      ".......",
      ".###.##",
      ".......",
      "##.###.",
      "S....#.",
      "####..*",
    ]),
    start: { row: 6, col: 0, dir: 1 },
    goal: { row: 7, col: 6 },
  },
];

/**
 * Generates a random solvable maze using randomized depth-first carving,
 * verifying reachability from start to goal via BFS before returning.
 * Grid size scales with level so difficulty matches the selected level's fixed maze.
 */
const LEVEL_SIZES: Record<1 | 2 | 3, number> = {
  1: 5,
  2: 7,
  3: 9,
};

export function generateRandomMaze(id: number, level: 1 | 2 | 3 = 3): Maze {
  const size = LEVEL_SIZES[level];
  const ROWS = size;
  const COLS = size;

  while (true) {
    const grid: TileType[][] = Array.from({ length: ROWS }, () =>
      Array<TileType>(COLS).fill("wall")
    );

    const carve = (row: number, col: number) => {
      grid[row][col] = "path";
      const dirs = [
        [-2, 0],
        [2, 0],
        [0, -2],
        [0, 2],
      ];
      for (let i = dirs.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [dirs[i], dirs[j]] = [dirs[j], dirs[i]];
      }
      for (const [dr, dc] of dirs) {
        const nr = row + dr;
        const nc = col + dc;
        if (nr < 0 || nr >= ROWS || nc < 0 || nc >= COLS) continue;
        if (grid[nr][nc] !== "wall") continue;
        grid[row + dr / 2][col + dc / 2] = "path";
        carve(nr, nc);
      }
    };

    carve(0, 0);

    const goalRow = ROWS - 1;
    const goalCol = COLS - 1;
    grid[0][0] = "start";
    grid[goalRow][goalCol] = "goal";

    const maze: Maze = {
      id,
      nameEn: `Random Maze (Level ${level})`,
      nameNl: `Willekeurig Doolhof (Level ${level})`,
      grid,
      start: { row: 0, col: 0, dir: 1 },
      goal: { row: goalRow, col: goalCol },
    };

    if (isSolvable(maze)) return maze;
  }
}

function isSolvable(maze: Maze): boolean {
  const rows = maze.grid.length;
  const cols = maze.grid[0].length;
  const visited = Array.from({ length: rows }, () => Array<boolean>(cols).fill(false));
  const queue: { row: number; col: number }[] = [{ row: maze.start.row, col: maze.start.col }];
  visited[maze.start.row][maze.start.col] = true;

  while (queue.length > 0) {
    const { row, col } = queue.shift()!;
    if (row === maze.goal.row && col === maze.goal.col) return true;
    for (const [dr, dc] of [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ]) {
      const nr = row + dr;
      const nc = col + dc;
      if (nr < 0 || nr >= rows || nc < 0 || nc >= cols) continue;
      if (visited[nr][nc]) continue;
      if (maze.grid[nr][nc] === "wall") continue;
      visited[nr][nc] = true;
      queue.push({ row: nr, col: nc });
    }
  }
  return false;
}

function parseGrid(rows: string[]): TileType[][] {
  const result: TileType[][] = [];
  for (const row of rows) {
    const tiles: TileType[] = [];
    for (const ch of row) {
      switch (ch) {
        case "#":
          tiles.push("wall");
          break;
        case "*":
          tiles.push("goal");
          break;
        case "S":
          tiles.push("start");
          break;
        default:
          tiles.push("path");
          break;
      }
    }
    result.push(tiles);
  }
  return result;
}

export const COMMAND_LABELS: Record<CommandType, { en: string; nl: string }> = {
  forward: { en: "move_forward()", nl: "move_forward()" },
  backward: { en: "move_backward()", nl: "move_backward()" },
  left: { en: "turn_left()", nl: "turn_left()" },
  right: { en: "turn_right()", nl: "turn_right()" },
};

export const PYTHON_COMMANDS: Record<string, CommandType> = {
  move_forward: "forward",
  move_backward: "backward",
  turn_left: "left",
  turn_right: "right",
};
