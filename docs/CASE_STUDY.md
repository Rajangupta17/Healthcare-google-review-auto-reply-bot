# Case Study: Auto-replying to hospital Google reviews, safely

## The problem

A multi-specialty hospital receives thousands of Google reviews. Replying to each one by hand was slow, so many happy patients never got a thank-you, and replies arrived days late.

A naive bot that replies to every 4★–5★ review is **dangerous** in healthcare:

- Many 5★ reviews hide a complaint: *"Good doctors… we just had an issue with hygiene. Otherwise great service."*
- Some 2★ reviews are pure praise: *"The 2 stars I'm giving are only because of the doctors' sincere efforts."*
- Patients write in English, Hindi and Hinglish: *"Doctor accha tha lekin nurses ne dhyan nahi diya."*
- A public reply to an unhappy patient that says *"Thank you for your kind words!"* damages trust.

**Goal:** reply automatically only when a review is genuinely, fully positive, and never reply to a complaint. Free tools only, data stays on the hospital's own machine.

## Constraints

| Constraint | Decision |
|---|---|
| Free, no paid SaaS | Self-hosted n8n on a Windows PC |
| Non-technical staff | Results in a simple Excel log; no dashboards to learn |
| Patient privacy | No review data leaves the machine; replies never mention bills, room numbers or medical details |
| Zero tolerance for wrong replies | "When in doubt, exit" rule; test mode before live |

## The rule

> No negative word + no negative tone + at least one positive word = **Reply**. Anything else = **Exit** (no reply, logged only).

Stars are deliberately **ignored**: the decision is made from the language alone.

## How I built it

1. **Collected real data:** screenshots of 199 real reviews (newest, lowest, highest, Hinglish), labelled by hand as Reply or Exit.
2. **Built a rule-based classifier** in an n8n Code node: positive/negative word lists (English + Hindi + Hinglish), negative phrases, contrast words, and negation handling.
3. **Built a training node** that scores the classifier against every labelled review and reports one critical metric: *"bot would WRONGLY reply"*.
4. **Trained in rounds:** each round added new reviews, found misses, fixed the word lists, and re-tested everything so old reviews still passed.
5. **Added tone checks** for cases with no "bad" word at all: CAPITALS shouting, complaint questions, suggestions ("please improve"), sarcasm, hardship words, "!!!".
6. **Added a safety layer** before posting: blocks replies with prices, phone numbers, room numbers, medical words, or bad length.
7. **Wrote 100 English reply templates** grouped by topic (Doctor, Nursing, Emergency, ICU, OPD, Facility, Food, Staff, General), so replies stay varied and relevant.
8. **Made it operational:** daily 9 AM schedule (IST), Excel log of every review, test mode, explicit Done / Exit end nodes, Google OAuth2 connection.

## Problems I hit and how I solved them

| Problem | What happened | Fix |
|---|---|---|
| Hidden complaints in 5★ reviews | Bot wanted to thank "…we just had issue with hygiene. Otherwise great service." | Added phrases ("had issue", "needs some") and "otherwise" as a contrast word |
| Praise disguised as complaint | "The 2 stars I'm giving are only because of the doctors" looked fully positive | Added star-mention and "only because" phrases |
| False negation | "room no 824" was read as a negative "no" | Ignore "no" before a number or after room/bed/ward/wing |
| Complaints with no bad word | "Room rent is 10,000 per day and there are termites" | Require at least one positive word to reply |
| Hinglish | "dhyan nahi diya", "koi nahi sunta", "lekin", "par" | Hinglish word and phrase lists + contrast words |
| Sarcasm and tone | "Thanks for nothing at billing", "STAFF IS VERY RUDE" | Tone checks: sarcasm phrases, CAPITALS, complaint questions |
| Python Code node failed on Windows | n8n's Python runner is not available on a native Windows install | Rewrote all logic in JavaScript |
| n8n could not write files | File access restricted by default in n8n 2.x | Set `N8N_RESTRICT_FILE_ACCESS_TO` to the output folder |
| Same review handled twice | Each run started from scratch | Read already-handled Review IDs before classifying |
| Silent exits | Exited reviews just disappeared from the canvas | IF node with explicit "Exit – no reply" and "Done" end nodes |

## Results

| Round | Labelled reviews | Accuracy | Wrong replies |
|---|---|---|---|
| 1 | 55 | 100% | 0 |
| 2 | 145 | 95% → 99% | 1 → **0** |
| 3 | 201 | 93% → 97% | 2 → **0** |
| 4 (tone) | 214 | 97% | **0** |

On the final set of **199 unique real reviews**: **133 Reply, 66 Exit, 0 wrong replies, 0 replies blocked by safety.**
The remaining misses are all on the safe side: a few good reviews skipped (e.g. "my condition was very bad but after treatment I recovered").

## What I learned

- In healthcare, the cost of a wrong reply is far higher than the cost of a missed one, so the system is tuned for **zero false replies**, not maximum coverage.
- Star ratings are a poor signal; the words and the tone are what matter.
- A labelled test set and a one-number safety metric made every change measurable.
- Explicit end nodes and a test mode make an automation trustworthy for non-technical staff.

## Next steps

- Compare the rule-based brain with an LLM classifier on the same labelled set (hybrid: rules first, LLM only for unclear reviews)
- Google Sheets log and an error-alert workflow
- More Hindi / Hinglish training data

*All data in this repository is made-up demo data. Real reviews are not included.*
