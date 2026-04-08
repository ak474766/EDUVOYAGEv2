const fs = require('fs');
const path = require('path');

const srcDir = path.join(__dirname, 'scrabed', 'images');
const destDir = path.join(__dirname, 'public');

const files = [
  'home_about.png',
  'educational-impact.jpg',
  'great-value.jpg',
  'sefety-experience.jpg',
  'dedicated-support.jpg',
  'EramHoldingslogo.png',
  'WYSEBSMELogo.png'
];

files.forEach(f => {
  const src = path.join(srcDir, f);
  const dest = path.join(destDir, f);
  try {
    fs.copyFileSync(src, dest);
    console.log('OK: ' + f);
  } catch(e) {
    console.log('FAIL: ' + f + ' - ' + e.message);
  }
});

console.log('DONE');
