#!/bin/bash

# Comprehensive script to finalize and test the Gmail Invoice PDF Collector project
# You can run this once to complete all remaining tasks

# === START: Make the script file executable ===
echo "Making test-runner.js executable..."
chmod +x test-runner.js

# === START: Run tests with Jest ===
echo "Running tests..."
node test-runner.js

# === START: Cleanup any duplicate test files ===
echo "Cleaning up duplicate test files..."
find ./src/__tests__ -name "*[A-Z]*.test.js" -exec rm -v {} \;

# === START: Remove old coverage files ===
echo "Cleaning coverage directory..."
rm -rf coverage

# === START: Run tests with coverage ===
echo "Running tests with coverage..."
npm run test:full

# === START: Run validator ===
echo "Running validation (format, lint, test)..."
npm run validate

# === START: Final git cleanup and status ===
echo "Cleaning up and preparing for commit..."
git add .
git status

# === START: Final instructions ===
echo ""
echo "All tasks completed! You can now commit the changes with:"
echo "git commit -m \"Refactor to functional style, improve docs, fix naming conventions\""
echo ""
