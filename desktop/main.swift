import AppKit
import ApplicationServices
import Carbon
import WebKit

func jsonString(_ value: Any) -> String {
    guard let data = try? JSONSerialization.data(withJSONObject: value, options: [.fragmentsAllowed, .sortedKeys]),
          let text = String(data: data, encoding: .utf8) else { return "null" }
    return text
}

/// Serve only bundled files. No local server, remote content, or privileged remote navigation.
final class BundleScheme: NSObject, WKURLSchemeHandler {
    let root = Bundle.main.resourceURL!.appendingPathComponent("web").standardizedFileURL
    func webView(_ webView: WKWebView, start task: WKURLSchemeTask) {
        guard let url = task.request.url, url.host == "app" else {
            task.didFailWithError(URLError(.badURL)); return
        }
        let file = root.appendingPathComponent(url.path == "/" ? "index.html" : String(url.path.dropFirst())).standardizedFileURL
        guard file.path.hasPrefix(root.path + "/"), let data = try? Data(contentsOf: file) else {
            task.didFailWithError(URLError(.fileDoesNotExist)); return
        }
        let mime = ["html": "text/html", "js": "text/javascript", "css": "text/css", "json": "application/json",
                    "svg": "image/svg+xml", "png": "image/png", "webmanifest": "application/manifest+json"]
        task.didReceive(URLResponse(url: url, mimeType: mime[file.pathExtension] ?? "application/octet-stream",
                                   expectedContentLength: data.count, textEncodingName: "utf-8"))
        task.didReceive(data)
        task.didFinish()
    }
    func webView(_ webView: WKWebView, stop task: WKURLSchemeTask) {}
}

final class CardPanel: NSPanel {
    override var canBecomeKey: Bool { false }
    override var canBecomeMain: Bool { false }
}

final class ShortcutApp: NSObject, NSApplicationDelegate, WKScriptMessageHandler, WKNavigationDelegate {
    private let defaults = UserDefaults.standard
    private var state: [String: Any] = ["pair": ["from": "figma", "to": "photoshop"], "saved": [String: Any]()]
    private var paused = false
    private var scope = "target"
    private var lastTrigger = ""
    private var tapError: String?
    private var lastStatus = ""
    private var tap: CFMachPort?
    private var tapSource: CFRunLoopSource?
    private var policy = ShortcutPolicy()
    private var figmaMode = false
    private var nativeModeItem: NSMenuItem!
    private var figmaModeItem: NSMenuItem!
    private var switchModeItem: NSMenuItem!
    private var modeStatusItem: NSMenuItem!
    private let modePopover = NSPopover()
    private var modeMenu: NSMenu?
    private lazy var modePopoverContent = ModePopoverController(onToggle: { [weak self] enabled in
        self?.setFigmaMode(enabled)
    }, onOpen: { [weak self] in
        self?.modePopover.performClose(nil)
        self?.showSettings()
    })
    private var hotKeyItems: [NSMenuItem] = []
    private var hotKeyError: String?
    private var requestedHotKey = ModeHotKey.controlShiftSpace
    private lazy var modeHotKey = ModeHotKeyRegistration { [weak self] in
        guard let self = self else { return }
        self.setFigmaMode(!self.figmaMode)
    }
    private let textEntry = TextEntryGuard()
    private var followThrough = CompletionTracker()
    private var modeSourceKeys = Set<ShortcutStep>()
    private var modeSameKeys = Set<ShortcutStep>()
    private var timer: Timer?
    private var menuItem: NSStatusItem!
    private var window: NSWindow!
    private var panel: CardPanel!
    private var mainWeb: WKWebView!
    private var cardWeb: WKWebView!
    private var celebrationPanel: CardPanel!
    private var celebrationWeb: WKWebView!
    private var celebrationReady = false
    private var pendingAchievement: [String: Any]?
    private var celebrationTimer: Timer?
    private var completion = CompletionTracker()
    private var catalog: [LearningCard] = []
    private var overlayReady = false
    private var pendingCard: [String: Any]?
    private var watchdog: Timer?
    private var target: String { (state["pair"] as? [String: String])?["to"] ?? "photoshop" }

    func applicationDidFinishLaunching(_ notification: Notification) {
        if let data = defaults.data(forKey: "state"),
           let stored = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any] {
            state = stored
        }
        if !(state["pair"] is [String: String]) { state["pair"] = ["from": "figma", "to": "photoshop"] }
        if state["achievements"] == nil { state["achievements"] = [String: Any]() }
        loadCatalog()
        updateModeKeys()
        // Test scope deliberately resets on launch.
        makeMenu()
        panel = CardPanel(contentRect: NSRect(x: 0, y: 0, width: 306, height: 401),
                          styleMask: [.borderless, .nonactivatingPanel], backing: .buffered, defer: false)
        panel.level = .popUpMenu
        panel.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]
        panel.isOpaque = false
        panel.backgroundColor = .clear
        panel.hasShadow = false
        panel.hidesOnDeactivate = false
        panel.isFloatingPanel = true
        panel.isReleasedWhenClosed = false
        cardWeb = makeWeb(overlay: true)
        cardWeb.setValue(false, forKey: "drawsBackground")
        panel.contentView = cardWeb

        celebrationPanel = CardPanel(contentRect: .zero, styleMask: [.borderless, .nonactivatingPanel], backing: .buffered, defer: false)
        celebrationPanel.level = .popUpMenu
        celebrationPanel.collectionBehavior = [.canJoinAllSpaces, .fullScreenAuxiliary]
        celebrationPanel.isOpaque = false
        celebrationPanel.backgroundColor = .clear
        celebrationPanel.hasShadow = false
        celebrationPanel.hidesOnDeactivate = false
        celebrationPanel.ignoresMouseEvents = true
        celebrationPanel.isReleasedWhenClosed = false
        celebrationWeb = makeWeb(overlay: false, celebration: true)
        celebrationWeb.setValue(false, forKey: "drawsBackground")
        celebrationPanel.contentView = celebrationWeb

        window = NSWindow(contentRect: NSRect(x: 0, y: 0, width: 600, height: 830),
                          styleMask: [.titled, .closable, .miniaturizable, .resizable], backing: .buffered, defer: false)
        window.title = "Shortcut"
        window.minSize = NSSize(width: 480, height: 620)
        window.isReleasedWhenClosed = false
        mainWeb = makeWeb(overlay: false)
        window.contentView = mainWeb
        window.center()
        showSettings()
        refresh()
        timer = Timer.scheduledTimer(withTimeInterval: 1, repeats: true) { [weak self] _ in self?.refresh() }
    }

    private func makeMenu() {
        let appMenu = NSMenu()
        let rootItem = NSMenuItem()
        let commands = NSMenu()
        commands.addItem(withTitle: "About Shortcut", action: #selector(NSApplication.orderFrontStandardAboutPanel(_:)), keyEquivalent: "")
        commands.addItem(.separator())
        commands.addItem(withTitle: "Quit Shortcut", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        rootItem.submenu = commands
        appMenu.addItem(rootItem)
        // Native edit menu gives WKWebView standard copy/paste/select commands.
        let edit = NSMenuItem()
        let editMenu = NSMenu(title: "Edit")
        editMenu.addItem(withTitle: "Copy", action: #selector(NSText.copy(_:)), keyEquivalent: "c")
        editMenu.addItem(withTitle: "Paste", action: #selector(NSText.paste(_:)), keyEquivalent: "v")
        editMenu.addItem(withTitle: "Select All", action: #selector(NSText.selectAll(_:)), keyEquivalent: "a")
        edit.submenu = editMenu
        appMenu.addItem(edit)
        NSApp.mainMenu = appMenu
        menuItem = NSStatusBar.system.statusItem(withLength: NSStatusItem.variableLength)
        menuItem.button?.title = "Off"
        menuItem.button?.font = .monospacedSystemFont(ofSize: 12, weight: .semibold)
        menuItem.button?.image = NSImage(systemSymbolName: "keyboard", accessibilityDescription: nil)
        menuItem.button?.imagePosition = .imageLeading
        menuItem.button?.target = self
        menuItem.button?.action = #selector(statusItemClicked)
        menuItem.button?.sendAction(on: [.leftMouseUp, .rightMouseUp])
        let menu = NSMenu()
        nativeModeItem = menu.addItem(withTitle: "", action: #selector(selectNativeMode), keyEquivalent: "")
        nativeModeItem.target = self
        figmaModeItem = menu.addItem(withTitle: "", action: #selector(selectFigmaMode), keyEquivalent: "")
        figmaModeItem.target = self
        modeStatusItem = menu.addItem(withTitle: "", action: nil, keyEquivalent: "")
        menu.addItem(.separator())
        switchModeItem = menu.addItem(withTitle: "", action: #selector(toggleMode), keyEquivalent: "")
        switchModeItem.target = self
        let shortcutItem = menu.addItem(withTitle: "Switch shortcut", action: nil, keyEquivalent: "")
        let shortcuts = NSMenu()
        for key in ModeHotKey.allCases {
            let item = shortcuts.addItem(withTitle: key.label, action: #selector(selectModeHotKey(_:)), keyEquivalent: "")
            item.target = self; item.representedObject = key.rawValue
            hotKeyItems.append(item)
        }
        shortcutItem.submenu = shortcuts
        menu.addItem(.separator())
        let show = menu.addItem(withTitle: "Open Shortcut", action: #selector(showSettings), keyEquivalent: "")
        show.target = self
        let pause = menu.addItem(withTitle: "Pause / resume listening", action: #selector(togglePause), keyEquivalent: "")
        pause.target = self
        menu.addItem(.separator())
        menu.addItem(withTitle: "Quit Shortcut", action: #selector(NSApplication.terminate(_:)), keyEquivalent: "q")
        modeMenu = menu
        modePopover.contentViewController = modePopoverContent
        modePopover.contentSize = NSSize(width: 320, height: 225)
        modePopover.behavior = .transient
        modePopover.animates = false
        requestedHotKey = ModeHotKey(rawValue: defaults.string(forKey: "modeHotKey") ?? "") ?? .controlShiftSpace
        configureModeHotKey(requestedHotKey)
    }

    private func makeWeb(overlay: Bool, celebration: Bool = false) -> WKWebView {
        let config = WKWebViewConfiguration()
        config.setURLSchemeHandler(BundleScheme(), forURLScheme: "shortcut")
        config.userContentController.add(self, name: "shortcut")
        let bootstrap: [String: Any] = ["state": state, "status": status(), "overlay": overlay, "celebration": celebration]
        config.userContentController.addUserScript(WKUserScript(
            source: "window.shortcutNative = \(jsonString(bootstrap));",
            injectionTime: .atDocumentStart, forMainFrameOnly: true))
        let web = WKWebView(frame: .zero, configuration: config)
        web.navigationDelegate = self
        web.load(URLRequest(url: URL(string: "shortcut://app/index.html" + (overlay ? "#/overlay" : celebration ? "#/celebration" : "#/home"))!))
        return web
    }

    func webView(_ webView: WKWebView, decidePolicyFor action: WKNavigationAction,
                 decisionHandler: @escaping (WKNavigationActionPolicy) -> Void) {
        let url = action.request.url
        decisionHandler(url?.scheme == "shortcut" && url?.host == "app" ? .allow : .cancel)
    }

    func webView(_ webView: WKWebView, didFinish navigation: WKNavigation!) {
        emit(webView, "state", state)
        emit(webView, "status", status())
    }

    func webViewWebContentProcessDidTerminate(_ webView: WKWebView) {
        if webView === cardWeb { overlayReady = false; hideCard() }
        if webView === celebrationWeb { celebrationReady = false; celebrationPanel.orderOut(nil) }
        webView.reload()
    }

    private func emit(_ web: WKWebView?, _ type: String, _ value: Any) {
        web?.evaluateJavaScript("window.dispatchEvent(new CustomEvent('shortcut-native', {detail: \(jsonString(["type": type, "value": value]))}));", completionHandler: nil)
    }

    private func broadcast(_ type: String, _ value: Any) {
        emit(mainWeb, type, value)
        emit(cardWeb, type, value)
        emit(celebrationWeb, type, value)
    }

    private func save() {
        defaults.set(try? JSONSerialization.data(withJSONObject: state), forKey: "state")
        broadcast("state", state)
    }

    func userContentController(_ controller: WKUserContentController, didReceive message: WKScriptMessage) {
        guard message.frameInfo.isMainFrame, message.frameInfo.securityOrigin.protocol == "shortcut",
              let body = message.body as? [String: Any], let action = body["action"] as? String else { return }
        let value = body["value"]
        switch action {
        case "setPair":
            guard let pair = value as? [String: String], pair["from"] == "figma",
                  pair["to"] == "illustrator" || pair["to"] == "photoshop" else { return }
            hideCard(); completion.clear(); followThrough.clear(); figmaMode = false
            state["pair"] = pair; updateModeKeys(); save(); refresh()
        case "recordLookup":
            guard let id = value as? String, id.count < 100 else { return }
            var saved = state["saved"] as? [String: [String: Any]] ?? [:]
            let now = Date().timeIntervalSince1970 * 1000
            let old = saved[id] ?? [:]
            saved[id] = ["cardId": id, "count": (old["count"] as? Int ?? 0) + 1,
                         "firstSeen": old["firstSeen"] ?? now, "lastSeen": now]
            state["saved"] = saved; save()
        case "clearSaved": state["saved"] = [String: Any](); save()
        case "resetAll":
            hideCard(); completion.clear(); followThrough.clear(); figmaMode = false; celebrationPanel.orderOut(nil)
            state = ["pair": ["from": "figma", "to": "photoshop"], "saved": [String: Any](), "achievements": [String: Any]()]; save()
            updateModeKeys(); refresh()
        case "requestPermission":
            let options = [kAXTrustedCheckOptionPrompt.takeUnretainedValue() as String: true] as CFDictionary
            _ = AXIsProcessTrustedWithOptions(options)
            NSWorkspace.shared.open(URL(string: "x-apple.systempreferences:com.apple.preference.security?Privacy_Accessibility")!)
        case "setPaused": paused = value as? Bool ?? false; if paused { hideCard(); completion.clear(); followThrough.clear() }; refresh()
        case "setKeyboardMode": setFigmaMode(value as? String == "figma")
        case "showModeControl": showModeControl()
        case "setModeHotKey":
            if let raw = value as? String, let key = ModeHotKey(rawValue: raw) { configureModeHotKey(key); refresh() }
        case "setScope": scope = (value as? String) == "all" ? "all" : "target"; completion.clear(); followThrough.clear(); refresh()
        case "overlayReady":
            overlayReady = true
            if let request = pendingCard { pendingCard = nil; emit(cardWeb, "card", request) }
        case "celebrationReady":
            celebrationReady = true
            if let entry = pendingAchievement { pendingAchievement = nil; emit(celebrationWeb, "achievement", entry) }
        case "hideCard": hideCard()
        case "showCard":
            guard let request = value as? [String: Any], let source = request["source"] as? String,
                  source == "saved" || source == "search" else { return }
            showCard(request)
        default: break
        }
    }

    private func status() -> [String: Any] {
        let active = NSWorkspace.shared.frontmostApplication
        let targetActive = ShortcutPolicy.isTarget(active?.bundleIdentifier, target: target)
        let protected = figmaMode && !paused && targetActive && AXIsProcessTrusted()
            ? textEntry.isProtected(pid: active!.processIdentifier, now: Date().timeIntervalSince1970) : false
        let listening = !paused && AXIsProcessTrusted() && tap.map { CGEvent.tapIsEnabled(tap: $0) } == true
        return ["accessibility": AXIsProcessTrusted(),
                "listening": listening,
                "paused": paused, "scope": scope, "foregroundApp": active?.localizedName ?? "",
                "targetActive": targetActive,
                "keyboardMode": figmaMode ? "figma" : "native", "modeActive": figmaMode && listening && targetActive && !protected && !IsSecureEventInputEnabled(),
                "inputProtected": protected,
                "modeHotKey": modeHotKey.current?.rawValue ?? requestedHotKey.rawValue,
                "modeHotKeyLabel": modeHotKey.current?.label ?? requestedHotKey.label,
                "modeHotKeyRegistered": modeHotKey.current != nil,
                "modeHotKeyError": hotKeyError as Any? ?? NSNull(),
                "secureInput": IsSecureEventInputEnabled(), "lastTrigger": lastTrigger,
                "error": tapError as Any? ?? NSNull()]
    }

    private func refresh() {
        if AXIsProcessTrusted() && tap == nil && !paused { installTap() }
        if !AXIsProcessTrusted(), let current = tap {
            CGEvent.tapEnable(tap: current, enable: false)
            if let source = tapSource { CFRunLoopRemoveSource(CFRunLoopGetMain(), source, .commonModes) }
            CFMachPortInvalidate(current)
            tap = nil; tapSource = nil; policy.reset(); completion.clear(); followThrough.clear()
        }
        let next = status()
        let encoded = jsonString(next)
        if encoded != lastStatus {
            lastStatus = encoded
            broadcast("status", next)
            updateMenu(next)
        }
    }

    private func installTap() {
        let mask = (CGEventMask(1) << CGEventType.keyDown.rawValue) | (CGEventMask(1) << CGEventType.keyUp.rawValue)
            | (CGEventMask(1) << CGEventType.leftMouseDown.rawValue)
        tap = CGEvent.tapCreate(tap: .cgSessionEventTap, place: .headInsertEventTap, options: .defaultTap,
                               eventsOfInterest: mask, callback: { _, type, event, context in
            guard let context = context else { return Unmanaged.passUnretained(event) }
            let app = Unmanaged<ShortcutApp>.fromOpaque(context).takeUnretainedValue()
            return app.handle(type, event)
        }, userInfo: Unmanaged.passUnretained(self).toOpaque())
        guard let tap = tap else {
            tapError = "macOS could not start the event filter. Reopen Shortcut after enabling Accessibility."
            return
        }
        tapError = nil
        tapSource = CFMachPortCreateRunLoopSource(kCFAllocatorDefault, tap, 0)
        CFRunLoopAddSource(CFRunLoopGetMain(), tapSource, .commonModes)
        CGEvent.tapEnable(tap: tap, enable: true)
    }

    private func handle(_ type: CGEventType, _ event: CGEvent) -> Unmanaged<CGEvent>? {
        if type == .tapDisabledByTimeout || type == .tapDisabledByUserInput {
            policy.reset(); completion.clear(); followThrough.clear()
            if let tap = tap, AXIsProcessTrusted() { CGEvent.tapEnable(tap: tap, enable: true) }
            return Unmanaged.passUnretained(event)
        }
        let active = NSWorkspace.shared.frontmostApplication
        let inTarget = ShortcutPolicy.isTarget(active?.bundleIdentifier, target: target)
        if type == .leftMouseDown {
            textEntry.observeClick(pid: inTarget ? active?.processIdentifier : nil)
            return Unmanaged.passUnretained(event)
        }
        let code = event.getIntegerValueField(.keyboardEventKeycode)
        // Let Carbon receive the registered switch even when it resembles a query.
        if modeHotKey.current?.matches(code: code, flags: event.flags) == true { return Unmanaged.passUnretained(event) }
        let now = Date().timeIntervalSince1970
        let protected = figmaMode && inTarget && active != nil ? textEntry.isProtected(pid: active!.processIdentifier, now: now) : false
        let eligible = scope == "all" || inTarget
        let decision = policy.decide(keyCode: event.getIntegerValueField(.keyboardEventKeycode), flags: event.flags,
            keyDown: type == .keyDown, repeated: event.getIntegerValueField(.keyboardEventAutorepeat) != 0,
            enabled: figmaMode && !paused && state["pair"] is [String: Any] && !IsSecureEventInputEnabled(),
            eligible: eligible, cardVisible: panel.isVisible,
            figmaMode: figmaMode && inTarget, textEntry: protected,
            sourceKeys: modeSourceKeys, sameKeys: modeSameKeys, expectedTarget: followThrough.expectedStep(now: now))
        switch decision {
        case .pass:
            if inTarget, let active = active, type == .keyDown, !protected || code == 53 || code == 36 {
                textEntry.observeKey(code: code, flags: event.flags, pid: active.processIdentifier, targetIsDesignApp: true)
            }
            if figmaMode && !paused && !protected && !IsSecureEventInputEnabled() {
                _ = followThrough.observe(keyCode: code, flags: event.flags, keyDown: type == .keyDown,
                    repeated: event.getIntegerValueField(.keyboardEventAutorepeat) != 0, eligible: inTarget, now: now)
            }
            if figmaMode && !paused && !protected && !IsSecureEventInputEnabled(),
               let learned = completion.observe(keyCode: event.getIntegerValueField(.keyboardEventKeycode), flags: event.flags,
                   keyDown: type == .keyDown, repeated: event.getIntegerValueField(.keyboardEventAutorepeat) != 0,
                   eligible: ShortcutPolicy.isTarget(active?.bundleIdentifier, target: target),
                   now: Date().timeIntervalSince1970) {
                DispatchQueue.main.async { self.unlock(learned) }
            }
            // The target shortcut must still reach Photoshop/Illustrator unchanged.
            return Unmanaged.passUnretained(event)
        case .swallow: return nil
        case .dismiss:
            DispatchQueue.main.async { self.hideCard(); self.emit(self.cardWeb, "dismiss", NSNull()) }
        case .flip:
            DispatchQueue.main.async { self.emit(self.cardWeb, "flip", NSNull()) }
        case .show(let combo):
            // Keep the event callback short: rendering and saving run after it returns.
            let appName = active?.localizedName ?? "Unknown"
            let label = event.flags.contains([.maskControl, .maskAlternate]) ? combo.label : combo.shortcutLabel
            DispatchQueue.main.async {
                self.lastTrigger = label + " in " + appName
                self.showCard(["pressed": combo.json, "at": NSNull(), "source": "keyboard"])
                self.refresh()
            }
        }
        // Returning nil from an active CGEvent tap deletes the event before delivery.
        return nil
    }

    private func showCard(_ request: [String: Any]) {
        guard state["pair"] is [String: Any] else { return }
        armAchievement(request)
        let cursor = NSEvent.mouseLocation
        let screen = NSScreen.screens.first { NSMouseInRect(cursor, $0.frame, false) } ?? NSScreen.main!
        let bounds = screen.visibleFrame
        let size = panel.frame.size
        let x = max(bounds.minX, min(cursor.x + 18, bounds.maxX - size.width))
        let y = max(bounds.minY, min(cursor.y - size.height - 12, bounds.maxY - size.height))
        panel.setFrameOrigin(NSPoint(x: x, y: y))
        // The browser position is local to this panel, not a desktop coordinate.
        var next = request; next["at"] = NSNull()
        if overlayReady { emit(cardWeb, "card", next) } else { pendingCard = next }
        panel.orderFrontRegardless()
        watchdog?.invalidate()
        // Safety net if the renderer crashes; normal timing pauses on hover/flip.
        watchdog = Timer.scheduledTimer(withTimeInterval: 120, repeats: false) { [weak self] _ in self?.hideCard() }
    }

    private func loadCatalog() {
        guard let root = Bundle.main.resourceURL?.appendingPathComponent("decks"),
              let files = try? FileManager.default.contentsOfDirectory(at: root, includingPropertiesForKeys: nil) else { return }
        for file in files where file.pathExtension == "json" {
            guard let data = try? Data(contentsOf: file),
                  let deck = (try? JSONSerialization.jsonObject(with: data)) as? [String: Any],
                  let from = deck["from"] as? String, let to = deck["to"] as? String,
                  let cards = deck["cards"] as? [[String: Any]] else { continue }
            for card in cards {
                guard let id = card["id"] as? String, let action = card["action"] as? String,
                      let fromKeys = card["fromKeys"] as? String else { continue }
                catalog.append(LearningCard(id: id, action: action, from: from, to: to,
                                            fromKeys: fromKeys, toKeys: card["toKeys"] as? String))
            }
        }
    }

    private func armAchievement(_ request: [String: Any]) {
        guard let pressed = request["pressed"] as? [String: Any], let key = pressed["key"] as? String else {
            completion.clear(); return
        }
        let step = ShortcutStep(key: key.uppercased(), cmd: pressed["cmd"] as? Bool ?? false, shift: pressed["shift"] as? Bool ?? false)
        let from = (state["pair"] as? [String: String])?["from"] ?? "figma"
        let card = catalog.first { $0.from == from && $0.to == target && ShortcutStep.parse($0.fromKeys) == step }
        let achievements = state["achievements"] as? [String: Any] ?? [:]
        completion.arm(card, alreadyUnlocked: card.map { achievements[$0.id] != nil } ?? false, now: Date().timeIntervalSince1970)
        // Keep target keys usable even for already-unlocked cards and source/target collisions.
        followThrough.arm(card, alreadyUnlocked: false, now: Date().timeIntervalSince1970)
    }

    private func unlock(_ card: LearningCard) {
        guard card.to == target else { return }
        var achievements = state["achievements"] as? [String: Any] ?? [:]
        guard achievements[card.id] == nil else { return }
        let entry: [String: Any] = ["cardId": card.id, "from": card.from, "to": card.to,
                                  "unlockedAt": Date().timeIntervalSince1970 * 1000, "method": "shortcut"]
        achievements[card.id] = entry
        state["achievements"] = achievements
        save()
        hideCard()
        emit(cardWeb, "dismiss", NSNull())
        let cursor = NSEvent.mouseLocation
        let screen = NSScreen.screens.first { NSMouseInRect(cursor, $0.frame, false) } ?? NSScreen.main!
        celebrationPanel.setFrame(screen.frame, display: true)
        if celebrationReady { emit(celebrationWeb, "achievement", entry) }
        else { pendingAchievement = entry }
        celebrationPanel.orderFrontRegardless()
        celebrationTimer?.invalidate()
        celebrationTimer = Timer.scheduledTimer(withTimeInterval: 4, repeats: false) { [weak self] _ in
            self?.celebrationPanel.orderOut(nil)
        }
    }

    private func updateModeKeys() {
        let from = (state["pair"] as? [String: String])?["from"] ?? "figma"
        let cards = catalog.filter { $0.from == from && $0.to == target }
        modeSourceKeys = Set(cards.compactMap { ShortcutStep.parse($0.fromKeys) })
        modeSameKeys = Set(cards.compactMap { card in
            guard let source = ShortcutStep.parse(card.fromKeys),
                  let text = card.toKeys, !text.contains(","), ShortcutStep.parse(text) == source else { return nil }
            return source
        })
    }

    private func setFigmaMode(_ enabled: Bool) {
        figmaMode = enabled
        paused = false
        completion.clear(); followThrough.clear(); textEntry.invalidate()
        hideCard(); emit(cardWeb, "dismiss", NSNull())
        refresh()
    }

    private func configureModeHotKey(_ key: ModeHotKey) {
        if modeHotKey.register(key) {
            requestedHotKey = key
            defaults.set(key.rawValue, forKey: "modeHotKey")
            hotKeyError = nil
        } else {
            hotKeyError = "Could not register \(key.label). It may be in use. Choose another switch shortcut; the previous shortcut stays active."
        }
    }

    private func updateMenu(_ status: [String: Any]) {
        let targetName = target == "photoshop" ? "Photoshop" : "Illustrator"
        let active = status["modeActive"] as? Bool == true
        let allowed = status["accessibility"] as? Bool == true
        let reason: String
        if !figmaMode { reason = "Figma Mode off · original \(targetName) shortcuts" }
        else if !allowed { reason = "Figma Mode on · Accessibility access needed" }
        else if paused { reason = "Figma Mode on · paused" }
        else if status["secureInput"] as? Bool == true { reason = "Figma Mode on · Secure Input protected" }
        else if status["inputProtected"] as? Bool == true { reason = "Figma Mode on · text input protected" }
        else if !active { reason = "Figma Mode on · waiting for \(targetName)" }
        else { reason = "Figma Mode on in \(targetName)" }
        menuItem.button?.title = figmaMode ? "On" : "Off"
        menuItem.button?.toolTip = reason
        menuItem.button?.setAccessibilityLabel("Shortcut: " + reason)
        nativeModeItem.title = "Figma Mode: Off — Original shortcuts"
        figmaModeItem.title = "Figma Mode: On — Figma hints"
        nativeModeItem.state = figmaMode ? .off : .on
        figmaModeItem.state = figmaMode ? .on : .off
        modeStatusItem.title = hotKeyError ?? reason
        switchModeItem.title = "Toggle Figma Mode (\(modeHotKey.current?.label ?? requestedHotKey.label))"
        modePopoverContent.update(enabled: figmaMode, active: active, target: targetName, permission: allowed,
            protected: status["inputProtected"] as? Bool == true || status["secureInput"] as? Bool == true,
            paused: paused, shortcut: modeHotKey.current?.label ?? requestedHotKey.label, error: hotKeyError)
        for item in hotKeyItems {
            item.state = item.representedObject as? String == modeHotKey.current?.rawValue ? .on : .off
        }
    }

    @objc private func selectNativeMode() { setFigmaMode(false) }
    @objc private func selectFigmaMode() { setFigmaMode(true) }
    @objc private func toggleMode() { setFigmaMode(!figmaMode) }
    @objc private func showModeControl() {
        guard let button = menuItem.button else { return }
        if modePopover.isShown { modePopover.performClose(nil) }
        else { refresh(); modePopover.show(relativeTo: button.bounds, of: button, preferredEdge: .minY) }
    }
    @objc private func statusItemClicked() {
        if NSApp.currentEvent?.type == .rightMouseUp, let menu = modeMenu {
            modePopover.performClose(nil)
            menuItem.menu = menu
            menuItem.button?.performClick(nil)
            menuItem.menu = nil
        } else { showModeControl() }
    }
    @objc private func selectModeHotKey(_ item: NSMenuItem) {
        guard let raw = item.representedObject as? String, let key = ModeHotKey(rawValue: raw) else { return }
        configureModeHotKey(key); refresh()
    }

    private func hideCard() { panel?.orderOut(nil); pendingCard = nil; watchdog?.invalidate() }
    @objc private func showSettings() { window.makeKeyAndOrderFront(nil); NSApp.activate(ignoringOtherApps: true) }
    @objc private func togglePause() { paused.toggle(); if paused { hideCard(); completion.clear(); followThrough.clear() }; refresh() }
    func applicationShouldTerminateAfterLastWindowClosed(_ sender: NSApplication) -> Bool { false }
    func applicationShouldHandleReopen(_ sender: NSApplication, hasVisibleWindows flag: Bool) -> Bool { showSettings(); return true }
    func applicationWillTerminate(_ notification: Notification) {
        timer?.invalidate(); watchdog?.invalidate(); celebrationTimer?.invalidate()
        if let tap = tap { CGEvent.tapEnable(tap: tap, enable: false); CFMachPortInvalidate(tap) }
    }
}

let application = NSApplication.shared
let delegate = ShortcutApp()
application.setActivationPolicy(.regular)
application.delegate = delegate
application.run()
