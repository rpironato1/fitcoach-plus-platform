#!/usr/bin/env node

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix useAuth test timeout issues
const fixUseAuthTimeouts = (content) => {
  // Pattern to find test functions that need async fixes
  const testPattern = /it\('([^']+)', async \(\) => \{([^}]+const { result } = renderHook\(\(\) => useAuth\(\)\);)([^}]+)await waitFor\(/g;
  
  content = content.replace(testPattern, (match, testName, setup, middle) => {
    // Skip if already has act with timer advancement
    if (middle.includes('vi.runAllTimers()')) {
      return match;
    }
    
    const fixedMiddle = middle.replace(
      /(\s*)(await waitFor\()/,
      `$1await act(async () => {
$1  vi.runAllTimers();
$1  await new Promise(resolve => setTimeout(resolve, 10));
$1});

$1$2`
    );
    
    return `it('${testName}', async () => {${setup}${fixedMiddle}await waitFor(`;
  });
  
  return content;
};

const filePath = path.join(__dirname, 'src/modules/auth/hooks/useAuth.test.ts');
if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = fixUseAuthTimeouts(content);
  fs.writeFileSync(filePath, content);
  console.log('Fixed useAuth timeout issues');
}

console.log('Script complete!');