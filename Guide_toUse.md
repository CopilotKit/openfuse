# Guide to Use (OpenFuse)

All commands below assume you are in the repo root unless stated otherwise:

`C:\Users\Tapas\Documents\open_muse_test\openfuse_2026\openfuse`

## Prerequisites
- Node.js (see `engines`/workspace requirements in repo; typically Node 20+)
- pnpm (repo uses pnpm workspaces)
- Python 3 (for `run.py` / `stop.py`)
- Optional: `OPENAI_API_KEY` (or configure models via your setup) for chat model usage

## Install dependencies (full workspace)
```bash
pnpm install
```
If you hit lockfile issues in CI-like installs, `run.py` uses `pnpm install --frozen-lockfile`.

## Run everything (recommended)
From repo root:
```bash
python run.py
```
What it does (high level):
- Installs deps if needed (frozen lockfile in script flow)
- Starts server and mobile (Expo) processes

Stop:
```bash
python stop.py
```

## Run services manually (alternative)

### Server
```bash
cd apps/server
pnpm install
pnpm run dev
```
Server env/config: see `apps/server/.env.example` (copy to `.env` as needed). Common vars include ports/URLs and any model/API keys your setup requires.

### Mobile (Expo)
```bash
cd apps/mobile
pnpm install
pnpm run start
```
Then follow Expo prompts (Android/iOS/web). Ensure `apps/mobile/.env` / config points to your local server if required.

## Type checks
From repo root (workspace):
```bash
pnpm -r run typecheck
```
Or server only:
```bash
cd apps/server
npx tsc --noEmit
```
Mobile (if script exists):
```bash
cd apps/mobile
pnpm run typecheck
```

## Database (local/dev notes)
- Docs: `docs/DATABASE.md`, `docs/CLEAR_DATABASE.md`
- Typical local data lives under server data dirs as described in those docs (clear/reset steps are documented there). Always back up if unsure.

## Useful API notes (relevant to this repo)
- Files/chat uploads: server accepts common doc/image types (see app/routes and `apps/server/src/files.ts`).
- Images (agent avatar upload helpers): `POST /api/images`, `POST /api/images/from-url`, `GET /api/images/:id/content` (auth as implemented).
- Identity (agent name/avatar/pov etc.): `GET /api/identity`, `POST /api/identity`.

## Chat slash commands
Type a command in the chat composer and send it. Commands are handled in the chat UI.

### Conversation & control
| Command | What it does | Notes |
| --- | --- | --- |
| `/help`, `/commands` | Show available commands and tips | Safe to run anytime |
| `/new`, `/reset` | Start a fresh chat | In rich threads this starts a new side chat; in local mode it clears current conversation and starts fresh. Stop an active reply and resolve save issues first. |
| `/clear`, `/delete`, `/deletechat` | Delete this chat's conversation history | Removes messages/history for the current conversation. **Does not** remove saved memories. Stop an active reply and resolve save issues first. In local mode history is cleared and saved as empty. |
| `/stop` | Stop the current reply | If nothing is running, reports there is no active reply |

### Status & identity
| Command | What it does |
| --- | --- |
| `/status` | Show mode, readiness/busy/sync state, thread, rich-threads state, queue, message count, and memory count |
| `/whoami`, `/id` | Show your profile info and the agent name/mode/configured state |

### Memory (forget)
| Command | What it does | Notes |
| --- | --- | --- |
| `/forget` | Show how to forget saved memory | Memory forget erases what the agent should not remember; it does **not** delete chat history |
| `/forget <text or keyword>` | Forget a matching saved memory | Matches against saved memories; if one match is found it is removed from memory. If multiple match, be more specific. You can also review/edit/forget memories in **Apps → Personality & memory** |

### Delete types (important)
- **Delete chat history** (`/clear`, `/delete`, `/deletechat`, or thread delete/remove in Threads): removes conversation messages/history for that chat/thread. Use for unnecessary conversations. This does **not** erase saved memories.
- **Forget memory** (`/forget` or "Forget memory" in Personality & memory): removes saved memory so the agent should not remember it. Use when something was remembered but should be erased. This does **not** delete chat history.

### Thread deletion in Threads menu
- **Remove** (unsaved side chat): removes the side chat from the current thread list.
- **Delete chat** (saved thread, when supported): deletes that conversation/thread history.
- **Remove/Archive fallback** (if true thread delete is unavailable): archives/removes the thread from the active list; saved memories are not changed.

### Other identity helpers
- Set name (examples the assistant understands): `set my name to Alice`, `my name is Alice`, `change your name to Alice`
- Set avatar by URL/reference: `/avatar https://example.com/pic.png` or `set your avatar to https://example.com/pic.png`
- Device image uploads: use the app UI (chat menu / Apps → Personality & memory) to upload, then apply the returned URL/reference if needed.
## Git / push policy (important)
- Do **not** push without explicit user permission.
- Always ask before pushing; only push if the user says **`push now`** (each time).

## Common troubleshooting
- If ports are busy, stop with `python stop.py` or end the Node/Python processes, then rerun.
- If mobile can’t reach server, verify server URL in mobile env/config and that server is running.
- After dependency changes: rerun `pnpm install` at root.

## Quick command checklist
```bash
# install
pnpm install

# run (all)
python run.py

# stop
python stop.py

# typecheck all workspaces (if configured)
pnpm -r run typecheck

# server only typecheck
cd apps/server && npx tsc --noEmit
```
