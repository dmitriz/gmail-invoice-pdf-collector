/**
 * Gmail Invoice PDF Collector - Entry Point
 *
 * This application scans emails, identifies invoices using an LLM,
 * downloads PDF attachments, and merges them into a single file.
 */
const path = require('path');
const { createConfig } = require('../config');
const { processInvoices } = require('./invoice-collector');
const { logger } = require('./utils/logger');

/**
 * Initialize services based on configuration
 * @param {Object} config - Application configuration
 * @returns {Object} Initialized services
 */
const initializeServices = (config) => {
  if (config.realMode) {
    // Real mode requires API access which is not yet set up
    throw new Error(
      'Real mode requires API access which has not been set up. Please use --test-mode flag for mock functionality.'
    );
  }

  // Return mock services for test mode
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

    // This will throw if real mode is selected without API access
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

  // Build options for execution
  const options = { realMode: !isTestMode };

  // Execute main function with options
  run(options)
  logger.info(`Running in ${isTestMode ? 'TEST' : 'PRODUCTION'} mode`);

  // Execute main function
  run(config)
    .then((result) => {
      if (!result.success) {
        logger.error(`Application failed: ${result.error}`);
        process.exit(1);
      }
      logger.info('Application completed successfully');
    })
    .catch((error) => {
      logger.error(`Fatal error: ${error.message}`);
      process.exit(1);
    });
}
