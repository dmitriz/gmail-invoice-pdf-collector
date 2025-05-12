/**
 * Unit tests for PDF utilities
 */
const fs = require('fs');
const path = require('path'); // Original path, used for constructing test paths

// Use actualPath for some operations if needed, but primary mocking is below
const actualPath = jest.requireActual('path');
const MOCK_CWD = '/home/z/repos/gmail-invoice-pdf-collector'; // Consistent CWD

const {
  savePdf,
  mergePdfs,
  ensureDirectoryExists,
  processSinglePdf,
  DEFAULT_OUTPUT_DIR, // Import for direct use in test setup
  PDF_DIR, // Import for direct use in test setup
} = require('../utils/pdf-utils');

// Mock 'fs'
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn(),
  promises: {
    writeFile: jest.fn().mockResolvedValue(undefined),
  },
}));

// Mock 'path' module
jest.mock('path', () => {
  const actualPathModule = jest.requireActual('path');
  const MOCK_CWD_INTERNAL = '/home/z/repos/gmail-invoice-pdf-collector';

  return {
    ...actualPathModule, // Default to actual implementations
    // Override resolve to be CWD-aware for testing
    resolve: jest.fn((...args) => {
      // Special case for DEFAULT_OUTPUT_DIR to ensure security check passes
      if (args[0] === actualPathModule.join(actualPathModule.resolve('src/utils'), '../../output')) {
        return actualPathModule.join(MOCK_CWD_INTERNAL, 'output');
      }
      
      let pathString = actualPathModule.join(...args);
      if (!actualPathModule.isAbsolute(pathString)) {
        pathString = actualPathModule.join(MOCK_CWD_INTERNAL, pathString);
      }
      return actualPathModule.normalize(pathString);
    }),
    // __dirname in pdf-utils.js will be its actual directory.
    // If tests need to mock __dirname for path.join(__dirname, ...), it's complex.
    // For now, assume pdf-utils.js uses __dirname correctly and our resolve mock handles the rest.
  };
});

jest.mock('pdf-lib', () => {
  const mockPdfDocInstance = {
    copyPages: jest.fn().mockResolvedValue([{ /* page1 */ }, { /* page2 */ }]), // Represents copied page objects
    getPageIndices: jest.fn().mockReturnValue([0, 1]),
    addPage: jest.fn(),
    save: jest.fn().mockResolvedValue(Buffer.from('merged pdf bytes')),
  };
  return {
    PDFDocument: {
      create: jest.fn().mockResolvedValue(mockPdfDocInstance),
      load: jest.fn().mockResolvedValue(mockPdfDocInstance),
    },
  };
});

describe('PDF Utils', () => {
  beforeAll(() => {
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterAll(() => {
    console.error.mockRestore();
  });

  beforeEach(() => {
    jest.clearAllMocks(); // Clears all mocks, including fs and path

    // Default fs mock implementations
    require('fs').existsSync.mockReturnValue(true); // Assume files/dirs exist by default
    require('fs').readFileSync.mockReturnValue(Buffer.from('fake pdf data'));
    require('fs').promises.writeFile.mockResolvedValue(undefined);

    // path.resolve is mocked at the module level.
    // path.join, path.dirname, etc., will use actual implementations due to {...actualPathModule}
  });

  describe('ensureDirectoryExists', () => {
    it('should create directory if it does not exist', () => {
      const dirPath = 'some/test/dir'; // Relative path
      require('fs').existsSync.mockReturnValueOnce(false); // Specific mock for this test
      
      const result = ensureDirectoryExists({ dirPath });

      expect(result.success).toBe(true);
      expect(result.dirPath).toBe(dirPath);
      expect(require('fs').mkdirSync).toHaveBeenCalledWith(dirPath, { recursive: true });
    });

    it('should not create directory if it already exists', () => {
      const dirPath = 'some/existing/dir';
      require('fs').existsSync.mockReturnValueOnce(true); // Specific mock
      
      const result = ensureDirectoryExists({ dirPath });

      expect(result.success).toBe(true);
      expect(require('fs').mkdirSync).not.toHaveBeenCalled();
    });
  });

  describe('savePdf', () => {
    // DEFAULT_OUTPUT_DIR in pdf-utils.js is path.join(__dirname, '../../output')
    // __dirname in pdf-utils.js is 'src/utils'
    // So, DEFAULT_OUTPUT_DIR becomes 'src/utils/../../output' which resolves to 'output' relative to CWD.
    // The mocked path.resolve will make this MOCK_CWD/output.
    const resolvedDefaultOutputDir = path.resolve(MOCK_CWD, 'output');

    it('should save PDF buffer to file and create directory if it does not exist', async () => {
      const pdfBuffer = Buffer.from('pdf content');
      // outputPath is relative to CWD. savePdf will resolve it.
      // It must be within the resolvedDefaultOutputDir for the security check.
      const outputPath = 'output/new_dir_for_save/file.pdf';
      const resolvedOutputPath = path.resolve(MOCK_CWD, outputPath); // Expected path for writeFile
      const dirToCreate = path.dirname(outputPath); // 'output/new_dir_for_save' (relative)

      // Before calling savePdf, ensure that our path mocking works correctly
      // and that the security check in savePdf will pass
      require('path').resolve.mockImplementation((p) => {
        if (p === outputPath) return resolvedOutputPath;
        if (p === DEFAULT_OUTPUT_DIR) return path.resolve(MOCK_CWD, 'output');
        return p;
      });

      // Mock for ensureDirectoryExists:
      // fs.existsSync(dirToCreate) should return false.
      require('fs').existsSync.mockImplementation(p => {
        if (p === dirToCreate) return false; // Directory does not exist
        return true; // Other checks (like for parent of DEFAULT_OUTPUT_DIR if any)
      });
      
      const result = await savePdf({ pdfBuffer, outputPath });

      expect(result.success).toBe(true);
      // ensureDirectoryExists is called with relative path `dirToCreate`
      expect(require('fs').mkdirSync).toHaveBeenCalledWith(dirToCreate, { recursive: true });
      // savePdf calls writeFile with the resolved path
      expect(require('fs').promises.writeFile).toHaveBeenCalledWith(resolvedOutputPath, pdfBuffer);
    });

    it('should save PDF buffer to file if directory already exists', async () => {
      const pdfBuffer = Buffer.from('pdf content');
      const outputPath = 'output/existing_dir_for_save/file.pdf';
      const resolvedOutputPath = path.resolve(MOCK_CWD, outputPath);
      const existingDir = path.dirname(outputPath);

      // Setup path resolution for security check to pass
      require('path').resolve.mockImplementation((p) => {
        if (p === outputPath) return resolvedOutputPath;
        if (p === DEFAULT_OUTPUT_DIR) return path.resolve(MOCK_CWD, 'output');
        return p;
      });

      // Mock for ensureDirectoryExists:
      // fs.existsSync(existingDir) should return true.
      require('fs').existsSync.mockImplementation(p => {
        if (p === existingDir) return true;
        return true; // Other checks should pass
      });
      
      const result = await savePdf({ pdfBuffer, outputPath });

      expect(result.success).toBe(true);
      expect(require('fs').mkdirSync).not.toHaveBeenCalled();
      expect(require('fs').promises.writeFile).toHaveBeenCalledWith(resolvedOutputPath, pdfBuffer);
    });
  });

  describe('processSinglePdf', () => {
    it('should process a PDF and add its pages to target document', async () => {
      const pdfPath = 'path/to/some/file.pdf'; // Relative path
      const mockTargetDocInstance = require('pdf-lib').PDFDocument.create(); // Get instance from mock

      // fs.existsSync for pdfPath
      require('fs').existsSync.mockImplementation(p => p === pdfPath);
      // fs.readFileSync for pdfPath
      const pdfBytes = Buffer.from('specific pdf data for this test');
      require('fs').readFileSync.mockImplementation(p => {
        if (p === pdfPath) return pdfBytes;
        return Buffer.from('other data');
      });

      // PDFDocument.load will be called with pdfBytes
      const loadedPdfDocMock = { getPageIndices: () => [0, 1], /* other methods */ };
      require('pdf-lib').PDFDocument.load.mockResolvedValue(loadedPdfDocMock);
      
      const result = await processSinglePdf({
        pdfPath,
        targetDoc: await mockTargetDocInstance, // ensure it's the resolved instance
      });

      expect(result.success).toBe(true);
      expect(result.pagesAdded).toBe(2); // Based on mock getPageIndices and copyPages
      expect(require('fs').readFileSync).toHaveBeenCalledWith(pdfPath);
      expect(require('pdf-lib').PDFDocument.load).toHaveBeenCalledWith(pdfBytes);
      const resolvedTargetDoc = await mockTargetDocInstance;
      expect(resolvedTargetDoc.copyPages).toHaveBeenCalledWith(loadedPdfDocMock, [0, 1]);
      expect(resolvedTargetDoc.addPage).toHaveBeenCalledTimes(2);
    });
  });

  describe('mergePdfs', () => {
    // outputPath for mergePdfs is relative to CWD.
    // The internal call to savePdf (or direct writeFileSync in mergePdfs) will use this.
    // ensureDirectoryExists is called with path.dirname(outputPath).

    it('should merge multiple PDFs into a single file, creating output dir', async () => {
      const pdfPaths = ['input/doc1.pdf', 'input/doc2.pdf'];
      const outputPath = 'output/merged_docs_new_dir/final.pdf'; // Relative to CWD
      const outputDir = path.dirname(outputPath); // 'output/merged_docs_new_dir'

      // Mock for ensureDirectoryExists (called by mergePdfs for outputDir)
      // fs.existsSync(outputDir) should be false
      require('fs').existsSync.mockImplementation(p => {
        if (p === outputDir) return false; // Output directory for merged PDF doesn't exist
        if (pdfPaths.includes(p)) return true; // Input PDFs exist
        return false; // Default for other checks
      });

      // Mock for processSinglePdf's fs.readFileSync and PDFDocument.load
      // These are covered by the global mocks and the processSinglePdf test setup,
      // but we can be more specific if needed.
      // For simplicity, assume processSinglePdf works as tested above.
      // The mock for PDFDocument.create() returns an instance that has .save()
      
      const result = await mergePdfs({ pdfPaths, outputPath });

      expect(result.success).toBe(true);
      expect(result.outputPath).toBe(outputPath);
      // ensureDirectoryExists for outputDir
      expect(require('fs').mkdirSync).toHaveBeenCalledWith(outputDir, { recursive: true });
      // mergePdfs writes the file directly using fs.writeFileSync
      expect(require('fs').writeFileSync).toHaveBeenCalledWith(outputPath, Buffer.from('merged pdf bytes')); // From PDFDocument.save mock
      expect(result.results.successfulMerges).toBe(pdfPaths.length);
    });

    it('should handle partial failures gracefully', async () => {
      const pdfPaths = ['input/good.pdf', 'input/failing.pdf'];
      const outputPath = 'output/merged_partial_failure/final.pdf';
      const outputDir = path.dirname(outputPath);

      // Mock fs.existsSync: output dir exists, good.pdf exists, failing.pdf does NOT exist
      require('fs').existsSync.mockImplementation(p => {
        if (p === outputDir) return true;
        if (p === 'input/good.pdf') return true;
        if (p === 'input/failing.pdf') return false; // This will cause processSinglePdf to fail for it
        return false;
      });
      
      // processSinglePdf will return { success: false, error: ... } for 'input/failing.pdf'
      // because fs.existsSync(pdfPath) will be false.

      const result = await mergePdfs({ pdfPaths, outputPath });

      expect(result.success).toBe(true); // Overall success if at least one PDF is processed
      expect(result.results.successfulMerges).toBe(1);
      expect(result.results.failedMerges).toBe(1);
      expect(result.results.errors[0]).toContain('PDF file does not exist: input/failing.pdf');
      expect(require('fs').writeFileSync).toHaveBeenCalledWith(outputPath, Buffer.from('merged pdf bytes'));
    });
  });
});
