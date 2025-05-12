/**
 * Credentials M    if (credentialsPath && fs.existsSync(credentialsPath)) {
      logger.info(`Loading credentials from file: ${credentialsPath}`);
      try {
        let credentials;
        
        // Handle both JavaScript (.js) and JSON (.json) credential files
        if (credentialsPath.endsWith('.js')) {
          // For .js files, we require() the module which should export credentials
          credentials = require(credentialsPath);
          
          // If the file exports a function, call it to get credentials
          if (typeof credentials === 'function') {
            credentials = credentials();
          }
        } else {
          // For JSON files, read and parse
          const content = fs.readFileSync(credentialsPath, 'utf-8');
          credentials = JSON.parse(content);
        }
        
        // Ensure we're not using a service account (which won't work for Gmail)
        if (credentials.type === 'service_account') {
          logger.error('Service account credentials are not supported for Gmail access. Use OAuth 2.0 user credentials instead.');
          return null;
        }
        
        return credentials;
      } catch (error) {
        logger.error(`Error loading credentials file: ${error.message}`);
        return null;
      }
    }ecure loading of Google API credentials from a JavaScript file
 * 
 * This approach is preferred over environment variables for security reasons:
 * - Credentials are stored in a single file which is gitignored
 * - Less risk of exposing secrets in environment or process lists
 * - Clear separation between code and credentials
 */
const fs = require('fs');
const { logger } = require('./logger');

/**
 * Loads Google API credentials from a JavaScript or JSON file
 * @param {Object} params - Function parameters
 * @param {string} [params.credentialsPath] - Path to credentials file (.js or .json)
 * @returns {Object} Google API credentials object or null if not found
 */
const loadCredentials = ({ credentialsPath }) => {
  try {
    // Load credentials from file if it exists
    if (credentialsPath && fs.existsSync(credentialsPath)) {
      logger.info(`Loading credentials from file: ${credentialsPath}`);
      try {
        const content = fs.readFileSync(credentialsPath, 'utf-8');
        const credentials = JSON.parse(content);

        // Ensure we're not using a service account (which won't work for Gmail)
        if (credentials.type === 'service_account') {
          logger.error('Service account credentials are not supported for Gmail access');
          return null;
        }

        return credentials;
      } catch (error) {
        logger.error(`Error parsing credentials file: ${error.message}`);
        return null;
      }
    }

    // In test/mock mode, this is fine
    logger.warn('No credentials found, this is only acceptable in test mode');
    return null;
  } catch (error) {
    logger.error(`Error loading credentials: ${error.message}`);
    return null;
  }
};

module.exports = {
  loadCredentials,
};
