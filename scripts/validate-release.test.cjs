const assert = require('node:assert/strict')
const { spawnSync } = require('node:child_process')
const fs = require('node:fs')
const os = require('node:os')
const path = require('node:path')
const { test } = require('node:test')

const script = path.join(__dirname, 'validate-release.cjs')

test('release versions select their channel and reject unsupported or mismatched tags', () => {
  const directory = fs.mkdtempSync(path.join(os.tmpdir(), 'tsuki-release-'))
  try {
    for (const [version, tag, expected] of [
      ['0.1.4', 'v0.1.4', 'release_branch=0.x\nnpm_tag=latest\n'],
      ['1.0.0-beta.0', 'v1.0.0-beta.0', 'release_branch=main\nnpm_tag=next\n'],
      ['1.0.0-beta.12', 'v1.0.0-beta.12', 'release_branch=main\nnpm_tag=next\n'],
      ['0.1.4', 'v0.1.5', null],
      ['1.0.0-beta.0', 'v1.0.0', null],
      ['1.0.0', 'v1.0.0', null],
      ['0.2.0-beta.0', 'v0.2.0-beta.0', null],
      ['1.0.0-beta.01', 'v1.0.0-beta.01', null],
      ['1.0.0-rc.0', 'v1.0.0-rc.0', null],
    ]) {
      fs.writeFileSync(
        path.join(directory, 'package.json'),
        JSON.stringify({ name: '@ftsukic/tsuki', version }),
      )
      const output = path.join(directory, 'output')
      fs.writeFileSync(output, '')
      const result = spawnSync(process.execPath, [script], {
        cwd: directory,
        env: { ...process.env, GITHUB_REF_NAME: tag, GITHUB_OUTPUT: output },
        encoding: 'utf8',
      })
      assert.equal(result.status, expected === null ? 1 : 0, result.stderr)
      assert.equal(fs.readFileSync(output, 'utf8'), expected ?? '')
    }
  } finally {
    fs.rmSync(directory, { recursive: true, force: true })
  }
})
