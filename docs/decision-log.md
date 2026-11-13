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
