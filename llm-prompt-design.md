LLM Prompt Design
Input
Email subject

Email body (plaintext)

Output (JSON)
json
Copy
Edit
{
  "is_invoice": true,
  "confidence": 0.94,
  "reason": "Contains keywords like 'invoice', 'total', and PDF attachment"
}
Prompt wording is subject to iteration. Any LLM that accepts text input and produces structured output can be swapped in.
