# Figma → Illustrator coverage

Reviewed 2026-11-19. This is a documented **Figma Design / macOS / US QWERTY** reference baseline, using default Illustrator desktop shortcuts. It is not a promise that every command in every Figma product, release, plugin, custom layout or editing context can be executed in Illustrator.

The runtime catalog contains **159 actions**:

- **55 executable/shared actions**: 28 translated actions and 27 shared chords. Tools are selected; drawing or dragging still follows. Shared chords pass through without generated input.
- **81 manual / Figma-specific actions**: recognized canvas chords show an honest unavailable hint, with the Illustrator alternative in Learning details. Direct remap sends no substitute keys. These are **not automated mappings**.
- **23 contextual reference actions**: preserve native input. Examples include Return, Tab, Escape, page navigation, vector-edit-only controls, and source text-spacing chords with conflicting public documentation.
- **16 held pointer gestures** are classified separately. The app never synthesizes a held modifier or drag from a key tap.

These counts are actions, not a “159 successful mappings” claim. Aliases add source chords without inflating action totals. `npm run test:catalog` checks the counts, collisions, source keys and declared dispositions against the frozen baseline in [illustrator-coverage.json](illustrator-coverage.json). Editing a binding requires reviewing that baseline, not just changing the runtime file.

## Runtime changes

The native policy, target event builder, completion tracker, web lookup and keycaps now support Command, Shift, Option and Control together. Arrow/navigation/function keys and physical punctuation are explicit. A comma key (`Cmd+,`) is distinct from a multi-chord separator (`Cmd+C, Cmd+F`). Alias use is preserved in History snapshots.

Actual Control–Option source chords take precedence over the older learning-query prefix. Reference-only actions never enter the interception set. Protected text input, Secure Input and other applications preserve native keys. Synthetic events remain tagged, PID-scoped, paired down/up and cancellable between sequence steps. No permission or custom keymap is changed.

Learning can show manual alternatives when the source chord is recognized. Direct remap gives a compact “No direct shortcut” notice; it does not run an unrelated command. Achievements include only the 55 executable/shared actions. Failed, manual and reference-only actions cannot be recorded as successful remaps or unlock from arbitrary target keys.

## Corrections that prevent wrong actions

- Current Figma **Show outlines** is `Cmd+Shift+O`; Illustrator uses `Cmd+Y`. The old Figma preference changes the meaning of other outline shortcuts, so `Shift+O` is not silently added as an alias.
- Figma **Outline stroke/text** is `Cmd+Option+O`. Illustrator’s `Cmd+Shift+O` converts **text** only; strokes require Object → Path → Outline Stroke. The app does not guess the selection type.
- Current Figma **Flatten** is `Option+Shift+F`. It is not mapped to Illustrator `Cmd+E` (GPU/CPU preview), or to a single Pathfinder operation that could change meaning.
- Figma **Select inverse** (`Cmd+Shift+A`) does not pass through to Illustrator Deselect All. Use Select → Inverse.
- Figma **Copy properties** is not Illustrator’s Envelope command on the same chord. Appearance transfer uses Eyedropper/Graphic Styles manually.
- Remove Fill/Stroke is manual because Illustrator `/` clears the **active** swatch. The app never guesses which swatch is active.
- Figma masking and Illustrator clipping masks use different ordering and semantics. The clipping-path preparation is explicit; `Cmd+7` is not sent blindly.
- Flip commands are manual. Selecting Illustrator Reflect (`O`) would not actually flip the selection.
- Figma alignment, tidy-up, auto layout, components, opacity digit entry, prototype controls and developer handoff are not relabeled as equivalent automatic Illustrator features.
- Text-object alignment and font-size shortcuts apply only outside protected text entry. Font weight, tracking and leading are manual; source articles disagree about some modifiers/directions.

## Sources and verification

Each runtime card names the primary source IDs that were used; their URLs live in the catalog’s `scope.sources`. Some public Figma articles are incomplete or disagree. The metadata and manual disposition retain that uncertainty instead of guessing an executable chord. The older shortcuts.design list was used only to discover categories and omissions, not as authority for current bindings.

Key current references:

- [Figma keyboard navigation and shortcuts panel](https://help.figma.com/hc/en-us/articles/360040328653-Use-Figma-products-with-a-keyboard): describes the panel as a **selection** of shortcuts, not an exhaustive all-product list.
- [Figma physical keyboard layouts](https://help.figma.com/hc/en-us/articles/5665442977431-Select-keyboard-layout).
- [Figma outline view](https://help.figma.com/hc/en-us/articles/5724448965527-View-layer-outlines-in-Figma-Design), [outline strokes](https://help.figma.com/hc/en-us/articles/33052305733015-Convert-strokes-to-vector-paths), [flatten](https://help.figma.com/hc/en-us/articles/30101373312279-Flatten-layers), [boolean operations](https://help.figma.com/hc/en-us/articles/360039957534-Boolean-operations).
- [Illustrator default shortcuts](https://helpx.adobe.com/illustrator/desktop/get-started/preferences-and-settings/default-keyboard-shortcuts-for-illustrator.html) and [Adobe’s fuller panel/type table](https://helpx.adobe.com/lt/illustrator/using/default-keyboard-shortcuts.html).

All `verified` fields remain **false**. Documentation review, parser/routing/event tests and a compiled application are not hands-on verification of resulting Illustrator edits. The staging build opens correctly but reports missing Accessibility permission, so this round has not verified physical cross-app execution, clipboard effects, text-edit transitions, document modifications or History persistence after real input. Do not change permissions automatically.

For hands-on acceptance, use a new disposable document with default shortcuts. Check K→S, R→M, Shift+P→N, Ctrl+P→Cmd+Option+Y, all four stacking commands, duplicate sequence, font-size/paragraph alignment on selected type, protected text/IME, pause and app switch during a sequence, then History after relaunch. Current app/keymap/selection context must be recorded separately from the public-default reference.
