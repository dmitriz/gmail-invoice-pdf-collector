/**
 * Mock LLM service for email classification
 * This mimics the behavior of an LLM API for testing purposes
 * Following functional programming paradigm with single object input/output
 */

// Constants
const INVOICE_KEYWORDS = [
  'invoice', 'receipt', 'payment', 'bill', 'transaction',
  'purchase', 'order', 'confirmation', 'paid', 'amount'
];

const CONFIDENCE_THRESHOLDS = {
  HIGH_MIN: 0.8,
  HIGH_MAX: 1.0,
  LOW_MIN: 0.1,
  LOW_MAX: 0.4
};

/**
 * Finds invoice-related keywords in the text
 * @param {Object} params - Parameters
 * @param {string} params.text - Text to analyze
 * @param {string[]} params.keywords - Keywords to look for
 * @returns {Object} Result with matches
 */
const findKeywords = ({ text, keywords = INVOICE_KEYWORDS }) => {
  const lowercaseText = text.toLowerCase();
  const matches = keywords.filter(keyword => lowercaseText.includes(keyword));
  return {
    matches,
    hasMatches: matches.length > 0
  };
};

/**
 * Generates a confidence score
 * @param {Object} params - Parameters
 * @param {boolean} params.isInvoice - Whether text is identified as invoice
 * @returns {number} Confidence score between 0 and 1
 */
const generateConfidence = ({ isInvoice }) => {
  if (isInvoice) {
    return CONFIDENCE_THRESHOLDS.HIGH_MIN + 
      (Math.random() * (CONFIDENCE_THRESHOLDS.HIGH_MAX - CONFIDENCE_THRESHOLDS.HIGH_MIN));
  } else {
    return CONFIDENCE_THRESHOLDS.LOW_MIN + 
      (Math.random() * (CONFIDENCE_THRESHOLDS.LOW_MAX - CONFIDENCE_THRESHOLDS.LOW_MIN));
  }
};

/**
 * Analyzes email content to determine if it contains an invoice or receipt
 * @param {Object} params - Parameters for classification
 * @param {string} params.subject - Email subject
 * @param {string} params.body - Email body text
 * @returns {Promise<Object>} Classification result
 */
const classifyEmail = ({ subject, body }) => {
  return new Promise((resolve) => {
    // Combine subject and body for analysis
    const combinedText = `${subject} ${body}`;
    
    // Find relevant keywords
    const keywordResult = findKeywords({ text: combinedText });
    const isInvoice = keywordResult.hasMatches;
    
    // Generate confidence score
    const confidence = generateConfidence({ isInvoice });
    
    // Build response
    const result = {
      is_invoice: isInvoice,
      confidence,
      reason: isInvoice 
        ? `Identified keywords: ${keywordResult.matches.join(', ')}` 
        : 'No invoice-related keywords found'
    };
    
    resolve(result);
  });
}

module.exports = {
  classifyEmail,
  findKeywords,
  generateConfidence,
  INVOICE_KEYWORDS,
  CONFIDENCE_THRESHOLDS
};
