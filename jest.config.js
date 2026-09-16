module.exports = {
  preset: '@react-native/jest-preset',
  watchman: false,
  testPathIgnorePatterns: ['/node_modules/', '/e2e/'],
  transformIgnorePatterns: [
    'node_modules/(?!((@react-native|react-native|@react-navigation|@react-native-vector-icons|@react-native-async-storage)/))',
  ],
  moduleNameMapper: {
    '\\.(ttf)$': '<rootDir>/__mocks__/fileMock.js',
  },
};
