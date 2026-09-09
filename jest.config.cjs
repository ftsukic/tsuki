const path = require('node:path')

module.exports = {
  rootDir: __dirname,
  preset: 'react-native',
  roots: ['<rootDir>/src'],
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
    'node_modules/(?!((jest-)?react-native|@react-native|react-native-gesture-handler|react-native-reanimated|react-native-worklets)/)',
  ],
  setupFiles: ['<rootDir>/node_modules/react-native-gesture-handler/jestSetup.js'],
  setupFilesAfterEnv: ['<rootDir>/jest.setup.cjs'],
  moduleNameMapper: {
    '^react$': '<rootDir>/node_modules/react',
    '^react/jsx-runtime$': '<rootDir>/node_modules/react/jsx-runtime',
    '^react-native$': '<rootDir>/node_modules/react-native',
    '^react-native-safe-area-context$': '<rootDir>/node_modules/react-native-safe-area-context',
  },
  moduleFileExtensions: ['ts', 'tsx', 'js', 'jsx'],
}
