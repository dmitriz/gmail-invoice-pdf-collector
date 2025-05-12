/**
 * One-Time Setup Script
 * 
 * This script initializes the project by:
 * 1. Creating necessary directories for the application:
 *    - output/ (for saving PDFs and processed files)
 *    - .secrets/ (for storing OAuth credentials securely)
 *    - run-logs/ (for application logs)
 *    - mock-data/ (for test data files)
 * 
 * 2. Setting up test data for development mode:
 *    - Creates sample PDFs in mock-data/sample-pdfs/
 *    - Creates test email data in mock-data/emails.json
 * 
 * Run this script once after cloning the repository to set up the
 * required directory structure and sample files for testing.
 */
const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Paths
const rootDir = path.resolve(__dirname);
const outputDir = path.join(rootDir, 'output');
const pdfOutputDir = path.join(outputDir, 'pdfs');
const secretsDir = path.join(rootDir, '.secrets');
const runsDir = path.join(rootDir, 'run-logs');
const mockDataDir = path.join(rootDir, 'mock-data');
const mockPdfsDir = path.join(mockDataDir, 'sample-pdfs');

// Create directories
const ensureDir = (dir) => {
  if (!fs.existsSync(dir)) {
    console.log(`Creating directory: ${dir}`);
    fs.mkdirSync(dir, { recursive: true });
  } else {
    console.log(`Directory exists: ${dir}`);
  }
};

// Files to create if they don't exist
const createFileIfNotExists = (filePath, content) => {
  if (!fs.existsSync(filePath)) {
    console.log(`Creating file: ${filePath}`);
    fs.writeFileSync(filePath, content);
  } else {
    console.log(`File exists: ${filePath}`);
  }
};

// Main function
const setup = () => {
  console.log('=== Starting one-time setup ===');
  
  // Create directories
  ensureDir(outputDir);
  ensureDir(pdfOutputDir);
  ensureDir(secretsDir);
  ensureDir(runsDir);
  ensureDir(mockDataDir);
  ensureDir(mockPdfsDir);
  
  // Create a simple note file in the secrets directory
  const secretsReadmePath = path.join(secretsDir, 'NOTE.txt');
  const secretsReadmeContent = `This directory is for storing your OAuth credentials for Gmail API access.

Place your credentials.json file here (OAuth 2.0 user credentials, not service account).
See the main project README.md for detailed setup instructions.

Note: All files in this directory are gitignored for your security.
`;
  createFileIfNotExists(secretsReadmePath, secretsReadmeContent);
  
  // Create mock emails.json if it doesn't exist
  const mockEmailsPath = path.join(mockDataDir, 'emails.json');
  const mockEmailsContent = `[
  {
    "id": "mock-email-1",
    "subject": "Your Monthly Invoice #INV-2023-001",
    "from": "billing@example.com",
    "date": "2023-01-15T10:30:00Z",
    "body": "Please find attached your invoice for services rendered this month.",
    "hasAttachments": true,
    "attachments": [
      {
        "filename": "invoice-january-2023.pdf",
        "mimeType": "application/pdf",
        "data": "base64encodeddata"
      }
    ]
  },
  {
    "id": "mock-email-2",
    "subject": "Receipt for your purchase",
    "from": "store@example.com",
    "date": "2023-01-20T14:45:00Z",
    "body": "Thank you for your purchase. Here is your receipt.",
    "hasAttachments": true,
    "attachments": [
      {
        "filename": "receipt-43567.pdf",
        "mimeType": "application/pdf",
        "data": "base64encodeddata"
      }
    ]
  },
  {
    "id": "mock-email-3",
    "subject": "Weekly newsletter",
    "from": "newsletter@example.com",
    "date": "2023-01-25T09:15:00Z",
    "body": "Here's your weekly newsletter with the latest updates.",
    "hasAttachments": false,
    "attachments": []
  }
]`;
  createFileIfNotExists(mockEmailsPath, mockEmailsContent);
  
  // Create sample PDF files if they don't exist
  try {
    // Check if pdf-lib is installed
    require('pdf-lib');
    
    // Create sample PDFs using pdf-lib
    const createSamplePdf = `
      const { PDFDocument, rgb, StandardFonts } = require('pdf-lib');
      const fs = require('fs');
      const path = require('path');
      
      async function createSamplePdf(filePath, title, text) {
        const pdfDoc = await PDFDocument.create();
        const timesRomanFont = await pdfDoc.embedFont(StandardFonts.TimesRoman);
        const page = pdfDoc.addPage();
        const { width, height } = page.getSize();
        
        // Add title
        page.drawText(title, {
          x: 50,
          y: height - 100,
          size: 30,
          font: timesRomanFont,
          color: rgb(0, 0, 0),
        });
        
        // Add body text
        page.drawText(text, {
          x: 50,
          y: height - 150,
          size: 14,
          font: timesRomanFont,
          color: rgb(0, 0, 0),
        });
        
        const pdfBytes = await pdfDoc.save();
        fs.writeFileSync(filePath, pdfBytes);
        console.log(\`Created sample PDF: \${filePath}\`);
      }
      
      // Create invoice1.pdf
      createSamplePdf(
        path.join('${mockPdfsDir}', 'invoice1.pdf'),
        'INVOICE #2023-001',
        'This is a sample invoice PDF file for testing the Gmail Invoice PDF Collector.'
      );
      
      // Create receipt2.pdf  
      createSamplePdf(
        path.join('${mockPdfsDir}', 'receipt2.pdf'),
        'RECEIPT #43567',
        'This is a sample receipt PDF file for testing the Gmail Invoice PDF Collector.'
      );
    `;
    
    // Create a temporary file
    const tempScriptPath = path.join(rootDir, 'tmp-create-pdfs.js');
    fs.writeFileSync(tempScriptPath, createSamplePdf);
    
    // Run the script
    console.log('Creating sample PDFs...');
    execSync(`node ${tempScriptPath}`, { stdio: 'inherit' });
    
    // Delete the temporary file
    fs.unlinkSync(tempScriptPath);
  } catch (error) {
    console.warn('Could not create sample PDFs:', error.message);
    console.warn('Please run "npm install" first to install required dependencies');
  }
  
  console.log('\n=== Setup complete! ===');
  console.log('Next steps:');
  console.log('1. Run "npm install" to install dependencies');
  console.log('2. Run "npm run start:test" to test with mock data');
  console.log('3. For production use:');
  console.log('   - Create OAuth 2.0 user credentials (not service account)');
  console.log('   - Save as credentials.json in the .secrets directory');
  console.log('   - See project README.md for detailed instructions');
};

// Run setup
setup();
