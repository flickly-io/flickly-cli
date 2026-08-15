import { Command } from "commander";
import { apiFetch } from "../api-client.js";
import { printData } from "../output.js";

type Session = {
  id: string;
  state: string;
  appId: string | null;
  requestedAt: string;
  viewUrl?: string;
  failureCode?: string;
};

export function registerSessionsCommands(program: Command): void {
  const sessions = program.command("sessions").description("Manage device sessions");

  sessions
    .command("launch")
    .description("Launch a device session")
    .option("--app <appId>", "App id to launch (defaults to the org's most recent ready app)")
    .option("--max-duration <seconds>", "Max session duration in seconds", (v) => parseInt(v, 10))
    .option("--idempotency-key <key>", "Idempotency key — repeat calls with the same key return the same session")
    .action(async (opts: { app?: string; maxDuration?: number; idempotencyKey?: string }) => {
      const session = await apiFetch<Session>("/v1/sessions", {
        method: "POST",
        body: { appId: opts.app, maxDurationSec: opts.maxDuration },
        ...(opts.idempotencyKey ? { headers: { "Idempotency-Key": opts.idempotencyKey } } : {}),
      });
      printData(session, (d) => {
        const s = d as Session;
        console.log(`Session ${s.id}: ${s.state}`);
      });
    });

  sessions
    .command("list")
    .description("List recent sessions")
    .action(async () => {
      const { data } = await apiFetch<{ data: Session[] }>("/v1/sessions");
      printData(data, (d) => {
        const rows = d as Session[];
        if (rows.length === 0) return console.log("No sessions yet.");
        for (const s of rows) console.log(`${s.id}  ${s.state.padEnd(12)}  app=${s.appId ?? "(default)"}`);
      });
    });

  sessions
    .command("view <id>")
    .description("Get a session's status and viewer URL (once ready)")
    .action(async (id: string) => {
      const s = await apiFetch<Session>(`/v1/sessions/${encodeURIComponent(id)}`);
      printData(s, (d) => {
        const row = d as Session;
        console.log(`${row.id}: ${row.state}${row.viewUrl ? `\n${row.viewUrl}` : ""}`);
      });
    });

  sessions
    .command("stop <id>")
    .description("Stop a session")
    .action(async (id: string) => {
      await apiFetch(`/v1/sessions/${encodeURIComponent(id)}`, { method: "DELETE" });
      printData({ ok: true, id }, () => console.log(`Stopped ${id}`));
    });
}
