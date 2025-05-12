/**
 * Unit tests for invoice collector
 */
const path = require('path');
const fs = require('fs');
const { 
  processInvoices, 
  processEmail, 
  initOutputDirs 
} = require('../invoice-collector');

// Mock dependencies
jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

// Mock file system operations
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  mkdirSync: jest.fn(),
  writeFileSync: jest.fn(),
  readFileSync: jest.fn()
}));

describe('Invoice Collector', () => {
  beforeEach(() => {
    // Reset all mocks
    jest.clearAllMocks();
    
    // Default behavior for fs.existsSync
    fs.existsSync.mockReturnValue(true);
    
    // Default behavior for fs.readFileSync (mock PDF data)
    fs.readFileSync.mockReturnValue(Buffer.from('mock pdf content'));
  });
  
  describe('initOutputDirs', () => {
    it('should create output directories if they do not exist', () => {
      // Setup
      fs.existsSync.mockReturnValueOnce(false).mockReturnValueOnce(false);
      
      // Execute
      const result = initOutputDirs({ outputDir: '/test/output' });
      
      // Verify
      expect(result.success).toBe(true);
      expect(fs.mkdirSync).toHaveBeenCalledTimes(2);
      expect(result.outputDir).toBe('/test/output');
      expect(result.pdfsDir).toBe(path.join('/test/output', 'pdfs'));
    });
    
    it('should return success if directories already exist', () => {
      // Setup
      fs.existsSync.mockReturnValue(true);
      
      // Execute
      const result = initOutputDirs({ outputDir: '/test/output' });
      
      // Verify
      expect(result.success).toBe(true);
      expect(fs.mkdirSync).not.toHaveBeenCalled();
    });
  });
  
  describe('processEmail', () => {
    it('should process invoice email with PDF attachments', async () => {
      // Setup
      const mockEmail = {
        subject: 'Your Invoice',
        body: 'Please find attached invoice',
        attachments: ['invoice.pdf', 'receipt.pdf']
      };
      
      const mock-llmService = {
        classifyEmail: jest.fn().mockResolvedValue({
          is_invoice: true,
          confidence: 0.9,
          reason: 'Contains invoice keywords'
        })
      };
      
      const mock-gmailService = {
        getAttachment: jest.fn().mockResolvedValue({
          success: true,
          data: Buffer.from('mock pdf content')
        })
      };
      
      const stats = {};
      
      // Execute
      const result = await processEmail({
        email: mockEmail,
        index: 0,
        llmService: mock-llmService,
        gmailService: mock-gmailService,
        pdfsDir: '/test/output/pdfs',
        confidenceThreshold: 0.7,
        stats
      });
      
      // Verify
      expect(result.emailProcessed).toBe(true);
      expect(result.downloadedPdfs.length).toBe(2);
      expect(mock-llmService.classifyEmail).toHaveBeenCalledTimes(1);
      expect(mock-gmailService.getAttachment).toHaveBeenCalledTimes(2);
      expect(stats.invoiceEmails).toBe(1);
      expect(stats.pdfAttachments).toBe(2);
      expect(stats.downloadedPdfs).toBe(2);
    });
    
    it('should skip non-invoice emails', async () => {
      // Setup
      const mockEmail = {
        subject: 'Hello',
        body: 'Just saying hi',
        attachments: ['document.pdf']
      };
      
      const mock-llmService = {
        classifyEmail: jest.fn().mockResolvedValue({
          is_invoice: false,
          confidence: 0.2,
          reason: 'No invoice keywords'
        })
      };
      
      const mock-gmailService = {
        getAttachment: jest.fn()
      };
      
      // Execute
      const result = await processEmail({
        email: mockEmail,
        index: 0,
        llmService: mock-llmService,
        gmailService: mock-gmailService,
        pdfsDir: '/test/output/pdfs'
      });
      
      // Verify
      expect(result.emailProcessed).toBe(true);
      expect(result.downloadedPdfs.length).toBe(0);
      expect(mock-llmService.classifyEmail).toHaveBeenCalledTimes(1);
      expect(mock-gmailService.getAttachment).not.toHaveBeenCalled();
    });
  });
  
  describe('processInvoices', () => {
    it('should process all emails and merge PDFs', async () => {
      // Setup
      const mockEmails = [
        {
          subject: 'Invoice #123',
          body: 'Please find invoice attached',
          attachments: ['invoice123.pdf']
        },
        {
          subject: 'Receipt',
          body: 'Your receipt',
          attachments: ['receipt.pdf']
        },
        {
          subject: 'Hello',
          body: 'Just saying hi',
          attachments: []
        }
      ];
      
      const mock-gmailService = {
        listEmails: jest.fn().mockResolvedValue({
          success: true,
          emails: mockEmails
        }),
        getAttachment: jest.fn().mockResolvedValue({
          success: true,
          data: Buffer.from('mock pdf content')
        })
      };
      
      const mock-llmService = {
        classifyEmail: jest.fn()
          .mockResolvedValueOnce({
            is_invoice: true,
            confidence: 0.9,
            reason: 'Invoice keywords'
          })
          .mockResolvedValueOnce({
            is_invoice: true,
            confidence: 0.8,
            reason: 'Receipt keywords'
          })
          .mockResolvedValueOnce({
            is_invoice: false,
            confidence: 0.1,
            reason: 'No keywords'
          })
      };
      
      // Execute
      const stats = await processInvoices({
        gmailService: mock-gmailService,
        llmService: mock-llmService,
        outputDir: '/test/output'
      });
      
      // Verify
      expect(stats.totalEmails).toBe(3);
      expect(stats.invoiceEmails).toBe(2);
      expect(stats.pdfAttachments).toBe(2);
      expect(stats.downloadedPdfs).toBe(2);
      expect(mock-gmailService.listEmails).toHaveBeenCalledTimes(1);
      expect(mock-llmService.classifyEmail).toHaveBeenCalledTimes(3);
    });
  });
});
