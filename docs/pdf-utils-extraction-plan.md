# PDF Utilities Extraction Plan

## Overview

This plan details how to extract the PDF utilities from the Gmail Invoice PDF Collector project into a standalone repository.

## Goals

1. Create a reusable PDF utilities library
2. Make the code more modular and maintainable
3. Allow the PDF utilities to be used in other projects

## Repository Structure

```bash
pdf-utils/
├── .github/
│   └── workflows/
│       └── ci.yml
├── src/
│   ├── pdf-utils.js
│   └── index.js
├── tests/
│   └── pdf-utils.test.js
├── README.md
├── package.json
└── .gitignore
```

## Implementation Steps

1. Create a new repository for the PDF utilities
2. Set up the basic project structure
3. Copy the PDF utilities code from the Gmail Invoice PDF Collector
4. Update the tests to work in the new repository
5. Create a proper package.json with dependencies
6. Verify the functionality with tests
7. Update the original project to use the extracted utilities

## Dependencies

- pdf-lib: For PDF manipulation
- jest: For testing

## Migration Scripts

Two scripts have been created to handle this process:

1. `setup-node-repo.sh`: Sets up a new Node.js repository
2. `migrate-pdf-utils.sh`: Migrates the PDF utilities code to the new repository
