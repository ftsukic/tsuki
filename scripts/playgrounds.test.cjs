const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const net = require('node:net')
const path = require('node:path')
const fs = require('node:fs')
const os = require('node:os')
const { test } = require('node:test')
const {
  checkPorts,
  projects,
  nativeFingerprint,
  parseAdbDevices,
  isPortOpen,
} = require('./playgrounds.cjs')

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

test('parseAdbDevices recognizes both TCP emulators (e.g. MuMu) and AVD emulators', () => {
  const sample = [
    'List of devices attached',
    '127.0.0.1:16384        device product:aurora model:24031PN0DC device:aurora transport_id:1',
    'emulator-5554          device product:sdk_phone64_x86_64 model:Pixel_10 device:emu64x transport_id:2',
    'emulator-5556          offline transport_id:3',
    '',
  ].join('\n')
  assert.deepEqual(parseAdbDevices(sample), [
    { serial: '127.0.0.1:16384', state: 'device', model: '24031PN0DC' },
    { serial: 'emulator-5554', state: 'device', model: 'Pixel_10' },
  ])
})

test('isPortOpen detects listening and closed local TCP ports', async () => {
  const server = net.createServer((socket) => socket.destroy())
  await new Promise((resolve, reject) => {
    server.once('error', reject)
    server.listen(0, '127.0.0.1', resolve)
  })
  const { port } = server.address()
  try {
    assert.equal(await isPortOpen('127.0.0.1', port), true)
  } finally {
    await new Promise((resolve) => server.close(resolve))
  }
  assert.equal(await isPortOpen('127.0.0.1', port), false)
})
