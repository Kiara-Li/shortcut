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
print("Passed \(checks) native shortcut and achievement checks.")
