Method
This system retrieves emails from Gmail, filters them with an LLM to find invoices/receipts, downloads PDF attachments, and merges them into a single file.

Workflow
Authenticate via OAuth to access Gmail

Fetch all emails using Gmail API

Use LLM to classify if an email is an invoice/receipt

Download all PDF attachments from matching emails

Merge PDFs into one output file

Log failures or skipped files
