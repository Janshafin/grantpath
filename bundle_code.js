import fs from 'fs';
import path from 'path';

const ignoreDirs = ['node_modules', '.git', 'dist', 'grantpath_landing_search', 'grantpath_scholarship_results', 'grantpath_application_draft_panel', 'grounded_scholar'];
const exts = ['.ts', '.tsx', '.js', '.json', '.html', '.css'];

let combinedCode = '';

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        if (ignoreDirs.includes(file)) continue;
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            scanDir(fullPath);
        } else {
            if (exts.includes(path.extname(file)) || file === '.env.example') {
                if (file === 'package-lock.json' || file === 'bundle_code.js') continue;
                const content = fs.readFileSync(fullPath, 'utf8');
                combinedCode += `\n\n=========================================\n`;
                combinedCode += `FILE: ${fullPath}\n`;
                combinedCode += `=========================================\n\n`;
                combinedCode += content;
            }
        }
    }
}

scanDir('.');

fs.writeFileSync('grantpath_all_code.txt', combinedCode);
console.log('Code bundled successfully to grantpath_all_code.txt');
