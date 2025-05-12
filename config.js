/**
 * Application configuration
 * Central place for all configurable parameters
 */

/**
 * Default configuration object
 * @type {Object}
 */
const defaultConfig = {
  /**
   * Whether to run in real mode (using actual APIs) or mock mode
   * @type {boolean}
   */
  realMode: false,
  
  /**
   * Output directory for all generated files
   * @type {string}
   */
  outputDir: './output',
  
  /**
   * Minimum confidence threshold for considering an email as invoice/receipt
   * @type {number}
   */
  confidenceThreshold: 0.7,
  
  /**
   * Log settings
   * @type {Object}
   */
  logs: {
    /**
     * Log level (debug, info, warn, error)
     * @type {string}
     */
    level: process.env.LOG_LEVEL || 'info',
    
    /**
     * Directory for log files
     * @type {string}
     */
    dir: './run-logs',
    
    /**
     * Maximum log file size in bytes (5MB default)
     * @type {number}
     */
    maxFileSize: 5 * 1024 * 1024,
    
    /**
     * Maximum number of log files to keep
     * @type {number}
     */
    maxFiles: 5
  },
  
  /**
   * Gmail API settings
   * @type {Object}
   */
  gmail: {
    /**
     * Path to credentials file
     * @type {string}
     */
    credentialsPath: './.secrets/credentials.json',
    
    /**
     * Path to token file
     * @type {string}
     */
    tokenPath: './.secrets/token.json',
    
    /**
     * Scopes required for Gmail API
     * @type {string[]}
     */
    scopes: ['https://www.googleapis.com/auth/gmail.readonly']
  },
  
  /**
   * LLM service settings
   * @type {Object}
   */
  llm: {
    /**
     * URL for GitHub-hosted LLM service
     * @type {string}
     */
    apiUrl: 'https://api.github.com/llm'
  },
  
  /**
   * Mock data settings (used in mock mode)
   * @type {Object}
   */
  mock: {
    /**
     * Path to mock emails file
     * @type {string}
     */
    emailsPath: './mock-data/emails.json',
    
    /**
     * Directory with sample PDF files
     * @type {string}
     */
    samplePdfsDir: './mock-data/sample-pdfs'
  }
};

/**
 * Creates a configuration object by merging defaults with custom settings
 * @param {Object} customConfig - Custom configuration options
 * @returns {Object} Final configuration
 */
const createConfig = (customConfig = {}) => {
  return {
    ...defaultConfig,
    ...customConfig,
    // Deep merge for nested objects
    logs: {
      ...defaultConfig.logs,
      ...(customConfig.logs || {})
    },
    gmail: {
      ...defaultConfig.gmail,
      ...(customConfig.gmail || {})
    },
    llm: {
      ...defaultConfig.llm,
      ...(customConfig.llm || {})
    },
    mock: {
      ...defaultConfig.mock,
      ...(customConfig.mock || {})
    }
  };
};

module.exports = {
  defaultConfig,
  createConfig
};
