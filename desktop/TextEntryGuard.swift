import ApplicationServices
import CoreGraphics
import Foundation

/// What a mouse click landed on, from static UI metadata only.
/// - drawing: a recognized non-text tool button → canvas typing ends
/// - text: the Type tool button → the next canvas click starts typing
/// - control: some other button/field/panel control → state unchanged
/// - unknown: anything else, e.g. the canvas → may start typing
enum CanvasToolIntent { case unknown, text, drawing, control }

/// Intent/state only; never stores characters, selections or document content.
struct CanvasTypingState {
    private var typeToolPID: pid_t?
    private var typingPID: pid_t?

    func protects(_ pid: pid_t) -> Bool { typingPID == pid }

    mutating func observeKey(code: Int64, flags: CGEventFlags, pid: pid_t, targetIsDesignApp: Bool) {
        let modifiers = flags.intersection([.maskControl, .maskAlternate, .maskCommand, .maskShift])
        if code == 53 || (code == 36 && modifiers == .maskCommand) {
            if typeToolPID == pid { typeToolPID = nil }
            if typingPID == pid { typingPID = nil }
            return
        }
        guard targetIsDesignApp, typingPID != pid,
              modifiers.isEmpty || modifiers == .maskShift else { return }
        if code == 17 { typeToolPID = pid }
        else if ShortcutPolicy.keys[code] != nil { typeToolPID = nil }
    }

    mutating func observeClick(pid: pid_t?, tool: CanvasToolIntent = .unknown) {
        guard let pid = pid else { return }
        switch tool {
        case .drawing:
            if typeToolPID == pid { typeToolPID = nil }
            if typingPID == pid { typingPID = nil }
        case .text:
            typeToolPID = pid
        case .control:
            break // Panels, toolbars and fields neither start nor end canvas typing.
        case .unknown:
            if typeToolPID == pid { typingPID = pid }
        }
    }
}

/// Reads roles, attribute names and static tool-button descriptions only.
/// A known drawing-tool click ends conservative canvas typing; unknown focus
/// still preserves input. It never reads text values or traverses documents.
final class TextEntryGuard {
    private var cachedPID: pid_t = 0
    private var checkedAt: TimeInterval = 0
    private var cachedProtection = true
    private var canvas = CanvasTypingState()
    /// Why the last isProtected() check answered as it did (role names only).
    private(set) var lastReason = ""
    /// What the last click was classified as (static control labels only).
    private(set) var lastClick = ""

    func invalidate() { checkedAt = 0 }

    func observeKey(code: Int64, flags: CGEventFlags, pid: pid_t, targetIsDesignApp: Bool) {
        canvas.observeKey(code: code, flags: flags, pid: pid, targetIsDesignApp: targetIsDesignApp)
        if code == 53 || (code == 36 && flags.intersection([.maskControl, .maskAlternate, .maskCommand, .maskShift]) == .maskCommand) {
            invalidate()
        }
    }

    /// Call on mouse-up, when tool and app activation have settled.
    func observeClick(pid: pid_t?, at location: CGPoint) {
        invalidate()
        guard let pid = pid else { return }
        let (intent, info) = toolAt(location, pid: pid)
        canvas.observeClick(pid: pid, tool: intent)
        lastClick = "\(intent) \(info) typing=\(canvas.protects(pid))"
    }

    static let toolRoles: Set<String> = [kAXButtonRole, kAXRadioButtonRole, kAXCheckBoxRole]
    static let controlRoles: Set<String> = toolRoles.union([kAXPopUpButtonRole, kAXMenuButtonRole, kAXTextFieldRole,
        kAXComboBoxRole, kAXSliderRole, kAXIncrementorRole, kAXScrollBarRole, kAXTabGroupRole, kAXToolbarRole,
        kAXMenuBarRole, kAXMenuBarItemRole, kAXMenuItemRole, kAXDisclosureTriangleRole, "AXSearchField"])

    private func toolAt(_ location: CGPoint, pid: pid_t) -> (CanvasToolIntent, String) {
        let app = AXUIElementCreateApplication(pid)
        AXUIElementSetMessagingTimeout(app, 0.01)
        var hit: AXUIElement?
        let found = AXUIElementCopyElementAtPosition(app, Float(location.x), Float(location.y), &hit)
        guard found == .success, var element = hit else { return (.unknown, "hit=err\(found.rawValue)") }
        var path: [String] = []
        // Hit-testing can land on an icon inside the button. Inspect at most
        // four ancestors, only in the target PID, with bounded AX timeouts.
        for _ in 0..<4 {
            AXUIElementSetMessagingTimeout(element, 0.01)
            var owner: pid_t = 0
            guard AXUIElementGetPid(element, &owner) == .success, owner == pid else { break }
            var role: CFTypeRef?
            guard AXUIElementCopyAttributeValue(element, kAXRoleAttribute as CFString, &role) == .success,
                  let roleName = role as? String else { break }
            path.append(roleName)
            if Self.controlRoles.contains(roleName) {
                // Tool buttons carry their name and key in the description, title or tooltip.
                var labels: [String] = []
                for attribute in [kAXDescriptionAttribute, kAXTitleAttribute, kAXHelpAttribute] {
                    var value: CFTypeRef?
                    if AXUIElementCopyAttributeValue(element, attribute as CFString, &value) == .success,
                       let text = value as? String, !text.isEmpty { labels.append(text) }
                }
                let isTool = Self.toolRoles.contains(roleName)
                for label in labels where isTool {
                    let intent = Self.toolIntent(role: roleName, description: label)
                    if intent != .unknown { return (intent, "role=\(roleName) label=\(label)") }
                }
                // Only button-like labels are logged; field values are never read.
                return (.control, "role=\(roleName)" + (isTool ? " labels=\(labels)" : ""))
            }
            var parent: CFTypeRef?
            guard AXUIElementCopyAttributeValue(element, kAXParentAttribute as CFString, &parent) == .success,
                  let parent = parent, CFGetTypeID(parent) == AXUIElementGetTypeID() else { break }
            element = unsafeBitCast(parent, to: AXUIElement.self)
        }
        return (.unknown, "path=\(path.joined(separator: "<"))")
    }

    static func toolIntent(role: String, description: String) -> CanvasToolIntent {
        guard toolRoles.contains(role) else { return .unknown }
        let label = description.lowercased().replacingOccurrences(of: "（", with: "(").replacingOccurrences(of: "）", with: ")")
        // Recognize only static drawing-tool labels, not text fields, swatches,
        // formatting controls or generic buttons. Unrecognized locales stay safe.
        guard let hint = label.range(of: #"\([^()]+\)\s*$"#, options: .regularExpression) else { return .unknown }
        let name = label[..<hint.lowerBound].trimmingCharacters(in: .whitespaces)
        guard name.hasSuffix("tool") || name.hasSuffix("工具") || name.hasSuffix("ツール") else { return .unknown }
        let chord = label[hint].trimmingCharacters(in: .whitespaces)
            .dropFirst().dropLast().replacingOccurrences(of: "shift ", with: "shift+").replacingOccurrences(of: " ", with: "")
        guard let shortcut = ShortcutStep.parse(chord), !shortcut.cmd, !shortcut.ctrl, !shortcut.alt else { return .unknown }
        return shortcut.key == "T" ? .text : .drawing
    }

    func isProtected(pid: pid_t, now: TimeInterval) -> Bool {
        if canvas.protects(pid) { lastReason = "canvas typing (after Type tool)"; return true }
        if cachedPID == pid && now - checkedAt < 0.15 { return cachedProtection }
        cachedPID = pid; checkedAt = now
        let app = AXUIElementCreateApplication(pid)
        AXUIElementSetMessagingTimeout(app, 0.02)
        var raw: CFTypeRef?
        guard AXUIElementCopyAttributeValue(app, kAXFocusedUIElementAttribute as CFString, &raw) == .success,
              let raw = raw, CFGetTypeID(raw) == AXUIElementGetTypeID() else {
            cachedProtection = true // Unknown context preserves the user's input.
            lastReason = "focus unknown"
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
        lastReason = cachedProtection ? "focus \(role.isEmpty ? "no role" : role)" : "none (focus \(role))"
        return cachedProtection
    }

    static func shouldProtect(role: String, attributes: [String]) -> Bool {
        [kAXTextFieldRole, kAXTextAreaRole, kAXComboBoxRole].contains(role)
            || attributes.contains(kAXSelectedTextRangeAttribute)
            || role.isEmpty || role == kAXApplicationRole
    }
}
