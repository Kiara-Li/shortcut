# Shortcut

Look up a shortcut from Figma while working in Photoshop or Illustrator. The default pair is **Figma → Photoshop**. The macOS app intercepts an explicit query combination and shows a real floating card above the current application. The website provides manual shortcut search and saved cards.

## Run the macOS app

Requires macOS 13+, Node.js 24, and Xcode Command Line Tools (`xcode-select --install` if Swift is missing).

```sh
npm ci
npm run desktop
```

This builds and opens `desktop/build/Shortcut.app`. You can also open that app in Finder. No Electron, backend, account, or paid Apple developer membership is needed for this local build.

In the app, choose **Open Accessibility settings**, then personally enable **Shortcut** under **System Settings → Privacy & Security → Accessibility**. A real status readout changes to “Ready” only when macOS allows the event filter to run. If the system switch is on but the app still says permission is missing after a rebuild, remove the old Shortcut entry with “−” and add this exact `desktop/build/Shortcut.app` again with “+”. Toggling a stale entry may not update its code-signing requirement. If needed, quit and reopen the app after granting access.

The app opens directly to Home with Figma → Photoshop selected. There is no tutorial or multi-step onboarding. Settings contains a single relationship editor: **I know Figma → I’m working in Photoshop / Illustrator**.

### Use it in real Photoshop

1. Switch to Photoshop.
2. Hold **Control + Option** and press the shortcut you remember from Figma.
3. Read the floating card, then use the Photoshop shortcut yourself.

Examples:

- **⌃⌥K** → Scale → **⌘T**, Free Transform in Photoshop.
- **⌃⌥⌘D** → Duplicate → **⌘J**, Layer via Copy in Photoshop.
- **⌃⌥⌘C** → Copy → **⌘C**. Ordinary **⌘C** continues to copy normally.

The query key-down, held repeats, and matching key-up are swallowed before the target application receives them. Plain shortcuts without the Control–Option prefix pass through. Unknown supported query keys show an honest “Not in your deck yet” card; unsupported keys pass through. Queries explain an action; they do not execute or remap it.

By default, interception happens **only in the selected target app**, identified by its bundle ID. **Listen in any app for testing** deliberately uses the selected deck in other apps and resets off at launch. Pause stops new queries. Closing the window leaves the app running in the **SC** menu bar; use **Quit Shortcut** to stop it.

The card uses a real, non-activating macOS panel. It appears beside the pointer, stays within the current screen, and supports full-screen Spaces. Click to flip; **⌃⌥Space** also flips without taking focus. **Esc** closes it. It hides after six seconds, paused while hovered or flipped. Saved cards persist locally.

### First-try achievements

After looking up a card, press its target shortcut in the matching real app within two minutes. The first matching key-down (or complete sequence) unlocks that card once, shows a brief **Congratulations!** toast and desktop confetti, and saves it under **Achievements**. The target event still reaches the app unchanged. New lookups replace the pending card; pause and changing the pair clear it. No-match and already-unlocked cards do not arm an achievement.

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

The website has a real core task: enter a Figma shortcut or action (for example `K`, `⌘D`, or `Scale`), open the corresponding target card, flip it, and revisit it under Saved. Pair selection lives in Settings. Browser data is stored in localStorage; native data is stored in macOS UserDefaults. They are separate.

**Capability disclosure:** a static website cannot intercept keyboard input in another application. Global interception belongs to the macOS app. There is no simulated Photoshop/Illustrator workspace, fake on-screen keyboard, simulated permission success, or automatic command execution.

## Commands

- `npm run lint` — ESLint.
- `npm run build` — TypeScript checks and static website build in `dist/`.
- `npm run test:desktop` — native interception and achievement policy tests, without requiring permissions.
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
- `desktop/CompletionTracker.swift` — recent lookup, target shortcut sequences, expiry and one-time eligibility.
- `src/components/CelebrationLayer.tsx`, `src/screens/Achievements.tsx` — confetti and persistent first-try collection.
- `desktop/tests/main.swift` — checks ordinary copy pass-through, query suppression, repeat/key-up handling, pause/scope and app identity.
- `scripts/desktop.mjs` — builds the existing React UI and the native app without adding npm dependencies.
- `src/bridge/desktop.ts` — typed message bridge between React and macOS; no OS permissions inside components.
- `src/bridge/local.ts` — browser storage and card requests.
- `src/data/figma-to-photoshop.json`, `figma-to-illustrator.json` — real shortcut content; edit copy here.
- `src/components/ShortcutSearch.tsx`, `Flashcard.tsx`, `CardLayer.tsx` — manual lookup and reusable cards.
- `src/components/PairForm.tsx` — single relationship editor with native labeled selects.
- `11/` — original Figma exports, preserved as design references.

To inspect the main behavior, start at the decision in `ShortcutPolicy.decide`, then follow `.show` in `desktop/main.swift` into `CardLayer`. Returning `nil` from an **active** event filter is what blocks the original shortcut; a passive listener or a browser key handler cannot do this across apps.

## Content references

Defaults were checked against official documentation; this is documentation review, not full hands-on verification:

- [Figma: scale layers](https://help.figma.com/hc/en-us/articles/360040451453-Scale-layers-while-maintaining-proportions)
- [Figma: copy and duplicate](https://help.figma.com/hc/en-us/articles/4409078832791-Copy-and-paste-objects)
- [Photoshop: scale with Free Transform](https://helpx.adobe.com/photoshop/desktop/create-manage-layers/transform-manipulate-layers/scale-layers-in-photoshop.html)
- [Photoshop: default shortcut reference](https://helpx.adobe.com/content/dam/help/en/photoshop/using/default-keyboard-shortcuts/photoshop-keyboard-shortcuts.pdf)
- [Illustrator: default shortcuts](https://helpx.adobe.com/illustrator/using/default-keyboard-shortcuts.html)
- [Apple: active event-tap callbacks](https://developer.apple.com/documentation/coregraphics/cgeventtapcallback)

See `docs/decision-log.md` and `docs/user-test.md` for the weekly decision log, honest verification status, and the next participant task.
