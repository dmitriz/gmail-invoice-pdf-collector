# Gmail Invoice PDF Collector

This tool retrieves emails from a Gmail account, identifies invoices and receipts using a lightweight LLM, downloads all PDF attachments, and merges them into one consolidated PDF file.

## Features

- Fetch all emails from a Gmail account
- Use LLM to classify relevant messages (invoice/receipt)
- Download PDF attachments from filtered emails
- Merge all valid PDFs into a single file
- Supports mock mode for testing without real Gmail access
- Functional programming approach with clean error handling

## Project Architecture

This project follows a functional programming approach with these key principles:

- Pure functions with single object arguments and returns
- No classes or `this` usage
- Explicit error handling with result objects
- Minimal dependencies
- Comprehensive test coverage

## Usage

### Installation

```bash
# Clone the repository
git clone https://github.com/dmitriz/gmail-invoice-pdf-collector.git
cd gmail-invoice-pdf-collector

# Install dependencies
npm install
```

### Running the Application

```bash
# Run in mock mode (default) - uses mock data, no real API access needed
npm start

# Run with real Gmail API access (requires proper API setup)
npm run start:real
```

### Running Tests

```bash
# Run all tests
npm test

# Run unit tests only (excludes integration tests)
npm run test:unit

# Run integration tests
npm run test:integration

# Run tests with coverage report
npm run test:coverage
```

### Directory Structure

├── config.js                 # Central configuration
├── mock-data/                # Mock data for testing
│   ├── emails.json           # Sample email data
│   └── sample-pdfs/          # Sample PDF files
├── output/                   # Output directory for PDFs
│   └── pdfs/                 # Individual PDFs before merging
├── run-logs/                 # Application logs
├── .secrets/                 # Credentials storage (gitignored)
└── src/
    ├── index.js              # Application entry point
    ├── invoice-collector.js  # Core invoice collection logic
    ├── __tests__/            # Unit tests
    │   ├── invoice-collector.test.js
    │   ├── mock-llm.test.js
    │   └── pdf-utils.test.js
    ├── mocks/                # Mock implementations
    │   ├── mock-gmail.js     # Mock Gmail API
    │   └── mock-llm.js       # Mock LLM service
    └── utils/                # Utility functions
        ├── logger.js         # Logging utilities
        └── pdf-utils.js      # PDF handling utilities

```sh
├── config.js                 # Central configuration
├── mock-data/                # Mock data for testing
│   ├── emails.json           # Sample email data
│   └── sample-pdfs/          # Sample PDF files
├── output/                   # Output directory for PDFs
│   └── pdfs/                 # Individual PDFs before merging
├── run-logs/                 # Application logs
├── .secrets/                 # Credentials storage (gitignored)
└── src/
    ├── index.js              # Application entry point
    ├── invoice-collector.js  # Core invoice collection logic
    ├── __tests__/            # Unit tests
    │   ├── invoice-collector.test.js
    │   ├── mock-llm.test.js
    │   └── pdf-utils.test.js
    ├── mocks/                # Mock implementations
    │   ├── mock-gmail.js     # Mock Gmail API
    │   └── mock-llm.js       # Mock LLM service
    └── utils/                # Utility functions
        ├── logger.js         # Logging utilities
        └── pdf-utils.js      # PDF handling utilities
```

## Setup

### 1. Install Dependencies

```bash
npm install
```

### 2. Google Cloud Credentials (for real mode)

1. Create a project at [Google Cloud Console](https://console.cloud.google.com/)
2. Enable the Gmail API for your project
3. Create OAuth 2.0 credentials:
   - Select "Desktop app" as the application type
   - __Important:__ Use OAuth 2.0 user credentials, NOT service accounts
   - Service accounts cannot access user Gmail data
4. Set up your credentials file:
   - Make a copy of `.secrets/credentials.template.js` and name it `.secrets/credentials.js`
   - Replace the placeholder values with your actual OAuth credentials
   - Format:

   ```javascript
   module.exports = {
     installed: {
       client_id: "YOUR_CLIENT_ID_HERE", 
       project_id: "YOUR_PROJECT_ID_HERE", 
       client_secret: "YOUR_CLIENT_SECRET_HERE",
       redirect_uris: ["urn:ietf:wg:oauth:2.0:oob"]
     }
   };
   ```

5. The `.secrets` directory is excluded from version control for security

Note: When you first run the application in real mode, it will prompt you to authorize access to your Gmail account by opening a browser window.

### 3. Run Application

```bash
# Run in mock mode (default)
npm start

# Run with complete validation, linting, testing and execution
npm run verify-and-run

# Run with custom configuration (programmatic usage)
node -e "require('./src/index').run({ realMode: false, confidenceThreshold: 0.8 })"
```

### 4. Development Commands

```bash
# Run tests
npm test

# Run tests with coverage report
npm run test:full

# Lint the code
npm run lint

# Format the code
npm run format

# Run format, lint and tests in sequence
npm run validate

# Complete verification and execution (format, lint, test, start)
npm run verify-and-run

# Development workflow with commit
npm run validate && git commit -am "Description of changes"
```

## Configuration

All application configuration is centralized in `config.js`. You can override any of these settings when calling the application programmatically.

### Key Configuration Options

| Option | Description | Default |
|--------|-------------|---------|
| `realMode` | Use real Gmail API instead of mock | `false` |
| `confidenceThreshold` | Minimum confidence score (0-1) for invoice detection | `0.7` |
| `outputDir` | Directory for saving output files | `./output` |
| `maxEmails` | Maximum emails to process (0 = unlimited) | `0` |

### Sample Usage

```javascript
// Programmatic usage with custom configuration
const { run } = require('./src/index');

run({
  realMode: false,  // Use mock data
  confidenceThreshold: 0.8,  // Higher threshold for classification
  outputDir: './custom-output'  // Custom output directory
})
.then(result => {
  console.log(`Processed ${result.totalEmails} emails, found ${result.downloadedPdfs} PDFs`);
})
.catch(error => {
  console.error('Failed to process invoices:', error.message);
});
```

## Testing Approach

The project follows these testing principles:

- Unit tests for all core functions
- No nested describe blocks
- Clear test names with function name and behavior
- Mocked dependencies for isolation
- Full coverage of business logic

## Output

When running the application, it produces:

- `output/merged.pdf`: The final merged PDF containing all invoices
- `output/pdfs/`: Directory containing individual downloaded PDFs
- `run-logs/app.log`: Full application logs
- `run-logs/error.log`: Error-only logs

## Spec Document

For detailed information about the system design, refer to the [specification document](docs/spec-1-gmail-invoice-pdf-collector.md).

```bash
npm test
```

- __Mock mode__: Uses sample emails and PDFs (default)
- __Real mode__: Requires live Gmail and LLM API access (coming soon)

## Outputs

- `output/merged.pdf`: Final merged PDF
- `output/pdfs/`: Individual downloaded PDFs
- `run-logs/app.log`: Application logs
- `run-logs/error.log`: Error logs

## Specification

For detailed information about the system, refer to the [SPEC-1: Gmail Invoice PDF Collector](docs/spec-1-gmail-invoice-pdf-collector.md).
