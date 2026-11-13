import { spawnSync } from 'node:child_process'
import { mkdir, cp, writeFile, readFile, access, rm } from 'node:fs/promises'
import { fileURLToPath } from 'node:url'
import path from 'node:path'

if (process.platform !== 'darwin') {
  console.error('The native Shortcut app currently requires macOS. The web build still works on other platforms.')
  process.exit(1)
}
const root = fileURLToPath(new URL('../', import.meta.url))
const app = path.join(root, 'desktop/build/Shortcut.app')
const contents = path.join(app, 'Contents')
const command = process.argv[2] ?? 'run'

function run(executable, args, options = {}) {
  const result = spawnSync(executable, args, { cwd: root, stdio: 'inherit', ...options })
  if (result.error) throw result.error
  if (result.status !== 0) process.exit(result.status ?? 1)
}

// Build first, then launch. Never modify Accessibility settings or install a daemon.
if (command !== 'open') {
  run('npm', ['run', 'build', '--', '--base=./', '--outDir=desktop/build/web'])
  await mkdir(path.join(contents, 'MacOS'), { recursive: true })
  await mkdir(path.join(contents, 'Resources'), { recursive: true })
  await rm(path.join(contents, 'Resources/web'), { recursive: true, force: true })
  await cp(path.join(root, 'desktop/build/web'), path.join(contents, 'Resources/web'), { recursive: true })
  await cp(path.join(root, 'src/data'), path.join(contents, 'Resources/decks'), { recursive: true, force: true })
  await writeFile(path.join(contents, 'Info.plist'), `<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE plist PUBLIC "-//Apple//DTD PLIST 1.0//EN" "http://www.apple.com/DTDs/PropertyList-1.0.dtd">
<plist version="1.0"><dict>
<key>CFBundleExecutable</key><string>Shortcut</string>
<key>CFBundleIdentifier</key><string>design.kiara.shortcut</string>
<key>CFBundleName</key><string>Shortcut</string>
<key>CFBundleDisplayName</key><string>Shortcut</string>
<key>CFBundlePackageType</key><string>APPL</string>
<key>CFBundleShortVersionString</key><string>1.0.0</string>
<key>LSMinimumSystemVersion</key><string>13.0</string>
<key>NSHighResolutionCapable</key><true/>
<key>NSAccessibilityUsageDescription</key><string>Intercept only Control–Option shortcut queries and show a learning card over your app.</string>
</dict></plist>
`)
  run('xcrun', ['swiftc', '-O', '-module-cache-path', '/tmp/shortcut-swift-cache',
    'desktop/ShortcutPolicy.swift', 'desktop/CompletionTracker.swift', 'desktop/main.swift', '-o', path.join(contents, 'MacOS/Shortcut'),
    '-framework', 'AppKit', '-framework', 'WebKit', '-framework', 'Carbon'])
  // Ad-hoc signing supports local execution without an Apple developer account.
  // Rebuilt ad-hoc binaries can require re-enabling Accessibility in macOS.
  run('codesign', ['--force', '--sign', '-', '--identifier', 'design.kiara.shortcut', app])
  console.log(`\nBuilt ${app}`)
}
if (command === 'run' || command === 'open') {
  await access(path.join(contents, 'MacOS/Shortcut'))
  const childArgs = ['-a', app]
  run('open', childArgs)
  console.log('Opened Shortcut. Complete setup, then allow Accessibility in the app.\nAfter rebuilding a running app, quit and reopen it to load the new build.')
}
// Detect a missing bundled entry before reporting a successful build.
await readFile(path.join(contents, 'Resources/web/index.html'))
