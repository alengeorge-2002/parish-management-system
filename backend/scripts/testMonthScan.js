const fs = require('fs');
const path = require('path');

const text = fs.readFileSync(path.join(__dirname, '../scratch_eng_pdf.txt'), 'utf8');
const lines = text.split('\n');

console.log('Total lines in scratch_eng_pdf.txt:', lines.length);

// Search for month headers like "January 2026", "February 2026", etc.
const monthNames = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

lines.forEach((line, idx) => {
  const trimmed = line.trim();
  monthNames.forEach(m => {
    if (trimmed.toLowerCase().includes(m.toLowerCase()) && trimmed.includes('2026')) {
      console.log(`Line ${idx + 1}: ${trimmed}`);
    }
  });
});
