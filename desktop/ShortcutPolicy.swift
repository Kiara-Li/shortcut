import CoreGraphics

struct ShortcutCombo {
    let cmd: Bool
    let shift: Bool
    let key: String
    var alt = false
    var ctrl = false
    var prefixed = false

    var json: [String: Any] { ["cmd": cmd, "shift": shift, "alt": alt, "ctrl": ctrl, "key": key] }
    var label: String { "⌃⌥" + shortcutLabel }
    var shortcutLabel: String { (ctrl ? "⌃" : "") + (alt ? "⌥" : "") + (cmd ? "⌘" : "") + (shift ? "⇧" : "") + key }
    var step: ShortcutStep { ShortcutStep(key: key, cmd: cmd, shift: shift, alt: alt, ctrl: ctrl) }
}

enum ShortcutDecision {
    case pass, swallow, toggleDetails
    case show(ShortcutCombo)
}

/// Only catalog chords in the selected application can be intercepted.
struct ShortcutPolicy {
    private var swallowed = Set<Int64>()
    static let keys: [Int64: String] = [
        0: "A", 1: "S", 2: "D", 3: "F", 4: "H", 5: "G", 6: "Z", 7: "X",
        8: "C", 9: "V", 11: "B", 12: "Q", 13: "W", 14: "E", 15: "R",
        16: "Y", 17: "T", 18: "1", 19: "2", 20: "3", 21: "4", 22: "6",
        23: "5", 24: "=", 25: "9", 26: "7", 27: "-", 28: "8", 29: "0",
        30: "]", 31: "O", 32: "U", 33: "[", 34: "I", 35: "P", 36: "RETURN", 37: "L",
        38: "J", 39: "'", 40: "K", 41: ";", 42: "\\", 43: ",", 44: "/",
        45: "N", 46: "M", 47: ".", 48: "TAB", 49: "SPACE", 50: "`", 51: "DELETE", 53: "ESCAPE",
        64: "F17", 79: "F18", 80: "F19", 90: "F20", 96: "F5", 97: "F6", 98: "F7", 99: "F3",
        100: "F8", 101: "F9", 103: "F11", 105: "F13", 106: "F16", 107: "F14", 109: "F10",
        111: "F12", 113: "F15", 115: "HOME", 116: "PAGEUP", 117: "FORWARDDELETE", 118: "F4",
        119: "END", 120: "F2", 121: "PAGEDOWN", 122: "F1", 123: "LEFT", 124: "RIGHT", 125: "DOWN", 126: "UP",
    ]
    static func isTarget(_ bundleID: String?, target: String) -> Bool {
        let id = bundleID?.lowercased() ?? ""
        guard target == "photoshop" || target == "illustrator" else { return false }
        let expected = "com.adobe." + target
        return id == expected || id.hasPrefix(expected + ".")
    }
    mutating func reset() { swallowed.removeAll() }

    mutating func decide(keyCode: Int64, flags: CGEventFlags, keyDown: Bool,
                         repeated: Bool, enabled: Bool, eligible: Bool,
                         cardVisible: Bool, figmaMode: Bool = false, textEntry: Bool = false,
                         sourceKeys: Set<ShortcutStep> = [], sameKeys: Set<ShortcutStep> = [],
                         expectedTarget: ShortcutStep? = nil, allowPrefixedLookup: Bool = true) -> ShortcutDecision {
        if !keyDown { return swallowed.remove(keyCode) != nil ? .swallow : .pass }
        if swallowed.contains(keyCode) {
            if repeated { return .swallow }
            swallowed.remove(keyCode)
        }
        guard enabled, !textEntry else { return .pass }
        let modifiers = flags.intersection([.maskControl, .maskAlternate, .maskCommand, .maskShift])
        if eligible && cardVisible && keyCode == 49 && modifiers == [.maskControl, .maskAlternate] {
            swallowed.insert(keyCode); return .toggleDetails
        }
        guard eligible, !repeated, let step = ShortcutStep.from(keyCode: keyCode, flags: flags) else { return .pass }
        // Hardware navigation keys may carry Fn, but Fn+letter shortcuts remain native.
        if flags.contains(.maskSecondaryFn) && keyCode < 64 { return .pass }
        // Real Control+Option source chords take priority over the legacy lookup prefix.
        if figmaMode && sourceKeys.contains(step) {
            guard !sameKeys.contains(step), step != expectedTarget else { return .pass }
            swallowed.insert(keyCode)
            return .show(ShortcutCombo(cmd: step.cmd, shift: step.shift, key: step.key, alt: step.alt, ctrl: step.ctrl))
        }
        guard allowPrefixedLookup, flags.contains([.maskControl, .maskAlternate]),
              keyCode != 49, keyCode != 53, keyCode < 64 else { return .pass }
        swallowed.insert(keyCode)
        return .show(ShortcutCombo(cmd: step.cmd, shift: step.shift, key: step.key, prefixed: true))
    }
}
