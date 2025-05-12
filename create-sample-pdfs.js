/**
 * Simple script to create sample PDFs for testing
 */
const fs = require('fs');
const path = require('path');
const { PDFDocument } = require('pdf-lib');

/**
 * Creates a PDF file with the specified name and text content in the `mock-data/sample-pdfs` directory.
 *
 * @param {string} name - The filename for the generated PDF.
 * @param {string} text - The text to be added to the PDF page.
 * @returns {Promise<void>}
 */
async function createSamplePdf(name, text) {
  console.log(`Creating sample PDF: ${name}`);
  
  const pdfDoc = await PDFDocument.create();
  const page = pdfDoc.addPage();
  
  // Add some text to the PDF
  page.drawText(text, { x: 50, y: 700 });
  
  // Save the PDF
  const pdfBytes = await pdfDoc.save();
  const outputPath = path.join(__dirname, 'mock-data', 'sample-pdfs', name);
  
  fs.writeFileSync(outputPath, pdfBytes);
  console.log(`Created ${outputPath} (${pdfBytes.length} bytes)`);
}

/**
 * Generates sample PDF files for testing by ensuring the target directory exists and creating example documents.
 *
 * @returns {Promise<void>}
 */
async function main() {
  // Make sure the directory exists
  const dir = path.join(__dirname, 'mock-data', 'sample-pdfs');
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  
  // Create sample PDFs
  await createSamplePdf('invoice1.pdf', 'Sample Invoice 1');
  await createSamplePdf('receipt2.pdf', 'Sample Receipt 2');
  
  console.log('Done creating sample PDFs');
}

main().catch(error => {
  console.error('Error creating sample PDFs:', error);
  process.exit(1);
});
