# Shortcut

Use familiar Figma shortcuts in Illustrator or Photoshop. **Learning** shows a hint; **Direct remap** sends supported target shortcuts. The app has three views: **Recent history**, **Achievements**, and **Settings**. Choose the mode above the app selector, then save the app choice. Search, Home and Saved are removed; completed first tries live in Achievements.

## Run

Requires Node.js 24. The native app also needs macOS 13+ and Xcode Command Line Tools.

```sh
npm ci
npm run dev
```

For the macOS app:

```sh
npm run desktop
```

This compiles `desktop/build/Shortcut.app` and opens it. Enable Accessibility for that app when macOS requests it. Rebuilding an ad-hoc-signed app can require renewing its permission. `npm run desktop:build -- --staging` instead creates `desktop/build/staging/Shortcut Preview.app`, with its own bundle identity, Accessibility entry and local data. This keeps the review build separate from the existing application's binary, permission record and activity.

The browser previews the interface and stores local preferences and self-reported tries. It cannot intercept another application’s input or create real native usage history. Native preferences/history use macOS UserDefaults and are separate from browser localStorage. No backend or account is used.

## Keyboard behavior

Figma Mode starts Off after relaunch or changing the app pair. The menu-bar switch, Settings switch, or **Control+Shift+Space** turns it on/off. Learning and Direct remap share the selected catalog.

- In Illustrator, **K → S**, **R → M**, **Shift+P → N**. These select tools; drawing/resizing still needs your interaction.
- **Cmd+D → Cmd+C, Cmd+F** duplicates in place, with a clipboard side effect. It does not reproduce all Figma smart-duplicate behavior.
- Shared shortcuts such as **Cmd+C** pass through. Learning temporarily gives the hinted target sequence priority over conflicting source keys.
- Manual/unavailable actions send no replacement. Learning details give the alternative; Direct remap shows brief unavailable feedback.
- Off, pause, other apps, protected text input and Secure Input preserve original input. Unknown keys pass through. The conservative canvas Type guard clears with Escape or Cmd+Return after editing.
- Option/Control/Command/Shift, physical punctuation, arrow/navigation/function keys and aliases are supported. This assumes default **US QWERTY** physical keys and default Adobe keymaps.

Generated events are tagged, sent only to the captured target PID, and paired down/up. A bounded queue checks mode, app, permission and text context between steps. Escape, pause, mode or app changes cancel pending work. “Shortcut sent” means event submission, not confirmation of an edit. The app does not read document text, screenshots, clipboard contents or ordinary typed text.

## Coverage and verification

Illustrator has **159 classified Figma Design actions**: **55 executable/shared** (28 translations and 27 shared chords), **81 manual/Figma-specific**, and **23 contextual reference entries that preserve native input**. Another 16 pointer gestures are classified separately. This is not 159 automatic mappings and is not a claim of all Figma products/versions being supported. See [Illustrator coverage, sources and limitations](docs/illustrator-coverage.md) and the machine-checked [baseline](docs/illustrator-coverage.json).

Photoshop retains its earlier 10-action catalog (9 executable/shared, one unavailable); its expansion is a separate task. All cards keep `verified: false` until hands-on action checks. Automated tests do not prove Illustrator document results. Shortcut Preview now has Accessibility permission. Automation can select native Illustrator tools, but did not trigger the registered global toggle or produce remap history, so it is not accepted as proof of the global input path. Physical-keyboard and native History relaunch acceptance remain pending.

## History and achievements

Direct remap records known successful submissions and shared chords, grouped by local date/action with count and time. Expanding a row shows the actual source/target snapshot, including the alias used. The latest 500 uses are retained. Manual/failed/cancelled actions, generated substeps, repeats, unknown keys and protected typing are excluded.

Learning unlocks a first-try achievement after the hinted target shortcut (or complete sequence) is pressed in the selected app within two minutes. It records a try, not mastery or a proven edit. A brief success notice celebrates it. The browser offers an explicit self-report button. Existing lookup records remain stored for compatibility but are not converted into achievements or usage.

Reset data asks for confirmation. It clears local stored activity, achievements and preferences. Closing the native window leaves its menu-bar app running; quit from the app menu to stop it.

## Checks

```sh
npm run lint
npm run build
npm run test:catalog
npm run test:history
npm run test:desktop
```

Native tests construct Quartz events without posting input and need macOS WindowServer access. `npm run desktop:build -- --staging` also compiles the complete native shell. Builds and dependencies are ignored by Git. No new dependency is required.

## Hosting and code

The static [GitHub Pages workflow](.github/workflows/deploy.yml) keeps the automatic repository base path. Hash routes survive refresh. Legacy `#/saved` goes to Achievements; Home and unknown routes go to Settings. Local commits do not publish the website; a push to `main` triggers Pages.

- `src/screens/` — settings, achievements and recent history.
- `src/data/` — shared native/web action catalogs and source provenance.
- `src/lib/shortcuts.ts` — physical chord parsing and normalization.
- `desktop/ShortcutPolicy.swift` — source filtering, aliases, text/app protection.
- `desktop/Remapping.swift` — target plans, event construction and cancellable sequences.
- `desktop/CompletionTracker.swift` — target follow-through and first-try tracking.
- `desktop/RemapHistory.swift` — immutable key snapshots and local retention.
- `desktop/main.swift` — native app, permissions, menu bar and React bridge.

Historical research/decisions remain in [shortcut-reference.md](docs/shortcut-reference.md), [decision-log.md](docs/decision-log.md) and [user-test.md](docs/user-test.md). Their earlier UI descriptions and coverage counts are historical; the current baseline is linked above. Original Figma exports under `11/` are preserved.
