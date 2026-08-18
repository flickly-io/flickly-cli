---
name: flickly
description: Upload Android APKs to Flickly and launch/manage cloud-streamed Android device sessions. Use when the user asks to upload an APK, test an app on a real device, launch/stop a Flickly session, or check Flickly usage/status.
---

You have access to the `flickly` CLI — it talks to the user's real Flickly account (uploaded APKs, running device sessions). Prefer it over explaining how to do this manually in a browser.

## Before running any command

Check the CLI is installed and the user is authenticated:

```
flickly auth status --json
```

- If the command isn't found, install it first: `npm install -g flickly` (or suggest `npx flickly <command>` for a one-off without installing).
- If `authenticated` is `false`, the user needs an API key. Tell them to create one at `https://flickly.io/app/settings/api-keys` (owner-only), then either:
  - `flickly auth login --api-key <key>` (persists to `~/.flickly/config.json`), or
  - `export FLICKLY_API_KEY=<key>` for a one-off/session-scoped credential (preferred if you're operating in a sandboxed/ephemeral environment — nothing gets written to disk).

Never ask the user to paste their API key into the chat for you to type into a command yourself if they can run the `auth login` command directly — treat it like a password.

## Always pass `--json`

Every command below supports `--json` for structured output — always use it (don't rely on TTY auto-detection, which is meant for interactive terminals, not tool calls). Parse the JSON rather than screen-scraping human-formatted text.

## Commands

**Apps (APKs)**
```
flickly apps list --json                    # id, name, status, versionName for each app
flickly apps upload <path/to/app.apk> --json # returns { id, name, status }
flickly apps rm <appId> --json
```

**Sessions (cloud Android devices)**
```
flickly sessions launch --app <appId> --json          # omit --app to use the org's most recent ready app
flickly sessions list --json
flickly sessions view <sessionId> --json               # includes viewUrl once state is "ready"
flickly sessions stop <sessionId> --json
```
`sessions launch` also accepts `--max-duration <seconds>` and `--idempotency-key <key>` (safe to retry with the same key — returns the existing session instead of creating a duplicate).

A freshly launched session starts in `state: "requested"` or `"provisioning"`, not `"ready"` — if the user wants to actually view/use it, poll `sessions view <id>` every few seconds until `state` is `"ready"` (or `"failed"`), then hand them the `viewUrl`. Don't just report the initial launch response as if the device were up yet.

**Auth**
```
flickly auth login --api-key <key> [--url <url>]   # --url only needed for a non-default API host
flickly auth logout
flickly auth whoami --json
flickly auth status --json
```

## Exit codes — check these, don't just parse stdout

- `0` — success
- `1` — general error
- `2` — not authenticated / invalid API key → walk the user through `auth login` again
- `3` — API error (bad request, quota exceeded, no capacity, etc.) — the JSON error message on stderr explains why; relay it plainly rather than guessing

## Example: "upload this APK and launch it"

```
flickly apps upload ./app-release.apk --json
# → { "id": "app_abc123", "status": "ready", ... }   (the call blocks until malware scan + upload finish — status is always "ready" by the time this returns, or it exits non-zero with why it failed)
flickly sessions launch --app app_abc123 --json
# → { "id": "sess_xyz789", "state": "provisioning", ... }
flickly sessions view sess_xyz789 --json
# → poll until state is "ready", then share viewUrl
```
