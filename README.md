# Mess Hisab (মেস হিসাব) — notes for AI assistants and the owner

This file is NOT shown in the app. It is a handover document: any AI (or the owner after a long break) should read it fully before editing the project. The owner writes loose Bengali; interpret sensibly.

## 1. What this is

A mobile-first, vanilla-JS (no build step, no framework) mess meal-accounting web app. Data lives in the browser (localStorage) and is synced to a Google Sheet through a Google Apps Script web app.

There is only ONE version of the app. There is no separate admin build. Ordinary members and the mess manager (admin) see exactly the same screens. The admin is simply the person who knows the PIN and the hidden gestures (section 6).

## 2. File map

```
README.md            this file
sw.js                service worker (offline support, see section 10)
manifest.webmanifest web-app manifest (name, icons, standalone display)
index.html           shell: header (logo + title + EN/theme buttons), <main id="view">, bottom tab bar
src/style.css        all styles (black & white only)
src/data.js          CONFIG.API_URL + Store (data model, localStorage, helpers)
src/sync.js          Sync (load/flush with the Apps Script backend)
src/people.js        People tab: member grid, profile, add/edit form, calendar
src/bill.js          Bill: account card, payments, attendance sheet (hazira khata), hidden settings page
src/app.js           App: routing, tabs, dashboard ("আজ"), dialogs, hold gesture, scroll memory, back logic
backend/Code.gs      Google Apps Script (paste into the Sheet's Apps Script project)
assets/              icon.svg, icon-32.png, icon-192.png, icon-512.png, apple-touch-icon.png, preview.png (1200x630 share-preview image)
```

Script load order in index.html: data.js, sync.js, people.js, bill.js, app.js. Globals: `Store`, `Sync`, `People`, `Bill`, `App` (`window.App`).

## 3. Backend and sync (Google Sheet + Apps Script)

- Sheets: `Settings(key,value)` keys mealRate, cutDay, pin, rev; `Groups(id,bn,en)`; `People(id,name,phone,group,join,leave,noonServe,nightServe,photo)`; `Off(date,pid,meal)`; `Pay(id,pid,date,amt)`.
- `noonServe`/`nightServe` columns (G and H of the People sheet) are legacy: the per-member meal-place override was removed from the app, so they are always empty. They are STILL wired into Code.gs by column position (read as `r[6]`,`r[7]`, photo as `r[8]`; written as 9 columns), so never delete them in the Sheet on their own: that shifts the photo column and the next save would erase every member photo.
- **PENDING TODO for the next time Code.gs is changed for ANY reason (owner request):** also remove these two legacy columns from the backend. In Code.gs: drop `"noonServe","nightServe"` from `SHEETS.People`; in `getData` remove the `r[6]`/`r[7]` `serve` block and read the photo from `r[6]`; in `doPost` write `[p.id,p.name,p.phone||"",p.group,p.join||"",p.leave||"",p.photo||""]` (7 columns). The owner must then, at the same time as deploying the new Code.gs, delete columns G and H in the live People sheet (take a copy of the Sheet first) — or start from a fresh empty Sheet. Tell the owner these manual steps explicitly. Until then leave the backend as it is. The client code (src/) no longer uses `serve` at all, so no src change is needed for this.
- `doGet` (`?action=load`) returns all data + `rev`. NO PIN is needed to read. This is a known, accepted risk: anyone who has the backend URL can read all data. The URL is in `CONFIG.API_URL` in src/data.js (public if the code is public).
- `doPost` (`action:"save"`) overwrites all sheets. It checks the PIN, then `baseRev` (optimistic concurrency; mismatch returns `conflict` with fresh data), under a `LockService` lock. Values are written as text.
- PIN is stored in the Settings sheet (plain text). Default is `1234` — the owner must change it in the hidden Settings page.
- A Sheet cell holds at most 50,000 characters, so member photos are resized client-side to 320px and kept under ~30,000 characters (stored as a data URL in the `photo` column). Do not raise this without a different storage plan.
- Client sync (src/sync.js): loads on open, after >30 s hidden, and when back online; saves ~1.2 s after any change (`Store.onSave`). `mess_dirty` makes the app flush instead of load. Wrong PIN or conflict shows a dialog and reloads server data.
- localStorage keys: `mess_data_v1` (all data), `mess_rev`, `mess_dirty`, `mess_lang`, `mess_theme`, `mess_pinok`.
- Changing the backend (new columns, new fields) means the owner must re-paste Code.gs and re-deploy as a new version. Always tell the owner explicitly whether manual backend / Google Sheet work is needed.
- Code.gs style rules (owner requirement): no unnecessary comments, NO indentation (every line flush left).
- Pay entries carry their type in the id prefix so no Sheet column is needed: `y…` normal payment, `w…` waive ("বাকি/অ্যাডভান্স কাটা"), `d…` advance deposit. Keep this convention.

## 4. Business rules

Ordering (Members tab AND attendance sheet): groups in the fixed order Unico Shift 1, Unico Shift 2, Zahir Tower, Others (`Store.groups()`), and inside each group members sorted by ID ascending (`Store.idcmp`).

Member IDs: sequential 4-digit strings starting at 1001. Old long IDs are auto-migrated (`Store.fixIds`). The ID is shown in the form but can NOT be edited. Changing an ID would orphan Off/Pay rows and break share links.

Month cycle: the "month" runs from day `cutDay+1` of one month to day `cutDay` of the next (default cutDay 10, so 11th → 10th). `Store.span(y,m)`, `Store.cur()`.

Billing (src/bill.js):
- Charge = eaten meals × per-meal rate (`mealRate`, default 60). For the current month only meals that have already passed count (`Store.passed`: noon after 13:00, night after 20:00); past months count all eaten meals.
- Meals can be turned off per member/day/meal (`Store.off`). Joining/leave dates limit the active days (`Store.active`).
- `cum()` gives cumulative balance: positive = due (বাকি), negative = advance credit (অ্যাডভান্স).
- Waive: for a past month with a small leftover (due ≤ ৳200 or advance ≤ ৳50) the badge can write a `w` entry that zeroes it.
- Advance deposit (জামানত, id prefix `d`): tick "অ্যাডভান্স জমা" in the payment dialog. It is NOT counted in the monthly bill/balance. Each month the account card shows a note "অ্যাডভান্স জমা আছে ৳X (হিসাবে ধরা নেই)". In the month of the member's leave date (and after) the deposit is netted against the balance and shown as "অ্যাডভান্স থেকে কাটা".

Unico shifts (hospital teams, groups `unico-day` = "ইউনিকো শিফট ১", `unico-night` = "ইউনিকো শিফট ২"):
- The group names are overridden in code (`Store.gn`); the Groups sheet may still hold old names.
- Week runs Saturday → Friday. The two groups swap day/night every week. Anchor: Friday 2026-11-13 (ISO week 46) → shift 1 is "day" in that week. Parity uses a continuous week index, so it keeps working across years (`Store.week`, `Store.duty`).
- Label rule (`Store.shift`): Friday is always "night" for both shifts (the day team goes on at 14:00 for 18 h; the night team is released at 14:00). Saturday–Thursday follow the week's day/night. Headers and profiles show e.g. "ইউনিকো শিফট ১ (দিন)".
- Food routing (`placeOf` in app.js, unchanged logic): day team → noon hospital (and Friday night hospital); night team → noon Zahir Tower except Friday; Zahir group → noon Zahir Tower; everyone else / any other meal → self pickup ("অন্যান্য (নিজে নিয়ে যাবে)"). "Others" group is self pickup. There is no per-member override anymore.

Dashboard (tab "আজ"): per day, noon and night cards with totals, distribution (hospital / Zahir / others), friday-night hospital line, active member count; name chips ordered hospital → Zahir → others; night card is moved first from 15:30 to 22:30.

Attendance sheet (button at the top of the Members tab, route `#people/sheet`): A4 landscape "paper" pages (1123×794 px design size scaled to fit). Columns: ID, name, this-month normal payments only (advance deposits and waives excluded), then one column per day of the cycle, then a last grey bold "মোট মিল" column (total meals of the month = sum of the cells; its width was taken from the name column so the day columns keep their size). Cell: `২` two meals, `১` one meal (shown as a grey filled circle), `✕` no meal, blank = not a member that day / future. Rows: members active at least one day in the month, sorted by ID, 18 per page. Month can be changed with ‹ ›. A download-icon button prints / saves PDF (A4 landscape, margin 0 via an injected `@page`, `@media print` CSS hides everything except the pages).

## 5. UI rules (owner requirements — keep!)

1. Colors: ONLY black and white (plus the muted grey token `--mute`; the one-meal circle is `#555`). No other colors anywhere. Icons are inline SVG with `currentColor` (no emoji icons). Dark mode swaps the tokens; the attendance paper is always white.
2. Popups: ALL dialogs use one system, `App.dlg` (and its helpers `App.ask`, `App.msg`, `App.unlock`) with the class `.dlg`: width : height = 2 : 1 (`aspect-ratio:2/1`, width `min(92vw,420px)`), same border, radius, buttons (right button filled black). Never use the browser's `alert`, `confirm` or `prompt`. Content-heavy dialogs (e.g. delete member) may grow taller rather than cut text. The photo zoom overlay is the only non-dialog overlay.
3. Fonts: Bengali first (Noto Sans Bengali / Hind Siliguri system fallbacks); UI is bilingual (bn / en toggle). All strings go through the `T` dictionaries (`bn`/`en`) in each module, merged into `App.tr`.
4. Keep it light: do not add heavy features or libraries. Do only what the owner asks — no extra out-of-scope changes.
5. The floating bottom tab bar has a soft shadow and a blurred, faded strip behind it (`body::after` in style.css, hidden when printing) so scrolling content does not visually mix with it.
6. Hidden-feature policy: see section 6.

## 6. Click vs press-and-hold (IMPORTANT — owner may forget)

Because there is no admin version, everything that changes data is hidden behind a LONG PRESS (about 0.6 s; 0.7 s on the logo). A plain tap does nothing, so ordinary members who just scroll and tap never see PIN prompts. Implementation: `App.hold(element, fn, ms)` in app.js (cancels on pointer move >10 px / scroll / leave; blocks the next overlay click for 0.7 s).

| Where | Press and hold on… | Result |
|---|---|---|
| Header | the app logo (left of the title) | opens the hidden Settings page (meal rate, month end day, new PIN) |
| Dashboard ("আজ") | a member's name chip | PIN → "turn this meal off / on?" confirm |
| Member profile | the member's name (big text) | PIN → edit form (the old pencil button was removed) |
| Member profile → calendar | a day cell | PIN → dialog with noon/night ticks |
| Member profile → account card | the "এই মাসে জমা" box | PIN → add payment dialog (amount + "advance deposit" tick) |
| Member profile → payment chips | a payment / advance / waive chip | PIN → delete confirm |
| Member profile → account card (past month) | the due/advance badge (only when small enough to waive) | PIN → waive confirm |

Plain CLICK (always visible, not hidden): "+ নতুন সদস্য" (asks for the PIN first, so ordinary users hit the PIN prompt and understand they cannot add members), the hazira-khata and print buttons, tab bar (আজ / সদস্য only), language / theme buttons, month ‹ › arrows, member cards, back/share buttons, the form's Save / Cancel / Delete buttons.

The Settings tab is hidden from the tab bar (only the long-press on the logo, or typing `#settings`, reaches it). That is obscurity, not security: every write still needs the PIN (checked locally and by the backend). Remind the owner to change the default PIN.

Every edit requires the PIN once per session (`App.unlock`); first-time devices accept the typed PIN locally and the backend validates it.

## 7. Navigation and scroll

- Hash routes: `#today`, `#people`, `#people/<id>`, `#people/edit/<id>`, `#people/new`, `#people/sheet`, `#settings`. Members share profile links as `…/index.html#people/<id>`.
- Scroll position of the three top-level pages is remembered per page and restored when you come back (`pos` in app.js). Profile/form pages always open at the top. `history.scrollRestoration` is manual.
- `App.back(hash)`: if the previous page was that hash it uses `history.back()`, otherwise `location.replace`. Use it for back/cancel/save-and-return so the history never fills with duplicates. New pages use `location.hash=` (push).

## 8. Working rules from the owner (for the AI doing the edit)

1. The owner writes loose Bengali. If several instructions are given and some are unclear, first say what you understood and what is confusing, ask the confusing parts as click-to-answer multiple-choice questions, then do all the work together after the answer.
2. Safety first: never make a change that could harm the site or weaken security. If an instruction is risky, warn and ask for confirmation BEFORE implementing.
3. Do ONLY what is asked.
4. After each task give a short list of changed files and say clearly whether manual backend / Google Sheet work is needed, or explicitly "কোনো ব্যাকএন্ড কাজ নেই".
5. Deliver the updated project as a ZIP named `mess-app_NN.zip`, incrementing every time (the top-level folder inside the ZIP is `mess-app/`). Check the latest number the owner has before continuing.
6. Do not change the service-worker cache name (`C` in sw.js, currently `mess-v1`) or any app version number unless the owner explicitly says "এবার সার্ভিস ওয়ার্কারের ভার্সন পরিবর্তন করো".
7. Code.gs: no unnecessary comments and no indentation.
8. Test changes (Playwright with mocked `script.google.com`, mobile viewport ~390 px, bn + en, light + dark) before delivering.

## 9. Known decisions and risks

- Public read access to the data through the backend URL is accepted by the owner.
- Default PIN `1234` must be changed.
- Member photos are limited to 320 px (Sheets cell limit); owner chose not to use Google Drive.
- Editing IDs directly in the Sheet would orphan Off/Pay rows.
- The GitHub repository / hosting has not been created yet (as of this README); the owner will upload the `mess-app` folder contents.

## 10. Offline support (service worker), manifest, share preview

Final-form decisions made when the owner declared the app code finished (from now on only data changes).

- `sw.js` is registered from the end of src/app.js (only on http/https, never file://). Strategy for same-origin GET requests: cache first, and refresh the cache from the network in the background ("stale-while-revalidate"). So the app opens instantly even on a weak or absent connection, and a newly uploaded version appears on the SECOND open after upload. All app files are pre-cached at install (`F` list in sw.js; add new files there if any are ever added, although unknown files are also cached on first use).
- The service worker never touches cross-origin requests, so the Apps Script backend calls (load/save) always go straight to the network and are never cached. Data lives in localStorage; offline edits keep `mess_dirty` set and are uploaded automatically when the phone is online again (`online` / visibility events in sync.js).
- Only if a file is deleted or renamed, or users must be forced to a new version, bump the cache name in sw.js (`mess-v1` → `mess-v2`). Not needed for normal edits. Do not change it without the owner's explicit instruction (section 8, rule 6).
- `manifest.webmanifest`: name, black/white theme, icons 192/512, `display: standalone` (only matters if someone uses "Add to Home screen"; normal Chrome use is unaffected).
- Share preview (Facebook, WhatsApp, Messenger, etc.): Open Graph + Twitter meta tags in index.html with the image `assets/preview.png` (1200x630, logo + "মেস হিসাব"). The same preview is shown for the whole-site link and for every member link, because crawlers ignore the `#…` part of a URL. The image URLs must be ABSOLUTE; they are currently `https://saiful-987-yu.github.io/mess-hisab/…` (GitHub user saiful-987-yu, repository `mess-hisab`, GitHub Pages). If the repository name or domain changes, update the three absolute URLs in index.html (`og:url`, `og:image`, `twitter:image`). Social apps cache previews: after changing them, refresh the cache with Facebook's Sharing Debugger.
- Hosting note: upload the CONTENTS of the `mess-app` folder to the repository root (so `index.html` and `sw.js` are at the root), then enable GitHub Pages.
