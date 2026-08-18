# Flickly CLI

Command-line access to [Flickly](https://flickly.io) — upload APKs, launch cloud Android
devices, and manage streaming sessions. Built to be scriptable, CI-friendly, and usable
by coding agents, not just humans at a terminal.

## Install

```bash
npm install -g flickly
```

Or run one-off without installing: `npx flickly <command>`.

To run from source instead:

```bash
npm install
npm run build -w flickly
npm link -w flickly   # exposes `flickly` globally
```

## Authenticate

Create an API key at `https://flickly.io/app/settings/api-keys` (owner-only), then:

```bash
flickly auth login --api-key sk_live_xxxxx
```

For CI or agents, skip the config file entirely and set an env var instead:

```bash
export FLICKLY_API_KEY=sk_live_xxxxx
export FLICKLY_API_URL=https://api.flickly.io   # optional, this is the default
```

## Usage

```bash
flickly apps list
flickly apps upload ./build/app-release.apk
flickly sessions launch --app <appId>
flickly sessions list
flickly sessions view <sessionId>
flickly sessions stop <sessionId>
```

## Agent- and CI-friendly by design

- **Output format auto-detects**: piped/non-TTY output (scripts, CI, agents) defaults to
  JSON; a real terminal defaults to human-readable text. Override either way with
  `--json` / `--no-json`.
- **Env-var auth**: `FLICKLY_API_KEY` / `FLICKLY_API_URL` need no config file — set them
  and go, which is what a GitHub Action or an agent sandbox should do.
- **Exit codes**: `0` success, `1` general error, `2` auth required/invalid, `3` API
  error (4xx/5xx from the server) — script against these instead of parsing text.
- **Idempotency**: `sessions launch --idempotency-key <key>` is safe to retry.

## Architecture

This is an npm workspace so the pieces below can land without restructuring:

- `packages/cli` — the `flickly` binary, [published to npm](https://www.npmjs.com/package/flickly).
- `plugins/claude-code` — a Claude Code plugin (see its own README) that teaches Claude to
  drive the CLI directly. Not yet in a marketplace — install locally with
  `claude --plugin-dir ./plugins/claude-code`.
- *(planned)* a Codex CLI plugin — same idea, for OpenAI's Codex CLI.
- *(planned)* a reusable composite GitHub Action wrapping common CLI calls (e.g.
  "upload this APK and launch a session as part of CI").

## License

MIT
