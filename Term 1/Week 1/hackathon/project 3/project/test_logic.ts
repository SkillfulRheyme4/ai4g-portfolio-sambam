import { MAZES } from "./src/game/mazes";
import { shortestPathMoves, executeCommands, calculateStars, type CommandType } from "./src/game/engine";

for (const m of MAZES) {
  const opt = shortestPathMoves(m);
  console.log(`Maze ${m.id} (${m.nameEn}): optimal=${opt} moves, start=(${m.start.row},${m.start.col}) dir=${m.start.dir}, goal=(${m.goal.row},${m.goal.col})`);
}

// Test maze 1: 4x4 grid
// ....
// .##.
// .##.
// ...*
// Start (0,0) facing right, goal (3,3)
// Optimal path: forward*3 (to 0,3), turn_right, forward*3 (to 3,3) = 6 moves + 1 turn
const m1 = MAZES[0];
const testCmds: CommandType[] = ["forward", "forward", "forward", "turn_right", "forward", "forward", "forward"];
const result = executeCommands(m1, testCmds);
console.log("\nMaze 1 test (forward x3, turn_right, forward x3):");
console.log("  reachedGoal:", result.reachedGoal, "totalMoves:", result.totalMoves, "error:", result.error);

const opt1 = shortestPathMoves(m1)!;
const stars = calculateStars(result.totalMoves, opt1, result.reachedGoal);
console.log("  stars:", stars.stars, "(optimal:", opt1, ", moves:", result.totalMoves, ")");

// Test wall collision
const wallCmds: CommandType[] = ["turn_right", "forward"]; // facing up at (0,0), turn right -> right, forward -> (0,1) ok
const wallResult = executeCommands(m1, wallCmds);
console.log("\nWall test (turn_right, forward from 0,0):");
console.log("  reachedGoal:", wallResult.reachedGoal, "moves:", wallResult.totalMoves, "error:", wallResult.error);
