import CoreGraphics

/// The panel includes 16pt of transparent shadow space on each side.
enum HintPlacement {
    static func frame(in bounds: CGRect, height requested: CGFloat) -> CGRect {
        let margin: CGFloat = 8
        let width = min(392, max(0, bounds.width - margin * 2))
        let height = min(max(120, requested.isFinite ? requested : 220), 640, max(0, bounds.height - margin * 2))
        return CGRect(x: bounds.maxX - width - margin, y: bounds.maxY - height - margin, width: width, height: height)
    }

    static func windowFrame(position: CGPoint, size: CGSize, primaryTop: CGFloat) -> CGRect {
        CGRect(x: position.x, y: primaryTop - position.y - size.height, width: size.width, height: size.height)
    }
}
