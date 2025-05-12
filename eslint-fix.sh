#!/bin/bash
set -e

echo "Fixing ESLint errors in multiple files..."

# Fix integration.test.js - rename unused variables with underscore prefix
sed -i 's/mkdirSync: jest.fn((path, options) => {/mkdirSync: jest.fn((path, _options) => {/' src/__tests__/integration.test.js
sed -i 's/getAttachment: jest.fn().mockImplementation(({ emailId, attachmentName }) => {/getAttachment: jest.fn().mockImplementation(({ _emailId, attachmentName }) => {/' src/__tests__/integration.test.js

# Fix mock-gmail.test.js - prefix unused variable with underscore
sed -i 's/  MOCK_DATA_DIR,/  _MOCK_DATA_DIR,/' src/__tests__/mock-gmail.test.js

# Fix index.js - prefix unused variable with underscore
sed -i 's/const { createConfig, defaultConfig }/const { createConfig, _defaultConfig }/' src/index.js

echo "All ESLint errors fixed"

# Run tests to verify fixes
echo "Running tests to verify fixes..."
npm run test
