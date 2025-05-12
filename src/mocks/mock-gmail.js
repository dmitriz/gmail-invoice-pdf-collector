/**
 * Mock Gmail service
 * Simulates Gmail API responses for development and testing
 * Following functional programming paradigm with single object input/output
 */
const fs = require('fs');
const path = require('path');

// Constants
const MOCK_DATA_DIR = path.join(__dirname, '../../mock-data');
const EMAILS_PATH = path.join(MOCK_DATA_DIR, 'emails.json');
const SAMPLE_PDFS_DIR = path.join(MOCK_DATA_DIR, 'sample-pdfs');
const ALLOWED_EXTENSIONS = ['.pdf'];

/**
 * Reads a file and parses its JSON content
 * @param {Object} params - Parameters
 * @param {string} params.filePath - Path to the JSON file
 * @returns {Object} Result with parsed data or error
 */
const readJsonFile = ({ filePath }) => {
  try {
    const data = fs.readFileSync(filePath, 'utf8');
    return {
      success: true,
      data: JSON.parse(data),
    };
  } catch (error) {
    return {
      success: false,
      error: new Error(`Error reading JSON file ${filePath}: ${error.message}`),
      data: [],
    };
  }
};

/**
 * Load mock emails from JSON file
 * @param {Object} params - Parameters
 * @param {string} [params.emailsPath] - Custom path to emails JSON file
 * @returns {Object} Result with emails or error
 */
const loadMockEmails = ({ emailsPath = EMAILS_PATH } = {}) => {
  const result = readJsonFile({ filePath: emailsPath });

  if (!result.success) {
    console.error(result.error.message);
  }

  return {
    success: result.success,
    emails: result.data || [],
    error: result.error,
  };
};

/**
 * Get a list of all emails (simulated)
 * @param {Object} [params={}] - Parameters (empty object for future extensions)
 * @returns {Promise<Object>} Result with list of email objects
 */
const listEmails = (_params = {}) => {
  return new Promise((resolve) => {
    const result = loadMockEmails({});

    resolve({
      success: result.success,
      emails: result.emails,
      error: result.error,
    });
  });
};

/**
 * Checks if a file has allowed extension
 * @param {Object} params - Parameters
 * @param {string} params.filename - Filename to check
 * @param {string[]} [params.allowedExtensions] - List of allowed extensions
 * @returns {Object} Result of the check
 */
const hasAllowedExtension = ({ filename, allowedExtensions = ALLOWED_EXTENSIONS }) => {
  const extension = path.extname(filename).toLowerCase();
  const isAllowed = allowedExtensions.includes(extension);

  return {
    isAllowed,
    extension,
    error: isAllowed ? null : new Error(`File type ${extension} not allowed`),
  };
};

/**
 * Get attachment for a specific email
 * @param {Object} params - Parameters
 * @param {string|number} params.emailId - Email ID or index
 * @param {string} params.attachmentName - Name of attachment
 * @param {string} [params.samplePdfsDir] - Custom path to sample PDFs
 * @returns {Promise<Object>} Result with attachment data
 */
const getAttachment = ({ /* emailId, */ attachmentName, samplePdfsDir = SAMPLE_PDFS_DIR }) => {
  return new Promise((resolve, reject) => {
    // Check if attachment has allowed extension
    const extensionCheck = hasAllowedExtension({ filename: attachmentName });

    if (!extensionCheck.isAllowed) {
      return reject(extensionCheck.error);
    }

    // Construct path to sample PDF
    const pdfPath = path.join(samplePdfsDir, attachmentName);

    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      return reject(new Error(`Attachment ${attachmentName} not found`));
    }

    // Return the file as buffer
    try {
      const fileBuffer = fs.readFileSync(pdfPath);
      resolve({
        success: true,
        attachmentName,
        data: fileBuffer,
        contentType: 'application/pdf',
      });
    } catch (error) {
      reject({
        success: false,
        error: new Error(`Error reading attachment: ${error.message}`),
      });
    }
  });
};

module.exports = {
  listEmails,
  getAttachment,
  loadMockEmails,
  readJsonFile,
  hasAllowedExtension,
  // Constants
  MOCK_DATA_DIR,
  EMAILS_PATH,
  SAMPLE_PDFS_DIR,
  ALLOWED_EXTENSIONS,
};
