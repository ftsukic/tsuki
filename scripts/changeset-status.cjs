const fs = require('node:fs')
const path = require('node:path')
const { execFileSync } = require('node:child_process')

const changesetDirectory = path.resolve(__dirname, '../.changeset')
const hasPendingChangesets = fs
  .readdirSync(changesetDirectory)
  .some((fileName) => fileName.endsWith('.md') && fileName !== 'README.md')

if (!hasPendingChangesets) {
  console.log('No pending changesets.')
  process.exit(0)
}

const yarnCommand = process.platform === 'win32' ? 'yarn.cmd' : 'yarn'
execFileSync(yarnCommand, ['changeset', 'status'], { stdio: 'inherit' })
