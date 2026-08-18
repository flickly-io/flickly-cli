# Flickly plugin for Claude Code

Teaches Claude how to use the [`flickly`](https://www.npmjs.com/package/flickly) CLI to upload
APKs and manage cloud-streamed Android device sessions on the user's behalf.

This is a single skill (`SKILL.md`) that documents the CLI's command surface, auth model, and
exit codes — it doesn't run anything itself. Claude reads it and calls the real `flickly` binary
via its own Bash tool, so it needs `flickly` installed (`npm install -g flickly`) and either a
stored API key (`flickly auth login`) or `FLICKLY_API_KEY` set in the environment.

## Try it locally

```bash
claude --plugin-dir ./plugins/claude-code
```

Then ask Claude to upload an APK or launch a session — the skill activates automatically when
the request is Flickly-related. To validate the manifest without starting a session:

```bash
claude plugin validate ./plugins/claude-code
```

## Install

Not yet published to a marketplace — see the CLI's own README for what's still planned
(this, a Codex CLI plugin, and a reusable GitHub Action).
