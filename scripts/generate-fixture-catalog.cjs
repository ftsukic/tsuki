const fs = require('node:fs')
const path = require('node:path')
const prettier = require('prettier')
const ts = require('../packages/tsuki/node_modules/typescript')
const { categories, entries } = require('../apps/playground/fixtures/manifest.json')

const root = path.resolve(__dirname, '..')
const fixtureDirectory = path.join(root, 'apps/playground/fixtures')
const outputPath = path.join(fixtureDirectory, 'catalog.ts')
const sources = { v1: 'packages/tsuki/bak/src', v2: 'packages/tsuki/src' }

// These files were already outside their Overview in the frozen v1 archive.
const archivedOrphans = {
  cell: ['disabled', 'extra', 'theme'],
  'image-preview': ['navigation', 'preview-toolbar'],
  portal: ['controlled-input'],
}

function assert(condition, message) {
  if (!condition) throw new Error(message)
}

function toPosix(value) {
  return value.split(path.sep).join('/')
}

function readSource(file) {
  return ts.createSourceFile(file, fs.readFileSync(file, 'utf8'), ts.ScriptTarget.Latest, true)
}

function readImports(source) {
  const imports = []
  function visit(node) {
    if (ts.isImportDeclaration(node) || ts.isExportDeclaration(node)) {
      if (node.moduleSpecifier) imports.push(node.moduleSpecifier.text)
    }
    if (
      ts.isCallExpression(node) &&
      (node.expression.kind === ts.SyntaxKind.ImportKeyword ||
        (ts.isIdentifier(node.expression) && node.expression.text === 'require'))
    ) {
      const [specifier] = node.arguments
      assert(
        specifier && ts.isStringLiteral(specifier),
        source.fileName + ': expected a static import.',
      )
      imports.push(specifier.text)
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return imports
}

function isPublicImport(specifier) {
  return (
    !specifier.startsWith('.') &&
    !path.isAbsolute(specifier) &&
    !specifier.startsWith('@/') &&
    !specifier.startsWith('@ftsukic/tsuki/') &&
    !specifier.includes('packages/tsuki/') &&
    !specifier.includes('bak/src')
  )
}

function validateFixture(entry) {
  const overviewPath = path.join(root, entry.fixturePath)
  assert(fs.existsSync(overviewPath), entry.id + ': missing Overview at ' + entry.fixturePath)
  const fixtureRoot = path.dirname(overviewPath)
  const files = fs
    .readdirSync(path.join(fixtureRoot, 'examples'), { recursive: true })
    .filter((file) => file.endsWith('.tsx'))
    .map((file) => toPosix(file).slice(0, -4))
    .sort()
  assert(files.length, entry.id + ': no examples.')
  const overview = readSource(overviewPath)
  const imports = readImports(overview)
  const examples = imports.filter((name) => name.startsWith('./examples/'))
  const referenced = new Set(examples.map((name) => name.slice('./examples/'.length)))
  for (const name of referenced) {
    assert(files.includes(name), entry.id + ': Overview imports missing example ' + name)
  }

  const orphans = entry.version === 'v1' ? (archivedOrphans[entry.component] ?? []) : []
  for (const name of files) {
    assert(referenced.has(name) || orphans.includes(name), entry.id + ': unused example ' + name)
  }

  if (entry.version === 'v1') return

  assert(
    fs.readdirSync(fixtureRoot).every((name) => name === 'overview.tsx' || name === 'examples'),
    entry.id + ': keep the Overview and examples in their canonical locations.',
  )
  const rendered = new Set()
  function visit(node) {
    if (ts.isJsxSelfClosingElement(node) || ts.isJsxOpeningElement(node)) {
      rendered.add(node.tagName.getText(overview))
    }
    ts.forEachChild(node, visit)
  }
  visit(overview)
  for (const statement of overview.statements) {
    if (
      ts.isImportDeclaration(statement) &&
      statement.moduleSpecifier.text.startsWith('./examples/')
    ) {
      const binding = statement.importClause?.name?.text
      assert(rendered.has(binding), entry.id + ': render ' + statement.moduleSpecifier.text)
    }
  }
  assert(
    imports.every((name) => isPublicImport(name) || examples.includes(name)),
    entry.id + ': use public imports in the Overview.',
  )
  for (const name of files) {
    const file = path.join(fixtureRoot, 'examples', name + '.tsx')
    assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(name), name + ': expected a kebab-case filename.')
    const source = readSource(file)
    assert(/@title\s+\S/.test(source.text), name + ': missing @title.')
    assert(/@description\s+\S/.test(source.text), name + ': missing @description.')
    assert(
      source.statements.some(
        (statement) =>
          ts.isFunctionDeclaration(statement) &&
          /^[A-Z][A-Za-z0-9]*$/.test(statement.name?.text ?? '') &&
          statement.modifiers?.some((modifier) => modifier.kind === ts.SyntaxKind.DefaultKeyword),
      ),
      name + ': default export a PascalCase example function.',
    )
    assert(
      readImports(source).every(isPublicImport),
      name + ': examples must use the public Tsuki entry point.',
    )
  }
}

function validateManifest() {
  assert(new Set(categories).size === categories.length, 'Duplicate category.')
  const ids = new Set()
  const positions = new Set()
  const fixturePaths = new Set()
  for (const entry of entries) {
    const { id, component, title, description, version, category, order, fixturePath } = entry
    assert(Object.hasOwn(sources, version), id + ': unknown version.')
    assert(/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(component), id + ': invalid component.')
    assert(id === (version === 'v2' ? component + '-v2' : component), id + ': invalid version ID.')
    assert(!ids.has(id), 'Duplicate fixture ID: ' + id)
    ids.add(id)
    assert(
      categories.includes(category) && (version === 'v2') === (category === 'Tsuki v2'),
      id + ': invalid category.',
    )
    assert(Number.isInteger(order) && order >= 0, id + ': invalid order.')
    const position = category + ':' + order
    assert(!positions.has(position), 'Duplicate category order: ' + position)
    positions.add(position)
    assert(title?.trim() && description?.trim(), id + ': supply a title and description.')
    assert(
      fixturePath === sources[version] + '/' + component + '/__fixtures__/overview.tsx',
      id + ': fixture path does not match the version and component.',
    )
    fixturePaths.add(fixturePath)
    validateFixture(entry)
  }

  for (const category of categories) {
    assert(
      entries.some((entry) => entry.category === category),
      'Empty category: ' + category,
    )
  }
  const publicEntry = readSource(path.join(root, sources.v2, 'index.ts'))
  for (const specifier of readImports(publicEntry)) {
    const component = specifier.slice(2)
    const implementation = path.join(root, sources.v2, component, component + '.tsx')
    if (specifier.startsWith('./') && component !== 'theme' && fs.existsSync(implementation)) {
      assert(ids.has(component + '-v2'), 'Missing public component fixture: ' + component)
    }
  }
  for (const source of Object.values(sources)) {
    for (const component of fs.readdirSync(path.join(root, source))) {
      const fixtureRoot = source + '/' + component + '/__fixtures__'
      if (fs.existsSync(path.join(root, fixtureRoot))) {
        assert(
          fixturePaths.has(fixtureRoot + '/overview.tsx'),
          'Unregistered fixture: ' + fixtureRoot,
        )
      }
    }
  }
}

function quote(value) {
  return "'" + value.replace(/\\/g, '\\\\').replace(/'/g, "\\'").replace(/\r?\n/g, '\\n') + "'"
}

function renderCatalog() {
  const sorted = entries.toSorted(
    (left, right) =>
      categories.indexOf(left.category) - categories.indexOf(right.category) ||
      left.order - right.order,
  )
  const imports = []
  const v2Previews = []
  const rows = []
  for (const [index, entry] of sorted.entries()) {
    const name = 'Overview' + index
    const { fixturePath, order, ...metadata } = entry
    const specifier = toPosix(path.relative(fixtureDirectory, path.join(root, fixturePath))).slice(
      0,
      -4,
    )
    if (entry.version === 'v1') {
      imports.push('import ' + name + ' from ' + quote(specifier))
    } else {
      v2Previews.push(
        '// eslint-disable-next-line ts/no-require-imports\n' +
          'const ' +
          name +
          ' = require(' +
          quote(specifier) +
          ').default as ComponentType',
      )
    }
    rows.push(
      [
        '  {',
        '    Component: ' + name + ',',
        ...Object.entries(metadata).map(([key, value]) => '    ' + key + ': ' + quote(value) + ','),
        '  },',
      ].join('\n'),
    )
  }

  return [
    '// This file is generated by scripts/generate-fixture-catalog.cjs.',
    "import type { ComponentType } from 'react'",
    '',
    ...imports,
    '',
    '// Metro resolves these previews from v2. The package fixture project typechecks them.',
    ...v2Previews,
    '',
    "export type FixtureVersion = 'v1' | 'v2'",
    '',
    'export interface ComponentFixtureEntry {',
    '  Component: ComponentType',
    '  id: string',
    '  component: string',
    '  title: string',
    '  description: string',
    '  version: FixtureVersion',
    '  category: string',
    '}',
    '',
    'export const componentCatalog: readonly ComponentFixtureEntry[] = [',
    ...rows,
    ']',
    '',
  ].join('\n')
}

async function main() {
  validateManifest()
  const options = await prettier.resolveConfig(outputPath)
  const output = await prettier.format(renderCatalog(), { ...options, filepath: outputPath })
  const current = fs.existsSync(outputPath)
    ? fs.readFileSync(outputPath, 'utf8').replace(/\r\n/g, '\n')
    : null
  if (process.argv.includes('--check')) {
    assert(current === output, 'Fixture catalog is stale. Run pnpm run fixtures:generate.')
    console.log('Verified ' + entries.length + ' component fixtures.')
  } else {
    if (current !== output) fs.writeFileSync(outputPath, output)
    console.log('Generated ' + entries.length + ' component fixtures.')
  }
}

main().catch((error) => {
  console.error(error.message)
  process.exitCode = 1
})
