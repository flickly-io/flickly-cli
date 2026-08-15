#!/usr/bin/env node
import { Command } from "commander";
import { registerAuthCommands } from "./commands/auth.js";
import { registerAppsCommands } from "./commands/apps.js";
import { registerSessionsCommands } from "./commands/sessions.js";
import { printError, setJsonOverride } from "./output.js";

const program = new Command();

program
  .name("flickly")
  .description("Flickly CLI — upload APKs, launch cloud Android devices, manage sessions")
  .version("0.1.0")
  .option("--json", "Force JSON output")
  .option("--no-json", "Force human-readable output")
  .hook("preAction", (thisCommand) => {
    const opts = thisCommand.opts();
    setJsonOverride(opts.json === false ? false : opts.json === true ? true : undefined);
  });

registerAuthCommands(program);
registerAppsCommands(program);
registerSessionsCommands(program);

program
  .parseAsync(process.argv)
  .catch((err) => {
    process.exitCode = printError(err);
  });
