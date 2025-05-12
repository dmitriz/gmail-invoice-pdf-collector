/**
 * Jest configuration
 */

module.exports = {
  // Test environment (Node.js for CLI applications)
  testEnvironment: 'node',
  
  // Pattern to find test files
  testMatch: ["**/src/**/__tests__/**/*.test.js"],
  
  // Files to include in coverage report
  collectCoverageFrom: ["src/**/*.js", "!src/__tests__/**"],
  
  // Turn on coverage collection
  collectCoverage: true,
  
  // Verbose test output
  verbose: true,
  
  // Resolves modules using Node's module resolution algorithm
  moduleDirectories: ["node_modules"],
  
  // Root directory that Jest should scan for tests and modules 
  rootDir: '.',
  
  // Show test results with colors in terminal
  // colors: true,
  
  // Automatically clear mock calls before every test
  clearMocks: true
};
