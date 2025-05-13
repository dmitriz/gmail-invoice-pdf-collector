# PDF Utilities

A lightweight, flexible library for PDF manipulation, focused on file handling, merging, and basic operations.

## Features

- Save PDF buffers to file with directory creation
- Merge multiple PDF files into a single document
- Process individual PDF documents 
- Directory existence checks with automatic creation
- Secure path handling and validation

## Installation

```bash
npm install pdf-utils
```

## Usage

### Basic Usage

```javascript
const { savePdf, mergePdfs } = require('pdf-utils');

// Save a PDF buffer to a file
const savePdfResult = await savePdf({ 
  pdfBuffer: myPdfBuffer, 
  outputPath: './output/file.pdf' 
});

// Merge multiple PDFs into one
const mergePdfsResult = await mergePdfs({
  pdfPaths: ['./pdf1.pdf', './pdf2.pdf', './pdf3.pdf'],
  outputPath: './output/merged.pdf'
});
```

### Configuration

```javascript
const { configure, savePdf } = require('pdf-utils');

// Configure the library
configure({
  baseDir: './custom-output',
  allowOutsideBaseDir: true,
  createDirsIfMissing: true
});

// Now use the configured instance
const result = await savePdf({ 
  pdfBuffer: myPdfBuffer, 
  outputPath: './documents/file.pdf' 
});
```

## API Reference

### savePdf(options)

Saves a PDF buffer to a file.

**Parameters:**

- `options.pdfBuffer` (Buffer): The PDF data as Buffer
- `options.outputPath` (string): Where to save the PDF

**Returns:**

- Promise resolving to an object: Result object with success status and information

### mergePdfs(options)

Merges multiple PDF files into a single PDF.

**Parameters:**

- `options.pdfPaths` (Array of strings): Paths to the PDFs to merge
- `options.outputPath` (string): Where to save the merged PDF

**Returns:** 

- Promise resolving to an object: Result object with success status and information

### ensureDirectoryExists(options)

Ensures a directory exists, creating it if necessary.

**Parameters:**

- `options.dirPath` (string): Directory path to check/create

**Returns:**

- Object: Result object with success status

### processSinglePdf(options)

Processes a single PDF for operations like merging.

**Parameters:**

- `options.pdfPath` (string): Path to the PDF file
- `options.targetDoc` (PDFDocument): Target document to add pages to

**Returns:**

- Promise resolving to an object: Result object with success status

## License

MIT
