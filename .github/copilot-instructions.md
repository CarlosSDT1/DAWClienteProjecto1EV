## Purpose
Provide concise, actionable guidance for AI coding agents working on this repo so they can be productive immediately.

## Big Picture
- **App type**: Single-page web app using Vite (`vite`) with vanilla ES modules under `src/`.
- **Major areas**: UI components (`src/components`), game logic (`src/game`), services (`src/services`), and styling (`src/scss`).
- **Entry point**: `src/main.js` — mounts header/footer, subscribes to `userSubject$`, and invokes `router` on hash changes.

## Key Patterns & Conventions
- **Single export pattern for services**: Service modules (e.g. `src/services/supaservice.js`) declare helpers/locals then export a single named export list at the file end. Keep that pattern when refactoring.
- **Supabase abstraction**: `supaservice.js` centralizes API calls via `headerFactory`, `fetchSupabase`, and higher-level helpers like `getData`, `updateData`, `saveGameState`. Follow these helpers for all server interactions.
- **LocalStorage + BehaviorSubject**: Auth and session data live in `localStorage` (keys: `access_token`, `user`, `user_id`, `guestMode`, `oca_game_state`) and runtime user state is pushed through `userSubject$` (an `rxjs` `BehaviorSubject`). When updating auth/user state, update both `localStorage` and `userSubject$.next(...)`.
- **Routing & auth rules**: `src/router.js` controls navigation by hash and enforces auth: protected routes `#game` and `#stats`; auth routes `#login`, `#register`. It uses `getSession()` and `guestMode` and allows a saved game (`oca_game_state`) to bypass auth for `#game`.
- **Web-components style UI**: Components register custom elements (e.g., `game-header`, `game-content`, `game-login`, `game-stats`). Router replaces container children with `document.createElement(elementName)` when `customElements.get(elementName)` exists.

## Data Flow Examples (do this, not that)
- To call the REST API, use `fetchSupabase(url, options)` or `getData('table', { id: value })` rather than sprinkling fetch calls.
- To change request headers, update `headerFactory` (used everywhere). Example: `headerFactory({ Prefer: "return=representation" })`.
- To save game state: call `saveGameState(gameState)` — it will save locally if unauthenticated, otherwise POST to `oca_games`.

## Build & Dev Workflows
- Install & dev server: `npm install` then `npm run dev` (Vite runs on port 5173 per `package.json`).
- Build: `npm run build`. Preview: `npm run preview`.
- Note: `prebuild` script currently runs `rm -rf node_modules && npm install` (POSIX). On Windows this may fail; run `npm run build` manually after installing dependencies.

## Files to Inspect for Context
- `src/services/supaservice.js` — API surface, auth, tokens, `userSubject$` (most important).
- `src/router.js` — route map and auth logic.
- `src/main.js` — app bootstrap and subscriptions.
- `src/game/` — game logic entry (`juego.js`) and `ui/` renderer helpers.
- `src/components/*` — Web component implementations (header, footer, login, stats).

## Rules for Code Changes (project-specific)
- Keep service helpers pure and centralized: add new REST operations to `supaservice.js` rather than duplicating fetch logic.
- When updating UI components, prefer exposing behavior via DOM attributes or events consumed by `main.js`/router rather than global mutation.
- Preserve the `userSubject$` pattern: subscribers expect a BehaviorSubject instance; do not replace it with a plain event emitter.

## Example Edits (quick patterns)
- Add server call: implement helper in `supaservice.js` and export it in the final export list.
- Auth change: update `getBearer()` and `headerFactory()` in `supaservice.js` and ensure localStorage keys remain consistent.
- New route: add mapping in `routes` Map inside `src/router.js`, register a custom element with the same name (e.g., `game-new`) and ensure `customElements.define()` runs before router attempts to instantiate it.

## When You're Unsure
- Grep for `localStorage.getItem('oca_game_state')`, `userSubject$`, or `fetchSupabase` to find related usages.
- Check `src/env.js` for `SUPABASE_URL` / `SUPABASE_KEY` — these are in-repo constants used by services.

---
If anything here is unclear or you want more examples (e.g., exact subscription patterns, sample API calls), tell me which area to expand and I will iterate.
