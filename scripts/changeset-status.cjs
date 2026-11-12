const fs = require('node:fs')
const path = require('node:path')
const { execSync } = require('node:child_process')

const changesetDirectory = path.resolve(__dirname, '../.changeset')
const hasPendingChangesets = fs
  .readdirSync(changesetDirectory)
  .some((fileName) => fileName.endsWith('.md') && fileName !== 'README.md')

if (!hasPendingChangesets) {
  console.log('No pending changesets.')
  process.exit(0)
}

execSync('pnpm exec changeset status', { stdio: 'inherit' })
