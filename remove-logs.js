const fs = require('fs');
const path = require('path');

function removeConsoleLogs(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  const originalLength = content.length;
  
  // Remove console.log statements (including multi-line)
  content = content.replace(/console\.log\([^;]*\);?\n?/gs, '');
  
  // Remove console.error statements (including multi-line) 
  content = content.replace(/console\.error\([^;]*\);?\n?/gs, '');
  
  // Remove console.warn statements
  content = content.replace(/console\.warn\([^;]*\);?\n?/gs, '');
  
  // Clean up multiple empty lines
  content = content.replace(/\n\n\n+/g, '\n\n');
  
  if (content.length !== originalLength) {
    fs.writeFileSync(filePath, content, 'utf8');
    return true;
  }
  return false;
}

function walkDir(dir, callback) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory()) {
      if (!file.includes('node_modules') && !file.includes('.next')) {
        walkDir(filePath, callback);
      }
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      callback(filePath);
    }
  });
}

let filesModified = 0;
walkDir('./src', (filePath) => {
  if (removeConsoleLogs(filePath)) {
    console.log(`✅ Cleaned: ${filePath}`);
    filesModified++;
  }
});

console.log(`\n✨ Done! Modified ${filesModified} files`);
