const fs = require('fs');
const path = require('path');
const { PDFParse } = require('pdf-parse');

async function inspect() {
  const engPath = path.join(__dirname, '../docs/syro-malabar-liturgical-calendar-2026-english.pdf');
  const malPath = path.join(__dirname, '../docs/panchangam-2025-2026-malyalam.pdf');

  console.log('--- Inspecting English PDF ---');
  if (fs.existsSync(engPath)) {
    const dataBuffer = fs.readFileSync(engPath);
    let parser = new PDFParse(new Uint8Array(dataBuffer));
    let res = await parser.getText();
    console.log('res keys:', Object.keys(res || {}), typeof res);
    const textStr = res.text || res.pages?.map((p) => p.text).join('\n') || String(res);
    console.log('English PDF Length:', textStr.length);
    console.log('English Sample Text (first 2000 chars):\n', textStr.substring(0, 2000));
    fs.writeFileSync(path.join(__dirname, '../scratch_eng_pdf.txt'), textStr);
  } else {
    console.log('English PDF not found at', engPath);
  }

  console.log('--- Inspecting Malayalam PDF ---');
  if (fs.existsSync(malPath)) {
    const dataBuffer = fs.readFileSync(malPath);
    let parser = new PDFParse(new Uint8Array(dataBuffer));
    let res = await parser.getText();
    const textStr = res.text || res.pages?.map((p) => p.text).join('\n') || String(res);
    console.log('Malayalam PDF Length:', textStr.length);
    console.log('Malayalam Sample Text (first 2000 chars):\n', textStr.substring(0, 2000));
    fs.writeFileSync(path.join(__dirname, '../scratch_mal_pdf.txt'), textStr);
  } else {
    console.log('Malayalam PDF not found at', malPath);
  }
}

inspect().catch(err => console.error(err));
