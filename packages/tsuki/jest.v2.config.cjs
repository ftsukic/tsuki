const path = require('node:path')

module.exports = {
  displayName: 'v2',
  rootDir: __dirname,
  preset: '@react-native/jest-preset',
  resolver: 'react-native-reanimated/jest/resolver',
  roots: ['<rootDir>/src', '<rootDir>/../consumer-fixtures'],
  testMatch: ['**/*.test.ts', '**/*.test.tsx'],
  transform: {
    '^.+\\.(js|jsx|ts|tsx)$': [
      'babel-jest',
      {
        configFile: path.resolve(__dirname, 'babel.config.cjs'),
      },
    ],
  },
  transformIgnorePatterns: [
    'node_modules/(?!(?:((jest-)?react-native|@react-native|react-native-gesture-handler|react-native-reanimated|react-native-worklets|react-native-svg)/|\\.pnpm/))',
    'node_modules/\\.pnpm/(?!(?:((jest-)?react-native|@react-native\\+[^@]+|react-native-gesture-handler|react-native-reanimated|react-native-worklets|react-native-svg)@))',
  ],
  setupFiles: ['<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    '^@ftsukic/tsuki$': '<rootDir>/src',
    '^react$': '<rootDir>/node_modules/react',
    '^react/jsx-runtime$': '<rootDir>/node_modules/react/jsx-runtime',
    '^react-native$': '<rootDir>/node_modules/react-native',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
}
