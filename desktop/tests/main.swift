import CoreGraphics
import Foundation

var checks = 0
func expect(_ condition: Bool, _ message: String) {
    checks += 1
    if !condition { fputs("FAIL: \(message)\n", stderr); exit(1) }
}
func isPass(_ decision: ShortcutDecision) -> Bool { if case .pass = decision { return true }; return false }
func isSwallow(_ decision: ShortcutDecision) -> Bool { if case .swallow = decision { return true }; return false }
var policy = ShortcutPolicy()
let query: CGEventFlags = [.maskControl, .maskAlternate, .maskCommand]
func press(_ code: Int64, _ flags: CGEventFlags, down: Bool = true, repeatKey: Bool = false,
           enabled: Bool = true, eligible: Bool = true, visible: Bool = false) -> ShortcutDecision {
    policy.decide(keyCode: code, flags: flags, keyDown: down, repeated: repeatKey,
                  enabled: enabled, eligible: eligible, cardVisible: visible)
}
expect(isPass(press(8, [.maskCommand])), "Ordinary Cmd+C must reach the active app")
expect(isPass(press(40, [])), "Ordinary K must reach the active app")
expect(isPass(press(8, [.maskControl, .maskCommand])), "Missing Option must pass through")
expect(isPass(press(8, query, eligible: false)), "Queries outside Illustrator must pass through")
expect(isPass(press(8, query, enabled: false)), "Paused, no pair, or secure input must pass through")
if case .show(let combo) = press(8, query) {
    expect(combo.cmd && !combo.shift && combo.key == "C", "Copy must preserve Cmd but strip the query prefix")
} else { expect(false, "Query Cmd+C must show a card and be intercepted") }
expect(isSwallow(press(8, query, repeatKey: true)), "Held query key must not leak repeats")
expect(isSwallow(press(8, [], down: false, enabled: false, eligible: false)), "Keyup must be swallowed even after modifiers/pause/app change")
expect(isPass(press(8, [.maskCommand])), "A subsequent ordinary Cmd+C must still work")
if case .show(let combo) = press(40, [.maskControl, .maskAlternate]) {
    expect(combo.key == "K" && !combo.cmd, "Single-key source shortcuts must work")
} else { expect(false, "K query must show a card") }
_ = press(40, [], down: false)
if case .show(let combo) = press(4, query.union(.maskShift)) {
    expect(combo.cmd && combo.shift && combo.key == "H", "Cmd+Shift shortcut must preserve modifiers")
} else { expect(false, "Cmd+Shift query must show a card") }
_ = press(4, [], down: false)
expect(isPass(press(53, [])), "Escape must pass through when no card is visible")
if case .dismiss = press(53, [], visible: true) { checks += 1 } else { expect(false, "Escape must close a visible card") }
_ = press(53, [], down: false)
if case .flip = press(49, [.maskControl, .maskAlternate], visible: true) { checks += 1 } else { expect(false, "Query Space must flip a visible card") }
_ = press(49, [], down: false)
expect(isPass(press(122, query)), "Unsupported function keys must not be swallowed")
expect(ShortcutPolicy.isTarget("com.adobe.illustrator", target: "illustrator"), "Illustrator bundle ID must match")
expect(ShortcutPolicy.isTarget("com.adobe.illustrator.2026", target: "illustrator"), "Versioned Illustrator bundle must match")
expect(!ShortcutPolicy.isTarget("com.adobe.illustrator-fake", target: "illustrator"), "Unrelated bundle must not match")
expect(ShortcutPolicy.isTarget("com.adobe.Photoshop", target: "photoshop"), "Photoshop bundle ID must match case-insensitively")
expect(!ShortcutPolicy.isTarget("com.adobe.illustrator", target: "photoshop"), "Photoshop mode must not intercept Illustrator")
expect(!ShortcutPolicy.isTarget("com.adobe.Photoshop", target: "illustrator"), "Illustrator mode must not intercept Photoshop")
expect(!ShortcutPolicy.isTarget("com.adobe.Photoshop", target: "unknown"), "Unsupported target must never intercept")
var tracker = CompletionTracker()
let scale = LearningCard(id: "ps-scale", action: "Scale", from: "figma", to: "photoshop", fromKeys: "K", toKeys: "Cmd+T")
let copy = LearningCard(id: "ps-copy", action: "Copy", from: "figma", to: "photoshop", fromKeys: "Cmd+C", toKeys: "Cmd+C")
func observe(_ key: Int64, _ flags: CGEventFlags = [.maskCommand], time: Double = 2,
             eligible: Bool = true, down: Bool = true, repeated: Bool = false) -> LearningCard? {
    tracker.observe(keyCode: key, flags: flags, keyDown: down, repeated: repeated, eligible: eligible, now: time)
}
expect(observe(17) == nil, "An ordinary shortcut before a lookup must not unlock anything")
tracker.arm(scale, alreadyUnlocked: false, now: 1)
expect(observe(40) == nil, "Wrong target shortcut must not unlock")
expect(observe(17, query) == nil, "A prefixed query must not count as a target action")
expect(observe(17, eligible: false) == nil, "Target shortcut in another app must not unlock")
expect(observe(17, down: false) == nil, "Key-up must not unlock")
expect(observe(17, repeated: true) == nil, "A held key repeat must not unlock")
expect(observe(17) == scale, "First target shortcut after lookup must unlock the matching card")
expect(observe(17) == nil, "Subsequent target presses must not unlock again")
tracker.arm(scale, alreadyUnlocked: true, now: 1)
expect(observe(17) == nil, "Previously unlocked cards must never re-arm")
tracker.arm(scale, alreadyUnlocked: false, now: 1)
expect(observe(17, time: 122) == nil, "An unrelated later shortcut after two minutes must not unlock")
tracker.arm(scale, alreadyUnlocked: false, now: 1)
tracker.arm(copy, alreadyUnlocked: false, now: 1)
expect(observe(17) == nil, "A new lookup must replace the previous candidate")
expect(observe(8) == copy, "Latest queried card must unlock")
tracker.arm(scale, alreadyUnlocked: false, now: 1)
tracker.clear()
expect(observe(17) == nil, "Pause/reset/pair change must clear tracking")
let sequence = LearningCard(id: "ai-duplicate", action: "Duplicate", from: "figma", to: "illustrator", fromKeys: "Cmd+D", toKeys: "Cmd+C, Cmd+F")
tracker.arm(sequence, alreadyUnlocked: false, now: 1)
expect(observe(8) == nil, "First step of a sequence alone must not unlock")
expect(observe(3) == sequence, "A complete target sequence must unlock")
tracker.arm(sequence, alreadyUnlocked: false, now: 1)
_ = observe(8)
_ = observe(17)
expect(observe(3) == nil, "An interrupted sequence must not unlock")
_ = observe(8)
expect(observe(3) == sequence, "A retried full sequence must unlock")
let noMatch = LearningCard(id: "none", action: "Auto layout", from: "figma", to: "photoshop", fromKeys: "Shift+A", toKeys: nil)
tracker.arm(noMatch, alreadyUnlocked: false, now: 1)
expect(observe(0, [.maskShift]) == nil, "No-match cards cannot unlock from arbitrary keys")
tracker.arm(nil, alreadyUnlocked: false, now: 1)
expect(observe(17) == nil, "Unknown cards must clear the candidate")
let shifted = LearningCard(id: "shifted", action: "Artboard", from: "figma", to: "illustrator", fromKeys: "F", toKeys: "Shift+O")
tracker.arm(shifted, alreadyUnlocked: false, now: 1)
expect(observe(31, []) == nil, "Missing Shift must not complete a shifted shortcut")
expect(observe(31, [.maskShift]) == shifted, "Shifted target shortcuts must complete")
let sourceKeys: Set<ShortcutStep> = ["K", "Cmd+D", "Cmd+C", "T", "L", "Shift+A"].compactMap(ShortcutStep.parse).reduce(into: []) { $0.insert($1) }
let sameKeys: Set<ShortcutStep> = ["Cmd+C", "T"].compactMap(ShortcutStep.parse).reduce(into: []) { $0.insert($1) }
func modePress(_ key: Int64, _ flags: CGEventFlags = [], on: Bool = true, text: Bool = false,
               eligible: Bool = true, expected: ShortcutStep? = nil, repeated: Bool = false,
               down: Bool = true, visible: Bool = false) -> ShortcutDecision {
    policy.decide(keyCode: key, flags: flags, keyDown: down, repeated: repeated,
        enabled: on, eligible: eligible, cardVisible: visible, figmaMode: on, textEntry: text,
        sourceKeys: sourceKeys, sameKeys: sameKeys, expectedTarget: expected)
}
policy.reset()
expect(isPass(modePress(40, on: false)), "Native mode must keep Photoshop K intact")
expect(isPass(modePress(40, query, on: false)), "Off must stop prefixed lookups too, restoring all original shortcuts")
expect(isPass(modePress(2, [.maskCommand], on: false)), "Native mode must keep Photoshop Deselect intact")
if case .show(let combo) = modePress(40) { expect(combo.key == "K" && !combo.cmd, "FG K needs no prefix") }
else { expect(false, "FG must capture the supported Figma K") }
expect(isSwallow(modePress(40, repeated: true)), "Holding a mode query must not leak repeats")
_ = modePress(40, down: false)
expect(isPass(modePress(17, [.maskCommand])), "Target Cmd+T must still reach Photoshop in FG")
if case .show(let combo) = modePress(2, [.maskCommand]) { expect(combo.cmd && combo.key == "D", "FG must interpret Figma Duplicate") }
else { expect(false, "FG Cmd+D should show its target mapping") }
_ = modePress(2, down: false)
expect(isPass(modePress(8, [.maskCommand])), "Shared Copy must execute directly without a blocking card")
expect(isPass(modePress(17)), "Shared Type tool must reach Photoshop")
expect(isPass(modePress(12, [.maskCommand])), "Unknown commands such as Quit must pass through")
expect(isPass(modePress(38)), "Unknown ordinary letters must pass through")
expect(isPass(modePress(40, [.maskAlternate])), "Option shortcuts must not be reinterpreted")
expect(isPass(modePress(40, [.maskSecondaryFn])), "Fn combinations must not be reinterpreted")
expect(isPass(modePress(40, eligible: false)), "FG must not affect other applications")
expect(isPass(modePress(40, text: true)), "A K in a text input must type K")
expect(isPass(modePress(2, [.maskCommand], text: true)), "Text editing commands must pass through")
expect(isPass(modePress(40, query, text: true)), "Even prefixed lookups must not break protected input")
expect(isPass(modePress(53, text: true, visible: true)), "IME/text Escape must reach the editor")
if case .show = modePress(37) { checks += 1 } else { expect(false, "FG L normally follows the source mapping") }
_ = modePress(37, down: false)
expect(isPass(modePress(37, expected: ShortcutStep.parse("L"))), "A hinted target must win a source/target collision")
// Missed-release recovery protects a later, ordinary use of the same key.
_ = modePress(40)
expect(isPass(modePress(40, on: false)), "A fresh native press must recover from a missed query key-up")
expect(isPass(modePress(40, on: false, down: false)), "Recovered native key-up must pass through")
tracker.arm(sequence, alreadyUnlocked: false, now: 1)
expect(tracker.expectedStep(now: 2) == ShortcutStep.parse("Cmd+C"), "Follow-through exposes the next target step")
_ = observe(8)
expect(tracker.expectedStep(now: 2) == ShortcutStep.parse("Cmd+F"), "A sequence must update the target bypass")
_ = observe(3)
expect(tracker.expectedStep(now: 2) == nil, "Completed follow-through must clear its bypass")
tracker.arm(scale, alreadyUnlocked: false, now: 1)
expect(tracker.expectedStep(now: 122) == nil, "Expired target bypass must not change the active shortcut language")
expect(ModeHotKey.controlShiftSpace.matches(code: 49, flags: [.maskControl, .maskShift]), "Default switch key must match exactly")
expect(!ModeHotKey.controlShiftSpace.matches(code: 49, flags: [.maskControl, .maskShift, .maskCommand]), "Extra modifiers must not switch modes")
expect(ModeHotKey.controlOptionBackslash.matches(code: 42, flags: [.maskControl, .maskAlternate]), "Alternative mode shortcut must be recognized ahead of queries")
expect(TextEntryGuard.shouldProtect(role: "AXTextField", attributes: []), "Native and password fields must be protected")
expect(TextEntryGuard.shouldProtect(role: "AXTextArea", attributes: []), "Multiline text must be protected")
expect(TextEntryGuard.shouldProtect(role: "AXComboBox", attributes: []), "Editable selectors must be protected")
expect(TextEntryGuard.shouldProtect(role: "AXGroup", attributes: ["AXSelectedTextRange"]), "Custom editable controls must be protected by their text attributes")
expect(TextEntryGuard.shouldProtect(role: "", attributes: []), "Unknown focus must preserve the user's input")
expect(!TextEntryGuard.shouldProtect(role: "AXWindow", attributes: []), "An ordinary document window can use FG")
print("Passed \(checks) native shortcut, mode, input-protection and achievement checks.")
