# Weekly decision log — November 12, 2026

## Evidence and direction

The user reviewed the previous browser preview and found that a simulated keyboard over a simulated Illustrator workspace missed the project’s main purpose. Their priority is a card that actually appears over a real application, with desktop functionality taking precedence over appearance. They then requested Figma → Photoshop support, granted the app Accessibility permission, and supplied a simplified single-page relationship-setting reference.

## Decisions and changes

- Added a local macOS app with an active event filter and a non-activating floating card window.
- Used Control + Option as an explicit lookup prefix. Normal shortcuts pass through; prefixed query events are consumed before the target app receives them. Cards teach the target shortcut rather than executing it.
- Added Figma → Photoshop as the default, while retaining Figma → Illustrator.
- Removed the fake workspace and keyboard. Added manual text search as a real browser core task.
- Replaced the introductory setup gate with direct access to the default pair. Kept one relationship editor in Settings, based on the user’s dark-panel reference, with clear source/target labels and one save action.
- Displayed actual permission, listening, Secure Input and foreground-app status. Target-only listening is the default; any-app testing is explicit.
- Preserved the static Pages workflow and repository base-path handling. Native build assets use a separate relative base.

## Verification and remaining blockers

- Native policy tests passed 43 checks, including normal Cmd+C pass-through, query matching, repeat/release suppression, target identity, disabled behavior, first target attempts, expiry, wrong shortcuts, repeats, new lookups and multi-step completion.
- The native app was compiled and opened; its actual interface changed from permission-needed to ready after the user granted Accessibility. Rebuilding for achievements invalidated the ad-hoc-signature authorization. Toggling the stale entry and restarting did not restore it; the user removed the old entry and explicitly asked the agent to add the current app. Re-adding the exact current bundle restored the actual Ready status.
- The user physically pressed Control–Option–K in real Photoshop and confirmed that the Scale → Free Transform card appeared. The app also displayed the actual last query as coming from Adobe Photoshop 2026. This confirms the native popup path. In the final achievement build, after restoring the updated app authorization, the user again queried Scale in real Photoshop and pressed Cmd+T, then confirmed that Congratulations and confetti appeared. The native Achievements screen showed Scale → Free Transform, Photoshop, First shortcut try, Cmd+T, and 1/9. Quitting and reopening the unchanged app preserved that record and the Ready state. Other cards and platform edge cases still require their own checks.
- Browser search → card → explanation → Saved → refresh was verified through the actual UI. The explicit self-report → Congratulations → Achievements → refresh flow was also verified. This is not native keystroke detection.
- Added first-try achievements at the user’s request: matching target shortcut within two minutes, once per card, persistent records, non-interactive desktop confetti and Reduced Motion support. Completion is labeled as a shortcut try rather than a proven document edit.
- No independent participant test has been completed in this session. November 5 test notes were not supplied, so no findings or fixes are attributed to that test.
- At the user’s explicit request, created the public repository https://github.com/Kiara-Li/shortcut and pushed the project to main (initial commit fbc7f82). Verified the public repository page and matching local/remote commit. The first Pages job failed because Pages was disabled; configured the repository’s Pages source as GitHub Actions. The next deployment succeeded: https://github.com/Kiara-Li/shortcut/actions/runs/43335306033. Verified the public site at https://kiara-li.github.io/shortcut/ through the actual browser: Scale search → corresponding Photoshop card → explanation → Saved → refresh all worked.
- Card mappings remain marked unverified until checked in both actual applications. Photoshop defaults were consulted in Adobe documentation.

## Next priorities

1. Expand real Photoshop checks beyond the confirmed Scale lookup → Cmd+T → celebration → persistent achievement flow: ordinary copy, pause, focus while interacting with cards, other mapped actions and target-only filtering.
2. Run the short independent test in `user-test.md` and prioritize its observed problems.
3. Connect the intended repository, deploy the website, and verify its public core task.

## Follow-up: Photoshop commands after a card

The user suspected ordinary Photoshop operations might be blocked and requested checking without replacing the authorized application. Source inspection confirmed ordinary target shortcuts are passed through unchanged, including when achievement observation succeeds. In the actual document, Copy and Free Transform were initially disabled with no selected layer. Selecting an existing layer restored the commands. With the unchanged Shortcut app running, Cmd+T entered Free Transform; after Control–Option–K followed by Cmd+T, Photoshop again displayed transform position/size/rotation controls. The test transform was canceled. Control–Option–Command–C followed by ordinary Command–C made Photoshop’s Paste command available, confirming the copy path. The user then reported the issue appeared resolved. No application binary, signature or Accessibility authorization was changed for this follow-up.

## November 16: simplify the mode switch

The user corrected the PS/AI versus FG metaphor: this should be a single Figma Mode that is on or off, with the off state meaning original shortcuts. Their reference was the convenience of a system toggle. They explicitly deferred direct remapping and asked to keep hints first.

Changes: native menu-bar popover with NSSwitch, On/Off status text, a matching accessible checkbox switch on Home, and a configurable system-registered toggle shortcut (default Control–Shift–Space). While on, known differing source shortcuts show hints without a prefix; shared shortcuts and recently hinted target sequences pass through. While off, all lookups stop, including the legacy prefix. Input protection, context suspension and a missed-release recovery are part of the keyboard policy. No automatic action execution was added.

Verification: lint, TypeScript/Vite build, ad-hoc bundle signature verification and 78 native checks passed. The intermediate language selector and alternative hotkey registration were verified in the actual app, then replaced by the requested single-switch UI. The user confirmed the final popover, switch and direct K hint work in the actual app: “小面板、开关和 K 提示都正常”. Broader text/canvas workflows, physical toggle-key testing and off-state edge cases remain to be checked; compilation is not treated as proof of those checks. Existing signed builds were backed up before replacement. Recompiled native builds need their Accessibility authorization refreshed on this Mac.

## November 16: fixed right-side hints and optional explanation

Feedback: the user wants a mode that fits into ongoing work, a notification at the same side position every time, and optional detail expansion instead of a flashcard flip. They explicitly chose hint-first behavior: the user presses the target shortcut themselves. History, automatic remapping and additional game features remain outside this iteration.

Research: reviewed all 26 current mappings against official Figma/Adobe material; see `shortcut-reference.md`. Corrected Illustrator scaling/stroke settings, duplicate transformation/clipboard wording, the Frame analogy and Photoshop copy context. Kept uncertain Rulers/Zoom shortcuts flagged for real-app verification.

Implementation: replaced Flashcard/CardLayer with ShortcutHint/HintLayer. One notification stays at the top right; new queries replace it. Native details/summary expands in place, also available through Control–Option–Space in the target app. The non-activating panel resizes downwards from a fixed anchor, uses the foreground window's screen where its geometry is accessible, and clamps to visible bounds. Expanded/hovered hints stay available; untouched hints retain the existing six-second timer. Existing Saved and achievements are preserved. Escape dismisses without consuming the target application's cancellation key.

Verification: lint, TypeScript/Vite build, native bundle signature and 88 native policy/geometry checks passed. Actual browser checks covered 360px hint width and unchanged x/y on expansion, keyboard expansion, replacement without stacking, close/focus return, Escape, auto-hide, sequential shortcuts and no-direct-equivalent content. The installed native app retained the Illustrator pair, and Accessibility was refreshed through System Settings after the user's own authentication. The actual app reports Figma Mode on with the event listener available. The user confirmed the real Illustrator K → right-side hint → inline details → S flow: “右侧提示、展开详情和 S 都正常”. This verifies that core flow on their Mac; it is not an independent participant test. Multi-display/full-screen and broader typing tests remain outstanding.

## November 16: add Direct remap alongside Learning

The user explicitly requested automatic remapping now, with equal importance to Learning, selectable in the panel and with a quiet Steam-like notification at the top right. This supersedes the earlier deferral. The single On/Off switch remains; two equal workflow choices are added to the native popover, right-click menu and Home. The workflow preference persists, while relaunch/pair changes still start Off.

Direct remap translates every executable mapping currently in the catalogs (Illustrator 15/16, Photoshop 9/10, including shared keys). Auto layout remains unavailable. Source queries are suppressed, target chords use exact modifiers and paired releases, generated events carry a recursion-exclusion tag and are routed to the captured app PID. A bounded queue preserves sequence order, rechecks context before each step, and cancels on app/mode changes, pause, Escape or permission loss. Generated tool changes also update the canvas typing guard. Shared keys pass through unchanged; the any-app learning test scope and legacy prefixed queries cannot expand direct remapping outside the target app.

Direct feedback is a non-interactive dark notification in the existing right-side position, replaced rather than stacked, with a two-second timer and Reduced Motion support. It captures neither focus nor clicks. It reports shortcut submission rather than confirmed document editing. Generated actions do not arm or unlock Learning achievements; manual Learning and its details remain available as a separate workflow. History expansion is still deferred.

Validation: lint, TypeScript/Vite build and 226 native checks pass. These include event construction for all executable catalog mappings, target modifiers/releases/PIDs, sequence order, context interruption, cancellation, queue bounds and isolation of prefixed queries. Event tests use a recorder and deterministic scheduler, not actual OS input. Quartz event construction requires WindowServer access; a restricted-shell attempt could not create an event, and the full test run passed outside that shell sandbox. The signed staging app is built at `desktop/build/staging/Shortcut.app`.

Installation follow-up: after the user unlocked the Mac, the previous Learning app was archived, the final staged app was installed at the existing path, and its signature was verified. The same app's Accessibility entry was refreshed through System Settings; the app now reports the listener available. The actual Home UI shows both Learning and Direct remap, selection of Direct remap was verified, and the switch is On. This pass did not require another authentication dialog. The native panel was opened from Home.

Hands-on confirmation: asked to press K and R in real Illustrator without pressing S/M, check the short notification and both panel choices, the user replied “直接切换、小通知和两个模式选项都正常”. This confirms direct Scale/Rectangle tool selection, brief notification and workflow selection on this Mac. It does not verify every mapping, a document edit or an independent participant test. Ellipse/Line, duplicate sequence, Off and Learning regression in this build still need hands-on checks. The installed binary was left unchanged after this confirmation to preserve its working authorization.
