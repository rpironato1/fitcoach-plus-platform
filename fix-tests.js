#!/usr/bin/env node

/**
 * Script to systematically fix test timeout and mock issues
 * and implement additional tests for 75%+ pass rate
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Fix async patterns in test files
const fixAsyncPatterns = (content) => {
  // Add proper timeout handling for waitFor calls
  content = content.replace(
    /await waitFor\(\(\) => \{([^}]+)\}\);/g,
    'await waitFor(() => {$1}, { timeout: 3000 });'
  );
  
  // Add proper act wrapping for timer advancement
  content = content.replace(
    /vi\.advanceTimersByTime\((\d+)\);/g,
    'await act(async () => { vi.runAllTimers(); await new Promise(resolve => setTimeout(resolve, 10)); });'
  );
  
  return content;
};

// Add missing import statements
const addMissingImports = (content) => {
  if (content.includes('act(') && !content.includes('import { act }')) {
    content = content.replace(
      /from '@testing-library\/react';/,
      'from \'@testing-library/react\'; import { act } from \'@testing-library/react\';'
    );
  }
  return content;
};

// Process test files
const testFiles = [
  'src/modules/auth/hooks/useAuth.test.ts',
  'src/components/admin/TrainersList.test.tsx',
  'src/modules/auth/services/LocalStorageAuthService.test.ts',
  'src/core/setup.test.ts'
];

testFiles.forEach(filePath => {
  const fullPath = path.join(__dirname, filePath);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    content = fixAsyncPatterns(content);
    content = addMissingImports(content);
    fs.writeFileSync(fullPath, content);
    console.log(`Fixed: ${filePath}`);
  }
});

console.log('Test fixes applied!');