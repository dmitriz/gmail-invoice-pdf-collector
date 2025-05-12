/**
 * Comprehensive tests for the mock Gmail service
 */
const fs = require('fs');
const path = require('path');
const {
  listEmails,
  getAttachment,
  loadMockEmails,
  readJsonFile,
  hasAllowedExtension,
  MOCK_DATA_DIR,
} = require('../mocks/mock-gmail');

// Mock dependencies
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readFileSync: jest.fn(),
}));

jest.mock('path', () => {
  // Keep the real path.extname functionality
  const originalPath = jest.requireActual('path');
  return {
    ...originalPath,
    join: jest.fn((...args) => args.join('/')),
  };
});

describe('Mock Gmail Service', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('readJsonFile', () => {
    it('should read and parse JSON file successfully', () => {
      // Setup
      const mockJsonContent = '{"emails": [{"subject": "Test Email"}]}';
      fs.readFileSync.mockReturnValueOnce(mockJsonContent);

      // Execute
      const result = readJsonFile({ filePath: 'test.json' });

      // Verify
      expect(result.success).toBe(true);
      expect(result.data).toEqual({ emails: [{ subject: 'Test Email' }] });
    });

    it('should handle file read errors', () => {
      // Setup
      fs.readFileSync.mockImplementationOnce(() => {
        throw new Error('File not found');
      });

      // Execute
      const result = readJsonFile({ filePath: 'test.json' });

      // Verify
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.data).toEqual([]);
    });

    it('should handle invalid JSON', () => {
      // Setup
      fs.readFileSync.mockReturnValueOnce('{ invalid json }');

      // Execute
      const result = readJsonFile({ filePath: 'test.json' });

      // Verify
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.data).toEqual([]);
    });
  });

  describe('loadMockEmails', () => {
    it('should load emails from the default path if not specified', () => {
      // Setup
      const mockEmails = [{ subject: 'Test Email' }];
      fs.readFileSync.mockReturnValueOnce(JSON.stringify(mockEmails));

      // Execute
      const result = loadMockEmails();

      // Verify
      expect(result.success).toBe(true);
      expect(result.emails).toEqual(mockEmails);
    });

    it('should load emails from a custom path if specified', () => {
      // Setup
      const mockEmails = [{ subject: 'Custom Email' }];
      const customPath = 'custom/path/emails.json';
      fs.readFileSync.mockReturnValueOnce(JSON.stringify(mockEmails));

      // Execute
      const result = loadMockEmails({ emailsPath: customPath });

      // Verify
      expect(result.success).toBe(true);
      expect(result.emails).toEqual(mockEmails);
      expect(fs.readFileSync).toHaveBeenCalledWith(customPath, 'utf8');
    });
  });

  describe('listEmails', () => {
    it('should return a list of emails asynchronously', async () => {
      // Setup
      const mockEmails = [
        { subject: 'Email 1', attachments: ['file1.pdf'] },
        { subject: 'Email 2', attachments: ['file2.pdf'] },
      ];
      fs.readFileSync.mockReturnValueOnce(JSON.stringify(mockEmails));

      // Execute
      const result = await listEmails();

      // Verify
      expect(result.success).toBe(true);
      expect(result.emails).toEqual(mockEmails);
    });

    it('should handle errors when loading emails', async () => {
      // Setup
      fs.readFileSync.mockImplementationOnce(() => {
        throw new Error('File not found');
      });

      // Execute
      const result = await listEmails();

      // Verify
      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
      expect(result.emails).toEqual([]);
    });
  });

  describe('hasAllowedExtension', () => {
    it('should return true for allowed extensions', () => {
      // Execute
      const result = hasAllowedExtension({ filename: 'test.pdf' });

      // Verify
      expect(result.isAllowed).toBe(true);
      expect(result.extension).toBe('.pdf');
      expect(result.error).toBeNull();
    });

    it('should return false for disallowed extensions', () => {
      // Execute
      const result = hasAllowedExtension({ filename: 'test.exe' });

      // Verify
      expect(result.isAllowed).toBe(false);
      expect(result.extension).toBe('.exe');
      expect(result.error).toBeDefined();
    });

    it('should handle custom allowed extensions', () => {
      // Execute
      const result = hasAllowedExtension({
        filename: 'test.jpg',
        allowedExtensions: ['.jpg', '.png'],
      });

      // Verify
      expect(result.isAllowed).toBe(true);
      expect(result.extension).toBe('.jpg');
    });

    it('should be case insensitive', () => {
      // Execute
      const result = hasAllowedExtension({ filename: 'test.PDF' });

      // Verify
      expect(result.isAllowed).toBe(true);
      expect(result.extension).toBe('.pdf');
    });
  });

  describe('getAttachment', () => {
    it('should return attachment data when file exists', async () => {
      // Setup
      const mockBuffer = Buffer.from('mock pdf content');
      fs.existsSync.mockReturnValueOnce(true);
      fs.readFileSync.mockReturnValueOnce(mockBuffer);

      // Execute
      const result = await getAttachment({
        emailId: 1,
        attachmentName: 'invoice.pdf',
        samplePdfsDir: 'test/pdfs',
      });

      // Verify
      expect(result.success).toBe(true);
      expect(result.data).toBe(mockBuffer);
      expect(result.contentType).toBe('application/pdf');
      expect(path.join).toHaveBeenCalledWith('test/pdfs', 'invoice.pdf');
    });

    it('should reject with error when file has disallowed extension', async () => {
      // Execute and verify
      await expect(getAttachment({ emailId: 1, attachmentName: 'malicious.exe' })).rejects.toThrow(
        'File type .exe not allowed'
      );
    });

    it('should reject with error when file does not exist', async () => {
      // Setup
      fs.existsSync.mockReturnValueOnce(false);

      // Execute and verify
      await expect(getAttachment({ emailId: 1, attachmentName: 'missing.pdf' })).rejects.toThrow(
        'Attachment missing.pdf not found'
      );
    });

    it('should reject with error when file read fails', async () => {
      // Setup
      fs.existsSync.mockReturnValueOnce(true);
      fs.readFileSync.mockImplementationOnce(() => {
        throw new Error('Permission denied');
      });

      // Execute and verify
      await expect(getAttachment({ emailId: 1, attachmentName: 'protected.pdf' })).rejects.toEqual({
        success: false,
        error: expect.objectContaining({
          message: expect.stringContaining('Permission denied'),
        }),
      });
    });
  });
});
