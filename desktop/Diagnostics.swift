import Foundation

/// Local troubleshooting log: ~/Library/Logs/<app name>/diagnostics.log.
/// Records protection state changes, why they happened and how clicks were
/// classified (static control roles/labels). It never records which keys
/// were pressed, typed text, field values or document content.
enum Diagnostics {
    private static let queue = DispatchQueue(label: "shortcut.diagnostics")
    private static let maxBytes = 512 * 1024
    static let url: URL = {
        let name = Bundle.main.object(forInfoDictionaryKey: "CFBundleName") as? String ?? "Shortcut"
        let folder = FileManager.default.homeDirectoryForCurrentUser.appendingPathComponent("Library/Logs/\(name)")
        try? FileManager.default.createDirectory(at: folder, withIntermediateDirectories: true)
        return folder.appendingPathComponent("diagnostics.log")
    }()
    private static let stamp: DateFormatter = {
        let f = DateFormatter(); f.dateFormat = "yyyy-MM-dd HH:mm:ss.SSS"; return f
    }()

    static func log(_ message: String) {
        let line = "\(stamp.string(from: Date())) \(message)\n"
        queue.async {
            let size = (try? FileManager.default.attributesOfItem(atPath: url.path)[.size] as? Int) ?? 0
            if size > maxBytes { try? FileManager.default.removeItem(at: url) }
            if let handle = try? FileHandle(forWritingTo: url) {
                handle.seekToEndOfFile(); handle.write(Data(line.utf8)); try? handle.close()
            } else {
                try? Data(line.utf8).write(to: url)
            }
        }
    }
}
