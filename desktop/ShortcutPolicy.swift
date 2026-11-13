import CoreGraphics

struct ShortcutCombo {
    let cmd: Bool
    let shift: Bool
    let key: String

    var json: [String: Any] { ["cmd": cmd, "shift": shift, "key": key] }
    var label: String { "⌃⌥" + (cmd ? "⌘" : "") + (shift ? "⇧" : "") + key }
}

enum ShortcutDecision {
    case pass, swallow, dismiss, flip
    case show(ShortcutCombo)
}

/// Pure input policy, shared with the tests. Never stores ordinary typed text.
struct ShortcutPolicy {
    private var swallowed = Set<Int64>()
    // Physical ANSI key positions, matching the web deck's KeyboardEvent.code.
    static let keys: [Int64: String] = [
        0: "A", 1: "S", 2: "D", 3: "F", 4: "H", 5: "G", 6: "Z", 7: "X",
        8: "C", 9: "V", 11: "B", 12: "Q", 13: "W", 14: "E", 15: "R",
        16: "Y", 17: "T", 18: "1", 19: "2", 20: "3", 21: "4", 22: "6",
        23: "5", 24: "=", 25: "9", 26: "7", 27: "-", 28: "8", 29: "0",
        30: "]", 31: "O", 32: "U", 33: "[", 34: "I", 35: "P", 37: "L",
        38: "J", 39: "'", 40: "K", 41: ";", 42: "\\", 43: ",", 44: "/",
        45: "N", 46: "M", 47: ".", 50: "`",
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
                         cardVisible: Bool) -> ShortcutDecision {
        // Swallow the matching release even if modifiers, app or pause changed.
        if !keyDown {
            return swallowed.remove(keyCode) != nil ? .swallow : .pass
        }
        if swallowed.contains(keyCode) { return .swallow }
        guard enabled else { return .pass }
        let modifiers = flags.intersection([.maskControl, .maskAlternate, .maskCommand, .maskShift])
        if cardVisible && keyCode == 53 && modifiers.isEmpty {
            swallowed.insert(keyCode)
            return .dismiss
        }
        if cardVisible && keyCode == 49 && modifiers == [.maskControl, .maskAlternate] {
            swallowed.insert(keyCode)
            return .flip
        }
        guard eligible, !repeated, flags.contains([.maskControl, .maskAlternate]),
              let key = Self.keys[keyCode] else { return .pass }
        swallowed.insert(keyCode)
        return .show(ShortcutCombo(cmd: flags.contains(.maskCommand), shift: flags.contains(.maskShift), key: key))
    }
}
