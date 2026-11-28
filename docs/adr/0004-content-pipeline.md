# ADR-0004: Content pipeline

- **Status:** Accepted (2026-11-21)
- **Date:** 2026-11-21
- **Decider:** Rashid Ishmail

## Context
Lessons are the heart of the platform, and most will be AI-drafted in the back office and reviewed by people (CLAUDE.md §8). Teachers and content editors must be able to add or fix a lesson **without touching code** (CLAUDE.md §6). Requirements:
- Plain files anyone can edit on GitHub, in any language
- Every lesson checked automatically, so a broken one fails the build instead of reaching a classroom
- Lessons work offline, print on A4, and stay within the size budget
- Translations of a lesson live beside the original

## Options considered

| | Markdown + front matter in the repo | Headless CMS (e.g. Strapi, Sanity) | Database (Supabase) |
|---|---|---|---|
| Cost | Free | Free tiers with limits, or self-host | Free tier |
| Editing | GitHub web editor, pull requests, review built in | Friendly editor UI | Needs an admin app |
| Review and history | Git history and PR review | Varies | Build our own |
| Offline and static build | Native | Needs fetch at build | Needs fetch at build |
| Works for AI drafts | AI writes files and opens a PR | API | API |

## Decision
**Markdown files with YAML front matter in `content/`, validated by a Zod schema at build time.**

Layout:
```
content/lessons/<id>/index.md        English (source)
content/lessons/<id>/index.<lang>.md Translations, added later (e.g. index.zu.md)
content/lessons/<id>/images/         Lesson images (source; optimised at build)
content/projects/<id>/templates/     Printable SVG templates
```

Rules:
1. **Front matter holds metadata only** (id, title, phase, grades, mechanism, syllabus links, duration, cost, parts, templates, status, ai_generated, reviewed_by).
2. **The PRIMM steps are the lesson body**, as five `##` headings (Predict, Run, Investigate, Modify, Make). Writers write prose, not YAML. The validator checks all five are present, in order. (Amended 2026-11-28, Junior spec step 3: Junior lessons, phase 0 for Grades R–2, have four steps instead: Predict, Run, Try, Make.)
3. **`languages` is worked out by the build** from the files present, rather than typed by hand, so it can never be wrong.
4. **Only `status: published` lessons appear in production builds.** Drafts show on preview builds only.
5. `published` requires `reviewed_by` to be set. AI-drafted content cannot go live unreviewed.
6. Images are converted to WebP/AVIF at build. The build fails if any lesson image is over 80 KB after optimisation.

## Why
- It's free, offline-friendly and reviewable: every change to a lesson is a pull request with history, and that is exactly the human-review gate CLAUDE.md requires for AI content.
- Teachers can edit with GitHub's web editor today. A friendlier editor can be added later on top of the same files, without migrating anything.
- It works the same with either framework (Astro has this built in as Content Collections; SvelteKit needs a ~100-line loader).

## Consequences
- CLAUDE.md §6 is updated in this PR: PRIMM moves from front matter to the lesson body, and `languages` is computed.
- The CI "Content checks" job grows into the full schema validator in M1 step 5.
- **Translations (2026-11-24, more content spec §2.7):** `index.<lang>.md` holds only the translated words plus its own `status`/`reviewed_by` and `translated_from` (which English text it translates); facts always come from `index.md`. A translation whose English changed shows English on production until it is checked again.
- **Diagrams carry no words (2026-11-24, translate-templates-and-programs spec §2.5):** a lesson SVG shows only numbered callouts (explained in the lesson text, which is translated) and markings printed on real parts (pins, L9110S, SG90, voltages, micro:bit). A unit test fails on any other word, so no picture needs a copy per language.
- Revisit when non-technical editors exceed what the GitHub web editor can handle (likely M2–M3). A Git-based CMS such as Decap or Keystatic can sit on top of these same files.
