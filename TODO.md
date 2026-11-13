# Remaining work

The user’s November 12 priority is real desktop functionality. The previous “desktop later / phone first” plan is superseded.

## First

- Confirmed in real Photoshop: Control–Option–K popup → Cmd+T → Congratulations/confetti → native achievement saved; preserved after relaunch. Also checked with an existing layer selected: query → ordinary Cmd+T enters Free Transform, and copy query → ordinary Cmd+C enables Paste. Continue broader checks for query side effects, dismiss/flip, pause, target-only mode and other mapped actions.
- The finished build was reopened and its Ready status and earned achievement were preserved. When editing native code again, remember that a running older build does not include source edits and new ad-hoc signatures may need Accessibility re-registration.
- Have at least one independent person do the task in `docs/user-test.md`. Record their actual observations; do not invent notes.
- Public source and website are verified: https://github.com/Kiara-Li/shortcut and https://kiara-li.github.io/shortcut/. Keep checking the latest Actions result after future pushes.

## Next

- Check every card in both real apps; keep `verified: false` until checked.
- Test custom keymaps, non-US layouts, multiple monitors, full-screen Spaces, permission revocation, and Secure Input on the user’s machine.
- For distribution beyond this Mac, use stable developer signing and notarization. Local builds currently use ad-hoc signing.
- Test six-second card timing with users and accessibility tools.

## Later, only if needed

- Additional app pairs.
- Optional practice mode.
- Windows implementation.

No phone UI, fake application workspace, fake keyboard, or multi-step onboarding is planned.
