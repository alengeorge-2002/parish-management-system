const fs = require('fs');
const path = require('path');

const text = fs.readFileSync(path.join(__dirname, '../scratch_eng_pdf.txt'), 'utf8');
const lines = text.split('\n');

const BIBLE_BOOKS_ML = {
  'Gen': 'ഉൽപത്തി', 'Genesis': 'ഉൽപത്തി',
  'Ex': 'പുറപ്പാട്', 'Exodus': 'പുറപ്പാട്',
  'Lev': 'ലേവ്യർ', 'Leviticus': 'ലേവ്യർ',
  'Num': 'സംഖ്യ', 'Numbers': 'സംഖ്യ',
  'Deut': 'നിയമാവർത്തനം', 'Deuteronomy': 'നിയമാവർത്തനം',
  'Josh': 'ജോഷ്വ', 'Joshua': 'ജോഷ്വ',
  'Judg': 'ന്യായാധിപന്മാർ', 'Judges': 'ന്യായാധിപന്മാർ',
  'Ruth': 'റൂത്ത്',
  '1 Sam': '1 സാമുവൽ', '2 Sam': '2 സാമുവൽ',
  '1 Kings': '1 രാജാക്കന്മാർ', '2 Kings': '2 രാജാക്കന്മാർ',
  '1 Chron': '1 ദിനവൃത്താന്തം', '2 Chron': '2 ദിനവൃത്താന്തം',
  'Ezra': 'എസ്രാ', 'Neh': 'നെഹെമിയാ', 'Esth': 'എസ്തേർ',
  'Job': 'ജോബ്', 'Ps': 'സങ്കീർത്തനങ്ങൾ', 'Prov': 'സുഭാഷിതങ്ങൾ',
  'Eccles': 'സഭാപ്രസംഗകൻ', 'Song': 'ഉത്തമഗീതം',
  'Isa': 'ഏശയ്യാ', 'Isa.': 'ഏശയ്യാ', 'Is': 'ഏശയ്യാ', 'Is.': 'ഏശയ്യാ',
  'Jer': 'ജറെമിയാ', 'Jer.': 'ജറെമിയാ',
  'Lam': 'വിലാപങ്ങൾ', 'Ezek': 'ഹെസെക്കിയേൽ', 'Dan': 'ദാനീയേൽ',
  'Hos': 'ഹോസിയാ', 'Joel': 'ജോയേൽ', 'Amos': 'ആമോസ്',
  'Obad': 'ഒബാദിയാ', 'Jonah': 'യോനാ', 'Mic': 'മീഖാ',
  'Nah': 'നാഹൂം', 'Hab': 'ഹബക്കൂക്', 'Zeph': 'സെഫാനിയാ',
  'Hag': 'ഹഗ്ഗായി', 'Zech': 'സഖറിയാ', 'Mal': 'മലാക്കി',
  'Wis': 'ജ്ഞാനം', 'Sir': 'പ്രഭാഷകൻ', 'Bar': 'ബാറൂക്', 'Tob': 'തോബിത്', 'Jdt': 'യൂദിത്ത്',
  'Acts': 'നവ. നടപടികൾ',
  'Rom': 'റോമാ', 'Rom.': 'റോമാ',
  '1 Cor': '1 കോറിന്തോസ്', '1 Cor.': '1 കോറിന്തോസ്',
  '2 Cor': '2 കോറിന്തോസ്', '2 Cor.': '2 കോറിന്തോസ്',
  'Gal': 'ഗലാത്തിയാ', 'Gal.': 'ഗലാത്തിയാ',
  'Eph': 'എഫേസോസ്', 'Eph.': 'എഫേസോസ്',
  'Phil': 'ഫിലിപ്പി', 'Phil.': 'ഫിലിപ്പി',
  'Col': 'കൊളോസോസ്', 'Col.': 'കൊളോസോസ്',
  '1 Thess': '1 തെസ്സലോനിക്കാ', '2 Thess': '2 തെസ്സലോനിക്കാ',
  '1 Tim': '1 തിമോത്തെഓസ്', '1 Tim.': '1 തിമോത്തെഓസ്',
  '2 Tim': '2 തിമോത്തെഓസ്', '2 Tim.': '2 തിമോത്തെഓസ്',
  'Titus': 'തീത്തോസ്', 'Titus.': 'തീത്തോസ്',
  'Philem': 'ഫിലേമോൻ',
  'Heb': 'ഹെബ്രായർ', 'Heb.': 'ഹെബ്രായർ',
  'Jas': 'യാക്കോബ്', 'Jas.': 'യാക്കോബ്',
  '1 Pet': '1 പത്രോസ്', '1 Pet.': '1 പത്രോസ്',
  '2 Pet': '2 പത്രോസ്', '2 Pet.': '2 പത്രോസ്',
  '1 Jn': '1 യോഹന്നാൻ', '1 Jn.': '1 യോഹന്നാൻ',
  '2 Jn': '2 യോഹന്നാൻ', '3 Jn': '3 യോഹന്നാൻ',
  'Jude': 'യൂദാ',
  'Rev': 'വെളിപാട്',
  'Mt': 'മത്തായി', 'Mt.': 'മത്തായി',
  'Mk': 'മാർക്കോസ്', 'Mk.': 'മാർക്കോസ്',
  'Lk': 'ലൂക്കാ', 'Lk.': 'ലൂക്കാ',
  'Jn': 'യോഹന്നാൻ', 'Jn.': 'യോഹന്നാൻ'
};

function getMalayalamRef(refEn) {
  let refMl = refEn;
  // Match book name at beginning of refEn (e.g. "1 Cor 10:23-33" or "Rom 4:1-12" or "Mt 7:21-27")
  for (const [bookEn, bookMl] of Object.entries(BIBLE_BOOKS_ML)) {
    const regex = new RegExp(`^${bookEn.replace('.', '\\.')}\\b`, 'i');
    if (regex.test(refEn)) {
      refMl = refEn.replace(regex, bookMl);
      break;
    }
  }
  return refMl;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December"
];

let currentMonthIndex = 0; // January
let in2026Section = false;

const records = {};

// Regex for Bible reading start
const BIBLE_REF_REGEX = /^((?:[1-3]\s+)?[A-Z][a-z]{1,8}\.?)\s+(\d+[\d:\-,\s+\(\)]*)\s*(.*)/;

let activeDateStr = null;
let currentBlock = [];

lines.forEach((line) => {
  const t = line.trim();
  if (!t) return;

  // Check month header transition
  MONTHS.forEach((m, idx) => {
    if (t.toLowerCase().startsWith(m.toLowerCase()) && t.includes('2026')) {
      currentMonthIndex = idx;
      in2026Section = true;
    }
  });

  if (!in2026Section) return;

  // Check for day start: e.g. "1 Thu", "15 Sun", "31 Wed", " 1 Thu"
  const dayMatch = t.match(/^(?:\s*)?(\d{1,2})\s+(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\b/i);
  if (dayMatch) {
    const dNum = parseInt(dayMatch[1]);
    const mStr = String(currentMonthIndex + 1).padStart(2, '0');
    const dStr = String(dNum).padStart(2, '0');
    const dateKey = `2026-${mStr}-${dStr}`;

    // Process previous block
    if (activeDateStr && currentBlock.length > 0) {
      processBlock(activeDateStr, currentBlock);
    }

    activeDateStr = dateKey;
    currentBlock = [t];
  } else if (activeDateStr) {
    // Ignore footer/header noise like "-- 15 of 104 --", "Syro-Malabar Liturgical Calendar"
    if (!t.startsWith('--') && !t.includes('Syro-Malabar Liturgical Calendar')) {
      currentBlock.push(t);
    }
  }
});

// Process last block
if (activeDateStr && currentBlock.length > 0) {
  processBlock(activeDateStr, currentBlock);
}

function processBlock(dateStr, blockLines) {
  const dayHeader = blockLines[0];
  const restLines = blockLines.slice(1);

  let title = dayHeader.replace(/^(?:\s*)?\d{1,2}\s+(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s*/i, '').trim();
  let readings = [];
  let isHolyDay = dateStr === '2026-12-25' || dateStr === '2026-01-06' || dateStr === '2026-06-29' || dateStr === '2026-07-03' || dateStr === '2026-05-14' || dateStr === '2026-08-15';
  let isFast = false;

  restLines.forEach(l => {
    if (l.toLowerCase().includes('fast') || l.toLowerCase().includes('abstinence') || l.toLowerCase().includes('ash monday')) {
      isFast = true;
    }
    if (l.toLowerCase().includes('day of obligation')) {
      isHolyDay = true;
    }

    // Check if line looks like a scripture reference
    const refMatch = l.match(/^((?:[1-3]\s+)?[A-Za-z]+(?:\.|\s+[A-Za-z]+)?)\s+(\d+[\d:\-,\s+\(\)\+]*)(.*)/);
    if (refMatch) {
      const bName = refMatch[1].trim();
      const bVerses = refMatch[2].trim();
      const desc = refMatch[3].trim();
      const refEn = `${bName} ${bVerses}`;
      const refMl = getMalayalamRef(refEn);

      readings.push({
        referenceEn: refEn,
        referenceMl: refMl,
        descriptionEn: desc || refEn,
        descriptionMl: desc || refMl,
      });
    } else if (readings.length > 0 && !title) {
      // Append description continuation if readings parsed
    } else if (readings.length === 0 && l.length < 80 && !l.includes('2026')) {
      if (title) title += ` - ${l}`;
      else title = l;
    }
  });

  records[dateStr] = {
    dateString: dateStr,
    title: title || 'Liturgical Memorial',
    readings,
    isHolyDayOfObligation: isHolyDay,
    isFastDay: isFast,
  };
}

console.log('Total days parsed for 2026:', Object.keys(records).length);
console.log('Sample Jan 1:', JSON.stringify(records['2026-01-01'], null, 2));
console.log('Sample Mar 19:', JSON.stringify(records['2026-03-19'], null, 2));
console.log('Sample Oct 2:', JSON.stringify(records['2026-10-02'], null, 2));
console.log('Sample Dec 25:', JSON.stringify(records['2026-12-25'], null, 2));
