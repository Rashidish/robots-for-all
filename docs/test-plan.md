# Deferred test plan (people and devices)

> **Version:** 0.61 · **Date:** 2026-11-28 · **Owner:** Rashid Ishmail

**Decision (2026-11-22, owner):** because of time and people constraints, building continues with **automated functional tests only** (CI must pass before anything merges). The human and device checks below are collected here and run **once the full application is complete**, before the first public launch of lessons.

**Safety stays on:** until these checks pass, the live site keeps hiding unreviewed lessons (`SHOW_DRAFTS=false` in production). Turning lessons on is a one-line change per lesson once the checks below are done.

How to use this list: add a row whenever a step adds something only a person can check. Tick it off with who did it and when.

---

## A. Every lesson (repeat per lesson)

| # | Check | Who | Done |
|---|---|---|---|
| A1 | **Content review**: a teacher or coach reads the lesson in a preview link; wording suits the grade; steps are clear | Teacher / coach | |
| A2 | **Build test**: someone builds the robot using **only the printed lesson and template**; it works | Volunteer / club | |
| A3 | **Safety check**: tools, adult-help flag and safety notes are right; no coin cells, no mains | Adult reviewer | |
| A4 | **CAPS links confirmed** by a teacher (Coding and Robotics outcomes, and any Maths/NST links still marked "to confirm") | Teacher | |
| A5 | Template printed and the **50 mm check square measures 50 mm ± 1 mm** | Anyone | |
| A6 | Record names in the lesson (`reviewed_by`, `build_tested_by`) and set `status: published` | Claude, on request | |

**Lessons waiting for A1–A6:**

| Lesson | A1 | A2 | A3 | A4 | A5 | A6 |
|---|---|---|---|---|---|---|
| p1-lever-01 Snapping crocodile | | | | | | |
| p1-wheel-01 Rolling cardboard cart | | | | | | |
| p1-crank-01 Crank-powered waving rhino | | | | | | |
| p1-linkage-01 Extending grabber | | | | | | |
| p1-cam-01 Bouncing animal box | | | | | | |
| p1-lever-02 Robot arm with three lever types | | | | | | |
| p1-linkage-02 Waving robot (four-bar linkage) | | | | | | |
| p1-gear-01 Spinning gear train | | | | | | |
| p1-pulley-01 Rubber-band pulley lift | | | | | | |
| p1-motor-01 One-motor scribble robot (**also: an adult checks the 3 V circuit and battery holders**) | | | | | | |
| p2-display-01 Blink a heart (A2 = run the starter on the on-screen and a real micro:bit; no template, so A5 n/a) | | | | | n/a | |
| p2-button-01 Button-controlled faces (as above) | | | | | n/a | |
| p2-light-01 Automatic night light (as above; also check the threshold works in a real classroom) | | | | | n/a | |
| p2-motor-01 Go and stop (**A3 includes the electrical design check: wiring diagram, L9110S, 2 × AA motor supply, shared GND**) | | | | | n/a | |
| p2-motor-02 Forward, stop, reverse (as above) | | | | | n/a | |
| p2-robot-01 Robot that reacts (as above; also: the micro:bit on its own 2 × AA pack, robot tested on the floor) | | | | | n/a | |
| p2-motor-03 Two motors: turning (as above; also: an adult checks the breakout board and two-motor wiring; the robot drives straight, spins and curves on the floor) | | | | | n/a | |
| p2-whisker-01 Whisker bumper (as above; also: an adult bends the paper clips; the bumper template printed at 100 %; the robot backs away from a real wall and the whiskers don't stay pressed) | | | | | | |
| p2-line-01 Follow the line (as above; also: an adult checks the sensor wiring; the robot follows a taped line with three curves on the floor; check the sensors see black insulation tape, and printed ink) | | | | | n/a | |
| p2-maze-01 Bump maze (as above; also: one printed stencil makes walls that stand by themselves when traced on cereal-box card; the tunnel roof halves join to 150 × 200 mm; the gate flap swings when the robot pushes it; the starter gets the real robot out of a six-wall maze) | | | | | n/a | |
| p2-art-01 Pen art (as above; also: an adult checks the servo wiring, with the servo pack + never joined to the micro:bit; the servo lifts the pen clear of the paper and lets it drop back; the real robot draws a square that closes to within 2 cm after tuning the turn pause; a cardboard SG90 stand holds the servo steady) | | | | | n/a | |
| p3-linemaze-01 Line maze (as above; also: the printed line maze tiles join and the taped lines match the screen; the real robot takes the left branch at a taped T junction and turns round at a dead end; two teams build, swap and race their own mazes) | | | | | n/a | |
| j-robot-01 Be the robot (Junior, Grade R: **A2 = a teach test** with a Grade R class, using only the printed lesson, arrow cards and mission sheet; A4 includes the Foundation Phase Maths and Life Skills links; no template, so A5 n/a) | | | | | n/a | |
| j-bee-01 Bee to the flower (as above, Grade R) | | | | | n/a | |
| j-turn-01 Turn and go (as above, Grade 1) | | | | | n/a | |
| j-rhino-01 Rhino to the water (as above, Grade 1) | | | | | n/a | |
| j-count-01 Count the steps (as above, Grade 2) | | | | | n/a | |
| j-bus-01 Bus to school (as above, Grade 2) | | | | | n/a | |

---

## B. Devices and printing (once)

| # | Check | Done |
|---|---|---|
| B1 | Install and use on a **low-end Android phone** on mobile data | ✅ Owner, 2026-11-22 (Android + desktop) |
| B2 | Same phone in **airplane mode**: home, lessons, a downloaded lesson, its slides and template | |
| B3 | **TalkBack** (Android screen reader) on home, a lesson, slides and a template page | |
| B4 | **iPhone/Safari**: Share → Add to Home Screen, then offline use | |
| B5 | Print a template from **Chrome on Android** and from **Chrome/Edge on Windows**; 50 mm square correct | |
| B6 | Slides on a **projector** or large TV in a classroom; readable from the back | |
| B7 | Samsung Internet browser: install and offline | |
| B8 | **micro:bit**: on `/code/`, Send to micro:bit from Chrome/Edge on a computer; the heart blinks. Then Download .hex and copy it to the MICROBIT drive. Note the board version (V1/V2, printed on the back) | ✅ Owner, 2026-11-22 (Windows, Chrome): Send and Download both work |
| B10 | **Your own program**: blocks with button A, sent to the micro:bit | ✅ Owner, 2026-11-22 |
| B11 | **On-screen micro:bit vs real**: the same program behaves the same on both (LEDs, buttons, motor pins with the motor driver) | |
| B12 | **Sound on the on-screen micro:bit**: a program with music plays sound on a phone **and** a laptop (Windows Chrome) after tapping Run. If not: tap **Test sound** (a beep means the computer's sound works) and note the browser and whether "Sound is off" shows | |
| B14 | **Answer sheet**: print two lessons' answer sheets on a school printer; one A4 page each; learners in Grades 3–7 can read the questions and have enough room to write | |
| B15 | **Motor driver extension** on real parts: two motors on an L9110S (A on P0/P1, B on P2/P8, 2 × AA motor supply, adult wiring check); speeds 30%, 60%, 100% forward and backward match the on-screen micro:bit | |
| B16 | **Robot profile `l9110s-basic` on a real board** (micro:bit + L9110S): with `rfa_robot`, left and right motors go forward and backward at 30 %, 60 % and 100 %; stop stops both; whiskers on P12/P15 and line sensors on P13/P14 read right (check the line polarity on black insulation tape); the pen servo on P16 goes down and up. Then set `testedBy` and `status: published` in the profile | |
| B17 | **Robot sensors panel** on a phone with TalkBack: the four whisker and line checkboxes are announced and can be ticked; the left/right motor and pen lines are read out when they change | |
| B18 | **Robot tab on a budget Android phone**: the robot moves smoothly (about 30 frames a second) in the follow-the-line world with the micro:bit running; "Where is the robot?" and the challenge result are read out by TalkBack; the Monitor table is read row by row and the grid letters are readable | |
| B19 | **Surprise maze on two devices**: type the same maze number and size on two different phones; the mazes look the same. The mission checklist is read out by TalkBack, with "done" or "not done yet" for each mission | |
| B20 | **Print course on two different printers**: print bump maze 4817 (4 × 4) at 100 % from a phone or laptop; the calibration square measures **100 mm ± 1 mm** on both; the 15 tiles join with the corner marks lined up, following the assembly map; the build sheet's 25 walls match the walls on screen; lines and zones are readable on a black-and-white printer | |
| B21 | **Season 1 "Rhino Patrol" on the floor**: print and build the three courses (Junior 4 × 3, Grade 5–6 5 × 4, Senior 6 × 5) from Print course; each fits a classroom floor or a corridor; the tunnel, gate flap and waterhole walls stand up; a Grade 3–4 group finishes Junior with timed moves, and a Grade 7–9 group finishes Senior with sensors; teachers say the mission names and difficulty suit each grade band | |
| B22 | **Season banner with TalkBack and in sunlight**: choose a Season 1 course; the picker announces the "Season 1: Rhino Patrol" group; the banner reads the season name, its state and the description; the rhino badge is recognisable on a budget phone outdoors | |
| B23 | **Back office sign-in** (after `docs/deploy.md` §5): an email not on the Access list never reaches the sign-in page; a listed admin passes Access, signs in, sets up an authenticator app and lands on Home; a wrong code is refused; signing in as a different account from the Access email is refused; everything works on a phone at 360 px and with a keyboard only | |
| B24 | **Back-office roles**: an owner gives Reviewer to a signed-up account by email and takes it away; an owner can't give Owner; a super admin can; the last super admin can't be removed; the vaulted break-glass account signs in from the vault; every change shows in the audit log | |
| B25 | **Season dates from the back office**: a competition manager changes Season 1's start date on a phone and saves; a pull request opens that changes only `content/seasons/rhino-patrol.json` and names them; an end before the start is refused on the page; after the merge the Robot tab's season banner shows the new state; a reviewer without the competition manager or owner role doesn't see Seasons | |
| B26 | **Banner and switches from the back office**: an owner sets a banner for today to next week with a link and saves; after the merge it shows on a phone on the home page, a lesson and the code editor; TalkBack reads it as "Announcement"; closing it keeps it closed after a reload; switching Print course off hides the button after the merge; a competition manager does not see Site | |
| B27 | **Publish a lesson from the back office**: set reviewer names on Profile; an editor sends `p2-art-01` for review and merges once checks pass; a different reviewer opens the drafts preview (refused without Access), ticks all six items and approves; the editor-reviewer can't approve their own; a build tester records "built and works"; the lesson appears on the production site after the last merge; Unpublish takes it down; every step is in the history and the audit log; all on a phone at 360 px | |
| B28 | **Withdraw and restore**: a reviewer withdraws one template of a published lesson with a reason; after Merge now and the deploy, its page is gone from the live site and the lesson no longer lists it, while the drafts preview still has it; restoring brings it back; withdrawing a world removes it from the Robot tab and the lesson that opened it falls back to the micro:bit view; a competition manager can withdraw a season but not a lesson | |
| B29 | **Review a world in the back office**: an editor sends a new course for review; it shows on the drafts preview but not on the live site; a reviewer tries it on screen, ticks the five world items and approves; after Merge now it appears in the live Robot tab; Unpublish takes it off again; a lesson that opens an unpublished world falls back to the micro:bit | |
| B30 | **isiZulu with a first-language speaker** (before isiZulu is published): the reviewer reads the isiZulu interface and three Phase 1 lessons on a phone; technical words are understood or have an agreed loan word; a Grade 4 class understands the safety notes read aloud; a second speaker spot-checks one lesson | |
| B31 | **Add and remove a language**: an owner adds isiZulu on the Languages screen; the pull request has three files and passes CI; after merging, isiZulu shows as a draft with 0 % of the interface translated and nothing changes for learners; a reviewer ticks isiZulu on their Profile; removing needs its name typed; English can't be removed; a published language must be withdrawn first | |
| B32 | **Language switch on a phone** (drafts preview, then live once a language is published): English / isiZulu in the header; tapping isiZulu opens the same page at `/zu/…`; the site opens in isiZulu next time; TalkBack reads the page in the right language; links stay in isiZulu; offline, visited isiZulu pages still open | |
| B33 | **Review isiZulu in the back office**: a translator sends isiZulu for review; a reviewer without isiZulu on their Profile can't approve it; one with it reads the words side by side with English, ticks the five items and approves; approving is refused while words are missing; after Merge now the live site offers isiZulu | |
| B34 | **isiZulu interface words (AI draft)**: a first-language isiZulu speaker (the translator) reads every word on the drafts preview on a phone: meaning kept, safety words exact, words a Grade 3 child knows, local terms (e.g. robot, motor, micro:bit names), and fixes them before B33 | |
| B35 | **Review an isiZulu lesson in the back office**: Content → Languages → isiZulu → the crank rhino shows each part beside the English; a reviewer who reads isiZulu ticks the six items and approves; Merge now; on the live site (once isiZulu is published) the lesson shows in isiZulu, and after an English edit it shows in English until the translation is updated | |
| B36 | **Translation flags**: the back-office home and Content → Languages → isiZulu flag live lessons without a published isiZulu translation, a translation that needs updating after an English edit, missing interface words by area (worlds and challenges included), and the not-yet-translatable text | |
| B37 | **isiZulu template sheet printed**: print `rhino-parts.zu.svg` at 100 %; the 50 mm square measures 50 mm, parts match the English sheet exactly, every word on it is isiZulu and fits its space | |
| B38 | **Verify an organisation**: a coach verifier opens People → Organisations, sees a waiting school with its EMIS hint, calls the DBE-listed number, verifies by "official phone"; an unregistered club is verified by two phone-confirmed references; the audit log shows both | |
| B39 | **Parent enrols a child**: on a low-end phone, a parent opens a class's enrolment link (or scans its QR code), signs in with the emailed code, reads the notice and understands it (ask them to say back what is kept and who sees it), enrols their child; the isiZulu notice and consent words are reviewed by a first-language speaker; the child appears in the teacher's class | |
| B40 | **Parent manages a child**: on a phone, a parent opens Your account, sees their child's class and school, saves a copy of the records and opens the file, takes the child out of a class (the teacher no longer sees the child), then deletes the profile after the warning; the deleted child can no longer sign in | |
| B41 | **Certificate name, end to end**: with the live certificate service, a parent adds a child's name; in Supabase's table editor the `certificate_name` column shows only unreadable bytes; Supabase logs and the browser's storage hold no trace of the name; the parent replaces it, then removes it | |
| B42 | **Show names**: a teacher at a verified school taps Show names on a phone, sees the names for 2 minutes, leaves the app and returns (names gone); a teacher whose sign-in is older than 12 hours is asked to sign in again; a teacher of another class can't see them; Support sees each reveal in `name_reveals` without names | |
| B43 | **School enrolment by email**: with a real email provider, a teacher enrols three learners (one with a mistyped email); two parents receive the email in their inbox (not spam), the message has no child's name, the link opens on a phone; the mistyped one is reported and stays in the form; the teacher withdraws one waiting request | |
| B44 | **Parent confirms**: the parent opens the link, signs in with the same email, confirms with and without keeping the school's name; opening the link signed in with another email is refused; an expired link (after 14 days) says so | |
| B45 | **Due for deletion**: the data protection officer (with MFA) sees an aged test account on Privacy → Due for deletion with its school or display name and no child's name or contact; keeps one with a reason and deletes another; both show in the audit log as counts or reasons only; the home page flags the list after 7 days; a locked test account's sign-in is refused with the locked message | |
| B46 | **Daily job, live**: with an email provider, a test enrolment left unconfirmed gets reminders on days 5 and 10 with a working link and is gone after 14 days; an aged test account gets the 10- and 11-month warnings, appears on Due for deletion, and the Information Officer receives the 7-day notice; the Worker's cron runs show in Cloudflare without any names or emails | |
| B47 | **Learners sign in on a shared phone**: with the live sign-in service, three Grade 3–4 learners take turns on one low-end phone: class code, tap name, choose and repeat four pictures, then "Who's using this phone?" next time; a learner with a screen reader signs in with the picture names; five wrong tries lock for 5 minutes; a parent's "sign out everywhere" ends the session; a teacher resets a forgotten PIN; time how long a learner takes | |
| B48 | **Record a sheet offline**: a learner fills in a printed sheet, then on a phone in flight mode signs in (from "Who's using this phone?"), types the sheet code and records it; it shows "saved on this phone"; two learners do this on one phone; turning data on sends both, each under its own learner; the teacher sees them (step 6); a sheet printed before a lesson was changed still records | |
| B49 | **QR cards at an event**: an organiser prints a class's cards on A4 (four across, each scans from a cheap phone's camera), learners sign in by scanning; after the event "Withdraw all cards" stops them; a teacher resets a locked learner's pictures and the learner chooses new ones | |
| B50 | **Progress views**: a teacher opens a class of 30 on a phone, filters to Phase 1, reads the grid (scrolls sideways inside it, not the page), spot-checks a record against its signed paper sheet and revokes a wrong one; a parent sees their child's lessons and "Not yet" items in their language; a screen reader reads each cell's meaning | |
| B51 | **Badge review** (back office → Badges): a reviewer looks at each draft badge's picture (printed and on a phone, readable to Grade 3 learners, no words), its English and isiZulu name and description, and whether its rule is fair; then publishes it (status `published`, `reviewed_by`) | |
| B52 | **Earning a badge**: with live services, a learner records a complete sheet on a phone and sees "You earned a badge" with its picture; the parent gets the email (nickname and badge, no real name) and sees the badge in Your children; a class with "badges need a check" (switched on in the class's Progress) awards only after the teacher marks it checked; a revoked record doesn't award; a teacher revokes a badge given by mistake and it isn't given again | |
| B53 | **Check a certificate**: someone outside the school opens /verify/ on a phone, types a real code from a badge (any case, with or without dashes) and sees the badge, date and school; a withdrawn badge's code says withdrawn; no name or nickname appears anywhere | |
| B54 | **Certificates printed**: a parent downloads their child's certificate on a phone and prints it on a home or school printer (A4, colours, the name with any accents spelled right, the QR code scans to /verify/); a teacher downloads a class's badge cards (four per A4, cut on the dashed lines); a child without the name consent gets a blank line; the PDF is about 11 KB | |
| B55 | **Family group**: a homeschooling parent starts a family group on a phone, adds two children, a child signs in on the family phone with the code and pictures, the parent taps "Learn as" on their own phone, the other parent opens the link, is confirmed by name and sees the children; a ninth child is refused; a certificate says "Awarded by Robots For All" | |
| B61 | **Junior lessons in a classroom**: a Foundation Phase teacher reads the six lessons for wording (read aloud to Grade R), timing (about 30 minutes, 2–5 minutes per activity) and the unplugged floor grid; is "Try" the right word for the fourth step, and do the Junior lessons sit well first in the lessons list? | |
| B60 | **Junior printing**: print the arrow cards and the six mission sheets on a school printer (colour and black and white). Do the cards cut cleanly at 6.2 cm, and can a Grade R child tell the arrows apart in black and white? Do the boards fit one page? | |
| B59 | **Junior with children** (Grades R–2, cheap phones and a projector): can they add and take out blocks without help, read the pictures without words, and solve the three missions? If tapping doesn't work for them, ADR-0019's fallback (Blockly sideways) is built | |
| B58 | **AI helper safety, live** (owner, before switching the helper on and after any prompt or model change): `npm run helper-safety -- <model>` for each allowed model; every question passes; a reviewer reads the isiZulu answers | Part done: `claude-haiku-5-5` 59/59, owner, 2026-11-27 (prompts adult-v1, child-v1). Still to do: a reviewer reads the isiZulu answers |
| B57 | **Name key rotation rehearsal** (owner, before launch): on a test project with a few enrolled learners, make key 2, make it current, let the daily job run, check Privacy → Name key shows 0 on key 1, remove key 1 and print a certificate and tap Show names: the names are still right | |
| B56 | **Learning myself**: an adult beginner makes their own learner profile on a phone (the 18+ tick is required), taps Start learning, records a sheet offline, earns a badge, adds their own name and downloads a certificate saying "Awarded by Robots For All"; later joins an evening club's class and the coach sees them | |
| B13 | **Open in code editor** from a Phase 2 lesson on a phone, then Run and Send to micro:bit | |
| B9 | **micro:bit from Android**: Send to micro:bit over a USB-OTG cable in Chrome | |

---

## C. Before public launch (once)

| # | Check | Done |
|---|---|---|
| C1 | `robotsforall.org.za` connected (`docs/deploy.md` §4); HTTPS works; security headers present; `SITE_URL` variable set; `www.`, `robotsforall.co.za` and `robotsforall.africa` redirect to it with the path kept; the app installs and works offline from the new address | Part done: `robotsforall.org.za` works (owner, 2026-11-27). Redirects still to do |
| C2 | Vodacom ConnectU zero-rating applied for `robotsforall.org.za` (then MTN, Telkom, Cell C). Owner, 2026-11-27: Vodacom zero-rating is limited to specific institutions; approach Vodacom once the platform is complete and working | |
| C3 | Privacy page reviewed by the owner against POPIA | |
| C4 | Licence of `@inlang/plugin-message-format` confirmed (build-time tool) | |
| C5 | A short pilot: one class or club uses 2–3 lessons and gives feedback | |

---

## Version history

| Version | Date | Change |
|---|---|---|
| 0.1 | 2026-11-22 | First list: lessons 1–3, devices, launch checks |
| 0.2 | 2026-11-22 | Lessons 4–6 added |
| 0.3 | 2026-11-22 | Lessons 7–10 added |
| 0.4 | 2026-11-22 | micro:bit flashing checks (B8, B9) |
| 0.5 | 2026-11-22 | B8 passed |
| 0.6 | 2026-11-22 | B10 passed; B11 added |
| 0.7 | 2026-11-22 | Six Phase 2 lessons added; B12 (laptop sound) and B13 (Open in code editor) |
| 0.8 | 2026-11-23 | B12 adds the Test sound check; B14 answer sheets |
| 0.9 | 2026-11-23 | B15 motor driver extension |
| 0.10 | 2026-11-23 | B16 robot profile `l9110s-basic` on a real board (ADR-0008) |
| 0.11 | 2026-11-23 | B17 Robot sensors panel with TalkBack |
| 0.12 | 2026-11-23 | C1, C2 name the hostname `robotsforall.org.za` and the redirects |
| 0.13 | 2026-11-23 | B18 Robot tab on a budget phone and with TalkBack |
| 0.14 | 2026-11-23 | B19 maze numbers on two devices; mission checklist with TalkBack |
| 0.15 | 2026-11-23 | B20 print course on two printers |
| 0.16 | 2026-11-24 | Lesson p2-motor-03 Two motors: turning |
| 0.17 | 2026-11-24 | Lesson p2-whisker-01 Whisker bumper |
| 0.18 | 2026-11-24 | Lesson p2-line-01 Follow the line |
| 0.19 | 2026-11-24 | Lesson p2-maze-01 Bump maze |
| 0.20 | 2026-11-24 | Lesson p2-art-01 Pen art |
| 0.21 | 2026-11-24 | Lesson p3-linemaze-01 Line maze |
| 0.22 | 2026-11-24 | B21 Season 1 courses on the floor |
| 0.23 | 2026-11-24 | B22 season banner |
| 0.24 | 2026-11-24 | B23–B24 back office |
| 0.25 | 2026-11-24 | B25 season dates from the back office |
| 0.26 | 2026-11-24 | B26 banner and switches |
| 0.27 | 2026-11-24 | B27 publish a lesson from the back office |
| 0.28 | 2026-11-24 | B28 withdraw and restore |
| 0.29 | 2026-11-24 | B29 review a world |
| 0.30 | 2026-11-24 | B30 isiZulu with a first-language speaker |
| 0.31 | 2026-11-24 | B31 add and remove a language |
| 0.32 | 2026-11-24 | B32 language switch |
| 0.33 | 2026-11-24 | B33 review isiZulu |
| 0.34 | 2026-11-24 | B34 isiZulu interface words (AI draft) |
| 0.35 | 2026-11-24 | B35 review an isiZulu lesson in the back office |
| 0.36 | 2026-11-24 | B36 translation flags |
| 0.37 | 2026-11-24 | B37 isiZulu template sheet printed |
| 0.38 | 2026-11-25 | B38 verify an organisation |
| 0.39 | 2026-11-25 | B39 parent enrols a child |
| 0.40 | 2026-11-25 | B40 parent manages a child |
| 0.41 | 2026-11-25 | B41 certificate name end to end, B42 Show names |
| 0.42 | 2026-11-25 | B43 school enrolment by email, B44 parent confirms |
| 0.43 | 2026-11-25 | B45 Due for deletion |
| 0.44 | 2026-11-25 | B46 daily job, live |
| 0.45 | 2026-11-25 | B47 learners sign in on a shared phone |
| 0.46 | 2026-11-25 | B48 record a sheet offline |
| 0.47 | 2026-11-25 | B49 QR cards at an event |
| 0.48 | 2026-11-25 | B50 progress views |
| 0.49 | 2026-11-25 | B51 badge review |
| 0.50 | 2026-11-25 | B52 earning a badge |
| 0.51 | 2026-11-25 | B53 check a certificate |
| 0.52 | 2026-11-25 | B54 certificates printed |
| 0.53 | 2026-11-25 | B55 family group |
| 0.54 | 2026-11-25 | B56 learning myself |
| 0.55 | 2026-11-25 | B57 name key rotation rehearsal |
| 0.56 | 2026-11-27 | B58 AI helper safety, live |
| 0.57 | 2026-11-27 | B58: Haiku 5.5 safety test set 59/59 (owner) |
| 0.58 | 2026-11-27 | C1: robotsforall.org.za live, redirects outstanding; C2: approach Vodacom once the platform is complete |
| 0.59 | 2026-11-27 | B59 Junior with children |
| 0.60 | 2026-11-28 | B60 Junior printing |
| 0.61 | 2026-11-28 | Six Junior lessons waiting for A1–A6; B61 Junior lessons in a classroom; B60 covers six mission sheets |
