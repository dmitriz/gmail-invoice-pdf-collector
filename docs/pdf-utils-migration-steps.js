/**
 * PDF Utilities Migration Steps
 * 
 * This file details the specific changes needed to migrate from the embedded PDF utilities
 * to the new extracted npm package from https://github.com/dmitriz/pdf-utils
 */

// STEP 1: Install the new package
// npm install pdf-utils

// STEP 2: Update imports in src/invoice-collector.js
// FROM:
const { savePdf, mergePdfs, ensureDirectoryExists } = require('./utils/pdf-utils');

// TO:
const { savePdf, mergePdfs, ensureDirectoryExists } = require('pdf-utils');
const pdfUtils = require('pdf-utils');

// STEP 3: Configure the package (in src/invoice-collector.js)
// Add this after the imports:
pdfUtils.configure({
  baseDir: path.resolve(__dirname, '..'),
  allowOutsideBaseDir: false,
  createDirsIfMissing: true
});

// STEP 4: Update tests
// In src/__tests__/invoice-collector.test.js, change:
jest.mock('../utils/pdf-utils', () => {
  const originalModule = jest.requireActual('../utils/pdf-utils');
  return {
    ...originalModule,
    savePdf: jest.fn(), // Mock savePdf
  };
});

// TO:
jest.mock('pdf-utils', () => {
  return {
    savePdf: jest.fn().mockResolvedValue({ success: true, path: 'mock/output/path.pdf' }),
    mergePdfs: jest.fn().mockResolvedValue({ success: true }),
    ensureDirectoryExists: jest.fn().mockReturnValue({ success: true }),
    configure: jest.fn(),
    DEFAULT_OUTPUT_DIR: '/mock/output',
    PDF_DIR: '/mock/output/pdfs'
  };
});

// STEP 5: Remove unnecessary files
// - Delete src/utils/pdf-utils.js
// - Delete src/__tests__/pdf-utils.test.js

// STEP 6: Update package.json
// Add the new dependency:
// "pdf-utils": "^1.0.0"
