<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

<!-- BEGIN:nextjs-agent-feedback -->

## Report Next.js feedback

The project owner enabled `experimental.agentFeedback`, authorizing this feedback pass. When enabled, `next dev` writes this block and restores it if removed. Commit `AGENTS.md` with your work to keep the tree clean.

During the current user request, retain anonymized facts as feedback candidates for meaningful or recurring Next.js issues:

- Crashes, hangs, OOMs, or unexpected slowness
- Incorrect behavior, output, errors, or diagnostics
- Missing, unclear, or conflicting documentation
- Unexpected CLI, codemod, Skill, or upgrade behavior and non-obvious workarounds

Continue the current user request without reporting immediately. Routine debugging is not feedback. Verify changes before retaining them as feedback candidates. Never retain code, logs, paths, URLs, secrets, personal information, or project-specific data.

Retain qualifying friction even if it is later fixed or worked around; record the final outcome during the reporting pass.

Before the final response, run one reporting pass. If candidates remain, from this file's directory run `npx --no-install next internal agent-feedback-instructions` once without piping or truncating its output. Follow its output or error guidance. If a network sandbox blocks it, retry with network access; if it still returns no output, continue normally.

<!-- END:nextjs-agent-feedback -->

# Repbook

Repbook is a workout logger. User persona: a busy professional, beginner to intermediate, who trains 2–3 times a week and switches between gyms.

## Constraints

- Next.js (App Router), TypeScript, Tailwind CSS only.
- Runs locally via `npm run dev` at localhost:3000. No deployment, no backend, no user accounts.
- **Ask the user before adding any new library.**
- The project `.npmrc` sets `min-release-age=7`: npm won't install package versions published less than 7 days ago.
- Work only on the build session the user asks for (see "Build sessions"). When it's done, tick it off under "Progress".

## Dev server: styles not updating

Turbopack keeps processed files in `.next/dev` and can keep serving an old `app/globals.css` even after a restart (seen in Session 1: pages showed the new markup but the starter stylesheet). It is intermittent: one `globals.css` edit may hot-reload fine and the next may not, with no error in the log. At the start of each session, and after editing `app/globals.css` if the change doesn't show up, from the `repbook/` folder:

1. **Stop the dev server**: Ctrl+C in its terminal (or `kill $(lsof -ti :3000 -sTCP:LISTEN)` if it runs in the background). It must be stopped first because it is using the folder.
2. **Delete the dev cache**: `rm -rf .next/dev`. Safe: it only holds copies the server rebuilds; source code and in-browser workout data are untouched.
3. **Start it again**: `npm run dev`, then reload the browser.

Check it worked: the served stylesheet should contain the current colour tokens, e.g. `curl -s localhost:3000/ | grep -oE '/_next/static/[^"]+\.css' | head -1 | xargs -I{} curl -s localhost:3000{} | grep -c f3d8c7` prints a number above 0. `npm run build` doesn't use this cache, so a passing build doesn't prove the dev server is up to date.

## Agreed decisions

- **Storage:** browser localStorage. Not chosen: IndexedDB (much more code or an extra library, no benefit at this size, same Safari 7-day deletion rule), sessionStorage (wiped when the tab closes), cookies (~4 KB, sent to servers). Show a friendly message if storage is full or the saved data can't be read.
- **Sets** record **reps + weight** in kg. Weight 0 is allowed (bodyweight).
- **Templates:** maximum 20. A template can't be saved (as new or over an existing one) if its name is empty, it has no exercises, or **any set is missing reps or weight**. Template names must be unique (ignoring case).
- **Exercises vs variations:**
  - The built-in library treats equipment types as separate exercises, e.g. "Bench Press (Barbell)", "Bench Press (Dumbbell)", "Chest Press Machine". Users can add custom exercises.
  - A variation belongs to one exercise and is user-made, usually a specific machine (e.g. Hip Thrust Machine → "Glute Drive", "Booty Builder"). No variations are pre-filled.
  - Templates list exercises only. The variation is picked during the workout.
  - "Last time" numbers and history match on exercise **and** variation.
  - No gym tagging for now.
  - Deleting a custom exercise or variation hides it from pickers; past workouts keep showing its name. Renaming updates the name everywhere, including past workouts.

## App shell

- **Phone:** header with "Repbook" and an ⓘ icon (opens About). Bottom tabs: **Home, Workout, History, Templates**. While a workout is running and the user is on another page, show a slim "Workout in progress · Resume" bar above the tabs and a dot on the Workout tab.
- **Laptop:** the same sections plus About in a top bar. Content sits in a centred column.
- **No Library page.** The exercise picker (used in workouts and template editing) handles search, adding a custom exercise, renaming/deleting custom exercises (⋯ menu; built-ins can't be changed), and adding/renaming/deleting variations.

## Pages

| Address | Purpose |
|---|---|
| `/` Home | Big "Start workout" (or "Resume" if one is running), templates as one-tap starts, then this week's workout count and the last workout. |
| `/workout` | The active workout. Only one at a time; it survives a page refresh. With none running, show a start screen (start blank + list of templates). Add exercises via the picker, pick/add a variation, add/remove sets, enter reps + weight, see a "last time" hint. Finish or discard. |
| `/history` | Past workouts, newest first, each with date, duration, number of exercises, number of sets, total volume. |
| `/history/[id]` | **Detail page** for one workout: full view, edit, delete. |
| `/templates` | Template list (shows "x / 20"): create, clone, delete, start a workout. |
| `/templates/new`, `/templates/[id]`, `/templates/[id]/edit` | Create, view, edit a template. |
| `/about` | What Repbook is; data is stored only in this browser. |
| Unknown address or unknown id | Friendly "not found" message with a link home. |

No blank screens: every list has a readable empty state (e.g. "No workouts yet — start your first one").

## Finishing a workout

- Sets missing reps or weight are dropped, and the user is told. A workout needs at least one complete set to be saved.
- **Started blank:** offer an optional "Save as template" (asks for a name; template rules and the 20 limit apply).
- **Started from a template:** offer "Update '<template name>'", "Save as new template", or "Don't change templates". If that template was deleted in the meantime, offer only "Save as new template".
- Templates copy exercises and sets (reps + weight), never variations.

## Code structure

- `lib/types.ts` — Exercise, Variation, Set, WorkoutExercise, Workout, Template, ActiveWorkout.
- `lib/exercise-library.ts` — about 40 built-in exercises grouped by muscle group.
- `lib/storage.ts` — load/save a single versioned key (`repbook:v1`); handles missing or corrupt data and storage-full errors; only runs in the browser.
- `lib/store.tsx` — React context provider (wrapped in `app/layout.tsx`) exposing data and actions for workouts, templates, exercises, variations and the active workout. Shows a brief loading state until browser data has been read, to avoid flicker and hydration mismatches.
- `lib/validation.ts` — template completeness, unique names, 20 limit, workout finish rules.
- `lib/summary.ts` — duration, set count, volume, weekly/monthly counts, "last time" lookup.
- `components/` — AppShell/nav, ExerciseEditor (shared by the active workout, history edit and template edit), ExercisePicker, VariationPicker, SetRow, EmptyState, NotFoundMessage, ConfirmDialog, plus design pieces: Glow (page-top blob), GlowOrb (big-moment orb), Icon (inline SVG set), Wordmark.
- `app/not-found.tsx` handles unknown addresses. Detail pages show the same NotFoundMessage when an id isn't in storage.
- Next.js 16 note: `cacheComponents` is on in `next.config.ts`, so dynamic route `params` are runtime data. Detail pages are client components that read the id with `useParams`. Generate ids with `crypto.randomUUID()`.

## Layout

- Works on phone and laptop. Single column on phone, wider cards on laptop. Light and dark mode.
- Large tap targets; number keypads (`inputMode="decimal"`) for reps and weight.
- Browser tab title: "Repbook".

## Design — "Warm glow"

Reference screenshots are in `design-inspo/`; open them before styling. The colour palette and grain follow `Screenshot 2026-11-22 at 19.26.25.png` (peach page, orange → purple glow, film grain). Aim for energetic but calm, not a "gym bro" app.

- **Colours** (CSS variables in `app/globals.css`, exposed to Tailwind via `@theme inline`):
  - Light: background peach-pink `#F3D8C7`, surface `#F8E6DA`, ink `#111111`, muted text `#6A5650`, rule lines = ink at ~15% opacity.
  - Glow colours: orange `#F07A3A`, coral red `#E5484D`, magenta `#C2509B`, purple `#8E63C4`, periwinkle `#6F86C8`.
  - Dark: background plum-black `#16111A`, surface `#1F1824`, ink `#F4E6DC`, glow at ~half opacity, primary buttons invert (light fill, dark text).
- **Background wash:** the page background has a faint orange wash in the bottom-left and purple in the bottom-right (fixed, on `body`).
- **Grain:** film-grain overlay over the whole page: one fixed `div.grain` in `app/layout.tsx`, an inline SVG `feTurbulence` noise as a CSS background, `mix-blend-mode: overlay`, ~50% opacity (~30% in dark mode). Decorative (`aria-hidden`, `pointer-events-none`). No image files, no library.
- **Type:** Space Grotesk via `next/font/google` (built into Next.js, not a new library), replacing Geist Sans; keep Geist Mono. Page titles large, bold, tight tracking (e.g. "Ready to train?"). Numbers (reps, weight, counts) use `tabular-nums`. Wordmark: lowercase "repbook." with the full stop in orange.
- **Glow:** a soft blurred orange→coral→magenta→purple→periwinkle blob (layered `radial-gradient`s + `blur`, about 44rem × 20rem) at the top of each page, behind the title. Keep it this size: a larger version was tried and felt too big. Decorative only (`aria-hidden`, `pointer-events-none`). Text must never depend on the glow for contrast — keep ink on peach.
- **Shapes and lines:** thin 1px rule lines between sections instead of heavy cards. Primary buttons: square corners (≤4px radius), black fill, cream text, with a → arrow. Secondary buttons: 1px outline. Tap targets at least 44px.
- **Icons:** simple inline SVG line icons (no icon library). The ✱ asterisk is a recurring accent (section headings, empty states).
- **Tabs:** phone bottom tabs show icon + label; active tab is ink with a short underline bar, others muted. The laptop top bar uses the same underline style. Content sits in a centred column (~640px).
- **Empty states:** ✱ + a short bold line + one muted helper line, left-aligned, not boxed.
- **Glow orb (big moments):** a full-screen centred orb (coral core → magenta → purple with a periwinkle crescent; plum→black variant in dark mode) behind a short message. Used for the "Workout saved" screen (Session 4) and on About. Session 1 builds the reusable `GlowOrb` component and uses it only on About.

## Build sessions

Each session is built in a fresh Claude Code session, using plan mode first.

| # | Feature | Scope | Done when the user can… |
|---|---|---|---|
| 1 | Foundation & shell | Data types, localStorage storage + store, built-in exercise list, app shell (header, ⓘ, bottom tabs / top bar), About page, not-found page, shared empty-state component, tab title "Repbook". Other pages can be placeholders with empty states. | Move between all tabs on phone and laptop, see About, see a friendly page at `/nope`. |
| 2 | Templates + exercise picker | Templates list/create/view/edit/clone/delete with the completeness rule, unique names and 20 limit; exercise picker with search, add custom exercise, rename/delete custom exercises. | Create, clone, edit and delete templates; get blocked by a missing weight and at 21 templates; add a custom exercise. |
| 3 | Active workout | Start blank or from a template, add exercises, variation picker (add/rename/delete), sets with reps + weight, survives refresh, resume bar + tab dot, discard, basic finish that saves to storage. | Log a workout with a "Glute Drive" variation, refresh mid-workout, finish it. |
| 4 | Finish flow ↔ templates | Drop incomplete sets; save-as-template for blank starts; update existing / save as new / don't change for template starts; handle a deleted template and the 20 limit. | Finish a blank workout as a template; finish a template workout and either update it or save as new. |
| 5 | History & Home | History list with summaries, `/history/[id]` detail with edit/delete, "last time" hint per exercise + variation, Home page with start/resume, template quick-starts and weekly summary. | Browse, open, edit and delete past workouts; see different "last time" numbers for two variations. |
| 6 | Polish & final check | Go through the Verification checklist, fix anything failing, check every empty state and not-found case, polish phone and laptop layouts, run lint and build. | Run through the whole checklist with no blank screens. |

## Progress

- [x] Session 0 — spec saved to AGENTS.md
- [x] Session 1 — Foundation & shell
- [ ] Session 2 — Templates + exercise picker
- [ ] Session 3 — Active workout
- [ ] Session 4 — Finish flow ↔ templates
- [ ] Session 5 — History & Home
- [ ] Session 6 — Polish & final check

## Verification

- `npm run lint` and `npm run build` pass.
- Manual walkthrough at localhost:3000 at laptop width and phone width (browser dev tools device mode):
  - Empty app: every page shows a readable message; no blank screens.
  - `/nope`, `/history/fake-id` and `/templates/fake-id` show the friendly not-found message.
  - Creating a template with a missing weight is blocked with a clear message; fixing it lets it save. With 20 templates, a 21st is blocked. Clone, edit and delete work.
  - Start a blank workout, add an exercise and a new variation, log sets, refresh mid-workout (still there), finish and save as a template.
  - Start from a template, change sets, finish and update the existing template; repeat and save as new.
  - The "last time" hint differs between "Glute Drive" and "Booty Builder".
  - Renaming a variation shows the new name in past workouts; deleting it keeps the name in past workouts and removes it from the picker.
  - Editing and deleting a past workout updates the history summary.
