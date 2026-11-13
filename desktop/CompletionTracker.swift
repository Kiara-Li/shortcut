import CoreGraphics
import Foundation

struct LearningCard: Equatable {
    let id: String
    let action: String
    let from: String
    let to: String
    let fromKeys: String
    let toKeys: String?
}

struct ShortcutStep: Equatable {
    let key: String
    let cmd: Bool
    let shift: Bool

    static func parse(_ text: String) -> ShortcutStep? {
        let parts = text.split(separator: "+").map { $0.trimmingCharacters(in: .whitespaces).uppercased() }
        guard let key = parts.last, ShortcutPolicy.keys.values.contains(key),
              parts.dropLast().allSatisfy({ $0 == "CMD" || $0 == "SHIFT" }) else { return nil }
        return ShortcutStep(key: key, cmd: parts.contains("CMD"), shift: parts.contains("SHIFT"))
    }
}

/// One explicit, recent lookup is eligible for a first-try achievement.
/// Observes only the target shortcut, not document content or arbitrary text.
struct CompletionTracker {
    private var candidate: LearningCard?
    private var steps: [ShortcutStep] = []
    private var index = 0
    private var expiresAt: TimeInterval = 0

    mutating func clear() { candidate = nil; steps = []; index = 0 }

    mutating func arm(_ card: LearningCard?, alreadyUnlocked: Bool, now: TimeInterval) {
        clear()
        guard let card = card, !alreadyUnlocked, let target = card.toKeys else { return }
        let parts = target.split(separator: ",", omittingEmptySubsequences: false).map(String.init)
        let parsed = parts.compactMap(ShortcutStep.parse)
        guard !parsed.isEmpty, parsed.count == parts.count else { return }
        candidate = card
        steps = parsed
        expiresAt = now + 120
    }

    mutating func observe(keyCode: Int64, flags: CGEventFlags, keyDown: Bool,
                          repeated: Bool, eligible: Bool, now: TimeInterval) -> LearningCard? {
        guard let card = candidate else { return nil }
        if now > expiresAt { clear(); return nil }
        guard keyDown, !repeated, eligible else { return nil }
        guard let key = ShortcutPolicy.keys[keyCode] else { index = 0; return nil }
        if !flags.intersection([.maskControl, .maskAlternate]).isEmpty { index = 0; return nil }
        let pressed = ShortcutStep(key: key, cmd: flags.contains(.maskCommand), shift: flags.contains(.maskShift))
        if pressed == steps[index] { index += 1 }
        else { index = pressed == steps[0] ? 1 : 0 }
        guard index == steps.count else { return nil }
        clear()
        return card
    }
}
