const path = require('node:path')

const rootDir = path.resolve(__dirname, '../..')

module.exports = {
  rootDir,
  preset: 'react-native',
  roots: ['<rootDir>/packages/ui'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {
        configFile: path.resolve(__dirname, 'babel.config.cjs'),
      },
    ],
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
}
