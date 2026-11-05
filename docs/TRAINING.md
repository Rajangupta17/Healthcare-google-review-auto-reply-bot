# Training the brain

The decision logic lives in one n8n Code node (`code/classify-and-decide.js`). It is trained the way you would train a model: labelled data, a score, and repeat-until-safe rounds, using a separate **training node** (`code/training-node.js`).

## 1. Collect

Take 30–50 real reviews per round, deliberately mixed:

| Source | Share | Why |
|---|---|---|
| Newest | ~30% | What patients say now |
| Lowest rating, scrolled to 3–4★ | ~30% | Mixed praise + complaint: the dangerous kind |
| Highest rating | ~20% | Praise vocabulary |
| Hindi / Hinglish ("See original") | ~20% | Multilingual words |

Expand "More" on every long review: complaints often hide at the end.

## 2. Label

| If the review… | Label |
|---|---|
| Praises only, no complaint anywhere | `Reply` |
| Praise + any complaint, "but", "otherwise", "lekin", "par" | `Exit` |
| Suggests improvement / asks a complaint question | `Exit` |
| Mentions stars or ratings in words | `Exit` |
| Complaint with no "bad" word | `Exit` |
| Hardship story, even if it ends well | `Exit` (safe) |
| Stars only / no text / not sure | `Exit` |

## 3. Score

Add reviews to section A of the training node:

```js
['Reply', 'Very good doctors and caring staff'],
['Exit',  'Doctor was good but billing took 3 hours'],
```

Execute it. Row 1 is the score:

| Field | Must be |
|---|---|
| Accuracy | ≥ 95% |
| **Bot would WRONGLY reply** | **0, always** |

Miss rows follow, each with the bot's reason (`Why (bot)`).

## 4. Fix

| Miss | Meaning | Fix |
|---|---|---|
| Label `Exit`, bot `Reply` | **Dangerous**: bot would thank an unhappy patient | Add the word to `NEG`, the phrase to `NEG_PHRASES`, or a tone phrase to `TONE_SUGGEST` / `TONE_SARCASM` / `TONE_HARDSHIP`. Fix these first. |
| Label `Reply`, bot `Exit` | Safe: a good review skipped | Add a praise word to `POS` only if it is always positive; harmless "no" phrases go in `OK_PHRASES` |

Rules: prefer **phrases** over single words when a word can be good or bad (`"had issue with"`, not `"issue"`); never remove a negative word to fix a safe miss; re-run the **whole** set after every change.

## 5. Ship

When the round passes, copy the word lists into `Classify and decide`. Re-run the main workflow once to confirm all paths are green.

## Worked examples from real rounds

| Review (paraphrased) | Before | Fix | After |
|---|---|---|---|
| "Good experience… we just had issue with hygiene. Otherwise great service." | Reply ❌ | `had issue`, `otherwise` | Exit ✅ |
| "Nursing was great… admin staff really needs some…" | Reply ❌ | `needs some`, `needs improvement` | Exit ✅ |
| "The 2 stars I'm giving are only because of the doctors' efforts." | Reply ❌ | `2 stars`, `only because` | Exit ✅ |
| "Admitted in room no 808… nurses very helpful." | Exit | `no` after room/bed/ward isn't negation | Reply ✅ |
| "We did not face any problem here." | Exit | harmless phrase in `OK_PHRASES` | Reply ✅ |

## Tone checks (no bad word needed)

| Check | Example caught |
|---|---|
| Shouting | "Doctors are good. STAFF IS VERY RUDE AT BILLING." |
| Complaint question | "Good doctors. Why is the parking so costly?" |
| Suggestion | "Nice staff. Please improve the washroom cleaning." |
| Sarcasm | "Thanks for nothing at the pharmacy." |
| Hardship / worry | "We were worried… pareshan…" |
| Strong emotion | "Sab badhiya!!! Paise ke liye hi sab kuch…" |
| Hinglish contrast | "Doctor accha tha **lekin** dhyan nahi diya" |

Short forms (ICU, OPD, ENT, CGHS…) are not counted as shouting.

## Evaluate outside n8n

```bash
node scripts/evaluate.js                     # demo data
node scripts/evaluate.js my-labelled.json    # your own labelled set (same shape)
```

The script exits with code 1 if there is any wrong reply, so it can gate changes in CI.
