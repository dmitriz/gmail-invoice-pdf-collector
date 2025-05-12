/**
 * PDF utility functions for handling PDF operations
 * Following functional programming paradigm with single object input/output
 */
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

// Constants
const DEFAULT_OUTPUT_DIR = path.join(__dirname, '../../output');
const PDF_DIR = path.join(DEFAULT_OUTPUT_DIR, 'pdfs');

/**
 * Ensures that a directory exists, creating it if necessary
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
    return {
      success: false,
      error: new Error(`Failed to create directory ${dirPath}: ${error.message}`),
    };
  }
};

/**
 * Saves a PDF buffer to the specified output path
 * @param {Object} params - Parameters
 * @param {Buffer} params.pdfBuffer - The PDF data as Buffer
 * @param {string} params.outputPath - Where to save the PDF
 * @returns {Promise<Object>} Result object with path to saved PDF
 */
const savePdf = async ({ pdfBuffer, outputPath }) => {
  try {
    // Ensure the directory exists
    const dir = path.dirname(outputPath);
    const dirResult = ensureDirectoryExists({ dirPath: dir });

    if (!dirResult.success) {
      return { success: false, error: dirResult.error };
    }

    // Write the buffer to file
    // Resolve and validate outputPath is within the allowed directory
    const safeOutputPath = path.resolve(outputPath);
    const allowedDir = path.resolve(DEFAULT_OUTPUT_DIR);
    if (!safeOutputPath.startsWith(allowedDir)) {
      throw new Error('Output path is not within the allowed directory');
    }
    // Write the PDF buffer to file asynchronously
    await fs.promises.writeFile(safeOutputPath, pdfBuffer);
    return {
      success: true,
      outputPath,
      message: `PDF successfully saved to ${outputPath}`,
    };
  } catch (error) {
    return {
      success: false,
      error: new Error(`Failed to save PDF: ${error.message}`),
    };
  }
};

/**
 * Processes a single PDF for merging
 * @param {Object} params - Parameters
 * @param {string} params.pdfPath - Path to the PDF file
 * @param {PDFDocument} params.targetDoc - Target PDF document to add pages to
 * @returns {Promise<Object>} Result of processing
 */
const processSinglePdf = async ({ pdfPath, targetDoc }) => {
  try {
    // Check if file exists
    if (!fs.existsSync(pdfPath)) {
      return {
        success: false,
        error: new Error(`PDF file does not exist: ${pdfPath}`),
      };
    }

    // Read the PDF file
    const pdfBytes = fs.readFileSync(pdfPath);

    if (!pdfBytes || pdfBytes.length === 0) {
      return {
        success: false,
        error: new Error(`Empty PDF file: ${pdfPath}`),
      };
    }

    // Load the PDF document
    const pdfDoc = await PDFDocument.load(pdfBytes);

    // Copy pages from the source PDF to the target PDF
    const copiedPages = await targetDoc.copyPages(pdfDoc, pdfDoc.getPageIndices());

    if (copiedPages.length === 0) {
      return {
        success: false,
        error: new Error(`No pages found in PDF: ${pdfPath}`),
      };
    }

    copiedPages.forEach((page) => {
      targetDoc.addPage(page);
    });

    return {
      success: true,
      pagesAdded: copiedPages.length,
    };
  } catch (error) {
    return {
      success: false,
      error: new Error(`Error processing PDF ${pdfPath}: ${error.message}`),
    };
  }
};

/**
 * Merge multiple PDF files into a single PDF
 * @param {Object} params - Parameters
 * @param {Array<string>} params.pdfPaths - Array of paths to PDF files to merge
 * @param {string} params.outputPath - Path where to save the merged PDF
 * @returns {Promise<Object>} Result object with path to merged PDF
 */
const mergePdfs = async ({ pdfPaths, outputPath }) => {
  try {
    // Create a new PDF document
    const mergedPdf = await PDFDocument.create();

    // Track processing results
    const results = {
      totalFiles: pdfPaths.length,
      successfulMerges: 0,
      failedMerges: 0,
      errors: [],
    };

    // Process each PDF
    for (const pdfPath of pdfPaths) {
      const processResult = await processSinglePdf({
        pdfPath,
        targetDoc: mergedPdf,
      });

      if (processResult.success) {
        results.successfulMerges++;
      } else {
        results.failedMerges++;
        results.errors.push(processResult.error.message);
      }
    }

    // Skip further processing if no PDFs were successfully merged
    if (results.successfulMerges === 0) {
      return {
        success: false,
        error: new Error(
          `No PDFs were successfully processed for merging. Errors: ${results.errors.join('; ')}`
        ),
        results,
      };
    }

    // Serialize the merged PDF to bytes
    const mergedPdfBytes = await mergedPdf.save();

    if (!mergedPdfBytes || !(mergedPdfBytes instanceof Uint8Array) || mergedPdfBytes.length === 0) {
      return {
        success: false,
        error: new Error('Failed to generate PDF bytes from merged document'),
        results,
      };
    }

    // Ensure output directory exists
    const dir = path.dirname(outputPath);
    const dirResult = ensureDirectoryExists({ dirPath: dir });

    if (!dirResult.success) {
      return {
        success: false,
        error: dirResult.error,
        results,
      };
    }

    // Write the merged PDF to file
    fs.writeFileSync(outputPath, mergedPdfBytes);

    return {
      success: true,
      outputPath,
      message: `Successfully merged ${results.successfulMerges} PDFs into ${outputPath}`,
      results,
    };
  } catch (error) {
    return {
      success: false,
      error: new Error(`Failed to merge PDFs: ${error.message}`),
    };
  }
};

module.exports = {
  savePdf,
  mergePdfs,
  ensureDirectoryExists,
  processSinglePdf,
  DEFAULT_OUTPUT_DIR,
  PDF_DIR,
};
