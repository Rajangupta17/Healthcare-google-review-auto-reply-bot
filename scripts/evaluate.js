// Reproduce the evaluation outside n8n:   node scripts/evaluate.js [path/to/labelled-reviews.json]
// Runs the same 'Classify and decide' code used in the workflow on labelled reviews and prints
// a confusion matrix, precision / recall for "Reply", and every miss.
const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');
const file = process.argv[2] || path.join(root, 'data', 'sample-reviews.json');
const { reviews, labels } = JSON.parse(fs.readFileSync(file, 'utf8'));
const brain = fs.readFileSync(path.join(root, 'code', 'classify-and-decide.js'), 'utf8');

// minimal stand-ins for n8n's $input and $() helpers
const cfg = { json: { mode: 'test', hospital_name: 'City Care Hospital' } };
const $input = { all: () => [{ json: { reviews } }] };
const $ = (name) => ({ all: () => (name === 'Config' ? [cfg] : []), first: () => cfg });
const out = new Function('$input', '$', brain)($input, $);

let tp = 0, fp = 0, fn = 0, tn = 0; const misses = [];
out.forEach((o) => {
  const id = o.json['Review ID'];
  const truth = labels[id];
  const bot = o.json.Action === 'Auto-reply' ? 'Reply' : 'Exit';
  if (bot === 'Reply' && truth === 'Reply') tp++;
  else if (bot === 'Reply' && truth === 'Exit') { fp++; misses.push(['WRONG REPLY (dangerous)', id, o.json['Review text']]); }
  else if (bot === 'Exit' && truth === 'Reply') { fn++; misses.push(['skipped good review (safe)', id, o.json['Review text']]); }
  else tn++;
});
const n = tp + fp + fn + tn;
const pct = (x) => (100 * x).toFixed(1) + '%';
console.log(`\nReviews evaluated : ${n}`);
console.log('\n                 bot: Reply   bot: Exit');
console.log(`truth: Reply      ${String(tp).padStart(6)}   ${String(fn).padStart(9)}`);
console.log(`truth: Exit       ${String(fp).padStart(6)}   ${String(tn).padStart(9)}`);
console.log(`\nAccuracy           : ${pct((tp + tn) / n)}`);
console.log(`Precision (Reply)  : ${tp + fp ? pct(tp / (tp + fp)) : 'n/a'}   <- must be 100%: every reply was deserved`);
console.log(`Recall (Reply)     : ${tp + fn ? pct(tp / (tp + fn)) : 'n/a'}   <- share of good reviews that got a reply`);
console.log(`WRONG replies      : ${fp}   <- the safety metric, must be 0`);
if (misses.length) { console.log('\nMisses:'); misses.forEach((m) => console.log(` - [${m[0]}] ${m[1]}: ${m[2]}`)); }
const r = out.find((o) => o.json.Action === 'Auto-reply');
if (r) console.log(`\nSample reply: ${r.json['Suggested reply']}`);
process.exit(fp ? 1 : 0);
