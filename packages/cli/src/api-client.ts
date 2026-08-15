import { resolveConfig } from "./config.js";
import { CliError, ExitCode } from "./output.js";

export type ApiOptions = {
  method?: "GET" | "POST" | "PATCH" | "DELETE";
  body?: unknown;
  query?: Record<string, string | undefined>;
  headers?: Record<string, string>;
};

export async function apiFetch<T = unknown>(path: string, opts: ApiOptions = {}): Promise<T> {
  const { apiKey, apiUrl } = resolveConfig();
  if (!apiKey) {
    throw new CliError(
      "Not logged in. Run `flickly auth login --api-key <key>` or set FLICKLY_API_KEY.",
      ExitCode.AuthRequired,
    );
  }

  const url = new URL(path, apiUrl);
  if (opts.query) {
    for (const [k, v] of Object.entries(opts.query)) {
      if (v !== undefined) url.searchParams.set(k, v);
    }
  }

  const res = await fetch(url, {
    method: opts.method ?? "GET",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      ...(opts.body ? { "Content-Type": "application/json" } : {}),
      ...opts.headers,
    },
    body: opts.body ? JSON.stringify(opts.body) : undefined,
  });

  if (res.status === 401) {
    throw new CliError("Invalid or revoked API key. Run `flickly auth login` again.", ExitCode.AuthRequired);
  }

  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    const message = data?.error?.message ?? `Request failed (${res.status})`;
    throw new CliError(message, ExitCode.ApiError);
  }

  return data as T;
}

export async function apiUpload<T = unknown>(path: string, filename: string, bytes: Buffer): Promise<T> {
  const { apiKey, apiUrl } = resolveConfig();
  if (!apiKey) {
    throw new CliError(
      "Not logged in. Run `flickly auth login --api-key <key>` or set FLICKLY_API_KEY.",
      ExitCode.AuthRequired,
    );
  }

  const form = new FormData();
  form.append("apk", new Blob([bytes]), filename);

  const res = await fetch(new URL(path, apiUrl), {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}` },
    body: form,
  });

  const text = await res.text();
  const data = text ? JSON.parse(text) : undefined;

  if (!res.ok) {
    const message = data?.error?.message ?? `Upload failed (${res.status})`;
    throw new CliError(message, ExitCode.ApiError);
  }

  return data as T;
}
