/**
 * Logger utility for consistent logging throughout the application
 * Following functional programming paradigm with customizable configuration
 */
const winston = require('winston');
const path = require('path');
const fs = require('fs');

// Constants
const LOGS_DIR = path.join(__dirname, '../../run-logs');
const DEFAULT_LOG_LEVEL = 'info';
const DEFAULT_MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB
const DEFAULT_MAX_FILES = 5;
const TIMESTAMP_FORMAT = 'YYYY-MM-DD HH:mm:ss';

/**
 * Ensures that a directory exists
 * @param {Object} params - Parameters
 * @param {string} params.dirPath - Directory path to ensure exists
 * @returns {Object} Result object
 */
const ensureDirectoryExists = ({ dirPath }) => {
  try {
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
    }
    return { success: true, dirPath };
  } catch (error) {
    console.error(`Error creating directory ${dirPath}: ${error.message}`);
    return { success: false, error };
  }
};

/**
 * Creates a configured format for the logger
 * @param {Object} params - Parameters
 * @param {string} params.timestampFormat - Format for timestamps
 * @returns {winston.Logform.Format} Configured format
 */
const createLogFormat = ({ timestampFormat = TIMESTAMP_FORMAT } = {}) => {
  return winston.format.combine(
    winston.format.timestamp({ format: timestampFormat }),
    winston.format.printf(({ timestamp, level, message }) => {
      return `${timestamp} ${level.toUpperCase()}: ${message}`;
    })
  );
};

/**
 * Creates a logger instance with the specified configuration
 * @param {Object} params - Logger configuration parameters
 * @param {string} params.level - Log level (default: 'info')
 * @param {string} params.logsDir - Directory for log files
 * @param {number} params.maxFileSize - Maximum size of log files
 * @param {number} params.maxFiles - Maximum number of log files to keep
 * @returns {Object} Configured logger instance
 */
const createLogger = ({
  level = DEFAULT_LOG_LEVEL,
  logsDir = LOGS_DIR,
  maxFileSize = DEFAULT_MAX_FILE_SIZE,
  maxFiles = DEFAULT_MAX_FILES,
} = {}) => {
  // Ensure logs directory exists
  ensureDirectoryExists({ dirPath: logsDir });

  // Create and return the logger instance
  return winston.createLogger({
    level: process.env.LOG_LEVEL || level,
    format: createLogFormat({}),
    transports: [
      // Console output
      new winston.transports.Console(),

      // File output - general logs
      new winston.transports.File({
        filename: path.join(logsDir, 'app.log'),
        maxsize: maxFileSize,
        maxFiles,
      }),

      // File output - error logs only
      new winston.transports.File({
        filename: path.join(logsDir, 'error.log'),
        level: 'error',
        maxsize: maxFileSize,
        maxFiles,
      }),
    ],
  });
};

// Create default logger instance for convenience
const logger = createLogger({});

// Export both the factory function and the default instance
module.exports = {
  createLogger,
  createLogFormat,
  ensureDirectoryExists,
  logger,
  // Constants
  LOGS_DIR,
  DEFAULT_LOG_LEVEL,
  DEFAULT_MAX_FILE_SIZE,
  DEFAULT_MAX_FILES,
  TIMESTAMP_FORMAT,
};
