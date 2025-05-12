/**
 * Unit tests for mock LLM service
 * Following minimalistic approach with flat test structure
 */
const {
  classifyEmail,
  findKeywords,
  generateConfidence,
  // INVOICE_KEYWORDS not used in tests
} = require('../mocks/mock-llm');

describe('Mock LLM Functions', () => {
  it('findKeywords should find invoice keywords in text', () => {
    // Setup
    const text = 'This is an invoice for your recent purchase';

    // Execute
    const result = findKeywords({ text });

    // Verify
    expect(result.hasMatches).toBe(true);
    expect(result.matches).toContain('invoice');
    expect(result.matches).toContain('purchase');
  });

  it('findKeywords should not find keywords in unrelated text', () => {
    // Setup
    const text = 'This is just a friendly message';

    // Execute
    const result = findKeywords({ text });

    // Verify
    expect(result.hasMatches).toBe(false);
    expect(result.matches.length).toBe(0);
  });

  it('findKeywords should handle case insensitivity', () => {
    // Setup
    const text = 'Please find your INVOICE attached';

    // Execute
    const result = findKeywords({ text });

    // Verify
    expect(result.hasMatches).toBe(true);
    expect(result.matches).toContain('invoice');
  });

  it('findKeywords should support custom keywords', () => {
    // Setup
    const text = 'Your annual subscription fee';
    const keywords = ['subscription', 'annual', 'fee'];

    // Execute
    const result = findKeywords({ text, keywords });

    // Verify
    expect(result.hasMatches).toBe(true);
    expect(result.matches).toContain('subscription');
    expect(result.matches).toContain('annual');
    expect(result.matches).toContain('fee');
  });

  it('generateConfidence should generate high confidence for invoice emails', () => {
    // Execute
    const confidence = generateConfidence({ isInvoice: true });

    // Verify
    expect(confidence).toBeGreaterThanOrEqual(0.8);
    expect(confidence).toBeLessThanOrEqual(1.0);
  });

  it('generateConfidence should generate low confidence for non-invoice emails', () => {
    // Execute
    const confidence = generateConfidence({ isInvoice: false });

    // Verify
    expect(confidence).toBeGreaterThanOrEqual(0.1);
    expect(confidence).toBeLessThanOrEqual(0.4);
  });

  it('classifyEmail should classify email as invoice when relevant keywords are present', async () => {
    // Setup
    const subject = 'Your Invoice #12345';
    const body = 'Please find attached the invoice for your recent order.';

    // Execute
    const result = await classifyEmail({ subject, body });

    // Verify
    expect(result.is_invoice).toBe(true);
    expect(result.confidence).toBeGreaterThanOrEqual(0.8);
    expect(result.reason).toContain('Identified keywords');
  });

  it('classifyEmail should not classify email as invoice when no keywords are present', async () => {
    // Setup
    const subject = 'Hello there';
    const body = 'Just checking in to see how you are doing.';

    // Execute
    const result = await classifyEmail({ subject, body });

    // Verify
    expect(result.is_invoice).toBe(false);
    expect(result.confidence).toBeLessThanOrEqual(0.4);
    expect(result.reason).toBe('No invoice-related keywords found');
  });
});
