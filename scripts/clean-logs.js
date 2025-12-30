const fs = require('fs');
const path = require('path');

const filesToClean = [
  'src/lib/services/donations.ts',
  'src/lib/services/assetIssuance.ts',
  'src/lib/services/benefits.ts',
  'src/lib/services/issuerAccounts.ts',
  'src/lib/stellar/client.ts',
  'src/lib/stellar/xbull-connector.ts',
  'src/app/api/donations/route.ts',
  'src/app/api/projects/[id]/route.ts',
  'src/app/api/projects/[id]/create-issuer/route.ts',
  'src/app/api/projects/[id]/fund-issuer/route.ts',
  'src/app/api/projects/[id]/roadmap/route.ts',
];

const debugPatterns = [
  /console\.log\(['"`]🔍.*?\);?\n/g,
  /console\.log\(['"`]📋.*?\);?\n/g,
  /console\.log\(['"`]✅.*?\);?\n/g,
  /console\.log\(['"`]❌.*?\);?\n/g,
  /console\.log\(['"`]🎁.*?\);?\n/g,
  /console\.log\(['"`]📊.*?\);?\n/g,
  /console\.log\(['"`]🎯.*?\);?\n/g,
  /console\.log\(['"`]🔑.*?\);?\n/g,
  /console\.log\(['"`]📤.*?\);?\n/g,
  /console\.log\(['"`]🎉.*?\);?\n/g,
  /console\.log\(['"`]ℹ️.*?\);?\n/g,
  /console\.log\(['"`]⏳.*?\);?\n/g,
  /console\.log\(['"`]🔐.*?\);?\n/g,
  /console\.log\(['"`]🔄.*?\);?\n/g,
  /console\.log\(['"`]\[API.*?\);?\n/g,
  /console\.log\(['"`]\[DONATION.*?\);?\n/g,
  /console\.log\(['"`]\[ASSET.*?\);?\n/g,
  /console\.log\(['"`]\[BENEFITS.*?\);?\n/g,
  /console\.error\(['"`]❌.*?\);?\n/g,
];

filesToClean.forEach(file => {
  const filePath = path.join(process.cwd(), file);
  
  if (!fs.existsSync(filePath)) {
    console.log(`⚠️  File not found: ${file}`);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');
  const originalLength = content.length;

  debugPatterns.forEach(pattern => {
    content = content.replace(pattern, '');
  });

  if (content.length !== originalLength) {
    fs.writeFileSync(filePath, content, 'utf8');
    console.log(`✅ Cleaned: ${file}`);
  } else {
    console.log(`✓  No changes: ${file}`);
  }
});

console.log('\n✨ Debug logs cleaned!');
