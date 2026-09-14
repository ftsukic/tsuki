const fs = require('node:fs')

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const tag = process.env.GITHUB_REF_NAME
const stableSemver = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/

if (packageJson.name !== '@ftsukic/tsuki') {
  throw new Error(`Unexpected package name: ${packageJson.name}`)
}

if (!stableSemver.test(packageJson.version)) {
  throw new Error(`Package version must be stable x.y.z: ${packageJson.version}`)
}

if (tag !== `v${packageJson.version}`) {
  throw new Error(`Release tag ${tag} does not match package version ${packageJson.version}`)
}

console.log(`name: ${packageJson.name}`)
console.log(`version: ${packageJson.version}`)
console.log(`tag: ${tag}`)
