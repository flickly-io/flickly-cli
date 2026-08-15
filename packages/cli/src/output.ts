// Agent/CI-friendly by default: when stdout isn't a TTY (piped, running in a
// script, a GitHub Action, an agent shelling out), output is JSON unless
// --no-json is passed. In a real terminal, output is a human table unless
// --json is passed. Either way `--json`/`--no-json` on the command line wins.
let jsonOverride: boolean | undefined;

export function setJsonOverride(value: boolean | undefined): void {
  jsonOverride = value;
}

export function isJsonMode(): boolean {
  if (jsonOverride !== undefined) return jsonOverride;
  return !process.stdout.isTTY;
}

export function printData(data: unknown, human: (data: unknown) => void): void {
  if (isJsonMode()) {
    process.stdout.write(JSON.stringify(data, null, 2) + "\n");
  } else {
    human(data);
  }
}

export class CliError extends Error {
  code: number;
  constructor(message: string, code = 1) {
    super(message);
    this.code = code;
  }
}

export const ExitCode = {
  Ok: 0,
  Error: 1,
  AuthRequired: 2,
  ApiError: 3,
} as const;

export function printError(err: unknown): number {
  const message = err instanceof Error ? err.message : String(err);
  const code = err instanceof CliError ? err.code : ExitCode.Error;
  if (isJsonMode()) {
    process.stderr.write(JSON.stringify({ error: message }, null, 2) + "\n");
  } else {
    process.stderr.write(`Error: ${message}\n`);
  }
  return code;
}
