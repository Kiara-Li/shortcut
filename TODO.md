# Remaining work

The user’s November 12 priority is real desktop functionality. The previous “desktop later / phone first” plan is superseded.

## First

- Direct remap is installed alongside Learning. The user confirmed real Illustrator K → Scale and R → Rectangle execute directly, the brief notification works, and the panel offers both workflows. Next verify O → Ellipse, Cmd+D → Copy/Paste in Front, original keys when Off, and Learning regression in this build. Automatic event construction checks alone are not hands-on verification of the remaining mappings.

- User confirmed the real Illustrator K → fixed right-side hint → inline details → S flow works in the preceding Learning build. Next, compare Learning and Direct remap in `docs/user-test.md`. History remains deferred; the user's new request supersedes the earlier remapping deferral.

- November 16 [official-source shortcut research](docs/shortcut-reference.md) covers 26 current mappings. Scale/Duplicate/Copy wording is corrected in the right-side hint iteration; Rulers/Zoom ambiguities still need real-app verification.

- User confirmed the native menu-bar panel, On/Off switch and direct K hint work in Learning. Continue checks of Control–Shift–Space, text fields/canvas text, unknown-context protection and off-state edge cases for both workflows.

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
