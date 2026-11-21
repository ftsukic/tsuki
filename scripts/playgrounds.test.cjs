const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const net = require('node:net')
const path = require('node:path')
const fs = require('node:fs')
const os = require('node:os')
const { test } = require('node:test')
const { checkPorts, projects, nativeFingerprint } = require('./playgrounds.cjs')

test('fixed port conflicts identify the app and fail without starting another port', async () => {
  for (const project of projects) {
    const server = net.createServer((socket) => socket.destroy())
    await new Promise((resolve, reject) => {
      server.once('error', reject)
      server.listen(project.port, '127.0.0.1', resolve)
    })
    try {
      await assert.rejects(checkPorts([project]), (error) => {
        assert.ok(error.message.includes(`[${project.name}] port ${project.port}`))
        assert.ok(error.message.includes('EADDRINUSE'))
        return true
      })
      const result = spawnSync(
        process.execPath,
        [path.join(__dirname, 'playgrounds.cjs'), 'check'],
        { encoding: 'utf8', timeout: 10000 },
      )
      assert.equal(result.status, 1)
      assert.ok(result.stderr.includes('no alternate ports'))
    } finally {
      await new Promise((resolve) => server.close(resolve))
    }
  }
  await checkPorts()
})

test('install refuses an unavailable emulator before any build', () => {
  const result = spawnSync(
    process.execPath,
    [path.join(__dirname, 'playgrounds.cjs'), 'install:android', '--device', 'emulator-invalid'],
    { encoding: 'utf8' },
  )
  assert.equal(result.status, 1)
  assert.ok(result.stderr.includes('Connected emulator not found'))
  assert.ok(!result.stdout.includes('Building/installing'))
})

test('APK reuse follows native inputs and ABI, while JS and generated outputs do not invalidate it', () => {
  const cwd = fs.mkdtempSync(path.join(os.tmpdir(), 'tsuki-native-inputs-'))
  try {
    fs.mkdirSync(path.join(cwd, 'android/build'), { recursive: true })
    fs.writeFileSync(path.join(cwd, 'app.json'), '{"name":"Tsuki"}')
    const before = nativeFingerprint(cwd, 'x86_64')
    fs.writeFileSync(path.join(cwd, 'App.tsx'), 'changed JS')
    fs.writeFileSync(path.join(cwd, 'android/build/output'), 'generated')
    assert.equal(nativeFingerprint(cwd, 'x86_64'), before)
    assert.notEqual(nativeFingerprint(cwd, 'arm64-v8a'), before)
    fs.writeFileSync(path.join(cwd, 'app.json'), '{"name":"NW4"}')
    assert.notEqual(nativeFingerprint(cwd, 'x86_64'), before)
  } finally {
    fs.rmSync(cwd, { recursive: true, force: true })
  }
})
