import Carbon

enum ModeHotKey: String, CaseIterable {
    case tripleCommand, controlShiftSpace, controlOptionBackslash, controlOptionReturn

    /// Triple-tapping Command is detected from modifier events in the event tap,
    /// not registered with Carbon (Carbon hot keys need a non-modifier key).
    var usesTapDetector: Bool { self == .tripleCommand }

    var label: String {
        switch self {
        case .tripleCommand: return "⌘⌘⌘"
        case .controlShiftSpace: return "⌃⇧Space"
        case .controlOptionBackslash: return "⌃⌥\\"
        case .controlOptionReturn: return "⌃⌥Return"
        }
    }
    var keyCode: UInt32 {
        switch self {
        case .tripleCommand: return 0
        case .controlShiftSpace: return 49
        case .controlOptionBackslash: return 42
        case .controlOptionReturn: return 36
        }
    }
    var modifiers: UInt32 { UInt32(controlKey | (self == .controlShiftSpace ? shiftKey : optionKey)) }
    func matches(code: Int64, flags: CGEventFlags) -> Bool {
        if usesTapDetector { return false }
        let expected: CGEventFlags = self == .controlShiftSpace ? [.maskControl, .maskShift] : [.maskControl, .maskAlternate]
        return code == Int64(keyCode) && flags.intersection([.maskControl, .maskAlternate, .maskCommand, .maskShift]) == expected
    }
}

/// Counts quick, bare presses of Command (either side). Three taps in a row,
/// each released within `maxHold` and started within `maxGap` of the previous
/// release, toggle the mode. Using Command with any other key, another
/// modifier or a click starts the count over, so ⌘C/⌘V never trigger it.
struct TripleCommandDetector {
    static let maxHold: TimeInterval = 0.35
    static let maxGap: TimeInterval = 0.45
    private var taps = 0
    private var downAt: TimeInterval?
    private var lastUpAt: TimeInterval = 0

    mutating func reset() { taps = 0; downAt = nil }

    /// Feed every flagsChanged event. Returns true on the third tap's release.
    mutating func observe(flags: CGEventFlags, now: TimeInterval) -> Bool {
        let modifiers = flags.intersection([.maskControl, .maskAlternate, .maskCommand, .maskShift, .maskSecondaryFn])
        if modifiers == .maskCommand {
            if downAt == nil {
                if taps > 0 && now - lastUpAt > Self.maxGap { taps = 0 }
                downAt = now
            }
            return false
        }
        if modifiers.isEmpty, let start = downAt {
            downAt = nil
            guard now - start <= Self.maxHold else { taps = 0; return false }
            taps += 1; lastUpAt = now
            if taps == 3 { taps = 0; return true }
            return false
        }
        reset() // Another modifier joined in.
        return false
    }
}

/// Registered separately from the event filter, so conflicts are reported and
/// the mode switch is available even before Accessibility is granted.
final class ModeHotKeyRegistration {
    private var reference: EventHotKeyRef?
    private var handler: EventHandlerRef?
    private let onToggle: () -> Void
    private var pressed = false
    private(set) var current: ModeHotKey?

    init(onToggle: @escaping () -> Void) {
        self.onToggle = onToggle
        var types = [EventTypeSpec(eventClass: OSType(kEventClassKeyboard), eventKind: UInt32(kEventHotKeyPressed)),
                     EventTypeSpec(eventClass: OSType(kEventClassKeyboard), eventKind: UInt32(kEventHotKeyReleased))]
        InstallEventHandler(GetApplicationEventTarget(), { _, event, context in
            guard let context = context else { return OSStatus(eventNotHandledErr) }
            let registration = Unmanaged<ModeHotKeyRegistration>.fromOpaque(context).takeUnretainedValue()
            if GetEventKind(event) == UInt32(kEventHotKeyReleased) { registration.pressed = false }
            else if !registration.pressed { registration.pressed = true; registration.onToggle() }
            return noErr
        }, 2, &types, Unmanaged.passUnretained(self).toOpaque(), &handler)
    }

    func register(_ next: ModeHotKey) -> Bool {
        if current == next { return true }
        if next.usesTapDetector {
            if let previous = reference { UnregisterEventHotKey(previous) }
            reference = nil
            current = next
            return true
        }
        var candidate: EventHotKeyRef?
        let id = EventHotKeyID(signature: OSType(0x53434D44), id: 1)
        let result = RegisterEventHotKey(next.keyCode, next.modifiers, id, GetApplicationEventTarget(), 0, &candidate)
        guard result == noErr, let candidate = candidate else { return false }
        if let previous = reference { UnregisterEventHotKey(previous) }
        reference = candidate
        current = next
        return true
    }

    deinit {
        if let reference = reference { UnregisterEventHotKey(reference) }
        if let handler = handler { RemoveEventHandler(handler) }
    }
}
