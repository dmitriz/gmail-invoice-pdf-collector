/**
 * One-Time Setup Script
 * Automatically creates all required project files and directories
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
  
  // Create secrets README if it doesn't exist
  const secretsReadmePath = path.join(secretsDir, 'README.md');
  const secretsReadmeContent = `# Gmail API Credentials

For this application to work with Gmail:

1. Go to the [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project
3. Enable the Gmail API
4. Create OAuth 2.0 credentials (Desktop app)
5. Download the credentials as JSON
6. Save the file as \`credentials.json\` in this directory

## What credentials.json should look like:

\`\`\`json
{
  "installed": {
    "client_id": "YOUR_CLIENT_ID.apps.googleusercontent.com",
    "project_id": "your-project-id",
    "auth_uri": "https://accounts.google.com/o/oauth2/auth",
    "token_uri": "https://oauth2.googleapis.com/token",
    "auth_provider_x509_cert_url": "https://www.googleapis.com/oauth2/v1/certs",
    "client_secret": "YOUR_CLIENT_SECRET",
    "redirect_uris": ["urn:ietf:wg:oauth:2.0:oob"]
  }
}
\`\`\`

After first run, a \`token.json\` file will be created here to store your access tokens.
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
  console.log('Run "npm install" (if you haven\'t already) to install dependencies');
  console.log('Then run "npm run start:test" to test the application');
  console.log('For production use, place credentials.json in the .secrets directory');
};

// Run setup
setup();
