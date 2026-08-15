import { readFileSync } from "node:fs";
import { basename } from "node:path";
import { Command } from "commander";
import { apiFetch, apiUpload } from "../api-client.js";
import { printData } from "../output.js";

type App = {
  id: string;
  name: string;
  packageName?: string;
  versionName?: string;
  status: string;
  restricted: boolean;
  createdAt: string;
};

export function registerAppsCommands(program: Command): void {
  const apps = program.command("apps").description("Manage uploaded APKs");

  apps
    .command("list")
    .description("List apps visible to your org")
    .action(async () => {
      const { data } = await apiFetch<{ data: App[] }>("/v1/apps");
      printData(data, (d) => {
        const rows = d as App[];
        if (rows.length === 0) return console.log("No apps uploaded yet. Run `flickly apps upload <file.apk>`.");
        for (const a of rows) {
          console.log(`${a.id}  ${a.status.padEnd(10)}  ${a.name}${a.versionName ? ` (${a.versionName})` : ""}`);
        }
      });
    });

  apps
    .command("upload <file>")
    .description("Upload an APK")
    .action(async (file: string) => {
      const bytes = readFileSync(file);
      const app = await apiUpload<App>("/v1/apps", basename(file), bytes);
      printData(app, (d) => {
        const a = d as App;
        console.log(`Uploaded: ${a.id}  ${a.name}  (status: ${a.status})`);
      });
    });

  apps
    .command("rm <id>")
    .description("Delete an app")
    .action(async (id: string) => {
      await apiFetch(`/v1/apps/${encodeURIComponent(id)}`, { method: "DELETE" });
      printData({ ok: true, id }, () => console.log(`Deleted ${id}`));
    });
}
