/**
 * Script to verify npm script configurations
 */
const fs = require('fs');
const path = require('path');

// Read the package.json file
const packageJsonPath = path.join(__dirname, 'package.json');
const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf-8'));

// Check the npm start script
console.log('Checking npm script configurations:');
console.log('----------------------------------');

if (!packageJson.scripts) {
  console.error('❌ No scripts section found in package.json');
  process.exit(1);
}

console.log('start:      ', packageJson.scripts.start);
console.log('start:mock: ', packageJson.scripts['start:mock']);
console.log('test:       ', packageJson.scripts.test);
console.log('test:unit:  ', packageJson.scripts['test:unit']);
console.log('----------------------------------');

// Verify that the start script does NOT include the test mode flag (runs in real mode)
if (packageJson.scripts.start && !packageJson.scripts.start.includes('--test-mode')) {
  console.log('✅ npm start correctly runs in REAL mode (no test flag)');
} else {
  console.log('❌ npm start script is missing or incorrectly includes test mode flag');
}

// Verify that start:mock includes the test mode flag
if (packageJson.scripts['start:mock'] && packageJson.scripts['start:mock'].includes('--test-mode')) {
  console.log('✅ npm run start:mock correctly runs in MOCK mode (with test flag)');
} else {
  console.log('❌ npm run start:mock does not exist or doesn\'t use test mode flag');
}

// Verify that dev script references start:mock
// Verify that dev script references start:mock
if (packageJson.scripts?.dev?.includes('start:mock')) {
  console.log('✅ npm run dev correctly references start:mock');
} else {
  console.log('❌ npm run dev does not reference start:mock');
}

console.log('\nVerification complete.');
