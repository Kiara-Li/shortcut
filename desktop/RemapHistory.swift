import Foundation

enum HistoryKind: String, Codable { case remapped, shared }

struct RemapHistoryEntry: Codable, Equatable {
    let id: String
    let cardId: String
    let action: String
    let from: String
    let to: String
    let fromKeys: String
    let toKeys: String
    let usedAt: Double // Unix milliseconds, shared with the web view.
    let kind: HistoryKind

    var valid: Bool {
        UUID(uuidString: id) != nil && !cardId.isEmpty && !action.isEmpty
            && from == "figma" && ["illustrator", "photoshop"].contains(to)
            && ShortcutStep.parse(fromKeys) != nil && !toKeys.isEmpty
            && toKeys.split(separator: ",", omittingEmptySubsequences: false).allSatisfy { ShortcutStep.parse(String($0)) != nil }
            && usedAt.isFinite && usedAt > 0 && usedAt <= 8.64e15
    }
}

/// Only catalog actions submitted in Direct mode belong here, never typed text.
/// The log stores immutable key snapshots; review cannot execute an action.
struct RemapHistory {
    static let limit = 500
    private(set) var entries: [RemapHistoryEntry] = []

    init(raw: Any? = nil) {
        entries = ((raw as? [Any]) ?? []).compactMap { item in
            guard let value = item as? [String: Any] else { return nil }
            guard let data = try? JSONSerialization.data(withJSONObject: value),
                  let entry = try? JSONDecoder().decode(RemapHistoryEntry.self, from: data), entry.valid else { return nil }
            return entry
        }.sorted { $0.usedAt > $1.usedAt }
        var seen = Set<String>()
        entries = Array(entries.filter { seen.insert($0.id).inserted }.prefix(Self.limit))
    }

    var json: [[String: Any]] {
        guard let data = try? JSONEncoder().encode(entries) else { return [] }
        return (try? JSONSerialization.jsonObject(with: data)) as? [[String: Any]] ?? []
    }

    @discardableResult
    mutating func record(_ card: LearningCard, kind: HistoryKind, sent: Bool, at: Double) -> Bool {
        guard sent, let keys = card.toKeys else { return false }
        switch (kind, RemapResolution.resolve(card)) {
        case (.remapped, .keys), (.shared, .same): break
        default: return false
        }
        let entry = RemapHistoryEntry(id: UUID().uuidString, cardId: card.id, action: card.action,
            from: card.from, to: card.to, fromKeys: card.fromKeys, toKeys: keys, usedAt: at, kind: kind)
        guard entry.valid else { return false }
        entries.insert(entry, at: 0)
        if entries.count > Self.limit { entries.removeLast(entries.count - Self.limit) }
        return true
    }

    mutating func clear() { entries.removeAll() }
}
