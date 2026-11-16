import Carbon

enum ModeHotKey: String, CaseIterable {
    case controlShiftSpace, controlOptionBackslash, controlOptionReturn

    var label: String {
        switch self {
        case .controlShiftSpace: return "⌃⇧Space"
        case .controlOptionBackslash: return "⌃⌥\\"
        case .controlOptionReturn: return "⌃⌥Return"
        }
    }
    var keyCode: UInt32 {
        switch self {
        case .controlShiftSpace: return 49
        case .controlOptionBackslash: return 42
        case .controlOptionReturn: return 36
        }
    }
    var modifiers: UInt32 { UInt32(controlKey | (self == .controlShiftSpace ? shiftKey : optionKey)) }
    func matches(code: Int64, flags: CGEventFlags) -> Bool {
        let expected: CGEventFlags = self == .controlShiftSpace ? [.maskControl, .maskShift] : [.maskControl, .maskAlternate]
        return code == Int64(keyCode) && flags.intersection([.maskControl, .maskAlternate, .maskCommand, .maskShift]) == expected
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
