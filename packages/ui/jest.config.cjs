const path = require('node:path')

const rootDir = path.resolve(__dirname, '../..')

module.exports = {
  rootDir,
  preset: path.dirname(require.resolve('react-native/package.json')),
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
  moduleNameMapper: {
    '^react-native-gesture-handler/ReanimatedSwipeable$':
      '<rootDir>/packages/ui/__mocks__/reanimated-swipeable.tsx',
    '^react-native-popover-view$': '<rootDir>/packages/ui/__mocks__/react-native-popover-view.tsx',
    '^react-native-reanimated$': '<rootDir>/packages/ui/__mocks__/react-native-reanimated.ts',
    '^react-native-safe-area-context$':
      '<rootDir>/packages/ui/__mocks__/react-native-safe-area-context.tsx',
  },
}
