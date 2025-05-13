# PDF Utils Extraction Checklist

## Repository Setup

- [x] Create new GitHub repository named [`pdf-utils`](https://github.com/dmitriz/pdf-utils)
- [ ] Initialize with README, LICENSE (MIT), and .gitignore
- [ ] Clone repository locally

## Initial Package Setup

- [ ] Copy template package.json from `docs/pdf-utils-package.json`
- [ ] Copy README template from `docs/pdf-utils-readme.md`
- [ ] Set up Jest configuration
- [ ] Set up ESLint configuration

## Code Migration

- [ ] Create basic directory structure (src, tests)
- [ ] Extract and refactor code from `src/utils/pdf-utils.js`
- [ ] Create new index.js with configurable API
- [ ] Extract and adapt tests from `src/__tests__/pdf-utils.test.js`
- [ ] Fix path handling issues causing test failures 
- [ ] Run tests to verify functionality

## Package Publishing

- [ ] Set up GitHub Actions for CI/CD
- [ ] Configure npm publishing
- [ ] Publish initial version (1.0.0)
- [ ] Test installation in a new project

## Main Project Integration

- [ ] Install package in main project
- [ ] Update imports to use new package
- [ ] Configure the package properly
- [ ] Update tests to use mock of the new package
- [ ] Run tests to verify functionality
- [ ] Remove old code and test files

## Final Steps

- [ ] Document the migration process
- [ ] Update main project README
- [ ] Push all changes
