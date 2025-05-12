/**
 * Unit tests for PDF utilities
 */
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');
const { 
  savePdf, 
  mergePdfs, 
  ensureDirectoryExists,
  processSinglePdf
} = require('../utils/pdf-utils');

// Mock dependencies
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn()
}));

jest.mock('path', () => ({
  dirname: jest.fn(),
  join: jest.fn((a, b) => `${a}/${b}`),
  resolve: jest.fn()
}));

jest.mock('pdf-lib', () => {
  // Create a mock PDFDocument with the methods we use
  const mockDoc = {
    copyPages: jest.fn().mockResolvedValue([{}, {}]),
    getPageIndices: jest.fn().mockReturnValue([0, 1]),
    addPage: jest.fn(),
    save: jest.fn().mockResolvedValue(Buffer.from('merged pdf'))
  };
  
  return {
    PDFDocument: {
      create: jest.fn().mockResolvedValue(mockDoc),
      load: jest.fn().mockResolvedValue(mockDoc)
    }
  };
});

describe('PDF Utils', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Set default behaviors
    fs.existsSync.mockReturnValue(true);
    path.dirname.mockImplementation((p) => p.split('/').slice(0, -1).join('/') || '/');
    fs.readFileSync.mockReturnValue(Buffer.from('pdf data'));
  });
  
  describe('ensureDirectoryExists', () => {
    it('should create directory if it does not exist', () => {
      // Setup
      fs.existsSync.mockReturnValueOnce(false);
      const dirPath = '/test/dir';
      
      // Execute
      const result = ensureDirectoryExists({ dirPath });
      
      // Verify
      expect(result.success).toBe(true);
      expect(result.dirPath).toBe(dirPath);
      expect(fs.mkdirSync).toHaveBeenCalledWith(dirPath, { recursive: true });
    });
    
    it('should not create directory if it already exists', () => {
      // Setup
      fs.existsSync.mockReturnValueOnce(true);
      const dirPath = '/test/dir';
      
      // Execute
      const result = ensureDirectoryExists({ dirPath });
      
      // Verify
      expect(result.success).toBe(true);
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });
  });
  
  describe('savePdf', () => {
    it('should save PDF buffer to file', async () => {
      // Setup
      const pdfBuffer = Buffer.from('pdf content');
      const outputPath = '/test/output/file.pdf';
      path.dirname.mockReturnValueOnce('/test/output');
      
      // Execute
      const result = await savePdf({ pdfBuffer, outputPath });
      
      // Verify
      expect(result.success).toBe(true);
      expect(fs.writeFileSync).toHaveBeenCalledWith(outputPath, pdfBuffer);
    });
    
    it('should create directory if it does not exist', async () => {
      // Setup
      fs.existsSync.mockReturnValueOnce(false);
      const pdfBuffer = Buffer.from('pdf content');
      const outputPath = '/test/output/file.pdf';
      path.dirname.mockReturnValueOnce('/test/output');
      
      // Execute
      const result = await savePdf({ pdfBuffer, outputPath });
      
      // Verify
      expect(result.success).toBe(true);
      expect(fs.mkdirSync).toHaveBeenCalled();
      expect(fs.writeFileSync).toHaveBeenCalled();
    });
  });
  
  describe('processSinglePdf', () => {
    it('should process a PDF and add its pages to target document', async () => {
      // Setup
      const pdfPath = '/test/pdf/file.pdf';
      const mockTargetDoc = {
        copyPages: jest.fn().mockResolvedValue([{}, {}]),
        addPage: jest.fn()
      };
      
      // Execute
      const result = await processSinglePdf({
        pdfPath,
        targetDoc: mockTargetDoc
      });
      
      // Verify
      expect(result.success).toBe(true);
      expect(result.pagesAdded).toBe(2);
      expect(fs.readFileSync).toHaveBeenCalledWith(pdfPath);
      expect(mockTargetDoc.addPage).toHaveBeenCalledTimes(2);
    });
  });
  
  describe('mergePdfs', () => {
    it('should merge multiple PDFs into a single file', async () => {
      // Setup
      const pdfPaths = ['/test/pdf/file1.pdf', '/test/pdf/file2.pdf'];
      const outputPath = '/test/output/merged.pdf';
      path.dirname.mockReturnValueOnce('/test/output');
      
      // Execute
      const result = await mergePdfs({ pdfPaths, outputPath });
      
      // Verify
      expect(result.success).toBe(true);
      expect(result.outputPath).toBe(outputPath);
      expect(fs.writeFileSync).toHaveBeenCalledWith(outputPath, expect.any(Buffer));
      expect(result.results.successfulMerges).toBe(2);
    });
    
    it('should handle partial failures gracefully', async () => {
      // Setup
      const pdfPaths = ['/test/pdf/file1.pdf', '/test/pdf/bad.pdf'];
      const outputPath = '/test/output/merged.pdf';
      path.dirname.mockReturnValueOnce('/test/output');
      
      // Make the second PDF fail to process
      fs.readFileSync.mockImplementation((path) => {
        if (path === '/test/pdf/bad.pdf') {
          throw new Error('Invalid PDF');
        }
        return Buffer.from('pdf data');
      });
      
      // Execute
      const result = await mergePdfs({ pdfPaths, outputPath });
      
      // Verify
      expect(result.success).toBe(true); // Overall process should still succeed
      expect(result.results.successfulMerges).toBe(1);
      expect(result.results.failedMerges).toBe(1);
    });
  });
});
