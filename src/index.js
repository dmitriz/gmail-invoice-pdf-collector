/**
 * Gmail Invoice PDF Collector - Entry Point
 *
 * This application scans emails, identifies invoices using an LLM,
 * downloads PDF attachments, and merges them into a single file.
 */
const path = require('path');
const { createConfig, defaultConfig } = require('../config');
const { processInvoices } = require('./invoice-collector');
const { logger } = require('./utils/logger');

/**
 * Initialize services based on configuration
 * @param {Object} config - Application configuration
 * @returns {Object} Initialized services
 */
const initializeServices = (config) => {
  if (config.realMode) {
    // Real mode is not yet implemented
    logger.warn('Real mode is selected but not yet implemented');
    logger.warn('Falling back to mock mode');
    // In the future, we would initialize real services here
  }

  // For now, always return mock services
  const mockGmail = require('./mocks/mock-gmail');
  const mockLlm = require('./mocks/mock-llm');

  return {
    gmailService: mockGmail,
    llmService: mockLlm,
  };
};

/**
 * Main function to run the invoice collector
 * @param {Object} options - Configuration options
 * @returns {Promise<Object>} Processing results
 */
const run = async (options = {}) => {
  try {
    // Create configuration by merging defaults with provided options
    const config = createConfig(options);

    logger.info('Starting Gmail Invoice PDF Collector');
    logger.info(`Mode: ${config.realMode ? 'Real' : 'Mock'}`);

    // Initialize services based on configuration
    const { gmailService, llmService } = initializeServices(config);

    // Process invoices using the functional approach
    const results = await processInvoices({
      gmailService,
      llmService,
      outputDir: path.resolve(config.outputDir),
      confidenceThreshold: config.confidenceThreshold,
    });

    logger.info('Processing complete');
    logger.info(`Processed ${results.totalEmails} emails, found ${results.invoiceEmails} invoices`);
    logger.info(
      `Downloaded ${results.downloadedPdfs} PDFs from ${results.pdfAttachments} PDF attachments`
    );

    if (results.errors > 0) {
      logger.warn(`Encountered ${results.errors} errors during processing`);
    }

    return {
      success: true,
      results,
    };
  } catch (error) {
    logger.error(`Failed to process invoices: ${error.message}`);
    return {
      success: false,
      error: error.message,
    };
  }
};

// Allow importing as a module
module.exports = { run };

// If this file is executed directly, run with config based on args
if (require.main === module) {
  // Check for test mode flag
  const isTestMode = process.argv.includes('--test-mode');

  // Create appropriate config
  const config = createConfig({
    ...defaultConfig,
    realMode: !isTestMode, // Only use real mode if not in test mode
  });

  logger.info(`Running in ${isTestMode ? 'TEST' : 'PRODUCTION'} mode`);

  run({ config }).catch((error) => {
    logger.error(`Fatal error: ${error.message}`);
    process.exit(1);
  });
}
