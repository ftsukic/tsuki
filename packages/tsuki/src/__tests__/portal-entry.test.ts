import fs from 'node:fs'
import path from 'node:path'
import ts from 'typescript'

// Follow runtime imports as a bundler does, including literal require calls.
function dependencies(entry: string, visited = new Set<string>()) {
  if (visited.has(entry)) return visited
  visited.add(entry)
  const source = ts.createSourceFile(entry, fs.readFileSync(entry, 'utf8'), ts.ScriptTarget.Latest)
  function visit(node: ts.Node) {
    let specifier: string | undefined
    if (
      (ts.isImportDeclaration(node) && !node.importClause?.isTypeOnly) ||
      (ts.isExportDeclaration(node) && !node.isTypeOnly)
    ) {
      if (node.moduleSpecifier && ts.isStringLiteral(node.moduleSpecifier)) {
        specifier = node.moduleSpecifier.text
      }
    } else if (
      ts.isCallExpression(node) &&
      ts.isIdentifier(node.expression) &&
      node.expression.text === 'require' &&
      node.arguments[0] &&
      ts.isStringLiteral(node.arguments[0])
    ) {
      specifier = node.arguments[0].text
    }
    if (specifier?.startsWith('.')) {
      const base = path.resolve(path.dirname(entry), specifier)
      const target = ['.ts', '.tsx', '/index.ts', '/index.tsx']
        .map((suffix) => base + suffix)
        .find((candidate) => fs.existsSync(candidate))
      if (!target) throw new Error(`Unresolved source dependency: ${specifier} in ${entry}`)
      dependencies(target, visited)
    } else if (specifier) {
      visited.add(specifier)
    }
    ts.forEachChild(node, visit)
  }
  visit(source)
  return visited
}

it('uses Teleport in the package runtime and removes the optional backend entry', () => {
  expect(dependencies(path.resolve(__dirname, '../index.ts')).has('react-native-teleport')).toBe(
    true,
  )
  const manifest = JSON.parse(
    fs.readFileSync(path.resolve(__dirname, '../../package.json'), 'utf8'),
  )
  expect(manifest.exports['./teleport']).toBeUndefined()
})
