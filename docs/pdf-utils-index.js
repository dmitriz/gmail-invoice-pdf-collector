/**
 * Example index.js file for the extracted pdf-utils package
 * This serves as a template for the new repository
 */
const path = require('path');
const pdfUtils = require('./pdf-utils');

// Default configuration
let config = {
  baseDir: process.cwd(),
  allowOutsideBaseDir: false,
  createDirsIfMissing: true
};

/**
 * Configure the PDF utilities
 * @param {Object} options - Configuration options
 * @param {string} [options.baseDir] - Base directory for output files
 * @param {boolean} [options.allowOutsideBaseDir] - Whether to allow saving outside base directory
 * @param {boolean} [options.createDirsIfMissing] - Whether to create directories if missing
 * @returns {Object} The configured API
 */
function configure(options = {}) {
  config = {
    ...config,
    ...options
  };
  
  return module.exports;
}

/**
 * Saves a PDF buffer to the specified output path
 * @param {Object} params - Parameters
 * @param {Buffer} params.pdfBuffer - The PDF data as Buffer
 * @param {string} params.outputPath - Where to save the PDF
 * @returns {Promise<Object>} Result object with path to saved PDF
 */
async function savePdf({ pdfBuffer, outputPath }) {
  // Convert relative paths based on configured baseDir
  const resolvedPath = path.isAbsolute(outputPath) 
    ? outputPath 
    : path.resolve(config.baseDir, outputPath);
    
  return pdfUtils.savePdf({ 
    pdfBuffer, 
    outputPath: resolvedPath,
    allowOutsideBaseDir: config.allowOutsideBaseDir 
  });
}

/**
 * Merge multiple PDF files into a single PDF
 * @param {Object} params - Parameters
 * @param {Array<string>} params.pdfPaths - Array of paths to PDF files to merge
 * @param {string} params.outputPath - Path where to save the merged PDF
 * @returns {Promise<Object>} Result object with path to merged PDF
 */
async function mergePdfs({ pdfPaths, outputPath }) {
  // Resolve all paths based on config
  const resolvedPaths = pdfPaths.map(p => 
    path.isAbsolute(p) ? p : path.resolve(config.baseDir, p));
  
  const resolvedOutput = path.isAbsolute(outputPath)
    ? outputPath
    : path.resolve(config.baseDir, outputPath);
  
  return pdfUtils.mergePdfs({
    pdfPaths: resolvedPaths,
    outputPath: resolvedOutput,
    allowOutsideBaseDir: config.allowOutsideBaseDir
  });
}

/**
 * Ensures that a directory exists, creating it if necessary
 * @param {Object} params - Parameters
 * @param {string} params.dirPath - Directory path to ensure exists
 * @returns {Object} Result object
 */
function ensureDirectoryExists({ dirPath }) {
  if (!config.createDirsIfMissing) {
    return { 
      success: false, 
      error: new Error('Directory creation disabled in configuration') 
    };
  }
  
  const resolvedPath = path.isAbsolute(dirPath)
    ? dirPath
    : path.resolve(config.baseDir, dirPath);
    
  return pdfUtils.ensureDirectoryExists({ dirPath: resolvedPath });
}

// Export the API
module.exports = {
  configure,
  savePdf,
  mergePdfs,
  ensureDirectoryExists,
  processSinglePdf: pdfUtils.processSinglePdf,
  // Export constants for backwards compatibility
  DEFAULT_OUTPUT_DIR: path.resolve(config.baseDir, 'output'),
  PDF_DIR: path.resolve(config.baseDir, 'output', 'pdfs')
};
