#!/usr/bin/env node
// Fixes LandingPage.tsx:
//  1. Removes all misplaced data-portability cards from the mobile nav section
//  2. Adds "Your Data, Your Way" as feature 07 in the FEATURES array
//  3. Updates subtitle copy from "Six" → "Seven"
// Run from VS Code terminal:
//   node scripts/patch-landing-page.js

const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const filePath = join(__dirname, '../apps/web/src/pages/LandingPage.tsx');
let content = readFileSync(filePath, 'utf8');

// ── Step 1: Remove ALL misplaced data portability cards ───────────────────────
let removedCount = 0;
while (content.includes('{/* Data portability */}')) {
  const markerIdx = content.indexOf('{/* Data portability */}');

  // Walk back to include the preceding newline + whitespace
  let removeStart = markerIdx;
  while (removeStart > 0 && content[removeStart - 1] !== '\n') removeStart--;
  if (removeStart > 0) removeStart--; // include the \n itself

  // Find the <div that follows the marker
  const divStart = content.indexOf('<div', markerIdx);
  if (divStart === -1) {
    console.error('Found marker but no <div after it — aborting.');
    process.exit(1);
  }

  // Walk forward counting <div depth to find the matching </div>
  let depth = 0;
  let pos = divStart;
  let removeEnd = -1;
  while (pos < content.length) {
    if (content.slice(pos, pos + 4) === '<div' && /[\s>]/.test(content[pos + 4] ?? '')) {
      depth++;
      pos += 4;
    } else if (content.slice(pos, pos + 6) === '</div>') {
      depth--;
      if (depth === 0) {
        removeEnd = pos + 6;
        break;
      }
      pos += 6;
    } else {
      pos++;
    }
  }

  if (removeEnd === -1) {
    console.error('Could not find closing </div> for data portability card — aborting.');
    process.exit(1);
  }

  content = content.slice(0, removeStart) + content.slice(removeEnd);
  removedCount++;
  console.log(`Removed misplaced data portability card #${removedCount}.`);
}

if (removedCount === 0) {
  console.log('No misplaced cards found — skipping removal step.');
}

// ── Step 2: Add feature 07 to the FEATURES array ─────────────────────────────
const lastFeatureMarker = "num: '06'";
const lastFeatureIdx = content.indexOf(lastFeatureMarker);
if (lastFeatureIdx === -1) {
  console.error("Could not find feature num: '06' in FEATURES array — aborting.");
  process.exit(1);
}

// Check if feature 07 is already present
if (content.includes("num: '07'")) {
  console.log("Feature 07 already exists — skipping insertion.");
} else {
  // Find the end of the line containing feature 06
  const lineEnd = content.indexOf('\n', lastFeatureIdx);
  if (lineEnd === -1) {
    console.error('Could not find end of feature 06 line — aborting.');
    process.exit(1);
  }

  const newEntry = `\n  { num: '07', icon: '📤', title: 'Your Data, Your Way',       body: 'Export everything as JSON — schedules, progress, and badges — then import on any device. Your data, zero lock-in.', tag: 'No lock-in, ever', blue: false },`;
  content = content.slice(0, lineEnd) + newEntry + content.slice(lineEnd);
  console.log('Added feature 07 to FEATURES array.');
}

// ── Step 3: Update subtitle copy ─────────────────────────────────────────────
const oldCopy = 'Six core capabilities that work together to build confident, capable learners';
const newCopy = 'Seven core capabilities that work together to build confident, capable learners';
if (content.includes(oldCopy)) {
  content = content.replace(oldCopy, newCopy);
  console.log('Updated subtitle from "Six" to "Seven".');
} else if (content.includes(newCopy)) {
  console.log('Subtitle already says "Seven" — skipping.');
} else {
  console.warn('Warning: could not find subtitle copy to update.');
}

// ── Write ─────────────────────────────────────────────────────────────────────
writeFileSync(filePath, content, 'utf8');
console.log('\nDone. LandingPage.tsx updated successfully.');
