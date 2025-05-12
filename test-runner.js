#!/usr/bin/env node

/**
 * Test runner script
 * 
 * This file acts as a wrapper for running tests and diagnostic information
 * about the test environment.
 */

const { execSync } = require('child_process');
const path = require('path');
const fs = require('fs');

// Configuration
const workingDirectory = path.resolve(__dirname);
const testsDir = path.join(workingDirectory, 'src', '__tests__');

// Output helpful information
console.log('== Test Environment Information ==');
console.log('Working directory:', workingDirectory);
console.log('Node version:', process.version);
console.log('Available test files:');
try {
  const testFiles = fs.readdirSync(testsDir).filter(file => file.endsWith('.test.js'));
  testFiles.forEach(file => console.log(`- ${file}`));
} catch (error) {
  console.error('Error reading test files:', error.message);
}

console.log('\n== Running Tests ==');
try {
  console.log('Running Jest tests...');
  execSync('npm test', { stdio: 'inherit' });
  
  console.log('\nTests completed successfully!');
} catch (error) {
  console.error('\nTest run failed:', error.message);
  process.exit(1);
}
