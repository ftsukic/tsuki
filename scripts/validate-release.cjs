const fs = require('node:fs')

const packageJson = JSON.parse(fs.readFileSync('package.json', 'utf8'))
const tag = process.env.GITHUB_REF_NAME
const stableMaintenance = /^0\.(0|[1-9]\d*)\.(0|[1-9]\d*)$/
const beta = /^[1-9]\d*\.(0|[1-9]\d*)\.(0|[1-9]\d*)-beta\.(0|[1-9]\d*)$/
const isMaintenance = stableMaintenance.test(packageJson.version)
const isBeta = beta.test(packageJson.version)

if (packageJson.name !== '@ftsukic/tsuki') {
  throw new Error(`Unexpected package name: ${packageJson.name}`)
}

if (!isMaintenance && !isBeta) {
  throw new Error(`Expected stable 0.x or major beta version: ${packageJson.version}`)
}

if (tag !== `v${packageJson.version}`) {
  throw new Error(`Release tag ${tag} does not match package version ${packageJson.version}`)
}

console.log(`name: ${packageJson.name}`)
console.log(`version: ${packageJson.version}`)
console.log(`tag: ${tag}`)

const releaseBranch = isMaintenance ? '0.x' : 'main'
const npmTag = isMaintenance ? 'latest' : 'next'
console.log(`release branch: ${releaseBranch}`)
console.log(`npm tag: ${npmTag}`)
if (process.env.GITHUB_OUTPUT) {
  fs.appendFileSync(
    process.env.GITHUB_OUTPUT,
    `release_branch=${releaseBranch}\nnpm_tag=${npmTag}\n`,
  )
}
