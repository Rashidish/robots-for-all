# CLAUDE.md — Robots For All

> **Version:** 0.42 (draft) · **Date:** 2026-11-28 · **Owner:** Rashid Ishmail
> Keep the version line above current and log changes at the bottom.

Read this file before every task. It is the source of truth for what we build, the rules that cannot be broken, and how to work in this repo. If a request conflicts with this file, stop and ask.

---

## 1. What we are building

**Robots For All** is a free or ultra-low-cost STEM and robotics learning platform.
Tagline: *"From Cardboard to Innovation: Robotics Education for Everyone."*

Learners start with cardboard, popsicle sticks, straws and one motor. They move on to controlling robots with micro:bit/ESP boards, then to designing integrated robot projects. Teachers, robotics coaches and parents get ready-made lessons, templates, parts lists and AI help.

**Who it's for**
- Learners from **Grade R** upward (children and adult beginners); Grades R–2 have Junior lessons (phase 0) and the picture-block **Junior** tab (spec `docs/specs/junior.md`); lessons with written blocks start at Grade 3
- Teachers, robotics club coaches, STEM trainers
- Parents and guardians, homeschool families
- Schools, libraries, community centres, youth programmes

**Learning phases** (curriculum, not build milestones)
1. **Build**: one-motor robots using mechanisms (crank, gear, lever, linkage) linked to the school syllabus (CAPS maths, science, technology, history).
2. **Control**: add micro:bit / ESP boards for forward, stop, reverse, LEDs, sensors.
3. **Integrate**: cutout robot projects (e.g. rhino, drone) that combine components using the mechanics from Phases 1–2.

Each phase has many projects to choose from. Lessons follow **PRIMM** (Predict, Run, Investigate, Modify, Make) and the loop *Learn → Build → Test → Experiment → Improve → Share*.

---

## 2. Non-negotiables

Every change must keep these true. If one can't be met, say so in the PR and propose an alternative.

1. **Mobile-first, cheap phones.** Design for low-end Android, small screens and touch. Test at 360 px wide.
2. **Low data.** Aim for zero-rated educational access (e.g. Vodacom). Serve every asset from our own domain: no third-party CDNs, web fonts, trackers, ads or embedded external video unless the zero-rating terms are confirmed to cover them.
3. **Offline-capable.** Lessons, templates and the code editor keep working after first load (service worker + local storage). Progress syncs when a connection returns.
4. **Home languages.** All learner-facing text goes through i18n from day one. No hard-coded strings. English first; the language checklist is part of every project's "done".
5. **Child safety and privacy (POPIA).** Collect the minimum data. See §7.
6. **Free at the core.** Core learning never sits behind a paywall. Paid things (kits, certification, school dashboards) are add-ons.
7. **Accessible.** WCAG 2.2 AA: keyboard navigation, alt text, contrast, captions, readable fonts.
8. **Open where possible.** Prefer open-source dependencies with permissive licences. Record every licence.

---

## 3. Product map

**Front office (public)**
- Lesson player: handbook (printable PDF) and on-screen slides views of the same lesson, plus a one-page printable answer sheet per lesson (spec: `docs/specs/answer-sheets.md`); recording sheets in the app comes with M5
- Project library filtered by phase, grade, subject, mechanism, cost and language
- Printable cutout templates (A4, true scale, fold/cut lines)
- Block coding editor plus micro:bit flashing from the browser
- 2D robot and sensor simulator
- Teacher, coach and parent portal: classes, progress, badges
- AI helper for teachers, coaches, parents and adult learners, and for children on lesson pages with a parent's consent (advice and troubleshooting, ring-fenced to STEM education)
- Challenges and virtual competitions (learner vs learner, club vs club, school vs school)
- Live group help sessions (virtual classroom) run by verified volunteer coaches on a laptop or tablet (spec `docs/specs/live-sessions.md`, approved; Later milestone)
- Kit and supplies ordering
- Parent engagement: weekly WhatsApp question, parent badges
- Newsletter: events, competitions, results, rankings

**Back office (admin only)**
- AI project generation: designs, cutout templates, wiring diagrams, illustrations, parts lists, documents, CAPS links, translations
- CAD and template tooling runs here, never exposed to the public
- Human review and publishing workflow for all AI-generated content
- Scoring completed challenge projects by phase/level (completion, function, presentation, etc.)
- Coach verification, content moderation, kit catalogue

---

## 4. Build milestones

Ship in order. Each milestone must be usable on its own before the next starts.

| # | Milestone | Done when |
|---|---|---|
| M1 | Offline shell | PWA installs on a low-end phone, works offline, i18n wired, deploys to free/static hosting |
| M2 | Make & learn | Lesson player + template generator + 10 Phase 1 lessons as data |
| M3 | Code | Block editor + micro:bit flashing + Phase 2 lessons |
| M4 | Simulate | 2D robot/sensor simulator runs block code |
| M5 | Teach | Accounts, classes, progress, offline sync, teacher/coach/parent views |
| M6 | AI helper | Front-office AI with cost caps and child-safe rules |
| Later | Live sessions, competitions, kit store, newsletter, back-office AI generation pipeline |

**Owner decision (2026-11-23):** the product's name is **Robots For All** (plural); user-facing text uses it (done 2026-11-23). The site lives on one hostname, **`robotsforall.org.za`**; `robotsforall.co.za`, `robotsforall.africa` and `www.` redirect to it (`docs/deploy.md` §4). Internal identifiers (the Cloudflare Pages project `robot-for-all`, the program file format `robot-for-all-program`) keep their old names so nothing breaks.

**Owner reminder (2026-11-27):** after the Junior launch, revisit **stories with characters** for Grades R–2 (ScratchJr-style; `docs/specs/junior.md` §2 out of scope).

**Owner reminder (2026-11-22):** once all front-office functionality is complete, revisit the **extension folder format** (how extension packs are stored, contributed, reviewed and kept up to date; see M3 spec §15) before building it out.

Current milestone: **M6** (spec approved 2026-11-27: `docs/specs/M6-ai-helper.md`; ADR-0018). M2 lessons, the M3 editor, the six Phase 2 lessons, M4 and M5 (`docs/specs/M5-teach.md`, `docs/specs/M5-family-and-personal.md`) are built and wait for the people checks in `docs/test-plan.md`; M5's event batches in the background come with the competitions work.

---

## 5. Tech stack (decisions recorded in `docs/adr/`)

Reuse proven open source before writing our own.

| Need | Proposed choice | Why |
|---|---|---|
| Language | TypeScript (strict) | One language front to back |
| Web app | **Astro + Svelte islands** (ADR-0001) | Zero JS on content pages; Svelte only where interactive |
| Offline | Small hand-written service worker, generated at build (`apps/web/src/sw/`); IndexedDB for progress later | No dependency; every line auditable |
| Translations | **Paraglide JS 2**; English only at launch (ADR-0003) | Missing strings fail the build; tiny downloads |
| Lesson content | **Markdown + front matter, Zod-validated** (ADR-0004) | Free, reviewable, offline-friendly |
| Block coding | **Blockly**, our own small block set (ADR-0005) | Industry standard, open source |
| micro:bit | **MicroPython** .hex built in the browser (microbit-fs) + WebUSB (microbit-connection); firmware served from our domain (ADR-0005) | No third-party domain; fits our lessons and i18n |
| Python in browser | Pyodide (lazy-loaded, later milestones only) | No server cost |
| Simulator | **On-screen micro:bit + our 2D robot world** in `packages/sim` (ADR-0007); programs use robot calls through robot profiles, never pins (ADR-0008) | One engine for screen and real robot; no physics library; 2D before 3D |
| Database / auth | **Supabase** (Postgres + Auth, MFA for admins), roles by row-level security, audit log (ADR-0010); back-office accounts first, M5 accounts through `/db/` on our own domain (a Pages Function proxy with an allow-list, ADR-0017) | Free tier, row-level security, open source; zero-rated and same-origin |
| Back office | **`apps/admin`**: Astro, server-rendered in a **Cloudflare Worker** on `admin.robotsforall.org.za`, behind Cloudflare Access; content changes as pull requests through a GitHub App (ADR-0009, ADR-0011; spec `docs/specs/back-office.md`) | Never exposed in the front office; review gate kept |
| Hosting | **Cloudflare Pages**, one hostname for everything: `robotsforall.org.za` (ADR-0002) | Free unlimited static traffic; zero-rating friendly |
| AI | **Claude Haiku 5.5** first, other providers (free ones included) once they pass the provider checklist, all through our own helper Worker on `/helper/` (ADR-0018) | Keys never reach the browser; cost managed; children never sent to a provider that keeps their words |
| Offline platform option | Evaluate Kolibri for schools with no internet | Built for this case |

Before adding any dependency, check: bundle size, licence, works offline, works on low-end Android. Write the result in the PR.

---

## 6. Repo layout

```
/apps/web            Public front office (PWA)
/apps/admin          Back office (admin only)
/apps/cert           Certificate service: the only holder of the name key (Cloudflare Worker on /cert/, ADR-0015)
/apps/signin         Learner sign-in service: the only holder of Supabase's JWT secret (Worker on /signin/, ADR-0013)
/apps/helper         AI helper: the only holder of AI provider keys (Worker on /helper/, ADR-0018); prompts, safety test set
/packages/ui         Shared, accessible UI components
/packages/sim        2D simulator
/packages/db         Supabase migrations (back-office roles, audit log), tested on PGlite
/packages/settings   Site settings checks, shared by the public build and the back office
/packages/badges     Badge file checks and the rules that award badges (site and certificate service)
/packages/blocks     Blockly blocks and generators
/packages/i18n       Translation keys and loaders
/content/lessons     Lessons as Markdown + front matter (one folder per lesson)
/content/projects    Project data, parts lists, templates (SVG)
/content/worlds      Robot worlds and courses for the simulator (JSON, checked)
/content/junior      Junior missions for Grades R–2 (JSON, checked: solvable in their fewest blocks) and order.json
/content/seasons     Seasons: three courses per theme, one per grade band, plus badge (JSON + SVG)
/content/badges      Badges: rule (JSON) + picture without words (SVG); words in content/i18n as badge_<id>_name/_about
/content/sheets      Every answer sheet code ever printed (`npm run sheet-codes` after a build; only grows)
/content/site        Site settings (banner, feature switches) and the withdrawn list (set from the back office)
/content/i18n        Translations per language; languages.json lists the site's languages and their status
/docs/specs          One spec per feature (write before building)
/docs/adr            Architecture decision records
/tests               End-to-end tests
```

### Lesson content (see ADR-0004)
One folder per lesson: `index.md` (English source), `index.<lang>.md` for translations, `images/` for pictures. Pictures carry no words: numbered callouts explained in the lesson text, plus markings printed on real parts (pins, part names, voltages); a test fails on any other word.

Front matter is metadata only:
```yaml
id: p1-crank-01
title: Crank-powered waving rhino
phase: 1                 # 0 Junior (Grades R–2, ids j-…) | 1 Build | 2 Control | 3 Integrate
grades: [3, 4]           # Grade R is 0 (Junior only)
mechanism: crank         # crank | gear | lever | linkage | ...
syllabus_links:          # CAPS topic references
  - subject: Coding and Robotics (CAPS, Intermediate Phase)
    topic: R.5 Design a simple artefact based on design specifications
duration_minutes: 45
cost_estimate_zar: 15
parts:                   # substitute = a free or cheaper thing that works instead
  - { item: cardboard A4, qty: 2, substitute: cereal-box card }
  - { item: straw, qty: 3 }
outcomes: [...]          # 2–4 things learners will know or do
concepts: [crank, axle]  # vocabulary
safety:
  adult_help: true       # craft knife, skewer points, hot glue
  notes: [...]           # at least one; never coin/button cells, never mains
assessment: [...]        # 3–5 items, each starting "I can "
prerequisites: []        # lesson ids
next: p1-cam-01          # lesson id or null
templates: [rhino-parts]   # sheets in content/projects/<id>/templates/<name>.ts
starter_program: null    # Phase 2+: programs/<name>.rfa.json in the lesson folder
world: null              # Phase 2+: robot world it opens in: content/worlds/<id>.json
hardware: none           # none | microbit | microbit-motor
junior_missions: []      # Junior only, at least one: missions in content/junior
status: draft            # draft | in_review | published
ai_generated: true
reviewed_by: null        # required to publish
build_tested_by: null    # required to publish: who built it from the printed lesson
```
A translation, `index.<lang>.md`, holds only the translated words (`title`, `outcomes`, `concepts`, `parts` item/substitute, `safety_notes`, `assessment`, `templates` (each sheet's title and part names/notes), `program_name` (the starter program's name), the body with the same `##` sections) plus `status`, `ai_generated`, `reviewed_by` and `translated_from` (`npm run translation-hash -- <id>`, covering `index.md` and the lesson's template files); facts come from `index.md` (spec `docs/specs/back-office-more-content.md` §2.7).

The body holds the five PRIMM steps as `##` headings in order: Predict, Run, Investigate, Modify, Make, optionally followed by `## Teacher notes`. Junior lessons have four: Predict, Run, Try, Make; they use the picture mission sheets instead of an answer sheet. Links to other lessons must point to lessons that exist (build fails otherwise).
Languages are worked out from the files present, never typed by hand.
Teachers and content editors must be able to add a lesson without touching code.

---

## 7. Security, privacy and child safety

- **POPIA first.** Learners under 18 are children under POPIA: get consent from a parent or guardian, and the school where relevant. Record the legal basis for every piece of personal data.
- **Collect the minimum.** No learner surnames, photos, ID numbers, exact birthdates or locations unless a spec justifies it and it's approved.
- **Learner accounts** can be created by a teacher or parent; learners may use a nickname.
- **No personal data to AI.** Strip names and identifiers before any call to the AI. Log prompts without personal data.
- **Live sessions:** only verified coaches host; coach camera on, learner cameras off. No private 1:1 chat between adults and learners.
- **User-generated content** (projects, challenge entries, comments) is moderated before it's public.
- **Secrets** live in environment variables only. Never commit keys. Use least-privilege database roles and row-level security.
- **Threat model** every feature that touches accounts, payments, uploads or messaging (note it in the spec).
- Run dependency and secret scanning in CI. Fix high and critical findings before merging.

---

## 8. AI rules

**Front office (helper; spec `docs/specs/M6-ai-helper.md`)**
- Adults (teachers, coaches, parents, adult learners) ask from their home page and lesson pages; children ask on lesson pages only, with a parent's consent and no class switched off.
- Advises and troubleshoots, **ring-fenced to STEM education**, safety first. It doesn't generate lessons or other public content.
- Child-safe system prompts (a stricter one for children), age-appropriate tone, refuses unsafe requests (e.g. mains electricity, coin cells, sharp tools without adult supervision); answers carry "Written by AI. AI can be wrong."
- No question text stored; personal data stripped before every call.
- Cost caps per person per day, a monthly cap for the platform, graceful fallback when a cap is reached or the user is offline.
- **Common questions** per lesson are AI-drafted and shown **without human review** (owner decision 2026-11-27), with the disclaimer, automatic safety checks and hiding after 3 👎. This is the only exception to the review rule below.

**Back office (generation)**
- Generates designs, templates, wiring diagrams, documents, parts lists, CAPS links and translations.
- **Nothing AI-generated is published without human review** (`status: in_review` → `published`, `reviewed_by` set), except the helper's Common questions (front office, above).
- Electrical designs must be checked for safe voltages and current (battery-only, low voltage).

---

## 9. How to work in this repo (Claude Code)

1. **Read** this file, the relevant spec in `/docs/specs`, and related ADRs.
2. **Plan first.** For anything bigger than a small fix, write a plan and wait for approval.
3. **No spec, no build.** If a feature has no spec, draft one (user journey, requirements, acceptance criteria, threat notes) and stop for review.
4. **Small PRs.** One feature or fix per PR, with a clear description and screenshots on a 360 px viewport.
5. **Tests are required.** Unit tests for logic, end-to-end tests for user journeys, an offline test for anything that must work offline.
6. **Performance budget:** first load of a lesson under 250 KB compressed (excluding the lesson's own images); Lighthouse mobile scores of 90+ for performance and accessibility.
7. **i18n:** every new string gets a translation key.
8. **Update docs** (spec, ADR, this file) in the same PR when behaviour or decisions change.
9. **Ask, don't guess,** when a requirement is unclear or touches money, children's data or safety.
10. **Deferred people checks:** anything only a person or real device can check (lesson review, build tests, printing, screen readers) goes into `docs/test-plan.md`, to be run when the full application is done. Automated tests still gate every merge.

### Commands
Node 24 (see `.nvmrc`; minimum 22.17). Run from the repo root:
```
install:   npm ci                 # exact versions from package-lock.json
dev:       npm run dev            # http://localhost:4321
check:     npm run check          # format + lint + types + unit tests (what CI runs)
test:      npm test
e2e:       npm run build && npm run e2e   # browser tests on a 360 px phone (first time: npx playwright install chromium)
lighthouse: npm run lighthouse          # performance/accessibility must be 90+
lint:      npm run lint           # npm run format to auto-fix formatting
build:     npm run build          # static site in apps/web/dist
admin:     npm run build:admin    # back office (Cloudflare Worker) in apps/admin/dist
translate: npm run translation-hash -- <lesson id>   # translated_from for a lesson translation
sheets:    npm run build && npm run sheet-codes   # after changing a lesson: keep its new sheet code
safety:    ANTHROPIC_API_KEY=... npm run helper-safety -- <model>   # the helper's safety test set, live
```
Always commit `package-lock.json` changes; CI installs with `npm ci` and fails if it is out of date.

---

## 10. Don'ts

- Don't add third-party trackers, analytics SDKs, ads or external fonts/CDNs.
- Don't put AI keys or calls in client code.
- Don't expose CAD or AI generation tools in the front office.
- Don't publish AI-generated content without review.
- Don't hard-code learner-facing text.
- Don't add a heavy dependency when a few lines of code will do.
- Don't collect data "just in case".

---

## 11. Glossary

- **CAPS**: South Africa's Curriculum and Assessment Policy Statement (school syllabus)
- **PRIMM**: Predict, Run, Investigate, Modify, Make: a teaching method for coding
- **Phase 1/2/3**: learning phases (Build, Control, Integrate)
- **M1–M6**: build milestones
- **Coach**: verified volunteer who runs clubs or live help sessions
- **Zero-rated**: data costs waived by a mobile network for approved educational sites

---

## Version history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-11-21 | First draft |
| 0.2 | 2026-11-21 | Lesson content rules aligned with ADR-0004 (PRIMM in body, computed languages) |
| 0.3 | 2026-11-21 | Tech stack updated from accepted ADRs 0001–0004 |
| 0.4 | 2026-11-21 | Commands filled in (M1 step 2) |
| 0.5 | 2026-11-22 | Offline: hand-written service worker instead of Workbox (M1 step 6) |
| 0.6 | 2026-11-22 | Browser tests, accessibility checks, Lighthouse and size budgets run in CI (M1 step 9) |
| 0.7 | 2026-11-22 | M2: lesson format v2 (outcomes, safety, assessment, substitutes, links, build testing) |
| 0.8 | 2026-11-22 | People-based checks deferred to `docs/test-plan.md` (owner decision) |
| 0.9 | 2026-11-22 | Current milestone M3; M3 spec approved (micro:bit row to be updated by ADR-0005) |
| 0.10 | 2026-11-22 | ADR-0005 accepted: Blockly + MicroPython + WebUSB instead of MakeCode |
| 0.11 | 2026-11-22 | Owner reminder: revisit the extension folder format after the front office is complete |
| 0.12 | 2026-11-22 | Lesson format: `starter_program` and `hardware` for Phase 2 lessons |
| 0.13 | 2026-11-23 | Answer sheets (printable now; in-app records with M5) |
| 0.14 | 2026-11-23 | Current milestone M4; simulator row from ADR-0007 and ADR-0008 (robot calls, not pins); `content/worlds` |
| 0.15 | 2026-11-23 | Owner decision: rename the product to Robots For All during the UI work |
| 0.16 | 2026-11-23 | Renamed to Robots For All in user-facing text; hostname `robotsforall.org.za`, other domains redirect |
| 0.17 | 2026-11-23 | Lesson format: `world` (the robot world a starter program opens in, M4) |
| 0.18 | 2026-11-24 | `content/seasons` (M4 FR-20) |
| 0.19 | 2026-11-24 | Back office approved (spec `docs/specs/back-office.md`): admin app, Supabase accounts and roles (ADR-0009, ADR-0010 accepted) |
| 0.20 | 2026-11-24 | Back office runs as a Cloudflare Worker (ADR-0011); `npm run build:admin` |
| 0.21 | 2026-11-24 | Repo layout: `content/site`, `packages/db`, `packages/settings` |
| 0.22 | 2026-11-24 | `content/site/withdrawn.json`: withdraw any live lesson, template, world, season or language (back office) |
| 0.23 | 2026-11-24 | `content/i18n/languages.json`: languages added and removed from the back office (more content spec §2.5) |
| 0.24 | 2026-11-24 | Lesson translations `index.<lang>.md`: words only, `translated_from` (more content spec §2.7) |
| 0.25 | 2026-11-24 | Lesson pictures carry no words (translate-templates-and-programs spec §2.5) |
| 0.26 | 2026-11-24 | Template sheets in other languages: `templates` in lesson translations (translate-templates spec §2.1–2.4) |
| 0.27 | 2026-11-24 | `program_name` in lesson translations (translate-templates spec §2.6) |
| 0.28 | 2026-11-24 | M5 spec approved (`docs/specs/M5-teach.md`) |
| 0.29 | 2026-11-25 | Account data through `/db/` on our own domain (ADR-0017) |
| 0.30 | 2026-11-25 | M5 spec v0.5: email-only confirmations for now, names also on badges and the teacher's console, one vaulted key, confirmed deletion of dormant accounts |
| 0.31 | 2026-11-25 | `apps/cert`: the certificate service (name key, Show names) |
| 0.32 | 2026-11-25 | `apps/signin`: learner sign-in (ADR-0013 amendment: sessions signed with Supabase's JWT secret) |
| 0.33 | 2026-11-25 | `content/sheets` and `npm run sheet-codes`: answer sheet codes for recording sheets (M5 step 5b) |
| 0.34 | 2026-11-25 | `content/badges` and `packages/badges` (M5 step 7a) |
| 0.35 | 2026-11-25 | Family groups and personal learners approved (`docs/specs/M5-family-and-personal.md`) |
| 0.36 | 2026-11-27 | M6 owner decisions: helper ring-fenced to STEM education; children on lesson pages with parent consent; Common questions without review; Claude Haiku 5.5 first, other providers behind a checklist (ADR-0018, proposed) |
| 0.37 | 2026-11-27 | M6 spec approved, ADR-0018 accepted; current milestone M6 |
| 0.38 | 2026-11-27 | `apps/helper`: the AI helper service (M6 step 3); `npm run helper-safety` |
| 0.39 | 2026-11-27 | Junior approved: learners from Grade R (Junior tab, after M6); reminder to revisit stories |
| 0.40 | 2026-11-27 | Live help sessions spec approved (`docs/specs/live-sessions.md`), coach on laptop or tablet |
| 0.41 | 2026-11-27 | `content/junior` (Junior missions; ADR-0019: tap-to-add row on `/code/junior/`) |
| 0.42 | 2026-11-28 | Junior lessons: phase 0, Grade R as 0, `junior_missions`, Predict–Run–Try–Make (Junior spec step 3) |
