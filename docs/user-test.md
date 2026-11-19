# Shortcut task-based checks

## Independent participant round — about five minutes

### Moderator setup

Invite someone familiar with Figma who has not used Shortcut. Open a disposable Illustrator document with one editable rectangle and leave Shortcut available with Figma → Illustrator selected and the mode Off. Use the already-authorized installed app. Explain that this is a test of the product. Do not explain the switch, where modes live or which Illustrator target keys to press. Record any help given. Do not use the participant's own artwork.

### Read this task to the participant

“You usually work in Figma and now need to finish a small poster in Illustrator. You remember K for Scale and Command+D for Duplicate. Using Shortcut, resize the rectangle and make one copy. Choose whichever way of working suits you. When you finish, return to Illustrator's original keyboard behavior.”

After the first attempt, ask them to try the other available workflow on the same task. Let them inspect an explanation if they want one. Do not require them to open details or earn an achievement.

After the Direct remap task is finished, ask them to find which Photoshop/Illustrator shortcuts they just used and explain one difference from Figma. Let them discover History themselves. Record whether reviewing helps without having interrupted the earlier work.

### Observe the journey

- Find the mode control and choose a workflow: record whether they understand On/Off and Learning/Direct remap without help.
- Resize and duplicate: record whether the intended object changes and exactly where they hesitate or trigger an unexpected action.
- Keep working: record whether the fixed-side notification obscures content, distracts them or takes focus, and whether they choose to expand details.
- Return to original keys: record whether they find Off and can resume Illustrator normally.

### Two questions

1. Which workflow would you choose while finishing real work, and why?
2. Where did Shortcut interrupt or confuse you, and what information did you need at that moment?

Use actual observations to choose the next change. Passive after-work History was added at the owner's explicit request; extra practice/game features remain deferred. A completed technical check does not answer these participant questions.

## Learning implementation regression round

Use a disposable Illustrator document. Select Figma → Illustrator before the task.

With Shortcut running and Accessibility enabled, turn on Figma Mode. Press K to look up Scale, then use S to scale a selected object. Press Cmd+D, read the fixed right-side hint, then use Cmd+C followed by Cmd+F to duplicate. Continue working without opening details; then look up one action again and choose View details when you want its explanation. Turn the mode off and check that Illustrator's original shortcuts work again. Revisit one lookup under Saved. For the website, search for the same two actions and open their hints.

Additional implementation checks: O → L must select Illustrator's Ellipse tool rather than request a new Line hint. Check ordinary Cmd+C, canvas text/fields, Escape during an unfinished operation, repeated queries, pointer movement, a second display, and full-screen Spaces. Existing first-try achievements remain; expanding rewards stays outside this iteration.

## Direct remap round

For the Direct remap round, use a new scratch document: choose Direct remap in the panel and turn on. Press K and check that the Scale tool is selected without pressing S; press R for Rectangle, O for Ellipse, and L for Line. With a disposable object selected, Cmd+D should create a copy through Copy/Paste in Front. Check that the brief right-side notification captures neither focus nor mouse clicks, then turn Off and confirm Illustrator's original tool keys work. Switch back to Learning and verify K → hint → S. Do not perform this round on irreplaceable artwork. Record actual results, including any command whose behavior differs from expectations.

## History implementation round

- In Direct mode in a scratch Illustrator document, physically press K twice and R once. History should show Scale ×2 and Rectangle ×1 for the local date, in most-recent-action order, with Figma/Illustrator keys and the appropriate explanations when expanded.
- Use Duplicate once with a disposable selected object. Expect one Duplicate use with Cmd+C then Cmd+F; generated substeps must not add Copy entries.
- Revisit History while another app pair is selected. Each record must keep its original app/keys, and expanding review must neither change the current pair/mode nor send an action.
- Quit and reopen the same installed app. History should persist; keyboard mode should still start Off as before.
- Check a supported shared key once; it should be logged as passed-through without an extra notification. Verify Learning lookups, Off/paused input, protected typing and unsupported shortcuts do not add records.
- Clear/Cancel/focus behavior and independence of Saved/achievements were checked with explicitly isolated browser fixtures. Do not clear the owner's actual activity without their approval. The native storage clear/retention paths also have automated checks.

History implementation status: 244 native checks and 10 grouping/timezone checks passed, including JSON persistence, failed/unavailable exclusion, complete-sequence snapshots, the 500-use limit, invalid record recovery and DST dates. Isolated browser UI checks confirmed mixed Photoshop/Illustrator explanations, repeated-action counts, keyboard disclosure, clear cancellation, clear-to-empty, retained Saved/achievements and focus return. These are implementation checks, not the physical native History round or independent participant results.

Actual native follow-up: the owner reported K/K/R, but History stayed empty and Home showed no last remap. The same authorized app was restarted and an Esc → K/short-notification check was requested. The owner then explicitly postponed testing and requested publication first. The physical recording and restart-persistence checks remain unverified; resume them when the owner is ready.

## Owner check — November 16, 2026

The user confirmed direct K → Scale and R → Rectangle in Illustrator without a second target shortcut, the brief notification, and both Learning/Direct remap panel choices: “直接切换、小通知和两个模式选项都正常”. Asked to check direct O/L, duplicate existence after dragging aside, native R when Off, and Learning K → hint → S in the same build, the user replied “ok了”. All four requested checks are recorded as owner-reported passes. This owner check is separate from the independent participant session below.

### Follow-up checks in the installed build

- Direct O → Ellipse, then L → Line: owner-reported pass.
- Direct Cmd+D on a disposable selected rectangle, with two objects after dragging one aside: owner-reported pass.
- Off, then native R → Rotate: owner-reported pass.
- Learning On, K → hint, then S → Scale: owner-reported pass in the same build.
- Text safety with mouse-selected Type, both workflows: the user confirmed krol types without hints/tool changes, and Esc then K restores the selected workflow: “两种模式输入和退出后恢复都正常”. Owner-reported pass. Numeric fields, keyboard-selected Type, re-editing existing text and Cmd+Return remain unverified.
- Pause/Resume controls: the installed native Home changed to Listening is paused with Resume listening, then returned to Direct remap is on with Pause listening. UI-state check passed. The owner also confirmed paused R selects native Rotate and Resume restores listening.
- (Before Nov 19 the switch was Control–Shift–Space; it is now triple-tap Command, not yet hand-tested.) Physical Control–Shift–Space Off/On, paused native R, and normal krol typing without hints in another app with mode On: owner-reported pass, “三项都正常”.
- Native view-command checks: the selected Illustrator default keymap export names Show Rulers as Cmd+R, Change to Artboard Rulers as Opt+Cmd+R, and Fit Artboard in Window as Cmd+0. App-directed Cmd+R changed the View menu from Show Rulers to Hide Rulers, then was toggled back; Cmd+0 changed the scratch document zoom from 30.41% to 44.61%. This verifies target commands, not global Shift+R/Shift+1 remapping or multiple-artboard scope.
- Cancellation during an operation and notification click-through: pending actual input checks.

A new blank Illustrator document was opened for these follow-up checks; no existing artwork was edited. The automation's O press selected Illustrator's native Reflect tool rather than testing the global filter. That observation is a limitation of this input route, not evidence that physical O remapping failed. The four physical-key results above were subsequently confirmed by the owner; independent participant feedback is still pending.

## Record after a real participant session

- Participant/date: not yet recorded.
- Task completion and points of hesitation: not yet recorded.
- Accidental Illustrator actions, obscured work or unexpected focus changes: not yet recorded.
- Participant’s words: not yet recorded.
- Fix to prioritize from this evidence: not yet recorded.

An agent’s implementation checks are not an independent participant test.
