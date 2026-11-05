// Build_sheet_rows - one log row per review with its final result (posted, blocked or exited).
const rows = $('Classify and decide').all().map(i => ({ ...i.json }));
let safety = [], marks = [];
try { safety = $('Safety_check').all().map(i => i.json); } catch (e) {}
try { marks  = $('Mark_result').all().map(i => i.json); } catch (e) {}
const S = Object.fromEntries(safety.map(x => [x['Review ID'], x]));
const M = Object.fromEntries(marks.map(x => [x['Review ID'], x]));
return rows.map(r => { const id = r['Review ID'];
  if (r.Action === 'Auto-reply') {
    if (S[id] && !S[id].safe) { r.Status = 'Blocked by safety - not posted: ' + S[id].reasons; r.Action = 'Exit'; }
    else if (M[id]) { r.Status = M[id].Status; r['Posted at'] = M[id]['Posted at']; } }
  return { json: r }; });
