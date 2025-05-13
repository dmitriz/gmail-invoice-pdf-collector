#!/bin/bash
# Script to set up the new pdf-utils repository

# Clone the newly created repository
git clone https://github.com/dmitriz/pdf-utils.git
cd pdf-utils

# Create the basic directory structure
mkdir -p src tests .github/workflows

# Copy files from the original project
cp ../gmail-invoice-pdf-collector/docs/pdf-utils-package.json ./package.json
cp ../gmail-invoice-pdf-collector/docs/pdf-utils-readme.md ./README.md
cp ../gmail-invoice-pdf-collector/src/utils/pdf-utils.js ./src/
cp ../gmail-invoice-pdf-collector/src/__tests__/pdf-utils.test.js ./tests/
cp ../gmail-invoice-pdf-collector/docs/pdf-utils-index.js ./src/index.js

# Set up Jest configuration
echo '{
  "testEnvironment": "node",
  "collectCoverage": true,
  "coverageReporters": ["text", "lcov"],
  "testMatch": [
    "**/tests/**/*.test.js"
  ]
}' > jest.config.js

# Set up GitHub Actions workflow for testing
mkdir -p .github/workflows
echo 'name: Tests

on:
  push:
    branches: [ main ]
  pull_request:
    branches: [ main ]

jobs:
  test:
    runs-on: ubuntu-latest
    strategy:
      matrix:
        node-version: [14.x, 16.x, 18.x]
    steps:
    - uses: actions/checkout@v3
    - name: Use Node.js ${{ matrix.node-version }}
      uses: actions/setup-node@v3
      with:
        node-version: ${{ matrix.node-version }}
    - run: npm ci
    - run: npm test
' > .github/workflows/test.yml

# Initialize the repository and install dependencies
npm init -y
npm install --save pdf-lib
npm install --save-dev jest

# Update the package.json with repository details
sed -i 's/"repository": {/"repository": {"type": "git", "url": "https:\/\/github.com\/dmitriz\/pdf-utils.git"/g' package.json
sed -i 's/"name": "pdf-utils",/"name": "pdf-utils", "homepage": "https:\/\/github.com\/dmitriz\/pdf-utils",/g' package.json

# Add files to git
git add .
git commit -m "Initial commit with extracted PDF utilities"

echo "Repository setup complete! Next steps:"
echo "1. Review and update package.json"
echo "2. Update paths in tests to work with the new structure"
echo "3. Push to GitHub: git push origin main"
