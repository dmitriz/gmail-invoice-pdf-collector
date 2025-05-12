/**
 * Unit tests for index.js
 */
const { run } = require('../index');
const { createConfig } = require('../../config');
const { processInvoices } = require('../invoice-collector');

// Mock dependencies
jest.mock('../../config', () => ({
  createConfig: jest.fn(),
  defaultConfig: {
    outputDir: './output',
    confidenceThreshold: 0.7
  }
}));

jest.mock('../invoice-collector', () => ({
  processInvoices: jest.fn()
}));

jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn()
  }
}));

describe('Index Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    
    // Default behavior for createConfig
    createConfig.mockImplementation((options) => ({
      realMode: false,
      outputDir: './output',
      confidenceThreshold: 0.7,
      ...options
    }));
    
    // Default behavior for processInvoices
    processInvoices.mockResolvedValue({
      totalEmails: 10,
      invoiceEmails: 5,
      pdfAttachments: 7,
      downloadedPdfs: 6,
      errors: 0
    });
  });
  
  it('should run in mock mode by default', async () => {
    // Execute
    const result = await run();
    
    // Verify
    expect(result.success).toBe(true);
    expect(processInvoices).toHaveBeenCalledTimes(1);
    expect(processInvoices).toHaveBeenCalledWith(expect.objectContaining({
      outputDir: expect.any(String),
      confidenceThreshold: expect.any(Number)
    }));
  });
  
  it('should handle errors during processing', async () => {
    // Setup
    processInvoices.mockRejectedValueOnce(new Error('Test error'));
    
    // Execute
    const result = await run();
    
    // Verify
    expect(result.success).toBe(false);
    expect(result.error).toBe('Test error');
  });
  
  it('should warn if real mode is selected but not implemented', async () => {
    // Setup
    createConfig.mockReturnValueOnce({
      realMode: true,
      outputDir: './output',
      confidenceThreshold: 0.7
    });
    
    // Execute
    await run({ realMode: true });
    
    // Verify
    expect(processInvoices).toHaveBeenCalledTimes(1);
  });
  
  it('should pass custom options to configuration', async () => {
    // Execute
    await run({
      outputDir: './custom-output',
      confidenceThreshold: 0.8
    });
    
    // Verify
    expect(createConfig).toHaveBeenCalledWith({
      outputDir: './custom-output',
      confidenceThreshold: 0.8
    });
  });
});
