import AppKit

private final class ModeSwitch: NSSwitch {
    override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }
}

/// A real menu-bar control, with one on/off switch rather than app-language tabs.
final class ModePopoverController: NSViewController {
    private let modeSwitch = ModeSwitch()
    private let stateLabel = NSTextField(labelWithString: "Off")
    private let detailLabel = NSTextField(wrappingLabelWithString: "")
    private let shortcutLabel = NSTextField(labelWithString: "")
    private let onToggle: (Bool) -> Void
    private let onOpen: () -> Void

    init(onToggle: @escaping (Bool) -> Void, onOpen: @escaping () -> Void) {
        self.onToggle = onToggle; self.onOpen = onOpen
        super.init(nibName: nil, bundle: nil)
    }
    required init?(coder: NSCoder) { fatalError("init(coder:) is unavailable") }

    override func loadView() {
        let root = NSVisualEffectView(frame: NSRect(x: 0, y: 0, width: 320, height: 225))
        root.material = .popover
        root.blendingMode = .behindWindow
        let title = NSTextField(labelWithString: "Figma Mode")
        title.font = .systemFont(ofSize: 20, weight: .semibold)
        modeSwitch.target = self; modeSwitch.action = #selector(changed)
        modeSwitch.setAccessibilityLabel("Figma Mode")
        let spacer = NSView()
        spacer.setContentHuggingPriority(.defaultLow, for: .horizontal)
        let header = NSStackView(views: [title, spacer, modeSwitch])
        header.orientation = .horizontal; header.alignment = .centerY
        stateLabel.font = .systemFont(ofSize: 13, weight: .semibold)
        detailLabel.font = .systemFont(ofSize: 12)
        detailLabel.textColor = .secondaryLabelColor
        detailLabel.maximumNumberOfLines = 4
        shortcutLabel.font = .monospacedSystemFont(ofSize: 11, weight: .regular)
        shortcutLabel.textColor = .secondaryLabelColor
        let open = NSButton(title: "Open Shortcut", target: self, action: #selector(openApp))
        open.bezelStyle = .rounded; open.controlSize = .small
        let stack = NSStackView(views: [header, stateLabel, detailLabel, shortcutLabel, open])
        stack.orientation = .vertical; stack.alignment = .leading; stack.spacing = 12
        stack.translatesAutoresizingMaskIntoConstraints = false
        root.addSubview(stack)
        NSLayoutConstraint.activate([
            stack.leadingAnchor.constraint(equalTo: root.leadingAnchor, constant: 20),
            stack.trailingAnchor.constraint(equalTo: root.trailingAnchor, constant: -20),
            stack.topAnchor.constraint(equalTo: root.topAnchor, constant: 18),
            header.widthAnchor.constraint(equalTo: stack.widthAnchor),
            detailLabel.widthAnchor.constraint(equalTo: stack.widthAnchor),
        ])
        view = root
    }

    func update(enabled: Bool, active: Bool, target: String, permission: Bool,
                protected: Bool, paused: Bool, shortcut: String, error: String?) {
        _ = view
        modeSwitch.state = enabled ? .on : .off
        stateLabel.stringValue = enabled ? "On" : "Off · Original shortcuts"
        if !enabled {
            detailLabel.stringValue = "\(target) works normally. Turn on for Figma shortcut hints."
        } else if !permission {
            detailLabel.stringValue = "Allow Accessibility in Shortcut to enable hints."
        } else if paused {
            detailLabel.stringValue = "Hints are paused. Turn off and on to resume."
        } else if protected {
            detailLabel.stringValue = "Text input is protected. Finish editing to resume hints."
        } else if active {
            detailLabel.stringValue = "Press a Figma shortcut in \(target) to see its equivalent. Actions stay manual."
        } else {
            detailLabel.stringValue = "Ready for \(target). Other apps keep their original shortcuts."
        }
        shortcutLabel.stringValue = error ?? "Toggle: \(shortcut)"
        modeSwitch.setAccessibilityValue(enabled ? "On" : "Off")
    }
    @objc private func changed() { onToggle(modeSwitch.state == .on) }
    @objc private func openApp() { onOpen() }
}
