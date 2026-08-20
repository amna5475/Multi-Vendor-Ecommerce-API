module.exports = {
  testEnvironment: 'node',
  testMatch: ['**/tests/**/*.test.js'],
  setupFiles: ['<rootDir>/tests/setup.js'],
  globalSetup: '<rootDir>/tests/globalSetup.js',
  globalTeardown: '<rootDir>/tests/globalTeardown.js',
  verbose: true,
  forceExit: true,
  detectOpenHandles: true,
  testTimeout: 30000,
  collectCoverageFrom: [
    'services/**/*.js',
    'middleware/**/*.js',
    'helpers/**/*.js',
    'adapters/**/*.js',
    '!**/node_modules/**'
  ]
};
