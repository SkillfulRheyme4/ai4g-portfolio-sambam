import type { CommandType, Condition, Instruction } from "./engine";
import { PYTHON_COMMANDS } from "./mazes";

export interface ParseResult {
  commands: CommandType[] | null;
  error: string | null;
}

/**
 * Parse Python-style code into a list of commands.
 * Supports:
 *   - move_forward()
 *   - turn_left()
 *   - etc.
 * Ignores blank lines and comments (lines starting with #).
 */
export function parseCode(code: string): ParseResult {
  const lines = code.split("\n");

  if (code.trim() === "") {
    return { commands: null, error: "EMPTY" };
  }

  const commands: CommandType[] = [];

  for (let i = 0; i < lines.length; i++) {
    const raw = lines[i];
    const line = raw.trim();

    // skip blank lines and comments
    if (line === "" || line.startsWith("#")) continue;

    // must end with ()
    const match = line.match(/^([a-z_]+)\(\)$/i);
    if (!match) {
      return {
        commands: null,
        error: `SYNTAX:${i + 1}:${line}`,
      };
    }

    const fnName = match[1];
    const cmd = PYTHON_COMMANDS[fnName];
    if (!cmd) {
      return {
        commands: null,
        error: `UNKNOWN:${i + 1}:${fnName}`,
      };
    }

    commands.push(cmd);
  }

  if (commands.length === 0) {
    return { commands: null, error: "EMPTY" };
  }

  return { commands, error: null };
}

export interface ProgramParseResult {
  program: Instruction[] | null;
  error: string | null;
}

const CONDITIONS: Record<string, Condition> = {
  wall_ahead: "wall_ahead",
  path_ahead: "path_ahead",
};

interface Token {
  indent: number;
  text: string;
  line: number;
}

/**
 * Parse Python-style code into an instruction tree.
 * Supports everything parseCode() does, plus indented blocks:
 *   repeat(3):
 *       move_forward()
 *   if wall_ahead():
 *       turn_left()
 *   else:
 *       move_forward()
 * When options.allowConditionals is false, if/else blocks are rejected
 * (used by Advanced mode, which only introduces repeat loops).
 */
export function parseProgram(code: string, options?: { allowConditionals?: boolean }): ProgramParseResult {
  const allowConditionals = options?.allowConditionals ?? true;

  if (code.trim() === "") {
    return { program: null, error: "EMPTY" };
  }

  const rawLines = code.split("\n");
  const tokens: Token[] = [];

  for (let i = 0; i < rawLines.length; i++) {
    const raw = rawLines[i];
    const trimmed = raw.trim();
    if (trimmed === "" || trimmed.startsWith("#")) continue;
    const indent = raw.length - raw.trimStart().length;
    tokens.push({ indent, text: trimmed, line: i + 1 });
  }

  if (tokens.length === 0) {
    return { program: null, error: "EMPTY" };
  }

  let errorMsg: string | null = null;

  // Parses a sequence of statements that all share the same indent level.
  const parseBlock = (indent: number, pos: { i: number }): Instruction[] => {
    const instructions: Instruction[] = [];

    while (pos.i < tokens.length && tokens[pos.i].indent === indent && !errorMsg) {
      const tok = tokens[pos.i];

      const repeatMatch = tok.text.match(/^repeat\((\d+)\):$/);
      const ifMatch = tok.text.match(/^if\s+(wall_ahead|path_ahead)\(\):$/);
      const elseMatch = tok.text.match(/^else:$/);
      const cmdMatch = tok.text.match(/^([a-z_]+)\(\)$/i);

      if (repeatMatch) {
        const count = parseInt(repeatMatch[1], 10);
        pos.i++;
        const body = parseChildBlock(indent, pos, tok.line);
        if (errorMsg) return instructions;
        instructions.push({ kind: "repeat", count, body });
      } else if (ifMatch) {
        if (!allowConditionals) {
          errorMsg = `NOCONDITIONAL:${tok.line}`;
          return instructions;
        }
        const condition = CONDITIONS[ifMatch[1]];
        pos.i++;
        const body = parseChildBlock(indent, pos, tok.line);
        if (errorMsg) return instructions;
        let elseBody: Instruction[] | null = null;
        if (pos.i < tokens.length && tokens[pos.i].indent === indent && tokens[pos.i].text === "else:") {
          const elseLine = tokens[pos.i].line;
          pos.i++;
          elseBody = parseChildBlock(indent, pos, elseLine);
          if (errorMsg) return instructions;
        }
        instructions.push({ kind: "if", condition, body, elseBody });
      } else if (elseMatch) {
        errorMsg = `SYNTAX:${tok.line}:${tok.text}`;
        return instructions;
      } else if (cmdMatch) {
        const fnName = cmdMatch[1];
        const cmd = PYTHON_COMMANDS[fnName];
        if (!cmd) {
          errorMsg = `UNKNOWN:${tok.line}:${fnName}`;
          return instructions;
        }
        instructions.push({ kind: "cmd", cmd });
        pos.i++;
      } else {
        errorMsg = `SYNTAX:${tok.line}:${tok.text}`;
        return instructions;
      }
    }

    return instructions;
  };

  // Parses the indented block that must follow a ":" line.
  const parseChildBlock = (parentIndent: number, pos: { i: number }, colonLine: number): Instruction[] => {
    if (pos.i >= tokens.length || tokens[pos.i].indent <= parentIndent) {
      errorMsg = `INDENT:${colonLine}`;
      return [];
    }
    const childIndent = tokens[pos.i].indent;
    return parseBlock(childIndent, pos);
  };

  const pos = { i: 0 };
  const program = parseBlock(tokens[0].indent, pos);

  if (errorMsg) {
    return { program: null, error: errorMsg };
  }

  if (pos.i < tokens.length) {
    // Leftover tokens mean an unexpected dedent/indent mismatch.
    return { program: null, error: `SYNTAX:${tokens[pos.i].line}:${tokens[pos.i].text}` };
  }

  if (program.length === 0) {
    return { program: null, error: "EMPTY" };
  }

  return { program, error: null };
}
