const path = require('node:path')

module.exports = {
  displayName: 'playground',
  rootDir: __dirname,
  preset: '@react-native/jest-preset',
  resolver: 'react-native-reanimated/jest/resolver',
  roots: ['<rootDir>'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {
        configFile: path.resolve(__dirname, 'babel.config.js'),
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(?:((jest-)?react-native|@react-native|react-native-gesture-handler|react-native-popover-view|react-native-reanimated|react-native-worklets|react-native-svg)/|\\.pnpm/))',
    'node_modules/\\.pnpm/(?!(?:((jest-)?react-native|@react-native\\+[^@]+|react-native-gesture-handler|react-native-popover-view|react-native-reanimated|react-native-worklets|react-native-svg)@))',
  ],
  setupFiles: ['<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    '^react-native-teleport$': '<rootDir>/node_modules/react-native-teleport/jest/index.js',
    '^@tsuki-v2/(.*)$': '<rootDir>/../../packages/tsuki/src/$1',
    '^@ftsukic/tsuki/(.*)$': '<rootDir>/../../packages/tsuki/bak/src/$1',
    '^@ftsukic/tsuki$': '<rootDir>/../../packages/tsuki/bak/src',
    '^@/(.*)$': '<rootDir>/$1',
    '^react$': '<rootDir>/node_modules/react',
    '^react/jsx-runtime$': '<rootDir>/node_modules/react/jsx-runtime',
    '^react-native$': '<rootDir>/node_modules/react-native',
    '^react-native-safe-area-context$': '<rootDir>/node_modules/react-native-safe-area-context',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
}
