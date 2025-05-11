# Gmail Invoice PDF Collector

This tool retrieves emails from a Gmail account, identifies invoices and receipts using a lightweight LLM, downloads all PDF attachments, and merges them into one consolidated PDF file.

## Features
- Fetch all emails from a Gmail account
- Use LLM to classify relevant messages (invoice/receipt)
- Download PDF attachments from filtered emails
- Merge all valid PDFs into a single file
- Supports mock mode for testing without real Gmail access

## Setup

### 1. Google Cloud Credentials
- Create a project at https://console.cloud.google.com/
- Enable the Gmail API
- Create OAuth 2.0 credentials.
- Download `credentials.json` and ensure it is excluded from version control (e.g., add it to `.gitignore`) or stored securely using a secrets management tool.

### 2. Install Dependencies
```bash
pip install -r requirements.txt
3. Run the Script
bash
Copy
Edit
python run.py
Modes
Mock mode: Uses sample emails and PDFs (default)

Real mode: Requires live Gmail and LLM API access

Outputs
output/merged.pdf: Final merged PDF

output/pdfs/: Individual downloaded PDFs

output/errors.log: Any processing issues
