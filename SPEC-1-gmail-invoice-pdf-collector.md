# SPEC-1: Gmail Invoice PDF Collector

## 1. Introduction & Overview

This document describes a minimal, production-oriented system for retrieving invoice and receipt PDFs from a single Gmail account using the Gmail API. The system emphasizes simplicity, maintainability, and fastest time to delivery, with minimal assumptions and no unnecessary complexity.

### Objectives
- Extract all PDF attachments from emails that likely contain invoices or receipts.
- Use LLM-assisted filtering (via a prompt) to determine if an email contains an invoice/receipt.
- Merge all valid PDFs into a single output file.
- Minimize implementation complexity and external dependencies.
- Enable mock-based development with no real Gmail or LLM access required.

### Assumptions
- A single Gmail account is used (no multi-user support).
- Only PDF attachments are handled (no conversion from other formats).
- No metadata or content extraction is performed from the PDFs.
- System does not modify original emails or store them.
- 
“Easy testing/deployment” means:
  - CLI-based, no UI
  - Minimal setup, one-command execution
  - No Docker, no cloud — local only
  - Uses GitHub-hosted LLM with no API key initially
- In any design fork, the simpler solution always wins.

---

## 2. Goals & Objectives

### Goals
- Retrieve all emails from Gmail.
- Identify invoice/receipt-related emails using LLM prompts.
- Download all PDF attachments from relevant emails.
- Merge the PDFs into a single file.
- Log all successes, failures, and skipped items.

### Objectives
- Fast MVP delivery with minimal logic.
- No database or cloud services.
- Pure CLI execution.
- Everything testable in mock mode before real integration.

---

## 3. Scope

### In Scope
- Access Gmail via API or mock.
- Identify relevant emails using LLM prompt-based filtering.
- Download and merge only PDF attachments.
- Save outputs to local filesystem.
- Provide logs for skipped or errored items.

### Out of Scope
- Any form of structured data extraction from PDF
- Multi-user handling
- UI or Web deployment
- Real-time processing
- Persistent storage or cloud integration

---

## 4. Method

### Workflow

1. **Authenticate to Gmail** (or simulate via mock).
2. **Fetch all emails**, using pagination if necessary.
3. **Classify emails** using LLM with subject + body text.
4. **Filter and download PDF attachments** from matched messages.
5. **Merge PDFs** into a single output file.
6. **Log** any issues and output stats.

### LLM Prompt Structure
- Input: subject + body text
- Output:
```json
{
  "is_invoice": true,
  "confidence": 0.93,
  "reason": "Identified keywords like 'invoice', 'payment', 'total'"
}
```
Format can be swapped or extended later
## 5. Implementation

### 5.1 Mock System
- Mock email set (emails.json)
- Mock LLM responses
- Local test PDFs

### 5.2 LLM Filter Logic
- Accept email text
- Return static classification results

### 5.3 PDF Collection & Merge
- Loop through mock responses
- Collect PDFs and merge valid ones
- Skip malformed or unreadable files

### 5.4 End-to-End Local Flow
- Chain the above into a single script
- Add logging and output handling

### 5.5 Real Integration
- Connect to Gmail API
- Connect to hosted LLM API (GitHub-based)
- Swap mocks with real functions

### 5.6 Package
- Final README.md
- CLI command with optional flags
- Output folder and logs

Mock LLM responses

Local test PDFs

### Step 2: LLM Filter Logic
Accept email text

Return static classification results

### Step 3: PDF Collection & Merge
Loop through mock responses

Collect PDFs and merge valid ones
- Use `PyPDF2` or similar library to handle PDF operations
- Implement try/except blocks to catch PDF processing errors
- Track successfully processed PDFs vs failures
- Use a sequential file naming scheme for organized output
Skip malformed or unreadable files

### Step 4: End-to-End Local Flow
Chain the above into a single script

Add logging and output handling

### Step 5: Real Integration
Connect to Gmail API

Connect to hosted LLM API (GitHub-based)

Swap mocks with real functions

### Step 6: Package
Final README.md

CLI command with optional flags

Output folder and logs

## 6. Milestones

### Mocked System Foundation

### LLM Filtering Logic (Mocked)

### PDF Handling Pipeline

### End-to-End Flow (Mocked)

### Gmail API Integration

### Real LLM Integration

### Packaging & Documentation

## 7. Gathering Results

### Success Criteria
PDFs merged correctly from identified emails

Script runs fully with one command

No user interaction needed after setup

No email data modified or deleted

### Evaluation
Validate on known test set

Manual log review

Test mock mode + real mode
