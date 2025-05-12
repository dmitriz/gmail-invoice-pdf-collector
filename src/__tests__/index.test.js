/**
 * Unit tests for the main index module
 */

const { run } = require('../index');
const { createConfig } = require('../../config');
const { processInvoices } = require('../invoice-collector');

// Mock dependencies
jest.mock('../../config', () => ({
  createConfig: jest.fn().mockReturnValue({
    realMode: false,
    outputDir: '/test/output',
    confidenceThreshold: 0.7,
  }),
  defaultConfig: {
    realMode: false,
    outputDir: './output',
    confidenceThreshold: 0.7,
  },
}));

jest.mock('../invoice-collector', () => ({
  processInvoices: jest.fn().mockResolvedValue({
    totalEmails: 5,
    invoiceEmails: 2,
    pdfAttachments: 3,
    downloadedPdfs: 3,
    errors: 0,
  }),
}));

jest.mock('../utils/logger', () => ({
  logger: {
    info: jest.fn(),
    error: jest.fn(),
    warn: jest.fn(),
    debug: jest.fn(),
  },
}));

// Mock services
jest.mock('../mocks/mock-gmail', () => ({}));
jest.mock('../mocks/mock-llm', () => ({}));

describe('Index Module', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('should run in mock mode by default', async () => {
    // Execute
    const result = await run();

    // Verify
    expect(result.success).toBe(true);
    expect(createConfig).toHaveBeenCalled();
    expect(processInvoices).toHaveBeenCalled();
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

  it('should fail when real mode is selected but not implemented', async () => {
    // Setup
    createConfig.mockReturnValueOnce({
      ...createConfig(),
      realMode: true,
    });

    // Execute
    const result = await run();

    // Verify
    expect(result.success).toBe(false);
    expect(result.error).toContain('Real mode requires API access');
  });

  it('should pass custom options to configuration', async () => {
    // Setup
    const options = {
      outputDir: '/custom/path',
      confidenceThreshold: 0.9,
    };

    // Execute
    await run(options);

    // Verify
    expect(createConfig).toHaveBeenCalledWith(options);
  });
});
