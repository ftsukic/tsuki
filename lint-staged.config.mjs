const excludeArchivedFiles = (filenames) =>
  filenames.filter(
    (filename) => !`/${filename.replaceAll('\\', '/')}`.includes('/packages/tsuki/bak/'),
  )

const quoteFilenames = (filenames) =>
  filenames.map((filename) => `"${filename.replaceAll('\\', '/')}"`).join(' ')

const runOnFiles = (filenames, commands) => {
  const currentFiles = excludeArchivedFiles(filenames)
  if (currentFiles.length === 0) return []

  const quotedFilenames = quoteFilenames(currentFiles)
  return commands.map((command) => `${command} ${quotedFilenames}`)
}

export default {
  '*.{js,jsx,mjs,cjs,ts,tsx}': (filenames) =>
    runOnFiles(filenames, ['eslint --fix', 'prettier --write --ignore-unknown']),
  '*.{json,md,yml,yaml}': (filenames) =>
    runOnFiles(filenames, ['prettier --write --ignore-unknown']),
}
