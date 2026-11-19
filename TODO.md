# Remaining work

The user’s November 12 priority is real desktop functionality. The previous “desktop later / phone first” plan is superseded.

## First

- November 19, K stopped converting after a while (Illustrator received K, i.e. Live Paint Bucket). Likely cause: after pressing T, *any* click (toolbar, panel) armed canvas-typing protection, and only a recognized tool-button label or Esc cleared it. Now protection is armed only by a click that isn't on a UI control (i.e. the canvas). Tool buttons are matched by description/title/tooltip, including radio-button roles. The menu bar shows "On · Text" while protection holds shortcuts back. Owner confirmed K works in this build (Learning mode, no Type-tool use in the logged session). The diagnostic log shows Illustrator 2026 exposes *no* accessibility info for clicks (every hit-test is AXUnknown or error -25204), so tool buttons can never be recognized. Remaining gap: press T, type on the canvas, then switch tools *by mouse* → protection stays on ("On · Text") until Esc or a tool key such as V. If it recurs, read `~/Library/Logs/Shortcut Preview/diagnostics.log` (state changes and click classification only; no keys or text).

- November 19: the Figma Mode switch is now triple-tap Command (⌘⌘⌘). ⌃⇧Space and the other two combos remain selectable in the menu and Settings. Unit checks pass; the owner confirmed it works after re-adding Accessibility (Nov 19). It needs Accessibility (unlike the old Carbon hot key), and Command used with any other key never counts as a tap.

- November 19 fix, not yet hand-tested: after canvas typing, clicking a toolbar drawing/selection tool now ends text-input protection, so mapping resumes without pressing Esc. A click whose tool can't be identified still keeps protection. Native unit checks pass, and `Shortcut Preview.app` (staging) is rebuilt. Hand test in real Illustrator: Type tool → type text → click Selection tool → K should map to S. Repeat with Type chosen by mouse and by T.

- The user now explicitly requests passive Direct remap History for review after finishing work, superseding its deferral. The native log and History view are implemented, automatically checked and installed. The first physical K/K/R check left History empty with no last-remap entry; input/listener delivery versus persistence is unresolved. The same authorized binary was restarted with Direct remap On. The user asked to postpone further testing and publish the current version first. Resume Esc → K/notification diagnosis and real-record restart persistence only when they are ready. No test fixtures were added to the installed app.

- Direct remap is installed alongside Learning. The user confirmed real Illustrator K → Scale, R → Rectangle, O → Ellipse, L → Line, and Cmd+D creates a duplicate; the brief notification and both panel choices work. The follow-up also confirmed native R → Rotate when Off and Learning K → hint → S in this build. In both workflows, mouse-selected Type allows krol without hints/tool changes, and Esc then K restores the workflow. Physical Control–Shift–Space toggling, native R while paused, and other-app typing with mode On also passed. Numeric fields, additional text-entry routes, cancellation during an operation and notification click-through remain unverified. Other mappings remain unverified by hands-on input.

- User confirmed the real Illustrator K → fixed right-side hint → inline details → S flow in the preceding Learning build, plus K → hint → S after switching back from Direct remap in the subsequent build. Use `docs/user-test.md` for the remaining checks and an independent participant comparison, including after-work History review. These prior confirmations are not a full regression of the new History binary.

- November 16 [official-source shortcut research](docs/shortcut-reference.md) covers 26 current mappings. Scale/Duplicate/Copy wording is corrected. This Mac's Illustrator default-keymap export confirms Cmd+R = Show Rulers, Option+Cmd+R = Change to Artboard Rulers, and Cmd+0 = Fit Artboard in Window; direct native Cmd+R changed the menu from Show to Hide Rulers. Global source-key remapping for these view commands and multiple-artboard scope still need hands-on checks.

- User confirmed the native menu-bar panel, On/Off switch, Control–Shift–Space toggle and direct K hint work. Pause/Resume UI state and physical paused R → Rotate passed; listening was restored. Continue numeric-field, additional canvas text-entry, unknown-context and off-state edge-case checks for both workflows.

- Confirmed in real Photoshop before the right-side hint update: Control–Option–K popup → Cmd+T → Congratulations/confetti → native achievement saved; preserved after relaunch. Also checked with an existing layer selected: query → ordinary Cmd+T enters Free Transform, and copy query → ordinary Cmd+C enables Paste. Continue broader checks of the new hint, dismissal/details, pause, target-only mode and other mapped actions.
- The finished build was reopened and its Ready status and earned achievement were preserved. When editing native code again, remember that a running older build does not include source edits and new ad-hoc signatures may need Accessibility re-registration.
- Have at least one independent person do the task in `docs/user-test.md`. Record their actual observations; do not invent notes.
- Public source and website are verified: https://github.com/Kiara-Li/shortcut and https://kiara-li.github.io/shortcut/. Keep checking the latest Actions result after future pushes.

## Next

- Check every card in both real apps; keep `verified: false` until checked.
- Test custom keymaps, non-US layouts, multiple monitors, full-screen Spaces, permission revocation, and Secure Input on the user’s machine.
- For distribution beyond this Mac, use stable developer signing and notarization. Local builds currently use ad-hoc signing.
- Test six-second hint timing, fixed placement and optional detail expansion with users and accessibility tools.

## Later, only if needed

- Additional app pairs.
- Optional practice mode.
- Windows implementation.

No phone UI, fake application workspace, fake keyboard, or multi-step onboarding is planned.
