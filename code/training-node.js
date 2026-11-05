// ================================================================
// TRAINING NODE - Healthcare Google Review Auto-Reply Bot
// HOW TO USE:
//  1. Scroll to section A. Add each new review as:  ['Reply', 'review text'],
//     'Reply' = all words positive, bot should reply
//     'Exit'  = anything not fully positive, bot must not reply
//  2. Click Execute step.
//  3. Output: row 1 = score. Then wrong answers (MISS) first, then correct ones.
//  4. If a MISS: add the missing word to the word lists in section B,
//     run again until accuracy is 100%. Then copy section B into
//     'Classify and decide' (replace its section 1).
// ================================================================

// ===== A. TRAINING REVIEWS (add new ones at the bottom) =====
const TRAIN = [
  // Made-up demo reviews. Add your own labelled reviews below.
  ["Reply", "Excellent care by the doctors and very supportive nursing staff. Thank you!"],
  ["Reply", "The nurses in the ICU were so caring and kind. Highly recommend this hospital."],
  ["Reply", "Good experience in OPD, the staff was polite and helpful."],
  ["Reply", "Doctor ne bahut accha samjhaya, staff bhi badhiya hai. Shukriya!"],
  ["Reply", "Emergency team was quick and very professional. Grateful for the care."],
  ["Reply", "Clean rooms, tasty food and courteous housekeeping staff."],
  ["Reply", "Smooth admission and discharge. Wonderful experience overall 👍"],
  ["Reply", "International wing staff were humble and cooperative. Thank you all."],
  ["Exit", "Doctor was good but billing took 3 hours."],
  ["Exit", "Nice staff. Please improve the washroom cleaning."],
  ["Exit", "Worst experience, rude staff at reception and long waiting."],
  ["Exit", "Doctor accha tha lekin nurses ne dhyan nahi diya."],
  ["Exit", "Good doctors. Why is the parking so costly?"],
  ["Exit", "Great treatment, we just had issue with the hygiene. Otherwise great service."],
  ["Exit", "Kept waiting for 4 hours in emergency, nobody checked my father."],
  ["Exit", "Doctors are good. STAFF IS VERY RUDE AT BILLING COUNTER."],
  ["Exit", "The 2 stars I'm giving are only because of the doctors."],
  ["Exit", "Bakwas service, paise ke liye hi sab kuch karte hain."],
  ["Exit", "Thanks for nothing at the pharmacy, great job making us wait."],
  ["Reply", "Very good hospital, caring nurses and helpful doctors."],
  ["Exit", "Nice hospital but the canteen food was cold."],
  ["Exit", "Staff badhiya hai par billing pe koi nahi sunta."],
  ["Reply", "Bahut accha ilaj hua, doctor aur staff dono badhiya."],
  ["Exit", "Room rent is too high and there are cockroaches in the room."],
  ["Reply", "Thank you to the PICU team for taking such good care of our baby."],
  // ---- NEW REVIEWS BELOW THIS LINE ----

];

// ===== B. WORD LISTS (same as Classify and decide - section 1) =====
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
  Parking: ['parking','पार्किंग']
};

// ===== C. LOGIC (do not edit) =====

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

const results = TRAIN.map(([label, text], i) => {
  const a = analyse(text);
  const bot = a.sentiment === 'Positive' ? 'Reply' : 'Exit';
  return {
    'No': i + 1,
    'Result': bot === label ? 'OK' : 'MISS',
    'Your label': label,
    'Bot decision': bot,
    'Bot sentiment': a.sentiment,
    'Why (bot)': a.blockers.join('; ') || (a.sentiment === 'Unclear' ? 'no clear positive words' : ''),
    'Review text': text
  };
});
const miss = results.filter(r => r.Result === 'MISS');
const wrongReply = miss.filter(r => r['Your label'] === 'Exit').length;   // dangerous: bot would reply to a non-positive review
const summary = {
  'No': 0,
  'Result': 'SCORE',
  'Your label': 'Total: ' + results.length,
  'Bot decision': 'Correct: ' + (results.length - miss.length),
  'Bot sentiment': 'Accuracy: ' + Math.round(100 * (results.length - miss.length) / Math.max(1, results.length)) + '%',
  'Why (bot)': 'Wrong: ' + miss.length + ' (bot would WRONGLY reply: ' + wrongReply + ')',
  'Review text': wrongReply ? 'FIX FIRST: bot replied to a review that is not fully positive' : (miss.length ? 'Bot exited some good reviews - safe, but add the missing positive words' : 'All correct')
};
return [summary, ...miss, ...results.filter(r => r.Result === 'OK')].map(j => ({ json: j }));
