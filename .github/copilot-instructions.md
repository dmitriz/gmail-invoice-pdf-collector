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

## Minimalism Principles [REQUIRED]

- Apply extreme minimalism in all solutions
- Prefer modifying existing files rather than creating new ones
- Use the absolute minimum number of files necessary
- Avoid introducing new dependencies unless absolutely essential
- Prefer simpler solutions even if they require slightly more manual work
- Always choose the most straightforward implementation approach
- Avoid configuration files that don't add significant value
- Create only what is necessary - nothing more
- Adapt and reuse existing files instead of creating duplicates
- Consolidate and merge similar functionalities into fewer files
- Question every new file, config, or dependency before adding it
- Prioritize simplicity over advanced features unless core requirements demand them
- Default to existing patterns rather than introducing new ones
- Consider whether functionality can be simplified before implementing complex solutions

## Focus and Precision Requirements [CRITICAL]

- ONLY make changes that have been explicitly requested
- DO NOT remove or modify existing functionality without specific direction
- DO NOT modify files or code that aren't part of the current task
- KEEP all essential components even when simplifying:
  - Essential components include: GitHub workflow files (minimal but required), .gitignore with complete entries
- When simplifying, explain what you're removing and why BEFORE making changes
- ALWAYS get confirmation before removing anything that might be useful
- FOCUS exclusively on the task at hand without introducing tangential changes
- Maintain consistency with existing code patterns unless explicitly asked to change them
- DO NOT silently remove entries or configurations - get explicit approval first
- CREATE FILES DIRECTLY without creating scripts that require user approval for simple file creation/updates
- AVOID UNNECESSARY APPROVAL REQUESTS for file creation or modification operations
- BATCH EXECUTION COMMANDS (not file creation commands) into scripts when multiple steps are needed

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
     - DO NOT switch back to main - stay on the current branch
     - Pull latest changes from remote for the current branch:
       ```bash
       git pull origin $(git branch --show-current)
       ```
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
