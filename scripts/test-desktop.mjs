import { spawnSync } from 'node:child_process'
import { mkdtempSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

if (process.platform !== 'darwin') {
  console.error('Native shortcut tests require macOS.')
  process.exit(1)
}
const root = fileURLToPath(new URL('../', import.meta.url))
const temp = mkdtempSync(path.join(tmpdir(), 'shortcut-tests-'))
try {
  const binary = path.join(temp, 'policy-tests')
  const result = spawnSync('xcrun', ['swiftc', '-module-cache-path', '/tmp/shortcut-swift-cache',
    'desktop/ShortcutPolicy.swift', 'desktop/CompletionTracker.swift', 'desktop/ModeHotKey.swift', 'desktop/TextEntryGuard.swift',
    'desktop/tests/main.swift', '-o', binary], { cwd: root, stdio: 'inherit' })
  if (result.error) throw result.error
  if (result.status !== 0) process.exitCode = result.status ?? 1
  else process.exitCode = spawnSync(binary, [], { stdio: 'inherit' }).status ?? 1
} finally { rmSync(temp, { recursive: true, force: true }) }
