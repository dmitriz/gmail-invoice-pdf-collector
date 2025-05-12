/**
 * Main processor for email scanning, invoice detection, and PDF collection
 * Using functional programming paradigm with single object arguments
 */
const path = require('path');
const fs = require('fs');
const { logger } = require('./utils/logger');
const { savePdf, mergePdfs, ensureDirectoryExists } = require('./utils/pdf-utils');

// Constants
const DEFAULT_OUTPUT_DIR = path.join(__dirname, '../output');
const DEFAULT_CONFIDENCE_THRESHOLD = 0.7;
const PDF_EXTENSION = '.pdf';

/**
 * Initializes the output directory structure
 * @param {Object} params - Function parameters
 * @param {string} params.outputDir - Base output directory
 * @returns {Object} Result with paths
 */
const initOutputDirs = ({ outputDir = DEFAULT_OUTPUT_DIR }) => {
  // Ensure main output directory exists
  const mainDirResult = ensureDirectoryExists({ dirPath: outputDir });
  if (!mainDirResult.success) {
    return {
      success: false,
      error: mainDirResult.error,
    };
  }

  // Ensure PDFs subdirectory exists
  const pdfsDir = path.join(outputDir, 'pdfs');
  const pdfsDirResult = ensureDirectoryExists({ dirPath: pdfsDir });
  if (!pdfsDirResult.success) {
    return {
      success: false,
      error: pdfsDirResult.error,
    };
  }

  return {
    success: true,
    outputDir,
    pdfsDir,
  };
};

/**
 * Processes a single email for invoice detection and PDF extraction
 * @param {Object} params - Function parameters
 * @param {Object} params.email - Email object with subject, body and attachments
 * @param {number} params.index - Email index
 * @param {Object} params.llmService - LLM service for classification
 * @param {Object} params.gmailService - Gmail service for attachments
 * @param {string} params.pdfsDir - Directory to save PDFs
 * @param {number} params.confidenceThreshold - Minimum confidence level
 * @param {Object} params.stats - Statistics object to update
 * @returns {Promise<Object>} Processing result with downloaded PDFs
 */
const processEmail = async ({
  email,
  index,
  llmService,
  gmailService,
  pdfsDir,
  confidenceThreshold = DEFAULT_CONFIDENCE_THRESHOLD,
  stats = {},
}) => {
  const downloadedPdfs = [];

  try {
    logger.info(`Processing email ${index + 1}: "${email.subject.replace(/[\r\n]+/g, ' ')}"`);

    // Check if email contains an invoice using LLM
    const classification = await llmService.classifyEmail({
      subject: email.subject,
      body: email.body,
    });

    // Skip if not an invoice or confidence is too low
    if (!classification.is_invoice || classification.confidence < confidenceThreshold) {
      logger.info(
        `Skipping email - not identified as invoice (confidence: ${classification.confidence})`
      );
      return { downloadedPdfs, emailProcessed: true };
    }

    // Count as invoice email
    stats.invoiceEmails = (stats.invoiceEmails || 0) + 1;
    logger.info(
      `Invoice detected (confidence: ${classification.confidence}): ${classification.reason}`
    );

    // Skip if no attachments
    if (!email.attachments || email.attachments.length === 0) {
      logger.info('No attachments found in this email');
      return { downloadedPdfs, emailProcessed: true };
    }

    // Filter for PDF attachments
    const pdfAttachments = email.attachments.filter((att) =>
      att.toLowerCase().endsWith(PDF_EXTENSION)
    );

    stats.pdfAttachments = (stats.pdfAttachments || 0) + pdfAttachments.length;

    // Download each PDF attachment
    const attachmentPromises = pdfAttachments.map((attachment) =>
      (async () => {
        try {
          logger.info(`Downloading attachment: ${attachment}`);
          const attachmentResult = await gmailService.getAttachment({
            emailId: index,
            attachmentName: attachment,
          });
          if (!attachmentResult.success) {
            throw new Error(attachmentResult.error || 'Failed to download attachment');
          }
          const outputPath = path.join(pdfsDir, `${Date.now()}-${attachment}`);
          const saveResult = await savePdf({
            pdfBuffer: attachmentResult.data,
            outputPath,
          });
          if (!saveResult.success) {
            throw new Error(saveResult.error || 'Failed to save PDF');
          }
          logger.info(`Saved PDF: ${outputPath}`);
          return outputPath;
        } catch (attachError) {
          logger.error(`Error processing attachment ${attachment}: ${attachError.message}`);
          stats.errors = (stats.errors || 0) + 1;
          return null;
        }
      })()
    );
    const attachmentResults = await Promise.all(attachmentPromises);
    attachmentResults.forEach((outputPath) => {
      if (outputPath) {
        downloadedPdfs.push(outputPath);
        stats.downloadedPdfs = (stats.downloadedPdfs || 0) + 1;
      }
    });

    return { downloadedPdfs, emailProcessed: true };
  } catch (emailError) {
    logger.error(`Error processing email: ${emailError.message}`);
    stats.errors = (stats.errors || 0) + 1;
    return { downloadedPdfs, emailProcessed: false, error: emailError };
  }
};

/**
 * Main function to process emails, collect invoices and merge PDFs
 * @param {Object} params - Function parameters
 * @param {Object} params.gmailService - Gmail service
 * @param {Object} params.llmService - LLM service
 * @param {string} [params.outputDir] - Output directory
 * @param {number} [params.confidenceThreshold] - Confidence threshold
 * @returns {Promise<Object>} Processing statistics
 */
const processInvoices = async ({
  gmailService,
  llmService,
  outputDir = DEFAULT_OUTPUT_DIR,
  confidenceThreshold = DEFAULT_CONFIDENCE_THRESHOLD,
}) => {
  logger.info('Starting invoice collection process');

  // Initialize statistics
  const stats = {
    totalEmails: 0,
    invoiceEmails: 0,
    pdfAttachments: 0,
    downloadedPdfs: 0,
    errors: 0,
  };

  try {
    // Initialize output directories
    const dirsResult = initOutputDirs({ outputDir });
    if (!dirsResult.success) {
      throw new Error(`Failed to create output directories: ${dirsResult.error}`);
    }

    // Get all emails
    const emailsResult = await gmailService.listEmails({});

    if (!emailsResult.success) {
      throw new Error('Failed to fetch emails');
    }

    const emails = emailsResult.emails || [];
    stats.totalEmails = emails.length;
    logger.info(`Found ${emails.length} emails to process`);

    // Process each email
    const allDownloadedPdfs = [];

    for (let i = 0; i < emails.length; i++) {
      const { downloadedPdfs } = await processEmail({
        email: emails[i],
        index: i,
        llmService,
        gmailService,
        pdfsDir: dirsResult.pdfsDir,
        confidenceThreshold,
        stats,
      });

      allDownloadedPdfs.push(...downloadedPdfs);
    }

    // Merge all PDFs into one file if we have any
    if (allDownloadedPdfs.length > 0) {
      logger.info(`Merging ${allDownloadedPdfs.length} PDFs into single file`);

      // Verify that all PDF paths exist
      const validPdfPaths = [];
      for (const pdfPath of allDownloadedPdfs) {
        try {
          await fs.promises.access(pdfPath, fs.constants.F_OK);
          validPdfPaths.push(pdfPath);
        } catch {
          logger.warn(`PDF file not found: ${pdfPath}`);
        }
      }

      if (validPdfPaths.length === 0) {
        logger.error('No valid PDF files to merge');
        stats.errors++;
        return stats;
      }

      const mergedPath = path.join(outputDir, 'merged.pdf');

      const mergeResult = await mergePdfs({
        pdfPaths: validPdfPaths,
        outputPath: mergedPath,
      });

      if (mergeResult.success) {
        logger.info(`Successfully created merged PDF: ${mergedPath}`);
      } else {
        logger.error(`Failed to merge PDFs: ${mergeResult.error}`);
        stats.errors++;
      }
    } else {
      logger.info('No PDFs to merge');
    }
  } catch (error) {
    logger.error(`Collection process failed: ${error.message}`);
    stats.errors++;
  }

  logger.info('Invoice collection process completed');
  logger.info(`Stats: ${JSON.stringify(stats)}`);

  return stats;
};

module.exports = {
  processInvoices,
  processEmail,
  initOutputDirs,
  // Constants exported for testing
  DEFAULT_OUTPUT_DIR,
  DEFAULT_CONFIDENCE_THRESHOLD,
  PDF_EXTENSION,
};
