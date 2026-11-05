// Healthcare Google Review Auto-Reply Bot - 'Classify and decide' node (n8n Code node, JavaScript)
// Reads each review (English / Hindi / Hinglish), decides Reply or Exit from WORDS + TONE only (never stars),
// and picks an English reply template for fully positive reviews.

// ===== 1. WORD LISTS (edit here) =====
const POS = ['good','great','excellent','caring','helpful','clean','thank','thanks','professional','recommend','best','nice','supportive','polite','kind','kindness','grateful','gratitude','outstanding','exceptional','amazing','wonderful','wonderfull','satisfied','satisfactory','happy','appreciate','appreciated','thankful','thankyou','courteous','cooperative','compassion','compassionate','comfortable','smooth','reassuring','dedicated','efficient','hygienic','well','love','pleasant','welcoming','awesome','superb','experienced','politely','cordial','humble','respectful','incredible','knowledgeable','positive','positively','exceptional','excellent','helped','terrific','overwhelmed','supporting','comfort','attentive','tidy','passionate',
  'accha','acha','achha','acche','ache','badhiya','badiya','shukriya','sukriya',
  'अच्छा','अच्छे','अच्छी','बढ़िया','बढिया','धन्यवाद','शुक्रिया','बेहतरीन'];
const NEG = ['rude','worst','bad','waited','delay','delayed','overcharged','careless','dirty','unprofessional','pathetic','horrible','poor','useless','problem','problems','worse','awful','lazy','mosquitoes','cockroaches','complaint','inefficient','insufficient','unhygienic','negligence','irresponsible','harassment','misbehave','misbehaved','unavailable','overcrowded','chaos','pathetic','disappointed','disappointing','terrible','cheaters','cheater','cheating','incompetent','unresponsive','inept','disturbing','disturbed','dangerous','mismanagement','discrimination','termites','avoid','amateur','excessive','rush','angry','ignored','uncorporative','unhygienic','dirty','fraud','scam','rude',
  'bekar','bekaar','ghatiya','loot','lootna','bakwas','faltu','gandagi','ganda','gandi','dhokha','mehenga','mehnga','lapravah','laparwah','badtameez','badtamiz','chor','beimaan',
  'बुरा','बुरी','लापरवाह','बदतमीज़','बदतमीज','गंदा','घटिया','बेकार'];
const NEG_PHRASES = ['never again','dhyan nahi','koi nahi','kuch nahi','bilkul bhi nahi','time pe nahi','paise ke liye','sunwai nahi','nahi mila','nahi diya','nahi aaya','nobody checked','nobody helped','no one came','no one attended','no response','not attended','kept waiting','had to wait','waiting for hours','hours of waiting','not recommended','do not recommend','dont come','dont came','koi sunta nahi','wait karaya','paise zyada','no trace','not even','not working','no water','no proper','asked for money','not taking care','not good','1 star','2 star','2 stars','one star','two star','two stars','single star','zero star','minus rating','minus ratings','only because','hungry for money','grab your money','must avoid','not satisfied','not so good','needs some','needs improvement','need improvement','need to improve','need to increase','had issue','had an issue','had issues','issue with','issues with','less support'];
// Harmless phrases removed before checking (they contain no/not but are praise)
const OK_PHRASES = ['did not face any problem','didnt face any problem','no need to wait'];
const CONTRAST = ['but','otherwise','however','although','except','lekin','magar','लेकिन','मगर'];
const NOT_BEFORE = ['not','no','never',"didn't",'dont',"don't"];
const NOT_AFTER = ['nahi','nahin','नहीं'];
const POS_EMOJI = ['👍','🙏','😊','❤'];
const NEG_EMOJI = ['😡','👎','😠','😤'];
const TOPICS = {
  Doctor: ['doctor','doctors','dr','consultant','daktar','डॉक्टर'],
  Nursing: ['nurse','nurses','sister','nursing','nicu','picu','baby','नर्स'],
  Billing: ['bill','billing','charges','payment','insurance','tpa','paise','बिल'],
  Waiting: ['wait','waited','waiting','delay','queue','line','hours','इंतज़ार','इंतजार'],
  Food: ['food','canteen','meal','khana','खाना'],
  Cleanliness: ['clean','dirty','washroom','toilet','hygiene','ganda','साफ़','गंदा'],
  Parking: ['parking','पार्किंग'],
  'International ward': ['international','wing'],
  Emergency: ['emergency','casualty','er'],
  'ICU / PICU / NICU': ['icu','picu','nicu'],
  OPD: ['opd'],
  'Staff behaviour': ['staff','staffs','behaviour','behavior','polite','cooperative','humble'],
  Hospitality: ['hospitality','housekeeping','reception'],
  Pharmacy: ['pharmacy','chemist']
};

// ===== 2. REPLY TEMPLATES – POSITIVE ONLY, ENGLISH ONLY (edit here) =====
// Reviews in any language (English, Hindi, Hinglish) are READ, but every reply is in English.
// RULE: all words positive -> the BOT replies automatically.
//       anything else      -> EXIT: no reply, no email, nothing more. (Row is logged once so it is never read again.)
// Hospital name comes from the Config node (field: hospital_name). Change it there, not here.
let HOSPITAL = 'City Care Hospital';
try { HOSPITAL = $('Config').first().json.hospital_name || HOSPITAL; } catch (e) {}
const SIGN = ' We care for you. – Team ' + HOSPITAL;
// 100 English reply templates. {hospital} is filled from Config. Edit any line freely; keep {name} at the start.
const T = {
 "Doctor": [
  "Dear {name}, thank you for your kind words about our doctors. Your trust inspires our clinical team to keep delivering quality care.",
  "Dear {name}, we are delighted that our doctor could support you so well. We will share your appreciation with the entire medical team.",
  "Dear {name}, thank you for trusting our expert doctors with your care. It means a lot to everyone at {hospital}.",
  "Dear {name}, your words of appreciation for our doctors are truly encouraging. Wishing you good health and happiness.",
  "Dear {name}, thank you for recognising the dedication of our doctors. Patient-first care is at the heart of everything we do.",
  "Dear {name}, we are so glad our doctors made you feel heard and cared for. Thank you for choosing {hospital}.",
  "Dear {name}, thank you for sharing your positive experience with our doctor. Feedback like yours motivates our team every day.",
  "Dear {name}, it is wonderful to hear that our doctors explained everything clearly to you. Thank you for your trust in {hospital}.",
  "Dear {name}, thank you for appreciating the expertise and kindness of our doctors. We wish you and your family good health.",
  "Dear {name}, we are grateful for your kind review of our medical team. Your trust is our greatest reward.",
  "Dear {name}, thank you for your warm words. Our doctors will be happy to know they could make a difference for you.",
  "Dear {name}, your appreciation for our doctors means a great deal to us. We look forward to caring for you whenever you need us.",
  "Dear {name}, thank you for placing your trust in our doctors. Compassionate, expert care is our promise to every patient.",
  "Dear {name}, we are pleased that you had a reassuring experience with our doctors. Thank you for choosing {hospital}.",
  "Dear {name}, thank you for your heartfelt review. We will pass on your kind words to the doctor and the whole team."
 ],
 "Nursing": [
  "Dear {name}, thank you for appreciating our nursing team. Their compassion and dedication make {hospital} special.",
  "Dear {name}, we will share your kind words with our dedicated nurses. They will be delighted to know they could support you.",
  "Dear {name}, thank you for recognising the warmth and care of our nursing staff. Wishing you good health always.",
  "Dear {name}, your appreciation for our nurses truly made our day. Thank you for trusting {hospital}.",
  "Dear {name}, thank you for your lovely words about our nursing team. Caring for you and your family was our privilege.",
  "Dear {name}, we are so glad our nurses made you feel comfortable and cared for. Thank you for sharing your experience.",
  "Dear {name}, thank you for mentioning our nursing staff. Their round-the-clock care is the backbone of {hospital}.",
  "Dear {name}, it is heartwarming to read your appreciation for our nurses. We will pass on your thanks to each of them.",
  "Dear {name}, thank you for your kind review. Our nursing team works with heart, and your words mean a lot to them.",
  "Dear {name}, we are grateful for your appreciation of our nurses' patience and kindness. Wishing you a healthy life ahead.",
  "Dear {name}, thank you for trusting our nursing team with your care. Your encouragement inspires them every day.",
  "Dear {name}, your thanks to our nursing staff will be shared with the entire team. We are glad you felt well looked after.",
  "Dear {name}, thank you for highlighting the dedication of our nurses. Patient comfort and dignity are our priority.",
  "Dear {name}, we are delighted that our nurses could support you and your family. Thank you for choosing {hospital}.",
  "Dear {name}, thank you for your warm words for our nursing team. It is an honour to care for you."
 ],
 "International ward": [
  "Dear {name}, thank you for your kind words about our International Wing. We are proud to offer world-class care with a personal touch.",
  "Dear {name}, we are delighted that you had a comfortable stay in our International Wing. Thank you for trusting {hospital}.",
  "Dear {name}, thank you for appreciating our International Wing team. Their warmth and care make every stay feel like home.",
  "Dear {name}, your appreciation for our International Wing means a lot to us. Wishing you and your family good health.",
  "Dear {name}, thank you for choosing our International Wing. We will share your kind words with the entire team.",
  "Dear {name}, we are glad our International Wing staff made your stay smooth and comfortable. Thank you for your trust.",
  "Dear {name}, thank you for your lovely review of our International Wing. Personalised, compassionate care is our promise.",
  "Dear {name}, it is wonderful to hear about your positive experience in our International Wing. Thank you for choosing {hospital}.",
  "Dear {name}, thank you for recognising the care of our International Wing team. Your words inspire us to keep raising the bar.",
  "Dear {name}, we are honoured that you trusted our International Wing with your care. Wishing you good health and happiness."
 ],
 "Emergency": [
  "Dear {name}, thank you for appreciating our emergency team. We are here for you around the clock.",
  "Dear {name}, we are glad our emergency team could support you when it mattered most. Thank you for trusting {hospital}.",
  "Dear {name}, thank you for recognising the quick response of our emergency staff. Round-the-clock care is our commitment to you.",
  "Dear {name}, your kind words about our emergency department mean a lot to the team. Wishing you good health.",
  "Dear {name}, thank you for your trust during a difficult moment. Our emergency team will be happy to read your words.",
  "Dear {name}, we are grateful for your appreciation of our emergency staff. Their calm and care make all the difference.",
  "Dear {name}, thank you for sharing your experience with our emergency team. We will pass on your thanks to everyone on duty.",
  "Dear {name}, it means a lot to know our emergency team made you feel safe and supported. Thank you for choosing {hospital}.",
  "Dear {name}, thank you for your kind review of our emergency services. We are always here when you need us.",
  "Dear {name}, we are pleased that our emergency team could help you promptly. Wishing you and your family good health."
 ],
 "Critical care": [
  "Dear {name}, thank you for appreciating our critical care team. Their dedication, day and night, is what makes {hospital} special.",
  "Dear {name}, we are grateful for your kind words about our critical care staff. Wishing your family good health and strength.",
  "Dear {name}, thank you for trusting our critical care team. We will share your appreciation with every member of the team.",
  "Dear {name}, your thanks to our critical care team means a great deal to them. Thank you for choosing {hospital}.",
  "Dear {name}, thank you for recognising the care and attention of our critical care staff. We wish you good health always.",
  "Dear {name}, we are touched by your appreciation of our paediatric care team. Caring for your little one was our privilege.",
  "Dear {name}, thank you for your kind words about our care for your child. Wishing your family health and happiness.",
  "Dear {name}, it is heartwarming to read your appreciation for our critical care team. Thank you for your trust.",
  "Dear {name}, thank you for sharing your experience. Our critical care team works with heart, and your words inspire them.",
  "Dear {name}, we are glad our critical care team could support you and your family. Thank you for choosing {hospital}."
 ],
 "OPD": [
  "Dear {name}, thank you for your kind review of our OPD services. We are glad your visit was smooth and comfortable.",
  "Dear {name}, we are delighted that you had a good experience in our OPD. Thank you for trusting {hospital}.",
  "Dear {name}, thank you for appreciating our OPD team. Making every visit easy and pleasant is our goal.",
  "Dear {name}, your kind words about our OPD staff mean a lot to us. Wishing you good health.",
  "Dear {name}, thank you for sharing your positive OPD experience. We will pass on your appreciation to the team.",
  "Dear {name}, we are glad our OPD team could support you during your visit. Thank you for choosing {hospital}.",
  "Dear {name}, thank you for your review. A smooth and caring OPD experience is what we strive for every day.",
  "Dear {name}, it is wonderful to hear that our OPD staff were helpful and supportive. Thank you for your trust."
 ],
 "Facility": [
  "Dear {name}, thank you for noticing the clean and comfortable environment at {hospital}. Your feedback means a lot to our housekeeping team.",
  "Dear {name}, we are glad you found our hospital clean and well maintained. Thank you for your kind words.",
  "Dear {name}, thank you for appreciating our facilities. A safe, hygienic and welcoming environment is our priority.",
  "Dear {name}, your kind words about our hospital environment will be shared with the team. Wishing you good health.",
  "Dear {name}, thank you for recognising the efforts of our housekeeping and support staff. They will be delighted to read this.",
  "Dear {name}, we are delighted that you had a comfortable experience at {hospital}. Thank you for choosing us.",
  "Dear {name}, thank you for your review. We are proud of our team that keeps {hospital} clean, safe and welcoming.",
  "Dear {name}, it is wonderful to hear that our facilities met your expectations. Thank you for your trust."
 ],
 "Food": [
  "Dear {name}, thank you for appreciating our food and dietary services. We will share your kind words with our kitchen team.",
  "Dear {name}, we are glad you enjoyed the food during your stay. Thank you for your lovely feedback.",
  "Dear {name}, thank you for your kind words about our dietary team. Good nutrition is an important part of good care.",
  "Dear {name}, your appreciation for our food services means a lot to the team. Wishing you good health."
 ],
 "Staff behaviour": [
  "Dear {name}, thank you for appreciating the courtesy and support of our staff. Your kind words mean a lot to the whole team.",
  "Dear {name}, we are glad our staff were polite, helpful and caring. Thank you for trusting {hospital}.",
  "Dear {name}, thank you for recognising the cooperation of our team. We will share your appreciation with everyone.",
  "Dear {name}, your kind words about our staff truly made our day. Wishing you good health and happiness.",
  "Dear {name}, thank you for your lovely review. Warm and respectful care is what we aim to give every patient.",
  "Dear {name}, we are delighted that our staff made you feel supported. Thank you for choosing {hospital}.",
  "Dear {name}, thank you for mentioning our team members by name. They will be very happy to read your appreciation.",
  "Dear {name}, it is wonderful to hear that our staff were humble and supportive. Thank you for your trust."
 ],
 "General": [
  "Dear {name}, thank you for trusting {hospital}. We are delighted to be part of your health journey.",
  "Dear {name}, thank you for your kind words. We are glad you had a good experience with us.",
  "Dear {name}, thank you for your appreciation. It means a lot to our whole team.",
  "Dear {name}, we are grateful for your lovely review. Wishing you good health and happiness.",
  "Dear {name}, thank you for choosing {hospital}. Your trust inspires us to keep delivering quality care.",
  "Dear {name}, thank you for sharing your positive experience. We look forward to serving you whenever you need us.",
  "Dear {name}, your kind feedback brightens our day. Thank you for being part of the {hospital} family.",
  "Dear {name}, thank you for recommending {hospital}. We are honoured by your trust.",
  "Dear {name}, we are delighted that you had a smooth experience at {hospital}. Wishing you and your family good health.",
  "Dear {name}, thank you for your warm words. Compassionate, patient-first care is our promise to you.",
  "Dear {name}, thank you for taking the time to share your experience. It encourages our entire team.",
  "Dear {name}, we truly appreciate your kind review. Thank you for trusting {hospital} with your care."
 ]
};

// ===== 3. LOGIC (do not edit) =====
const STARS = { ONE: 1, TWO: 2, THREE: 3, FOUR: 4, FIVE: 5 };
let existing = new Set();
try { existing = new Set($('Read_sheet').all().map(i => String(i.json['Review ID'] || ''))); } catch (e) {}

const reviews = [];
for (const it of $input.all()) {
  if (Array.isArray(it.json.reviews)) reviews.push(...it.json.reviews);
  else if (it.json.reviewId) reviews.push(it.json);
}


// ===== TONE CHECKS (how the patient writes, not only which words) =====
// Any of these = the review is NOT fully positive -> bot exits.
const TONE_SUGGEST = ['please improve','kindly improve','kindly work','should improve','must improve','need to work','request you to','hope they improve','look into','work on the','improve the','improvement'];
const TONE_SARCASM = ['thanks for nothing','what a joke','so called','only in name','go to four corners','mind my words','not even kidding'];
const TONE_HARDSHIP = ['worried','anxious','suffering','harassed','struggled','frustrated','frustrating','helpless','tension','pareshan','pareshani','dukhi','takleef','दुखी','परेशान','तकलीफ'];
const TONE_QUESTION_WORDS = ['how','why','what','where','kyun','kyon','kaise','kya','क्यों','कैसे','क्या'];
const SHORT_FORMS = /\b(ICU|PICU|NICU|OPD|IPD|CTVS|ENT|CGHS|ECHS|TPA|MRI|CT|ER|NCR|DR|MR|MS|VIP|EWS|KFT|ECG|UTI|GDA|RML|AC|BP|ICU)\b/g;
function toneCheck(text, words) {
  const t = text.toLowerCase(), pad = ' ' + words.join(' ') + ' ', out = [];
  // 1. Shouting: 3+ CAPITAL words in a row (e.g. "BUT THEIR ACCOUNTS DEPARTMENT")
  if (/(?:\b[A-Z]{2,}\b[\s.,!]+){2,}\b[A-Z]{2,}\b/.test(text.replace(SHORT_FORMS, 'x'))) out.push('tone: shouting (CAPITALS)');
  // 2. Complaint question: "How will they...?", "Why ...?", "What's about ...?"
  text.split(/(?<=[.!?\n])/).forEach(s => {
    const sw = s.toLowerCase().split(/[^\p{L}\p{M}\p{N}']+/u).filter(Boolean);
    if (s.includes('?') && sw.some(w => TONE_QUESTION_WORDS.includes(w.replace(/'s$/, '')))) out.push('tone: complaint question');
  });
  if (/(^|\s)(what's about|how much|how will|how can they|why do|why does|why is|why are)\b/.test(t)) out.push('tone: complaint question');
  // 3. Suggestion / request to improve
  TONE_SUGGEST.forEach(p => { if (pad.includes(' ' + p + ' ')) out.push('tone: suggestion - ' + p); });
  // 4. Sarcasm / taunt
  TONE_SARCASM.forEach(p => { if (pad.includes(' ' + p + ' ')) out.push('tone: sarcasm - ' + p); });
  // 5. Hardship / worry (even if it ends well, the bot stays out)
  TONE_HARDSHIP.forEach(p => { if (words.includes(p)) out.push('tone: hardship - ' + p); });
  // 6. Many !!! or ??? = strong emotion
  if (/[!?]{3,}/.test(text)) out.push('tone: strong emotion (!!!/???)');
  return [...new Set(out)];
}

function analyse(text) {
  if (!text) return { sentiment: 'Unclear', noText: true, topics: '', blockers: [] };
  let clean = text.toLowerCase();
  OK_PHRASES.forEach(p => { if (!CONTRAST.some(c => clean.includes(' ' + c + ' '))) clean = clean.split(p).join(' '); });
  const words = clean.split(/[^\p{L}\p{M}\p{N}']+/u).filter(Boolean);
  const padded = ' ' + words.join(' ') + ' ';
  let pos = 0, neg = 0;
  const blockers = [];                       // every reason the review is NOT fully positive
  words.forEach((w, i) => {
    const next = words[i + 1] || '';
    if (POS.includes(w)) {
      const before = words.slice(Math.max(0, i - 2), i), after = words.slice(i + 1, i + 3);
      if (before.some(x => NOT_BEFORE.includes(x)) || after.some(x => NOT_AFTER.includes(x))) { neg++; blockers.push('negated praise: ' + w); }
      else pos++;
    }
    if (NEG.includes(w)) { neg++; blockers.push('negative word: ' + w); }
    if (CONTRAST.includes(w) || ((w === 'par' || w === 'पर') && words.slice(Math.max(0, i - 3), i).some(x => POS.includes(x))))
      blockers.push('contrast word: ' + w);
    const prev = words[i - 1] || '';
    const isNumberAfter = /^\d/.test(next) || ['room','bed','ward','wing'].includes(prev);   // "room no 824", "bed no. 315" are not negations
    if ((NOT_BEFORE.includes(w) || NOT_AFTER.includes(w)) && !(w === 'no' && isNumberAfter))
      blockers.push('negation word: ' + w);
  });
  NEG_PHRASES.forEach(p => { if (padded.includes(' ' + p + ' ')) { neg++; blockers.push('negative phrase: ' + p); } });
  toneCheck(text, words).forEach(x => blockers.push(x));
  if (POS_EMOJI.some(e => text.includes(e))) pos++;
  if (NEG_EMOJI.some(e => text.includes(e))) { neg++; blockers.push('negative emoji'); }
  let sentiment = 'Unclear';
  if (neg > 0 && pos > 0) sentiment = 'Mixed';
  else if (neg > 0) sentiment = 'Negative';
  else if (pos > 0) sentiment = blockers.length ? 'Mixed' : 'Positive';   // praise + "but/not" = not fully positive
  const topics = Object.keys(TOPICS).filter(t => TOPICS[t].some(k => words.includes(k)));
  return { sentiment, noText: false, topics: topics.join(', ') || 'Other', blockers: [...new Set(blockers)] };
}
function pick(list, id) { let h = 0; for (const c of id) h = (h * 31 + c.charCodeAt(0)) % 9973; return list[h % list.length]; }

const out = [];
for (const r of reviews) {
  if (!r.reviewId || existing.has(r.reviewId)) continue;   // already in the sheet
  if (r.reviewReply) continue;                           // already answered on Google
  let text = r.comment || '';
  if (text.includes('(Original)')) text = text.split('(Original)').pop();
  text = text.replace('(Translated by Google)', '').trim();
  const a = analyse(text);
  const stars = STARS[r.starRating] || 0;
  const lang = /[\u0900-\u097F]/.test(text) ? 'hi' : 'en';
  // Decision is made ONLY from the words. Stars are stored for reports but never used.
  let sentiment = a.sentiment;
  const blockers = [...a.blockers];
  const raw = (r.reviewer && r.reviewer.displayName) || '';
  const nameParts = raw.split(' ').filter(w => !/^(dr|dr\.|mr|mr\.|mrs|mrs\.|ms|ms\.)$/i.test(w));
  const first = nameParts[0] || '';
  const name = (!raw || raw === 'A Google User' || !first) ? 'Guest' : first.charAt(0).toUpperCase() + first.slice(1);
  // Bot replies only when the WORDS are fully positive. No words (star-only review) = Rejected.
  let set = null;
  if (sentiment === 'Positive') {
    const tp = a.topics;
    if (/ICU/.test(tp)) set = T['Critical care'];
    else if (/International ward/.test(tp)) set = T['International ward'];
    else if (/Emergency/.test(tp)) set = T.Emergency;
    else if (/Nursing/.test(tp)) set = T.Nursing;
    else if (/Doctor/.test(tp)) set = T.Doctor;
    else if (/OPD/.test(tp)) set = T.OPD;
    else if (/Food/.test(tp)) set = T.Food;
    else if (/Cleanliness|Hospitality/.test(tp)) set = T.Facility;
    else if (/Staff behaviour/.test(tp)) set = T['Staff behaviour'];
    else set = T.General;
  }
  const reply = set ? pick(set, r.reviewId).replace('{name}', name).split('{hospital}').join(HOSPITAL) + SIGN : '';
  out.push({ json: {
    'Review ID': r.reviewId,
    'Review date': (r.createTime || '').slice(0, 10),
    'Reviewer name': raw,
    'Stars': stars,
    'Review text': text,
    'Sentiment': sentiment,
    'Bot sentiment': sentiment,
    'Topics': a.topics,
    'Suggested reply': reply,
    'Reply by': reply ? 'Bot' : '-',
    'Action': reply ? 'Auto-reply' : 'Exit',
    'Status': reply ? 'Bot will reply' : 'Not positive - exited (no reply)',
    'Why exited': reply ? '' : (blockers.join('; ') || (a.noText ? 'no words to read (stars only)' : sentiment === 'Unclear' ? 'no clear positive words' : sentiment))
  }});
}
return out;
