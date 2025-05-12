/**
 * Application configuration
 * Central place for all configurable parameters
 */

/**
 * Default configuration object
 * @type {Object}
 */
/**
 * Default configuration for the Gmail Invoice PDF Collector
 * 
 * This configuration file controls the behavior of the application, including:
 * - Operation mode (real vs mock)
 * - Output directories
 * - Confidence thresholds for invoice detection
 * - Logging parameters
 * - API credentials and access settings
 * 
 * @typedef {Object} Config
 * @property {boolean} realMode - Whether to run in real mode (using actual APIs) or mock mode
 * @property {string} outputDir - Output directory for all generated files
 * @property {number} confidenceThreshold - Minimum confidence threshold for considering an email as invoice/receipt
 * @property {Object} logs - Log settings
 * @property {string} logs.level - Log level (debug, info, warn, error)
 * @property {string} logs.dir - Directory for log files
 * @property {number} logs.maxFileSize - Maximum log file size in bytes
 * @property {number} logs.maxFiles - Maximum number of log files to keep
 * @property {Object} gmail - Gmail API settings
 * @property {string} gmail.credentialsPath - Path to credentials file (.js or .json). Must contain OAuth2 client credentials for Gmail API authentication. Keep this file secure and never commit to repo.
 * @property {string} gmail.tokenPath - Path to token file storing OAuth2 tokens
 * @property {string[]} gmail.scopes - Scopes required for Gmail API
 * @property {Object} llm - LLM service settings
 * @property {string} llm.apiUrl - URL for GitHub-hosted LLM service
 * @property {Object} mock - Mock data settings (used in mock mode)
 * @property {string} mock.emailsPath - Path to mock emails file
 * @property {string} mock.samplePdfsDir - Directory with sample PDF files
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
     * Whether to log to console
     * @type {boolean}
     */
    logToConsole: process.env.LOG_TO_CONSOLE !== 'false',    
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
     * Path to credentials file (.js or .json)
     * @type {string}
     */
    credentialsPath: './.secrets/credentials.js',
    
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
