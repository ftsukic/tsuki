const { execFileSync } = require('node:child_process')

const packageName = '@ftsukic/tsuki'
const version = process.argv[2]

if (!version) {
  throw new Error('A package version is required')
}

try {
  const publishedVersion = execFileSync('npm', ['view', `${packageName}@${version}`, 'version'], {
    encoding: 'utf8',
    stdio: ['ignore', 'pipe', 'pipe'],
  }).trim()

  if (publishedVersion === version) {
    console.error(`Refusing to republish existing npm version: ${version}`)
    process.exit(1)
  }

  throw new Error(`Unexpected registry response for ${packageName}@${version}: ${publishedVersion}`)
} catch (error) {
  if (error.code === 'ERR_CHILD_PROCESS_STDIO_MAXBUFFER') {
    throw error
  }

  const stderr = String(error.stderr ?? '')
  if (error.status !== 1 || !/(E404|404 Not Found|is not in this registry)/i.test(stderr)) {
    throw new Error(
      `Unable to verify registry version ${version}: ${stderr.trim() || error.message}`,
    )
  }
}

console.log(`Registry version not found; safe to publish ${packageName}@${version}`)
