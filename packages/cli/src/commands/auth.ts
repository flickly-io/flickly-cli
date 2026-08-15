import { Command } from "commander";
import { apiFetch } from "../api-client.js";
import { CONFIG_PATH, clearStoredConfig, resolveConfig, writeStoredConfig } from "../config.js";
import { printData } from "../output.js";

type Whoami = { orgId: string; orgName?: string; apiKeyId?: string };

export function registerAuthCommands(program: Command): void {
  const auth = program.command("auth").description("Manage Flickly authentication");

  auth
    .command("login")
    .description("Store an API key (create one at https://flickly.io/app/settings/api-keys)")
    .requiredOption("--api-key <key>", "API key (sk_live_…)")
    .option("--url <url>", "Flickly API base URL (defaults to https://api.flickly.io)")
    .action(async (opts: { apiKey: string; url?: string }) => {
      writeStoredConfig({ apiKey: opts.apiKey, apiUrl: opts.url });
      // Verify the key actually works before declaring success.
      const me = await apiFetch<Whoami>("/v1/whoami");
      printData(
        { loggedIn: true, ...me, configPath: CONFIG_PATH },
        () => console.log(`Logged in to org ${me.orgName ?? me.orgId}. Saved to ${CONFIG_PATH}`),
      );
    });

  auth
    .command("logout")
    .description("Remove the stored API key")
    .action(() => {
      clearStoredConfig();
      printData({ loggedOut: true }, () => console.log("Logged out."));
    });

  auth
    .command("whoami")
    .description("Show the currently authenticated org")
    .action(async () => {
      const me = await apiFetch<Whoami>("/v1/whoami");
      printData(me, () => console.log(`Org: ${me.orgName ?? me.orgId}${me.apiKeyId ? ` (key ${me.apiKeyId})` : ""}`));
    });

  auth
    .command("status")
    .description("Show where the CLI is currently reading credentials from")
    .action(() => {
      const { apiKey, apiUrl, source } = resolveConfig();
      const data = { authenticated: !!apiKey, apiUrl, source };
      printData(data, () =>
        console.log(
          apiKey
            ? `Authenticated (source: ${source === "env" ? "FLICKLY_API_KEY env var" : CONFIG_PATH}), API URL: ${apiUrl}`
            : `Not authenticated. API URL: ${apiUrl}`,
        ),
      );
    });
}
