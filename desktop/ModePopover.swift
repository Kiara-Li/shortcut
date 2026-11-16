import AppKit

private final class ModeSwitch: NSSwitch {
    override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }
}
private final class ModeRadio: NSButton {
    override func acceptsFirstMouse(for event: NSEvent?) -> Bool { true }
}

/// Two equal workflow choices under one on/off switch.
final class ModePopoverController: NSViewController {
    private let modeSwitch = ModeSwitch()
    private let stateLabel = NSTextField(labelWithString: "Off")
    private let detailLabel = NSTextField(wrappingLabelWithString: "")
    private let shortcutLabel = NSTextField(labelWithString: "")
    private let learnButton = ModeRadio(radioButtonWithTitle: "Learning", target: nil, action: nil)
    private let remapButton = ModeRadio(radioButtonWithTitle: "Direct remap", target: nil, action: nil)
    private let onToggle: (Bool) -> Void
    private let onSelect: (InteractionMode) -> Void
    private let onOpen: () -> Void

    init(onToggle: @escaping (Bool) -> Void, onSelect: @escaping (InteractionMode) -> Void, onOpen: @escaping () -> Void) {
        self.onToggle = onToggle; self.onSelect = onSelect; self.onOpen = onOpen
        super.init(nibName: nil, bundle: nil)
    }
    required init?(coder: NSCoder) { fatalError("init(coder:) is unavailable") }

    override func loadView() {
        let root = NSVisualEffectView(frame: NSRect(x: 0, y: 0, width: 340, height: 410))
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
        func option(_ button: NSButton, subtitle: String, tag: Int) -> NSStackView {
            button.target = self; button.action = #selector(selectedMode(_:)); button.tag = tag
            button.font = .systemFont(ofSize: 13, weight: .semibold)
            let caption = NSTextField(wrappingLabelWithString: subtitle)
            caption.font = .systemFont(ofSize: 12); caption.textColor = .secondaryLabelColor
            let row = NSStackView(views: [button, caption])
            row.orientation = .vertical; row.alignment = .leading; row.spacing = 3
            caption.widthAnchor.constraint(equalTo: row.widthAnchor).isActive = true
            return row
        }
        let learning = option(learnButton, subtitle: "See a hint, then press the target shortcut.", tag: 0)
        let remapping = option(remapButton, subtitle: "Use Figma keys directly. Quiet feedback.", tag: 1)
        let stack = NSStackView(views: [header, learning, remapping, stateLabel, detailLabel, shortcutLabel, open])
        stack.orientation = .vertical; stack.alignment = .leading; stack.spacing = 12
        stack.translatesAutoresizingMaskIntoConstraints = false
        root.addSubview(stack)
        NSLayoutConstraint.activate([
            stack.leadingAnchor.constraint(equalTo: root.leadingAnchor, constant: 20),
            stack.trailingAnchor.constraint(equalTo: root.trailingAnchor, constant: -20),
            stack.topAnchor.constraint(equalTo: root.topAnchor, constant: 18),
            header.widthAnchor.constraint(equalTo: stack.widthAnchor),
            learning.widthAnchor.constraint(equalTo: stack.widthAnchor),
            remapping.widthAnchor.constraint(equalTo: stack.widthAnchor),
            detailLabel.widthAnchor.constraint(equalTo: stack.widthAnchor),
        ])
        view = root
    }

    func update(enabled: Bool, mode: InteractionMode, active: Bool, target: String, permission: Bool,
                protected: Bool, paused: Bool, shortcut: String, error: String?) {
        _ = view
        modeSwitch.state = enabled ? .on : .off
        learnButton.state = mode == .learn ? .on : .off
        remapButton.state = mode == .remap ? .on : .off
        stateLabel.stringValue = enabled ? "On · \(mode.label)" : "Off · Original shortcuts"
        if !enabled {
            detailLabel.stringValue = "\(target) works normally. Choose a mode, then turn on."
        } else if !permission {
            detailLabel.stringValue = "Allow Accessibility in Shortcut to enable this mode."
        } else if paused {
            detailLabel.stringValue = "Paused. Turn off and on to resume."
        } else if protected {
            detailLabel.stringValue = "Text input is protected. Finish editing to resume."
        } else if active {
            detailLabel.stringValue = mode == .learn
                ? "Press a Figma shortcut in \(target) to see its equivalent. Actions stay manual."
                : "Supported shortcuts execute in \(target). No extra keypress or learning card."
        } else {
            detailLabel.stringValue = "Ready for \(target). Other apps keep their original shortcuts."
        }
        shortcutLabel.stringValue = error ?? "Toggle: \(shortcut)"
        modeSwitch.setAccessibilityValue(enabled ? "On" : "Off")
    }
    @objc private func changed() { onToggle(modeSwitch.state == .on) }
    @objc private func selectedMode(_ sender: NSButton) { onSelect(sender.tag == 0 ? .learn : .remap) }
    @objc private func openApp() { onOpen() }
}
