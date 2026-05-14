#!/usr/bin/env node
// Patches LoginPage.tsx handleLogin to check children count and redirect
// to /onboarding for first-time users.
// Run from VS Code terminal:
//   node scripts/patch-onboarding-flow.js

const { readFileSync, writeFileSync } = require('fs');
const { join } = require('path');

const web = join(__dirname, '../apps/web/src');

// ── LoginPage.tsx ─────────────────────────────────────────────────────────────

const loginPath = join(web, 'pages/LoginPage.tsx');
let login = readFileSync(loginPath, 'utf8');

// Check if handleLogin already has the children check (truly patched)
if (login.includes("api.get<Child[]>('/children')")) {
  console.log('LoginPage.tsx handleLogin already patched — skipping.');
} else {
  // Add api + Child imports if not already present
  if (!login.includes("import { api }")) {
    login = login.replace(
      `import { supabase } from '../services/supabase';`,
      `import { supabase } from '../services/supabase';\nimport { api } from '../services/api';\nimport type { Child } from '@schoolhub/types';`,
    );
  }

  // Replace the bare navigate('/') at the end of handleLogin
  const oldLogin = `    if (err) {
      setError(err.message);
      return;
    }
    navigate('/');
  }

  async function handleForgotPassword`;

  const newLogin = `    if (err) {
      setError(err.message);
      return;
    }
    try {
      const children = await api.get<Child[]>('/children');
      navigate(children.length === 0 ? '/onboarding' : '/', { replace: true });
    } catch {
      navigate('/', { replace: true });
    }
  }

  async function handleForgotPassword`;

  if (!login.includes(oldLogin)) {
    console.error('Could not find the expected handleLogin pattern in LoginPage.tsx.');
    console.error('Here is the relevant section:');
    const idx = login.indexOf('async function handleLogin');
    console.error(login.slice(idx, idx + 400));
    process.exit(1);
  }

  login = login.replace(oldLogin, newLogin);
  writeFileSync(loginPath, login, 'utf8');
  console.log('LoginPage.tsx patched — handleLogin now checks children count before redirecting.');
}

console.log('\nDone.');
