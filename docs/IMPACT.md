# Impact

## For the hospital

| Area | Before | With the bot |
|---|---|---|
| Staff time | Every positive review answered by hand | **~2 in 3 reviews** (133 of 199 in testing) answered automatically; staff only see the rest |
| Reply speed | Days, or never | Every morning at **9 AM**, within 24 hours |
| Coverage | Many happy patients never thanked | **Every** fully positive review gets a reply |
| Safety | Risk of thanking an unhappy patient | **0 wrong replies**; complaints never get a canned thank-you |
| Brand voice | Varied by who replied | 100 approved templates, one consistent voice |
| Insight | Complaints scattered across Google | Every exited review logged with its reason (billing, waiting, hygiene…) |
| Software cost | — | **₹0**: self-hosted n8n + free Google API |

*Estimate:* at ~2 minutes per manual reply, the bot saves about **3 staff-hours per 100 positive reviews**. Post-launch KPIs: reply coverage, time-to-reply, wrong replies (must stay 0), rating and review-count trend over 3–6 months.

## Skills demonstrated

| Skill | Evidence |
|---|---|
| Problem framing in a high-risk domain | Optimised for the costly error (zero false replies), not raw coverage |
| Workflow automation (n8n) | Schedule trigger, Code nodes, IF routing, file I/O, OAuth2, test/live config, explicit end nodes |
| NLP on messy real data | English + Hindi + Hinglish, negation, contrast words, sarcasm, hidden complaints |
| ML-style evaluation | Labelled set, training rounds, confusion matrix, precision / recall, reproducible `evaluate.js` |
| Safety & governance | Pre-post safety filter, audit log with reasons, shadow run before go-live, secrets kept out of code |
| API integration | Google Business Profile API via OAuth2 |
| Documentation | Case study, training method, execution runbook, diagrams |
