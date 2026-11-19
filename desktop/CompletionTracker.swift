import CoreGraphics
import Foundation

struct LearningCard: Equatable {
    let id: String
    let action: String
    let from: String
    let to: String
    let fromKeys: String
    let toKeys: String?
    var aliases: [String] = []
    // Canvas is the only context in which generated input is enabled by default.
    var intercept = true

    var sourceSteps: [ShortcutStep] { ([fromKeys] + aliases).compactMap(ShortcutStep.parse) }
    func matches(_ step: ShortcutStep) -> Bool { sourceSteps.contains(step) }
}

struct ShortcutStep: Hashable {
    let key: String
    let cmd: Bool
    let shift: Bool
    let alt: Bool
    let ctrl: Bool

    init(key: String, cmd: Bool, shift: Bool, alt: Bool = false, ctrl: Bool = false) {
        self.key = key; self.cmd = cmd; self.shift = shift; self.alt = alt; self.ctrl = ctrl
    }

    static func parse(_ text: String) -> ShortcutStep? {
        var text = text.trimmingCharacters(in: .whitespacesAndNewlines)
        guard !text.isEmpty else { return nil }
        // '+' is the shifted physical '=' key; a literal comma is not a sequence separator.
        var plus = false
        if text == "+" { text = "="; plus = true }
        else if text.hasSuffix("++") { text = String(text.dropLast()) + "="; plus = true }
        let parts = text.components(separatedBy: "+").map { $0.trimmingCharacters(in: .whitespaces).uppercased() }
        let modifiers = Set(["CMD", "COMMAND", "META", "SHIFT", "ALT", "OPTION", "CTRL", "CONTROL"])
        guard let last = parts.last, !last.isEmpty, parts.dropLast().allSatisfy(modifiers.contains) else { return nil }
        let names = ["ENTER": "RETURN", "ESC": "ESCAPE", "BACKSPACE": "DELETE", "ARROWLEFT": "LEFT", "ARROWRIGHT": "RIGHT", "ARROWUP": "UP", "ARROWDOWN": "DOWN"]
        let key = names[last] ?? last
        guard ShortcutPolicy.keys.values.contains(key) else { return nil }
        return ShortcutStep(key: key, cmd: parts.contains("CMD") || parts.contains("COMMAND") || parts.contains("META"),
                            shift: plus || parts.contains("SHIFT"), alt: parts.contains("ALT") || parts.contains("OPTION"),
                            ctrl: parts.contains("CTRL") || parts.contains("CONTROL"))
    }

    static func sequence(_ text: String) -> [ShortcutStep]? {
        let parts = text.components(separatedBy: ", ")
        let steps = parts.compactMap(parse)
        return !steps.isEmpty && steps.count == parts.count ? steps : nil
    }

    var notation: String {
        (ctrl ? "Ctrl+" : "") + (alt ? "Alt+" : "") + (cmd ? "Cmd+" : "") + (shift ? "Shift+" : "") + key
    }

    static func from(keyCode: Int64, flags: CGEventFlags) -> ShortcutStep? {
        guard let key = ShortcutPolicy.keys[keyCode] else { return nil }
        return ShortcutStep(key: key, cmd: flags.contains(.maskCommand), shift: flags.contains(.maskShift),
                            alt: flags.contains(.maskAlternate), ctrl: flags.contains(.maskControl))
    }
}

/// Tracks an explicitly opened hint, never arbitrary typed text or document content.
struct CompletionTracker {
    private var candidate: LearningCard?
    private var steps: [ShortcutStep] = []
    private var index = 0
    private var expiresAt: TimeInterval = 0

    mutating func clear() { candidate = nil; steps = []; index = 0 }
    func expectedStep(now: TimeInterval) -> ShortcutStep? {
        guard candidate != nil, now <= expiresAt, index < steps.count else { return nil }
        return steps[index]
    }
    mutating func arm(_ card: LearningCard?, alreadyUnlocked: Bool, now: TimeInterval) {
        clear()
        guard let card = card, !alreadyUnlocked, let target = card.toKeys,
              let parsed = ShortcutStep.sequence(target) else { return }
        candidate = card; steps = parsed; expiresAt = now + 120
    }
    mutating func observe(keyCode: Int64, flags: CGEventFlags, keyDown: Bool,
                          repeated: Bool, eligible: Bool, now: TimeInterval) -> LearningCard? {
        guard let card = candidate else { return nil }
        if now > expiresAt { clear(); return nil }
        guard keyDown, !repeated, eligible else { return nil }
        guard let pressed = ShortcutStep.from(keyCode: keyCode, flags: flags) else { index = 0; return nil }
        if pressed == steps[index] { index += 1 }
        else { index = pressed == steps[0] ? 1 : 0 }
        guard index == steps.count else { return nil }
        clear()
        return card
    }
}
