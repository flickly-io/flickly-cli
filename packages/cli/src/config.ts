import { existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { homedir } from "node:os";
import { join } from "node:path";

const CONFIG_DIR = join(homedir(), ".flickly");
const CONFIG_PATH = join(CONFIG_DIR, "config.json");
const DEFAULT_API_URL = "https://api.flickly.io";

export type StoredConfig = {
  apiKey?: string;
  apiUrl?: string;
};

function readStoredConfig(): StoredConfig {
  if (!existsSync(CONFIG_PATH)) return {};
  try {
    return JSON.parse(readFileSync(CONFIG_PATH, "utf8")) as StoredConfig;
  } catch {
    return {};
  }
}

export function writeStoredConfig(next: StoredConfig): void {
  mkdirSync(CONFIG_DIR, { recursive: true });
  writeFileSync(CONFIG_PATH, JSON.stringify(next, null, 2) + "\n", { mode: 0o600 });
}

export function clearStoredConfig(): void {
  writeStoredConfig({});
}

// Resolution order: env vars (CI/agent use) > ~/.flickly/config.json (`flickly auth login`) > default.
export function resolveConfig(): { apiKey: string | undefined; apiUrl: string; source: "env" | "file" | "none" } {
  const stored = readStoredConfig();
  const apiKey = process.env.FLICKLY_API_KEY ?? stored.apiKey;
  const apiUrl = process.env.FLICKLY_API_URL ?? stored.apiUrl ?? DEFAULT_API_URL;
  const source = process.env.FLICKLY_API_KEY ? "env" : stored.apiKey ? "file" : "none";
  return { apiKey, apiUrl, source };
}

export { CONFIG_PATH, DEFAULT_API_URL };
