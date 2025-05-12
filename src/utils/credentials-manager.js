/**
 * Credentials Manager - Secure loading of Google API credentials from a JavaScript file
 * 
 * This approach is preferred over environment variables for security reasons:
 * - Credentials are stored in a single file which is gitignored
 * - Less risk of exposing secrets in environment or process lists
 * - Clear separation between code and credentials
 */
const fs = require('fs');
const { logger } = require('./logger');

/**
 * Reads credentials file from the filesystem.
 *
 * @param {string} filePath - Path to the JSON credentials file
 * @returns {Object|null} Parsed JSON content or null on failure
 */
const readCredentialsFile = (filePath) => {
  try {
    logger.info(`Loading credentials from file: ${filePath}`);
    const content = fs.readFileSync(filePath, 'utf-8');
    try {
      return JSON.parse(content);
    } catch (parseError) {
      logger.error(`Error parsing JSON from credentials file: ${parseError.message}`);
      return null;
    }
  } catch (readError) {
    logger.error(`Error reading credentials file: ${readError.message}`);
    return null;
  }
};

/**
 * Validates OAuth2 credentials.
 *
 * @param {Object} credentials - The credentials object to validate
 * @returns {boolean} Whether the credentials are valid
 */
const validateCredentials = (credentials) => {
  // Ensure we're not using a service account (which won't work for Gmail)
  if (credentials.type === 'service_account') {
    logger.error('Service account credentials are not supported for Gmail access');
    return false;
  }

  // Validate required credential fields
  if (!credentials.client_id || !credentials.client_secret || !credentials.redirect_uris) {
    logger.error('Invalid credentials format: missing required fields');
    return false;
  }
  
  return true;
};

/**
 * Loads credentials from the specified path.
 *
 * @param {Object} options - Options object
 * @param {string} options.credentialsPath - Path to credentials file
 * @returns {Object|null} The loaded credentials or null on failure
 */
/**
 * Loads credentials from the specified path.
 * 
 * @description
 * This function attempts to load OAuth2 client credentials from the specified path.
 * It validates the credentials to ensure they're not service account credentials (which
 * don't work with Gmail) and checks for required fields (client_id, client_secret, and
 * redirect_uris). In test/mock mode, it's acceptable for credentials to be missing.
 * 
 * @param {Object} options - Options object
 * @param {string} options.credentialsPath - Path to credentials file
 * @returns {Object|null} The loaded credentials or null on failure
 */
const loadCredentials = async ({ credentialsPath }) => {
  try {
    // Check if credentials file exists
    if (credentialsPath && fs.existsSync(credentialsPath)) {
      const credentials = readCredentialsFile(credentialsPath);
      
      if (!credentials) {
        return null;
      }
      
      if (validateCredentials(credentials)) {
        logger.info('Credentials loaded successfully');
        return credentials;
      }
      
      return null;
    }

    // In test/mock mode, this is fine
    logger.warn('No credentials found, this is only acceptable in test mode');
    return null;
  } catch (error) {
    logger.error(`Error checking credentials file existence or access: ${error.message}`);
    return null;
  }
};

module.exports = {
  loadCredentials,
  validateCredentials, // Export for testing purposes
  readCredentialsFile, // Export for testing purposes
};
