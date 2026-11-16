import ApplicationServices
import CoreGraphics
import Foundation

/// Reads accessibility roles/attribute names only, never text or document content.
final class TextEntryGuard {
    private var cachedPID: pid_t = 0
    private var checkedAt: TimeInterval = 0
    private var cachedProtection = true
    private var typeToolPID: pid_t?
    private var canvasTypingPID: pid_t?

    func invalidate() { checkedAt = 0 }

    func observeKey(code: Int64, flags: CGEventFlags, pid: pid_t, targetIsDesignApp: Bool) {
        let modifiers = flags.intersection([.maskControl, .maskAlternate, .maskCommand, .maskShift])
        if code == 53 || (code == 36 && modifiers == .maskCommand) {
            typeToolPID = nil; canvasTypingPID = nil; invalidate(); return
        }
        guard targetIsDesignApp, canvasTypingPID != pid,
              modifiers.isEmpty || modifiers == .maskShift else { return }
        if code == 17 { typeToolPID = pid }
        else if ShortcutPolicy.keys[code] != nil { typeToolPID = nil }
    }

    func observeClick(pid: pid_t?) {
        invalidate()
        if let pid = pid, typeToolPID == pid { canvasTypingPID = pid }
    }

    func isProtected(pid: pid_t, now: TimeInterval) -> Bool {
        if canvasTypingPID == pid { return true }
        if cachedPID == pid && now - checkedAt < 0.15 { return cachedProtection }
        cachedPID = pid; checkedAt = now
        let app = AXUIElementCreateApplication(pid)
        AXUIElementSetMessagingTimeout(app, 0.02)
        var raw: CFTypeRef?
        guard AXUIElementCopyAttributeValue(app, kAXFocusedUIElementAttribute as CFString, &raw) == .success,
              let raw = raw, CFGetTypeID(raw) == AXUIElementGetTypeID() else {
            cachedProtection = true // Unknown context fails open for the user's input.
            return true
        }
        let focused = unsafeBitCast(raw, to: AXUIElement.self)
        AXUIElementSetMessagingTimeout(focused, 0.02)
        var roleValue: CFTypeRef?
        AXUIElementCopyAttributeValue(focused, kAXRoleAttribute as CFString, &roleValue)
        let role = roleValue as? String ?? ""
        var names: CFArray?
        AXUIElementCopyAttributeNames(focused, &names)
        let attributes = names as? [String] ?? []
        cachedProtection = Self.shouldProtect(role: role, attributes: attributes)
        return cachedProtection
    }

    static func shouldProtect(role: String, attributes: [String]) -> Bool {
        [kAXTextFieldRole, kAXTextAreaRole, kAXComboBoxRole].contains(role)
            || attributes.contains(kAXSelectedTextRangeAttribute)
            || role.isEmpty || role == kAXApplicationRole
    }
}
