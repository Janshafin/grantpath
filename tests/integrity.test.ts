import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const projectRoot = path.resolve(__dirname, '../');

function getAllFiles(dirPath: string, arrayOfFiles: string[] = []) {
  const files = fs.readdirSync(dirPath);

  files.forEach(function(file) {
    // Ignore build folders, node_modules, and env templates
    if (['node_modules', '.git', 'dist', '.env.example', '.env'].includes(file)) return;
    
    if (fs.statSync(dirPath + "/" + file).isDirectory()) {
      arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles);
    } else {
      // Only scan source code files
      if (file.endsWith('.ts') || file.endsWith('.tsx') || file.endsWith('.js')) {
        arrayOfFiles.push(path.join(dirPath, "/", file));
      }
    }
  });

  return arrayOfFiles;
}

describe('Environmental Integrity (CI/CD Scanner)', () => {
  const allSourceFiles = getAllFiles(projectRoot);

  it('Ensures no hardcoded "localhost" URLs remain in the source code', () => {
    const infringingFiles: string[] = [];

    allSourceFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      // Look for explicit hardcoded development URLs (concatenated to prevent self-matching)
      if (content.includes('http://' + 'localhost') || content.includes('https://' + 'localhost')) {
        infringingFiles.push(file.replace(projectRoot, ''));
      }
    });

    expect(infringingFiles, `Deployment Blocked: Found hardcoded localhost URLs in: ${infringingFiles.join(', ')}`).toHaveLength(0);
  });

  it('Ensures no Anthropic API keys are hardcoded in the codebase', () => {
    const infringingFiles: string[] = [];
    
    // Anthropic API keys typically follow the sk-ant-* pattern
    const anthropicKeyRegex = /sk-ant-[a-zA-Z0-9-_]+/g;

    allSourceFiles.forEach(file => {
      const content = fs.readFileSync(file, 'utf-8');
      if (anthropicKeyRegex.test(content)) {
        infringingFiles.push(file.replace(projectRoot, ''));
      }
    });

    expect(infringingFiles, `Deployment Blocked: Found leaked Anthropic API keys in: ${infringingFiles.join(', ')}`).toHaveLength(0);
  });
});
