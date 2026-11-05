// Checks every bot reply is safe to post publicly. Unsafe replies are NOT posted.
const HOSPITAL_PHONES = ['+91 00 0000 0000'];   // your hospital's public numbers (allowed in replies)
const HOSPITAL_EMAIL = 'info@example-hospital.com';   // your hospital's public email (allowed in replies)
const MEDICAL = ['diagnosis','diagnosed','surgery','operation','cancer','tumour','tumor','fracture','pregnancy',
  'icu','chemotherapy','dialysis','prescription','medicine','test result','report'];
return $input.all().map(item => {
  const t = String(item.json['Suggested reply'] || '');
  const low = t.toLowerCase();
  const reasons = [];
  if (item.json['Sentiment'] !== 'Positive') reasons.push('bot replies only to Positive reviews');
  if (/(₹|\brs\.?|\binr)\s?\d/i.test(t)) reasons.push('bill amount');
  if (/\b(room|bed|ward)\s*(no\.?|number)?\s*\d+/i.test(t)) reasons.push('room/bed number');
  let clean = t; HOSPITAL_PHONES.forEach(p => { clean = clean.split(p).join(''); });
  if (/\d[\d\s-]{8,}\d/.test(clean)) reasons.push('phone number');
  const emails = t.match(/[\w.+-]+@[\w-]+\.[\w.]+/g) || [];
  if (emails.some(e => e.toLowerCase().replace(/[.,;]+$/, '') !== HOSPITAL_EMAIL)) reasons.push('other email');
  const words = low.split(/[^\p{L}\p{M}\p{N}]+/u);
  const med = MEDICAL.filter(m => m.includes(' ') ? low.includes(m) : words.includes(m));
  if (med.length) reasons.push('medical word: ' + med.join(', '));
  if (t.length < 20 || t.length > 600) reasons.push('reply too short or too long');
  return { json: { ...item.json, safe: reasons.length === 0, reasons: reasons.join('; ') } };
});
