const { spawn, execFileSync } = require('node:child_process')
const fs = require('node:fs')
const net = require('node:net')
const os = require('node:os')
const path = require('node:path')
const { createHash } = require('node:crypto')

function adb(args, options = {}) {
  return execFileSync('adb', args, { timeout: 15000, ...options })
}

const root = path.resolve(__dirname, '..')
const projects = [
  { name: 'Tsuki', directory: 'playground', port: 18761 },
  { name: 'NW4', directory: 'playground-nw4', port: 18762 },
  { name: 'NW5', directory: 'playground-nw5', port: 18763 },
]

function fileHash(file) {
  return createHash('sha256').update(fs.readFileSync(file)).digest('hex')
}

function nativeFingerprint(cwd, abi) {
  const hash = createHash('sha256').update(abi)
  const excluded = new Set(['build', '.gradle', '.cxx', '.kotlin', 'node_modules'])
  function include(file, name) {
    if (!fs.existsSync(file)) return
    const stat = fs.lstatSync(file)
    if (stat.isSymbolicLink()) return
    if (stat.isDirectory()) {
      for (const entry of fs.readdirSync(file).sort()) {
        if (!excluded.has(entry)) include(path.join(file, entry), name + '/' + entry)
      }
    } else hash.update(name).update('\0').update(fs.readFileSync(file)).update('\0')
  }
  for (const name of ['app.json', 'package.json', 'plugins', 'assets', 'android'])
    include(path.join(cwd, name), name)
  include(path.join(root, 'pnpm-lock.yaml'), 'pnpm-lock.yaml')
  return hash.digest('hex')
}

async function checkPorts(selected = projects) {
  const failures = []
  for (const project of selected) {
    // Windows can allow a wildcard bind over an existing loopback listener.
    const addresses = new Set([
      '127.0.0.1',
      '::1',
      ...Object.values(os.networkInterfaces())
        .flat()
        .filter((entry) => entry && !entry.scopeid)
        .map((entry) => entry.address),
    ])
    await Promise.all(
      [...addresses].map(
        (host) =>
          new Promise((resolve) => {
            const socket = net.createConnection({ host, port: project.port })
            const finish = () => {
              socket.destroy()
              resolve()
            }
            socket.setTimeout(500, finish)
            socket.once('error', finish)
            socket.once('connect', () => {
              failures.push(
                `[${project.name}] port ${project.port} (${host}): EADDRINUSE: an existing service accepted a connection`,
              )
              finish()
            })
          }),
      ),
    )
    for (const host of ['0.0.0.0', '::']) {
      await new Promise((resolve) => {
        const server = net.createServer()
        server.once('error', (error) => {
          if (error.code !== 'EAFNOSUPPORT') {
            failures.push(
              `[${project.name}] port ${project.port} (${host}): ${error.code}: ${error.message}`,
            )
          }
          resolve()
        })
        server.listen({ port: project.port, host, exclusive: true }, () => server.close(resolve))
      })
    }
  }
  if (failures.length)
    throw new Error(failures.join('\n') + '\nStopped; no alternate ports will be used.')
}

function expoCli(cwd) {
  return require.resolve('expo/bin/cli', { paths: [cwd] })
}

function run(command, args, cwd, env = process.env) {
  return new Promise((resolve, reject) => {
    // Piped output makes Expo non-interactive without CI, which disables Fast Refresh.
    const child = spawn(command, args, { cwd, env, stdio: ['ignore', 'pipe', 'pipe'] })
    child.stdout.pipe(process.stdout)
    child.stderr.pipe(process.stderr)
    let skippedServer = false
    let interrupted = false
    child.stdout.on('data', (data) => {
      if (data.toString().includes('Skipping dev server')) skippedServer = true
    })
    const stop = () => {
      interrupted = true
      if (process.platform === 'win32') {
        spawn('taskkill', ['/pid', String(child.pid), '/T', '/F'], { stdio: 'ignore' })
      } else {
        child.kill('SIGINT')
      }
    }
    process.once('SIGINT', stop)
    process.once('SIGTERM', stop)
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      process.removeListener('SIGINT', stop)
      process.removeListener('SIGTERM', stop)
      if (interrupted)
        reject(Object.assign(new Error('Stopped by signal'), { code: 'INTERRUPTED' }))
      else if (code === 0 && !skippedServer) resolve()
      else
        reject(
          new Error(
            `${command} failed (${signal || code}); fixed-port server skipped: ${skippedServer}`,
          ),
        )
    })
  })
}

const defaultMuMuPort = Number(process.env.MUMU_ADB_PORT || 16384)

function isPortOpen(host, port, timeout = 250) {
  return new Promise((resolve) => {
    const socket = net.createConnection({ host, port })
    const finish = (open) => {
      socket.destroy()
      resolve(open)
    }
    socket.setTimeout(timeout, () => finish(false))
    socket.once('error', () => finish(false))
    socket.once('connect', () => finish(true))
  })
}

async function ensureAndroidDeviceConnected() {
  const mumuOpen = await isPortOpen('127.0.0.1', defaultMuMuPort)
  const adbEnv = mumuOpen ? { ...process.env, ADB_LOCAL_TRANSPORT_MAX_PORT: '5553' } : process.env
  const target = `127.0.0.1:${defaultMuMuPort}`

  if (mumuOpen) {
    let devices = parseAdbDevices(adb(['devices', '-l'], { encoding: 'utf8', env: adbEnv }))
    if (devices.some(({ serial }) => serial.startsWith('emulator-'))) {
      // Restart ADB with local transport scanning capped at 5553 so MuMu's 5555
      // (and other non-AVD emulators on 5557+) do not appear as emulator-5554/5556.
      try {
        adb(['kill-server'], { encoding: 'utf8', env: adbEnv })
      } catch {
        /* Server may already be stopped. */
      }
      adb(['start-server'], { encoding: 'utf8', env: adbEnv })
      devices = []
    }
    if (!devices.some(({ serial }) => serial === target)) {
      adb(['connect', target], { encoding: 'utf8', env: adbEnv })
      console.log(`Connected MuMu emulator via ADB: ${target}`)
      devices = parseAdbDevices(adb(['devices', '-l'], { encoding: 'utf8', env: adbEnv }))
    }
    return { devices, env: adbEnv }
  }

  return {
    devices: parseAdbDevices(adb(['devices', '-l'], { encoding: 'utf8', env: adbEnv })),
    env: adbEnv,
  }
}

function runInteractive(command, args, cwd, env = process.env) {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, { cwd, env, stdio: 'inherit' })
    child.once('error', reject)
    child.once('exit', (code, signal) => {
      if (code === 0) resolve()
      else reject(new Error(`${command} failed (${signal || code})`))
    })
  })
}

function parseAdbDevices(output) {
  return output
    .split(/\r?\n/)
    .slice(1)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [serial, state, ...details] = line.split(/\s+/)
      const modelToken = details.find((entry) => entry.startsWith('model:'))
      const model = modelToken ? modelToken.slice('model:'.length) : undefined
      return { serial, state, model }
    })
    .filter(({ serial, state }) => Boolean(serial) && state === 'device')
}

function connectedEmulator(requested) {
  if (requested && !/^(emulator-\d+|[^\s:]+:\d+)$/.test(requested))
    throw new Error(`Connected emulator not found: ${requested}`)
  const output = adb(['devices', '-l'], { encoding: 'utf8' })
  const devices = parseAdbDevices(output)
  if (requested && !devices.some(({ serial }) => serial === requested))
    throw new Error(`Connected emulator not found: ${requested}`)
  if (!requested && devices.length !== 1) {
    throw new Error(
      `Expected one connected emulator; found ${devices.length}. Use --device <adb-serial>.`,
    )
  }
  const target = requested ? devices.find(({ serial }) => serial === requested) : devices[0]
  const name = target.serial.startsWith('emulator-')
    ? adb(['-s', target.serial, 'emu', 'avd', 'name'], { encoding: 'utf8' })
        .split(/\r?\n/)
        .find((line) => line.trim() && line.trim() !== 'OK')
        .trim()
    : target.model || `Device ${target.serial}`
  return { serial: target.serial, name }
}

async function main([action, ...args]) {
  if (action === 'check') return checkPorts()
  if (action === 'prepare') {
    await checkPorts()
    const { devices, env } = await ensureAndroidDeviceConnected()
    for (const { serial } of devices) {
      for (const { port } of projects) {
        adb(['-s', serial, 'reverse', `tcp:${port}`, `tcp:${port}`], { env })
      }
      console.log(`ADB reverse ready on ${serial}: ${projects.map(({ port }) => port).join(', ')}`)
    }
    return
  }
  if (action === 'android') {
    const { devices, env } = await ensureAndroidDeviceConnected()
    const portIndex = args.indexOf('--port')
    const port = portIndex !== -1 ? args[portIndex + 1] : undefined
    if (port && /^\d+$/.test(port)) {
      for (const { serial } of devices) {
        adb(['-s', serial, 'reverse', `tcp:${port}`, `tcp:${port}`], { env })
      }
    }
    return runInteractive(
      process.execPath,
      [expoCli(process.cwd()), 'run:android', ...args],
      process.cwd(),
      {
        ...env,
        EXPO_OFFLINE: env.EXPO_OFFLINE ?? '1',
      },
    )
  }
  if (action === 'start') {
    const project = projects.find(({ directory }) => path.basename(process.cwd()) === directory)
    if (!project) throw new Error('Run start from a Playground directory.')
    if (args.join(' ') !== `--dev-client --port ${project.port}`)
      throw new Error(`Expected --dev-client --port ${project.port}`)
    await checkPorts([project])
    return run(process.execPath, [expoCli(process.cwd()), 'start', ...args], process.cwd(), {
      ...process.env,
      // Local development must not wait for Expo API requests through a host proxy.
      EXPO_OFFLINE: process.env.EXPO_OFFLINE ?? '1',
    })
  }
  if (action === 'install:android') {
    if (args.length && (args.length !== 2 || args[0] !== '--device'))
      throw new Error('Usage: install:android [--device <adb-serial>]')
    if (!args[1]) await ensureAndroidDeviceConnected()
    const device = connectedEmulator(args[1])
    console.log(
      `Installing all three apps on ${device.serial} (${device.name}). Metro will not be started.`,
    )
    for (const project of projects) {
      const cwd = path.join(root, 'apps', project.directory)
      console.log(
        `[${project.name}] Building/installing debug, port ${project.port} (Gradle incremental cache enabled)`,
      )
      try {
        if (project.directory === 'playground')
          await run(process.execPath, [path.join(__dirname, 'generate-fixture-catalog.cjs')], root)
        // Existing prebuild trees are ignored by Git, so keep their display names in sync too.
        const strings = path.join(cwd, 'android/app/src/main/res/values/strings.xml')
        const settings = path.join(cwd, 'android/settings.gradle')
        if (fs.existsSync(strings))
          fs.writeFileSync(
            strings,
            fs
              .readFileSync(strings, 'utf8')
              .replace(/(<string name="app_name">).*?(<\/string>)/, `$1${project.name}$2`),
          )
        if (fs.existsSync(settings))
          fs.writeFileSync(
            settings,
            fs
              .readFileSync(settings, 'utf8')
              .replace(/rootProject.name = '.*?'/, `rootProject.name = '${project.name}'`),
          )
        // Expo 57 rejects --port together with --no-bundler. Bind the dev client
        // to the fixed Metro URL explicitly after installing instead.
        const abi = adb(['-s', device.serial, 'shell', 'getprop', 'ro.product.cpu.abi'], {
          encoding: 'utf8',
        }).trim()
        const fingerprint = nativeFingerprint(cwd, abi)
        const binary = path.join(cwd, 'android/app/build/outputs/apk/debug/app-debug.apk')
        const cacheFile = path.join(cwd, '.expo/playgrounds-android.json')
        let cache
        try {
          cache = JSON.parse(fs.readFileSync(cacheFile, 'utf8'))
        } catch {
          /* Missing or invalid cache requires a build. */
        }
        const reuse =
          cache?.fingerprint === fingerprint &&
          fs.existsSync(binary) &&
          cache.apkHash === fileHash(binary)
        console.log(
          `[${project.name}] ${reuse ? 'Native inputs unchanged; reusing APK without a build' : 'Native inputs changed or no verified APK; building'}`,
        )
        await run(
          process.execPath,
          [
            expoCli(cwd),
            'run:android',
            '--no-bundler',
            '--no-install',
            '--device',
            device.name,
            ...(reuse ? ['--binary', binary] : []),
          ],
          cwd,
          {
            ...process.env,
            ANDROID_SERIAL: device.serial,
            EXPO_OFFLINE: process.env.EXPO_OFFLINE ?? '1',
          },
        )
        fs.mkdirSync(path.dirname(cacheFile), { recursive: true })
        fs.writeFileSync(
          cacheFile,
          JSON.stringify({ fingerprint: nativeFingerprint(cwd, abi), apkHash: fileHash(binary) }) +
            '\n',
        )
        const { expo } = JSON.parse(fs.readFileSync(path.join(cwd, 'app.json'), 'utf8'))
        const url = `${expo.scheme}://expo-development-client/?url=${encodeURIComponent(`http://127.0.0.1:${project.port}`)}&disableOnboarding=1&disableFab=1&disableAutoLaunch=1`
        adb(['-s', device.serial, 'reverse', `tcp:${project.port}`, `tcp:${project.port}`])
        adb(
          [
            '-s',
            device.serial,
            'shell',
            'am',
            'start',
            '-a',
            'android.intent.action.VIEW',
            '-d',
            `'${url}'`,
            expo.android.package,
          ],
          { stdio: 'inherit' },
        )
      } catch (error) {
        if (error.code === 'INTERRUPTED') throw error
        throw new Error(`[${project.name}] Android install stopped: ${error.message}`)
      }
    }
  } else throw new Error('Expected check, prepare, start, android, or install:android')
}

if (require.main === module)
  main(process.argv.slice(2)).catch((error) => {
    if (error.code !== 'INTERRUPTED') console.error(error.message)
    process.exitCode = error.code === 'INTERRUPTED' ? 130 : 1
  })

module.exports = { checkPorts, projects, nativeFingerprint, fileHash, parseAdbDevices, isPortOpen }
