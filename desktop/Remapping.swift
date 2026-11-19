import CoreGraphics
import Foundation

enum InteractionMode: String {
    case learn, remap
    var label: String { self == .learn ? "Learning" : "Direct remap" }
}

enum RemapResolution: Equatable {
    case same, unavailable
    case keys([ShortcutStep])

    static func resolve(_ card: LearningCard, source: ShortcutStep? = nil) -> RemapResolution {
        guard let text = card.toKeys else { return .unavailable }
        guard let steps = ShortcutStep.sequence(text) else { return .unavailable }
        if steps.count == 1, steps[0] == (source ?? ShortcutStep.parse(card.fromKeys)) { return .same }
        return .keys(steps)
    }
}

enum RemapEvents {
    static let marker: Int64 = 0x534352454D4150

    static func isSynthetic(_ event: CGEvent) -> Bool {
        event.getIntegerValueField(.eventSourceUserData) == marker
    }

    static func pair(for step: ShortcutStep) -> [CGEvent]? {
        guard let code = ShortcutPolicy.keys.first(where: { $0.value == step.key })?.key,
              let source = CGEventSource(stateID: .privateState),
              let down = CGEvent(keyboardEventSource: source, virtualKey: CGKeyCode(code), keyDown: true),
              let up = CGEvent(keyboardEventSource: source, virtualKey: CGKeyCode(code), keyDown: false) else { return nil }
        var flags: CGEventFlags = []
        if step.cmd { flags.insert(.maskCommand) }
        if step.shift { flags.insert(.maskShift) }
        if step.alt { flags.insert(.maskAlternate) }
        if step.ctrl { flags.insert(.maskControl) }
        for event in [down, up] {
            event.flags = flags
            event.setIntegerValueField(.eventSourceUserData, value: marker)
            event.setIntegerValueField(.keyboardEventAutorepeat, value: 0)
        }
        return [down, up]
    }
}

/// Main-run-loop queue. Every chord releases immediately; later sequence steps
/// recheck the app/context. Tests inject a scheduler and recorder, never OS input.
final class RemapExecutor {
    private struct Job {
        let steps: [ShortcutStep]
        let pid: pid_t
        let allowed: () -> Bool
        let finished: (Bool) -> Void
        var index = 0
    }
    private var jobs: [Job] = []
    private var generation = 0
    private var scheduled = false
    private let post: (CGEvent, pid_t) -> Void
    private let schedule: (TimeInterval, @escaping () -> Void) -> Void

    init(post: @escaping (CGEvent, pid_t) -> Void = { $0.postToPid($1) },
         schedule: @escaping (TimeInterval, @escaping () -> Void) -> Void = { delay, work in
             DispatchQueue.main.asyncAfter(deadline: .now() + delay, execute: work)
         }) {
        self.post = post; self.schedule = schedule
    }

    @discardableResult
    func enqueue(_ steps: [ShortcutStep], pid: pid_t, allowed: @escaping () -> Bool,
                 finished: @escaping (Bool) -> Void) -> Bool {
        guard !steps.isEmpty, jobs.count < 16 else { return false }
        jobs.append(Job(steps: steps, pid: pid, allowed: allowed, finished: finished))
        if !scheduled { next(after: 0) }
        return true
    }

    func cancel() { generation += 1; jobs.removeAll(); scheduled = false }

    private func next(after delay: TimeInterval) {
        scheduled = true
        let token = generation
        schedule(delay) { [weak self] in
            guard let self = self, self.generation == token else { return }
            self.pump()
        }
    }

    private func pump() {
        scheduled = false
        guard let job = jobs.first else { return }
        guard job.allowed(), let events = RemapEvents.pair(for: job.steps[job.index]) else {
            jobs.removeFirst(); job.finished(false)
            if !jobs.isEmpty { next(after: 0) }
            return
        }
        // PID routing prevents an intervening app switch from redirecting keys.
        for event in events { post(event, job.pid) }
        if job.index + 1 == job.steps.count {
            jobs.removeFirst(); job.finished(true)
            if !jobs.isEmpty { next(after: 0.03) }
        } else {
            jobs[0].index += 1
            // Allow Copy to be processed before Paste in Front in Adobe apps.
            next(after: 0.12)
        }
    }
}
