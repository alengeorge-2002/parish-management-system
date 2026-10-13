const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const { PDFParse } = require('pdf-parse');

const MONGO_URI = process.env.MONGODB_URI || process.env.MONGO_URI || 'mongodb://127.0.0.1:27017/devagiri_parish_db';

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
  for (const [bookEn, bookMl] of Object.entries(BIBLE_BOOKS_ML)) {
    const regex = new RegExp(`^${bookEn.replace('.', '\\.')}\\b`, 'i');
    if (regex.test(refEn)) {
      refMl = refEn.replace(regex, bookMl);
      break;
    }
  }
  return refMl;
}

// Define Calendar Mongoose Schema
const CalendarSchema = new mongoose.Schema({
  dateString: { type: String, required: true, unique: true },
  season: { type: String, default: '' },
  seasonMl: { type: String, default: '' },
  title: { type: String, default: '' },
  titleMl: { type: String, default: '' },
  feastName: { type: String, default: '' },
  feastNameMl: { type: String, default: '' },
  readings: [
    {
      type: { type: String, default: '' },
      referenceEn: { type: String, required: true },
      referenceMl: { type: String, default: '' },
      descriptionEn: { type: String, default: '' },
      descriptionMl: { type: String, default: '' },
    },
  ],
  isHolyDayOfObligation: { type: Boolean, default: false },
  isFastDay: { type: Boolean, default: false },
}, { timestamps: true });

const Calendar = mongoose.models.Calendar || mongoose.model('Calendar', CalendarSchema);

// Define Event Mongoose Schema for cross-compatibility
const EventSchema = new mongoose.Schema({
  target_date: { type: mongoose.Schema.Types.Mixed, required: true },
  title_en: { type: String, required: true },
  title_ml: { type: String, default: '' },
  description_en: { type: String, default: '' },
  description_ml: { type: String, default: '' },
  title: { type: String, default: '' },
  event_date: { type: mongoose.Schema.Types.Mixed, default: null },
  mass_time: { type: String, default: '6:30 AM' },
  type_badge: { type: String, default: 'Feast Day' },
  location: { type: String, default: 'Main Sanctuary' },
  description: { type: String, default: '' },
  readings: { type: Array, default: [] },
}, { timestamps: true });

const Event = mongoose.models.Event || mongoose.model('Event', EventSchema);

async function runIngestion() {
  try {
    console.log('Connecting to MongoDB at', MONGO_URI);
    await mongoose.connect(MONGO_URI);
    console.log('Connected to MongoDB successfully.');

    let textContent = '';
    const engPdfPath = path.join(__dirname, '../docs/syro-malabar-liturgical-calendar-2026-english.pdf');
    const scratchPath = path.join(__dirname, '../scratch_eng_pdf.txt');

    if (fs.existsSync(scratchPath)) {
      console.log('Reading from cached PDF text scratch file...');
      textContent = fs.readFileSync(scratchPath, 'utf8');
    } else if (fs.existsSync(engPdfPath)) {
      console.log('Parsing English Liturgical PDF via pdf-parse...');
      const buffer = fs.readFileSync(engPdfPath);
      const parser = new PDFParse(new Uint8Array(buffer));
      const res = await parser.getText();
      textContent = res.text || res.pages?.map(p => p.text).join('\n') || '';
    } else {
      throw new Error('English Liturgical PDF file not found!');
    }

    const lines = textContent.split('\n');
    const MONTHS = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    let currentMonthIndex = 0;
    let in2026Section = false;
    let activeDateStr = null;
    let currentBlock = [];
    const dailyRecords = {};

    lines.forEach((line) => {
      const t = line.trim();
      if (!t) return;

      MONTHS.forEach((m, idx) => {
        if (t.toLowerCase().startsWith(m.toLowerCase()) && t.includes('2026')) {
          currentMonthIndex = idx;
          in2026Section = true;
        }
      });

      if (!in2026Section) return;

      const dayMatch = t.match(/^(?:\s*)?(\d{1,2})\s+(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\b/i);
      if (dayMatch) {
        const dNum = parseInt(dayMatch[1]);
        const mStr = String(currentMonthIndex + 1).padStart(2, '0');
        const dStr = String(dNum).padStart(2, '0');
        const dateKey = `2026-${mStr}-${dStr}`;

        if (activeDateStr && currentBlock.length > 0) {
          parseAndSaveBlock(activeDateStr, currentBlock, dailyRecords);
        }

        activeDateStr = dateKey;
        currentBlock = [t];
      } else if (activeDateStr) {
        if (!t.startsWith('--') && !t.includes('Syro-Malabar Liturgical Calendar')) {
          currentBlock.push(t);
        }
      }
    });

    if (activeDateStr && currentBlock.length > 0) {
      parseAndSaveBlock(activeDateStr, currentBlock, dailyRecords);
    }

    const totalParsed = Object.keys(dailyRecords).length;
    console.log(`Successfully parsed ${totalParsed} daily records for 2026.`);

    // Upsert each record into MongoDB Calendar collection
    let upsertCount = 0;
    for (const [dateString, record] of Object.entries(dailyRecords)) {
      await Calendar.findOneAndUpdate(
        { dateString },
        { $set: record },
        { upsert: true, new: true }
      );

      // Sync into Event model as well for event queries
      const firstReadingDesc = record.readings?.[0]?.descriptionEn || record.title;
      await Event.findOneAndUpdate(
        { target_date: dateString },
        {
          $set: {
            target_date: dateString,
            event_date: dateString,
            title: record.title,
            title_en: record.title,
            title_ml: record.titleMl || record.title,
            description: firstReadingDesc,
            description_en: firstReadingDesc,
            description_ml: record.readings?.[0]?.descriptionMl || firstReadingDesc,
            type_badge: record.isHolyDayOfObligation ? 'Holy Day of Obligation' : record.isFastDay ? 'Fast Day' : 'Feast Day',
            readings: record.readings,
          }
        },
        { upsert: true }
      );
      upsertCount++;
    }

    console.log(`Upserted ${upsertCount} daily records into MongoDB Calendar & Event collections.`);
    await mongoose.disconnect();
    console.log('MongoDB connection closed cleanly.');
  } catch (err) {
    console.error('Ingestion error:', err);
    process.exit(1);
  }
}

function parseAndSaveBlock(dateStr, blockLines, recordsDict) {
  const dayHeader = blockLines[0];
  const restLines = blockLines.slice(1);

  let rawTitle = dayHeader.replace(/^(?:\s*)?\d{1,2}\s+(Sun|Mon|Tue|Wed|Thu|Fri|Sat)\s*/i, '').trim();
  let readings = [];
  let isHolyDay = dateStr === '2026-12-25' || dateStr === '2026-01-06' || dateStr === '2026-06-29' || dateStr === '2026-07-03' || dateStr === '2026-05-14' || dateStr === '2026-08-15';
  let isFast = false;
  let season = 'Ordinary Season';
  let seasonMl = 'സാധാരണ കാലം';

  const monthNum = parseInt(dateStr.split('-')[1]);
  if (monthNum === 1) {
    season = 'Season of Manifestation (Denha)';
    seasonMl = 'ദെൻഹാക്കാലം';
  } else if (monthNum === 2 || monthNum === 3) {
    season = 'Season of the Great Fast';
    seasonMl = 'വലിയ നോമ്പുകാലം';
  } else if (monthNum === 4 || monthNum === 5) {
    season = 'Season of Resurrection (Qyamtha)';
    seasonMl = 'ഉയിർപ്പു കാലം';
  } else if (monthNum === 6 || monthNum === 7) {
    season = 'Season of the Apostles (Sleehe)';
    seasonMl = 'ശ്ലീഹാക്കാലം';
  } else if (monthNum === 8 || monthNum === 9) {
    season = 'Season of Elijah-Cross-Moses';
    seasonMl = 'ഏലിയാ-സ്ലീവാ-മൂശെ കാലം';
  } else if (monthNum === 10 || monthNum === 11) {
    season = 'Season of Dedication of the Church';
    seasonMl = 'പള്ളിക്കൂദാശാക്കാലം';
  } else if (monthNum === 12) {
    season = 'Season of Annunciation-Nativity';
    seasonMl = 'ആഗമന-തിരുപ്പിറവി കാലം';
  }

  restLines.forEach(l => {
    if (l.toLowerCase().includes('fast') || l.toLowerCase().includes('abstinence') || l.toLowerCase().includes('ash monday')) {
      isFast = true;
    }
    if (l.toLowerCase().includes('day of obligation')) {
      isHolyDay = true;
    }

    const refMatch = l.match(/^((?:[1-3]\s+)?[A-Za-z]+(?:\.|\s+[A-Za-z]+)?)\s+(\d+[\d:\-,\s+\(\)\+]*)(.*)/);
    if (refMatch) {
      const bName = refMatch[1].trim();
      const bVerses = refMatch[2].trim();
      const desc = refMatch[3].trim();
      const refEn = `${bName} ${bVerses}`;
      const refMl = getMalayalamRef(refEn);

      readings.push({
        type: readings.length === 0 ? 'Law' : readings.length === 1 ? 'Prophets' : readings.length === 2 ? 'Epistle' : 'Gospel',
        referenceEn: refEn,
        referenceMl: refMl,
        descriptionEn: desc || refEn,
        descriptionMl: desc || refMl,
      });
    } else if (readings.length === 0 && l.length < 80 && !l.includes('2026')) {
      if (rawTitle) rawTitle += ` - ${l}`;
      else rawTitle = l;
    }
  });

  recordsDict[dateStr] = {
    dateString: dateStr,
    season,
    seasonMl,
    title: rawTitle || 'Liturgical Day',
    titleMl: rawTitle || 'ആരാധനാക്രമ ദിനം',
    feastName: rawTitle,
    feastNameMl: rawTitle,
    readings,
    isHolyDayOfObligation: isHolyDay,
    isFastDay: isFast,
  };
}

runIngestion();
