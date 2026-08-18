# Flickly GitHub Action

Uploads an APK to Flickly and, optionally, launches a cloud Android session with it — for CI
pipelines that want to build an APK and get a live, streamable device out of the same run
(smoke tests, PR previews, manual QA links).

Wraps the [`flickly`](https://www.npmjs.com/package/flickly) CLI as a composite action — no
Docker image, no custom runtime, just the same CLI you'd run locally.

## Usage

```yaml
- name: Upload to Flickly
  uses: flickly-io/flickly-cli@v1
  id: flickly
  with:
    api-key: ${{ secrets.FLICKLY_API_KEY }}
    apk-path: ./app/build/outputs/apk/release/app-release.apk
    launch-session: true

- name: Comment the device link
  run: echo "Test it live: ${{ steps.flickly.outputs.view-url }}"
```

Create the API key at `https://flickly.io/app/settings/api-keys` (owner-only) and store it as
a repo secret — never commit it.

## Inputs

| Input | Required | Default | Description |
|---|---|---|---|
| `api-key` | yes | — | Flickly API key |
| `apk-path` | yes | — | Path to the `.apk` file to upload |
| `api-url` | no | `https://api.flickly.io` | Override for self-hosted/staging setups |
| `launch-session` | no | `false` | Launch a device session with the uploaded app |
| `wait-for-ready` | no | `true` | Poll until the launched session is `ready`/`failed` before finishing the step |
| `wait-timeout-seconds` | no | `120` | How long to poll before failing the step |
| `cli-version` | no | `latest` | Pin a specific `flickly` npm version |

## Outputs

| Output | Set when | Description |
|---|---|---|
| `app-id` | always | The uploaded app's id |
| `session-id` | `launch-session: true` | The launched session's id |
| `session-state` | `launch-session: true` + `wait-for-ready: true` | Final observed state (`ready` or `failed`) |
| `view-url` | same, and only once `ready` | URL to view the running device |

If the session ends up `failed` (e.g. no device capacity), the step fails the job — set
`wait-for-ready: false` if you'd rather just fire-and-forget the launch and check status
yourself later with `flickly sessions view`.

## Cost note

`launch-session: true` starts a real, billed device session, same as launching one from the
dashboard. `apk-path` upload alone does not.
