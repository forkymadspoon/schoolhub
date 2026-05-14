#!/usr/bin/env node
// Adds the "Your data, your way" feature card to LandingPage.tsx
// Run: node scripts/patch-landing-page.js

const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const filePath = join(__dirname, '../apps/web/src/pages/LandingPage.tsx');

let content = readFileSync(filePath, 'utf8');

const featureCard = `
        {/* Data portability */}
        <div className="flex flex-col gap-3 rounded-card bg-card p-5 shadow-sm">
          <div className="w-10 h-10 rounded-2xl bg-primary-soft flex items-center justify-center">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" className="text-primary">
              <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
              <polyline points="7 10 12 15 17 10" />
              <line x1="12" y1="15" x2="12" y2="3" />
            </svg>
          </div>
          <div>
            <h3 className="font-semibold text-ink text-sm">Your data, your way</h3>
            <p className="text-muted text-xs leading-relaxed mt-1">Export everything as JSON — schedules, progress, badges — and import it on any device. No lock-in, ever.</p>
          </div>
        </div>`;

const markers = [
  'Mental health guardrails',
  'Wellbeing guardrails',
  'mental health',
  'Exam countdown',
  'exam countdown',
  'Spaced repetition',
  'spaced repetition',
  'Gamification',
  'gamification',
  'SEN',
];

let inserted = false;
for (const marker of markers) {
  const idx = content.lastIndexOf(marker);
  if (idx !== -1) {
    let closeIdx = content.indexOf('</div>', idx);
    if (closeIdx !== -1) {
      closeIdx = content.indexOf('</div>', closeIdx + 6);
      if (closeIdx !== -1) {
        content = content.slice(0, closeIdx + 6) + featureCard + content.slice(closeIdx + 6);
        inserted = true;
        console.log('Inserted after "' + marker + '" card');
        break;
      }
    }
  }
}

if (!inserted) {
  console.error('Could not find a feature card marker. First 2000 chars:');
  console.log(content.substring(0, 2000));
  process.exit(1);
}

writeFileSync(filePath, content, 'utf8');
console.log('LandingPage.tsx updated. Run: git diff apps/web/src/pages/LandingPage.tsx');
