# PDF Utilities Extraction Plan

## Overview

This document outlines the plan to extract the PDF utilities functionality from the Gmail Invoice PDF Collector project into a separate, standalone repository. This will make the PDF handling capabilities more reusable and maintainable, while also simplifying the main project.

## Goals

- Extract all PDF-related functionality into a dedicated repository
- Package the extracted code as an npm package for easy installation
- Update the main project to use the extracted package as a dependency
- Ensure all tests pass in both repositories
- Maintain or improve code coverage
- Create a flexible and extensible PDF utilities API
- Eliminate the recurring test failures in the GitHub Actions workflow

## Files to Extract

### Core files

- `/src/utils/pdf-utils.js` - Primary file containing PDF functionality

### Test files

- `/src/__tests__/pdf-utils.test.js` - Tests for PDF utilities

## Dependencies to Transfer

Based on the PDF utilities code, we'll need to identify and transfer these dependencies:

- `pdf-lib` - For PDF manipulation (version ^1.17.1 as used in the original project)
- `fs` and `path` - Node.js core modules for file system operations

## Step-by-Step Plan

### Phase 1: Preparation and Analysis

1. **Analyze the current implementation**
   - Review `/src/utils/pdf-utils.js` to understand all functionality
   - Identify all dependencies and imported modules
   - Map out function relationships and dependencies
   - Review `/src/__tests__/pdf-utils.test.js` to understand test coverage

2. **Create new repository structure**
   - Initialize a new GitHub repository named `pdf-utils`
   - Set up basic npm package structure with `package.json`
   - Set up testing framework (Jest, as used in the original project)
   - Set up CI/CD workflows

### Phase 2: Code Extraction and Package Creation

1. **Extract PDF utilities code**
   - Copy `pdf-utils.js` to the new repository's `src/` directory
   - Create a new `src/index.js` file to export the API
   - Create a `src/constants.js` file for configuration constants
   - Address the path handling for `DEFAULT_OUTPUT_DIR` and `PDF_DIR`
   - Refactor the security check in `savePdf` to be more flexible
   - Make the API more configurable with options

2. **Extract and adapt tests**
   - Copy `pdf-utils.test.js` to the new repository's `tests/` directory
   - Update mocks to work independently of the original codebase
   - Fix the path resolution issues that cause test failures in CI
   - Implement more comprehensive test cases for edge conditions
   - Ensure tests are deterministic and reliable

3. **Package configuration**
   - Create a proper `index.js` that exports a clean, well-documented API
   - Set up semantic versioning starting at 1.0.0
   - Configure `package.json` with appropriate metadata, dependencies, and scripts
   - Create a comprehensive README with installation instructions and API documentation
   - Add TypeScript type definitions for better IDE support

### Phase 3: Integration and Deployment

1. **Publish the package**
   - Create a GitHub repository and configure GitHub Packages
   - Set up the initial npm package release process
   - Create CI/CD workflows for automated testing and publishing
   - Publish version 1.0.0 to npm or GitHub Packages

2. **Update the main project**
   - Add the new package as a dependency in `package.json`
   - Update import statements to use the new package
   - Replace all `require('./utils/pdf-utils')` references with the new package
   - Handle any path-related configuration differences

3. **Testing and verification**
   - Create integration tests specifically for the new package
   - Run all existing tests to verify functionality is preserved
   - Verify that the PDF merging functionality works as expected
   - Check for any performance changes

### Phase 4: Cleanup and Documentation

1. **Clean up the main project**
   - Remove the `/src/utils/pdf-utils.js` file from the main project
   - Remove the `/src/__tests__/pdf-utils.test.js` file from the main project
   - Update the main project's documentation to reflect the new architecture
   - Update CI/CD workflows to remove any redundant tests for PDF utilities

2. **Final documentation**
    - Create comprehensive API documentation in the new repository
    - Document common usage patterns and examples
    - Create a migration guide for other projects that might use the package
    - Document the testing approach and how to contribute

## Risk Mitigation

- **Versioning**: Use semantic versioning for the new package to prevent breaking changes
- **Testing**: Maintain or improve test coverage in the extracted package
- **Integration testing**: Create specific tests to verify the integration between the main project and the new package
- **Rollback plan**: Keep the original code in the main repository until the integration is fully verified

## Timeline

- Phase 1: 1-2 days
- Phase 2: 2-3 days
- Phase 3: 1-2 days
- Phase 4: 1 day
- **Total estimated time**: 5-8 days

## New Package Structure

The new repository will have the following structure:

```plaintext
pdf-utils/
├── .github/
│   └── workflows/
│       ├── test.yml
│       └── publish.yml
├── src/
│   ├── index.js          # Main entry point with exports
│   ├── pdf-utils.js      # Extracted core functionality
│   └── constants.js      # Extracted constants
├── tests/
│   └── pdf-utils.test.js # Adapted tests
├── .gitignore
├── .npmignore
├── package.json
├── README.md
├── LICENSE
└── jest.config.js
```

## Future Enhancements for the Extracted Package

Once the extraction is complete, we can consider the following enhancements for the PDF utilities package:

- Enhanced PDF metadata handling and extraction
- Support for more advanced PDF operations (forms, digital signatures, etc.)
- Performance optimizations for large PDF files
- Browser compatibility for web applications
- Additional utility functions based on common PDF tasks
- PDF text extraction and search capabilities
- Image extraction from PDFs
- PDF compression options
- Watermark and stamp functionality
- PDF page manipulation (rotation, reordering, etc.)

## Required API Changes

The extracted package will need the following API modifications:

```javascript
// Current API in pdf-utils.js
const { savePdf, mergePdfs, ensureDirectoryExists } = require('./utils/pdf-utils');

// New API with the extracted package
const { savePdf, mergePdfs, ensureDirectoryExists } = require('pdf-utils');
```

### Configuration Changes

The current hardcoded output directories will need to be made configurable:

```javascript
// Current implementation
const DEFAULT_OUTPUT_DIR = path.join(__dirname, '../../output');
const PDF_DIR = path.join(DEFAULT_OUTPUT_DIR, 'pdfs');

// New implementation
const DEFAULT_OUTPUT_DIR = options.outputDir || './output';
const PDF_DIR = options.pdfDir || path.join(DEFAULT_OUTPUT_DIR, 'pdfs');
```

## Migration Strategy for Tests

The major failing tests are in `pdf-utils.test.js`. We'll need to:

1. Fix the path mocking in the new package
2. Make the security checks more configurable
3. Use a consistent mocking strategy for all tests

## Compatibility Considerations

We need to ensure compatibility with:

1. Node.js versions (v12 and above)
2. Different operating systems (path handling)
3. Different file systems
4. The existing Gmail Invoice PDF Collector codebase
