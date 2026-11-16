# Shortcut

Use Figma shortcuts while working in Photoshop or Illustrator. Choose **Learning** for hints or **Direct remap** to send supported target shortcuts automatically. The default pair is **Figma → Photoshop**. The website provides manual search and saved lookups; system-wide modes require the macOS app.

## Run the macOS app

Requires macOS 13+, Node.js 24, and Xcode Command Line Tools (`xcode-select --install` if Swift is missing).

```sh
npm ci
npm run desktop
```

This builds and opens `desktop/build/Shortcut.app`. You can also open that app in Finder. No Electron, backend, account, or paid Apple developer membership is needed for this local build.

In the app, choose **Open Accessibility settings**, then personally enable **Shortcut** under **System Settings → Privacy & Security → Accessibility**. A real status readout changes to “Ready” only when macOS allows the event filter to run. If the system switch is on but the app still says permission is missing after a rebuild, remove the old Shortcut entry with “−” and add this exact `desktop/build/Shortcut.app` again with “+”. Toggling a stale entry may not update its code-signing requirement. If needed, quit and reopen the app after granting access.

The app opens directly to Home with Figma → Photoshop selected. There is no tutorial or multi-step onboarding. Settings contains a single relationship editor: **I know Figma → I’m working in Photoshop / Illustrator**.

### Figma Mode: one on/off switch

Click Shortcut’s keyboard icon in the macOS menu bar to open a small native panel with a **Figma Mode** switch. The menu bar shows **On** or **Off**, without labeling the off state as another application. The same switch is available on Home. **Control + Shift + Space** toggles it; Settings and the right-click menu offer alternative switch shortcuts if registration conflicts with another app.

- **Off** restores original shortcuts and stops all keyboard lookups, including the old Control–Option lookup prefix.
- **On** uses the selected workflow: Learning or Direct remap. Both choices are available in the same menu-bar panel and on Home.
- Shared shortcuts such as **Cmd+C** pass through. In Learning, a recently hinted target shortcut takes precedence over a conflicting source shortcut. Direct remap interprets physical source keys as Figma keys and excludes generated target events from reprocessing.
- Other applications keep their original input. Secure Input, accessible text controls, and conservative canvas Type-tool protection suspend hints. If a custom editor does not expose enough accessibility information, input is preserved rather than captured. For canvas text editing, **Cmd+Return** or **Esc** clears the conservative guard after finishing the edit; test your application’s text workflow before broader use.
- Mode starts **Off** after relaunch or a pair change. The chosen workflow and switch shortcut are saved.

### Two workflows

**Learning:** press K in Illustrator to see a hint, then press S yourself. In Photoshop, K shows Cmd+T. Explanations expand only when requested.

**Direct remap:** press K in Illustrator and Shortcut sends S to select the Scale tool. In Photoshop, K sends Cmd+T to enter Free Transform. You still drag to resize. Illustrator Cmd+D sends Cmd+C followed by Cmd+F. A dark, non-interactive notification appears at the same right-side position for two seconds. It does not pause on hover, take focus or capture mouse clicks. Generated keys do not unlock learning achievements or show confetti.

All current executable catalog entries are covered: **15/16 Illustrator entries** and **9/10 Photoshop entries**, including shared keys which pass through unchanged. Auto layout has no direct counterpart in these catalogs and shows brief unavailable feedback. This does not translate every Figma command. Mappings assume default keymaps; document state, tool groups and customized shortcuts still affect results. Rulers/Zoom retain their verification notes in `docs/shortcut-reference.md`.

Every generated chord includes key-down and key-up with the target modifiers. Synthetic events are tagged and routed to the captured app PID. Sequential jobs recheck the app, text protection, permission and mode before each step. Changing apps/modes, pausing or Escape cancels pending steps. A bounded queue and held-key suppression prevent floods. “Shortcut sent” reports event submission rather than a proven document edit. Direct remap never uses the any-app learning test scope or legacy prefixed lookup.

The control lives in Shortcut's own menu-bar popover; it is not a system Control Center widget.

### Use it in real Photoshop

1. Switch to Photoshop.
2. Choose **Learning**, turn on **Figma Mode**, then press the shortcut you remember from Figma directly.
3. Read the hint, then use the Photoshop shortcut yourself.

Examples:

- **K** → Scale → **⌘T**, Free Transform in Photoshop.
- **⌘D** → Duplicate → **⌘J**, Layer via Copy in Photoshop.
- **⌘C** → Copy works normally, without an extra hint because both apps share it.

While Figma Mode is on, supported source shortcut key-downs, held repeats, and matching key-ups are intercepted before the target application receives them. Shared shortcuts pass through; Learning also protects the recently hinted target sequence. While off, all new keyboard input passes through unchanged. Unknown ordinary keys pass through. Learning also supports explicit Control–Option lookups. Learning shows what to press; Direct remap sends supported target shortcuts.

By default, interception happens **only in the selected target app**, identified by its bundle ID. **Listen in any app for testing** deliberately uses the selected deck in other apps and resets off at launch. Pause stops new queries. Closing the window leaves the app running in the keyboard-icon menu bar; use **Quit Shortcut** to stop it.

The hint uses a real, non-activating macOS panel. It stays at the top right of the screen containing the active application window, without following the pointer, and supports full-screen Spaces. New queries replace the existing hint. Choose **View details**, or use **⌃⌥Space** in the target app, to expand the explanation in place. The top-right anchor stays fixed as the panel grows downwards. There is no card flip.

An untouched hint hides after six seconds. Hovering, expanding details, or focusing a website control pauses that timer. Expanded explanations remain until collapsed, closed or replaced. Use the close button or **Esc** to dismiss; Escape also reaches the active app, so it can still cancel transformations or editing. The panel fits its content and stays within the visible screen; long explanations scroll. Saved lookups persist locally.

### First-try achievements

After looking up a card in Learning, press its target shortcut in the matching real app within two minutes. The first matching key-down (or complete sequence) unlocks that card once, shows a brief **Congratulations!** toast and desktop confetti, and saves it under **Achievements**. The target event still reaches the app unchanged. New lookups replace the pending card; pause and changing the pair clear it. No-match and already-unlocked cards do not arm an achievement.

This is evidence of trying the shortcut, not proof that Photoshop completed an edit or that the user has mastered it. No document or screen is inspected. Celebration windows take neither keyboard focus nor mouse input. Reduced Motion disables the falling confetti and keeps the static toast.

On the website, the explicit **I tried this · mark as tried** button records a **self-reported try**; it does not pretend to detect input in Photoshop. Native and browser records remain separate.

### Local limitations

- macOS only; no phone version and no Windows shell.
- First use needs your Accessibility authorization. Rebuilding an ad-hoc-signed binary may require re-enabling it. For stable distribution, use a developer certificate and notarization; this project currently targets local development.
- Secure Input (for example, a protected password field or Terminal Secure Keyboard Entry) can block event taps. The status screen reports it. Other keyboard utilities or OS-reserved combinations can also take precedence.
- Source key mapping currently follows physical US/ANSI key positions, like the previous browser listener. Non-US layouts need user testing.
- Photoshop/Illustrator defaults can be customized. Card copy is based on documented defaults, not inspection of your app’s custom keymap or current document. `verified: false` means the card has not been checked hands-on in both applications.
- The app does not read clipboard contents, screen contents, document contents, or ordinary typed text. Only explicit shortcut queries are retained as card history. There is no network service.

## Run the website

```sh
npm run dev
```

The website has a real core task: enter a Figma shortcut or action (for example `K`, `⌘D`, or `Scale`), open its right-side hint, optionally expand the explanation, and revisit it under Saved. Pair selection lives in Settings. Browser data is stored in localStorage; native data is stored in macOS UserDefaults. They are separate.

**Capability disclosure:** a static website cannot intercept keyboard input in another application. Global interception belongs to the macOS app. There is no simulated Photoshop/Illustrator workspace, fake on-screen keyboard, simulated permission success, or simulated automatic execution. Actual shortcut remapping belongs to the macOS app.

## Commands

- `npm run lint` — ESLint.
- `npm run build` — TypeScript checks and static website build in `dist/`.
- `npm run test:desktop` — native policy and remapping tests, without sending input. Quartz event construction needs WindowServer access (run outside a restricted shell sandbox).
- `npm run desktop:build` — compile and ad-hoc-sign the app in `desktop/build/`.
- `npm run desktop:open` — open the existing build without rebuilding.
- `npm run desktop` — build and open.

After rebuilding a running app, quit and reopen it to load the new code. Build output and dependencies are ignored by Git.

## GitHub Pages

The existing `.github/workflows/deploy.yml` still builds and deploys the **website**, using the repository name as Vite’s base path. Hash navigation remains refresh-safe. The native build has its own relative asset base and does not change Pages configuration.

Source repository: [Kiara-Li/shortcut](https://github.com/Kiara-Li/shortcut). Pages is configured to use **GitHub Actions**. Pushes to `main` run lint, build and deployment.

Website URL after a successful deployment: [kiara-li.github.io/shortcut](https://kiara-li.github.io/shortcut/). Check the latest Actions result before treating a new version as published. Global keyboard interception still requires the local macOS app.

## Code map

- `desktop/main.swift` — macOS app/window/menu, active CGEvent filter, permission status, bundled web views, native persistence.
- `desktop/ShortcutPolicy.swift` — filtering rules, physical keys, target-app matching; tested independently.
- `desktop/ModePopover.swift` — native menu-bar on/off panel.
- `desktop/Remapping.swift` — mapping plans, tagged target events and a cancellable PID-routed sequence queue.
- `desktop/ModeHotKey.swift` — system-registered toggle shortcut with conflict handling.
- `desktop/TextEntryGuard.swift` — text-input checks without reading text content.
- `desktop/HintPlacement.swift` — fixed screen-corner geometry, clamped panel sizes and AX window-coordinate conversion.
- `desktop/CompletionTracker.swift` — recent lookup, target shortcut sequences, expiry and one-time eligibility.
- `src/components/CelebrationLayer.tsx`, `src/screens/Achievements.tsx` — confetti and persistent first-try collection.
- `desktop/tests/main.swift` — checks ordinary copy pass-through, query suppression, repeat/key-up handling, pause/scope and app identity.
- `scripts/desktop.mjs` — builds the existing React UI and the native app without adding npm dependencies.
- `src/bridge/desktop.ts` — typed message bridge between React and macOS; no OS permissions inside components.
- `src/bridge/local.ts` — browser storage and card requests.
- `src/data/figma-to-photoshop.json`, `figma-to-illustrator.json` — real shortcut content; edit copy here.
- `src/components/ShortcutSearch.tsx`, `ShortcutHint.tsx`, `HintLayer.tsx` — manual lookup, fixed-position hints and native disclosure details.
- `src/components/PairForm.tsx` — single relationship editor with native labeled selects.
- `11/` — original Figma exports, preserved as design references.

To inspect the main behavior, start at the decision in `ShortcutPolicy.decide`, then follow `.show` in `desktop/main.swift` into `HintLayer`. Returning `nil` from an **active** event filter is what blocks the source query; target shortcuts and Escape return the original event. A passive listener or a browser key handler cannot do this across apps.

## Content references

Defaults were checked against official documentation; this is documentation review, not full hands-on verification:

- [Figma: scale layers](https://help.figma.com/hc/en-us/articles/360040451453-Scale-layers-while-maintaining-proportions)
- [Figma: copy and duplicate](https://help.figma.com/hc/en-us/articles/4409078832791-Copy-and-paste-objects)
- [Photoshop: scale with Free Transform](https://helpx.adobe.com/photoshop/desktop/create-manage-layers/transform-manipulate-layers/scale-layers-in-photoshop.html)
- [Photoshop: default shortcut reference](https://helpx.adobe.com/content/dam/help/en/photoshop/using/default-keyboard-shortcuts/photoshop-keyboard-shortcuts.pdf)
- [Illustrator: default shortcuts](https://helpx.adobe.com/illustrator/using/default-keyboard-shortcuts.html)
- [Apple: active event-tap callbacks](https://developer.apple.com/documentation/coregraphics/cgeventtapcallback)

See `docs/decision-log.md` and `docs/user-test.md` for the weekly decision log, honest verification status, and the next participant task.
