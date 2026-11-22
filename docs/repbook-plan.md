# Repbook — build plan

## Context
Repbook is the Sprint 1 project for the "building with AI" course: a workout logger for a busy, beginner-to-intermediate gym-goer who trains 2–3×/week and switches between gyms. It's built in the existing project folder `repbook` (Next.js 16.4 App Router, TypeScript, Tailwind; currently just a heading on the home page). Runs locally only (`npm run dev`, localhost:3000), no backend, no accounts, **no new libraries**.

## Decisions agreed with the user
- **Storage:** browser localStorage. Not chosen: IndexedDB (much more code or an extra library, no real benefit at this size, same Safari 7-day deletion rule), sessionStorage (wiped when tab closes), cookies (~4 KB, sent to servers). Friendly message if storage is full or data is unreadable.
- **Sets** record **reps + weight** (kg; weight 0 allowed for bodyweight).
- **Templates:** max 20. Can't be saved (as new or over an existing one) if the name is empty, it has no exercises, or **any set is missing reps or weight**. Names must be unique.
- **Exercises vs variations:**
  - Built-in library treats equipment types as separate exercises (e.g. "Bench Press (Barbell)", "Bench Press (Dumbbell)", "Chest Press Machine"). Users can add custom exercises.
  - Variations belong to one exercise and are user-made (mostly specific machines, e.g. Hip Thrust Machine → "Glute Drive", "Booty Builder"). None pre-filled.
  - Templates list exercises only; the variation is picked during the workout.
  - "Last time" numbers and history match on exercise **+** variation.
  - No gym tagging (for now).
  - Delete = hide from pickers; past workouts keep showing the name. Rename updates everywhere, including past workouts. Same rules for custom exercises.

## App shell (agreed)
- Phone: header "Repbook" + ⓘ icon (→ About); bottom tabs **Home, Workout, History, Templates**. While a workout is running and you're elsewhere: slim "Workout in progress · Resume" bar above the tabs, and a dot on the Workout tab.
- Laptop: same sections + About in a top bar; content in a centred column.
- **No Library page.** The exercise picker (used in workouts and template editing) handles search, add custom exercise, rename/delete custom exercises (⋯ menu; built-ins locked), and add/rename/delete variations.

## Pages (web addresses)
| Address | Purpose |
|---|---|
| `/` Home | Big "Start workout" (or "Resume"), templates as one-tap starts, then this week's count and last workout. |
| `/workout` Active workout | One in-progress workout at a time (survives refresh). With none running: start screen (start blank + templates). Add exercise via picker, pick/add variation, add/remove sets, reps + weight, "last time" hint. Finish or discard. |
| `/history` | Past workouts, newest first, each with date, duration, exercises, sets, total volume. |
| `/history/[id]` **detail page** | One workout in full; edit and delete. |
| `/templates` | Template list ("x / 20"), create, clone, delete, start workout. |
| `/templates/new`, `/templates/[id]`, `/templates/[id]/edit` | Create, view, edit a template. |
| `/about` | What Repbook is; data lives only in this browser. |
| Unknown address or unknown id | Friendly "not found" message with a link home. |

Every list has a readable empty state (e.g. "No workouts yet — start your first one").

## Finishing a workout
- Blank sets are dropped (user is told); a workout needs ≥1 completed set to save.
- **Started blank:** optional "Save as template" (name prompt; template rule + 20 limit apply).
- **Started from a template:** choose "Update '<template>'", "Save as new template", or "Don't change templates". If that template was deleted meanwhile, only "save as new" is offered.
- Templates copy exercises + sets (reps & weight), never variations.

## Code structure
- `lib/types.ts` — Exercise, Variation, Set, WorkoutExercise, Workout, Template, ActiveWorkout.
- `lib/exercise-library.ts` — ~40 built-in exercises grouped by muscle group.
- `lib/storage.ts` — load/save one versioned key (`repbook:v1`), handles missing/corrupt data and storage-full errors; only touched in the browser.
- `lib/store.tsx` — React context provider (in `app/layout.tsx`) exposing data + actions (create/update/delete workouts, templates, exercises, variations; active workout). Shows a brief loading state until browser data is read, to avoid flicker/mismatch.
- `lib/validation.ts` — template completeness, unique name, 20 limit; workout finish rules.
- `lib/summary.ts` — duration, set count, volume, weekly/monthly counts, "last time" lookup.
- `components/` — AppShell/nav, ExerciseEditor (shared by active workout, history edit, template edit), ExercisePicker, VariationPicker, SetRow, EmptyState, NotFoundMessage, ConfirmDialog.
- `app/not-found.tsx` for unknown addresses; detail pages show the same NotFoundMessage when an id isn't in storage.
- Next.js 16 notes (checked in bundled docs): `cacheComponents` is on, so dynamic `params` are runtime data — detail pages are client components reading the id via `useParams`. IDs via `crypto.randomUUID()`.

## Layout
- Large tap targets and number keypads (`inputMode="decimal"`) for reps/weight; single column on phone, wider cards on laptop. Light and dark mode.
- Tab title changes from "Create Next App" to "Repbook".

## Building across separate Claude sessions
A new session doesn't remember this conversation, so the agreed spec must live **in the project**.

**This session (on approval): Session 0, save the spec**
- Everything goes in **`AGENTS.md`** (no CLAUDE.md, no separate spec file). Claude Code 2.1.327 loads AGENTS.md automatically because there is no CLAUDE.md in this folder or any parent folder. Don't add a CLAUDE.md later, or AGENTS.md stops loading.
- Keep the two Next.js-managed blocks (`<!-- BEGIN:nextjs-… -->` … `<!-- END:… -->`) untouched; `next dev` rewrites only those. Add below them:
  - Project summary and constraints (local only, no backend, **ask before adding libraries**).
  - The spec above (decisions, shell, pages, finish rules, code structure, layout, verification).
  - The session table below, plus a **Progress** checklist (Sessions 1–6) with the rule "work only on the session asked for; tick it off when done".
- Commit: "Add Repbook spec to AGENTS.md" (plus the existing home-page edit and `.npmrc`).

**Each later session, same routine**
1. Start a fresh session in `repbook` and turn on plan mode.
2. Paste the session's prompt (below). Review Claude's plan, then approve.
3. Check the result in the browser at laptop and phone width.
4. Ask Claude to tick off Progress in the spec and commit. Update the spec in AGENTS.md first if you changed your mind about anything.

| # | Feature | Prompt to paste | Done when you can… |
|---|---|---|---|
| 1 | Foundation & shell | "Build Session 1 from the spec in AGENTS.md: data types, localStorage storage + store, built-in exercise list, app shell (header, ⓘ, bottom tabs / top bar), About page, not-found page, shared empty-state component, tab title 'Repbook'. Pages other than About can be placeholders with empty states." | tap between all tabs on phone and laptop, see About, see a friendly page at `/nope`. |
| 2 | Templates + exercise picker | "Build Session 2: templates list/create/view/edit/clone/delete with the completeness rule, unique names and 20 limit; the exercise picker with search, add custom exercise, rename/delete custom exercises." | create, clone, edit, delete templates; get blocked by a missing weight and at 21 templates; add a custom exercise. |
| 3 | Active workout | "Build Session 3: active workout — start blank or from a template, add exercises, variation picker (add/rename/delete), sets with reps + weight, survives refresh, resume bar + tab dot, discard, and a basic finish that saves to storage." | log a workout with a Glute Drive variation, refresh mid-workout, finish it. |
| 4 | Finish flow ↔ templates | "Build Session 4: finish flow — drop blank sets, save-as-template for blank starts; update existing / save as new / don't change for template starts; handle a deleted template and the 20 limit." | finish a blank workout as a template; finish a template workout and update it or save as new. |
| 5 | History & Home | "Build Session 5: history list with summaries, `/history/[id]` detail with edit/delete, 'last time' hint per exercise + variation, Home page with start/resume, template quick-starts and weekly summary." | browse, open, edit and delete past workouts; see different "last time" numbers for two variations. |
| 6 | Polish & final check | "Build Session 6: go through the Verification checklist in AGENTS.md, fix anything failing, check every empty state and not-found case, polish phone and laptop layouts, run lint and build." | run through the whole checklist with no blank screens. |

Tips: keep each session to its row (if Claude wants to build ahead, say no); if a session runs long, commit what works and continue in a new session with "continue Session N".

## Verification
- `npm run lint` and `npm run build` pass.
- Manual walkthrough at localhost:3000, at laptop width and phone width (browser dev tools device mode):
  - Empty app: every page shows a readable message, no blank screens.
  - `/nope` and `/history/fake-id`, `/templates/fake-id` show the friendly not-found.
  - Create a template with a missing weight → blocked with a clear message; fix → saves. Create 20 → 21st blocked. Clone, edit, delete.
  - Start blank workout, add exercise + new variation, log sets, refresh mid-workout (still there), finish → save as template.
  - Start from template, change sets, finish → update existing; repeat → save as new.
  - "Last time" hint differs between Glute Drive and Booty Builder.
  - Rename a variation → past workout shows new name; delete it → past workout keeps name, picker no longer shows it.
  - Edit and delete a past workout; history summary updates.
