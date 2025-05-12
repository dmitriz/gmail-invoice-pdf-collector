# GitHub Copilot Repository Instructions [CRITICAL]

=============================================
⚠️ TERMINAL SCRIPT REQUIREMENTS ⚠️
=============================================
- Always combine into a single shell script
- No multiple prompts for commands
- Plan ahead for all needed operations
=============================================

## Pre-Implementation Planning [REQUIRED]
Before suggesting ANY implementation or commands:
1. First analyze the entire problem space
2. Identify ALL required changes/commands
3. Create ONE comprehensive solution
4. Present the solution as a single batch

## Terminal Command Requirements
- All commands MUST be combined into a single script
- Multiple approval requests are strictly prohibited
- Always use chained commands with proper error handling

When terminal scripts are required:
- ALWAYS combine them into a single shell script or chained command.
- NEVER prompt multiple times for individual commands.
- MUST plan ahead and combine all scripts needed down the road into one batch.

# GitHub Copilot Instructions

## ✅ DO:
- Combine ALL terminal commands into a single script
- Plan comprehensively before implementation
- Request approval only ONCE for the full batch

## ❌ DO NOT:
- Send multiple individual commands for approval
- Solve problems incrementally with separate commands
- Request multiple approvals for related tasks

## ESLint Configuration [REQUIRED]

- Avoid redundant or conflicting ESLint configs. Stick to one, preferably `.eslintrc.js`, or none at all.


[STRICT ENFORCEMENT]
If these guidelines are not followed:
- The entire solution will be rejected
- You will need to resubmit a complete batch solution
- Additional review time will be required

Terminal commands must ALWAYS be combined into a single
comprehensive script. No exceptions.

# 🧠 GitHub Copilot Task Workflow Guide

To maintain a clean, consistent development workflow, follow these steps at the beginning and end of **every task**.

---

## ✅ Beginning of Task

1. **Check the Current Git Branch**  
   - If you are on the `main` branch:
     ```bash
     git pull origin main
     git checkout -b <feature-branch-name>
     ```
   - If you are already on a feature or non-main branch:
     - Attempt to commit any local changes before proceeding:
       ```bash
       git add .
       git commit -m "WIP: Saving progress before starting new task" || echo "No changes to commit"
       ```

---

## 🧪 End of Task

2. **Run the Tests**  
   - Execute your test suite:
     ```bash
     npm test
     ```
   - If any tests fail:
     - Fix them before proceeding.

---

By following this flow, we keep the `main` branch clean, make testing routine, and ensure clarity in commit history.
